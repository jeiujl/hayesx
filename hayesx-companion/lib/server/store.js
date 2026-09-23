import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

/**
 * Tiny storage layer with two drivers:
 *  - Vercel Blob (private store) in production, selected when BLOB_READ_WRITE_TOKEN
 *    or BLOB_STORE_ID is present.
 *  - Local filesystem under ./.data for development and tests.
 *
 * Both drivers support optimistic concurrency: every read returns an etag, and a
 * write can require that the etag still matches (ifMatch) or that the object does
 * not exist yet (ifNoneMatch: '*'). Callers retry on PreconditionFailed.
 */

export class PreconditionFailed extends Error {
  constructor() {
    super('Precondition failed')
    this.name = 'PreconditionFailed'
  }
}

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
// On Vercel the filesystem is read-only and per-instance, so the local driver must never be used there.
const unconfigured = !useBlob && Boolean(process.env.VERCEL)

/* ------------------------------------------------------------------ */
/* Filesystem driver                                                   */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), '.data')
const locks = new Map()

async function withLock(key, fn) {
  const prev = locks.get(key) || Promise.resolve()
  let release
  const next = new Promise((r) => (release = r))
  locks.set(key, prev.then(() => next))
  await prev
  try {
    return await fn()
  } finally {
    release()
    if (locks.get(key) === next) locks.delete(key)
  }
}

function fsPath(pathname) {
  const safe = pathname.replace(/\.\.+/g, '.').replace(/^\/+/, '')
  return path.join(DATA_DIR, safe)
}

function etagOf(buf) {
  return '"' + crypto.createHash('sha1').update(buf).digest('hex') + '"'
}

const fsDriver = {
  async read(pathname) {
    try {
      const buf = await fs.readFile(fsPath(pathname))
      const meta = await readMeta(pathname)
      return { body: buf, etag: etagOf(buf), contentType: meta.contentType || 'application/octet-stream' }
    } catch (e) {
      if (e.code === 'ENOENT') return null
      throw e
    }
  },
  async write(pathname, body, { contentType, ifMatch, ifNoneMatch } = {}) {
    return withLock(pathname, async () => {
      const file = fsPath(pathname)
      let current = null
      try {
        current = await fs.readFile(file)
      } catch (e) {
        if (e.code !== 'ENOENT') throw e
      }
      if (ifNoneMatch === '*' && current) throw new PreconditionFailed()
      if (ifMatch && (!current || etagOf(current) !== ifMatch)) throw new PreconditionFailed()
      await fs.mkdir(path.dirname(file), { recursive: true })
      const buf = Buffer.isBuffer(body) ? body : Buffer.from(body)
      await fs.writeFile(file, buf)
      await fs.writeFile(file + '.meta', JSON.stringify({ contentType }))
      return { etag: etagOf(buf) }
    })
  },
  async list(prefix) {
    const base = fsPath(prefix)
    const dir = prefix.endsWith('/') ? base : path.dirname(base)
    const out = []
    async function walk(d) {
      let entries = []
      try {
        entries = await fs.readdir(d, { withFileTypes: true })
      } catch (e) {
        if (e.code === 'ENOENT') return
        throw e
      }
      for (const ent of entries) {
        const full = path.join(d, ent.name)
        if (ent.isDirectory()) await walk(full)
        else if (!ent.name.endsWith('.meta')) {
          const rel = path.relative(DATA_DIR, full).split(path.sep).join('/')
          if (rel.startsWith(prefix)) {
            const st = await fs.stat(full)
            out.push({ pathname: rel, size: st.size, uploadedAt: st.mtime })
          }
        }
      }
    }
    await walk(dir)
    return out
  },
  async remove(pathname) {
    await fs.rm(fsPath(pathname), { force: true })
    await fs.rm(fsPath(pathname) + '.meta', { force: true })
  },
}

async function readMeta(pathname) {
  try {
    return JSON.parse(await fs.readFile(fsPath(pathname) + '.meta', 'utf8'))
  } catch {
    return {}
  }
}

/* ------------------------------------------------------------------ */
/* Vercel Blob driver                                                  */
/* ------------------------------------------------------------------ */

let blobMod
async function blob() {
  if (!blobMod) blobMod = await import('@vercel/blob')
  return blobMod
}

function isPrecondition(err) {
  return (
    err?.name === 'BlobPreconditionFailedError' ||
    /precondition/i.test(err?.message || '') ||
    // put() without allowOverwrite on an existing pathname
    /already exists/i.test(err?.message || '')
  )
}

async function streamToBuffer(stream) {
  const chunks = []
  const reader = stream.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)))
}

const blobDriver = {
  async read(pathname) {
    const { get } = await blob()
    const res = await get(pathname, { access: 'private', useCache: false })
    if (!res || res.statusCode !== 200) return null
    const body = await streamToBuffer(res.stream)
    return { body, etag: res.blob.etag, contentType: res.blob.contentType }
  },
  async write(pathname, body, { contentType, ifMatch, ifNoneMatch } = {}) {
    const { put } = await blob()
    try {
      const res = await put(pathname, body, {
        access: 'private',
        contentType,
        addRandomSuffix: false,
        allowOverwrite: ifNoneMatch !== '*',
        ...(ifMatch ? { ifMatch } : {}),
        cacheControlMaxAge: 60,
      })
      return { etag: res.etag }
    } catch (err) {
      if (isPrecondition(err)) throw new PreconditionFailed()
      throw err
    }
  },
  async list(prefix) {
    const { list } = await blob()
    const out = []
    let cursor
    do {
      const res = await list({ prefix, cursor, limit: 1000 })
      for (const b of res.blobs) out.push({ pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt })
      cursor = res.hasMore ? res.cursor : undefined
    } while (cursor)
    return out
  },
  async remove(pathname) {
    const { del } = await blob()
    try {
      await del(pathname)
    } catch (err) {
      if (err?.name !== 'BlobNotFoundError') throw err
    }
  },
}

function notConfigured() {
  throw Object.assign(
    new Error('The app’s storage isn’t connected yet. Connect a private Vercel Blob store to this project, then redeploy.'),
    { status: 503, expose: true }
  )
}

const unconfiguredDriver = { read: notConfigured, write: notConfigured, list: notConfigured, remove: notConfigured }

const driver = useBlob ? blobDriver : unconfigured ? unconfiguredDriver : fsDriver

export const storageKind = useBlob ? 'vercel-blob' : unconfigured ? 'unconfigured' : 'filesystem'

/* ------------------------------------------------------------------ */
/* Public helpers                                                      */
/* ------------------------------------------------------------------ */

export async function readJSON(pathname) {
  const res = await driver.read(pathname)
  if (!res) return null
  return { data: JSON.parse(res.body.toString('utf8')), etag: res.etag }
}

export async function writeJSON(pathname, data, opts = {}) {
  return driver.write(pathname, JSON.stringify(data), { ...opts, contentType: 'application/json' })
}

/**
 * Read-modify-write with optimistic concurrency. `mutate` receives the current
 * value (or null) and returns the next value. Retries on conflicting writes.
 */
export async function updateJSON(pathname, mutate, { attempts = 8 } = {}) {
  for (let i = 0; i < attempts; i++) {
    const current = await readJSON(pathname)
    const next = await mutate(current ? current.data : null)
    try {
      await writeJSON(pathname, next, current ? { ifMatch: current.etag } : { ifNoneMatch: '*' })
      return next
    } catch (err) {
      if (!(err instanceof PreconditionFailed)) throw err
      await new Promise((r) => setTimeout(r, 40 * (i + 1) + Math.random() * 60))
    }
  }
  throw new Error('Too much write contention, please retry')
}

export async function readFile(pathname) {
  return driver.read(pathname)
}

export async function writeFile(pathname, buffer, contentType) {
  return driver.write(pathname, buffer, { contentType })
}

export async function listPaths(prefix) {
  return driver.list(prefix)
}

export async function removePath(pathname) {
  return driver.remove(pathname)
}

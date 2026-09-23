import crypto from 'node:crypto'
import { storageKind, readJSON, writeJSON, updateJSON, readFile, writeFile, listPaths, removePath, PreconditionFailed } from '@/lib/server/store'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health                 → liveness + which storage driver is active.
 * GET /api/health?deep=<token>    → exercises the storage layer end to end (create-only
 *                                   writes, reads, optimistic concurrency, listing, binary
 *                                   files, deletes) under a throwaway `health/` prefix.
 * The deep check only runs when HEALTH_TOKEN is set (or in local development) and matches.
 */
export async function GET(request) {
  const deep = new URL(request.url).searchParams.get('deep')
  const base = {
    ok: storageKind !== 'unconfigured',
    storage: storageKind,
    authSecret: Boolean(process.env.AUTH_SECRET),
    staffCode: Boolean(process.env.HAYESX_STAFF_CODE),
    time: new Date().toISOString(),
  }
  const token = process.env.HEALTH_TOKEN || (process.env.VERCEL ? null : 'local')
  const a = Buffer.from(deep || '')
  const b = Buffer.from(token || '')
  const allowed = Boolean(deep && token) && a.length === b.length && crypto.timingSafeEqual(a, b)
  if (!allowed) return Response.json(base, { headers: { 'Cache-Control': 'no-store' } })

  const id = crypto.randomUUID()
  const doc = `health/${id}.json`
  const bin = `health/${id}.bin`
  const steps = []
  const step = async (name, fn) => {
    const t = Date.now()
    try {
      const detail = await fn()
      steps.push({ name, ok: true, ms: Date.now() - t, ...(detail ? { detail } : {}) })
    } catch (err) {
      steps.push({ name, ok: false, ms: Date.now() - t, error: `${err.name}: ${err.message}` })
    }
  }

  await step('create-only write', () => writeJSON(doc, { n: 1 }, { ifNoneMatch: '*' }).then(() => null))
  await step('create-only rejects existing', async () => {
    try {
      await writeJSON(doc, { n: 99 }, { ifNoneMatch: '*' })
    } catch (err) {
      if (err instanceof PreconditionFailed) return 'rejected as expected'
      throw err
    }
    throw new Error('second create-only write was accepted')
  })
  let etag
  await step('read back', async () => {
    const r = await readJSON(doc)
    if (r?.data?.n !== 1) throw new Error(`unexpected ${JSON.stringify(r?.data)}`)
    etag = r.etag
    return null
  })
  await step('compare-and-swap update', async () => {
    const next = await updateJSON(doc, (cur) => ({ n: (cur?.n || 0) + 1 }))
    if (next.n !== 2) throw new Error(`n=${next.n}`)
    return null
  })
  await step('stale etag rejected', async () => {
    try {
      await writeJSON(doc, { n: -1 }, { ifMatch: etag })
    } catch (err) {
      if (err instanceof PreconditionFailed) return 'rejected as expected'
      throw err
    }
    throw new Error('stale write was accepted')
  })
  await step('read after update', async () => {
    const r = await readJSON(doc)
    if (r?.data?.n !== 2) throw new Error(`n=${r?.data?.n}`)
    return null
  })
  await step('binary write/read', async () => {
    const buf = crypto.randomBytes(2048)
    await writeFile(bin, buf, 'application/octet-stream')
    const r = await readFile(bin)
    if (!r || Buffer.compare(Buffer.from(r.body), buf) !== 0) throw new Error('mismatch')
    return null
  })
  await step('list prefix', async () => {
    const items = await listPaths(`health/${id}`)
    if (items.length !== 2) throw new Error(`found ${items.length}`)
    return null
  })
  await step('delete', async () => {
    await removePath(doc)
    await removePath(bin)
    if (await readJSON(doc)) throw new Error('still present')
    return null
  })

  const ok = steps.every((s) => s.ok)
  return Response.json({ ...base, ok, steps }, { status: ok ? 200 : 500, headers: { 'Cache-Control': 'no-store' } })
}

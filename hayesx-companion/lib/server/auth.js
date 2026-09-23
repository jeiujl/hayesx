import 'server-only'
import crypto from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cookies } from 'next/headers'
import { readJSON, writeJSON, updateJSON, PreconditionFailed } from './store'

export const SESSION_COOKIE = 'hx_session'
const SESSION_DAYS = 60

/* ------------------------------------------------------------------ */
/* Secrets                                                             */
/* ------------------------------------------------------------------ */

let cachedSecret
async function authSecret() {
  if (cachedSecret) return cachedSecret
  if (process.env.AUTH_SECRET) {
    cachedSecret = process.env.AUTH_SECRET
  } else if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Derive a stable signing key from the storage credential when no explicit secret is set.
    cachedSecret = crypto.createHash('sha256').update('hayesx-auth:' + process.env.BLOB_READ_WRITE_TOKEN).digest('hex')
  } else if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const file = path.join(process.cwd(), '.data', 'dev-secret')
    try {
      cachedSecret = (await fs.readFile(file, 'utf8')).trim()
    } catch {
      cachedSecret = crypto.randomBytes(32).toString('hex')
      await fs.mkdir(path.dirname(file), { recursive: true })
      await fs.writeFile(file, cachedSecret)
    }
  } else {
    throw new Error('AUTH_SECRET is not configured')
  }
  return cachedSecret
}

export function staffCode() {
  if (process.env.HAYESX_STAFF_CODE) return process.env.HAYESX_STAFF_CODE
  if (!process.env.VERCEL) return 'dev-staff-code'
  return null
}

/* ------------------------------------------------------------------ */
/* Passwords                                                           */
/* ------------------------------------------------------------------ */

const scrypt = (password, salt) =>
  new Promise((resolve, reject) =>
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => (err ? reject(err) : resolve(key)))
  )

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const key = await scrypt(password, salt)
  return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`
}

export async function verifyPassword(password, stored) {
  const [scheme, saltB64, keyB64] = String(stored || '').split('$')
  if (scheme !== 'scrypt' || !saltB64 || !keyB64) return false
  const expected = Buffer.from(keyB64, 'base64url')
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64url'))
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

/* ------------------------------------------------------------------ */
/* Session tokens (HMAC-signed, stateless, revocable via `sv`)         */
/* ------------------------------------------------------------------ */

async function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const mac = crypto.createHmac('sha256', await authSecret()).update(body).digest('base64url')
  return `${body}.${mac}`
}

async function unsign(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [body, mac] = token.split('.')
  const expected = crypto.createHmac('sha256', await authSecret()).update(body).digest('base64url')
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!payload.exp || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export async function setSession(account) {
  const exp = Date.now() + SESSION_DAYS * 864e5
  const token = await sign({ uid: account.uid, sv: account.sv || 1, exp })
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  })
}

export async function clearSession() {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase()
const emailKey = (email) => crypto.createHash('sha256').update(normalizeEmail(email)).digest('hex')
export const accountPath = (uid) => `users/${uid}/account.json`
const emailPath = (email) => `users/by-email/${emailKey(email)}.json`

export function publicUser(account) {
  if (!account) return null
  return {
    uid: account.uid,
    email: account.email,
    name: account.name,
    role: account.role || 'pilot',
    createdAt: account.createdAt,
  }
}

export async function findAccountByEmail(email) {
  const idx = await readJSON(emailPath(email))
  if (!idx) return null
  const acc = await readJSON(accountPath(idx.data.uid))
  return acc ? acc.data : null
}

export async function getAccount(uid) {
  const acc = await readJSON(accountPath(uid))
  return acc ? acc.data : null
}

export async function createAccount({ name, email, password }) {
  const uid = crypto.randomUUID()
  const now = new Date().toISOString()
  // Claim the email first; this write fails if the address is already registered.
  try {
    await writeJSON(emailPath(email), { uid, createdAt: now }, { ifNoneMatch: '*' })
  } catch (err) {
    if (err instanceof PreconditionFailed) return { error: 'An account with this email already exists.' }
    throw err
  }
  const account = {
    uid,
    email: normalizeEmail(email),
    name: String(name).trim(),
    passwordHash: await hashPassword(password),
    role: 'pilot',
    sv: 1,
    createdAt: now,
  }
  await writeJSON(accountPath(uid), account)
  return { account }
}

export async function updateAccount(uid, mutate) {
  return updateJSON(accountPath(uid), (current) => {
    if (!current) throw new Error('Account not found')
    return mutate(current)
  })
}

export async function removeEmailIndex(email) {
  const { removePath } = await import('./store')
  await removePath(emailPath(email))
}

/** Returns the signed-in account or null. */
export async function currentAccount() {
  const jar = await cookies()
  const payload = await unsign(jar.get(SESSION_COOKIE)?.value)
  if (!payload) return null
  const account = await getAccount(payload.uid)
  if (!account || (account.sv || 1) !== payload.sv) return null
  return account
}

/* ------------------------------------------------------------------ */
/* Route helpers                                                       */
/* ------------------------------------------------------------------ */

export function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: { 'Cache-Control': 'no-store', ...(init.headers || {}) },
  })
}

export function fail(status, error) {
  return json({ error }, { status })
}

export async function readBody(request, maxBytes = 1_000_000) {
  const text = await request.text()
  if (text.length > maxBytes) throw Object.assign(new Error('Request too large'), { status: 413 })
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { status: 400 })
  }
}

/** Wraps a route handler with auth + uniform error handling. */
export function route(handler, { auth = true, staff = false } = {}) {
  return async (request, ctx) => {
    try {
      let account = null
      if (auth) {
        account = await currentAccount()
        if (!account) return fail(401, 'Please sign in.')
        if (staff && account.role !== 'staff') return fail(403, 'HayesX staff access required.')
      }
      return await handler({ request, ctx, account })
    } catch (err) {
      const status = err.status || 500
      if (status >= 500) console.error('[api]', err)
      return fail(status, status >= 500 && !err.expose ? 'Something went wrong on our side. Please try again.' : err.message)
    }
  }
}

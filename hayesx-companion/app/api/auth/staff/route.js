import crypto from 'node:crypto'
import { route, json, fail, readBody, updateAccount, publicUser, staffCode } from '@/lib/server/auth'

export const POST = route(async ({ request, account }) => {
  const body = await readBody(request)
  const expected = staffCode()
  const given = String(body.code || '').trim()
  const a = Buffer.from(given)
  const b = Buffer.from(expected || '')
  if (!expected || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    await new Promise((r) => setTimeout(r, 400))
    return fail(403, 'That staff access code is not valid.')
  }
  const next = await updateAccount(account.uid, (acc) => ({ ...acc, role: 'staff' }))
  return json({ user: publicUser(next) })
})

export const DELETE = route(async ({ account }) => {
  const next = await updateAccount(account.uid, (acc) => ({ ...acc, role: 'pilot' }))
  return json({ user: publicUser(next) })
})

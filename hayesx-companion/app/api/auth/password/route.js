import { route, json, fail, readBody, verifyPassword, hashPassword, updateAccount, setSession } from '@/lib/server/auth'
import { vPassword } from '@/lib/server/validate'

export const POST = route(async ({ request, account }) => {
  const body = await readBody(request)
  if (!(await verifyPassword(String(body.current || ''), account.passwordHash))) {
    return fail(400, 'Current password is incorrect.')
  }
  const password = vPassword(body.next)
  const passwordHash = await hashPassword(password)
  // Bumping the session version signs out every other device.
  const next = await updateAccount(account.uid, (acc) => ({ ...acc, passwordHash, sv: (acc.sv || 1) + 1 }))
  await setSession(next)
  return json({ ok: true })
})

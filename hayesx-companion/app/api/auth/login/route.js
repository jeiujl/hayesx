import { route, json, fail, readBody, findAccountByEmail, verifyPassword, setSession, publicUser } from '@/lib/server/auth'

export const POST = route(
  async ({ request }) => {
    const body = await readBody(request)
    const account = await findAccountByEmail(body.email)
    const ok = account && (await verifyPassword(String(body.password || ''), account.passwordHash))
    if (!ok) {
      await new Promise((r) => setTimeout(r, 400))
      return fail(401, 'Email or password is incorrect.')
    }
    await setSession(account)
    return json({ user: publicUser(account) })
  },
  { auth: false }
)

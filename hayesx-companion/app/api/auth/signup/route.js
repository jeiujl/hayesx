import { route, json, fail, readBody, createAccount, setSession, publicUser } from '@/lib/server/auth'
import { vEmail, vName, vPassword } from '@/lib/server/validate'

export const POST = route(
  async ({ request }) => {
    const body = await readBody(request)
    const name = vName(body.name)
    const email = vEmail(body.email)
    const password = vPassword(body.password)
    const { account, error } = await createAccount({ name, email, password })
    if (error) return fail(409, error)
    await setSession(account)
    return json({ user: publicUser(account) }, { status: 201 })
  },
  { auth: false }
)

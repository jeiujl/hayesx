import { route, json, fail, findAccountByEmail, publicUser } from '@/lib/server/auth'

/** Staff lookup of a pilot account by exact email address. */
export const GET = route(
  async ({ request }) => {
    const email = new URL(request.url).searchParams.get('email') || ''
    const account = await findAccountByEmail(email)
    if (!account) return fail(404, 'No pilot account with that email.')
    return json({ pilot: publicUser(account) })
  },
  { staff: true }
)

import { route, json, readBody, updateAccount, publicUser } from '@/lib/server/auth'
import { vName } from '@/lib/server/validate'

export const GET = route(async ({ account }) => json({ user: publicUser(account) }))

export const PATCH = route(async ({ request, account }) => {
  const body = await readBody(request)
  const name = vName(body.name)
  const next = await updateAccount(account.uid, (acc) => ({ ...acc, name }))
  return json({ user: publicUser(next) })
})

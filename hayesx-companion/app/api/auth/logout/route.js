import { route, json, clearSession } from '@/lib/server/auth'

export const POST = route(
  async () => {
    await clearSession()
    return json({ ok: true })
  },
  { auth: false }
)

import { route, json } from '@/lib/server/auth'
import { markRead } from '@/lib/server/messages'

export const POST = route(async ({ account }) => {
  const thread = await markRead(account.uid, 'pilot')
  return json({ ok: true, pilotReadAt: thread.pilotReadAt })
})

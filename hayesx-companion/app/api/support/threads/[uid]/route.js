import { route, json, fail, readBody, getAccount, publicUser } from '@/lib/server/auth'
import { getThread, postMessage, markRead } from '@/lib/server/messages'

async function pilotFor(ctx) {
  const { uid } = await ctx.params
  if (!/^[0-9a-f-]{36}$/.test(uid)) return null
  return getAccount(uid)
}

export const GET = route(
  async ({ ctx }) => {
    const pilot = await pilotFor(ctx)
    if (!pilot) return fail(404, 'Pilot not found.')
    const thread = await markRead(pilot.uid, 'staff')
    return json({ pilot: publicUser(pilot), thread })
  },
  { staff: true }
)

export const POST = route(
  async ({ request, ctx, account }) => {
    const pilot = await pilotFor(ctx)
    if (!pilot) return fail(404, 'Pilot not found.')
    const body = await readBody(request, 6_000_000)
    const { message, thread } = await postMessage({
      uid: pilot.uid,
      from: 'staff',
      author: { name: account.name },
      text: body.text,
      attachments: body.attachments,
    })
    return json({ message, thread }, { status: 201 })
  },
  { staff: true }
)

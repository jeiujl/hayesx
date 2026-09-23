import { route, json, readBody } from '@/lib/server/auth'
import { getThread, getIndex, postMessage, unreadFor } from '@/lib/server/messages'

export const GET = route(async ({ request, account }) => {
  const thread = await getThread(account.uid)
  const unread = unreadFor(thread, 'pilot')
  if (new URL(request.url).searchParams.get('summary')) {
    let staffUnread = 0
    if (account.role === 'staff') {
      staffUnread = (await getIndex()).reduce((n, t) => n + (t.uid !== account.uid ? t.unreadForStaff || 0 : 0), 0)
    }
    return json({ unread, staffUnread })
  }
  return json({ thread, unread })
})

export const POST = route(async ({ request, account }) => {
  const body = await readBody(request, 6_000_000)
  const { message, thread } = await postMessage({
    uid: account.uid,
    from: 'pilot',
    author: account,
    text: body.text,
    attachments: body.attachments,
    meta: body.meta,
  })
  return json({ message, thread, unread: unreadFor(thread, 'pilot') }, { status: 201 })
})

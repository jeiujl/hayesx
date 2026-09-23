import { route, json, fail, readBody, verifyPassword, clearSession, accountPath, removeEmailIndex } from '@/lib/server/auth'
import { listPaths, removePath, updateJSON } from '@/lib/server/store'
import { THREAD_INDEX } from '@/lib/server/messages'

export const DELETE = route(async ({ request, account }) => {
  const body = await readBody(request)
  if (!(await verifyPassword(String(body.password || ''), account.passwordHash))) {
    return fail(400, 'Password is incorrect.')
  }
  const paths = [
    ...(await listPaths(`users/${account.uid}/`)).map((p) => p.pathname),
    ...(await listPaths(`attachments/${account.uid}/`)).map((p) => p.pathname),
    `threads/${account.uid}.json`,
  ]
  for (const p of paths) if (p !== accountPath(account.uid)) await removePath(p)
  await updateJSON(THREAD_INDEX, (idx) => {
    const next = { ...(idx || {}) }
    delete next[account.uid]
    return next
  })
  await removeEmailIndex(account.email)
  await removePath(accountPath(account.uid))
  await clearSession()
  return json({ ok: true })
})

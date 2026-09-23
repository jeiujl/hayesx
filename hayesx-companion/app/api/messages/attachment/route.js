import { route, fail } from '@/lib/server/auth'
import { readAttachment } from '@/lib/server/messages'

export const GET = route(async ({ request, account }) => {
  const url = new URL(request.url)
  const uid = url.searchParams.get('uid') || ''
  const id = url.searchParams.get('id') || ''
  if (uid !== account.uid && account.role !== 'staff') return fail(403, 'Not allowed.')
  const file = await readAttachment(uid, id)
  if (!file) return fail(404, 'Attachment not found.')
  return new Response(file.body, {
    headers: {
      'Content-Type': file.contentType || 'image/jpeg',
      'Cache-Control': 'private, max-age=86400, immutable',
    },
  })
})

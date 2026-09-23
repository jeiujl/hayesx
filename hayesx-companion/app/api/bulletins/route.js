import crypto from 'node:crypto'
import { route, json, fail, readBody } from '@/lib/server/auth'
import { readJSON, updateJSON } from '@/lib/server/store'
import { vText } from '@/lib/server/validate'

const PATH = 'bulletins/index.json'

export const GET = route(async () => {
  const res = await readJSON(PATH)
  const bulletins = (res?.data || []).slice().sort((a, b) => b.at.localeCompare(a.at))
  return json({ bulletins })
})

export const POST = route(
  async ({ request, account }) => {
    const body = await readBody(request)
    const title = vText(body.title, 140)
    const text = vText(body.body, 6000)
    const level = ['info', 'advisory', 'mandatory'].includes(body.level) ? body.level : 'info'
    if (!title || !text) return fail(400, 'A bulletin needs a title and a body.')
    const bulletin = { id: crypto.randomUUID(), title, body: text, level, at: new Date().toISOString(), author: account.name }
    await updateJSON(PATH, (list) => [...(list || []), bulletin])
    return json({ bulletin }, { status: 201 })
  },
  { staff: true }
)

export const DELETE = route(
  async ({ request }) => {
    const id = new URL(request.url).searchParams.get('id')
    await updateJSON(PATH, (list) => (list || []).filter((b) => b.id !== id))
    return json({ ok: true })
  },
  { staff: true }
)

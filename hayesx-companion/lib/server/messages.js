import 'server-only'
import crypto from 'node:crypto'
import { readJSON, updateJSON, writeFile, readFile } from './store'
import { vText } from './validate'

export const THREAD_INDEX = 'threads/_index.json'
export const threadPath = (uid) => `threads/${uid}.json`
const attachmentPath = (uid, id) => `attachments/${uid}/${id}.jpg`

const MAX_ATTACHMENTS = 3
const MAX_ATTACHMENT_BYTES = 1_500_000

export async function getThread(uid) {
  const res = await readJSON(threadPath(uid))
  return res ? res.data : { uid, messages: [], pilotReadAt: null, staffReadAt: null }
}

export function unreadFor(thread, side) {
  const readAt = side === 'pilot' ? thread.pilotReadAt : thread.staffReadAt
  const other = side === 'pilot' ? 'staff' : 'pilot'
  return thread.messages.filter((m) => m.from === other && (!readAt || m.at > readAt)).length
}

async function storeAttachments(uid, attachments) {
  const list = Array.isArray(attachments) ? attachments.slice(0, MAX_ATTACHMENTS + 1) : []
  if (list.length > MAX_ATTACHMENTS) {
    throw Object.assign(new Error(`Attach up to ${MAX_ATTACHMENTS} photos per message.`), { status: 400 })
  }
  const saved = []
  for (const a of list) {
    const m = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(a?.dataUrl || ''))
    if (!m) throw Object.assign(new Error('Unsupported attachment. Use a JPEG, PNG or WebP photo.'), { status: 400 })
    const buf = Buffer.from(m[2], 'base64')
    if (buf.length > MAX_ATTACHMENT_BYTES) throw Object.assign(new Error('Photo is too large.'), { status: 413 })
    const id = crypto.randomUUID()
    await writeFile(attachmentPath(uid, id), buf, `image/${m[1] === 'jpg' ? 'jpeg' : m[1]}`)
    saved.push({ id, width: Number(a.width) || null, height: Number(a.height) || null })
  }
  return saved
}

/** Appends a message to a pilot's thread. `from` is 'pilot' or 'staff'. */
export async function postMessage({ uid, from, author, text, attachments, meta }) {
  const body = vText(text)
  const files = await storeAttachments(uid, attachments)
  if (!body && files.length === 0) throw Object.assign(new Error('Write a message or attach a photo.'), { status: 400 })
  const now = new Date().toISOString()
  const message = {
    id: crypto.randomUUID(),
    from,
    authorName: author.name,
    text: body,
    attachments: files,
    at: now,
    ...(meta && typeof meta === 'object' ? { meta: sanitizeMeta(meta) } : {}),
  }
  const thread = await updateJSON(threadPath(uid), (t) => {
    const cur = t || { uid, messages: [], pilotReadAt: null, staffReadAt: null }
    const next = { ...cur, messages: [...cur.messages, message] }
    // The sender has obviously read everything up to their own message.
    if (from === 'pilot') next.pilotReadAt = now
    else next.staffReadAt = now
    return next
  })
  await updateIndex(uid, thread, author, from)
  return { message, thread }
}

function sanitizeMeta(meta) {
  const out = {}
  if (typeof meta.kind === 'string') out.kind = meta.kind.slice(0, 40)
  if (typeof meta.ref === 'string') out.ref = meta.ref.slice(0, 80)
  return out
}

export async function markRead(uid, side) {
  const now = new Date().toISOString()
  const thread = await updateJSON(threadPath(uid), (t) => {
    const cur = t || { uid, messages: [], pilotReadAt: null, staffReadAt: null }
    return side === 'pilot' ? { ...cur, pilotReadAt: now } : { ...cur, staffReadAt: now }
  })
  if (side === 'staff') await updateIndex(uid, thread)
  return thread
}

async function updateIndex(uid, thread, author, from) {
  const last = thread.messages[thread.messages.length - 1]
  await updateJSON(THREAD_INDEX, (idx) => {
    const cur = idx || {}
    const prev = cur[uid] || { uid }
    const entry = {
      ...prev,
      uid,
      lastAt: last?.at || prev.lastAt || null,
      lastFrom: last?.from || null,
      preview: last ? (last.text || (last.attachments?.length ? '📷 Photo' : '')).slice(0, 140) : '',
      count: thread.messages.length,
      unreadForStaff: unreadFor(thread, 'staff'),
    }
    if (from === 'pilot' && author) {
      entry.name = author.name
      entry.email = author.email
    }
    return { ...cur, [uid]: entry }
  })
}

export async function getIndex() {
  const res = await readJSON(THREAD_INDEX)
  return Object.values(res?.data || {}).sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)))
}

export async function readAttachment(uid, id) {
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^[0-9a-f-]{36}$/.test(uid)) return null
  return readFile(attachmentPath(uid, id))
}

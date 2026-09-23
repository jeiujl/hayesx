import 'server-only'

const bad = (message) => Object.assign(new Error(message), { status: 400 })

export function vEmail(v) {
  const s = String(v || '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) || s.length > 200) throw bad('Enter a valid email address.')
  return s
}

export function vPassword(v) {
  const s = String(v || '')
  if (s.length < 8) throw bad('Password must be at least 8 characters.')
  if (s.length > 200) throw bad('Password is too long.')
  return s
}

export function vName(v) {
  const s = String(v || '').trim().replace(/\s+/g, ' ')
  if (!s) throw bad('Enter your name.')
  if (s.length > 80) throw bad('Name is too long.')
  return s
}

export function vText(v, max = 4000) {
  const s = String(v || '').trim()
  if (s.length > max) throw bad(`Message is too long (max ${max} characters).`)
  return s
}

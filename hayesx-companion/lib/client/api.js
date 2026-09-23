'use client'

export class ApiError extends Error {
  constructor(message, status, offline = false) {
    super(message)
    this.status = status
    this.offline = offline
  }
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(path, {
      method,
      signal,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError('You appear to be offline. Try again when you have a connection.', 0, true)
  }
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hx:unauthorized'))
    }
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status)
  }
  return data
}

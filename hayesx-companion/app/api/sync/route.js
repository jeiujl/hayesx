import { route, json, readBody, updateAccount } from '@/lib/server/auth'
import { readJSON, updateJSON } from '@/lib/server/store'
import { emptyDoc, mergeDocs } from '@/lib/shared/doc'

const docPath = (uid) => `users/${uid}/data.json`
const MAX_DOC_BYTES = 8_000_000

export const GET = route(async ({ account }) => {
  const res = await readJSON(docPath(account.uid))
  return json({ doc: res ? mergeDocs(emptyDoc(), res.data) : emptyDoc(), serverTime: Date.now() })
})

/** Accepts a delta of changed records, merges it, and returns the full merged document. */
export const POST = route(async ({ request, account }) => {
  const body = await readBody(request, MAX_DOC_BYTES)
  const delta = body && typeof body.delta === 'object' ? body.delta : {}
  const merged = await updateJSON(docPath(account.uid), (current) => {
    const next = mergeDocs(current || emptyDoc(), delta)
    if (JSON.stringify(next).length > MAX_DOC_BYTES) {
      throw Object.assign(new Error('Your data is over the sync size limit. Export and archive old records.'), { status: 413 })
    }
    return next
  })
  // Keep the account display name (used by HayesX support) in step with the profile.
  const profileName = merged.profile?.name?.trim()
  if (profileName && profileName !== account.name) {
    await updateAccount(account.uid, (acc) => ({ ...acc, name: profileName.slice(0, 80) }))
  }
  return json({ doc: merged, serverTime: Date.now() })
})

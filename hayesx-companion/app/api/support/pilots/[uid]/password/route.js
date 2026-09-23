import crypto from 'node:crypto'
import { route, json, fail, getAccount, updateAccount, hashPassword } from '@/lib/server/auth'

/**
 * Issues a one-time temporary password for a pilot who is locked out. The staff
 * member reads it to the pilot after verifying their identity; it signs the pilot
 * out everywhere and they should change it from Account > Security.
 */
export const POST = route(
  async ({ ctx }) => {
    const { uid } = await ctx.params
    if (!/^[0-9a-f-]{36}$/.test(uid)) return fail(404, 'Pilot not found.')
    const pilot = await getAccount(uid)
    if (!pilot) return fail(404, 'Pilot not found.')
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const bytes = crypto.randomBytes(12)
    const temp = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('').replace(/(.{4})(?=.)/g, '$1-')
    const passwordHash = await hashPassword(temp)
    await updateAccount(uid, (acc) => ({ ...acc, passwordHash, sv: (acc.sv || 1) + 1 }))
    return json({ temporaryPassword: temp })
  },
  { staff: true }
)

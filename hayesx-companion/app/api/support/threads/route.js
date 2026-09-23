import { route, json } from '@/lib/server/auth'
import { getIndex } from '@/lib/server/messages'

export const GET = route(async () => json({ threads: await getIndex() }), { staff: true })

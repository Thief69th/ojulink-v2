import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getLinks, getLinkClicks, getLinkClickHistory, getProfileStats } from '@/lib/kv'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [rawLinks, profileStats] = await Promise.all([
    getLinks(session.userId),
    getProfileStats(session.userId),
  ])

  const links = await Promise.all(rawLinks.map(async (l) => {
    const [clicks, history] = await Promise.all([
      getLinkClicks(l.id),
      getLinkClickHistory(l.id),
    ])
    return { ...l, clicks, history }
  }))

  return NextResponse.json({ links, profileStats })
}

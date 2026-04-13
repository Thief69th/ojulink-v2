import { getSession } from '@/lib/auth'
import { getLinks, getLinkClicks, getLinkClickHistory, getProfileStats } from '@/lib/kv'
import InsightsClient from './InsightsClient'

export const metadata = { title:'Insights — Dashboard' }
export const dynamic = 'force-dynamic'

export default async function InsightsPage() {
  const session = await getSession()

  const [rawLinks, profileStats] = await Promise.all([
    getLinks(session.userId),
    getProfileStats(session.userId),
  ])

  // Get clicks + history for all links
  const links = await Promise.all(rawLinks.map(async (l) => {
    const [clicks, history] = await Promise.all([
      getLinkClicks(l.id),
      getLinkClickHistory(l.id),
    ])
    return { ...l, clicks, history }
  }))

  return <InsightsClient links={links} profileStats={profileStats} />
}

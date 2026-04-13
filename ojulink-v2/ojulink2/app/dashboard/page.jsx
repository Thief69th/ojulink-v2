import { getSession } from '@/lib/auth'
import { getLinks, getLinkClicks } from '@/lib/kv'
import LinkManager from './LinkManager'

export const metadata = { title:'Links — Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  const rawLinks = await getLinks(session.userId)

  // Attach click totals to each link
  const links = await Promise.all(rawLinks.map(async (l) => {
    const c = await getLinkClicks(l.id)
    return { ...l, clicks: c }
  }))

  return <LinkManager initialLinks={links} userId={session.userId} />
}

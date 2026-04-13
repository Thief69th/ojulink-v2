import { notFound } from 'next/navigation'
import { getUserByUsername, getLinks, trackView } from '@/lib/kv'
import PublicProfile from './PublicProfile'

export async function generateMetadata({ params }) {
  const user = await getUserByUsername(params.username)
  if (!user) return { title:'Profile not found' }
  return {
    title:`${user.name} (@${user.username}) — OJU Link`,
    description: user.bio || `Check out ${user.name}'s links on OJU Link.`,
  }
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }) {
  const user = await getUserByUsername(params.username)
  if (!user) notFound()

  const links = (await getLinks(user.id)).filter(l => l.active)

  // Track view (fire & forget)
  trackView(user.id).catch(() => {})

  return <PublicProfile user={user} links={links} />
}

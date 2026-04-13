import { getSession } from '@/lib/auth'
import { getUserById } from '@/lib/kv'
import { redirect } from 'next/navigation'
import DashboardShell from './DashboardShell'

export default async function DashboardLayout({ children }) {
  const session = await getSession()
  if (!session) redirect('/login')
  const user = await getUserById(session.userId)
  if (!user) redirect('/login')
  return <DashboardShell user={user}>{children}</DashboardShell>
}

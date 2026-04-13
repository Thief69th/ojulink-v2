import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserById, updateUser } from '@/lib/kv'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUserById(session.userId)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { passwordHash, ...safe } = user
  return NextResponse.json(safe)
}

export async function PATCH(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { name, bio } = await req.json()
    const updates = {}
    if (name?.trim()) updates.name = name.trim()
    if (bio !== undefined) updates.bio = bio.trim()
    const updated = await updateUser(session.userId, updates)
    const { passwordHash, ...safe } = updated
    return NextResponse.json(safe)
  } catch (e) {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}

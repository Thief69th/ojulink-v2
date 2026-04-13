import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getLinks, updateLink, deleteLink } from '@/lib/kv'

async function verifyOwner(session, linkId) {
  const links = await getLinks(session.userId)
  return links.find(l => l.id === linkId) || null
}

export async function PUT(req, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const link = await verifyOwner(session, params.id)
  if (!link) return NextResponse.json({ error: 'Link not found.' }, { status: 404 })

  try {
    const body = await req.json()
    const allowed = ['title', 'url', 'description', 'active']
    const updates = {}
    for (const k of allowed) {
      if (body[k] !== undefined) updates[k] = typeof body[k] === 'string' ? body[k].trim() : body[k]
    }
    const updated = await updateLink(session.userId, params.id, updates)
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
}

export async function DELETE(_, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const link = await verifyOwner(session, params.id)
  if (!link) return NextResponse.json({ error: 'Link not found.' }, { status: 404 })

  await deleteLink(session.userId, params.id)
  return NextResponse.json({ ok: true })
}

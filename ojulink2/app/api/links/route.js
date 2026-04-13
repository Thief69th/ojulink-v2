import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getLinks, addLink } from '@/lib/kv'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const links = await getLinks(session.userId)
  return NextResponse.json(links)
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { title, url, description } = await req.json()
    if (!title?.trim() || !url?.trim())
      return NextResponse.json({ error: 'Title and URL are required.' }, { status: 400 })

    // Basic URL validation
    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('mailto:')) {
      finalUrl = 'https://' + finalUrl
    }

    const link = {
      id: crypto.randomUUID(),
      title: title.trim(),
      url: finalUrl,
      description: description?.trim() || '',
      active: true,
      createdAt: Date.now(),
    }
    await addLink(session.userId, link)
    return NextResponse.json(link, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add link.' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { trackClick } from '@/lib/kv'

export async function POST(req) {
  try {
    const { linkId } = await req.json()
    if (!linkId || typeof linkId !== 'string' || linkId.length > 64)
      return NextResponse.json({ error: 'Invalid linkId' }, { status: 400 })
    await trackClick(linkId)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/kv'
import { createSession, setSessionCookie } from '@/lib/auth'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 })

    const user = await getUserByEmail(email)
    if (!user)
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid)
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })

    const token = await createSession(user.id)
    const res = NextResponse.json({ ok: true })
    setSessionCookie(token, res)
    return res
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

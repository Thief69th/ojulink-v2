import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser, getUserByUsername, getUserByEmail } from '@/lib/kv'
import { createSession, setSessionCookie } from '@/lib/auth'

export async function POST(req) {
  try {
    const { name, username, email, password } = await req.json()

    if (!name?.trim() || !username?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error:'All fields are required.' }, { status:400 })
    }
    if (username.length < 3 || !/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json({ error:'Username must be 3+ chars, letters/numbers/underscore only.' }, { status:400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error:'Password must be at least 8 characters.' }, { status:400 })
    }

    const [existingU, existingE] = await Promise.all([
      getUserByUsername(username),
      getUserByEmail(email),
    ])
    if (existingU) return NextResponse.json({ error:'Username already taken.' }, { status:409 })
    if (existingE) return NextResponse.json({ error:'Email already registered.' }, { status:409 })

    const id = crypto.randomUUID()
    const passwordHash = await bcrypt.hash(password, 10)
    await createUser({ id, username: username.toLowerCase(), name: name.trim(), email: email.toLowerCase(), passwordHash })

    const token = await createSession(id)
    const res = NextResponse.json({ ok:true })
    setSessionCookie(token, res)
    return res
  } catch (e) {
    console.error('Signup error:', e)
    return NextResponse.json({ error:'Something went wrong.' }, { status:500 })
  }
}

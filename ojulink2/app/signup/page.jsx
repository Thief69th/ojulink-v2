'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [form,    setForm]    = useState({ name:'', username:'', email:'', password:'' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      router.push('/dashboard')
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:20 }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ marginBottom:32, textAlign:'center' }}>
          <Link href="/" style={{ fontSize:15, fontWeight:700 }}>OJU Link</Link>
          <h1 style={{ marginTop:24, fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>Create your account</h1>
          <p style={{ marginTop:6, fontSize:13, color:'var(--muted)' }}>Free forever. No credit card needed.</p>
        </div>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--txt2)', display:'block', marginBottom:5 }}>Full name</label>
            <input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" required />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--txt2)', display:'block', marginBottom:5 }}>Username</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'var(--muted)' }}>ojulink.online/</span>
              <input className="inp" style={{ paddingLeft:115 }} value={form.username}
                onChange={e=>setForm({...form,username:e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,'')})}
                placeholder="yourname" required minLength={3} maxLength={30} />
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--txt2)', display:'block', marginBottom:5 }}>Email</label>
            <input className="inp" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--txt2)', display:'block', marginBottom:5 }}>Password</label>
            <input className="inp" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min. 8 characters" required minLength={8} />
          </div>

          {error && <div style={{ padding:'10px 12px', borderRadius:8, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:13 }}>{error}</div>}

          <button className="btn btn-black" type="submit" disabled={loading} style={{ marginTop:4, padding:'12px', fontSize:14 }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color:'var(--txt)', fontWeight:600 }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name:'', bio:'' })
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/auth/me', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) { setMsg('Profile updated!'); setTimeout(()=>setMsg(''),2500) }
    setSaving(false)
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method:'POST' })
    router.push('/login')
  }

  return (
    <div style={{ maxWidth:480, margin:'0 auto', padding:'32px 24px' }}>
      <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.02em', marginBottom:28 }}>Settings</h1>

      <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>Display name</label>
          <input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" />
        </div>
        <div>
          <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:5 }}>Bio</label>
          <textarea className="inp" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Short bio shown on your page" rows={3} style={{ resize:'vertical' }} />
        </div>
        {msg && <div style={{ padding:'8px 12px', borderRadius:7, background:'var(--bg2)', border:'1px solid var(--brd)', fontSize:13 }}>{msg}</div>}
        <button className="btn btn-black" type="submit" disabled={saving} style={{ alignSelf:'flex-start' }}>
          {saving?'Saving…':'Save changes'}
        </button>
      </form>

      <hr style={{ margin:'32px 0' }} />

      <div>
        <p style={{ fontWeight:600, fontSize:14, marginBottom:8 }}>Account</p>
        <button className="btn btn-outline btn-sm" onClick={logout} style={{ color:'#ef4444', borderColor:'#fecaca' }}>
          Log out
        </button>
      </div>
    </div>
  )
}

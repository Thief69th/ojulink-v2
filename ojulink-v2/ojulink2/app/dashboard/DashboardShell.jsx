'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href:'/dashboard',          label:'Links',    icon:'🔗' },
  { href:'/dashboard/insights', label:'Insights', icon:'📊' },
  { href:'/dashboard/settings', label:'Settings', icon:'⚙️' },
]

export default function DashboardShell({ user, children }) {
  const path = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined') return document.documentElement.getAttribute('data-theme') || 'light'
    return 'light'
  })

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('oju_theme', next) } catch {}
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method:'POST' })
    router.push('/login')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width:220, flexShrink:0, borderRight:'1px solid var(--brd)',
        display:'flex', flexDirection:'column', padding:'20px 12px',
        position:'sticky', top:0, height:'100vh', background:'var(--bg)',
      }}>
        {/* Brand */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 8px', marginBottom:24 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:'var(--txt)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'var(--bg)', fontSize:12, fontWeight:800 }}>O</span>
          </div>
          <span style={{ fontWeight:700, fontSize:14 }}>OJU Link</span>
        </Link>

        {/* Nav */}
        <nav style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`sidebar-link${path === n.href ? ' active' : ''}`}>
              <span style={{ fontSize:15 }}>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* View page link */}
        <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--brd)' }}>
          <a href={`/${user.username}`} target="_blank" rel="noopener"
            className="sidebar-link" style={{ fontSize:12 }}>
            <span>🌐</span> View my page ↗
          </a>
        </div>

        {/* Spacer */}
        <div style={{ flex:1 }} />

        {/* Bottom */}
        <div style={{ borderTop:'1px solid var(--brd)', paddingTop:16, display:'flex', flexDirection:'column', gap:8 }}>
          {/* User info */}
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 8px' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>
              {user.name[0].toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--txt)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
              <div style={{ fontSize:11, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>@{user.username}</div>
            </div>
          </div>
          {/* Theme + Logout */}
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={toggleTheme} className="btn btn-outline btn-sm" style={{ flex:1, fontSize:12 }}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button onClick={logout} className="btn btn-ghost btn-sm" title="Log out">
              ↩
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, overflow:'auto' }}>
        {children}
      </main>
    </div>
  )
}

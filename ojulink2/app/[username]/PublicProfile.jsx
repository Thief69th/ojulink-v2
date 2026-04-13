'use client'
import { useState, useEffect } from 'react'

function Clock() {
  const [t, setT] = useState(new Date())
  useEffect(() => { const id=setInterval(()=>setT(new Date()),1000); return ()=>clearInterval(id) }, [])
  const hh = String(t.getHours()).padStart(2,'0')
  const mm = String(t.getMinutes()).padStart(2,'0')
  const ss = String(t.getSeconds()).padStart(2,'0')
  const ds = t.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return (
    <div style={{ textAlign:'center', padding:'20px 0', borderBottom:'1px solid var(--brd)' }}>
      <div style={{ fontFamily:'monospace', fontSize:'clamp(28px,7vw,40px)', fontWeight:700, letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>
        {hh}<span style={{ opacity:.3, animation:'colon 1s step-end infinite' }}>:</span>{mm}
        <span style={{ fontSize:'0.48em', fontWeight:400, color:'var(--muted)', marginLeft:4 }}>{ss}</span>
      </div>
      <div style={{ marginTop:6, fontSize:12, color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
        {ds}
        <span style={{ padding:'1px 6px', borderRadius:3, border:'1px solid var(--brd)', fontSize:10, letterSpacing:'0.04em' }}>{tz}</span>
      </div>
      <style>{`@keyframes colon{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  )
}

export default function PublicProfile({ user, links }) {
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'light') : 'light'
  )
  const [copied, setCopied] = useState(false)

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('oju_theme', next) } catch {}
  }

  const handleLink = async (link) => {
    // Track click
    fetch('/api/click', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ linkId: link.id }),
    }).catch(()=>{})
    // Open via web toolbar
    window.location.href = `/go?url=${encodeURIComponent(link.url)}&title=${encodeURIComponent(link.title)}`
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) { navigator.share({ title: user.name, url }).catch(()=>{}) }
    else { navigator.clipboard.writeText(url).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000) }
  }

  return (
    <main style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ maxWidth:440, margin:'0 auto', padding:'0 20px 60px' }}>

        {/* Topbar */}
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'14px 0', borderBottom:'1px solid var(--brd)' }}>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={share} style={{ width:32, height:32, borderRadius:6, border:'1px solid var(--brd)', background:'transparent', cursor:'pointer', color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center' }} title="Share">
              {copied
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 13 4 10"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
            </button>
            <button onClick={toggleTheme} style={{ width:32, height:32, borderRadius:6, border:'1px solid var(--brd)', background:'transparent', cursor:'pointer', color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center' }} title="Toggle theme">
              {theme==='dark'
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
          </div>
        </div>

        {/* Profile */}
        <div style={{ padding:'28px 0 24px', textAlign:'center', borderBottom:'1px solid var(--brd)' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--bg2)', border:'1px solid var(--brd)', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'var(--txt)' }}>
            {user.name[0].toUpperCase()}
          </div>
          <h1 style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2 }}>{user.name}</h1>
          <p style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>@{user.username}</p>
          {user.bio && <p style={{ fontSize:13, color:'var(--txt2)', marginTop:8, lineHeight:1.5 }}>{user.bio}</p>}
        </div>

        {/* Clock */}
        <Clock />

        {/* Links */}
        <div style={{ padding:'24px 0' }}>
          <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:10 }}>Links</p>

          {links.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px', border:'1px dashed var(--brd)', borderRadius:10, color:'var(--muted)', fontSize:13 }}>
              No links yet.
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {links.map((l, i) => (
              <button key={l.id} className="pub-link" onClick={()=>handleLink(l)}
                style={{ animationDelay:`${i*50}ms`, animation:'fadeUp .35s ease both' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{l.title}</div>
                  {l.description && <div style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>{l.description}</div>}
                </div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color:'var(--muted)', flexShrink:0 }}>
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ paddingTop:24, borderTop:'1px solid var(--brd)', textAlign:'center', display:'flex', flexDirection:'column', gap:6 }}>
          <a href="/" style={{ fontSize:12, color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            OJU Link
          </a>
          <p style={{ fontSize:11, color:'var(--muted)' }}>© {new Date().getFullYear()} OJU</p>
        </div>

        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    </main>
  )
}

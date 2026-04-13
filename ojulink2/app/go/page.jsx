'use client'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function Toolbar() {
  const params   = useSearchParams()
  const url      = params.get('url')   || 'https://ojuexam.online'
  const title    = params.get('title') || 'Link'
  const [loaded,   setLoaded]   = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t = setInterval(() =>
      setProgress(p => { if (p >= 88) { clearInterval(t); return 88 } return p + 15 }), 120)
    return () => clearInterval(t)
  }, [])

  let domain = url
  try { domain = new URL(url).hostname.replace('www.', '') } catch {}

  const share = async () => {
    if (navigator.share) navigator.share({ title, url }).catch(() => {})
    else navigator.clipboard.writeText(url).catch(() => {})
  }

  return (
    <div data-theme={typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'light' : 'light'}
      style={{ display:'flex', flexDirection:'column', height:'100vh', background:'var(--bg)', fontFamily:'Inter,sans-serif' }}>

      {/* Progress bar */}
      {!loaded && (
        <div style={{ position:'fixed', top:0, left:0, right:0, height:2, zIndex:100 }}>
          <div style={{ height:'100%', background:'var(--txt)', width:`${progress}%`, transition:'width .12s linear' }} />
        </div>
      )}

      {/* Top toolbar */}
      <div style={{ flexShrink:0, borderBottom:'1px solid var(--brd)', background:'var(--bg)', padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
        {/* Back */}
        <button onClick={() => window.history.back()}
          style={{ width:32, height:32, borderRadius:7, border:'1px solid var(--brd)', background:'transparent', cursor:'pointer', color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        {/* Brand */}
        <a href="/" style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', width:24, height:24, borderRadius:5, background:'var(--txt)', textDecoration:'none' }}>
          <span style={{ color:'var(--bg)', fontSize:11, fontWeight:800, fontFamily:'inherit' }}>O</span>
        </a>

        {/* URL bar */}
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:7, border:'1px solid var(--brd)', background:'var(--bg2)', minWidth:0, overflow:'hidden' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--muted)', flexShrink:0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span style={{ fontSize:12, color:'var(--muted)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{domain}</span>
        </div>

        {/* Share */}
        <button onClick={share}
          style={{ width:32, height:32, borderRadius:7, border:'1px solid var(--brd)', background:'transparent', cursor:'pointer', color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>

        {/* Open in browser */}
        <button onClick={() => window.open(url, '_blank', 'noopener')}
          style={{ width:32, height:32, borderRadius:7, border:'1px solid var(--brd)', background:'transparent', cursor:'pointer', color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </button>
      </div>

      {/* iframe */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        {!loaded && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background:'var(--bg)' }}>
            <div style={{ width:40, height:40, borderRadius:10, border:'1px solid var(--brd)', background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', animation:'spin 1s linear infinite' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color:'var(--muted)' }}>
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <span style={{ fontSize:13, color:'var(--muted)' }}>Opening {domain}…</span>
          </div>
        )}
        <iframe
          src={url}
          style={{ width:'100%', height:'100%', border:'none', display: loaded ? 'block' : 'none' }}
          onLoad={() => { setLoaded(true); setProgress(100) }}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Bottom strip */}
      <div style={{ flexShrink:0, padding:'7px 16px', borderTop:'1px solid var(--brd)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg)' }}>
        <button onClick={() => window.history.back()} style={{ fontSize:11, color:'var(--muted)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>← Back</button>
        <a href="/" style={{ fontSize:11, color:'var(--muted)', fontFamily:'inherit', textDecoration:'none' }}>OJU Link</a>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        :root,[data-theme="light"]{--bg:#fff;--bg2:#f7f7f7;--brd:#e8e8e8;--txt:#000;--muted:#888}
        [data-theme="dark"]{--bg:#0a0a0a;--bg2:#111;--brd:#222;--txt:#fff;--muted:#666}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}

export default function GoPage() {
  return (
    <Suspense fallback={<div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif', color:'#888', fontSize:14 }}>Loading…</div>}>
      <Toolbar />
    </Suspense>
  )
}

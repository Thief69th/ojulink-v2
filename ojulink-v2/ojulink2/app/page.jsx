import Link from 'next/link'

export const metadata = { title:'OJU Link — Your Bio Link Platform' }

export default function HomePage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ maxWidth:960, margin:'0 auto', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--brd)' }}>
        <span style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em' }}>OJU Link</span>
        <div style={{ display:'flex', gap:10 }}>
          <Link href="/login"  className="btn btn-outline btn-sm">Log in</Link>
          <Link href="/signup" className="btn btn-black  btn-sm">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth:560, margin:'0 auto', padding:'80px 24px 60px', textAlign:'center' }}>
        <h1 style={{ fontSize:'clamp(32px,6vw,52px)', fontWeight:700, letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:20 }}>
          All your links,<br />one page.
        </h1>
        <p style={{ fontSize:16, color:'var(--muted)', marginBottom:32, lineHeight:1.6 }}>
          Create your free bio link page. Share it everywhere.<br />
          Track who clicks what, when, and how often.
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/signup" className="btn btn-black" style={{ fontSize:15, padding:'12px 24px' }}>
            Create your page →
          </Link>
          <Link href="/oju" className="btn btn-outline" style={{ fontSize:15, padding:'12px 24px' }}>
            See an example
          </Link>
        </div>

        {/* Feature grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:72, textAlign:'left' }}>
          {[
            { icon:'🔗', title:'Unlimited links',   desc:'Add as many links as you want. Reorder with drag & drop.' },
            { icon:'📊', title:'Click analytics',    desc:'See total, daily & monthly clicks per link.' },
            { icon:'🌙', title:'Light & dark mode',  desc:'Your page auto-adapts or visitors can toggle.' },
          ].map(f => (
            <div key={f.title} style={{ padding:'18px', border:'1px solid var(--brd)', borderRadius:10, background:'var(--bg2)' }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{f.icon}</div>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{f.title}</div>
              <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ textAlign:'center', padding:'32px', color:'var(--muted)', fontSize:12, borderTop:'1px solid var(--brd)' }}>
        © {new Date().getFullYear()} OJU Link · <a href="https://ojuexam.online" style={{ color:'var(--txt)' }}>ojuexam.online</a>
      </footer>
    </div>
  )
}

'use client'
import { useState } from 'react'

function MiniChart({ data, color='var(--txt)' }) {
  const max = Math.max(...data.map(d=>d.clicks), 1)
  const last7 = data.slice(-14)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:40 }}>
      {last7.map((d, i) => {
        const h = Math.max((d.clicks/max)*100, 2)
        return (
          <div key={i} title={`${d.date}: ${d.clicks} clicks`}
            style={{ flex:1, height:`${h}%`, background: d.clicks>0 ? color : 'var(--bg3)', borderRadius:'2px 2px 0 0', transition:'height .4s ease', cursor:'default' }} />
        )
      })}
    </div>
  )
}

function BigChart({ data }) {
  const max = Math.max(...data.map(d=>d.clicks), 1)
  const total = data.reduce((a,b)=>a+b.clicks,0)
  const peak  = data.reduce((a,b)=>b.clicks>a.clicks?b:a, data[0])
  return (
    <div>
      <div style={{ display:'flex', gap:24, marginBottom:20, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:28, fontWeight:700, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.04em' }}>{total.toLocaleString()}</div>
          <div style={{ fontSize:12, color:'var(--muted)' }}>clicks in 30 days</div>
        </div>
        <div>
          <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.04em' }}>{peak?.clicks ?? 0}</div>
          <div style={{ fontSize:12, color:'var(--muted)' }}>peak day ({peak?.date?.slice(5) || '—'})</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:80 }}>
        {data.map((d, i) => {
          const h = Math.max((d.clicks/max)*100, 2)
          return (
            <div key={i} title={`${d.date}: ${d.clicks} clicks`}
              style={{ flex:1, height:`${h}%`, background: d.clicks>0 ? 'var(--txt)' : 'var(--bg3)', borderRadius:'2px 2px 0 0', cursor:'default', transition:'background .15s' }}
              onMouseEnter={e=>e.target.style.background='var(--txt2)'}
              onMouseLeave={e=>e.target.style.background=d.clicks>0?'var(--txt)':'var(--bg3)'} />
          )
        })}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--muted)' }}>
        <span>{data[0]?.date?.slice(5)}</span>
        <span>30-day clicks</span>
        <span>{data[data.length-1]?.date?.slice(5)}</span>
      </div>
    </div>
  )
}

export default function InsightsClient({ links, profileStats }) {
  const [activeLink, setActiveLink] = useState(links[0]?.id || null)

  // Total clicks across all links
  const totalClicks  = links.reduce((a,l)=>a+(l.clicks?.total||0), 0)
  const todayClicks  = links.reduce((a,l)=>a+(l.clicks?.today||0), 0)
  const monthClicks  = links.reduce((a,l)=>a+(l.clicks?.month||0), 0)

  // Sort links by total clicks
  const ranked = [...links].sort((a,b)=>(b.clicks?.total||0)-(a.clicks?.total||0))

  const selected = links.find(l=>l.id===activeLink)

  // Merge histories for "all links"
  const combinedHistory = (() => {
    if (links.length === 0) return []
    const base = links[0].history.map((d,i) => ({ date:d.date, clicks: links.reduce((a,l)=>a+(l.history[i]?.clicks||0),0) }))
    return base
  })()

  const chartData = activeLink==='all' ? combinedHistory : (selected?.history ?? [])

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'32px 24px' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.02em' }}>Insights</h1>
        <p style={{ fontSize:13, color:'var(--muted)', marginTop:3 }}>Last 30 days</p>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
        {[
          { label:'Profile views',   val:profileStats.totalViews, sub:'all time'    },
          { label:'Total clicks',    val:totalClicks,             sub:'all time'    },
          { label:'Clicks today',    val:todayClicks,             sub:'since midnight' },
        ].map((s,i) => (
          <div key={i} className="card au" style={{ padding:'16px', ...(i<3?{animationDelay:`${i*50}ms`}:{}) }}>
            <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums' }}>{s.val.toLocaleString()}</div>
            <div style={{ fontSize:12, fontWeight:600, marginTop:4 }}>{s.label}</div>
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Click chart ── */}
      <div className="card au au2" style={{ padding:20, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <p style={{ fontWeight:600, fontSize:14 }}>Click trend</p>
          <select value={activeLink||'all'}
            onChange={e=>setActiveLink(e.target.value==='all'?'all':e.target.value)}
            style={{ fontSize:12, padding:'5px 10px', borderRadius:6, border:'1px solid var(--brd2)', background:'var(--bg)', color:'var(--txt)', cursor:'pointer', outline:'none' }}>
            <option value="all">All links</option>
            {links.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
        {chartData.length > 0
          ? <BigChart data={chartData} />
          : <div style={{ textAlign:'center', padding:'24px', color:'var(--muted)', fontSize:13 }}>No click data yet</div>}
      </div>

      {/* ── Per-link table ── */}
      <div className="card au au3">
        <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid var(--brd)' }}>
          <p style={{ fontWeight:600, fontSize:14 }}>Per-link breakdown</p>
        </div>
        {ranked.length === 0 && (
          <div style={{ padding:'32px', textAlign:'center', color:'var(--muted)', fontSize:13 }}>
            Add links to see analytics here.
          </div>
        )}
        {ranked.map((l, i) => {
          const maxClicks = ranked[0]?.clicks?.total || 1
          const pct = Math.max(((l.clicks?.total||0)/maxClicks)*100, 0)
          return (
            <div key={l.id} style={{ padding:'14px 16px', borderBottom: i<ranked.length-1?'1px solid var(--brd)':undefined }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                {/* Rank */}
                <span style={{ fontSize:12, fontWeight:700, color:'var(--muted)', width:18, flexShrink:0 }}>#{i+1}</span>

                {/* Title & URL */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.title}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.url}</div>
                </div>

                {/* Stats */}
                <div style={{ display:'flex', gap:20, flexShrink:0 }}>
                  {[
                    { v:l.clicks?.total||0, label:'total' },
                    { v:l.clicks?.today||0, label:'today' },
                    { v:l.clicks?.month||0, label:'month' },
                  ].map(s=>(
                    <div key={s.label} style={{ textAlign:'right' }}>
                      <div style={{ fontSize:16, fontWeight:700, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em' }}>{s.v.toLocaleString()}</div>
                      <div style={{ fontSize:10, color:'var(--muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini chart + progress */}
              <div style={{ display:'flex', alignItems:'flex-end', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div className="prog" style={{ marginBottom:3 }}>
                    <div className="prog-fill" style={{ width:`${pct}%` }}/>
                  </div>
                </div>
                <div style={{ flexShrink:0, width:80 }}>
                  <MiniChart data={l.history} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Profile views chart */}
      {profileStats.daily && (
        <div className="card au au4" style={{ padding:20, marginTop:20 }}>
          <p style={{ fontWeight:600, fontSize:14, marginBottom:16 }}>Profile views (30d)</p>
          <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:60 }}>
            {profileStats.daily.map((d,i) => {
              const max = Math.max(...profileStats.daily.map(x=>x.views), 1)
              const h = Math.max((d.views/max)*100, 2)
              return (
                <div key={i} title={`${d.date}: ${d.views} views`}
                  style={{ flex:1, height:`${h}%`, background:d.views>0?'var(--txt)':'var(--bg3)', borderRadius:'2px 2px 0 0' }} />
              )
            })}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--muted)' }}>
            <span>{profileStats.daily[0]?.date?.slice(5)}</span>
            <span>{profileStats.totalViews.toLocaleString()} total views</span>
            <span>{profileStats.daily[profileStats.daily.length-1]?.date?.slice(5)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

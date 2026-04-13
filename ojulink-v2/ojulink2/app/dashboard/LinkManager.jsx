'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LinkManager({ initialLinks, userId }) {
  const router = useRouter()
  const [links,   setLinks]   = useState(initialLinks)
  const [adding,  setAdding]  = useState(false)
  const [editId,  setEditId]  = useState(null)
  const [form,    setForm]    = useState({ title:'', url:'', description:'' })
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [copied,  setCopied]  = useState(false)

  const flash = (m) => { setMsg(m); setTimeout(()=>setMsg(''), 2500) }

  const startAdd = () => { setForm({ title:'', url:'', description:'' }); setAdding(true); setEditId(null) }
  const startEdit = (l) => { setForm({ title:l.title, url:l.url, description:l.description||'' }); setEditId(l.id); setAdding(false) }
  const cancel = () => { setAdding(false); setEditId(null) }

  const saveNew = async () => {
    if (!form.title.trim() || !form.url.trim()) return
    setSaving(true)
    const res = await fetch('/api/links', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) {
      const newLink = await res.json()
      setLinks(l => [...l, { ...newLink, clicks:{ total:0, today:0, month:0 } }])
      setAdding(false)
      flash('Link added!')
    }
    setSaving(false)
  }

  const saveEdit = async (id) => {
    setSaving(true)
    const res = await fetch(`/api/links/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (res.ok) {
      const updated = await res.json()
      setLinks(l => l.map(x => x.id===id ? { ...x, ...updated } : x))
      setEditId(null)
      flash('Link updated!')
    }
    setSaving(false)
  }

  const toggleActive = async (id, current) => {
    const res = await fetch(`/api/links/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ active:!current }) })
    if (res.ok) setLinks(l => l.map(x => x.id===id ? { ...x, active:!current } : x))
  }

  const del = async (id) => {
    if (!confirm('Delete this link?')) return
    const res = await fetch(`/api/links/${id}`, { method:'DELETE' })
    if (res.ok) { setLinks(l => l.filter(x => x.id!==id)); flash('Link deleted.') }
  }

  const copyProfile = () => {
    navigator.clipboard.writeText(window.location.origin + '/@me').catch(()=>{})
    setCopied(true); setTimeout(()=>setCopied(false), 2000)
  }

  const I = ({ d, size=14, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d==='plus'&&<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
      {d==='edit'&&<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}
      {d==='trash'&&<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>}
      {d==='ext'&&<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>}
      {d==='copy'&&<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>}
      {d==='check'&&<polyline points="20 6 9 13 4 10"/>}
    </svg>
  )

  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'32px 24px' }}>

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.02em' }}>My Links</h1>
          <p style={{ fontSize:13, color:'var(--muted)', marginTop:3 }}>{links.length} link{links.length!==1?'s':''}</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-outline btn-sm" onClick={copyProfile}>
            {copied ? <I d="check"/> : <I d="copy"/>}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button className="btn btn-black btn-sm" onClick={startAdd}>
            <I d="plus" color="var(--bg)"/> Add link
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:8, background:'var(--bg2)', border:'1px solid var(--brd)', fontSize:13, color:'var(--txt2)' }}>
          {msg}
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="card au" style={{ padding:20, marginBottom:16 }}>
          <p style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>New link</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <input className="inp" placeholder="Title (e.g. My Website)" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} autoFocus />
            <input className="inp" placeholder="URL (https://...)" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} />
            <input className="inp" placeholder="Description (optional)" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-black btn-sm" onClick={saveNew} disabled={saving}>{saving?'Saving…':'Save'}</button>
              <button className="btn btn-outline btn-sm" onClick={cancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {links.length===0 && !adding && (
        <div style={{ textAlign:'center', padding:'48px 24px', border:'1px dashed var(--brd2)', borderRadius:12 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🔗</div>
          <p style={{ fontWeight:600, marginBottom:6 }}>No links yet</p>
          <p style={{ fontSize:13, color:'var(--muted)', marginBottom:20 }}>Add your first link to get started.</p>
          <button className="btn btn-black btn-sm" onClick={startAdd}><I d="plus" color="var(--bg)"/> Add first link</button>
        </div>
      )}

      {/* Links list */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {links.map((l, i) => (
          <div key={l.id} className={`card au au${Math.min(i+1,6)}`} style={{ padding:0, overflow:'hidden', opacity:l.active?1:0.55 }}>
            {editId===l.id ? (
              <div style={{ padding:16, display:'flex', flexDirection:'column', gap:10 }}>
                <input className="inp" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" />
                <input className="inp" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="URL" />
                <input className="inp" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description (optional)" />
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-black btn-sm" onClick={()=>saveEdit(l.id)} disabled={saving}>{saving?'Saving…':'Save'}</button>
                  <button className="btn btn-outline btn-sm" onClick={cancel}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontWeight:600, fontSize:14 }}>{l.title}</span>
                      {!l.active && <span className="badge">Off</span>}
                    </div>
                    <div style={{ fontSize:12, color:'var(--muted)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.url}</div>
                    {l.description && <div style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>{l.description}</div>}

                    {/* Click stats */}
                    <div style={{ display:'flex', gap:16, marginTop:10, flexWrap:'wrap' }}>
                      {[
                        { label:'Total',  val:l.clicks?.total ?? 0 },
                        { label:'Today',  val:l.clicks?.today ?? 0 },
                        { label:'Month',  val:l.clicks?.month ?? 0 },
                      ].map(s => (
                        <div key={s.label} style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                          <span style={{ fontSize:16, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{s.val.toLocaleString()}</span>
                          <span style={{ fontSize:11, color:'var(--muted)' }}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                    {/* Toggle */}
                    <button className="toggle" style={{ marginTop:2 }} onClick={()=>toggleActive(l.id,l.active)}
                      title={l.active?'Deactivate':'Activate'} />
                    <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(l)} title="Edit"><I d="edit"/></button>
                    <a href={l.url} target="_blank" rel="noopener" className="btn btn-ghost btn-sm" title="Open URL"><I d="ext"/></a>
                    <button className="btn btn-ghost btn-sm" onClick={()=>del(l.id)} title="Delete" style={{ color:'#ef4444' }}><I d="trash" color="#ef4444"/></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

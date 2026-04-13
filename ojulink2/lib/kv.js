/**
 * lib/kv.js  —  All KV (Redis) operations
 *
 * Key schema:
 *   user:{userId}            →  { id, username, name, bio, email, passwordHash, createdAt }
 *   uid:username:{username}  →  userId
 *   uid:email:{email}        →  userId
 *   links:{userId}           →  JSON array of link objects
 *   click:{linkId}           →  total click count  (INCR)
 *   click:{linkId}:{date}    →  daily clicks  (INCR, TTL 37d)
 *   click:{linkId}:{month}   →  monthly clicks  (INCR, TTL 400d)
 *   view:{userId}            →  total profile views
 *   view:{userId}:{date}     →  daily views (TTL 37d)
 */

let _kv = null

async function kv() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    if (!_kv) { const m = await import('@vercel/kv'); _kv = m.kv }
    return _kv
  }
  return mem
}

// ── In-memory fallback ──────────────────────────────────────────────────────
const _mem = new Map(), _ttl = new Map()
function expired(k) {
  if (_ttl.has(k) && Date.now() > _ttl.get(k)) { _mem.delete(k); _ttl.delete(k); return true }
  return false
}
const mem = {
  async get(k)         { if (expired(k)) return null; return _mem.get(k) ?? null },
  async set(k, v, o)   { _mem.set(k, v); if (o?.ex) _ttl.set(k, Date.now() + o.ex*1000); return 'OK' },
  async del(k)         { _mem.delete(k); _ttl.delete(k); return 1 },
  async incr(k)        { const v = ((!expired(k) && _mem.get(k)) || 0) + 1; _mem.set(k, v); return v },
  async exists(k)      { return !expired(k) && _mem.has(k) ? 1 : 0 },
  async keys(p)        { const rx = new RegExp('^' + p.replace(/\*/g,'.*') + '$'); return [..._mem.keys()].filter(k=>!expired(k)&&rx.test(k)) },
  async expire(k, s)   { if (!expired(k) && _mem.has(k)) _ttl.set(k, Date.now() + s*1000); return 1 },
}

// ── Date helpers ─────────────────────────────────────────────────────────────
function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function thisMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}
function last30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)
  }
  return days
}

// ── User operations ──────────────────────────────────────────────────────────
export async function createUser({ id, username, name, email, passwordHash }) {
  const db = await kv()
  const user = { id, username, name, email, passwordHash, bio: '', createdAt: Date.now() }
  await Promise.all([
    db.set(`user:${id}`, JSON.stringify(user)),
    db.set(`uid:username:${username.toLowerCase()}`, id),
    db.set(`uid:email:${email.toLowerCase()}`, id),
    db.set(`links:${id}`, JSON.stringify([])),
  ])
  return user
}

export async function getUserById(id) {
  const db = await kv()
  const raw = await db.get(`user:${id}`)
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

export async function getUserByUsername(username) {
  const db = await kv()
  const id = await db.get(`uid:username:${username.toLowerCase()}`)
  if (!id) return null
  return getUserById(id)
}

export async function getUserByEmail(email) {
  const db = await kv()
  const id = await db.get(`uid:email:${email.toLowerCase()}`)
  if (!id) return null
  return getUserById(id)
}

export async function updateUser(id, updates) {
  const db = await kv()
  const user = await getUserById(id)
  if (!user) return null
  const updated = { ...user, ...updates }
  await db.set(`user:${id}`, JSON.stringify(updated))
  return updated
}

// ── Link operations ──────────────────────────────────────────────────────────
export async function getLinks(userId) {
  const db = await kv()
  const raw = await db.get(`links:${userId}`)
  if (!raw) return []
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

export async function saveLinks(userId, links) {
  const db = await kv()
  await db.set(`links:${userId}`, JSON.stringify(links))
}

export async function addLink(userId, link) {
  const links = await getLinks(userId)
  links.push(link)
  await saveLinks(userId, links)
  return links
}

export async function updateLink(userId, linkId, updates) {
  const links = await getLinks(userId)
  const idx = links.findIndex(l => l.id === linkId)
  if (idx === -1) return null
  links[idx] = { ...links[idx], ...updates }
  await saveLinks(userId, links)
  return links[idx]
}

export async function deleteLink(userId, linkId) {
  const links = await getLinks(userId)
  const filtered = links.filter(l => l.id !== linkId)
  await saveLinks(userId, filtered)
}

// ── Click tracking ────────────────────────────────────────────────────────────
export async function trackClick(linkId) {
  const db = await kv()
  const d = today(), m = thisMonth()
  await Promise.all([
    db.incr(`click:${linkId}`),
    db.incr(`click:${linkId}:${d}`).then(() => db.expire(`click:${linkId}:${d}`, 37*86400)),
    db.incr(`click:${linkId}:${m}`).then(() => db.expire(`click:${linkId}:${m}`, 400*86400)),
  ])
}

export async function getLinkClicks(linkId) {
  const db = await kv()
  const [total, todayCount, monthCount] = await Promise.all([
    db.get(`click:${linkId}`),
    db.get(`click:${linkId}:${today()}`),
    db.get(`click:${linkId}:${thisMonth()}`),
  ])
  return {
    total:   Number(total   ?? 0),
    today:   Number(todayCount  ?? 0),
    month:   Number(monthCount  ?? 0),
  }
}

export async function getLinkClickHistory(linkId) {
  const db = await kv()
  const days = last30Days()
  const counts = await Promise.all(days.map(d => db.get(`click:${linkId}:${d}`)))
  return days.map((d, i) => ({ date: d, clicks: Number(counts[i] ?? 0) }))
}

// ── Profile view tracking ─────────────────────────────────────────────────────
export async function trackView(userId) {
  const db = await kv()
  const d = today()
  await Promise.all([
    db.incr(`view:${userId}`),
    db.incr(`view:${userId}:${d}`).then(() => db.expire(`view:${userId}:${d}`, 37*86400)),
  ])
}

export async function getProfileStats(userId) {
  const db = await kv()
  const days = last30Days()
  const [total, ...dailyCounts] = await Promise.all([
    db.get(`view:${userId}`),
    ...days.map(d => db.get(`view:${userId}:${d}`)),
  ])
  return {
    totalViews: Number(total ?? 0),
    daily: days.map((d, i) => ({ date: d, views: Number(dailyCounts[i] ?? 0) })),
  }
}

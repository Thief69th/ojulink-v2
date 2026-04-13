# OJU Link v2 — Full SaaS Bio Link Platform

> Multi-user Linktree-style platform with accounts, click analytics, day/night mode, and Web Toolbar. Built on Next.js 14 + Vercel KV.

---

## Features

| Feature | Details |
|---------|---------|
| 🔐 Auth | Signup / Login with JWT (30-day sessions) |
| 🔗 Links | Add, edit, delete, toggle on/off, unlimited links |
| 📊 Insights | Total · Today · Month clicks per link, 30-day bar chart |
| 👤 Public profile | `ojulink.online/username` — clean Linktree-style page |
| 🌐 Web Toolbar | Branded iframe viewer with back/share/open buttons |
| 🌙 Day / Night | System preference + manual toggle, persisted in localStorage |
| ⚡ Real-time | Click counts update instantly in dashboard |

---

## Deploy to Vercel — Step by Step

### 1. Set up `.env.local`
```bash
cp .env.example .env.local
# Edit .env.local and set JWT_SECRET to a strong random string:
# openssl rand -base64 32
```

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "OJU Link v2"
git remote add origin https://github.com/YOUR_USERNAME/ojulink.git
git push -u origin main
```

### 3. Import on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repo → **Deploy**
3. Add **Environment Variables**:
   - `JWT_SECRET` → your random string

### 4. Add Vercel KV (database)
1. Vercel project → **Storage** tab
2. **Create** → **KV Database** → name it `ojulink-kv`
3. **Connect to Project** → env vars auto-added ✅

### 5. Custom domain
Vercel project → **Domains** → add `ojulink.online`

---

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in JWT_SECRET
npm run dev
# Open http://localhost:3000
```

> Stats use in-memory fallback locally (resets on restart).
> For real KV locally: `vercel env pull .env.local`

---

## Project Structure

```
ojulink2/
├── app/
│   ├── page.jsx                  # Landing page
│   ├── signup/page.jsx           # Signup
│   ├── login/page.jsx            # Login
│   ├── go/page.jsx               # Web Toolbar
│   ├── [username]/               # Public profile
│   │   ├── page.jsx              # Server component (fetches data)
│   │   └── PublicProfile.jsx     # Client component
│   ├── dashboard/
│   │   ├── layout.jsx            # Auth-protected layout
│   │   ├── DashboardShell.jsx    # Sidebar + nav
│   │   ├── page.jsx              # Links manager
│   │   ├── LinkManager.jsx       # Client CRUD UI
│   │   ├── insights/
│   │   │   ├── page.jsx          # Insights (server)
│   │   │   └── InsightsClient.jsx# Charts + analytics UI
│   │   └── settings/page.jsx     # Profile settings
│   └── api/
│       ├── auth/signup/          # POST — create account
│       ├── auth/login/           # POST — get session
│       ├── auth/logout/          # POST — clear session
│       ├── auth/me/              # GET/PATCH — current user
│       ├── links/                # GET list / POST create
│       ├── links/[id]/           # PUT update / DELETE
│       ├── click/                # POST — track click (public)
│       └── insights/             # GET — full analytics
├── lib/
│   ├── kv.js                     # All database operations
│   └── auth.js                   # JWT session helpers
└── middleware.js                 # Route protection
```

---

## How Click Tracking Works

1. Visitor opens `ojulink.online/username`
2. Clicks a link → POST `/api/click` fires (fire & forget)
3. Redirected to `/go?url=...&title=...` (Web Toolbar)
4. KV increments:
   - `click:{linkId}` — all-time total
   - `click:{linkId}:YYYY-MM-DD` — daily (TTL 37d)
   - `click:{linkId}:YYYY-MM` — monthly (TTL 400d)
5. Dashboard shows live counts for every link

---

## Security Notes

- Passwords hashed with bcrypt (cost 10)
- JWT signed with HS256 (30-day expiry)
- HTTP-only session cookie (no JS access)
- Link ownership verified on every PUT/DELETE
- Rate limiting: add Vercel Edge Config or Upstash Ratelimit for production

# Clinch.ai — Project Context for Antigravity
> Pin this file in Antigravity so it always has full context
> Last updated: March 2026

---

## What is Clinch.ai?
AI-powered influencer marketing SaaS for Indian brands.
Single-sided B2B tool — brands use it, influencers never log in.

---

## Tech Stack
- Framework: Next.js 14+ (App Router)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (Email + Google OAuth)
- AI: Claude claude-sonnet-4-20250514 via Anthropic SDK
- Styling: Tailwind CSS
- Language: TypeScript
- Hosting: Vercel (planned)

---

## Design System
```
Colors:
  --bg-base: #F5F0E8        (warm cream — main bg)
  --bg-surface: #FFFFFF      (white — cards)
  --bg-sidebar: #1C1410     (espresso — sidebar)
  --brand-primary: #C4622D  (terracotta — CTAs)
  --text-primary: #1C1410   (espresso)
  --text-muted: #A89585     (muted brown)
  --border: #E8DDD4         (warm border)

Fonts:
  Display: Playfair Display (headings)
  Body: DM Sans (UI elements)
  Mono: JetBrains Mono (numbers/metrics)
```

---

## Project Structure
```
/app
  /(auth)
    /login          ← Login page
    /signup         ← Signup page
  /(dashboard)
    /dashboard      ← Home dashboard
    /search         ← AI Search page ← CURRENT FOCUS
    /crm            ← Creators CRM
    /mailbox        ← Unified Mailbox
    /templates      ← Email Templates
    /connected      ← Connected Accounts
  /onboarding       ← Onboarding flow
  /api
    /ai
      /search-query     ← Claude parses NL query
      /match-score      ← Claude scores influencer
      /outreach-draft   ← Claude writes outreach email
      /reply-draft      ← Claude writes reply
    /search
      /influencers      ← Main search endpoint
    /brand
      /onboarding       ← Save brand profile
      /profile          ← Get/update brand
    /crm
      /add              ← Add to CRM
    /gmail
      /connect          ← OAuth flow
      /send             ← Send email
      /sync             ← Sync inbox

/lib
  /supabase
    client.ts       ← Browser Supabase client
    server.ts       ← Server Supabase client
    admin.ts        ← Admin client (service role)
    types.ts        ← TypeScript types

/hooks
  useBrand.ts       ← Brand data hook

/components
  OutreachModal.tsx ← AI outreach email modal
  Toast.tsx         ← Toast notifications

/middleware.ts      ← Auth protection
```

---

## Database Tables
```
brands              ← Brand profiles (linked to auth.users)
influencers         ← Influencer data (from API/mock)
crm_entries         ← Brand ↔ Influencer pipeline
conversations       ← Unified conversation threads
messages            ← Individual messages (email/DM/LinkedIn)
email_templates     ← Outreach templates
connected_accounts  ← Gmail/Instagram/LinkedIn tokens
search_history      ← Past searches
```

---

## Current Build Status
✅ Phase 1 Frontend — 100% complete
✅ Supabase setup — Complete
✅ Auth (login/signup) — Complete
✅ Onboarding → saves to DB — Complete
✅ AI Search with Claude — Working (fixing filters)
🔨 AI Search filters — In progress
⬜ Add to CRM button
⬜ Start Outreach modal
⬜ Gmail OAuth
⬜ Mailbox real data
⬜ AI reply drafting

---

## Key Rules When Coding
1. Always use 'use client' for interactive components
2. Always use server client for API routes
3. Never expose SUPABASE_SERVICE_ROLE_KEY to frontend
4. All API routes must check auth before processing
5. Use existing design system colors — no new colors
6. All monetary values in INR (₹)
7. Target Indian cities: Mumbai, Delhi, Bangalore, 
   Chennai, Hyderabad, Pune, Kochi, Kolkata

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Supabase Project
Project ID: ubcsjzuhvubkrpensqgc
Region: Southeast Asia (Singapore)
URL: https://ubcsjzuhvubkrpensqgc.supabase.co
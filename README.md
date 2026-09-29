# Sochi — Society Complaint Triage

An AI-powered inbox that reads, ranks, groups, and answers housing society complaints.

## Stack

- Next.js 16 App Router + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Firebase Firestore (Admin SDK on server, client SDK for realtime)
- Anthropic Claude (server-side only)
- Zod validation
- next-themes (light/dark)
- Deployed on Vercel

## Setup

### 1. Clone and install

```bash
cd sochi
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required:
- `ANTHROPIC_API_KEY` — Anthropic API key
- `ANTHROPIC_MODEL` — e.g. `claude-sonnet-4-5` (default if unset)
- `COMMITTEE_PASSCODE` — shared passcode for the committee dashboard
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — Firebase Admin SDK (from service account JSON). Store `FIREBASE_PRIVATE_KEY` with literal `\n` for line breaks.

Optional (for realtime dashboard updates):
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` — Firebase client SDK (web app config)

### 3. Firebase setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Firestore** in the project
3. Set **Firestore Security Rules** (deny all client access except `meta/lastChange`):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /meta/{doc} {
         allow read: if true;
         allow write: if false;
       }
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
4. Create a **Service Account** key (Project Settings → Service Accounts → Generate new private key)
5. Set the three `FIREBASE_*` env vars from the JSON key file

### 4. Seed demo data

```bash
npm run seed
```

To reset and reseed:
```bash
npm run reset && npm run seed
```

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### 6. Deploy to Vercel

```bash
npx vercel --prod
```

Set all env vars from `.env.local` in Vercel dashboard or via CLI.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/report` | Public complaint form (share this link with residents) |
| `/committee` | Committee passcode login |
| `/dashboard` | Committee triage dashboard (passcode protected) |

## API

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/auth` | POST (login), DELETE (logout) | Public |
| `/api/complaints` | POST | Public (rate-limited: 10/min) |
| `/api/clusters` | GET | Committee cookie |
| `/api/clusters/[id]` | GET, PATCH | Committee cookie |
| `/api/clusters/[id]/draft-reply` | POST | Committee cookie |
| `/api/clusters/[id]/send-reply` | POST | Committee cookie |
| `/api/stats` | GET | Committee cookie |

## Acceptance checklist

- [x] Public form accepts Hinglish complaint and shows confirmation
- [x] Complaint tagged with category, urgency, one-line summary
- [x] Similar complaints cluster together
- [x] Critical complaint appears at top
- [x] Wrong passcode shows no data
- [x] Status workflow: New → Assigned → In Progress → Resolved
- [x] Resolving triggers AI-drafted reply
- [x] Draft editable; send records timestamp
- [x] AI fallback saves complaint even on failure
- [x] Reset script restores demo dataset
- [x] Light/dark mode, Devanagari rendering

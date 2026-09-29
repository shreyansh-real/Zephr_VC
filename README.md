# Sochi — AI-Powered Society Complaint Triage

An intelligent inbox that reads, categorizes, ranks by urgency, clusters duplicates, and drafts volunteer & resident communications for housing society complaints.

---

## ⚡ Quick Start (Run in 2 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# AI Providers (At least one required)
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.3-70b-versatile"
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_MODEL="anthropic/claude-3.5-haiku"

# Committee Dashboard Access
COMMITTEE_PASSCODE="your-secure-passcode"

# Firebase Admin SDK (Firestore Database)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (Realtime Sync)
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_APP_ID="your-firebase-app-id"

# Gmail SMTP Email Notifications (Nodemailer)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
```

### 3. Seed Demo Data (Optional)
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🚀 Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) → **Add New Project** → Import repository.
3. Keep **Root Directory** as `./` (or `sochi` if deploying from parent workspace).
4. Framework Preset: **Next.js**.
5. Copy-paste all environment variables from `.env.local` into the Vercel **Environment Variables** settings.
6. Click **Deploy**.

---

## 🧭 Application Routes

| Route | Description | Access |
|---|---|---|
| `/` | Landing page & features overview | Public |
| `/report` | Resident complaint reporting form | Public |
| `/committee` | Committee security passcode authentication | Public |
| `/dashboard` | Live triage dashboard, status kanban & notification center | Passcode-protected |

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, Lucide Icons, Framer Motion
- **Database:** Firebase Firestore (Admin SDK server-side + Client SDK realtime snapshots)
- **AI Triage Engine:** Fallback chain: Google Gemini Flash → Groq Llama 3.3 → OpenRouter Haiku
- **Email Notifications:** Nodemailer (Gmail SMTP)

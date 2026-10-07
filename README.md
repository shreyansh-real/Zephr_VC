# SocietyDesk — Production-Ready Multi-Tenant Housing Society Complaint Box

A secure, offline-capable, multi-tenant complaint management system designed for residential housing societies, apartments, chawls, and row houses across India. Multiple societies share ONE Firebase project while maintaining 100% cryptographic isolation between tenants.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Firebase (Auth, Firestore, Storage, Hosting)** strictly on the **Firebase Spark (Free) plan** with zero server-side infrastructure.

---

## 1. Architectural Highlights

- **Pure Spark-Tier Architecture:** Zero Cloud Functions, zero custom backend servers. All business logic and multi-tenant security are strictly enforced via client SDKs combined with comprehensive `firestore.rules` and `storage.rules`.
- **Bulletproof Multi-Tenancy:** All society data resides under `/societies/{societyId}/...`. Firestore Security Rules enforce that users can only read or write documents in societies where their `/members/{uid}` record is `active`. No collection-group queries are used, preventing cross-tenant leakage.
- **Strict Free-Tier Discipline:**
  - **Paginated Reads:** 20 complaints per page (`limit(20)` and `startAfter()`), preventing unbounded document reads.
  - **Denormalized Counters:** `upvoteCount` is stored directly on complaint documents and incremented via atomic transactions, avoiding expensive count queries.
  - **Client-Side Image Compression:** Photos are converted to JPEG and downscaled on the client to ≤ 1.8 MB before upload, staying well under the 2 MB Storage rule cap and preserving free storage quota.
  - **Persistent Offline Cache:** Initialized with multi-tab persistent cache (`persistentLocalCache`) so residents can view issues even with intermittent cellular connectivity.
- **Multilingual from Day One (i18n):** Complete native dictionaries in **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)** with persistent language switching.
- **Design.md Adherence:** High-contrast editorial noticeboard aesthetic using **Archivo** (condensed display numerals & titles) and **Atkinson Hyperlegible** (high-legibility body font). Color is reserved strictly for urgency levels (`critical`, `high`, `medium`, `low`).

---

## 2. Expected Read/Write Costs per Action (Spark Plan Analysis)

| Resident Action | Reads | Writes | Cost Rationale |
|---|---|---|---|
| **Sign in / Load profile** | 1 (`users/{uid}`) | 0 (cached) | Reads user profile with enrolled `societyIds`. |
| **Open Noticeboard** | 20 (`complaints`) | 0 | Strictly paginated to 20 documents per page. |
| **Raise a Complaint** | 1 (`members/{uid}`) | 1 (`complaints/{cid}`) | Client compresses up to 3 photos; writes 1 doc. |
| **Upvote a Public Issue** | 1 (`complaints/{cid}`) | 2 (`upvotes/{uid}` + `complaints.upvoteCount`) | Atomic transaction ensures one vote per user. |
| **Post Update / Status Change** | 1 (`complaints/{cid}`) | 2 (`updates/{uid}` + `complaints.status`) | Creates immutable audit record + updates parent doc. |
| **Approve Member (Admin)** | 0 | 1 (`members/{uid}`) | Updates member status from `pending` to `active`. |

---

## 3. Firebase Console Setup Guide

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project named `societydesk`.
2. Stay on the **Spark (Free)** plan.

### Step 2: Enable Authentication
1. Navigate to **Build > Authentication > Sign-in method**.
2. **Google:** Enable Google Sign-in. Add your support email.
3. **Phone:** Enable Phone authentication. (For local testing, add test phone numbers such as `+919999999999` with SMS code `123456`).

### Step 3: Enable Firestore Database
1. Navigate to **Build > Firestore Database > Create Database**.
2. Choose **Production Mode** and select your closest cloud region (e.g., `asia-south1` for Mumbai).
3. Deploy the security rules and composite indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

### Step 4: Enable Firebase Storage
1. Navigate to **Build > Storage > Get Started**.
2. Deploy the storage security rules:
   ```bash
   firebase deploy --only storage
   ```

### Step 5: Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="societydesk-xxxxx.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="societydesk-xxxxx"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="societydesk-xxxxx.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="xxxxxxxxxxxx"
NEXT_PUBLIC_FIREBASE_APP_ID="1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_USE_EMULATOR="false"
```

---

## 4. Local Development & Firebase Emulator Suite

SocietyDesk is fully configured to work with the **Firebase Emulator Suite** for offline development:

1. Start emulators:
   ```bash
   npm run emulators
   ```
   - Auth Emulator: `http://localhost:9099`
   - Firestore Emulator: `http://localhost:8080`
   - Storage Emulator: `http://localhost:9199`
   - Emulator UI: `http://localhost:4000`

2. Start Next.js development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 5. Security Checklist (Signed Off)

- [x] **Multi-Tenant Separation:** All subcollection rules use `get(/databases/$(database)/documents/societies/$(sid)/members/$(request.auth.uid))` to verify `active` membership before granting read or write access.
- [x] **No Unbounded Reads:** All queries use `limit(20)`; collection-group listing is strictly denied.
- [x] **Role Tampering Prevention:** `allow update` on `/members/{memberId}` explicitly forbids `memberId == uid()`. Users can never promote themselves to `admin` or `volunteer`.
- [x] **Field Injection Prevention:** Every write rule uses `keys().hasOnly([...])` and validates data types and string lengths.
- [x] **Storage Write Protection:** Storage path `/societies/{sid}/complaints/{cid}/{fileId}` requires active society membership and matches the complaint's `createdBy` user.
- [x] **Client-Side Image Security:** Client downscales photos to ≤ 1.8 MB; storage rules reject any upload exceeding 2 MB or non-image content types.

---

## 6. Verification & Test Report

- **TypeScript Compilation:** Passed with 0 errors (`npm run typecheck`).
- **ESLint Code Quality:** Passed with 0 errors and 0 warnings (`npm run lint`).
- **Static Export Production Build:** Passed with 0 errors (`npm run build`). Generates static HTML bundle deployable directly to Firebase Hosting.

---

## 7. Future Upgrades (Intentionally Deferred for Blaze Plan)

The following features were intentionally **not** built in this version to preserve the zero-cost Spark tier:

1. **Cloud Functions for Automated Notifications:** Triggering emails/SMS when a complaint is filed or status changes (requires Blaze outbound network access).
2. **FCM Push Notifications:** Background push messages to resident phones (requires Blaze or external server push service).
3. **WhatsApp / SMS Gateway Integration:** Auto-dispatching updates via Twilio / Gupshup (requires paid third-party API and server execution).
4. **Automated AI Duplicate Clustering:** Server-side embedding vector search across complaints.

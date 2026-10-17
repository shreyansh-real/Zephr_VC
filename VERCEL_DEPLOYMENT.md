# Sochi - Vercel Deployment Guide

## Overview
The Sochi housing society complaint management app has been pushed to GitHub and is ready for Vercel deployment.

**GitHub Repository:** https://github.com/shreyansh-real/Zephr_VC
**Project Location:** `/societydesk` directory
**Target Domain:** sochi.vercel.app

---

## Step-by-Step Deployment Instructions

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Sign in with your Vercel account (shreyanshmpatel1408-6389)

### Step 2: Create New Project
1. Click **"Add New Project"** button
2. Select **"Import Git Repository"**
3. In the search box, search for: `Zephr_VC`
4. Click on the repository to import it

### Step 3: Configure Project Settings
1. **Project Name:** `sochi` (or keep as Zephr_VC, doesn't matter)
2. **Framework:** Next.js (should auto-detect)
3. **Root Directory:** `./societydesk` ← **IMPORTANT: Must set this!**
4. **Build Command:** `npm run build` (should be auto-filled)
5. **Output Directory:** `.next/static` (should be auto-filled)
6. **Node.js Version:** 20.x (should auto-detect)

### Step 4: Add Environment Variables
Before clicking "Deploy", click **"Environment Variables"** and add ALL of these:

#### Firebase Configuration (REQUIRED)
Copy from your .env.local file:
```
NEXT_PUBLIC_FIREBASE_API_KEY=<your_firebase_api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=zephr-society.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=zephr-society
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=zephr-society.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=950991779593
NEXT_PUBLIC_FIREBASE_APP_ID=1:950991779593:web:e6261fcc00cc4d6dc245d8
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-K1F5HMQTMH
```

#### Emulator Configuration
```
NEXT_PUBLIC_USE_EMULATOR=false
```

#### AI Provider APIs (Fallback Chain: Gemini → Groq → OpenRouter)
Copy from your .env.local file:
```
NEXT_PUBLIC_GEMINI_API_KEY=<your_gemini_api_key>
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash

NEXT_PUBLIC_GROQ_API_KEY=<your_groq_api_key>
NEXT_PUBLIC_GROQ_MODEL=qwen/qwen3.8-27b

NEXT_PUBLIC_OPENROUTER_API_KEY=<your_openrouter_api_key>
NEXT_PUBLIC_OPENROUTER_MODEL=poolside/laguna-s-2.1:free
```

#### Email Notifications (EmailJS)
Copy from your .env.local file:
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=<your_emailjs_service_id>
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=<your_emailjs_template_id>
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=<your_emailjs_public_key>
NEXT_PUBLIC_EMAILJS_PRIVATE_KEY=<your_emailjs_private_key>
```

### Step 5: Deploy
1. Click **"Deploy"** button
2. Wait for build to complete (~2-3 minutes)
3. Check build logs for any errors

### Step 6: Configure Custom Domain
After successful deployment:

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Domains"**
3. Click **"Add Domain"**
4. Enter: `sochi.vercel.app`
5. Click **"Add"**
6. Configure DNS (follow Vercel's instructions)

---

## Expected Deployment Features

✅ **Landing Page**
- Logo + Language Changer + Theme Toggle navbar
- Desktop: Text left, Form right in single frame
- Mobile: Text → Form → Text sandwich layout
- Professional minimal design

✅ **Authentication**
- Firebase authentication working
- Sign up / Sign in with email
- Multi-language support (EN/HI/MR)

✅ **User Features**
- Real-time complaints list
- Raise complaints with photos
- My Issues tracking
- Admin panel for staff
- Email notifications via EmailJS

✅ **Special Pages**
- Custom 404 Not Found page
- Custom offline page with auto-reconnect
- Smooth animations & transitions
- Dark/Light theme support

✅ **Performance**
- Static export optimized
- All keys are NEXT_PUBLIC_ (no API routes)
- PWA capable
- Mobile responsive

---

## Troubleshooting

### Build Fails
- Check that Root Directory is set to `./societydesk`
- Ensure all environment variables are added
- Check Node.js version is 20.x

### Deployment Shows Blank Page
- Clear browser cache
- Check that Firebase project is accessible
- Verify environment variables in Vercel dashboard

### Firebase Not Connecting
- Verify `NEXT_PUBLIC_FIREBASE_PROJECT_ID=zephr-society` is correct
- Check Firebase project has web app configured
- Ensure Firebase Firestore database exists

### Email Notifications Not Working
- Verify EmailJS service is active
- Check EmailJS credentials are correct
- Test from app's admin panel

### AI Replies Not Working
- Check API keys are valid
- Verify Gemini/Groq/OpenRouter accounts have credits
- Check API key permissions

---

## Post-Deployment Verification Checklist

- [ ] Website loads at sochi.vercel.app
- [ ] Landing page displays correctly
- [ ] Dark/Light theme toggle works
- [ ] Language selector works (EN/HI/MR)
- [ ] Login/Sign up form is functional
- [ ] Firebase authentication works
- [ ] Can submit complaints
- [ ] Email notifications send
- [ ] Custom 404 page appears for invalid routes
- [ ] Offline page works (test by disconnecting internet)
- [ ] Mobile responsive on all devices
- [ ] No console errors in DevTools

---

## Environment Variables Summary

| Variable | Type | Purpose |
|----------|------|---------|
| `NEXT_PUBLIC_FIREBASE_*` | Public | Firebase Firestore & Auth |
| `NEXT_PUBLIC_USE_EMULATOR` | Public | Firebase Emulator flag |
| `NEXT_PUBLIC_GEMINI_*` | Public | Google Gemini AI API |
| `NEXT_PUBLIC_GROQ_*` | Public | Groq AI API (fallback) |
| `NEXT_PUBLIC_OPENROUTER_*` | Public | OpenRouter AI (fallback) |
| `NEXT_PUBLIC_EMAILJS_*` | Public | EmailJS for notifications |

**All variables are NEXT_PUBLIC_ because this is a static Next.js export with no backend API routes.**

---

## Next Steps After Deployment

1. **Rename Repository** (Optional)
   - Go to GitHub Settings for Zephr_VC
   - Change repository name from "Zephr_VC" to "Sochi"
   - Vercel will automatically update connection

2. **Custom Domain** (Optional)
   - If you have a custom domain, add it in Vercel settings
   - Configure DNS records pointing to Vercel

3. **Analytics** (Optional)
   - Enable Vercel Analytics to track page views & performance

4. **Monitor Deployments**
   - Each push to master branch will trigger auto-deployment
   - Check Vercel dashboard for deployment logs

---

## Support & Debugging

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Build Logs:** Available in Vercel project → Deployments
- **Real-time Logs:** Vercel → Function Logs (if using serverless functions)

---

**Your Sochi app is now ready for production deployment! 🚀**

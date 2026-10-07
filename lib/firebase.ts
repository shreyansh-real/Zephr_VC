/**
 * Firebase Client SDK — Browser-side initialization
 *
 * Uses environment variables from .env.local (never committed).
 * Emulator mode: set NEXT_PUBLIC_USE_EMULATOR=true in .env.local.
 *
 * Singleton pattern — safe to import from any client component.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDemoDummyKeyForBuildVerification12345",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "zephr-society.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "zephr-society",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "zephr-society.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "950991779593",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:950991779593:web:e6261fcc00cc4d6dc245d8",
};

// Singleton: prevent re-initialization on hot-reloads in dev
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Firestore — persistent multi-tab cache for offline support (Spark plan friendly)
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  // Already initialized (hot-reload); grab existing instance
  db = getFirestore(app);
}
export { db };

// Storage
export const storage = getStorage(app);

// ── Emulator connection (dev only, EXPLICIT opt-in) ───────────────────────────
// Only connects when NEXT_PUBLIC_USE_EMULATOR="true" is set in .env.local
// Never auto-connects based on NODE_ENV to avoid accidental emulator connections
const USE_EMULATOR =
  process.env.NEXT_PUBLIC_USE_EMULATOR === "true" &&
  typeof window !== "undefined";

if (USE_EMULATOR) {
  try {
    const authAlreadyConnected = (auth as unknown as { _canInitEmulator?: boolean })._canInitEmulator === false;
    if (!authAlreadyConnected) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    }

    if (!(globalThis as unknown as Record<string, boolean>).__firestoreEmulatorConnected) {
      connectFirestoreEmulator(db, "localhost", 8080);
      (globalThis as unknown as Record<string, boolean>).__firestoreEmulatorConnected = true;
    }

    if (!(globalThis as unknown as Record<string, boolean>).__storageEmulatorConnected) {
      connectStorageEmulator(storage, "localhost", 9199);
      (globalThis as unknown as Record<string, boolean>).__storageEmulatorConnected = true;
    }
  } catch {
    // Emulator connect errors should not crash the app
  }
}

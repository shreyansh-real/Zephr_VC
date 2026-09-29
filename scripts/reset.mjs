// @ts-check
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function init() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing Firebase env vars.");
    process.exit(1);
  }
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

init();
const db = getFirestore();

async function deleteCollection(name) {
  const snap = await db.collection(name).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  console.log(`Deleted ${snap.size} docs from ${name}`);
}

async function reset() {
  console.log("Resetting...");
  await deleteCollection("clusters");
  await deleteCollection("complaints");
  await deleteCollection("volunteers");
  await deleteCollection("meta");
  console.log("Reset complete. Run `npm run seed` to reload demo data.");
  process.exit(0);
}

reset().catch(console.error);

// @ts-check
import * as admin from "firebase-admin";

function init() {
  if (admin.apps.length > 0) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing Firebase env vars.");
    process.exit(1);
  }
  admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
}

init();
const db = admin.firestore();

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

import { NextResponse } from "next/server";
import { getDb, Timestamp } from "@/lib/firebase-admin";
import { requirePasscode } from "@/lib/auth";
import { SendReplySchema } from "@/lib/schemas";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const guard = await requirePasscode();
  if (guard) return guard;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SendReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const db = getDb();
  const complaintsSnap = await db.collection("complaints").where("cluster_id", "==", id).get();

  if (complaintsSnap.empty) {
    return NextResponse.json({ error: "No complaints in cluster" }, { status: 404 });
  }

  const now = Timestamp.now();
  const batch = db.batch();

  for (const doc of complaintsSnap.docs) {
    batch.update(doc.ref, {
      draft_reply: parsed.data.reply_text,
      reply_sent_at: now,
    });
  }

  await batch.commit();

  return NextResponse.json({
    sent_count: complaintsSnap.docs.length,
    sent_at: now.toDate().toISOString(),
  });
}

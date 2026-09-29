import { NextResponse } from "next/server";
import Twilio from "twilio";
import { getDb, Timestamp } from "@/lib/firebase-admin";
import { requirePasscode } from "@/lib/auth";
import { SendLiveSchema } from "@/lib/schemas";

type Params = { params: Promise<{ id: string }> };

/** Mask all but last 4 digits of a phone number for safe logging / UI display. */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `****${digits.slice(-4)}`;
}

export async function POST(req: Request, { params }: Params) {
  // 1. Auth
  const guard = await requirePasscode();
  if (guard) return guard;

  // 2. Feature flag — hard gate on the server side too
  if (process.env.SEND_LIVE_WHATSAPP !== "true") {
    return NextResponse.json({ error: "Feature not enabled" }, { status: 403 });
  }

  // 3. Env vars
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886"

  if (!accountSid || !authToken || !from) {
    return NextResponse.json(
      { error: "Twilio is not configured on this server." },
      { status: 503 }
    );
  }

  // 4. Validate body
  const { id: clusterId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SendLiveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { complaintId, message } = parsed.data;

  // 5. Load complaint — verify it belongs to this cluster and has a phone
  const db = getDb();
  const complaintRef = db.collection("complaints").doc(complaintId);
  const complaintSnap = await complaintRef.get();

  if (!complaintSnap.exists) {
    return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  }

  const complaint = complaintSnap.data() as Record<string, unknown>;

  if (complaint.cluster_id !== clusterId) {
    return NextResponse.json({ error: "Complaint does not belong to this cluster" }, { status: 400 });
  }

  const rawPhone = complaint.phone as string | undefined;
  if (!rawPhone) {
    return NextResponse.json(
      { error: "Recipient has not provided a phone number (opt-in required)." },
      { status: 422 }
    );
  }

  // 6. Send via Twilio WhatsApp sandbox
  //    "whatsapp:+<E.164>" format required by Twilio
  const toNumber = rawPhone.startsWith("whatsapp:") ? rawPhone : `whatsapp:${rawPhone}`;

  const client = Twilio(accountSid, authToken);

  try {
    await client.messages.create({
      from,
      to: toNumber,
      body: message,
    });
  } catch (err: unknown) {
    // Never log authToken or full phone. Log only the error code/message.
    const twilioErr = err as { code?: number; message?: string };
    console.error(
      `[send-live] Twilio error for complaint ${complaintId}: code=${twilioErr.code ?? "?"} msg=${twilioErr.message ?? "unknown"}`
    );
    return NextResponse.json(
      {
        error: "Twilio delivery failed",
        detail: twilioErr.message ?? "Unknown error",
      },
      { status: 502 }
    );
  }

  // 7. Stamp reply_sent_at on the complaint
  const now = Timestamp.now();
  await complaintRef.update({ reply_sent_at: now });

  return NextResponse.json({
    sent: true,
    masked_phone: maskPhone(rawPhone),
    sent_at: now.toDate().toISOString(),
  });
}

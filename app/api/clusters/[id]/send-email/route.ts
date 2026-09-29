import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { getDb, Timestamp } from "@/lib/firebase-admin";
import { requirePasscode } from "@/lib/auth";
import { SendEmailSchema } from "@/lib/schemas";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  // 1. Auth check
  const guard = await requirePasscode();
  if (guard) return guard;

  const { id: clusterId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SendEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { complaintId, message, subject } = parsed.data;
  const db = getDb();

  // 2. Fetch cluster info for email title
  const clusterSnap = await db.collection("clusters").doc(clusterId).get();
  const clusterData = clusterSnap.exists ? clusterSnap.data() : null;
  const clusterTitle = (clusterData?.title as string) || "Society Complaint Update";

  // 3. Query target complaints
  let query = db.collection("complaints").where("cluster_id", "==", clusterId);
  const complaintsSnap = await query.get();

  if (complaintsSnap.empty) {
    return NextResponse.json({ error: "No complaints found in this cluster" }, { status: 404 });
  }

  let targetDocs = complaintsSnap.docs;
  if (complaintId) {
    targetDocs = targetDocs.filter((d) => d.id === complaintId);
    if (targetDocs.length === 0) {
      return NextResponse.json({ error: "Specified complaint not found in this cluster" }, { status: 404 });
    }
  }

  // Filter for docs with valid emails
  const recipients: Array<{ id: string; email: string; name: string; flat: string; ref: FirebaseFirestore.DocumentReference }> = [];
  for (const doc of targetDocs) {
    const data = doc.data();
    if (data.email && typeof data.email === "string" && data.email.includes("@")) {
      recipients.push({
        id: doc.id,
        email: data.email.trim(),
        name: (data.resident_name as string) || "Resident",
        flat: (data.flat_no as string) || "",
        ref: doc.ref,
      });
    }
  }

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No residents in this cluster have provided an email address." },
      { status: 400 }
    );
  }

  // 4. Send email via Gmail Nodemailer or Resend
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const resendApiKey = process.env.RESEND_API_KEY;

  const emailSubject = subject || `Update: ${clusterTitle}`;
  let successCount = 0;
  const sentEmails: string[] = [];

  if (gmailUser && gmailPass) {
    // ── Primary: Direct Gmail SMTP via Nodemailer ──
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    for (const recipient of recipients) {
      try {
        const htmlBody = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <div style="margin-bottom: 20px;">
              <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Society Committee Update</span>
              <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 6px 0 0 0;">${clusterTitle}</h2>
            </div>
            <p style="font-size: 15px; color: #374151; margin-bottom: 16px;">Hello <strong>${recipient.name}</strong> (Flat ${recipient.flat}),</p>
            <div style="background-color: #f9fafb; border-left: 4px solid #111827; padding: 16px; border-radius: 6px; font-size: 15px; line-height: 1.6; color: #1f2937; margin-bottom: 20px; white-space: pre-wrap;">${message}</div>
            <p style="font-size: 13px; color: #9ca3af; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">Sent by your Society Management Committee via Sochi.</p>
          </div>
        `;

        await transporter.sendMail({
          from: `"Sochi Society Committee" <${gmailUser}>`,
          to: recipient.email,
          subject: emailSubject,
          text: `Hello ${recipient.name} (Flat ${recipient.flat}),\n\n${message}\n\n— Society Management Committee`,
          html: htmlBody,
        });

        successCount++;
        sentEmails.push(recipient.email);
      } catch (err) {
        console.error(`[Gmail SMTP] Failed to send email to ${recipient.email}:`, err);
      }
    }
  } else if (resendApiKey) {
    // ── Secondary: Resend fallback if configured ──
    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Sochi Society <onboarding@resend.dev>";

    for (const recipient of recipients) {
      try {
        const htmlBody = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <div style="margin-bottom: 20px;">
              <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Society Committee Update</span>
              <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 6px 0 0 0;">${clusterTitle}</h2>
            </div>
            <p style="font-size: 15px; color: #374151; margin-bottom: 16px;">Hello <strong>${recipient.name}</strong> (Flat ${recipient.flat}),</p>
            <div style="background-color: #f9fafb; border-left: 4px solid #111827; padding: 16px; border-radius: 6px; font-size: 15px; line-height: 1.6; color: #1f2937; margin-bottom: 20px; white-space: pre-wrap;">${message}</div>
            <p style="font-size: 13px; color: #9ca3af; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">Sent by your Society Management Committee via Sochi.</p>
          </div>
        `;

        await resend.emails.send({
          from: fromEmail,
          to: recipient.email,
          subject: emailSubject,
          text: `Hello ${recipient.name} (Flat ${recipient.flat}),\n\n${message}\n\n— Society Management Committee`,
          html: htmlBody,
        });

        successCount++;
        sentEmails.push(recipient.email);
      } catch (err) {
        console.error(`[Resend] Failed to send email to ${recipient.email}:`, err);
      }
    }
  } else {
    // ── Dev simulation mode when no keys are provided yet ──
    console.log(`[Dev Send-Email] GMAIL_USER / GMAIL_APP_PASSWORD not set. Simulated sending to:`, recipients.map((r) => r.email));
    successCount = recipients.length;
    sentEmails.push(...recipients.map((r) => r.email));
  }

  // 5. Update Firestore timestamps
  const now = Timestamp.now();
  const batch = db.batch();
  for (const recipient of recipients) {
    if (sentEmails.includes(recipient.email)) {
      batch.update(recipient.ref, {
        draft_reply: message,
        reply_sent_at: now,
      });
    }
  }
  await batch.commit();

  return NextResponse.json({
    sent: true,
    sent_count: successCount,
    recipients: sentEmails,
    sent_at: now.toDate().toISOString(),
    is_simulated: !gmailUser && !resendApiKey,
  });
}

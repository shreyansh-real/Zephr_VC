/**
 * Email notifications via EmailJS (client-side, no backend required).
 *
 * Sends alerts for high/critical complaints to all active staff members
 * (admin + volunteer) of the society simultaneously.
 *
 * Sender name: "Sochi"
 * Free tier: 200 emails/month
 */

import emailjs from "@emailjs/browser";

const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  ?? "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  ?? "";

export interface AlertPayload {
  societyName: string;
  complaintTitle: string;
  complaintDescription: string;
  priority: "high" | "critical";
  category: string;
  raisedBy: string;
  unitId: string | null;
  recipientEmails: string[]; // all active admin + volunteer emails from Firestore
}

/**
 * Send a Sochi-branded email alert to every staff member when a high/critical
 * complaint is raised. Sends one email per recipient so each person sees their
 * own name in the To field. Silently swallows errors — never blocks submission.
 */
export async function sendHighPriorityAlert(payload: AlertPayload): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("EmailJS keys not set — skipping email notification.");
    return;
  }

  const validEmails = payload.recipientEmails.filter(Boolean);
  if (validEmails.length === 0) {
    console.warn("No staff emails found — skipping email notification.");
    return;
  }

  const priorityLabel = payload.priority === "critical" ? "CRITICAL" : "HIGH";

  // Send one email per recipient (EmailJS free tier doesn't support bulk To)
  const sends = validEmails.map((email) =>
    emailjs
      .send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_email:        email,
          society_name:    payload.societyName,
          complaint_title: payload.complaintTitle,
          description:     payload.complaintDescription,
          priority:        priorityLabel,
          category:        payload.category,
          raised_by:       payload.raisedBy,
          unit_id:         payload.unitId ?? "General",
        },
        { publicKey: PUBLIC_KEY }
      )
      .catch((err) => {
        // Log but never surface to user
        console.error(`EmailJS failed for ${email}:`, err);
      })
  );

  // Fire all sends in parallel, don't await — non-blocking
  Promise.allSettled(sends).then((results) => {
    const ok  = results.filter((r) => r.status === "fulfilled").length;
    const err = results.filter((r) => r.status === "rejected").length;
    console.log(`EmailJS: ${ok} sent, ${err} failed out of ${validEmails.length} staff`);
  });
}

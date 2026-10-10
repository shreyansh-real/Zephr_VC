/**
 * Email notifications via EmailJS (client-side, no backend required).
 *
 * Sends Sochi-branded alerts for high/critical complaints to all active
 * staff members (admin + volunteer) of the SAME SOCIETY ONLY.
 *
 * Sender name: "Sochi"
 * Short, clear format
 * Free tier: 200 emails/month
 */

const SERVICE_ID   = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID   ?? "";
const TEMPLATE_ID  = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID  ?? "";
const PUBLIC_KEY   = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY   ?? "";
const PRIVATE_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PRIVATE_KEY  ?? "";

export interface AlertPayload {
  societyName: string;
  complaintTitle: string;
  complaintDescription: string;
  priority: "high" | "critical";
  category: string;
  raisedBy: string;
  unitId: string | null;
  recipientEmails: string[]; // all active admin + volunteer emails from SAME society only
  recipientNames?: Record<string, string>; // optional: email → name mapping
}

/**
 * Send a Sochi-branded email alert to every staff member of a society
 * when a high/critical complaint is raised.
 *
 * IMPORTANT: This only sends to members of the SAME SOCIETY.
 * The recipientEmails list is already filtered in raise-complaint-form.tsx
 * to only include admins/volunteers from currentSocietyId.
 *
 * Uses EmailJS REST API with private key for strict-mode accounts.
 * Fully non-blocking — never throws, never delays complaint submission.
 */
export async function sendHighPriorityAlert(payload: AlertPayload): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("[Sochi Email] EmailJS keys not configured — skipping.");
    return;
  }

  const validEmails = payload.recipientEmails.filter(Boolean);
  if (validEmails.length === 0) {
    console.warn("[Sochi Email] No staff emails found — skipping.");
    return;
  }

  const priorityLabel = payload.priority === "critical" ? "CRITICAL" : "HIGH";

  // Send one request per recipient in parallel
  const sends = validEmails.map((email) => {
    // Get recipient name if available
    const recipientName = payload.recipientNames?.[email] || "Staff Member";

    // Short, clear email body
    const emailBody = `Hi ${recipientName},

A new ${priorityLabel} complaint needs your attention in ${payload.societyName}.

Title: ${payload.complaintTitle}
Category: ${payload.category}
From: ${payload.raisedBy} (Unit: ${payload.unitId || "General"})

Description:
${payload.complaintDescription}

---
Log in to your dashboard to review: https://societydesk.app
This complaint is visible only to ${payload.societyName} staff.

© 2026 Sochi. All rights reserved.`;

    const body: Record<string, unknown> = {
      service_id:  SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id:     PUBLIC_KEY,
      template_params: {
        to_email:        email,
        from_name:       "Sochi",
        subject:         `[${priorityLabel}] ${payload.complaintTitle} — ${payload.societyName}`,
        society_name:    payload.societyName,
        complaint_title: payload.complaintTitle,
        description:     emailBody,
        priority:        priorityLabel,
        category:        payload.category,
        raised_by:       payload.raisedBy,
        unit_id:         payload.unitId ?? "General",
        recipient_name:  recipientName,
      },
    };

    // Include private key if configured (required for strict mode)
    if (PRIVATE_KEY) {
      body.accessToken = PRIVATE_KEY;
    }

    return fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        const text = await res.text();
        if (res.ok) {
          console.log(`[Sochi Email] ✓ Sent to ${email} (${recipientName})`);
        } else {
          console.error(`[Sochi Email] ✗ Failed for ${email} — ${res.status}: ${text}`);
        }
      })
      .catch((err) => {
        console.error(`[Sochi Email] Network error for ${email}:`, err);
      });
  });

  // Fire all in parallel without blocking complaint submission
  Promise.allSettled(sends).then((results) => {
    const ok  = results.filter((r) => r.status === "fulfilled").length;
    const err = results.filter((r) => r.status === "rejected").length;
    console.log(
      `[Sochi Email] Batch complete — ${ok}/${validEmails.length} sent successfully` +
      (err > 0 ? `, ${err} failed` : "")
    );
  });
}

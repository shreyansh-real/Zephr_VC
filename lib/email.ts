/**
 * Client-side email notifications via Resend API.
 *
 * Sends alerts for high/critical complaints to all staff members (admin + volunteer)
 * of the society. Called directly from the browser — no backend required.
 *
 * Free tier note: Resend's free plan allows sending from "onboarding@resend.dev"
 * without domain verification. Add your own domain in the Resend dashboard later.
 */

const RESEND_API_KEY = process.env.NEXT_PUBLIC_RESEND_API_KEY ?? "";
const FROM_ADDRESS = "SocietyDesk <onboarding@resend.dev>";

export interface AlertPayload {
  societyName: string;
  complaintTitle: string;
  complaintDescription: string;
  priority: "high" | "critical";
  category: string;
  raisedBy: string;    // display name of the resident
  unitId: string | null;
  recipientEmails: string[];  // staff emails fetched from Firestore
}

/**
 * Send an email alert to all staff when a high/critical complaint is raised.
 * Silently swallows errors so a failed email never blocks complaint submission.
 */
export async function sendHighPriorityAlert(payload: AlertPayload): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("NEXT_PUBLIC_RESEND_API_KEY is not set — skipping email notification.");
    return;
  }

  const validEmails = payload.recipientEmails.filter(Boolean);
  if (validEmails.length === 0) return;

  const priorityLabel = payload.priority === "critical" ? "CRITICAL" : "HIGH";
  const priorityColor = payload.priority === "critical" ? "#dc2626" : "#ea580c";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New ${priorityLabel} Complaint — ${payload.societyName}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#fffcf6;border:1px solid #d3cbba;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:${priorityColor};padding:20px 28px;">
              <p style="margin:0;color:#fff;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">
                SocietyDesk · ${payload.societyName}
              </p>
              <h1 style="margin:6px 0 0;color:#fff;font-size:22px;font-weight:900;line-height:1.2;">
                ${priorityLabel} Priority Complaint
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Priority chip -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <span style="display:inline-block;background:${priorityColor}22;border:1px solid ${priorityColor};border-radius:6px;padding:4px 10px;font-size:11px;font-weight:800;color:${priorityColor};text-transform:uppercase;letter-spacing:0.08em;">
                      ${priorityLabel}
                    </span>
                    <span style="display:inline-block;margin-left:8px;background:#f5f0e8;border:1px solid #d3cbba;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;color:#5f5b51;text-transform:capitalize;">
                      ${payload.category}
                    </span>
                  </td>
                </tr>

                <!-- Title -->
                <tr>
                  <td style="padding-bottom:8px;">
                    <p style="margin:0;font-size:11px;font-weight:800;color:#5f5b51;text-transform:uppercase;letter-spacing:0.08em;">Complaint Title</p>
                    <p style="margin:4px 0 0;font-size:18px;font-weight:900;color:#1a1a18;line-height:1.3;">${payload.complaintTitle}</p>
                  </td>
                </tr>

                <!-- Description -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0;font-size:11px;font-weight:800;color:#5f5b51;text-transform:uppercase;letter-spacing:0.08em;padding-top:12px;">Description</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a18;line-height:1.5;">${payload.complaintDescription}</p>
                  </td>
                </tr>

                <!-- Meta row -->
                <tr>
                  <td style="background:#f5f0e8;border-radius:8px;padding:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-bottom:10px;">
                          <p style="margin:0;font-size:11px;font-weight:800;color:#5f5b51;text-transform:uppercase;">Raised By</p>
                          <p style="margin:2px 0 0;font-size:13px;font-weight:700;color:#1a1a18;">${payload.raisedBy}</p>
                        </td>
                        <td width="50%" style="padding-bottom:10px;">
                          <p style="margin:0;font-size:11px;font-weight:800;color:#5f5b51;text-transform:uppercase;">Unit</p>
                          <p style="margin:2px 0 0;font-size:13px;font-weight:700;color:#1a1a18;">${payload.unitId ?? "General"}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <p style="margin:0;font-size:11px;font-weight:800;color:#5f5b51;text-transform:uppercase;">Society</p>
                          <p style="margin:2px 0 0;font-size:13px;font-weight:700;color:#1a1a18;">${payload.societyName}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding-top:24px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#5f5b51;">Log in to SocietyDesk to acknowledge and track this complaint.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #d3cbba;padding:16px 28px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#5f5b51;">
                SocietyDesk · Automated alert for staff members of ${payload.societyName}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: validEmails,
        subject: `[${priorityLabel}] ${payload.complaintTitle} — ${payload.societyName}`,
        html,
      }),
    });
  } catch (err) {
    // Never let email failure surface to the user
    console.error("Email notification failed (non-blocking):", err);
  }
}

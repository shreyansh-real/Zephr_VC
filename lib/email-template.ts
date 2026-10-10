/**
 * HTML Email Template Generator
 * Creates beautifully formatted Sochi-branded complaint alerts
 * Matches Design.md color palette and typography
 */

export interface EmailTemplateParams {
  societyName: string;
  complaintTitle: string;
  description: string;
  priority: "high" | "critical";
  category: string;
  raisedBy: string;
  unitId: string | null;
  recipientName?: string;
}

export function generateComplaintEmailHTML(
  params: EmailTemplateParams
): string {
  const {
    societyName,
    complaintTitle,
    description,
    priority,
    category,
    raisedBy,
    unitId,
    recipientName = "Staff Member",
  } = params;

  const isPriorityCritical = priority === "critical";
  const priorityColor = isPriorityCritical ? "#d62f1f" : "#b8600e";
  const priorityBgColor = isPriorityCritical ? "#fbe3df" : "#f8e6d0";
  const priorityLabel = isPriorityCritical ? "CRITICAL" : "HIGH";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Arial", sans-serif;
      line-height: 1.6;
      color: #1a1a18;
      background-color: #f5f0e8;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fffcf6;
      border: 1px solid #d3cbba;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(26, 26, 24, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #f5f0e8 0%, #efe9dc 100%);
      padding: 24px;
      border-bottom: 1px solid #d3cbba;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-logo {
      width: 36px;
      height: 36px;
      background-color: #1137DE;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 900;
      font-size: 20px;
    }
    .header-title {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a18;
      letter-spacing: -0.3px;
    }
    .priority-banner {
      background-color: ${priorityBgColor};
      border-left: 4px solid ${priorityColor};
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .priority-badge {
      background-color: ${priorityColor};
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .priority-text {
      font-size: 13px;
      font-weight: 600;
      color: ${priorityColor};
    }
    .content {
      padding: 28px 24px;
    }
    .greeting {
      font-size: 14px;
      color: #5f5b51;
      margin-bottom: 20px;
    }
    .complaint-card {
      background-color: #f5f0e8;
      border: 1px solid #d3cbba;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .complaint-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }
    .complaint-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a18;
      flex: 1;
      line-height: 1.4;
    }
    .category-badge {
      display: inline-block;
      background-color: #dde3fa;
      color: #1137DE;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .complaint-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #efe9dc;
      font-size: 13px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .meta-label {
      color: #5f5b51;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.3px;
    }
    .meta-value {
      color: #1a1a18;
      font-weight: 600;
    }
    .description-section {
      margin-bottom: 24px;
    }
    .section-label {
      font-size: 12px;
      font-weight: 700;
      color: #5f5b51;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
    }
    .description-text {
      background-color: #fffcf6;
      border-left: 3px solid #1137DE;
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.6;
      color: #1a1a18;
    }
    .action-section {
      background-color: #f5f0e8;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin-bottom: 24px;
    }
    .action-text {
      font-size: 13px;
      color: #5f5b51;
      margin-bottom: 12px;
    }
    .action-button {
      display: inline-block;
      background-color: #1137DE;
      color: #ffffff;
      padding: 10px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: -0.2px;
    }
    .footer {
      background-color: #f5f0e8;
      border-top: 1px solid #d3cbba;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #5f5b51;
    }
    .footer-society {
      font-weight: 600;
      color: #1a1a18;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header with Sochi branding -->
    <div class="header">
      <div class="header-logo">S</div>
      <div class="header-title">Sochi</div>
    </div>

    <!-- Priority banner -->
    <div class="priority-banner">
      <div class="priority-badge">${priorityLabel}</div>
      <div class="priority-text">New ${priorityLabel} Priority Complaint</div>
    </div>

    <!-- Main content -->
    <div class="content">
      <!-- Greeting -->
      <div class="greeting">
        Hello ${recipientName},<br>
        A new complaint requiring immediate attention has been filed in <strong>${societyName}</strong>.
      </div>

      <!-- Complaint card -->
      <div class="complaint-card">
        <div class="complaint-header">
          <div class="complaint-title">${complaintTitle}</div>
          <div class="category-badge">${category}</div>
        </div>

        <!-- Metadata -->
        <div class="complaint-meta">
          <div class="meta-item">
            <div class="meta-label">Filed By</div>
            <div class="meta-value">${raisedBy}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Unit / Area</div>
            <div class="meta-value">${unitId || "General"}</div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="description-section">
        <div class="section-label">Details</div>
        <div class="description-text">${description.replace(
          /\n/g,
          "<br>"
        )}</div>
      </div>

      <!-- Call to action -->
      <div class="action-section">
        <div class="action-text">Review and respond to this complaint in your dashboard.</div>
        <a href="https://societydesk.app" class="action-button">Open Dashboard</a>
      </div>

      <!-- Note -->
      <div class="section-label" style="margin-bottom: 8px;">Note</div>
      <p style="font-size: 12px; color: #5f5b51; line-height: 1.5;">
        This is an automated notification from <strong>Sochi</strong>. You received this email because you are an admin or volunteer for <strong>${societyName}</strong>. Only admins and volunteers of this society can see this complaint.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-society">${societyName}</div>
      <div>Powered by Sochi — Transparent Housing Society Management</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

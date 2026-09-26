import { Resend } from 'resend';

const FIREBASE_API_KEY =
  process.env.FIREBASE_API_KEY ||
  process.env.VITE_FIREBASE_API_KEY ||
  'AIzaSyDudcuIRHOs889JEu0XyySoxvAMPf97ExA';

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  'khushimakeuparts865';

/**
 * Unwraps Firestore REST API typed values into plain JavaScript objects.
 */
function unwrapFirestoreFields(fields?: Record<string, any>): Record<string, any> {
  if (!fields) return {};
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if (val === null || val === undefined) {
      result[key] = null;
    } else if ('stringValue' in val) {
      result[key] = val.stringValue;
    } else if ('booleanValue' in val) {
      result[key] = val.booleanValue;
    } else if ('integerValue' in val) {
      result[key] = Number(val.integerValue);
    } else if ('doubleValue' in val) {
      result[key] = Number(val.doubleValue);
    } else if ('timestampValue' in val) {
      result[key] = val.timestampValue;
    } else if ('mapValue' in val) {
      result[key] = unwrapFirestoreFields(val.mapValue.fields);
    } else if ('nullValue' in val) {
      result[key] = null;
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Masks an email for safe logging (e.g. j***@example.com) to prevent PII exposure in server logs.
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
  return `${maskedLocal}@${domain}`;
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    // 1. Extract Bearer Token from Authorization Header
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const match = authHeader.match(/^Bearer\s+(.*)$/i);
    const idToken = match ? match[1].trim() : null;

    if (!idToken) {
      return res.status(401).json({
        error: 'Unauthorized: Missing or invalid Authorization Bearer header.',
      });
    }

    // 2. Authoritatively verify Firebase ID token using Google Identity Toolkit API
    const lookupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`;
    const lookupRes = await fetch(lookupUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!lookupRes.ok) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or expired Firebase ID token.',
      });
    }

    const lookupData = await lookupRes.json();
    const verifiedUser = lookupData.users?.[0];
    const callerUid = verifiedUser?.localId;
    const callerEmail = verifiedUser?.email?.toLowerCase().trim();

    if (!callerUid) {
      return res.status(401).json({
        error: 'Unauthorized: Unable to verify user identity.',
      });
    }

    // 3. Authorize exclusively through the authenticated Firebase UID and the authoritative
    //    /users/{uid} Firestore profile with role === 'developer'.
    //    Does NOT rely on VITE_MASTER_DEVELOPER_EMAIL or server-side email lists.
    const firestoreBase = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
    const userDocUrl = `${firestoreBase}/users/${encodeURIComponent(callerUid)}`;

    const userDocRes = await fetch(userDocUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    if (!userDocRes.ok) {
      return res.status(403).json({
        error: 'Forbidden: Authoritative developer record not found.',
      });
    }

    const userDocData = await userDocRes.json();
    const userProfile = unwrapFirestoreFields(userDocData.fields);

    if (userProfile.role !== 'developer') {
      console.warn(`[API Send-Invitation] Caller ${callerUid} (${maskEmail(callerEmail || 'unknown')}) lacks active developer role in Firestore.`);
      return res.status(403).json({
        error: 'Forbidden: Caller is not an authorized platform developer.',
      });
    }

    // 4. Parse request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { invitationId, origin } = body || {};

    if (!invitationId || typeof invitationId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid required field: invitationId' });
    }

    // 5. Read the invitation record from Firestore REST API using caller's authenticated ID token
    // Protected by Firestore Security Rules: only developer or recipient can read
    const inviteUrl = `${firestoreBase}/tenant_invitations/${encodeURIComponent(invitationId)}`;
    const inviteRes = await fetch(inviteUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    if (!inviteRes.ok) {
      return res.status(404).json({
        error: `Invitation "${invitationId}" was not found or is inaccessible.`,
      });
    }

    const inviteDoc = await inviteRes.json();
    const invitation = unwrapFirestoreFields(inviteDoc.fields);

    // 7. Strict Invitation Status & Expiration Validation
    // Rejects revoked, expired, accepted, or tampered invitations
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        error: `Cannot send invitation: status is "${invitation.status}" (must be "pending").`,
      });
    }

    if (invitation.expiresAt) {
      const expiresMs = new Date(invitation.expiresAt).getTime();
      if (Date.now() > expiresMs) {
        return res.status(400).json({
          error: 'Cannot send invitation: the invitation has already expired.',
        });
      }
    }

    const recipientEmail = invitation.invitedOwnerEmail?.trim();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({
        error: 'Invitation record is missing a valid recipient email address.',
      });
    }

    if (!invitation.clientId) {
      return res.status(400).json({
        error: 'Invitation record is missing target tenant clientId.',
      });
    }

    // 8. Secure Token Handling:
    // ALWAYS use the authoritative token stored in the Firestore document.
    // NEVER trust caller-supplied tokens. NEVER log the token.
    const authoritativeToken = invitation.token;
    if (!authoritativeToken) {
      return res.status(500).json({
        error: 'Invitation record is corrupted: missing secure token.',
      });
    }

    // 9. Read tenant name for email presentation
    let tenantName = invitation.clientId;
    try {
      const clientUrl = `${firestoreBase}/clients/${encodeURIComponent(invitation.clientId)}`;
      const clientRes = await fetch(clientUrl, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (clientRes.ok) {
        const clientDoc = await clientRes.json();
        const clientData = unwrapFirestoreFields(clientDoc.fields);
        if (clientData.name) {
          tenantName = clientData.name;
        }
      }
    } catch {
      // Non-fatal fallback to clientId
    }

    // 10. Construct secure invitation URL
    const appBaseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://khushimakeuparts865.web.app';
    const cleanOrigin = appBaseUrl.replace(/\/+$/, '');
    const inviteUrlLink = `${cleanOrigin}/?inviteId=${encodeURIComponent(invitationId)}&token=${encodeURIComponent(authoritativeToken)}&client=${encodeURIComponent(invitation.clientId)}`;

    // 11. Check Resend API Key (Server-Side Only)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({
        error: 'RESEND_API_KEY environment variable is not configured on the server.',
        code: 'MISSING_RESEND_KEY',
      });
    }

    // 12. Send transactional invitation email via Resend
    const resend = new Resend(resendApiKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'AuraOS Platform <onboarding@resend.dev>';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claim Your Salon Workspace on AuraOS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f080c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5e6eb;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f080c; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1a0e1c; border-radius: 24px; border: 1px solid rgba(168, 85, 247, 0.3); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #2b112f 0%, #150917 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="display: inline-block; padding: 8px 18px; border-radius: 9999px; background-color: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); color: #d8b4fe; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">
                Platform Onboarding Invitation
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Welcome to AuraOS
              </h1>
              <p style="margin: 10px 0 0; font-size: 14px; color: rgba(245, 230, 235, 0.7);">
                You have been invited to claim and manage <strong style="color: #fce7f3;">${escapeHtml(tenantName)}</strong>
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 40px;">
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #f5e6eb;">
                Hello,
              </p>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: rgba(245, 230, 235, 0.85);">
                A private, high-performance salon workspace has been provisioned for <strong>${escapeHtml(tenantName)}</strong> on the AuraOS multi-tenant bridal & salon platform.
              </p>

              <!-- Tenant Details Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(0, 0, 0, 0.35); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; margin: 24px 0; padding: 20px;">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #c084fc; font-weight: 600;">Salon Workspace:</span>
                    <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-top: 2px;">${escapeHtml(tenantName)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #c084fc; font-weight: 600;">Authorized Owner Account:</span>
                    <div style="font-size: 14px; font-weight: 600; color: #fdf2f8; margin-top: 2px;">${escapeHtml(recipientEmail)}</div>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #fde68a;">
                  <strong>Important:</strong> To claim ownership, you must sign in using <strong>Google Sign-In</strong> with the email address above (<strong>${escapeHtml(recipientEmail)}</strong>). The tenant will remain inactive until you accept this invitation.
                </p>
              </div>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${inviteUrlLink}" target="_blank" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #9333ea 0%, #d97706 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 14px; box-shadow: 0 10px 25px -5px rgba(147, 51, 234, 0.5); text-align: center; border: 1px solid rgba(255, 255, 255, 0.2);">
                      Claim & Activate Workspace &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 12px; line-height: 1.6; color: rgba(245, 230, 235, 0.5); text-align: center;">
                If the button above does not work, copy and paste this link into your browser:<br>
                <a href="${inviteUrlLink}" style="color: #c084fc; word-break: break-all; font-size: 11px;">${inviteUrlLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: rgba(0, 0, 0, 0.4); border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; color: rgba(245, 230, 235, 0.5);">
                This single-use invitation link expires in 72 hours.
              </p>
              <p style="margin: 0; font-size: 11px; color: rgba(245, 230, 235, 0.35);">
                &copy; 2026 AuraOS Platform &bull; Automated Delivery
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

    const textContent = `
Welcome to AuraOS Platform!

You have been invited to claim and manage the salon workspace for "${tenantName}".

To activate your workspace:
1. Open this link: ${inviteUrlLink}
2. Sign in with Google using: ${recipientEmail}
3. Click "Accept Invitation & Activate Tenant"

Important: You must sign in with the invited Google account (${recipientEmail}). This single-use link expires in 72 hours.

AuraOS Platform
    `.trim();

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      subject: `Claim your salon workspace for ${tenantName} on AuraOS`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error('[API Send-Invitation] Resend API Error:', error.message);
      return res.status(502).json({
        error: `Failed to deliver email via Resend: ${error.message}`,
        details: error,
      });
    }

    // Token is NEVER logged. Recipient email is masked in logs.
    console.log(`[API Send-Invitation] Dispatched email for invitation ${invitationId} (client: ${invitation.clientId}) to ${maskEmail(recipientEmail)}, Resend messageId: ${data?.id}`);
    return res.status(200).json({
      success: true,
      messageId: data?.id,
      recipientEmail,
      clientId: invitation.clientId,
    });
  } catch (err: any) {
    console.error('[API Send-Invitation] Unhandled error:', err?.message || err);
    return res.status(500).json({
      error: err?.message || 'Internal server error while processing invitation email.',
    });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

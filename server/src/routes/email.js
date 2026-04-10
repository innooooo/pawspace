const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'PawSpace <notifications@pawspace.co.ke>';

/**
 * Send an email — fails silently so email errors never break API responses.
 */
async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email:', subject);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    console.log(`[email] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error('[email] Failed to send:', err?.message ?? err);
  }
}

// ── Templates ────────────────────────────────────────────────────────────────

function baseTemplate(content) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>PawSpace</title>
    </head>
    <body style="margin:0;padding:0;background:#FFF8F0;font-family:Nunito,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:32px 0;">
        <tr><td align="center">
          <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:#FF6B35;padding:24px 32px;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                  🐾 PawSpace
                </h1>
                <p style="margin:4px 0 0;color:#ffe8de;font-size:13px;">
                  Connecting pets with loving homes in Nairobi
                </p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                ${content}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:16px 32px;border-top:1px solid #f0e8e0;">
                <p style="margin:0;font-size:12px;color:#999;text-align:center;">
                  PawSpace · Nairobi, Kenya<br/>
                  You're receiving this because you have an account on PawSpace.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Notify pet owner that someone expressed interest in their pet.
 */
async function notifyOwnerOfInterest({ ownerEmail, ownerName, adopterName, petName, petId, message }) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const petUrl = `${appUrl}/pet/${petId}`;

  const content = `
    <h2 style="margin:0 0 8px;color:#6B3F2A;font-size:20px;font-weight:800;">
      Someone wants to adopt ${petName}! 🎉
    </h2>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      Hi ${ownerName}, <strong>${adopterName}</strong> has expressed interest in adopting <strong>${petName}</strong>.
    </p>
    ${message ? `
    <div style="background:#FFF8F0;border-left:3px solid #FF6B35;padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 20px;">
      <p style="margin:0;font-size:13px;color:#444;font-style:italic;">"${message}"</p>
    </div>
    ` : ''}
    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
      Log in to view their profile and accept or decline the request.
    </p>
    <a href="${petUrl}" style="display:inline-block;background:#FF6B35;color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:50px;text-decoration:none;">
      View Interest Request →
    </a>
  `;

  await sendEmail({
    to: ownerEmail,
    subject: `${adopterName} wants to adopt ${petName} 🐾`,
    html: baseTemplate(content),
  });
}

/**
 * Notify adopter that their interest was accepted.
 */
async function notifyAdopterAccepted({ adopterEmail, adopterName, ownerName, ownerPhone, ownerEmail: ownerEmailAddr, petName, petId }) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const petUrl = `${appUrl}/pet/${petId}`;

  const content = `
    <h2 style="margin:0 0 8px;color:#4CAF82;font-size:20px;font-weight:800;">
      Great news! Your interest was accepted 🎊
    </h2>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      Hi ${adopterName}, <strong>${ownerName}</strong> has accepted your interest in adopting <strong>${petName}</strong>!
    </p>
    <p style="color:#555;line-height:1.6;margin:0 0 8px;">
      You can now reach the owner to arrange a meeting:
    </p>
    <div style="background:#f0faf5;border-radius:12px;padding:16px;margin:0 0 24px;">
      <p style="margin:0 0 6px;font-size:14px;color:#333;">
        📧 <strong>Email:</strong> <a href="mailto:${ownerEmailAddr}" style="color:#FF6B35;">${ownerEmailAddr}</a>
      </p>
      ${ownerPhone ? `
      <p style="margin:0;font-size:14px;color:#333;">
        📱 <strong>Phone/WhatsApp:</strong> ${ownerPhone}
      </p>
      ` : ''}
    </div>
    <p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 24px;">
      Please arrange an in-person meeting before completing the adoption.
      Make sure ${petName} is a good fit for your home and lifestyle. 🐾
    </p>
    <a href="${petUrl}" style="display:inline-block;background:#4CAF82;color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:50px;text-decoration:none;">
      View ${petName}'s Profile →
    </a>
  `;

  await sendEmail({
    to: adopterEmail,
    subject: `Your adoption request for ${petName} was accepted! 🎊`,
    html: baseTemplate(content),
  });
}

/**
 * Notify adopter that their interest was rejected.
 */
async function notifyAdopterRejected({ adopterEmail, adopterName, petName, petId }) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const feedUrl = `${appUrl}/feed`;

  const content = `
    <h2 style="margin:0 0 8px;color:#6B3F2A;font-size:20px;font-weight:800;">
      Update on your adoption request
    </h2>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      Hi ${adopterName}, unfortunately the owner of <strong>${petName}</strong> is not able to proceed 
      with your adoption request at this time.
    </p>
    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
      Don't be discouraged — there are many other pets in Nairobi looking for a loving home. 
      Keep browsing and you'll find your perfect companion! 🐾
    </p>
    <a href="${feedUrl}" style="display:inline-block;background:#FF6B35;color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:50px;text-decoration:none;">
      Browse More Pets →
    </a>
  `;

  await sendEmail({
    to: adopterEmail,
    subject: `Update on your adoption request for ${petName}`,
    html: baseTemplate(content),
  });
}

/**
 * Welcome email on registration.
 */
async function notifyWelcome({ email, name }) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  const content = `
    <h2 style="margin:0 0 8px;color:#6B3F2A;font-size:20px;font-weight:800;">
      Welcome to PawSpace, ${name}! 🐾
    </h2>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      We're glad you're here. PawSpace connects pet owners looking for loving homes 
      with adopters across Nairobi.
    </p>
    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
      Whether you're looking to adopt or find a home for a pet, 
      we're here to help make it happen.
    </p>
    <a href="${appUrl}/feed" style="display:inline-block;background:#FF6B35;color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:50px;text-decoration:none;">
      Browse Pets in Nairobi →
    </a>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to PawSpace 🐾',
    html: baseTemplate(content),
  });
}

module.exports = {
  notifyOwnerOfInterest,
  notifyAdopterAccepted,
  notifyAdopterRejected,
  notifyWelcome,
};
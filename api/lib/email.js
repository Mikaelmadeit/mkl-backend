// api/lib/email.js
// Sends confirmation email with PDF contract attached via Resend

const { Resend } = require('resend');

async function sendConfirmationEmail({
  buyerName,
  buyerEmail,
  beatTitle,
  licenseName,
  price,
  orderId,
  downloadUrl,
  pdfBuffer,
  contractDate,
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const firstName = buyerName.split(' ')[0];
  const beatDisplay = beatTitle.replace(/\*[^*]*\*/g, '').replace(/Type Beat\s*[-–]/i, '').replace(/\|.*/, '').trim();

  const downloadSection = downloadUrl
    ? `<div style="text-align:center;margin:24px 0">
        <a href="${downloadUrl}"
          style="display:inline-block;background:#7B2FBE;color:#fff;text-decoration:none;
                 font-family:monospace;font-size:13px;letter-spacing:3px;padding:12px 32px;
                 border-radius:3px;font-weight:bold">
          ↓ DOWNLOAD YOUR BEAT
        </a>
        <p style="font-size:11px;color:#888;margin-top:8px;font-family:monospace">
          Link expires in 48 hours
        </p>
      </div>`
    : `<div style="background:#1a0a2e;border:1px solid #3d1a6e;padding:14px 20px;margin:20px 0;border-radius:3px">
        <p style="margin:0;font-family:monospace;font-size:12px;color:#b060ff;letter-spacing:2px">
          ▸ Your beat files will be sent to this email within 24 hours.
        </p>
      </div>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0510;font-family:Georgia,serif">
  <div style="max-width:560px;margin:0 auto;background:#0c0516">

    <!-- Header -->
    <div style="background:#0a0310;padding:28px 36px;border-bottom:2px solid #7B2FBE">
      <div style="font-family:monospace;font-size:22px;color:#fff;letter-spacing:6px;font-weight:bold">
        MIKAELMADEIT
      </div>
      <div style="font-family:monospace;font-size:9px;color:#b060ff;letter-spacing:4px;margin-top:4px">
        BEAT LICENSE CONFIRMATION
      </div>
    </div>

    <!-- Body -->
    <div style="padding:32px 36px">
      <p style="color:#d0a0ff;font-size:15px;margin:0 0 6px">
        Hey ${firstName},
      </p>
      <p style="color:#e0d0ff;font-size:14px;line-height:1.7;margin:0 0 24px">
        Your payment went through. Your <strong style="color:#b060ff">${licenseName}</strong> 
        for <strong style="color:#d090ff">"${beatDisplay}"</strong> is confirmed.
      </p>

      <!-- Order details -->
      <div style="background:#150825;border:1px solid #3d1a6e;padding:16px 20px;border-radius:3px;margin-bottom:24px">
        <table style="width:100%;border-collapse:collapse;font-family:monospace;font-size:12px">
          <tr>
            <td style="color:#888;padding:4px 0;letter-spacing:1px">BEAT</td>
            <td style="color:#d090ff;padding:4px 0;text-align:right">${beatDisplay}</td>
          </tr>
          <tr>
            <td style="color:#888;padding:4px 0;letter-spacing:1px">LICENSE</td>
            <td style="color:#d090ff;padding:4px 0;text-align:right">${licenseName}</td>
          </tr>
          <tr>
            <td style="color:#888;padding:4px 0;letter-spacing:1px">AMOUNT</td>
            <td style="color:#d090ff;padding:4px 0;text-align:right">$${parseFloat(price).toFixed(2)} USD</td>
          </tr>
          <tr>
            <td style="color:#888;padding:4px 0;letter-spacing:1px">DATE</td>
            <td style="color:#d090ff;padding:4px 0;text-align:right">${contractDate}</td>
          </tr>
          <tr>
            <td style="color:#888;padding:4px 0;letter-spacing:1px">ORDER ID</td>
            <td style="color:#777;padding:4px 0;text-align:right;font-size:10px">${orderId}</td>
          </tr>
        </table>
      </div>

      <!-- Download -->
      ${downloadSection}

      <!-- Contract note -->
      <p style="color:#888;font-size:12px;font-family:monospace;line-height:1.7">
        Your signed license contract is attached to this email as a PDF. 
        Keep it for your records — it proves your right to use the beat.
      </p>

      <hr style="border:none;border-top:1px solid #2a1040;margin:24px 0">

      <p style="color:#666;font-size:11px;font-family:monospace;line-height:1.8;margin:0">
        Need anything? DM on YouTube: 
        <a href="https://youtube.com/@Miikaelmadeit" style="color:#b060ff">@Miikaelmadeit</a><br>
        More beats: <a href="https://youtube.com/@Miikaelmadeit" style="color:#b060ff">youtube.com/@Miikaelmadeit</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#080210;padding:16px 36px;border-top:1px solid #1a0a2e;text-align:center">
      <p style="margin:0;font-family:monospace;font-size:10px;color:#444;letter-spacing:2px">
        (prod. Mikaelmadeit) · © ${new Date().getFullYear()}
      </p>
    </div>
  </div>
</body>
</html>`;

  const contractFilename = `License_${beatDisplay.replace(/[^a-zA-Z0-9]/g, '_').substring(0,30)}_${licenseName.replace(/ /g,'_')}.pdf`;

  await resend.emails.send({
    from: 'Mikaelmadeit Beats <beats@yourdomain.com>', // ← update this
    to: buyerEmail,
    subject: `Your ${licenseName} — "${beatDisplay}" (prod. Mikaelmadeit)`,
    html,
    attachments: [
      {
        filename: contractFilename,
        content: pdfBuffer.toString('base64'),
      },
    ],
  });
}

module.exports = { sendConfirmationEmail };

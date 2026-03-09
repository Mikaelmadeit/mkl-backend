// api/confirm-order.js
// Vercel serverless function
// Called by the frontend after PayPal payment is captured
// 1. Verifies the order with PayPal API
// 2. Generates a PDF license contract
// 3. Emails it to the buyer via Resend
// 4. Returns a signed download URL

const { generateContract } = require('./lib/pdf');
const { sendConfirmationEmail } = require('./lib/email');
const { verifyPayPalOrder } = require('./lib/paypal');

export default async function handler(req, res) {
  // CORS — allow your site domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      orderId,       // PayPal order ID
      beatTitle,     // Full beat title
      beatId,        // YouTube video ID
      licenseName,   // 'Lease' | 'Premium Lease' | 'Exclusive Rights'
      price,         // numeric price paid
      buyerName,     // from PayPal details.payer.name
      buyerEmail,    // from PayPal details.payer.email_address
      downloadUrl,   // Google Drive URL for the beat file (optional)
    } = req.body;

    // ── 1. Verify the order is real with PayPal ───────────────────────────────
    const verified = await verifyPayPalOrder(orderId, price);
    if (!verified.ok) {
      console.error('PayPal verification failed:', verified.error);
      return res.status(400).json({ error: 'Payment verification failed', detail: verified.error });
    }

    // ── 2. Generate PDF license contract ─────────────────────────────────────
    const contractDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const pdfBuffer = await generateContract({
      beatTitle,
      licenseName,
      price,
      buyerName,
      buyerEmail,
      orderId,
      contractDate,
      producerName: 'Mikaelmadeit',
      producerTag: '(prod. Mikaelmadeit)',
    });

    // ── 3. Send confirmation email with PDF attached ──────────────────────────
    await sendConfirmationEmail({
      buyerName,
      buyerEmail,
      beatTitle,
      licenseName,
      price,
      orderId,
      downloadUrl: downloadUrl || null,
      pdfBuffer,
      contractDate,
    });

    // ── 4. Return success ─────────────────────────────────────────────────────
    return res.status(200).json({
      ok: true,
      message: 'Contract sent to ' + buyerEmail,
      orderId,
    });

  } catch (err) {
    console.error('confirm-order error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}

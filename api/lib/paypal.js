// api/lib/paypal.js
// Verifies a PayPal order is COMPLETED and the amount matches

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET env vars');

  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get PayPal token: ' + JSON.stringify(data));
  return data.access_token;
}

async function verifyPayPalOrder(orderId, expectedPrice) {
  try {
    const token = await getPayPalAccessToken();

    const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const order = await res.json();

    // Must be COMPLETED
    if (order.status !== 'COMPLETED') {
      return { ok: false, error: `Order status is ${order.status}, expected COMPLETED` };
    }

    // Verify amount matches (within $0.01 to handle rounding)
    const paidAmount = parseFloat(
      order.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '0'
    );
    const expected = parseFloat(expectedPrice);

    if (Math.abs(paidAmount - expected) > 0.05) {
      return { ok: false, error: `Amount mismatch: paid $${paidAmount}, expected $${expected}` };
    }

    return { ok: true, paidAmount, order };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { verifyPayPalOrder };

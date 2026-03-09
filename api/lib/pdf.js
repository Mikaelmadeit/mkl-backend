// api/lib/pdf.js
// Generates a professional PDF license contract using PDFKit

const PDFDocument = require('pdfkit');

const LICENSE_TERMS = {
  'Lease': {
    streams: 'Up to 100,000 audio streams',
    sales: 'Up to 2,500 paid downloads',
    performances: 'Up to 1 music video (non-monetized)',
    radio: 'Up to 2 non-profit radio stations',
    exclusive: false,
    credit: 'Producer credit required: (prod. Mikaelmadeit)',
    format: 'MP3 + WAV',
  },
  'Premium Lease': {
    streams: 'Unlimited audio streams',
    sales: 'Up to 10,000 paid downloads',
    performances: 'Up to 1 monetized music video',
    radio: 'Up to 5 radio stations',
    exclusive: false,
    credit: 'Producer credit required: (prod. Mikaelmadeit)',
    format: 'MP3 + WAV + Stems/FLP',
  },
  'Exclusive Rights': {
    streams: 'Unlimited audio streams',
    sales: 'Unlimited paid downloads',
    performances: 'Unlimited music videos (monetized)',
    radio: 'Unlimited radio stations',
    exclusive: true,
    credit: 'No producer credit required (optional)',
    format: 'MP3 + WAV + Stems/FLP + Full Project Files',
  },
};

async function generateContract({
  beatTitle,
  licenseName,
  price,
  buyerName,
  buyerEmail,
  orderId,
  contractDate,
  producerName,
  producerTag,
}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 60 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const terms = LICENSE_TERMS[licenseName] || LICENSE_TERMS['Lease'];
    const purple = '#7B2FBE';
    const dark = '#1a0a2e';
    const gray = '#666666';
    const light = '#f5f0ff';

    // ── Header bar ────────────────────────────────────────────────────────────
    doc.rect(0, 0, 612, 90).fill(dark);
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#FFFFFF')
      .text('MIKAELMADEIT', 60, 22, { characterSpacing: 6 });
    doc.fontSize(9).font('Helvetica').fillColor('#b060ff')
      .text('BEAT LICENSE AGREEMENT', 60, 56, { characterSpacing: 4 });
    doc.fontSize(8).fillColor('rgba(255,255,255,0.4)')
      .text('(prod. Mikaelmadeit)', 60, 70);

    // Order ID top right
    doc.fontSize(7).fillColor('rgba(255,255,255,0.5)')
      .text('Order: ' + orderId, 0, 38, { align: 'right', width: 552 });

    // ── License type banner ───────────────────────────────────────────────────
    doc.rect(0, 90, 612, 36).fill(purple);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#FFFFFF')
      .text(licenseName.toUpperCase() + ' LICENSE', 60, 100, { characterSpacing: 4 });
    if (terms.exclusive) {
      doc.fontSize(9).fillColor('#ffee00')
        .text('★ EXCLUSIVE — BEAT REMOVED FROM STORE AFTER PURCHASE', 0, 103, { align: 'right', width: 552 });
    }

    doc.moveDown(2);

    // ── Contract details block ────────────────────────────────────────────────
    const detailY = 148;
    doc.rect(60, detailY, 492, 110).fill(light).stroke('#e0d0f5');

    doc.fontSize(9).font('Helvetica-Bold').fillColor(dark)
      .text('BEAT:', 76, detailY + 14)
      .text('LICENSEE:', 76, detailY + 30)
      .text('EMAIL:', 76, detailY + 46)
      .text('LICENSE TYPE:', 76, detailY + 62)
      .text('AMOUNT PAID:', 76, detailY + 78)
      .text('DATE:', 76, detailY + 94);

    doc.fontSize(9).font('Helvetica').fillColor('#333333')
      .text(beatTitle, 160, detailY + 14, { width: 370 })
      .text(buyerName, 160, detailY + 30)
      .text(buyerEmail, 160, detailY + 46)
      .text(licenseName, 160, detailY + 62)
      .text('$' + parseFloat(price).toFixed(2) + ' USD', 160, detailY + 78)
      .text(contractDate, 160, detailY + 94);

    // ── Terms section ─────────────────────────────────────────────────────────
    doc.y = detailY + 128;
    doc.fontSize(11).font('Helvetica-Bold').fillColor(purple)
      .text('LICENSE TERMS', 60);
    doc.moveTo(60, doc.y + 2).lineTo(552, doc.y + 2).stroke(purple);
    doc.moveDown(0.8);

    const termsList = [
      ['Streams', terms.streams],
      ['Downloads / Sales', terms.sales],
      ['Music Videos', terms.performances],
      ['Radio / Broadcasting', terms.radio],
      ['Files Included', terms.format],
      ['Credit', terms.credit],
      ['Exclusive', terms.exclusive ? 'YES — Buyer has full exclusive rights. Beat removed from store.' : 'NO — Non-exclusive. Producer retains rights to resell.'],
    ];

    termsList.forEach(([label, value]) => {
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(dark).text(label + ':', 60, doc.y, { continued: true, width: 130 });
      doc.font('Helvetica').fillColor('#444444').text('  ' + value, { width: 380 });
      doc.moveDown(0.4);
    });

    // ── Legal text ────────────────────────────────────────────────────────────
    doc.moveDown(0.8);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(purple).text('AGREEMENT');
    doc.moveTo(60, doc.y + 2).lineTo(552, doc.y + 2).stroke(purple);
    doc.moveDown(0.5);

    const legalText = terms.exclusive
      ? `This agreement grants the Licensee ("${buyerName}") exclusive rights to the musical composition titled "${beatTitle}" (the "Beat"), produced by ${producerName}. Upon payment of $${parseFloat(price).toFixed(2)} USD, the Licensee obtains full exclusive ownership of the Beat. The Beat will be removed from all public stores. The Licensee may use the Beat for commercial purposes including unlimited streams, downloads, music videos, and radio plays. The Producer retains the right to be credited as the original composer. This agreement is legally binding upon electronic payment confirmation.`
      : `This agreement grants the Licensee ("${buyerName}") a non-exclusive license to the musical composition titled "${beatTitle}" (the "Beat"), produced by ${producerName}. Upon payment of $${parseFloat(price).toFixed(2)} USD, the Licensee may use the Beat within the limits described above. The Producer retains all ownership rights and may continue to license the Beat to other artists. The Licensee must include the producer tag ${producerTag} in all releases. This agreement is legally binding upon electronic payment confirmation.`;

    doc.fontSize(8).font('Helvetica').fillColor(gray).text(legalText, 60, doc.y, { width: 492, lineGap: 3 });

    // ── Signatures ────────────────────────────────────────────────────────────
    doc.moveDown(1.5);
    const sigY = doc.y;
    doc.moveTo(60, sigY + 30).lineTo(250, sigY + 30).stroke('#999');
    doc.moveTo(310, sigY + 30).lineTo(500, sigY + 30).stroke('#999');
    doc.fontSize(7.5).font('Helvetica').fillColor(gray)
      .text('PRODUCER: ' + producerName.toUpperCase(), 60, sigY + 34)
      .text('LICENSEE: ' + buyerName.toUpperCase(), 310, sigY + 34)
      .text(contractDate, 60, sigY + 46)
      .text(contractDate, 310, sigY + 46);

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.rect(0, 720, 612, 72).fill(dark);
    doc.fontSize(7).font('Helvetica').fillColor('rgba(255,255,255,0.35)')
      .text('This license was issued automatically upon verified PayPal payment. Order ID: ' + orderId, 60, 728, { width: 492, align: 'center' })
      .text('Questions? Contact via YouTube: @Miikaelmadeit', 60, 742, { width: 492, align: 'center' })
      .text('© ' + new Date().getFullYear() + ' Mikaelmadeit. All rights reserved.', 60, 756, { width: 492, align: 'center' });

    doc.end();
  });
}

module.exports = { generateContract };

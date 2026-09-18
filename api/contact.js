const MAX_NAME = 80;
const MAX_MESSAGE = 5000;

function text(value, max) {
  return String(value || '').trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[ch]));
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, reason: 'method-not-allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { return res.status(400).json({ ok: false, reason: 'invalid-json' }); }
  }
  // Quietly accept bot submissions that fill the hidden field.
  if (body.website) return res.status(200).json({ ok: true });

  const firstName = text(body.firstName, MAX_NAME).replace(/[\r\n]+/g, ' ');
  const replyEmail = text(body.replyEmail, 254).toLowerCase();
  const message = text(body.message, MAX_MESSAGE);
  if (!firstName || !validEmail(replyEmail) || !message) {
    return res.status(400).json({ ok: false, reason: 'invalid-fields' });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM || process.env.REMINDER_FROM || "Xanderr Portfolio <nick.cage@xanderr.com>";
  const to = (process.env.CONTACT_TO || process.env.REMINDER_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!key || !to.length) return res.status(503).json({ ok: false, reason: 'email-not-configured' });

  const safeName = escapeHtml(firstName);
  const safeEmail = escapeHtml(replyEmail);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to,
      reply_to: replyEmail,
      subject: `Portfolio message from ${firstName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto"><h2>New message for Xanderr</h2><p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p><div style="line-height:1.6;border-top:1px solid #ddd;padding-top:16px">${safeMessage}</div></div>`,
    }),
  });

  if (!response.ok) return res.status(502).json({ ok: false, reason: 'send-failed' });
  return res.status(200).json({ ok: true });
}

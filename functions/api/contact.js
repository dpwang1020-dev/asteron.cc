/**
 * Cloudflare Pages Function: POST /api/contact
 * Accepts JSON { name, email, company?, message } and sends an email to sales@asteron.cc via Resend.
 * Requires env: RESEND_API_KEY. Optional: RESEND_FROM_EMAIL (default: ASTERON Website <onboarding@resend.dev>).
 */

const TO_EMAIL = 'sales@asteron.cc';

export function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const { request, env } = context;
    const envSafe = env || {};

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: 'Invalid JSON body' }, 400);
    }

    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const company = (body.company || '').trim();
    const message = (body.message || '').trim();

    if (!name || !email || !message) {
      return json({ success: false, error: 'Name, email, and message are required' }, 400);
    }

    const apiKey = (envSafe.RESEND_API_KEY || '').trim();
    if (!apiKey) {
      return json({ success: false, error: 'Server configuration error' }, 500);
    }

    const fromEmail = (envSafe.RESEND_FROM_EMAIL || 'ASTERON Website <noreply@asteron.cc>').trim();
    const subject = `[ASTERON Contact] ${name}${company ? ` (${company})` : ''}`;
    const html = [
      `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
      `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
      phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : '',
      company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : '',
      '<p><strong>Message:</strong></p>',
      `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    ].join('');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [TO_EMAIL],
        subject,
        html,
      }),
    });

    let data = {};
    try {
      const text = await res.text();
      if (text) data = JSON.parse(text);
    } catch {
      data = { message: res.statusText || 'Unknown error' };
    }

    if (!res.ok) {
      return json({
        success: false,
        error: data.message || data.error || (typeof data === 'string' ? data : 'Failed to send email'),
      }, 502);
    }

    return json({ success: true });
  } catch {
    return json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      500
    );
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

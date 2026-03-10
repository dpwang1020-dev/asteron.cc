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
    console.log('[api/contact] POST received');
    const { request, env } = context;
    const envSafe = env || {};
    const hasKey = !!(envSafe.RESEND_API_KEY && String(envSafe.RESEND_API_KEY).trim());
    console.log('[api/contact] env check: RESEND_API_KEY present=', hasKey);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('[api/contact] request.json() failed:', e && e.message);
      return json({ success: false, error: 'Invalid JSON body' }, 400);
    }

    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const company = (body.company || '').trim();
    const message = (body.message || '').trim();
    console.log('[api/contact] body: name=', !!name, 'email=', !!email, 'company=', !!company, 'messageLen=', message.length);

    if (!name || !email || !message) {
      console.log('[api/contact] validation failed: missing required fields');
      return json({ success: false, error: 'Name, email, and message are required' }, 400);
    }

    const apiKey = (envSafe.RESEND_API_KEY || '').trim();
    if (!apiKey) {
      console.error('[api/contact] RESEND_API_KEY is missing or empty');
      return json({ success: false, error: 'Server configuration error' }, 500);
    }

    const fromEmail = (envSafe.RESEND_FROM_EMAIL || 'ASTERON Website <onboarding@resend.dev>').trim();
    const subject = `[ASTERON Contact] ${name}${company ? ` (${company})` : ''}`;
    console.log('[api/contact] calling Resend: from=', fromEmail, 'to=', TO_EMAIL, 'subject=', subject);
    const html = [
      `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
      `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
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
    } catch (e) {
      console.error('[api/contact] Resend response parse failed:', e && e.message);
      data = { message: res.statusText || 'Unknown error' };
    }

    console.log('[api/contact] Resend response: status=', res.status, 'data=', JSON.stringify(data));

    if (!res.ok) {
      console.error('[api/contact] Resend error:', res.status, data);
      return json({
        success: false,
        error: data.message || data.error || (typeof data === 'string' ? data : 'Failed to send email'),
      }, 502);
    }

    console.log('[api/contact] email sent successfully');
    return json({ success: true });
  } catch (err) {
    console.error('[api/contact] Uncaught error:', err && err.message, err && err.stack);
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

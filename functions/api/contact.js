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
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const company = (body.company || '').trim();
  const message = (body.message || '').trim();

  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({ success: false, error: 'Name, email, and message are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const fromEmail = env.RESEND_FROM_EMAIL || 'ASTERON Website <onboarding@resend.dev>';
  const subject = `[ASTERON Contact] ${name}${company ? ` (${company})` : ''}`;
  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ''}
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [TO_EMAIL],
      subject,
      html,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return new Response(
      JSON.stringify({
        success: false,
        error: data.message || data.error || 'Failed to send email',
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

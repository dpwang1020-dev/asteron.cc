# ASTERON Website 2

LIGENT-style clone for ASTERON, with the following structure:

## Navigation

- **Solutions** (dropdown)
  - AI Clusters | Data Centers
  - Cloud & DCI
  - Storage | Server HPC
  - Wireless Fronthaul
  - Metro Long Haul
  - Fiber to the Home Access
- **Sustainable Development** (dropdown)
  - Quality & Safety
  - Compliance Statement
- **About ASTERON** (dropdown)
  - Introduction
  - News
- **Contact Us**

## Local preview

Open `index.html` in a browser, or run a local server, e.g.:

```bash
cd ~/asteron-website2
python3 -m http.server 8080
```

Then visit http://localhost:8080

## Contact form (Cloudflare Pages + Functions + Resend)

The contact page submits to **POST /api/contact**, which sends an email to **sales@asteron.cc** via [Resend](https://resend.com).

### Deploy on Cloudflare Pages

1. Connect the repo to Cloudflare Pages (Git integration or direct upload).
2. Set **Environment variables** (Settings → Environment variables):
   - **RESEND_API_KEY** (secret): your [Resend API key](https://resend.com/api-keys).
   - **RESEND_FROM_EMAIL** (optional): e.g. `ASTERON Website <noreply@asteron.cc>` once the domain is verified in Resend. If unset, Resend’s sandbox `onboarding@resend.dev` is used.
3. Deploy. The `functions/api/contact.js` will be deployed as a serverless function at `/api/contact`.

### Local development with Functions

```bash
# Install Wrangler if needed: npm i -g wrangler
cp .dev.vars.example .dev.vars
# Edit .dev.vars and set RESEND_API_KEY=re_xxxx
npx wrangler pages dev . --port 8788
```

Then open http://localhost:8788/contact.html and submit the form. Emails will be sent via Resend to sales@asteron.cc.

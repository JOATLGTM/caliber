# Caliber Apply Autofill — Chrome extension

Prefills **Greenhouse**, **Lever**, and **Ashby** application forms from your Caliber profile. Does **not** submit applications.

## Install (development)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this folder (`caliber/extension`)
4. Click the **reload** icon on the extension after code changes
5. In Caliber → **Settings → Browser extension**, copy your access token
6. Open a job **Apply** form in a tab, then use the extension popup → **Fill this page**

**Important:** You must be on the company's **application form** tab when you click Fill — not Caliber Settings, not the Chrome extensions page, and not just the job listing.

## Connect

1. Log into Caliber (local or production)
2. Go to **Settings → Browser extension**
3. Copy the access token (valid ~1 hour — refresh from settings if fill fails)
4. Paste into the extension popup

## Supported sites

- `*.greenhouse.io` (apply forms)
- `jobs.lever.co`
- `jobs.ashbyhq.com`

## Security

- Token is your Supabase session JWT — treat like a password
- Stored in `chrome.storage.sync` on your machine only
- Revoke by signing out of Caliber

## Production

Set **Caliber URL** to your deployed domain (e.g. `https://caliber.app`). Ensure `NEXT_PUBLIC_SITE_URL` matches on Vercel.

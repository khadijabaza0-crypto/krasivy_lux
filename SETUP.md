# Krasivy Lux — Complete Setup Guide

## File Structure
```
krasivy-lux/
├── index.html      ← Homepage
├── watch.html      ← Single watch page
├── order.html      ← Order form
├── admin.html      ← Admin panel (password protected)
├── style.css       ← All styles
├── app.js          ← Main JS (shared)
├── admin.js        ← Admin JS
└── Code.gs         ← Google Apps Script (backend)
```

---

## STEP 1 — Create the Google Sheet

1. Go to https://sheets.google.com
2. Click **+ New spreadsheet**
3. Name it: **Krasivy Lux Store**
4. Copy the Spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/ **THIS_IS_THE_ID** /edit`

---

## STEP 2 — Set Up Google Apps Script

1. In your spreadsheet, click **Extensions → Apps Script**
2. Delete everything in the editor
3. Copy the entire contents of `Code.gs` and paste it
4. Find line: `const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';`
5. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual ID from Step 1
6. Click **Save** (💾 icon)

---

## STEP 3 — Deploy the Script

1. Click **Deploy → New deployment**
2. Click ⚙️ gear next to "Select type" → choose **Web app**
3. Fill in:
   - Description: `Krasivy Lux API`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** → choose your Google account → Allow
6. **Copy the Web App URL** — it looks like:
   `https://script.google.com/macros/s/AKfy.../exec`

---

## STEP 4 — Connect Your Site

Open `app.js` and find line 3:
```js
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```
Replace with your URL from Step 3.

Also update social links (lines 6-7):
```js
const INSTAGRAM_URL = 'https://www.instagram.com/YOUR_ACCOUNT';
const TIKTOK_URL    = 'https://www.tiktok.com/@YOUR_ACCOUNT';
```

---

## STEP 5 — Change Admin Password

Open `admin.js` and find line 3:
```js
const ADMIN_PASSWORD = 'krasivy2025';
```
Change `krasivy2025` to your secret password.

---

## STEP 6 — Host Your Site

**Option A — Free: GitHub Pages**
1. Create a GitHub account at github.com
2. New repository → name it `krasivy-lux`
3. Upload all files (index, watch, order, admin, style, app, admin js)
4. Go to Settings → Pages → Source: main branch
5. Your site will be at: `https://YOUR_USERNAME.github.io/krasivy-lux`

**Option B — Free: Netlify**
1. Go to netlify.com
2. Drag and drop your folder
3. Done — instant HTTPS URL

---

## HOW TO ADD A WATCH (Admin Panel)

1. Go to `yoursite.com/admin.html`
2. Enter your password
3. In "Add New Watch":
   - Name: `Royal Prestige`
   - Type: `Cuir` or `Acier`
   - Price: `15000`
   - Description: optional
   - Main Image URL: paste a direct image link (use imgbb.com to upload)
   - Colors: Add each color with its image URL
     - Color name: `Gold` → Image URL: `https://...`
     - Color name: `Black` → Image URL: `https://...`
4. Click **Add Watch**

The watch instantly appears on the homepage!

---

## IMAGE HOSTING (Free)

To get image URLs for your watch photos:
1. Go to **imgbb.com** (free, no account needed)
2. Upload your photo
3. Copy the **Direct link** (ends in .jpg or .png)
4. Use that URL in the admin panel

---

## HIDING THE ADMIN PAGE

The admin page is only accessible if you know the URL (`/admin.html`).
Users will never see a link to it unless they've previously logged in.
The "Admin" link only appears in the menu after a successful login.

---

## AFTER REDEPLOYING APPS SCRIPT

Whenever you make changes to `Code.gs`:
1. Click **Deploy → Manage deployments**
2. Click the pencil ✏️ icon
3. Change version to **New version**
4. Click **Deploy**

---

## CONTACT INFO

Update your contact details in `index.html` (search for "contact@"):
```html
<p>📧 contact@krasivylux.com</p>
<p>📞 +213 XXX XXX XXX</p>
```

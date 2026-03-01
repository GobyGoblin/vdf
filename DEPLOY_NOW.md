# Deploy now – 3 steps

Everything in this folder is ready. Do these in order.

---

## Step 1: Push to GitHub

1. Create a new repository on GitHub: **https://github.com/new**
   - Name: e.g. `german-talent-connect`
   - Leave "Add a README" **unchecked**
   - Create repository

2. In a terminal, from this folder (`german-talent-connect-main`), run (replace `YOUR_USERNAME` and `german-talent-connect` with your GitHub username and repo name):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/german-talent-connect.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create the app on Render

1. Open **https://dashboard.render.com** and log in (or sign up with GitHub).
2. Click **New +** → **Web Service**.
3. Connect your GitHub account if asked, then select the repo you just pushed (e.g. `german-talent-connect`).
4. Use these settings:

| Field | Value |
|-------|--------|
| **Name** | `german-talent-connect` (or any name) |
| **Region** | Frankfurt (or your choice) |
| **Root Directory** | Leave **empty** (or set to `german-talent-connect-main` if the repo root is the parent folder) |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build && cd server && npm install` |
| **Start Command** | `node server/server.js` |

5. Click **Advanced** and add **Environment Variables**:

| Key | Value |
|----|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | A long random string (e.g. 32+ characters from a password generator) |
| `CORS_ORIGIN` | Leave empty for now; after first deploy, set it to your Render URL (e.g. `https://german-talent-connect.onrender.com`) |

6. Click **Create Web Service**. Render will build and deploy.

---

## Step 3: Set CORS after first deploy

1. When the first deploy finishes, copy your app URL (e.g. `https://german-talent-connect-xxxx.onrender.com`).
2. In Render: open your service → **Environment** → Edit.
3. Set **CORS_ORIGIN** = that URL (e.g. `https://german-talent-connect-xxxx.onrender.com`).
4. Save. Render will redeploy once.

---

Done. Your app (frontend + backend + SQLite data) will be live at the URL Render shows.  
Default admin login: `admin@example.com` / `admin123` (change after first login).

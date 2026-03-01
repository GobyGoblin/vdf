# Deploy on Vercel (frontend) + Render (backend)

- **Frontend** → Vercel (React/Vite)
- **Backend + data** → Render (Express + SQLite)

---

## 1. Deploy backend on Render (API + database)

1. Go to **https://dashboard.render.com** → **New +** → **Web Service**.
2. Connect your GitHub repo and select this project.
3. Settings:
   - **Build command:** `npm install && npm run build && cd server && npm install`
   - **Start command:** `node server/server.js`
   - **Environment:**  
     `NODE_ENV` = `production`  
     `JWT_SECRET` = (long random string)  
     `CORS_ORIGIN` = your Vercel URL (set after step 2), e.g. `https://your-app.vercel.app`
4. Create the service and wait for the first deploy. Copy the backend URL (e.g. `https://german-talent-connect-xxxx.onrender.com`).

---

## 2. Deploy frontend on Vercel

1. Go to **https://vercel.com** and sign in with GitHub.
2. **Add New** → **Project** → import your repo.
3. Configure:
   - **Framework Preset:** Vite (or leave auto-detected)
   - **Root Directory:** leave default (or `german-talent-connect-main` if the repo root is the parent folder)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables** (important):
   - `VITE_API_URL` = your Render backend API URL + `/api`, e.g. `https://german-talent-connect-xxxx.onrender.com/api`
5. Deploy. Your app will be at `https://your-project.vercel.app`.

---

## 3. Allow frontend in backend CORS

1. In **Render** → your service → **Environment**.
2. Set **CORS_ORIGIN** to your Vercel URL, e.g. `https://your-project.vercel.app` (and add any other domains you use, comma-separated).
3. Save so the service redeploys.

---

Done. Frontend runs on Vercel, API and SQLite on Render. Use the Vercel URL to open the app; default admin: `admin@example.com` / `admin123`.

---

## If /auth/me or other API calls return 401

The API must use the same JWT secret for login (sign) and for protected routes (verify). On your **API** deployment (Render or wherever the backend runs):

1. Set **JWT_SECRET** to a single long random string (e.g. from a password generator).
2. Redeploy the API so the new env is applied.

If JWT_SECRET is unset, the server uses an internal fallback so sign and verify match; if you set it in one place but not another, or use different values, you’ll get 401 on protected calls.

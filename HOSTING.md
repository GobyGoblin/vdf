# Hosting: Backend + Frontend + Data

This app can be deployed as **one service**: the Node server serves the React frontend and the API, with SQLite for data.

## Quick deploy on Render.com (free tier)

1. **Push your code** to a Git repo (GitHub, GitLab, or use Render’s “Deploy from Git”).

2. **Create a new Web Service** on [Render](https://render.com):
   - Connect the repo.
   - **Root directory:** leave empty (or set to the folder that contains `package.json` and `server/`, e.g. `german-talent-connect-main` if that’s your project root).
   - **Build command:**  
     `npm install && npm run build && cd server && npm install`
   - **Start command:**  
     `node server/server.js`
   - **Environment:** add:
     - `NODE_ENV` = `production`
     - `JWT_SECRET` = a long random string (e.g. from a password generator)
     - `CORS_ORIGIN` = your Render URL, e.g. `https://your-service-name.onrender.com`  
       (Render sets `PORT` for you.)

3. Deploy. After the build, the app will be at `https://your-service-name.onrender.com`.  
   - Frontend and API are on the same origin, so no extra CORS setup is needed.

### Optional: use the Blueprint

If your repo root contains `render.yaml`:

- In Render Dashboard: **New → Blueprint** and connect the repo.  
- Render will create the web service from the blueprint.  
- Set `JWT_SECRET` and `CORS_ORIGIN` in the service **Environment** (override or add there; you can use “Generate” for `JWT_SECRET` in the UI).

## Data (SQLite) and persistence

- **Render free tier:** The filesystem is ephemeral. The SQLite file is recreated on each deploy, so data is reset. Fine for demos.
- **To keep data:** Use a [Render persistent disk](https://render.com/docs/disks) (paid) and put the SQLite file on the disk, or use a hosted database (e.g. PostgreSQL) and change the app to use it instead of SQLite.

## Build and run locally (production-like)

```bash
# From project root (e.g. german-talent-connect-main)
npm install
npm run build
cd server && npm install && cd ..
NODE_ENV=production node server/server.js
```

Then open `http://localhost:3001`. The same server serves the API and the built frontend.

## Environment variables

| Variable       | Description |
|----------------|-------------|
| `NODE_ENV`     | `production` for hosting. |
| `PORT`         | Port (Render sets this). |
| `JWT_SECRET`   | Secret for JWT; **must** be set in production. |
| `CORS_ORIGIN`  | Allowed origin(s), e.g. your app URL when frontend and backend are together. |

Frontend uses **same origin** for API when `VITE_API_URL` is not set in the build, which is correct when you serve both from one server.

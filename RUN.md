# Run the project

## One command (backend + frontend)

From the project root (`german-talent-connect-main`):

```bash
npm run dev:all
```

- **Backend API:** http://localhost:3001  
- **Frontend:** http://localhost:8080 (or 8081 if 8080 is in use — check the terminal output)

Open the **frontend** URL in your browser. Log in with **Admin** → **admin@example.com** / **admin123**.

---

## If login does not work

1. **Restart the app** so the latest backend code runs: stop it (Ctrl+C), then run `npm run dev:all` again.
2. If it still fails, **reset the database** (fixes old/corrupt schema):
   - Stop the server (Ctrl+C).
   - Run: `npm run reset-db`
   - Run: `npm run dev:all`
3. Use exactly: **Admin** role, email **admin@example.com**, password **admin123** (no spaces, all lowercase).

---

## If you see "address already in use"

Another instance is still running. Either:

1. Close the terminal where you previously ran the app (or press Ctrl+C there), then run `npm run dev:all` again, or  
2. Free the ports and restart:
   ```bash
   npx kill-port 3001 8080
   npm run dev:all
   ```

---

## Run backend and frontend separately

**Terminal 1 – backend:**
```bash
cd german-talent-connect-main
npm run server
```

**Terminal 2 – frontend:**
```bash
cd german-talent-connect-main
npm run dev
```

Then open http://localhost:8080 (or the port Vite prints).

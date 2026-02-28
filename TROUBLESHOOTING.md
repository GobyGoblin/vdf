# Fehlerbehebung - Authentifizierung

## Problem: Auth funktioniert nicht

### Schritt 1: Prüfen Sie, ob das Backend läuft

Das Backend muss auf Port 3001 laufen. Prüfen Sie:

1. Öffnen Sie ein Terminal im `server` Verzeichnis
2. Führen Sie aus:
```bash
cd server
npm install
npm run dev
```

Sie sollten sehen:
```
Database connection established.
Database synchronized.
Server is running on http://localhost:3001
```

### Schritt 2: Prüfen Sie die Browser-Konsole

Öffnen Sie die Entwicklertools (F12) und schauen Sie in die Konsole. Mögliche Fehler:

- **"Cannot connect to server"** → Backend läuft nicht
- **CORS Error** → Backend-CORS ist nicht korrekt konfiguriert
- **401 Unauthorized** → Falsche Anmeldedaten

### Schritt 3: Testen Sie die API direkt

Öffnen Sie in Ihrem Browser:
```
http://localhost:3001/api/health
```

Sie sollten sehen: `{"status":"ok","message":"Server is running"}`

### Schritt 4: Standard-Admin-Benutzer

Wenn Sie sich zum ersten Mal anmelden, können Sie den Standard-Admin verwenden:

- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** `admin`

### Schritt 5: Neue Benutzer registrieren

1. Gehen Sie zu `/register`
2. Wählen Sie "Candidate" oder "Employer"
3. Füllen Sie alle Felder aus
4. Klicken Sie auf "Create Account"

### Häufige Probleme

#### Problem: "Cannot connect to server"
**Lösung:** Starten Sie das Backend:
```bash
cd server
npm run dev
```

#### Problem: "Invalid credentials"
**Lösung:** 
- Prüfen Sie Email und Passwort
- Stellen Sie sicher, dass der Benutzer existiert
- Versuchen Sie, sich neu zu registrieren

#### Problem: "User already exists"
**Lösung:** 
- Verwenden Sie eine andere Email-Adresse
- Oder loggen Sie sich mit den bestehenden Anmeldedaten ein

#### Problem: CORS-Fehler
**Lösung:** 
- Stellen Sie sicher, dass `cors` im Backend installiert ist
- Prüfen Sie, ob `app.use(cors())` in `server/server.js` vorhanden ist

### Debug-Modus

Um mehr Informationen zu sehen, öffnen Sie die Browser-Konsole (F12) und schauen Sie nach:
- Network-Tab: Sehen Sie die API-Requests?
- Console-Tab: Gibt es Fehlermeldungen?

### API-URL prüfen

Stellen Sie sicher, dass die API-URL korrekt ist. In `src/lib/api.ts` sollte stehen:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

Sie können auch eine `.env` Datei im Hauptverzeichnis erstellen:
```
VITE_API_URL=http://localhost:3001/api
```

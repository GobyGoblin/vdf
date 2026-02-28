# German Talent Connect - Setup Guide

## Vollständige Installation und Start

Diese Anleitung zeigt Ihnen, wie Sie sowohl das Frontend als auch das Backend einrichten und starten.

## Voraussetzungen

- Node.js (Version 18 oder höher)
- npm oder yarn

## Schritt 1: Backend einrichten

1. Navigieren Sie zum Server-Verzeichnis:
```bash
cd server
```

2. Installieren Sie die Abhängigkeiten:
```bash
npm install
```

3. Erstellen Sie eine `.env` Datei im `server` Verzeichnis:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

4. Bearbeiten Sie die `.env` Datei und setzen Sie:
```
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Starten Sie den Backend-Server:
```bash
npm run dev
```

Der Server läuft jetzt auf `http://localhost:3001`

## Schritt 2: Frontend einrichten

1. Öffnen Sie ein neues Terminal und navigieren Sie zum Hauptverzeichnis:
```bash
cd german-talent-connect-main
```

2. Installieren Sie die Frontend-Abhängigkeiten (falls noch nicht geschehen):
```bash
npm install
```

3. Erstellen Sie eine `.env` Datei im Hauptverzeichnis (optional, Standard ist localhost:3001):
```
VITE_API_URL=http://localhost:3001/api
```

4. Starten Sie den Frontend-Entwicklungsserver:
```bash
npm run dev
```

Das Frontend läuft jetzt auf `http://localhost:5173` (oder einem anderen Port, den Vite zuweist)

## Schritt 3: Testen der Anwendung

1. Öffnen Sie `http://localhost:5173` in Ihrem Browser
2. Registrieren Sie sich als Kandidat oder Arbeitgeber
3. Oder loggen Sie sich mit dem Standard-Admin ein:
   - Email: `admin@example.com`
   - Password: `admin123`

## Wichtige Hinweise

- **Backend muss laufen**: Das Frontend benötigt das Backend, um zu funktionieren
- **CORS**: Das Backend ist für lokale Entwicklung konfiguriert
- **Datenbank**: SQLite wird automatisch erstellt beim ersten Start
- **Uploads**: Dokumente werden im `server/uploads` Verzeichnis gespeichert

## Produktions-Build

### Frontend bauen:
```bash
npm run build
```

### Backend für Produktion:
```bash
cd server
NODE_ENV=production npm start
```

## Troubleshooting

### Backend startet nicht
- Prüfen Sie, ob Port 3001 frei ist
- Prüfen Sie die `.env` Datei
- Prüfen Sie, ob alle Abhängigkeiten installiert sind

### Frontend kann nicht mit Backend kommunizieren
- Stellen Sie sicher, dass das Backend läuft
- Prüfen Sie die `VITE_API_URL` in der `.env` Datei
- Prüfen Sie die Browser-Konsole auf Fehler

### Datenbank-Fehler
- Löschen Sie `server/database.sqlite` und starten Sie den Server neu
- Die Datenbank wird automatisch neu erstellt

## API-Dokumentation

Siehe `README_BACKEND.md` für eine vollständige API-Dokumentation.

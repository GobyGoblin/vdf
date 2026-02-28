# Änderungen - Vollständiges Backend hinzugefügt

## Was wurde hinzugefügt?

### Backend-Server (`server/`)
- **Express.js Server** mit vollständiger REST API
- **SQLite Datenbank** mit Sequelize ORM
- **JWT Authentication** für sichere Anmeldung
- **File Upload** für Dokumente
- **Vollständige CRUD-Operationen** für alle Entitäten

### API-Endpunkte

#### Authentication
- Registrierung (Kandidaten & Arbeitgeber)
- Login mit JWT-Token
- Get Current User

#### Jobs
- Alle Jobs anzeigen (öffentlich)
- Job-Details
- Job erstellen/bearbeiten/löschen (Arbeitgeber)
- Eigene Jobs anzeigen (Arbeitgeber)

#### Applications
- Bewerbung erstellen (Kandidat)
- Eigene Bewerbungen anzeigen (Kandidat)
- Bewerbungen für Job anzeigen (Arbeitgeber)
- Bewerbungsstatus ändern (Arbeitgeber/Staff)

#### Profiles
- Kandidaten-Profil anzeigen/bearbeiten
- Arbeitgeber-Profil anzeigen/bearbeiten
- Profil-Views tracken
- Dashboard-Statistiken

#### Documents
- Dokumente hochladen (Kandidat)
- Eigene Dokumente anzeigen
- Dokumente löschen
- Dokumente verifizieren (Staff/Admin)

#### Consent Requests
- Consent-Anfrage erstellen (Arbeitgeber)
- Consent-Anfragen anzeigen (Kandidat)
- Consent-Anfrage beantworten (Kandidat)

### Frontend-Integration (`src/lib/api.ts`)
- Vollständiger API-Service mit allen Endpunkten
- Automatisches Token-Management
- Error-Handling

### Aktualisierte Seiten
- **Login.tsx** - Echte API-Anbindung
- **Register.tsx** - Echte API-Anbindung
- **Jobs.tsx** - Lädt Jobs vom Backend

## Datenbank-Schema

### Tabellen:
- **Users** - Benutzer (Kandidaten, Arbeitgeber, Staff, Admin)
- **CandidateProfiles** - Kandidaten-Profile
- **EmployerProfiles** - Arbeitgeber-Profile
- **Jobs** - Stellenausschreibungen
- **Applications** - Bewerbungen
- **Documents** - Hochgeladene Dokumente
- **ConsentRequests** - Consent-Anfragen
- **ProfileViews** - Profil-Views Tracking

## Sicherheit

- Passwörter werden mit bcrypt gehasht
- JWT-Token für Authentifizierung
- Role-based Access Control (RBAC)
- File Upload Validierung

## Standard-Benutzer

Beim ersten Start wird automatisch ein Admin-Benutzer erstellt:
- Email: `admin@example.com`
- Password: `admin123`

**WICHTIG:** Ändern Sie dieses Passwort in Produktion!

## Nächste Schritte

1. **Backend starten**: `cd server && npm install && npm run dev`
2. **Frontend starten**: `npm run dev`
3. **Testen**: Registrieren Sie sich oder loggen Sie sich mit dem Admin ein

## Weitere Integrationen

Die folgenden Seiten können noch mit der API verbunden werden:
- Candidate Dashboard (Statistiken)
- Candidate Profile (Bearbeitung)
- Candidate Documents (Upload)
- Candidate Applications (Anzeige)
- Employer Dashboard (Statistiken)
- Employer Jobs (CRUD)
- Employer Applicants (Anzeige)
- Job Detail (Bewerbung absenden)

Die API ist vollständig funktionsfähig und bereit für diese Integrationen.

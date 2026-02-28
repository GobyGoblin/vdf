# German Talent Connect

A full-stack application connecting verified international talent with German employers.

## Project Structure

```
german-talent-connect-main/
├── server/          # Node.js/Express backend
├── client/          # Vite + React + TypeScript frontend
└── src/             # Original frontend (legacy)
```

## Technologies

### Backend
- Node.js + Express
- SQLite + Sequelize ORM
- JWT Authentication
- RESTful API

### Frontend (Client)
- Vite
- React 19
- TypeScript
- Three.js
- @react-three/fiber
- @react-three/drei

## Getting Started

### Prerequisites

- Node.js (v20.15.0 or higher)
- npm

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Seed the database with sample data:
```bash
npm run seed
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

### Frontend (Client) Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173` (or the next available port)

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (employer/admin)
- `PUT /api/jobs/:id` - Update job (employer/admin)
- `DELETE /api/jobs/:id` - Delete job (employer/admin)

### Admin
- `GET /api/admin/employers` - Get all employers
- `GET /api/admin/workers` - Get all workers
- `PATCH /api/admin/employers/:id/verify` - Verify employer
- `PATCH /api/admin/workers/:id/verify` - Verify worker

See `README_BACKEND.md` for complete API documentation.

## Globe Visualization

The client includes an interactive 3D globe visualization (`/client/src/components/GithubGlobe.tsx`) based on the github-globe implementation:

- **Glowing blue globe** with white dots representing major cities
- **Animated connection** between Berlin, Germany and Rabat, Morocco
- **Interactive controls**: Drag to rotate, scroll to zoom
- **Auto-rotation** enabled by default

### Globe Implementation Files

- `/client/src/globe/createGlobe.ts` - Core globe creation logic
- `/client/src/components/GithubGlobe.tsx` - React component wrapper
- `/client/src/App.tsx` - Main app rendering the globe

## Development

### Backend Development
```bash
cd server
npm run dev  # Starts with --watch for auto-reload
```

### Frontend Development
```bash
cd client
npm run dev  # Vite dev server with HMR
```

### Building for Production

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview  # Preview production build
```

## Database

The backend uses SQLite (`server/database.sqlite`). To reset and seed:

```bash
cd server
npm run seed
```

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## License

MIT

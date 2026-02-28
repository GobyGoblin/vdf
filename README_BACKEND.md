# German Talent Connect - Backend Setup

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Running the Server

Start the development server:
```bash
npm run dev
```

Or start in production mode:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs

### Applications
- `POST /api/applications` - Create application (candidate only)
- `GET /api/applications/my-applications` - Get candidate's applications
- `GET /api/applications/:id` - Get single application
- `PATCH /api/applications/:id/status` - Update application status (employer/staff)
- `GET /api/applications/job/:jobId` - Get job applicants (employer)
- `GET /api/applications/employer/all` - Get all applicants (employer)

### Profiles
- `GET /api/profiles/candidate/:id` - Get candidate profile
- `PUT /api/profiles/candidate/:id` - Update candidate profile
- `GET /api/profiles/employer/:id` - Get employer profile
- `PUT /api/profiles/employer/:id` - Update employer profile
- `GET /api/profiles/candidate/:id/views` - Get profile views
- `GET /api/profiles/dashboard/stats` - Get dashboard statistics

### Documents
- `POST /api/documents` - Upload document (candidate only)
- `GET /api/documents/my-documents` - Get user's documents
- `DELETE /api/documents/:id` - Delete document
- `PATCH /api/documents/:id/verify` - Verify document (staff/admin)

### Consent Requests
- `POST /api/consent` - Create consent request (employer)
- `GET /api/consent/my-requests` - Get candidate's consent requests
- `PATCH /api/consent/:id/respond` - Respond to consent request (candidate)
- `GET /api/consent/employer/my-requests` - Get employer's sent requests

## Database

The application uses SQLite for development. The database file will be created automatically at `server/database.sqlite`.

For production, you can easily switch to PostgreSQL by updating the database configuration in `server/config/database.js`.

## Default Admin User

A default admin user is created automatically:
- Email: `admin@example.com`
- Password: `admin123`

**Important:** Change this password in production!

## Frontend Configuration

Make sure to set the API URL in your frontend `.env` file:
```
VITE_API_URL=http://localhost:3001/api
```

Or update the API_BASE_URL in `src/lib/api.ts` if you're not using environment variables.

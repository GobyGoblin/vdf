import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env FIRST
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import profilesRoutes from './routes/profiles.js';
import documentsRoutes from './routes/documents.js';
import consentRoutes from './routes/consent.js';
import insightsRoutes from './routes/insights.js';
import adminRoutes from './routes/admin.js';
import staffRoutes from './routes/staff.js';
import talentPoolRoutes from './routes/talentPool.js';
import talentDemandsRoutes from './routes/talentDemands.js';
import interviewsRoutes from './routes/interviews.js';
import quotesRoutes from './routes/quotes.js';
import candidateRoutes from './routes/candidate.js';
import publicRoutes from './routes/public.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Simple logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ─── Security Middleware ───────────────────────────────────────────────
// Helmet: sets various HTTP headers to help protect the app
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS: restrict to known origins
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8080')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting: prevent brute force
// const limiter = rateLimit({ ... });
// app.use('/api/', limiter);

// Stricter rate limit on auth endpoints
// const authLimiter = rateLimit({ ... });
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/talent-pool', talentPoolRoutes);
app.use('/api/talent-demands', talentDemandsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

// ─── Start Server ──────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Validate critical env vars
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️  WARNING: JWT_SECRET not set in .env — using fallback. Set this in production!');
    }

    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    try {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized (alter: true).');
    } catch (syncError) {
      console.warn('⚠️  Database sync warning:', syncError.message);
      console.log('Continuing with existing database structure...');
    }

    // Create default admin user if not exists
    const { User } = await import('./models/index.js');
    const bcrypt = (await import('bcryptjs')).default;

    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isVerified: true,
      });
      console.log('✅ Default admin user created (admin@example.com / admin123)');
    }

    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}/api`);
        console.log(`🔒 CORS origins: ${allowedOrigins.join(', ')}`);
        console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}\n`);
      });
    } else {
      console.log('✅ Running in Vercel environment (Serverless)');
    }
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    throw error; // Let the caller handle it
  }
};

export { startServer };

if (!process.env.VERCEL) {
  startServer();
}

export default app;

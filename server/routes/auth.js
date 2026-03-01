import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, CandidateProfile, EmployerProfile } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { getJwtSecret } from '../config/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, companyName } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (!['candidate', 'employer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists with the same role
    const existingUser = await User.findOne({ where: { email, role } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      firstName: role === 'candidate' ? firstName : null,
      lastName: role === 'candidate' ? lastName : null,
      companyName: role === 'employer' ? companyName : null,
    });

    // Create profile
    if (role === 'candidate') {
      await CandidateProfile.create({ userId: user.id });
    } else if (role === 'employer') {
      await EmployerProfile.create({
        userId: user.id,
        companyName: companyName || 'My Company',
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        verificationStatus: user.verificationStatus,
        verificationPaymentStatus: user.verificationPaymentStatus,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Register error detail:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    let { email, password, role } = req.body;
    if (typeof email === 'string') email = email.trim().toLowerCase();
    if (typeof password === 'string') password = password.trim();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log(`Login attempt for email: ${email}, role: ${role}`);
    // Prioritize exact role match, but allow fallback ONLY if no role was provided by older clients.
    let user;
    if (role) {
      user = await User.findOne({ where: { email, role } });
    } else {
      user = await User.findOne({ where: { email } });
    }

    if (!user) {
      console.log(`User not found: ${email}, role: ${role}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const storedPassword = user.password;
    if (!storedPassword) {
      console.log(`User ${user.email} has no password set`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, storedPassword);
    } catch (compareErr) {
      console.error('Password compare error:', compareErr.message);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!isValidPassword) {
      console.log(`Invalid password for user: ${user.email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Skip strict role check to avoid 403 errors if user forgot to click the right tab.
    // The frontend will automatically redirect them to the correct dashboard based on user.role.
    if (role && user.role !== role) {
      console.log(`Note: Login role mismatch (requested ${role}, actual ${user.role}). Proceeding anyway.`);
    }

    // Generate token
    console.log(`Generating token for user: ${user.email}`);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    console.log(`Login successful: ${user.email}`);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        verificationStatus: user.verificationStatus,
        verificationPaymentStatus: user.verificationPaymentStatus,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error detail:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: CandidateProfile, as: 'candidateProfile', required: false },
        { model: EmployerProfile, as: 'employerProfile', required: false },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.toJSON();
    if (userData.candidateProfile) {
      // Merge profile fields but PRESERVE user.id
      const { id: profileId, ...profileData } = userData.candidateProfile;
      Object.assign(userData, profileData);
      userData.candidateProfileId = profileId; // Optional: keep it as a separate field
      delete userData.candidateProfile;
    }
    if (userData.employerProfile) {
      // Merge profile fields but PRESERVE user.id
      const { id: profileId, ...profileData } = userData.employerProfile;
      Object.assign(userData, profileData);
      userData.employerProfileId = profileId;
      delete userData.employerProfile;
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('Get me error detail:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;

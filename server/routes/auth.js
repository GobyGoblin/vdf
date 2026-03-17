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
    // The same email can exist under different roles (composite unique on email+role).
    // Strategy:
    //   1. Try exact email+role match (if role provided).
    //   2. If no match, find all accounts with that email and try password against each.
    let user;
    let passwordAlreadyVerified = false;

    if (role) {
      user = await User.findOne({ where: { email, role } });
    }

    if (!user) {
      // Fallback: try all accounts with this email
      const candidates = await User.findAll({ where: { email } });
      if (candidates.length === 0) {
        console.log(`User not found: ${email}`);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      for (const candidate of candidates) {
        if (candidate.password) {
          try {
            const matches = await bcrypt.compare(password, candidate.password);
            if (matches) {
              user = candidate;
              passwordAlreadyVerified = true;
              break;
            }
          } catch (e) { /* skip */ }
        }
      }
    }

    if (!user) {
      console.log(`No matching account for: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If user was found by exact role match, we still need to verify password
    if (!passwordAlreadyVerified) {
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
        showReactivationPopup: user.showReactivationPopup,
        isHiddenByUnresponsiveness: user.isHiddenByUnresponsiveness,
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
    
    if (user) {
      console.log(`[ME] User ${user.email} - Hidden: ${user.isHiddenByUnresponsiveness}, Deactivated: ${user.isDeactivated}`);
      if (user.isHiddenByUnresponsiveness) {
        console.log(`[ME] Reactivating user ${user.email}...`);
        await user.update({
          isDeactivated: false,
          isHiddenByUnresponsiveness: false,
          showReactivationPopup: true,
          lastActiveAt: new Date()
        });
        await user.reload();
        console.log(`[ME] Reactivation complete for ${user.email}. Popup: ${user.showReactivationPopup}`);
      } else {
        await user.update({ lastActiveAt: new Date() });
      }
    }

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

router.post('/acknowledge-reactivation', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      await user.update({ showReactivationPopup: false });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

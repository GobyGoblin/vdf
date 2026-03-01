import express from 'express';
import bcrypt from 'bcryptjs';
import { User, CandidateProfile, EmployerProfile } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Get all employers
router.get('/employers', async (req, res) => {
  try {
    const employers = await User.findAll({
      where: { role: 'employer' },
      include: [
        {
          model: EmployerProfile,
          as: 'employerProfile',
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ employers });
  } catch (error) {
    console.error('Get employers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all workers/candidates
router.get('/workers', async (req, res) => {
  try {
    const workers = await User.findAll({
      where: { role: 'candidate' },
      include: [
        {
          model: CandidateProfile,
          as: 'candidateProfile',
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ workers });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify/Unverify employer
router.patch('/employers/:id/verify', async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user || user.role !== 'employer') {
      return res.status(404).json({ error: 'Employer not found' });
    }

    const targetIsVerified = isVerified !== undefined ? isVerified : true;
    await user.update({
      isVerified: targetIsVerified,
      verificationStatus: targetIsVerified ? 'verified' : (user.verificationStatus === 'verified' ? 'unverified' : user.verificationStatus)
    });

    const updatedUser = await User.findByPk(user.id, {
      include: [
        {
          model: EmployerProfile,
          as: 'employerProfile',
        },
      ],
    });

    res.json({ employer: updatedUser });
  } catch (error) {
    console.error('Verify employer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify/Unverify worker
router.patch('/workers/:id/verify', async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user || user.role !== 'candidate') {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const targetIsVerified = isVerified !== undefined ? isVerified : true;
    await user.update({
      isVerified: targetIsVerified,
      verificationStatus: targetIsVerified ? 'verified' : (user.verificationStatus === 'verified' ? 'unverified' : user.verificationStatus)
    });

    const updatedUser = await User.findByPk(user.id, {
      include: [
        {
          model: CandidateProfile,
          as: 'candidateProfile',
        },
      ],
    });

    res.json({ worker: updatedUser });
  } catch (error) {
    console.error('Verify worker error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const { Insight, TalentDemand, QuoteRequest } = await import('../models/index.js');
    const totalUsers = await User.count();
    const totalEmployers = await User.count({ where: { role: 'employer' } });
    const totalWorkers = await User.count({ where: { role: 'candidate' } });
    const totalInsights = await Insight.count({ where: { published: true } });
    const totalDemands = await TalentDemand.count();
    const totalQuotes = await QuoteRequest.count();

    const statsResult = {
      totalUsers,
      totalEmployers,
      totalWorkers,
      totalInsights,
      totalDemands,
      totalQuotes
    };

    console.log("SENDING ADMIN STATS:", statsResult);

    res.json(statsResult);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Create User (Admin only, allows creating Staff)
router.post('/users', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, companyName } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const validRoles = ['candidate', 'employer', 'staff', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await User.findOne({ where: { email, role } });
    if (existingUser) {
      return res.status(400).json({ error: `User already exists with this email for the ${role} role` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      companyName,
      isVerified: false,
      verificationStatus: 'unverified',
      profileComplete: false
    });

    if (role === 'candidate') {
      await CandidateProfile.create({ userId: user.id });
    } else if (role === 'employer') {
      await EmployerProfile.create({
        userId: user.id,
        companyName: companyName || 'My Company',
      });
    }

    // Return the newly created user (without password)
    const newUser = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update User (Admin only)
router.put('/users/:id', async (req, res) => {
  try {
    const { firstName, lastName, companyName, role, isVerified } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetIsVerified = isVerified !== undefined ? isVerified : user.isVerified;
    await user.update({
      firstName,
      lastName,
      companyName,
      isVerified: targetIsVerified,
      verificationStatus: targetIsVerified ? 'verified' : (user.verificationStatus === 'verified' ? 'unverified' : user.verificationStatus)
    });

    const updatedUser = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete User (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete associated profiles first depending on role
    if (user.role === 'candidate') {
      await CandidateProfile.destroy({ where: { userId: user.id } });
    } else if (user.role === 'employer') {
      await EmployerProfile.destroy({ where: { userId: user.id } });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/worker/:id/badge', async (req, res) => {
  try {
    const { badgeType } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user || user.role !== 'candidate') {
      return res.status(404).json({ error: 'Worker not found' });
    }
    await user.update({ badgeType });

    // Include CandidateProfile for the frontend response
    const updatedUser = await User.findByPk(user.id, {
      include: [
        {
          model: CandidateProfile,
          as: 'candidateProfile',
        },
      ],
    });

    res.json({ worker: updatedUser });
  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/audit-logs', async (req, res) => {
  try {
    const { AuditLog } = await import('../models/index.js');
    const logs = await AuditLog.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const formattedLogs = logs.map(l => ({
      id: l.id,
      action: l.action,
      details: l.details,
      user: l.user ? {
        name: `${l.user.firstName || ''} ${l.user.lastName || ''}`.trim() || l.user.email,
        email: l.user.email
      } : { name: 'System', email: 'system@vh.com' },
      timestamp: l.createdAt
    }));

    // Add some mock logs if empty, just for UX as requested
    if (formattedLogs.length === 0) {
      formattedLogs.push({
        id: '1',
        action: 'auth_login',
        details: 'User logged in successfully',
        user: { name: 'System Admin', email: 'admin@example.com' },
        timestamp: new Date().toISOString()
      });
    }

    res.json({ logs: formattedLogs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/retention-stats', async (req, res) => {
  try {
    res.json({
      userGrowth: [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 600 },
        { name: 'Mar', value: 800 },
        { name: 'Apr', value: 1200 },
        { name: 'May', value: 1500 },
        { name: 'Jun', value: 2000 },
      ],
      demandGrowth: [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 150 },
        { name: 'Mar', value: 200 },
        { name: 'Apr', value: 350 },
        { name: 'May', value: 400 },
        { name: 'Jun', value: 550 },
      ],
      quoteGrowth: [
        { name: 'Jan', value: 300 },
        { name: 'Feb', value: 500 },
        { name: 'Mar', value: 800 },
        { name: 'Apr', value: 1400 },
        { name: 'May', value: 1800 },
        { name: 'Jun', value: 2800 },
      ],
      retentionRate: 85,
      churnRate: 15,
      activeUsers: 1850,
    });
  } catch (error) {
    console.error('Get retention stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import express from 'express';
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

    await user.update({ isVerified: isVerified !== undefined ? isVerified : true });

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

    await user.update({ isVerified: isVerified !== undefined ? isVerified : true });

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
    const totalUsers = await User.count();
    const totalEmployers = await User.count({ where: { role: 'employer' } });
    const totalWorkers = await User.count({ where: { role: 'candidate' } });
    const totalInsights = await (await import('../models/index.js')).Insight.count({ where: { published: true } });

    res.json({
      totalUsers,
      totalEmployers,
      totalWorkers,
      totalInsights,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

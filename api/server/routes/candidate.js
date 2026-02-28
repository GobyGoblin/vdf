import express from 'express';
import { Plan } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all plans (public)
router.get('/plans', async (req, res) => {
    try {
        const plans = await Plan.findAll({
            order: [['price', 'ASC']]
        });
        res.json({ plans });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Subscribe to plan (candidate only)
router.post('/subscribe/:planId', authenticate, authorize('candidate'), async (req, res) => {
    try {
        const { planId } = req.params;
        const plan = await Plan.findByPk(planId);

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Update user's plan and badge
        const { User } = await import('../models/index.js');
        const user = await User.findByPk(req.user.id);
        await user.update({
            badgeType: plan.badgeType,
            profileProgress: 100 // Example logic
        });

        res.json({ success: true, message: `Successfully subscribed to ${plan.name}` });
    } catch (error) {
        console.error('Subscribe plan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

import express from 'express';
import crypto from 'crypto';
import { User, QuoteRequest, AuditLog, EmployerCandidateRel } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Op } from 'sequelize';
import { anonymizeCandidate } from '../utils/anonymize.js';

const router = express.Router();
router.use(authenticate);

// (Helper moved to server/utils/anonymize.js)
const anonymize = (candidate, role = 'employer') => anonymizeCandidate(candidate, role);

// ── Create quote request (employer) ────────────────────────────────────
router.post('/', authorize('employer'), async (req, res) => {
    try {
        const me = await User.findByPk(req.user.id);
        if (!me?.isVerified) return res.status(403).json({ error: 'Verified account required' });

        const { candidateId } = req.body;

        const existing = await QuoteRequest.findOne({
            where: {
                candidateId,
                employerId: req.user.id,
                status: { [Op.in]: ['pending', 'approved'] },
            },
        });
        if (existing) return res.status(409).json({ error: 'Quote request already exists' });

        const request = await QuoteRequest.create({
            employerId: req.user.id,
            candidateId,
            status: 'pending',
            requestedAt: new Date(),
        });

        res.status(201).json({ request });
    } catch (err) {
        console.error('Create quote error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── List all quotes (staff) ────────────────────────────────────────────
router.get('/all', authorize('staff', 'admin'), async (req, res) => {
    try {
        const requests = await QuoteRequest.findAll({
            include: [
                { model: User, as: 'candidate', attributes: { exclude: ['password'] } },
                { model: User, as: 'employer', attributes: { exclude: ['password'] } },
            ],
            order: [['createdAt', 'DESC']],
        });
        res.json({ requests });
    } catch (err) {
        console.error('List all quotes error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Resolve quote (staff) ──────────────────────────────────────────────
router.put('/:id/resolve', authorize('staff', 'admin'), async (req, res) => {
    try {
        const { status, costEstimate } = req.body;
        const request = await QuoteRequest.findByPk(req.params.id);
        if (!request) return res.status(404).json({ error: 'Quote request not found' });

        const updates = { status, costEstimate, resolvedAt: new Date() };

        if (status === 'approved') {
            updates.options = [
                {
                    id: crypto.randomUUID(),
                    name: 'Essential Package',
                    costEstimate: costEstimate || '€10,000 - €12,000',
                    perks: ['Standard Placement', 'Basic Support'],
                    items: [
                        { label: 'Placement Fee', amount: 8000, description: 'Recruitment & Vetting' },
                        { label: 'Admin Fee', amount: 2000, description: 'Processing & Compliance' },
                    ],
                },
                {
                    id: crypto.randomUUID(),
                    name: 'Executive Package',
                    costEstimate: '€15,000 - €18,000',
                    perks: ['Priority Support', 'Relocation Assistance', 'Onboarding Package'],
                    items: [
                        { label: 'Placement Fee', amount: 10000, description: 'Premium Sourcing' },
                        { label: 'Relocation Support', amount: 4000, description: 'Logistics & Housing' },
                        { label: 'Integration Package', amount: 2000, description: 'Cultural Training' },
                    ],
                },
            ];
        }

        await request.update(updates);

        await AuditLog.create({
            userId: req.user.id,
            action: 'QUOTE_RESOLVED',
            details: `Quote request ${req.params.id} ${status}`,
            ipAddress: req.ip,
        });

        res.json({ request });
    } catch (err) {
        console.error('Resolve quote error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── My quotes (employer) ───────────────────────────────────────────────
router.get('/my', authorize('employer'), async (req, res) => {
    try {
        const requests = await QuoteRequest.findAll({
            where: { employerId: req.user.id },
            include: [
                { model: User, as: 'candidate', attributes: { exclude: ['password'] } },
                { model: User, as: 'altCandidate', attributes: { exclude: ['password'] } }
            ],
            order: [['createdAt', 'DESC']],
        });
        const enriched = requests.map(r => {
            const plain = r.toJSON();
            plain.candidate = anonymizeCandidate(plain.candidate, req.user.role);
            if (plain.altCandidate) {
                plain.altCandidate = anonymizeCandidate(plain.altCandidate, req.user.role);
            }
            return plain;
        });
        res.json({ requests: enriched });
    } catch (err) {
        console.error('My quotes error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Get quote by ID ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const request = await QuoteRequest.findByPk(req.params.id, {
            include: [
                { model: User, as: 'candidate', attributes: { exclude: ['password'] } },
                { model: User, as: 'employer', attributes: { exclude: ['password'] } },
                { model: User, as: 'altCandidate', attributes: { exclude: ['password'] } },
            ],
        });
        if (!request) return res.status(404).json({ error: 'Quote not found' });

        // Only allow owner or staff
        if (req.user.role === 'employer' && request.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const plain = request.toJSON();
        plain.candidate = anonymizeCandidate(plain.candidate, req.user.role);
        if (plain.altCandidate) {
            plain.altCandidate = anonymizeCandidate(plain.altCandidate, req.user.role);
        }
        res.json({ request: plain });
    } catch (err) {
        console.error('Get quote error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Select option (employer) ───────────────────────────────────────────
router.put('/:id/select-option', authorize('employer'), async (req, res) => {
    try {
        const request = await QuoteRequest.findOne({
            where: { id: req.params.id, employerId: req.user.id },
        });
        if (!request) return res.status(404).json({ error: 'Quote not found' });
        if (!request.options?.length) return res.status(400).json({ error: 'No options available' });

        const { optionId } = req.body;
        const updatedOptions = request.options.map(opt => ({
            ...opt,
            selected: opt.id === optionId,
        }));

        await request.update({ 
            options: updatedOptions, 
            selectedOptionId: optionId,
            status: request.status === 'candidate_unresponsive' ? 'candidate_unresponsive' : 'approved'
        });

        await AuditLog.create({
            userId: req.user.id,
            action: 'QUOTE_OPTION_SELECTED',
            details: `Selected option ${optionId} for quote ${req.params.id}`,
            ipAddress: req.ip,
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Select option error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Cancel quote (employer) ───────────────────────────────────────────
router.put('/:id/cancel', authorize('employer'), async (req, res) => {
    try {
        const request = await QuoteRequest.findOne({
            where: { id: req.params.id, employerId: req.user.id }
        });

        if (!request) return res.status(404).json({ error: 'Quote not found' });
        
        // Remove the quote completely so they can request it again if they change their mind
        await request.destroy(); 

        // Revert candidate relation status back to 'saved' so they show up normally again
        const rel = await EmployerCandidateRel.findOne({
            where: { candidateId: request.candidateId, employerId: req.user.id }
        });
        
        if (rel) {
             await rel.update({ status: 'saved' });
        }

        await AuditLog.create({
            userId: req.user.id,
            action: 'QUOTE_CANCELLED',
            details: `Employer cancelled quote ${req.params.id}`,
            ipAddress: req.ip,
        });

        res.json({ success: true, message: 'Quote cancelled successfully' });
    } catch (err) {
        console.error('Cancel quote error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

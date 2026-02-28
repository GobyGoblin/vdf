import express from 'express';
import crypto from 'crypto';
import { User, TalentDemand, QuoteRequest, AuditLog, CandidateProfile } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();
router.use(authenticate);

// ── Helper: anonymize candidate for employers ──────────────────────────
const anonymize = (candidate) => {
    if (!candidate) return null;
    const plain = typeof candidate.toJSON === 'function' ? candidate.toJSON() : { ...candidate };
    plain.fullName = `${plain.firstName || ''} ${plain.lastName || ''}`.trim() || 'Candidate';
    plain.email = '********@germantalent.de';

    delete plain.password;
    delete plain.avatarUrl;
    delete plain.address;
    delete plain.nationality;
    delete plain.birthDate;

    if (plain.candidateProfile) {
        delete plain.candidateProfile.phone;
        delete plain.candidateProfile.address;
        delete plain.candidateProfile.city;
        delete plain.candidateProfile.country;
    }

    return plain;
};

// ── Create demand (employer only) ──────────────────────────────────────
router.post('/', authorize('employer'), async (req, res) => {
    try {
        const me = await User.findByPk(req.user.id);
        if (!me?.isVerified) return res.status(403).json({ error: 'Verification required' });

        const demand = await TalentDemand.create({
            employerId: req.user.id,
            title: req.body.title || 'Untitled Demand',
            sector: req.body.sector || 'General',
            description: req.body.description || '',
            requiredSkills: req.body.requiredSkills || [],
            experienceLevel: req.body.experienceLevel || 'mid',
            salaryRange: req.body.salaryRange || 'Competitive',
            locationPreference: req.body.locationPreference,
            urgency: req.body.urgency || 'medium',
            headcount: req.body.headcount || 1,
            remotePreference: req.body.remotePreference || 'onsite',
            duration: req.body.duration,
            visaSupport: !!req.body.visaSupport,
            status: 'open',
        });

        await AuditLog.create({
            userId: req.user.id,
            action: 'TALENT_DEMAND_CREATED',
            details: `Created talent demand: ${demand.title}`,
            ipAddress: req.ip,
        });

        res.status(201).json({ demand });
    } catch (err) {
        console.error('Create demand error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── My demands (employer) ──────────────────────────────────────────────
router.get('/my', authorize('employer'), async (req, res) => {
    try {
        const demands = await TalentDemand.findAll({
            where: { employerId: req.user.id },
            order: [['createdAt', 'DESC']],
        });
        res.json({ demands });
    } catch (err) {
        console.error('My demands error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Get all demands (staff only) ───────────────────────────────────────
router.get('/', authorize('staff', 'admin'), async (req, res) => {
    try {
        const demands = await TalentDemand.findAll({
            include: [{ model: User, as: 'employer', attributes: ['id', 'firstName', 'lastName', 'companyName'] }],
            order: [['createdAt', 'DESC']],
        });
        res.json({ demands });
    } catch (err) {
        console.error('Get all demands error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Delete demand ──────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const demand = await TalentDemand.findByPk(req.params.id);
        if (!demand) return res.status(404).json({ error: 'Demand not found' });
        if (req.user.role === 'employer' && demand.employerId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await demand.destroy();
        res.json({ success: true });
    } catch (err) {
        console.error('Delete demand error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Suggest candidate for demand (staff) ───────────────────────────────
router.post('/:id/suggest', authorize('staff', 'admin'), async (req, res) => {
    try {
        const demand = await TalentDemand.findByPk(req.params.id);
        if (!demand) return res.status(404).json({ error: 'Demand not found' });

        const { candidateId } = req.body;
        const ids = demand.suggestedCandidateIds || [];

        if (!ids.includes(candidateId)) {
            ids.push(candidateId);
            await demand.update({ suggestedCandidateIds: ids });

            // Auto-create approved quote
            await QuoteRequest.create({
                employerId: demand.employerId,
                candidateId,
                status: 'approved',
                requestedAt: new Date(),
                resolvedAt: new Date(),
                costEstimate: '€12,500 - €15,000 (Incl. Placement Fee)',
                items: [
                    { label: 'Placement Fee', amount: 8500, description: 'Standard recruitment and processing' },
                    { label: 'Relocation Support', amount: 2500, description: 'Logistics and initial housing assistance' },
                    { label: 'Onboarding Package', amount: 1500, description: 'Integration and visa handling fees' },
                ],
                options: [
                    {
                        id: crypto.randomUUID(),
                        name: 'Essential Placement',
                        costEstimate: '€12,500 - €15,000',
                        perks: ['Standard Placement', 'Basic Support'],
                        items: [
                            { label: 'Placement Fee', amount: 8500, description: 'Standard recruitment and processing' },
                            { label: 'Relocation Support', amount: 2500, description: 'Logistics and housing' },
                            { label: 'Onboarding Package', amount: 1500, description: 'Integration fees' },
                        ],
                    },
                    {
                        id: crypto.randomUUID(),
                        name: 'Premium Placement',
                        costEstimate: '€18,000 - €22,000',
                        perks: ['Priority Sourcing', 'Full Relocation', 'Premium Onboarding', 'Visa Fast-track'],
                        items: [
                            { label: 'Placement Fee', amount: 12000, description: 'Premium recruitment' },
                            { label: 'Relocation Support', amount: 4500, description: 'VIP Housing & Logistics' },
                            { label: 'Integration Package', amount: 2500, description: 'Language & Culture Intensive' },
                        ],
                    },
                ],
            });
        }

        res.json({ success: true, demand });
    } catch (err) {
        console.error('Suggest candidate error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Add manual profile (staff) ─────────────────────────────────────────
router.post('/:id/manual-profile', authorize('staff', 'admin'), async (req, res) => {
    try {
        const demand = await TalentDemand.findByPk(req.params.id);
        if (!demand) return res.status(404).json({ error: 'Demand not found' });

        const profile = req.body;
        const names = (profile.fullName || 'External Match').split(' ');
        const candidateId = `ext-${crypto.randomUUID().slice(0, 9)}`;

        const hashedPassword = await bcrypt.hash('password123', 10);
        const newCandidate = await User.create({
            id: candidateId,
            email: profile.email || `${candidateId}@germantalent.de`,
            password: hashedPassword,
            role: 'candidate',
            firstName: names[0],
            lastName: names.length > 1 ? names.slice(1).join(' ') : 'Ext Match',
            isVerified: true,
            badgeType: profile.badgeType || 'none',
            sector: profile.sector || 'Expert',
            yearsOfExperience: profile.yearsOfExperience || '5+ Years',
            nationality: profile.nationality || 'International',
        });

        // Create profile
        await CandidateProfile.create({
            userId: candidateId,
            skills: profile.skills || [],
            bio: profile.experience || 'Candidate curated through external sourcing.',
        });

        // Link to demand
        const ids = demand.suggestedCandidateIds || [];
        if (!ids.includes(candidateId)) {
            ids.push(candidateId);
            await demand.update({ suggestedCandidateIds: ids });
        }

        // Auto create approved quote
        await QuoteRequest.create({
            employerId: demand.employerId,
            candidateId,
            status: 'approved',
            requestedAt: new Date(),
            resolvedAt: new Date(),
            costEstimate: '€10,000 - €14,000 (Incl. Placement Fee)',
            items: [
                { label: 'Placement Fee', amount: 7500, description: 'External sourcing and vetting' },
                { label: 'Relocation Package', amount: 2000, description: 'Visa and flight support' },
                { label: 'Onboarding Service', amount: 1500, description: 'Integration assistance' },
            ],
            options: [
                {
                    id: crypto.randomUUID(),
                    name: 'Core Sourcing',
                    costEstimate: '€10,000 - €14,000',
                    perks: ['Verified External Profile', 'Standard Support'],
                    items: [
                        { label: 'Sourcing Fee', amount: 7500, description: 'External talent acquisition' },
                        { label: 'Identity Verification', amount: 1000, description: 'Background check & docs' },
                        { label: 'Basic Onboarding', amount: 1500, description: 'Integration support' },
                    ],
                },
                {
                    id: crypto.randomUUID(),
                    name: 'Full Support Sourcing',
                    costEstimate: '€16,000 - €20,000',
                    perks: ['VIP Support', 'Priority Visa Processing', 'Language Training', 'Housing Support'],
                    items: [
                        { label: 'Sourcing Fee', amount: 8000, description: 'Exclusive talent sourcing' },
                        { label: 'Immigration Support', amount: 5000, description: 'Full visa and housing logistics' },
                        { label: 'Integration Package', amount: 3000, description: 'Language & Cultural immersion' },
                    ],
                },
            ],
        });

        const result = newCandidate.toJSON();
        delete result.password;
        res.status(201).json({ success: true, profile: result });
    } catch (err) {
        console.error('Add manual profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Update demand status (staff) ───────────────────────────────────────
router.put('/:id/status', authorize('staff', 'admin'), async (req, res) => {
    try {
        const demand = await TalentDemand.findByPk(req.params.id);
        if (!demand) return res.status(404).json({ error: 'Demand not found' });

        await demand.update({ status: req.body.status });
        res.json({ success: true, demand });
    } catch (err) {
        console.error('Update demand status error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Get suggested candidates for demand ────────────────────────────────
router.get('/:id/suggested', async (req, res) => {
    try {
        const demand = await TalentDemand.findByPk(req.params.id);
        if (!demand) return res.status(404).json({ error: 'Demand not found' });

        const ids = demand.suggestedCandidateIds || [];
        if (ids.length === 0) return res.json({ candidates: [] });

        const candidates = await User.findAll({
            where: { id: ids },
            attributes: { exclude: ['password'] },
            include: [{ model: CandidateProfile, as: 'candidateProfile', required: false }],
        });

        const result = req.user.role === 'employer'
            ? candidates.map(anonymize)
            : candidates;

        res.json({ candidates: result });
    } catch (err) {
        console.error('Suggested candidates error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

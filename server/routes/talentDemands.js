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
        let ids = demand.suggestedCandidateIds || [];
        if (typeof ids === 'string') {
            try { ids = JSON.parse(ids); } catch(e) { ids = []; }
        }

        if (!ids.includes(candidateId)) {
            const newIds = [...ids, candidateId];
            demand.suggestedCandidateIds = newIds;
            demand.changed('suggestedCandidateIds', true); // Force sequelize to recognize JSON change
            await demand.save();

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
        
        // Check if a candidate with this email already exists
        const emailToUse = profile.email ? profile.email.toLowerCase().trim() : null;
        if (emailToUse) {
            const existing = await User.findOne({ where: { email: emailToUse, role: 'candidate' } });
            if (existing) {
                // If they already exist, just link them to the demand!
                let ids = demand.suggestedCandidateIds || [];
                if (typeof ids === 'string') {
                    try { ids = JSON.parse(ids); } catch(e) { ids = []; }
                }
                if (!ids.includes(existing.id)) {
                    demand.suggestedCandidateIds = [...ids, existing.id];
                    demand.changed('suggestedCandidateIds', true);
                    await demand.save();
                }
                const result = existing.toJSON();
                delete result.password;
                return res.status(200).json({ success: true, profile: result, message: 'Existing candidate re-linked to manifest.' });
            }
        }

        const fName = profile.firstName || 'External';
        const lName = profile.lastName || 'Match';
        const candidateId = `ext-${crypto.randomUUID().slice(0, 9)}`;

        const generatedPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        
        let newCandidate;
        try {
            newCandidate = await User.create({
                id: candidateId,
                email: emailToUse || `${candidateId}@germantalent.de`,
                password: hashedPassword,
                role: 'candidate',
                firstName: fName,
                lastName: lName,
                isVerified: true,
                badgeType: profile.badgeType || 'none',
                sector: profile.sector || 'Expert',
                yearsOfExperience: profile.yearsOfExperience || '5+ Years',
                nationality: profile.nationality || 'International',
            });
        } catch (dbError) {
            if (dbError.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ error: 'A candidate with this email already exists in the system.' });
            }
            throw dbError; // Rethrow to be caught by the outer catch
        }

        // Create profile
        await CandidateProfile.create({
            userId: candidateId,
            skills: profile.skills || [],
            bio: profile.experience || 'Candidate curated through external sourcing.',
            phone: profile.phone || null,
            linkedIn: profile.linkedIn || null,
        });

        // Link to demand
        let ids = demand.suggestedCandidateIds || [];
        if (typeof ids === 'string') {
            try { ids = JSON.parse(ids); } catch(e) { ids = []; }
        }

        if (!ids.includes(candidateId)) {
            const newIds = [...ids, candidateId];
            demand.suggestedCandidateIds = newIds;
            demand.changed('suggestedCandidateIds', true); // Force sequelize to recognize JSON change
            await demand.save();
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
        res.status(201).json({ success: true, profile: result, generatedPassword });
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

// ── Remove candidate from manifest (staff/admin) ───────────────────────
router.delete('/:id/candidates/:candidateId', authorize('staff', 'admin'), async (req, res) => {
    try {
        const demand = await TalentDemand.findByPk(req.params.id);
        if (!demand) return res.status(404).json({ error: 'Demand not found' });

        let ids = demand.suggestedCandidateIds || [];
        if (typeof ids === 'string') {
            try { ids = JSON.parse(ids); } catch(e) { ids = []; }
        }

        const updated = ids.filter(cid => cid !== req.params.candidateId);
        demand.suggestedCandidateIds = updated;
        demand.changed('suggestedCandidateIds', true);
        await demand.save();

        res.json({ success: true, suggestedCandidateIds: updated });
    } catch (err) {
        console.error('Remove candidate error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Update specific candidate quote (staff/admin) ──────────────────────
router.put('/:id/candidates/:candidateId/quote', authorize('staff', 'admin'), async (req, res) => {
    try {
        const demand = await TalentDemand.findByPk(req.params.id);
        if (!demand) return res.status(404).json({ error: 'Demand not found' });

        const { costEstimate } = req.body;
        let quote = await QuoteRequest.findOne({ 
            where: { employerId: demand.employerId, candidateId: req.params.candidateId } 
        });

        if (!quote) {
            quote = await QuoteRequest.create({
                employerId: demand.employerId,
                candidateId: req.params.candidateId,
                status: 'approved',
                requestedAt: new Date(),
                resolvedAt: new Date(),
                costEstimate: costEstimate,
                items: [
                    { label: 'Placement Fee', amount: 8500, description: 'Standard recruitment and processing' },
                    { label: 'Relocation Support', amount: 2500, description: 'Logistics and initial housing assistance' },
                    { label: 'Onboarding Package', amount: 1500, description: 'Integration and visa handling fees' },
                ],
                options: [
                    {
                        id: crypto.randomUUID(),
                        name: 'Custom Placement',
                        costEstimate: costEstimate,
                        perks: ['Standard Placement', 'Basic Support'],
                        items: [
                            { label: 'Placement Fee', amount: 8500, description: 'Standard recruitment and processing' },
                            { label: 'Relocation Support', amount: 2500, description: 'Logistics and housing' },
                            { label: 'Onboarding Package', amount: 1500, description: 'Integration fees' },
                        ],
                    }
                ],
            });
        }

        quote.costEstimate = costEstimate;
        let options = quote.options || [];
        // Update the string on the options as well so the frontend displays the new amount
        for (let opt of options) {
            opt.costEstimate = costEstimate;
        }
        quote.options = options;
        quote.changed('options', true);
        await quote.save();
        return res.json({ success: true, quote });
    } catch (err) {
        console.error('Update quote error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Set manifest value (staff/admin) ───────────────────────────────────
router.put('/:id/manifest-value', authorize('staff', 'admin'), async (req, res) => {
    try {
        const demand = await TalentDemand.findByPk(req.params.id);
        if (!demand) return res.status(404).json({ error: 'Demand not found' });

        await demand.update({ manifestValue: req.body.manifestValue });
        res.json({ success: true, manifestValue: req.body.manifestValue });
    } catch (err) {
        console.error('Set manifest value error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Finalize bundle (staff/admin) ──────────────────────────────────────
router.post('/:id/finalize', authorize('staff', 'admin'), async (req, res) => {
    try {
        const demand = await TalentDemand.findByPk(req.params.id);
        if (!demand) return res.status(404).json({ error: 'Demand not found' });

        let ids = demand.suggestedCandidateIds || [];
        if (typeof ids === 'string') {
            try { ids = JSON.parse(ids); } catch (e) { ids = []; }
        }

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Cannot finalize an empty manifest. Add at least one candidate.' });
        }

        await demand.update({
            status: 'treated',
            finalizedAt: new Date(),
            manifestValue: req.body.manifestValue || demand.manifestValue,
        });

        await AuditLog.create({
            userId: req.user.id,
            action: 'DEMAND_FINALIZED',
            details: `${req.user.email} finalized demand "${demand.title}" with ${demand.suggestedCandidateIds.length} candidate(s). Value: ${demand.manifestValue || 'unset'}`,
            ipAddress: req.ip,
        });

        res.json({ success: true, demand });
    } catch (err) {
        console.error('Finalize bundle error:', err);
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

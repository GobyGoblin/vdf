import express from 'express';
import { User, Document, QuoteRequest, EmployerCandidateRel, AuditLog, TalentDemand, CandidateProfile } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// All talent pool routes require authentication
router.use(authenticate);

// ── Helper: anonymize candidate for employers ──────────────────────────
const anonymize = (candidate) => {
    if (!candidate) return null;
    const plain = typeof candidate.toJSON === 'function' ? candidate.toJSON() : { ...candidate };

    // The employer should see the name, but no personal contact/identifying information
    plain.fullName = `${plain.firstName || ''} ${plain.lastName || ''}`.trim() || 'Candidate';
    plain.email = '********@germantalent.de';

    // Remove PI from User
    delete plain.password;
    delete plain.avatarUrl;
    delete plain.address;
    delete plain.nationality;
    delete plain.birthDate;

    // Remove PI from CandidateProfile
    if (plain.candidateProfile) {
        delete plain.candidateProfile.phone;
        delete plain.candidateProfile.address;
        delete plain.candidateProfile.city;
        delete plain.candidateProfile.country;
    }

    return plain;
};

// ── Browse candidates ──────────────────────────────────────────────────
router.get('/candidates', async (req, res) => {
    try {
        if (req.user.role === 'employer') {
            const me = await User.findByPk(req.user.id);
            if (!me?.isVerified) return res.json({ candidates: [] });
        }

        const where = { role: 'candidate' };
        if (req.query.verified === 'true') where.isVerified = true;

        let candidates = await User.findAll({
            where,
            attributes: { exclude: ['password'] },
            include: [{ model: CandidateProfile, as: 'candidateProfile', required: false }],
        });

        let result = candidates.map(c => c.toJSON());

        // Filter by skills (from profile)
        if (req.query.skills) {
            const skillArr = req.query.skills.split(',').map(s => s.trim().toLowerCase());
            result = result.filter(c => {
                const skills = c.candidateProfile?.skills || [];
                return skills.some(s => skillArr.some(f => s.toLowerCase().includes(f)));
            });
        }

        if (req.user.role === 'employer') {
            result = result.map(anonymize);
        }

        res.json({ candidates: result });
    } catch (err) {
        console.error('Get candidates error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Get single candidate ───────────────────────────────────────────────
router.get('/candidates/:id', async (req, res) => {
    try {
        if (req.user.role === 'employer') {
            const me = await User.findByPk(req.user.id);
            if (!me?.isVerified) return res.status(403).json({ error: 'Verified account required' });
        }

        const candidate = await User.findOne({
            where: { id: req.params.id, role: 'candidate' },
            attributes: { exclude: ['password'] },
            include: [{ model: CandidateProfile, as: 'candidateProfile', required: false }],
        });
        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

        let docs = [];
        if (req.user.role !== 'employer') {
            docs = await Document.findAll({
                where: { userId: req.params.id, status: 'verified' },
            });
        }

        const result = req.user.role === 'employer'
            ? anonymize(candidate)
            : candidate.toJSON();

        res.json({ candidate: result, documents: docs });
    } catch (err) {
        console.error('Get candidate error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Request quote ──────────────────────────────────────────────────────
router.post('/quotes', authorize('employer'), async (req, res) => {
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
        console.error('Request quote error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── My quote requests ──────────────────────────────────────────────────
router.get('/my-quotes', authorize('employer'), async (req, res) => {
    try {
        const me = await User.findByPk(req.user.id);
        if (!me?.isVerified) return res.json({ requests: [] });

        const requests = await QuoteRequest.findAll({
            where: { employerId: req.user.id },
            include: [{ model: User, as: 'candidate', attributes: { exclude: ['password'] } }],
            order: [['createdAt', 'DESC']],
        });

        const enriched = requests.map(r => {
            const plain = r.toJSON();
            plain.candidate = anonymize(plain.candidate);
            return plain;
        });

        res.json({ requests: enriched });
    } catch (err) {
        console.error('My quotes error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Get quote request by ID ────────────────────────────────────────────
router.get('/quotes/:id', authorize('employer'), async (req, res) => {
    try {
        const request = await QuoteRequest.findOne({
            where: { id: req.params.id, employerId: req.user.id },
            include: [{ model: User, as: 'candidate', attributes: { exclude: ['password'] } }],
        });
        if (!request) return res.status(404).json({ error: 'Quote request not found' });

        const plain = request.toJSON();
        plain.candidate = anonymize(plain.candidate);
        res.json({ request: plain });
    } catch (err) {
        console.error('Get quote error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Select quote option ────────────────────────────────────────────────
router.put('/quotes/:id/select-option', authorize('employer'), async (req, res) => {
    try {
        const request = await QuoteRequest.findOne({
            where: { id: req.params.id, employerId: req.user.id },
        });
        if (!request) return res.status(404).json({ error: 'Quote request not found' });
        if (!request.options?.length) return res.status(400).json({ error: 'No options available' });

        const { optionId } = req.body;
        const updatedOptions = request.options.map(opt => ({
            ...opt,
            selected: opt.id === optionId,
        }));

        await request.update({ options: updatedOptions, selectedOptionId: optionId });

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

// ── Update candidate pipeline status ───────────────────────────────────
router.put('/relations/:candidateId/status', async (req, res) => {
    try {
        const { status, employerId } = req.body;
        const effectiveEmployerId = employerId || (req.user.role === 'employer' ? req.user.id : undefined);
        if (!effectiveEmployerId) return res.status(400).json({ error: 'Employer ID required' });

        let rel = await EmployerCandidateRel.findOne({
            where: { employerId: effectiveEmployerId, candidateId: req.params.candidateId },
        });

        if (rel) {
            await rel.update({ status });
        } else {
            rel = await EmployerCandidateRel.create({
                employerId: effectiveEmployerId,
                candidateId: req.params.candidateId,
                status,
            });
        }

        await AuditLog.create({
            userId: req.user.id,
            action: 'CANDIDATE_STATUS_UPDATED',
            details: `Updated candidate ${req.params.candidateId} status to ${status}`,
            ipAddress: req.ip,
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── My pipeline relations ──────────────────────────────────────────────
router.get('/my-relations', authorize('employer'), async (req, res) => {
    try {
        const relations = await EmployerCandidateRel.findAll({
            where: { employerId: req.user.id },
            include: [{ model: User, as: 'candidate', attributes: { exclude: ['password'] } }],
        });

        const enriched = relations.map(r => {
            const plain = r.toJSON();
            plain.candidate = anonymize(plain.candidate);
            return plain;
        });

        res.json({ relations: enriched });
    } catch (err) {
        console.error('My relations error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

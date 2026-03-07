import express from 'express';
import bcrypt from 'bcryptjs';
import { User, Document, AuditLog, Domain, QuoteRequest, EmployerCandidateRel, CandidateProfile, EmployerProfile } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Op } from 'sequelize';
import crypto from 'crypto';
import { anonymizeCandidate } from '../utils/anonymize.js';

const router = express.Router();

// All staff routes require authentication + staff/admin role
router.use(authenticate);
router.use(authorize('staff', 'admin'));

// ── Stats ──────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [pendingReviews, approvedToday, totalCandidates, rejectedToday] = await Promise.all([
            Document.count({ where: { status: 'pending' } }),
            Document.count({ where: { status: 'verified', verifiedAt: { [Op.gte]: today } } }),
            User.count({ where: { role: 'candidate' } }),
            Document.count({ where: { status: 'rejected' } }),
        ]);

        res.json({ pendingReviews, approvedToday, totalCandidates, rejectedToday });
    } catch (err) {
        console.error('Staff stats error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Pending Companies ──────────────────────────────────────────────────
router.get('/pending-companies', async (req, res) => {
    try {
        const companies = await User.findAll({
            where: { role: 'employer', verificationStatus: 'pending' },
            attributes: { exclude: ['password'] },
            include: [{ model: EmployerProfile, as: 'employerProfile' }]
        });
        res.json({ companies: companies.map(c => c.toJSON()) });
    } catch (err) {
        console.error('Pending companies error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Pending Reviews (documents) ────────────────────────────────────────
router.get('/pending-reviews', async (req, res) => {
    try {
        const reviews = await Document.findAll({
            where: { status: 'pending' },
            include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
        });
        res.json({ reviews: reviews.map(r => r.toJSON()) });
    } catch (err) {
        console.error('Pending reviews error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Reviews by candidate ───────────────────────────────────────────────
router.get('/reviews/:candidateId', async (req, res) => {
    try {
        const documents = await Document.findAll({ where: { userId: req.params.candidateId } });
        const candidate = await User.findByPk(req.params.candidateId, {
            attributes: { exclude: ['password'] },
        });
        res.json({ documents: documents.map(d => d.toJSON()), candidate });
    } catch (err) {
        console.error('Reviews by candidate error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Approve document ───────────────────────────────────────────────────
router.put('/documents/:docId/approve', async (req, res) => {
    try {
        const doc = await Document.findByPk(req.params.docId);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        await doc.update({ status: 'verified', verifiedAt: new Date(), verifiedBy: req.user.id });

        await AuditLog.create({
            userId: req.user.id,
            action: 'DOCUMENT_APPROVED',
            details: `Approved document: ${doc.name}`,
            ipAddress: req.ip,
        });

        res.json({ document: doc });
    } catch (err) {
        console.error('Approve document error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Reject document ────────────────────────────────────────────────────
router.put('/documents/:docId/reject', async (req, res) => {
    try {
        const doc = await Document.findByPk(req.params.docId);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        await doc.update({ status: 'rejected', verifiedBy: req.user.id });

        await AuditLog.create({
            userId: req.user.id,
            action: 'DOCUMENT_REJECTED',
            details: `Rejected document: ${doc.name}${req.body.reason ? ` - ${req.body.reason}` : ''}`,
            ipAddress: req.ip,
        });

        res.json({ document: doc });
    } catch (err) {
        console.error('Reject document error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Verify / Reject Candidate ──────────────────────────────────────────
router.put('/candidates/:id/verify', async (req, res) => {
    try {
        const { isVerified, reason, suggestedPlacementCost } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await user.update({
            isVerified,
            verificationStatus: isVerified ? 'verified' : (reason ? 'rejected' : 'unverified'),
            suggestedPlacementCost: isVerified ? suggestedPlacementCost : undefined,
        });

        await AuditLog.create({
            userId: req.user.id,
            action: isVerified ? 'USER_VERIFIED' : 'USER_REJECTED',
            details: `${isVerified ? 'Verified' : 'Rejected'} candidate: ${user.lastName}${suggestedPlacementCost ? ` - Cost: ${suggestedPlacementCost}` : ''}${reason ? ` - Reason: ${reason}` : ''}`,
            ipAddress: req.ip,
        });

        const result = user.toJSON();
        delete result.password;
        res.json({ worker: result });
    } catch (err) {
        console.error('Verify candidate error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Verify / Reject Employer ───────────────────────────────────────────
router.put('/employers/:id/verify', async (req, res) => {
    try {
        const { isVerified, reason } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== 'employer') return res.status(404).json({ error: 'Employer not found' });

        await user.update({
            isVerified: !!isVerified,
            verificationStatus: isVerified ? 'verified' : 'rejected',
            rejectionReason: !isVerified ? reason : null,
        });

        await AuditLog.create({
            userId: req.user.id,
            action: isVerified ? 'EMPLOYER_VERIFIED' : 'EMPLOYER_REJECTED',
            details: `${isVerified ? 'Verified' : 'Rejected'} employer: ${user.companyName}${reason ? ` - Reason: ${reason}` : ''}`,
            ipAddress: req.ip,
        });

        const result = user.toJSON();
        delete result.password;
        res.json({ employer: result });
    } catch (err) {
        console.error('Verify employer error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Update Employer Progress Step ────────────────────────────────────────
router.put('/employers/:id/step', async (req, res) => {
    try {
        const { step } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== 'employer') return res.status(404).json({ error: 'Employer not found' });

        await user.update({ verificationStep: step });

        await AuditLog.create({
            userId: req.user.id,
            action: 'EMPLOYER_VERIFICATION_STEP_UPDATE',
            details: `Updated employer ${user.companyName} verification step to: ${step}`,
            ipAddress: req.ip,
        });

        const result = user.toJSON();
        delete result.password;
        res.json({ employer: result });
    } catch (err) {
        console.error('Update employer step error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── All candidate-employer relations (pipeline overview) ───────────────
router.get('/relations', async (req, res) => {
    try {
        const relations = await EmployerCandidateRel.findAll({
            include: [
                {
                    model: User, as: 'candidate',
                    attributes: { exclude: ['password'] },
                    include: [{ model: CandidateProfile, as: 'candidateProfile', required: false }]
                },
                { model: User, as: 'employer', attributes: ['id', 'firstName', 'companyName'] },
            ],
            order: [['updatedAt', 'DESC']],
        });

        const enriched = relations.map(r => {
            const rel = r.toJSON();

            // Enrich candidate data using the shared anonymizer
            rel.candidate = anonymizeCandidate(rel.candidate, req.user.role);

            rel.employerName = rel.employer?.companyName || rel.employer?.firstName || 'Unknown';
            return rel;
        });

        res.json({ relations: enriched });
    } catch (err) {
        console.error('Relations error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Quote Requests (list all) ──────────────────────────────────────────
router.get('/quote-requests', async (req, res) => {
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
        console.error('Quote requests error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Resolve Quote Request ──────────────────────────────────────────────
router.put('/quote-requests/:id/resolve', async (req, res) => {
    try {
        const { status, costEstimate } = req.body;
        const request = await QuoteRequest.findByPk(req.params.id);
        if (!request) return res.status(404).json({ error: 'Quote request not found' });

        const updates = {
            status,
            costEstimate,
            resolvedAt: new Date(),
        };

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

// ── Domain CRUD ────────────────────────────────────────────────────────
router.get('/domains', async (req, res) => {
    try {
        const domains = await Domain.findAll();
        res.json({ domains });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/domains', async (req, res) => {
    try {
        const domain = await Domain.create(req.body);
        res.status(201).json({ domain });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/domains/:id', async (req, res) => {
    try {
        const domain = await Domain.findByPk(req.params.id);
        if (!domain) return res.status(404).json({ error: 'Domain not found' });
        await domain.update(req.body);
        res.json({ domain });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/domains/:id', async (req, res) => {
    try {
        const domain = await Domain.findByPk(req.params.id);
        if (!domain) return res.status(404).json({ error: 'Domain not found' });
        await domain.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── User directory ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: CandidateProfile, as: 'candidateProfile', required: false },
            ],
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const documents = await Document.findAll({ where: { userId: req.params.id } });
        res.json({ user, documents });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password || 'password123', 10);
        // SECURITY: Only admins can create admin users
        if (req.user.role === 'staff' && req.body.role === 'admin') {
            return res.status(403).json({ error: 'Staff members are not authorized to create Admin users. Only Administrators have this permission.' });
        }

        const newUser = await User.create({
            ...req.body,
            role: req.body.role, // Explicitly set role from request body
            password: hashedPassword,
            isVerified: req.body.role === 'staff' || req.body.role === 'admin',
        });
        const result = newUser.toJSON();
        delete result.password;
        res.status(201).json({ user: result });
    } catch (err) {
        console.error('Add user error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Hiring Processes (Paid Quotes) ─────────────────────────────────────
router.get('/hiring', async (req, res) => {
    try {
        const requests = await QuoteRequest.findAll({
            where: { status: 'paid' },
            include: [
                { model: User, as: 'candidate', attributes: { exclude: ['password'] } },
                {
                    model: User, as: 'employer', attributes: { exclude: ['password'] },
                    include: [{ model: EmployerProfile, as: 'employerProfile' }]
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        const processes = requests.map(r => {
            const plain = r.toJSON();
            const hp = plain.hiringProcess || {};

            // Enrich candidate for staff view
            const candidate = anonymizeCandidate(plain.candidate, req.user.role);

            return {
                id: plain.id,
                startedAt: plain.updatedAt,
                candidate: candidate,
                employer: plain.employer,
                currentStep: hp.currentStep || 'contract',
                steps: hp.steps || [],
            };
        });

        res.json({ processes });
    } catch (err) {
        console.error('Hiring processes error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/hiring/:id/step', async (req, res) => {
    try {
        const { currentStep, steps } = req.body;
        const request = await QuoteRequest.findOne({ where: { id: req.params.id, status: 'paid' } });

        if (!request) return res.status(404).json({ error: 'Process not found' });

        const existingHp = request.hiringProcess || {};
        const updatedHp = {
            ...existingHp,
            currentStep: currentStep || existingHp.currentStep,
            steps: steps || existingHp.steps,
            updatedAt: new Date().toISOString()
        };

        await request.update({ hiringProcess: updatedHp });

        await AuditLog.create({
            userId: req.user.id,
            action: 'HIRING_STEP_UPDATE',
            details: `Updated hiring step for process ${request.id}`,
            ipAddress: req.ip,
        });

        res.json({ success: true, hiringProcess: updatedHp });
    } catch (err) {
        console.error('Update hiring step error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

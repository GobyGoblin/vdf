import express from 'express';
import crypto from 'crypto';
import { User, InterviewMeeting, AuditLog, EmployerCandidateRel } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();
router.use(authenticate);

// ── Schedule interview ─────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { candidateId, employerId, title, proposedTimes, notes } = req.body;
        const roomSlug = `wdf-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;

        const interview = await InterviewMeeting.create({
            employerId,
            candidateId,
            scheduledBy: req.user.id,
            title,
            proposedTimes: (proposedTimes || []).map((t, i) => ({
                id: `slot-${i}-${Date.now()}`,
                datetime: t.datetime,
                duration: t.duration,
                proposedBy: req.user.id,
                accepted: false,
            })),
            status: 'pending',
            meetingRoomId: roomSlug,
            notes,
        });

        await AuditLog.create({
            userId: req.user.id,
            action: 'INTERVIEW_SCHEDULED',
            details: `Scheduled interview: ${title} with candidate ${candidateId}`,
            ipAddress: req.ip,
        });

        res.status(201).json({ interview });
    } catch (err) {
        console.error('Schedule interview error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Respond to time slot ───────────────────────────────────────────────
router.put('/:id/respond', async (req, res) => {
    try {
        const interview = await InterviewMeeting.findByPk(req.params.id);
        if (!interview) return res.status(404).json({ error: 'Interview not found' });

        const { slotId, accepted } = req.body;
        const updatedTimes = (interview.proposedTimes || []).map(t =>
            t.id === slotId ? { ...t, accepted } : t
        );

        const acceptedSlot = updatedTimes.find(t => t.accepted);
        const updates = { proposedTimes: updatedTimes };

        if (acceptedSlot) {
            updates.status = 'confirmed';
            updates.confirmedTime = acceptedSlot.datetime;
        }

        await interview.update(updates);

        await AuditLog.create({
            userId: req.user.id,
            action: accepted ? 'INTERVIEW_SLOT_ACCEPTED' : 'INTERVIEW_SLOT_REJECTED',
            details: `${accepted ? 'Accepted' : 'Rejected'} time slot for interview ${req.params.id}`,
            ipAddress: req.ip,
        });

        res.json({ interview });
    } catch (err) {
        console.error('Respond to slot error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Cancel interview ───────────────────────────────────────────────────
router.put('/:id/cancel', async (req, res) => {
    try {
        const interview = await InterviewMeeting.findByPk(req.params.id);
        if (!interview) return res.status(404).json({ error: 'Interview not found' });

        if (req.user.role !== 'staff' && req.user.role !== 'admin' &&
            interview.employerId !== req.user.id && interview.candidateId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await interview.update({ status: 'cancelled' });

        await AuditLog.create({
            userId: req.user.id,
            action: 'INTERVIEW_CANCELLED',
            details: `Cancelled interview ${req.params.id}`,
            ipAddress: req.ip,
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Cancel interview error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Complete interview ─────────────────────────────────────────────────
router.put('/:id/complete', async (req, res) => {
    try {
        const interview = await InterviewMeeting.findByPk(req.params.id);
        if (!interview) return res.status(404).json({ error: 'Interview not found' });

        // Authorization check
        if (req.user.role !== 'staff' && req.user.role !== 'admin' &&
            interview.employerId !== req.user.id && interview.candidateId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await interview.update({ status: 'completed' });

        // Synchronize with pipeline status
        await EmployerCandidateRel.update(
            { status: 'interviewed' },
            {
                where: {
                    employerId: interview.employerId,
                    candidateId: interview.candidateId
                }
            }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Complete interview error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── My interviews ──────────────────────────────────────────────────────
router.get('/my', async (req, res) => {
    try {
        const interviews = await InterviewMeeting.findAll({
            where: {
                [Op.or]: [{ employerId: req.user.id }, { candidateId: req.user.id }],
            },
            include: [
                { model: User, as: 'employer', attributes: ['id', 'firstName', 'lastName', 'companyName'] },
                { model: User, as: 'candidate', attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        const enriched = interviews.map(i => {
            const plain = i.toJSON();

            // Only show full name for staff/admin, or if it's the candidate viewing their own interview
            if (req.user.role === 'employer') {
                plain.candidateName = plain.candidate ? `${plain.candidate.firstName || ''} ${plain.candidate.lastName || ''}`.trim() || 'Candidate' : 'Unknown';
            } else {
                plain.candidateName = plain.candidate ? `${plain.candidate.firstName} ${plain.candidate.lastName}` : 'Unknown';
            }

            plain.employerName = plain.employer?.companyName || plain.employer?.firstName || 'Unknown';

            // Scrub PII for employer view
            if (req.user.role === 'employer' && plain.candidate) {
                delete plain.candidate.avatarUrl;
            }

            return plain;
        });

        res.json({ interviews: enriched });
    } catch (err) {
        console.error('My interviews error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Get single interview ───────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const interview = await InterviewMeeting.findByPk(req.params.id, {
            include: [
                { model: User, as: 'employer', attributes: ['id', 'firstName', 'lastName', 'companyName'] },
                { model: User, as: 'candidate', attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
            ],
        });
        if (!interview) return res.status(404).json({ error: 'Interview not found' });

        const plain = interview.toJSON();

        if (req.user.role === 'employer') {
            plain.candidateName = plain.candidate ? `${plain.candidate.firstName || ''} ${plain.candidate.lastName || ''}`.trim() || 'Candidate' : 'Unknown';
            plain.candidateAvatar = undefined;
        } else {
            plain.candidateName = plain.candidate ? `${plain.candidate.firstName} ${plain.candidate.lastName}` : 'Unknown';
            plain.candidateAvatar = plain.candidate?.avatarUrl;
        }

        plain.employerName = plain.employer?.companyName || plain.employer?.firstName || 'Unknown';

        // Scrub PII for employer view
        if (req.user.role === 'employer' && plain.candidate) {
            delete plain.candidate.avatarUrl;
        }

        res.json({ interview: plain });
    } catch (err) {
        console.error('Get interview error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── All interviews (staff only) ────────────────────────────────────────
router.get('/', authorize('staff', 'admin'), async (req, res) => {
    try {
        const interviews = await InterviewMeeting.findAll({
            include: [
                { model: User, as: 'employer', attributes: ['id', 'firstName', 'lastName', 'companyName'] },
                { model: User, as: 'candidate', attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        const enriched = interviews.map(i => {
            const plain = i.toJSON();
            plain.candidateName = plain.candidate ? `${plain.candidate.firstName} ${plain.candidate.lastName}` : 'Unknown';
            plain.employerName = plain.employer?.companyName || plain.employer?.firstName || 'Unknown';
            plain.candidateAvatar = plain.candidate?.avatarUrl;
            return plain;
        });

        res.json({ interviews: enriched });
    } catch (err) {
        console.error('All interviews error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

import express from 'express';
import { ConsentRequest, User } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create consent request (employer only)
router.post('/', authenticate, authorize('employer'), async (req, res) => {
  try {
    const { candidateId, message } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    // Check if candidate exists
    const candidate = await User.findByPk(candidateId);
    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Check if request already exists
    const existingRequest = await ConsentRequest.findOne({
      where: { employerId: req.user.id, candidateId, status: 'pending' },
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Consent request already exists' });
    }

    const consentRequest = await ConsentRequest.create({
      employerId: req.user.id,
      candidateId,
      message,
      status: 'pending',
    });

    const requestWithDetails = await ConsentRequest.findByPk(consentRequest.id, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'email', 'companyName'],
        },
        {
          model: User,
          as: 'candidate',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });

    res.status(201).json({ consentRequest: requestWithDetails });
  } catch (error) {
    console.error('Create consent request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get candidate's consent requests
router.get('/my-requests', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const consentRequests = await ConsentRequest.findAll({
      where: { candidateId: req.user.id },
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'email', 'companyName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ consentRequests });
  } catch (error) {
    console.error('Get consent requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Respond to consent request (candidate only)
router.patch('/:id/respond', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const consentRequest = await ConsentRequest.findByPk(req.params.id);

    if (!consentRequest) {
      return res.status(404).json({ error: 'Consent request not found' });
    }

    if (consentRequest.candidateId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await consentRequest.update({
      status,
      respondedAt: new Date(),
    });

    const updatedRequest = await ConsentRequest.findByPk(consentRequest.id, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'email', 'companyName'],
        },
        {
          model: User,
          as: 'candidate',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });

    res.json({ consentRequest: updatedRequest });
  } catch (error) {
    console.error('Respond to consent request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employer's sent requests
router.get('/employer/my-requests', authenticate, authorize('employer'), async (req, res) => {
  try {
    const consentRequests = await ConsentRequest.findAll({
      where: { employerId: req.user.id },
      include: [
        {
          model: User,
          as: 'candidate',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ consentRequests });
  } catch (error) {
    console.error('Get employer consent requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

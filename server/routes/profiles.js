import express from 'express';
import { User, CandidateProfile, EmployerProfile, ProfileView, Document, ConsentRequest, EmployerCandidateRel } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get candidate profile
router.get('/candidate/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: CandidateProfile,
          as: 'candidateProfile',
        },
        {
          model: Document,
          as: 'documents',
        },
      ],
    });

    if (!user || user.role !== 'candidate') {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Track profile view if viewed by employer
    if (req.user.role === 'employer' && req.user.id !== user.id) {
      await ProfileView.create({
        candidateId: user.id,
        viewedBy: req.user.id,
        employerId: req.user.id,
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get candidate profile error detail:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update candidate profile
router.put('/candidate/:id', authenticate, authorize('candidate'), async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findByPk(req.user.id);
    const profile = await CandidateProfile.findOne({ where: { userId: req.user.id } });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const {
      firstName, lastName,
      nationality, birthDate, yearsOfExperience, sector, salaryExpectation,
      phone, address, city, country, bio, skills, experience, education, languages,
      headline, location, verificationStatus, isVerified, verificationPaymentStatus
    } = req.body;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (nationality !== undefined) user.nationality = nationality;
    if (birthDate !== undefined) user.birthDate = birthDate;
    if (yearsOfExperience !== undefined) user.yearsOfExperience = yearsOfExperience;
    if (sector !== undefined) user.sector = sector;
    if (salaryExpectation !== undefined) user.salaryExpectation = salaryExpectation;
    if (verificationStatus !== undefined) user.verificationStatus = verificationStatus;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (verificationPaymentStatus !== undefined) user.verificationPaymentStatus = verificationPaymentStatus;

    await user.save();

    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;
    if (city !== undefined) profile.city = city;
    if (country !== undefined) profile.country = country;
    if (bio !== undefined) profile.bio = bio;
    if (skills !== undefined) profile.skills = skills;
    if (experience !== undefined) profile.experience = experience;
    if (education !== undefined) profile.education = education;
    if (languages !== undefined) profile.languages = languages;
    if (headline !== undefined) profile.headline = headline;
    if (location !== undefined) profile.location = location;

    // Calculate profile score
    let score = 0;
    if (user.firstName && user.lastName) score += 10;
    if (profile.phone) score += 10;
    if (profile.address && profile.city) score += 10;
    if (profile.bio) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.experience && profile.experience.length > 0) score += 20;
    if (profile.education && profile.education.length > 0) score += 15;

    profile.profileScore = Math.min(score, 100);
    await profile.save();

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: CandidateProfile,
          as: 'candidateProfile',
        },
      ],
    });

    const userData = updatedUser.toJSON();
    if (userData.candidateProfile) {
      const { id: profileId, ...profileData } = userData.candidateProfile;
      Object.assign(userData, profileData);
      userData.candidateProfileId = profileId;
      delete userData.candidateProfile;
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('Update candidate profile error detail:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get employer profile
router.get('/employer/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: EmployerProfile,
          as: 'employerProfile',
        },
      ],
    });

    if (!user || user.role !== 'employer') {
      return res.status(404).json({ error: 'Employer not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get employer profile error detail:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update employer profile
router.put('/employer/:id', authenticate, authorize('employer'), async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findByPk(req.user.id);
    const profile = await EmployerProfile.findOne({ where: { userId: req.user.id } });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const {
      companyName, companyDescription, website, phone, address, city, country, industry, companySize,
      firstName, lastName, vision, foundedYear, contactEmail, societyType, registerNumber, isTrainingCompany,
      verificationStatus
    } = req.body;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (verificationStatus !== undefined) user.verificationStatus = verificationStatus;

    if (companyName !== undefined) {
      user.companyName = companyName;
      profile.companyName = companyName;
    }
    await user.save();

    if (companyDescription !== undefined) profile.companyDescription = companyDescription;
    if (website !== undefined) profile.website = website;
    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;
    if (city !== undefined) profile.city = city;
    if (country !== undefined) profile.country = country;
    if (industry !== undefined) profile.industry = industry;
    if (companySize !== undefined) profile.companySize = companySize;
    if (vision !== undefined) profile.vision = vision;
    if (foundedYear !== undefined) profile.foundedYear = foundedYear;
    if (contactEmail !== undefined) profile.contactEmail = contactEmail;
    if (societyType !== undefined) profile.societyType = societyType;
    if (registerNumber !== undefined) profile.registerNumber = registerNumber;
    if (isTrainingCompany !== undefined) profile.isTrainingCompany = isTrainingCompany;

    await profile.save();

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: EmployerProfile,
          as: 'employerProfile',
        },
      ],
    });

    const userData = updatedUser.toJSON();
    if (userData.employerProfile) {
      const { id: profileId, ...profileData } = userData.employerProfile;
      Object.assign(userData, profileData);
      userData.employerProfileId = profileId;
      delete userData.employerProfile;
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('Update employer profile error detail:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get profile views (candidate only)
router.get('/candidate/:id/views', authenticate, authorize('candidate'), async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const views = await ProfileView.findAll({
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

    res.json({ views });
  } catch (error) {
    console.error('Get profile views error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', authenticate, async (req, res) => {
  try {

    if (req.user.role === 'candidate') {
      const views = await ProfileView.count({ where: { candidateId: req.user.id } });
      const consentRequests = await ConsentRequest.count({
        where: { candidateId: req.user.id, status: 'pending' }
      });
      const profile = await CandidateProfile.findOne({ where: { userId: req.user.id } });

      res.json({
        profileViews: views,
        consentRequests,
        profileScore: profile?.profileScore || 0,
      });
    } else if (req.user.role === 'employer') {
      const pipelineCandidates = await EmployerCandidateRel.count({ where: { employerId: req.user.id } });
      const profileViews = await ProfileView.count({ where: { employerId: req.user.id } });
      res.json({
        pipelineCandidates,
        consentRequests: profileViews,
      });
    } else {
      res.json({ message: 'No stats available for this role' });
    }
  } catch (error) {
    console.error('Get dashboard stats error detail:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;

import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

// ─── User Model ────────────────────────────────────────────────────────
export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('candidate', 'employer', 'staff', 'admin'),
    allowNull: false,
  },
  firstName: { type: DataTypes.STRING, allowNull: true },
  lastName: { type: DataTypes.STRING, allowNull: true },
  companyName: { type: DataTypes.STRING, allowNull: true },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  profileComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
  badgeType: { type: DataTypes.STRING, defaultValue: 'none' },  // 'gold' | 'blue' | 'none'
  nationality: { type: DataTypes.STRING, allowNull: true },
  birthDate: { type: DataTypes.STRING, allowNull: true },
  yearsOfExperience: { type: DataTypes.STRING, allowNull: true },
  sector: { type: DataTypes.STRING, allowNull: true },
  salaryExpectation: { type: DataTypes.STRING, allowNull: true },
  verificationStatus: {
    type: DataTypes.ENUM('unverified', 'pending', 'verified', 'rejected'),
    defaultValue: 'unverified'
  },
  verificationPaymentStatus: {
    type: DataTypes.ENUM('unpaid', 'pending', 'paid'),
    defaultValue: 'unpaid'
  },
  profileProgress: { type: DataTypes.INTEGER, defaultValue: 0 },
  suggestedPlacementCost: { type: DataTypes.STRING, allowNull: true },
  avatarUrl: { type: DataTypes.STRING, allowNull: true },
  rejectionReason: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

// ─── Candidate Profile ─────────────────────────────────────────────────
export const CandidateProfile = sequelize.define('CandidateProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  skills: { type: DataTypes.JSON, defaultValue: [] },
  experience: { type: DataTypes.JSON, defaultValue: [] },
  education: { type: DataTypes.JSON, defaultValue: [] },
  languages: { type: DataTypes.JSON, defaultValue: [] },
  headline: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  profileScore: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true });

// ─── Employer Profile ──────────────────────────────────────────────────
export const EmployerProfile = sequelize.define('EmployerProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  companyName: { type: DataTypes.STRING, allowNull: false },
  companyDescription: { type: DataTypes.TEXT, allowNull: true },
  website: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  industry: { type: DataTypes.STRING, allowNull: true },
  companySize: { type: DataTypes.STRING, allowNull: true },
  vision: { type: DataTypes.TEXT, allowNull: true },
  foundedYear: { type: DataTypes.STRING, allowNull: true },
  contactEmail: { type: DataTypes.STRING, allowNull: true },
  societyType: { type: DataTypes.STRING, allowNull: true },
  registerNumber: { type: DataTypes.STRING, allowNull: true },
  isTrainingCompany: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

// ─── Job and Application Models Removed ──────────────────────────────────

// ─── Document Model ────────────────────────────────────────────────────
export const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('resume', 'passport', 'diploma', 'certificate', 'cv', 'reference', 'other'),
    allowNull: false,
  },
  name: { type: DataTypes.STRING, allowNull: true },
  fileName: { type: DataTypes.STRING, allowNull: false },
  filePath: { type: DataTypes.STRING, allowNull: false },
  fileSize: { type: DataTypes.INTEGER, allowNull: true },
  mimeType: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
  },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verifiedBy: { type: DataTypes.UUID, allowNull: true },
  verifiedAt: { type: DataTypes.DATE, allowNull: true },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('fileUrl');
      if (rawValue) return rawValue;
      const fileName = this.getDataValue('fileName');
      return fileName ? `/uploads/${fileName}` : null;
    }
  },
  thumbnailUrl: { type: DataTypes.STRING, allowNull: true },
  uploadedAt: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('createdAt');
    }
  },
}, { timestamps: true });

// ─── Consent Request Model ─────────────────────────────────────────────
export const ConsentRequest = sequelize.define('ConsentRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  message: { type: DataTypes.TEXT, allowNull: true },
  respondedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true });

// ─── Profile View Model ────────────────────────────────────────────────
export const ProfileView = sequelize.define('ProfileView', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  viewedBy: { type: DataTypes.UUID, allowNull: true },
  employerId: { type: DataTypes.UUID, allowNull: true },
}, { timestamps: true });

// ─── Insight/Article Model ─────────────────────────────────────────────
export const Insight = sequelize.define('Insight', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  excerpt: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.JSON, defaultValue: [] },
  readTime: { type: DataTypes.STRING, allowNull: true },
  authorName: { type: DataTypes.STRING, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  published: { type: DataTypes.BOOLEAN, defaultValue: false },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
  authorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
  },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

// ═══════════════════════════════════════════════════════════════════════
// NEW MODELS
// ═══════════════════════════════════════════════════════════════════════

// ─── Audit Log Model ───────────────────────────────────────────────────
export const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
  },
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT, allowNull: true },
  ipAddress: { type: DataTypes.STRING, allowNull: true },
  userAgent: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

// ─── Plan Model ────────────────────────────────────────────────────────
export const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'EUR' },
  badgeType: {
    type: DataTypes.ENUM('gold', 'blue', 'none'),
    defaultValue: 'none',
  },
  features: { type: DataTypes.JSON, defaultValue: [] },
  description: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

// ─── Domain Model ──────────────────────────────────────────────────────
export const Domain = sequelize.define('Domain', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  icon: { type: DataTypes.STRING, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: false },
  count: { type: DataTypes.STRING, defaultValue: '0' },
}, { timestamps: true });

// ─── Quote Request Model ───────────────────────────────────────────────
export const QuoteRequest = sequelize.define('QuoteRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  requestedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  resolvedAt: { type: DataTypes.DATE, allowNull: true },
  costEstimate: { type: DataTypes.STRING, allowNull: true },
  items: { type: DataTypes.JSON, defaultValue: [] },
  options: { type: DataTypes.JSON, defaultValue: [] },
  selectedOptionId: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

// ─── Talent Demand Model ───────────────────────────────────────────────
export const TalentDemand = sequelize.define('TalentDemand', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  title: { type: DataTypes.STRING, allowNull: false },
  sector: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  requiredSkills: { type: DataTypes.JSON, defaultValue: [] },
  experienceLevel: {
    type: DataTypes.ENUM('junior', 'mid', 'senior', 'lead'),
    defaultValue: 'mid',
  },
  salaryRange: { type: DataTypes.STRING, allowNull: true },
  locationPreference: { type: DataTypes.STRING, allowNull: true },
  urgency: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  headcount: { type: DataTypes.INTEGER, defaultValue: 1 },
  remotePreference: {
    type: DataTypes.ENUM('onsite', 'hybrid', 'remote'),
    defaultValue: 'onsite',
  },
  duration: { type: DataTypes.STRING, allowNull: true },
  visaSupport: { type: DataTypes.BOOLEAN, defaultValue: false },
  suggestedCandidateIds: { type: DataTypes.JSON, defaultValue: [] },
  manualProfiles: { type: DataTypes.JSON, defaultValue: [] },
  status: {
    type: DataTypes.ENUM('open', 'treating', 'treated', 'cancelled'),
    defaultValue: 'open',
  },
}, { timestamps: true });

// ─── Employer-Candidate Relation Model (Pipeline) ──────────────────────
export const EmployerCandidateRel = sequelize.define('EmployerCandidateRel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('potential', 'shortlisted', 'asked_quote', 'interviewed', 'hired'),
    defaultValue: 'potential',
  },
}, { timestamps: true });

// ─── Interview Meeting Model ───────────────────────────────────────────
export const InterviewMeeting = sequelize.define('InterviewMeeting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  scheduledBy: { type: DataTypes.UUID, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: false },
  proposedTimes: { type: DataTypes.JSON, defaultValue: [] },
  confirmedTime: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  meetingRoomId: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });


// ═══════════════════════════════════════════════════════════════════════
// RELATIONSHIPS
// ═══════════════════════════════════════════════════════════════════════

// User ↔ CandidateProfile
User.hasOne(CandidateProfile, { foreignKey: 'userId', as: 'candidateProfile' });
CandidateProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ EmployerProfile
User.hasOne(EmployerProfile, { foreignKey: 'userId', as: 'employerProfile' });
EmployerProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ Document
User.hasMany(Document, { foreignKey: 'userId', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Consent Requests
User.hasMany(ConsentRequest, { foreignKey: 'employerId', as: 'sentConsentRequests' });
User.hasMany(ConsentRequest, { foreignKey: 'candidateId', as: 'receivedConsentRequests' });
ConsentRequest.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
ConsentRequest.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

// Profile Views
User.hasMany(ProfileView, { foreignKey: 'candidateId', as: 'profileViews' });
ProfileView.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

// Insights
User.hasMany(Insight, { foreignKey: 'authorId', as: 'insights' });
Insight.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Audit Logs
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Quote Requests
User.hasMany(QuoteRequest, { foreignKey: 'employerId', as: 'sentQuoteRequests' });
User.hasMany(QuoteRequest, { foreignKey: 'candidateId', as: 'receivedQuoteRequests' });
QuoteRequest.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
QuoteRequest.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

// Talent Demands
User.hasMany(TalentDemand, { foreignKey: 'employerId', as: 'talentDemands' });
TalentDemand.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });

// Employer-Candidate Relations (Pipeline)
User.hasMany(EmployerCandidateRel, { foreignKey: 'employerId', as: 'employerRelations' });
User.hasMany(EmployerCandidateRel, { foreignKey: 'candidateId', as: 'candidateRelations' });
EmployerCandidateRel.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
EmployerCandidateRel.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

// Interview Meetings
User.hasMany(InterviewMeeting, { foreignKey: 'employerId', as: 'employerInterviews' });
User.hasMany(InterviewMeeting, { foreignKey: 'candidateId', as: 'candidateInterviews' });
InterviewMeeting.belongsTo(User, { foreignKey: 'employerId', as: 'employer' });
InterviewMeeting.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

export default sequelize;

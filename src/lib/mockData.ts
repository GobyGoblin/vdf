
export interface User {
    id: string;
    email: string;
    password: string;
    role: 'candidate' | 'employer' | 'staff' | 'admin';
    firstName: string;
    lastName: string;
    companyName?: string;
    isVerified: boolean;
    verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
    rejectionReason?: string;
    badgeType?: 'gold' | 'blue' | 'none';
    verificationPaymentStatus?: 'pending' | 'paid' | 'waived';
    selectedPlanId?: string;
    industry?: string;
    website?: string;
    companySize?: string;
    vision?: string;
    foundedYear?: string;
    address?: string;
    city?: string;
    contactEmail?: string;
    description?: string;
    societyType?: string;
    registerNumber?: string;
    isTrainingCompany?: boolean;
    createdAt: string;
    profileScore?: number;
    skills?: string[];
    location?: string;
    phone?: string;
    bio?: string;
    headline?: string;
    experience?: Experience[];
    education?: Education[];
    languages?: string[];
    avatarUrl?: string;
    nationality?: string;
    birthDate?: string;
    yearsOfExperience?: string;
    sector?: string;
    salaryExpectation?: string;
    profileProgress?: number;
    suggestedPlacementCost?: string; // Staff-suggested cost for this candidate
}

export interface Experience {
    id: number | string;
    title: string;
    company: string;
    period: string;
    description: string;
}

export interface Education {
    id: number | string;
    degree: string;
    institution: string;
    year: string;
    description?: string;
}

export interface Job {
    id: string;
    title: string;
    company: string;
    employerId: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
    salary: string;
    description: string;
    requirements: string[];
    benefits: string[];
    status: 'active' | 'paused' | 'closed';
    applicantCount: number;
    createdAt: string;
    category: string;
    companyLogoUrl?: string;
}

export interface Application {
    id: string;
    jobId: string;
    candidateId: string;
    status: 'pending' | 'reviewing' | 'interviewed' | 'offered' | 'rejected' | 'accepted';
    coverLetter: string;
    appliedAt: string;
    notes?: string;
}

export interface Document {
    id: string;
    userId: string;
    type: 'passport' | 'cv' | 'certificate' | 'diploma' | 'reference' | 'other';
    name: string;
    status: 'pending' | 'verified' | 'rejected';
    uploadedAt: string;
    verifiedAt?: string;
    verifiedBy?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
}

export interface QuoteItem {
    label: string;
    amount: number;
    description?: string;
}

export interface QuoteOption {
    id: string;
    name: string;
    costEstimate: string;
    items: QuoteItem[];
    perks: string[];
    selected?: boolean;
}

export interface QuoteRequest {
    id: string;
    employerId: string;
    candidateId: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    resolvedAt?: string;
    costEstimate?: string;
    items?: QuoteItem[];
    options?: QuoteOption[];
    candidate?: any;
}

export interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    badgeType: 'gold' | 'blue' | 'none';
    features: string[];
    description: string;
}


export interface Domain {
    id: string;
    icon: string;
    title: string;
    count: string;
}

export interface Insight {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    author: string;
    image: string;
    published: boolean;
    featured: boolean;
    createdAt: string;
}

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    details: string;
    timestamp: string;
}

export interface ManualProfile {
    id: string;
    fullName: string;
    sector: string;
    skills: string[];
    experience: string;
}

export interface TalentDemand {
    id: string;
    employerId: string;
    title: string;
    sector: string;
    description: string;
    requiredSkills: string[];
    experienceLevel: 'junior' | 'mid' | 'senior' | 'lead';
    salaryRange: string;
    locationPreference?: string;
    languageRequirements?: string[];
    urgency: 'low' | 'medium' | 'high' | 'critical';
    employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance';
    remotePreference: 'onsite' | 'hybrid' | 'remote';
    duration?: string;
    visaSupport: boolean;
    suggestedCandidateIds: string[]; // Keep for existing DB links if needed
    manualProfiles: ManualProfile[];
    status: 'open' | 'treating' | 'treated' | 'cancelled';
    createdAt: string;
}

export type CandidateStatus = 'potential' | 'shortlisted' | 'interviewed' | 'asked_quote' | 'hired';

export interface EmployerCandidateRel {
    id: string;
    employerId: string;
    candidateId: string;
    status: CandidateStatus;
    updatedAt: string;
}

export interface ProposedTime {
    id: string;
    datetime: string;
    duration: number; // minutes
    proposedBy: string;
    accepted: boolean;
}

export interface InterviewMeeting {
    id: string;
    employerId: string;
    candidateId: string;
    scheduledBy: string;
    title: string;
    proposedTimes: ProposedTime[];
    confirmedTime?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    meetingRoomId: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}


export const mockDomains: Domain[] = [
    { id: '1', icon: 'Monitor', title: 'IT & Engineering', count: '500+ Jobs' },
    { id: '2', icon: 'Stethoscope', title: 'Healthcare', count: '300+ Jobs' },
    { id: '3', icon: 'HardHat', title: 'Construction', count: '250+ Jobs' },
    { id: '4', icon: 'Truck', title: 'Logistics', count: '200+ Jobs' },
    { id: '5', icon: 'Wrench', title: 'Manufacturing', count: '150+ Jobs' },
    { id: '6', icon: 'Leaf', title: 'Green Energy', count: '100+ Jobs' },
];

export const mockPlans: Plan[] = [
    {
        id: 'plan-free',
        name: 'Basic Access',
        price: 0,
        currency: 'EUR',
        badgeType: 'none',
        features: ['Create Profile', 'Upload Documents', 'Browse Jobs', 'Basic Application Limit'],
        description: 'Get started and explore opportunities.'
    },
    {
        id: 'plan-basic-blue',
        name: 'Verified Status',
        price: 49,
        currency: 'EUR',
        badgeType: 'blue',
        features: ['Identity Verification', 'Diploma Check', 'Blue Badge Status', 'Search Visibility'],
        description: 'Essential verification to establish trust with employers.'
    },
    {
        id: 'plan-premium-gold',
        name: 'Gold Tier Status',
        price: 149,
        currency: 'EUR',
        badgeType: 'gold',
        features: ['Everything in Verified', 'Priority Support', 'Gold Badge Strategy', 'Featured in Search', 'Direct Introduction'],
        description: 'Exclusive status for top-tier professionals.'
    }
];

export const mockQuoteRequests: QuoteRequest[] = [];
export const mockCandidateRelations: EmployerCandidateRel[] = [];

// Sample Users
export const mockUsers: User[] = [
    // Admin
    {
        id: 'admin-1',
        email: 'admin@germantalent.de',
        password: 'admin123',
        role: 'admin',
        firstName: 'Max',
        lastName: 'Administrator',
        isVerified: true,
        createdAt: '2024-01-01T10:00:00Z',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    // Staff
    {
        id: 'staff-1',
        email: 'staff@germantalent.de',
        password: 'staff123',
        role: 'staff',
        firstName: 'Anna',
        lastName: 'Reviewer',
        isVerified: true,
        createdAt: '2024-01-15T10:00:00Z',
    },
    {
        id: 'staff-2',
        email: 'reviewer@germantalent.de',
        password: 'staff123',
        role: 'staff',
        firstName: 'Thomas',
        lastName: 'Prüfer',
        isVerified: true,
        createdAt: '2024-02-01T10:00:00Z',
    },
    // Employers
    {
        id: 'employer-1',
        email: 'hr@techcorp.de',
        password: 'employer123',
        role: 'employer',
        firstName: 'Klaus',
        lastName: 'Schmidt',
        companyName: 'TechCorp GmbH',
        isVerified: true,
        createdAt: '2024-02-10T10:00:00Z',
        phone: '+49 30 1234567',
        avatarUrl: 'https://images.unsplash.com/photo-1549921294-fa92839561a6?w=200&h=200&fit=crop',
    },
    {
        id: 'employer-2',
        email: 'jobs@berlinstartup.de',
        password: 'employer123',
        role: 'employer',
        firstName: 'Lisa',
        lastName: 'Müller',
        companyName: 'Berlin Startup AG',
        isVerified: true,
        createdAt: '2024-02-20T10:00:00Z',
        phone: '+49 30 9876543',
    },
    {
        id: 'employer-3',
        email: 'recruiting@automotiv.de',
        password: 'employer123',
        role: 'employer',
        firstName: 'Michael',
        lastName: 'Wagner',
        companyName: 'AutoMotiv Deutschland',
        isVerified: false,
        createdAt: '2024-03-01T10:00:00Z',
    },
    // Candidates
    {
        id: 'candidate-1',
        email: 'maria@example.com',
        password: 'candidate123',
        role: 'candidate',
        firstName: 'Maria',
        lastName: 'Garcia',
        isVerified: true,
        verificationStatus: 'verified',
        badgeType: 'blue',
        suggestedPlacementCost: '€5,000 - €7,000',
        createdAt: '2024-03-05T10:00:00Z',
        profileScore: 85,
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        location: 'Berlin',
        bio: 'Full-stack developer with 5 years of experience.',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    {
        id: 'candidate-2',
        email: 'hans@example.com',
        password: 'candidate123',
        role: 'candidate',
        firstName: 'Hans',
        lastName: 'Weber',
        isVerified: true,
        verificationStatus: 'verified',
        badgeType: 'gold',
        suggestedPlacementCost: '€8,000 - €12,000',
        createdAt: '2024-03-10T10:00:00Z',
        profileScore: 72,
        skills: ['Python', 'Data Science', 'Machine Learning'],
        location: 'Munich',
        bio: 'Data scientist passionate about AI.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    {
        id: 'candidate-3',
        email: 'anna@example.com',
        password: 'candidate123',
        role: 'candidate',
        firstName: 'Anna',
        lastName: 'Müller',
        isVerified: true,
        verificationStatus: 'verified',
        badgeType: 'blue',
        suggestedPlacementCost: '€6,000 - €9,000',
        createdAt: '2024-03-15T10:00:00Z',
        profileScore: 90,
        skills: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
        location: 'Frankfurt',
        bio: 'Senior backend engineer specialized in cloud architecture.',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    },
    {
        id: 'candidate-4',
        email: 'peter@example.com',
        password: 'candidate123',
        role: 'candidate',
        firstName: 'Peter',
        lastName: 'Novak',
        isVerified: false,
        createdAt: '2024-03-20T10:00:00Z',
        profileScore: 45,
        skills: ['HTML', 'CSS', 'WordPress'],
        location: 'Hamburg',
        bio: 'Web designer looking for new opportunities.',
    },
    {
        id: 'candidate-5',
        email: 'elena@example.com',
        password: 'candidate123',
        role: 'candidate',
        firstName: 'Elena',
        lastName: 'Kowalski',
        isVerified: false,
        createdAt: '2024-03-25T10:00:00Z',
        profileScore: 60,
        skills: ['Nursing', 'Patient Care', 'German B2'],
        location: 'Cologne',
        bio: 'Healthcare professional seeking work in Germany.',
    },
];

// Sample Jobs
export const mockJobs: Job[] = [
    {
        id: 'job-1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp GmbH',
        employerId: 'employer-1',
        location: 'Berlin',
        type: 'Full-time',
        salary: '€70,000 - €90,000',
        description: 'We are looking for an experienced Frontend Developer to join our growing team.',
        requirements: ['5+ years React experience', 'TypeScript proficiency', 'German B1 or higher'],
        benefits: ['Remote work options', 'Company car', '30 vacation days'],
        status: 'active',
        applicantCount: 12,
        createdAt: '2024-03-01T10:00:00Z',
        category: 'IT & Engineering',
        companyLogoUrl: 'https://images.unsplash.com/photo-1549921294-fa92839561a6?w=200&h=200&fit=crop',
    },
    {
        id: 'job-2',
        title: 'Backend Developer (Node.js)',
        company: 'TechCorp GmbH',
        employerId: 'employer-1',
        location: 'Berlin',
        type: 'Full-time',
        salary: '€65,000 - €85,000',
        description: 'Join our backend team to build scalable APIs and microservices.',
        requirements: ['3+ years Node.js', 'PostgreSQL experience', 'Docker knowledge'],
        benefits: ['Flexible hours', 'Home office', 'Training budget'],
        status: 'active',
        applicantCount: 8,
        createdAt: '2024-03-05T10:00:00Z',
        category: 'IT & Engineering',
    },
    {
        id: 'job-3',
        title: 'Product Manager',
        company: 'Berlin Startup AG',
        employerId: 'employer-2',
        location: 'Berlin',
        type: 'Full-time',
        salary: '€75,000 - €95,000',
        description: 'Lead product development for our B2B SaaS platform.',
        requirements: ['3+ years PM experience', 'Agile methodologies', 'Tech background preferred'],
        benefits: ['Stock options', 'Unlimited PTO', 'Modern office'],
        status: 'active',
        applicantCount: 15,
        createdAt: '2024-03-10T10:00:00Z',
        category: 'IT & Engineering',
    },
    {
        id: 'job-4',
        title: 'Data Scientist',
        company: 'Berlin Startup AG',
        employerId: 'employer-2',
        location: 'Munich',
        type: 'Full-time',
        salary: '€80,000 - €100,000',
        description: 'Build ML models to drive business insights.',
        requirements: ['Python/R proficiency', 'ML/AI experience', 'PhD preferred'],
        benefits: ['Research budget', 'Conference attendance', 'Flexible schedule'],
        status: 'active',
        applicantCount: 6,
        createdAt: '2024-03-15T10:00:00Z',
        category: 'IT & Engineering',
    },
    {
        id: 'job-5',
        title: 'Registered Nurse',
        company: 'AutoMotiv Deutschland',
        employerId: 'employer-3',
        location: 'Cologne',
        type: 'Full-time',
        salary: '€45,000 - €55,000',
        description: 'Join our occupational health team.',
        requirements: ['Nursing license', 'German B2', '2+ years experience'],
        benefits: ['Relocation support', 'Language training', 'Job security'],
        status: 'active',
        applicantCount: 4,
        createdAt: '2024-03-20T10:00:00Z',
        category: 'Healthcare',
    },
    {
        id: 'job-6',
        title: 'Construction Site Manager',
        company: 'AutoMotiv Deutschland',
        employerId: 'employer-3',
        location: 'Frankfurt',
        type: 'Full-time',
        salary: '€55,000 - €70,000',
        description: 'Oversee large-scale construction projects.',
        requirements: ['5+ years construction', 'Team management', 'Safety certifications'],
        benefits: ['Company vehicle', 'Pension plan', 'Performance bonus'],
        status: 'paused',
        applicantCount: 3,
        createdAt: '2024-03-25T10:00:00Z',
        category: 'Construction',
    },
    {
        id: 'job-7',
        title: 'Logistics Coordinator',
        company: 'TechCorp GmbH',
        employerId: 'employer-1',
        location: 'Hamburg',
        type: 'Full-time',
        salary: '€40,000 - €50,000',
        description: 'Manage supply chain operations.',
        requirements: ['Logistics experience', 'SAP knowledge', 'English fluency'],
        benefits: ['Health insurance', 'Gym membership', 'Team events'],
        status: 'active',
        applicantCount: 7,
        createdAt: '2024-04-01T10:00:00Z',
        category: 'Logistics',
    },
    {
        id: 'job-8',
        title: 'Solar Panel Technician',
        company: 'Berlin Startup AG',
        employerId: 'employer-2',
        location: 'Stuttgart',
        type: 'Contract',
        salary: '€35,000 - €45,000',
        description: 'Install and maintain solar panel systems.',
        requirements: ['Electrical certification', 'Height work experience', 'Drivers license'],
        benefits: ['Tool allowance', 'Training provided', 'Project bonuses'],
        status: 'active',
        applicantCount: 2,
        createdAt: '2024-04-05T10:00:00Z',
        category: 'Green Energy',
    },
    {
        id: 'job-9',
        title: 'Manufacturing Technician',
        company: 'AutoMotiv Deutschland',
        employerId: 'employer-3',
        location: 'Munich',
        type: 'Full-time',
        salary: '€42,000 - €52,000',
        description: 'Work in our automotive parts manufacturing facility.',
        requirements: ['Technical degree', 'CNC experience', 'Quality mindset'],
        benefits: ['Shift bonuses', 'Career progression', 'Staff canteen'],
        status: 'active',
        applicantCount: 5,
        createdAt: '2024-04-10T10:00:00Z',
        category: 'Manufacturing',
    },
    {
        id: 'job-10',
        title: 'UX/UI Designer',
        company: 'TechCorp GmbH',
        employerId: 'employer-1',
        location: 'Remote',
        type: 'Remote',
        salary: '€55,000 - €70,000',
        description: 'Design beautiful user interfaces for our products.',
        requirements: ['Figma expertise', 'Portfolio required', 'User research skills'],
        benefits: ['Full remote', 'Design tools budget', 'Creative freedom'],
        status: 'active',
        applicantCount: 18,
        createdAt: '2024-04-15T10:00:00Z',
        category: 'IT & Engineering',
    },
];

// Sample Applications
export const mockApplications: Application[] = [
    { id: 'app-1', jobId: 'job-1', candidateId: 'candidate-1', status: 'reviewing', coverLetter: 'I am excited to apply for this position...', appliedAt: '2024-03-10T10:00:00Z' },
    { id: 'app-2', jobId: 'job-1', candidateId: 'candidate-3', status: 'interviewed', coverLetter: 'With my extensive experience...', appliedAt: '2024-03-11T10:00:00Z' },
    { id: 'app-3', jobId: 'job-2', candidateId: 'candidate-1', status: 'pending', coverLetter: 'I would love to join your backend team...', appliedAt: '2024-03-12T10:00:00Z' },
    { id: 'app-4', jobId: 'job-3', candidateId: 'candidate-2', status: 'rejected', coverLetter: 'As a data professional...', appliedAt: '2024-03-13T10:00:00Z', notes: 'Not enough PM experience' },
    { id: 'app-5', jobId: 'job-4', candidateId: 'candidate-2', status: 'offered', coverLetter: 'My background in data science...', appliedAt: '2024-03-14T10:00:00Z' },
    { id: 'app-6', jobId: 'job-5', candidateId: 'candidate-5', status: 'pending', coverLetter: 'I am a qualified nurse...', appliedAt: '2024-03-15T10:00:00Z' },
    { id: 'app-7', jobId: 'job-7', candidateId: 'candidate-4', status: 'pending', coverLetter: 'Looking to transition into logistics...', appliedAt: '2024-03-16T10:00:00Z' },
    { id: 'app-8', jobId: 'job-10', candidateId: 'candidate-1', status: 'accepted', coverLetter: 'Design is my passion...', appliedAt: '2024-03-17T10:00:00Z' },
    { id: 'app-9', jobId: 'job-1', candidateId: 'candidate-2', status: 'pending', coverLetter: 'Eager to learn frontend...', appliedAt: '2024-03-18T10:00:00Z' },
    { id: 'app-10', jobId: 'job-3', candidateId: 'candidate-3', status: 'reviewing', coverLetter: 'Product management interests me...', appliedAt: '2024-03-19T10:00:00Z' },
];

// Sample Documents
export const mockDocuments: Document[] = [
    { id: 'doc-1', userId: 'candidate-1', type: 'passport', name: 'Passport_Maria_Garcia.pdf', status: 'verified', uploadedAt: '2024-03-05T10:00:00Z', verifiedAt: '2024-03-06T10:00:00Z', verifiedBy: 'staff-1', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-2', userId: 'candidate-1', type: 'cv', name: 'CV_Maria_Garcia.pdf', status: 'verified', uploadedAt: '2024-03-05T10:00:00Z', verifiedAt: '2024-03-06T10:00:00Z', verifiedBy: 'staff-1', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-3', userId: 'candidate-1', type: 'certificate', name: 'AWS_Certification.pdf', status: 'verified', uploadedAt: '2024-03-07T10:00:00Z', verifiedAt: '2024-03-08T10:00:00Z', verifiedBy: 'staff-2', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-4', userId: 'candidate-2', type: 'passport', name: 'Passport_Hans_Weber.pdf', status: 'verified', uploadedAt: '2024-03-10T10:00:00Z', verifiedAt: '2024-03-11T10:00:00Z', verifiedBy: 'staff-1', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-5', userId: 'candidate-2', type: 'diploma', name: 'PhD_DataScience.pdf', status: 'verified', uploadedAt: '2024-03-10T10:00:00Z', verifiedAt: '2024-03-11T10:00:00Z', verifiedBy: 'staff-1', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-6', userId: 'candidate-3', type: 'passport', name: 'Passport_Anna_Muller.pdf', status: 'verified', uploadedAt: '2024-03-15T10:00:00Z', verifiedAt: '2024-03-16T10:00:00Z', verifiedBy: 'staff-2', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-7', userId: 'candidate-3', type: 'cv', name: 'CV_Anna_Muller.pdf', status: 'verified', uploadedAt: '2024-03-15T10:00:00Z', verifiedAt: '2024-03-16T10:00:00Z', verifiedBy: 'staff-2', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-8', userId: 'candidate-4', type: 'passport', name: 'Passport_Peter_Novak.pdf', status: 'pending', uploadedAt: '2024-03-20T10:00:00Z', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-9', userId: 'candidate-4', type: 'cv', name: 'CV_Peter_Novak.pdf', status: 'pending', uploadedAt: '2024-03-20T10:00:00Z', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-10', userId: 'candidate-5', type: 'passport', name: 'Passport_Elena_Kowalski.pdf', status: 'pending', uploadedAt: '2024-03-25T10:00:00Z', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-11', userId: 'candidate-5', type: 'certificate', name: 'Nursing_License.pdf', status: 'pending', uploadedAt: '2024-03-25T10:00:00Z', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc-12', userId: 'candidate-5', type: 'certificate', name: 'German_B2_Certificate.pdf', status: 'rejected', uploadedAt: '2024-03-25T10:00:00Z', verifiedBy: 'staff-1', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
];


// Sample Insights
export const mockInsights: Insight[] = [
    {
        id: 'insight-1',
        slug: 'german-labor-market-2024',
        title: 'German Labor Market Outlook 2024',
        excerpt: 'An analysis of employment trends and opportunities in Germany.',
        content: '<p>The German labor market continues to show resilience despite global economic challenges...</p><p>Key sectors experiencing growth include IT, healthcare, and green energy.</p>',
        category: 'Market Analysis',
        author: 'Dr. Hans Weber',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        published: true,
        featured: true,
        createdAt: '2024-03-01T10:00:00Z',
    },
    {
        id: 'insight-2',
        slug: 'visa-requirements-skilled-workers',
        title: 'Visa Requirements for Skilled Workers',
        excerpt: 'Everything you need to know about getting a work visa in Germany.',
        content: '<p>Germany has streamlined its visa process for skilled workers...</p><p>The new Skilled Immigration Act makes it easier than ever to work in Germany.</p>',
        category: 'Immigration',
        author: 'Maria Schmidt',
        image: '/berlin_office_premium_1769811809678.png',
        published: true,
        featured: false,
        createdAt: '2024-03-10T10:00:00Z',
    },
    {
        id: 'insight-3',
        slug: 'top-skills-german-employers',
        title: 'Top Skills German Employers Are Looking For',
        excerpt: 'Discover the most in-demand skills in the German job market.',
        content: '<p>Based on our analysis of thousands of job postings...</p><p>Technical skills combined with German language proficiency remain highly valued.</p>',
        category: 'Career Advice',
        author: 'Anna Reviewer',
        image: '/tech_talent_germany_1769811898780.png',
        published: true,
        featured: true,
        createdAt: '2024-03-15T10:00:00Z',
    },
    {
        id: 'insight-4',
        slug: 'healthcare-recruitment-germany',
        title: 'Healthcare Recruitment in Germany',
        excerpt: 'How international healthcare professionals can find work in Germany.',
        content: '<p>Germany faces a significant shortage of healthcare workers...</p><p>Nurses, doctors, and caregivers from abroad are in high demand.</p>',
        category: 'Industry Focus',
        author: 'Thomas Prüfer',
        image: '/german_industry_high_tech_1769811823885.png',
        published: true,
        featured: false,
        createdAt: '2024-03-20T10:00:00Z',
    },
    {
        id: 'insight-5',
        slug: 'remote-work-germany-legal-guide',
        title: 'Remote Work in Germany: A Legal Guide',
        excerpt: 'Understanding the legal framework for remote work in Germany.',
        content: '<p>Remote work regulations in Germany have evolved significantly...</p><p>Employers and employees need to understand their rights and obligations.</p>',
        category: 'Legal',
        author: 'Dr. Klaus Schmidt',
        image: '/remote_hiring_modern_1769811886717.png',
        published: false,
        featured: false,
        createdAt: '2024-03-25T10:00:00Z',
    },
];

// Sample Audit Logs
export const mockAuditLogs: AuditLog[] = [
    { id: 'log-1', userId: 'admin-1', action: 'USER_VERIFIED', details: 'Verified employer: TechCorp GmbH', timestamp: '2024-03-01T10:00:00Z' },
    { id: 'log-2', userId: 'staff-1', action: 'DOCUMENT_APPROVED', details: 'Approved passport for Maria Garcia', timestamp: '2024-03-06T10:00:00Z' },
    { id: 'log-3', userId: 'staff-2', action: 'DOCUMENT_REJECTED', details: 'Rejected German certificate for Elena Kowalski - unclear scan', timestamp: '2024-03-26T10:00:00Z' },
    { id: 'log-4', userId: 'admin-1', action: 'JOB_DELETED', details: 'Deleted job posting: Junior Developer (spam)', timestamp: '2024-03-28T10:00:00Z' },
    { id: 'log-5', userId: 'employer-1', action: 'JOB_CREATED', details: 'Created job: Senior Frontend Developer', timestamp: '2024-03-01T10:00:00Z' },
];

export const mockTalentDemands: TalentDemand[] = [
    {
        id: 'demand-1',
        employerId: 'employer-1',
        title: 'Specialized DevOps for Kubernetes',
        sector: 'IT & Engineering',
        description: 'We need a highly specialized engineer to manage our multi-cloud Kubernetes clusters.',
        requiredSkills: ['Kubernetes', 'Terraform', 'AWS', 'GCP'],
        experienceLevel: 'senior',
        salaryRange: '€90,000 - €120,000',
        locationPreference: 'Berlin / Hybrid',
        languageRequirements: ['English (Fluent)', 'German (B1)'],
        urgency: 'high',
        employmentType: 'full-time',
        remotePreference: 'hybrid',
        visaSupport: true,
        suggestedCandidateIds: [],
        manualProfiles: [],
        status: 'open',
        createdAt: '2024-02-20T11:00:00Z'
    }
];

// Data Store Class
class MockDataStore {
    private getItem<T>(key: string, defaultValue: T): T {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch {
            return defaultValue;
        }
    }

    private setItem<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Initialize data if not exists
    init(): void {
        const INIT_VERSION = 'v5'; // bump this to re-seed all data
        if (localStorage.getItem('mock_initialized') !== INIT_VERSION) {
            this.setItem('users', mockUsers);
            this.setItem('jobs', mockJobs);
            this.setItem('applications', mockApplications);
            this.setItem('documents', mockDocuments);
            this.setItem('documents', mockDocuments);
            this.setItem('insights', mockInsights);
            this.setItem('auditLogs', mockAuditLogs);
            this.setItem('plans', mockPlans);
            this.setItem('quoteRequests', mockQuoteRequests);
            this.setItem('talentDemands', mockTalentDemands);
            localStorage.setItem('mock_initialized', INIT_VERSION);
        }
    }

    // Users
    getUsers(): User[] { return this.getItem('users', mockUsers); }
    getUserById(id: string): User | undefined { return this.getUsers().find(u => u.id === id); }
    getUserByEmail(email: string): User | undefined { return this.getUsers().find(u => u.email === email); }
    getCandidates(): User[] { return this.getUsers().filter(u => u.role === 'candidate'); }
    getEmployers(): User[] { return this.getUsers().filter(u => u.role === 'employer'); }
    getStaff(): User[] { return this.getUsers().filter(u => u.role === 'staff'); }
    addUser(user: User): void { const users = this.getUsers(); users.push(user); this.setItem('users', users); }
    updateUser(id: string, data: Partial<User>): void {
        const users = this.getUsers();
        const idx = users.findIndex(u => u.id === id);
        if (idx !== -1) { users[idx] = { ...users[idx], ...data }; this.setItem('users', users); }
    }

    // Jobs
    getJobs(): Job[] { return this.getItem('jobs', mockJobs); }
    getJobById(id: string): Job | undefined { return this.getJobs().find(j => j.id === id); }
    getJobsByEmployer(employerId: string): Job[] { return this.getJobs().filter(j => j.employerId === employerId); }
    addJob(job: Job): void { const jobs = this.getJobs(); jobs.push(job); this.setItem('jobs', jobs); }
    updateJob(id: string, data: Partial<Job>): void {
        const jobs = this.getJobs();
        const idx = jobs.findIndex(j => j.id === id);
        if (idx !== -1) { jobs[idx] = { ...jobs[idx], ...data }; this.setItem('jobs', jobs); }
    }
    deleteJob(id: string): void { const jobs = this.getJobs().filter(j => j.id !== id); this.setItem('jobs', jobs); }

    // Applications
    getApplications(): Application[] { return this.getItem('applications', mockApplications); }
    getApplicationById(id: string): Application | undefined { return this.getApplications().find(a => a.id === id); }
    getApplicationsByCandidate(candidateId: string): Application[] { return this.getApplications().filter(a => a.candidateId === candidateId); }
    getApplicationsByJob(jobId: string): Application[] { return this.getApplications().filter(a => a.jobId === jobId); }
    addApplication(app: Application): void { const apps = this.getApplications(); apps.push(app); this.setItem('applications', apps); }
    updateApplication(id: string, data: Partial<Application>): void {
        const apps = this.getApplications();
        const idx = apps.findIndex(a => a.id === id);
        if (idx !== -1) { apps[idx] = { ...apps[idx], ...data }; this.setItem('applications', apps); }
    }

    // Documents
    getDocuments(): Document[] { return this.getItem('documents', mockDocuments); }
    getDocumentsByUser(userId: string): Document[] { return this.getDocuments().filter(d => d.userId === userId); }
    getPendingDocuments(): Document[] { return this.getDocuments().filter(d => d.status === 'pending'); }
    addDocument(doc: Document): void { const docs = this.getDocuments(); docs.push(doc); this.setItem('documents', docs); }
    updateDocument(id: string, data: Partial<Document>): void {
        const docs = this.getDocuments();
        const idx = docs.findIndex(d => d.id === id);
        if (idx !== -1) { docs[idx] = { ...docs[idx], ...data }; this.setItem('documents', docs); }
    }
    deleteDocument(id: string): void { const docs = this.getDocuments().filter(d => d.id !== id); this.setItem('documents', docs); }



    // Insights
    getInsights(): Insight[] { return this.getItem('insights', mockInsights); }
    getInsightById(id: string): Insight | undefined { return this.getInsights().find(i => i.id === id); }
    getInsightBySlug(slug: string): Insight | undefined { return this.getInsights().find(i => i.slug === slug); }
    addInsight(insight: Insight): void { const insights = this.getInsights(); insights.push(insight); this.setItem('insights', insights); }
    updateInsight(id: string, data: Partial<Insight>): void {
        const insights = this.getInsights();
        const idx = insights.findIndex(i => i.id === id);
        if (idx !== -1) { insights[idx] = { ...insights[idx], ...data }; this.setItem('insights', insights); }
    }
    deleteInsight(id: string): void { const insights = this.getInsights().filter(i => i.id !== id); this.setItem('insights', insights); }

    // Plans
    getPlans(): Plan[] { return this.getItem('plans', mockPlans); }
    getPlanById(id: string): Plan | undefined { return this.getPlans().find(p => p.id === id); }

    // Quote Requests
    getQuoteRequests(): QuoteRequest[] { return this.getItem('quoteRequests', mockQuoteRequests); }
    getQuoteRequestById(id: string): QuoteRequest | undefined { return this.getQuoteRequests().find(q => q.id === id); }
    getQuoteRequestsByCandidate(candidateId: string): QuoteRequest[] { return this.getQuoteRequests().filter(q => q.candidateId === candidateId); }
    getQuoteRequestsByEmployer(employerId: string): QuoteRequest[] { return this.getQuoteRequests().filter(q => q.employerId === employerId); }
    addQuoteRequest(request: QuoteRequest): void { const requests = this.getQuoteRequests(); requests.push(request); this.setItem('quoteRequests', requests); }
    updateQuoteRequest(id: string, data: Partial<QuoteRequest>): void {
        const requests = this.getQuoteRequests();
        const idx = requests.findIndex(q => q.id === id);
        if (idx !== -1) { requests[idx] = { ...requests[idx], ...data }; this.setItem('quoteRequests', requests); }
    }

    // Talent Demands
    getTalentDemands(): TalentDemand[] { return this.getItem('talentDemands', mockTalentDemands); }
    getTalentDemandsByEmployer(employerId: string): TalentDemand[] { return this.getTalentDemands().filter(d => d.employerId === employerId); }
    getTalentDemandById(id: string): TalentDemand | undefined { return this.getTalentDemands().find(d => d.id === id); }
    addTalentDemand(demand: TalentDemand): void { const demands = this.getTalentDemands(); demands.push(demand); this.setItem('talentDemands', demands); }
    updateTalentDemand(id: string, data: Partial<TalentDemand>): void {
        const demands = this.getTalentDemands();
        const idx = demands.findIndex(d => d.id === id);
        if (idx !== -1) { demands[idx] = { ...demands[idx], ...data }; this.setItem('talentDemands', demands); }
    }
    deleteTalentDemand(id: string): void { const demands = this.getTalentDemands().filter(d => d.id !== id); this.setItem('talentDemands', demands); }

    // Employer-Candidate Relations
    getCandidateRelations(): EmployerCandidateRel[] { return this.getItem('candidateRelations', mockCandidateRelations); }
    getRelationsByEmployer(employerId: string): EmployerCandidateRel[] { return this.getCandidateRelations().filter(r => r.employerId === employerId); }
    updateRelation(employerId: string, candidateId: string, status: CandidateStatus): void {
        const relations = this.getCandidateRelations();
        const idx = relations.findIndex(r => r.employerId === employerId && r.candidateId === candidateId);
        if (idx !== -1) {
            relations[idx] = { ...relations[idx], status, updatedAt: new Date().toISOString() };
        } else {
            relations.push({
                id: `rel-${Date.now()}`,
                employerId,
                candidateId,
                status,
                updatedAt: new Date().toISOString()
            });
        }
        this.setItem('candidateRelations', relations);
    }

    // Interviews
    getInterviews(): InterviewMeeting[] { return this.getItem('interviews', []); }
    getInterviewById(id: string): InterviewMeeting | undefined { return this.getInterviews().find(i => i.id === id); }
    getInterviewsByUser(userId: string): InterviewMeeting[] {
        return this.getInterviews().filter(i => i.employerId === userId || i.candidateId === userId || i.scheduledBy === userId);
    }
    addInterview(interview: InterviewMeeting): void { const interviews = this.getInterviews(); interviews.push(interview); this.setItem('interviews', interviews); }
    updateInterview(id: string, data: Partial<InterviewMeeting>): void {
        const interviews = this.getInterviews();
        const idx = interviews.findIndex(i => i.id === id);
        if (idx !== -1) { interviews[idx] = { ...interviews[idx], ...data }; this.setItem('interviews', interviews); }
    }

    // Audit Logs
    getAuditLogs(): AuditLog[] { return this.getItem('auditLogs', mockAuditLogs); }
    addAuditLog(log: AuditLog): void { const logs = this.getAuditLogs(); logs.push(log); this.setItem('auditLogs', logs); }

    // Domains
    getDomains(): Domain[] { return this.getItem('domains', mockDomains); }
    addDomain(domain: Domain): void { const domains = this.getDomains(); domains.push(domain); this.setItem('domains', domains); }
    updateDomain(id: string, data: Partial<Domain>): void {
        const domains = this.getDomains();
        const idx = domains.findIndex(d => d.id === id);
        if (idx !== -1) { domains[idx] = { ...domains[idx], ...data }; this.setItem('domains', domains); }
    }
    deleteDomain(id: string): void { const domains = this.getDomains().filter(d => d.id !== id); this.setItem('domains', domains); }

    // Stats
    getStats() {
        const users = this.getUsers();
        const jobs = this.getJobs();
        const insights = this.getInsights();
        return {
            totalUsers: users.length,
            totalEmployers: users.filter(u => u.role === 'employer').length,
            totalWorkers: users.filter(u => u.role === 'candidate').length,
            totalJobs: jobs.filter(j => j.status === 'active').length,
            totalInsights: insights.filter(i => i.published).length,
        };
    }

    // Reset to defaults
    reset(): void {
        localStorage.removeItem('mock_initialized');
        this.init();
    }
}

export const dataStore = new MockDataStore();

// Initialize on import
dataStore.init();

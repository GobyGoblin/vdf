import sequelize from './config/database.js';
import {
  User,
  CandidateProfile,
  EmployerProfile,
  Document,
  ConsentRequest,
  ProfileView,
  Insight,
  Domain,
  Plan,
  EmployerCandidateRel,
  QuoteRequest,
} from './models/index.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Sync database (force: true will drop and recreate all tables)
    console.log('Synchronizing database...');
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Admin User
    const admin = await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
      profileComplete: true,
    });
    console.log('✓ Admin user created');

    // Create Staff User
    const staff = await User.create({
      email: 'staff@example.com',
      password: hashedPassword,
      role: 'staff',
      firstName: 'Staff',
      lastName: 'Member',
      isVerified: true,
      profileComplete: true,
    });
    console.log('✓ Staff user created');

    // Create Employers
    const employers = [];
    const employerData = [
      {
        email: 'employer1@example.com',
        companyName: 'TechCorp Berlin',
        firstName: 'Max',
        lastName: 'Schmidt',
        profile: {
          companyName: 'TechCorp Berlin',
          companyDescription: 'Leading innovator in the Berlin tech scene, focused on sustainable software solutions.',
          website: 'https://techcorp-berlin.de',
          phone: '+49 30 12345678',
          address: 'Friedrichstraße 123',
          city: 'Berlin',
          country: 'Germany',
          industry: 'Technology',
          companySize: '50-200',
        },
      },
      {
        email: 'employer2@example.com',
        companyName: 'StartupHub Munich',
        firstName: 'Anna',
        lastName: 'Müller',
        profile: {
          companyName: 'StartupHub Munich',
          companyDescription: 'Fast-growing startup in the heart of Munich, building the future of fintech.',
          website: 'https://startuphub-munich.de',
          phone: '+49 89 87654321',
          address: 'Marienplatz 1',
          city: 'Munich',
          country: 'Germany',
          industry: 'Fintech',
          companySize: '10-50',
        },
      },
      {
        email: 'employer3@example.com',
        companyName: 'GreenEnergy Solutions',
        firstName: 'Thomas',
        lastName: 'Weber',
        profile: {
          companyName: 'GreenEnergy Solutions',
          companyDescription: 'Sustainable energy solutions for a better tomorrow.',
          website: 'https://greenenergy-solutions.de',
          phone: '+49 40 11223344',
          address: 'Hafenstraße 45',
          city: 'Hamburg',
          country: 'Germany',
          industry: 'Energy',
          companySize: '200-500',
        },
      },
    ];

    for (const empData of employerData) {
      const employer = await User.create({
        email: empData.email,
        password: hashedPassword,
        role: 'employer',
        firstName: empData.firstName,
        lastName: empData.lastName,
        companyName: empData.companyName,
        isVerified: true,
        profileComplete: true,
      });

      await EmployerProfile.create({
        userId: employer.id,
        ...empData.profile,
      });

      employers.push(employer);
      console.log(`✓ Employer created: ${empData.companyName}`);
    }

    // Create Candidates
    const candidates = [];
    const candidateData = [
      {
        email: 'candidate1@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        profile: {
          phone: '+49 30 11111111',
          address: 'Alexanderplatz 1',
          city: 'Berlin',
          country: 'Germany',
          bio: 'Experienced software engineer with 5+ years in full-stack development. Passionate about clean code and modern technologies.',
          skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'German C1'],
          experience: [
            {
              title: 'Senior Software Engineer',
              company: 'Previous Company',
              startDate: '2020-01-01',
              endDate: '2023-12-31',
              description: 'Led development of multiple web applications.',
            },
          ],
          education: [
            {
              degree: 'Bachelor of Computer Science',
              institution: 'Technical University Berlin',
              year: '2019',
            },
          ],
          profileScore: 85,
        },
      },
      {
        email: 'candidate2@example.com',
        firstName: 'Michael',
        lastName: 'Chen',
        profile: {
          phone: '+49 89 22222222',
          address: 'Maximilianstraße 10',
          city: 'Munich',
          country: 'Germany',
          bio: 'Full-stack developer specializing in React and Node.js. Fluent in English and German.',
          skills: ['React', 'Node.js', 'MongoDB', 'Express', 'German B2'],
          experience: [
            {
              title: 'Full Stack Developer',
              company: 'Tech Startup',
              startDate: '2021-06-01',
              endDate: null,
              description: 'Building scalable web applications.',
            },
          ],
          education: [
            {
              degree: 'Master of Software Engineering',
              institution: 'LMU Munich',
              year: '2021',
            },
          ],
          profileScore: 78,
        },
      },
      {
        email: 'candidate3@example.com',
        firstName: 'Emma',
        lastName: 'Schneider',
        profile: {
          phone: '+49 40 33333333',
          address: 'Jungfernstieg 20',
          city: 'Hamburg',
          country: 'Germany',
          bio: 'Frontend developer with expertise in React and Vue.js. Native German speaker.',
          skills: ['React', 'Vue.js', 'CSS', 'HTML', 'JavaScript', 'German Native'],
          experience: [
            {
              title: 'Frontend Developer',
              company: 'Digital Agency',
              startDate: '2022-03-01',
              endDate: null,
              description: 'Creating beautiful and functional user interfaces.',
            },
          ],
          education: [
            {
              degree: 'Bachelor of Media Design',
              institution: 'University of Hamburg',
              year: '2022',
            },
          ],
          profileScore: 72,
        },
      },
      {
        email: 'candidate4@example.com',
        firstName: 'David',
        lastName: 'Kowalski',
        profile: {
          phone: '+49 221 44444444',
          address: 'Domstraße 5',
          city: 'Cologne',
          country: 'Germany',
          bio: 'Backend developer with strong experience in Java and Spring Framework.',
          skills: ['Java', 'Spring', 'PostgreSQL', 'Docker', 'Kubernetes', 'German C1'],
          experience: [
            {
              title: 'Backend Developer',
              company: 'Enterprise Solutions',
              startDate: '2019-01-01',
              endDate: '2024-01-01',
              description: 'Developed microservices architecture.',
            },
          ],
          education: [
            {
              degree: 'Master of Computer Science',
              institution: 'University of Cologne',
              year: '2019',
            },
          ],
          profileScore: 80,
        },
      },
    ];

    for (const candData of candidateData) {
      const candidate = await User.create({
        email: candData.email,
        password: hashedPassword,
        role: 'candidate',
        firstName: candData.firstName,
        lastName: candData.lastName,
        isVerified: true,
        profileComplete: true,
      });

      await CandidateProfile.create({
        userId: candidate.id,
        ...candData.profile,
      });

      candidates.push(candidate);
      console.log(`✓ Candidate created: ${candData.firstName} ${candData.lastName}`);
    }

    // Removed Jobs and Applications Seeding

    // Create Insights
    const insights = [
      {
        slug: 'german-work-visa-guide-2024',
        title: 'Complete Guide to German Work Visas in 2024',
        excerpt: 'Everything you need to know about obtaining a work visa in Germany, including requirements, application process, and tips for success.',
        category: 'Immigration',
        content: [
          'Germany offers several types of work visas for skilled professionals from around the world. The most common is the EU Blue Card, which is available to highly qualified workers.',
          'To qualify for an EU Blue Card, you typically need a recognized university degree and a job offer with a minimum salary threshold (currently €58,400 per year, or €45,552 for shortage occupations).',
          'The application process involves gathering documents, submitting your application at the German embassy in your home country, and then registering with the local authorities once you arrive in Germany.',
          'Processing times can vary, but typically take 2-3 months. It\'s important to start the process early and ensure all documents are properly translated and certified.',
        ],
        readTime: '8 min read',
        featured: true,
        published: true,
        publishedAt: new Date(),
        authorId: admin.id,
      },
      {
        slug: 'top-tech-companies-berlin',
        title: 'Top Tech Companies Hiring in Berlin',
        excerpt: 'Discover the leading technology companies in Berlin that are actively hiring international talent.',
        category: 'Jobs',
        content: [
          'Berlin has become one of Europe\'s leading tech hubs, attracting companies from around the world.',
          'Major players like Zalando, Delivery Hero, and N26 call Berlin home, along with hundreds of innovative startups.',
          'These companies offer competitive salaries, excellent benefits, and opportunities for career growth.',
          'Many tech companies in Berlin actively seek international talent and offer visa sponsorship for qualified candidates.',
        ],
        readTime: '5 min read',
        featured: false,
        published: true,
        publishedAt: new Date(),
        authorId: admin.id,
      },
      {
        slug: 'german-language-requirements',
        title: 'German Language Requirements for Work',
        excerpt: 'Understanding the German language requirements for different types of jobs and visa categories.',
        category: 'Immigration',
        content: [
          'While many tech companies in Germany operate in English, having German language skills can significantly improve your job prospects.',
          'For most work visas, German language proficiency is not strictly required, but it can help with integration and daily life.',
          'However, certain professions, especially those involving direct customer contact, may require German language certification.',
          'The Common European Framework of Reference (CEFR) levels (A1-C2) are used to assess language proficiency. Most employers look for at least B1-B2 level.',
        ],
        readTime: '6 min read',
        featured: false,
        published: true,
        publishedAt: new Date(),
        authorId: admin.id,
      },
    ];

    for (const insightData of insights) {
      await Insight.create(insightData);
      console.log(`✓ Insight created: ${insightData.title}`);
    }

    // Create some profile views
    await ProfileView.create({
      candidateId: candidates[0].id,
      viewedBy: employers[0].id,
      employerId: employers[0].id,
    });
    await ProfileView.create({
      candidateId: candidates[1].id,
      viewedBy: employers[1].id,
      employerId: employers[1].id,
    });
    console.log('✓ Profile views created');

    // ═══════════════════════════════════════════════════════════════════
    // NEW MODEL SEED DATA
    // ═══════════════════════════════════════════════════════════════════

    // Domains
    const domainData = [
      { icon: '💻', title: 'Information Technology', count: '120' },
      { icon: '🏗️', title: 'Engineering', count: '85' },
      { icon: '🏥', title: 'Healthcare', count: '64' },
      { icon: '📊', title: 'Finance & Accounting', count: '47' },
      { icon: '🏭', title: 'Manufacturing', count: '38' },
      { icon: '🍳', title: 'Hospitality & Gastronomy', count: '52' },
      { icon: '🚛', title: 'Logistics & Transport', count: '29' },
      { icon: '⚡', title: 'Energy & Utilities', count: '21' },
    ];
    for (const d of domainData) {
      await Domain.create(d);
    }
    console.log(`✓ ${domainData.length} Domains created`);

    // Plans
    const planData = [
      {
        name: 'Starter',
        price: 0,
        currency: 'EUR',
        badgeType: 'none',
        features: ['Basic profile', 'Job search', 'Apply to 5 jobs/month'],
        description: 'Get started with the essentials.',
      },
      {
        name: 'Professional',
        price: 29.99,
        currency: 'EUR',
        badgeType: 'blue',
        features: ['Blue badge', 'Priority listing', 'Unlimited applications', 'Profile analytics'],
        description: 'Stand out from the crowd.',
      },
      {
        name: 'Executive',
        price: 79.99,
        currency: 'EUR',
        badgeType: 'gold',
        features: ['Gold badge', 'Top priority listing', 'Dedicated support', 'Resume review', 'Interview coaching'],
        description: 'Premium placement experience.',
      },
    ];
    for (const p of planData) {
      await Plan.create(p);
    }
    console.log(`✓ ${planData.length} Plans created`);

    // Employer-Candidate Relations (pipeline)
    const relData = [
      { employerId: employers[0].id, candidateId: candidates[0].id, status: 'shortlisted' },
      { employerId: employers[0].id, candidateId: candidates[1].id, status: 'potential' },
      { employerId: employers[1].id, candidateId: candidates[2].id, status: 'potential' },
      { employerId: employers[2].id, candidateId: candidates[3].id, status: 'asked_quote' },
    ];
    for (const r of relData) {
      await EmployerCandidateRel.create(r);
    }
    console.log(`✓ ${relData.length} Pipeline relations created`);

    // Quote Requests
    await QuoteRequest.create({
      employerId: employers[0].id,
      candidateId: candidates[0].id,
      status: 'pending',
      requestedAt: new Date(),
    });
    await QuoteRequest.create({
      employerId: employers[2].id,
      candidateId: candidates[3].id,
      status: 'approved',
      requestedAt: new Date(Date.now() - 86400000),
      resolvedAt: new Date(),
      costEstimate: '€12,000 - €15,000',
      options: [
        {
          id: crypto.randomUUID(),
          name: 'Essential Package',
          costEstimate: '€12,000 - €15,000',
          perks: ['Standard Placement', 'Basic Support'],
          items: [
            { label: 'Placement Fee', amount: 8000, description: 'Recruitment & Vetting' },
            { label: 'Admin Fee', amount: 2000, description: 'Processing & Compliance' },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: 'Executive Package',
          costEstimate: '€18,000 - €22,000',
          perks: ['Priority Support', 'Relocation Assistance', 'Onboarding Package'],
          items: [
            { label: 'Placement Fee', amount: 12000, description: 'Premium Sourcing' },
            { label: 'Relocation Support', amount: 4000, description: 'Logistics & Housing' },
            { label: 'Integration Package', amount: 2500, description: 'Cultural Training' },
          ],
        },
      ],
    });
    console.log('✓ Quote requests created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: admin@example.com / password123');
    console.log('   Staff: staff@example.com / password123');
    console.log('   Employers: employer1@example.com, employer2@example.com, employer3@example.com / password123');
    console.log('   Candidates: candidate1@example.com, candidate2@example.com, candidate3@example.com, candidate4@example.com / password123');
    console.log('\n📊 Created:');
    console.log(`   - ${employers.length} Employers`);
    console.log(`   - ${candidates.length} Candidates`);
    console.log(`   - ${insights.length} Insights`);
    console.log(`   - ${domainData.length} Domains`);
    console.log(`   - ${planData.length} Plans`);
    console.log(`   - ${relData.length} Pipeline Relations`);
    console.log('   - 2 Quote Requests');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

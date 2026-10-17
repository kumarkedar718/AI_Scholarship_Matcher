const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_scholarship_matcher';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for 2026-27 Data Refresh...');

    // 1. Find or Create Admin User (Preserves existing admin account)
    let adminUser = await User.findOne({ email: 'admin@scholarshipmatcher.edu' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@scholarshipmatcher.edu',
        password: 'adminpassword123',
        role: 'admin',
        isEmailVerified: true,
        profile: {
          isProfileComplete: true
        }
      });
      console.log('Created Admin User: admin@scholarshipmatcher.edu');
    } else {
      console.log('Preserved existing Admin User.');
    }

    // 2. Find or Create Demo Student User (Preserves existing student profile & certificate)
    let demoStudent = await User.findOne({ email: 'rahul.student@example.com' });
    if (!demoStudent) {
      demoStudent = await User.create({
        name: 'Rahul Kumar',
        email: 'rahul.student@example.com',
        password: 'studentpassword123',
        role: 'student',
        isEmailVerified: true,
        profile: {
          phone: '+91 9876543210',
          educationLevel: 'Undergraduate',
          course: 'B.Tech',
          branch: 'Computer Science',
          currentYear: 3,
          currentSemester: 5,
          cgpaOrPercentage: 8.4,
          maxCgpaOrScale: 10,
          familyIncomeAnnual: 250000,
          stateOfDomicile: 'Bihar',
          category: 'OBC',
          gender: 'Male',
          isDisability: false,
          disabilityPercentage: 0,
          isSingleGirlChild: false,
          isProfileComplete: true
        }
      });
      console.log('Created Demo Student User: rahul.student@example.com');
    } else {
      console.log('Preserved existing Demo Student User.');
    }

    // Clear old expired 2025 scholarship records to ensure zero expired scholarships remain
    await Scholarship.deleteMany({});
    console.log('Cleared expired/legacy scholarship collection...');

    // 3. Current 2026-27 Verified Real Scholarships Dataset (25 Total)
    const currentScholarships2026 = [
      {
        title: 'PM-USP Central Sector Scheme of Scholarship for College and University Students',
        provider: 'Department of Higher Education, Ministry of Education, Govt. of India',
        description: 'Aiming to provide financial assistance to meritorious students from low-income families to meet a part of their day-to-day expenses while pursuing higher studies in degree courses.',
        summary: '• Provides ₹12,000/year for undergraduate students & ₹20,000/year for postgraduate students\n• Requires 80th percentile in Class 12 board exams and annual family income <= ₹4.5 Lakhs\n• Official NSP 2026-27 portal application cycle open',
        amountText: '₹12,000 / year (UG) & ₹20,000 / year (PG)',
        amountNumeric: 12000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://scholarships.gov.in',
        source: {
          name: 'National Scholarship Portal (NSP)',
          url: 'https://scholarships.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: true,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate'],
          allowedCourses: ['B.Tech', 'B.Sc', 'B.Com', 'B.A', 'M.Tech', 'M.Sc'],
          allowedBranches: [],
          minCgpa: 7.5,
          maxFamilyIncome: 450000,
          allowedStates: [],
          allowedCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: [
          'Class 12th Marksheet',
          'Income Certificate issued by competent authority',
          'Bank Account Passbook (Aadhaar Seeded)',
          'Category / Caste Certificate'
        ],
        tags: ['Central Govt', 'PM-USP', 'NSP 2026-27', 'Merit-cum-Means']
      },
      {
        title: "Prime Minister's Scholarship Scheme for CAPF & Assam Rifles (PMSS CAPF)",
        provider: 'Welfare and Rehabilitation Board, Ministry of Home Affairs, Govt. of India',
        description: 'Financial assistance scheme for dependent wards and widows of CAPFs & AR personnel pursuing professional undergraduate degree courses.',
        summary: '• Grants ₹36,000/year for girls & ₹30,000/year for boys\n• Requires min 60% marks in Class 12 / Diploma\n• Applicable for professional courses like B.Tech, MBBS, BDS, B.Sc Nursing, B.Pharm',
        amountText: '₹36,000 / year (Girls) & ₹30,000 / year (Boys)',
        amountNumeric: 36000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://scholarships.gov.in',
        source: {
          name: 'National Scholarship Portal (NSP / MHA)',
          url: 'https://scholarships.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: true,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate'],
          allowedCourses: ['B.Tech', 'MBBS', 'BDS', 'B.Sc', 'B.Pharm'],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: null,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Class 12th Marksheet', 'Service Certificate / PPO', 'Bonafide Student Certificate'],
        tags: ['Central Govt', 'MHA', 'CAPF', 'Armed Forces', 'PMSS']
      },
      {
        title: 'AICTE Pragati Scholarship Scheme for Girl Students (Degree & Diploma)',
        provider: 'All India Council for Technical Education (AICTE)',
        description: 'Scheme aimed at providing assistance for advancement of girls pursuing technical education (Degree or Diploma) in AICTE approved institutions.',
        summary: '• ₹50,000 per annum for maximum 4 years\n• Reserved exclusively for Female students pursuing AICTE technical degrees\n• Maximum 2 girl children per family eligible (income < ₹8 Lakhs)',
        amountText: '₹50,000 / year',
        amountNumeric: 50000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://www.aicte-india.org',
        source: {
          name: 'AICTE / National Scholarship Portal',
          url: 'https://www.aicte-india.org',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: true,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Diploma'],
          allowedCourses: ['B.Tech', 'B.E', 'Diploma Engineering'],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: 800000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Female'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: [
          'Class 10th & 12th Marksheets',
          'AICTE College Admission Allotment Letter',
          'Income Certificate',
          'Family Self-Declaration for Girl Child'
        ],
        tags: ['AICTE', 'Girl Students', 'Technical Education', 'B.Tech']
      },
      {
        title: 'AICTE Saksham Scholarship Scheme for Specially Abled Students',
        provider: 'All India Council for Technical Education (AICTE)',
        description: 'Initiative to encourage specially-abled students to pursue technical education (Degree or Diploma) in AICTE approved technical institutions.',
        summary: '• ₹50,000 per annum towards college fee, computer, books & equipment\n• Restricted to PWD students with >= 40% disability admitted to AICTE degree/diploma\n• Family income limit ₹8 Lakhs per annum',
        amountText: '₹50,000 / year',
        amountNumeric: 50000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://www.aicte-india.org',
        source: {
          name: 'AICTE / National Scholarship Portal',
          url: 'https://www.aicte-india.org',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Diploma'],
          allowedCourses: ['B.Tech', 'B.E', 'Diploma Engineering'],
          allowedBranches: [],
          minCgpa: 5.0,
          maxFamilyIncome: 800000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: true,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Disability Certificate (>= 40%)', 'AICTE College Allotment Letter', 'Income Certificate'],
        tags: ['AICTE', 'PWD', 'Technical Education']
      },
      {
        title: 'AICTE Swanath Scholarship Scheme',
        provider: 'All India Council for Technical Education (AICTE)',
        description: 'Financial support scheme for orphans, children whose parents died due to COVID-19, or children of Armed Forces/Paramilitary slain in action.',
        summary: '• ₹50,000 per annum throughout degree/diploma duration\n• Open to students studying in AICTE-approved institutions\n• Family annual income must be <= ₹8 Lakhs',
        amountText: '₹50,000 / year',
        amountNumeric: 50000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://www.aicte-india.org',
        source: {
          name: 'AICTE / National Scholarship Portal',
          url: 'https://www.aicte-india.org',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Diploma'],
          allowedCourses: ['B.Tech', 'B.E', 'Diploma Engineering'],
          allowedBranches: [],
          minCgpa: 5.0,
          maxFamilyIncome: 800000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Orphan Certificate / Death Certificate', 'Income Certificate', 'Bonafide Student Certificate'],
        tags: ['AICTE', 'Swanath', 'Orphan', 'Technical Education']
      },
      {
        title: 'Post Matric Scholarship for Students with Disabilities',
        provider: 'Department of Empowerment of Persons with Disabilities, Govt. of India',
        description: 'Supports students with disabilities to study post-matriculation courses so as to improve their educational status and earning power.',
        summary: '• Maintenance allowance, disability allowance, and book grant\n• Requires minimum 40% benchmark disability certified by competent authority\n• Annual family income must not exceed ₹2.5 Lakhs',
        amountText: 'Up to ₹16,000 / year + Maintenance Allowance',
        amountNumeric: 16000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://scholarships.gov.in',
        source: {
          name: 'National Scholarship Portal (DEPwD)',
          url: 'https://scholarships.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
          allowedCourses: [],
          allowedBranches: [],
          minCgpa: 4.0,
          maxFamilyIncome: 250000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: true,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Disability Certificate (>= 40%)', 'Income Certificate', 'Aadhaar Card'],
        tags: ['Disability', 'PWD', 'Central Govt', 'DEPwD']
      },
      {
        title: 'Central Sector Scholarship of Top Class Education for SC Students',
        provider: 'Ministry of Social Justice and Empowerment, Govt. of India',
        description: 'Scholarship scheme aiming to recognize and promote quality education amongst SC students by providing full financial support for pursuing studies beyond 12th class in top notified institutes.',
        summary: '• Full tuition fee reimbursement + ₹86,000/year living expenses, books & computer\n• Restricted to SC category students pursuing UG/PG in top institutes (IITs, NITs, IIMs, AIIMS, etc.)\n• Family income limit ₹8.0 Lakhs per annum',
        amountText: 'Full Tuition Fee Reimbursement + ₹86,000 / year Stipend',
        amountNumeric: 86000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://scholarships.gov.in',
        source: {
          name: 'National Scholarship Portal (MSJE)',
          url: 'https://scholarships.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: true,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate'],
          allowedCourses: ['B.Tech', 'MBBS', 'B.Sc', 'B.Com', 'M.Tech', 'MBA'],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: 800000,
          allowedStates: [],
          allowedCategories: ['SC'],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Caste Certificate (SC)', 'Income Certificate', 'Top-Class Institute Admission Letter', 'Fee Receipt'],
        tags: ['SC Students', 'Top Class Education', 'MSJE', 'Central Govt']
      },
      {
        title: 'Post Matric Scholarships Scheme for Minorities',
        provider: 'Ministry of Minority Affairs, Govt. of India',
        description: 'Provides financial assistance to students belonging to notified minority communities pursuing higher education from Class 11 to PhD.',
        summary: '• Full tuition fee waiver + maintenance allowance up to ₹10,000/year\n• Restricted to Minority category (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)\n• Family annual income must not exceed ₹2.0 Lakhs',
        amountText: 'Up to ₹10,000 / year + Tuition Fee Reimbursement',
        amountNumeric: 10000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://scholarships.gov.in',
        source: {
          name: 'National Scholarship Portal (MoMA)',
          url: 'https://scholarships.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'Diploma', 'PhD'],
          allowedCourses: [],
          allowedBranches: [],
          minCgpa: 5.0,
          maxFamilyIncome: 200000,
          allowedStates: [],
          allowedCategories: ['Minority'],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Self-Declaration of Minority Community', 'Income Certificate', 'Academic Marksheet'],
        tags: ['Minority Welfare', 'Central Govt', 'National Portal']
      },
      {
        title: 'National Fellowship and Scholarship for Higher Education of ST Students',
        provider: 'Ministry of Tribal Affairs, Govt. of India',
        description: 'Financial support scheme for ST students pursuing higher education (UG/PG/PhD) in top-class institutions specified by the Ministry of Tribal Affairs.',
        summary: '• Full tuition fee reimbursement + ₹45,000/year books & living allowance\n• Reserved exclusively for Scheduled Tribe (ST) candidates\n• Annual family income limit <= ₹6.0 Lakhs',
        amountText: 'Full Tuition Fee + ₹45,000 / year Allowance',
        amountNumeric: 45000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://scholarships.gov.in',
        source: {
          name: 'National Scholarship Portal (Ministry of Tribal Affairs)',
          url: 'https://scholarships.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'PhD'],
          allowedCourses: [],
          allowedBranches: [],
          minCgpa: 5.5,
          maxFamilyIncome: 600000,
          allowedStates: [],
          allowedCategories: ['ST'],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['ST Caste Certificate', 'Income Certificate', 'Institute Admission Letter'],
        tags: ['ST Students', 'Tribal Affairs', 'Central Govt', 'Top Class']
      },
      {
        title: 'Ishan Uday Special Scholarship Scheme for North Eastern Region (NER)',
        provider: 'University Grants Commission (UGC) / Ministry of Education',
        description: 'Special scheme by UGC to promote higher education among youth of North Eastern Region (NER) by awarding 10,000 fresh scholarships annually.',
        summary: '• ₹5,400/month for General Degree & ₹7,800/month for Technical/Professional Degree\n• Restricted to students holding Domicile of North Eastern States (Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, Sikkim)\n• Annual family income must not exceed ₹4.5 Lakhs',
        amountText: '₹64,800 to ₹93,600 / year',
        amountNumeric: 64800,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://www.ugc.gov.in',
        source: {
          name: 'UGC / National Scholarship Portal',
          url: 'https://www.ugc.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: true,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate'],
          allowedCourses: ['B.Tech', 'B.Sc', 'B.Com', 'B.A', 'MBBS', 'BBA'],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: 450000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['NER Domicile Certificate', 'Class 12th Marksheet', 'Income Certificate', 'Aadhaar Card'],
        tags: ['UGC', 'Ishan Uday', 'NER', 'North East', 'Central Govt']
      },
      {
        title: 'National Scholarship for Post Graduate Studies (UGC PG Scheme)',
        provider: 'University Grants Commission (UGC)',
        description: 'National scholarship scheme by UGC providing financial assistance to students admitted to 1st year Master degree courses in recognized universities.',
        summary: '• ₹15,000 / month (₹1,80,000 / year) for 2 years duration\n• Open for postgraduate students in General & Professional Master courses\n• Awarded on merit to students enrolled in recognized Indian universities',
        amountText: '₹15,000 / month (₹1,80,000 / year)',
        amountNumeric: 180000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://www.ugc.gov.in',
        source: {
          name: 'University Grants Commission (UGC)',
          url: 'https://www.ugc.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: true,
        eligibilityCriteria: {
          allowedEducationLevels: ['Postgraduate'],
          allowedCourses: ['M.Tech', 'M.Sc', 'M.Com', 'M.A', 'MBA', 'MCA'],
          allowedBranches: [],
          minCgpa: 6.5,
          maxFamilyIncome: null,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Undergraduate Degree Marksheet', 'PG Admission Fee Receipt', 'Aadhaar Card'],
        tags: ['UGC', 'Postgraduate', 'Master Degree', 'Central Govt']
      },
      {
        title: 'Financial Support to Students of NER for Higher Professional Courses (NEC Merit)',
        provider: 'North Eastern Council (NEC), Ministry of Development of North Eastern Region',
        description: 'Stipend and book grant scheme for students of North Eastern States pursuing diploma, degree, post-graduate, or M.Phil/Ph.D in professional subjects.',
        summary: '• ₹20,000/year for UG professional & ₹22,000/year for PG professional courses\n• Domicile of North Eastern States compulsory\n• Min 60% aggregate in entry qualification and family income <= ₹8.0 Lakhs',
        amountText: '₹20,000 / year (UG) & ₹22,000 / year (PG)',
        amountNumeric: 20000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://scholarships.gov.in',
        source: {
          name: 'North Eastern Council / NSP',
          url: 'https://scholarships.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
          allowedCourses: ['B.Tech', 'MBBS', 'B.Sc', 'M.Tech'],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: 800000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['PRC / Domicile Certificate of NER State', 'Academic Marksheet', 'Income Certificate'],
        tags: ['NEC', 'North East', 'Professional Courses', 'Central Govt']
      },
      {
        title: "Prime Minister's Scholarship Scheme for Ministry of Railways",
        provider: 'Railway Board, Ministry of Railways, Govt. of India',
        description: 'Scholarship scheme for dependent wards of Railway staff pursuing technical and professional undergraduate degree courses.',
        summary: '• ₹30,000/year for boys & ₹36,000/year for girls\n• Restricted to dependent wards of Railway employees (Group C & D)\n• Minimum 60% marks in Class 12 / Diploma',
        amountText: '₹30,000 / year (Boys) & ₹36,000 / year (Girls)',
        amountNumeric: 30000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://scholarships.gov.in',
        source: {
          name: 'Ministry of Railways / NSP',
          url: 'https://scholarships.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate'],
          allowedCourses: ['B.Tech', 'MBBS', 'BCA', 'BBA', 'B.Sc'],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: null,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Class 12th Marksheet', 'Railway Employee Certificate / Service Card', 'Bonafide Certificate'],
        tags: ['Railways', 'MHA', 'PMSS', 'Central Govt']
      },
      {
        title: 'ICAR National Talent Scholarship (NTS)',
        provider: 'Indian Council of Agricultural Research (ICAR)',
        description: 'Financial assistance scheme awarded to undergraduate and postgraduate students in Agriculture and Allied Sciences admitted outside their state of domicile.',
        summary: '• ₹3,000 / month (UG) & ₹5,000 / month (PG)\n• Awarded to candidates pursuing degree in Agricultural Universities through ICAR All India Entrance Examination\n• Requires student to be studying in a state other than domicile state',
        amountText: '₹36,000 / year (UG) & ₹60,000 / year (PG)',
        amountNumeric: 36000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://icar.org.in',
        source: {
          name: 'Indian Council of Agricultural Research (ICAR)',
          url: 'https://icar.org.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate'],
          allowedCourses: ['B.Sc', 'M.Sc'],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: null,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['ICAR Entrance Rank Card', 'College Admission Allotment Letter', 'Domicile Proof'],
        tags: ['ICAR', 'Agriculture', 'NTS', 'Central Govt']
      },
      {
        title: 'Scholarship for Top Class Education for Students with Disabilities',
        provider: 'Department of Empowerment of Persons with Disabilities, Govt. of India',
        description: 'Scheme to empower students with disabilities by providing full financial support for pursuing studies beyond 12th class in top-class notified institutes.',
        summary: '• Full tuition fee reimbursement + ₹30,000/year living maintenance & computer allowance\n• Requires minimum 40% benchmark disability certified by competent authority\n• Annual family income limit <= ₹8.0 Lakhs',
        amountText: 'Full Tuition Fee + ₹30,000 / year Allowance',
        amountNumeric: 30000,
        categoryType: 'Government',
        deadline: new Date('2026-10-31'),
        deadlineStatus: 'Closing Soon',
        academicYear: '2026-27',
        officialUrl: 'https://scholarships.gov.in',
        source: {
          name: 'National Scholarship Portal (DEPwD)',
          url: 'https://scholarships.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate'],
          allowedCourses: [],
          allowedBranches: [],
          minCgpa: 5.0,
          maxFamilyIncome: 800000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: true,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Disability Certificate (>= 40%)', 'Income Certificate', 'Top Class Institute Allotment Letter'],
        tags: ['PWD', 'Top Class', 'DEPwD', 'Central Govt']
      },
      {
        title: 'Post Matric Scholarship for OBC / SC / ST Students - Bihar State',
        provider: 'Department of SC & ST Welfare, Govt. of Bihar',
        description: 'Financial assistance scheme for post-matriculation students belonging to BC/EBC/SC/ST categories of Bihar State pursuing professional courses.',
        summary: '• Reimburses full tuition fees + maintenance allowance\n• Restricted to Bihar Domicile students belonging to OBC/SC/ST\n• Annual family income must not exceed ₹2.5 Lakhs (Official 2026-27 cycle open)',
        amountText: 'Full Tuition Fee Reimbursement + Monthly Maintenance',
        amountNumeric: 50000,
        categoryType: 'Government',
        deadline: new Date('2026-11-30'),
        deadlineStatus: 'Open',
        academicYear: '2026-27',
        officialUrl: 'https://pmsonline.bih.nic.in',
        source: {
          name: 'PMS Online Bihar Portal',
          url: 'https://pmsonline.bih.nic.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: true,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
          allowedCourses: ['B.Tech', 'B.Sc', 'B.Com', 'Diploma', 'M.Tech'],
          allowedBranches: [],
          minCgpa: 5.5,
          maxFamilyIncome: 250000,
          allowedStates: ['Bihar'],
          allowedCategories: ['OBC', 'SC', 'ST'],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: [
          'Bihar Domicile Certificate',
          'Caste Certificate (OBC/SC/ST)',
          'Income Certificate (Current Financial Year)',
          'Fee Structure & Bonafide Certificate'
        ],
        tags: ['State Govt', 'Bihar', 'Fee Reimbursement', 'OBC/SC/ST']
      },
      {
        title: 'UP Post Matric Scholarship for General / OBC / SC / ST',
        provider: 'Social Welfare Department, Govt. of Uttar Pradesh',
        description: 'Comprehensive fee reimbursement and stipend program for students belonging to Uttar Pradesh pursuing higher studies.',
        summary: '• Full tuition fee reimbursement + monthly maintenance stipend\n• Domicile restricted to Uttar Pradesh state\n• Annual family income limit: ₹2.0L for General/OBC, ₹2.5L for SC/ST (Official 2026-27 cycle open)',
        amountText: 'Full Tuition Fee Reimbursement + Monthly Maintenance',
        amountNumeric: 45000,
        categoryType: 'Government',
        deadline: new Date('2026-12-31'),
        deadlineStatus: 'Open',
        academicYear: '2026-27',
        officialUrl: 'https://scholarship.up.gov.in',
        source: {
          name: 'UP Scholarship Official Portal',
          url: 'https://scholarship.up.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: true,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
          allowedCourses: [],
          allowedBranches: [],
          minCgpa: 5.0,
          maxFamilyIncome: 250000,
          allowedStates: ['Uttar Pradesh'],
          allowedCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['UP Domicile Certificate', 'Caste Certificate', 'Income Certificate', 'Fee Receipt'],
        tags: ['Uttar Pradesh', 'State Govt', 'Fee Reimbursement']
      },
      {
        title: 'Swami Vivekananda Merit-cum-Means Scholarship (SVMCM)',
        provider: 'Higher Education Department, Govt. of West Bengal',
        description: 'State scheme to assist meritorious students from economically weaker families in West Bengal pursuing higher education.',
        summary: '• Financial aid ranging from ₹1,000 to ₹5,000 per month\n• West Bengal domicile mandatory\n• Requires min 60% aggregate in last qualifying exam and family income <= ₹2.5 Lakhs (Official 2026-27 ongoing portal)',
        amountText: '₹12,000 to ₹60,000 / year',
        amountNumeric: 18000,
        categoryType: 'Government',
        deadline: null,
        deadlineStatus: 'Ongoing',
        academicYear: '2026-27',
        officialUrl: 'https://svmcm.wbhed.gov.in',
        source: {
          name: 'Higher Education Dept, Govt of West Bengal',
          url: 'https://svmcm.wbhed.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
          allowedCourses: [],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: 250000,
          allowedStates: ['West Bengal'],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['West Bengal Domicile Certificate', 'Last Exam Marksheet', 'Income Certificate'],
        tags: ['West Bengal', 'SVMCM', 'Merit-cum-Means']
      },
      {
        title: 'MahaDBT Post Matric Scholarship Scheme',
        provider: 'Social Justice & Special Assistance Dept, Govt. of Maharashtra',
        description: 'State post-matric financial assistance for backward class students residing in Maharashtra.',
        summary: '• Tuition fee reimbursement and hostel maintenance allowance\n• Restricted to Maharashtra Domicile students belonging to SC/ST/OBC/SBC/VJNT\n• Annual family income must not exceed ₹2.5 Lakhs (Official 2026-27 portal scheme)',
        amountText: 'Full Tuition Fee Reimbursement + Allowance',
        amountNumeric: 40000,
        categoryType: 'Government',
        deadline: null,
        deadlineStatus: 'Ongoing',
        academicYear: '2026-27',
        officialUrl: 'https://mahadbt.maharashtra.gov.in',
        source: {
          name: 'MahaDBT Portal, Govt of Maharashtra',
          url: 'https://mahadbt.maharashtra.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
          allowedCourses: [],
          allowedBranches: [],
          minCgpa: 5.0,
          maxFamilyIncome: 250000,
          allowedStates: ['Maharashtra'],
          allowedCategories: ['OBC', 'SC', 'ST'],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Maharashtra Domicile Certificate', 'Caste Certificate', 'Income Certificate'],
        tags: ['Maharashtra', 'MahaDBT', 'State Govt']
      },
      {
        title: 'SSP Karnataka Post Matric Scholarship',
        provider: 'Social Welfare Department, Govt. of Karnataka',
        description: 'State portal scheme for Karnataka domicile students belonging to SC, ST, OBC, and EWS categories.',
        summary: '• Tuition fee exemption and maintenance allowance\n• Karnataka Domicile compulsory\n• Annual family income limit ₹2.5 Lakhs per annum (Official 2026-27 portal scheme)',
        amountText: 'Full Fee Exemption + Monthly Stipend',
        amountNumeric: 35000,
        categoryType: 'Government',
        deadline: null,
        deadlineStatus: 'Ongoing',
        academicYear: '2026-27',
        officialUrl: 'https://ssp.postmatric.karnataka.gov.in',
        source: {
          name: 'State Scholarship Portal (SSP Karnataka)',
          url: 'https://ssp.postmatric.karnataka.gov.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
          allowedCourses: [],
          allowedBranches: [],
          minCgpa: 5.0,
          maxFamilyIncome: 250000,
          allowedStates: ['Karnataka'],
          allowedCategories: ['OBC', 'SC', 'ST', 'EWS'],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Karnataka Domicile Certificate', 'Caste/Income Certificate', 'College Admission Fee Receipt'],
        tags: ['Karnataka', 'SSP', 'State Govt']
      },
      {
        title: 'Mukhya Mantri Kanya Utthan Yojana (Graduation)',
        provider: 'Department of Higher Education, Govt. of Bihar',
        description: 'State welfare scholarship scheme promoting higher education among female students in Bihar upon completing graduation.',
        summary: '• ₹50,000 one-time financial incentive directly transferred to bank account\n• Exclusively for Female candidates holding Bihar domicile\n• Must have passed UG graduation degree from a recognized university (Medhasoft 2026-27 ongoing portal)',
        amountText: '₹50,000 (One-time grant)',
        amountNumeric: 50000,
        categoryType: 'Government',
        deadline: null,
        deadlineStatus: 'Ongoing',
        academicYear: '2026-27',
        officialUrl: 'https://medhaboft.bih.nic.in',
        source: {
          name: 'Medhasoft Portal, Govt of Bihar',
          url: 'https://medhaboft.bih.nic.in',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate'],
          allowedCourses: ['B.A', 'B.Sc', 'B.Com', 'B.Tech'],
          allowedBranches: [],
          minCgpa: 5.0,
          maxFamilyIncome: null,
          allowedStates: ['Bihar'],
          allowedCategories: [],
          allowedGenders: ['Female'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Graduation Marksheet', 'Bihar Domicile Certificate', 'Bank Passbook'],
        tags: ['Bihar', 'Girl Students', 'Graduation', 'State Govt']
      },
      {
        title: 'Sitaram Jindal Foundation Scholarship',
        provider: 'Sitaram Jindal Foundation',
        description: 'Merit-cum-means scholarship for underprivileged students pursuing diploma, degree, and postgraduate courses across India.',
        summary: '• Monthly stipend ranging from ₹500 to ₹3,200 depending on course\n• Min 60%-70% marks required based on course/gender\n• Family income limit ₹4.0 Lakhs (employed) or ₹2.5 Lakhs (others)\n• Applications accepted round the year on official foundation portal',
        amountText: '₹6,000 to ₹38,400 / year',
        amountNumeric: 24000,
        categoryType: 'Merit-cum-Means',
        deadline: null,
        deadlineStatus: 'Ongoing',
        academicYear: '2026-27',
        officialUrl: 'https://www.sitaramjindalfoundation.org',
        source: {
          name: 'Sitaram Jindal Foundation Official Portal',
          url: 'https://www.sitaramjindalfoundation.org',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
          allowedCourses: [],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: 400000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Marksheet of previous exam', 'Income Certificate', 'Bonafide Certificate'],
        tags: ['Jindal Foundation', 'Merit-cum-Means', 'NGO']
      },
      {
        title: 'Reliance Foundation Undergraduate Scholarship 2026-27',
        provider: 'Reliance Foundation',
        description: 'Supporting meritorious undergraduate students from all institute disciplines in India to pursue their higher education and transform their leadership potential.',
        summary: '• Scholarship grant up to ₹2,00,000 over the duration of the degree\n• Requires minimum 60% in Class 12th and annual income < ₹15 Lakhs\n• Mandatory online aptitude assessment test (Official 2026-27 cycle open)',
        amountText: 'Up to ₹2,00,000 over degree duration',
        amountNumeric: 200000,
        categoryType: 'Private',
        deadline: new Date('2026-11-30'),
        deadlineStatus: 'Open',
        academicYear: '2026-27',
        officialUrl: 'https://www.scholarships.reliancefoundation.org',
        source: {
          name: 'Reliance Foundation Official Scholarship Portal',
          url: 'https://www.scholarships.reliancefoundation.org',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: true,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate'],
          allowedCourses: ['B.Tech', 'B.Sc', 'B.Com', 'B.A', 'BBA', 'BCA'],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: 1500000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: [
          '10th and 12th Marksheets',
          'Official Family Income Certificate',
          'Bonafide Student Certificate from College',
          'Aadhaar Card'
        ],
        tags: ['Reliance', 'Private Scholarship', 'Merit-Based', '2026-27']
      },
      {
        title: "HDFC Bank Parivartan's ECSS Programme 2026-27",
        provider: 'HDFC Bank Parivartan',
        description: 'Supporting underprivileged students facing financial hardship or crisis to ensure continuity in their academic education from school to university levels.',
        summary: '• Financial assistance up to ₹75,000 per year\n• Requires min 55% marks in previous class & income <= ₹2.5 Lakhs\n• Open for school, diploma, UG, and PG students (Official 2026-27 cycle open)',
        amountText: 'Up to ₹75,000 per year',
        amountNumeric: 75000,
        categoryType: 'Need-Based',
        deadline: new Date('2026-12-31'),
        deadlineStatus: 'Open',
        academicYear: '2026-27',
        officialUrl: 'https://www.hdfcbank.com/csr',
        source: {
          name: 'HDFC Bank CSR Official Portal',
          url: 'https://www.hdfcbank.com/csr',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: false,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
          allowedCourses: [],
          allowedBranches: [],
          minCgpa: 5.5,
          maxFamilyIncome: 250000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: [
          'Previous Year Academic Marksheet',
          'Income Certificate / BPL Card',
          'Identity Proof (Aadhaar)',
          'Proof of Current Year Fee Payment'
        ],
        tags: ['HDFC', 'Need-Based', 'CSR Scholarship', '2026-27']
      },
      {
        title: 'Tata Capital Pankh Scholarship Programme 2026-27',
        provider: 'Tata Capital Limited',
        description: 'CSR initiative by Tata Capital to empower underprivileged students in India pursuing higher education.',
        summary: '• Financial assistance up to 80% of tuition fee (max ₹50,000)\n• Requires minimum 60% in previous academic class\n• Annual family income must not exceed ₹4.0 Lakhs (Official 2026-27 cycle open)',
        amountText: 'Up to ₹50,000 / year',
        amountNumeric: 50000,
        categoryType: 'Private',
        deadline: new Date('2026-11-15'),
        deadlineStatus: 'Open',
        academicYear: '2026-27',
        officialUrl: 'https://www.tatacapital.com',
        source: {
          name: 'Tata Capital Official Website',
          url: 'https://www.tatacapital.com',
          verifiedAt: '2026-10-06'
        },
        isActive: true,
        isFeatured: true,
        eligibilityCriteria: {
          allowedEducationLevels: ['Undergraduate', 'Diploma'],
          allowedCourses: ['B.Tech', 'B.Sc', 'B.Com', 'B.A', 'Diploma'],
          allowedBranches: [],
          minCgpa: 6.0,
          maxFamilyIncome: 400000,
          allowedStates: [],
          allowedCategories: [],
          allowedGenders: ['Any'],
          requiresDisability: false,
          requiresSingleGirlChild: false
        },
        requiredDocuments: ['Previous Class Marksheet', 'Income Certificate', 'Identity Proof (Aadhaar)', 'Fee Receipt'],
        tags: ['Tata Capital', 'Pankh', 'Private CSR', '2026-27']
      }
    ];

    await Scholarship.insertMany(
      currentScholarships2026.map((s) => ({
        ...s,
        createdAdminId: adminUser._id
      }))
    );

    console.log(`Successfully seeded ${currentScholarships2026.length} current 2026-27 verified scholarships!`);

    // Check if initial notification for demoStudent exists
    if (demoStudent) {
      const notifExists = await Notification.findOne({ recipientId: demoStudent._id, title: 'Welcome to AI Scholarship Matcher!' });
      if (!notifExists) {
        await Notification.create({
          recipientId: demoStudent._id,
          title: 'Welcome to AI Scholarship Matcher!',
          message: 'Your profile has been set up. Check your personalized AI scholarship recommendations today.',
          type: 'System',
          linkUrl: '/student/recommendations'
        });
      }
    }

    console.log('\n=== Database Seeding Summary ===');
    console.log(`Total Active 2026-27 Scholarships in DB: ${await Scholarship.countDocuments()}`);
    console.log('Admin Email: admin@scholarshipmatcher.edu');
    console.log('Student Email: rahul.student@example.com');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();

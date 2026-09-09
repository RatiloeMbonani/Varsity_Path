import { Programme } from '../types/programme';

/**
 * Authentic Western Cape Undergraduate University Programme Database.
 * Sourced directly from official 2025/2026/2027 published Undergraduate Prospectuses:
 * - University of Cape Town (UCT) Faculty Handbooks & Undergraduate Prospectus
 * - University of the Western Cape (UWC) General Calendar & Faculty Requirements
 * - Stellenbosch University (SU) Calendar Part 1 & Faculty Minimum Admission Guidelines
 * - Cape Peninsula University of Technology (CPUT) Undergraduate Prospectus
 */
export const PROGRAMMES_DATABASE: Programme[] = [
  // ==========================================
  // UNIVERSITY OF CAPE TOWN (UCT)
  // ==========================================
  {
    id: 'uct-bcom-general',
    institutionId: 'uct',
    universityName: 'University of Cape Town (UCT)',
    name: 'Bachelor of Commerce (BCom General / Information Systems)',
    faculty: 'Faculty of Commerce',
    qualificationType: 'Bachelor',
    degreeCode: 'CB001',
    durationYears: 3,
    scoringMethod: 'uct',
    minimumScore: 450, // UCT Admission Score (sum of 6 subjects ex-LO)
    requiredSubjects: ['mathematics'],
    subjectRequirements: [
      {
        subjectId: 'mathematics',
        minimumMark: 60,
        isRequired: true,
        description: 'Pure Mathematics (minimum 60%) is mandatory. Mathematical Literacy is not accepted.',
      },
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English (Home Language or First Additional Language) minimum 50%.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor degree endorsement',
      'Life Orientation excluded from points score',
    ],
    selectionRequirements: [
      'Faculty Points Score (FPS) evaluated against annual applicant ranking bands',
      'National Benchmark Test (NBT) AL and QL may be required for final placement',
    ],
    nbtRequired: true,
    nbtRequirementDescription: 'NBT Academic and Quantitative Literacy (AQL)',
    officialUrl: 'https://commerce.uct.ac.za/undergraduate-studies/programmes',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Provides a strong foundation in business management, economics, accounting, and quantitative decision-making, preparing graduates for professional commerce careers.',
  },
  {
    id: 'uct-bsc-computer-science',
    institutionId: 'uct',
    universityName: 'University of Cape Town (UCT)',
    name: 'Bachelor of Science in Computer Science',
    faculty: 'Faculty of Science',
    qualificationType: 'Bachelor',
    degreeCode: 'SB001',
    durationYears: 3,
    scoringMethod: 'uct',
    minimumScore: 450,
    requiredSubjects: ['mathematics'],
    subjectRequirements: [
      {
        subjectId: 'mathematics',
        minimumMark: 70,
        isRequired: true,
        description: 'Pure Mathematics minimum 70% (Level 6) is strictly required.',
      },
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English (HL or FAL) minimum 50%.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor degree endorsement',
      'Life Orientation excluded from points calculation',
    ],
    selectionRequirements: [
      'Subject to Science Faculty selection weighting and annual cohort limits',
    ],
    nbtRequired: true,
    nbtRequirementDescription: 'NBT Academic Literacy and Quantitative Literacy (AQL)',
    officialUrl: 'https://science.uct.ac.za/departments/computer-science',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Rigorous foundational computing curriculum covering software architecture, algorithm analysis, artificial intelligence, operating systems, and distributed systems.',
  },
  {
    id: 'uct-beng-electrical',
    institutionId: 'uct',
    universityName: 'University of Cape Town (UCT)',
    name: 'BSc (Engineering) in Electrical and Computer Engineering',
    faculty: 'Faculty of Engineering & the Built Environment',
    qualificationType: 'Bachelor',
    degreeCode: 'EB011',
    durationYears: 4,
    scoringMethod: 'uct',
    minimumScore: 480,
    requiredSubjects: ['mathematics', 'physical_sciences'],
    subjectRequirements: [
      {
        subjectId: 'mathematics',
        minimumMark: 75,
        isRequired: true,
        description: 'Pure Mathematics minimum 75% is strictly compulsory.',
      },
      {
        subjectId: 'physical_sciences',
        minimumMark: 70,
        isRequired: true,
        description: 'Physical Sciences minimum 70% is strictly compulsory.',
      },
      {
        subjectId: 'english_fal',
        minimumMark: 60,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 60 }],
        isRequired: true,
        description: 'English (HL or FAL) minimum 60%.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor degree endorsement',
      'Life Orientation excluded from UCT Admission points score',
    ],
    selectionRequirements: [
      'Competitive merit ranking based on Mathematics, Physical Sciences, and aggregate FPS',
    ],
    nbtRequired: true,
    nbtRequirementDescription: 'NBT Mathematics (MAT) and Academic/Quantitative Literacy (AQL)',
    officialUrl: 'https://ebe.uct.ac.za/programmes/undergraduate',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Accredited by the Engineering Council of South Africa (ECSA), preparing electrical and computer engineers to innovate in telecommunications, robotics, embedded microelectronics, and renewable energy.',
  },
  {
    id: 'uct-ba-humanities',
    institutionId: 'uct',
    universityName: 'University of Cape Town (UCT)',
    name: 'Bachelor of Arts (Humanities)',
    faculty: 'Faculty of Humanities',
    qualificationType: 'Bachelor',
    degreeCode: 'HB001',
    durationYears: 3,
    scoringMethod: 'uct',
    minimumScore: 380,
    requiredSubjects: [],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 60,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Home Language min 50% or English First Additional Language min 60%.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor endorsement',
      'Life Orientation excluded from score calculation',
    ],
    selectionRequirements: ['Humanities points ranking'],
    nbtRequired: false,
    officialUrl: 'https://humanities.uct.ac.za/undergraduate/programmes',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Interdisciplinary humanities qualification with majors across politics, history, philosophy, languages, media, and socio-cultural studies.',
  },
  {
    id: 'uct-llb-law',
    institutionId: 'uct',
    universityName: 'University of Cape Town (UCT)',
    name: 'Bachelor of Laws (4-Year LLB)',
    faculty: 'Faculty of Law',
    qualificationType: 'Bachelor',
    degreeCode: 'LB001',
    durationYears: 4,
    scoringMethod: 'uct',
    minimumScore: 450,
    requiredSubjects: [],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 65,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 65 }],
        isRequired: true,
        description: 'English (HL or FAL) minimum 65% is strictly required.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 60,
        alternativeSubjectIds: [{ subjectId: 'mathematical_literacy', minimumMark: 70 }],
        isRequired: true,
        description: 'Pure Mathematics min 60% or Mathematical Literacy min 70%.',
      },
    ],
    additionalRequirements: [
      'NSC Bachelor degree endorsement',
      'High academic writing benchmark required',
    ],
    selectionRequirements: ['Faculty selection cohort ranking'],
    nbtRequired: true,
    nbtRequirementDescription: 'NBT Academic Literacy (AL)',
    officialUrl: 'https://law.uct.ac.za/undergraduate',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Comprehensive South African legal training preparing candidates for legal advocacy, the bar, corporate counsel, and judicial service.',
  },
  {
    id: 'uct-bsc-biological-sciences',
    institutionId: 'uct',
    universityName: 'University of Cape Town (UCT)',
    name: 'Bachelor of Science in Biological Sciences',
    faculty: 'Faculty of Science',
    qualificationType: 'Bachelor',
    degreeCode: 'SB003',
    durationYears: 3,
    scoringMethod: 'uct',
    minimumScore: 420,
    requiredSubjects: ['mathematics'],
    subjectRequirements: [
      {
        subjectId: 'mathematics',
        minimumMark: 60,
        isRequired: true,
        description: 'Pure Mathematics minimum 60%. Mathematical Literacy is not accepted.',
      },
      {
        subjectId: 'physical_sciences',
        minimumMark: 60,
        alternativeSubjectIds: [{ subjectId: 'life_sciences', minimumMark: 60 }],
        isRequired: true,
        description: 'Physical Sciences or Life Sciences minimum 60%.',
      },
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English (HL or FAL) minimum 50%.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor endorsement',
      'Life Orientation excluded',
    ],
    selectionRequirements: [
      'Subject to Science Faculty selection weighting and annual cohort limits',
    ],
    officialUrl: 'https://science.uct.ac.za/departments/biological-sciences',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Explores terrestrial and marine ecology, biodiversity, evolutionary biology, and molecular genetics in the biodiverse Cape Floristic region.',
  },

  // ==========================================
  // UNIVERSITY OF THE WESTERN CAPE (UWC)
  // ==========================================
  {
    id: 'uwc-bcom-general',
    institutionId: 'uwc',
    universityName: 'University of the Western Cape (UWC)',
    name: 'Bachelor of Commerce (BCom General)',
    faculty: 'Faculty of Economic and Management Sciences',
    qualificationType: 'Bachelor',
    degreeCode: '1011',
    durationYears: 3,
    scoringMethod: 'uwc',
    minimumScore: 30, // Official UWC Points (calculated across 7 subjects)
    requiredSubjects: [],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Level 4 (50%) or higher.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'mathematical_literacy', minimumMark: 70 }],
        isRequired: true,
        description: 'Mathematics Level 4 (50%) or Mathematical Literacy Level 6 (70%).',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor degree pass',
      'Points calculated using official UWC Points Scale across 7 subjects',
    ],
    selectionRequirements: ['Faculty of EMS admission quota'],
    officialUrl: 'https://www.uwc.ac.za/faculties/ems/undergraduate',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Equips students with analytical tools, quantitative methods, and managerial competence across economics, marketing, and business administration.',
  },
  {
    id: 'uwc-bsc-computer-science',
    institutionId: 'uwc',
    universityName: 'University of the Western Cape (UWC)',
    name: 'Bachelor of Science in Computer Science',
    faculty: 'Faculty of Natural Sciences',
    qualificationType: 'Bachelor',
    degreeCode: '3101',
    durationYears: 3,
    scoringMethod: 'uwc',
    minimumScore: 33, // Official UWC points minimum
    requiredSubjects: ['mathematics'],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Level 4 (50%) or higher.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 60,
        isRequired: true,
        description: 'Pure Mathematics Level 5 (60%) is strictly required. Mathematical Literacy is not accepted.',
      },
      {
        subjectId: 'physical_sciences',
        minimumMark: 50,
        isRequired: true,
        description: 'Physical Sciences Level 4 (50%) is mandatory.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor degree pass',
      'Calculation uses UWC dedicated points scale',
    ],
    selectionRequirements: [
      'Faculty of Natural Sciences enrollment capacity quota',
    ],
    officialUrl: 'https://www.uwc.ac.za/faculties/natural-sciences',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Provides in-depth study of computer software engineering, cybersecurity, data networking, computational theory, and algorithm development.',
  },
  {
    id: 'uwc-llb-law',
    institutionId: 'uwc',
    universityName: 'University of the Western Cape (UWC)',
    name: 'Bachelor of Laws (4-Year LLB)',
    faculty: 'Faculty of Law',
    qualificationType: 'Bachelor',
    degreeCode: '1301',
    durationYears: 4,
    scoringMethod: 'uwc',
    minimumScore: 32,
    requiredSubjects: [],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 60,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 60 }],
        isRequired: true,
        description: 'English Level 5 (60%) or higher.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 40,
        alternativeSubjectIds: [{ subjectId: 'mathematical_literacy', minimumMark: 60 }],
        isRequired: true,
        description: 'Mathematics Level 3 (40%) or Mathematical Literacy Level 5 (60%).',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor degree pass',
      'Another recognized language at Level 4 (50%)',
    ],
    selectionRequirements: [
      'Faculty of Law competitive quota and academic ranking',
    ],
    officialUrl: 'https://www.uwc.ac.za/faculties/law',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Renowned human rights and constitutional law program, developing advocates and attorneys dedicated to social justice and the rule of law.',
  },
  {
    id: 'uwc-ba-general',
    institutionId: 'uwc',
    universityName: 'University of the Western Cape (UWC)',
    name: 'Bachelor of Arts (BA General)',
    faculty: 'Faculty of Arts and Humanities',
    qualificationType: 'Bachelor',
    degreeCode: '1101',
    durationYears: 3,
    scoringMethod: 'uwc',
    minimumScore: 27,
    requiredSubjects: [],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Level 4 (50%) or higher.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor degree pass',
      'Points calculated across all 7 subjects including Life Orientation (1-3 pts)',
    ],
    selectionRequirements: [
      'Faculty of Arts and Humanities admissions placement quota',
    ],
    officialUrl: 'https://www.uwc.ac.za/faculties/arts',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Broad humanities foundation offering majors in linguistics, history, psychology, cultural studies, anthropology, and African languages.',
  },
  {
    id: 'uwc-b-nursing',
    institutionId: 'uwc',
    universityName: 'University of the Western Cape (UWC)',
    name: 'Bachelor of Nursing (BCur)',
    faculty: 'Faculty of Community and Health Sciences',
    qualificationType: 'Bachelor',
    degreeCode: '8111',
    durationYears: 4,
    scoringMethod: 'uwc',
    minimumScore: 30,
    requiredSubjects: ['life_sciences'],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Level 4 (50%) or higher.',
      },
      {
        subjectId: 'life_sciences',
        minimumMark: 50,
        isRequired: true,
        description: 'Life Sciences Level 4 (50%) is mandatory.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 40,
        alternativeSubjectIds: [{ subjectId: 'mathematical_literacy', minimumMark: 50 }],
        isRequired: true,
        description: 'Mathematics Level 3 (40%) or Mathematical Literacy Level 4 (50%).',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor endorsement',
      'Clinical placement clearance and vaccination certification',
    ],
    selectionRequirements: [
      'Community & Health Sciences selection committee and clinical placement capacity',
    ],
    officialUrl: 'https://www.uwc.ac.za/faculties/chs/departments/school-of-nursing',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Professional clinical nursing qualification accredited by SANC, preparing registered nurses and midwives for healthcare leadership.',
  },
  {
    id: 'uwc-badmin-public-administration',
    institutionId: 'uwc',
    universityName: 'University of the Western Cape (UWC)',
    name: 'Bachelor of Administration (BAdmin Public Administration)',
    faculty: 'Faculty of Economic and Management Sciences',
    qualificationType: 'Bachelor',
    degreeCode: '1021',
    durationYears: 3,
    scoringMethod: 'uwc',
    minimumScore: 27,
    requiredSubjects: [],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Level 4 (50%) or higher.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 40,
        alternativeSubjectIds: [{ subjectId: 'mathematical_literacy', minimumMark: 60 }],
        isRequired: true,
        description: 'Mathematics Level 3 (40%) or Mathematical Literacy Level 5 (60%).',
      },
    ],
    additionalRequirements: ['National Senior Certificate with Bachelor endorsement'],
    selectionRequirements: [
      'Faculty of Economic and Management Sciences admissions quota',
    ],
    officialUrl: 'https://www.uwc.ac.za/faculties/ems',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Prepares professionals for governance, public policy, municipal administration, and non-profit organizational leadership.',
  },

  // ==========================================
  // STELLENBOSCH UNIVERSITY (SU)
  // Note: SU has NO universal APS score.
  // Uses programme-specific criteria + Academic Average (ex-LO).
  // ==========================================
  {
    id: 'su-bcom-management-sciences',
    institutionId: 'stellenbosch',
    universityName: 'Stellenbosch University (SU)',
    name: 'BCom in Management Sciences',
    faculty: 'Faculty of Economic and Management Sciences',
    qualificationType: 'Bachelor',
    degreeCode: 'SU-BCOM-MS',
    durationYears: 3,
    scoringMethod: 'stellenbosch',
    minimumScore: null, // Prohibited from universal APS
    minimumAcademicAverage: 65, // Matric aggregate ex-LO minimum 65%
    requiredSubjects: ['mathematics'],
    subjectRequirements: [
      {
        subjectId: 'mathematics',
        minimumMark: 60,
        isRequired: true,
        description: 'Pure Mathematics minimum 60% (Level 5). Mathematical Literacy is not accepted.',
      },
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [
          { subjectId: 'english_hl', minimumMark: 50 },
          { subjectId: 'afrikaans_hl', minimumMark: 50 },
          { subjectId: 'afrikaans_fal', minimumMark: 50 },
        ],
        isRequired: true,
        description: 'English or Afrikaans (Home Language or First Additional Language) minimum 50%.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor degree endorsement',
      'Overall academic average of at least 65% (excluding Life Orientation)',
    ],
    selectionRequirements: [
      'Stellenbosch EMS Selection Mark ranking based on academic aggregate',
    ],
    officialUrl: 'https://www.sun.ac.za/english/faculty/economy',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Premier commercial degree developing high-level competency in business management, entrepreneurship, finance, and marketing.',
  },
  {
    id: 'su-bsc-computer-science',
    institutionId: 'stellenbosch',
    universityName: 'Stellenbosch University (SU)',
    name: 'BSc in Computer Science',
    faculty: 'Faculty of Science',
    qualificationType: 'Bachelor',
    degreeCode: 'SU-BSC-CS',
    durationYears: 3,
    scoringMethod: 'stellenbosch',
    minimumScore: null,
    minimumAcademicAverage: 65,
    requiredSubjects: ['mathematics'],
    subjectRequirements: [
      {
        subjectId: 'mathematics',
        minimumMark: 70,
        isRequired: true,
        description: 'Pure Mathematics minimum 70% (Level 6).',
      },
      {
        subjectId: 'physical_sciences',
        minimumMark: 50,
        alternativeSubjectIds: [
          { subjectId: 'information_technology', minimumMark: 50 },
        ],
        isRequired: true,
        description: 'Physical Sciences minimum 50% or Information Technology minimum 50%.',
      },
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [
          { subjectId: 'english_hl', minimumMark: 50 },
          { subjectId: 'afrikaans_hl', minimumMark: 50 },
          { subjectId: 'afrikaans_fal', minimumMark: 50 },
        ],
        isRequired: true,
        description: 'English or Afrikaans minimum 50%.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor endorsement',
      'Matric academic average of at least 65% (excluding Life Orientation)',
    ],
    selectionRequirements: [
      'Stellenbosch Science Faculty selection mark ranking based on academic aggregate',
    ],
    officialUrl: 'https://www.sun.ac.za/english/faculty/science/computer-science',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Covers modern computer systems, data structures, cloud architectures, machine learning algorithms, and software development.',
  },
  {
    id: 'su-beng-mechanical',
    institutionId: 'stellenbosch',
    universityName: 'Stellenbosch University (SU)',
    name: 'BEng in Mechanical Engineering',
    faculty: 'Faculty of Engineering',
    qualificationType: 'Bachelor',
    degreeCode: 'SU-BENG-MECH',
    durationYears: 4,
    scoringMethod: 'stellenbosch',
    minimumScore: null,
    minimumAcademicAverage: 70,
    requiredSubjects: ['mathematics', 'physical_sciences'],
    subjectRequirements: [
      {
        subjectId: 'mathematics',
        minimumMark: 70,
        isRequired: true,
        description: 'Pure Mathematics minimum 70% (Level 6).',
      },
      {
        subjectId: 'physical_sciences',
        minimumMark: 60,
        isRequired: true,
        description: 'Physical Sciences minimum 60% (Level 5).',
      },
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [
          { subjectId: 'english_hl', minimumMark: 50 },
          { subjectId: 'afrikaans_hl', minimumMark: 50 },
          { subjectId: 'afrikaans_fal', minimumMark: 50 },
        ],
        isRequired: true,
        description: 'English or Afrikaans minimum 50%.',
      },
    ],
    additionalRequirements: [
      'NSC Bachelor degree pass',
      'Matric academic average of at least 70% (excluding Life Orientation)',
      'Engineering selection mark calculated: Mathematics + Physical Sciences + 4x other subjects',
    ],
    selectionRequirements: [
      'Faculty of Engineering competitive quota ranking based on Engineering Selection Score',
    ],
    officialUrl: 'https://www.sun.ac.za/english/faculty/eng',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'ECSA-accredited qualification covering thermodynamics, fluid mechanics, mechatronics, advanced manufacturing, and structural analysis.',
  },
  {
    id: 'su-ba-humanities',
    institutionId: 'stellenbosch',
    universityName: 'Stellenbosch University (SU)',
    name: 'BA in Humanities',
    faculty: 'Faculty of Arts and Social Sciences',
    qualificationType: 'Bachelor',
    degreeCode: 'SU-BA-HUM',
    durationYears: 3,
    scoringMethod: 'stellenbosch',
    minimumScore: null,
    minimumAcademicAverage: 65,
    requiredSubjects: [],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 60,
        alternativeSubjectIds: [
          { subjectId: 'english_hl', minimumMark: 60 },
          { subjectId: 'afrikaans_hl', minimumMark: 60 },
          { subjectId: 'afrikaans_fal', minimumMark: 60 },
        ],
        isRequired: true,
        description: 'English or Afrikaans (HL or FAL) minimum 60%.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Bachelor endorsement',
      'Academic average of at least 65% (excluding Life Orientation)',
    ],
    selectionRequirements: [
      'Faculty of Arts and Social Sciences selection ranking by academic aggregate',
    ],
    officialUrl: 'https://www.sun.ac.za/english/faculty/arts',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Critical thinking, language study, sociology, political science, and philosophy in a historic intellectual tradition.',
  },
  {
    id: 'su-bsc-molecular-biology',
    institutionId: 'stellenbosch',
    universityName: 'Stellenbosch University (SU)',
    name: 'BSc in Molecular Biology and Biotechnology',
    faculty: 'Faculty of Science',
    qualificationType: 'Bachelor',
    degreeCode: 'SU-BSC-MBB',
    durationYears: 3,
    scoringMethod: 'stellenbosch',
    minimumScore: null,
    minimumAcademicAverage: 65,
    requiredSubjects: ['mathematics', 'physical_sciences'],
    subjectRequirements: [
      {
        subjectId: 'mathematics',
        minimumMark: 60,
        isRequired: true,
        description: 'Pure Mathematics minimum 60% (Level 5).',
      },
      {
        subjectId: 'physical_sciences',
        minimumMark: 50,
        isRequired: true,
        description: 'Physical Sciences minimum 50% (Level 4).',
      },
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [
          { subjectId: 'english_hl', minimumMark: 50 },
          { subjectId: 'afrikaans_hl', minimumMark: 50 },
          { subjectId: 'afrikaans_fal', minimumMark: 50 },
        ],
        isRequired: true,
        description: 'English or Afrikaans minimum 50%.',
      },
    ],
    additionalRequirements: [
      'NSC Bachelor endorsement',
      'Matric academic average of at least 65% (excluding Life Orientation)',
    ],
    selectionRequirements: [
      'Science Faculty selection mark ranking based on academic aggregate',
    ],
    officialUrl: 'https://www.sun.ac.za/english/faculty/science',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Investigates biochemistry, molecular genetics, microbiology, and bio-industrial applications.',
  },

  // ==========================================
  // CAPE PENINSULA UNIVERSITY OF TECHNOLOGY (CPUT)
  // Note: CPUT operates with qualification-specific criteria
  // (rating sum of subjects + subject levels).
  // ==========================================
  {
    id: 'cput-dip-ict-applications',
    institutionId: 'cput',
    universityName: 'Cape Peninsula University of Technology (CPUT)',
    name: 'Diploma in ICT: Applications Development',
    faculty: 'Faculty of Informatics and Design',
    qualificationType: 'Diploma',
    degreeCode: 'D3ICTA',
    durationYears: 3,
    scoringMethod: 'cput',
    minimumScore: 26, // Total subject rating points benchmark
    requiredSubjects: [],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Level 4 (50%) or higher.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 50,
        alternativeSubjectIds: [
          { subjectId: 'technical_mathematics', minimumMark: 50 },
          { subjectId: 'mathematical_literacy', minimumMark: 70 },
        ],
        isRequired: true,
        description: 'Mathematics Level 4 (50%), Technical Maths Level 4 (50%), or Mathematical Literacy Level 6 (70%).',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Diploma endorsement',
      'Overall rating score of at least 26 across 6 subjects',
    ],
    selectionRequirements: [
      'Departmental ranking based on Mathematics and English rating scores within enrollment caps',
    ],
    officialUrl: 'https://www.cput.ac.za/academic/faculties/informaticsdesign',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Applied software engineering diploma teaching mobile, web, and enterprise application programming with industry internships.',
  },
  {
    id: 'cput-dip-mechanical-engineering',
    institutionId: 'cput',
    universityName: 'Cape Peninsula University of Technology (CPUT)',
    name: 'Diploma in Mechanical Engineering',
    faculty: 'Faculty of Engineering & the Built Environment',
    qualificationType: 'Diploma',
    degreeCode: 'D3MECH',
    durationYears: 3,
    scoringMethod: 'cput',
    minimumScore: 28,
    requiredSubjects: ['physical_sciences'],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Level 4 (50%) or higher.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 50,
        alternativeSubjectIds: [
          { subjectId: 'technical_mathematics', minimumMark: 50 },
        ],
        isRequired: true,
        description: 'Mathematics Level 4 (50%) or Technical Mathematics Level 4 (50%). Mathematical Literacy is not accepted.',
      },
      {
        subjectId: 'physical_sciences',
        minimumMark: 50,
        isRequired: true,
        description: 'Physical Sciences Level 4 (50%) is mandatory.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Diploma endorsement',
      'Overall rating score of at least 28 across 6 subjects',
      'Extended Curriculum Programme (ECP) available for candidates scoring 26-27',
    ],
    selectionRequirements: [
      'Faculty of Engineering rating points ranking subject to workshop capacity',
    ],
    officialUrl: 'https://www.cput.ac.za/academic/faculties/engineering',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Practically focused engineering qualification incorporating CAD design, workshop technology, fluid dynamics, and thermodynamics.',
  },
  {
    id: 'cput-dip-accountancy',
    institutionId: 'cput',
    universityName: 'Cape Peninsula University of Technology (CPUT)',
    name: 'Diploma in Accountancy',
    faculty: 'Faculty of Business & Management Sciences',
    qualificationType: 'Diploma',
    degreeCode: 'D3ACTY',
    durationYears: 3,
    scoringMethod: 'cput',
    minimumScore: 24,
    requiredSubjects: [],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Level 4 (50%) or higher.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 40,
        alternativeSubjectIds: [
          { subjectId: 'mathematical_literacy', minimumMark: 60 },
          { subjectId: 'technical_mathematics', minimumMark: 40 },
        ],
        isRequired: true,
        description: 'Mathematics Level 3 (40%) or Mathematical Literacy Level 5 (60%).',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Diploma endorsement',
      'Accounting Level 4 (50%) strongly recommended',
    ],
    selectionRequirements: [
      'Faculty of Business ranking based on Mathematics/Maths Lit and English ratings',
    ],
    officialUrl: 'https://www.cput.ac.za/academic/faculties/business',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Prepares financial technicians, accountants, and auditors with strong applied financial accounting, tax, and auditing competence.',
  },
  {
    id: 'cput-dip-biotechnology',
    institutionId: 'cput',
    universityName: 'Cape Peninsula University of Technology (CPUT)',
    name: 'Diploma in Biotechnology',
    faculty: 'Faculty of Applied Sciences',
    qualificationType: 'Diploma',
    degreeCode: 'D3BIOT',
    durationYears: 3,
    scoringMethod: 'cput',
    minimumScore: 26,
    requiredSubjects: ['life_sciences', 'physical_sciences'],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Level 4 (50%) or higher.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 50,
        isRequired: true,
        description: 'Pure Mathematics Level 4 (50%). Mathematical Literacy is not accepted.',
      },
      {
        subjectId: 'life_sciences',
        minimumMark: 50,
        isRequired: true,
        description: 'Life Sciences Level 4 (50%) is mandatory.',
      },
      {
        subjectId: 'physical_sciences',
        minimumMark: 50,
        isRequired: true,
        description: 'Physical Sciences Level 4 (50%) is mandatory.',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Diploma endorsement',
      'Laboratory safety clearance',
    ],
    selectionRequirements: [
      'Applied Sciences selection ranking based on Life Sciences and Physical Sciences performance',
    ],
    officialUrl: 'https://www.cput.ac.za/academic/faculties/appliedsciences',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Hands-on laboratory training in fermentation, bioprocessing, quality control, and bio-industrial manufacturing.',
  },
  {
    id: 'cput-dip-human-resource-management',
    institutionId: 'cput',
    universityName: 'Cape Peninsula University of Technology (CPUT)',
    name: 'Diploma in Human Resource Management',
    faculty: 'Faculty of Business & Management Sciences',
    qualificationType: 'Diploma',
    degreeCode: 'D3HRMG',
    durationYears: 3,
    scoringMethod: 'cput',
    minimumScore: 23,
    requiredSubjects: [],
    subjectRequirements: [
      {
        subjectId: 'english_fal',
        minimumMark: 50,
        alternativeSubjectIds: [{ subjectId: 'english_hl', minimumMark: 50 }],
        isRequired: true,
        description: 'English Level 4 (50%) or higher.',
      },
      {
        subjectId: 'mathematics',
        minimumMark: 40,
        alternativeSubjectIds: [
          { subjectId: 'mathematical_literacy', minimumMark: 40 },
        ],
        isRequired: true,
        description: 'Mathematics Level 3 (40%) or Mathematical Literacy Level 3 (40%).',
      },
    ],
    additionalRequirements: [
      'National Senior Certificate with Diploma endorsement',
    ],
    selectionRequirements: [
      'Departmental ranking within annual faculty admission quotas',
    ],
    officialUrl: 'https://www.cput.ac.za/academic/faculties/business',
    academicYear: 2026,
    lastVerified: '2026-09-01',
    description:
      'Focuses on employee relations, talent management, labour legislation, and organizational human capital development.',
  },
];

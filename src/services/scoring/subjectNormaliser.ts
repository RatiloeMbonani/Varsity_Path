import {
  CanonicalSubjectId,
  CanonicalSubjectInfo,
  StudentBaselineMetrics,
} from '../../types/scoring';

/**
 * Registry of canonical subjects with metadata
 */
const CANONICAL_SUBJECT_MAP: Record<CanonicalSubjectId, CanonicalSubjectInfo> = {
  english_hl: {
    id: 'english_hl',
    standardName: 'English Home Language',
    category: 'language',
    isLanguage: true,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
    languageType: 'home_language',
  },
  english_fal: {
    id: 'english_fal',
    standardName: 'English First Additional Language',
    category: 'language',
    isLanguage: true,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
    languageType: 'first_additional',
  },
  afrikaans_hl: {
    id: 'afrikaans_hl',
    standardName: 'Afrikaans Home Language',
    category: 'language',
    isLanguage: true,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
    languageType: 'home_language',
  },
  afrikaans_fal: {
    id: 'afrikaans_fal',
    standardName: 'Afrikaans First Additional Language',
    category: 'language',
    isLanguage: true,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
    languageType: 'first_additional',
  },
  isixhosa_hl: {
    id: 'isixhosa_hl',
    standardName: 'isiXhosa Home Language',
    category: 'language',
    isLanguage: true,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
    languageType: 'home_language',
  },
  isixhosa_fal: {
    id: 'isixhosa_fal',
    standardName: 'isiXhosa First Additional Language',
    category: 'language',
    isLanguage: true,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
    languageType: 'first_additional',
  },
  mathematics: {
    id: 'mathematics',
    standardName: 'Mathematics',
    category: 'mathematics',
    isLanguage: false,
    isMathematics: true,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  mathematical_literacy: {
    id: 'mathematical_literacy',
    standardName: 'Mathematical Literacy',
    category: 'mathematics',
    isLanguage: false,
    isMathematics: false, // NOT pure mathematics
    isMathematicalLiteracy: true,
    isLifeOrientation: false,
  },
  technical_mathematics: {
    id: 'technical_mathematics',
    standardName: 'Technical Mathematics',
    category: 'mathematics',
    isLanguage: false,
    isMathematics: true,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  physical_sciences: {
    id: 'physical_sciences',
    standardName: 'Physical Sciences',
    category: 'science',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  life_sciences: {
    id: 'life_sciences',
    standardName: 'Life Sciences',
    category: 'science',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  life_orientation: {
    id: 'life_orientation',
    standardName: 'Life Orientation',
    category: 'life_orientation',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: true,
  },
  accounting: {
    id: 'accounting',
    standardName: 'Accounting',
    category: 'commerce',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  business_studies: {
    id: 'business_studies',
    standardName: 'Business Studies',
    category: 'commerce',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  economics: {
    id: 'economics',
    standardName: 'Economics',
    category: 'commerce',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  history: {
    id: 'history',
    standardName: 'History',
    category: 'humanities',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  geography: {
    id: 'geography',
    standardName: 'Geography',
    category: 'humanities',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  information_technology: {
    id: 'information_technology',
    standardName: 'Information Technology (IT)',
    category: 'technology',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  computer_applications_technology: {
    id: 'computer_applications_technology',
    standardName: 'Computer Applications Technology (CAT)',
    category: 'technology',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  engineering_graphics_design: {
    id: 'engineering_graphics_design',
    standardName: 'Engineering Graphics & Design (EGD)',
    category: 'technology',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  visual_arts: {
    id: 'visual_arts',
    standardName: 'Visual Arts',
    category: 'arts',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  dramatic_arts: {
    id: 'dramatic_arts',
    standardName: 'Dramatic Arts',
    category: 'arts',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  music: {
    id: 'music',
    standardName: 'Music',
    category: 'arts',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  consumer_studies: {
    id: 'consumer_studies',
    standardName: 'Consumer Studies',
    category: 'services',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  hospitality_studies: {
    id: 'hospitality_studies',
    standardName: 'Hospitality Studies',
    category: 'services',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  tourism: {
    id: 'tourism',
    standardName: 'Tourism',
    category: 'services',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  religious_studies: {
    id: 'religious_studies',
    standardName: 'Religion Studies',
    category: 'humanities',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
  other: {
    id: 'other',
    standardName: 'Other Subject',
    category: 'other',
    isLanguage: false,
    isMathematics: false,
    isMathematicalLiteracy: false,
    isLifeOrientation: false,
  },
};

/**
 * Normalise any student-entered subject name to a canonical subject identity.
 * Preserves the original entered string for UI display.
 */
export function normaliseSubject(rawName: string): CanonicalSubjectInfo {
  if (!rawName || typeof rawName !== 'string') {
    return CANONICAL_SUBJECT_MAP.other;
  }

  const clean = rawName
    .toLowerCase()
    .trim()
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ');

  // 1. Life Orientation
  if (
    clean === 'lo' ||
    clean === 'life orientation' ||
    clean.includes('life orientation')
  ) {
    return CANONICAL_SUBJECT_MAP.life_orientation;
  }

  // 2. Mathematical Literacy (CHECK BEFORE MATHEMATICS to prevent accidental overlap)
  if (
    clean.includes('lit') ||
    clean === 'maths lit' ||
    clean === 'math lit' ||
    clean === 'mathematical literacy' ||
    clean.includes('mathematical literacy')
  ) {
    return CANONICAL_SUBJECT_MAP.mathematical_literacy;
  }

  // 3. Technical Mathematics
  if (clean.includes('technical math') || clean.includes('tech math')) {
    return CANONICAL_SUBJECT_MAP.technical_mathematics;
  }

  // 4. Pure Mathematics
  if (
    clean === 'maths' ||
    clean === 'mathematics' ||
    clean === 'pure maths' ||
    clean === 'pure mathematics' ||
    clean.startsWith('mathematics') ||
    clean.startsWith('maths')
  ) {
    return CANONICAL_SUBJECT_MAP.mathematics;
  }

  // 5. English variations
  if (
    clean.includes('english') ||
    clean === 'eng hl' ||
    clean === 'eng fal' ||
    clean.startsWith('eng ')
  ) {
    if (clean.includes('home') || clean.includes('hl')) {
      return CANONICAL_SUBJECT_MAP.english_hl;
    }
    if (
      clean.includes('first additional') ||
      clean.includes('fal') ||
      clean.includes('first add')
    ) {
      return CANONICAL_SUBJECT_MAP.english_fal;
    }
    // Default general English to English First Additional or Home Language category
    return CANONICAL_SUBJECT_MAP.english_fal;
  }

  // 6. Afrikaans variations
  if (clean.includes('afrikaans')) {
    if (clean.includes('home') || clean.includes(' hl')) {
      return CANONICAL_SUBJECT_MAP.afrikaans_hl;
    }
    return CANONICAL_SUBJECT_MAP.afrikaans_fal;
  }

  // 7. isiXhosa variations
  if (clean.includes('xhosa') || clean.includes('isixhosa')) {
    if (clean.includes('home') || clean.includes(' hl')) {
      return CANONICAL_SUBJECT_MAP.isixhosa_hl;
    }
    return CANONICAL_SUBJECT_MAP.isixhosa_fal;
  }

  // 8. Physical Sciences
  if (
    clean.includes('physical science') ||
    clean.includes('phys sci') ||
    clean.includes('physics') ||
    clean.includes('chemistry')
  ) {
    return CANONICAL_SUBJECT_MAP.physical_sciences;
  }

  // 9. Life Sciences
  if (clean.includes('life science') || clean.includes('biology')) {
    return CANONICAL_SUBJECT_MAP.life_sciences;
  }

  // 10. Accounting
  if (clean.includes('accounting') || clean === 'acc') {
    return CANONICAL_SUBJECT_MAP.accounting;
  }

  // 11. Business Studies
  if (clean.includes('business')) {
    return CANONICAL_SUBJECT_MAP.business_studies;
  }

  // 12. Economics
  if (clean.includes('economic')) {
    return CANONICAL_SUBJECT_MAP.economics;
  }

  // 13. History
  if (clean.includes('history')) {
    return CANONICAL_SUBJECT_MAP.history;
  }

  // 14. Geography
  if (clean.includes('geography') || clean === 'geog') {
    return CANONICAL_SUBJECT_MAP.geography;
  }

  // 15. IT & Computer Applications Technology
  if (
    clean === 'it' ||
    clean === 'information technology' ||
    clean.includes('information technology')
  ) {
    return CANONICAL_SUBJECT_MAP.information_technology;
  }
  if (
    clean === 'cat' ||
    clean === 'computer applications technology' ||
    clean.includes('computer applications')
  ) {
    return CANONICAL_SUBJECT_MAP.computer_applications_technology;
  }

  // 16. EGD
  if (
    clean === 'egd' ||
    clean.includes('engineering graphics') ||
    clean.includes('technical drawing')
  ) {
    return CANONICAL_SUBJECT_MAP.engineering_graphics_design;
  }

  // 17. Arts
  if (clean.includes('visual art') || clean === 'art') {
    return CANONICAL_SUBJECT_MAP.visual_arts;
  }
  if (clean.includes('dramat') || clean.includes('drama')) {
    return CANONICAL_SUBJECT_MAP.dramatic_arts;
  }
  if (clean.includes('music')) {
    return CANONICAL_SUBJECT_MAP.music;
  }

  // 18. Services & Tourism
  if (clean.includes('consumer')) {
    return CANONICAL_SUBJECT_MAP.consumer_studies;
  }
  if (clean.includes('hospitality')) {
    return CANONICAL_SUBJECT_MAP.hospitality_studies;
  }
  if (clean.includes('tourism')) {
    return CANONICAL_SUBJECT_MAP.tourism;
  }
  if (clean.includes('religion') || clean.includes('religious')) {
    return CANONICAL_SUBJECT_MAP.religious_studies;
  }

  return {
    ...CANONICAL_SUBJECT_MAP.other,
    standardName: rawName.trim(),
  };
}

/**
 * Standard South African National Senior Certificate (NSC) Rating Scale (Levels 1 to 7)
 */
export function getNscRatingLevel(mark: number): number {
  if (mark >= 80) return 7;
  if (mark >= 70) return 6;
  if (mark >= 60) return 5;
  if (mark >= 50) return 4;
  if (mark >= 40) return 3;
  if (mark >= 30) return 2;
  return 1;
}

/**
 * Check if a canonical ID represents an English language subject (HL or FAL)
 */
export function isEnglish(id: CanonicalSubjectId): boolean {
  return id === 'english_hl' || id === 'english_fal';
}

/**
 * Check if a canonical ID is pure Mathematics or Technical Mathematics (excluding Math Lit)
 */
export function isPureMathematics(id: CanonicalSubjectId): boolean {
  return id === 'mathematics' || id === 'technical_mathematics';
}

/**
 * Check if a canonical ID is Mathematical Literacy
 */
export function isMathematicalLiteracy(id: CanonicalSubjectId): boolean {
  return id === 'mathematical_literacy';
}

/**
 * Check if a canonical ID is Life Orientation
 */
export function isLifeOrientation(id: CanonicalSubjectId): boolean {
  return id === 'life_orientation';
}

/**
 * Calculate student baseline academic metrics across all entered Apply subjects
 */
export function calculateStudentBaselineMetrics(
  results: Array<{ subject: string; mark: number }>
): StudentBaselineMetrics {
  const total = results.length;
  if (total === 0) {
    return {
      academicAverageExcludingLO: 0,
      overallAverage: 0,
      totalSubjectsCount: 0,
      mathsType: 'None',
    };
  }

  const overallSum = results.reduce((acc, r) => acc + r.mark, 0);
  const overallAverage = Math.round((overallSum / total) * 10) / 10;

  const nonLOResults = results.filter((r) => {
    const info = normaliseSubject(r.subject);
    return !info.isLifeOrientation;
  });

  const academicAvgExLO =
    nonLOResults.length > 0
      ? Math.round(
          (nonLOResults.reduce((acc, r) => acc + r.mark, 0) / nonLOResults.length) *
            10
        ) / 10
      : overallAverage;

  // Identify English subject
  const englishResult = results.find((r) => isEnglish(normaliseSubject(r.subject).id));

  // Identify Maths subject
  const pureMathsResult = results.find((r) =>
    isPureMathematics(normaliseSubject(r.subject).id)
  );
  const mathLitResult = results.find((r) =>
    isMathematicalLiteracy(normaliseSubject(r.subject).id)
  );

  let mathsType: 'Mathematics' | 'Mathematical Literacy' | 'Technical Mathematics' | 'None' =
    'None';
  let mathsResult = pureMathsResult || mathLitResult;

  if (pureMathsResult) {
    const info = normaliseSubject(pureMathsResult.subject);
    mathsType =
      info.id === 'technical_mathematics'
        ? 'Technical Mathematics'
        : 'Mathematics';
  } else if (mathLitResult) {
    mathsType = 'Mathematical Literacy';
  }

  return {
    academicAverageExcludingLO: academicAvgExLO,
    overallAverage,
    totalSubjectsCount: total,
    englishSubjectName: englishResult?.subject,
    englishMark: englishResult?.mark,
    englishLevel: englishResult ? getNscRatingLevel(englishResult.mark) : undefined,
    mathsSubjectName: mathsResult?.subject,
    mathsType,
    mathsMark: mathsResult?.mark,
    mathsLevel: mathsResult ? getNscRatingLevel(mathsResult.mark) : undefined,
  };
}

/**
 * Normalise and deduplicate results into unique canonical subjects.
 * If two entries map to the same canonical subject (e.g. "Maths" and "Mathematics"),
 * the highest mark is retained, ensuring canonical uniqueness.
 */
export function getCanonicalSubjectMap(
  results: Array<{ id?: string; subject: string; mark: number }>
): {
  canonicalMap: Map<
    CanonicalSubjectId,
    { id?: string; originalSubject: string; mark: number; info: CanonicalSubjectInfo }
  >;
  uniqueCount: number;
  uniqueCanonicalSubjects: Array<{
    id?: string;
    originalSubject: string;
    canonicalId: CanonicalSubjectId;
    standardName: string;
    mark: number;
    info: CanonicalSubjectInfo;
  }>;
} {
  const map = new Map<
    CanonicalSubjectId,
    { id?: string; originalSubject: string; mark: number; info: CanonicalSubjectInfo }
  >();

  for (const r of results) {
    const info = normaliseSubject(r.subject);
    const existing = map.get(info.id);
    if (!existing || r.mark > existing.mark) {
      map.set(info.id, {
        id: r.id,
        originalSubject: r.subject,
        mark: r.mark,
        info,
      });
    }
  }

  const uniqueCanonicalSubjects = Array.from(map.entries()).map(([canonicalId, data]) => ({
    id: data.id,
    originalSubject: data.originalSubject,
    canonicalId,
    standardName: data.info.standardName,
    mark: data.mark,
    info: data.info,
  }));

  return {
    canonicalMap: map,
    uniqueCount: map.size,
    uniqueCanonicalSubjects,
  };
}

/**
 * Count unique canonical subjects entered by the student.
 * Crucial: Ensures duplicate subject entries (e.g. "Maths" + "Mathematics")
 * are not counted as separate subjects toward the 7-subject requirement.
 */
export function countUniqueCanonicalSubjects(
  results: Array<{ subject: string; mark: number }>
): number {
  const { uniqueCount } = getCanonicalSubjectMap(results);
  return uniqueCount;
}

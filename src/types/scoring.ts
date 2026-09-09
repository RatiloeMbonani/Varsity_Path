/**
 * VarsityPath Institution-Aware Scoring Engine Types
 * Aligned with Western Cape Universities: UCT, Stellenbosch, UWC, and CPUT
 */

export type InstitutionId = 'uct' | 'uwc' | 'stellenbosch' | 'cput';

export type CanonicalSubjectId =
  | 'english_hl'
  | 'english_fal'
  | 'afrikaans_hl'
  | 'afrikaans_fal'
  | 'isixhosa_hl'
  | 'isixhosa_fal'
  | 'mathematics'
  | 'mathematical_literacy'
  | 'technical_mathematics'
  | 'physical_sciences'
  | 'life_sciences'
  | 'life_orientation'
  | 'accounting'
  | 'business_studies'
  | 'economics'
  | 'history'
  | 'geography'
  | 'information_technology'
  | 'computer_applications_technology'
  | 'engineering_graphics_design'
  | 'visual_arts'
  | 'dramatic_arts'
  | 'music'
  | 'consumer_studies'
  | 'hospitality_studies'
  | 'tourism'
  | 'religious_studies'
  | 'other';

export interface CanonicalSubjectInfo {
  id: CanonicalSubjectId;
  standardName: string;
  category:
    | 'language'
    | 'mathematics'
    | 'science'
    | 'humanities'
    | 'commerce'
    | 'technology'
    | 'arts'
    | 'services'
    | 'life_orientation'
    | 'other';
  isLanguage: boolean;
  isMathematics: boolean; // Pure Mathematics or Technical Mathematics (NOT Math Lit)
  isMathematicalLiteracy: boolean;
  isLifeOrientation: boolean;
  languageType?: 'home_language' | 'first_additional' | 'second_additional';
}

/**
 * Breakdown of how a single subject was handled in an institutional calculation
 */
export interface ScoreSubjectBreakdown {
  subjectName: string; // Original student-entered subject name
  canonicalId: CanonicalSubjectId;
  mark: number;
  nscLevel: number;
  pointsContributed: number;
  status: 'included' | 'excluded';
  reason: string;
  scoringRule?: string; // e.g. "English Column (Level 7)", "Direct Percentage", "Life Orientation Points"
}

/**
 * Baseline NSC metrics calculated from authentic student results
 */
export interface StudentBaselineMetrics {
  academicAverageExcludingLO: number; // Mean of non-LO subjects
  overallAverage: number; // Mean of all entered subjects
  totalSubjectsCount: number;
  englishSubjectName?: string;
  englishMark?: number;
  englishLevel?: number;
  mathsSubjectName?: string;
  mathsType?: 'Mathematics' | 'Mathematical Literacy' | 'Technical Mathematics' | 'None';
  mathsMark?: number;
  mathsLevel?: number;
}

/**
 * Result returned by any institution's scoring strategy
 */
export interface InstitutionalScoreResult {
  institutionId: InstitutionId;
  institutionName: string;
  scoreLabel: string; // e.g. "UCT Admission Score", "UWC Points", "Programme-Specific Assessment"
  hasUniversalScore: boolean; // true for UCT & UWC; false for SU & CPUT
  score: number | null; // Calculated numeric score or null if universal score does not exist
  maxPossibleScore?: number; // e.g. 600 for UCT, 66 for UWC
  methodologyName: string;
  methodologyDescription: string;
  methodologySource: string;
  subjectsUsed: ScoreSubjectBreakdown[];
  subjectsExcluded: ScoreSubjectBreakdown[];
  baselineMetrics: StudentBaselineMetrics;
  disclaimer: string;
  // Specific institutional notes or policy details
  institutionalNotes?: string[];
}

/**
 * Configuration for programme-specific required subjects
 * Used by UCT and future programme requirement filters
 */
export interface ProgrammeRequirementConfig {
  programmeCode?: string;
  programmeName?: string;
  faculty?: string;
  requiredSubjectIds?: CanonicalSubjectId[]; // Subjects that MUST be included in the calculation (e.g. Maths, Physical Sciences)
  minimumMarks?: Partial<Record<CanonicalSubjectId, number>>;
  minimumScore?: number;
}

/**
 * Interface for an institution's calculation strategy
 */
export interface InstitutionScoringStrategy {
  institutionId: InstitutionId;
  institutionName: string;
  calculateScore(
    results: Array<{ id: string; subject: string; mark: number }>,
    programmeRequirements?: ProgrammeRequirementConfig
  ): InstitutionalScoreResult;
}

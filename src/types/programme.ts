import { CanonicalSubjectId, InstitutionId } from './scoring';

export interface ProgrammeSubjectRequirement {
  subjectId: CanonicalSubjectId;
  minimumMark: number;
  /**
   * Alternative acceptable subjects (e.g., Mathematical Literacy or Technical Mathematics)
   * with their specific required minimum mark.
   */
  alternativeSubjectIds?: Array<{
    subjectId: CanonicalSubjectId;
    minimumMark: number;
    description?: string;
  }>;
  isRequired: boolean;
  description?: string;
}

export interface Programme {
  id: string;
  institutionId: InstitutionId;
  universityName: string;
  name: string;
  faculty: string;
  qualificationType: 'Bachelor' | 'Diploma' | 'Higher Certificate';
  officialUrl: string;
  scoringMethod: 'uct' | 'uwc' | 'stellenbosch' | 'cput';
  /**
   * Minimum institution-specific score required for consideration:
   * - UCT: Minimum UCT Admission Score (e.g. 450)
   * - UWC: Minimum UWC Points (e.g. 30)
   * - CPUT: Minimum points where structured
   * - Stellenbosch: null (uses programme-specific subject benchmarks and academic average)
   */
  minimumScore: number | null;
  /**
   * Minimum academic average percentage (excluding Life Orientation)
   * Essential for Stellenbosch University and competitive diploma programs.
   */
  minimumAcademicAverage?: number | null;
  requiredSubjects: CanonicalSubjectId[];
  subjectRequirements: ProgrammeSubjectRequirement[];
  additionalRequirements: string[];
  selectionRequirements: string[];
  nbtRequired?: boolean;
  nbtRequirementDescription?: string;
  academicYear: number;
  lastVerified: string;
  description: string;
  degreeCode?: string;
  durationYears?: number;
}

export interface ProgrammeEligibilityResult {
  programme: Programme;
  eligible: boolean;
  score: number | null;
  minimumScore: number | null;
  academicAverage: number;
  minimumAcademicAverage?: number | null;
  satisfiedRequirements: Array<{ title: string; detail: string }>;
  failedRequirements: Array<{ title: string; detail: string }>;
  additionalRequirements: string[];
  explanation: string;
}

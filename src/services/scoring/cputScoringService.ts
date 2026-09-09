import {
  InstitutionalScoreResult,
  InstitutionScoringStrategy,
  ProgrammeRequirementConfig,
} from '../../types/scoring';
import { calculateStudentBaselineMetrics } from './subjectNormaliser';

/**
 * Cape Peninsula University of Technology (CPUT) Scoring Service
 *
 * CRITICAL ARCHITECTURAL POLICY:
 * CPUT does NOT use one universal institution-wide APS formula.
 * Different qualifications (National Higher Certificates, Diplomas, Bachelor Degrees,
 * and Extended Curriculum Programmes / ECP) employ qualification-specific rating rules
 * and faculty-specific weighting:
 * - Faculty of Engineering & the Built Environment (strict pure/technical Maths & Physical Sciences)
 * - Faculty of Business & Management Sciences (differentiated mainstream vs ECP criteria)
 * - Faculty of Applied Sciences & Health & Wellness
 * - Faculty of Informatics and Design
 *
 * Consequently, this service refrains from fabricating a single universal CPUT APS number.
 */
export class CputScoringService implements InstitutionScoringStrategy {
  institutionId = 'cput' as const;
  institutionName = 'Cape Peninsula University of Technology (CPUT)';

  calculateScore(
    results: Array<{ id: string; subject: string; mark: number }>,
    _programmeRequirements?: ProgrammeRequirementConfig
  ): InstitutionalScoreResult {
    const baselineMetrics = calculateStudentBaselineMetrics(results);

    return {
      institutionId: this.institutionId,
      institutionName: this.institutionName,
      scoreLabel: 'Cape Peninsula University of Technology (CPUT)',
      hasUniversalScore: false,
      score: null, // Prohibited from displaying an invented universal APS
      methodologyName: 'Qualification & Faculty-Specific Rating Architecture',
      methodologyDescription:
        'CPUT does not calculate one universal institution-wide APS score. Requirements, subject weighting, and point thresholds differ between Diplomas, Degrees, and Extended Curriculum Programmes (ECP).',
      methodologySource:
        'CPUT Official Prospectus & Qualification-Specific Minimum Requirements Guide',
      subjectsUsed: [],
      subjectsExcluded: [],
      baselineMetrics,
      disclaimer:
        'CPUT qualifications require specific minimum subject levels rather than a generic score. Many programmes offer an Extended Curriculum Programme (ECP) pathway for applicants who narrowly miss mainstream direct entry requirements.',
      institutionalNotes: [
        'No universal APS score: Evaluation is qualification and faculty specific.',
        'Mainstream vs ECP: Separate admission thresholds exist for direct 3-year Diplomas vs 4-year Extended Curriculum Programmes.',
        'Technical Subjects: CPUT recognises Technical Mathematics and Engineering Graphics & Design (EGD) in engineering qualifications.',
        'Language Requirement: Minimum Level 4 (50%) in English is standard across most faculties.',
        'Programme Scoring: Specific subject rating totals are evaluated when specific qualifications are selected.',
      ],
    };
  }
}

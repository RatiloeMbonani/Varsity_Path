import {
  InstitutionalScoreResult,
  InstitutionScoringStrategy,
  ProgrammeRequirementConfig,
} from '../../types/scoring';
import { calculateStudentBaselineMetrics } from './subjectNormaliser';

/**
 * Stellenbosch University (SU) Admission Criteria Service
 *
 * CRITICAL ARCHITECTURAL POLICY:
 * Stellenbosch University does NOT utilize a single generic institution-wide APS formula.
 * Admissions and selection are determined on a programme-by-programme basis using:
 * 1. Minimum Admission Requirements (NSC Bachelor endorsement, minimum language percentage, minimum Maths level).
 * 2. Programme-Specific Subject Thresholds (e.g., Physical Sciences minimum 60% for Engineering/Sciences).
 * 3. Faculty Selection Scoring (competitive ranking formulas weighted per faculty).
 * 4. NBT (National Benchmark Tests) where applicable.
 *
 * Consequently, this service strictly refrains from fabricating an invented universal APS number.
 */
export class StellenboschScoringService implements InstitutionScoringStrategy {
  institutionId = 'stellenbosch' as const;
  institutionName = 'Stellenbosch University (SU)';

  calculateScore(
    results: Array<{ id: string; subject: string; mark: number }>,
    _programmeRequirements?: ProgrammeRequirementConfig
  ): InstitutionalScoreResult {
    const baselineMetrics = calculateStudentBaselineMetrics(results);

    return {
      institutionId: this.institutionId,
      institutionName: this.institutionName,
      scoreLabel: 'Stellenbosch University (SU)',
      hasUniversalScore: false,
      score: null, // Prohibited from displaying an invented universal APS
      methodologyName: 'Faculty & Programme-Specific Admission & Selection Criteria',
      methodologyDescription:
        'Stellenbosch University does not use a single universal APS formula. Admission is determined per programme based on minimum admission benchmarks, subject prerequisites, and competitive faculty selection metrics.',
      methodologySource:
        'Stellenbosch University Admissions Policy & Faculty Minimum Admission Guidelines',
      subjectsUsed: [],
      subjectsExcluded: [],
      baselineMetrics,
      disclaimer:
        'Stellenbosch University evaluates candidates through distinct faculty selection formulas. Attaining minimum requirements guarantees consideration, but does not guarantee admission in competitive programmes (e.g. Medicine, Law, Engineering).',
      institutionalNotes: [
        'No universal APS score: Evaluation is strictly programme-specific.',
        'Core Language Requirement: Minimum 50% in English or Afrikaans (Home Language or First Additional Language).',
        'Mathematics vs Math Literacy: Most Science, Engineering, and Commerce programmes strictly require pure Mathematics.',
        'Academic Average: Many faculties evaluate the matric academic aggregate (excluding Life Orientation).',
        'Competitive Selection: Selection marks and applicant rankings are computed when specific programmes are chosen.',
      ],
    };
  }
}

import { Programme, ProgrammeEligibilityResult } from '../../types/programme';
import { InstitutionId, InstitutionalScoreResult } from '../../types/scoring';
import {
  calculateStudentBaselineMetrics,
  getCanonicalSubjectMap,
  getNscRatingLevel,
  isLifeOrientation,
} from './subjectNormaliser';

/**
 * Calculate CPUT qualification rating score:
 * Sum of NSC rating levels (1 to 7) for best 6 subjects (excluding Life Orientation).
 */
export function calculateCputQualificationRating(
  applyResults: Array<{ subject: string; mark: number }>
): number {
  const { uniqueCanonicalSubjects } = getCanonicalSubjectMap(applyResults);
  const nonLO = uniqueCanonicalSubjects
    .filter((s) => !isLifeOrientation(s.canonicalId))
    .map((s) => getNscRatingLevel(s.mark))
    .sort((a, b) => b - a);

  // Best 6 subjects
  return nonLO.slice(0, 6).reduce((acc, level) => acc + level, 0);
}

/**
 * Deterministic Programme Eligibility Evaluator.
 * Evaluates a student's authentic Apply results against official published programme requirements.
 *
 * @param programme The university programme specification
 * @param applyResults Authentic Apply results entered by the student
 * @param institutionScores The calculated scores for supported institutions
 * @returns Complete eligibility audit result
 */
export function evaluateProgrammeEligibility(
  programme: Programme,
  applyResults: Array<{ id?: string; subject: string; mark: number }>,
  institutionScores: Record<InstitutionId, InstitutionalScoreResult>
): ProgrammeEligibilityResult {
  const { canonicalMap, uniqueCount } = getCanonicalSubjectMap(applyResults);
  const baselineMetrics = calculateStudentBaselineMetrics(applyResults);

  const satisfiedRequirements: Array<{ title: string; detail: string }> = [];
  const failedRequirements: Array<{ title: string; detail: string }> = [];

  // Minimum 7 unique canonical subjects check
  if (uniqueCount < 7) {
    return {
      programme,
      eligible: false,
      score: null,
      minimumScore: programme.minimumScore,
      academicAverage: baselineMetrics.academicAverageExcludingLO,
      minimumAcademicAverage: programme.minimumAcademicAverage,
      satisfiedRequirements: [],
      failedRequirements: [
        {
          title: 'Minimum NSC Subject Count',
          detail: `Requires at least 7 unique NSC matric subjects. You currently have ${uniqueCount}.`,
        },
      ],
      additionalRequirements: programme.additionalRequirements,
      explanation: `You must record at least 7 subjects to evaluate university programme eligibility.`,
    };
  }

  // 1. Evaluate Subject-Specific Prerequisite Requirements
  for (const req of programme.subjectRequirements) {
    const studentPrimary = canonicalMap.get(req.subjectId);
    let requirementMet = false;
    let satisfiedDetail = '';
    let failedDetail = '';

    // Check primary subject
    if (studentPrimary && studentPrimary.mark >= req.minimumMark) {
      requirementMet = true;
      satisfiedDetail = `${studentPrimary.info.standardName}: ${studentPrimary.mark}% (Minimum required: ${req.minimumMark}%)`;
    } else {
      // Check alternative subjects if available (e.g. Maths Lit or Technical Maths or HL/FAL language alternatives)
      if (req.alternativeSubjectIds && req.alternativeSubjectIds.length > 0) {
        for (const alt of req.alternativeSubjectIds) {
          const studentAlt = canonicalMap.get(alt.subjectId);
          if (studentAlt && studentAlt.mark >= alt.minimumMark) {
            requirementMet = true;
            satisfiedDetail = `${studentAlt.info.standardName}: ${studentAlt.mark}% (Alternative minimum required: ${alt.minimumMark}%)`;
            break;
          }
        }
      }

      if (!requirementMet) {
        if (studentPrimary) {
          failedDetail = `${studentPrimary.info.standardName} mark of ${studentPrimary.mark}% is below the required ${req.minimumMark}%.`;
        } else {
          failedDetail = `Missing compulsory prerequisite: ${req.description || req.subjectId} (Minimum ${req.minimumMark}% required).`;
        }
      }
    }

    if (requirementMet) {
      satisfiedRequirements.push({
        title: req.description || req.subjectId,
        detail: satisfiedDetail,
      });
    } else {
      failedRequirements.push({
        title: req.description || req.subjectId,
        detail: failedDetail,
      });
    }
  }

  // 2. Evaluate Institution-Specific Score Benchmark
  let studentScore: number | null = null;
  const method = programme.scoringMethod;

  if (method === 'uct') {
    const uctScoreResult = institutionScores.uct;
    studentScore = uctScoreResult?.score ?? null;

    if (programme.minimumScore !== null) {
      if (studentScore !== null && studentScore >= programme.minimumScore) {
        satisfiedRequirements.push({
          title: 'UCT Admission Score',
          detail: `Your score of ${studentScore} meets the minimum requirement of ${programme.minimumScore}.`,
        });
      } else {
        failedRequirements.push({
          title: 'UCT Admission Score',
          detail: `Your score of ${studentScore ?? 0} is below the minimum requirement of ${programme.minimumScore}.`,
        });
      }
    }
  } else if (method === 'uwc') {
    const uwcScoreResult = institutionScores.uwc;
    studentScore = uwcScoreResult?.score ?? null;

    if (programme.minimumScore !== null) {
      if (studentScore !== null && studentScore >= programme.minimumScore) {
        satisfiedRequirements.push({
          title: 'UWC Points Rating',
          detail: `Your UWC points score of ${studentScore} meets the minimum requirement of ${programme.minimumScore} points.`,
        });
      } else {
        failedRequirements.push({
          title: 'UWC Points Rating',
          detail: `Your UWC points score of ${studentScore ?? 0} is below the minimum requirement of ${programme.minimumScore} points.`,
        });
      }
    }
  } else if (method === 'stellenbosch') {
    // Stellenbosch University: No universal APS.
    // Evaluates matric academic average (excluding Life Orientation).
    studentScore = baselineMetrics.academicAverageExcludingLO;

    if (programme.minimumAcademicAverage !== null && programme.minimumAcademicAverage !== undefined) {
      if (studentScore >= programme.minimumAcademicAverage) {
        satisfiedRequirements.push({
          title: 'Matric Academic Average (excl. LO)',
          detail: `Your aggregate average of ${studentScore}% meets the minimum requirement of ${programme.minimumAcademicAverage}%.`,
        });
      } else {
        failedRequirements.push({
          title: 'Matric Academic Average (excl. LO)',
          detail: `Your aggregate average of ${studentScore}% is below the minimum requirement of ${programme.minimumAcademicAverage}%.`,
        });
      }
    }
  } else if (method === 'cput') {
    // CPUT: Uses qualification rating score across best 6 subjects
    const cputRating = calculateCputQualificationRating(applyResults);
    studentScore = cputRating;

    if (programme.minimumScore !== null) {
      if (cputRating >= programme.minimumScore) {
        satisfiedRequirements.push({
          title: 'CPUT Qualification Rating',
          detail: `Your CPUT rating score of ${cputRating} meets the minimum requirement of ${programme.minimumScore}.`,
        });
      } else {
        failedRequirements.push({
          title: 'CPUT Qualification Rating',
          detail: `Your CPUT rating score of ${cputRating} is below the minimum requirement of ${programme.minimumScore}.`,
        });
      }
    }
  }

  const eligible = failedRequirements.length === 0;

  const explanation = eligible
    ? 'You meet the published minimum requirements for this programme.'
    : `Requirements not met: ${failedRequirements.map((f) => f.title).join('; ')}.`;

  return {
    programme,
    eligible,
    score: studentScore,
    minimumScore: programme.minimumScore,
    academicAverage: baselineMetrics.academicAverageExcludingLO,
    minimumAcademicAverage: programme.minimumAcademicAverage,
    satisfiedRequirements,
    failedRequirements,
    additionalRequirements: programme.additionalRequirements,
    explanation,
  };
}

/**
 * Evaluate all programmes and return only eligible programmes grouped by institution.
 */
export function evaluateAllProgrammes(
  programmes: Programme[],
  applyResults: Array<{ id?: string; subject: string; mark: number }>,
  institutionScores: Record<InstitutionId, InstitutionalScoreResult>
): {
  groupedEligible: Record<InstitutionId, ProgrammeEligibilityResult[]>;
  totalEligibleCount: number;
  allEvaluations: ProgrammeEligibilityResult[];
} {
  const grouped: Record<InstitutionId, ProgrammeEligibilityResult[]> = {
    uct: [],
    stellenbosch: [],
    uwc: [],
    cput: [],
  };

  let totalEligibleCount = 0;
  const allEvaluations: ProgrammeEligibilityResult[] = [];

  for (const prog of programmes) {
    const result = evaluateProgrammeEligibility(prog, applyResults, institutionScores);
    allEvaluations.push(result);
    if (result.eligible) {
      grouped[prog.institutionId].push(result);
      totalEligibleCount++;
    }
  }

  return {
    groupedEligible: grouped,
    totalEligibleCount,
    allEvaluations,
  };
}

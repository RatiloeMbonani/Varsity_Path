import {
  InstitutionalScoreResult,
  InstitutionScoringStrategy,
  ProgrammeRequirementConfig,
  ScoreSubjectBreakdown,
} from '../../types/scoring';
import {
  calculateStudentBaselineMetrics,
  getNscRatingLevel,
  isEnglish,
  isLifeOrientation,
  normaliseSubject,
} from './subjectNormaliser';

/**
 * UCT Admission Score Calculation Service
 *
 * Official UCT NSC Methodology:
 * - Direct percentage allocation (mark percentage equals admission points, max 100 per subject).
 * - Exactly 6 NSC subjects are considered (maximum possible score: 600).
 * - English (Home Language or First Additional Language) is compulsory.
 * - Programme-specific required subjects (e.g. Mathematics, Physical Sciences) are compulsory where configured.
 * - Life Orientation is strictly EXCLUDED.
 * - Results below 40% do not attract an admission score (0 points).
 * - Additional slots up to 6 subjects are populated by the student's highest-scoring remaining eligible subjects.
 */
export class UctScoringService implements InstitutionScoringStrategy {
  institutionId = 'uct' as const;
  institutionName = 'University of Cape Town (UCT)';

  calculateScore(
    results: Array<{ id: string; subject: string; mark: number }>,
    programmeRequirements?: ProgrammeRequirementConfig
  ): InstitutionalScoreResult {
    const baselineMetrics = calculateStudentBaselineMetrics(results);

    const subjectsUsed: ScoreSubjectBreakdown[] = [];
    const subjectsExcluded: ScoreSubjectBreakdown[] = [];

    // Map all results with normalized info
    const mapped = results.map((r) => {
      const info = normaliseSubject(r.subject);
      const nscLevel = getNscRatingLevel(r.mark);
      return {
        id: r.id,
        rawSubject: r.subject,
        mark: r.mark,
        info,
        nscLevel,
      };
    });

    // 1. Separate Life Orientation immediately
    const nonLO: typeof mapped = [];
    for (const item of mapped) {
      if (isLifeOrientation(item.info.id)) {
        subjectsExcluded.push({
          subjectName: item.rawSubject,
          canonicalId: item.info.id,
          mark: item.mark,
          nscLevel: item.nscLevel,
          pointsContributed: 0,
          status: 'excluded',
          reason: 'Life Orientation is excluded from the UCT Admission Score calculation.',
        });
      } else {
        nonLO.push(item);
      }
    }

    // Set of used item IDs to prevent duplicate subject inclusion
    const usedIds = new Set<string>();

    // Helper: calculate UCT points for a mark (< 40% attracts 0 points)
    const getUctPoints = (mark: number) => {
      if (mark < 40) return 0;
      return mark;
    };

    // 2. Compulsory Requirement 1: English
    // Select the student's highest-scoring English subject if multiple exist
    const englishCandidates = nonLO
      .filter((item) => isEnglish(item.info.id))
      .sort((a, b) => b.mark - a.mark);

    if (englishCandidates.length > 0) {
      const topEnglish = englishCandidates[0];
      usedIds.add(topEnglish.id);
      const points = getUctPoints(topEnglish.mark);
      subjectsUsed.push({
        subjectName: topEnglish.rawSubject,
        canonicalId: topEnglish.info.id,
        mark: topEnglish.mark,
        nscLevel: topEnglish.nscLevel,
        pointsContributed: points,
        status: 'included',
        reason: 'Compulsory English requirement for UCT admission.',
        scoringRule:
          topEnglish.mark < 40
            ? 'Score <40% (0 pts)'
            : `Direct percentage (${topEnglish.mark} pts)`,
      });
    }

    // 3. Compulsory Requirement 2: Programme-Specific Required Subjects (if configured)
    const requiredSubjectIds = programmeRequirements?.requiredSubjectIds || [];
    for (const reqId of requiredSubjectIds) {
      // Find candidate matching required canonical ID not yet used
      const matchingCandidate = nonLO.find(
        (item) => !usedIds.has(item.id) && item.info.id === reqId
      );

      if (matchingCandidate) {
        usedIds.add(matchingCandidate.id);
        const points = getUctPoints(matchingCandidate.mark);
        subjectsUsed.push({
          subjectName: matchingCandidate.rawSubject,
          canonicalId: matchingCandidate.info.id,
          mark: matchingCandidate.mark,
          nscLevel: matchingCandidate.nscLevel,
          pointsContributed: points,
          status: 'included',
          reason: `Programme prerequisite subject: ${matchingCandidate.info.standardName}`,
          scoringRule:
            matchingCandidate.mark < 40
              ? 'Score <40% (0 pts)'
              : `Direct percentage (${matchingCandidate.mark} pts)`,
        });
      }
    }

    // 4. Fill remaining slots to reach exactly 6 subjects
    // Available remaining subjects sorted by mark descending
    const remainingCandidates = nonLO
      .filter((item) => !usedIds.has(item.id))
      .sort((a, b) => b.mark - a.mark);

    const slotsNeeded = Math.max(0, 6 - subjectsUsed.length);

    for (let i = 0; i < remainingCandidates.length; i++) {
      const candidate = remainingCandidates[i];
      if (i < slotsNeeded) {
        usedIds.add(candidate.id);
        const points = getUctPoints(candidate.mark);
        subjectsUsed.push({
          subjectName: candidate.rawSubject,
          canonicalId: candidate.info.id,
          mark: candidate.mark,
          nscLevel: candidate.nscLevel,
          pointsContributed: points,
          status: 'included',
          reason: 'Eligible NSC subject: selected as one of top qualifying subjects.',
          scoringRule:
            candidate.mark < 40
              ? 'Score <40% (0 pts)'
              : `Direct percentage (${candidate.mark} pts)`,
        });
      } else {
        // Excluded because not in top 6
        subjectsExcluded.push({
          subjectName: candidate.rawSubject,
          canonicalId: candidate.info.id,
          mark: candidate.mark,
          nscLevel: candidate.nscLevel,
          pointsContributed: 0,
          status: 'excluded',
          reason:
            candidate.mark < 40
              ? 'Mark below 40% and lower than top selected subjects.'
              : 'Excluded: lower mark than the selected top 6 eligible subjects.',
        });
      }
    }

    // Total UCT Admission Score
    const totalScore = subjectsUsed.reduce((sum, item) => sum + item.pointsContributed, 0);

    return {
      institutionId: this.institutionId,
      institutionName: this.institutionName,
      scoreLabel: 'UCT Admission Score',
      hasUniversalScore: true,
      score: totalScore,
      maxPossibleScore: 600,
      methodologyName: 'UCT NSC Admission Point Score (APS)',
      methodologyDescription:
        'Calculated as the sum of percentages for 6 eligible NSC subjects (English + programme prerequisites + next best eligible subjects). Life Orientation is excluded, and marks below 40% attract 0 points.',
      methodologySource:
        'University of Cape Town Undergraduate Admissions Policy (NSC Scoring Guide)',
      subjectsUsed,
      subjectsExcluded,
      baselineMetrics,
      disclaimer:
        'The UCT Admission Score is a preliminary screening benchmark. Admission into specific faculties (e.g., Health Sciences, Commerce, Engineering) further requires meeting minimum subject performance thresholds, NBT results where applicable, and faculty-specific selection criteria.',
      institutionalNotes: [
        'Total calculated out of 6 subjects (maximum 600 points).',
        'Life Orientation does not contribute to the UCT admission score.',
        'Subjects with marks below 40% receive 0 points.',
        'English is mandatory for all UCT qualification routes.',
      ],
    };
  }
}

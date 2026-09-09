import {
  InstitutionalScoreResult,
  InstitutionScoringStrategy,
  ProgrammeRequirementConfig,
  ScoreSubjectBreakdown,
} from '../../types/scoring';
import {
  calculateStudentBaselineMetrics,
  isEnglish,
  isLifeOrientation,
  isMathematicalLiteracy,
  isPureMathematics,
  normaliseSubject,
} from './subjectNormaliser';

export type UwcColumnType = 'english' | 'mathematics' | 'life_orientation' | 'other';

/**
 * UWC Points Rating Calculation Service
 *
 * Official University of the Western Cape (UWC) Published Points Scale:
 * ----------------------------------------------------------------------
 * NSC Level | Percentage | English | Mathematics | Life Orientation | Other Subject
 * 8         | 90–100     | 15      | 15          | 3                | 8
 * 7         | 80–89      | 13      | 13          | 3                | 7
 * 6         | 70–79      | 11      | 11          | 2                | 6
 * 5         | 60–69      | 9       | 9           | 2                | 5
 * 4         | 50–59      | 7       | 7           | 2                | 4
 * 3         | 40–49      | 5       | 5           | 1                | 3
 * 2         | 30–39      | 3       | 3           | 1                | 2
 * 1         | 20–29      | 1       | 1           | 1                | 1
 * <20       | <20        | 0       | 0           | 0                | 0
 * ----------------------------------------------------------------------
 * Critical Rules:
 * - English (HL or FAL) uses the English column (max 15 points).
 * - Pure Mathematics uses the Mathematics column (max 15 points).
 * - Mathematical Literacy is strictly evaluated using the "Other Subject" column (max 8 points).
 * - Life Orientation receives points using its dedicated column (1–3 points).
 * - All other subjects receive points using the "Other Subject" column (max 8 points each).
 * - Total UWC points are calculated across the 7 NSC subjects.
 */
export class UwcScoringService implements InstitutionScoringStrategy {
  institutionId = 'uwc' as const;
  institutionName = 'University of the Western Cape (UWC)';

  /**
   * Lookup points in official UWC table
   */
  static getPointsForMark(
    mark: number,
    column: UwcColumnType
  ): { points: number; level: number; band: string } {
    if (mark >= 90) {
      const points =
        column === 'english' || column === 'mathematics' ? 15 :
        column === 'life_orientation' ? 3 : 8;
      return { points, level: 8, band: '90–100%' };
    }
    if (mark >= 80) {
      const points =
        column === 'english' || column === 'mathematics' ? 13 :
        column === 'life_orientation' ? 3 : 7;
      return { points, level: 7, band: '80–89%' };
    }
    if (mark >= 70) {
      const points =
        column === 'english' || column === 'mathematics' ? 11 :
        column === 'life_orientation' ? 2 : 6;
      return { points, level: 6, band: '70–79%' };
    }
    if (mark >= 60) {
      const points =
        column === 'english' || column === 'mathematics' ? 9 :
        column === 'life_orientation' ? 2 : 5;
      return { points, level: 5, band: '60–69%' };
    }
    if (mark >= 50) {
      const points =
        column === 'english' || column === 'mathematics' ? 7 :
        column === 'life_orientation' ? 2 : 4;
      return { points, level: 4, band: '50–59%' };
    }
    if (mark >= 40) {
      const points =
        column === 'english' || column === 'mathematics' ? 5 :
        column === 'life_orientation' ? 1 : 3;
      return { points, level: 3, band: '40–49%' };
    }
    if (mark >= 30) {
      const points =
        column === 'english' || column === 'mathematics' ? 3 :
        column === 'life_orientation' ? 1 : 2;
      return { points, level: 2, band: '30–39%' };
    }
    if (mark >= 20) {
      const points =
        column === 'english' || column === 'mathematics' ? 1 :
        column === 'life_orientation' ? 1 : 1;
      return { points, level: 1, band: '20–29%' };
    }
    return { points: 0, level: 0, band: '<20%' };
  }

  calculateScore(
    results: Array<{ id: string; subject: string; mark: number }>,
    _programmeRequirements?: ProgrammeRequirementConfig
  ): InstitutionalScoreResult {
    const baselineMetrics = calculateStudentBaselineMetrics(results);
    const subjectsUsed: ScoreSubjectBreakdown[] = [];
    const subjectsExcluded: ScoreSubjectBreakdown[] = [];

    // Map results with normalized subject metadata
    const mapped = results.map((r) => {
      const info = normaliseSubject(r.subject);
      return {
        id: r.id,
        rawSubject: r.subject,
        mark: r.mark,
        info,
      };
    });

    const usedIds = new Set<string>();

    // 1. English Requirement (uses English column: max 15)
    const englishCandidates = mapped
      .filter((item) => isEnglish(item.info.id))
      .sort((a, b) => b.mark - a.mark);

    if (englishCandidates.length > 0) {
      const topEnglish = englishCandidates[0];
      usedIds.add(topEnglish.id);
      const { points, level, band } = UwcScoringService.getPointsForMark(
        topEnglish.mark,
        'english'
      );
      subjectsUsed.push({
        subjectName: topEnglish.rawSubject,
        canonicalId: topEnglish.info.id,
        mark: topEnglish.mark,
        nscLevel: level,
        pointsContributed: points,
        status: 'included',
        reason: `English compulsory (Level ${level}, ${band} in English points column).`,
        scoringRule: `English Column: ${points} pts`,
      });
    }

    // 2. Mathematics Requirement:
    // Pure Mathematics receives Mathematics column.
    // Mathematical Literacy receives "Other Subject" column per UWC policy.
    const pureMathsCandidates = mapped
      .filter((item) => !usedIds.has(item.id) && isPureMathematics(item.info.id))
      .sort((a, b) => b.mark - a.mark);

    const mathLitCandidates = mapped
      .filter((item) => !usedIds.has(item.id) && isMathematicalLiteracy(item.info.id))
      .sort((a, b) => b.mark - a.mark);

    if (pureMathsCandidates.length > 0) {
      const topMaths = pureMathsCandidates[0];
      usedIds.add(topMaths.id);
      const { points, level, band } = UwcScoringService.getPointsForMark(
        topMaths.mark,
        'mathematics'
      );
      subjectsUsed.push({
        subjectName: topMaths.rawSubject,
        canonicalId: topMaths.info.id,
        mark: topMaths.mark,
        nscLevel: level,
        pointsContributed: points,
        status: 'included',
        reason: `Mathematics (Level ${level}, ${band} in Mathematics points column).`,
        scoringRule: `Mathematics Column: ${points} pts`,
      });
    } else if (mathLitCandidates.length > 0) {
      const topMathLit = mathLitCandidates[0];
      usedIds.add(topMathLit.id);
      // UWC states Math Lit receives Other Subject column points!
      const { points, level, band } = UwcScoringService.getPointsForMark(
        topMathLit.mark,
        'other'
      );
      subjectsUsed.push({
        subjectName: topMathLit.rawSubject,
        canonicalId: topMathLit.info.id,
        mark: topMathLit.mark,
        nscLevel: level,
        pointsContributed: points,
        status: 'included',
        reason: `Mathematical Literacy (Level ${level}, ${band} evaluated as 'Other Subject' per UWC policy).`,
        scoringRule: `Other Subject Column: ${points} pts`,
      });
    }

    // 3. Life Orientation Requirement (uses Life Orientation column: 1 to 3 pts)
    const loCandidates = mapped
      .filter((item) => !usedIds.has(item.id) && isLifeOrientation(item.info.id))
      .sort((a, b) => b.mark - a.mark);

    if (loCandidates.length > 0) {
      const topLO = loCandidates[0];
      usedIds.add(topLO.id);
      const { points, level, band } = UwcScoringService.getPointsForMark(
        topLO.mark,
        'life_orientation'
      );
      subjectsUsed.push({
        subjectName: topLO.rawSubject,
        canonicalId: topLO.info.id,
        mark: topLO.mark,
        nscLevel: level,
        pointsContributed: points,
        status: 'included',
        reason: `Life Orientation (Level ${level}, ${band} in Life Orientation points column).`,
        scoringRule: `Life Orientation Column: ${points} pts`,
      });
    }

    // 4. Remaining Other Subjects (uses Other Subject column: max 8 pts each)
    // To complete 7 subjects (or remaining available slots):
    const remainingCandidates = mapped
      .filter((item) => !usedIds.has(item.id))
      .map((item) => {
        const { points, level, band } = UwcScoringService.getPointsForMark(
          item.mark,
          'other'
        );
        return {
          ...item,
          points,
          level,
          band,
        };
      })
      .sort((a, b) => b.points - a.points || b.mark - a.mark);

    const targetTotalSubjects = 7;
    const slotsNeeded = Math.max(0, targetTotalSubjects - subjectsUsed.length);

    for (let i = 0; i < remainingCandidates.length; i++) {
      const candidate = remainingCandidates[i];
      if (i < slotsNeeded) {
        usedIds.add(candidate.id);
        subjectsUsed.push({
          subjectName: candidate.rawSubject,
          canonicalId: candidate.info.id,
          mark: candidate.mark,
          nscLevel: candidate.level,
          pointsContributed: candidate.points,
          status: 'included',
          reason: `Other eligible subject: Level ${candidate.level} (${candidate.band}).`,
          scoringRule: `Other Subject Column: ${candidate.points} pts`,
        });
      } else {
        subjectsExcluded.push({
          subjectName: candidate.rawSubject,
          canonicalId: candidate.info.id,
          mark: candidate.mark,
          nscLevel: candidate.level,
          pointsContributed: 0,
          status: 'excluded',
          reason: 'Excluded: lower points than the 7 subjects selected for UWC.',
        });
      }
    }

    const totalScore = subjectsUsed.reduce((sum, item) => sum + item.pointsContributed, 0);

    return {
      institutionId: this.institutionId,
      institutionName: this.institutionName,
      scoreLabel: 'UWC Points',
      hasUniversalScore: true,
      score: totalScore,
      maxPossibleScore: 66, // 15 + 15 + 3 + (4 * 8) = 65, or 66 if max 8s
      methodologyName: 'UWC Published Points Rating Scale',
      methodologyDescription:
        'Calculated across 7 subjects using published weighted tables: English (max 15), Mathematics (max 15), Life Orientation (max 3), and Other Subjects including Mathematical Literacy (max 8 each).',
      methodologySource:
        'University of the Western Cape Undergraduate Admissions (General Calendar & Points Table)',
      subjectsUsed,
      subjectsExcluded,
      baselineMetrics,
      disclaimer:
        'UWC Points serve as an institution-wide comparative rating. Individual faculty admissions (e.g. Community & Health Sciences, Law, Natural Sciences) require specific minimum points, subject prerequisites, and endorsement criteria.',
      institutionalNotes: [
        'English receives points under the dedicated English column (max 15 pts).',
        'Pure Mathematics receives points under the Mathematics column (max 15 pts).',
        'Mathematical Literacy is rated under the Other Subject column (max 8 pts).',
        'Life Orientation is included with its dedicated rating column (1 to 3 pts).',
        'All other subjects are rated under the Other Subject column (max 8 pts each).',
      ],
    };
  }
}

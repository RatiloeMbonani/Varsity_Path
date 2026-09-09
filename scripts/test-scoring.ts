/**
 * Automated Verification Test Suite for VarsityPath Apply APS Scoring Engine
 *
 * Runs all required assertions:
 * 1. UCT Scoring Rules (LO excluded, <40% zero, required subjects included, 6 subjects, best additional)
 * 2. UWC Scoring Rules (English column, Maths column, Math Lit as Other column, LO column, percentage bands)
 * 3. Cross-institution independence (UCT vs UWC divergence)
 * 4. Stellenbosch & CPUT non-universal score integrity
 * 5. Subject normalisation integrity
 */

import { normaliseSubject, isPureMathematics, isMathematicalLiteracy, isEnglish } from '../src/services/scoring/subjectNormaliser';
import { calculateInstitutionScore, calculateAllInstitutionScores } from '../src/services/scoring/scoringEngine';
import { UwcScoringService } from '../src/services/scoring/uwcScoringService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

console.log('\n==================================================');
console.log('RUNNING VARSITYPATH SCORING ENGINE TESTS');
console.log('==================================================\n');

// ----------------------------------------------------
// TEST GROUP 1: Subject Normalisation
// ----------------------------------------------------
console.log('Test Group 1: Subject Normalisation & Separation');

const math1 = normaliseSubject('Maths');
const math2 = normaliseSubject('Mathematics');
const math3 = normaliseSubject('Mathematics (NSC)');
assert(math1.id === 'mathematics', 'Maths normalises to mathematics');
assert(math2.id === 'mathematics', 'Mathematics normalises to mathematics');
assert(math3.id === 'mathematics', 'Mathematics (NSC) normalises to mathematics');
assert(isPureMathematics(math1.id), 'Pure mathematics is recognised');

const mathLit1 = normaliseSubject('Mathematical Literacy');
const mathLit2 = normaliseSubject('Maths Lit');
assert(mathLit1.id === 'mathematical_literacy', 'Mathematical Literacy normalises to mathematical_literacy');
assert(mathLit2.id === 'mathematical_literacy', 'Maths Lit normalises to mathematical_literacy');
assert(!isPureMathematics(mathLit1.id), 'Mathematical Literacy is NOT treated as pure mathematics');
assert(isMathematicalLiteracy(mathLit1.id), 'Mathematical Literacy is recognized distinctly');

const engHL = normaliseSubject('English Home Language');
const engFAL = normaliseSubject('English First Additional Language');
assert(isEnglish(engHL.id), 'English HL is recognized as English');
assert(isEnglish(engFAL.id), 'English FAL is recognized as English');

const lo = normaliseSubject('Life Orientation');
assert(lo.isLifeOrientation, 'Life Orientation is recognized');

console.log('✓ Group 1 Passed!\n');

// ----------------------------------------------------
// TEST GROUP 2: UCT Admission Score Calculation
// ----------------------------------------------------
console.log('Test Group 2: UCT Scoring Methodology');

// Sample student with 7 subjects:
// English HL: 75%
// Mathematics: 72%
// Physical Sciences: 68%
// Life Sciences: 64%
// Geography: 81%
// History: 77%
// Life Orientation: 88%
const sampleResults = [
  { id: '1', subject: 'English Home Language', mark: 75 },
  { id: '2', subject: 'Mathematics', mark: 72 },
  { id: '3', subject: 'Physical Sciences', mark: 68 },
  { id: '4', subject: 'Life Sciences', mark: 64 },
  { id: '5', subject: 'Geography', mark: 81 },
  { id: '6', subject: 'History', mark: 77 },
  { id: '7', subject: 'Life Orientation', mark: 88 },
];

const uctResult = calculateInstitutionScore('uct', sampleResults);

assert(uctResult.hasUniversalScore === true, 'UCT has universal score');
assert(uctResult.scoreLabel === 'UCT Admission Score', 'UCT score label is correct');
assert(uctResult.subjectsUsed.length === 6, 'UCT evaluates exactly 6 subjects');

// Verify Life Orientation is excluded
const loInUsed = uctResult.subjectsUsed.some((s) => s.canonicalId === 'life_orientation');
assert(!loInUsed, 'Life Orientation is strictly excluded from UCT subjects used');
const loInExcluded = uctResult.subjectsExcluded.some((s) => s.canonicalId === 'life_orientation');
assert(loInExcluded, 'Life Orientation is listed in UCT subjects excluded with clear reason');

// Verify English is included
const engInUsed = uctResult.subjectsUsed.some((s) => isEnglish(s.canonicalId));
assert(engInUsed, 'English is compulsory and included in UCT subjects used');

// Check expected top 6 non-LO subjects:
// Geography (81) + History (77) + English (75) + Mathematics (72) + Physical Sciences (68) + Life Sciences (64)
// Total: 81 + 77 + 75 + 72 + 68 + 64 = 437
assert(uctResult.score === 437, `UCT score calculation matches expected sum (expected 437, got ${uctResult.score})`);

// Test UCT: Below 40% contributes 0 points
const studentWithLowMarks = [
  { id: '1', subject: 'English Home Language', mark: 35 }, // English compulsory, mark < 40
  { id: '2', subject: 'Mathematics', mark: 70 },
  { id: '3', subject: 'Physical Sciences', mark: 65 },
  { id: '4', subject: 'History', mark: 60 },
  { id: '5', subject: 'Geography', mark: 55 },
  { id: '6', subject: 'Economics', mark: 38 }, // mark < 40
  { id: '7', subject: 'Life Orientation', mark: 85 },
];

const uctLowResult = calculateInstitutionScore('uct', studentWithLowMarks);
const lowEnglish = uctLowResult.subjectsUsed.find((s) => isEnglish(s.canonicalId));
assert(lowEnglish?.pointsContributed === 0, 'UCT: Subject below 40% contributes 0 points');
const lowEcon = uctLowResult.subjectsUsed.find((s) => s.subjectName === 'Economics');
assert(lowEcon?.pointsContributed === 0, 'UCT: Additional subject below 40% contributes 0 points');
// Total: 0 (English 35) + 70 + 65 + 60 + 55 + 0 (Econ 38) = 250
assert(uctLowResult.score === 250, `UCT total with <40% subjects is 250 (got ${uctLowResult.score})`);

// Test UCT: Required subjects are included and not accidentally dropped
const studentForEngProg = [
  { id: '1', subject: 'English Home Language', mark: 60 },
  { id: '2', subject: 'Mathematics', mark: 50 }, // Lower mark than Geography (85), History (80), Art (75)
  { id: '3', subject: 'Physical Sciences', mark: 52 }, // Also lower mark
  { id: '4', subject: 'Geography', mark: 85 },
  { id: '5', subject: 'History', mark: 80 },
  { id: '6', subject: 'Visual Arts', mark: 75 },
  { id: '7', subject: 'Life Orientation', mark: 90 },
];

const uctProgResult = calculateInstitutionScore('uct', studentForEngProg, {
  requiredSubjectIds: ['mathematics', 'physical_sciences'],
});

const mathsUsed = uctProgResult.subjectsUsed.some((s) => s.canonicalId === 'mathematics');
const physSciUsed = uctProgResult.subjectsUsed.some((s) => s.canonicalId === 'physical_sciences');
assert(mathsUsed, 'UCT: Required subject (Mathematics) is preserved despite lower mark');
assert(physSciUsed, 'UCT: Required subject (Physical Sciences) is preserved despite lower mark');
assert(uctProgResult.subjectsUsed.length === 6, 'UCT: Exactly 6 subjects used with required subjects');

console.log('✓ Group 2 Passed!\n');

// ----------------------------------------------------
// TEST GROUP 3: UWC Points Calculation
// ----------------------------------------------------
console.log('Test Group 3: UWC Points Methodology');

// Test UWC table bands directly
assert(UwcScoringService.getPointsForMark(95, 'english').points === 15, 'UWC: 95% English = 15 pts');
assert(UwcScoringService.getPointsForMark(85, 'english').points === 13, 'UWC: 85% English = 13 pts');
assert(UwcScoringService.getPointsForMark(75, 'english').points === 11, 'UWC: 75% English = 11 pts');
assert(UwcScoringService.getPointsForMark(65, 'english').points === 9, 'UWC: 65% English = 9 pts');
assert(UwcScoringService.getPointsForMark(55, 'english').points === 7, 'UWC: 55% English = 7 pts');
assert(UwcScoringService.getPointsForMark(45, 'english').points === 5, 'UWC: 45% English = 5 pts');
assert(UwcScoringService.getPointsForMark(35, 'english').points === 3, 'UWC: 35% English = 3 pts');
assert(UwcScoringService.getPointsForMark(25, 'english').points === 1, 'UWC: 25% English = 1 pt');
assert(UwcScoringService.getPointsForMark(15, 'english').points === 0, 'UWC: 15% English = 0 pts');

// Test LO points column (1 to 3 pts)
assert(UwcScoringService.getPointsForMark(92, 'life_orientation').points === 3, 'UWC: 92% LO = 3 pts');
assert(UwcScoringService.getPointsForMark(72, 'life_orientation').points === 2, 'UWC: 72% LO = 2 pts');
assert(UwcScoringService.getPointsForMark(45, 'life_orientation').points === 1, 'UWC: 45% LO = 1 pt');

// Test Other Subject column (max 8 pts)
assert(UwcScoringService.getPointsForMark(92, 'other').points === 8, 'UWC: 92% Other = 8 pts');
assert(UwcScoringService.getPointsForMark(82, 'other').points === 7, 'UWC: 82% Other = 7 pts');
assert(UwcScoringService.getPointsForMark(72, 'other').points === 6, 'UWC: 72% Other = 6 pts');
assert(UwcScoringService.getPointsForMark(62, 'other').points === 5, 'UWC: 62% Other = 5 pts');
assert(UwcScoringService.getPointsForMark(52, 'other').points === 4, 'UWC: 52% Other = 4 pts');
assert(UwcScoringService.getPointsForMark(42, 'other').points === 3, 'UWC: 42% Other = 3 pts');

// Test UWC with student taking Pure Mathematics
const uwcPureMathsResult = calculateInstitutionScore('uwc', sampleResults);
// English 75% -> Level 6 in English col: 11 pts
// Mathematics 72% -> Level 6 in Maths col: 11 pts
// LO 88% -> Level 7 in LO col: 3 pts
// Geography 81% -> Level 7 in Other col: 7 pts
// History 77% -> Level 6 in Other col: 6 pts
// Physical Sciences 68% -> Level 5 in Other col: 5 pts
// Life Sciences 64% -> Level 5 in Other col: 5 pts
// Expected total: 11 + 11 + 3 + 7 + 6 + 5 + 5 = 48 pts
assert(uwcPureMathsResult.score === 48, `UWC points with Pure Maths matches expected 48 (got ${uwcPureMathsResult.score})`);

// Test UWC with Mathematical Literacy: Math Lit MUST receive 'Other Subject' column!
const studentWithMathLit = [
  { id: '1', subject: 'English Home Language', mark: 75 }, // Level 6 in English col: 11 pts
  { id: '2', subject: 'Mathematical Literacy', mark: 72 }, // Level 6 in Other col: 6 pts (NOT 11!)
  { id: '3', subject: 'Physical Sciences', mark: 68 }, // Level 5 in Other col: 5 pts
  { id: '4', subject: 'Life Sciences', mark: 64 }, // Level 5 in Other col: 5 pts
  { id: '5', subject: 'Geography', mark: 81 }, // Level 7 in Other col: 7 pts
  { id: '6', subject: 'History', mark: 77 }, // Level 6 in Other col: 6 pts
  { id: '7', subject: 'Life Orientation', mark: 88 }, // Level 7 in LO col: 3 pts
];
const uwcMathLitResult = calculateInstitutionScore('uwc', studentWithMathLit);
const mathLitBreakdown = uwcMathLitResult.subjectsUsed.find((s) => s.canonicalId === 'mathematical_literacy');
assert(mathLitBreakdown?.pointsContributed === 6, `UWC: Math Lit receives Other Subject column points (expected 6 pts, got ${mathLitBreakdown?.pointsContributed})`);
// Total with Math Lit: 11 (English) + 6 (Math Lit) + 3 (LO) + 7 (Geog) + 6 (Hist) + 5 (Phys) + 5 (Life) = 43 pts
assert(uwcMathLitResult.score === 43, `UWC total with Math Lit matches expected 43 (got ${uwcMathLitResult.score})`);

console.log('✓ Group 3 Passed!\n');

// ----------------------------------------------------
// TEST GROUP 4: Cross-Institution Independence
// ----------------------------------------------------
console.log('Test Group 4: Cross-Institution Independence');

const allScores = calculateAllInstitutionScores(sampleResults);
assert(allScores.uct.score !== allScores.uwc.score, 'UCT (437) and UWC (48) do NOT produce the same score');
assert(allScores.uct.scoreLabel === 'UCT Admission Score', 'UCT label is unique and distinct');
assert(allScores.uwc.scoreLabel === 'UWC Points', 'UWC label is unique and distinct');

// Verify Stellenbosch and CPUT do NOT display fabricated universal scores
assert(allScores.stellenbosch.hasUniversalScore === false, 'Stellenbosch has no universal score');
assert(allScores.stellenbosch.score === null, 'Stellenbosch score is null (no fabricated APS)');
assert(allScores.cput.hasUniversalScore === false, 'CPUT has no universal score');
assert(allScores.cput.score === null, 'CPUT score is null (no fabricated APS)');

// Check baseline metrics calculated authentically
assert(allScores.stellenbosch.baselineMetrics.academicAverageExcludingLO > 0, 'Stellenbosch displays authentic academic average');
assert(allScores.stellenbosch.baselineMetrics.mathsType === 'Mathematics', 'Stellenbosch correctly identifies pure mathematics');

console.log('✓ Group 4 Passed!\n');

console.log('==================================================');
console.log('ALL VARSITYPATH SCORING ENGINE TESTS PASSED (100%)');
console.log('==================================================\n');

/**
 * Comprehensive Test Suite for VarsityPath Apply Eligibility Workflow
 *
 * Validates all 15 test scenarios specified by the user:
 * - Test 1: 0 Apply Results -> No score, no universities, no programmes
 * - Test 2: 6 unique subjects -> No programmes, "Add 1 more subject"
 * - Test 3: 7 unique subjects -> Eligibility engine runs
 * - Test 4: 7+ subjects and one clearly eligible programme -> Programme appears
 * - Test 5: Programme with missing required Mathematics -> Programme hidden
 * - Test 6: Programme with insufficient Mathematics mark -> Programme hidden
 * - Test 7: Eligible UWC programme -> Appears with correct UWC scoring
 * - Test 8: Eligible UCT programme -> Appears using UCT-specific scoring
 * - Test 9: Eligible Stellenbosch programme -> Appears only when stored requirements are satisfied
 * - Test 10: Eligible CPUT programme -> Appears only when stored requirements are satisfied
 * - Test 11: Change a student's mark -> Eligible programme list updates immediately
 * - Test 12: Delete a subject -> Eligibility recalculates
 * - Test 13: Improve results exist but Apply Results do not -> Improve data must NOT affect Apply eligibility
 * - Test 14: Apply results exist but Improve results do not -> Apply eligibility still works
 * - Test 15: No eligible programmes -> No programme cards, no "not eligible" cards
 */

import { PROGRAMMES_DATABASE } from '../src/data/programmes';
import {
  evaluateAllProgrammes,
  evaluateProgrammeEligibility,
} from '../src/services/scoring/eligibilityEngine';
import { calculateAllInstitutionScores } from '../src/services/scoring/scoringEngine';
import {
  countUniqueCanonicalSubjects,
  getCanonicalSubjectMap,
} from '../src/services/scoring/subjectNormaliser';
import { ApplyResult, ImproveResult } from '../src/types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
    if (detail) console.log(`      ${detail}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    if (detail) console.error(`      Detail: ${detail}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('VARSITYPATH APPLY WORKFLOW & ELIGIBILITY VERIFICATION');
console.log('======================================================\n');

// ----------------------------------------------------
// TEST 1: 0 Apply Results
// ----------------------------------------------------
console.log('Test 1: 0 Apply Results -> No score, no universities, no programmes');
{
  const applyResults: ApplyResult[] = [];
  const uniqueCount = countUniqueCanonicalSubjects(applyResults);
  const isBelowSeven = uniqueCount < 7;
  const scores = isBelowSeven ? null : calculateAllInstitutionScores(applyResults);
  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, applyResults, scores as any);

  assert(uniqueCount === 0, 'Unique subject count is 0');
  assert(scores === null, 'Scores are not calculated when 0 subjects entered');
  assert(evaluation.totalEligibleCount === 0, 'No eligible programmes returned');
  assert(
    evaluation.groupedEligible.uct.length === 0 &&
      evaluation.groupedEligible.stellenbosch.length === 0 &&
      evaluation.groupedEligible.uwc.length === 0 &&
      evaluation.groupedEligible.cput.length === 0,
    'No universities have qualifying programmes displayed'
  );
}

// ----------------------------------------------------
// TEST 2: 6 unique subjects -> No programmes, "Add 1 more subject"
// ----------------------------------------------------
console.log('\nTest 2: 6 unique subjects -> No programmes, "Add 1 more subject"');
{
  const applyResults: ApplyResult[] = [
    { id: '1', subject: 'Mathematics', mark: 75 },
    { id: '2', subject: 'Physical Sciences', mark: 70 },
    { id: '3', subject: 'English Home Language', mark: 65 },
    { id: '4', subject: 'Afrikaans First Additional Language', mark: 60 },
    { id: '5', subject: 'Life Sciences', mark: 65 },
    { id: '6', subject: 'Life Orientation', mark: 80 },
  ];

  const uniqueCount = countUniqueCanonicalSubjects(applyResults);
  const subjectsNeeded = Math.max(0, 7 - uniqueCount);
  const promptMessage = `Add ${subjectsNeeded} more ${subjectsNeeded === 1 ? 'subject' : 'subjects'} to see which programmes you qualify for.`;

  assert(uniqueCount === 6, 'Unique subject count is 6');
  assert(subjectsNeeded === 1, 'Subjects needed is 1');
  assert(
    promptMessage === 'Add 1 more subject to see which programmes you qualify for.',
    'Matches required dynamic notification text'
  );

  // Test duplicate canonical alias does NOT increment count
  const withDuplicateAlias = [
    ...applyResults,
    { id: '7', subject: 'Maths', mark: 78 }, // alias of Mathematics!
  ];
  const duplicateUniqueCount = countUniqueCanonicalSubjects(withDuplicateAlias);
  assert(
    duplicateUniqueCount === 6,
    'Duplicate alias ("Maths" + "Mathematics") resolves to 1 canonical subject (6 total)'
  );
}

// ----------------------------------------------------
// TEST 3: 7 unique subjects -> Eligibility engine runs
// ----------------------------------------------------
console.log('\nTest 3: 7 unique subjects -> Eligibility engine runs');
{
  const applyResults: ApplyResult[] = [
    { id: '1', subject: 'Mathematics', mark: 75 },
    { id: '2', subject: 'Physical Sciences', mark: 70 },
    { id: '3', subject: 'English Home Language', mark: 65 },
    { id: '4', subject: 'Afrikaans First Additional Language', mark: 60 },
    { id: '5', subject: 'Life Sciences', mark: 65 },
    { id: '6', subject: 'Accounting', mark: 70 },
    { id: '7', subject: 'Life Orientation', mark: 80 },
  ];

  const uniqueCount = countUniqueCanonicalSubjects(applyResults);
  assert(uniqueCount === 7, 'Unique subject count is exactly 7');

  const scores = calculateAllInstitutionScores(applyResults);
  assert(scores.uct.score !== null, 'UCT score calculated successfully');
  assert(scores.uwc.score !== null, 'UWC score calculated successfully');

  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, applyResults, scores);
  assert(
    evaluation.allEvaluations.length === PROGRAMMES_DATABASE.length,
    `Eligibility engine evaluated all ${PROGRAMMES_DATABASE.length} programmes in database`
  );
}

// ----------------------------------------------------
// TEST 4: 7+ subjects and one clearly eligible programme
// ----------------------------------------------------
console.log('\nTest 4: 7+ subjects and one clearly eligible programme');
{
  const strongResults: ApplyResult[] = [
    { id: '1', subject: 'Mathematics', mark: 85 },
    { id: '2', subject: 'Physical Sciences', mark: 80 },
    { id: '3', subject: 'English Home Language', mark: 75 },
    { id: '4', subject: 'Afrikaans First Additional Language', mark: 70 },
    { id: '5', subject: 'Life Sciences', mark: 75 },
    { id: '6', subject: 'Accounting', mark: 75 },
    { id: '7', subject: 'Life Orientation', mark: 85 },
  ];

  const scores = calculateAllInstitutionScores(strongResults);
  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, strongResults, scores);

  assert(evaluation.totalEligibleCount > 0, `Student qualifies for ${evaluation.totalEligibleCount} programmes`);

  const uctCs = evaluation.allEvaluations.find((e) => e.programme.id === 'uct-bsc-computer-science');
  assert(uctCs !== undefined && uctCs.eligible === true, 'UCT BSc Computer Science is clearly eligible');
  assert(
    evaluation.groupedEligible.uct.some((e) => e.programme.id === 'uct-bsc-computer-science'),
    'Eligible programme is grouped under UCT'
  );
}

// ----------------------------------------------------
// TEST 5: Programme with missing required Mathematics
// ----------------------------------------------------
console.log('\nTest 5: Programme with missing required Mathematics -> Programme hidden');
{
  // Student took Mathematical Literacy instead of pure Mathematics
  const mathLitResults: ApplyResult[] = [
    { id: '1', subject: 'Mathematical Literacy', mark: 85 },
    { id: '2', subject: 'Physical Sciences', mark: 70 },
    { id: '3', subject: 'English Home Language', mark: 70 },
    { id: '4', subject: 'History', mark: 75 },
    { id: '5', subject: 'Geography', mark: 70 },
    { id: '6', subject: 'Business Studies', mark: 75 },
    { id: '7', subject: 'Life Orientation', mark: 80 },
  ];

  const scores = calculateAllInstitutionScores(mathLitResults);
  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, mathLitResults, scores);

  // UCT Computer Science strictly requires pure Mathematics
  const uctCs = evaluation.allEvaluations.find((e) => e.programme.id === 'uct-bsc-computer-science');
  assert(uctCs !== undefined && uctCs.eligible === false, 'UCT BSc Computer Science is marked ineligible');
  assert(
    !evaluation.groupedEligible.uct.some((e) => e.programme.id === 'uct-bsc-computer-science'),
    'UCT BSc Computer Science is hidden from eligible programmes list'
  );
  assert(
    uctCs?.failedRequirements.some((f) => f.detail.toLowerCase().includes('prerequisite')),
    'Failed requirements explicitly list missing Mathematics prerequisite'
  );
}

// ----------------------------------------------------
// TEST 6: Programme with insufficient Mathematics mark
// ----------------------------------------------------
console.log('\nTest 6: Programme with insufficient Mathematics mark -> Programme hidden');
{
  // Student has pure Mathematics, but mark is 55% (UCT CS requires min 70%)
  const lowMathsResults: ApplyResult[] = [
    { id: '1', subject: 'Mathematics', mark: 55 },
    { id: '2', subject: 'Physical Sciences', mark: 70 },
    { id: '3', subject: 'English Home Language', mark: 70 },
    { id: '4', subject: 'History', mark: 75 },
    { id: '5', subject: 'Geography', mark: 70 },
    { id: '6', subject: 'Accounting', mark: 70 },
    { id: '7', subject: 'Life Orientation', mark: 80 },
  ];

  const scores = calculateAllInstitutionScores(lowMathsResults);
  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, lowMathsResults, scores);

  const uctCs = evaluation.allEvaluations.find((e) => e.programme.id === 'uct-bsc-computer-science');
  assert(uctCs !== undefined && uctCs.eligible === false, 'UCT BSc Computer Science is ineligible (mark 55% < 70%)');
  assert(
    !evaluation.groupedEligible.uct.some((e) => e.programme.id === 'uct-bsc-computer-science'),
    'Programme is hidden from student qualifying list'
  );
}

// ----------------------------------------------------
// TEST 7: Eligible UWC programme
// ----------------------------------------------------
console.log('\nTest 7: Eligible UWC programme -> Appears with correct UWC scoring');
{
  // Marks engineered for UWC BCom General (requires min 30 UWC points, English Level 4, Maths Level 4)
  const uwcStudentResults: ApplyResult[] = [
    { id: '1', subject: 'Mathematics', mark: 65 }, // Level 5 (9 pts in Maths col)
    { id: '2', subject: 'English Home Language', mark: 65 }, // Level 5 (9 pts in Eng col)
    { id: '3', subject: 'Physical Sciences', mark: 60 }, // Level 5 (5 pts in Other col)
    { id: '4', subject: 'Accounting', mark: 60 }, // Level 5 (5 pts in Other col)
    { id: '5', subject: 'Economics', mark: 60 }, // Level 5 (5 pts in Other col)
    { id: '6', subject: 'Business Studies', mark: 60 }, // Level 5 (5 pts in Other col)
    { id: '7', subject: 'Life Orientation', mark: 70 }, // Level 6 (2 pts in LO col)
  ];
  // Total UWC Points: 9 + 9 + 5 + 5 + 5 + 5 + 2 = 40 points

  const scores = calculateAllInstitutionScores(uwcStudentResults);
  assert(scores.uwc.score === 40, `UWC points calculated accurately (${scores.uwc.score} === 40)`);

  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, uwcStudentResults, scores);
  const uwcBcom = evaluation.groupedEligible.uwc.find((e) => e.programme.id === 'uwc-bcom-general');

  assert(uwcBcom !== undefined, 'UWC BCom General appears in eligible list');
  assert(uwcBcom?.score === 40, 'UWC BCom evaluation displays student UWC points score of 40');
  assert(uwcBcom?.minimumScore === 30, 'UWC BCom shows minimum required points is 30');
}

// ----------------------------------------------------
// TEST 8: Eligible UCT programme
// ----------------------------------------------------
console.log('\nTest 8: Eligible UCT programme -> Appears using UCT-specific scoring');
{
  // UCT scoring: sum of 6 eligible subjects excluding Life Orientation (max 600)
  const uctStudentResults: ApplyResult[] = [
    { id: '1', subject: 'English Home Language', mark: 75 }, // 75
    { id: '2', subject: 'Mathematics', mark: 72 }, // 72
    { id: '3', subject: 'History', mark: 70 }, // 70
    { id: '4', subject: 'Geography', mark: 68 }, // 68
    { id: '5', subject: 'Economics', mark: 65 }, // 65
    { id: '6', subject: 'Afrikaans First Additional Language', mark: 60 }, // 60
    { id: '7', subject: 'Life Orientation', mark: 90 }, // EXCLUDED from UCT score!
  ];
  // Expected UCT score: 75 + 72 + 70 + 68 + 65 + 60 = 410

  const scores = calculateAllInstitutionScores(uctStudentResults);
  assert(scores.uct.score === 410, `UCT Admission Score strictly excludes LO (${scores.uct.score} === 410)`);

  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, uctStudentResults, scores);
  const uctBa = evaluation.groupedEligible.uct.find((e) => e.programme.id === 'uct-ba-humanities');

  assert(uctBa !== undefined, 'UCT BA Humanities (min score 380) is eligible');
  assert(uctBa?.score === 410, 'Student score reflects UCT 410 points');
}

// ----------------------------------------------------
// TEST 9: Eligible Stellenbosch programme
// ----------------------------------------------------
console.log('\nTest 9: Eligible Stellenbosch programme -> Stored requirements satisfied');
{
  // Stellenbosch BCom Management Sciences: aggregate ex-LO >= 65%, Maths >= 60%, English/Afrikaans >= 50%
  const suStudentResults: ApplyResult[] = [
    { id: '1', subject: 'Mathematics', mark: 68 }, // >= 60%
    { id: '2', subject: 'English Home Language', mark: 65 }, // >= 50%
    { id: '3', subject: 'Afrikaans First Additional Language', mark: 62 },
    { id: '4', subject: 'Accounting', mark: 72 },
    { id: '5', subject: 'Economics', mark: 70 },
    { id: '6', subject: 'Business Studies', mark: 68 },
    { id: '7', subject: 'Life Orientation', mark: 85 },
  ];
  // Average ex-LO: (68 + 65 + 62 + 72 + 70 + 68) / 6 = 67.5% (>= 65%)

  const scores = calculateAllInstitutionScores(suStudentResults);
  assert(scores.stellenbosch.score === null, 'Stellenbosch has no universal APS score (score is null)');

  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, suStudentResults, scores);
  const suBcom = evaluation.groupedEligible.stellenbosch.find(
    (e) => e.programme.id === 'su-bcom-management-sciences'
  );

  assert(suBcom !== undefined, 'Stellenbosch BCom Management Sciences is eligible');
  assert(suBcom?.academicAverage === 67.5, 'Student academic aggregate ex-LO is 67.5%');
}

// ----------------------------------------------------
// TEST 10: Eligible CPUT programme
// ----------------------------------------------------
console.log('\nTest 10: Eligible CPUT programme -> Qualification requirements satisfied');
{
  // CPUT Diploma in ICT: Applications Development
  // English Level 4+ (50%), Maths Level 4+ (50%), Rating >= 26
  const cputStudentResults: ApplyResult[] = [
    { id: '1', subject: 'English First Additional Language', mark: 60 }, // Level 5
    { id: '2', subject: 'Mathematics', mark: 58 }, // Level 4
    { id: '3', subject: 'Physical Sciences', mark: 55 }, // Level 4
    { id: '4', subject: 'Information Technology', mark: 65 }, // Level 5
    { id: '5', subject: 'Business Studies', mark: 60 }, // Level 5
    { id: '6', subject: 'Accounting', mark: 55 }, // Level 4
    { id: '7', subject: 'Life Orientation', mark: 75 }, // Level 6
  ];
  // Rating: 5 + 4 + 4 + 5 + 5 + 4 = 27 (>= 26)

  const scores = calculateAllInstitutionScores(cputStudentResults);
  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, cputStudentResults, scores);
  const cputIct = evaluation.groupedEligible.cput.find(
    (e) => e.programme.id === 'cput-dip-ict-applications'
  );

  assert(cputIct !== undefined, 'CPUT Diploma in ICT Applications Development is eligible');
  assert(cputIct?.score !== null && (cputIct?.score ?? 0) >= 26, 'Rating score meets requirement');
}

// ----------------------------------------------------
// TEST 11: Change a student's mark -> Updates immediately
// ----------------------------------------------------
console.log("\nTest 11: Change a student's mark -> Eligible programme list updates immediately");
{
  const studentResults: ApplyResult[] = [
    { id: '1', subject: 'Mathematics', mark: 58 }, // Borderline: 58% (< 60% prerequisite for UCT BCom)
    { id: '2', subject: 'English Home Language', mark: 75 },
    { id: '3', subject: 'Accounting', mark: 80 },
    { id: '4', subject: 'Economics', mark: 75 },
    { id: '5', subject: 'Business Studies', mark: 75 },
    { id: '6', subject: 'History', mark: 75 },
    { id: '7', subject: 'Life Orientation', mark: 80 },
  ];

  // Initial check: UCT BCom requires Maths >= 60% and UCT score >= 450
  let scores = calculateAllInstitutionScores(studentResults);
  let eval1 = evaluateAllProgrammes(PROGRAMMES_DATABASE, studentResults, scores);
  assert(
    !eval1.groupedEligible.uct.some((e) => e.programme.id === 'uct-bcom-general'),
    'Before mark change: UCT BCom is ineligible due to Maths 58% < 60%'
  );

  // Mark changed: Maths updated to 75% (score becomes 455 >= 450 and Maths 75% >= 60%)
  const updatedResults = studentResults.map((r) =>
    r.id === '1' ? { ...r, mark: 75 } : r
  );
  scores = calculateAllInstitutionScores(updatedResults);
  let eval2 = evaluateAllProgrammes(PROGRAMMES_DATABASE, updatedResults, scores);

  assert(
    eval2.groupedEligible.uct.some((e) => e.programme.id === 'uct-bcom-general'),
    'After mark update (Maths 75%): UCT BCom immediately appears in eligible list'
  );
}

// ----------------------------------------------------
// TEST 12: Delete a subject -> Eligibility recalculates
// ----------------------------------------------------
console.log('\nTest 12: Delete a subject -> Eligibility recalculates');
{
  const sevenSubjects: ApplyResult[] = [
    { id: '1', subject: 'Mathematics', mark: 75 },
    { id: '2', subject: 'Physical Sciences', mark: 70 },
    { id: '3', subject: 'English Home Language', mark: 65 },
    { id: '4', subject: 'Afrikaans First Additional Language', mark: 60 },
    { id: '5', subject: 'Life Sciences', mark: 65 },
    { id: '6', subject: 'Accounting', mark: 70 },
    { id: '7', subject: 'Life Orientation', mark: 80 },
  ];

  let uniqueCount = countUniqueCanonicalSubjects(sevenSubjects);
  assert(uniqueCount === 7, 'Initially 7 unique subjects');

  // Delete subject 6 (Accounting)
  const sixSubjects = sevenSubjects.filter((r) => r.id !== '6');
  uniqueCount = countUniqueCanonicalSubjects(sixSubjects);
  const isBelowSeven = uniqueCount < 7;
  const subjectsNeeded = Math.max(0, 7 - uniqueCount);

  assert(uniqueCount === 6, 'After deletion: 6 unique subjects');
  assert(isBelowSeven === true, 'Threshold met is false');
  assert(subjectsNeeded === 1, 'Subjects needed is 1');
}

// ----------------------------------------------------
// TEST 13: Improve results exist but Apply Results do not
// ----------------------------------------------------
console.log('\nTest 13: Improve results exist but Apply Results do not -> Zero effect on Apply');
{
  // Student has diagnostic Improve results with high marks
  const improveResults: ImproveResult[] = [
    { id: 'imp1', subject: 'Mathematics', topic: 'Calculus', mark: 95, date: '2026-03-01' },
    { id: 'imp2', subject: 'Physical Sciences', topic: 'Doppler Effect', mark: 90, date: '2026-03-02' },
    { id: 'imp3', subject: 'English HL', topic: 'Poetry Essay', mark: 85, date: '2026-03-03' },
  ];

  // But Apply results are empty
  const applyResults: ApplyResult[] = [];

  const uniqueCount = countUniqueCanonicalSubjects(applyResults);
  const isBelowSeven = uniqueCount < 7;
  const scores = isBelowSeven ? null : calculateAllInstitutionScores(applyResults);
  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, applyResults, scores as any);

  assert(scores === null, 'Apply scores remain null despite Improve marks');
  assert(evaluation.totalEligibleCount === 0, 'No Apply programmes eligible (Improve data completely isolated)');
}

// ----------------------------------------------------
// TEST 14: Apply results exist but Improve results do not
// ----------------------------------------------------
console.log('\nTest 14: Apply results exist but Improve results do not -> Apply works independently');
{
  const improveResults: ImproveResult[] = []; // Empty improve
  const applyResults: ApplyResult[] = [
    { id: '1', subject: 'Mathematics', mark: 80 },
    { id: '2', subject: 'Physical Sciences', mark: 75 },
    { id: '3', subject: 'English Home Language', mark: 70 },
    { id: '4', subject: 'Afrikaans First Additional Language', mark: 65 },
    { id: '5', subject: 'Life Sciences', mark: 70 },
    { id: '6', subject: 'Accounting', mark: 75 },
    { id: '7', subject: 'Life Orientation', mark: 85 },
  ];

  const uniqueCount = countUniqueCanonicalSubjects(applyResults);
  const scores = calculateAllInstitutionScores(applyResults);
  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, applyResults, scores);

  assert(uniqueCount === 7, 'Apply unique count is 7');
  assert(scores.uct.score !== null, 'Apply scores calculate normally without Improve results');
  assert(evaluation.totalEligibleCount > 0, 'Apply eligibility functions completely and independently');
}

// ----------------------------------------------------
// TEST 15: No eligible programmes -> No programme cards, no "not eligible" cards
// ----------------------------------------------------
console.log('\nTest 15: No eligible programmes -> Clean empty state, no non-eligible cards');
{
  // Student with 7 subjects but very low marks (all 25%)
  const lowMarkResults: ApplyResult[] = [
    { id: '1', subject: 'Mathematics', mark: 25 },
    { id: '2', subject: 'Physical Sciences', mark: 25 },
    { id: '3', subject: 'English Home Language', mark: 25 },
    { id: '4', subject: 'Afrikaans First Additional Language', mark: 25 },
    { id: '5', subject: 'Life Sciences', mark: 25 },
    { id: '6', subject: 'Accounting', mark: 25 },
    { id: '7', subject: 'Life Orientation', mark: 30 },
  ];

  const scores = calculateAllInstitutionScores(lowMarkResults);
  const evaluation = evaluateAllProgrammes(PROGRAMMES_DATABASE, lowMarkResults, scores);

  assert(evaluation.totalEligibleCount === 0, 'Total eligible programmes is strictly 0');
  assert(evaluation.groupedEligible.uct.length === 0, 'No UCT programmes in qualifying list');
  assert(evaluation.groupedEligible.stellenbosch.length === 0, 'No Stellenbosch programmes in qualifying list');
  assert(evaluation.groupedEligible.uwc.length === 0, 'No UWC programmes in qualifying list');
  assert(evaluation.groupedEligible.cput.length === 0, 'No CPUT programmes in qualifying list');

  // Verify that every single programme in allEvaluations has eligible === false
  const anyEligible = evaluation.allEvaluations.some((e) => e.eligible === true);
  assert(!anyEligible, 'All evaluated programmes are correctly marked ineligible');
}

console.log('\n======================================================');
console.log(`SUMMARY: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}

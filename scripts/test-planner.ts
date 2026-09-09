import { PriorityService } from '../src/services/planner/priorityService';
import { GoalService } from '../src/services/planner/goalService';
import { TaskService } from '../src/services/planner/taskService';
import { StudyPlannerService } from '../src/services/planner/studyPlannerService';
import { ImproveResult, StudentGoal, StudyTask } from '../src/types';

function runTests() {
  console.log('--- STARTING SMART STUDY PLANNER TESTS ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test Priority Evaluation (Section 5)
  console.log('1. Priority Service Evaluation:');
  const p35 = PriorityService.evaluateMarkPriority(35);
  assert(p35.priority === 'high' && p35.isUrgentRemediation, '0–39% produces High priority urgent remediation');
  assert(p35.recommendedMinutes >= 60, '0–39% recommends at least 60 minutes');

  const p45 = PriorityService.evaluateMarkPriority(45);
  assert(p45.priority === 'high' && p45.isUrgentRemediation, '40–49% produces High priority');

  const p62 = PriorityService.evaluateMarkPriority(62);
  assert(p62.priority === 'medium', '50–69% produces Medium priority');

  const p82 = PriorityService.evaluateMarkPriority(82);
  assert(p82.priority === 'medium', '70–89% produces Medium priority consolidation');

  const p95 = PriorityService.evaluateMarkPriority(95);
  assert(p95.priority === 'low', '90–100% produces Low priority enrichment');

  // 2. Test Goal Service Validation (Section 7)
  console.log('\n2. Goal Service Validation:');
  const valEmpty = GoalService.validateGoalInput('', 'Mathematics', 40, 60);
  assert(!valEmpty.valid, 'Fails on empty title');

  const valTargetLower = GoalService.validateGoalInput('Improve Math', 'Mathematics', 65, 60);
  assert(!valTargetLower.valid, 'Fails when target mark is not greater than current mark');

  const valValid = GoalService.validateGoalInput('Improve Math to 65%', 'Mathematics', 48, 65);
  assert(valValid.valid, 'Passes on valid goal input');

  // 3. Test Knowledge Gap conversion (Section 4)
  console.log('\n3. Knowledge Gap Conversion:');
  const gap = {
    id: 'gap_123',
    subject: 'Mathematics',
    topic: 'Algebra',
    mark: 42,
    notes: 'Struggles to solve simultaneous equations',
  };
  const taskFromGap = StudyPlannerService.createStudyTaskFromKnowledgeGap(gap, 'user_abc');
  assert(taskFromGap.subject === 'Mathematics', 'Task retains correct subject');
  assert(taskFromGap.topic === 'Algebra', 'Task retains correct topic');
  assert(taskFromGap.priority === 'high', 'Task for 42% mark is assigned High priority');
  assert(taskFromGap.source === 'knowledge_gap', 'Task source is knowledge_gap');
  assert(taskFromGap.sourceId === 'gap_123', 'Task sourceId matches knowledge gap ID');
  assert(taskFromGap.title.toLowerCase().includes('algebra') || taskFromGap.title.toLowerCase().includes('equation'), 'Title is specific and actionable');

  // 4. Test Goal Task Generation & Duplicate Prevention (Section 6 & 8)
  console.log('\n4. Goal Task Generation & Duplicate Prevention:');
  const sampleGoal: StudentGoal = {
    id: 'goal_math_1',
    userId: 'user_abc',
    title: 'Improve Mathematics from 48% to 65%',
    subject: 'Mathematics',
    currentMark: 48,
    targetMark: 65,
    status: 'active',
    createdAt: '2026-09-01T00:00:00Z',
  };

  const sampleResults: ImproveResult[] = [
    {
      id: 'res_1',
      subject: 'Mathematics',
      topic: 'Algebra',
      mark: 42,
      date: '2026-09-02',
    },
    {
      id: 'res_2',
      subject: 'Mathematics',
      topic: 'Calculus',
      mark: 46,
      date: '2026-09-04',
    },
    {
      id: 'res_3',
      subject: 'Mathematics',
      topic: 'Trigonometry',
      mark: 78,
      date: '2026-09-05',
    },
  ];

  const generatedTasks = GoalService.generateTasksForGoal(sampleGoal, sampleResults, []);
  assert(generatedTasks.length > 0, 'Generates tasks for weak topics below target mark');
  assert(generatedTasks.some((t) => t.topic === 'Algebra'), 'Generates task for weakest topic (Algebra at 42%)');
  assert(generatedTasks.every((t) => t.source === 'goal' && t.sourceId === sampleGoal.id), 'All tasks retain sourceId of the goal');

  // Test duplicate prevention:
  const existingTasks: StudyTask[] = [
    {
      id: 'task_existing_1',
      title: 'Master Algebra to reach 65%',
      description: 'Existing revision task',
      subject: 'Mathematics',
      topic: 'Algebra',
      priority: 'high',
      status: 'todo',
      completed: false,
      source: 'goal',
      sourceId: sampleGoal.id,
      estimatedMinutes: 45,
      createdAt: '2026-09-06T00:00:00Z',
    },
  ];
  const generatedWithExisting = GoalService.generateTasksForGoal(sampleGoal, sampleResults, existingTasks);
  assert(!generatedWithExisting.some((t) => t.topic === 'Algebra'), 'Duplicate prevention: does not recreate incomplete Algebra task');

  // 5. Test Smart Recommendations (Section 15)
  console.log('\n5. Smart Recommendations Generation:');
  const recommendations = StudyPlannerService.generateSmartRecommendations(
    sampleResults,
    [sampleGoal],
    existingTasks
  );
  assert(recommendations.length > 0, 'Generates smart recommendations from results and goals');
  // Highest priority should be first
  assert(recommendations[0].priority === 'high', 'Top recommendation is High priority');
  assert(!recommendations.some((r) => r.topic === 'Algebra'), 'Does not recommend topic already present in active tasks');

  // 6. Test Weekly Schedule & Workload Summary (Section 9, 10, 13, 14)
  console.log('\n6. Weekly Schedule & Summary:');
  const today = new Date();
  const todayStr = TaskService.formatDate(today);

  const mockWeeklyTasks: StudyTask[] = [
    {
      id: 't1',
      title: 'Calculus derivatives',
      description: 'practice',
      subject: 'Mathematics',
      priority: 'high',
      status: 'completed',
      completed: true,
      source: 'manual',
      estimatedMinutes: 45,
      dueDate: todayStr,
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 't2',
      title: 'Chemical equilibrium',
      description: 'practice',
      subject: 'Physical Sciences',
      priority: 'medium',
      status: 'todo',
      completed: false,
      source: 'result',
      estimatedMinutes: 45,
      dueDate: todayStr,
      createdAt: '2026-09-01T00:00:00Z',
    },
  ];

  const schedule = TaskService.getWeeklySchedule(mockWeeklyTasks, today);
  assert(schedule.length === 7, 'Weekly schedule contains exactly 7 days (Monday to Sunday)');

  const summary = TaskService.calculateWeeklySummary(mockWeeklyTasks, today);
  assert(summary.totalTasks === 2, 'Summary counts 2 tasks this week');
  assert(summary.completedTasks === 1, 'Summary counts 1 completed task');
  assert(summary.remainingTasks === 1, 'Summary counts 1 remaining task');
  assert(summary.completionPercentage === 50, 'Summary calculates 50% completion');
  assert(summary.completedMinutes === 45, 'Summary calculates 45 completed minutes');
  assert(summary.totalEstimatedMinutes === 90, 'Summary calculates 90 total planned minutes');
  assert(summary.topPrioritySubjectTopic?.includes('Physical Sciences'), 'Identifies top priority remaining task');

  // 7. Test Smart Rescheduling (Section 11)
  console.log('\n7. Smart Rescheduling:');
  const nextDate = TaskService.findNextAvailableDate(mockWeeklyTasks, today);
  assert(Boolean(nextDate), 'Finds balanced next date for task');

  console.log(`\n--- TEST SUMMARY: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

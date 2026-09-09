import {
  ImproveResult,
  StudentGoal,
  StudyTask,
  TaskPriority,
  TaskSource,
} from '../../types';
import { RecommendedStudyTask } from '../../types/planner';
import { PriorityService } from './priorityService';
import { TaskService } from './taskService';

export class StudyPlannerService {
  /**
   * Deterministically analyze student's real Improve results, topic performances,
   * knowledge gaps, and active goals to generate specific, actionable study recommendations.
   *
   * Crucial rule: Does NOT create duplicate tasks if an equivalent incomplete task
   * already exists in the student's study tasks.
   */
  static generateSmartRecommendations(
    results: ImproveResult[],
    goals: StudentGoal[],
    existingTasks: StudyTask[]
  ): RecommendedStudyTask[] {
    const recommendations: RecommendedStudyTask[] = [];

    // Filter active incomplete tasks to prevent duplicates
    const activeTasks = existingTasks.filter(
      (t) => t.status !== 'completed' && !t.completed
    );

    // 1. Group results by Subject & Topic to compute topic-level averages & flag gaps
    const topicAggregates = new Map<
      string,
      {
        subject: string;
        topic: string;
        marks: number[];
        latestDate: string;
        latestMark: number;
        notesList: string[];
      }
    >();

    results.forEach((r) => {
      const mark = Number(r.mark ?? r.percentage ?? 0);
      const key = `${r.subject.toLowerCase()}:::${r.topic.toLowerCase()}`;
      const existing = topicAggregates.get(key);

      if (!existing) {
        topicAggregates.set(key, {
          subject: r.subject,
          topic: r.topic,
          marks: [mark],
          latestDate: r.date,
          latestMark: mark,
          notesList: r.notes ? [r.notes] : [],
        });
      } else {
        existing.marks.push(mark);
        if (r.notes) existing.notesList.push(r.notes);
        if (new Date(r.date).getTime() >= new Date(existing.latestDate).getTime()) {
          existing.latestDate = r.date;
          existing.latestMark = mark;
        }
      }
    });

    // 2. Identify and rank specific topic recommendations
    topicAggregates.forEach((data) => {
      const avg = Math.round(
        data.marks.reduce((a, b) => a + b, 0) / data.marks.length
      );
      const markToEvaluate = data.latestMark < avg ? data.latestMark : avg;

      // Only recommend tasks for areas that need attention (<70%) or have flagged notes
      if (markToEvaluate < 70 || data.notesList.length > 0) {
        const priorityEval = PriorityService.evaluateMarkPriority(markToEvaluate);

        // Check duplicate prevention
        const alreadyInTasks = activeTasks.some((t) => {
          return (
            t.subject.toLowerCase() === data.subject.toLowerCase() &&
            t.topic?.toLowerCase() === data.topic.toLowerCase()
          );
        });

        if (!alreadyInTasks) {
          const specificAction = this.generateActionableTaskTitle(
            data.subject,
            data.topic,
            markToEvaluate
          );
          const detailedDesc = this.generateActionableDescription(
            data.subject,
            data.topic,
            markToEvaluate,
            data.notesList[0]
          );

          recommendations.push({
            id: `rec_${data.subject}_${data.topic}`.replace(/[^a-zA-Z0-9_]/g, '_'),
            title: specificAction,
            description: detailedDesc,
            subject: data.subject,
            topic: data.topic,
            priority: priorityEval.priority,
            source: data.notesList.length > 0 ? 'knowledge_gap' : 'result',
            currentMark: markToEvaluate,
            estimatedMinutes: priorityEval.recommendedMinutes,
            rationale: `Latest assessment recorded at ${markToEvaluate}%. ${
              markToEvaluate < 50
                ? 'Requires priority concept remediation and step-by-step worked solutions.'
                : 'Focus on timed practice and past exam question sets to consolidate.'
            }`,
            suggestedAction: 'Add to Planner',
          });
        }
      }
    });

    // 3. Evaluate Active Goals
    const activeGoals = goals.filter((g) => g.status === 'active' || !g.status);
    activeGoals.forEach((goal) => {
      const subjectResults = results.filter(
        (r) => r.subject.toLowerCase() === goal.subject.toLowerCase()
      );
      const currentAvg =
        subjectResults.length > 0
          ? Math.round(
              subjectResults.reduce(
                (acc, r) => acc + Number(r.mark ?? r.percentage ?? 0),
                0
              ) / subjectResults.length
            )
          : goal.currentMark;

      const priorityEval = PriorityService.evaluateGoalGapPriority(
        currentAvg,
        goal.targetMark
      );

      // Check if a task linked to this goal or covering this goal already exists
      const alreadyInTasks = activeTasks.some(
        (t) =>
          (t.source === 'goal' && t.sourceId === goal.id) ||
          (t.subject.toLowerCase() === goal.subject.toLowerCase() &&
            t.title.toLowerCase().includes('target'))
      );

      if (!alreadyInTasks) {
        recommendations.push({
          id: `rec_goal_${goal.id}`,
          title: `Milestone drill for ${goal.subject} (${goal.targetMark}% target)`,
          description: `You are aiming to elevate ${goal.subject} from ${currentAvg}% to ${goal.targetMark}%. Complete targeted problem sets focusing on high-weight exam topics.`,
          subject: goal.subject,
          priority: priorityEval.priority,
          source: 'goal',
          sourceId: goal.id,
          currentMark: currentAvg,
          targetMark: goal.targetMark,
          estimatedMinutes: priorityEval.recommendedMinutes,
          rationale: `Active goal milestone: Aiming for ${goal.targetMark}% (+${
            goal.targetMark - currentAvg
          }% progression required).`,
          suggestedAction: 'Schedule Goal Task',
        });
      }
    });

    // 4. Sort recommendations by Priority: high > medium > low, then by lowest mark
    recommendations.sort((a, b) => {
      const priorityOrder: Record<TaskPriority, number> = {
        high: 3,
        medium: 2,
        low: 1,
      };
      const pDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (pDiff !== 0) return pDiff;
      return (a.currentMark ?? 50) - (b.currentMark ?? 50);
    });

    return recommendations;
  }

  /**
   * Convert a Knowledge Gap directly into a Study Task
   */
  static createStudyTaskFromKnowledgeGap(
    gap: {
      id: string;
      subject: string;
      topic: string;
      mark: number;
      notes?: string;
    },
    userId?: string
  ): Omit<StudyTask, 'id' | 'createdAt' | 'updatedAt'> {
    const priorityEval = PriorityService.evaluateMarkPriority(gap.mark);
    const title = this.generateActionableTaskTitle(gap.subject, gap.topic, gap.mark);
    const description = gap.notes
      ? `Identified knowledge gap: ${gap.notes}. Focus on concept revision, worked examples, and self-assessment for ${gap.topic}.`
      : `Your latest result in ${gap.topic} is ${gap.mark}%. Review the core fundamentals and practice solving standard exam problems.`;

    const dueDate = TaskService.findNextAvailableDate([], new Date());

    return {
      userId,
      title,
      description,
      subject: gap.subject,
      topic: gap.topic,
      priority: priorityEval.priority,
      status: 'todo',
      completed: false,
      source: 'knowledge_gap',
      sourceId: gap.id,
      currentMark: gap.mark,
      estimatedMinutes: priorityEval.recommendedMinutes,
      dueDate,
    };
  }

  /**
   * Produce pedagogically actionable task titles tailored to South African CAPS curriculum
   */
  private static generateActionableTaskTitle(
    subject: string,
    topic: string,
    mark: number
  ): string {
    const subLower = subject.toLowerCase();
    const topicLower = topic.toLowerCase();

    if (subLower.includes('math')) {
      if (topicLower.includes('algebra') || topicLower.includes('equation')) {
        return mark < 50
          ? 'Review Algebra fundamentals & linear equations'
          : 'Practice quadratic equations & inequalities';
      }
      if (topicLower.includes('calculus') || topicLower.includes('derivative')) {
        return 'Work through first principles & cubic polynomial graphs';
      }
      if (topicLower.includes('trig')) {
        return 'Master trigonometric identities & general solutions';
      }
      if (topicLower.includes('geometry')) {
        return 'Practice circle geometry theorem proofs';
      }
      if (topicLower.includes('function')) {
        return 'Analyze hyperbolic and exponential function sketches';
      }
      return `Practice ${topic} problem solving & past exam questions`;
    }

    if (subLower.includes('physical science') || subLower.includes('physics')) {
      if (topicLower.includes('newton') || topicLower.includes('motion')) {
        return "Solve Newton's Laws & free body diagram problems";
      }
      if (topicLower.includes('chem') || topicLower.includes('reaction')) {
        return 'Review reaction rates and chemical equilibrium calculations';
      }
      if (topicLower.includes('organic')) {
        return 'Drill organic chemistry IUPAC nomenclature & reactions';
      }
      if (topicLower.includes('electric') || topicLower.includes('circuit')) {
        return 'Solve internal resistance & circuit diagrams';
      }
      return `Review ${topic} laws, formulas & structured problems`;
    }

    if (subLower.includes('life science') || subLower.includes('bio')) {
      return `Summarize ${topic} biological diagrams & process steps`;
    }

    if (subLower.includes('accounting')) {
      return `Prepare ${topic} financial ledger accounts & reconciliations`;
    }

    if (subLower.includes('english') || subLower.includes('language') || subLower.includes('afrikaans')) {
      return `Review ${topic} language conventions & transactional structures`;
    }

    return mark < 50 ? `Review ${topic} fundamentals` : `Practice ${topic} revision exercises`;
  }

  /**
   * Produce meaningful, non-generic descriptions
   */
  private static generateActionableDescription(
    _subject: string,
    topic: string,
    mark: number,
    notes?: string
  ): string {
    if (notes) {
      return `Recorded diagnostic note: "${notes}". Review key formulas, simplify concepts, and practice 3-5 standard exam questions for ${topic}.`;
    }

    if (mark < 40) {
      return `Your latest ${topic} result is ${mark}%. Begin with basic definitions, review worked textbook examples step-by-step, and clarify core misconceptions before tackling past papers.`;
    }

    if (mark < 50) {
      return `Your latest ${topic} result is ${mark}%. Focus on equations, simplifying expressions, and standard question types to build confidence.`;
    }

    if (mark < 70) {
      return `Your current performance in ${topic} is ${mark}%. Work through timed past paper sections to improve problem-solving speed and accuracy.`;
    }

    return `Performance in ${topic} is strong (${mark}%). Consolidate with challenging past examination questions and multi-step applications.`;
  }
}

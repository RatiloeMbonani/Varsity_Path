import { StudentGoal, ImproveResult, StudyTask } from '../../types';
import { StudentDataService } from '../studentDataService';
import { PriorityService } from './priorityService';

export interface GoalValidationResult {
  valid: boolean;
  error?: string;
}

export class GoalService {
  /**
   * Validate goal input parameters
   */
  static validateGoalInput(
    title: string,
    subject: string,
    currentMark: number,
    targetMark: number
  ): GoalValidationResult {
    if (!title.trim()) {
      return { valid: false, error: 'Goal title is required.' };
    }
    if (!subject.trim()) {
      return { valid: false, error: 'Subject is required.' };
    }
    if (isNaN(currentMark) || currentMark < 0 || currentMark > 100) {
      return { valid: false, error: 'Current mark must be a valid percentage between 0 and 100.' };
    }
    if (isNaN(targetMark) || targetMark < 0 || targetMark > 100) {
      return { valid: false, error: 'Target mark must be a valid percentage between 0 and 100.' };
    }
    if (targetMark <= currentMark) {
      return {
        valid: false,
        error: `Target mark (${targetMark}%) must be greater than current mark (${currentMark}%).`,
      };
    }
    return { valid: true };
  }

  /**
   * Generate actionable study tasks for a specific student goal
   * Targets the student's recorded weak topics in that subject
   */
  static generateTasksForGoal(
    goal: StudentGoal,
    results: ImproveResult[],
    existingTasks: StudyTask[]
  ): Array<Omit<StudyTask, 'id' | 'createdAt' | 'updatedAt'>> {
    const subjectResults = results.filter(
      (r) => r.subject.toLowerCase() === goal.subject.toLowerCase()
    );

    // Group by topic to find the weakest areas in this subject
    const topicMap = new Map<string, { total: number; count: number; lowestMark: number; notes?: string }>();
    subjectResults.forEach((r) => {
      const mark = Number(r.mark ?? r.percentage ?? 0);
      const existing = topicMap.get(r.topic) || { total: 0, count: 0, lowestMark: mark, notes: r.notes };
      existing.total += mark;
      existing.count += 1;
      existing.lowestMark = Math.min(existing.lowestMark, mark);
      if (r.notes && !existing.notes) existing.notes = r.notes;
      topicMap.set(r.topic, existing);
    });

    const topicAverages = Array.from(topicMap.entries()).map(([topic, data]) => ({
      topic,
      avg: Math.round(data.total / data.count),
      lowestMark: data.lowestMark,
      notes: data.notes,
    }));

    // Sort weakest topics first
    topicAverages.sort((a, b) => a.avg - b.avg);

    const generatedTasks: Array<Omit<StudyTask, 'id' | 'createdAt' | 'updatedAt'>> = [];

    // Filter topics that are under the target mark
    const focusTopics = topicAverages.filter((t) => t.avg < goal.targetMark);

    if (focusTopics.length > 0) {
      // Pick up to 2 weakest topics to prevent overwhelming
      focusTopics.slice(0, 2).forEach((topicInfo) => {
        const priorityEval = PriorityService.evaluateMarkPriority(topicInfo.avg);
        const title = `Master ${topicInfo.topic} to reach ${goal.targetMark}%`;
        const description = `Your current performance in ${topicInfo.topic} averages ${topicInfo.avg}%. Focus on problem-solving fundamentals and past paper questions to close the gap toward your ${goal.targetMark}% goal in ${goal.subject}.`;

        // Check if equivalent incomplete task already exists
        const alreadyExists = existingTasks.some((t) => {
          if (t.status === 'completed' || t.completed) return false;
          return (
            (t.source === 'goal' && t.sourceId === goal.id && t.topic?.toLowerCase() === topicInfo.topic.toLowerCase()) ||
            (t.subject.toLowerCase() === goal.subject.toLowerCase() &&
              t.topic?.toLowerCase() === topicInfo.topic.toLowerCase() &&
              t.title.toLowerCase().includes('reach'))
          );
        });

        if (!alreadyExists) {
          generatedTasks.push({
            userId: goal.userId,
            title,
            description,
            subject: goal.subject,
            topic: topicInfo.topic,
            priority: priorityEval.priority,
            status: 'todo',
            completed: false,
            source: 'goal',
            sourceId: goal.id,
            currentMark: topicInfo.avg,
            targetMark: goal.targetMark,
            estimatedMinutes: priorityEval.recommendedMinutes,
            dueDate: goal.targetDate || this.getSuggestedDueDate(2),
          });
        }
      });
    } else {
      // If no individual topic was logged under the target mark, create a comprehensive revision task
      const priorityEval = PriorityService.evaluateGoalGapPriority(goal.currentMark, goal.targetMark);
      const title = `Comprehensive revision for ${goal.subject} (${goal.targetMark}% target)`;
      const description = `Work through past exam papers and timed question sets to progress from ${goal.currentMark}% to ${goal.targetMark}% in ${goal.subject}.`;

      const alreadyExists = existingTasks.some(
        (t) =>
          (t.status === 'completed' || t.completed ? false : true) &&
          t.source === 'goal' &&
          t.sourceId === goal.id
      );

      if (!alreadyExists) {
        generatedTasks.push({
          userId: goal.userId,
          title,
          description,
          subject: goal.subject,
          priority: priorityEval.priority,
          status: 'todo',
          completed: false,
          source: 'goal',
          sourceId: goal.id,
          currentMark: goal.currentMark,
          targetMark: goal.targetMark,
          estimatedMinutes: priorityEval.recommendedMinutes,
          dueDate: goal.targetDate || this.getSuggestedDueDate(3),
        });
      }
    }

    return generatedTasks;
  }

  /**
   * Helper to compute suggested date N days from today
   */
  private static getSuggestedDueDate(daysFromNow: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
  }
}

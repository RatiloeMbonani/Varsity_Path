import { StudyTask, StudentGoal, TaskPriority, TaskSource, TaskStatus } from './index';

export interface RecommendedStudyTask {
  id: string; // Candidate ID for UI reconciliation
  title: string;
  description: string;
  subject: string;
  topic?: string;
  priority: TaskPriority;
  source: TaskSource;
  sourceId?: string;
  currentMark?: number;
  targetMark?: number;
  estimatedMinutes: number;
  rationale: string;
  suggestedAction: string;
}

export interface WeeklyPlannerSummary {
  weekStartDate: string; // YYYY-MM-DD (Monday)
  weekEndDate: string; // YYYY-MM-DD (Sunday)
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  completionPercentage: number;
  totalEstimatedMinutes: number;
  completedMinutes: number;
  topPrioritySubjectTopic?: string;
  highPriorityCount: number;
  overdueTasksCount: number;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isToday: boolean;
  tasks: StudyTask[];
  totalMinutes: number;
  completedMinutes: number;
}

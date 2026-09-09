import { StudyTask, TaskStatus, TaskPriority } from '../../types';
import { WeeklyPlannerSummary, DaySchedule } from '../../types/planner';

export class TaskService {
  /**
   * Helper to format YYYY-MM-DD
   */
  static formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get the Monday of the week containing the given date
   */
  static getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  /**
   * Generate 7-day schedule structure for the week starting at monday
   */
  static getWeeklySchedule(tasks: StudyTask[], referenceDate: Date = new Date()): DaySchedule[] {
    const monday = this.getMonday(referenceDate);
    const todayStr = this.formatDate(referenceDate);
    const dayNames: DaySchedule['dayName'][] = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    return dayNames.map((dayName, index) => {
      const current = new Date(monday);
      current.setDate(monday.getDate() + index);
      const dateStr = this.formatDate(current);

      // Tasks due on this specific date
      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);

      const totalMinutes = dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
      const completedMinutes = dayTasks
        .filter((t) => t.status === 'completed' || t.completed)
        .reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);

      return {
        date: dateStr,
        dayName,
        isToday: dateStr === todayStr,
        tasks: dayTasks,
        totalMinutes,
        completedMinutes,
      };
    });
  }

  /**
   * Calculate summary statistics for the week
   */
  static calculateWeeklySummary(tasks: StudyTask[], referenceDate: Date = new Date()): WeeklyPlannerSummary {
    const monday = this.getMonday(referenceDate);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const mondayStr = this.formatDate(monday);
    const sundayStr = this.formatDate(sunday);
    const todayStr = this.formatDate(referenceDate);

    // Filter tasks that belong to this week
    const weekTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      return t.dueDate >= mondayStr && t.dueDate <= sundayStr;
    });

    const completedTasks = weekTasks.filter((t) => t.status === 'completed' || t.completed);
    const remainingTasks = weekTasks.filter((t) => t.status !== 'completed' && !t.completed);

    const totalEstimatedMinutes = weekTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
    const completedMinutes = completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);

    const completionPercentage =
      weekTasks.length > 0 ? Math.round((completedTasks.length / weekTasks.length) * 100) : 0;

    // Overdue tasks count across all active tasks
    const overdueTasksCount = tasks.filter(
      (t) => t.status !== 'completed' && !t.completed && t.dueDate && t.dueDate < todayStr
    ).length;

    // Find top priority subject/topic among remaining tasks
    const highPriorityTask = remainingTasks.find((t) => t.priority === 'high') || remainingTasks[0];
    const topPrioritySubjectTopic = highPriorityTask
      ? `${highPriorityTask.subject}${highPriorityTask.topic ? ` — ${highPriorityTask.topic}` : ''}`
      : undefined;

    const highPriorityCount = remainingTasks.filter((t) => t.priority === 'high').length;

    return {
      weekStartDate: mondayStr,
      weekEndDate: sundayStr,
      totalTasks: weekTasks.length,
      completedTasks: completedTasks.length,
      remainingTasks: remainingTasks.length,
      completionPercentage,
      totalEstimatedMinutes,
      completedMinutes,
      topPrioritySubjectTopic,
      highPriorityCount,
      overdueTasksCount,
    };
  }

  /**
   * Reschedule an overdue task to a balanced day
   * Avoids stacking more than 120 minutes or 4 tasks onto a single day
   */
  static findNextAvailableDate(existingTasks: StudyTask[], startingFrom: Date = new Date()): string {
    const candidate = new Date(startingFrom);

    for (let i = 0; i < 14; i++) {
      const dateStr = this.formatDate(candidate);
      const dayTasks = existingTasks.filter(
        (t) => t.dueDate === dateStr && t.status !== 'completed' && !t.completed
      );
      const dayMinutes = dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);

      // Max 3 tasks or 90 minutes for new scheduled items so day workload is balanced
      if (dayTasks.length < 3 && dayMinutes <= 90) {
        return dateStr;
      }
      candidate.setDate(candidate.getDate() + 1);
    }

    return this.formatDate(startingFrom);
  }

  /**
   * Format minutes to human readable string (e.g. 3h 40m or 45m)
   */
  static formatMinutesToHours(minutes: number): string {
    if (minutes <= 0) return '0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
}

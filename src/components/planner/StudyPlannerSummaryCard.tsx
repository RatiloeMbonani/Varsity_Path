import React from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, ArrowRight, PlusCircle } from 'lucide-react';
import { WeeklyPlannerSummary } from '../../types/planner';
import { TaskService } from '../../services/planner/taskService';
import { Button } from '../common/Button';

export interface StudyPlannerSummaryCardProps {
  summary: WeeklyPlannerSummary;
  onOpenPlanner: () => void;
  onAddTask: () => void;
}

export const StudyPlannerSummaryCard: React.FC<StudyPlannerSummaryCardProps> = ({
  summary,
  onOpenPlanner,
  onAddTask,
}) => {
  return (
    <div className="rounded-2xl border border-[#CFE3F1] bg-white p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDF4FA]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDF4FA] text-[#243A5E] flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#243A5E]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#243A5E]">This Week's Study Plan</h4>
            <p className="text-xs text-[#5F86A6]">
              {summary.weekStartDate} — {summary.weekEndDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={onAddTask} leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
            Add Task
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenPlanner} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Weekly Planner
          </Button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Tasks Completion */}
        <div className="p-3.5 rounded-xl bg-[#EDF4FA]/60 border border-[#CFE3F1]/80 space-y-1">
          <span className="text-[11px] font-bold text-[#5F86A6] uppercase tracking-wider">
            This Week
          </span>
          <div className="text-lg font-bold text-[#243A5E]">
            {summary.totalTasks} {summary.totalTasks === 1 ? 'task' : 'tasks'}
          </div>
          <div className="text-xs text-[#5F86A6] flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
            <span>{summary.completedTasks} completed</span>
            {summary.remainingTasks > 0 && <span>• {summary.remainingTasks} left</span>}
          </div>
        </div>

        {/* Metric 2: Study Time */}
        <div className="p-3.5 rounded-xl bg-[#EDF4FA]/60 border border-[#CFE3F1]/80 space-y-1">
          <span className="text-[11px] font-bold text-[#5F86A6] uppercase tracking-wider">
            Study Time
          </span>
          <div className="text-lg font-bold text-[#243A5E]">
            {TaskService.formatMinutesToHours(summary.completedMinutes)}
          </div>
          <div className="text-xs text-[#5F86A6] flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#243A5E]" />
            <span>of {TaskService.formatMinutesToHours(summary.totalEstimatedMinutes)} planned</span>
          </div>
        </div>

        {/* Metric 3: Top Priority */}
        <div className="p-3.5 rounded-xl bg-[#EDF4FA]/60 border border-[#CFE3F1]/80 space-y-1">
          <span className="text-[11px] font-bold text-[#5F86A6] uppercase tracking-wider">
            Top Priority
          </span>
          <div className="text-sm font-bold text-[#243A5E] truncate" title={summary.topPrioritySubjectTopic || 'All caught up'}>
            {summary.topPrioritySubjectTopic || 'All caught up'}
          </div>
          <div className="text-xs text-[#5F86A6] flex items-center gap-1 font-medium">
            {summary.highPriorityCount > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>{summary.highPriorityCount} high urgency item{summary.highPriorityCount > 1 ? 's' : ''}</span>
              </>
            ) : (
              <span>Balanced workload</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#243A5E]">Weekly Progress</span>
          <span className="text-[#243A5E] font-bold">{summary.completionPercentage}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#EDF4FA] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#243A5E] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, summary.completionPercentage))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#5F86A6]">
          <span>
            {summary.completedTasks} of {summary.totalTasks} tasks completed
          </span>
          <span>{TaskService.formatMinutesToHours(summary.completedMinutes)} studied</span>
        </div>
      </div>

      {/* Overdue alert banner if any */}
      {summary.overdueTasksCount > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              You have <strong>{summary.overdueTasksCount}</strong> incomplete past task{summary.overdueTasksCount > 1 ? 's' : ''}.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenPlanner}
            className="font-bold underline hover:text-amber-950 ml-2 text-xs"
          >
            Review & Reschedule
          </button>
        </div>
      )}
    </div>
  );
};

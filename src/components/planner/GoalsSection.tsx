import React, { useState } from 'react';
import {
  Award,
  Plus,
  Target,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StudentGoal, StudyTask, ImproveResult } from '../../types';
import { Button } from '../common/Button';

export interface GoalsSectionProps {
  goals: StudentGoal[];
  studyTasks: StudyTask[];
  results: ImproveResult[];
  onOpenCreateGoal: () => void;
  onEditGoal: (goal: StudentGoal) => void;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onToggleGoalStatus: (goalId: string, completed: boolean) => Promise<void>;
  onGenerateTasksForGoal: (goal: StudentGoal) => Promise<void>;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  studyTasks,
  results,
  onOpenCreateGoal,
  onEditGoal,
  onDeleteGoal,
  onToggleGoalStatus,
  onGenerateTasksForGoal,
}) => {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [generatingGoalId, setGeneratingGoalId] = useState<string | null>(null);

  const handleGenerate = async (goal: StudentGoal) => {
    setGeneratingGoalId(goal.id);
    try {
      await onGenerateTasksForGoal(goal);
    } finally {
      setGeneratingGoalId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-[#CFE3F1] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDF4FA]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDF4FA] text-[#243A5E] flex items-center justify-center">
            <Award className="w-5 h-5 text-[#243A5E]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#243A5E]">Academic Goals & Targets</h4>
            <p className="text-xs text-[#5F86A6]">
              Set subject benchmarks to generate targeted diagnostic study tasks.
            </p>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={onOpenCreateGoal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Set Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-[#EDF4FA]/30 border border-[#CFE3F1]/80 space-y-2">
          <Target className="w-8 h-8 text-[#5F86A6] mx-auto opacity-70" />
          <p className="text-sm font-bold text-[#243A5E]">No active goals set yet</p>
          <p className="text-xs text-[#5F86A6] max-w-md mx-auto">
            Set a target mark for Mathematics, Physical Sciences, or any subject to generate tailored study tasks for your weakest topics.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={onOpenCreateGoal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Create your first Goal
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const isCompleted = goal.status === 'completed';
            const associatedTasks = studyTasks.filter(
              (t) => t.source === 'goal' && t.sourceId === goal.id
            );
            const isExpanded = expandedGoalId === goal.id;

            // Find current subject average if available
            const subjectResults = results.filter(
              (r) => r.subject.toLowerCase() === goal.subject.toLowerCase()
            );
            const liveAvg =
              subjectResults.length > 0
                ? Math.round(
                    subjectResults.reduce(
                      (acc, r) => acc + Number(r.mark ?? r.percentage ?? 0),
                      0
                    ) / subjectResults.length
                  )
                : goal.currentMark;

            const progressPct = Math.min(
              100,
              Math.max(
                0,
                Math.round(
                  ((liveAvg - goal.currentMark) / (goal.targetMark - goal.currentMark)) * 100
                )
              )
            );

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isCompleted
                    ? 'bg-[#EDF4FA]/40 border-[#CFE3F1]'
                    : 'bg-white border-[#CFE3F1] shadow-2xs hover:border-[#8FB6D8]'
                }`}
              >
                {/* Goal Top Bar */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5F86A6] uppercase tracking-wider">
                        {goal.subject}
                      </span>
                      {isCompleted && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-[#243A5E] mt-0.5">{goal.title}</h5>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditGoal(goal)}
                      className="p-1 text-[#5F86A6] hover:text-[#243A5E] transition-colors rounded"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1 text-[#5F86A6] hover:text-red-600 transition-colors rounded"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-1.5 bg-[#EDF4FA]/50 p-3 rounded-lg border border-[#CFE3F1]/70">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5F86A6]">
                      Current: <strong>{liveAvg}%</strong>
                    </span>
                    <span className="text-[#243A5E] font-bold">
                      Target: <strong>{goal.targetMark}%</strong>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-[#CFE3F1]/60">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        liveAvg >= goal.targetMark ? 'bg-green-600' : 'bg-[#243A5E]'
                      }`}
                      style={{
                        width: `${
                          liveAvg >= goal.targetMark ? 100 : Math.max(5, progressPct)
                        }%`,
                      }}
                    />
                  </div>
                  {goal.targetDate && (
                    <div className="text-[11px] text-[#5F86A6] text-right">
                      Target milestone: {goal.targetDate}
                    </div>
                  )}
                </div>

                {/* Actions & Tasks expansion */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedGoalId((prev) => (prev === goal.id ? null : goal.id))
                    }
                    className="text-xs font-semibold text-[#5F86A6] hover:text-[#243A5E] flex items-center gap-1"
                  >
                    <span>
                      {associatedTasks.length} study {associatedTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={generatingGoalId === goal.id || isCompleted}
                      onClick={() => handleGenerate(goal)}
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#243A5E]" />}
                    >
                      {generatingGoalId === goal.id ? 'Generating...' : 'Generate Tasks'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => onToggleGoalStatus(goal.id, !isCompleted)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                        isCompleted
                          ? 'border-[#CFE3F1] bg-white text-[#5F86A6] hover:bg-[#EDF4FA]'
                          : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {isCompleted ? 'Reopen' : 'Mark Done'}
                    </button>
                  </div>
                </div>

                {/* Expanded Tasks list for this goal */}
                {isExpanded && (
                  <div className="pt-2 border-t border-[#EDF4FA] space-y-2">
                    <span className="text-[11px] font-bold text-[#5F86A6] uppercase tracking-wider block">
                      Tasks generated from this goal:
                    </span>
                    {associatedTasks.length === 0 ? (
                      <p className="text-xs text-[#5F86A6]">
                        No active study tasks currently attached to this goal. Click "Generate Tasks" to schedule diagnostic practice.
                      </p>
                    ) : (
                      associatedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-2 rounded-lg bg-white border border-[#CFE3F1] text-xs flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {task.status === 'completed' || task.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-700 shrink-0" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-[#243A5E] shrink-0" />
                            )}
                            <span
                              className={`truncate font-medium ${
                                task.status === 'completed' || task.completed
                                  ? 'line-through text-[#5F86A6]'
                                  : 'text-[#243A5E]'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#5F86A6] shrink-0">
                            {task.dueDate || 'Unscheduled'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

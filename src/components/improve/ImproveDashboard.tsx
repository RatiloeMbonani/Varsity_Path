import React, { useState, useMemo, useRef } from 'react';
import {
  BookOpen,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Calendar,
  Award,
  Plus,
  ArrowDown,
  CalendarDays,
} from 'lucide-react';
import { ImproveResult, StudentGoal, StudyTask, StudentProfile } from '../../types';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { ProgressRing } from '../common/ProgressRing';
import { ResultTable, Column } from '../common/ResultTable';

import { TaskService } from '../../services/planner/taskService';
import { StudyPlannerService } from '../../services/planner/studyPlannerService';
import { GoalService } from '../../services/planner/goalService';
import { RecommendedStudyTask } from '../../types/planner';

import { StudyPlannerSummaryCard } from '../planner/StudyPlannerSummaryCard';
import { RecommendedNextCard } from '../planner/RecommendedNextCard';
import { WeeklyStudyPlanner } from '../planner/WeeklyStudyPlanner';
import { GoalsSection } from '../planner/GoalsSection';
import { TaskModal } from '../planner/TaskModal';
import { GoalModal } from '../planner/GoalModal';

export interface ImproveDashboardProps {
  student: StudentProfile;
  results: ImproveResult[];
  goals: StudentGoal[];
  studyTasks: StudyTask[];
  onOpenLogModal: () => void;
  onDeleteResult: (resultId: string) => Promise<void>;
  onAddGoal: (goal: Omit<StudentGoal, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateGoal?: (goalId: string, updates: Partial<StudentGoal>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onToggleGoalStatus?: (goalId: string, completed: boolean) => Promise<void>;
  onAddTask: (task: Omit<StudyTask, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateTask?: (taskId: string, updates: Partial<StudyTask>) => Promise<void>;
  onRescheduleTask?: (taskId: string, newDueDate: string) => Promise<void>;
  onToggleTask: (taskId: string, completed: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export const ImproveDashboard: React.FC<ImproveDashboardProps> = ({
  student,
  results,
  goals,
  studyTasks,
  onOpenLogModal,
  onDeleteResult,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onToggleGoalStatus,
  onAddTask,
  onUpdateTask,
  onRescheduleTask,
  onToggleTask,
  onDeleteTask,
}) => {
  // Modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [reschedulingTask, setReschedulingTask] = useState<StudyTask | null>(null);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudentGoal | null>(null);

  // Quick gap add state tracking
  const [addingGapId, setAddingGapId] = useState<string | null>(null);

  const weeklyPlannerRef = useRef<HTMLDivElement | null>(null);

  // Available subjects from student results or standard curriculum
  const loggedSubjects = useMemo(() => {
    const fromResults = results.map((r) => r.subject);
    return Array.from(new Set(fromResults));
  }, [results]);

  // Overall calculations from REAL results
  const totalMarks = useMemo(() => {
    return results.reduce((acc, r) => acc + Number(r.mark ?? r.percentage ?? 0), 0);
  }, [results]);

  const overallMastery = useMemo(() => {
    return results.length > 0 ? Math.round(totalMarks / results.length) : 0;
  }, [totalMarks, results.length]);

  // Subject statistics
  const subjectStats = useMemo(() => {
    const subjectMap = new Map<string, { totalMarks: number; count: number; items: ImproveResult[] }>();
    results.forEach((r) => {
      const markVal = Number(r.mark ?? r.percentage ?? 0);
      const existing = subjectMap.get(r.subject) || { totalMarks: 0, count: 0, items: [] };
      existing.totalMarks += markVal;
      existing.count += 1;
      existing.items.push(r);
      subjectMap.set(r.subject, existing);
    });

    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      avg: Math.round(data.totalMarks / data.count),
      count: data.count,
    }));
  }, [results]);

  const strengths = useMemo(() => subjectStats.filter((s) => s.avg >= 70), [subjectStats]);
  const weaknesses = useMemo(() => subjectStats.filter((s) => s.avg < 60), [subjectStats]);

  // Real knowledge gaps extracted from recorded assessments where mark < 60 or notes provided
  const identifiedGaps = useMemo(() => {
    return results
      .filter((r) => Number(r.mark ?? r.percentage ?? 0) < 60 || Boolean(r.notes))
      .map((r) => ({
        id: r.id,
        subject: r.subject,
        topic: r.topic,
        mark: Number(r.mark ?? r.percentage ?? 0),
        notes: r.notes,
        date: r.date,
      }));
  }, [results]);

  // Smart Recommendations (Section 15)
  const recommendations = useMemo(() => {
    return StudyPlannerService.generateSmartRecommendations(results, goals, studyTasks);
  }, [results, goals, studyTasks]);

  // Weekly Planner Summary (Section 13 & 14)
  const weeklySummary = useMemo(() => {
    return TaskService.calculateWeeklySummary(studyTasks);
  }, [studyTasks]);

  // --------------------------------------------------------------------------
  // EMPTY STATE: No results, no knowledge gaps, and no goals (Section 2)
  // --------------------------------------------------------------------------
  if (results.length === 0 && goals.length === 0 && studyTasks.length === 0) {
    return (
      <div className="space-y-8">
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-[#243A5E]" />}
          title="Your study planner is ready."
          description="Log results or create a goal and we'll build a personalised study plan around your needs."
          primaryAction={
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={onOpenLogModal}
                leftIcon={<PlusCircle className="w-5 h-5" />}
              >
                Log a Result
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setEditingGoal(null);
                  setGoalModalOpen(true);
                }}
                leftIcon={<Award className="w-5 h-5" />}
              >
                Create a Goal
              </Button>
            </div>
          }
          hint="Authentic diagnostics and tailored weekly timetables activate from your real recorded marks."
        />

        {/* Diagnostic pipeline visual preview */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-center">
          <div className="p-4 rounded-xl bg-white border border-[#CFE3F1] shadow-2xs">
            <span className="w-7 h-7 rounded-lg bg-[#EDF4FA] text-[#243A5E] mx-auto flex items-center justify-center font-bold text-xs mb-2">
              1
            </span>
            <h5 className="text-xs font-bold text-[#243A5E]">Results & Diagnostic</h5>
            <p className="text-[11px] text-[#5F86A6] mt-1">
              Evaluates actual topic marks and overall mastery.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#CFE3F1] shadow-2xs">
            <span className="w-7 h-7 rounded-lg bg-[#EDF4FA] text-[#243A5E] mx-auto flex items-center justify-center font-bold text-xs mb-2">
              2
            </span>
            <h5 className="text-xs font-bold text-[#243A5E]">Knowledge Gaps</h5>
            <p className="text-[11px] text-[#5F86A6] mt-1">
              Pinpoints specific assessment topics needing remediation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#CFE3F1] shadow-2xs">
            <span className="w-7 h-7 rounded-lg bg-[#EDF4FA] text-[#243A5E] mx-auto flex items-center justify-center font-bold text-xs mb-2">
              3
            </span>
            <h5 className="text-xs font-bold text-[#243A5E]">Academic Goals</h5>
            <p className="text-[11px] text-[#5F86A6] mt-1">
              Set target percentage milestones for your upcoming exams.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#CFE3F1] shadow-2xs">
            <span className="w-7 h-7 rounded-lg bg-[#EDF4FA] text-[#243A5E] mx-auto flex items-center justify-center font-bold text-xs mb-2">
              4
            </span>
            <h5 className="text-xs font-bold text-[#243A5E]">Weekly Timetable</h5>
            <p className="text-[11px] text-[#5F86A6] mt-1">
              Balanced, actionable daily study tasks without burnout.
            </p>
          </div>
        </div>

        {/* Goal Modal */}
        <GoalModal
          isOpen={goalModalOpen}
          onClose={() => setGoalModalOpen(false)}
          onSaveGoal={onAddGoal}
          onUpdateGoal={onUpdateGoal}
          editingGoal={editingGoal}
          availableSubjects={loggedSubjects.length > 0 ? loggedSubjects : undefined}
        />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ACTION HANDLERS
  // --------------------------------------------------------------------------

  // Add task from knowledge gap (Section 4)
  const handleAddFromKnowledgeGap = async (gap: {
    id: string;
    subject: string;
    topic: string;
    mark: number;
    notes?: string;
  }) => {
    setAddingGapId(gap.id);
    try {
      const taskData = StudyPlannerService.createStudyTaskFromKnowledgeGap(gap, student.uid);
      await onAddTask(taskData);
    } finally {
      setAddingGapId(null);
    }
  };

  // Add task from smart recommendation (Section 15)
  const handleAddFromRecommendation = async (rec: RecommendedStudyTask) => {
    const dueDate = TaskService.findNextAvailableDate(studyTasks, new Date());
    await onAddTask({
      userId: student.uid,
      title: rec.title,
      description: rec.description,
      subject: rec.subject,
      topic: rec.topic,
      priority: rec.priority,
      status: 'todo',
      completed: false,
      source: rec.source,
      sourceId: rec.sourceId,
      currentMark: rec.currentMark,
      targetMark: rec.targetMark,
      estimatedMinutes: rec.estimatedMinutes,
      dueDate,
    });
  };

  // Generate tasks for a goal (Section 6)
  const handleGenerateTasksForGoal = async (goal: StudentGoal) => {
    const generated = GoalService.generateTasksForGoal(goal, results, studyTasks);
    for (const task of generated) {
      await onAddTask(task);
    }
  };

  const scrollToPlanner = () => {
    if (weeklyPlannerRef.current) {
      weeklyPlannerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Results table columns
  const columns: Column<ImproveResult>[] = [
    {
      key: 'subject',
      header: 'Subject',
      render: (r) => <span className="font-bold text-[#243A5E]">{r.subject}</span>,
    },
    {
      key: 'topic',
      header: 'Topic',
      render: (r) => (
        <div>
          <span className="font-medium text-[#243A5E]">{r.topic}</span>
          {r.notes && <div className="text-xs text-[#5F86A6] mt-0.5">{r.notes}</div>}
        </div>
      ),
    },
    {
      key: 'mark',
      header: 'Mark',
      align: 'center',
      render: (r) => {
        const markVal = Number(r.mark ?? r.percentage ?? 0);
        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
              markVal >= 70
                ? 'bg-green-100 text-green-800'
                : markVal >= 50
                ? 'bg-[#CFE3F1] text-[#243A5E]'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {markVal}%
          </span>
        );
      },
    },
    {
      key: 'date',
      header: 'Date',
      align: 'center',
      render: (r) => <span className="text-xs text-[#5F86A6]">{r.date}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <button
          type="button"
          onClick={() => onDeleteResult(r.id)}
          className="p-1 text-[#5F86A6] hover:text-red-600 transition-colors rounded"
          title="Delete result"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Results Diagnostic Row: Overall Mastery & Strengths/Focus Areas */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mastery Ring Card */}
          <Card variant="default" className="flex flex-col items-center justify-center text-center p-6">
            <h3 className="text-sm font-bold text-[#5F86A6] uppercase tracking-wider mb-4">
              Overall Mastery
            </h3>
            <ProgressRing
              value={overallMastery}
              size={150}
              strokeWidth={12}
              label="Calculated"
              sublabel={`Across ${results.length} assessment${results.length > 1 ? 's' : ''}`}
            />
            <p className="text-xs text-[#5F86A6] mt-4 max-w-xs">
              Reflects authentic mean performance calculated directly from your logged marks.
            </p>
          </Card>

          {/* Strengths & Focus Areas */}
          <Card variant="default" className="md:col-span-2 flex flex-col justify-between">
            <div>
              <CardHeader
                title="Subject Strengths & Focus Areas"
                description="Evaluated from your authenticated assessment marks."
                icon={<TrendingUp className="w-5 h-5 text-[#243A5E]" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl bg-[#EDF4FA]/70 border border-[#CFE3F1]">
                  <div className="flex items-center gap-2 mb-3 text-[#243A5E] font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                    <span>Demonstrated Strengths (≥ 70%)</span>
                  </div>
                  {strengths.length > 0 ? (
                    <div className="space-y-2">
                      {strengths.map((s) => (
                        <div
                          key={s.subject}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-[#CFE3F1]"
                        >
                          <span className="font-semibold text-[#243A5E]">{s.subject}</span>
                          <span className="font-bold text-green-800 bg-green-50 px-2 py-0.5 rounded">
                            {s.avg}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#5F86A6] italic">
                      No subjects averaging 70%+ recorded yet.
                    </p>
                  )}
                </div>

                {/* Focus Areas */}
                <div className="p-4 rounded-xl bg-[#EDF4FA]/70 border border-[#CFE3F1]">
                  <div className="flex items-center gap-2 mb-3 text-[#243A5E] font-bold text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Focus Areas (&lt; 60%)</span>
                  </div>
                  {weaknesses.length > 0 ? (
                    <div className="space-y-2">
                      {weaknesses.map((w) => (
                        <div
                          key={w.subject}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-[#CFE3F1]"
                        >
                          <span className="font-semibold text-[#243A5E]">{w.subject}</span>
                          <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            {w.avg}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#5F86A6] italic">
                      All currently logged subjects are performing at 60% or higher.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 2. Knowledge Gaps & Topic Diagnostic (Section 4) */}
      <Card variant="default">
        <CardHeader
          title="Knowledge Gaps & Topic Diagnostic"
          description="Assessments and topics that require reinforcement based on your logged marks."
          icon={<AlertCircle className="w-5 h-5 text-[#243A5E]" />}
        />

        {identifiedGaps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {identifiedGaps.map((gap) => {
              const alreadyHasTask = studyTasks.some(
                (t) =>
                  (t.sourceId === gap.id ||
                    (t.subject.toLowerCase() === gap.subject.toLowerCase() &&
                      t.topic?.toLowerCase() === gap.topic.toLowerCase())) &&
                  t.status !== 'completed' &&
                  !t.completed
              );
              const isAdding = addingGapId === gap.id;

              return (
                <div
                  key={gap.id}
                  className="p-4 rounded-xl border border-[#CFE3F1] bg-white space-y-2.5 flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#243A5E]">{gap.subject}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          gap.mark < 50
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {gap.mark}%
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#243A5E]">{gap.topic}</p>
                    {gap.notes && (
                      <p className="text-xs text-[#5F86A6] bg-[#EDF4FA] p-2 rounded-lg mt-1">
                        {gap.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#EDF4FA] flex items-center justify-end">
                    <Button
                      variant={alreadyHasTask ? 'outline' : 'secondary'}
                      size="sm"
                      disabled={alreadyHasTask || isAdding}
                      onClick={() => handleAddFromKnowledgeGap(gap)}
                      leftIcon={
                        alreadyHasTask ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )
                      }
                    >
                      {alreadyHasTask
                        ? 'Added to Plan'
                        : isAdding
                        ? 'Adding...'
                        : 'Add to Study Planner'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#5F86A6] bg-[#EDF4FA]/50 rounded-xl border border-dashed border-[#CFE3F1]">
            No significant topic knowledge gaps flagged in your logged assessments.
          </div>
        )}
      </Card>

      {/* 3. Study Planner Summary Card (Section 13 & 14) */}
      <StudyPlannerSummaryCard
        summary={weeklySummary}
        onOpenPlanner={scrollToPlanner}
        onAddTask={() => {
          setEditingTask(null);
          setReschedulingTask(null);
          setTaskModalOpen(true);
        }}
      />

      {/* 4. Academic Goals & Targets Section (Section 6 & 7) */}
      <GoalsSection
        goals={goals}
        studyTasks={studyTasks}
        results={results}
        onOpenCreateGoal={() => {
          setEditingGoal(null);
          setGoalModalOpen(true);
        }}
        onEditGoal={(goal) => {
          setEditingGoal(goal);
          setGoalModalOpen(true);
        }}
        onDeleteGoal={onDeleteGoal}
        onToggleGoalStatus={onToggleGoalStatus || (async () => {})}
        onGenerateTasksForGoal={handleGenerateTasksForGoal}
      />

      {/* 5. Recommended Next Section (Section 15) */}
      <RecommendedNextCard
        recommendations={recommendations}
        onAddToPlanner={handleAddFromRecommendation}
      />

      {/* 6. Weekly Study Timetable (Section 9, 10, 11) */}
      <div ref={weeklyPlannerRef}>
        <WeeklyStudyPlanner
          tasks={studyTasks}
          onToggleTask={onToggleTask}
          onEditTask={(task) => {
            setEditingTask(task);
            setReschedulingTask(null);
            setTaskModalOpen(true);
          }}
          onRescheduleTask={(task) => {
            setReschedulingTask(task);
            setEditingTask(null);
            setTaskModalOpen(true);
          }}
          onDeleteTask={onDeleteTask}
          onAddTaskForDate={(dateStr) => {
            setEditingTask({
              id: '',
              title: '',
              description: '',
              subject: loggedSubjects[0] || 'Mathematics',
              priority: 'medium',
              status: 'todo',
              source: 'manual',
              estimatedMinutes: 45,
              dueDate: dateStr,
              createdAt: '',
            });
            setReschedulingTask(null);
            setTaskModalOpen(true);
          }}
        />
      </div>

      {/* 7. Chronological Assessment History Table */}
      {results.length > 0 && (
        <Card variant="default">
          <CardHeader
            title="Logged Assessment History"
            description="Complete chronological record of your genuine tests and exams."
            icon={<BookOpen className="w-5 h-5 text-[#243A5E]" />}
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenLogModal}
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
              >
                Log Result
              </Button>
            }
          />
          <ResultTable<ImproveResult>
            data={results}
            columns={columns}
            keyExtractor={(item) => item.id}
            emptyMessage="No assessment results recorded."
          />
        </Card>
      )}

      {/* Task Creation & Reschedule Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
          setReschedulingTask(null);
        }}
        onSaveTask={onAddTask}
        onUpdateTask={onUpdateTask}
        editingTask={editingTask}
        reschedulingTask={reschedulingTask}
        existingTasks={studyTasks}
        availableSubjects={loggedSubjects.length > 0 ? loggedSubjects : undefined}
      />

      {/* Goal Creation & Editing Modal */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => {
          setGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSaveGoal={onAddGoal}
        onUpdateGoal={onUpdateGoal}
        editingGoal={editingGoal}
        availableSubjects={loggedSubjects.length > 0 ? loggedSubjects : undefined}
      />
    </div>
  );
};

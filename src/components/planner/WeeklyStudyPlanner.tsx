import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  CalendarDays,
  AlertTriangle,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { StudyTask } from '../../types';
import { TaskService } from '../../services/planner/taskService';
import { Button } from '../common/Button';

export interface WeeklyStudyPlannerProps {
  tasks: StudyTask[];
  onToggleTask: (taskId: string, completed: boolean) => Promise<void>;
  onEditTask: (task: StudyTask) => void;
  onRescheduleTask: (task: StudyTask) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onAddTaskForDate: (dateStr: string) => void;
}

export const WeeklyStudyPlanner: React.FC<WeeklyStudyPlannerProps> = ({
  tasks,
  onToggleTask,
  onEditTask,
  onRescheduleTask,
  onDeleteTask,
  onAddTaskForDate,
}) => {
  // Navigation state: current reference date (defaults to today)
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);

  const referenceDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + currentWeekOffset * 7);
    return d;
  }, [currentWeekOffset]);

  const schedule = useMemo(() => {
    return TaskService.getWeeklySchedule(tasks, referenceDate);
  }, [tasks, referenceDate]);

  const summary = useMemo(() => {
    return TaskService.calculateWeeklySummary(tasks, referenceDate);
  }, [tasks, referenceDate]);

  // Find overdue tasks (dueDate < todayStr and not completed)
  const todayStr = useMemo(() => TaskService.formatDate(new Date()), []);
  const overdueTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.status !== 'completed' && !t.completed && t.dueDate && t.dueDate < todayStr
    );
  }, [tasks, todayStr]);

  const handlePrevWeek = () => setCurrentWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setCurrentWeekOffset((prev) => prev + 1);
  const handleToday = () => setCurrentWeekOffset(0);

  return (
    <div className="space-y-6">
      {/* Top Header & Week Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#CFE3F1] shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDF4FA] text-[#243A5E] flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#243A5E]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#243A5E]">Weekly Study Timetable</h3>
            <p className="text-xs text-[#5F86A6]">
              {summary.weekStartDate} — {summary.weekEndDate}
              {currentWeekOffset === 0 && ' (Current Week)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            disabled={currentWeekOffset === 0}
          >
            Today
          </Button>
          <div className="flex items-center border border-[#CFE3F1] rounded-xl overflow-hidden bg-[#EDF4FA]/50">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-2 hover:bg-white text-[#243A5E] transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-[#CFE3F1]" />
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-2 hover:bg-white text-[#243A5E] transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Overdue Tasks Alert (Section 11: Smart Rescheduling) */}
      {overdueTasks.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <h4 className="text-sm font-bold text-amber-900">
                Missed & Overdue Study Tasks ({overdueTasks.length})
              </h4>
            </div>
            <span className="text-xs text-amber-800 font-medium">
              Tasks stay preserved until rescheduled or finished
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 mb-1">
                    <span>{task.subject}</span>
                    <span>Past: {task.dueDate}</span>
                  </div>
                  <h5 className="text-xs font-bold text-[#243A5E] line-clamp-1">{task.title}</h5>
                  {task.topic && (
                    <span className="text-[11px] text-[#5F86A6]">{task.topic}</span>
                  )}
                </div>

                <div className="pt-2 border-t border-[#EDF4FA] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#5F86A6] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.estimatedMinutes}m
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id, true)}
                      className="px-2 py-1 text-[11px] rounded bg-green-50 text-green-700 font-bold hover:bg-green-100"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => onRescheduleTask(task)}
                      className="px-2 py-1 text-[11px] rounded bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Weekly Grid (Monday to Sunday) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {schedule.map((day) => {
          const isOverloaded = day.totalMinutes > 120;
          return (
            <div
              key={day.date}
              className={`rounded-2xl border flex flex-col justify-between transition-all min-h-[300px] ${
                day.isToday
                  ? 'bg-white border-[#243A5E] shadow-sm ring-1 ring-[#243A5E]/20'
                  : 'bg-white/80 border-[#CFE3F1] hover:border-[#8FB6D8]'
              }`}
            >
              {/* Day Header */}
              <div className="p-3 border-b border-[#EDF4FA]">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      day.isToday ? 'text-[#243A5E]' : 'text-[#5F86A6]'
                    }`}
                  >
                    {day.dayName.substring(0, 3)}
                  </span>
                  {day.isToday && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#243A5E] text-white">
                      Today
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-[#243A5E]">
                    {day.date.split('-')[2]} {new Date(day.date).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      isOverloaded ? 'text-amber-800 font-bold' : 'text-[#5F86A6]'
                    }`}
                  >
                    {day.totalMinutes > 0 ? TaskService.formatMinutesToHours(day.totalMinutes) : '0m'}
                  </span>
                </div>
              </div>

              {/* Day Tasks List */}
              <div className="p-2.5 space-y-2 flex-1 overflow-y-auto max-h-[360px]">
                {day.tasks.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-center p-2 text-[11px] text-[#5F86A6]/70">
                    <span>No tasks planned</span>
                  </div>
                ) : (
                  day.tasks.map((task) => {
                    const isDone = task.status === 'completed' || task.completed;
                    return (
                      <div
                        key={task.id}
                        className={`p-2.5 rounded-xl border text-xs transition-all space-y-1.5 group ${
                          isDone
                            ? 'bg-[#EDF4FA]/40 border-[#CFE3F1] opacity-75'
                            : 'bg-white border-[#CFE3F1] shadow-2xs hover:border-[#8FB6D8]'
                        }`}
                      >
                        {/* Task Priority & Subject */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#243A5E] truncate" title={task.subject}>
                            {task.subject}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                              task.priority === 'high'
                                ? 'bg-amber-100 text-amber-900'
                                : task.priority === 'medium'
                                ? 'bg-[#CFE3F1] text-[#243A5E]'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </div>

                        {/* Title & Topic */}
                        <div className="flex items-start gap-1.5">
                          <button
                            type="button"
                            onClick={() => onToggleTask(task.id, !isDone)}
                            className="mt-0.5 text-[#243A5E] hover:text-green-700 transition-colors shrink-0"
                            title={isDone ? 'Mark as todo' : 'Mark as completed'}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-[#5F86A6]" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`font-semibold leading-tight line-clamp-2 ${
                                isDone ? 'line-through text-[#5F86A6]' : 'text-[#243A5E]'
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.topic && (
                              <span className="text-[10px] text-[#5F86A6] block mt-0.5 truncate">
                                {task.topic}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Footer: duration + actions */}
                        <div className="pt-1.5 border-t border-[#EDF4FA] flex items-center justify-between text-[10px] text-[#5F86A6]">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {task.estimatedMinutes}m
                          </span>

                          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => onRescheduleTask(task)}
                              className="p-1 hover:text-[#243A5E] transition-colors"
                              title="Reschedule"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditTask(task)}
                              className="p-1 hover:text-[#243A5E] transition-colors"
                              title="Edit task"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 hover:text-red-600 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Day Footer / Add Action */}
              <div className="p-2 border-t border-[#EDF4FA] bg-[#EDF4FA]/30 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => onAddTaskForDate(day.date)}
                  className="w-full py-1.5 text-[11px] font-semibold text-[#5F86A6] hover:text-[#243A5E] hover:bg-white rounded-lg transition-all flex items-center justify-center gap-1 border border-transparent hover:border-[#CFE3F1]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

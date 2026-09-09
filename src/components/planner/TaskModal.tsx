import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, BookOpen } from 'lucide-react';
import { StudyTask, TaskPriority } from '../../types';
import { Button } from '../common/Button';
import { Input, Select } from '../common/FormField';
import { TaskService } from '../../services/planner/taskService';

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<StudyTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateTask?: (taskId: string, updates: Partial<StudyTask>) => Promise<void>;
  editingTask?: StudyTask | null;
  reschedulingTask?: StudyTask | null;
  existingTasks?: StudyTask[];
  availableSubjects?: string[];
}

const COMMON_SUBJECTS = [
  'Mathematics',
  'Mathematical Literacy',
  'Physical Sciences',
  'Life Sciences',
  'English Home Language',
  'English First Additional Language',
  'Afrikaans Home Language',
  'Afrikaans First Additional Language',
  'isiXhosa Home Language',
  'isiXhosa First Additional Language',
  'Accounting',
  'Business Studies',
  'Economics',
  'History',
  'Geography',
  'Information Technology (IT)',
  'Computer Applications Technology (CAT)',
  'Engineering Graphics & Design (EGD)',
  'Life Orientation',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  onUpdateTask,
  editingTask,
  reschedulingTask,
  existingTasks = [],
  availableSubjects = COMMON_SUBJECTS,
}) => {
  const isReschedule = Boolean(reschedulingTask);
  const isEditing = Boolean(editingTask) && !isReschedule;

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(availableSubjects[0] || 'Mathematics');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [dueDate, setDueDate] = useState(TaskService.formatDate(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reschedulingTask) {
      setDueDate(TaskService.findNextAvailableDate(existingTasks, new Date()));
      setError(null);
    } else if (editingTask) {
      setTitle(editingTask.title);
      setSubject(editingTask.subject);
      setTopic(editingTask.topic || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setEstimatedMinutes(editingTask.estimatedMinutes || 45);
      setDueDate(editingTask.dueDate || TaskService.formatDate(new Date()));
      setError(null);
    } else {
      setTitle('');
      setSubject(availableSubjects[0] || 'Mathematics');
      setTopic('');
      setDescription('');
      setPriority('medium');
      setEstimatedMinutes(45);
      setDueDate(TaskService.formatDate(new Date()));
      setError(null);
    }
  }, [editingTask, reschedulingTask, isOpen, availableSubjects, existingTasks]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isReschedule && reschedulingTask) {
      if (!dueDate) {
        setError('Please select a valid date to reschedule.');
        return;
      }
      setIsSubmitting(true);
      try {
        if (onUpdateTask) {
          await onUpdateTask(reschedulingTask.id, { dueDate });
        }
        onClose();
      } catch (err: any) {
        setError(err?.message || 'Failed to reschedule task.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!subject.trim()) {
      setError('Subject is required.');
      return;
    }
    if (!dueDate) {
      setError('Due date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editingTask && onUpdateTask) {
        await onUpdateTask(editingTask.id, {
          title: title.trim(),
          subject: subject.trim(),
          topic: topic.trim() || undefined,
          description: description.trim() || `Revision for ${subject}`,
          priority,
          estimatedMinutes: Number(estimatedMinutes),
          dueDate,
        });
      } else {
        await onSaveTask({
          title: title.trim(),
          subject: subject.trim(),
          topic: topic.trim() || undefined,
          description: description.trim() || `Revision for ${subject}`,
          priority,
          status: 'todo',
          completed: false,
          source: 'manual',
          estimatedMinutes: Number(estimatedMinutes),
          dueDate,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save study task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickReschedule = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setDueDate(TaskService.formatDate(d));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#243A5E]/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#CFE3F1] shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#EDF4FA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EDF4FA] text-[#243A5E] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#243A5E]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#243A5E]">
                {isReschedule ? 'Reschedule Study Task' : isEditing ? 'Edit Study Task' : 'Add Study Task'}
              </h3>
              <p className="text-xs text-[#5F86A6]">
                {isReschedule
                  ? 'Assign a new balanced study date without overloading your schedule.'
                  : 'Structured revision aligned with your Grade 11/12 curriculum.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#5F86A6] hover:bg-[#EDF4FA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isReschedule && reschedulingTask && (
            <div className="p-3.5 rounded-xl bg-[#EDF4FA]/60 border border-[#CFE3F1] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#243A5E]">{reschedulingTask.subject}</span>
                <span className="text-[11px] font-semibold text-[#5F86A6]">
                  Past Due: {reschedulingTask.dueDate || 'Unscheduled'}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#243A5E]">{reschedulingTask.title}</p>
              <div className="pt-2 border-t border-[#CFE3F1]/50 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#5F86A6]">Quick Pick:</span>
                <button
                  type="button"
                  onClick={() => handleQuickReschedule(0)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[#CFE3F1] text-[#243A5E] font-medium hover:border-[#243A5E]"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReschedule(1)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[#CFE3F1] text-[#243A5E] font-medium hover:border-[#243A5E]"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDueDate(TaskService.findNextAvailableDate(existingTasks, new Date()))
                  }
                  className="px-2.5 py-1 text-xs rounded-lg bg-[#243A5E] text-white font-medium hover:bg-[#1C2E4A]"
                >
                  Balanced Slot
                </button>
              </div>
            </div>
          )}

          {!isReschedule && (
            <>
              <Input
                id="task-modal-title"
                label="Task Title"
                placeholder="e.g. Practice 2023 Calculus cubic graphs past paper questions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  id="task-modal-subject"
                  label="Subject"
                  options={availableSubjects.map((s) => ({ label: s, value: s }))}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <Input
                  id="task-modal-topic"
                  label="Topic (Optional)"
                  placeholder="e.g. Calculus, Trigonometry, Organic Chemistry"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243A5E] mb-1.5">
                  Task Description & Goals
                </label>
                <textarea
                  id="task-modal-desc"
                  rows={2}
                  className="w-full rounded-xl border border-[#CFE3F1] p-3 text-sm text-[#243A5E] focus:outline-none focus:border-[#8FB6D8] focus:ring-1 focus:ring-[#8FB6D8]"
                  placeholder="Briefly describe what you will focus on or complete..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  id="task-modal-priority"
                  label="Priority Level"
                  options={[
                    { label: 'High Priority (Remediation)', value: 'high' },
                    { label: 'Medium Priority (Revision)', value: 'medium' },
                    { label: 'Low Priority (Enrichment)', value: 'low' },
                  ]}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                />

                <Select
                  id="task-modal-duration"
                  label="Estimated Duration"
                  options={[
                    { label: '15 minutes', value: '15' },
                    { label: '30 minutes', value: '30' },
                    { label: '45 minutes', value: '45' },
                    { label: '60 minutes (1 hour)', value: '60' },
                    { label: '90 minutes (1.5 hours)', value: '90' },
                    { label: '120 minutes (2 hours)', value: '120' },
                  ]}
                  value={String(estimatedMinutes)}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                />
              </div>
            </>
          )}

          <Input
            id="task-modal-due-date"
            label={isReschedule ? 'New Target Date' : 'Target Study Date'}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          <div className="pt-3 border-t border-[#EDF4FA] flex items-center justify-end gap-2.5">
            <Button variant="outline" size="md" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isReschedule
                ? 'Confirm Reschedule'
                : isEditing
                ? 'Update Task'
                : 'Add Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

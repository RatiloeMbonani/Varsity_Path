import React, { useState, useEffect } from 'react';
import { X, Award, AlertTriangle } from 'lucide-react';
import { StudentGoal } from '../../types';
import { Button } from '../common/Button';
import { Input, Select } from '../common/FormField';
import { GoalService } from '../../services/planner/goalService';

export interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoal: (goal: Omit<StudentGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateGoal?: (goalId: string, updates: Partial<StudentGoal>) => Promise<void>;
  editingGoal?: StudentGoal | null;
  availableSubjects?: string[];
  initialSubject?: string;
  initialCurrentMark?: number;
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

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSaveGoal,
  onUpdateGoal,
  editingGoal,
  availableSubjects = COMMON_SUBJECTS,
  initialSubject,
  initialCurrentMark = 50,
}) => {
  const isEditing = Boolean(editingGoal);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(initialSubject || availableSubjects[0] || 'Mathematics');
  const [currentMark, setCurrentMark] = useState(String(initialCurrentMark));
  const [targetMark, setTargetMark] = useState('70');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setSubject(editingGoal.subject);
      setCurrentMark(String(editingGoal.currentMark));
      setTargetMark(String(editingGoal.targetMark));
      setTargetDate(editingGoal.targetDate || '');
      setNotes(editingGoal.notes || '');
      setError(null);
    } else {
      const sub = initialSubject || availableSubjects[0] || 'Mathematics';
      setSubject(sub);
      setCurrentMark(String(initialCurrentMark));
      setTargetMark('70');
      setTitle(`Improve ${sub} to 70%`);
      setTargetDate('');
      setNotes('');
      setError(null);
    }
  }, [editingGoal, isOpen, initialSubject, initialCurrentMark, availableSubjects]);

  if (!isOpen) return null;

  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    if (!isEditing || !title || title.startsWith('Improve ')) {
      setTitle(`Improve ${newSubject} to ${targetMark || 70}%`);
    }
  };

  const handleTargetChange = (newTarget: string) => {
    setTargetMark(newTarget);
    if (!isEditing || !title || title.startsWith('Improve ')) {
      setTitle(`Improve ${subject} to ${newTarget || 70}%`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numCurrent = Number(currentMark);
    const numTarget = Number(targetMark);

    const validation = GoalService.validateGoalInput(title, subject, numCurrent, numTarget);
    if (!validation.valid) {
      setError(validation.error || 'Invalid goal input');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editingGoal && onUpdateGoal) {
        await onUpdateGoal(editingGoal.id, {
          title: title.trim(),
          subject: subject.trim(),
          currentMark: numCurrent,
          targetMark: numTarget,
          targetPercentage: numTarget,
          targetDate: targetDate || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await onSaveGoal({
          title: title.trim(),
          subject: subject.trim(),
          currentMark: numCurrent,
          targetMark: numTarget,
          targetPercentage: numTarget,
          status: 'active',
          targetDate: targetDate || undefined,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#243A5E]/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#CFE3F1] shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#EDF4FA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EDF4FA] text-[#243A5E] flex items-center justify-center">
              <Award className="w-5 h-5 text-[#243A5E]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#243A5E]">
                {isEditing ? 'Edit Academic Goal' : 'Create Academic Goal'}
              </h3>
              <p className="text-xs text-[#5F86A6]">
                Define clear mark benchmarks to generate personalized revision plans.
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

          <Input
            id="goal-modal-title"
            label="Goal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Select
            id="goal-modal-subject"
            label="Subject"
            options={availableSubjects.map((s) => ({ label: s, value: s }))}
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <Input
              id="goal-modal-current"
              label="Current Mark (%)"
              type="number"
              min="0"
              max="100"
              value={currentMark}
              onChange={(e) => setCurrentMark(e.target.value)}
              required
            />
            <Input
              id="goal-modal-target"
              label="Target Mark (%)"
              type="number"
              min="1"
              max="100"
              value={targetMark}
              onChange={(e) => handleTargetChange(e.target.value)}
              required
            />
          </div>

          <Input
            id="goal-modal-date"
            label="Target Milestone Date (Optional)"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          <div>
            <label className="block text-xs font-bold text-[#243A5E] mb-1.5">
              Target Notes (Optional)
            </label>
            <textarea
              id="goal-modal-notes"
              rows={2}
              className="w-full rounded-xl border border-[#CFE3F1] p-3 text-sm text-[#243A5E] focus:outline-none focus:border-[#8FB6D8] focus:ring-1 focus:ring-[#8FB6D8]"
              placeholder="e.g. Aiming for Engineering faculty minimum requirement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-[#EDF4FA] flex items-center justify-end gap-2.5">
            <Button variant="outline" size="md" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Goal' : 'Save Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

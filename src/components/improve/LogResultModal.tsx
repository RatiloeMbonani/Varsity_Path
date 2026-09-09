import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input, Select, FormField } from '../common/FormField';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/ErrorState';
import { ImproveResult } from '../../types';
import { PlusCircle, Edit3, UploadCloud } from 'lucide-react';
import { DocumentUploadSection } from './DocumentUploadSection';

export interface LogResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResultAdded: (result: ImproveResult) => void;
  onSaveResult: (result: Omit<ImproveResult, 'id' | 'createdAt'>) => Promise<ImproveResult>;
  onSaveMultipleResults?: (
    results: Array<Omit<ImproveResult, 'id' | 'createdAt'>>
  ) => Promise<ImproveResult[]>;
  onMultipleResultsAdded?: (results: ImproveResult[]) => void;
}

const CAPS_SUBJECTS = [
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

export const LogResultModal: React.FC<LogResultModalProps> = ({
  isOpen,
  onClose,
  onResultAdded,
  onSaveResult,
  onSaveMultipleResults,
  onMultipleResultsAdded,
}) => {
  // Option 1: 'manual' | Option 2: 'upload'
  const [entryMode, setEntryMode] = useState<'manual' | 'upload'>('manual');

  // Manual Form State
  const [subject, setSubject] = useState(CAPS_SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [mark, setMark] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation rules:
    // 1. Subject is required.
    if (!subject || !subject.trim()) {
      setError('Subject is required.');
      return;
    }

    // 2. Topic is required.
    if (!topic || !topic.trim()) {
      setError('Topic is required.');
      return;
    }

    // 3. Mark is required & must be numeric.
    if (mark === '' || mark.trim() === '') {
      setError('Mark is required.');
      return;
    }

    const numMark = Number(mark);
    if (isNaN(numMark)) {
      setError('Mark must be numeric.');
      return;
    }

    // 4. Mark must be between 0 and 100.
    if (numMark < 0 || numMark > 100) {
      setError('Mark must be between 0 and 100.');
      return;
    }

    // 5. Date is required.
    if (!date || !date.trim()) {
      setError('Date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await onSaveResult({
        subject: subject.trim(),
        topic: topic.trim(),
        mark: Math.round(numMark),
        date: date.trim(),
        percentage: Math.round(numMark),
        notes: notes.trim() || undefined,
      });

      onResultAdded(saved);

      // Reset form
      setTopic('');
      setMark('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save result to Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload confirmation handler
  const handleUploadConfirmed = async (
    resultsToSave: Array<Omit<ImproveResult, 'id' | 'createdAt'>>
  ) => {
    if (onSaveMultipleResults) {
      const savedList = await onSaveMultipleResults(resultsToSave);
      if (onMultipleResultsAdded) {
        onMultipleResultsAdded(savedList);
      } else {
        savedList.forEach((item) => onResultAdded(item));
      }
    } else {
      for (const r of resultsToSave) {
        const saved = await onSaveResult(r);
        onResultAdded(saved);
      }
    }
    handleClose();
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const subjectOptions = CAPS_SUBJECTS.map((s) => ({ label: s, value: s }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Log a Result"
      description="Record an authentic assessment mark via manual entry or by uploading a test paper/report."
      maxWidth={entryMode === 'upload' ? 'lg' : 'md'}
    >
      {/* Option Selector Tabs */}
      <div className="mb-6 flex rounded-xl bg-[#EDF4FA] p-1 border border-[#CFE3F1]">
        <button
          type="button"
          onClick={() => {
            setEntryMode('manual');
            setError(null);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-bold transition-all ${
            entryMode === 'manual'
              ? 'bg-white text-[#243A5E] shadow-xs'
              : 'text-[#5F86A6] hover:text-[#243A5E]'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Manual Entry</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setEntryMode('upload');
            setError(null);
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-bold transition-all ${
            entryMode === 'upload'
              ? 'bg-white text-[#243A5E] shadow-xs'
              : 'text-[#5F86A6] hover:text-[#243A5E]'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-[#243A5E]" />
          <span>Upload Document (PDF / Image)</span>
        </button>
      </div>

      {entryMode === 'manual' ? (
        <>
          {error && (
            <div className="mb-4">
              <ErrorBanner
                title="Validation Notice"
                message={error}
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <Select
              id="log-subject"
              label="Subject"
              options={subjectOptions}
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (error) setError(null);
              }}
              required
            />

            {/* Topic */}
            <Input
              id="log-topic"
              label="Topic"
              required
              placeholder="e.g. Euclidean Geometry, Chemical Equilibrium, Genetics"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError(null);
              }}
            />

            {/* Mark & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="log-mark"
                label="Mark (0–100%)"
                type="number"
                min="0"
                max="100"
                step="1"
                required
                placeholder="e.g. 74"
                value={mark}
                onChange={(e) => {
                  setMark(e.target.value);
                  if (error) setError(null);
                }}
              />

              <Input
                id="log-date"
                label="Date"
                type="date"
                required
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            {/* Optional Topic notes / review points */}
            <FormField id="log-notes" label="Notes or Review Points (Optional)">
              <textarea
                id="log-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Lost marks on Euclidean theorem 2; revise question 4.2"
                className="w-full rounded-lg border border-[#CFE3F1] p-3 text-sm text-[#243A5E] placeholder-[#5F86A6]/60 focus:outline-none focus:ring-2 focus:ring-[#8FB6D8]"
              />
            </FormField>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Save Result
              </Button>
            </div>
          </form>
        </>
      ) : (
        <DocumentUploadSection
          onResultsConfirmed={handleUploadConfirmed}
          onSwitchToManual={() => setEntryMode('manual')}
          onCancel={handleClose}
        />
      )}
    </Modal>
  );
};

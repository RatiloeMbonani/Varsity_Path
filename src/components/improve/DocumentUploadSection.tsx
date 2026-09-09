import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  PlusCircle,
  Sparkles,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/ErrorState';
import { Input, Select } from '../common/FormField';
import {
  GeminiExtractionService,
  ExtractedAssessmentItem,
} from '../../services/geminiExtractionService';
import { ImproveResult } from '../../types';

export interface DocumentUploadSectionProps {
  onResultsConfirmed: (
    results: Array<Omit<ImproveResult, 'id' | 'createdAt'>>
  ) => Promise<void>;
  onSwitchToManual: () => void;
  onCancel: () => void;
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

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  onResultsConfirmed,
  onSwitchToManual,
  onCancel,
}) => {
  // Step in the upload flow: 'select' | 'analyzing' | 'confirm'
  const [step, setStep] = useState<'select' | 'analyzing' | 'confirm'>('select');

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extracted items awaiting student review and confirmation
  const [extractedItems, setExtractedItems] = useState<ExtractedAssessmentItem[]>([]);

  // Errors & loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [id: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMessage(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const name = file.name.toLowerCase();
    const isExtensionValid = validExtensions.some((ext) => name.endsWith(ext));

    if (!isExtensionValid) {
      setErrorMessage(
        'Invalid file type. Supported formats are PDF, PNG, JPG, and JPEG.'
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 20MB limit. Please upload a smaller file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
  };

  // Run Gemini extraction on the uploaded file
  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or drop a PDF or image file first.');
      return;
    }

    setStep('analyzing');
    setErrorMessage(null);

    const response = await GeminiExtractionService.extractFromDocument(selectedFile);

    if (!response.success || response.results.length === 0) {
      setStep('select');
      setErrorMessage(
        response.errorMessage ||
          'The uploaded document could not be reliably read as an academic test report. Please verify image clarity or enter results manually.'
      );
      return;
    }

    // Success: Populate editable confirmation screen
    setExtractedItems(response.results);
    setStep('confirm');
  };

  // Helper to update a specific field in an extracted item
  const handleItemFieldChange = (
    id: string,
    field: keyof ExtractedAssessmentItem,
    value: any
  ) => {
    setExtractedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Clear validation error for this item when edited
    if (validationErrors[id]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  // Delete an incorrectly extracted result
  const handleDeleteItem = (id: string) => {
    setExtractedItems((prev) => prev.filter((item) => item.id !== id));
    if (validationErrors[id]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  // Add a missing result manually
  const handleAddMissingItem = () => {
    const newItem: ExtractedAssessmentItem = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subject: CAPS_SUBJECTS[0],
      topic: '',
      mark: '',
      date: new Date().toISOString().split('T')[0],
      confidenceNotes: 'Manually added to extraction review',
    };
    setExtractedItems((prev) => [...prev, newItem]);
  };

  // Validate and Confirm: Save all reviewed items to Firestore
  const handleConfirmAndSave = async () => {
    const errors: { [id: string]: string } = {};

    if (extractedItems.length === 0) {
      setErrorMessage('No assessment results to save. Add at least one result or cancel.');
      return;
    }

    // Validate each item
    extractedItems.forEach((item, index) => {
      const numMark = Number(item.mark);
      if (!item.subject || !item.subject.trim()) {
        errors[item.id] = `Item #${index + 1}: Subject is required.`;
      } else if (!item.topic || !item.topic.trim()) {
        errors[item.id] = `Item #${index + 1}: Topic is required.`;
      } else if (item.mark === '' || isNaN(numMark) || numMark < 0 || numMark > 100) {
        errors[item.id] = `Item #${index + 1}: Mark must be a valid percentage between 0 and 100.`;
      } else if (!item.date || !item.date.trim()) {
        errors[item.id] = `Item #${index + 1}: Date is required.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setErrorMessage('Please correct the highlighted fields below before confirming.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Map to canonical ImproveResult schema
      const resultsToSave: Array<Omit<ImproveResult, 'id' | 'createdAt'>> = extractedItems.map(
        (item) => ({
          subject: item.subject.trim(),
          topic: item.topic.trim(),
          mark: Math.round(Number(item.mark)),
          date: item.date.trim(),
          percentage: Math.round(Number(item.mark)),
          notes: item.confidenceNotes
            ? `Extracted via document: ${item.confidenceNotes}`
            : undefined,
        })
      );

      await onResultsConfirmed(resultsToSave);
    } catch (err: any) {
      console.error('Failed to save confirmed results:', err);
      setErrorMessage(
        err?.message || 'Failed to save confirmed results to Firestore. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Reset back to file selection
  const handleResetToUpload = () => {
    setStep('select');
    setSelectedFile(null);
    setExtractedItems([]);
    setErrorMessage(null);
    setValidationErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <ErrorBanner
          title="Notice"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* STEP 1: File Selection & Dropzone */}
      {step === 'select' && (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragOver
                ? 'border-[#243A5E] bg-[#CFE3F1]/40'
                : 'border-[#8FB6D8] bg-white hover:border-[#243A5E] hover:bg-[#EDF4FA]/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CFE3F1] text-[#243A5E] mb-3">
              <UploadCloud className="h-7 w-7" />
            </div>

            <h3 className="text-base font-bold text-[#243A5E]">
              Upload Assessment Document or Photo
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#5F86A6] max-w-md mx-auto">
              Drag and drop your Grade 11 or 12 test paper, mark report, or rubrics, or click to browse.
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#5F86A6]">
              <span className="px-2 py-0.5 rounded bg-[#EDF4FA] border border-[#CFE3F1]">PDF</span>
              <span className="px-2 py-0.5 rounded bg-[#EDF4FA] border border-[#CFE3F1]">JPG</span>
              <span className="px-2 py-0.5 rounded bg-[#EDF4FA] border border-[#CFE3F1]">PNG</span>
              <span>(Max 20MB)</span>
            </div>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="flex items-center justify-between rounded-xl border border-[#CFE3F1] bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EDF4FA] text-[#243A5E]">
                  {selectedFile.name.toLowerCase().endsWith('.pdf') ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-bold text-[#243A5E]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-[#5F86A6]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSwitchToManual}
            >
              Switch to Manual Entry
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button type="button" variant="secondary" size="md" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={!selectedFile}
                onClick={handleStartAnalysis}
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                Analyze Document with Gemini
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Analyzing State */}
      {step === 'analyzing' && (
        <div className="rounded-2xl border border-[#CFE3F1] bg-white p-10 text-center space-y-4">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#CFE3F1]/70 text-[#243A5E]">
            <RefreshCw className="h-8 w-8 animate-spin text-[#243A5E]" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#243A5E]">
              Analyzing Assessment Document...
            </h3>
            <p className="text-xs sm:text-sm text-[#5F86A6] leading-relaxed">
              Gemini is examining your test script for Grade 11/12 subjects, topics, dates, and percentage marks.
            </p>
          </div>
          <p className="text-[11px] font-semibold text-[#8FB6D8]">
            AI extraction is preliminary — you will verify and edit all extracted records before saving.
          </p>
        </div>
      )}

      {/* STEP 3: Editable Confirmation Screen */}
      {step === 'confirm' && (
        <div className="space-y-5">
          {/* Important safety banner */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Verify Extracted Assessment Results</p>
              <p className="text-amber-800 text-xs leading-relaxed">
                Gemini extraction is an AI assist and is not automatically trusted. 
                Please inspect each subject, topic, mark, and date below. 
                Correct any errors, remove unwanted rows, or add missing marks before saving.
              </p>
            </div>
          </div>

          {/* List of Editable Items */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {extractedItems.map((item, index) => {
              const hasError = Boolean(validationErrors[item.id]);

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-all ${
                    hasError
                      ? 'border-red-300 bg-red-50/40'
                      : 'border-[#CFE3F1] bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EDF4FA]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#CFE3F1] text-[11px] font-bold text-[#243A5E]">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-[#243A5E]">
                        Assessment #{index + 1}
                      </span>
                      {item.confidenceNotes && (
                        <span className="hidden sm:inline-block text-[11px] font-medium text-[#5F86A6] bg-[#EDF4FA] px-2 py-0.5 rounded border border-[#CFE3F1]">
                          {item.confidenceNotes}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-[#5F86A6] hover:text-red-600 transition-colors rounded"
                      title="Discard this extracted result"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form fields for this result */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Subject */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#243A5E] mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        list="caps-subjects-list"
                        value={item.subject}
                        placeholder="e.g. Mathematics"
                        onChange={(e) =>
                          handleItemFieldChange(item.id, 'subject', e.target.value)
                        }
                        className={`w-full rounded-lg border px-3 py-1.5 text-xs text-[#243A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#8FB6D8] ${
                          !item.subject.trim()
                            ? 'border-red-300 bg-red-50/50'
                            : 'border-[#CFE3F1]'
                        }`}
                      />
                    </div>

                    {/* Topic */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#243A5E] mb-1">
                        Topic <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.topic}
                        placeholder="e.g. Euclidean Geometry"
                        onChange={(e) =>
                          handleItemFieldChange(item.id, 'topic', e.target.value)
                        }
                        className={`w-full rounded-lg border px-3 py-1.5 text-xs text-[#243A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#8FB6D8] ${
                          !item.topic.trim()
                            ? 'border-red-300 bg-red-50/50'
                            : 'border-[#CFE3F1]'
                        }`}
                      />
                    </div>

                    {/* Mark */}
                    <div>
                      <label className="block text-xs font-bold text-[#243A5E] mb-1">
                        Mark (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={item.mark}
                        placeholder="0-100"
                        onChange={(e) =>
                          handleItemFieldChange(
                            item.id,
                            'mark',
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                        className={`w-full rounded-lg border px-3 py-1.5 text-xs text-[#243A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#8FB6D8] ${
                          item.mark === '' ||
                          Number(item.mark) < 0 ||
                          Number(item.mark) > 100
                            ? 'border-red-300 bg-red-50/50'
                            : 'border-[#CFE3F1]'
                        }`}
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-bold text-[#243A5E] mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) =>
                          handleItemFieldChange(item.id, 'date', e.target.value)
                        }
                        className={`w-full rounded-lg border px-3 py-1.5 text-xs text-[#243A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#8FB6D8] ${
                          !item.date.trim()
                            ? 'border-red-300 bg-red-50/50'
                            : 'border-[#CFE3F1]'
                        }`}
                      />
                    </div>
                  </div>

                  {hasError && (
                    <p className="text-[11px] font-semibold text-red-600 mt-2">
                      {validationErrors[item.id]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Datalist of CAPS subjects for autocompletion */}
          <datalist id="caps-subjects-list">
            {CAPS_SUBJECTS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>

          {/* Add another result manually */}
          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddMissingItem}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Add Missing Result
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetToUpload}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Upload Different Document
            </Button>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#CFE3F1]">
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={isSaving}
              onClick={onCancel}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={isSaving}
                onClick={handleConfirmAndSave}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm & Save ({extractedItems.length} {extractedItems.length === 1 ? 'Result' : 'Results'})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

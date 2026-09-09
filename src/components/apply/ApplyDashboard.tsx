import React, { useState, useMemo } from 'react';
import {
  Send,
  PlusCircle,
  Trash2,
  AlertCircle,
  Building2,
  FileCheck2,
  ShieldAlert,
  GraduationCap,
  Info,
  Pencil,
} from 'lucide-react';
import { ApplyResult, StudentProfile } from '../../types';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { Input, Select } from '../common/FormField';
import { ResultTable, Column } from '../common/ResultTable';
import { calculateAllInstitutionScores } from '../../services/scoring/scoringEngine';
import { getCanonicalSubjectMap } from '../../services/scoring/subjectNormaliser';
import { InstitutionalScoreCard } from './InstitutionalScoreCard';
import { VarsityExplorerSection } from './VarsityExplorerSection';

export interface ApplyDashboardProps {
  student: StudentProfile;
  applyResults: ApplyResult[];
  onAddApplyResult: (subject: string, mark: number) => Promise<void>;
  onUpdateApplyResult?: (id: string, mark: number) => Promise<void>;
  onDeleteApplyResult: (id: string) => Promise<void>;
}

const COMMON_APPLY_SUBJECTS = [
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

export const ApplyDashboard: React.FC<ApplyDashboardProps> = ({
  student: _student,
  applyResults,
  onAddApplyResult,
  onUpdateApplyResult,
  onDeleteApplyResult,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(COMMON_APPLY_SUBJECTS[0]);
  const [mark, setMark] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editing state for updating a subject mark
  const [editingResult, setEditingResult] = useState<ApplyResult | null>(null);
  const [editMark, setEditMark] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Canonical normalization: count UNIQUE canonical subjects rather than raw database rows
  const { canonicalMap, uniqueCount, uniqueCanonicalSubjects } = useMemo(() => {
    return getCanonicalSubjectMap(applyResults);
  }, [applyResults]);

  const subjectCount = uniqueCount;
  const isBelowSeven = subjectCount < 7;
  const subjectsNeeded = Math.max(0, 7 - subjectCount);

  // Institution-aware calculation engine: runs ONLY on real Apply results when canonical threshold (>=7) is met
  const institutionalScores = useMemo(() => {
    if (isBelowSeven) return null;
    return calculateAllInstitutionScores(applyResults);
  }, [applyResults, isBelowSeven]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numMark = Number(mark);
    if (!selectedSubject) {
      setError('Please select a subject.');
      return;
    }
    if (isNaN(numMark) || numMark < 0 || numMark > 100) {
      setError('Please enter a valid mark percentage between 0 and 100.');
      return;
    }

    // Check if subject is already added
    const alreadyExists = applyResults.some(
      (r) => r.subject.toLowerCase() === selectedSubject.toLowerCase()
    );
    if (alreadyExists) {
      setError(`${selectedSubject} has already been added to your Apply subjects.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddApplyResult(selectedSubject, numMark);
      setMark('');
      setShowAddModal(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save subject mark.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult || !onUpdateApplyResult) return;

    const numMark = Number(editMark);
    if (isNaN(numMark) || numMark < 0 || numMark > 100) {
      setError('Please enter a valid mark percentage between 0 and 100.');
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateApplyResult(editingResult.id, numMark);
      setEditingResult(null);
      setEditMark('');
    } catch (err: any) {
      setError(err?.message || 'Failed to update subject mark.');
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: Column<ApplyResult>[] = [
    {
      key: 'subject',
      header: 'Subject',
      render: (r) => (
        <span className="font-bold text-[#243A5E]">{r.subject}</span>
      ),
    },
    {
      key: 'mark',
      header: 'Mark',
      align: 'center',
      render: (r) => (
        <span className="font-semibold text-sm text-[#243A5E]">
          {r.mark}%
        </span>
      ),
    },
    {
      key: 'nscLevel',
      header: 'NSC Rating Level',
      align: 'center',
      render: (r) => {
        const level =
          r.mark >= 80 ? 7 :
          r.mark >= 70 ? 6 :
          r.mark >= 60 ? 5 :
          r.mark >= 50 ? 4 :
          r.mark >= 40 ? 3 :
          r.mark >= 30 ? 2 : 1;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#CFE3F1] text-[#243A5E]">
            Level {level}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {onUpdateApplyResult && (
            <button
              type="button"
              onClick={() => {
                setEditingResult(r);
                setEditMark(String(r.mark));
              }}
              className="p-1.5 text-[#5F86A6] hover:text-[#243A5E] hover:bg-[#EDF4FA] transition-colors rounded"
              title="Edit mark"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDeleteApplyResult(r.id)}
            className="p-1.5 text-[#5F86A6] hover:text-red-600 hover:bg-red-50 transition-colors rounded"
            title="Remove subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const availableSubjects = COMMON_APPLY_SUBJECTS.filter(
    (s) => !applyResults.some((r) => r.subject.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Overview & Rule Card */}
      <div className="bg-[#CFE3F1]/40 border border-[#CFE3F1] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#243A5E]">Apply Results Record</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#CFE3F1] text-[#243A5E]">
                {subjectCount} / 7 Unique Subjects
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5F86A6] mt-1 max-w-2xl leading-relaxed">
              In accordance with National Senior Certificate (NSC) rules, university admissions evaluate your 7 matric subjects. 
              The Apply tab stores only your Subject and Mark independently from diagnostic test scores.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddModal(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="shrink-0"
          >
            Add Subject Mark
          </Button>
        </div>

        {/* 7 Subject Progress Bar */}
        <div className="mt-4 pt-4 border-t border-[#CFE3F1]/60">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F86A6] mb-1.5">
            <span>Matric Subject Requirement</span>
            <span>
              {subjectCount < 7
                ? `${7 - subjectCount} more required`
                : 'Requirement Met (7+ subjects entered)'}
            </span>
          </div>
          <div className="w-full bg-[#EDF4FA] rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                subjectCount >= 7 ? 'bg-green-600' : 'bg-[#243A5E]'
              }`}
              style={{ width: `${Math.min(100, (subjectCount / 7) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Subject Form */}
      {showAddModal && (
        <Card variant="elevated" className="border-[#8FB6D8]">
          <CardHeader
            title="Add Official Apply Subject"
            description="Enter your final or term subject mark (Subject and Mark only)."
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            }
          />
          {error && (
            <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Select
              id="apply-subject"
              label="Subject"
              options={
                availableSubjects.length > 0
                  ? availableSubjects.map((s) => ({ label: s, value: s }))
                  : [{ label: 'All standard subjects added', value: '' }]
              }
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="sm:col-span-2"
            />
            <Input
              id="apply-mark"
              label="Mark Percentage (%)"
              type="number"
              min="0"
              max="100"
              required
              placeholder="e.g. 78"
              value={mark}
              onChange={(e) => setMark(e.target.value)}
            />
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Save Subject Mark
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Subject Mark Modal */}
      {editingResult && (
        <Card variant="elevated" className="border-[#243A5E]">
          <CardHeader
            title={`Update Mark for ${editingResult.subject}`}
            description="Modify your recorded matric percentage. Eligibility recalculates automatically."
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingResult(null)}
              >
                Cancel
              </Button>
            }
          />
          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#243A5E] mb-1">Subject</label>
              <div className="p-2.5 bg-[#EDF4FA] rounded-lg text-sm font-semibold text-[#243A5E]">
                {editingResult.subject}
              </div>
            </div>
            <Input
              id="edit-apply-mark"
              label="Updated Mark (%)"
              type="number"
              min="0"
              max="100"
              required
              value={editMark}
              onChange={(e) => setEditMark(e.target.value)}
            />
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isUpdating}
              >
                Update Mark
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* State 1: Zero Apply Results */}
      {applyResults.length === 0 ? (
        <EmptyState
          icon={<Send className="w-8 h-8 text-[#243A5E]" />}
          title="No Apply Results Entered"
          description="Your official university pathway requires your 7 NSC subject marks. Enter your subjects to prepare your profile for APS calculation and eligibility filtering."
          primaryAction={
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowAddModal(true)}
              leftIcon={<PlusCircle className="w-5 h-5" />}
            >
              Add First Subject
            </Button>
          }
          hint="University recommendations and qualifying courses remain hidden until at least 7 subjects are recorded."
        />
      ) : (
        /* Table of Entered Apply Results */
        <Card variant="default">
          <CardHeader
            title="Recorded Subjects"
            description="Official subject marks used for admission screening."
            icon={<FileCheck2 className="w-5 h-5 text-[#243A5E]" />}
          />
          <ResultTable<ApplyResult>
            data={applyResults}
            columns={columns}
            keyExtractor={(item) => item.id}
          />
        </Card>
      )}

      {/* Gatekeeper Check: 7+ Unique Canonical Subjects */}
      {isBelowSeven ? (
        /* MANDATORY RULE: If fewer than 7 unique canonical subjects:
           - Do not show universities or programmes
           - Display exact prompt notice: "Add X more subjects to see which programmes you qualify for." */
        <div className="rounded-2xl border border-[#CFE3F1] bg-white p-8 sm:p-10 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#CFE3F1]/70 text-[#243A5E] mx-auto flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-[#243A5E]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-lg font-bold text-[#243A5E]">
              Add {subjectsNeeded} more {subjectsNeeded === 1 ? 'subject' : 'subjects'} to see which programmes you qualify for.
            </h4>
            <p className="text-sm text-[#5F86A6] leading-relaxed">
              You currently have {subjectCount} unique {subjectCount === 1 ? 'subject' : 'subjects'} recorded.
              South African universities evaluate admission against a minimum of 7 National Senior Certificate (NSC) subjects.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowAddModal(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Remaining Subjects ({subjectsNeeded} needed)
          </Button>
        </div>
      ) : (
        /* When 7+ Unique Canonical Subjects are recorded:
           1. Show "Courses You Qualify For" (Varsity Explorer)
           2. Show Institution Admission Scores & Ratings breakdown */
        <div className="space-y-10">
          {/* SECTION 1: Courses You Qualify For (Varsity Explorer) */}
          <VarsityExplorerSection
            applyResults={applyResults}
            institutionalScores={institutionalScores}
          />

          {/* SECTION 2: University Admission Scores & Ratings */}
          <div className="space-y-5 pt-6 border-t border-[#CFE3F1]">
            <div>
              <h3 className="text-xl font-bold text-[#243A5E]">
                University Admission Scores & Ratings
              </h3>
              <p className="text-xs sm:text-sm text-[#5F86A6] mt-0.5">
                Calculated using official South African institutional methodologies from your authentic Apply results.
              </p>
            </div>

            {/* Accuracy & Statutory Disclaimer Banner */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 flex items-start gap-3.5">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm text-amber-900 leading-relaxed">
                <p className="font-bold">
                  Important Admission Accuracy Notice
                </p>
                <p className="text-amber-800">
                  A score alone does not guarantee university admission. Admission into specific programmes requires meeting mandatory subject prerequisites (such as Pure Mathematics or Physical Sciences thresholds), minimum language benchmarks, and competitive faculty selection quotas.
                </p>
              </div>
            </div>

            {/* Institution Score Cards */}
            {institutionalScores && (
              <div className="space-y-5">
                <InstitutionalScoreCard scoreResult={institutionalScores.uct} />
                <InstitutionalScoreCard scoreResult={institutionalScores.uwc} />
                <InstitutionalScoreCard scoreResult={institutionalScores.stellenbosch} />
                <InstitutionalScoreCard scoreResult={institutionalScores.cput} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

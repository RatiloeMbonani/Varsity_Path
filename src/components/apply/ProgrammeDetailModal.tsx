import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  GraduationCap,
  Info,
  Calendar,
  ShieldCheck,
  Building2,
  BookOpen,
  Plus,
  BookmarkCheck,
} from 'lucide-react';
import { ProgrammeEligibilityResult } from '../../types/programme';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ProgrammeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: ProgrammeEligibilityResult | null;
  isTracking?: boolean;
  onTrackProgramme?: (evaluation: ProgrammeEligibilityResult) => Promise<void>;
  trackingLoading?: boolean;
}

export const ProgrammeDetailModal: React.FC<ProgrammeDetailModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  isTracking = false,
  onTrackProgramme,
  trackingLoading = false,
}) => {
  if (!evaluation) return null;

  const { programme, score, minimumScore, academicAverage, minimumAcademicAverage, satisfiedRequirements } =
    evaluation;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={programme.name}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 pt-2">
        {/* University & Faculty Header */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#CFE3F1]">
          <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#243A5E] text-white">
            {programme.universityName}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EDF4FA] text-[#243A5E]">
            {programme.faculty}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#CFE3F1] text-[#243A5E]">
            {programme.qualificationType} • {programme.durationYears} Years
          </span>
          {programme.degreeCode && (
            <span className="text-xs text-[#5F86A6] font-mono">
              Code: {programme.degreeCode}
            </span>
          )}
        </div>

        {/* Programme Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5F86A6]">
            Programme Overview
          </h4>
          <p className="text-sm text-[#243A5E] leading-relaxed">
            {programme.description}
          </p>
        </div>

        {/* Score & Academic Assessment Comparison */}
        <div className="bg-[#EDF4FA] rounded-xl p-4 border border-[#CFE3F1] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#243A5E] flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[#243A5E]" />
            Your Admission Evaluation
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {programme.scoringMethod === 'uct' && (
              <>
                <div className="bg-white p-3 rounded-lg border border-[#CFE3F1]/80">
                  <span className="text-[#5F86A6] block">Your UCT Admission Score:</span>
                  <span className="text-lg font-bold text-[#243A5E]">{score ?? '—'}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#CFE3F1]/80">
                  <span className="text-[#5F86A6] block">Published Minimum UCT Score:</span>
                  <span className="text-lg font-bold text-[#243A5E]">{minimumScore}</span>
                </div>
              </>
            )}

            {programme.scoringMethod === 'uwc' && (
              <>
                <div className="bg-white p-3 rounded-lg border border-[#CFE3F1]/80">
                  <span className="text-[#5F86A6] block">Your Total UWC Points:</span>
                  <span className="text-lg font-bold text-[#243A5E]">{score} pts</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#CFE3F1]/80">
                  <span className="text-[#5F86A6] block">Published Minimum UWC Points:</span>
                  <span className="text-lg font-bold text-[#243A5E]">{minimumScore} pts</span>
                </div>
              </>
            )}

            {programme.scoringMethod === 'stellenbosch' && (
              <>
                <div className="bg-white p-3 rounded-lg border border-[#CFE3F1]/80">
                  <span className="text-[#5F86A6] block">Your Matric Aggregate (ex-LO):</span>
                  <span className="text-lg font-bold text-[#243A5E]">{academicAverage}%</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#CFE3F1]/80">
                  <span className="text-[#5F86A6] block">Faculty Aggregate Benchmark:</span>
                  <span className="text-lg font-bold text-[#243A5E]">{minimumAcademicAverage}%</span>
                </div>
              </>
            )}

            {programme.scoringMethod === 'cput' && (
              <>
                <div className="bg-white p-3 rounded-lg border border-[#CFE3F1]/80">
                  <span className="text-[#5F86A6] block">Your CPUT Rating Score:</span>
                  <span className="text-lg font-bold text-[#243A5E]">{score}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#CFE3F1]/80">
                  <span className="text-[#5F86A6] block">Diploma Rating Benchmark:</span>
                  <span className="text-lg font-bold text-[#243A5E]">{minimumScore}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Satisfied Subject Prerequisites */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5F86A6]">
            Verified Subject Requirements
          </h4>
          <div className="space-y-2">
            {satisfiedRequirements.map((req, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{req.detail || req.title}</p>
                  {req.detail && req.title !== req.detail && (
                    <p className="text-emerald-800 text-[11px] mt-0.5">{req.title}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NBT Requirement Notice if configured */}
        {programme.nbtRequired && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-2.5 text-xs text-blue-950">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">National Benchmark Test (NBT) Notice:</span>
              <p className="text-blue-900 mt-0.5">
                {programme.nbtRequirementDescription ||
                  'This programme requires completion of the National Benchmark Tests (NBT) for final admission and faculty placement.'}
              </p>
            </div>
          </div>
        )}

        {/* Statutory Eligibility Notice (MANDATORY ACCURACY RULE) */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 space-y-1.5 text-xs text-amber-950">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Admission Status & Verification Notice</span>
          </div>
          <p className="leading-relaxed text-amber-900">
            <strong>You meet the published minimum requirements</strong> for this programme based on your entered Apply results.
            Meeting minimum requirements qualifies you to be considered in the university selection pool, but does not guarantee an offer of admission due to competitive faculty enrollment capacities.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-amber-800 border-t border-amber-200/60">
            <span>Academic Year: {programme.academicYear}</span>
            <span>Last Verified: {programme.lastVerified}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#CFE3F1]">
          <a
            href={programme.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#243A5E] hover:underline flex items-center gap-1.5"
          >
            <span>Visit Official University Programme Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            {onTrackProgramme && (
              isTracking ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  In Application Tracker
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="md"
                  disabled={trackingLoading}
                  onClick={() => onTrackProgramme(evaluation)}
                  className="flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#243A5E]" />
                  <span>{trackingLoading ? 'Adding...' : 'Track in Application Tracker'}</span>
                </Button>
              )
            )}

            <Button variant="primary" size="md" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

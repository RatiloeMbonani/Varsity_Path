import React from 'react';
import {
  GraduationCap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { ProgrammeEligibilityResult } from '../../types/programme';
import { Button } from '../common/Button';

interface ProgrammeCardProps {
  evaluation: ProgrammeEligibilityResult;
  onViewDetails: (evaluation: ProgrammeEligibilityResult) => void;
}

const UNIVERSITY_THEME: Record<
  string,
  { badgeBg: string; badgeText: string; accentBorder: string }
> = {
  uct: {
    badgeBg: 'bg-[#243A5E]/10',
    badgeText: 'text-[#243A5E]',
    accentBorder: 'hover:border-[#243A5E]',
  },
  stellenbosch: {
    badgeBg: 'bg-[#7A1C30]/10',
    badgeText: 'text-[#7A1C30]',
    accentBorder: 'hover:border-[#7A1C30]',
  },
  uwc: {
    badgeBg: 'bg-[#003B73]/10',
    badgeText: 'text-[#003B73]',
    accentBorder: 'hover:border-[#003B73]',
  },
  cput: {
    badgeBg: 'bg-[#006699]/10',
    badgeText: 'text-[#006699]',
    accentBorder: 'hover:border-[#006699]',
  },
};

export const ProgrammeCard: React.FC<ProgrammeCardProps> = ({
  evaluation,
  onViewDetails,
}) => {
  const { programme, score, minimumScore, academicAverage, minimumAcademicAverage, satisfiedRequirements } =
    evaluation;

  const theme = UNIVERSITY_THEME[programme.institutionId] || {
    badgeBg: 'bg-[#CFE3F1]',
    badgeText: 'text-[#243A5E]',
    accentBorder: 'hover:border-[#243A5E]',
  };

  // Score badge formatting depending on scoring methodology
  let scoreDisplay: React.ReactNode = null;
  if (programme.scoringMethod === 'uct') {
    scoreDisplay = (
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#5F86A6]">UCT Admission Score:</span>
        <span className="text-xs font-bold text-[#243A5E]">
          {score ?? '—'} <span className="font-normal text-[#5F86A6]">/ Min {minimumScore}</span>
        </span>
      </div>
    );
  } else if (programme.scoringMethod === 'uwc') {
    scoreDisplay = (
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#5F86A6]">UWC Points:</span>
        <span className="text-xs font-bold text-[#243A5E]">
          {score ?? '—'} pts <span className="font-normal text-[#5F86A6]">/ Min {minimumScore} pts</span>
        </span>
      </div>
    );
  } else if (programme.scoringMethod === 'stellenbosch') {
    scoreDisplay = (
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#5F86A6]">Academic Average (ex-LO):</span>
        <span className="text-xs font-bold text-[#243A5E]">
          {academicAverage}%{' '}
          {minimumAcademicAverage && (
            <span className="font-normal text-[#5F86A6]">/ Min {minimumAcademicAverage}%</span>
          )}
        </span>
      </div>
    );
  } else if (programme.scoringMethod === 'cput') {
    scoreDisplay = (
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#5F86A6]">CPUT Rating Points:</span>
        <span className="text-xs font-bold text-[#243A5E]">
          {score ?? '—'} <span className="font-normal text-[#5F86A6]">/ Min {minimumScore}</span>
        </span>
      </div>
    );
  }

  // Pick up to 3 satisfied key prerequisites to display on card
  const keySatisfiedSubjects = satisfiedRequirements.slice(0, 3);

  return (
    <div
      className={`rounded-2xl border border-[#CFE3F1] bg-white p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between gap-4 ${theme.accentBorder}`}
    >
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md tracking-tight ${theme.badgeBg} ${theme.badgeText}`}
          >
            {programme.universityName}
          </span>
          <span className="text-xs font-semibold text-[#5F86A6] px-2 py-0.5 rounded bg-[#EDF4FA]">
            {programme.faculty}
          </span>
        </div>

        {/* Programme Title */}
        <div>
          <h4 className="text-base sm:text-lg font-bold text-[#243A5E] leading-snug">
            {programme.name}
          </h4>
          <p className="text-xs text-[#5F86A6] mt-0.5">
            {programme.qualificationType} • {programme.durationYears ? `${programme.durationYears} Years` : 'Undergraduate'}
          </p>
        </div>

        {/* Score & Academic Requirement Metrics */}
        <div className="bg-[#EDF4FA]/70 rounded-xl p-3 border border-[#CFE3F1]/70">
          {scoreDisplay}
        </div>

        {/* Key Satisfied Prerequisites */}
        {keySatisfiedSubjects.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5F86A6]">
              Prerequisites Met
            </p>
            <div className="space-y-1">
              {keySatisfiedSubjects.map((req, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-[#243A5E]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{req.detail || req.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[#CFE3F1]/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Qualifies for Consideration</span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails(evaluation)}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          View Programme
        </Button>
      </div>
    </div>
  );
};

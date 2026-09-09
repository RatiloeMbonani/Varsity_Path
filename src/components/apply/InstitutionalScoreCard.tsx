import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { InstitutionalScoreResult } from '../../types/scoring';

interface InstitutionalScoreCardProps {
  scoreResult: InstitutionalScoreResult;
}

export const InstitutionalScoreCard: React.FC<InstitutionalScoreCardProps> = ({
  scoreResult,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    institutionId,
    institutionName,
    scoreLabel,
    hasUniversalScore,
    score,
    maxPossibleScore,
    methodologyName,
    methodologyDescription,
    methodologySource,
    subjectsUsed,
    subjectsExcluded,
    baselineMetrics,
    disclaimer,
    institutionalNotes,
  } = scoreResult;

  return (
    <div
      id={`score-card-${institutionId}`}
      className="bg-white rounded-2xl border border-[#CFE3F1] shadow-2xs overflow-hidden transition-all duration-200"
    >
      {/* Card Header & Primary Score Row */}
      <div className="p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EDF4FA] text-[#243A5E] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#243A5E]">{institutionName}</h4>
                <p className="text-xs font-semibold text-[#5F86A6]">{scoreLabel}</p>
              </div>
            </div>
            <p className="text-xs text-[#5F86A6] leading-relaxed pt-1">
              {methodologyDescription}
            </p>
          </div>

          {/* Primary Metric Display */}
          <div className="flex flex-col items-start md:items-end justify-center shrink-0 bg-[#F4F8FC] px-5 py-4 rounded-xl border border-[#CFE3F1]/70">
            {hasUniversalScore && score !== null ? (
              <div className="text-left md:text-right">
                <span className="text-xs font-semibold text-[#5F86A6] block uppercase tracking-wider">
                  {scoreLabel}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-[#243A5E]">
                    {score}
                  </span>
                  {maxPossibleScore && (
                    <span className="text-sm font-semibold text-[#5F86A6]">
                      / {maxPossibleScore}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 inline-block mt-1">
                  Authentic Apply Results
                </span>
              </div>
            ) : (
              <div className="text-left md:text-right max-w-xs">
                <span className="text-xs font-semibold text-[#5F86A6] block uppercase tracking-wider">
                  Evaluation Model
                </span>
                <span className="text-sm sm:text-base font-bold text-[#243A5E] block mt-0.5">
                  Programme-Specific
                </span>
                <span className="text-[11px] font-medium text-[#243A5E] bg-[#CFE3F1]/60 px-2 py-0.5 rounded border border-[#CFE3F1] inline-block mt-1">
                  No Universal APS
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Baseline Profile Highlights */}
        <div className="mt-5 pt-4 border-t border-[#EDF4FA] flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="text-[#5F86A6] font-semibold">Student Profile:</span>

          <span className="bg-[#EDF4FA] text-[#243A5E] px-2.5 py-1 rounded-md font-medium border border-[#CFE3F1]/70">
            Academic Average (excl. LO):{' '}
            <strong className="font-bold">{baselineMetrics.academicAverageExcludingLO}%</strong>
          </span>

          {baselineMetrics.englishMark !== undefined && (
            <span className="bg-[#EDF4FA] text-[#243A5E] px-2.5 py-1 rounded-md font-medium border border-[#CFE3F1]/70">
              English:{' '}
              <strong className="font-bold">
                {baselineMetrics.englishMark}% (Level {baselineMetrics.englishLevel})
              </strong>
            </span>
          )}

          {baselineMetrics.mathsMark !== undefined && (
            <span className="bg-[#EDF4FA] text-[#243A5E] px-2.5 py-1 rounded-md font-medium border border-[#CFE3F1]/70">
              {baselineMetrics.mathsType}:{' '}
              <strong className="font-bold">
                {baselineMetrics.mathsMark}% (Level {baselineMetrics.mathsLevel})
              </strong>
            </span>
          )}

          <button
            type="button"
            id={`toggle-breakdown-${institutionId}`}
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[#243A5E] hover:text-[#5F86A6] transition-colors py-1 px-2 rounded hover:bg-[#EDF4FA]"
          >
            <span>{isExpanded ? 'Hide Calculation Details' : 'How this score was calculated'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable "How this score was calculated" Drawer */}
      {isExpanded && (
        <div
          id={`breakdown-panel-${institutionId}`}
          className="bg-[#FAFBFD] border-t border-[#CFE3F1] p-6 space-y-6"
        >
          {/* Institutional Methodology Rules */}
          <div className="bg-white rounded-xl p-4 border border-[#CFE3F1] space-y-2">
            <div className="flex items-center gap-2 text-[#243A5E]">
              <BookOpen className="w-4 h-4 text-[#5F86A6]" />
              <h5 className="text-xs font-bold uppercase tracking-wider">
                Official Methodology: {methodologyName}
              </h5>
            </div>
            <p className="text-xs text-[#5F86A6] leading-relaxed">
              Source: <span className="font-semibold text-[#243A5E]">{methodologySource}</span>
            </p>
            {institutionalNotes && institutionalNotes.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 text-xs text-[#243A5E]">
                {institutionalNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#5F86A6] font-bold">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Subjects Used Table (For institutions with universal score) */}
          {hasUniversalScore && subjectsUsed.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-[#243A5E] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Subjects Used ({subjectsUsed.length} subjects)
                </h5>
                <span className="text-xs text-[#5F86A6]">
                  Points Contributed towards {scoreLabel}
                </span>
              </div>

              <div className="border border-[#CFE3F1] rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#EDF4FA] text-[#243A5E] font-bold border-b border-[#CFE3F1]">
                      <tr>
                        <th className="py-2.5 px-3 sm:px-4">Subject</th>
                        <th className="py-2.5 px-3 text-center">Mark %</th>
                        <th className="py-2.5 px-3 text-center">NSC Level</th>
                        <th className="py-2.5 px-3">Rule Applied</th>
                        <th className="py-2.5 px-3 sm:px-4 text-right">Points / Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF4FA]">
                      {subjectsUsed.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 sm:px-4 font-bold text-[#243A5E]">
                            {item.subjectName}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-[#243A5E]">
                            {item.mark}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EDF4FA] text-[#243A5E]">
                              Level {item.nscLevel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#5F86A6] text-[11px]">
                            {item.scoringRule || item.reason}
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 text-right font-black text-[#243A5E]">
                            +{item.pointsContributed}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#F4F8FC] border-t-2 border-[#CFE3F1] font-bold text-[#243A5E]">
                      <tr>
                        <td colSpan={4} className="py-3 px-3 sm:px-4 text-right">
                          Total {scoreLabel}:
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right font-black text-sm text-[#243A5E]">
                          {score}
                          {maxPossibleScore ? ` / ${maxPossibleScore}` : ''}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Subjects Excluded Table */}
          {hasUniversalScore && subjectsExcluded.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-[#243A5E] uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-[#5F86A6]" />
                Subjects Excluded ({subjectsExcluded.length})
              </h5>

              <div className="border border-[#CFE3F1] rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-[#5F86A6] font-semibold border-b border-[#CFE3F1]">
                      <tr>
                        <th className="py-2 px-3 sm:px-4">Subject</th>
                        <th className="py-2 px-3 text-center">Mark %</th>
                        <th className="py-2 px-3">Reason for Exclusion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF4FA]">
                      {subjectsExcluded.map((item, idx) => (
                        <tr key={idx} className="text-[#5F86A6]">
                          <td className="py-2.5 px-3 sm:px-4 font-medium text-[#243A5E]">
                            {item.subjectName}
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium">
                            {item.mark}%
                          </td>
                          <td className="py-2.5 px-3 text-xs text-[#5F86A6]">
                            {item.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Narrative for Stellenbosch & CPUT (No universal APS) */}
          {!hasUniversalScore && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-[#CFE3F1] space-y-3">
                <h5 className="text-xs font-bold text-[#243A5E] uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#243A5E]" />
                  Why is there no universal APS for {institutionName}?
                </h5>
                <p className="text-xs sm:text-sm text-[#5F86A6] leading-relaxed">
                  {institutionId === 'stellenbosch'
                    ? 'Stellenbosch University does not use a single generic APS formula across all faculties. Instead, each degree qualification assesses applicants through specific minimum requirements (NSC Bachelor endorsement, language thresholds, pure Mathematics minimums) and competitive faculty-weighted selection formulas. In the next stage, your actual subject marks will be evaluated against specific degree requirements.'
                    : 'CPUT operates with differentiated admission criteria depending on the qualification type (Bachelor Degrees vs National Diplomas vs Extended Curriculum Programmes / ECP). Faculties such as Engineering and Applied Sciences apply specialized rating calculations that cannot be accurately represented by a single universal institution score.'}
                </p>

                <div className="pt-2 border-t border-[#EDF4FA]">
                  <h6 className="text-xs font-bold text-[#243A5E] mb-2">
                    Key Evaluation Dimensions:
                  </h6>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#FAFBFD] rounded-lg border border-[#EDF4FA]">
                      <span className="text-[11px] font-bold text-[#243A5E] block">
                        1. Minimum Admission
                      </span>
                      <span className="text-[11px] text-[#5F86A6] mt-0.5 block">
                        Statutory NSC endorsement & minimum language percentages.
                      </span>
                    </div>
                    <div className="p-3 bg-[#FAFBFD] rounded-lg border border-[#EDF4FA]">
                      <span className="text-[11px] font-bold text-[#243A5E] block">
                        2. Subject Prerequisites
                      </span>
                      <span className="text-[11px] text-[#5F86A6] mt-0.5 block">
                        Mandatory subjects (e.g. Pure Maths, Physical Sciences) & minimum levels.
                      </span>
                    </div>
                    <div className="p-3 bg-[#FAFBFD] rounded-lg border border-[#EDF4FA]">
                      <span className="text-[11px] font-bold text-[#243A5E] block">
                        3. Faculty Selection
                      </span>
                      <span className="text-[11px] text-[#5F86A6] mt-0.5 block">
                        Competitive merit ranking formulas evaluated per programme.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Official Accuracy Disclaimer */}
          <div className="flex items-start gap-2 text-xs text-[#5F86A6] bg-[#EDF4FA]/60 p-3 rounded-lg border border-[#CFE3F1]/80">
            <HelpCircle className="w-4 h-4 text-[#243A5E] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#243A5E] font-semibold">Important Accuracy Notice: </strong>
              {disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

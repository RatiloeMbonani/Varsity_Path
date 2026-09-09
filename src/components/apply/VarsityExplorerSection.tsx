import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Building2,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { ApplyResult } from '../../types';
import { ProgrammeEligibilityResult } from '../../types/programme';
import { InstitutionId, InstitutionalScoreResult } from '../../types/scoring';
import { PROGRAMMES_DATABASE } from '../../data/programmes';
import {
  evaluateAllProgrammes,
} from '../../services/scoring/eligibilityEngine';
import {
  getCanonicalSubjectMap,
} from '../../services/scoring/subjectNormaliser';
import { ProgrammeCard } from './ProgrammeCard';
import { ProgrammeDetailModal } from './ProgrammeDetailModal';
import { Input } from '../common/FormField';

interface VarsityExplorerSectionProps {
  applyResults: ApplyResult[];
  institutionalScores: Record<InstitutionId, InstitutionalScoreResult> | null;
}

const INSTITUTION_NAMES: Record<InstitutionId, string> = {
  uct: 'University of Cape Town (UCT)',
  stellenbosch: 'Stellenbosch University (SU)',
  uwc: 'University of the Western Cape (UWC)',
  cput: 'Cape Peninsula University of Technology (CPUT)',
};

export const VarsityExplorerSection: React.FC<VarsityExplorerSectionProps> = ({
  applyResults,
  institutionalScores,
}) => {
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<ProgrammeEligibilityResult | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | InstitutionId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Evaluate eligibility across all programmes deterministically
  const { groupedEligible, totalEligibleCount, allEvaluations } = useMemo(() => {
    if (!institutionalScores || applyResults.length < 7) {
      return {
        groupedEligible: { uct: [], stellenbosch: [], uwc: [], cput: [] },
        totalEligibleCount: 0,
        allEvaluations: [],
      };
    }

    const evaluation = evaluateAllProgrammes(
      PROGRAMMES_DATABASE,
      applyResults,
      institutionalScores
    );

    // Development-only diagnostic logging per prompt specification
    if (process.env.NODE_ENV !== 'production') {
      const { canonicalMap, uniqueCount, uniqueCanonicalSubjects } =
        getCanonicalSubjectMap(applyResults);

      console.log('[VarsityPath Apply Pipeline] Diagnostic Evaluation:');
      console.log('Apply Results:', applyResults);
      console.log('Normalized Subjects:', uniqueCanonicalSubjects);
      console.log('Unique Subject Count:', uniqueCount);
      console.log('Institution Scores:', {
        uct: institutionalScores.uct?.score,
        uwc: institutionalScores.uwc?.score,
        stellenbosch: institutionalScores.stellenbosch?.score,
        cput: institutionalScores.cput?.score,
      });
      console.log('Programmes Evaluated:', evaluation.allEvaluations.length);
      console.log('Eligible Programmes:', evaluation.totalEligibleCount);
    }

    return evaluation;
  }, [applyResults, institutionalScores]);

  // Universities that have at least one qualifying programme
  const activeInstitutions = useMemo(() => {
    const list: InstitutionId[] = ['uct', 'stellenbosch', 'uwc', 'cput'];
    return list.filter((inst) => (groupedEligible[inst]?.length ?? 0) > 0);
  }, [groupedEligible]);

  // Filter programmes by active tab and search query
  const filteredProgrammes = useMemo(() => {
    let progs: ProgrammeEligibilityResult[] = [];
    if (activeTab === 'all') {
      progs = [
        ...groupedEligible.uct,
        ...groupedEligible.stellenbosch,
        ...groupedEligible.uwc,
        ...groupedEligible.cput,
      ];
    } else {
      progs = groupedEligible[activeTab] || [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      progs = progs.filter(
        (e) =>
          e.programme.name.toLowerCase().includes(q) ||
          e.programme.faculty.toLowerCase().includes(q) ||
          e.programme.universityName.toLowerCase().includes(q)
      );
    }

    return progs;
  }, [groupedEligible, activeTab, searchQuery]);

  return (
    <div className="space-y-6 pt-4 border-t border-[#CFE3F1]">
      {/* Section Title & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#243A5E]">
              Courses You Qualify For
            </h3>
            {totalEligibleCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {totalEligibleCount} {totalEligibleCount === 1 ? 'Programme' : 'Programmes'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#5F86A6] mt-1 max-w-2xl leading-relaxed">
            Evaluated directly against official minimum published criteria, prerequisite subject marks, and institutional points scales.
          </p>
        </div>

        {totalEligibleCount > 0 && (
          <div className="w-full md:w-72">
            <Input
              id="search-eligible-programmes"
              placeholder="Search by degree or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Case 1: No eligible programmes found */}
      {totalEligibleCount === 0 ? (
        <div className="rounded-2xl border border-[#CFE3F1] bg-white p-8 sm:p-12 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#CFE3F1]/70 text-[#243A5E] mx-auto flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-[#243A5E]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-lg font-bold text-[#243A5E]">
              No matching programmes yet
            </h4>
            <p className="text-sm text-[#5F86A6] leading-relaxed">
              We couldn't find programmes that match your current Apply results.
            </p>
            <p className="text-xs text-[#5F86A6] pt-1">
              Check your results and programme requirements. Verify that compulsory subjects (such as Pure Mathematics, Physical Sciences, or English benchmarks) have been correctly entered with your latest marks.
            </p>
          </div>
        </div>
      ) : (
        /* Case 2: One or more eligible programmes found */
        <div className="space-y-6">
          {/* Institution Filter Pills: ONLY shows institutions with at least one eligible programme */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#243A5E] text-white shadow-xs'
                  : 'bg-[#EDF4FA] text-[#243A5E] hover:bg-[#CFE3F1]'
              }`}
            >
              All Universities ({totalEligibleCount})
            </button>
            {activeInstitutions.map((inst) => {
              const count = groupedEligible[inst].length;
              return (
                <button
                  key={inst}
                  type="button"
                  onClick={() => setActiveTab(inst)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    activeTab === inst
                      ? 'bg-[#243A5E] text-white shadow-xs'
                      : 'bg-[#EDF4FA] text-[#243A5E] hover:bg-[#CFE3F1]'
                  }`}
                >
                  {INSTITUTION_NAMES[inst]} ({count})
                </button>
              );
            })}
          </div>

          {/* Grouped by University Display */}
          {activeTab === 'all' ? (
            <div className="space-y-8">
              {activeInstitutions.map((inst) => {
                const institutionProgrammes = groupedEligible[inst].filter(
                  (e) =>
                    !searchQuery.trim() ||
                    e.programme.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                    e.programme.faculty.toLowerCase().includes(searchQuery.toLowerCase().trim())
                );

                if (institutionProgrammes.length === 0) return null;

                return (
                  <div key={inst} className="space-y-4">
                    {/* Institution Group Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#CFE3F1]">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#243A5E]" />
                        <h4 className="text-base font-bold text-[#243A5E]">
                          {INSTITUTION_NAMES[inst]}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-[#5F86A6]">
                        {institutionProgrammes.length}{' '}
                        {institutionProgrammes.length === 1 ? 'programme' : 'programmes'}
                      </span>
                    </div>

                    {/* Programme Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {institutionProgrammes.map((evaluation) => (
                        <ProgrammeCard
                          key={evaluation.programme.id}
                          evaluation={evaluation}
                          onViewDetails={(ev) => setSelectedEvaluation(ev)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Single Institution Tab View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#CFE3F1]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#243A5E]" />
                  <h4 className="text-base font-bold text-[#243A5E]">
                    {INSTITUTION_NAMES[activeTab]}
                  </h4>
                </div>
                <span className="text-xs font-semibold text-[#5F86A6]">
                  {filteredProgrammes.length}{' '}
                  {filteredProgrammes.length === 1 ? 'programme' : 'programmes'}
                </span>
              </div>

              {filteredProgrammes.length === 0 ? (
                <p className="text-xs text-[#5F86A6] italic py-4">
                  No programmes match your current search query in this institution.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProgrammes.map((evaluation) => (
                    <ProgrammeCard
                      key={evaluation.programme.id}
                      evaluation={evaluation}
                      onViewDetails={(ev) => setSelectedEvaluation(ev)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Programme Detail Modal */}
      <ProgrammeDetailModal
        isOpen={selectedEvaluation !== null}
        onClose={() => setSelectedEvaluation(null)}
        evaluation={selectedEvaluation}
      />
    </div>
  );
};

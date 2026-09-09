import React, { useState, useMemo } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  History,
  Filter,
  Plus,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { StudentApplication, ApplicationStatus } from '../../types';
import { ApplyResult } from '../../types';
import { InstitutionalScoreResult, InstitutionId } from '../../types/scoring';
import { PROGRAMMES_DATABASE } from '../../data/programmes';
import { evaluateProgrammeEligibility } from '../../services/scoring/eligibilityEngine';
import { Button } from '../common/Button';
import { Input } from '../common/FormField';

interface ApplicationTrackerProps {
  userId: string;
  applications: StudentApplication[];
  applyResults: ApplyResult[];
  institutionalScores: Record<InstitutionId, InstitutionalScoreResult> | null;
  onUpdateApplication: (applicationId: string, updates: Partial<StudentApplication>) => Promise<void>;
  onDeleteApplication: (applicationId: string) => Promise<void>;
  onOpenProgrammeDetails?: (programmeId: string) => void;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  planning: {
    label: 'Planning',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
  },
  not_started: {
    label: 'Not Started',
    bg: 'bg-zinc-100',
    text: 'text-zinc-800',
    border: 'border-zinc-300',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  submitted: {
    label: 'Submitted',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  rejected: {
    label: 'Not Accepted',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
  },
  waitlisted: {
    label: 'Waitlisted',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
};

const ALL_STATUSES: ApplicationStatus[] = [
  'planning',
  'not_started',
  'in_progress',
  'submitted',
  'under_review',
  'accepted',
  'rejected',
  'waitlisted',
];

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  userId,
  applications,
  applyResults,
  institutionalScores,
  onUpdateApplication,
  onDeleteApplication,
  onOpenProgrammeDetails,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedUnivFilter, setSelectedUnivFilter] = useState<string>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Check eligibility of each tracked programme dynamically against current Apply results
  const applicationEligibility = useMemo(() => {
    const map = new Map<string, { isEligible: boolean; message: string }>();

    for (const app of applications) {
      const prog = PROGRAMMES_DATABASE.find((p) => p.id === app.programmeId);
      if (!prog) {
        map.set(app.id, {
          isEligible: false,
          message: 'Programme details unverified in database.',
        });
        continue;
      }

      if (applyResults.length < 7 || !institutionalScores) {
        map.set(app.id, {
          isEligible: false,
          message: 'Current results have fewer than 7 unique subjects.',
        });
        continue;
      }

      const evalResult = evaluateProgrammeEligibility(
        prog,
        applyResults,
        institutionalScores[prog.institutionId]
      );

      map.set(app.id, {
        isEligible: evalResult.eligible,
        message: evalResult.eligible
          ? 'Meets current published requirements'
          : `Current results may not meet requirements (${evalResult.failedRequirements.length} unmet)`,
      });
    }

    return map;
  }, [applications, applyResults, institutionalScores]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (selectedStatusFilter !== 'all' && app.status !== selectedStatusFilter) {
        return false;
      }
      if (selectedUnivFilter !== 'all' && app.universityId !== selectedUnivFilter) {
        return false;
      }
      return true;
    });
  }, [applications, selectedStatusFilter, selectedUnivFilter]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setActionLoadingId(appId);
    setActionError(null);
    try {
      await onUpdateApplication(appId, { status: newStatus });
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update application status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveNotes = async (appId: string) => {
    setActionLoadingId(appId);
    setActionError(null);
    try {
      await onUpdateApplication(appId, { notes: tempNotes });
      setEditingNotesId(null);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to save notes.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeadlineChange = async (appId: string, newDeadline: string) => {
    setActionLoadingId(appId);
    setActionError(null);
    try {
      await onUpdateApplication(appId, { submissionDeadline: newDeadline });
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update deadline.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (appId: string, name: string) => {
    if (window.confirm(`Remove "${name}" from your Application Tracker?`)) {
      setActionLoadingId(appId);
      setActionError(null);
      try {
        await onDeleteApplication(appId);
      } catch (err: any) {
        setActionError(err?.message || 'Failed to remove application.');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-[#CFE3F1]">
      {/* Header and Mandatory Statutory Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#243A5E]">
              Application Tracker
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EDF4FA] text-[#243A5E] border border-[#CFE3F1]">
              {applications.length} {applications.length === 1 ? 'Tracked' : 'Tracked'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5F86A6] mt-1">
            Organize application milestones, track deadlines, and log institutional communications.
          </p>
        </div>
      </div>

      {/* Mandatory Statutory Submission Disclaimer per Section 12 */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-2.5 text-xs text-blue-950">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Official Application Portal Reminder</span>
          <p className="text-blue-900 leading-relaxed">
            VarsityPath is an independent tracking and advisory tool. VarsityPath <strong>does not automatically submit</strong> applications on your behalf. Applications must be completed and submitted directly through official university online admissions portals before institutional deadlines.
          </p>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
          {actionError}
        </div>
      )}

      {/* Case 1: Empty state (Section 22 Mandate) */}
      {applications.length === 0 ? (
        <div className="rounded-2xl border border-[#CFE3F1] bg-white p-8 sm:p-12 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#CFE3F1]/70 text-[#243A5E] mx-auto flex items-center justify-center">
            <Building2 className="w-7 h-7 text-[#243A5E]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-lg font-bold text-[#243A5E]">
              Track your university applications.
            </h4>
            <p className="text-sm text-[#5F86A6] leading-relaxed">
              Explore qualifying programmes from the Varsity Explorer above, click on any degree to review detailed requirements, and select <strong>"Track in Application Tracker"</strong> to record your deadlines, status changes, and application notes.
            </p>
          </div>
        </div>
      ) : (
        /* Case 2: List of applications with filters */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#CFE3F1]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#5F86A6] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter by:
              </span>

              {/* Status Filter */}
              <select
                id="tracker-status-filter"
                aria-label="Filter applications by status"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#CFE3F1] bg-[#EDF4FA] text-[#243A5E] focus:outline-hidden focus:ring-1 focus:ring-[#243A5E]"
              >
                <option value="all">All Statuses ({applications.length})</option>
                {ALL_STATUSES.map((st) => {
                  const count = applications.filter((a) => a.status === st).length;
                  if (count === 0) return null;
                  return (
                    <option key={st} value={st}>
                      {STATUS_CONFIG[st].label} ({count})
                    </option>
                  );
                })}
              </select>

              {/* University Filter */}
              <select
                id="tracker-univ-filter"
                aria-label="Filter applications by university"
                value={selectedUnivFilter}
                onChange={(e) => setSelectedUnivFilter(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#CFE3F1] bg-[#EDF4FA] text-[#243A5E] focus:outline-hidden focus:ring-1 focus:ring-[#243A5E]"
              >
                <option value="all">All Universities</option>
                <option value="uct">University of Cape Town</option>
                <option value="stellenbosch">Stellenbosch University</option>
                <option value="uwc">University of the Western Cape</option>
                <option value="cput">CPUT</option>
              </select>
            </div>

            <span className="text-xs text-[#5F86A6]">
              Showing {filteredApplications.length} of {applications.length}
            </span>
          </div>

          {/* Application Cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredApplications.map((app) => {
              const elig = applicationEligibility.get(app.id);
              const isEligible = elig?.isEligible ?? false;
              const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.planning;
              const isEditingNotes = editingNotesId === app.id;
              const isHistoryOpen = expandedHistoryId === app.id;
              const isBusy = actionLoadingId === app.id;

              return (
                <div
                  key={app.id}
                  className="rounded-xl border border-[#CFE3F1] bg-white p-4 sm:p-5 shadow-2xs space-y-4 hover:border-[#243A5E]/40 transition-colors"
                >
                  {/* Top Bar: University, Status Dropdown, Delete */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#CFE3F1]/70">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#EDF4FA] text-[#243A5E]">
                          {app.universityName}
                        </span>
                        <span className="text-xs text-[#5F86A6]">{app.faculty}</span>
                      </div>
                      <h4 className="text-base font-bold text-[#243A5E] mt-1">
                        {app.programmeName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status Selector */}
                      <div className="flex items-center gap-1.5">
                        <label htmlFor={`status-${app.id}`} className="text-xs text-[#5F86A6] font-medium hidden sm:inline">
                          Status:
                        </label>
                        <select
                          id={`status-${app.id}`}
                          aria-label={`Update status for ${app.programmeName}`}
                          value={app.status}
                          disabled={isBusy}
                          onChange={(e) =>
                            handleStatusChange(app.id, e.target.value as ApplicationStatus)
                          }
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border ${statusCfg.border} ${statusCfg.bg} ${statusCfg.text} focus:outline-hidden focus:ring-2 focus:ring-[#243A5E] cursor-pointer`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {STATUS_CONFIG[st].label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(app.id, app.programmeName)}
                        disabled={isBusy}
                        aria-label={`Remove ${app.programmeName} from tracker`}
                        className="p-1.5 text-[#5F86A6] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove from tracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: Dynamic Eligibility Indicator & Deadline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Section 13: Dynamic Eligibility relationship */}
                    <div
                      className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                        isEligible
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-amber-50/80 border-amber-200 text-amber-950'
                      }`}
                    >
                      {isEligible ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold block">
                          {isEligible
                            ? 'Meets Current Requirements'
                            : 'Results May No Longer Satisfy Minimum Requirements'}
                        </span>
                        <p className="text-[11px] opacity-90 mt-0.5">
                          {elig?.message}
                        </p>
                      </div>
                    </div>

                    {/* Deadline Field */}
                    <div className="p-2.5 rounded-lg border border-[#CFE3F1] bg-[#EDF4FA]/50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[#5F86A6]">
                        <Calendar className="w-4 h-4 text-[#243A5E]" />
                        <span className="font-medium">Target / Portal Deadline:</span>
                      </div>
                      <input
                        type="date"
                        aria-label={`Submission deadline for ${app.programmeName}`}
                        value={app.submissionDeadline || ''}
                        disabled={isBusy}
                        onChange={(e) => handleDeadlineChange(app.id, e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded bg-white border border-[#CFE3F1] text-[#243A5E] focus:outline-hidden focus:ring-1 focus:ring-[#243A5E]"
                      />
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#5F86A6] flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Application Notes:
                      </span>
                      {!isEditingNotes && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempNotes(app.notes || '');
                            setEditingNotesId(app.id);
                          }}
                          className="text-[11px] font-semibold text-[#243A5E] hover:underline"
                        >
                          {app.notes ? 'Edit Note' : '+ Add Note'}
                        </button>
                      )}
                    </div>

                    {isEditingNotes ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="e.g. Application reference number, portal username, certified copies status..."
                          className="w-full text-xs p-2.5 rounded-lg border border-[#CFE3F1] bg-white text-[#243A5E] focus:outline-hidden focus:ring-1 focus:ring-[#243A5E]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingNotesId(null)}
                            className="px-2.5 py-1 text-xs text-[#5F86A6] hover:text-[#243A5E]"
                          >
                            Cancel
                          </button>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => handleSaveNotes(app.id)}
                          >
                            Save Note
                          </Button>
                        </div>
                      </div>
                    ) : app.notes ? (
                      <p className="text-[#243A5E] bg-[#EDF4FA]/30 p-2.5 rounded-lg border border-[#CFE3F1]/60 leading-relaxed">
                        {app.notes}
                      </p>
                    ) : (
                      <p className="text-[#5F86A6] italic">No personal notes saved yet.</p>
                    )}
                  </div>

                  {/* Bottom Row: Status History Drawer & Programme Navigation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#CFE3F1]/50 text-xs">
                    <button
                      type="button"
                      onClick={() => setExpandedHistoryId(isHistoryOpen ? null : app.id)}
                      className="flex items-center gap-1 text-[#5F86A6] hover:text-[#243A5E] font-medium"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Status History ({app.statusHistory?.length || 1})</span>
                      {isHistoryOpen ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {onOpenProgrammeDetails && (
                      <button
                        type="button"
                        onClick={() => onOpenProgrammeDetails(app.programmeId)}
                        className="text-xs font-semibold text-[#243A5E] hover:underline flex items-center gap-1"
                      >
                        <span>View Programme Requirements</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Expanded Status History */}
                  {isHistoryOpen && (
                    <div className="p-3 bg-[#EDF4FA] rounded-lg border border-[#CFE3F1] space-y-2 text-xs">
                      <span className="font-bold text-[#243A5E] block">
                        Status Transition Log:
                      </span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {(app.statusHistory || []).map((entry, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-2 bg-white p-2 rounded border border-[#CFE3F1]/80 text-[11px]"
                          >
                            <div>
                              <span className="font-bold text-[#243A5E] capitalize">
                                {STATUS_CONFIG[entry.status]?.label || entry.status}
                              </span>
                              {entry.notes && (
                                <p className="text-[#5F86A6] mt-0.5">{entry.notes}</p>
                              )}
                            </div>
                            <span className="text-[#5F86A6] font-mono shrink-0">
                              {new Date(entry.changedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { StudentProfileHeader } from './components/layout/StudentProfileHeader';
import { LandingPage } from './components/dashboard/LandingPage';
import { ImproveDashboard } from './components/improve/ImproveDashboard';
import { LogResultModal } from './components/improve/LogResultModal';
import { ApplyDashboard } from './components/apply/ApplyDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { LoadingState } from './components/common/LoadingState';
import { ErrorBanner } from './components/common/ErrorState';
import { StudentDataService } from './services/studentDataService';
import {
  ImproveResult,
  ApplyResult,
  StudentGoal,
  StudyTask,
} from './types';

function MainApplication() {
  const { student, isAuthenticated, loading, authError, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<'improve' | 'apply'>('improve');

  // Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');

  // Log Result Modal state
  const [logModalOpen, setLogModalOpen] = useState(false);

  // Authenticated Student Data State (isolated by student.uid)
  const [improveResults, setImproveResults] = useState<ImproveResult[]>([]);
  const [applyResults, setApplyResults] = useState<ApplyResult[]>([]);
  const [goals, setGoals] = useState<StudentGoal[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch student-isolated data when authenticated student changes
  const loadStudentData = useCallback(async (uid: string) => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [imp, app, g, t] = await Promise.all([
        StudentDataService.getImproveResults(uid),
        StudentDataService.getApplyResults(uid),
        StudentDataService.getGoals(uid),
        StudentDataService.getStudyTasks(uid),
      ]);
      setImproveResults(imp);
      setApplyResults(app);
      setGoals(g);
      setStudyTasks(t);
    } catch (err: any) {
      console.error('Error fetching student data:', err);
      setDataError('Unable to load student records from storage.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && student?.uid) {
      loadStudentData(student.uid);
    } else {
      // Clear data on sign out to prevent leakage
      setImproveResults([]);
      setApplyResults([]);
      setGoals([]);
      setStudyTasks([]);
    }
  }, [isAuthenticated, student?.uid, loadStudentData]);

  // Open auth modal with mode
  const handleOpenAuth = (mode: 'signin' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Handlers for Improve tab
  const handleSaveImproveResult = async (
    result: Omit<ImproveResult, 'id' | 'createdAt'>
  ): Promise<ImproveResult> => {
    if (!student?.uid) throw new Error('Student not authenticated.');
    return await StudentDataService.addImproveResult(student.uid, result);
  };

  const handleSaveMultipleImproveResults = async (
    results: Array<Omit<ImproveResult, 'id' | 'createdAt'>>
  ): Promise<ImproveResult[]> => {
    if (!student?.uid) throw new Error('Student not authenticated.');
    return await StudentDataService.addMultipleImproveResults(student.uid, results);
  };

  const handleResultAdded = (newResult: ImproveResult) => {
    setImproveResults((prev) => [newResult, ...prev]);
  };

  const handleMultipleResultsAdded = (newResults: ImproveResult[]) => {
    setImproveResults((prev) => [...newResults, ...prev]);
  };

  const handleDeleteImproveResult = async (resultId: string) => {
    if (!student?.uid) return;
    try {
      await StudentDataService.deleteImproveResult(student.uid, resultId);
      setImproveResults((prev) => prev.filter((r) => r.id !== resultId));
    } catch (err: any) {
      setDataError(err?.message || 'Failed to delete result.');
    }
  };

  const handleAddGoal = async (goal: Omit<StudentGoal, 'id' | 'createdAt'>) => {
    if (!student?.uid) return;
    try {
      const saved = await StudentDataService.addGoal(student.uid, goal);
      setGoals((prev) => [saved, ...prev]);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to add goal.');
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<StudentGoal>) => {
    if (!student?.uid) return;
    try {
      await StudentDataService.updateGoal(student.uid, goalId, updates);
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
      );
    } catch (err: any) {
      setDataError(err?.message || 'Failed to update goal.');
    }
  };

  const handleToggleGoalStatus = async (goalId: string, completed: boolean) => {
    await handleUpdateGoal(goalId, { status: completed ? 'completed' : 'active' });
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!student?.uid) return;
    try {
      await StudentDataService.deleteGoal(student.uid, goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err: any) {
      setDataError(err?.message || 'Failed to delete goal.');
    }
  };

  const handleAddTask = async (task: Omit<StudyTask, 'id' | 'createdAt'>) => {
    if (!student?.uid) return;
    try {
      const saved = await StudentDataService.addStudyTask(student.uid, task);
      setStudyTasks((prev) => [saved, ...prev]);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to add study task.');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<StudyTask>) => {
    if (!student?.uid) return;
    try {
      await StudentDataService.updateStudyTask(student.uid, taskId, updates);
      setStudyTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
      );
    } catch (err: any) {
      setDataError(err?.message || 'Failed to update study task.');
    }
  };

  const handleRescheduleTask = async (taskId: string, newDueDate: string) => {
    if (!student?.uid) return;
    try {
      await StudentDataService.rescheduleStudyTask(student.uid, taskId, newDueDate);
      setStudyTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, dueDate: newDueDate, updatedAt: new Date().toISOString() } : t))
      );
    } catch (err: any) {
      setDataError(err?.message || 'Failed to reschedule task.');
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!student?.uid) return;
    try {
      await StudentDataService.toggleStudyTask(student.uid, taskId, completed);
      setStudyTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed,
                status: completed ? 'completed' : 'todo',
                completedAt: completed ? new Date().toISOString() : undefined,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
    } catch (err: any) {
      setDataError(err?.message || 'Failed to update study task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!student?.uid) return;
    try {
      await StudentDataService.deleteStudyTask(student.uid, taskId);
      setStudyTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      setDataError(err?.message || 'Failed to delete task.');
    }
  };

  // Handlers for Apply tab
  const handleAddApplyResult = async (subject: string, mark: number) => {
    if (!student?.uid) return;
    const saved = await StudentDataService.saveApplyResult(student.uid, subject, mark);
    setApplyResults((prev) => [...prev, saved]);
  };

  const handleUpdateApplyResult = async (resultId: string, mark: number) => {
    if (!student?.uid) return;
    try {
      await StudentDataService.updateApplyResult(student.uid, resultId, mark);
      setApplyResults((prev) =>
        prev.map((r) => (r.id === resultId ? { ...r, mark } : r))
      );
    } catch (err: any) {
      setDataError(err?.message || 'Failed to update apply subject.');
    }
  };

  const handleDeleteApplyResult = async (resultId: string) => {
    if (!student?.uid) return;
    try {
      await StudentDataService.deleteApplyResult(student.uid, resultId);
      setApplyResults((prev) => prev.filter((r) => r.id !== resultId));
    } catch (err: any) {
      setDataError(err?.message || 'Failed to delete apply subject.');
    }
  };

  // Initial authentication loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#EDF4FA] flex items-center justify-center">
        <LoadingState
          message="Restoring student session..."
          description="Connecting to your isolated student workspace."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF4FA] text-[#243A5E] flex flex-col selection:bg-[#CFE3F1]">
      {/* Universal Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'improve' | 'apply')}
      />

      {/* Global Error Banner if any */}
      {(authError || dataError) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <ErrorBanner
            title="System Notice"
            message={authError || dataError || ''}
            onDismiss={() => {
              clearError();
              setDataError(null);
            }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {!isAuthenticated || !student ? (
          /* STATE 1: Signed out */
          <LandingPage onOpenAuth={handleOpenAuth} />
        ) : (
          /* Authenticated Experience: Improve & Apply tabs */
          <div>
            {/* Student Profile Header */}
            <StudentProfileHeader
              student={student}
              onLogResult={() => setLogModalOpen(true)}
              activeTab={activeTab}
            />

            {/* Tab Navigation Controls */}
            <div className="flex border-b border-[#CFE3F1] mb-6">
              <button
                type="button"
                id="tab-improve-btn"
                onClick={() => setActiveTab('improve')}
                className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'improve'
                    ? 'border-[#243A5E] text-[#243A5E]'
                    : 'border-transparent text-[#5F86A6] hover:text-[#243A5E]'
                }`}
              >
                Improve Dashboard
                {improveResults.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#CFE3F1] text-[#243A5E]">
                    {improveResults.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                id="tab-apply-btn"
                onClick={() => setActiveTab('apply')}
                className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'apply'
                    ? 'border-[#243A5E] text-[#243A5E]'
                    : 'border-transparent text-[#5F86A6] hover:text-[#243A5E]'
                }`}
              >
                Apply (Varsity Pathway)
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#CFE3F1] text-[#243A5E]">
                  {applyResults.length}/7
                </span>
              </button>
            </div>

            {/* Tab Content Panels */}
            {dataLoading ? (
              <LoadingState
                message="Retrieving student records..."
                description="Loading your secure assessment records from storage."
              />
            ) : activeTab === 'improve' ? (
              <ImproveDashboard
                student={student}
                results={improveResults}
                goals={goals}
                studyTasks={studyTasks}
                onOpenLogModal={() => setLogModalOpen(true)}
                onDeleteResult={handleDeleteImproveResult}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
                onToggleGoalStatus={handleToggleGoalStatus}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onRescheduleTask={handleRescheduleTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            ) : (
              <ApplyDashboard
                student={student}
                applyResults={applyResults}
                onAddApplyResult={handleAddApplyResult}
                onUpdateApplyResult={handleUpdateApplyResult}
                onDeleteApplyResult={handleDeleteApplyResult}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#CFE3F1] bg-white py-6 text-center text-xs text-[#5F86A6]">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-[#243A5E]">
            VarsityPath — Education Platform for Western Cape Grade 11 & 12 Learners
          </p>
          <p>
            Curriculum aligned with CAPS and Admission Point Score (APS) requirements for UCT, Stellenbosch, UWC, and CPUT.
          </p>
        </div>
      </footer>

      {/* Auth Modal (Sign In & Create Account) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Log Result Modal */}
      {isAuthenticated && (
        <LogResultModal
          isOpen={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          onResultAdded={handleResultAdded}
          onSaveResult={handleSaveImproveResult}
          onSaveMultipleResults={handleSaveMultipleImproveResults}
          onMultipleResultsAdded={handleMultipleResultsAdded}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}

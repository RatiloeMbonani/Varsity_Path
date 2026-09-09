import React from 'react';
import { BookOpen, Send, GraduationCap, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-16 space-y-12">
      {/* Welcome Hero - Signed-out State 1 */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CFE3F1] text-[#243A5E] text-xs font-bold tracking-wide shadow-2xs">
          <GraduationCap className="w-4 h-4 text-[#243A5E]" />
          <span>Western Cape Grade 11 & 12 Student Pathway</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#243A5E] tracking-tight leading-tight">
          Welcome to VarsityPath
        </h1>

        <p className="text-base sm:text-lg text-[#5F86A6] leading-relaxed max-w-2xl mx-auto">
          Your focused platform for high school subject mastery and Western Cape university admissions. 
          Sign in or create your student account to log authentic assessment results and track your path to university.
        </p>

        {/* Clear Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => onOpenAuth('register')}
            leftIcon={<UserPlus className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Create Student Account
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onOpenAuth('signin')}
            leftIcon={<LogIn className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Two Core Pillars Explanation (No fake data or metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        {/* Improve Pillar */}
        <Card variant="default" className="flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#CFE3F1] text-[#243A5E] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#5F86A6] uppercase tracking-wider">
                Module 01
              </span>
              <h2 className="text-xl font-bold text-[#243A5E] mt-1">
                Improve: Diagnostic Learning
              </h2>
            </div>
            <p className="text-sm text-[#5F86A6] leading-relaxed">
              Once you sign in and log your actual test and exam results, your personal dashboard calculates your real mastery ring, highlights genuine subject strengths, pinpoints specific knowledge gaps, and organizes your study goals.
            </p>
            <div className="pt-2 text-xs text-[#243A5E] font-medium space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5F86A6]" />
                <span>Log actual tests, practicals, and term exams</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5F86A6]" />
                <span>Computed mastery ring based on verified scores</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5F86A6]" />
                <span>Personal study planner and target grade goals</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Apply Pillar */}
        <Card variant="default" className="flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#CFE3F1] text-[#243A5E] flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#5F86A6] uppercase tracking-wider">
                Module 02
              </span>
              <h2 className="text-xl font-bold text-[#243A5E] mt-1">
                Apply: University Pathways
              </h2>
            </div>
            <p className="text-sm text-[#5F86A6] leading-relaxed">
              Enter your official 7 subjects to compute your true Admission Point Score (APS) and explore eligible programmes across leading Western Cape institutions: UCT, Stellenbosch, UWC, and CPUT.
            </p>
            <div className="pt-2 text-xs text-[#243A5E] font-medium space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5F86A6]" />
                <span>Independent 7-subject NSC results structure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5F86A6]" />
                <span>Strict eligibility checking (no ineligible listings)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5F86A6]" />
                <span>Western Cape universities: UCT, SU, UWC, CPUT</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Security & Student Privacy Banner */}
      <div className="rounded-2xl bg-[#CFE3F1]/40 border border-[#CFE3F1] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white border border-[#CFE3F1] text-[#243A5E] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#243A5E]">
              Student Data Isolation & Privacy
            </h4>
            <p className="text-xs text-[#5F86A6] mt-0.5">
              Each student record is protected and accessible only by your authenticated profile. No public or shared marks.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onOpenAuth('register')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shrink-0"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

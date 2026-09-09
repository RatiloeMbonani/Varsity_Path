import React from 'react';
import { School, User, MapPin, Target, PlusCircle } from 'lucide-react';
import { StudentProfile } from '../../types';
import { Button } from '../common/Button';

export interface StudentProfileHeaderProps {
  student: StudentProfile;
  onLogResult?: () => void;
  activeTab: string;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  student,
  onLogResult,
  activeTab,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#CFE3F1] p-6 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Avatar & Info */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#CFE3F1] border border-[#8FB6D8] text-[#243A5E] flex items-center justify-center shrink-0 shadow-2xs font-extrabold text-xl">
            {student.displayName ? student.displayName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-[#243A5E] tracking-tight">
                {student.displayName}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#CFE3F1] text-[#243A5E]">
                Grade {student.grade}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDF4FA] text-[#5F86A6] border border-[#CFE3F1]">
                <MapPin className="w-3 h-3 text-[#5F86A6]" />
                Western Cape
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-[#5F86A6]">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {student.email}
              </span>
              {student.school && (
                <span className="flex items-center gap-1">
                  <School className="w-3.5 h-3.5" />
                  {student.school}
                </span>
              )}
              {student.targetUniversity && (
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  Target: {student.targetUniversity}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Context action button */}
        {activeTab === 'improve' && onLogResult && (
          <div className="shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={onLogResult}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Log a Result
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

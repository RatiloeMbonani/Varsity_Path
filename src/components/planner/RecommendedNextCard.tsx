import React, { useState } from 'react';
import { Sparkles, Plus, Check, Clock, AlertTriangle, BookOpen } from 'lucide-react';
import { RecommendedStudyTask } from '../../types/planner';
import { Button } from '../common/Button';

export interface RecommendedNextCardProps {
  recommendations: RecommendedStudyTask[];
  onAddToPlanner: (rec: RecommendedStudyTask) => Promise<void>;
}

export const RecommendedNextCard: React.FC<RecommendedNextCardProps> = ({
  recommendations,
  onAddToPlanner,
}) => {
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (recommendations.length === 0) {
    return null;
  }

  const handleAdd = async (rec: RecommendedStudyTask) => {
    setAddingId(rec.id);
    try {
      await onAddToPlanner(rec);
      setAddedIds((prev) => new Set(prev).add(rec.id));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-[#CFE3F1] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EDF4FA] text-[#243A5E] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#243A5E]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#243A5E]">Recommended Next</h4>
            <p className="text-xs text-[#5F86A6]">
              Targeted revision priorities based on your authenticated assessments and goals.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#5F86A6] bg-[#EDF4FA] px-2.5 py-1 rounded-lg">
          {recommendations.length} {recommendations.length === 1 ? 'recommendation' : 'recommendations'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {recommendations.slice(0, 4).map((rec, index) => {
          const isAdded = addedIds.has(rec.id);
          const isAdding = addingId === rec.id;

          return (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-[#CFE3F1] bg-[#EDF4FA]/30 hover:bg-white hover:border-[#8FB6D8] transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#243A5E] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#EDF4FA] text-[#243A5E] flex items-center justify-center text-[11px] font-bold">
                      {index + 1}
                    </span>
                    {rec.subject} {rec.topic && `· ${rec.topic}`}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      rec.priority === 'high'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : rec.priority === 'medium'
                        ? 'bg-[#CFE3F1] text-[#243A5E]'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {rec.priority === 'high' ? 'High priority' : `${rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} priority`}
                  </span>
                </div>

                <h5 className="text-sm font-bold text-[#243A5E] leading-snug">{rec.title}</h5>
                <p className="text-xs text-[#5F86A6] leading-relaxed line-clamp-2">
                  {rec.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#EDF4FA] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-[#5F86A6]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {rec.estimatedMinutes} min
                  </span>
                  {rec.currentMark !== undefined && (
                    <span>• Mark: {rec.currentMark}%</span>
                  )}
                </div>

                <Button
                  variant={isAdded ? 'outline' : 'secondary'}
                  size="sm"
                  disabled={isAdded || isAdding}
                  onClick={() => handleAdd(rec)}
                  leftIcon={
                    isAdded ? (
                      <Check className="w-3.5 h-3.5 text-green-700" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {isAdded ? 'Added to Plan' : isAdding ? 'Adding...' : 'Add to Planner'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

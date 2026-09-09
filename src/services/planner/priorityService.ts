import { TaskPriority } from '../../types';

export interface PriorityEvaluation {
  priority: TaskPriority;
  urgencyLabel: string;
  isUrgentRemediation: boolean;
  scoreBand: string;
  recommendedMinutes: number;
}

export class PriorityService {
  /**
   * Determine study task priority based on actual student performance percentage
   * 0–39%: Very high urgency remediation
   * 40–49%: High priority remediation
   * 50–69%: Medium priority revision & practice
   * 70–89%: Medium/Low maintenance & topic consolidation
   * 90–100%: Low priority enrichment
   */
  static evaluateMarkPriority(mark: number): PriorityEvaluation {
    const clamped = Math.max(0, Math.min(100, Math.round(mark)));

    if (clamped < 40) {
      return {
        priority: 'high',
        urgencyLabel: 'Critical Remediation',
        isUrgentRemediation: true,
        scoreBand: '0–39%',
        recommendedMinutes: 60,
      };
    }

    if (clamped < 50) {
      return {
        priority: 'high',
        urgencyLabel: 'High Priority',
        isUrgentRemediation: true,
        scoreBand: '40–49%',
        recommendedMinutes: 45,
      };
    }

    if (clamped < 70) {
      return {
        priority: 'medium',
        urgencyLabel: 'Core Revision',
        isUrgentRemediation: false,
        scoreBand: '50–69%',
        recommendedMinutes: 45,
      };
    }

    if (clamped < 90) {
      return {
        priority: 'medium',
        urgencyLabel: 'Consolidation',
        isUrgentRemediation: false,
        scoreBand: '70–89%',
        recommendedMinutes: 30,
      };
    }

    return {
      priority: 'low',
      urgencyLabel: 'Enrichment & Mastery',
      isUrgentRemediation: false,
      scoreBand: '90–100%',
      recommendedMinutes: 30,
    };
  }

  /**
   * Evaluate priority based on goal target gap
   */
  static evaluateGoalGapPriority(currentMark: number, targetMark: number): PriorityEvaluation {
    const gap = targetMark - currentMark;
    if (currentMark < 50 || gap >= 20) {
      return {
        priority: 'high',
        urgencyLabel: 'High Priority Milestone',
        isUrgentRemediation: currentMark < 50,
        scoreBand: `Gap: +${gap}%`,
        recommendedMinutes: 60,
      };
    }
    if (gap >= 10 || currentMark < 65) {
      return {
        priority: 'medium',
        urgencyLabel: 'Moderate Target Gap',
        isUrgentRemediation: false,
        scoreBand: `Gap: +${gap}%`,
        recommendedMinutes: 45,
      };
    }
    return {
      priority: 'low',
      urgencyLabel: 'Target Consolidation',
      isUrgentRemediation: false,
      scoreBand: `Gap: +${gap}%`,
      recommendedMinutes: 30,
    };
  }
}

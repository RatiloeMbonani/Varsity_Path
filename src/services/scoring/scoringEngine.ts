import {
  InstitutionId,
  InstitutionalScoreResult,
  InstitutionScoringStrategy,
  ProgrammeRequirementConfig,
} from '../../types/scoring';
import { UctScoringService } from './uctScoringService';
import { UwcScoringService } from './uwcScoringService';
import { StellenboschScoringService } from './stellenboschScoringService';
import { CputScoringService } from './cputScoringService';

/**
 * Registry of institution scoring strategies.
 * Modular architecture allows independent modification of university-specific rules.
 */
const SCORING_STRATEGIES: Record<InstitutionId, InstitutionScoringStrategy> = {
  uct: new UctScoringService(),
  uwc: new UwcScoringService(),
  stellenbosch: new StellenboschScoringService(),
  cput: new CputScoringService(),
};

/**
 * Calculate the institutional score for a specific university.
 *
 * @param institutionId 'uct' | 'uwc' | 'stellenbosch' | 'cput'
 * @param applyResults The student's authentic Apply results
 * @param programmeRequirements Optional programme-specific configuration
 * @returns Structured InstitutionalScoreResult with complete audit breakdown
 */
export function calculateInstitutionScore(
  institutionId: InstitutionId,
  applyResults: Array<{ id: string; subject: string; mark: number }>,
  programmeRequirements?: ProgrammeRequirementConfig
): InstitutionalScoreResult {
  const strategy = SCORING_STRATEGIES[institutionId];
  if (!strategy) {
    throw new Error(`Unsupported institution scoring strategy: "${institutionId}"`);
  }

  return strategy.calculateScore(applyResults, programmeRequirements);
}

/**
 * Calculate scores for all supported Western Cape institutions at once.
 */
export function calculateAllInstitutionScores(
  applyResults: Array<{ id: string; subject: string; mark: number }>,
  programmeConfigs?: Partial<Record<InstitutionId, ProgrammeRequirementConfig>>
): Record<InstitutionId, InstitutionalScoreResult> {
  const institutions: InstitutionId[] = ['uct', 'uwc', 'stellenbosch', 'cput'];
  const results = {} as Record<InstitutionId, InstitutionalScoreResult>;

  for (const inst of institutions) {
    const config = programmeConfigs?.[inst];
    results[inst] = calculateInstitutionScore(inst, applyResults, config);
  }

  return results;
}

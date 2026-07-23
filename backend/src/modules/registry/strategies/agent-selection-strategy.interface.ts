import { Agent } from '@prisma/client';

export interface IAgentSelectionStrategy {
  /**
   * Selects the most appropriate agent from a list of candidates.
   * @param candidates List of agents that have the required capabilities.
   * @param context Additional context for the selection (e.g., current budget, user preference).
   */
  select(candidates: Agent[], context?: any): Agent | null;
}

export const IAgentSelectionStrategy = 'IAgentSelectionStrategy';

import { Injectable } from '@nestjs/common';
import { IAgentSelectionStrategy } from './agent-selection-strategy.interface';
import { Agent } from '@prisma/client';

@Injectable()
export class CostAwareStrategy implements IAgentSelectionStrategy {
  select(candidates: Agent[], context?: any): Agent | null {
    if (!candidates || candidates.length === 0) return null;
    
    // Sort by costProfile (assuming we have logic to map cost profiles to numeric values)
    // For now, let's just pick one with 'LOW' cost profile or fallback
    return candidates.sort((a, b) => {
      const getCostWeight = (profile: string | null) => {
        switch (profile) {
          case 'LOW': return 1;
          case 'MEDIUM': return 2;
          case 'HIGH': return 3;
          default: return 2; // unknown
        }
      };
      return getCostWeight(a.costProfile) - getCostWeight(b.costProfile);
    })[0];
  }
}

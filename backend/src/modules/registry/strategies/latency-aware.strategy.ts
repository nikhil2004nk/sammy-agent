import { Injectable } from '@nestjs/common';
import { IAgentSelectionStrategy } from './agent-selection-strategy.interface';
import { Agent } from '@prisma/client';

@Injectable()
export class LatencyAwareStrategy implements IAgentSelectionStrategy {
  select(candidates: Agent[], context?: any): Agent | null {
    if (!candidates || candidates.length === 0) return null;
    
    // Sort by latencyProfile (assuming LOW is better)
    return candidates.sort((a, b) => {
      const getLatencyWeight = (profile: string | null) => {
        switch (profile) {
          case 'LOW': return 1;
          case 'MEDIUM': return 2;
          case 'HIGH': return 3;
          default: return 2;
        }
      };
      return getLatencyWeight(a.latencyProfile) - getLatencyWeight(b.latencyProfile);
    })[0];
  }
}

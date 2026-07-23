import { Injectable } from '@nestjs/common';
import { IAgentSelectionStrategy } from './agent-selection-strategy.interface';
import { Agent } from '@prisma/client';

@Injectable()
export class BestMatchStrategy implements IAgentSelectionStrategy {
  select(candidates: Agent[], context?: any): Agent | null {
    if (!candidates || candidates.length === 0) return null;
    
    // Simplistic best match: just return the first active one,
    // or rank them by some internal matching score if we had one.
    return candidates[0];
  }
}

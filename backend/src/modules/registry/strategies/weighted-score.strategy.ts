import { Injectable } from '@nestjs/common';
import { IAgentSelectionStrategy } from './agent-selection-strategy.interface';
import { Agent } from '@prisma/client';

@Injectable()
export class WeightedScoreStrategy implements IAgentSelectionStrategy {
  select(candidates: Agent[], context?: any): Agent | null {
    if (!candidates || candidates.length === 0) return null;
    
    // Sort by weighted score: cost + latency + health + load + success rate
    return candidates.sort((a, b) => {
      return this.calculateScore(b) - this.calculateScore(a);
    })[0];
  }

  private calculateScore(agent: Agent): number {
    let score = 0;

    // Load (lower is better, assuming load is out of 100)
    score += (100 - (agent.currentLoad || 0)) * 0.2;

    // Success Rate (higher is better)
    score += (agent.successRate || 1.0) * 100 * 0.4;

    // Cost (lower is better)
    if (agent.costProfile === 'LOW') score += 20;
    else if (agent.costProfile === 'MEDIUM') score += 10;
    else if (agent.costProfile === 'HIGH') score += 0;
    else score += 10;

    // Latency (lower is better)
    if (agent.latencyProfile === 'LOW') score += 20;
    else if (agent.latencyProfile === 'MEDIUM') score += 10;
    else if (agent.latencyProfile === 'HIGH') score += 0;
    else score += 10;

    return score;
  }
}

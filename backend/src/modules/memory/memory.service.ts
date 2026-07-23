import { Injectable, Logger } from '@nestjs/common';
import { MemoryQuery, MemoryEntry } from './interfaces/memory.types';
import { MemoryManager } from './memory-manager.service';

/**
 * MemoryService
 *
 * Orchestrates across memory tiers:
 *   - Episodic: PostgreSQL — past run summaries, stored facts per workspace
 *   - Semantic:  pgvector (future) — vector similarity search
 *
 * The agent loop calls this service to get a memory context string
 * that is injected into the system prompt before reasoning begins.
 */
@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(private readonly memoryManager: MemoryManager) {}

  /**
   * Build a memory context string for injection into the agent's system prompt.
   */
  async buildContext(workspaceId: string, userId?: string, agentId?: string, queryStr?: string, strategy?: 'FAST' | 'PLANNING' | 'DEEP'): Promise<string> {
    const query: MemoryQuery = { workspaceId, userId, agentId, limit: 5, query: queryStr, strategy };

    const entries = await this.memoryManager.retrieve(query);
    
    // Temporary formatting while we transition away from MemoryEntry types
    const episodicEntries = entries.filter(e => !e.id.includes('semantic'));
    const semanticEntries = entries.filter(e => e.id.includes('semantic'));
    
    const sections: string[] = [];

    if (episodicEntries.length > 0) {
      const lines = episodicEntries.map(e => `- ${e.summary}`).join('\n');
      sections.push(`## Past Context (Episodic Memory)\n${lines}`);
    }

    if (semanticEntries.length > 0) {
      const lines = semanticEntries.map(e => `- ${e.summary}`).join('\n');
      sections.push(`## Relevant Knowledge (Semantic Memory)\n${lines}`);
    }

    if (sections.length === 0) {
      this.logger.log(`
[Memory Result]
Episodic    ${episodicEntries.length}
Semantic    ${semanticEntries.length}
Working     0
Total       ${episodicEntries.length + semanticEntries.length}
      `);
      return '';
    }

    this.logger.log(`
[Memory Result]
Episodic    ${episodicEntries.length}
Semantic    ${semanticEntries.length}
Working     0
Total       ${episodicEntries.length + semanticEntries.length}
    `);

    return `\n\n---\n${sections.join('\n\n')}\n---\n`;
  }

  /**
   * IPlanningMemory Implementation:
   * Retrieves memory context tailored specifically to the given goal/intent.
   */
  async getRelevantContext(workspaceId: string, goal: string, userId?: string): Promise<{ context: string }> {
    // Explicitly use the PLANNING strategy for the Planner subsystem
    const contextStr = await this.buildContext(workspaceId, userId, undefined, goal, 'PLANNING');
    return { context: contextStr };
  }

  /**
   * Store a summary of a completed run as an episodic memory.
   * Called after the agent loop finishes to build long-term recall.
   */
  async saveRunSummary(workspaceId: string, runId: string, summary: string, agentId?: string, userId?: string): Promise<void> {
    try {
      await this.memoryManager.save({
        workspaceId,
        runId,
        agentId,
        userId,
        summary,
        importance: 1,
      }, 'EPISODIC');
      this.logger.debug(`Saved episodic memory for run '${runId}'`);
    } catch (err) {
      this.logger.error(`Failed to save episodic memory for run '${runId}'`, err);
    }
  }
}

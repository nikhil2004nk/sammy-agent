import { Inject, Injectable, Logger } from '@nestjs/common';
import { MemoryQuery, MemoryEntry, IEpisodicMemoryProvider, ISemanticMemoryProvider } from './memory.types';
import type { IMemoryProvider } from './memory.types';

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

  constructor(
    @Inject(IEpisodicMemoryProvider) private readonly episodic: IMemoryProvider,
    @Inject(ISemanticMemoryProvider) private readonly semantic: IMemoryProvider,
  ) {}

  /**
   * Build a memory context string for injection into the agent's system prompt.
   */
  async buildContext(workspaceId: string, userId?: string, agentId?: string): Promise<string> {
    const query: MemoryQuery = { workspaceId, userId, agentId, limit: 5 };

    const [episodicEntries, semanticEntries] = await Promise.all([
      this.episodic.recall(query).catch(() => [] as MemoryEntry[]),
      this.semantic.recall(query).catch(() => [] as MemoryEntry[]),
    ]);

    const sections: string[] = [];

    if (episodicEntries.length > 0) {
      const lines = episodicEntries.map(e => `- ${e.summary}`).join('\n');
      sections.push(`## Past Context (Episodic Memory)\n${lines}`);
    }

    if (semanticEntries.length > 0) {
      const lines = semanticEntries.map(e => `- ${e.summary}`).join('\n');
      sections.push(`## Relevant Knowledge (Semantic Memory)\n${lines}`);
    }

    if (sections.length === 0) return '';

    return `\n\n---\n${sections.join('\n\n')}\n---\n`;
  }

  /**
   * Store a summary of a completed run as an episodic memory.
   * Called after the agent loop finishes to build long-term recall.
   */
  async saveRunSummary(workspaceId: string, runId: string, summary: string, agentId?: string, userId?: string): Promise<void> {
    try {
      await this.episodic.remember({
        workspaceId,
        runId,
        agentId,
        userId,
        summary,
        importance: 1,
      });
      this.logger.debug(`Saved episodic memory for run '${runId}'`);
    } catch (err) {
      this.logger.error(`Failed to save episodic memory for run '${runId}'`, err);
    }
  }
}

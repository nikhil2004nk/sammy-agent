import { Injectable, Logger, Inject } from '@nestjs/common';
import { MemoryQuery, MemoryEntry, IEpisodicMemoryProvider, ISemanticMemoryProvider } from './interfaces/memory.types';
import type { IMemoryProvider } from './interfaces/memory.types';
import { MemoryRecord } from './models/memory-record.model';
import { RetrievalPipeline } from './pipelines/retrieval.pipeline';
import { WritePipeline } from './pipelines/write.pipeline';
import { RetentionPolicy } from './policies/retention.policy';

/**
 * MemoryManager
 *
 * Internal orchestrator for the Memory subsystem.
 * Responsible for:
 * - Selecting retrieval strategies
 * - Merging records from different tiers
 * - Deduplication
 * - Ranking by importance/relevance
 * - Applying policies (TTL, budgets)
 */
@Injectable()
export class MemoryManager {
  private readonly logger = new Logger(MemoryManager.name);

  constructor(
    @Inject(IEpisodicMemoryProvider) private readonly episodic: IMemoryProvider,
    @Inject(ISemanticMemoryProvider) private readonly semantic: IMemoryProvider,
    private readonly retrievalPipeline: RetrievalPipeline,
    private readonly writePipeline: WritePipeline,
    private readonly retentionPolicy: RetentionPolicy,
  ) {}

  /**
   * Core retrieval pipeline orchestrator.
   * Future milestones will implement strategies and the full pipeline.
   * For now, it delegates to the providers and returns raw arrays.
   */
  async retrieve(query: MemoryQuery): Promise<MemoryEntry[]> {
    this.logger.log(`Executing Memory Retrieval for workspace: ${query.workspaceId}`);
    
    // 1. Strategies will determine WHICH providers to query
    const [episodicEntries, semanticEntries] = await Promise.all([
      this.episodic.recall(query).catch(() => [] as MemoryEntry[]),
      this.semantic.recall(query).catch(() => [] as MemoryEntry[]),
    ]);

    // 2. Pass raw results through the Retrieval Pipeline
    // (Merge -> Deduplicate -> Rank -> Budget)
    const pipelineResult = await this.retrievalPipeline.execute(query, [
      episodicEntries,
      semanticEntries,
    ]);
    
    // 3. Apply Policies (e.g. drop expired memories before returning)
    // Coercing pipelineResult to MemoryRecord[] since they're functionally similar
    // during this transitional phase.
    const validRecords = await this.retentionPolicy.applyBatch(pipelineResult as any[]);
    
    return validRecords as any[];
  }

  /**
   * Write pipeline entry point.
   */
  async save(entry: Omit<MemoryEntry, 'id' | 'createdAt'>, type: 'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL'): Promise<void> {
    await this.writePipeline.execute(entry, type);
  }
}

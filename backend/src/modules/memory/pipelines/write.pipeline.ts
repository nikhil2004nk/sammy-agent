import { Injectable, Logger, Inject } from '@nestjs/common';
import { MemoryEntry, IEpisodicMemoryProvider, ISemanticMemoryProvider } from '../interfaces/memory.types';
import type { IMemoryProvider } from '../interfaces/memory.types';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class WritePipeline {
  private readonly logger = new Logger(WritePipeline.name);

  constructor(
    @Inject(IEpisodicMemoryProvider) private readonly episodic: IMemoryProvider,
    @Inject(ISemanticMemoryProvider) private readonly semantic: IMemoryProvider,
    private readonly eventBus: EventBusService,
  ) {}

  /**
   * Pipeline: Should Save? -> Route to Episodic/Semantic/Procedural
   */
  async execute(entry: Omit<MemoryEntry, 'id' | 'createdAt'>, type: 'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL'): Promise<void> {
    this.logger.debug(`Executing Write Pipeline for type: ${type}`);

    // 1. Should we save this?
    if (entry.importance < 0.2) {
      this.logger.debug('Memory rejected by Write Pipeline: Importance too low.');
      return;
    }

    // 2. Routing
    try {
      let savedRecord: MemoryEntry | null = null;
      if (type === 'EPISODIC') {
        savedRecord = await this.episodic.remember(entry);
      } else if (type === 'SEMANTIC') {
        savedRecord = await this.semantic.remember(entry);
      } else {
        this.logger.warn(`Write Pipeline does not yet support routing for type: ${type}`);
      }

      if (savedRecord) {
        this.eventBus.emitMemoryCreated('system-trace', 'system-agent', savedRecord);
      }
    } catch (err) {
      this.logger.error(`Failed to write memory of type ${type}`, err);
    }
  }
}

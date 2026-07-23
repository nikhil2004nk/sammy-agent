import { Injectable, Logger } from '@nestjs/common';
import { IMemoryPolicy } from './memory-policy.interface';
import { MemoryRecord } from '../models/memory-record.model';
import { EventBusService } from '../../events/event-bus.service';

@Injectable()
export class RetentionPolicy implements IMemoryPolicy {
  name = 'RetentionPolicy';
  private readonly logger = new Logger(RetentionPolicy.name);

  constructor(private readonly eventBus: EventBusService) {}

  /**
   * Evaluates if a memory record has expired based on its TTL.
   */
  async evaluate(record: MemoryRecord): Promise<boolean> {
    if (record.ttl === undefined || record.ttl === null) {
      return true; // Lives forever
    }

    const now = new Date().getTime();
    const ageSeconds = (now - record.createdAt.getTime()) / 1000;

    if (ageSeconds > record.ttl) {
      this.logger.debug(`Memory ${record.id} expired. Age: ${ageSeconds}s > TTL: ${record.ttl}s`);
      this.eventBus.emitMemoryExpired('system-trace', 'system-agent', record.id);
      return false; // Record is expired
    }

    return true; // Valid
  }

  /**
   * Filters out expired records from a batch.
   */
  async applyBatch(records: MemoryRecord[]): Promise<MemoryRecord[]> {
    const validRecords: MemoryRecord[] = [];
    
    for (const record of records) {
      const isValid = await this.evaluate(record);
      if (isValid) {
        validRecords.push(record);
      }
    }
    
    return validRecords;
  }
}

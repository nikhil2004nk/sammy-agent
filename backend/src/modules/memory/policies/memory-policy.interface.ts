import { MemoryRecord } from '../models/memory-record.model';

export interface IMemoryPolicy {
  /**
   * The name of the policy (e.g., 'Retention', 'Compression', 'Deduplication').
   */
  name: string;

  /**
   * Evaluates a memory record and determines what action to take.
   * Return false if the record violates the policy and should be deleted/rejected.
   */
  evaluate(record: MemoryRecord): Promise<boolean>;

  /**
   * Optional: Can be called by a background cron job to apply the policy
   * across an entire batch of records.
   */
  applyBatch?(records: MemoryRecord[]): Promise<MemoryRecord[]>;
}

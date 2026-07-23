import { MemoryRecord } from './memory-record.model';
import { MemoryType } from './memory-type.enum';

export interface SemanticMemory extends MemoryRecord {
  type: MemoryType.SEMANTIC;
  
  /**
   * The actual fact or knowledge being stored.
   */
  fact: string;
  
  /**
   * Topics or entities this fact relates to.
   */
  tags: string[];
}

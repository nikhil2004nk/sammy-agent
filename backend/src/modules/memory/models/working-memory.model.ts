import { MemoryRecord } from './memory-record.model';
import { MemoryType } from './memory-type.enum';

export interface WorkingMemory extends MemoryRecord {
  type: MemoryType.WORKING;
  
  /**
   * The run ID this scratchpad belongs to.
   */
  runId: string;
  
  /**
   * The key of the variable.
   */
  key: string;
  
  /**
   * The value of the variable.
   */
  value: any;
}

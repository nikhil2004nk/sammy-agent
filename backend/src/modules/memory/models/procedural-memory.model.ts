import { MemoryRecord } from './memory-record.model';
import { MemoryType } from './memory-type.enum';

export interface ProceduralMemory extends MemoryRecord {
  type: MemoryType.PROCEDURAL;
  
  /**
   * The name of the procedure or workflow.
   */
  name: string;
  
  /**
   * The goal this procedure satisfies.
   */
  goal: string;
  
  /**
   * The ordered steps of the procedure.
   */
  steps: string[];
}

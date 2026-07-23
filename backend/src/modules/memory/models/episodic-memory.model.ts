import { MemoryRecord } from './memory-record.model';
import { MemoryType } from './memory-type.enum';

export interface EpisodicMemory extends MemoryRecord {
  type: MemoryType.EPISODIC;
  
  /**
   * The run ID this episode occurred in.
   */
  runId: string;
  
  /**
   * A summary of what happened.
   */
  summary: string;
  
  /**
   * What was the goal being attempted?
   */
  goal: string;
  
  /**
   * Did the episode result in success?
   */
  success: boolean;
  
  /**
   * If it failed, what was the reason?
   */
  failureReason?: string;
}

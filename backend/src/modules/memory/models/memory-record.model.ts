import { MemoryType } from './memory-type.enum';

/**
 * Base MemoryRecord interface.
 * All memory types in the system must extend this base record.
 */
export interface MemoryRecord {
  id: string;
  workspaceId: string;
  userId?: string;
  agentId?: string;
  
  type: MemoryType;
  
  /**
   * Defines how important this memory is (0.0 to 1.0)
   * Used for ranking and eviction policies.
   */
  importance: number;
  
  /**
   * The origin of this memory (e.g., 'UserChat', 'AgentReflection', 'System')
   */
  source: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  /**
   * Time to live in seconds. If undefined, the memory lives forever.
   */
  ttl?: number;
  
  /**
   * Extensible metadata object for specific provider implementations
   */
  metadata?: Record<string, any>;
}

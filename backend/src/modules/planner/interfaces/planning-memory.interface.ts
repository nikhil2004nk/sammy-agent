export const IPlanningMemory = 'IPlanningMemory';

export interface MemorySnapshot {
  context: string;
}

export interface IPlanningMemory {
  /**
   * Retrieves memory context tailored specifically to the given goal/intent.
   */
  getRelevantContext(workspaceId: string, goal: string, userId?: string): Promise<MemorySnapshot>;
}

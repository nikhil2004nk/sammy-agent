import { Test, TestingModule } from '@nestjs/testing';
import { MemoryManager } from '../../src/modules/memory/memory-manager.service';
import { RetrievalPipeline } from '../../src/modules/memory/pipelines/retrieval.pipeline';
import { WritePipeline } from '../../src/modules/memory/pipelines/write.pipeline';
import { RetentionPolicy } from '../../src/modules/memory/policies/retention.policy';
import { IEpisodicMemoryProvider, ISemanticMemoryProvider, MemoryEntry } from '../../src/modules/memory/interfaces/memory.types';
import { ReflectionEngineService } from '../../src/modules/planner/reflection-engine.service';
import { ExecutionPlan } from '../../src/modules/planner/models/execution-plan.model';
import { TaskStatus } from '../../src/modules/planner/models/task.model';

describe('Memory and Intelligence Integration', () => {
  let memoryManager: MemoryManager;
  let retrievalPipeline: RetrievalPipeline;
  let reflectionEngine: ReflectionEngineService;

  // Mock Providers
  const mockEpisodicProvider = {
    recall: jest.fn(),
    store: jest.fn(),
    delete: jest.fn(),
  };

  const mockSemanticProvider = {
    recall: jest.fn(),
    store: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryManager,
        RetrievalPipeline,
        {
          provide: WritePipeline,
          useValue: { execute: jest.fn() }
        },
        {
          provide: RetentionPolicy,
          useValue: { applyBatch: async (items: any[]) => items }
        },
        { provide: IEpisodicMemoryProvider, useValue: mockEpisodicProvider },
        { provide: ISemanticMemoryProvider, useValue: mockSemanticProvider },
        ReflectionEngineService,
      ],
    }).compile();

    memoryManager = moduleRef.get(MemoryManager);
    retrievalPipeline = moduleRef.get(RetrievalPipeline);
    reflectionEngine = moduleRef.get(ReflectionEngineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MemoryManager - Deterministic Retrieval & Ranking', () => {
    it('should correctly merge, deduplicate, and rank memories from multiple providers', async () => {
      // Setup mock data
      const oldMemory: MemoryEntry = {
        id: 'mem-1',
        workspaceId: 'ws-1',
        summary: 'Likes apples',
        importance: 0.5,
        createdAt: new Date('2025-01-01'),
        metadata: {}
      };

      const newerImportantMemory: MemoryEntry = {
        id: 'mem-2',
        workspaceId: 'ws-1',
        summary: 'Apple allergy',
        importance: 0.9,
        createdAt: new Date('2025-02-01'),
        metadata: {}
      };

      const duplicateOldMemory: MemoryEntry = {
        ...oldMemory,
        importance: 0.2 // Lower importance duplicate
      };

      mockEpisodicProvider.recall.mockResolvedValue([oldMemory, duplicateOldMemory]);
      mockSemanticProvider.recall.mockResolvedValue([newerImportantMemory]);

      const result = await memoryManager.retrieve({ workspaceId: 'ws-1' });

      // Should deduplicate 'mem-1' and keep the one with higher importance (0.5), and sort by importance.
      // Expected order: mem-2 (0.9), mem-1 (0.5)
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('mem-2');
      expect(result[1].id).toBe('mem-1');
      expect(result[1].importance).toBe(0.5);
    });

    it('should respect the budget limit during retrieval pipeline', async () => {
      const generateMemories = (count: number) => {
        return Array.from({ length: count }).map((_, i) => ({
          id: `mem-${i}`,
          workspaceId: 'ws-1',
          summary: `Sum ${i}`,
          importance: 0.5,
          createdAt: new Date(),
          metadata: {}
        }));
      };

      mockEpisodicProvider.recall.mockResolvedValue(generateMemories(10));
      mockSemanticProvider.recall.mockResolvedValue(generateMemories(10)); // Total 20 distinct memories

      // 10 + 10 = 20 unique memories (IDs from 0 to 9 in both, wait, IDs will be the same, so they deduplicate to 10!)
      // Let's modify IDs so they don't deduplicate
      mockSemanticProvider.recall.mockResolvedValue(generateMemories(10).map(m => ({ ...m, id: m.id + '-sem' })));

      const result = await memoryManager.retrieve({ workspaceId: 'ws-1', limit: 5 });
      
      // Limit is 5
      expect(result.length).toBe(5);
    });
  });

  describe('Reflection Engine', () => {
    it('should return incomplete if there are no tasks', async () => {
      const plan = { tasks: [] } as any as ExecutionPlan;
      const intent = { goal: 'test' } as any;

      const result = await reflectionEngine.reflect(plan, intent);
      expect(result.isComplete).toBe(false);
      expect(result.feedback).toContain('no tasks');
    });

    it('should return incomplete if any task failed', async () => {
      const plan = { 
        tasks: [
          { status: TaskStatus.COMPLETED },
          { status: TaskStatus.FAILED },
        ] 
      } as any as ExecutionPlan;

      const result = await reflectionEngine.reflect(plan, {} as any);
      expect(result.isComplete).toBe(false);
      expect(result.feedback).toContain('failed');
    });

    it('should return complete if all tasks are COMPLETED', async () => {
      const plan = { 
        tasks: [
          { status: TaskStatus.COMPLETED },
          { status: TaskStatus.COMPLETED },
        ] 
      } as any as ExecutionPlan;

      const result = await reflectionEngine.reflect(plan, {} as any);
      expect(result.isComplete).toBe(true);
    });
  });
});

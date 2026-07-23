import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionSchedulerService } from '../../src/modules/runtime/execution/scheduler/execution-scheduler.service';
import { EventBusService } from '../../src/modules/events/event-bus.service';
import { NodeExecutorRegistry } from '../../src/modules/runtime/execution/scheduler/nodes/node-executor.registry';
import { ExecutionPlan } from '../../src/modules/planner/models/execution-plan.model';
import { Task, TaskStatus } from '../../src/modules/planner/models/task.model';
import { ExecutionContext } from '../../src/common/execution-context';
import { INodeExecutor, NodeExecutionResult } from '../../src/modules/runtime/execution/scheduler/nodes/node-executor.interface';
import { EventEmitterModule } from '@nestjs/event-emitter';

class MockNodeExecutor implements INodeExecutor {
  async executeNode(task: Task, context: ExecutionContext): Promise<NodeExecutionResult> {
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 10));
    
    if (task.config?.shouldFail) {
      return { success: false, action: 'FAIL', error: 'Intentional failure' };
    }
    
    if (task.config?.shouldTimeout) {
      // Simulate hanging indefinitely
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    return { success: true, action: 'COMPLETE', output: `Result of ${task.id}` };
  }
}

describe('ExecutionSchedulerService Integration', () => {
  let scheduler: ExecutionSchedulerService;
  let eventBus: EventBusService;
  let registry: NodeExecutorRegistry;
  let emittedEvents: string[] = [];

  beforeEach(async () => {
    emittedEvents = [];
    
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        ExecutionSchedulerService,
        EventBusService,
        NodeExecutorRegistry
      ],
    }).compile();

    scheduler = moduleRef.get(ExecutionSchedulerService);
    eventBus = moduleRef.get(EventBusService);
    registry = moduleRef.get(NodeExecutorRegistry);

    // Register our mock executor
    registry.register('TASK', new MockNodeExecutor());

    // Spy on events
    jest.spyOn(eventBus, 'emitTaskQueued').mockImplementation((...args) => { emittedEvents.push('TaskQueued'); });
    jest.spyOn(eventBus, 'emitTaskStarted').mockImplementation((...args) => { emittedEvents.push('TaskStarted'); });
    jest.spyOn(eventBus, 'emitTaskCompleted').mockImplementation((...args) => { emittedEvents.push('TaskCompleted'); });
    jest.spyOn(eventBus, 'emitTaskFailed').mockImplementation((...args) => { emittedEvents.push('TaskFailed'); });
    jest.spyOn(eventBus, 'emitTaskCancelled').mockImplementation((...args) => { emittedEvents.push('TaskCancelled'); });
    jest.spyOn(eventBus, 'emitBudgetExceeded').mockImplementation((...args) => { emittedEvents.push('BudgetExceeded'); });
  });

  const getMockContext = (overrides?: Partial<ExecutionContext>): ExecutionContext => ({
    traceId: 'trace-1',
    runId: 'run-1',
    agentId: 'agent-1',
    workspaceId: 'ws-1',
    budget: { maxExecutionNodes: 10, maxConcurrency: 5, maxRetries: 1 },
    ...overrides
  });

  const getMockPlan = (tasks: Task[]): ExecutionPlan => ({
    id: 'plan-1',
    originalIntent: { goal: 'test', entities: [], constraints: [], priority: 'normal' },
    tasks,
    metadata: { estimatedComplexity: tasks.length, generatedAt: new Date(), version: 1 }
  });

  it('should successfully schedule and execute independent tasks', async () => {
    const tasks: Task[] = [
      { id: 't1', type: 'TASK', goal: '1', dependsOn: [], requiredCapabilities: [], status: TaskStatus.PENDING, config: {} },
      { id: 't2', type: 'TASK', goal: '2', dependsOn: [], requiredCapabilities: [], status: TaskStatus.PENDING, config: {} }
    ];
    
    await scheduler.schedule(getMockPlan(tasks), getMockContext());
    
    expect(tasks[0].status).toBe(TaskStatus.COMPLETED);
    expect(tasks[1].status).toBe(TaskStatus.COMPLETED);
    
    // Check Event emission order
    expect(emittedEvents).toContain('TaskQueued');
    expect(emittedEvents).toContain('TaskStarted');
    expect(emittedEvents).toContain('TaskCompleted');
  });

  it('should resolve a sequential DAG without deadlocking', async () => {
    const tasks: Task[] = [
      { id: 'A', type: 'TASK', goal: 'A', dependsOn: [], requiredCapabilities: [], status: TaskStatus.PENDING, config: {} },
      { id: 'B', type: 'TASK', goal: 'B', dependsOn: ['A'], requiredCapabilities: [], status: TaskStatus.PENDING, config: {} },
      { id: 'C', type: 'TASK', goal: 'C', dependsOn: ['B'], requiredCapabilities: [], status: TaskStatus.PENDING, config: {} }
    ];
    
    await scheduler.schedule(getMockPlan(tasks), getMockContext());
    
    expect(tasks.every(t => t.status === TaskStatus.COMPLETED)).toBe(true);
  });

  it('should reject a circular graph immediately (stall detection)', async () => {
    // Note: The WorkflowCompiler should catch this, but if it reaches the scheduler, it shouldn't hang.
    const tasks: Task[] = [
      { id: 'A', type: 'TASK', goal: 'A', dependsOn: ['B'], requiredCapabilities: [], status: TaskStatus.PENDING, config: {} },
      { id: 'B', type: 'TASK', goal: 'B', dependsOn: ['A'], requiredCapabilities: [], status: TaskStatus.PENDING, config: {} }
    ];
    
    await scheduler.schedule(getMockPlan(tasks), getMockContext());
    
    // Scheduler detects 0 running, some queued -> stall -> cancels remaining.
    expect(tasks[0].status).toBe(TaskStatus.CANCELLED);
    expect(tasks[1].status).toBe(TaskStatus.CANCELLED);
    expect(emittedEvents).toContain('TaskCancelled');
  });

  it('should cancel queued tasks when budget is exceeded mid-run', async () => {
    const tasks: Task[] = [
      { id: 'A', type: 'TASK', goal: 'A', dependsOn: [], requiredCapabilities: [], status: TaskStatus.PENDING, config: {} },
      { id: 'B', type: 'TASK', goal: 'B', dependsOn: ['A'], requiredCapabilities: [], status: TaskStatus.PENDING, config: {} },
      { id: 'C', type: 'TASK', goal: 'C', dependsOn: ['B'], requiredCapabilities: [], status: TaskStatus.PENDING, config: {} }
    ];
    
    // Set budget to only 1 node
    await scheduler.schedule(getMockPlan(tasks), getMockContext({ budget: { maxExecutionNodes: 1, maxConcurrency: 1 } }));
    
    expect(tasks[0].status).toBe(TaskStatus.COMPLETED); // Completed within budget
    expect(tasks[1].status).toBe(TaskStatus.CANCELLED); // Exceeded budget
    expect(tasks[2].status).toBe(TaskStatus.CANCELLED);
    expect(emittedEvents).toContain('BudgetExceeded');
  });
});

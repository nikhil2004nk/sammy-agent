import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionPlan } from '../../src/modules/planner/models/execution-plan.model';
import { ExecutionContext } from '../../src/common/execution-context';
import { DelegationContract } from '../../src/modules/runtime/models/delegation-contract.model';
import { ExecutionTarget } from '../../src/modules/planner/interfaces/capability-resolver.interface';
import { INodeExecutor, NodeExecutionResult } from '../../src/modules/runtime/execution/scheduler/nodes/node-executor.interface';
import { Task, TaskStatus } from '../../src/modules/planner/models/task.model';
import { CapabilityResolverService } from '../../src/modules/planner/capability-resolver.service';

/**
 * Contract Tests
 * These tests ensure that the core platform contracts remain frozen.
 * They deliberately construct objects matching the interfaces.
 * If someone alters a required property on these interfaces, this file will fail to compile.
 */
describe('Platform Contracts', () => {

  it('ExecutionPlan contract should remain stable', () => {
    const plan: ExecutionPlan = {
      id: 'plan-1',
      originalIntent: {
        goal: 'test',
        entities: [],
        constraints: [],
        priority: 'normal'
      },
      tasks: [],
      metadata: { estimatedComplexity: 0, generatedAt: new Date(), version: 1 }
    };
    expect(plan.id).toBe('plan-1');
  });

  it('ExecutionContext contract should remain stable', () => {
    const context: ExecutionContext = {
      traceId: 'trace-1',
      runId: 'run-1',
      agentId: 'agent-1',
      workspaceId: 'ws-1'
    };
    expect(context.traceId).toBe('trace-1');
  });

  it('DelegationContract contract should remain stable', () => {
    const contract: DelegationContract = {
      goal: 'goal-1',
      executionContext: {
        traceId: 'trace-1',
        runId: 'run-1',
        agentId: 'agent-1',
        workspaceId: 'ws-1'
      },
      constraints: [],
      permissions: [],
      memoryAccess: 'READ_ONLY',
      expectedOutput: 'result',
      budget: { maxToolCalls: 5 }
    };
    expect(contract.memoryAccess).toBe('READ_ONLY');
  });

  it('Task contract should remain stable', () => {
    const task: Task = {
      id: 'task-1',
      goal: 'test task',
      dependsOn: [],
      requiredCapabilities: [],
      status: TaskStatus.PENDING,
      type: 'TASK',
      config: {}
    };
    expect(task.type).toBe('TASK');
  });

  it('CapabilityResolver interface should return ExecutionTarget[]', async () => {
    const mockResolver: Partial<CapabilityResolverService> = {
      resolve: async (reqCaps) => {
        const target: ExecutionTarget = {
          id: 'target-1',
          type: 'AGENT',
          name: 'Agent 1',
          capabilities: reqCaps
        };
        return [target];
      }
    };

    const targets = await mockResolver.resolve!(["math"]);
    expect(targets[0].type).toBe('AGENT');
  });

  it('INodeExecutor should return NodeExecutionResult', async () => {
    const mockExecutor: INodeExecutor = {
      executeNode: async (task, ctx) => {
        const res: NodeExecutionResult = {
          success: true,
          action: 'COMPLETE',
          output: 'Done'
        };
        return res;
      }
    };
    
    const result = await mockExecutor.executeNode({} as any, {} as any);
    expect(result.action).toBe('COMPLETE');
  });
});

import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../../../events/event-bus.service';
import { ExecutionPlan } from '../../../planner/models/execution-plan.model';
import { Task, TaskStatus } from '../../../planner/models/task.model';
import { ExecutionContext } from '../../../../common/execution-context';
import { DelegationContract } from '../../models/delegation-contract.model';
import { NodeExecutorRegistry } from './nodes/node-executor.registry';

@Injectable()
export class ExecutionSchedulerService {
  private readonly logger = new Logger(ExecutionSchedulerService.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly nodeRegistry: NodeExecutorRegistry
  ) {}

  /**
   * Main entrypoint for scheduling an execution plan.
   * Conceptually splits into:
   * 1. Queue Management (DAG resolution)
   * 2. Worker Allocation (Concurrency control)
   * 3. Execution Monitoring (Budget and Retries)
   */
  async schedule(plan: ExecutionPlan, context: ExecutionContext): Promise<void> {
    const tasks = plan.tasks;
    
    // Set all tasks to QUEUED initially
    tasks.forEach(t => {
      if (t.status === TaskStatus.PENDING) {
        t.status = TaskStatus.QUEUED;
        this.eventBus.emitTaskQueued(context.traceId, t.id, plan.id);
      }
    });

    const maxConcurrency = context.budget?.maxConcurrency || 5;
    let runningTasks = 0;
    
    return new Promise((resolve, reject) => {
      const checkQueue = async () => {
        // Are we done?
        if (tasks.every(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.FAILED || t.status === TaskStatus.CANCELLED || t.status === TaskStatus.SKIPPED)) {
          resolve();
          return;
        }

        // Budget check (Execution Monitor)
        const nodesExecuted = context.budgetConsumption?.maxExecutionNodes || 0;
        if (context.budget?.maxExecutionNodes && nodesExecuted >= context.budget.maxExecutionNodes) {
          this.logger.warn(`Budget Exceeded: maxExecutionNodes (${context.budget.maxExecutionNodes}) reached.`);
          this.eventBus.emitBudgetExceeded(context.traceId, 'maxExecutionNodes', context.budget.maxExecutionNodes, nodesExecuted);
          
          // Cancel remaining
          tasks.filter(t => t.status === TaskStatus.QUEUED || t.status === TaskStatus.READY)
               .forEach(t => {
                 t.status = TaskStatus.CANCELLED;
                 this.eventBus.emitTaskCancelled(context.traceId, t.id, 'Budget Exceeded: maxExecutionNodes');
               });
          resolve();
          return;
        }

        // Worker Allocator / Concurrency control
        while (runningTasks < maxConcurrency) {
          // Find a READY or QUEUED task whose dependencies are COMPLETED or SKIPPED
          const readyTask = tasks.find(t => 
            (t.status === TaskStatus.QUEUED || t.status === TaskStatus.READY) &&
            (t.dependsOn.length === 0 || t.dependsOn.every(depId => {
               const dep = tasks.find(x => x.id === depId);
               return dep?.status === TaskStatus.COMPLETED || dep?.status === TaskStatus.SKIPPED;
            }))
          );

          if (!readyTask) {
            break; // No ready tasks, wait for running ones to finish
          }

          readyTask.status = TaskStatus.RUNNING;
          runningTasks++;
          
          if (!context.budgetConsumption) {
             context.budgetConsumption = {};
          }
          context.budgetConsumption.maxExecutionNodes = (context.budgetConsumption.maxExecutionNodes || 0) + 1;

          this.eventBus.emitTaskStarted(context.traceId, readyTask.id);

          // Fire and forget, we handle completion inside
          this.executeTask(readyTask, tasks, context).then(() => {
            runningTasks--;
            checkQueue();
          });
        }
        
        // Blocked check: Are there queued tasks but no running tasks and no ready tasks?
        if (runningTasks === 0) {
           // This means there's a dependency cycle or a dependency failed
           const pending = tasks.filter(t => t.status === TaskStatus.QUEUED || t.status === TaskStatus.READY);
           if (pending.length > 0) {
              this.logger.warn(`Execution stalled. Cancelling remaining ${pending.length} tasks.`);
              pending.forEach(t => {
                 t.status = TaskStatus.CANCELLED; 
                 this.eventBus.emitTaskCancelled(context.traceId, t.id, 'Dependencies failed or cycle detected');
              });
              resolve();
           }
        }
      };

      // Kick off
      checkQueue();
    });
  }

  private async executeTask(task: Task, tasksList: Task[], context: ExecutionContext): Promise<void> {
    try {
      let attempt = 0;
      let isSuccess = false;
      const maxRetries = context.budget?.maxRetries || 1;

      const nodeType = task.type || 'TASK';
      const executor = this.nodeRegistry.getExecutor(nodeType);

      while (attempt < maxRetries && !isSuccess) {
        try {
          if (attempt > 0) {
            task.status = TaskStatus.RETRYING;
            this.eventBus.emitTaskRetried(context.traceId, task.id, attempt);
          }
          
          this.logger.log(`Executing node ${task.id} of type ${nodeType} (Attempt ${attempt + 1}/${maxRetries})`);
          
          const result = await executor.executeNode(task, context);
          
          if (result.success) {
            isSuccess = true;
            if (result.action === 'COMPLETE') {
              task.status = TaskStatus.COMPLETED;
              this.eventBus.emitTaskCompleted(context.traceId, task.id, result.output);
            } else if (result.action === 'SKIP') {
              task.status = TaskStatus.SKIPPED;
              this.logger.log(`Task ${task.id} was SKIPPED`);
              // Could emit a TaskSkipped event if desired
            } else if (result.action === 'INJECT_TASKS' && result.tasksToInject) {
              task.status = TaskStatus.COMPLETED; // The loop node itself is done compiling tasks
              tasksList.push(...result.tasksToInject);
              this.logger.log(`Injected ${result.tasksToInject.length} tasks from loop node ${task.id}`);
            }
          } else {
            throw new Error(result.error || 'Node execution failed without specific error');
          }
        } catch (err: any) {
           attempt++;
           this.logger.warn(`Task ${task.id} attempt ${attempt} failed: ${err.message}`);
           if (attempt >= maxRetries) {
             task.status = TaskStatus.FAILED;
             this.eventBus.emitTaskFailed(context.traceId, task.id, err.message);
           }
        }
      }

    } catch (err: any) {
      task.status = TaskStatus.FAILED;
      this.eventBus.emitTaskFailed(context.traceId, task.id, err.message);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { INodeExecutor, NodeExecutionResult } from './node-executor.interface';
import { Task, TaskStatus } from '../../../../planner/models/task.model';
import { ExecutionContext } from '../../../../../common/execution-context';
import * as crypto from 'crypto';

@Injectable()
export class LoopNodeExecutor implements INodeExecutor {
  private readonly logger = new Logger(LoopNodeExecutor.name);

  async executeNode(task: Task, context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.logger.log(`Executing LOOP node ${task.id}`);
      
      // In Phase 6A, we dynamically expand loops if a count is provided or if items are provided.
      // E.g., config: { items: ['a', 'b'], loopTaskTemplate: { goal: 'Process item' } }
      const items = task.config?.items as any[];
      if (!items || !Array.isArray(items) || items.length === 0) {
         // Nothing to loop over, complete immediately
         return { success: true, action: 'COMPLETE' };
      }

      const template = task.config?.loopTaskTemplate as Partial<Task> || {};
      const newTasks: Task[] = items.map((item, index) => {
         return {
           id: `${task.id}-iteration-${crypto.randomUUID()}`,
           type: template.type || 'TASK',
           goal: template.goal ? `${template.goal} [item: ${JSON.stringify(item)}]` : `Loop iteration ${index}`,
           dependsOn: task.dependsOn, // Inherits parents
           requiredCapabilities: template.requiredCapabilities || task.requiredCapabilities,
           status: TaskStatus.QUEUED,
           config: { ...template.config, loopItem: item, loopIndex: index }
         };
      });

      this.logger.log(`Loop node ${task.id} expanded into ${newTasks.length} tasks`);
      
      return { 
        success: true, 
        action: 'INJECT_TASKS', 
        tasksToInject: newTasks 
      };
    } catch (error: any) {
      this.logger.error(`LoopNodeExecutor failed: ${error.message}`);
      return { success: false, action: 'FAIL', error: error.message };
    }
  }
}

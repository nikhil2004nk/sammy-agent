import { Injectable, Logger } from '@nestjs/common';
import { INodeExecutor } from './node-executor.interface';

@Injectable()
export class NodeExecutorRegistry {
  private readonly logger = new Logger(NodeExecutorRegistry.name);
  private executors: Map<string, INodeExecutor> = new Map();

  register(nodeType: string, executor: INodeExecutor) {
    this.logger.log(`Registering NodeExecutor for type: ${nodeType}`);
    this.executors.set(nodeType, executor);
  }

  getExecutor(nodeType: string): INodeExecutor {
    const executor = this.executors.get(nodeType);
    if (!executor) {
      throw new Error(`No NodeExecutor registered for type: ${nodeType}`);
    }
    return executor;
  }
}

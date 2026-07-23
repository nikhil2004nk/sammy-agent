import { Injectable, Logger } from '@nestjs/common';
import { WorkflowDefinition, WorkflowNode } from './models/workflow-dsl.model';
import { ExecutionPlan } from '../planner/models/execution-plan.model';
import { Task, TaskStatus } from '../planner/models/task.model';
import * as crypto from 'crypto';

@Injectable()
export class WorkflowCompilerService {
  private readonly logger = new Logger(WorkflowCompilerService.name);

  /**
   * Main entrypoint for compilation.
   * Runs normalization, validation, and mapping to an ExecutionPlan DAG.
   */
  compile(workflow: WorkflowDefinition): ExecutionPlan {
    this.logger.log(`Compiling workflow: ${workflow.name} (${workflow.id})`);

    const normalizedWorkflow = this.normalize(workflow);
    this.validate(normalizedWorkflow);

    const tasks: Task[] = normalizedWorkflow.nodes.map(node => this.mapNodeToTask(node, normalizedWorkflow));

    return {
      id: crypto.randomUUID(),
      originalIntent: {
        goal: workflow.description || workflow.name,
        entities: [],
        constraints: [],
        priority: 'normal'
      },
      tasks,
      metadata: {
        estimatedComplexity: tasks.length,
        generatedAt: new Date(),
        version: 1
      }
    };
  }

  private normalize(workflow: WorkflowDefinition): WorkflowDefinition {
    // Assign defaults, expand shortcuts.
    return {
      ...workflow,
      nodes: workflow.nodes.map(n => ({
        ...n,
        type: n.type || 'TASK',
        config: n.config || {}
      }))
    };
  }

  private validate(workflow: WorkflowDefinition): void {
    // 1. Validate node IDs are unique
    const nodeIds = new Set<string>();
    for (const node of workflow.nodes) {
      if (nodeIds.has(node.id)) {
        throw new Error(`Duplicate node ID found: ${node.id}`);
      }
      nodeIds.add(node.id);
    }

    // 2. Validate all edges reference existing nodes
    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source)) {
         throw new Error(`Edge source missing: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
         throw new Error(`Edge target missing: ${edge.target}`);
      }
    }

    // 3. Cycle Detection (Topological Sort check)
    this.checkCycles(workflow);
  }

  private checkCycles(workflow: WorkflowDefinition): void {
    const adj = new Map<string, string[]>();
    workflow.nodes.forEach(n => adj.set(n.id, []));
    workflow.edges.forEach(e => {
      adj.get(e.source)?.push(e.target);
    });

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string) => {
      if (recStack.has(nodeId)) return true; // Cycle detected
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of workflow.nodes) {
      if (dfs(node.id)) {
        throw new Error('Cycle detected in workflow definition DAG.');
      }
    }
  }

  private mapNodeToTask(node: WorkflowNode, workflow: WorkflowDefinition): Task {
    // Find all incoming edges to determine dependencies
    const incomingEdges = workflow.edges.filter(e => e.target === node.id);
    const dependsOn = incomingEdges.map(e => e.source);

    // Extract common config fields for Task definition, if present
    const goal = (node.config.goal as string) || `Execute ${node.type} node ${node.id}`;
    const requiredCapabilities = (node.config.requiredCapabilities as string[]) || [];

    return {
      id: node.id,
      type: node.type,
      config: node.config,
      goal,
      dependsOn,
      requiredCapabilities,
      status: TaskStatus.PENDING
    };
  }
}

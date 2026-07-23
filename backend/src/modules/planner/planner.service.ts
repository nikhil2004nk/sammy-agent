import { Injectable, Inject, Logger } from '@nestjs/common';
import { ExecutionContext } from '../../common/execution-context';
import { Intent } from './interfaces/intent.interface';
import { PlanningResult } from './dto/planning-result.dto';
import { TaskStatus } from './models/task.model';
import { IPlanningMemory } from './interfaces/planning-memory.interface';
import { formatLog } from '../../common/logger-utils';
import * as crypto from 'crypto';
import { LlmFactoryService } from '../llm/factory/llm-factory.service';
import { ILLMMessage } from '../llm/interfaces/llm-provider.interface';

/**
 * Temporary interface to maintain backward compatibility 
 * while transitioning to full ExecutionPlans.
 */
export interface PlanStep {
  action: 'react_loop' | 'call_llm' | 'respond';
  toolName?: string;
  args?: Record<string, any>;
}

@Injectable()
export class PlannerService {
  private readonly logger = new Logger(PlannerService.name);

  constructor(
    @Inject(IPlanningMemory) private readonly memory: IPlanningMemory,
    private readonly llmFactory: LlmFactoryService
  ) {}

  /**
   * For Phase 1, the planner instructs the runtime to enter a ReAct (Reasoning and Acting) loop.
   * We wrap it in a PlanningResult to begin the transition to structured results.
   */
  async createPlan(context: ExecutionContext, intent: Intent): Promise<PlanningResult> {
    this.logger.log(formatLog(context, `Generating execution plan for goal: ${intent.goal}`));
    
    // Fetch context
    const memorySnapshot = await this.memory.getRelevantContext(context.workspaceId, intent.goal, context.userId);
    
    const systemPrompt = `You are the Sammy AI Planner. Your job is to break down the user's intent into a Directed Acyclic Graph (DAG) of executable tasks.
The available capabilities for tasks are: "chat", "analysis", "execution", "verification", "search".

You must respond ONLY with a valid JSON object (no markdown formatting, no comments) matching this schema:
{
  "confidence": 0.9,
  "reasoning": "Brief explanation of the plan",
  "tasks": [
    {
      "id": "task_1",
      "goal": "Description of what this task must accomplish",
      "dependsOn": [], // Array of task IDs this task depends on
      "requiredCapabilities": ["chat"] // Array of capabilities needed
    }
  ]
}

Make sure tasks have clear goals and reasonable dependencies. For a simple greeting like "hey" or "hello", a single task with "chat" capability is sufficient.`;

    const messages: ILLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Intent: ${intent.goal}` }
    ];

    try {
      // In a real app, you'd pull the default provider/model from settings, using 'openai' for now
      const provider = this.llmFactory.getProvider('openai');
      const response = await provider.generateResponse(messages, 0.2); // Low temperature for consistent JSON
      
      let rawContent = response.content || '{}';
      
      // Cleanup markdown if the LLM still wrapped it
      if (rawContent.startsWith('\`\`\`json')) {
        rawContent = rawContent.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      } else if (rawContent.startsWith('\`\`\`')) {
        rawContent = rawContent.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
      }

      const parsed = JSON.parse(rawContent);

      const planTasks = (parsed.tasks || []).map((t: any) => ({
        id: t.id || crypto.randomUUID(),
        goal: t.goal,
        dependsOn: t.dependsOn || [],
        requiredCapabilities: t.requiredCapabilities || ['chat'],
        status: TaskStatus.PENDING,
      }));

      const plan = {
        id: crypto.randomUUID(),
        originalIntent: intent,
        metadata: {
          estimatedComplexity: planTasks.length,
          generatedAt: new Date(),
          version: 1,
        },
        tasks: planTasks
      };

      return {
        success: true,
        reasoning: parsed.reasoning || 'Successfully generated plan',
        confidence: parsed.confidence || 1.0,
        plan: plan
      };

    } catch (error) {
      this.logger.error(formatLog(context, `Failed to generate LLM plan: ${error.message}`));
      // Fallback for extreme failure just so system doesn't completely die if OpenAI is misconfigured
      return {
        success: false,
        reasoning: 'Failed to generate plan via LLM',
        confidence: 0,
        plan: {
          id: crypto.randomUUID(),
          originalIntent: intent,
          metadata: { estimatedComplexity: 0, generatedAt: new Date(), version: 1 },
          tasks: []
        }
      };
    }
  }

  /**
   * Legacy method for the runtime until it fully supports PlanningResult.
   */
  async createLegacyPlan(context: ExecutionContext): Promise<PlanStep[]> {
    return [
      { action: 'react_loop' }
    ];
  }
}

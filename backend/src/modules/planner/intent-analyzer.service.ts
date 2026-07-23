import { Injectable } from '@nestjs/common';
import { IIntentAnalyzer } from './interfaces/intent-analyzer.interface';
import { Intent } from './interfaces/intent.interface';

@Injectable()
export class IntentAnalyzerService implements IIntentAnalyzer {
  /**
   * For Milestone 3.3, this is a mock implementation that avoids LLM calls.
   * It deterministically transforms a raw string into a structured Intent.
   */
  async analyze(userInput: string): Promise<Intent> {
    return {
      goal: userInput,
      entities: [],
      constraints: [],
      priority: 'normal',
    };
  }
}

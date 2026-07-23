import { Intent } from './intent.interface';

export interface IIntentAnalyzer {
  analyze(userInput: string): Promise<Intent>;
}

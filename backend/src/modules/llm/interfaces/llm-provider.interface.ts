export interface ILLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface ILLMResponse {
  content: string;
  tokensUsed?: number;
  toolCalls?: any[];
}

export interface ILLMProvider {
  generateResponse(messages: ILLMMessage[], temperature: number, maxTokens: number): Promise<ILLMResponse>;
}

export interface ILLMTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface ILLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string;
  toolCalls?: { id: string; name: string; arguments: Record<string, any> }[];
  toolCallId?: string; // For tool messages
  name?: string;       // For tool messages
}

export interface ILLMResponse {
  content?: string;
  tokensUsed?: number;
  toolCalls?: { id: string; name: string; arguments: Record<string, any> }[];
}

export interface ILLMProvider {
  generateResponse(
    messages: ILLMMessage[], 
    temperature: number, 
    maxTokens: number, 
    tools?: ILLMTool[],
    onToken?: (token: string) => void
  ): Promise<ILLMResponse>;
}

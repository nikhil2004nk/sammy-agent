import { Test, TestingModule } from '@nestjs/testing';
import { AgentLoopService } from '../src/modules/runtime/agent-loop/agent-loop.service';
import { ConversationService } from '../src/modules/conversation/conversation.service';
import { RuntimeModule } from '../src/modules/runtime/runtime.module';
import { ConfigModule } from '@nestjs/config';
import { ExecutionContext } from '../src/common/execution-context';
import { LlmFactoryService } from '../src/modules/llm/factory/llm-factory.service';
import { ILLMProvider, ILLMMessage, ILLMResponse, ILLMTool } from '../src/modules/llm/interfaces/llm-provider.interface';
import * as path from 'path';

// Override the config for this test to point to the local mock server
const testConfig = () => ({
  mcp: {
    servers: {
      mock: {
        command: 'node',
        args: [path.join(__dirname, 'mock-mcp-server/index.js')],
        transport: 'stdio',
      },
    },
  },
  llm: {
    defaultProvider: 'mock',
  }
});

// A custom mock provider that simulates a ReAct loop:
// 1st call -> asks for a tool (mock.echo)
// 2nd call -> returns final answer
class ScriptedMockLlmProvider implements ILLMProvider {
  private callCount = 0;

  async generateResponse(messages: ILLMMessage[], temperature: number, maxTokens: number, tools?: ILLMTool[]): Promise<ILLMResponse> {
    this.callCount++;
    
    if (this.callCount === 1) {
      return {
        content: '',
        toolCalls: [{
          id: 'call_123',
          name: 'mock.echo',
          arguments: { message: 'Hello Loop' }
        }]
      };
    } else {
      return {
        content: 'Final Answer: The tool echoed Hello Loop',
      };
    }
  }
}

describe('Agent Loop (e2e)', () => {
  let app: any;
  let agentLoop: AgentLoopService;
  let conversationService: ConversationService;
  let llmFactory: LlmFactoryService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [testConfig], isGlobal: true }),
        RuntimeModule
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    agentLoop = moduleFixture.get<AgentLoopService>(AgentLoopService);
    conversationService = moduleFixture.get<ConversationService>(ConversationService);
    llmFactory = moduleFixture.get<LlmFactoryService>(LlmFactoryService);

    // Override the mock provider
    const scriptedProvider = new ScriptedMockLlmProvider();
    jest.spyOn(llmFactory, 'getProvider').mockReturnValue(scriptedProvider);

    // Wait a bit for MCP server to connect and discover tools
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    await app.close();
  });

  it('should run a complete agent loop (User -> ToolCall -> ToolResult -> FinalAnswer)', async () => {
    const context: ExecutionContext = {
      traceId: 'trace-loop-1',
      agentId: 'agent-1',
      conversationId: 'conv-loop-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      toolCalls: [],
      modelConfig: { provider: 'mock', model: 'mock', temperature: 0, maxTokens: 100 },
      metadata: {}
    };

    const conversation = conversationService.createConversation();
    
    const finalAnswer = await agentLoop.runLoop(context, conversationId, 'Please echo "Hello Loop"');
    
    expect(finalAnswer).toBe('Final Answer: The tool echoed Hello Loop');

    // Verify conversation state
    const messages = conversationService.getMessages(conversationId);
    
    expect(messages.length).toBe(4);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('Please echo "Hello Loop"');
    
    expect(messages[1].role).toBe('assistant');
    expect((messages[1] as any).toolCalls).toBeDefined();
    expect((messages[1] as any).toolCalls[0].name).toBe('mock.echo');

    expect(messages[2].role).toBe('tool');
    expect((messages[2] as any).toolName).toBe('mock.echo');
    
    expect(messages[3].role).toBe('assistant');
    expect(messages[3].content).toBe('Final Answer: The tool echoed Hello Loop');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AgentLoopService } from '../src/modules/runtime/agent-loop/agent-loop.service';
import { ConversationService } from '../src/modules/conversation/conversation.service';
import { RuntimeModule } from '../src/modules/runtime/runtime.module';
import { ConfigModule } from '@nestjs/config';
import { ExecutionContext } from '../src/common/execution-context';
import { LlmFactoryService } from '../src/modules/llm/factory/llm-factory.service';
import { ILLMProvider, ILLMMessage, ILLMResponse, ILLMTool } from '../src/modules/llm/interfaces/llm-provider.interface';
import * as path from 'path';

import { WorkspacesModule } from '../src/modules/workspaces/workspaces.module';

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
        RuntimeModule,
        WorkspacesModule
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
    const validWorkspaceId = '00000000-0000-0000-0000-000000000001';
    
    // Create the workspace first to satisfy foreign key constraints
    const prisma = app.get(require('../src/modules/prisma/prisma.service').PrismaService);
    await prisma.workspace.upsert({
      where: { id: validWorkspaceId },
      update: {},
      create: { id: validWorkspaceId, name: 'Test Workspace' }
    });

    const conversation = await conversationService.createConversation(validWorkspaceId);
    const conversationId = conversation.id;

    const context = {
      traceId: require('crypto').randomUUID(),
      agentId: require('crypto').randomUUID(),
      conversationId: conversationId,
      runId: require('crypto').randomUUID(),
      workspaceId: validWorkspaceId,
      modelConfig: { provider: 'mock', model: 'mock', temperature: 0, maxTokens: 100 },
      metadata: {}
    } as ExecutionContext;
    
    const finalAnswer = await agentLoop.runLoop(context, conversationId, 'Please echo "Hello Loop"');
    
    expect(finalAnswer).toBe('Final Answer: The tool echoed Hello Loop');

    // Verify conversation state
    const messages = await conversationService.getMessages(validWorkspaceId, conversationId);
    
    expect(messages.length).toBe(4);
    expect(messages[0].role).toBe('USER');
    expect((messages[0] as any).parts[0].content.text).toBe('Please echo "Hello Loop"');
    
    expect(messages[1].role).toBe('ASSISTANT');
    expect((messages[1] as any).parts[0].type).toBe('TOOL_CALL');
    expect((messages[1] as any).parts[0].content.name).toBe('mock.echo');

    expect(messages[2].role).toBe('TOOL');
    expect((messages[2] as any).parts[0].toolCallId).toBeDefined();
    
    expect(messages[3].role).toBe('ASSISTANT');
    expect((messages[3] as any).parts[0].content.text).toBe('Final Answer: The tool echoed Hello Loop');
  });
});

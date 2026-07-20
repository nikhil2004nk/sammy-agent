import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule } from '../src/modules/mcp/mcp.module';
import { RegistryModule } from '../src/modules/registry/registry.module';
import { EventsModule } from '../src/modules/events/events.module';
import { ResolverModule } from '../src/modules/resolver/resolver.module';
import { PermissionsModule } from '../src/modules/permissions/permissions.module';
import { ToolRegistryService } from '../src/modules/registry/tool-registry.service';
import mcpConfig from '../src/modules/mcp/config/mcp.config';

describe('Gmail MCP End-to-End Validation (e2e)', () => {
  let app: any;
  let registry: ToolRegistryService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [mcpConfig], isGlobal: true }),
        EventsModule,
        McpModule,
        RegistryModule,
        ResolverModule,
        PermissionsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    registry = app.get(ToolRegistryService);

    // Wait for the async startup to initialize the Gmail MCP server and run discovery
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    await app.close();
  });

  it('Scenario 1: Manager Connects Gmail -> Discovery Runs -> Registry Contains Gmail Tools', () => {
    const tools = registry.getAllTools();
    
    // Validate we discovered tools
    expect(tools.length).toBeGreaterThan(0);

    // Validate tools belong to 'gmail' namespace
    const gmailTools = tools.filter(t => t.serverId === 'gmail');
    expect(gmailTools.length).toBe(5);

    // Validate specific tools exist
    const sendEmailTool = gmailTools.find(t => t.name === 'send_email');
    expect(sendEmailTool).toBeDefined();
    expect(sendEmailTool?.description).toContain('Send an email');

    const listMessagesTool = gmailTools.find(t => t.name === 'list_messages');
    expect(listMessagesTool).toBeDefined();

    const searchTool = gmailTools.find(t => t.name === 'search');
    expect(searchTool).toBeDefined();

    const replyTool = gmailTools.find(t => t.name === 'reply');
    expect(replyTool).toBeDefined();

    const createDraftTool = gmailTools.find(t => t.name === 'create_draft');
    expect(createDraftTool).toBeDefined();
  });

  it('Scenario 2: No duplicate tools on reconnect', async () => {
    // We simulate a reconnect by triggering the connected event manually
    const eventBus = app.get(require('../src/modules/events/event-bus.service').EventBusService);
    eventBus.emitServerConnected('sys-test', 'gmail');
    
    // Wait for discovery to process
    await new Promise(resolve => setTimeout(resolve, 1000));

    const tools = registry.getAllTools();
    const gmailTools = tools.filter(t => t.serverId === 'gmail');
    
    // Count should still be exactly 5, no duplicates
    expect(gmailTools.length).toBe(5);
  });
});

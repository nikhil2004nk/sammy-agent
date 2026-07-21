import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ExecutionService } from './modules/runtime/execution/execution.service';

describe('AppController', () => {
  let appController: AppController;
  let executionService: ExecutionService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: ExecutionService,
          useValue: { executeTurn: jest.fn().mockResolvedValue('Hello Chat!') },
        }
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    executionService = app.get<ExecutionService>(ExecutionService);
  });

  describe('chat', () => {
    it('should return the response from executionService', async () => {
      const response = await appController.chat({ agentId: 'agent-1', message: 'Hi' });
      expect(response.response).toBe('Hello Chat!');
    });
  });
});

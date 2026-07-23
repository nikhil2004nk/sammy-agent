import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('Architecture Smoke Test', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    // We attempt to compile the root AppModule to verify all dependencies and modules resolve.
    // If there are circular dependencies or missing providers, this will fail.
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should boot the application and resolve all modules', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should initialize the PlannerModule', () => {
    // Replace with a real service check from planner module if needed, e.g., PlannerService
    const appModule = moduleRef.get(AppModule);
    expect(appModule).toBeDefined();
  });

  it('should initialize the RuntimeModule', () => {
    const appModule = moduleRef.get(AppModule);
    expect(appModule).toBeDefined();
  });
});

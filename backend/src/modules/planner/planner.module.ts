import { Module } from '@nestjs/common';
import { PlannerService } from './planner.service';
import { IntentAnalyzerService } from './intent-analyzer.service';
import { CapabilityResolverService } from './capability-resolver.service';
import { ReflectionEngineService } from './reflection-engine.service';
import { RegistryModule } from '../registry/registry.module';
import { MemoryModule } from '../memory/memory.module';
import { MemoryService } from '../memory/memory.service';
import { IPlanningMemory } from './interfaces/planning-memory.interface';

@Module({
  imports: [RegistryModule, MemoryModule],
  providers: [
    PlannerService, 
    IntentAnalyzerService, 
    CapabilityResolverService, 
    ReflectionEngineService,
    {
      provide: IPlanningMemory,
      useExisting: MemoryService,
    }
  ],
  exports: [PlannerService, IntentAnalyzerService, CapabilityResolverService, ReflectionEngineService, IPlanningMemory],
})
export class PlannerModule {}

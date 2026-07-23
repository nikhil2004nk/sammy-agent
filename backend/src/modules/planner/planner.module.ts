import { Module } from '@nestjs/common';
import { PlannerService } from './planner.service';
import { IntentAnalyzerService } from './intent-analyzer.service';
import { CapabilityResolverService } from './capability-resolver.service';
import { ReflectionEngineService } from './reflection-engine.service';
import { RegistryModule } from '../registry/registry.module';

@Module({
  imports: [RegistryModule],
  providers: [PlannerService, IntentAnalyzerService, CapabilityResolverService, ReflectionEngineService],
  exports: [PlannerService, IntentAnalyzerService, CapabilityResolverService, ReflectionEngineService],
})
export class PlannerModule {}

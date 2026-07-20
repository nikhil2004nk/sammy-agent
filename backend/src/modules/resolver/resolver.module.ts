import { Module } from '@nestjs/common';
import { CapabilityResolverService } from './capability-resolver.service';
import { RegistryModule } from '../registry/registry.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [RegistryModule, PermissionsModule],
  providers: [CapabilityResolverService],
  exports: [CapabilityResolverService],
})
export class ResolverModule {}

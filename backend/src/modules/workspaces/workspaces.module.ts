import { Module, Global } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspaceGuard } from './guards/workspace.guard';

@Global() // Make it global so WorkspaceGuard is easily available
@Module({
  imports: [PrismaModule],
  providers: [WorkspacesService, WorkspaceGuard],
  controllers: [WorkspacesController],
  exports: [WorkspacesService, WorkspaceGuard],
})
export class WorkspacesModule {}

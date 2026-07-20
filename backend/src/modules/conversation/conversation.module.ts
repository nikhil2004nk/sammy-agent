import { Module, forwardRef } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { PrismaConversationRepository } from './repositories/prisma/prisma-conversation.repository';
import { PrismaRunRepository } from './repositories/prisma/prisma-run.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationController } from './conversation.controller';
import { RuntimeModule } from '../runtime/runtime.module';

@Module({
  imports: [PrismaModule, forwardRef(() => RuntimeModule)],
  controllers: [ConversationController],
  providers: [
    ConversationService,
    { provide: 'IConversationRepository', useClass: PrismaConversationRepository },
    { provide: 'IRunRepository', useClass: PrismaRunRepository }
  ],
  exports: [ConversationService],
})
export class ConversationModule {}

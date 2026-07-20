import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { PrismaConversationRepository } from './repositories/prisma/prisma-conversation.repository';
import { PrismaRunRepository } from './repositories/prisma/prisma-run.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    ConversationService,
    { provide: 'IConversationRepository', useClass: PrismaConversationRepository },
    { provide: 'IRunRepository', useClass: PrismaRunRepository }
  ],
  exports: [ConversationService],
})
export class ConversationModule {}

import { Module } from '@nestjs/common';
// import { KnowledgeService } from './knowledge.service';

/**
 * Knowledge Module (Scaffolded for Phase 5)
 * Will handle RAG (Retrieval-Augmented Generation) against external user documents.
 */
@Module({
  imports: [],
  providers: [
    // KnowledgeService,
    // {
    //   provide: IKnowledgeProvider,
    //   useClass: PineconeKnowledgeProvider,
    // }
  ],
  exports: [
    // KnowledgeService
  ],
})
export class KnowledgeModule {}

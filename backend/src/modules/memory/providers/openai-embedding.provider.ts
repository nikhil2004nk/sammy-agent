import { Injectable, Logger } from '@nestjs/common';
import { IEmbeddingProvider } from '../interfaces/embedding.types';

@Injectable()
export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  private readonly logger = new Logger(OpenAIEmbeddingProvider.name);

  async embed(text: string): Promise<number[]> {
    this.logger.debug(`Generating embedding for text (length: ${text.length})`);
    
    // Stub implementation for now until we integrate the actual OpenAI SDK
    // Returns a dummy 1536-dimensional vector
    return new Array(1536).fill(0.01);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    this.logger.debug(`Generating embeddings for batch of ${texts.length} texts`);
    
    // Stub implementation
    return texts.map(() => new Array(1536).fill(0.01));
  }
}

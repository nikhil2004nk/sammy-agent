import { registerAs } from '@nestjs/config';

export const llmConfig = registerAs('llm', () => {
  const provider = process.env.LLM_PROVIDER || 'openai';

  return {
    provider,
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      baseUrl: process.env.OPENAI_BASE_URL,
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENAI_MODEL || 'openai/gpt-4o',
      baseUrl: 'https://openrouter.ai/api/v1',
    },
    ollama: {
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3',
    },
  };
});

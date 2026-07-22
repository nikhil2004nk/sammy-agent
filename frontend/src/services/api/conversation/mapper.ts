import { Conversation, ConversationDto, Message, MessageDto } from './types';

export function mapConversationToDomain(dto: ConversationDto): Conversation {
  return {
    id: dto.id,
    title: dto.title,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export function mapMessageToDomain(dto: any): Message {
  let content = dto.content || '';
  
  if (!content && dto.parts && Array.isArray(dto.parts)) {
    content = dto.parts
      .filter((p: any) => {
        const t = (p.type || '').toLowerCase();
        return t === 'text' || t === 'tool_call' || t === 'tool_result';
      })
      .map((p: any) => {
        if (typeof p.content === 'string') return p.content;
        if (p.content?.text) return p.content.text;
        if (p.content?.result) return p.content.result;
        if (p.content?.arguments) {
          const argsString = typeof p.content.arguments === 'object' 
            ? JSON.stringify(p.content.arguments, null, 2) 
            : p.content.arguments;
          return `[Tool Call] ${p.content.name || 'Unknown'}\n${argsString}`;
        }
        return JSON.stringify(p.content);
      })
      .join('\n');
  }

  return {
    id: dto.id,
    conversationId: dto.conversationId || '',
    role: (dto.role || '').toLowerCase(),
    content: content,
    createdAt: new Date(dto.createdAt),
  };
}

import { apiClient } from '../index';
import { ConversationDto, MessageDto } from './types';
import { mapConversationToDomain, mapMessageToDomain } from './mapper';

export const conversationService = {
  list: async () => {
    const data = await apiClient<ConversationDto[]>('/conversations');
    return data.map(mapConversationToDomain);
  },
  
  get: async (id: string) => {
    const data = await apiClient<ConversationDto>(`/conversations/${id}`);
    return mapConversationToDomain(data);
  },
  
  create: async (data: Partial<ConversationDto>) => {
    const response = await apiClient<ConversationDto>('/conversations', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
    return mapConversationToDomain(response);
  },
  
  delete: async (id: string) => {
    return apiClient<void>(`/conversations/${id}`, { method: 'DELETE' });
  },
  
  listMessages: async (conversationId: string) => {
    const data = await apiClient<MessageDto[]>(`/conversations/${conversationId}/messages`);
    return data.map(mapMessageToDomain);
  },
  
  sendMessage: async (conversationId: string, content: string) => {
    const response = await apiClient<MessageDto>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    return mapMessageToDomain(response);
  }
};

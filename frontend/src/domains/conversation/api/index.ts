import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { Conversation, Message, CreateConversationDto, SendMessageDto } from '../types';

// Keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  detail: (id: string) => [...conversationKeys.all, 'detail', id] as const,
  messages: (id: string) => [...conversationKeys.detail(id), 'messages'] as const,
};

// --- Conversations ---

export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.lists(),
    queryFn: () => apiClient<Conversation[]>('/conversations'),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: conversationKeys.detail(id!),
    queryFn: () => apiClient<Conversation>(`/conversations/${id}`),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConversationDto) => apiClient<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient(`/conversations/${id}`, { method: 'DELETE' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.removeQueries({ queryKey: conversationKeys.detail(id) });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      apiClient<Conversation>(`/conversations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.setQueryData(conversationKeys.detail(data.id), data);
    },
  });
}

// --- Messages ---

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId!),
    queryFn: () => apiClient<Message[]>(`/conversations/${conversationId}/messages`),
    enabled: !!conversationId,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessageDto) => apiClient<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onMutate: async (newMessage) => {
      // Optimistic UI update
      await queryClient.cancelQueries({ queryKey: conversationKeys.messages(conversationId) });
      const previousMessages = queryClient.getQueryData<Message[]>(conversationKeys.messages(conversationId));

      const optimisticMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        status: 'completed',
        createdAt: new Date().toISOString(),
        parts: [{ type: 'text', content: newMessage.content }]
      };

      const optimisticAssistant: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        status: 'streaming',
        createdAt: new Date().toISOString(),
        parts: [{ type: 'text', content: 'Thinking...' }] // Placeholder
      };

      queryClient.setQueryData<Message[]>(conversationKeys.messages(conversationId), (old) => [
        ...(old || []),
        optimisticMessage,
        optimisticAssistant
      ]);

      return { previousMessages };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(conversationKeys.messages(conversationId), context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

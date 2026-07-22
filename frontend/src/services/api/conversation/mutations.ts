import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from './service';
import { queryKeys } from '../queryKeys';
import { ConversationDto } from './types';
import { useAuthStore } from '@/store/auth.store';

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ConversationDto>) => conversationService.create(data),
    onSuccess: () => {
      const workspaceId = useAuthStore.getState().activeWorkspaceId;
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations(workspaceId) });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversationService.delete(id),
    onSuccess: () => {
      const workspaceId = useAuthStore.getState().activeWorkspaceId;
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations(workspaceId) });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => 
      conversationService.sendMessage(id, content),
    onMutate: async ({ id, content }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.conversationMessages(id) });
      
      const previousMessages = queryClient.getQueryData<any[]>(queryKeys.conversationMessages(id));
      
      // Optimistically add user message and a placeholder assistant message
      if (previousMessages) {
        queryClient.setQueryData(queryKeys.conversationMessages(id), [
          ...previousMessages,
          {
            id: 'optimistic-user-' + Date.now(),
            role: 'user',
            content: content,
            createdAt: new Date().toISOString()
          },
          {
            id: 'optimistic-assistant-' + Date.now(),
            role: 'assistant',
            content: 'Thinking...',
            createdAt: new Date().toISOString()
          }
        ]);
      }

      return { previousMessages };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.conversationMessages(newTodo.id), context.previousMessages);
      }
    },
    onSuccess: (_, { id }) => {
      const workspaceId = useAuthStore.getState().activeWorkspaceId;
      // Invalidate to make sure we have the final truth from the DB, but SSE handles the streaming in between!
      queryClient.invalidateQueries({ queryKey: queryKeys.conversationMessages(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations(workspaceId) });
    },
  });
}

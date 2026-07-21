import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from './service';
import { queryKeys } from '../queryKeys';
import { ConversationDto } from './types';

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ConversationDto>) => conversationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => conversationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => 
      conversationService.sendMessage(id, content),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversationMessages(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

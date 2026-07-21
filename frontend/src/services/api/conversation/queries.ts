import { useQuery } from '@tanstack/react-query';
import { conversationService } from './service';
import { queryKeys } from '../queryKeys';
import { useAuthStore } from '@/store/auth.store';

export function useConversations() {
  const workspaceId = useAuthStore(state => state.activeWorkspaceId);
  return useQuery({
    queryKey: queryKeys.conversations(workspaceId),
    queryFn: () => conversationService.list(),
    enabled: !!workspaceId,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: queryKeys.conversation(id),
    queryFn: () => conversationService.get(id),
    enabled: !!id,
  });
}

export function useConversationMessages(id: string) {
  return useQuery({
    queryKey: queryKeys.conversationMessages(id),
    queryFn: () => conversationService.listMessages(id),
    enabled: !!id,
  });
}

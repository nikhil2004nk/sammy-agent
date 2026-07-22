import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalService } from './service';
import { queryKeys } from '../queryKeys';
import { useAuthStore } from '@/store/auth.store';

export function useApprove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: { modifiedArguments?: any } }) => 
      approvalService.approve(id, payload),
    onSuccess: (_, { id }) => {
      const workspaceId = useAuthStore.getState().activeWorkspaceId;
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.approval(id) });
    },
  });
}

export function useReject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: { reason?: string } }) => 
      approvalService.reject(id, payload),
    onSuccess: (_, { id }) => {
      const workspaceId = useAuthStore.getState().activeWorkspaceId;
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.approval(id) });
    },
  });
}

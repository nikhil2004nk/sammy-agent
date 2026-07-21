import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalService } from './service';
import { queryKeys } from '../queryKeys';

export function useApprove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: { modifiedArguments?: any } }) => 
      approvalService.approve(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals });
      queryClient.invalidateQueries({ queryKey: queryKeys.approval(id) });
    },
  });
}

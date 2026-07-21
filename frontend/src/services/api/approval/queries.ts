import { useQuery } from '@tanstack/react-query';
import { approvalService } from './service';
import { queryKeys } from '../queryKeys';
import { useAuthStore } from '@/store/auth.store';

export function useApprovals() {
  const workspaceId = useAuthStore(state => state.activeWorkspaceId);
  return useQuery({
    queryKey: queryKeys.approvals(workspaceId),
    queryFn: () => approvalService.list(),
    enabled: !!workspaceId,
  });
}

export function useApproval(id: string) {
  return useQuery({
    queryKey: queryKeys.approval(id),
    queryFn: () => approvalService.get(id),
    enabled: !!id,
  });
}

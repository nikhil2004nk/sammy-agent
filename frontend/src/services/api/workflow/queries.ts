import { useQuery } from '@tanstack/react-query';
import { workflowService } from './service';
import { queryKeys } from '../queryKeys';
import { useAuthStore } from '@/store/auth.store';

export function useWorkflows() {
  const workspaceId = useAuthStore(state => state.activeWorkspaceId);
  return useQuery({
    queryKey: queryKeys.workflows(workspaceId),
    queryFn: () => workflowService.list(),
    enabled: !!workspaceId,
  });
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: queryKeys.workflow(id),
    queryFn: () => workflowService.get(id),
    enabled: !!id,
  });
}

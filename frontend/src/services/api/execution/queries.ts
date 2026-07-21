import { useQuery } from '@tanstack/react-query';
import { executionService } from './service';
import { queryKeys } from '../queryKeys';
import { useAuthStore } from '@/store/auth.store';

export function useExecutions(params?: { workflowId?: string; status?: string }) {
  const workspaceId = useAuthStore(state => state.activeWorkspaceId);
  return useQuery({
    queryKey: [...queryKeys.executions(workspaceId), params],
    queryFn: () => executionService.list(params),
    enabled: !!workspaceId,
  });
}

export function useExecution(id: string) {
  return useQuery({
    queryKey: queryKeys.execution(id),
    queryFn: () => executionService.get(id),
    enabled: !!id,
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executionService } from './service';
import { queryKeys } from '../queryKeys';
import { useAuthStore } from '@/store/auth.store';

export function useCancelExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => executionService.cancelExecution(id),
    onSuccess: (_, id) => {
      const workspaceId = useAuthStore.getState().activeWorkspaceId;
      queryClient.invalidateQueries({ queryKey: queryKeys.executions(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.execution(id) });
    },
  });
}

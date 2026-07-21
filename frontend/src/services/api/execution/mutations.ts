import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executionService } from './service';
import { queryKeys } from '../queryKeys';

export function useCancelExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => executionService.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.executions });
      queryClient.invalidateQueries({ queryKey: queryKeys.execution(id) });
    },
  });
}

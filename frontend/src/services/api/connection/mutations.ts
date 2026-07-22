import { useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionService } from './service';
import { queryKeys } from '../queryKeys';
import { ConnectionDto } from './types';

export function useCreateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ConnectionDto>) => connectionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => connectionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

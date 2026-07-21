import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowService } from './service';
import { queryKeys } from '../queryKeys';
import { WorkflowDto } from './types';

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WorkflowDto>) => workflowService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowDto> }) => workflowService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows });
      queryClient.invalidateQueries({ queryKey: queryKeys.workflow(data.id) });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows });
    },
  });
}

export function useRunWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { goal?: string; context?: string; instructions?: string } }) => 
      workflowService.run(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.executions });
    },
  });
}

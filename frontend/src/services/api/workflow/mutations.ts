import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowService } from './service';
import { queryKeys } from '../queryKeys';
import { WorkflowDto } from './types';
import { useAuthStore } from '@/store/auth.store';

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WorkflowDto>) => workflowService.create(data),
    onSuccess: () => {
      const workspaceId = useAuthStore.getState().activeWorkspaceId;
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows(workspaceId) });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowDto> }) => workflowService.update(id, data),
    onSuccess: (data) => {
      const workspaceId = useAuthStore.getState().activeWorkspaceId;
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workflow(data.id) });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workflowService.delete(id),
    onSuccess: () => {
      const workspaceId = useAuthStore.getState().activeWorkspaceId;
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows(workspaceId) });
    },
  });
}

export function useRunWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { goal?: string; context?: string; instructions?: string } }) => 
      workflowService.run(id, payload),
    onSuccess: () => {
      const workspaceId = useAuthStore.getState().activeWorkspaceId;
      queryClient.invalidateQueries({ queryKey: queryKeys.executions(workspaceId) });
    },
  });
}

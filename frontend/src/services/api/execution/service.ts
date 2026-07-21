import { apiClient } from '../index';
import { ExecutionDto } from './types';
import { mapExecutionToDomain } from './mapper';
import { useAuthStore } from '@/store/auth.store';

const getWorkspaceId = () => useAuthStore.getState().activeWorkspaceId;

export const executionService = {
  list: async (params?: { workflowId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.workflowId) query.append('workflowId', params.workflowId);
    if (params?.status) query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    
    const data = await apiClient<ExecutionDto[]>(`/workspaces/${getWorkspaceId()}/executions${queryString}`);
    return data.map(mapExecutionToDomain);
  },
  
  get: async (id: string) => {
    const data = await apiClient<ExecutionDto>(`/runs/${id}`);
    return mapExecutionToDomain(data);
  },
  
  cancel: async (id: string) => {
    return apiClient<void>(`/runs/${id}/cancel`, { method: 'POST' });
  },
};

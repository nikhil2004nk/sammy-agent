import { apiClient } from '../index';
import { WorkflowDto } from './types';
import { mapWorkflowToDomain } from './mapper';
import { useAuthStore } from '@/store/auth.store';

const getBaseUrl = () => {
  const workspaceId = useAuthStore.getState().activeWorkspaceId;
  return `/workspaces/${workspaceId}/workflows`;
};

export const workflowService = {
  list: async () => {
    const data = await apiClient<WorkflowDto[]>(getBaseUrl());
    return data.map(mapWorkflowToDomain);
  },
  
  get: async (id: string) => {
    const data = await apiClient<WorkflowDto>(`${getBaseUrl()}/${id}`);
    return mapWorkflowToDomain(data);
  },
  
  create: async (data: Partial<WorkflowDto>) => {
    const response = await apiClient<WorkflowDto>(getBaseUrl(), { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
    return mapWorkflowToDomain(response);
  },
  
  update: async (id: string, data: Partial<WorkflowDto>) => {
    const response = await apiClient<WorkflowDto>(`${getBaseUrl()}/${id}`, { 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    });
    return mapWorkflowToDomain(response);
  },
  
  delete: async (id: string) => {
    return apiClient<void>(`${getBaseUrl()}/${id}`, { method: 'DELETE' });
  },
  
  run: async (id: string, payload: { goal?: string; context?: string; instructions?: string }) => {
    return apiClient<{ runId: string }>(`${getBaseUrl()}/${id}/run`, { 
      method: 'POST', 
      body: JSON.stringify(payload) 
    });
  }
};

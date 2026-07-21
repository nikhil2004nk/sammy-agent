import { apiClient } from '../index';
import { ConnectionDto } from './types';
import { mapConnectionToDomain } from './mapper';
import { useAuthStore } from '@/store/auth.store';

const getBaseUrl = () => {
  const workspaceId = useAuthStore.getState().activeWorkspaceId;
  return `/workspaces/${workspaceId}/connections`;
};

export const connectionService = {
  list: async () => {
    const data = await apiClient<ConnectionDto[]>(getBaseUrl());
    return data.map(mapConnectionToDomain);
  },
  
  get: async (id: string) => {
    const data = await apiClient<ConnectionDto>(`${getBaseUrl()}/${id}`);
    return mapConnectionToDomain(data);
  },
  
  create: async (data: Partial<ConnectionDto>) => {
    const response = await apiClient<ConnectionDto>(getBaseUrl(), { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
    return mapConnectionToDomain(response);
  },
  
  delete: async (id: string) => {
    return apiClient<void>(`${getBaseUrl()}/${id}`, { method: 'DELETE' });
  },
};

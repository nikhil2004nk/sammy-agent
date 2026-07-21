import { apiClient } from '../index';
import { ApprovalDto } from './types';
import { mapApprovalToDomain } from './mapper';
import { useAuthStore } from '@/store/auth.store';

const getWorkspaceId = () => useAuthStore.getState().activeWorkspaceId;

export const approvalService = {
  list: async () => {
    const data = await apiClient<ApprovalDto[]>(`/workspaces/${getWorkspaceId()}/approvals`);
    return data.map(mapApprovalToDomain);
  },
  
  get: async (id: string) => {
    const data = await apiClient<ApprovalDto>(`/approvals/${id}`);
    return mapApprovalToDomain(data);
  },
  
  approve: async (id: string, payload?: { modifiedArguments?: any }) => {
    return apiClient<void>(`/approvals/${id}/approve`, { 
      method: 'POST', 
      body: JSON.stringify(payload || {}) 
    });
  },
  
  reject: async (id: string, payload?: { reason?: string }) => {
    return apiClient<void>(`/approvals/${id}/reject`, { 
      method: 'POST', 
      body: JSON.stringify(payload || {}) 
    });
  },
};

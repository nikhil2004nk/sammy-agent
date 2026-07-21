import { apiClient } from './index';

export interface Approval {
  id: string;
  runId: string;
  tool: string;
  arguments: any;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  createdAt: string;
}

export const approvalApi = {
  list: () => apiClient<Approval[]>('/approvals'),
  get: (id: string) => apiClient<Approval>(`/approvals/${id}`),
  approve: (id: string, payload?: { modifiedArguments?: any }) => 
    apiClient<void>(`/approvals/${id}/approve`, { method: 'POST', body: JSON.stringify(payload || {}) }),
  reject: (id: string, payload?: { reason?: string }) => 
    apiClient<void>(`/approvals/${id}/reject`, { method: 'POST', body: JSON.stringify(payload || {}) }),
};

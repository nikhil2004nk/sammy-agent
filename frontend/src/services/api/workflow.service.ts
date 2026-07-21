import { apiClient } from './index';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  definition: any; // Raw JSON definition
  status: 'Draft' | 'Active' | 'Archived';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const workflowApi = {
  list: () => apiClient<Workflow[]>('/workflows'),
  get: (id: string) => apiClient<Workflow>(`/workflows/${id}`),
  create: (data: Partial<Workflow>) => 
    apiClient<Workflow>('/workflows', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Workflow>) => 
    apiClient<Workflow>(`/workflows/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => 
    apiClient<void>(`/workflows/${id}`, { method: 'DELETE' }),
  run: (id: string, payload: { goal?: string; context?: string; instructions?: string }) => 
    apiClient<{ runId: string }>(`/workflows/${id}/run`, { method: 'POST', body: JSON.stringify(payload) })
};

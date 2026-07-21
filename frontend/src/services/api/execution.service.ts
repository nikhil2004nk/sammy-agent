import { apiClient } from './index';

export interface Execution {
  id: string;
  workflowId: string;
  status: 'Draft' | 'Active' | 'Running' | 'Waiting Approval' | 'Completed' | 'Failed' | 'Cancelled';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  result?: any;
  logs?: any[];
  plannerState?: any;
  memoryContext?: any;
  toolCalls?: any[];
  delegations?: any[];
}

export const executionApi = {
  list: (params?: { workflowId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.workflowId) query.append('workflowId', params.workflowId);
    if (params?.status) query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient<Execution[]>(`/executions${queryString}`);
  },
  get: (id: string) => apiClient<Execution>(`/executions/${id}`),
  cancel: (id: string) => apiClient<void>(`/executions/${id}/cancel`, { method: 'POST' }),
};

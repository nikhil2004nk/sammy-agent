import { useWorkflows } from '@/services/api/workflow';
import { useExecutions } from '@/services/api/execution';
import { useApprovals } from '@/services/api/approval';
import { useConnections } from '@/services/api/connection';
import { useConversations } from '@/services/api/conversation';

export function useDashboardViewModel() {
  const { data: workflows = [], isLoading: isLoadingWorkflows } = useWorkflows();
  const { data: executions = [], isLoading: isLoadingExecutions } = useExecutions();
  const { data: approvals = [], isLoading: isLoadingApprovals } = useApprovals();
  const { data: connections = [], isLoading: isLoadingConnections } = useConnections();
  const { data: conversations = [], isLoading: isLoadingConversations } = useConversations();

  const isLoading = isLoadingWorkflows || isLoadingExecutions || isLoadingApprovals || isLoadingConnections || isLoadingConversations;

  // Aggregate metrics
  const activeWorkflowsCount = workflows.filter(w => w.status === 'Active').length;
  
  const runningExecutionsCount = executions.filter(e => 
    e.status === 'Running' || e.status === 'Active'
  ).length;

  const failedExecutionsCount = executions.filter(e => e.status === 'Failed').length;

  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;

  // Mock scheduled jobs since we don't have a schedule API yet
  const scheduledJobsCount = 18; 

  const recentExecutions = [...executions].sort((a, b) => {
    return (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0);
  }).slice(0, 5);

  const connectedProviders = connections.filter(c => c.status === 'Connected');

  const recentConversations = [...conversations].sort((a, b) => {
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  }).slice(0, 3);

  return {
    isLoading,
    metrics: {
      runningExecutions: runningExecutionsCount,
      pendingApprovals: pendingApprovalsCount,
      scheduledJobs: scheduledJobsCount,
      failedExecutions: failedExecutionsCount,
      activeWorkflows: activeWorkflowsCount,
    },
    recentExecutions,
    connectedProviders,
    recentConversations
  };
}

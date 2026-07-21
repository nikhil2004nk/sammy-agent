'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { executionApi } from '@/services/api/execution.service';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Activity, CheckCircle2, XCircle, AlertCircle, PlayCircle, Loader2, StopCircle, BrainCircuit, TerminalSquare, ShieldAlert, Users } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const StatusBadge = ({ status }: { status: string }) => {
  let color = 'bg-muted text-muted-foreground';
  switch (status) {
    case 'Completed': color = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'; break;
    case 'Failed': color = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'; break;
    case 'Running': color = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'; break;
    case 'Waiting Approval': color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'; break;
  }
  return <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{status}</span>;
};

export default function ExecutionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: execution, isLoading, error } = useQuery({
    queryKey: ['execution', id],
    queryFn: () => executionApi.get(id),
    refetchInterval: (query) => {
      // Stop polling if completed, failed or cancelled
      const status = query.state.data?.status;
      if (status === 'Completed' || status === 'Failed' || status === 'Cancelled') return false;
      return 3000;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => executionApi.cancel(id),
  });

  if (isLoading) return <div className="p-8">Loading execution details...</div>;
  if (error || !execution) return <div className="p-8 text-destructive">Failed to load execution details.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/executions')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-semibold">Execution</h1>
              <StatusBadge status={execution.status} />
            </div>
            <p className="text-muted-foreground font-mono text-sm">Run ID: {execution.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['Running', 'Waiting Approval', 'Active'].includes(execution.status) && (
            <Button 
              variant="destructive" 
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              <StopCircle className="w-4 h-4 mr-2" /> Cancel Run
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-xl p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Started</p>
          <p className="font-medium">
            {execution.startedAt ? format(new Date(execution.startedAt), 'HH:mm:ss') : 'N/A'}
          </p>
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Duration</p>
          <p className="font-medium">
            {execution.durationMs ? `${(execution.durationMs / 1000).toFixed(2)}s` : 'Ongoing'}
          </p>
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Workflow</p>
          <p className="font-medium truncate" title={execution.workflowId}>{execution.workflowId}</p>
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Result</p>
          <p className="font-medium truncate">{execution.result ? 'Available' : 'Pending'}</p>
        </div>
      </div>

      {/* Timeline view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col - Activity */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-medium">Activity Timeline</h2>
          
          <div className="border rounded-xl bg-card p-6 flex flex-col gap-6 relative">
            <div className="absolute left-[39px] top-6 bottom-6 w-px bg-border z-0" />

            {/* Memory / Context */}
            <div className="flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-medium mb-1">Memory Injected</h3>
                <p className="text-sm text-muted-foreground">Automatically resolved conversation context and instructions.</p>
                {execution.memoryContext && (
                  <pre className="mt-2 text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                    {JSON.stringify(execution.memoryContext, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            {/* Planner */}
            <div className="flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-medium mb-1">Planner Active</h3>
                <p className="text-sm text-muted-foreground">Planning steps to achieve goal.</p>
                {execution.plannerState && (
                  <pre className="mt-2 text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                    {JSON.stringify(execution.plannerState, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            {/* Tool Calls */}
            <div className="flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <TerminalSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-medium mb-1">Tool Executions</h3>
                <p className="text-sm text-muted-foreground">{execution.toolCalls?.length || 0} tools called during execution.</p>
              </div>
            </div>
            
            {/* Delegations */}
            <div className="flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-medium mb-1">Agent Delegations</h3>
                <p className="text-sm text-muted-foreground">{execution.delegations?.length || 0} sub-agents invoked.</p>
              </div>
            </div>

            {/* Approval */}
            {execution.status === 'Waiting Approval' && (
              <div className="flex gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 shadow-[0_0_0_4px_var(--bg-background)] border-2 border-orange-500 animate-pulse">
                  <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-medium mb-1 text-orange-600 dark:text-orange-400">Waiting for Approval</h3>
                  <p className="text-sm text-muted-foreground mb-3">Execution is paused waiting for user input.</p>
                  <Button onClick={() => router.push('/approvals')} className="bg-orange-600 hover:bg-orange-700 text-white">
                    View Approvals Dashboard
                  </Button>
                </div>
              </div>
            )}

            {/* Final State */}
            {['Completed', 'Failed', 'Cancelled'].includes(execution.status) && (
              <div className="flex gap-4 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${execution.status === 'Completed' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {execution.status === 'Completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-medium mb-1">Execution {execution.status}</h3>
                  {execution.result && (
                    <pre className="mt-2 text-xs bg-muted p-2 rounded max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {JSON.stringify(execution.result, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col - Logs */}
        <div className="md:col-span-1 space-y-6">
          <h2 className="text-xl font-medium">Raw Logs</h2>
          <div className="border rounded-xl bg-black text-green-400 font-mono text-xs p-4 h-[500px] overflow-y-auto flex flex-col gap-1">
            {execution.logs && execution.logs.length > 0 ? (
              execution.logs.map((log, i) => (
                <div key={i} className="break-all">
                  <span className="text-gray-500">[{new Date().toISOString()}]</span> {JSON.stringify(log)}
                </div>
              ))
            ) : (
              <div className="text-gray-600 italic">No logs available.</div>
            )}
            {['Running', 'Waiting Approval', 'Active'].includes(execution.status) && (
              <div className="animate-pulse flex items-center gap-2 text-gray-500 mt-2">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block" /> Tailing logs...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { executionApi } from '@/services/api/execution.service';
import { Button } from '@/components/ui/button';
import { Activity, Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'Failed': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'Running': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'Waiting Approval': return <AlertCircle className="w-4 h-4 text-amber-500" />;
    case 'Active': return <PlayCircle className="w-4 h-4 text-green-500" />;
    default: return <Activity className="w-4 h-4 text-muted-foreground" />;
  }
};

export default function ExecutionsPage() {
  const router = useRouter();

  const { data: executions, isLoading, error } = useQuery({
    queryKey: ['executions'],
    queryFn: () => executionApi.list(),
    refetchInterval: 5000,
  });

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Recent Executions</h1>
        <p className="text-muted-foreground">Monitor the status and history of your workflow runs.</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 animate-spin" /> Loading executions...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" /> Failed to load executions.
        </div>
      )}

      {!isLoading && !error && executions?.length === 0 && (
        <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center">
          <Activity className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg mb-2">No executions found</p>
          <p className="text-sm">Run a workflow to see its execution history here.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/workflows')}>
            Go to Workflows
          </Button>
        </div>
      )}

      {!isLoading && executions && executions.length > 0 && (
        <div className="border rounded-xl divide-y bg-card">
          {executions.map(execution => (
            <div 
              key={execution.id} 
              className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push(`/executions/${execution.id}`)}
            >
              <div className="flex items-center gap-4">
                <StatusIcon status={execution.status} />
                <div>
                  <p className="font-medium">Workflow: {execution.workflowId}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">Run ID: {execution.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{execution.status}</p>
                {execution.startedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { executionApi } from '@/services/api/execution.service';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/primitives/PageHeader';
import { Toolbar } from '@/components/primitives/Toolbar';
import { StatusBadge } from '@/components/primitives/StatusBadge';
import { EmptyState } from '@/components/primitives/EmptyState';
import { LoadingState } from '@/components/primitives/LoadingState';
import { Search, Filter, RefreshCcw, Activity } from 'lucide-react';

export default function ExecutionsPage() {
  const router = useRouter();

  const { data: executions, isLoading, error, refetch } = useQuery({
    queryKey: ['executions'],
    queryFn: () => executionApi.list(),
    refetchInterval: 5000,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Failed': return 'danger';
      case 'Running': case 'Active': return 'info';
      case 'Waiting Approval': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <PageHeader 
        title="Executions" 
        description="Monitor agent and workflow executions across the platform."
      >
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCcw className="w-4 h-4" /> Refresh
        </Button>
      </PageHeader>

      <Toolbar>
        <Button variant="ghost" size="sm" className="text-muted-foreground bg-surface gap-2">
          <Search className="w-4 h-4" /> Search ID...
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
          <Filter className="w-4 h-4" /> Status
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground">Agent</Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground">Workflow</Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground">Date</Button>
      </Toolbar>

      {isLoading && <LoadingState message="Loading executions..." />}

      {error && (
        <div className="p-4 border border-danger/20 bg-danger/10 text-danger rounded-lg text-sm">
          Failed to load executions.
        </div>
      )}

      {!isLoading && !error && executions?.length === 0 && (
        <EmptyState 
          icon={Activity} 
          title="No executions found" 
          description="Start an agent or trigger a workflow to see its execution history."
        />
      )}

      {!isLoading && executions && executions.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3 font-medium">Run ID</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {executions.map(execution => (
                <tr 
                  key={execution.id} 
                  onClick={() => router.push(`/executions/${execution.id}`)}
                  className="hover:bg-surface/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs">{execution.id.split('-')[0]}</td>
                  <td className="px-4 py-3">
                    <StatusBadge 
                      status={execution.status} 
                      variant={getStatusVariant(execution.status)} 
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{execution.workflowId || 'Agent Run'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {/* Mock duration */}
                    {execution.status === 'Running' ? '-' : '12.4s'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {execution.startedAt 
                      ? formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true }) 
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

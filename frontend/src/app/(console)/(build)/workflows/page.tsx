'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflows } from '@/services/api/workflow';
import { PageHeader } from '@/components/primitives/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Workflow, Search, Play } from 'lucide-react';
import { StatusBadge } from '@/components/primitives/StatusBadge';
import { Toolbar } from '@/components/primitives/Toolbar';
import { EmptyState } from '@/components/primitives/EmptyState';
import { LoadingState } from '@/components/primitives/LoadingState';

export default function WorkflowsPage() {
  const router = useRouter();

  const { data: workflows, isLoading, error } = useWorkflows();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <PageHeader 
        title="Workflows" 
        description="Automate processes across your agents and tools."
      >
        <Button onClick={() => router.push('/workflows/new')} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> New Workflow
        </Button>
      </PageHeader>

      <Toolbar>
        <Button variant="ghost" size="sm" className="text-muted-foreground bg-surface gap-2">
          <Search className="w-4 h-4" /> Search Workflows...
        </Button>
      </Toolbar>

      {isLoading && <LoadingState message="Loading workflows..." />}

      {error && (
        <div className="p-4 border border-danger/20 bg-danger/10 text-danger rounded-lg text-sm">
          Failed to load workflows.
        </div>
      )}

      {!isLoading && !error && workflows?.length === 0 && (
        <EmptyState 
          icon={Workflow} 
          title="No workflows yet" 
          description="Create your first workflow to automate tasks."
        />
      )}

      {!isLoading && workflows && workflows.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Trigger</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Last Run</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workflows.map(workflow => (
                <tr 
                  key={workflow.id} 
                  className="hover:bg-surface/50 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/workflows/${workflow.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{workflow.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{workflow.description || 'No description'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={workflow.status} variant={workflow.status === 'Active' ? 'success' : 'neutral'} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    Manual
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    -
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/workflows/${workflow.id}/run`);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Play className="w-4 h-4 mr-1.5" /> Run
                    </Button>
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

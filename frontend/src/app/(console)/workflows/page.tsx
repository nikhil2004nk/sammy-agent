'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { workflowApi } from '@/services/api/workflow.service';
import { Button } from '@/components/ui/button';
import { Plus, Play, Code, Copy, Trash2, Archive, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkflowsPage() {
  const router = useRouter();
  
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowApi.list(),
  });

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Workflows</h1>
          <p className="text-muted-foreground">Manage and run your automated agent workflows.</p>
        </div>
        <Button onClick={() => router.push('/workflows/new')}>
          <Plus className="w-4 h-4 mr-2" /> New Workflow
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 animate-spin" /> Loading workflows...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows?.map((workflow) => (
            <div key={workflow.id} className="border rounded-xl p-6 bg-card flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg truncate pr-4">{workflow.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${workflow.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                  {workflow.status}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-2">
                {workflow.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center gap-2 mt-auto pt-4 border-t">
                <Button 
                  size="sm" 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => router.push(`/workflows/${workflow.id}/run`)}
                >
                  <Play className="w-4 h-4 mr-2" /> Run
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  title="Edit JSON"
                  onClick={() => router.push(`/workflows/${workflow.id}`)}
                >
                  <Code className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" title="Duplicate">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" title="Archive">
                  <Archive className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" title="Delete" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {workflows?.length === 0 && (
            <div className="col-span-full border border-dashed rounded-xl p-12 text-center text-muted-foreground">
              <p className="text-lg mb-2">No workflows found</p>
              <p className="text-sm">Create your first workflow to get started.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/workflows/new')}>
                Create Workflow
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

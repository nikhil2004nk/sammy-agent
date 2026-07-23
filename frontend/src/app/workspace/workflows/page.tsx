'use client';

import React, { useState, useEffect } from 'react';
import { Workflow, Plus, Play } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

interface WorkflowRecord {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function WorkflowsPage() {
  const { activeWorkspaceId } = useAuthStore();
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchWorkflows();
    }
  }, [activeWorkspaceId]);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient(`/workspaces/${activeWorkspaceId}/workflows`);
      if (data) {
        setWorkflows(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (id: string) => {
    await apiClient(`/workspaces/${activeWorkspaceId}/workflows/${id}/run`, {
      method: 'POST'
    });
    alert('Workflow execution scheduled!');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Workflows</h1>
          <p className="text-muted-foreground">Build and manage multi-agent automation sequences.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
          No workflows found. Create one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workflows.map(wf => (
            <div key={wf.id} className="p-6 rounded-xl border border-border bg-surface flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Workflow className="w-5 h-5" />
                </div>
                <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", 
                  wf.status === 'ACTIVE' ? "text-green-600 bg-green-500/10 border border-green-500/20" : "text-muted-foreground bg-muted")}>
                  {wf.status}
                </div>
              </div>
              
              <h3 className="font-semibold text-lg text-foreground">{wf.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6 line-clamp-2">{wf.description || 'No description provided.'}</p>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Created {new Date(wf.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleRun(wf.id)}
                    className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    Run
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

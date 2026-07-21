'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkflow } from '@/services/api/workflow';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Settings, Save, List, Code, History, Shield, PlayCircle } from 'lucide-react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { StatusBadge } from '@/components/primitives/StatusBadge';
import { LoadingState } from '@/components/primitives/LoadingState';
import { JsonViewer } from '@/components/JsonViewer';
import { cn } from '@/lib/utils';
import { AppCard } from '@/components/primitives/AppCard';

type Tab = 'overview' | 'runs' | 'json' | 'versions' | 'permissions';

export default function WorkflowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: workflow, isLoading, error } = useWorkflow(id);

  if (isLoading) return <LoadingState message="Loading workflow details..." />;
  if (error || !workflow) return <div className="p-8 text-danger">Failed to load workflow.</div>;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: List },
    { id: 'runs', label: 'Runs', icon: PlayCircle },
    { id: 'json', label: 'JSON', icon: Code },
    { id: 'versions', label: 'Versions', icon: History },
    { id: 'permissions', label: 'Permissions', icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/workflows')} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">{workflow.name}</h1>
              <StatusBadge status={workflow.status} variant={workflow.status === 'Active' ? 'success' : 'neutral'} />
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" /> Settings
          </Button>
          <Button size="sm" onClick={() => router.push(`/workflows/${id}/run`)} className="gap-2">
            <Play className="w-4 h-4" /> Run
          </Button>
        </div>

        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface p-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppCard className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Description</span>
                    <p className="text-sm font-medium">{workflow.description || 'No description provided.'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Created By</span>
                    <p className="text-sm font-medium">Nikhil (Admin)</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Version</span>
                    <p className="text-sm font-medium font-mono text-primary">v1.2.0</p>
                  </div>
                </div>
              </AppCard>

              <AppCard className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Execution Stats</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Last Run</span>
                    <p className="text-sm font-medium">10 mins ago</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Total Runs</span>
                    <p className="text-sm font-medium">124</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Success Rate</span>
                    <p className="text-sm font-medium text-success">98.2%</p>
                  </div>
                </div>
              </AppCard>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="bg-background border border-border rounded-xl p-4">
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Save className="w-4 h-4" /> Save JSON
                </Button>
              </div>
              <JsonViewer data={workflow.definition} />
            </div>
          )}

          {activeTab === 'runs' && (
             <div className="text-center py-12 text-muted-foreground">
               <PlayCircle className="w-8 h-8 mx-auto mb-4 opacity-50" />
               <p>Execution history will appear here.</p>
             </div>
          )}

          {activeTab === 'versions' && (
             <div className="text-center py-12 text-muted-foreground">
               <History className="w-8 h-8 mx-auto mb-4 opacity-50" />
               <p>Version history not available in mock.</p>
             </div>
          )}

          {activeTab === 'permissions' && (
             <div className="text-center py-12 text-muted-foreground">
               <Shield className="w-8 h-8 mx-auto mb-4 opacity-50" />
               <p>RBAC configuration not available in mock.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

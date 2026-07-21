'use client';

import { PageHeader } from "@/components/primitives/PageHeader";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { MetricCard } from "@/components/primitives/MetricCard";
import { AppCard } from "@/components/primitives/AppCard";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { Bot, CheckSquare, CalendarClock, AlertTriangle, Activity, Workflow, MessageSquare, Cloud } from "lucide-react";

import { useDashboardViewModel } from './useDashboardViewModel';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { 
    isLoading, 
    metrics, 
    recentExecutions, 
    connectedProviders, 
    recentConversations 
  } = useDashboardViewModel();

  if (isLoading) {
    return <div className="p-8 text-muted-foreground flex justify-center items-center h-full">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back, Nikhil. Here's what's happening today."
      />

      <SectionHeader title="Today's Activity" className="mt-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          title="Running Executions" 
          value={metrics.runningExecutions.toString()} 
          icon={<Bot className="w-4 h-4" />}
          trend={{ value: "2", isPositive: true }}
        />
        <MetricCard 
          title="Pending Approvals" 
          value={metrics.pendingApprovals.toString()} 
          icon={<CheckSquare className="w-4 h-4" />}
          trend={{ value: "1", isPositive: false }}
        />
        <MetricCard 
          title="Scheduled Jobs" 
          value={metrics.scheduledJobs.toString()} 
          icon={<CalendarClock className="w-4 h-4" />}
        />
        <MetricCard 
          title="Failed Runs" 
          value={metrics.failedExecutions.toString()} 
          icon={<AlertTriangle className="w-4 h-4" />}
          trend={{ value: "1", isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <SectionHeader title="Recent Executions" />
          <div className="space-y-3">
            {recentExecutions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No recent executions.
              </div>
            ) : recentExecutions.map(execution => (
              <AppCard key={execution.id} hoverable className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Run {execution.id.split('-')[0]}</h4>
                    <p className="text-xs text-muted-foreground">
                      {execution.workflowId || 'Agent'} • {execution.startedAt ? formatDistanceToNow(execution.startedAt, { addSuffix: true }) : 'N/A'}
                    </p>
                  </div>
                </div>
                <StatusBadge 
                  status={execution.status} 
                  variant={['Completed'].includes(execution.status) ? 'success' : ['Failed'].includes(execution.status) ? 'danger' : 'info'} 
                />
              </AppCard>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Connected Providers" />
          <div className="space-y-3">
            {connectedProviders.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No active connections.
              </div>
            ) : connectedProviders.map(provider => (
              <AppCard key={provider.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-surface p-2 rounded-lg border border-border">
                    <Cloud className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{provider.name}</h4>
                    <p className="text-xs text-muted-foreground">{provider.provider}</p>
                  </div>
                </div>
                <StatusBadge status="Connected" variant="success" />
              </AppCard>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SectionHeader title="Recent Conversations" />
          <div className="space-y-3">
            {recentConversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No recent conversations.
              </div>
            ) : recentConversations.map(conversation => (
              <AppCard key={conversation.id} hoverable className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-surface p-2 rounded-lg border border-border">
                    <MessageSquare className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{conversation.title || 'Untitled'}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(conversation.updatedAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </AppCard>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="System Health" />
          <div className="grid grid-cols-2 gap-4">
            <AppCard className="flex flex-col gap-2 p-4">
              <span className="text-sm font-medium text-muted-foreground">Database</span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-success">Healthy</span>
                <span className="text-xs font-mono text-muted-foreground">12ms</span>
              </div>
            </AppCard>
            <AppCard className="flex flex-col gap-2 p-4">
              <span className="text-sm font-medium text-muted-foreground">Redis Cache</span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-success">Healthy</span>
                <span className="text-xs font-mono text-muted-foreground">2ms</span>
              </div>
            </AppCard>
            <AppCard className="flex flex-col gap-2 p-4">
              <span className="text-sm font-medium text-muted-foreground">Temporal Worker</span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-success">Online</span>
                <span className="text-xs font-mono text-muted-foreground">12 nodes</span>
              </div>
            </AppCard>
            <AppCard className="flex flex-col gap-2 p-4">
              <span className="text-sm font-medium text-muted-foreground">LLM Gateway</span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-warning">Degraded</span>
                <span className="text-xs font-mono text-muted-foreground">850ms</span>
              </div>
            </AppCard>
          </div>
        </div>
      </div>

    </div>
  );
}

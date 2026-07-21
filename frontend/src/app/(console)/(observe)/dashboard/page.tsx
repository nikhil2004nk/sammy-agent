'use client';

import { PageHeader } from "@/components/primitives/PageHeader";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { MetricCard } from "@/components/primitives/MetricCard";
import { AppCard } from "@/components/primitives/AppCard";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { Bot, CheckSquare, CalendarClock, AlertTriangle, Activity, Workflow, MessageSquare, Cloud } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back, Nikhil. Here's what's happening today."
      />

      <SectionHeader title="Today's Activity" className="mt-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          title="Running Agents" 
          value="12" 
          icon={<Bot className="w-4 h-4" />}
          trend={{ value: "2", isPositive: true }}
        />
        <MetricCard 
          title="Pending Approvals" 
          value="2" 
          icon={<CheckSquare className="w-4 h-4" />}
          trend={{ value: "1", isPositive: false }}
        />
        <MetricCard 
          title="Scheduled Jobs" 
          value="18" 
          icon={<CalendarClock className="w-4 h-4" />}
        />
        <MetricCard 
          title="Failed Runs" 
          value="1" 
          icon={<AlertTriangle className="w-4 h-4" />}
          trend={{ value: "1", isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <SectionHeader title="Recent Executions" />
          <div className="space-y-3">
            <AppCard hoverable className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Morning Report</h4>
                  <p className="text-xs text-muted-foreground">Workflow • 10 mins ago</p>
                </div>
              </div>
              <StatusBadge status="Completed" variant="success" />
            </AppCard>
            <AppCard hoverable className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Research Agent</h4>
                  <p className="text-xs text-muted-foreground">Agent • Running</p>
                </div>
              </div>
              <StatusBadge status="Running" variant="info" />
            </AppCard>
            <AppCard hoverable className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CheckSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Email Summary</h4>
                  <p className="text-xs text-muted-foreground">Approval • 1 hour ago</p>
                </div>
              </div>
              <StatusBadge status="Waiting" variant="warning" />
            </AppCard>
          </div>
        </div>

        <div>
          <SectionHeader title="Connected Providers" />
          <div className="space-y-3">
            <AppCard className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-surface p-2 rounded-lg border border-border">
                  <Cloud className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Google Workspace</h4>
                  <p className="text-xs text-muted-foreground">gmail, drive, calendar</p>
                </div>
              </div>
              <StatusBadge status="Connected" variant="success" />
            </AppCard>
            <AppCard className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-surface p-2 rounded-lg border border-border">
                  <Cloud className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">GitHub</h4>
                  <p className="text-xs text-muted-foreground">repos, issues, prs</p>
                </div>
              </div>
              <StatusBadge status="Connected" variant="success" />
            </AppCard>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SectionHeader title="Recent Conversations" />
          <div className="space-y-3">
             <AppCard hoverable className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-surface p-2 rounded-lg border border-border">
                  <MessageSquare className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Research Tesla</h4>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </AppCard>
            <AppCard hoverable className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-surface p-2 rounded-lg border border-border">
                  <MessageSquare className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Daily Report</h4>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            </AppCard>
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

'use client';

import React from 'react';
import { Activity, Server, Cpu, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MonitoringPage() {
  const stats = [
    { label: 'Active Agents', value: '12', icon: Server, color: 'text-blue-500' },
    { label: 'Total Executions (24h)', value: '1,432', icon: Activity, color: 'text-green-500' },
    { label: 'Avg Latency', value: '1.2s', icon: Cpu, color: 'text-yellow-500' },
    { label: 'Memory Nodes', value: '45,210', icon: Database, color: 'text-purple-500' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Platform Health</h1>
        <p className="text-muted-foreground">Monitor system performance, agent activity, and execution metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-surface flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-surface">
          <h3 className="font-semibold mb-4">Execution Volume</h3>
          <div className="h-64 w-full bg-background border border-dashed border-border rounded flex items-center justify-center text-muted-foreground text-sm">
            [Chart Visualization Placeholder]
          </div>
        </div>
        <div className="p-6 rounded-xl border border-border bg-surface">
          <h3 className="font-semibold mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Planner Engine</span>
              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Memory Vector DB</span>
              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">MCP Connections</span>
              <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full font-medium">Degraded (GitHub)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Event Bus</span>
              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full font-medium">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

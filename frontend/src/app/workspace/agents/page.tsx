'use client';

import React from 'react';
import { Bot, CheckCircle2, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgentsPage() {
  const agents = [
    { id: '1', name: 'Research Agent', description: 'Searches the web and summarizes findings.', installed: true, icon: '🔍' },
    { id: '2', name: 'Coding Agent', description: 'Writes, reviews, and debugs code.', installed: true, icon: '💻' },
    { id: '3', name: 'Finance Agent', description: 'Analyzes market trends and financial reports.', installed: false, icon: '📈' },
    { id: '4', name: 'SEO Agent', description: 'Optimizes content for search engines.', installed: false, icon: '🚀' },
    { id: '5', name: 'Travel Planner', description: 'Finds flights, hotels, and builds itineraries.', installed: false, icon: '✈️' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Agents</h1>
          <p className="text-muted-foreground">Browse and install specialized agents for your workspace.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors">
          Create Agent
        </button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search agents..." 
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Installed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.filter(a => a.installed).map(agent => (
            <div key={agent.id} className="p-5 rounded-xl border border-border bg-surface flex flex-col h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                  {agent.icon}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Installed
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{agent.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex-1">{agent.description}</p>
              <button className="w-full mt-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Discover</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.filter(a => !a.installed).map(agent => (
            <div key={agent.id} className="p-5 rounded-xl border border-border bg-surface flex flex-col h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                  {agent.icon}
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{agent.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex-1">{agent.description}</p>
              <button className="w-full mt-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                <Download className="w-4 h-4" />
                Install
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

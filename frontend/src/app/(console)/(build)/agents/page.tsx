'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/primitives/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Bot, Search } from 'lucide-react';
import { AppCard } from '@/components/primitives/AppCard';
import { StatusBadge } from '@/components/primitives/StatusBadge';
import { Toolbar } from '@/components/primitives/Toolbar';

export default function AgentsPage() {
  const router = useRouter();

  const agents = [
    { id: '1', name: 'Research Agent', description: 'Web search and summarization', status: 'Active', model: 'GPT-5' },
    { id: '2', name: 'Coding Agent', description: 'Software engineering assistant', status: 'Active', model: 'Claude 3.5' },
    { id: '3', name: 'Email Agent', description: 'Drafts replies and manages inbox', status: 'Paused', model: 'GPT-4o' },
    { id: '4', name: 'Finance Agent', description: 'Analyzes invoices and receipts', status: 'Draft', model: 'Gemini 2.0' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <PageHeader 
        title="Agents" 
        description="Build and manage autonomous AI agents."
      >
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Create Agent
        </Button>
      </PageHeader>

      <Toolbar>
        <Button variant="ghost" size="sm" className="text-muted-foreground bg-surface gap-2">
          <Search className="w-4 h-4" /> Search Agents...
        </Button>
      </Toolbar>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <AppCard 
            key={agent.id} 
            hoverable 
            onClick={() => router.push(`/agents/${agent.id}`)}
            className="flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <StatusBadge 
                status={agent.status} 
                variant={agent.status === 'Active' ? 'success' : agent.status === 'Paused' ? 'warning' : 'neutral'} 
              />
            </div>
            
            <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{agent.description}</p>
            
            <div className="pt-4 border-t border-border mt-auto">
              <span className="text-xs font-medium bg-surface px-2 py-1 rounded border border-border">
                {agent.model}
              </span>
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}

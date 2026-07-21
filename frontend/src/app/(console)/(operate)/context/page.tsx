'use client';

import React from 'react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Search, Database, Clock } from 'lucide-react';
import { AppCard } from '@/components/primitives/AppCard';
import { Toolbar } from '@/components/primitives/Toolbar';

export default function ContextPage() {
  const memories = [
    { id: 1, text: "Customer prefers Stripe for all payment processing.", date: "Yesterday", source: "Conversation: Setup Stripe" },
    { id: 2, text: "Invoice format updated to include tax IDs.", date: "Today", source: "Workflow: Generate Invoice" },
    { id: 3, text: "Nikhil likes bulleted summaries under 150 words.", date: "2 days ago", source: "Conversation: Research Tesla" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <PageHeader 
        title="Context" 
        description="Implicit knowledge and preferences extracted over time."
      >
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Context
        </Button>
      </PageHeader>

      <Toolbar>
        <Button variant="ghost" size="sm" className="text-muted-foreground bg-surface gap-2">
          <Search className="w-4 h-4" /> Search context...
        </Button>
      </Toolbar>

      <div className="space-y-4">
        {memories.map(mem => (
          <AppCard key={mem.id} hoverable className="flex items-start justify-between p-5">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2 leading-relaxed">{mem.text}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {mem.date}</span>
                  <span>•</span>
                  <span>Source: {mem.source}</span>
                </div>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}

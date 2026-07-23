'use client';

import React from 'react';
import { Brain, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MemoryPage() {
  const memories = [
    { id: '1', fact: "Company's primary database is PostgreSQL", context: 'Architecture Discussion', date: 'Oct 15, 2026' },
    { id: '2', fact: "Preferred cloud provider is AWS", context: 'Infrastructure Planning', date: 'Oct 12, 2026' },
    { id: '3', fact: "CEO is John Doe", context: 'Onboarding', date: 'Oct 10, 2026' },
    { id: '4', fact: "The main frontend framework is Next.js 14", context: 'Code Review', date: 'Oct 05, 2026' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Things Sammy Knows</h1>
          <p className="text-muted-foreground">Sammy automatically remembers important details across your conversations. You can review or forget them here.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search memories..." 
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>

      <div className="space-y-3">
        {memories.map(memory => (
          <div key={memory.id} className="p-4 rounded-lg border border-border bg-surface flex items-center justify-between group hover:border-primary/30 transition-colors">
            <div>
              <div className="font-medium text-foreground text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span>
                {memory.fact}
              </div>
              <div className="text-xs text-muted-foreground mt-1 ml-3.5 flex gap-3">
                <span>From: {memory.context}</span>
                <span>•</span>
                <span>{memory.date}</span>
              </div>
            </div>
            <button className="p-2 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all" title="Forget this">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

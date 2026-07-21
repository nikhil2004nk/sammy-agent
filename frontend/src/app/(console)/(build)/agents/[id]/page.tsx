'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/primitives/PageHeader';
import { SectionHeader } from '@/components/primitives/SectionHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, PlayCircle, Settings, BrainCircuit, Activity } from 'lucide-react';
import { AppCard } from '@/components/primitives/AppCard';

export default function AgentProfilePage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <PageHeader 
        title="Research Agent" 
        description="Web search and summarization"
      >
        <Button variant="outline" size="sm" className="gap-2 text-muted-foreground border-border bg-surface">
          <Edit2 className="w-3.5 h-3.5" /> Edit Agent
        </Button>
        <Button size="sm" className="gap-2">
          <PlayCircle className="w-4 h-4" /> Test Agent
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <SectionHeader title="System Prompt" />
            <div className="border border-border rounded-xl bg-card p-4 font-mono text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              You are an expert research assistant. 
              Your goal is to search the web for accurate information and summarize it into highly concise, bulleted reports.
              Always cite your sources. Never hallucinate facts.
            </div>
          </div>

          <div>
            <SectionHeader title="Execution History" />
            <div className="border border-border rounded-xl bg-card divide-y divide-border">
              <div className="p-4 flex items-center justify-between hover:bg-surface/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Research Tesla News</p>
                    <p className="text-xs text-muted-foreground">Today, 09:30 AM</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">Completed</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-surface/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Apple Q3 Earnings</p>
                    <p className="text-xs text-muted-foreground">Yesterday, 14:15 PM</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AppCard className="p-5">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" /> Configuration
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Model</p>
                <p className="text-sm font-medium">GPT-5 (Mock)</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                <p className="text-sm font-medium">0.2</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Max Tokens</p>
                <p className="text-sm font-medium">4096</p>
              </div>
            </div>
          </AppCard>

          <AppCard className="p-5">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-muted-foreground" /> Capabilities
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Allowed Tools</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-surface border border-border px-2 py-1 rounded">search_web</span>
                  <span className="text-xs bg-surface border border-border px-2 py-1 rounded">read_url</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Knowledge Sources</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-surface border border-border px-2 py-1 rounded">Company Wiki</span>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
}

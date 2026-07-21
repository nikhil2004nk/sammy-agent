'use client';

import React from 'react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, TerminalSquare, ListTree, Database } from 'lucide-react';
import { StatusBadge } from '@/components/primitives/StatusBadge';

export default function ConversationsPage() {
  return (
    <div className="flex h-full min-h-0 bg-background text-foreground">
      {/* Left Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        <div className="p-4 border-b border-border bg-surface shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Research Tesla</h2>
            <p className="text-xs text-muted-foreground mt-0.5">GPT-5 • Connected to Google, GitHub</p>
          </div>
          <Button variant="outline" size="sm">New Chat</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1 pt-1">
              <p className="font-medium text-sm mb-1">Nikhil</p>
              <p className="text-sm">Can you research the latest news about Tesla and summarize it?</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded bg-primary/20 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 pt-1">
              <p className="font-medium text-sm mb-1">Jarvis</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I'm running a workflow to fetch the latest news from Google and summarize the key points...
              </p>
              
              <div className="mt-4 border border-border rounded-lg bg-surface p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <ListTree className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">News Research Workflow</p>
                    <p className="text-xs text-muted-foreground">Running • 4 steps completed</p>
                  </div>
                </div>
                <StatusBadge status="In Progress" variant="info" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-surface border-t border-border shrink-0">
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
            <input 
              type="text" 
              placeholder="Ask Jarvis anything..." 
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            />
            <Button size="icon" className="w-8 h-8 shrink-0">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Execution Area (Claude Code / LangSmith style) */}
      <div className="w-96 flex flex-col min-w-0 bg-surface">
        <div className="p-4 border-b border-border shrink-0">
          <h3 className="font-medium">Execution</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Planner</h4>
            <div className="border border-border rounded-lg bg-background p-3 text-sm">
              <p className="font-medium mb-2">Goal: Research Tesla News</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <StatusBadge status="Done" variant="success" dot={false} className="px-1.5 py-0 text-[10px]" />
                  Fetch news API
                </li>
                <li className="flex items-center gap-2">
                  <StatusBadge status="Done" variant="success" dot={false} className="px-1.5 py-0 text-[10px]" />
                  Extract text
                </li>
                <li className="flex items-center gap-2">
                  <StatusBadge status="Doing" variant="info" dot={false} className="px-1.5 py-0 text-[10px]" />
                  Summarize content
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Memory Retrieved</h4>
            <div className="border border-border rounded-lg bg-background p-3 text-sm flex items-start gap-3">
              <Database className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-xs leading-relaxed">
                Found preference: <span className="text-foreground">"Keep summaries strictly bulleted and less than 150 words."</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tool Calls</h4>
            <div className="space-y-2">
              <div className="border border-border rounded-lg bg-background p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TerminalSquare className="w-4 h-4 text-warning" />
                    <span className="font-mono text-xs">search_web</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">1.2s</span>
                </div>
                <pre className="text-[10px] text-muted-foreground overflow-x-auto">
                  {`{\n  "query": "Tesla news today"\n}`}
                </pre>
              </div>
              <div className="border border-border rounded-lg bg-background p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TerminalSquare className="w-4 h-4 text-warning" />
                    <span className="font-mono text-xs">read_url</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">0.8s</span>
                </div>
                <pre className="text-[10px] text-muted-foreground overflow-x-auto">
                  {`{\n  "url": "https://bloomberg..."\n}`}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

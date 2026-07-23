'use client';

import React from 'react';
import { Plus, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConnectionsPage() {
  const connections = [
    { id: '1', name: 'Google Workspace', type: 'Email, Docs, Calendar', connected: true, icon: 'brands/google' },
    { id: '2', name: 'GitHub', type: 'Source Control, Issues', connected: true, icon: 'brands/github' },
    { id: '3', name: 'Slack', type: 'Messaging, Channels', connected: false, icon: 'brands/slack' },
    { id: '4', name: 'Notion', type: 'Knowledge Base', connected: false, icon: 'brands/notion' },
    { id: '5', name: 'PostgreSQL', type: 'Database', connected: false, icon: 'database' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Connections</h1>
          <p className="text-muted-foreground">Connect Sammy to your external apps and data sources.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {connections.map(connection => (
          <div key={connection.id} className="p-6 rounded-xl border border-border bg-surface flex flex-col hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-xl uppercase tracking-tighter">
                {connection.name.substring(0,2)}
              </div>
              {connection.connected ? (
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                  <Check className="w-3 h-3" />
                  Connected
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  Not Connected
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-lg text-foreground">{connection.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">{connection.type}</p>
            
            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
              {connection.connected ? (
                <>
                  <span className="text-xs text-muted-foreground">Active since Oct 12</span>
                  <button className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                    Manage <ExternalLink className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground">OAuth 2.0</span>
                  <button className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Connect
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { SectionHeader } from '@/components/primitives/SectionHeader';
import { Button } from '@/components/ui/button';
import { Plus, Server, Cloud, ExternalLink, Settings } from 'lucide-react';
import { AppCard } from '@/components/primitives/AppCard';
import { StatusBadge } from '@/components/primitives/StatusBadge';
import { Toolbar } from '@/components/primitives/Toolbar';

export default function IntegrationsPage() {
  const cloudProviders = [
    { id: 'google', name: 'Google Workspace', status: 'Connected', desc: 'Gmail, Drive, Calendar integration.' },
    { id: 'github', name: 'GitHub', status: 'Connected', desc: 'Source code and PR management.' },
    { id: 'slack', name: 'Slack', status: 'Disconnected', desc: 'Team communication and alerts.' },
  ];

  const mcpServers = [
    { id: 'postgres', name: 'Postgres MCP', status: 'Installed', desc: 'Direct database access via MCP protocol.' },
    { id: 'redis', name: 'Redis MCP', status: 'Installed', desc: 'Cache and memory inspection.' },
    { id: 'filesystem', name: 'Filesystem MCP', status: 'Installed', desc: 'Local workspace file operations.' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8">
      <PageHeader 
        title="Integrations" 
        description="Connect Jarvis to your favorite tools, services, and local data."
      >
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Integration
        </Button>
      </PageHeader>

      <Toolbar>
        <Button variant="ghost" size="sm" className="text-muted-foreground bg-surface gap-2">
          All
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
          Cloud
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
          MCP Servers
        </Button>
      </Toolbar>

      <div className="space-y-12">
        <div>
          <SectionHeader title="Cloud Providers" description="OAuth connections to external SaaS platforms." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cloudProviders.map(provider => (
              <AppCard key={provider.id} hoverable className="flex flex-col h-full p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-foreground" />
                  </div>
                  <StatusBadge 
                    status={provider.status} 
                    variant={provider.status === 'Connected' ? 'success' : 'neutral'} 
                  />
                </div>
                
                <h3 className="text-lg font-semibold mb-1">{provider.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{provider.desc}</p>
                
                <div className="flex gap-2 mt-auto">
                  {provider.status === 'Connected' ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">Configure</Button>
                      <Button variant="outline" size="sm" className="flex-1 text-danger hover:text-danger hover:bg-danger/10 border-danger/20">Disconnect</Button>
                    </>
                  ) : (
                    <Button variant="default" size="sm" className="w-full gap-2">
                      <ExternalLink className="w-3.5 h-3.5" /> Connect
                    </Button>
                  )}
                </div>
              </AppCard>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Local MCP Servers" description="Model Context Protocol servers running locally or remotely." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mcpServers.map(server => (
              <AppCard key={server.id} hoverable className="flex flex-col h-full p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
                    <Server className="w-5 h-5 text-foreground" />
                  </div>
                  <StatusBadge 
                    status={server.status} 
                    variant="info" 
                  />
                </div>
                
                <h3 className="text-lg font-semibold mb-1">{server.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{server.desc}</p>
                
                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" className="flex-1 gap-2"><Settings className="w-3.5 h-3.5" /> Settings</Button>
                </div>
              </AppCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

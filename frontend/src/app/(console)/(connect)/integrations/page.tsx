'use client';

import React from 'react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { SectionHeader } from '@/components/primitives/SectionHeader';
import { Button } from '@/components/ui/button';
import { Plus, Server, Cloud, ExternalLink, Settings } from 'lucide-react';
import { AppCard } from '@/components/primitives/AppCard';
import { StatusBadge } from '@/components/primitives/StatusBadge';
import { Toolbar } from '@/components/primitives/Toolbar';
import { useConnections, useDeleteConnection } from '@/services/api/connection';

export default function IntegrationsPage() {
  const { data: connections, isLoading } = useConnections();
  const deleteMutation = useDeleteConnection();

  // For UI consistency, we still hardcode MCP servers since they are local and not in the DB yet,
  // but we map Cloud Providers from the API.
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
            {/* Fixed Google Provider Card */}
            <AppCard hoverable className="flex flex-col h-full p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-foreground" />
                </div>
                {(() => {
                  const googleConn = connections?.find((c: any) => c.provider === 'google');
                  return (
                    <StatusBadge 
                      status={googleConn ? 'Connected' : 'Disconnected'} 
                      variant={googleConn ? 'success' : 'neutral'} 
                    />
                  );
                })()}
              </div>
              
              <h3 className="text-lg font-semibold mb-1">Google Workspace</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1">Integration provider: google</p>
              
              <div className="flex gap-2 mt-auto">
                {(() => {
                  const googleConn = connections?.find((c: any) => c.provider === 'google');
                  if (googleConn) {
                    return (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">Configure</Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-danger hover:text-danger hover:bg-danger/10 border-danger/20"
                          onClick={() => deleteMutation.mutate(googleConn.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    );
                  }
                  
                  // Not connected
                  return (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={() => {
                        // Assuming workspaceId is 'default' for now, or pull from context
                        window.location.href = `http://localhost:3001/connections/google/authorize?workspaceId=47585c98-2072-45ce-a7a9-a6e986a5c9a3&serverId=gmail-server`;
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Connect Gmail
                    </Button>
                  );
                })()}
              </div>
            </AppCard>
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

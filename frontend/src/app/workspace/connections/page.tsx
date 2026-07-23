'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, ExternalLink, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';

interface Provider {
  id: string;
  name: string;
  type: string;
}

interface Connection {
  id: string;
  provider: string;
  status: string;
  createdAt: string;
}

export default function ConnectionsPage() {
  const { activeWorkspaceId } = useAuthStore();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchData();
    }
  }, [activeWorkspaceId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: provs }, { data: conns }] = await Promise.all([
        apiClient('/providers'),
        apiClient(`/workspaces/${activeWorkspaceId}/connections`)
      ]);
      if (provs) setProviders(provs);
      if (conns) setConnections(conns);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (providerId: string) => {
    const { data } = await apiClient(`/workspaces/${activeWorkspaceId}/connections`, {
      method: 'POST',
      body: JSON.stringify({ provider: providerId })
    });
    if (data) {
      fetchData();
    }
  };

  const handleDelete = async (connectionId: string) => {
    await apiClient(`/workspaces/${activeWorkspaceId}/connections/${connectionId}`, {
      method: 'DELETE'
    });
    fetchData();
  };

  // Merge providers with their active connections
  const mergedProviders = providers.map(p => {
    const activeConn = connections.find(c => c.provider === p.id);
    return {
      ...p,
      connection: activeConn
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Connections</h1>
          <p className="text-muted-foreground">Connect Sammy to your external apps and data sources.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading connections...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mergedProviders.map(provider => (
            <div key={provider.id} className="p-6 rounded-xl border border-border bg-surface flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-xl uppercase tracking-tighter">
                  {provider.name.substring(0, 2)}
                </div>
                {provider.connection ? (
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
              
              <h3 className="font-semibold text-lg text-foreground">{provider.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">{provider.type}</p>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                {provider.connection ? (
                  <>
                    <span className="text-xs text-muted-foreground">
                      Status: {provider.connection.status}
                    </span>
                    <button 
                      onClick={() => handleDelete(provider.connection!.id)}
                      className="text-xs text-red-500 hover:bg-red-500/10 px-2 py-1 rounded font-medium flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Disconnect
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground">OAuth 2.0</span>
                    <button 
                      onClick={() => handleConnect(provider.id)}
                      className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Connect
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

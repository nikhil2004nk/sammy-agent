'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Link2, Plus, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';

interface Provider {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
}

interface Connection {
  id: string;
  providerId: string;
  state: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeWorkspaceId } = useAuthStore();

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data: providersData }, { data: connectionsData }] = await Promise.all([
          apiClient('/providers'),
          activeWorkspaceId 
            ? apiClient(`/workspaces/${activeWorkspaceId}/connections`)
            : Promise.resolve({ data: [] })
        ]);

        if (providersData) {
          // Add default icons/descriptions for demo purposes until backend provides them
          const enhancedProviders = (providersData as any[]).map(p => ({
            ...p,
            description: p.id === 'google' ? 'Connect Gmail, Drive, Calendar' : `Connect ${p.name}`,
            icon: p.id === 'google' ? 'G' : p.id.substring(0, 2).toUpperCase()
          }));
          setProviders(enhancedProviders);
        }

        if (connectionsData) {
          setConnections(connectionsData as Connection[]);
        }
      } catch (error) {
        console.error('Failed to fetch settings data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeWorkspaceId]);

  return (
    <div className="flex-1 p-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-500" />
            Integrations & Capabilities
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
            Manage your external tools, MCP servers, and active connections.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                <Link2 className="w-5 h-5 text-indigo-500" />
                Available Connections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => {
                  const isConnected = connections.some(c => c.providerId === provider.id);
                  return (
                    <motion.div
                      key={provider.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-6 rounded-2xl border transition-all duration-300 ${isConnected ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'} shadow-sm flex flex-col justify-between`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${isConnected ? 'bg-indigo-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>
                            {provider.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{provider.name}</h3>
                            <p className="text-sm text-zinc-500">{provider.description}</p>
                          </div>
                        </div>
                        {isConnected && (
                          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Connected
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                        <button
                          className={`w-full py-2.5 rounded-xl font-medium transition-colors ${isConnected ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'}`}
                        >
                          {isConnected ? 'Manage Connection' : 'Connect'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                <Zap className="w-5 h-5 text-amber-500" />
                Installed MCP Servers
              </h2>
              
              <div className="p-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-zinc-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No custom MCP servers installed</h3>
                <p className="text-zinc-500 max-w-md mb-6">
                  You can install custom Model Context Protocol servers to provide the agent with specialized local tools and resources.
                </p>
                <button className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-3 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm">
                  <Plus className="w-4 h-4" />
                  Install Server
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

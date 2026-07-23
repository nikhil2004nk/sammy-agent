'use client';

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your workspace preferences and configurations.</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">General</h2>
          <div className="space-y-4 max-w-xl">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Workspace Name</label>
              <input 
                type="text" 
                defaultValue="Acme Inc" 
                className="w-full px-3 py-2 rounded-md border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Default Model</label>
              <select className="w-full px-3 py-2 rounded-md border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-primary text-sm">
                <option>GPT-4o</option>
                <option>Claude 3.5 Sonnet</option>
                <option>Qwen 2.5 Coder (Local)</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Execution Budgets</h2>
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Max Execution Nodes</div>
                <div className="text-xs text-muted-foreground">Maximum steps a planner can take before halting.</div>
              </div>
              <input type="number" defaultValue={50} className="w-20 px-3 py-1.5 rounded-md border border-border bg-surface text-sm text-center" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Max Retries</div>
                <div className="text-xs text-muted-foreground">Number of times an agent can retry a failed tool.</div>
              </div>
              <input type="number" defaultValue={3} className="w-20 px-3 py-1.5 rounded-md border border-border bg-surface text-sm text-center" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Danger Zone</h2>
          <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-medium text-red-600 text-sm">Delete Workspace</div>
              <div className="text-xs text-red-500/80">Permanently delete this workspace and all its data.</div>
            </div>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors">
              Delete
            </button>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

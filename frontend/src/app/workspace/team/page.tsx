'use client';

import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const members = [
    { id: '1', name: 'John Doe', email: 'john@acme.com', role: 'Admin', avatar: 'JD' },
    { id: '2', name: 'Sarah Smith', email: 'sarah@acme.com', role: 'Developer', avatar: 'SS' },
    { id: '3', name: 'Alex Johnson', email: 'alex@acme.com', role: 'Viewer', avatar: 'AJ' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Acme Inc Team</h1>
          <p className="text-muted-foreground">Manage your team members and their roles within this workspace.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="font-medium p-4 text-muted-foreground">Member</th>
              <th className="font-medium p-4 text-muted-foreground">Role</th>
              <th className="font-medium p-4 text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                </td>
                <td className="p-4">
                  <select 
                    className="px-2 py-1 text-xs border border-border rounded bg-background"
                    defaultValue={member.role}
                  >
                    <option>Admin</option>
                    <option>Developer</option>
                    <option>Viewer</option>
                  </select>
                </td>
                <td className="p-4 text-right">
                  <button className="text-red-500 hover:bg-red-500/10 text-sm font-medium px-2 py-1 rounded transition-colors">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

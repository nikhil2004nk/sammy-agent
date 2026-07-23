'use client';

import React from 'react';
import { FileText, Link as LinkIcon, UploadCloud, Search, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KnowledgePage() {
  const sources = [
    { id: '1', name: 'Q3 Financial Report.pdf', type: 'File', size: '2.4 MB', date: 'Oct 12, 2026', icon: FileText },
    { id: '2', name: 'Product Roadmap Q4', type: 'Notion', size: '-', date: 'Oct 10, 2026', icon: FolderOpen },
    { id: '3', name: 'https://docs.nestjs.com', type: 'URL', size: '-', date: 'Oct 08, 2026', icon: LinkIcon },
    { id: '4', name: 'Employee Handbook.docx', type: 'File', size: '1.1 MB', date: 'Oct 01, 2026', icon: FileText },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Knowledge Base</h1>
          <p className="text-muted-foreground">Upload files and connect data sources for Sammy to reference.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface border border-border text-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-muted transition-colors flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Add Link
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-background/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search knowledge sources..." 
              className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
          </div>
          <select className="px-3 py-2 border border-border rounded-md bg-background text-sm">
            <option>All Types</option>
            <option>Files</option>
            <option>URLs</option>
            <option>Notion</option>
          </select>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="font-medium p-4 text-muted-foreground">Name</th>
              <th className="font-medium p-4 text-muted-foreground">Type</th>
              <th className="font-medium p-4 text-muted-foreground">Size</th>
              <th className="font-medium p-4 text-muted-foreground">Date Added</th>
              <th className="font-medium p-4 text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sources.map(source => (
              <tr key={source.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center text-muted-foreground">
                    <source.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{source.name}</span>
                </td>
                <td className="p-4 text-muted-foreground">{source.type}</td>
                <td className="p-4 text-muted-foreground">{source.size}</td>
                <td className="p-4 text-muted-foreground">{source.date}</td>
                <td className="p-4 text-right">
                  <button className="text-muted-foreground hover:text-foreground text-sm font-medium px-2 py-1">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sources.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No knowledge sources added yet.
          </div>
        )}
      </div>
    </div>
  );
}

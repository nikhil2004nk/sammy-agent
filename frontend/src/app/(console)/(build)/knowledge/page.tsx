'use client';

import React from 'react';
import { PageHeader } from '@/components/primitives/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Search, BookOpen, FileText } from 'lucide-react';
import { AppCard } from '@/components/primitives/AppCard';
import { Toolbar } from '@/components/primitives/Toolbar';

export default function KnowledgePage() {
  const documents = [
    { id: 1, title: 'Company Guidelines', type: 'PDF', size: '2.4 MB' },
    { id: 2, title: 'API Documentation', type: 'Markdown', size: '128 KB' },
    { id: 3, title: 'Product Roadmap Q3', type: 'Notion', size: '-' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8">
      <PageHeader 
        title="Knowledge Base" 
        description="Provide explicit documents and data sources for your agents to reference."
      >
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Upload Document
        </Button>
      </PageHeader>

      <Toolbar>
        <Button variant="ghost" size="sm" className="text-muted-foreground bg-surface gap-2">
          <Search className="w-4 h-4" /> Search documents...
        </Button>
      </Toolbar>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <AppCard key={doc.id} hoverable className="flex flex-col p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            
            <h3 className="text-lg font-semibold mb-1">{doc.title}</h3>
            <p className="text-sm text-muted-foreground flex-1 mb-4">Explicit knowledge source</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
              <span className="text-xs font-medium bg-surface px-2 py-1 rounded border border-border">
                {doc.type}
              </span>
              <span className="text-xs text-muted-foreground">{doc.size}</span>
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}

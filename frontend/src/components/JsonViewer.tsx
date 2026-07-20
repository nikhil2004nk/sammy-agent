'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface JsonViewerProps {
  data: unknown;
  defaultExpanded?: boolean;
}

export function JsonViewer({ data, defaultExpanded = false }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Copied JSON to clipboard');
  };

  if (!data) return null;

  return (
    <div className="bg-muted/50 rounded-md border text-xs overflow-hidden font-mono mt-2">
      <div className="flex items-center justify-between px-2 py-1.5 bg-muted/80 border-b cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-1 text-muted-foreground">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span className="font-medium text-[11px]">Payload</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title="Copy JSON"
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
      
      {expanded && (
        <div className="p-3 overflow-x-auto max-h-60 overflow-y-auto">
          <pre className="text-muted-foreground m-0">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

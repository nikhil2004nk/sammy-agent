import { ExecutionNode } from '@/domains/execution/types';
import { Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReasoningCardProps {
  node: ExecutionNode;
}

export function ReasoningCard({ node }: ReasoningCardProps) {
  return (
    <div className="flex gap-3 py-2 px-2 relative group">
      <div className="relative flex justify-center w-6 shrink-0 mt-1">
        <div className="absolute w-px h-[calc(100%+16px)] bg-border -z-10 -top-2" />
        <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center border shadow-sm z-10">
          <Brain className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0 bg-muted/30 border rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reasoning
            </span>
            <span className="opacity-70 text-[10px]" suppressHydrationWarning>
              {node.startedAt ? new Date(node.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
            </span>
            {node.agentName && (
              <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                {node.agentName}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {node.durationMs ? `${node.durationMs}ms` : ''}
          </span>
        </div>
        
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground italic text-[13px] leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {node.content || ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

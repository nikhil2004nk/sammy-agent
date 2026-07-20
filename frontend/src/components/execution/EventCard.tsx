import { ExecutionNode } from '@/domains/execution/types';
import { Circle } from 'lucide-react';

interface EventCardProps {
  node: ExecutionNode;
}

export function EventCard({ node }: EventCardProps) {
  return (
    <div className="flex items-center gap-3 py-1 px-2 opacity-70">
      <div className="relative flex items-center justify-center w-6 h-6">
        <div className="absolute w-px h-full bg-border -z-10" />
        <Circle className="w-2 h-2 fill-muted-foreground text-muted-foreground z-10" />
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span>{node.name || 'System Event'}</span>
        <span className="opacity-50">
          {new Date(node.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

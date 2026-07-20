'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Message, MessagePart } from '@/domains/conversation/types';
import { Bot, User, Loader2 } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  // For now, concatenate all text parts. Later, render parts based on type.
  const content = message.parts
    .filter(p => p.type === 'text')
    .map(p => p.content as string)
    .join('\n');

  return (
    <div className={cn(
      "group flex gap-4 w-full py-6 px-4 md:px-8",
      isUser ? "bg-transparent" : "bg-muted/30"
    )}>
      <div className={cn(
        "shrink-0 w-8 h-8 rounded-md flex items-center justify-center border",
        isUser ? "bg-background shadow-sm" : "bg-primary text-primary-foreground"
      )}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      <div className="flex-1 space-y-2 overflow-hidden min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">
            {isUser ? 'You' : 'Jarvis'}
          </span>
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {message.status === 'streaming' && !content ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </div>
        ) : (
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
            {message.status === 'streaming' && (
              <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle" />
            )}
          </div>
        )}
        
        {message.status === 'failed' && (
          <div className="text-destructive text-sm mt-2 font-medium">
            Generation failed. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}

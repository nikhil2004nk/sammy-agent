'use client';

import { useConversations, useCreateConversation } from '@/domains/conversation/api';
import { Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function ConversationList() {
  const { data: conversations, isLoading } = useConversations();
  const { mutate: createConversation, isPending } = useCreateConversation();
  const router = useRouter();
  const params = useParams();
  const activeId = params?.id as string | undefined;

  const handleCreate = () => {
    createConversation({ title: 'New Conversation' }, {
      onSuccess: (data) => {
        if (data && data.id) {
          router.push(`/console/${data.id}`);
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <div className="p-4 border-b">
        <Button 
          onClick={handleCreate} 
          disabled={isPending}
          className="w-full justify-start gap-2" 
          variant="default"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="text-xs text-muted-foreground text-center py-4">Loading...</div>
        ) : conversations?.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">No conversations yet.</div>
        ) : (
          conversations?.map((conv) => {
            const isActive = conv.id === activeId;
            return (
              <button
                key={conv.id}
                onClick={() => router.push(`/console/${conv.id}`)}
                className={cn(
                  "w-full text-left p-3 rounded-lg text-sm transition-colors border border-transparent",
                  isActive 
                    ? "bg-background border-border shadow-sm" 
                    : "hover:bg-muted"
                )}
              >
                <div className="font-medium truncate mb-1">
                  {conv.title || 'Untitled Conversation'}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate mr-2">
                    {conv.summary || 'Start typing to begin...'}
                  </span>
                  <span className="shrink-0">
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

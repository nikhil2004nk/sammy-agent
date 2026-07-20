'use client';

import { useState, useRef, useEffect } from 'react';
import { useConversations, useCreateConversation, useDeleteConversation, useUpdateConversation } from '@/domains/conversation/api';
import { Plus, MessageSquare, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function ConversationList() {
  const { data: conversations, isLoading } = useConversations();
  const { mutate: createConversation, isPending: isCreating } = useCreateConversation();
  const { mutate: deleteConversation } = useDeleteConversation();
  const { mutate: updateConversation } = useUpdateConversation();
  const router = useRouter();
  const params = useParams();
  const activeId = params?.id as string | undefined;

  // Track which conversation is being renamed
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Focus input when rename starts
  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);

  const handleCreate = () => {
    createConversation({ title: 'New Conversation' }, {
      onSuccess: (data) => {
        if (data?.id) {
          router.push(`/console/${data.id}`);
          // Start renaming immediately so user can name it right away
          setRenamingId(data.id);
          setRenameValue('New Conversation');
        }
      }
    });
  };

  const startRename = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue(currentTitle || '');
  };

  const commitRename = (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed.length > 0) {
      updateConversation({ id, title: trimmed }, {
        onError: () => toast.error('Failed to rename conversation'),
      });
    }
    setRenamingId(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id, {
      onSuccess: () => {
        toast.success('Conversation deleted');
        if (activeId === id) {
          router.push('/console');
        }
      },
      onError: () => toast.error('Failed to delete conversation'),
    });
  };

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <div className="p-4 border-b">
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full justify-start gap-2"
          variant="default"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {isLoading ? (
          <div className="text-xs text-muted-foreground text-center py-4">Loading...</div>
        ) : !conversations || conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
            <MessageSquare className="w-8 h-8 text-muted-foreground opacity-30" />
            <p className="text-xs text-muted-foreground">No conversations yet.<br />Start one above.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            const isRenaming = renamingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => !isRenaming && router.push(`/console/${conv.id}`)}
                className={cn(
                  'group relative w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer',
                  isActive
                    ? 'bg-primary/10 border border-primary/20 shadow-sm'
                    : 'hover:bg-muted border border-transparent'
                )}
              >
                {/* Title row */}
                {isRenaming ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(conv.id);
                        if (e.key === 'Escape') cancelRename();
                      }}
                      className="flex-1 bg-background border border-border rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-w-0"
                    />
                    <button
                      onClick={() => commitRename(conv.id)}
                      className="p-1 rounded hover:bg-green-500/20 text-green-600 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelRename}
                      className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <span className="font-medium truncate flex-1 pr-1 text-foreground">
                      {conv.title || 'Untitled Conversation'}
                    </span>
                    {/* Action buttons — visible on hover or when active */}
                    <div className={cn(
                      'flex items-center gap-0.5 shrink-0 transition-opacity',
                      'opacity-0 group-hover:opacity-100',
                      isActive && 'opacity-100'
                    )}>
                      <button
                        onClick={(e) => startRename(e, conv.id, conv.title || '')}
                        title="Rename"
                        className="p-1 rounded hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, conv.id)}
                        title="Delete"
                        className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Subtitle / timestamp */}
                {!isRenaming && (
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

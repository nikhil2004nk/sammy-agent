'use client';

import { useRef, useEffect } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Bot, MessageSquarePlus } from 'lucide-react';
import { useMessages, useSendMessage, useCreateConversation, useUpdateConversation, useConversation } from '@/domains/conversation/api';
import { MessageBubble } from './MessageBubble';
import { Composer } from './Composer';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUIStore } from '@/store/ui';

interface ConversationPanelProps {
  conversationId?: string;
}

export function ConversationPanel({ conversationId }: ConversationPanelProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, isLoading } = useMessages(conversationId || null);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(conversationId || '');
  const { mutate: createConversation, isPending: isCreating } = useCreateConversation();
  const { mutate: updateConversation } = useUpdateConversation();
  const { data: conversation } = useConversation(conversationId || null);
  const setActiveConversationId = useUIStore((s) => s.setActiveConversationId);

  // Sync the active conversation into the global store so ActivityPanel can react
  useEffect(() => {
    setActiveConversationId(conversationId ?? null);
    return () => setActiveConversationId(null);
  }, [conversationId, setActiveConversationId]);

  // Auto-scroll
  useEffect(() => {
    if (messages?.length) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (content: string) => {
    if (!conversationId) {
      // Create conversation and send the first message in one go
      createConversation({ title: content.slice(0, 30) + '...' }, {
        onSuccess: async (data) => {
          if (data && data.id) {
            try {
              // Send the initial message directly since the hook is bound to an empty ID
              const { apiClient } = await import('@/services/api');
              await apiClient(`/conversations/${data.id}/messages`, {
                method: 'POST',
                body: JSON.stringify({ content }),
              });
              // Then redirect to the conversation
              router.push(`/console/${data.id}`);
            } catch (err) {
              toast.error("Failed to send message: " + (err as Error).message);
            }
          }
        },
        onError: () => toast.error("Failed to start conversation")
      });
      return;
    }

    sendMessage({ content }, {
      onSuccess: () => {
        // Auto-name: if this is the first message and title is still generic, use message content as title
        const isGenericTitle = !conversation?.title || 
          conversation.title === 'New Conversation' || 
          conversation.title === 'Recovered Conversation';
        const isFirstMessage = !messages || messages.length === 0;
        if (conversationId && isFirstMessage && isGenericTitle) {
          updateConversation({ id: conversationId, title: content.slice(0, 40).trim() });
        }
      },
      onError: (err) => {
        toast.error("Failed to send message: " + (err as Error).message);
      }
    });
  };

  if (!conversationId) {
    return (
      <div className="flex flex-col h-full bg-background relative">
        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto pb-8">
          <EmptyState 
            icon={Bot}
            title="What would you like Sammy to help you with today?"
            description="Select a conversation from the sidebar or start a new one to begin."
          />
          <div className="flex flex-wrap gap-2 justify-center mt-6 max-w-lg">
            {['Summarize my Gmail', 'Search GitHub', 'Analyze a document', 'Plan a workflow'].map((suggestion) => (
              <button 
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                disabled={isCreating}
                className="px-4 py-2 rounded-full border bg-muted/50 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        <div className="shrink-0 bg-gradient-to-t from-background to-transparent pt-4">
          <Composer onSend={handleSend} isStreaming={isSending} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading messages...
          </div>
        ) : messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <EmptyState icon={MessageSquarePlus} title="Start the conversation" description="Send a message below." />
          </div>
        ) : (
          <div className="pb-8">
            {messages?.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>

      <div className="shrink-0 bg-gradient-to-t from-background to-transparent pt-4">
        <Composer onSend={handleSend} isStreaming={isSending} />
      </div>
    </div>
  );
}

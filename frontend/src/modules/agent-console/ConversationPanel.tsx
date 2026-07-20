'use client';

import { useRef, useEffect } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Bot, MessageSquarePlus } from 'lucide-react';
import { useMessages, useSendMessage, useCreateConversation } from '@/domains/conversation/api';
import { MessageBubble } from './MessageBubble';
import { Composer } from './Composer';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ConversationPanelProps {
  conversationId?: string;
}

export function ConversationPanel({ conversationId }: ConversationPanelProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, isLoading } = useMessages(conversationId || null);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(conversationId || '');
  const { mutate: createConversation, isPending: isCreating } = useCreateConversation();

  // Auto-scroll
  useEffect(() => {
    if (messages?.length) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (content: string) => {
    if (!conversationId) {
      // If no conversation, create one first, then navigate, then send.
      // In a real app, you might want to create the conversation and send the message in one go
      // or send the message and get a new conversation ID back.
      createConversation({ title: 'New Conversation' }, {
        onSuccess: (data) => {
          if (data && data.id) {
            router.push(`/console/${data.id}`);
            // Wait for navigation/mount then send (simplified here)
            toast.info("Created new conversation. Please send your message again.");
          }
        },
        onError: () => toast.error("Failed to start conversation")
      });
      return;
    }

    sendMessage({ content }, {
      onError: (err) => {
        toast.error("Failed to send message: " + (err as Error).message);
      }
    });
  };

  if (!conversationId) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background">
        <EmptyState 
          icon={Bot}
          title="What would you like Jarvis to help you with today?"
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

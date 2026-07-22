'use client';

import React, { useState } from 'react';
import { useConversations, useConversationMessages, useSendMessage, useCreateConversation } from '@/services/api/conversation';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, TerminalSquare, ListTree, Database, MessageSquare } from 'lucide-react';
import { StatusBadge } from '@/components/primitives/StatusBadge';
import { BackendPlannedPlaceholder } from '@/components/primitives/BackendPlannedPlaceholder';
import { LoadingState } from '@/components/primitives/LoadingState';

export default function ConversationsPage() {
  const { data: conversations, isLoading: isLoadingConvos } = useConversations();
  const createConversation = useCreateConversation();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeConversationId = activeId === 'new' ? null : (activeId || (conversations?.[0]?.id ?? null));
  
  const { data: messages, isLoading: isLoadingMessages } = useConversationMessages(activeConversationId || '');
  const sendMessage = useSendMessage();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    if (activeConversationId) {
      sendMessage.mutate({ id: activeConversationId, content: input });
    } else {
      createConversation.mutate({ title: input.substring(0, 20) }, {
        onSuccess: (newConvo) => {
          setActiveId(newConvo.id);
          sendMessage.mutate({ id: newConvo.id, content: input });
        }
      });
    }
    setInput('');
  };

  return (
    <div className="flex h-full min-h-0 bg-background text-foreground">
      {/* Sidebar - Conversation List */}
      <div className="w-64 border-r border-border bg-surface flex flex-col shrink-0">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-medium">Chats</h2>
          <Button size="icon" variant="ghost" onClick={() => setActiveId('new')}>
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingConvos ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : conversations?.length ? (
            conversations.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md truncate transition-colors ${
                  c.id === activeConversationId ? 'bg-primary/10 text-primary' : 'hover:bg-background text-muted-foreground'
                }`}
              >
                {c.title || 'New Chat'}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No conversations.</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border">
        <div className="p-4 border-b border-border bg-surface shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Chat</h2>
            <p className="text-xs text-muted-foreground mt-0.5">GPT-4o</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoadingMessages ? (
             <LoadingState message="Loading messages..." />
          ) : !messages?.length ? (
             <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
               Send a message to start the conversation.
             </div>
          ) : (
             messages.map(msg => (
               <div key={msg.id} className="flex gap-4">
                 <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border ${
                   msg.role === 'user' ? 'bg-surface border-border' : 'bg-primary/20 text-primary border-primary/20'
                 }`}>
                   {msg.role === 'user' ? <User className="w-4 h-4 text-foreground" /> : <Bot className="w-4 h-4" />}
                 </div>
                 <div className="flex-1 pt-1">
                   <p className="font-medium text-sm mb-1">{msg.role === 'user' ? 'You' : 'Jarvis'}</p>
                   <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                     {msg.content}
                   </p>
                 </div>
               </div>
             ))
          )}
        </div>

        <div className="p-4 bg-surface border-t border-border shrink-0">
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
            <input 
              type="text" 
              placeholder="Ask Jarvis anything..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim() || sendMessage.isPending} className="w-8 h-8 shrink-0">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Execution Area (Mocked for now) */}
      <div className="w-96 flex flex-col min-w-0 bg-surface">
        <BackendPlannedPlaceholder 
          title="Live Execution Trace"
          milestone="Milestone 11" 
          expectedFeatures={[
            "Real-time visualization of agent steps",
            "Memory retrieval tracing",
            "Tool call inspection alongside chat"
          ]}
        />
      </div>
    </div>
  );
}

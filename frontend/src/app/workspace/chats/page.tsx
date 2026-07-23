'use client';

import React, { useEffect, useRef } from 'react';
import { useUiStore } from '@/store/ui.store';
import { Send, Bot, User, Loader2, Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeveloperDrawer } from './DeveloperDrawer';
import { useSendMessage, useCreateConversation } from '@/services/api/conversation/mutations';
import { useConversations, useConversationMessages } from '@/services/api/conversation/queries';
import { useAuthStore } from '@/store/auth.store';

export default function WorkspaceChatsPage() {
  const { isDeveloperMode } = useUiStore();
  
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [localMessages, setLocalMessages] = React.useState<any[]>([]);

  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [activeExecutionId, setActiveExecutionId] = React.useState<string | null>(null);
  // isViewingHistory: true only when user clicks a conversation from the sidebar
  // false when user is in an active new/current chat session
  const [isViewingHistory, setIsViewingHistory] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

  const { data: conversations, refetch: refetchConversations } = useConversations();
  const { data: historyMessages, isFetching: isLoadingHistory } = useConversationMessages(
    isViewingHistory && conversationId ? conversationId : ''
  );

  useEffect(() => {
    // Only load history when user explicitly selects a conversation from the sidebar
    if (!isViewingHistory) return;

    if (isLoadingHistory) {
      return; // wait for load to complete
    }

    if (historyMessages && historyMessages.length > 0) {
      const formatted = historyMessages
        .filter((msg: any) => {
          const role = (msg.role || '').toLowerCase();
          return (role === 'user' || role === 'assistant') && msg.content?.trim();
        })
        .map((msg: any) => ({
          id: msg.id,
          role: (msg.role || '').toLowerCase(),
          content: msg.content || '',
        }));
      setLocalMessages(formatted.length > 0 ? formatted : [{ id: 'init', role: 'assistant', content: 'Hello! I am Sammy. How can I help you today?' }]);
    } else {
      setLocalMessages([{ id: 'init', role: 'assistant', content: 'Hello! I am Sammy. How can I help you today?' }]);
    }
  }, [historyMessages, isLoadingHistory, isViewingHistory]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, isTyping]);

  const handleNewChat = () => {
    setConversationId(null);
    setIsViewingHistory(false);
    setLocalMessages([{ id: 'init', role: 'assistant', content: 'Hello! I am Sammy. How can I help you today?' }]);
    setActiveExecutionId(null);
  };

  const handleSelectConversation = (id: string) => {
    setConversationId(id);
    setIsViewingHistory(true); // explicitly loading history from sidebar
    setLocalMessages([{ id: 'init', role: 'assistant', content: 'Loading conversation...' }]);
    setActiveExecutionId(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput('');
    setIsTyping(true);
    setLocalMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);

    try {
      let currentConvId = conversationId;
      if (!currentConvId) {
        const conv = await createConversation.mutateAsync({ title: 'New Conversation' });
        currentConvId = conv.id;
        setConversationId(currentConvId);
        setIsViewingHistory(false); // stay in active session mode, don't load history
        refetchConversations();
      }

      const runId = window.crypto.randomUUID();
      setActiveExecutionId(runId);

      const response = await sendMessage.mutateAsync({ 
        id: currentConvId, 
        content: userMessage,
        runId 
      });

      setLocalMessages(prev => [...prev, { 
        id: response.id, 
        role: 'assistant', 
        content: response.content || 'Processing complete.' 
      }]);
    } catch (err) {
      console.error(err);
      setLocalMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: 'Sorry, I encountered an error.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar: Conversation List */}
      <div className="w-64 border-r border-border bg-surface/30 flex flex-col h-full hidden md:flex shrink-0">
         <div className="p-4 border-b border-border">
           <button 
             onClick={handleNewChat}
             className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
           >
             <Plus className="w-4 h-4" />
             New Chat
           </button>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations?.map((conv: any) => (
               <button 
                 key={conv.id}
                 onClick={() => handleSelectConversation(conv.id)}
                 className={cn(
                   "w-full text-left px-3 py-3 text-sm rounded-md truncate transition-colors flex items-center gap-3",
                   conversationId === conv.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                 )}
               >
                 <MessageSquare className="w-4 h-4 shrink-0" />
                 <span className="truncate">{conv.title || 'Untitled Conversation'}</span>
               </button>
            ))}
         </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex flex-col h-full transition-all duration-300 flex-1 min-w-0",
        isDeveloperMode ? "lg:w-[calc(100%-400px)] border-r border-border" : "w-full"
      )}>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {isLoadingHistory ? (
             <div className="flex items-center justify-center h-full">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : (
            <>
              {localMessages.map((msg) => {
                const isTool = msg.role === 'tool' || msg.content.startsWith('Tool Call:');
                if (isTool && !isDeveloperMode) return null; // Hide raw tools from normal users

                return (
                  <div key={msg.id} className={cn(
                    "flex gap-4", 
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className={cn(
                      "px-4 py-3 rounded-lg max-w-[85%] shadow-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground" 
                        : isTool 
                          ? "bg-muted text-muted-foreground font-mono text-xs" 
                          : "bg-surface border border-border text-foreground"
                    )}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-surface border border-border text-muted-foreground flex items-center gap-2 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Sammy is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border/50">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What would you like to do?"
                className="w-full pl-6 pr-14 py-4 rounded-full border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm shadow-sm"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-center mt-3 text-xs text-muted-foreground font-medium">
              Sammy AI Operating System — Phase 7A UI Scaffold
            </div>
          </div>
        </div>
      </div>

      {/* Developer Drawer */}
      {isDeveloperMode && <DeveloperDrawer executionId={activeExecutionId} />}
    </div>
  );
}

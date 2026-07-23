'use client';

import React from 'react';
import { useUiStore } from '@/store/ui.store';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeveloperDrawer } from './DeveloperDrawer';
import { useSendMessage, useCreateConversation } from '@/services/api/conversation/mutations';
import { useAuthStore } from '@/store/auth.store';

export default function WorkspaceChatsPage() {
  const { isDeveloperMode } = useUiStore();
  const [messages, setMessages] = React.useState([
    { id: '1', role: 'assistant', content: 'Hello! I am Sammy. How can I help you today?' }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [activeExecutionId, setActiveExecutionId] = React.useState<string | null>(null);
  
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput('');
    setIsTyping(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);

    try {
      let currentConvId = conversationId;
      if (!currentConvId) {
        const conv = await createConversation.mutateAsync({ title: 'New Conversation' });
        currentConvId = conv.id;
        setConversationId(currentConvId);
      }

      const runId = window.crypto.randomUUID();
      setActiveExecutionId(runId);

      const response = await sendMessage.mutateAsync({ 
        id: currentConvId, 
        content: userMessage,
        runId 
      });

      setMessages(prev => [...prev, { 
        id: response.id, 
        role: 'assistant', 
        content: response.content || 'Processing complete.' 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
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
      {/* Main Chat Area */}
      <div className={cn(
        "flex flex-col h-full transition-all duration-300",
        isDeveloperMode ? "w-2/3 border-r border-border" : "w-full max-w-4xl mx-auto"
      )}>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className={cn(
                "px-4 py-3 rounded-lg max-w-[80%]",
                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-surface border border-border text-foreground"
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="px-4 py-3 rounded-lg bg-surface border border-border text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Sammy is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What would you like to do?"
              className="w-full pl-4 pr-12 py-3 rounded-full border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2 text-xs text-muted-foreground">
            Sammy AI Operating System — Phase 7A UI Scaffold
          </div>
        </div>
      </div>

      {/* Developer Drawer */}
      {isDeveloperMode && <DeveloperDrawer executionId={activeExecutionId} />}
    </div>
  );
}

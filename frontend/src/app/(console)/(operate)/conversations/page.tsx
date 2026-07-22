'use client';

import React, { useState } from 'react';
import { useConversations, useConversationMessages, useSendMessage, useCreateConversation } from '@/services/api/conversation';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, TerminalSquare, ListTree, Database, MessageSquare, PanelLeftClose, PanelLeft } from 'lucide-react';
import { StatusBadge } from '@/components/primitives/StatusBadge';
import { BackendPlannedPlaceholder } from '@/components/primitives/BackendPlannedPlaceholder';
import { LoadingState } from '@/components/primitives/LoadingState';

const isJson = (str: string) => {
  const trimmed = str.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return false;
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
};

export default function ConversationsPage() {
  const { data: conversations, isLoading: isLoadingConvos } = useConversations();
  const createConversation = useCreateConversation();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    <div className="flex h-full min-h-0 bg-gradient-to-br from-background via-[#120a2e] to-background text-foreground relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar - Conversation List */}
      <div className={`flex flex-col shrink-0 z-10 transition-all duration-300 ${isSidebarOpen ? 'w-64 border-r border-white/5 bg-surface/40 backdrop-blur-md opacity-100' : 'w-0 border-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 border-b border-white/5 flex justify-between items-center whitespace-nowrap min-w-[16rem]">
          <h2 className="font-medium">Chats</h2>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setActiveId('new')} className="w-8 h-8">
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsSidebarOpen(false)} className="w-8 h-8">
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingConvos ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : conversations?.length ? (
            conversations.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg truncate transition-all duration-200 ${
                  c.id === activeConversationId ? 'bg-white/10 text-white font-medium shadow-sm' : 'hover:bg-white/5 text-muted-foreground hover:text-white'
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
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 z-10">
        <div className="p-4 border-b border-white/5 bg-surface/40 backdrop-blur-md shrink-0 flex items-center gap-3">
          {!isSidebarOpen && (
            <Button size="icon" variant="ghost" onClick={() => setIsSidebarOpen(true)} className="w-8 h-8 text-muted-foreground hover:text-white">
              <PanelLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h2 className="text-lg font-medium text-white">Chat</h2>
            <p className="text-xs text-primary/80 mt-0.5">Sammy Agent</p>
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
             <div className="max-w-3xl mx-auto w-full space-y-6 pb-4">
               {messages.map((msg, index) => {
                 const isConsecutive = index > 0 && 
                   (messages[index - 1].role === msg.role || 
                   (messages[index - 1].role !== 'user' && msg.role !== 'user'));
                 return (
                 <div key={msg.id} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${isConsecutive ? '!mt-2' : ''}`}>
                   {msg.role !== 'user' && (
                     <div className={`w-8 h-8 shrink-0 mt-1 ${isConsecutive ? 'invisible' : 'rounded-xl border shadow-sm bg-primary/20 text-primary border-primary/30 flex items-center justify-center'}`}>
                       {!isConsecutive && <Bot className="w-4 h-4 text-primary-foreground" />}
                     </div>
                   )}
                   
                   <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] w-full`}>
                     {msg.role !== 'user' && !isConsecutive && <p className="font-semibold text-sm mb-1.5 text-white/90">Sammy</p>}
                     
                     <div className={`text-sm leading-relaxed ${
                       msg.role === 'user' 
                         ? 'bg-surface border border-white/10 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-sm whitespace-pre-wrap' 
                         : 'text-white/90 w-full overflow-hidden'
                     }`}>
                       {msg.role === 'user' ? (
                         msg.content
                       ) : msg.content.startsWith('[Tool Call]') ? (
                         <details className="group border border-white/10 rounded-xl bg-black/20 overflow-hidden my-1">
                           <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
                             <TerminalSquare className="w-4 h-4 text-primary/70" />
                             <span>Used Tool: <span className="text-primary/90">{msg.content.replace('[Tool Call]', '').trim()}</span></span>
                           </summary>
                           <div className="px-4 py-3 border-t border-white/5 bg-black/40 text-xs font-mono text-white/60 whitespace-pre-wrap">
                             {msg.content}
                           </div>
                         </details>
                       ) : isJson(msg.content) ? (
                         <details className="group border border-white/10 rounded-xl bg-black/20 overflow-hidden my-1">
                           <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
                             <Database className="w-4 h-4 text-blue-400/70" />
                             <span>View Internal Data</span>
                           </summary>
                           <div className="px-4 py-3 border-t border-white/5 bg-black/40 text-xs font-mono text-white/60 overflow-x-auto">
                             <pre>{msg.content}</pre>
                           </div>
                         </details>
                       ) : (
                         <div className="flex flex-col gap-2">
                           <ReactMarkdown 
                             remarkPlugins={[remarkGfm]}
                             components={{
                               code(props) {
                                 const {children, className, node, ...rest} = props
                                 const match = /language-(\w+)/.exec(className || '')
                                 return match ? (
                                   <pre className="bg-black/50 p-4 rounded-xl overflow-x-auto border border-white/10 my-2 text-xs font-mono">
                                     <code className={className} {...rest}>
                                       {children}
                                     </code>
                                   </pre>
                                 ) : (
                                   <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary-foreground/90 font-mono text-[0.8em]" {...rest}>
                                     {children}
                                   </code>
                                 )
                               },
                               p: ({children}) => <p className="leading-relaxed">{children}</p>,
                               ul: ({children}) => <ul className="list-disc pl-5 space-y-1 my-1 marker:text-primary/70">{children}</ul>,
                               ol: ({children}) => <ol className="list-decimal pl-5 space-y-1 my-1 marker:text-primary/70">{children}</ol>,
                               li: ({children}) => <li className="pl-1">{children}</li>,
                               a: ({children, href}) => <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-2">{children}</a>,
                               h1: ({children}) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                               h2: ({children}) => <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>,
                               h3: ({children}) => <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>,
                               blockquote: ({children}) => <blockquote className="border-l-2 border-primary/50 pl-4 py-1 italic text-muted-foreground bg-white/5 rounded-r-lg my-2">{children}</blockquote>,
                               strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>
                             }}
                           >
                             {msg.content}
                           </ReactMarkdown>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
                 );
               })}
             </div>
          )}
        </div>

        <div className="p-4 bg-gradient-to-t from-background to-transparent border-t border-transparent shrink-0">
          <div className="max-w-3xl mx-auto w-full relative">
            <div className="flex items-end gap-2 bg-surface border border-white/10 rounded-2xl px-4 py-3 shadow-lg focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-300 backdrop-blur-md">
              <input 
                type="text" 
                placeholder="Message Sammy..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground text-white min-h-[24px] py-1"
              />
              <Button size="icon" onClick={handleSend} disabled={!input.trim() || sendMessage.isPending} className="w-8 h-8 shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm transition-transform hover:scale-105">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3 mb-1">
              Sammy can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>
      </div>

      {/* Right Execution Area (Mocked for now) */}
      <div className="w-80 flex flex-col min-w-0 bg-black/10 backdrop-blur-xl z-10 border-l border-white/5">
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

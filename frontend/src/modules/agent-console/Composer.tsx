'use client';

import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send, Plus, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComposerProps {
  onSend: (text: string) => void;
  isStreaming?: boolean;
}

export function Composer({ onSend, isStreaming = false }: ComposerProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-background">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2 border rounded-xl bg-muted/30 p-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all shadow-sm">
        
        {/* Placeholder: Attachments */}
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full text-muted-foreground hover:text-foreground">
          <Plus className="w-5 h-5" />
        </Button>

        <TextareaAutosize
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Jarvis..."
          className="flex-1 max-h-72 min-h-[40px] resize-none bg-transparent py-2.5 px-2 focus:outline-none text-sm leading-relaxed"
          minRows={1}
          maxRows={10}
        />

        {/* Placeholder: Voice */}
        {!input.trim() && !isStreaming && (
          <Button variant="ghost" size="icon" className="shrink-0 rounded-full text-muted-foreground hover:text-foreground">
            <Mic className="w-5 h-5" />
          </Button>
        )}

        {isStreaming ? (
          <Button variant="destructive" size="icon" className="shrink-0 rounded-full h-10 w-10">
            <Square className="w-4 h-4 fill-current" />
          </Button>
        ) : (
          <Button 
            onClick={handleSend}
            disabled={!input.trim()}
            size="icon" 
            className="shrink-0 rounded-full h-10 w-10 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="text-center mt-2 text-[10px] text-muted-foreground">
        Jarvis can make mistakes. Verify critical information.
      </div>
    </div>
  );
}

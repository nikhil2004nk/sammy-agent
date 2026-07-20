'use client';

import { Circle } from 'lucide-react';
import { useTheme } from 'next-themes';

export function StatusBar() {
  const { theme, setTheme } = useTheme();

  return (
    <footer className="h-8 border-t bg-background flex items-center justify-between px-4 shrink-0 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500" />
          <span>Connected</span>
        </div>
        {/* Future: Model, Latency, Streaming */}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
    </footer>
  );
}

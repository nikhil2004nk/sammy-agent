'use client';

import { useUIStore } from '@/store/ui';

export function SecondarySidebar() {
  const { sidebarMode, sidebarOpen } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <div className="w-72 border-r bg-muted/10 h-full hidden md:block overflow-hidden flex-shrink-0">
      {(sidebarMode as string) === 'conversation' && (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground opacity-50 p-4 text-center">
          Conversations
          <br />
          (Coming soon)
        </div>
      )}
      {(sidebarMode as string) !== 'conversation' && (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground opacity-50 p-4 text-center">
          {sidebarMode} panel
          <br />
          (Coming soon)
        </div>
      )}
    </div>
  );
}

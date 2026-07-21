'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/auth.store';
import { apiClient } from '../../lib/api-client';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setAuth, setWorkspaces, setLoading } = useAuthStore();

  useEffect(() => {
    const initSession = async () => {
      // Don't attempt to fetch session on public auth pages
      if (pathname === '/login' || pathname === '/register') {
        setLoading(false);
        return;
      }

      // Calling /auth/me to see if we have a valid session via the HttpOnly refresh cookie.
      // If we don't have an access token, the api-client will attempt a refresh automatically!
      const { data: user, error } = await apiClient('/auth/me', { requireAuth: true });
      
      if (user && !error) {
        // With cookies, if we get the user back, we are authenticated!
        setAuth(user);
        
        // Fetch workspaces
        const { data: workspaces } = await apiClient('/workspaces');
        if (workspaces) {
          setWorkspaces(workspaces);
        }
      }
      setLoading(false);
    };

    initSession();
  }, [setAuth, setWorkspaces, setLoading, pathname]);

  return <>{children}</>;
}

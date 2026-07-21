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
        // The interceptor inside apiClient would have updated the store with a new accessToken if it refreshed.
        // But we need to make sure user data is set. We can get the accessToken from the store.
        const currentToken = useAuthStore.getState().accessToken;
        if (currentToken) {
           setAuth(user, currentToken);
           
           // Fetch workspaces
           const { data: workspaces } = await apiClient('/workspaces');
           if (workspaces) {
             setWorkspaces(workspaces);
           }
        }
      }
      setLoading(false);
    };

    initSession();
  }, [setAuth, setWorkspaces, setLoading, pathname]);

  return <>{children}</>;
}

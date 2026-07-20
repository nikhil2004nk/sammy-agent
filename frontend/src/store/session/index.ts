import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  user: null | { id: string; name: string; email: string };
  isAuthenticated: boolean;
  setSession: (user: SessionState['user']) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setSession: (user) => set({ user, isAuthenticated: !!user }),
      clearSession: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'session-storage',
    }
  )
);

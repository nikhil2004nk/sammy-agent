import { create } from 'zustand';

export interface Workspace {
  id: string;
  name: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setAuth: (user: User, accessToken: string) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (id: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  workspaces: [],
  activeWorkspaceId: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isLoading: false }),
  setWorkspaces: (workspaces) => set((state) => ({ 
    workspaces, 
    activeWorkspaceId: state.activeWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null) 
  })),
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  logout: () => set({ user: null, accessToken: null, workspaces: [], activeWorkspaceId: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

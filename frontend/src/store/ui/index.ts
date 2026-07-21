import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activityPanelOpen: boolean;
  sidebarMode: 'agent' | 'workflows' | 'executions' | 'approvals' | 'scheduler' | 'connections' | 'knowledge' | 'settings';
  activeConversationId: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleActivityPanel: () => void;
  setActivityPanelOpen: (open: boolean) => void;
  setSidebarMode: (mode: UIState['sidebarMode']) => void;
  setActiveConversationId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activityPanelOpen: true,
  sidebarMode: 'workflows',
  activeConversationId: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleActivityPanel: () => set((state) => ({ activityPanelOpen: !state.activityPanelOpen })),
  setActivityPanelOpen: (open) => set({ activityPanelOpen: open }),
  setSidebarMode: (mode) => set({ sidebarMode: mode }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
}));

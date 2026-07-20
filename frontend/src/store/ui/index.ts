import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activityPanelOpen: boolean;
  sidebarMode: 'dashboard' | 'conversation' | 'agent' | 'memory' | 'workflow' | 'settings' | 'connections';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleActivityPanel: () => void;
  setActivityPanelOpen: (open: boolean) => void;
  setSidebarMode: (mode: UIState['sidebarMode']) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activityPanelOpen: true,
  sidebarMode: 'conversation',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleActivityPanel: () => set((state) => ({ activityPanelOpen: !state.activityPanelOpen })),
  setActivityPanelOpen: (open) => set({ activityPanelOpen: open }),
  setSidebarMode: (mode) => set({ sidebarMode: mode }),
}));

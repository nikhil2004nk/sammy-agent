import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DeveloperModeLevel = 'basic' | 'advanced';

interface UiState {
  isDeveloperMode: boolean;
  developerModeLevel: DeveloperModeLevel;
  toggleDeveloperMode: () => void;
  setDeveloperModeLevel: (level: DeveloperModeLevel) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isDeveloperMode: false,
      developerModeLevel: 'basic',
      toggleDeveloperMode: () => set((state) => ({ isDeveloperMode: !state.isDeveloperMode })),
      setDeveloperModeLevel: (level) => set({ developerModeLevel: level }),
    }),
    {
      name: 'sammy-ui-storage',
    }
  )
);

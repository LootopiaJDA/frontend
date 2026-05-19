import { create } from 'zustand';

interface HuntStore {
  pendingValidation: boolean;
  setPendingValidation: (v: boolean) => void;
  sessionScore: number;
  addPoints: (pts: number) => void;
  resetScore: () => void;
}

export const useHuntStore = create<HuntStore>((set) => ({
  pendingValidation: false,
  setPendingValidation: (v) => set({ pendingValidation: v }),
  sessionScore: 0,
  addPoints: (pts) => set((s) => ({ sessionScore: s.sessionScore + pts })),
  resetScore: () => set({ sessionScore: 0 }),
}));

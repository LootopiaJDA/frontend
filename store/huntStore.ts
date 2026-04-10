import { create } from 'zustand';

/**
 * Store Zustand partagé entre la carte et l'écran AR.
 * Permet à ar-view.tsx de signaler à map.tsx qu'une étape a été validée.
 */
interface HuntStore {
  pendingValidation: boolean;
  setPendingValidation: (v: boolean) => void;
}

export const useHuntStore = create<HuntStore>((set) => ({
  pendingValidation: false,
  setPendingValidation: (v) => set({ pendingValidation: v }),
}));

import { create } from 'zustand';

interface CaroStoreState {
  userName: string;
  setUserName: (name: string) => void;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
}

export const useCaroStore = create<CaroStoreState>((set) => ({
  userName: '',
  setUserName: (name) => set({ userName: name }),
  isPlaying: false,
  setIsPlaying: (val) => set({ isPlaying: val }),
}));

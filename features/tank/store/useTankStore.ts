import { create } from 'zustand';

interface TankStoreState {
  userName: string;
  vehicle: 'tank' | 'airplane';
  setUserName: (name: string) => void;
  setVehicle: (vehicle: 'tank' | 'airplane') => void;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
}

export const useTankStore = create<TankStoreState>((set) => ({
  userName: '',
  vehicle: 'tank',
  setUserName: (name) => set({ userName: name }),
  setVehicle: (vehicle) => set({ vehicle }),
  isPlaying: false,
  setIsPlaying: (val) => set({ isPlaying: val }),
}));

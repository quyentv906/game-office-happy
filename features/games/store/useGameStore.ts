import { create } from "zustand";
import { GameCategory } from "../data/mockGames";

interface GameStoreState {
  activeCategory: GameCategory;
  setActiveCategory: (category: GameCategory) => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  activeCategory: "all",
  setActiveCategory: (category) => set({ activeCategory: category }),
}));

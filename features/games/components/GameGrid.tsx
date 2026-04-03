"use client";

import { useGameStore } from "../store/useGameStore";
import { mockGames } from "../data/mockGames";
import GameCard from "./GameCard";
import { useMemo } from "react";

export default function GameGrid() {
  const activeCategory = useGameStore((state) => state.activeCategory);

  const filteredGames = useMemo(() => {
    if (activeCategory === "all") return mockGames;
    return mockGames.filter((game) => game.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {activeCategory === "all" ? "🔥 Tất cả trò chơi" : 
           activeCategory === "office" ? "💼 Game Văn Phòng" :
           activeCategory === "offline" ? "🎮 Game Offline" : "🌍 Game Online"}
        </h2>
        <p className="text-slate-500 text-sm mt-1">Tìm thấy {filteredGames.length} trò chơi phù hợp.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
        {filteredGames.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500">
            Không tìm thấy trò chơi nào trong danh mục này.
          </div>
        )}
      </div>
    </div>
  );
}

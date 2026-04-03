"use client";

import { useGameStore } from "../store/useGameStore";
import { GameCategory } from "../data/mockGames";
import { Monitor, WifiOff, Globe, Layers } from "lucide-react";

export default function GameTabs() {
  const { activeCategory, setActiveCategory } = useGameStore();

  const tabs: { id: GameCategory; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "Tất cả", icon: <Layers className="w-5 h-5 mb-1" /> },
    { id: "office", label: "Game Văn Phòng", icon: <Monitor className="w-5 h-5 mb-1" /> },
    { id: "offline", label: "Game Offline", icon: <WifiOff className="w-5 h-5 mb-1" /> },
    { id: "online", label: "Game Online", icon: <Globe className="w-5 h-5 mb-1" /> },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 my-8">
      {tabs.map((tab) => {
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`
              flex flex-col items-center justify-center min-w-[140px] px-6 py-4 rounded-2xl transition-all duration-300
              ${isActive
                ? "bg-gradient-to-br from-purple-600 to-blue-500 text-white shadow-xl shadow-purple-500/30 scale-105"
                : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-soft"
              }
            `}
          >
            {tab.icon}
            <span className="font-semibold text-sm">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

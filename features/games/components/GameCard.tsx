"use client";

import Link from "next/link";
import { Game } from "../data/mockGames";
import { Play } from "lucide-react";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-slate-100">
      {/* Thumbnail Area */}
      <div className={`relative h-48 w-full bg-gradient-to-br ${game.colorFrom} ${game.colorTo} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300 pointer-events-none" />
        
        {/* Tag */}
        {game.tag && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {game.tag}
            </span>
          </div>
        )}
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{game.title}</h3>
        <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2">
          {game.description}
        </p>

        {/* Action button */}
        <Link 
          href={game.link || `/game/${game.id}`}
          className="mt-auto block w-full text-center py-3 bg-slate-50 text-purple-700 font-semibold rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300"
        >
          Chơi Ngay
        </Link>
      </div>
    </div>
  );
}

"use client";

import { PlayerRole, checkWin } from "../utils/checkWin";
import { useEffect, useState } from "react";

interface CaroBoardProps {
  board: PlayerRole[][];
  onMove: (row: number, col: number) => void;
  disabled: boolean;
  onWinDetect?: (role: string) => void;
  myRole: PlayerRole;
  lastMove: { row: number, col: number } | null;
}

export default function CaroBoard({ board, onMove, disabled, onWinDetect, myRole, lastMove }: CaroBoardProps) {
  useEffect(() => {
    // Check if the board has a win after a move
    if (lastMove && onWinDetect) {
      const p = board[lastMove.row][lastMove.col];
      // Only emit win if the move was ours to avoid double emission
      if (p !== null && p === myRole && checkWin(board, lastMove.row, lastMove.col, p)) {
        onWinDetect(p);
      }
      
      // Auto-scroll to opponent's move
      if (p !== null && p !== myRole) {
        const cellId = `cell-${lastMove.row}-${lastMove.col}`;
        const el = document.getElementById(cellId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      }
    }
  }, [board, lastMove, onWinDetect, myRole]);

  const handleCellClick = (row: number, col: number) => {
    if (disabled || board[row][col] !== null) return;
    onMove(row, col);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-800">
      <div className="overflow-auto w-full h-full shadow-inner bg-slate-800">
        <div 
          className="inline-grid gap-px border-r border-b border-slate-600 bg-slate-600 min-w-max"
          style={{
            gridTemplateColumns: `repeat(${board[0].length}, minmax(16px, 24px))`,
            gridTemplateRows: `repeat(${board.length}, minmax(16px, 24px))`
          }}
        >
          {board.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              const isLastMove = lastMove?.row === rIdx && lastMove?.col === cIdx;
              
              return (
                <div
                  id={`cell-${rIdx}-${cIdx}`}
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  className={`
                    w-full h-full bg-slate-900 flex items-center justify-center text-xs md:text-sm font-black cursor-pointer select-none transition-colors duration-200
                    ${!disabled && cell === null ? 'hover:bg-slate-800' : ''}
                    ${isLastMove ? 'bg-slate-700' : ''}
                  `}
                >
                  {cell === 'X' && (
                    <span className="text-red-400 drop-shadow-md animate-in zoom-in spin-in-12">X</span>
                  )}
                  {cell === 'O' && (
                    <span className="text-blue-400 drop-shadow-md animate-in zoom-in spin-in-12">O</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {!disabled && myRole && (
         <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-pulse text-purple-600 border border-purple-100">
           Đến lượt bạn đánh!
         </div>
      )}
    </div>
  );
}

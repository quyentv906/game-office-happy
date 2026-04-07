"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Maximize, Minimize, Users, Map, Trophy } from "lucide-react";
import { useTankStore } from "@/features/tank/store/useTankStore";
import { useTankSocket } from "@/features/tank/hooks/useTankSocket";
import GameCanvas from "@/features/tank/components/GameCanvas";

export default function TankGamePage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const { userName, vehicle } = useTankStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { socket, gameState, myId, errorEvent, mapDef, eventLog, leaveRoom, sendInput, shoot } = useTankSocket(params.roomId, userName, vehicle);

  useEffect(() => {
    if (!userName) {
      router.push("/games/tank");
    }
  }, [userName, router]);

  useEffect(() => {
    const handleFullscreen = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreen);
      leaveRoom();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Rời phòng sẽ dẫn tới mất điểm, bạn chắc chứ?")) {
      leaveRoom();
      router.push("/games/tank");
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(params.roomId);
    alert("Đã copy!");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (errorEvent) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{errorEvent}</h2>
        <Link href="/games/tank" className="px-6 py-3 bg-slate-200 rounded-xl font-bold">Về sảnh</Link>
      </div>
    );
  }

  if (!gameState || !mapDef) {
    return <div className="p-20 text-center animate-pulse">Đang kết nối vào trận...</div>;
  }

  // Get active players count
  const px = Object.keys(gameState.players).length;

  return (
    <div ref={containerRef} className={`flex flex-col bg-slate-900 w-full overflow-hidden ${isFullscreen ? "h-screen p-0" : "h-[calc(100vh-8rem)] rounded-3xl relative"}`}>
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 select-none bg-slate-900/60 backdrop-blur p-3 rounded-2xl border border-slate-700 pointer-events-auto">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg text-white font-mono text-sm max-w-[200px]">
            <span className="truncate">#{params.roomId}</span>
            <button onClick={copyRoomId}><Copy className="w-4 h-4 hover:text-green-400" /></button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-400 bg-green-900/40 px-3 py-1.5 rounded-lg">
            <Users className="w-5 h-5" />
            <span className="font-bold">{px}/{mapDef.maxPlayers || 5}</span>
          </div>
          <button onClick={() => setShowLeaderboard(!showLeaderboard)} className={`p-2 rounded-xl transition-all ${showLeaderboard ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
             <Trophy className="w-5 h-5"/>
          </button>
          <button onClick={() => setShowMinimap(!showMinimap)} className={`p-2 rounded-xl transition-all ${showMinimap ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
             <Map className="w-5 h-5"/>
          </button>
          <button onClick={toggleFullscreen} className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 hidden md:flex">
             {isFullscreen ? <Minimize className="w-5 h-5"/> : <Maximize className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* Leaderboard Overlay */}
      {showLeaderboard && (
        <div className="absolute top-24 right-4 z-10 w-48 bg-slate-900/80 backdrop-blur rounded-xl border border-slate-700 p-4 pointer-events-none">
          <h3 className="text-white font-bold mb-3 border-b border-slate-700 pb-2">Top Killers</h3>
          {Object.values(gameState.players)
            .sort((a,b) => b.score - a.score)
            .slice(0, 5)
            .map((p, idx) => (
              <div key={p.id} className="flex justify-between text-sm mb-1">
                <span className={`truncate ${p.id === myId ? 'text-green-400 font-bold' : 'text-slate-300'}`}>{idx+1}. {p.name}</span>
                <span className="text-white font-mono">{p.score}</span>
              </div>
            ))
          }
        </div>
      )}

      {/* Game Log Overflow */}
      <div className="absolute bottom-4 left-4 z-10 w-64 pointer-events-none flex flex-col justify-end space-y-1">
         {eventLog.slice(-4).map((log, i) => (
           <div key={log.id} className="text-xs bg-slate-900/50 text-white px-2 py-1 rounded inline-block animate-in slide-in-from-left w-max">
             {log.msg}
           </div>
         ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full h-full relative cursor-crosshair">
        <GameCanvas 
          gameState={gameState} 
          mapDef={mapDef} 
          myId={myId} 
          sendInput={sendInput}
          shoot={shoot}
          showMinimap={showMinimap}
        />
      </div>
    </div>
  );
}

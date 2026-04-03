"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Trophy, RotateCcw, Maximize, Minimize, Loader2 } from "lucide-react";
import { useCaroStore } from "@/features/caro/store/useCaroStore";
import { useCaroSocket } from "@/features/caro/hooks/useCaroSocket";
import CaroBoard from "@/features/caro/components/CaroBoard";
import ChatBox from "@/features/caro/components/ChatBox";
import PlayerModal from "@/features/caro/components/PlayerModal";

export default function CaroGamePage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const { userName, setIsPlaying } = useCaroStore();
  const [showNameModal, setShowNameModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { 
    roomState, 
    role, 
    winner, 
    messages, 
    errorEvent,
    makeMove, 
    notifyWin, 
    sendMessage,
    restartGame,
    leaveRoom,
    lastMove
  } = useCaroSocket(params.roomId, userName);

  useEffect(() => {
    if (!userName) {
      setShowNameModal(true);
    }
  }, [userName]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    setIsPlaying(true);
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Bạn có chắc muốn rời phòng? Quá trình chơi sẽ bị thoát!";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Ensure we leave the room gracefully if the component unmounts (e.g. navigating away)
      leaveRoom();
      setIsPlaying(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackNavigation = (e: React.MouseEvent) => {
    e.preventDefault(); // Always prevent default Link action to manage routing manually
    if (window.confirm("Bạn có chắc chắn muốn rời phòng? Trận đấu sẽ kết thúc nếu bạn thoát.")) {
      leaveRoom();         // explicitly leave socket room right now
      setIsPlaying(false); // clear state immediately 
      router.push("/games/caro"); // push router
    }
  };

  if (showNameModal) {
    return <PlayerModal onSave={() => setShowNameModal(false)} />;
  }

  if (errorEvent) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{errorEvent}</h2>
        <Link href="/games/caro" className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl font-bold hover:bg-slate-300 transition-colors">
          Quay Lại Sảnh
        </Link>
      </div>
    );
  }

  if (!roomState) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Đang vào phòng...</div>;
  }

  const isMyTurn = roomState.turn === role && !winner;
  const opponent = roomState.players.find(p => p.role !== role);
  const me = roomState.players.find(p => p.role === role);

  const copyRoomId = () => {
    navigator.clipboard.writeText(params.roomId);
    alert("Đã copy mã phòng!");
  };

  return (
    <div ref={gameContainerRef} className={`flex flex-col bg-slate-50 w-full overflow-hidden ${isFullscreen ? "h-screen p-4" : "h-[calc(100vh-8rem)]"}`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={handleBackNavigation}
          className="p-2 rounded-xl bg-white shadow-soft hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900 border border-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-white p-3 md:p-4 rounded-2xl shadow-soft border border-slate-100 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="font-mono bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold flex items-center gap-2">
              #{params.roomId}
              <button onClick={copyRoomId} className="hover:text-purple-900"><Copy className="w-4 h-4" /></button>
            </div>
            <button onClick={toggleFullscreen} className="p-2 ml-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors flex items-center gap-2 font-bold text-sm">
              {isFullscreen ? <><Minimize className="w-5 h-5" /> Thu Nhỏ</> : <><Maximize className="w-5 h-5" /> Phóng To</>}
            </button>
            {opponent ? (
              <div className="text-sm font-medium text-slate-600 block md:flex gap-2">
                Đang đấu với: <span className="font-bold text-slate-900">{opponent.name}</span>
              </div>
            ) : (
              <div className="text-sm font-medium text-amber-500 animate-pulse">
                Đang chờ đối thủ...
              </div>
            )}
          </div>
          
          <div className="text-sm font-bold bg-slate-100 px-4 py-2 rounded-xl text-slate-700">
            Bạn là: <span className={`drop-shadow-sm ${role === 'X' ? 'text-red-500' : 'text-blue-500'}`}>{role}</span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-soft divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left: Board */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-slate-800 min-w-0">
          <CaroBoard 
            board={roomState.board}
            disabled={!isMyTurn || opponent === undefined || winner !== null}
            onMove={makeMove}
            onWinDetect={notifyWin}
            myRole={role}
            lastMove={lastMove}
          />

          {/* Waiting for Opponent Overlay */}
          {!opponent && !winner && (
            <div className="absolute inset-0 z-10 bg-slate-900/20 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300 rounded-3xl m-2 md:m-6">
              <div className="bg-white/95 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm border border-slate-200">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">Chờ đối thủ</h3>
                <p className="text-slate-500 font-medium text-sm">
                  Phòng đang chờ người thứ 2 tham gia... Gửi mã <span className="font-bold text-purple-600 px-1 bg-purple-50 rounded">#{params.roomId}</span> cho bạn bè nhé!
                </p>
              </div>
            </div>
          )}

          {/* Winner Overlay */}
          {winner && (
            <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-3xl p-8 xl:p-12 text-center shadow-2xl animate-in zoom-in slide-in-from-bottom-10 max-w-sm w-full">
                <div className="mx-auto w-20 h-20 bg-amber-100 text-amber-500 flex items-center justify-center rounded-full mb-6 relative">
                  <Trophy className="w-10 h-10" />
                  <div className="absolute -top-1 -right-1 text-2xl animate-bounce">👑</div>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Game Over!</h2>
                <p className="text-lg text-slate-600 mb-8 font-medium">
                  Người thắng: <span className="text-purple-600 font-bold">{winner.name}</span> 
                  ({winner.role})
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={restartGame}
                    className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" /> Chơi Lại Từ Đầu
                  </button>
                  <button 
                    onClick={handleBackNavigation}
                    className="block w-full py-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Rời Phòng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div className="w-full lg:w-[25%] xl:w-[20%] h-64 lg:h-full flex-shrink-0 flex flex-col min-w-0">
          <ChatBox 
            messages={messages}
            currentUserName={userName}
            onSendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}

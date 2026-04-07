"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCaroStore } from "../store/useCaroStore";
import { useCaroSocket } from "../hooks/useCaroSocket";
import PlayerModal from "./PlayerModal";
import { PlusCircle, Shuffle, Lock, Gamepad2, Users, Loader2 } from "lucide-react";

export default function RoomList() {
  const router = useRouter();
  const { userName } = useCaroStore();
  const { socket, rooms, createRoom, isConnected } = useCaroSocket();
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"create" | "joinRandom" | string | null>(null);

  useEffect(() => {
    if (!userName) setShowModal(true);
  }, [userName]);

  useEffect(() => {
    if (socket) {
      socket.on("room_joined", ({ roomId }) => {
        router.push(`/games/caro/${roomId}`);
      });
    }
    return () => {
      if (socket) socket.off("room_joined");
    };
  }, [socket, router]);

  const handleAction = (action: string) => {
    if (!userName) {
      setPendingAction(action);
      setShowModal(true);
      return;
    }
    executeAction(action);
  };

  const executeAction = (action: string) => {
    if (action === "create") {
      createRoom(userName);
    } else if (action === "joinRandom") {
      const waitRooms = rooms.filter(r => r.status === "waiting");
      if (waitRooms.length > 0) {
        const randomRoom = waitRooms[Math.floor(Math.random() * waitRooms.length)];
        router.push(`/games/caro/${randomRoom.roomId}`);
      } else {
        alert("Không có phòng nào đang chờ. Hãy tạo phòng mới!");
      }
    } else {
      // join specific room
      router.push(`/games/caro/${action}`);
    }
    setPendingAction(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      {showModal && (
        <PlayerModal onSave={() => {
          setShowModal(false);
          if (pendingAction) executeAction(pendingAction);
        }} />
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-purple-600" /> 
            Sảnh Chờ Cờ Caro
          </h1>
          <p className="text-slate-500 mt-2">Đăng nhập với tên: <span className="font-bold text-purple-600">{userName || "Khách"}</span></p>
        </div>
        
        <div className="flex items-center gap-4">
          {!isConnected && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl font-medium text-sm animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" /> Đang kết nối server...
            </div>
          )}
          <button 
            onClick={() => handleAction("joinRandom")}
            disabled={!isConnected}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${!isConnected ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            <Shuffle className="w-5 h-5" /> Vào Ngẫu Nhiên
          </button>
          <button 
            onClick={() => handleAction("create")}
            disabled={!isConnected}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${!isConnected ? 'bg-slate-300 text-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white shadow-purple-500/30'}`}
          >
            <PlusCircle className="w-5 h-5" /> Tạo Phòng Mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-soft">
            Chưa có phòng nào. Hãy là người đầu tiên tạo phòng!
          </div>
        ) : (
          rooms.map(room => (
            <div key={room.roomId} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col items-center text-center relative overflow-hidden group">
              <div className="bg-slate-50 p-4 rounded-xl mb-4 text-purple-600">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Phòng #{room.roomId}</h3>
              <p className="text-slate-500 mb-6">{room.playerCount}/2 Người chơi</p>
              
              {room.status === "full" ? (
                <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                  <Lock className="w-4 h-4" /> Đã Đầy
                </button>
              ) : (
                <button 
                  onClick={() => handleAction(room.roomId)}
                  className="w-full py-3 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-xl font-bold transition-all"
                >
                  Tham Gia Ngay
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

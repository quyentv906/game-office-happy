"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTankStore } from "../store/useTankStore";
import { useTankSocket } from "../hooks/useTankSocket";
import { PlusCircle, Shuffle, Lock, Gamepad2, Users, Target } from "lucide-react";

export default function TankLobby() {
  const router = useRouter();
  const { userName, vehicle, setUserName, setVehicle } = useTankStore();
  const { socket, rooms, createRoom } = useTankSocket();
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"create" | "joinRandom" | string | null>(null);

  const [tempName, setTempName] = useState(userName);
  const [tempVehicle, setTempVehicle] = useState(vehicle);

  useEffect(() => {
    if (!userName) setShowModal(true);
  }, [userName]);

  useEffect(() => {
    if (socket) {
      socket.on("tank_room_created", (roomId) => {
        router.push(`/games/tank/${roomId}`);
      });
    }
    return () => {
      if (socket) socket.off("tank_room_created");
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
      createRoom();
    } else if (action === "joinRandom") {
      const waitRooms = rooms.filter(r => !r.isLocked);
      if (waitRooms.length > 0) {
        const randomRoom = waitRooms[Math.floor(Math.random() * waitRooms.length)];
        router.push(`/games/tank/${randomRoom.roomId}`);
      } else {
        alert("Không có phòng đang chờ. Hãy tạo phòng mới!");
      }
    } else {
      router.push(`/games/tank/${action}`);
    }
    setPendingAction(null);
  };

  const saveProfile = () => {
    if (!tempName.trim()) return alert("Vui lòng nhập tên");
    setUserName(tempName.trim());
    setVehicle(tempVehicle);
    setShowModal(false);
    if (pendingAction) executeAction(pendingAction);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      {/* Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Target className="w-8 h-8 text-green-600" /> Hồ Sơ Của Bạn
            </h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tên hiển thị (Típ: Nhập "++Tên" để hack đạn)</label>
                <input 
                  type="text" 
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all font-medium text-slate-800"
                  placeholder="Nhập tên..."
                  maxLength={15}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Chọn Phương Tiện</label>
                <select 
                  value={tempVehicle} 
                  onChange={(e: any) => setTempVehicle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all font-medium text-slate-800 bg-white"
                >
                  <option value="tank">Xe Tăng</option>
                  <option value="airplane">Máy Bay</option>
                </select>
              </div>
            </div>
            <button 
              onClick={saveProfile}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02]"
            >
              Xác Nhận & Bắt Đầu
            </button>
          </div>
        </div>
      )}

      {/* Lobby Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-green-600" /> Sảnh Bắn Tăng
          </h1>
          <p className="text-slate-500 mt-2">Đăng nhập: <span className="font-bold text-green-600 cursor-pointer hover:underline" onClick={() => setShowModal(true)}>{userName || "Khách"} ({vehicle})</span></p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleAction("joinRandom")}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all"
          >
            <Shuffle className="w-5 h-5" /> Vào Ngẫu Nhiên
          </button>
          <button 
            onClick={() => handleAction("create")}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all"
          >
            <PlusCircle className="w-5 h-5" /> Tạo Phòng
          </button>
        </div>
      </div>

      {/* Rooms list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-soft">
            Chưa có phòng nào. Hãy tạo phòng mới!
          </div>
        ) : (
          rooms.map(room => (
            <div key={room.roomId} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col items-center text-center relative overflow-hidden group">
              <div className="bg-slate-50 p-4 rounded-xl mb-4 text-green-600">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Phòng #{room.roomId}</h3>
              <p className="text-slate-500 mb-6">{room.playerCount}/6 Người chơi</p>
              
              {room.isLocked ? (
                <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                  <Lock className="w-4 h-4" /> Đã Đầy / Đang Chơi
                </button>
              ) : (
                <button 
                  onClick={() => handleAction(room.roomId)}
                  className="w-full py-3 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-xl font-bold transition-all"
                >
                  Tham Gia
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

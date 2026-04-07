"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

export interface TankPlayer {
  id: string;
  name: string;
  vehicle: 'tank' | 'airplane' | 'soldier';
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  hp: number;
  score: number;
  isDead: boolean;
  invincible: boolean;
}

export interface Bullet {
  ownerId: string;
  x: number;
  y: number;
  angle: number;
}

export interface Obstacle {
  id: string;
  type: 'rock' | 'tree' | 'grass' | 'ball' | 'basketball' | `billiard_${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
}

export interface GameState {
  players: Record<string, TankPlayer>;
  bullets: Bullet[];
  obstacles: Obstacle[];
}

export interface TankRoom {
  roomId: string;
  playerCount: number;
  maxPlayers: number;
  mapType: string;
  isLocked: boolean;
}

const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
let tankSocket: Socket | null = null;

export function useTankSocket(roomId?: string, userName?: string, vehicle?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<TankRoom[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [errorEvent, setErrorEvent] = useState<string | null>(null);
  const [mapDef, setMapDef] = useState<{width: number, height: number, type?: string, maxPlayers?: number} | null>(null);
  const [eventLog, setEventLog] = useState<{msg: string, id: number}[]>([]);

  useEffect(() => {
    if (!tankSocket) {
      tankSocket = io(socketURL);
    }
    const currentSocket = tankSocket;
    setSocket(currentSocket);

    currentSocket.on("tank_room_list", (data: TankRoom[]) => {
      setRooms(data);
    });

    currentSocket.on("tank_error", (err: string) => {
      setErrorEvent(err);
    });

    if (!roomId) {
      currentSocket.emit("tank_get_rooms");
    } else if (roomId && userName && vehicle) {
      // Trying to join room
      currentSocket.emit("tank_join", { roomId, name: userName, vehicle });

      currentSocket.on("tank_joined", ({ roomId: joinedRoom, myId: pId, map }) => {
        setMyId(pId);
        setMapDef(map);
      });

      currentSocket.on("tank_state", (state: GameState) => {
        setGameState(state);
      });

      currentSocket.on("tank_event", (ev: any) => {
        if (ev.type === 'kill') {
           setEventLog(prev => [...prev, { msg: `Người chơi đã bị tiêu diệt!`, id: Date.now() }]);
        }
      });
    }

    return () => {
      currentSocket.off("tank_room_list");
      currentSocket.off("tank_joined");
      currentSocket.off("tank_state");
      currentSocket.off("tank_event");
      currentSocket.off("tank_error");
    };
  }, [roomId, userName, vehicle]);

  const createRoom = (options?: { maxPlayers: number; mapType: string }) => {
    if (tankSocket) {
      tankSocket.emit("tank_create_room", options);
    }
  };

  const leaveRoom = () => {
    if (tankSocket) {
      tankSocket.emit("tank_leave");
    }
  };

  const sendInput = (vx?: number, vy?: number, angle?: number, targetX?: number, targetY?: number) => {
    if (tankSocket) {
      tankSocket.emit("tank_input", { vx, vy, angle, targetX, targetY });
    }
  };

  const shoot = () => {
    if (tankSocket && roomId) {
      tankSocket.emit("tank_shoot");
    }
  };

  return {
    socket,
    rooms,
    gameState,
    myId,
    errorEvent,
    mapDef,
    eventLog,
    createRoom,
    leaveRoom,
    sendInput,
    shoot
  };
}

"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { PlayerRole } from "../utils/checkWin";

export interface ChatMessage {
  userName: string;
  msg: string;
}

export interface RoomState {
  players: { id: string; name: string; role: PlayerRole }[];
  board: PlayerRole[][];
  turn: PlayerRole;
}

const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
let socketInstance: Socket | null = null;

export function useCaroSocket(roomId?: string, userName?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [role, setRole] = useState<PlayerRole>(null);
  const [winner, setWinner] = useState<{name: string, role: string} | null>(null);
  const [lastMove, setLastMove] = useState<{ row: number, col: number } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorEvent, setErrorEvent] = useState<string | null>(null);

  useEffect(() => {
    // Initialize single socket connection
    if (!socketInstance) {
      socketInstance = io(socketURL);
    }
    const currentSocket = socketInstance;
    setSocket(currentSocket);

    // Common listeners
    currentSocket.on("room_list", (data) => {
      setRooms(data);
    });

    currentSocket.on("error", (err) => {
      setErrorEvent(err);
    });

    if (!roomId) {
      // We are in the lobby
      currentSocket.emit("get_rooms");
    } else if (roomId && userName) {
      // In a specific room, either creating or joining
      // But wait! Creating and Joining is explicitly triggered by buttons in room list, 
      // not automatically upon load, unless we are directly navigating.
      // So if it's direct navigation, we try to join.
      currentSocket.emit("join_room", { roomId, userName });

      currentSocket.on("room_joined", ({ roomState: state, role: myRole }) => {
        setRoomState(state);
        if (myRole) setRole(myRole); // Creator gets role here
      });

      currentSocket.on("your_role", (myRole) => {
        setRole(myRole); // Joiner gets role here
      });

      currentSocket.on("move_made", ({ row, col, role: pRole, nextTurn }) => {
        setRoomState((prev) => {
          if (!prev) return prev;
          const newBoard = prev.board.map(r => [...r]);
          newBoard[row][col] = pRole;
          return { ...prev, board: newBoard, turn: nextTurn };
        });
        setLastMove({ row, col });
      });

      currentSocket.on("new_message", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      currentSocket.on("game_over", ({ winnerName, winnerRole }) => {
        setWinner({ name: winnerName, role: winnerRole });
      });

      currentSocket.on("game_restarted", ({ roomState: state }) => {
        setRoomState(state);
        setWinner(null);
        setLastMove(null);
      });

      currentSocket.on("player_left", ({ playerName }) => {
        setMessages((prev) => [...prev, { userName: "Hệ thống", msg: `${playerName} đã rời phòng.` }]);
      });
    }

    return () => {
      currentSocket.off("room_list");
      currentSocket.off("room_joined");
      currentSocket.off("your_role");
      currentSocket.off("move_made");
      currentSocket.off("new_message");
      currentSocket.off("game_over");
      currentSocket.off("game_restarted");
      currentSocket.off("player_left");
      currentSocket.off("error");
    };
  }, [roomId, userName]);

  const createRoom = (name: string) => {
    if (socketInstance) {
      socketInstance.emit("create_room", { userName: name });
    }
  };

  const makeMove = (row: number, col: number) => {
    if (socketInstance && roomId) {
      socketInstance.emit("make_move", { roomId, row, col });
    }
  };

  const notifyWin = (winnerRole: string) => {
    if (socketInstance && roomId) {
      socketInstance.emit("game_win", { roomId, winnerRole });
    }
  };

  const sendMessage = (msg: string) => {
    if (socketInstance && roomId && userName) {
      socketInstance.emit("chat_message", { roomId, userName, msg });
    }
  };

  const restartGame = () => {
    if (socketInstance && roomId) {
      socketInstance.emit("req_restart", { roomId });
    }
  };

  const leaveRoom = () => {
    if (socketInstance && roomId) {
      socketInstance.emit("leave_room", { roomId });
    }
  };

  return {
    socket,
    rooms,
    roomState,
    role,
    winner,
    messages,
    errorEvent,
    makeMove,
    notifyWin,
    sendMessage,
    createRoom,
    restartGame,
    leaveRoom,
    lastMove
  };
}

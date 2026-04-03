"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

// Placeholder singleton for future connection
class SocketService {
  private socket: Socket | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (!this.socket) {
      console.log("[Socket] Connecting to realtime server...");
      // In reality, this would be: this.socket = io(this.url, { transports: ["websocket"] });
      // We are just stubbing it here to avoid errors since there is no server yet.
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("[Socket] Disconnected.");
    }
  }

  // Define emit/on as needed for realtime game features.
}

const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
export const socketService = new SocketService(socketURL);

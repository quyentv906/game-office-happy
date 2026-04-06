const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

require('./tankIo')(io);

/**
 * Game state:
 * rooms = {
 *   [roomId]: {
 *     players: [{ id: socketId, name: string, role: "X" | "O" }],
 *     board: [50][30] array of null | "X" | "O",
 *     turn: "X" | "O"
 *   }
 * }
 */
const rooms = {};
const BOARD_ROWS = 30;
const BOARD_COLS = 50;

function createEmptyBoard() {
  return Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
}

io.on('connection', (socket) => {
  console.log(`[+] User connected: ${socket.id}`);

  // 1. Get room list
  socket.on('get_rooms', () => {
    const roomList = Object.keys(rooms).map(roomId => ({
      roomId,
      playerCount: rooms[roomId].players.length,
      status: rooms[roomId].players.length >= 2 ? 'full' : 'waiting'
    }));
    socket.emit('room_list', roomList);
  });

  // 2. Create room
  socket.on('create_room', ({ userName }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[roomId] = {
      players: [{ id: socket.id, name: userName, role: 'X' }],
      board: createEmptyBoard(),
      turn: 'X',
    };
    socket.join(roomId);
    socket.emit('room_joined', { roomId, role: 'X', roomState: rooms[roomId] });
    io.emit('room_list', getRoomList());
  });

  // 3. Join room
  socket.on('join_room', ({ roomId, userName }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit('error', 'Phòng không tồn tại');
      return;
    }

    // Check if player is already in this room (prevent double joining from React Strict Mode)
    const existingPlayer = room.players.find(p => p.id === socket.id);
    if (existingPlayer) {
      socket.join(roomId);
      socket.emit('room_joined', { roomId, roomState: room });
      socket.emit('your_role', existingPlayer.role);
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', 'Phòng đã đầy');
      return;
    }

    let newRole = 'X';
    if (room.players.length === 1) {
      newRole = room.players[0].role === 'X' ? 'O' : 'X';
    }

    room.players.push({ id: socket.id, name: userName, role: newRole });
    socket.join(roomId);

    // Broadcast state to everyone in the room
    io.to(roomId).emit('room_joined', { roomId, roomState: room });
    // Tell the new player his role
    socket.emit('your_role', newRole);

    io.emit('room_list', getRoomList());
  });

  // Handle explicit leave_room
  socket.on('leave_room', ({ roomId }) => {
    leaveRoomForSocket(socket.id, roomId);
  });

  // 4. Make Move
  socket.on('make_move', ({ roomId, row, col }) => {
    const room = rooms[roomId];
    if (room && room.board[row][col] === null) {
      const player = room.players.find(p => p.id === socket.id);
      if (player && player.role === room.turn) {
        // Apply move
        room.board[row][col] = player.role;
        // Swap turn
        room.turn = room.turn === 'X' ? 'O' : 'X';
        io.to(roomId).emit('move_made', { row, col, role: player.role, nextTurn: room.turn });
      }
    }
  });

  // 5. Game Win
  socket.on('game_win', ({ roomId, winnerRole }) => {
    const room = rooms[roomId];
    if (room) {
      const winner = room.players.find(p => p.role === winnerRole);
      io.to(roomId).emit('game_over', { winnerName: winner ? winner.name : 'Unknown', winnerRole });
    }
  });

  // Reset Game
  socket.on('req_restart', ({ roomId }) => {
    const room = rooms[roomId];
    if (room) {
      room.board = createEmptyBoard();
      // Loser goes first or random, let's just make 'X' start again
      room.turn = 'X';
      io.to(roomId).emit('game_restarted', { roomState: room });
    }
  });

  // 6. Chat Msg
  socket.on('chat_message', ({ roomId, userName, msg }) => {
    io.to(roomId).emit('new_message', { userName, msg });
  });

  // 7. Disconnect / Leave
  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      leaveRoomForSocket(socket.id, roomId);
    }
    console.log(`[-] User disconnected: ${socket.id}`);
  });

  function leaveRoomForSocket(socketId, roomId) {
    const room = rooms[roomId];
    if (!room) return;

    const playerIdx = room.players.findIndex(p => p.id === socketId);
    if (playerIdx !== -1) {
      const pName = room.players[playerIdx].name;
      room.players.splice(playerIdx, 1);
      
      const s = io.sockets.sockets.get(socketId);
      if (s) s.leave(roomId);

      // Reset game board if someone leaves and only 1 player remains
      if (room.players.length === 1) {
        room.board = createEmptyBoard();
        room.turn = 'X';
      }

      // Notify others
      io.to(roomId).emit('player_left', { playerName: pName, reason: "disconnected" });
      io.to(roomId).emit('room_joined', { roomId, roomState: room }); // update players list

      // Destroy room if empty after a short grace period
      if (room.players.length === 0) {
        setTimeout(() => {
          if (rooms[roomId] && rooms[roomId].players.length === 0) {
            delete rooms[roomId];
            io.emit('room_list', getRoomList());
          }
        }, 60000);
      } else {
        io.emit('room_list', getRoomList());
      }
    }
  }
});

function getRoomList() {
  return Object.keys(rooms).map(roomId => ({
    roomId,
    playerCount: rooms[roomId].players.length,
    status: rooms[roomId].players.length >= 2 ? 'full' : 'waiting'
  }));
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO Server is running on port ${PORT}`);
});

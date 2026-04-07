const { v4: uuidv4 } = require('crypto'); // We can use socket.id for bullets or simple id

const MAP_WIDTH = 2500;
const MAP_HEIGHT = 2000;
const FPS = 60;
const INTERVAL_MS = 1000 / FPS;
const MAX_PLAYERS = 6;

const SPAWN_POINTS = [
  { x: 150, y: 150 },
  { x: MAP_WIDTH - 150, y: 150 },
  { x: 150, y: MAP_HEIGHT - 150 },
  { x: MAP_WIDTH - 150, y: MAP_HEIGHT - 150 },
  { x: MAP_WIDTH / 2, y: 150 },
  { x: MAP_WIDTH / 2, y: MAP_HEIGHT - 150 }
];

const rooms = {};

// Helper: Collision Circle
function checkCircleCollision(x1, y1, r1, x2, y2, r2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return (dx*dx) + (dy*dy) <= (r1 + r2) * (r1 + r2);
}

function generateObstacles(mapType) {
  const obstacles = [];
  for (let i = 0; i < 20; i++) {
    let type = 'rock';
    if (mapType === 'billiard') {
      const num = Math.floor(Math.random() * 9) + 1;
      type = `billiard_${num}`;
    } else if (mapType === 'basketball') {
      type = 'basketball';
    } else if (mapType === 'football') {
      type = 'ball'; // Chỉ render bóng
    } else {
      type = Math.random() > 0.5 ? 'rock' : 'tree';
    }
    // Size approx 160x160 (double from before)
    const x = Math.random() * (MAP_WIDTH - 400) + 200;
    const y = Math.random() * (MAP_HEIGHT - 400) + 200;
    obstacles.push({
      id: Math.random().toString(36).substr(2, 9),
      type,
      x,
      y,
      width: 160,
      height: 160,
      hp: 5 
    });
  }
  return obstacles;
}

function updateRoom(roomId, io) {
  const room = rooms[roomId];
  if (!room) return;

  const packets = [];
  const now = Date.now();

  // Update Bullets
  for (let i = room.bullets.length - 1; i >= 0; i--) {
    const b = room.bullets[i];
    b.x += Math.cos(b.angle) * b.speed;
    b.y += Math.sin(b.angle) * b.speed;
    b.life--;

    // Collision with bounds
    if (b.x < 0 || b.x > MAP_WIDTH || b.y < 0 || b.y > MAP_HEIGHT || b.life <= 0) {
      room.bullets.splice(i, 1);
      continue;
    }

    let hit = false;
    
    // Collision with Obstacles
    for (let j = room.obstacles.length - 1; j >= 0; j--) {
      const obs = room.obstacles[j];
      // obs hitbox
      const hitRadius = 35;
      if (checkCircleCollision(b.x, b.y, 5, obs.x, obs.y, hitRadius)) {
        obs.hp--;
        if (obs.hp <= 0) room.obstacles.splice(j, 1);
        room.bullets.splice(i, 1);
        hit = true;
        break;
      }
    }
    if (hit) continue;

    // Collision with Players
    for (const pId in room.players) {
      const target = room.players[pId];
      if (target.isDead || target.id === b.ownerId || target.invincible) continue;
      
      // Player radius 15, bullet radius 5
      if (checkCircleCollision(b.x, b.y, 5, target.x, target.y, 15)) {
        target.hp--;
        room.bullets.splice(i, 1);
        hit = true;

        if (target.hp <= 0) {
          target.isDead = true;
          target.respawnTime = now + 3000;
          
          // Move immediately to spawn location
          const spawn = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
          target.x = spawn.x;
          target.y = spawn.y;
          target.vx = 0;
          target.vy = 0;

          if (room.players[b.ownerId]) {
            room.players[b.ownerId].score++;
          }

          io.to(roomId).emit('tank_event', { type: 'kill', killer: b.ownerId, killed: target.id, x: target.x, y: target.y });
        }
        break;
      }
    }
  }

  // Update Players
  for (const pId in room.players) {
    const p = room.players[pId];

    if (p.isDead) {
      if (now > p.respawnTime) {
        // Respawn
        p.isDead = false;
        p.hp = 5;
        p.invincible = true;
      }
      continue;
    }

    const speed = 5;

    if (p.targetX !== undefined && p.targetY !== undefined) {
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= speed) {
        p.x = p.targetX;
        p.y = p.targetY;
        p.vx = 0;
        p.vy = 0;
        p.targetX = undefined;
        p.targetY = undefined;
      } else {
        p.vx = dx / dist;
        p.vy = dy / dist;
      }
    }

    const newX = p.x + p.vx * speed;
    const newY = p.y + p.vy * speed;

    let collisionX = false;
    let collisionY = false;
    
    // Physics collision with objects (Circles)
    // tank radius 15, obstacles radius
    for (const obs of room.obstacles) {
      const hitRadius = 35;
      if (checkCircleCollision(newX, p.y, 15, obs.x, obs.y, hitRadius)) { collisionX = true; break; }
    }
    
    for (const obs of room.obstacles) {
      const hitRadius = 35;
      if (checkCircleCollision(p.x, newY, 15, obs.x, obs.y, hitRadius)) { collisionY = true; break; }
    }

    // Map bounds check and apply X
    if (!collisionX) {
      if (newX > 30 && newX < MAP_WIDTH - 30) p.x = newX;
    } else {
      if (p.targetX !== undefined) p.targetX = undefined;
    }

    // Bounds check and apply Y
    if (!collisionY) {
      if (newY > 30 && newY < MAP_HEIGHT - 30) p.y = newY;
    } else {
      if (p.targetY !== undefined) p.targetY = undefined;
    }

    // Remove invincibility if moved
    if (p.invincible && (p.vx !== 0 || p.vy !== 0)) {
      p.invincible = false;
    }
  }

  // Obstacle respawn
  if (now > room.lastObstacleSpawn + 15000) {
    if (room.obstacles.length < 20) {
      room.obstacles.push(...generateObstacles(room.mapType).slice(0, 5));
    }
    room.lastObstacleSpawn = now;
  }

  // Broadcast state
  io.to(roomId).emit('tank_state', {
    players: room.players,
    bullets: room.bullets,
    obstacles: room.obstacles
  });
}

module.exports = (io) => {
  // We use the same io server, but listen to tank events
  
  // Game Loop
  setInterval(() => {
    for (const roomId in rooms) {
      updateRoom(roomId, io);
    }
  }, INTERVAL_MS);

  function broadcastRoomList() {
    const list = Object.keys(rooms).map(id => ({
      roomId: id,
      playerCount: Object.keys(rooms[id].players).length,
      maxPlayers: rooms[id].maxPlayers,
      mapType: rooms[id].mapType,
      isLocked: rooms[id].isLocked
    }));
    io.emit('tank_room_list', list);
  }

  io.on('connection', (socket) => {
    socket.on('tank_get_rooms', () => {
      broadcastRoomList();
    });

    socket.on('tank_create_room', (options) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const mapType = options?.mapType || 'football';
      rooms[roomId] = {
        id: roomId,
        maxPlayers: options?.maxPlayers || 5,
        mapType: mapType,
        players: {},
        bullets: [],
        obstacles: generateObstacles(mapType),
        isLocked: false,
        lastObstacleSpawn: Date.now()
      };
      socket.emit('tank_room_created', roomId);
      broadcastRoomList();
    });

    socket.on('tank_join', ({ roomId, name, vehicle }) => {
      const room = rooms[roomId];
      if (!room) {
        socket.emit('tank_error', 'Phòng không tồn tại');
        return;
      }
      if (room.isLocked || Object.keys(room.players).length >= room.maxPlayers) {
        socket.emit('tank_error', 'Phòng đã đầy hoặc bị khóa');
        return;
      }

      socket.join(roomId);
      socket.tankRoomId = roomId;

      const spawn = SPAWN_POINTS[Object.keys(room.players).length % SPAWN_POINTS.length];

      room.players[socket.id] = {
        id: socket.id,
        name,
        vehicle, // tank, airplane, soldier
        x: spawn.x,
        y: spawn.y,
        vx: 0,
        vy: 0,
        angle: 0,
        hp: 5,
        score: 0,
        isDead: false,
        invincible: true,
        respawnTime: 0
      };

      if (Object.keys(room.players).length === room.maxPlayers) {
        room.isLocked = true;
      }

      socket.emit('tank_joined', { roomId, myId: socket.id, map: { width: MAP_WIDTH, height: MAP_HEIGHT, type: room.mapType, maxPlayers: room.maxPlayers }});
      broadcastRoomList();
    });

    socket.on('tank_input', ({ vx, vy, angle, targetX, targetY }) => {
      const room = rooms[socket.tankRoomId];
      if (!room) return;
      const p = room.players[socket.id];
      if (!p || p.isDead) return;

      if (targetX !== undefined && targetY !== undefined) {
        p.targetX = targetX;
        p.targetY = targetY;
      }

      if (vx !== undefined && vy !== undefined) {
        p.vx = vx;
        p.vy = vy;
        p.targetX = undefined;
        p.targetY = undefined;
      }
      if (angle !== undefined) p.angle = angle;
    });

    socket.on('tank_shoot', () => {
      const room = rooms[socket.tankRoomId];
      if (!room) return;
      const p = room.players[socket.id];
      if (!p || p.isDead) return;

      const bulletSpeed = 20;

      // HACK: Double bullet if name starts with ++
      const isHack = p.name.startsWith('++');

      if (isHack) {
        room.bullets.push({
          ownerId: socket.id,
          x: p.x + Math.cos(p.angle - 0.2) * 50,
          y: p.y + Math.sin(p.angle - 0.2) * 50,
          angle: p.angle,
          speed: bulletSpeed,
          life: 80
        });
        room.bullets.push({
          ownerId: socket.id,
          x: p.x + Math.cos(p.angle + 0.2) * 50,
          y: p.y + Math.sin(p.angle + 0.2) * 50,
          angle: p.angle,
          speed: bulletSpeed,
          life: 80
        });
      } else {
        room.bullets.push({
          ownerId: socket.id,
          x: p.x + Math.cos(p.angle) * 50,
          y: p.y + Math.sin(p.angle) * 50,
          angle: p.angle,
          speed: bulletSpeed,
          life: 80
        });
      }
    });

    socket.on('tank_leave', () => {
      handleDisconnect(socket);
    });

    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });

  function handleDisconnect(socket) {
    if (!socket.tankRoomId) return;
    const roomId = socket.tankRoomId;
    const room = rooms[roomId];
    if (room) {
      delete room.players[socket.id];
      socket.leave(roomId);
      
      if (Object.keys(room.players).length === 0) {
        setTimeout(() => {
          if (rooms[roomId] && Object.keys(rooms[roomId].players).length === 0) {
            delete rooms[roomId];
            broadcastRoomList();
          }
        }, 10000); // 10s grace period for re-joining
      } else {
        room.isLocked = false;
        broadcastRoomList();
      }
    }
    socket.tankRoomId = null;
  }
};

"use client";

import { useEffect, useRef, useState } from "react";
import { GameState } from "../hooks/useTankSocket";

interface GameCanvasProps {
  gameState: GameState;
  mapDef: { width: number; height: number };
  myId: string;
  sendInput: (vx?: number, vy?: number, angle?: number, targetX?: number, targetY?: number) => void;
  shoot: () => void;
  showMinimap?: boolean;
}

export default function GameCanvas({ gameState, mapDef, myId, sendInput, shoot, showMinimap = true }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const reqRef = useRef<number>();

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const images = useRef<Record<string, HTMLImageElement>>({});

  const keys = useRef<{ [key: string]: boolean }>({});
  const mouseAngle = useRef<number>(0);

  // Load images hook
  useEffect(() => {
    const assetSources = {
      tank: "/images/tank.png",
      airplane: "/images/airplane.png",
      soldier: "/images/soldier.png",
      rock: "/images/rock.png",
      tree: "/images/tree.png",
    };

    let count = 0;
    const expected = Object.keys(assetSources).length;

    Object.entries(assetSources).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        images.current[key] = img;
        count++;
        if (count === expected) setImagesLoaded(true);
      };
      // Fallback for missing images
      img.onerror = () => {
        console.warn(`Could not load ${src}, using fallback geometric rendering`);
        count++;
        if (count === expected) setImagesLoaded(true);
      };
    });
  }, []);

  // Controls bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; updateInput(); };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; updateInput(); };
    
    // Using simple boolean keys
    const updateInput = () => {
      let vx = 0, vy = 0;
      if (keys.current['w'] || keys.current['arrowup']) vy = -1;
      if (keys.current['s'] || keys.current['arrowdown']) vy = 1;
      if (keys.current['a'] || keys.current['arrowleft']) vx = -1;
      if (keys.current['d'] || keys.current['arrowright']) vx = 1;
      
      // Normalize diagonals
      if (vx !== 0 && vy !== 0) {
        vx *= 0.707;
        vy *= 0.707;
      }
      sendInput(vx, vy, mouseAngle.current);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const me = gameState.players[myId];
      if (!me) return;

      // Mouse position relative to center of screen (where our player is)
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      
      mouseAngle.current = Math.atan2(e.clientY - rect.top - cy, e.clientX - rect.left - cx);
      sendInput(undefined, undefined, mouseAngle.current);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        shoot();
      } else if (e.button === 2) {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const me = gameState.players[myId];
        if (!me) return;

        const screenW = canvasRef.current.width;
        const screenH = canvasRef.current.height;
        let camX = mapDef.width / 2;
        let camY = mapDef.height / 2;

        if (screenW < mapDef.width) {
          camX = Math.max(screenW / 2, Math.min(mapDef.width - screenW / 2, me.x));
        }
        if (screenH < mapDef.height) {
          camY = Math.max(screenH / 2, Math.min(mapDef.height - screenH / 2, me.y));
        }

        const offsetX = screenW / 2 - camX;
        const offsetY = screenH / 2 - camY;

        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const targetX = clickX - offsetX;
        const targetY = clickY - offsetY;

        sendInput(undefined, undefined, mouseAngle.current, targetX, targetY);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    
    const canvas = canvasRef.current;
    if (canvas) canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      if (canvas) canvas.removeEventListener('contextmenu', handleContextMenu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.players[myId]?.x]); // rebind if needed, but refs keep values

  // Prerender Background grid (Vở 5 Ô ly)
  useEffect(() => {
    if (!bgRef.current) return;
    const ctx = bgRef.current.getContext('2d');
    if (!ctx) return;
    
    bgRef.current.width = mapDef.width;
    bgRef.current.height = mapDef.height;
    
    // 1. Paper background
    ctx.fillStyle = '#FDFBF7';
    ctx.fillRect(0, 0, mapDef.width, mapDef.height);

    // 2. Notebook O-ly grid (lines)
    const gridSize = 40;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#D1E4F2';

    ctx.beginPath();
    // Vertical lines
    for (let x = 0; x <= mapDef.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mapDef.height);
    }
    // Horizontal lines
    for (let y = 0; y <= mapDef.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(mapDef.width, y);
    }
    ctx.stroke();

    // Bold lines for 5-oly groupings
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#AECBEB';
    ctx.beginPath();
    for (let x = 0; x <= mapDef.width; x += gridSize * 5) {
      ctx.moveTo(x, 0); ctx.lineTo(x, mapDef.height);
    }
    for (let y = 0; y <= mapDef.height; y += gridSize * 5) {
      ctx.moveTo(0, y); ctx.lineTo(mapDef.width, y);
    }
    ctx.stroke();

    // 3. Red margin line
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFADAD'; // red margin
    ctx.beginPath();
    ctx.moveTo(gridSize * 3, 0);
    ctx.lineTo(gridSize * 3, mapDef.height);
    ctx.stroke();

    // 4. Draw Province Names
    const provinces = [
      "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", 
      "Huế", "Nha Trang", "Đà Lạt", "Vũng Tàu", "Hội An", "Sapa", 
      "Hạ Long", "Ninh Bình", "Vinh", "Cà Mau", "Biên Hòa"
    ];
    ctx.fillStyle = 'rgba(20, 50, 150, 0.12)'; // pale ink
    ctx.font = 'italic 36px "Comic Sans MS", cursive, sans-serif'; 
    ctx.textAlign = 'center';
    
    // Seeded random text
    for (let i = 0; i < mapDef.width; i += 450) {
      for (let j = 0; j < mapDef.height; j += 350) {
        if ((i + j) % 3 === 0) { 
           // Arbitrary pseudo-random but deterministic placement
           const index = Math.floor(((i * 13) + (j * 7)) % provinces.length);
           const text = provinces[index];
           ctx.save();
           ctx.translate(i + 200, j + 150);
           ctx.rotate(-0.1); 
           ctx.fillText(text, 0, 0);
           ctx.restore();
        }
      }
    }

    // 5. Map bounds walls (Wooden desk border)
    ctx.strokeStyle = '#8B5A2B'; 
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, mapDef.width, mapDef.height);

  }, [mapDef]);

  // Main Render Loop
  useEffect(() => {
    if (!canvasRef.current || !imagesLoaded || !bgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Fix scaling for DPI
    const resizeInfo = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeInfo();
    window.addEventListener('resize', resizeInfo);

    const render = () => {
      // Find me to center camera
      const me = gameState.players[myId];
      // Default camera center if missing
      let camX = mapDef.width / 2;
      let camY = mapDef.height / 2;

      const screenW = canvas.width;
      const screenH = canvas.height;

      if (me) {
        if (screenW >= mapDef.width) {
          camX = mapDef.width / 2;
        } else {
          camX = Math.max(screenW / 2, Math.min(mapDef.width - screenW / 2, me.x));
        }

        if (screenH >= mapDef.height) {
          camY = mapDef.height / 2;
        } else {
          camY = Math.max(screenH / 2, Math.min(mapDef.height - screenH / 2, me.y));
        }
      }

      const offsetX = screenW / 2 - camX;
      const offsetY = screenH / 2 - camY;

      // 1. Draw Background relative to camera
      ctx.fillStyle = '#1e293b'; // offmap dark
      ctx.fillRect(0, 0, screenW, screenH);
      if (bgRef.current) {
        ctx.drawImage(bgRef.current, offsetX, offsetY);
      }

      ctx.save();
      ctx.translate(offsetX, offsetY);

      // --- Draw Obstacles ---
      for (const obs of gameState.obstacles) {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        const obsImg = images.current[obs.type];
        if (obsImg) {
          ctx.drawImage(obsImg, -obs.width/2, -obs.height/2, obs.width, obs.height);
        }

        // --- DEBUG HITBOX (Obstacle) ---
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        // ----------------------------- 

        if (!obsImg) {
          // Fallback
          ctx.fillStyle = obs.type === 'rock' ? '#64748b' : '#15803d';
          ctx.beginPath();
          ctx.arc(0, 0, obs.width/2, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- Draw Players ---
      for (const pId in gameState.players) {
        const p = gameState.players[pId];
        if (p.isDead) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        
        // Render name tag & hp bar above player
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-30, -50, 60, 20);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, 0, -42);
        
        // HP Bar
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-28, -38, 56, 6);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-28, -38, (56 * p.hp) / 5, 6);

        // Render Invincible shield
        if (p.invincible) {
          ctx.beginPath();
          ctx.arc(0, 0, 40, 0, Math.PI*2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        ctx.rotate(p.angle);

        const pImg = images.current[p.vehicle];
        if (pImg) {
          ctx.drawImage(pImg, -40, -40, 80, 80);
        }

        // --- DEBUG HITBOX (Player) ---
        ctx.fillStyle = 'rgba(0, 0, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        // ----------------------------- 

        if (!pImg) {
          // Geometric Fallback: Draw tank
          ctx.fillStyle = '#333';
          ctx.fillRect(-20, -25, 40, 50); // body
          ctx.fillStyle = '#666';
          ctx.fillRect(0, -5, 45, 10); // turret barrel
          ctx.fillStyle = '#444';
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI*2); // turret base
          ctx.fill();
        }

        ctx.restore();
      }

      // --- Draw Bullets ---
      for (const b of gameState.bullets) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        
        // Bullet trail/shape
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-8, -4, 16, 8);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(8, 0, 4, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();

      // --- Draw Minimap UI Overlay ---
      if (showMinimap) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to screen space
        const mapSize = 250;
        const ratio = mapSize / Math.max(mapDef.width, mapDef.height);
        const miniW = mapDef.width * ratio;
        const miniH = mapDef.height * ratio;
        const padding = 20;
        
        const miniX = canvas.width - miniW - padding;
        const miniY = canvas.height - miniH - padding;

        // Minimap Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(miniX, miniY, miniW, miniH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(miniX, miniY, miniW, miniH);

        // Minimap Obstacles
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        for (const obs of gameState.obstacles) {
          ctx.fillRect(
             miniX + (obs.x - obs.width/2) * ratio, 
             miniY + (obs.y - obs.height/2) * ratio, 
             obs.width * ratio, 
             obs.height * ratio
          );
        }

        // Minimap Players
        for (const pId in gameState.players) {
          const p = gameState.players[pId];
          if (p.isDead) continue;
          
          ctx.beginPath();
          const px = miniX + p.x * ratio;
          const py = miniY + p.y * ratio;
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          
          ctx.fillStyle = pId === myId ? '#22c55e' : '#ef4444'; 
          ctx.fill();
        }
      }

      reqRef.current = requestAnimationFrame(render);
    };

    reqRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeInfo);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameState, mapDef, myId, imagesLoaded]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      <canvas ref={bgRef} style={{ display: 'none' }} />
    </>
  );
}

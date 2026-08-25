import React, { useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { SceneDef, SceneId, HotspotDef } from '../../types/homeWorld';
import { SCENE_DEFS, npcById } from '../../core/HomeWorldData';

const VW = 640;
const VH = 420;
const GROUND_Y = 372;

interface PovSceneViewProps {
  scene: SceneDef;
  /** NPC ids that currently have an available task marker. */
  taskNpcIds: string[];
  onEnterScene: (id: SceneId) => void;
  onExit: () => void;
  onTalk: (npcId: string) => void;
  onAction: (actionId: string) => void;
}

interface FacadeStyle {
  wall: string;
  roof: string;
  trim: string;
  sign: string;
}

const FACADE_STYLES: Record<string, FacadeStyle> = {
  shop: { wall: '#4c1d95', roof: '#2e1065', trim: '#c4b5fd', sign: 'PARTS STORE' },
  bank: { wall: '#334155', roof: '#1e293b', trim: '#fcd34d', sign: 'BANK' },
  gym: { wall: '#7f1d1d', roof: '#450a0a', trim: '#fca5a5', sign: 'GYM' },
  trophy: { wall: '#713f12', roof: '#422006', trim: '#fde047', sign: 'HALL OF HONORS' },
  greenhouse: { wall: '#14532d', roof: '#052e16', trim: '#86efac', sign: 'GREENHOUSE' },
  warehouse: { wall: '#44403c', roof: '#292524', trim: '#fdba74', sign: 'WAREHOUSE' },
  hangar: { wall: '#0c4a6e', roof: '#082f49', trim: '#7dd3fc', sign: 'HANGAR' },
  command: { wall: '#1e3a8a', roof: '#172554', trim: '#67e8f9', sign: 'COMMAND CENTER' },
};

export const PovSceneView: React.FC<PovSceneViewProps> = ({
  scene,
  taskNpcIds,
  onEnterScene,
  onExit,
  onTalk,
  onAction,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const camRef = useRef({ x: 0, y: 0, vx: 0 });
  const dragRef = useRef({ active: false, x: 0, y: 0, moved: 0 });
  const sceneRef = useRef(scene);
  const taskNpcsRef = useRef(taskNpcIds);
  sceneRef.current = scene;
  taskNpcsRef.current = taskNpcIds;

  useEffect(() => {
    camRef.current = { x: scene.kind === 'street' ? 260 : 0, y: 0, vx: 0 };
  }, [scene.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;

    const drawFacade = (x: number, w: number, h: number, style: FacadeStyle, icon: string, lit: boolean) => {
      const top = GROUND_Y - h;
      // wall
      ctx.fillStyle = style.wall;
      ctx.fillRect(x, top, w, h);
      // roof
      ctx.fillStyle = style.roof;
      ctx.beginPath();
      ctx.moveTo(x - 10, top);
      ctx.lineTo(x + w / 2, top - 34);
      ctx.lineTo(x + w + 10, top);
      ctx.closePath();
      ctx.fill();
      // trim
      ctx.strokeStyle = style.trim;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 3, top + 3, w - 6, h - 6);
      // windows
      for (const wx of [x + 18, x + w - 42]) {
        ctx.fillStyle = lit ? 'rgba(253, 224, 71, 0.85)' : 'rgba(148,163,184,0.25)';
        ctx.fillRect(wx, top + 26, 24, 26);
        ctx.strokeStyle = 'rgba(2,6,23,0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(wx, top + 26, 24, 26);
        ctx.beginPath();
        ctx.moveTo(wx + 12, top + 26);
        ctx.lineTo(wx + 12, top + 52);
        ctx.moveTo(wx, top + 39);
        ctx.lineTo(wx + 24, top + 39);
        ctx.stroke();
      }
      // door
      const dw = 46, dh = 74;
      const dx = x + w / 2 - dw / 2;
      ctx.fillStyle = '#1c1017';
      ctx.beginPath();
      ctx.moveTo(dx, GROUND_Y);
      ctx.lineTo(dx, GROUND_Y - dh + 16);
      ctx.arc(dx + dw / 2, GROUND_Y - dh + 16, dw / 2, Math.PI, 0);
      ctx.lineTo(dx + dw, GROUND_Y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(253, 224, 71, 0.16)';
      ctx.fill();
      ctx.strokeStyle = style.trim;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // hanging sign
      const sw = 116;
      ctx.fillStyle = 'rgba(2,6,23,0.82)';
      ctx.fillRect(x + w / 2 - sw / 2, top - 58, sw, 22);
      ctx.strokeStyle = style.trim;
      ctx.strokeRect(x + w / 2 - sw / 2, top - 58, sw, 22);
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = style.trim;
      ctx.fillText(`${icon}  ${style.sign}`, x + w / 2, top - 47);
    };

    const drawNpc = (npcId: string, x: number, t: number, hasTask: boolean) => {
      const npc = npcById(npcId);
      const bob = Math.sin(t * 2 + x) * 3;
      const y = GROUND_Y - 6 + bob;
      // shadow
      ctx.fillStyle = 'rgba(2,6,23,0.45)';
      ctx.beginPath();
      ctx.ellipse(x, GROUND_Y + 8, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // body emoji
      ctx.font = '38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(npc.icon, x, y);
      // name
      ctx.font = 'bold 9.5px Inter, sans-serif';
      ctx.fillStyle = 'rgba(241,245,249,0.92)';
      ctx.textBaseline = 'top';
      ctx.fillText(npc.name, x, GROUND_Y + 12);
      // task marker
      if (hasTask) {
        const pulse = 0.6 + 0.4 * Math.sin(t * 4);
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillStyle = `rgba(251, 191, 36, ${pulse})`;
        ctx.fillText('❗', x, y - 66);
      }
    };

    const drawInteriorProps = (id: SceneId, t: number) => {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const propsByScene: Record<string, () => void> = {
        hangar: () => {
          // parked rocket
          ctx.font = '110px sans-serif';
          ctx.fillText('🚀', 590, GROUND_Y - 66);
          ctx.font = '30px sans-serif';
          ctx.fillText('🛠️', 480, GROUND_Y - 16);
          ctx.fillText('🛢️', 700, GROUND_Y - 14);
          // work lights
          for (const lx of [350, 590, 830]) {
            const grad = ctx.createRadialGradient(lx, 90, 4, lx, 90, 130);
            grad.addColorStop(0, 'rgba(253, 224, 71, 0.14)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(lx, 90, 130, 0, Math.PI * 2);
            ctx.fill();
          }
        },
        greenhouse: () => {
          for (const px of [320, 420, 900, 1010, 1110]) {
            ctx.font = '34px sans-serif';
            ctx.fillText(px % 200 === 0 ? '🌻' : '🪴', px, GROUND_Y - 20);
          }
          ctx.font = '46px sans-serif';
          ctx.fillText('🌳', 1150, GROUND_Y - 30);
          // glass dome light rays
          ctx.globalAlpha = 0.07;
          ctx.fillStyle = '#a7f3d0';
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(200 + i * 240, 40);
            ctx.lineTo(140 + i * 240, GROUND_Y);
            ctx.lineTo(260 + i * 240, GROUND_Y);
            ctx.closePath();
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        },
        trophy: () => {
          for (const px of [330, 430, 810, 910, 1010]) {
            ctx.font = '30px sans-serif';
            ctx.fillText(px % 2 ? '🏆' : '🎖️', px, GROUND_Y - 40);
          }
          ctx.font = '54px sans-serif';
          ctx.fillText('🏅', 620, 130);
        },
        bank: () => {
          ctx.font = '40px sans-serif';
          ctx.fillText('💰', 350, GROUND_Y - 24);
          ctx.fillText('🪙', 900, GROUND_Y - 20);
          ctx.fillText('🧾', 1000, GROUND_Y - 60);
        },
        warehouse: () => {
          ctx.font = '42px sans-serif';
          for (const [px, py] of [[330, -20], [380, -20], [355, -60], [900, -20], [950, -60], [1050, -20]] as const) {
            ctx.fillText('📦', px, GROUND_Y + py);
          }
        },
        shop: () => {
          ctx.font = '32px sans-serif';
          for (const [px, py, icon] of [[340, -30, '⚙️'], [420, -30, '🔩'], [900, -30, '🛸'], [980, -64, '💎'], [340, -66, '🧰']] as const) {
            ctx.fillText(icon, px, GROUND_Y + py);
          }
        },
        gym: () => {
          ctx.font = '34px sans-serif';
          ctx.fillText('🏋️', 360, GROUND_Y - 22);
          ctx.fillText('🎽', 900, GROUND_Y - 50);
          ctx.fillText('🥇', 1000, GROUND_Y - 20);
        },
        command: () => {
          // console screens
          for (const sx of [330, 470, 900, 1040]) {
            ctx.fillStyle = 'rgba(34, 211, 238, 0.16)';
            ctx.fillRect(sx - 44, 150, 88, 56);
            ctx.strokeStyle = 'rgba(103, 232, 249, 0.6)';
            ctx.strokeRect(sx - 44, 150, 88, 56);
            const flick = 0.5 + 0.5 * Math.sin(t * 3 + sx);
            ctx.fillStyle = `rgba(103, 232, 249, ${0.35 + flick * 0.3})`;
            for (let i = 0; i < 3; i++) ctx.fillRect(sx - 36, 160 + i * 13, 40 + ((sx + i * 17) % 30), 4);
          }
          ctx.font = '44px sans-serif';
          ctx.fillText('🛰️', 620, 120);
        },
      };
      propsByScene[id]?.();
    };

    const render = () => {
      const sc = sceneRef.current;
      const t = performance.now() / 1000;
      const cam = camRef.current;

      // momentum
      if (!dragRef.current.active) {
        cam.x += cam.vx;
        cam.vx *= 0.92;
      }
      cam.x = Math.max(0, Math.min(sc.width - VW, cam.x));

      ctx.clearRect(0, 0, VW, VH);
      ctx.save();
      ctx.translate(-cam.x, cam.y);

      if (sc.kind === 'street') {
        // sky
        const sky = ctx.createLinearGradient(0, 0, 0, VH);
        sky.addColorStop(0, sc.palette.skyTop);
        sky.addColorStop(0.75, sc.palette.skyBottom);
        sky.addColorStop(1, sc.palette.ground);
        ctx.fillStyle = sky;
        ctx.fillRect(cam.x, 0, VW, VH);
        // stars in sky
        for (let i = 0; i < 40; i++) {
          const sx = ((i * 173) % sc.width);
          const sy = (i * 61) % 130;
          if (sx < cam.x - 10 || sx > cam.x + VW + 10) continue;
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(t + i));
          ctx.fillStyle = `rgba(241,245,249,${0.15 + tw * 0.4})`;
          ctx.beginPath();
          ctx.arc(sx, sy + 8, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
        // twin moons
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(cam.x + 120, 70, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(cam.x + 480, 46, 12, 0, Math.PI * 2);
        ctx.fill();
        // distant hills
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.moveTo(cam.x, 260);
        for (let x = 0; x <= VW + 40; x += 40) {
          const wx = cam.x + x;
          ctx.lineTo(wx, 235 + Math.sin(wx * 0.01) * 22);
        }
        ctx.lineTo(cam.x + VW, 420);
        ctx.lineTo(cam.x, 420);
        ctx.closePath();
        ctx.fill();

        // ground
        ctx.fillStyle = sc.palette.ground;
        ctx.fillRect(cam.x, GROUND_Y + 10, VW, VH - GROUND_Y);
        // cobble stones
        ctx.fillStyle = 'rgba(2,6,23,0.25)';
        for (let gx = Math.floor(cam.x / 46) * 46; gx < cam.x + VW; gx += 46) {
          ctx.fillRect(gx + 4, GROUND_Y + 18, 34, 7);
          ctx.fillRect(gx + 20, GROUND_Y + 32, 34, 7);
        }

        // building facades from door hotspots
        for (const hs of sc.hotspots) {
          if (hs.kind !== 'door' || !hs.to || hs.to === 'exit') continue;
          const target = SCENE_DEFS[hs.to as SceneId];
          const style = FACADE_STYLES[hs.to] || FACADE_STYLES.shop;
          const isHangar = hs.to === 'hangar';
          drawFacade(hs.x, hs.w, isHangar ? 190 : 168, style, target.icon, true);
        }

        // lanterns
        for (let lx = 120; lx < sc.width; lx += 260) {
          if (lx < cam.x - 40 || lx > cam.x + VW + 40) continue;
          ctx.strokeStyle = '#57534e';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(lx, GROUND_Y + 10);
          ctx.lineTo(lx, GROUND_Y - 66);
          ctx.stroke();
          const flick = 0.75 + 0.25 * Math.sin(t * 5 + lx);
          const grad = ctx.createRadialGradient(lx, GROUND_Y - 74, 2, lx, GROUND_Y - 74, 46);
          grad.addColorStop(0, `rgba(253, 224, 71, ${0.5 * flick})`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(lx, GROUND_Y - 74, 46, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🏮', lx, GROUND_Y - 66);
        }

        // notice board
        for (const hs of sc.hotspots) {
          if (hs.kind !== 'object' || hs.id !== 'board') continue;
          const bx = hs.x + hs.w / 2;
          ctx.strokeStyle = '#57534e';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(bx - 14, GROUND_Y + 10);
          ctx.lineTo(bx - 14, hs.y + 18);
          ctx.moveTo(bx + 14, GROUND_Y + 10);
          ctx.lineTo(bx + 14, hs.y + 18);
          ctx.stroke();
          ctx.fillStyle = '#4a3524';
          ctx.fillRect(hs.x - 4, hs.y, hs.w + 8, 64);
          ctx.strokeStyle = '#2b1d12';
          ctx.lineWidth = 2;
          ctx.strokeRect(hs.x - 4, hs.y, hs.w + 8, 64);
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('📜', bx - 12, hs.y + 22);
          ctx.fillText('📌', bx + 12, hs.y + 42);
          ctx.font = 'bold 8.5px Inter, sans-serif';
          ctx.fillStyle = '#fcd34d';
          ctx.fillText('QUESTS', bx, hs.y + 76);
        }

        // NPCs
        for (const npcPos of sc.npcs) {
          if (npcPos.x < cam.x - 60 || npcPos.x > cam.x + VW + 60) continue;
          drawNpc(npcPos.npcId, npcPos.x, t, taskNpcsRef.current.includes(npcPos.npcId));
        }
      } else {
        // ---- interior ----
        const sky = ctx.createLinearGradient(0, 0, 0, VH);
        sky.addColorStop(0, sc.palette.skyTop);
        sky.addColorStop(1, sc.palette.skyBottom);
        ctx.fillStyle = sky;
        ctx.fillRect(cam.x, 0, VW, VH);

        // back wall paneling
        ctx.fillStyle = 'rgba(2,6,23,0.25)';
        for (let px = Math.floor(cam.x / 130) * 130; px < cam.x + VW + 130; px += 130) {
          ctx.fillRect(px, 60, 3, GROUND_Y - 60);
        }
        // floor
        ctx.fillStyle = sc.palette.ground;
        ctx.fillRect(cam.x, GROUND_Y + 10, VW, VH - GROUND_Y);
        ctx.fillStyle = 'rgba(2,6,23,0.3)';
        for (let px = Math.floor(cam.x / 80) * 80; px < cam.x + VW + 80; px += 80) {
          ctx.fillRect(px, GROUND_Y + 14, 60, 4);
        }

        // exit door
        ctx.fillStyle = '#14100c';
        ctx.fillRect(50, GROUND_Y - 150, 100, 160);
        ctx.strokeStyle = sc.palette.accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(50, GROUND_Y - 150, 100, 160);
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = sc.palette.accent;
        ctx.fillText('⬅ EXIT', 100, GROUND_Y - 160);

        // counter
        ctx.fillStyle = 'rgba(2,6,23,0.5)';
        ctx.fillRect(460, GROUND_Y - 52, 320, 62);
        ctx.strokeStyle = sc.palette.accent;
        ctx.strokeRect(460, GROUND_Y - 52, 320, 62);

        drawInteriorProps(sc.id, t);

        // NPCs
        for (const npcPos of sc.npcs) {
          drawNpc(npcPos.npcId, npcPos.x, t, taskNpcsRef.current.includes(npcPos.npcId));
        }
      }

      ctx.restore();

      // vignette
      const vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.45, VW / 2, VH / 2, VH * 0.85);
      vg.addColorStop(0, 'transparent');
      vg.addColorStop(1, 'rgba(2,6,23,0.5)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, VW, VH);

      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [scene.id]);

  // -------------------------------------------------------------------------
  // Input: drag pans, tiny movement taps hit-test hotspots
  // -------------------------------------------------------------------------
  const posFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VW,
      y: ((e.clientY - rect.top) / rect.height) * VH,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = posFromEvent(e);
    dragRef.current = { active: true, x, y, moved: 0 };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const { x, y } = posFromEvent(e);
    const dx = x - drag.x;
    const dy = y - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    drag.x = x;
    drag.y = y;
    camRef.current.x -= dx;
    camRef.current.vx = -dx * 0.4;
    // limited vertical "look" for atmosphere
    camRef.current.y = Math.max(-24, Math.min(24, camRef.current.y + dy * 0.35));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    drag.active = false;
    if (drag.moved >= 12) return;

    const { x, y } = posFromEvent(e);
    const wx = x + camRef.current.x;
    const wy = y - camRef.current.y;
    const sc = sceneRef.current;

    for (const hs of sc.hotspots) {
      if (wx >= hs.x && wx <= hs.x + hs.w && wy >= hs.y && wy <= hs.y + hs.h) {
        if (hs.kind === 'door') {
          if (hs.to === 'exit') onExit();
          else if (hs.to) onEnterScene(hs.to);
        } else if (hs.kind === 'npc' && hs.npcId) {
          onTalk(hs.npcId);
        } else if (hs.kind === 'object' && sc.id === 'hangar') {
          onTalk('mechanic');
        } else if (hs.kind === 'object') {
          onAction(hs.id);
        }
        return;
      }
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={VW}
        height={VH}
        className="w-full touch-none rounded-2xl border border-slate-800/70"
        style={{ aspectRatio: `${VW}/${VH}`, cursor: 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* scene chrome */}
      <button
        onClick={onExit}
        className="absolute top-2 left-2 flex items-center gap-1 bg-slate-950/80 border border-slate-700 text-slate-200 text-[11px] font-bold px-2.5 py-1.5 rounded-xl backdrop-blur-sm hover:bg-slate-800/80 transition"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        {scene.kind === 'street' ? 'Planet' : 'Street'}
      </button>

      <div className="absolute top-2 right-2 bg-slate-950/70 border border-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-xl backdrop-blur-sm">
        {scene.icon} {scene.name}
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/60 border border-slate-800/60 text-slate-400 text-[9px] italic px-3 py-1 rounded-full backdrop-blur-sm max-w-[85%] text-center truncate">
        {scene.ambience} · drag to look around
      </div>

      {/* Interior action bar */}
      {scene.kind === 'interior' && scene.actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
          {scene.actions.map((a) => (
            <button
              key={a.id}
              onClick={() => onAction(a.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition btn-grow-sm ${
                a.primary
                  ? 'bg-gradient-to-r from-sky-500 to-emerald-400 text-slate-950 shadow-lg'
                  : 'bg-slate-900/90 border border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

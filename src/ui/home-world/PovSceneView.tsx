import React, { useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { SceneDef, SceneId, HotspotDef } from '../../types/homeWorld';
import { SCENE_DEFS, npcById, secretsInScene } from '../../core/HomeWorldData';

const VW = 640;
const VH = 420;

import streetBackdropUrl from '../../assets/art/scene-street-dusk.png';
import streetSkyUrl from '../../assets/art/layer-street-sky.png';
import streetFarUrl from '../../assets/art/layer-street-far.png';
import streetNearUrl from '../../assets/art/layer-street-near.png';
import { SCENE_BACKDROPS } from './backdrops';
import { getArtImage, artReady } from './art';
import { NPC_PORTRAITS } from './portraits';
import { NPC_SPRITES } from './portraits';
import { getChromaSprite } from './chromaKey';
import { weatherAt } from '../../core/Weather';

const DOOR_LABELS: Record<string, string> = {
  shop: 'Supply Shop',
  bank: 'Star Bank',
  gym: 'Gravity Gym',
  trophy: 'Medal Hall',
  greenhouse: 'Greenhouse',
  warehouse: 'Freight Depot',
  hangar: 'Launch Hangar',
  command: 'Command Post',
};
const GROUND_Y = 372;

interface PovSceneViewProps {
  scene: SceneDef;
  /** NPC ids that currently have an available task marker. */
  taskNpcIds: string[];
  discoveredSecretIds?: string[];
  onEnterScene: (id: SceneId) => void;
  onExit: () => void;
  onTalk: (npcId: string) => void;
  onAction: (actionId: string) => void;
  onSecretFound?: (secretId: string) => void;
}

/** Ambient extra characters who mill about inside each building. */
const AMBIENT_CAST: Record<string, string[]> = {
  hangar: ['townsfolk_2'],
  shop: ['townsfolk_1'],
  bank: ['townsfolk_2'],
  gym: ['townsfolk_1'],
  greenhouse: ['townsfolk_2'],
  trophy: ['townsfolk_1'],
  warehouse: ['townsfolk_2'],
  command: ['mechanic'],
};

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
  discoveredSecretIds,
  onEnterScene,
  onExit,
  onTalk,
  onAction,
  onSecretFound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const camRef = useRef({ x: 0, y: 0, vx: 0 });
  const dragRef = useRef({ active: false, x: 0, y: 0, moved: 0 });
  const sceneRef = useRef(scene);
  const taskNpcsRef = useRef(taskNpcIds);
  const discoveredRef = useRef(discoveredSecretIds || []);
  sceneRef.current = scene;
  taskNpcsRef.current = taskNpcIds;
  discoveredRef.current = discoveredSecretIds || [];

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

    // Rounded-rect path helper (Safari-safe, no ctx.roundRect dependency)
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // Glowing AR-style door signage floating over the painted street
    const drawHoloDoor = (x: number, y: number, w: number, h: number, icon: string, label: string, accent: string, t: number) => {
      const bx = x + w / 2;
      const pulse = 0.75 + 0.25 * Math.sin(t * 2.2 + x * 0.05);
      // light beam from the doorway
      const beam = ctx.createLinearGradient(0, y + h, 0, y - 34);
      beam.addColorStop(0, 'rgba(56,189,248,0)');
      beam.addColorStop(1, `rgba(56,189,248,${0.16 * pulse})`);
      ctx.fillStyle = beam;
      ctx.fillRect(bx - 16, y - 34, 32, h + 34);
      // doorway glow line
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.55 * pulse;
      ctx.lineWidth = 2;
      rr(x + 6, y + 4, w - 12, h - 8, 8);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // glass plaque
      const pw = Math.max(78, label.length * 6.4 + 40);
      const px = bx - pw / 2;
      const py = y - 30;
      ctx.fillStyle = 'rgba(10,16,32,0.78)';
      rr(px, py, pw, 26, 13);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 1.2;
      rr(px, py, pw, 26, 13);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, px + 14, py + 14);
      ctx.font = 'bold 9.5px Inter, sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(label.toUpperCase(), px + 24 + (pw - 34) / 2, py + 14);
      ctx.textBaseline = 'alphabetic';
    };

    // NPC renderer: chroma-keyed full-body sprite > portrait chip > stick figure
    const drawNpcChip = (npcId: string, x: number, t: number, hasTask: boolean) => {
      const npc = npcById(npcId);
      const spriteUrl = NPC_SPRITES[npcId];
      const sprite = spriteUrl ? getChromaSprite(spriteUrl) : null;
      if (sprite) {
        const h = 132;
        const w = (h * sprite.width) / sprite.height;
        const feetY = GROUND_Y + 12;
        // grounded soft shadow
        ctx.fillStyle = 'rgba(2,6,23,0.45)';
        ctx.beginPath();
        ctx.ellipse(x, feetY, w * 0.3, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(sprite, x - w / 2, feetY - h, w, h);
        const headY = feetY - h - 4;
        if (hasTask) {
          const pulse = 0.6 + 0.4 * Math.sin(t * 4);
          ctx.strokeStyle = `rgba(251,191,36,${0.45 + 0.4 * pulse})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(x, headY - 10, 10 + pulse * 2.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fcd34d';
          ctx.fillText('❗', x, headY - 24);
        }
        // name tag above head
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        const nw = ctx.measureText(npc.name).width + 12;
        ctx.fillStyle = 'rgba(10,16,32,0.75)';
        rr(x - nw / 2, headY - (hasTask ? 44 : 20), nw, 15, 7);
        ctx.fill();
        ctx.fillStyle = hasTask ? '#fcd34d' : '#e2e8f0';
        ctx.fillText(npc.name, x, headY - (hasTask ? 33 : 9));
        return;
      }
      const bob = Math.sin(t * 2 + x) * 3;
      const cy = GROUND_Y - 46 + bob;
      const url = NPC_PORTRAITS[npcId];
      const img = url ? getArtImage(url) : null;
      if (artReady(img)) {
        if (hasTask) {
          const pulse = 0.6 + 0.4 * Math.sin(t * 4);
          ctx.strokeStyle = `rgba(251,191,36,${0.5 + 0.4 * pulse})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, cy, 27 + pulse * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, cy, 24, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - 24, cy - 24, 48, 48);
        ctx.restore();
        ctx.strokeStyle = 'rgba(226,232,240,0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, cy, 24, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        drawNpc(npcId, x, t, hasTask);
        return;
      }
      // name tag
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      const tw = ctx.measureText(npc.name).width + 12;
      ctx.fillStyle = 'rgba(10,16,32,0.75)';
      rr(x - tw / 2, cy + 28, tw, 15, 7);
      ctx.fill();
      ctx.fillStyle = hasTask ? '#fcd34d' : '#cbd5e1';
      ctx.fillText(npc.name, x, cy + 39);
      if (hasTask) {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('❗', x + 22, cy - 20);
      }
    };

    // Passers-by strolling for a sense of life
    const drawWanderers = (t: number, urls: string[]) => {
      const sprites = urls;
      const scW = sceneRef.current.width;
      sprites.forEach((url, k) => {
        const spr = url ? getChromaSprite(url) : null;
        if (!spr) return;
        const speed = 26 + k * 9;
        const span = scW + 240;
        const prog = (t * speed + k * 977) % (span * 2);
        const ltr = prog < span;
        const x = ltr ? prog - 120 : span * 2 - prog - 120;
        if (x < camRef.current.x - 90 || x > camRef.current.x + VW + 90) return;
        const h = 118;
        const w = (h * spr.width) / spr.height;
        const step = Math.sin(t * 7 + k * 2) * 1.5;
        ctx.save();
        ctx.translate(x, 0);
        if (!ltr) ctx.scale(-1, 1);
        ctx.fillStyle = 'rgba(2,6,23,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, GROUND_Y + 14, w * 0.28, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(spr, -w / 2, GROUND_Y + 14 - h + step, w, h);
        ctx.restore();
      });
    };

    // Ambient conversation bubbles — the town talks to itself
    const CHATTER = [
      "Lovely dusk!", "Fresh parts in!", "See the aurora?", "My rocket, my rules.",
      "Tea at the cafe?", "Ship launches soon!", "Raiders stir, they say…",
      "Mind the puddles.", "Stars look close tonight.", "Growing well, eh?",
      "Vault rates are fair.", "Coach says one more set.",
    ];
    const drawChatter = (npcId: string, x: number, t: number) => {
      const tt = t + x * 0.13;
      const phase = tt % 10;
      if (phase > 4.5) return;
      const cycle = Math.floor(tt / 10);
      const hsh = Math.abs(Math.sin(npcId.length * 91.7 + cycle * 17.3));
      const line = CHATTER[Math.floor(hsh * 997) % CHATTER.length];
      const fade = Math.min(1, phase * 3) * Math.min(1, (4.5 - phase) * 2);
      const y = GROUND_Y - 162;
      ctx.globalAlpha = 0.92 * fade;
      ctx.font = 'bold 8.5px Inter, sans-serif';
      ctx.textAlign = 'center';
      const w = ctx.measureText(line).width + 14;
      ctx.fillStyle = 'rgba(15,23,42,0.92)';
      rr(x - w / 2, y - 16, w, 17, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(148,163,184,0.5)';
      ctx.lineWidth = 1;
      rr(x - w / 2, y - 16, w, 17, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 4, y + 1);
      ctx.lineTo(x + 4, y + 1);
      ctx.lineTo(x, y + 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(line, x, y - 4);
      ctx.globalAlpha = 1;
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

      // ---- Parallax depth stack (screen space) ----
      const sc0 = sceneRef.current;
      const span0 = Math.max(1, sc0.width - VW);
      const cx0 = Math.max(0, Math.min(span0, cam.x));
      const drawLayer = (
        img: HTMLImageElement | HTMLCanvasElement | null,
        coef: number,
        y: number,
        h: number,
        srcYFrac = 0,
        srcHFrac = 1
      ) => {
        if (!img) return;
        const iw = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
        const ih = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
        if (!iw || !ih) return;
        const dw = Math.max((iw / ih) * h, VW + span0 * coef);
        ctx.drawImage(img, 0, ih * srcYFrac, iw, ih * srcHFrac, -cx0 * coef, y, dw, h);
      };
      const bdUrl0 = SCENE_BACKDROPS[sc0.id] || (sc0.kind === 'street' ? streetBackdropUrl : undefined);
      const backdrop0 = bdUrl0 ? getArtImage(bdUrl0) : null;
      if (sc0.kind === 'street') {
        const sky = getArtImage(streetSkyUrl);
        const hasSky = artReady(sky);
        if (hasSky) drawLayer(sky, 0.1, 0, VH);
        const far = getChromaSprite(streetFarUrl);
        if (hasSky && far) drawLayer(far, 0.3, VH * 0.08, VH * 0.58);
        if (artReady(backdrop0)) {
          if (hasSky) {
            // buildings band only — sky + far silhouettes show above the roofs
            drawLayer(backdrop0, 0.6, VH * 0.28, VH * 0.72, 0.3, 0.7);
          } else {
            drawLayer(backdrop0, 0.6, 0, VH);
          }
        }
      } else if (artReady(backdrop0)) {
        // interiors: dimmed full copy drifts slow (back wall), crisp lower band mid
        drawLayer(backdrop0, 0.3, 0, VH);
        ctx.fillStyle = 'rgba(2,6,23,0.45)';
        ctx.fillRect(0, 0, VW, VH);
        drawLayer(backdrop0, 0.65, VH * 0.3, VH * 0.7, 0.3, 0.7);
      }

      ctx.save();
      ctx.translate(-cam.x, cam.y);

      if (sc.kind === 'street') {
        const streetArtReady = artReady(backdrop0);
        if (!streetArtReady) {
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
        } // end procedural street fallback

        // building markers: painted backdrops get holo-signage, fallback gets facades
        for (const hs of sc.hotspots) {
          if (hs.kind !== 'door' || !hs.to || hs.to === 'exit') continue;
          const target = SCENE_DEFS[hs.to as SceneId];
          if (streetArtReady) {
            drawHoloDoor(hs.x, hs.y, hs.w, hs.h, target.icon, DOOR_LABELS[hs.to] || target.name, sc.palette.accent, t);
            continue;
          }
          const style = FACADE_STYLES[hs.to] || FACADE_STYLES.shop;
          const isHangar = hs.to === 'hangar';
          drawFacade(hs.x, hs.w, isHangar ? 190 : 168, style, target.icon, true);
        }

        if (!streetArtReady) {
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
        } // end lanterns (procedural fallback only)

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

        // chimney smoke — the town cooks and heats
        if (streetArtReady) {
          for (const cxp of [310, 1520, 2080]) {
            for (let k = 0; k < 5; k++) {
              const rise = (t * 16 + k * 26) % 130;
              const sy = 150 - rise;
              const sx = cxp + Math.sin(t * 0.8 + k * 1.7 + cxp) * (4 + rise * 0.12);
              const a = Math.max(0, 0.16 * (1 - rise / 130));
              ctx.fillStyle = `rgba(226,232,240,${a.toFixed(3)})`;
              ctx.beginPath();
              ctx.arc(sx, sy, 4 + rise * 0.09, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // NPCs — portrait chips over painted art, stick figures in fallback
        for (const npcPos of sc.npcs) {
          if (npcPos.x < cam.x - 60 || npcPos.x > cam.x + VW + 60) continue;
          const hasTask = taskNpcsRef.current.includes(npcPos.npcId);
          if (streetArtReady) {
            drawNpcChip(npcPos.npcId, npcPos.x, t, hasTask);
            drawChatter(npcPos.npcId, npcPos.x, t);
          } else {
            drawNpc(npcPos.npcId, npcPos.x, t, hasTask);
          }
        }
        if (streetArtReady) drawWanderers(t, [NPC_SPRITES.townsfolk_1, NPC_SPRITES.townsfolk_2, NPC_SPRITES.keeper]);
      } else {
        // ---- interior ----
        const interiorArtReady = artReady(backdrop0);
        if (!interiorArtReady) {
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
        } // end procedural interior fallback

        // EXIT signage over painted interiors
        if (interiorArtReady) {
          for (const hs of sc.hotspots) {
            if (hs.kind === 'door' && hs.to === 'exit') {
              drawHoloDoor(hs.x, hs.y, hs.w, hs.h, '⬅', 'EXIT', sc.palette.accent, t);
            }
          }
          drawWanderers(t, AMBIENT_CAST[sc.id] || []);
        }

        // NPCs — portrait chips over painted art, stick figures in fallback
        for (const npcPos of sc.npcs) {
          const hasTask = taskNpcsRef.current.includes(npcPos.npcId);
          if (interiorArtReady) {
            drawNpcChip(npcPos.npcId, npcPos.x, t, hasTask);
            drawChatter(npcPos.npcId, npcPos.x, t);
          } else {
            drawNpc(npcPos.npcId, npcPos.x, t, hasTask);
          }
        }
      }

      // secrets: faint shimmer until found, quiet golden rune once claimed
      for (const s of secretsInScene(sc.id)) {
        if (s.x < cam.x - 40 || s.x > cam.x + VW + 40) continue;
        if (discoveredRef.current.includes(s.id)) {
          ctx.fillStyle = 'rgba(252,211,77,0.5)';
          ctx.beginPath();
          ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(252,211,77,0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 6.5, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const tw = Math.sin(t * 1.3 + s.x * 0.7);
          if (tw > 0.55) {
            const a = (tw - 0.55) * 0.9;
            ctx.strokeStyle = `rgba(226,232,240,${a.toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(s.x - 4, s.y);
            ctx.lineTo(s.x + 4, s.y);
            ctx.moveTo(s.x, s.y - 4);
            ctx.lineTo(s.x, s.y + 4);
            ctx.stroke();
          }
        }
      }

      ctx.restore();

      // Ambient life: drifting motes / fireflies / sparks tuned per scene
      const AMBIENCE: Record<string, { rgb: string; n: number; up: number; drift: number; size: number }> = {
        street: { rgb: '255,214,130', n: 22, up: 10, drift: 6, size: 1.6 },
        hangar: { rgb: '140,200,255', n: 14, up: 16, drift: 4, size: 1.3 },
        greenhouse: { rgb: '140,255,170', n: 24, up: 8, drift: 5, size: 1.5 },
        shop: { rgb: '220,170,255', n: 14, up: 7, drift: 4, size: 1.4 },
        gym: { rgb: '255,190,120', n: 12, up: 14, drift: 5, size: 1.3 },
        bank: { rgb: '255,220,150', n: 12, up: 6, drift: 3, size: 1.2 },
        trophy: { rgb: '255,220,150', n: 14, up: 6, drift: 3, size: 1.2 },
        warehouse: { rgb: '220,200,160', n: 14, up: 9, drift: 4, size: 1.4 },
        command: { rgb: '120,220,255', n: 20, up: 12, drift: 6, size: 1.3 },
      };
      const amb = AMBIENCE[sc.id];
      if (amb) {
        for (let i = 0; i < amb.n; i++) {
          const h1f = Math.sin(i * 12.9898) * 43758.5453;
          const h1 = h1f - Math.floor(h1f);
          const h2f = Math.sin(i * 78.233) * 12578.145;
          const h2 = h2f - Math.floor(h2f);
          const spanX = VW + 40;
          const px = ((((h1 * spanX + t * amb.drift * (h2 > 0.5 ? 4 : -4)) % spanX) + spanX) % spanX) - 20;
          const py = VH + 10 - ((h2 * (VH + 40) + t * amb.up) % (VH + 40));
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.7 + i * 1.3));
          ctx.fillStyle = `rgba(${amb.rgb},${(0.26 * tw).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, amb.size * (0.7 + tw * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- foreground depth layer (moves faster than the world) ----
      if (sc.kind === 'street') {
        const near = getChromaSprite(streetNearUrl);
        if (near) drawLayer(near, 1.35, VH * 0.62, VH * 0.44);
      } else {
        ctx.fillStyle = 'rgba(2,6,23,0.5)';
        const fspan = VW + span0 * 1.3;
        for (let i = 0; i < 6; i++) {
          const fx = ((i * 211) % fspan) - cx0 * 1.3;
          if (fx < -90 || fx > VW + 90) continue;
          const fh = 24 + (i % 3) * 14;
          ctx.beginPath();
          ctx.ellipse(fx, VH + 8, 46 + (i % 4) * 12, fh, 0, Math.PI, 0);
          ctx.fill();
        }
      }

      // ---- weather layer (screen space) ----
      const wx = weatherAt(Date.now());
      if (wx === 'RAIN') {
        ctx.fillStyle = 'rgba(20,40,80,0.10)';
        ctx.fillRect(0, 0, VW, VH);
        ctx.strokeStyle = 'rgba(170,205,255,0.32)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 70; i++) {
          const px = ((i * 97.3 + t * 480) % (VW + 40)) - 20;
          const py = ((i * 211.7 + t * 720) % (VH + 30)) - 15;
          ctx.moveTo(px, py);
          ctx.lineTo(px - 2.5, py + 11);
        }
        ctx.stroke();
      } else if (wx === 'SNOW') {
        ctx.fillStyle = 'rgba(240,248,255,0.75)';
        for (let i = 0; i < 55; i++) {
          const px = (((i * 89.7) % (VW + 20)) - 10) + Math.sin(t * 0.9 + i) * 14;
          const py = ((i * 53.1 + t * (34 + (i % 5) * 8)) % (VH + 20)) - 10;
          ctx.globalAlpha = 0.35 + (i % 3) * 0.2;
          ctx.beginPath();
          ctx.arc(px, py, 1 + (i % 3) * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (wx === 'AURORA') {
        const cols = ['52,211,153', '34,211,238', '167,139,250'];
        cols.forEach((c, k) => {
          ctx.strokeStyle = `rgba(${c},0.14)`;
          ctx.lineWidth = 26;
          ctx.beginPath();
          for (let x = -10; x <= VW + 10; x += 26) {
            const y = 52 + k * 24 + Math.sin(x * 0.012 + t * 0.7 + k * 1.8) * 16;
            if (x === -10) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      } else if (wx === 'FOG') {
        for (let k = 0; k < 3; k++) {
          const y = VH * (0.45 + k * 0.16);
          const drift = Math.sin(t * 0.25 + k * 2) * 60;
          const fg = ctx.createLinearGradient(0, y - 34, 0, y + 34);
          fg.addColorStop(0, 'rgba(226,232,240,0)');
          fg.addColorStop(0.5, `rgba(226,232,240,${0.1 - k * 0.02})`);
          fg.addColorStop(1, 'rgba(226,232,240,0)');
          ctx.fillStyle = fg;
          ctx.fillRect(-80 + drift, y - 34, VW + 160, 68);
        }
      } else if (wx === 'METEORS') {
        const cyc = t % 5;
        if (cyc < 0.8) {
          const p = cyc / 0.8;
          const mx = VW * 0.95 - p * VW * 0.7;
          const my = 14 + p * 110;
          const mg = ctx.createLinearGradient(mx, my, mx + 60, my - 26);
          mg.addColorStop(0, 'rgba(255,255,255,0.85)');
          mg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = mg;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(mx + 60, my - 26);
          ctx.stroke();
        }
      }

      // dusk birds
      ctx.strokeStyle = 'rgba(226,232,240,0.5)';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        const bx = ((t * (34 + i * 9) + i * 300) % (VW + 80)) - 40;
        const by = 52 + i * 22 + Math.sin(t * 1.6 + i * 2) * 7;
        const fl = Math.sin(t * 7 + i * 2) * 2.2;
        ctx.beginPath();
        ctx.moveTo(bx - 6, by);
        ctx.quadraticCurveTo(bx - 3, by - 3 - fl, bx, by);
        ctx.quadraticCurveTo(bx + 3, by - 3 - fl, bx + 6, by);
        ctx.stroke();
      }

      // sky traffic: a rocket climbing from the hangar now and then
      const skyT = t % 23;
      if (skyT < 2.2) {
        const p = skyT / 2.2;
        const rx = VW * 0.72 + p * 30;
        const ry = VH * 0.9 - p * VH * 1.05;
        const tg = ctx.createLinearGradient(rx, ry, rx - 6, ry + 46);
        tg.addColorStop(0, 'rgba(255,220,150,0.9)');
        tg.addColorStop(1, 'rgba(255,220,150,0)');
        ctx.strokeStyle = tg;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 6, ry + 46);
        ctx.stroke();
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(rx, ry, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // …and a trade skiff gliding the other way
      const skT = (t + 9) % 31;
      if (skT < 6) {
        const p = skT / 6;
        const sx = VW + 60 - p * (VW + 120);
        const sy = 96 + Math.sin(p * 6) * 4;
        ctx.fillStyle = 'rgba(15,23,42,0.85)';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 14, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(125,211,252,0.8)';
        ctx.fillRect(sx - 4, sy - 3, 7, 2.4);
        ctx.fillStyle = `rgba(253,224,71,${0.4 + 0.4 * Math.sin(t * 6)})`;
        ctx.beginPath();
        ctx.arc(sx + 12, sy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // slow dusk<->night breathing
      const night = 0.5 + 0.5 * Math.sin(t * 0.02);
      ctx.fillStyle = `rgba(2,6,23,${(night * 0.16).toFixed(3)})`;
      ctx.fillRect(0, 0, VW, VH);

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

    // secrets take priority under the fingertip
    for (const s of secretsInScene(sc.id)) {
      if (Math.abs(wx - s.x) < 26 && Math.abs(wy - s.y) < 26) {
        if (!discoveredRef.current.includes(s.id)) onSecretFound?.(s.id);
        return;
      }
    }

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

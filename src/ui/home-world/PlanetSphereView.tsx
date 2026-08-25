import React, { useEffect, useRef } from 'react';
import { PLANET_LOCATIONS } from '../../core/HomeWorldData';
import { PlanetLocationDef } from '../../types/homeWorld';

const W = 640;
const H = 560;
const CX = W / 2;
const CY = H / 2 + 8;
const R = 205;

interface SphereMarker {
  def: PlanetLocationDef;
  x: number;
  y: number;
  z: number;
  scale: number;
}

interface PlanetSphereViewProps {
  /** Current pollution 0..100 tints the planet (from the sim layer, if any). */
  pollution: number;
  townName: string;
  onEnterLocation: (loc: PlanetLocationDef) => void;
}

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
}

/** Surface features: fixed lat/lon patches that rotate with the planet. */
const FEATURES = Array.from({ length: 26 }, (_, i) => {
  const lat = Math.sin(i * 2.399) * 72; // golden-angle spread
  const lon = (i * 137.5) % 360;
  return {
    lat,
    lon,
    size: 14 + ((i * 13) % 26),
    kind: i % 5,
  };
});

const CITY_LIGHTS = [
  { lat: 12, lon: 0 }, { lat: 16, lon: 8 }, { lat: 8, lon: -7 },
  { lat: 34, lon: -58 }, { lat: -24, lon: 62 }, { lat: -20, lon: 70 },
];

export const PlanetSphereView: React.FC<PlanetSphereViewProps> = ({
  pollution,
  townName,
  onEnterLocation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const markersRef = useRef<SphereMarker[]>([]);
  const rotRef = useRef({ yaw: 0.5, pitch: 0.28, vyaw: 0, vpitch: 0 });
  const dragRef = useRef<{ active: boolean; x: number; y: number; moved: number }>({
    active: false, x: 0, y: 0, moved: 0,
  });
  const pollutionRef = useRef(pollution);
  pollutionRef.current = pollution;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars = Array.from({ length: 130 }, (_, i) => {
      const fx = Math.abs(Math.sin(i * 127.1) * 43758.5453) % 1;
      const fy = Math.abs(Math.sin(i * 311.7) * 12543.853) % 1;
      return { x: fx * W, y: fy * H, r: 0.4 + ((i * 7) % 10) / 9, phase: i * 0.7 };
    });

    // Project a lat/lon (degrees) to screen space given current rotation.
    const project = (latDeg: number, lonDeg: number): { x: number; y: number; z: number } => {
      const lat = (latDeg * Math.PI) / 180;
      const lon = (lonDeg * Math.PI) / 180 + rotRef.current.yaw;
      const pitch = rotRef.current.pitch;
      // Sphere coords (y up), then pitch rotation around X axis.
      const x0 = Math.cos(lat) * Math.sin(lon);
      const y0 = Math.sin(lat);
      const z0 = Math.cos(lat) * Math.cos(lon);
      const y1 = y0 * Math.cos(pitch) - z0 * Math.sin(pitch);
      const z1 = y0 * Math.sin(pitch) + z0 * Math.cos(pitch);
      return { x: CX + x0 * R, y: CY - y1 * R, z: z1 };
    };

    let raf = 0;

    const render = () => {
      const t = performance.now() / 1000;
      const rot = rotRef.current;

      // Inertia + idle drift
      if (!dragRef.current.active) {
        rot.yaw += rot.vyaw;
        rot.pitch += rot.vpitch;
        rot.vyaw *= 0.94;
        rot.vpitch *= 0.94;
        if (Math.abs(rot.vyaw) < 0.0004 && Math.abs(rot.vpitch) < 0.0004) {
          rot.yaw += 0.0016; // gentle idle spin
        }
        rot.pitch = Math.max(-1.15, Math.min(1.15, rot.pitch));
      }

      const pol = Math.min(1, pollutionRef.current / 100);

      // Backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#050814');
      bg.addColorStop(1, '#0d1226');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 1.3 + s.phase);
        ctx.fillStyle = `rgba(226,232,240,${0.2 + tw * 0.55})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Atmosphere glow
      const glowColor = lerpColor('#38bdf8', '#d97706', pol * 0.7);
      const glow = ctx.createRadialGradient(CX, CY, R * 0.86, CX, CY, R * 1.32);
      glow.addColorStop(0, glowColor.replace('rgb', 'rgba').replace(')', ',0.30)'));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(CX, CY, R * 1.32, 0, Math.PI * 2);
      ctx.fill();

      // Planet body
      const hi = lerpColor('#3fae7a', '#8a6b3f', pol);
      const lo = lerpColor('#0d4531', '#33210f', pol);
      const body = ctx.createRadialGradient(CX - R * 0.42, CY - R * 0.45, R * 0.12, CX, CY, R);
      body.addColorStop(0, hi);
      body.addColorStop(1, lo);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fill();

      // Clip surface details to the disc
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.clip();

      // Terrain patches rotating with the sphere
      for (const f of FEATURES) {
        const p = project(f.lat, f.lon);
        if (p.z < -0.05) continue;
        const alpha = 0.10 + p.z * 0.16;
        const colors = ['#166534', '#1d4ed8', '#a16207', '#155e75', '#3f6212'];
        ctx.fillStyle = colors[f.kind];
        ctx.globalAlpha = Math.max(0.04, alpha);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, f.size * (0.6 + p.z * 0.5), f.size * 0.7 * (0.6 + p.z * 0.5), 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // City lights
      for (const c of CITY_LIGHTS) {
        const p = project(c.lat, c.lon);
        if (p.z < 0) continue;
        const twinkle = 0.55 + 0.45 * Math.sin(t * 2 + c.lon);
        ctx.fillStyle = `rgba(253, 224, 71, ${0.35 + p.z * 0.5 * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2 + p.z * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drifting cloud bands
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 9;
      for (let i = 0; i < 3; i++) {
        const ca = t * 0.05 + rot.yaw * 0.4 + (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(CX, CY, R * (0.3 + i * 0.25), ca, ca + 1.9);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Terminator shading
      const shade = ctx.createRadialGradient(CX + R * 0.6, CY + R * 0.6, R * 0.2, CX, CY, R * 1.05);
      shade.addColorStop(0, 'transparent');
      shade.addColorStop(1, 'rgba(2,6,23,0.55)');
      ctx.fillStyle = shade;
      ctx.fillRect(CX - R, CY - R, R * 2, R * 2);
      ctx.restore();

      // Location markers (physically attached, move with rotation)
      const markers: SphereMarker[] = [];
      for (const def of PLANET_LOCATIONS) {
        const p = project(def.lat, def.lon);
        if (p.z < -0.12) continue; // on the far side
        const alpha = Math.min(1, (p.z + 0.12) * 2.2);
        const scale = 0.75 + p.z * 0.35;
        markers.push({ def, x: p.x, y: p.y, z: p.z, scale });

        ctx.globalAlpha = alpha;
        const mr = 24 * scale;

        // pin glow
        ctx.fillStyle = def.color + '33';
        ctx.beginPath();
        ctx.arc(p.x, p.y, mr + 8 + Math.sin(t * 2.4 + def.lon) * 2, 0, Math.PI * 2);
        ctx.fill();

        // disc
        ctx.fillStyle = 'rgba(2,6,23,0.85)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, mr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = def.sceneId ? def.color : 'rgba(148,163,184,0.7)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = `${Math.round(21 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(def.sceneId ? def.icon : '🔒', p.x, p.y + 1);

        // name plate
        ctx.font = `bold ${Math.round(10.5 * scale)}px Inter, sans-serif`;
        const label = def.name;
        const tw = ctx.measureText(label).width;
        const ly = p.y + mr + 12;
        ctx.fillStyle = 'rgba(2,6,23,0.75)';
        ctx.fillRect(p.x - tw / 2 - 5, ly - 8, tw + 10, 15);
        ctx.fillStyle = def.sceneId ? '#f1f5f9' : 'rgba(148,163,184,0.9)';
        ctx.fillText(label, p.x, ly);
        ctx.globalAlpha = 1;
      }
      markersRef.current = markers;

      // Title
      ctx.textAlign = 'center';
      ctx.font = '900 21px Inter, sans-serif';
      ctx.fillStyle = 'rgba(241,245,249,0.92)';
      ctx.fillText(townName, CX, 30);
      ctx.font = '600 10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(148,163,184,0.85)';
      ctx.fillText('YOUR HOME PLANET', CX, 46);

      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [townName]);

  // -------------------------------------------------------------------------
  // Drag-to-spin + tap-to-enter
  // -------------------------------------------------------------------------
  const posFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = posFromEvent(e);
    dragRef.current = { active: true, x, y, moved: 0 };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag.active) {
      // hover cursor
      const { x, y } = posFromEvent(e);
      const hit = markersRef.current.some((m) => Math.hypot(m.x - x, m.y - y) <= 30 * m.scale + 6);
      canvasRef.current!.style.cursor = hit ? 'pointer' : 'grab';
      return;
    }
    const { x, y } = posFromEvent(e);
    const dx = x - drag.x;
    const dy = y - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    drag.x = x;
    drag.y = y;
    rotRef.current.yaw += dx * 0.006;
    rotRef.current.pitch += dy * 0.004;
    rotRef.current.pitch = Math.max(-1.15, Math.min(1.15, rotRef.current.pitch));
    rotRef.current.vyaw = dx * 0.0035;
    rotRef.current.vpitch = dy * 0.0022;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    drag.active = false;
    if (drag.moved < 10) {
      // Treat as tap: hit-test markers
      const { x, y } = posFromEvent(e);
      for (const m of markersRef.current) {
        if (Math.hypot(m.x - x, m.y - y) <= 30 * m.scale + 6) {
          onEnterLocation(m.def);
          break;
        }
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full touch-none rounded-2xl"
      style={{ aspectRatio: `${W}/${H}`, cursor: 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
};

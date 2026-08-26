import React, { useCallback, useEffect, useRef, useState } from 'react';
import { simIcon } from './planet-sim/simIcons';
import { getArtImage } from './home-world/art';
import {
  Play,
  Swords,
  Compass,
  ShoppingBag,
  Zap,
  Target,
  Trophy,
  Award,
  FileText,
  Globe2,
  Users,
  Leaf,
  ShieldCheck,
  Sparkles,
  ArrowDownToDot,
  AlertTriangle,
  Factory,
} from 'lucide-react';
import { UserSavedData } from '../types/game';
import {
  PlanetSimState,
  SimFactionId,
} from '../types/planetSim';
import {
  REGION_DEFS,
  SIM_VERSION,
  createInitialSimState,
  catchUpFromOffline,
  tickSim,
  computeRates,
  developRegion,
  buildStructure,
  exploreRegion,
  sendEnvoy,
  sendTribute,
  formAlliance,
  negotiateTruce,
  integrateFaction,
  launchStrike,
  buildDefense,
  buildFrigate,
  getDefenseRating,
  planetTitle,
  totalDevelopment,
  TRUCE_COST_STARDUST,
  INTEGRATE_COST_STARDUST,
  fmt,
  rateFmt,
  formatDuration,
  ActionResult,
} from '../core/PlanetSim';
import { StorageManager } from '../core/Storage';
import { audioEngine } from '../core/AudioEngine';
import { showToast } from './Toast';
import { RegionPanel } from './planet-sim/RegionPanel';
import { DiplomacyPanel } from './planet-sim/DiplomacyPanel';
import { WarRoomPanel } from './planet-sim/WarRoomPanel';
import { LogPanel } from './planet-sim/LogPanel';
import mainBgUrl from '../assets/images/main_menu_cosmic_bg_1786730822424.jpg';

// ---------------------------------------------------------------------------
// Canvas geometry
// ---------------------------------------------------------------------------

const W = 600;
const H = 480;
const CX = W / 2;
const CY = H / 2 + 6;
const R = 148;
const MARKER_R = 26;

interface MarkerHit {
  id: string;
  x: number;
  y: number;
}

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

function hexWithAlpha(hex: string, alpha: number): string {
  const p = parseInt(hex.slice(1), 16);
  return `rgba(${(p >> 16) & 255},${(p >> 8) & 255},${p & 255},${alpha})`;
}

type SimTab = 'PLANET' | 'DIPLOMACY' | 'WAR' | 'LOG';

interface HomePlanetScreenProps {
  savedData: UserSavedData;
  onStartGame: () => void;
  onOpenHomePlanet: () => void;
  onOpenMultiplayer: () => void;
  onOpenWardrobe: () => void;
  onOpenUpgrades: () => void;
  onOpenQuests: () => void;
  onOpenAchievements: () => void;
  onOpenMedalChest: () => void;
  onOpenLogin: () => void;
  onOpenDocs: () => void;
  onOpenMap: () => void;
  onOpenTutorial: () => void;
  onUpdateSavedData: (updated: UserSavedData) => void;
  /** When provided, the screen is embedded (Command Center) and shows a back button. */
  onBack?: () => void;
}

export const HomePlanetScreen: React.FC<HomePlanetScreenProps> = ({
  savedData,
  onStartGame,
  onOpenHomePlanet,
  onOpenMultiplayer,
  onOpenWardrobe,
  onOpenUpgrades,
  onOpenQuests,
  onOpenAchievements,
  onOpenMedalChest,
  onOpenLogin,
  onOpenDocs,
  onOpenMap,
  onOpenTutorial,
  onUpdateSavedData,
  onBack,
}) => {
  // -------------------------------------------------------------------------
  // Sim state
  // -------------------------------------------------------------------------
  const simRef = useRef<PlanetSimState | null>(null);
  const [sim, setSim] = useState<PlanetSimState>(() => {
    const existing = savedData.planetSim;
    const now = Date.now();
    const init =
      existing && existing.version === SIM_VERSION
        ? catchUpFromOffline(existing, now)
        : createInitialSimState(now);
    simRef.current = init;
    return init;
  });
  const [now, setNow] = useState<number>(Date.now());
  const [activeTab, setActiveTab] = useState<SimTab>('PLANET');
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const lastSaveRef = useRef<number>(Date.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const markersRef = useRef<MarkerHit[]>([]);
  const simViewRef = useRef(sim);
  const selectedViewRef = useRef(selectedRegionId);
  simViewRef.current = sim;
  selectedViewRef.current = selectedRegionId;

  const starDustBalance = savedData.totalStarDust || savedData.starDustCurrency || 0;
  const rates = computeRates(sim);
  const planetName = savedData.homePlanet?.name || 'Sanctuary Prime';

  // -------------------------------------------------------------------------
  // Persistence
  // -------------------------------------------------------------------------
  const persist = useCallback(
    (next: PlanetSimState) => {
      lastSaveRef.current = Date.now();
      const updated = StorageManager.saveData({ planetSim: next });
      onUpdateSavedData(updated);
    },
    [onUpdateSavedData]
  );

  // Persist on unmount (e.g. launching into a voyage)
  useEffect(() => {
    return () => {
      if (simRef.current) {
        StorageManager.saveData({ planetSim: simRef.current });
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // Simulation heartbeat
  // -------------------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      const s = simRef.current;
      if (!s) return;
      const ts = Date.now();
      const elapsed = Math.min(120, (ts - s.lastTickAt) / 1000);
      const next = tickSim(s, elapsed);
      simRef.current = next;
      setSim(next);
      setNow(ts);
      if (ts - lastSaveRef.current > 4000) {
        persist(next);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [persist]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const runAction = useCallback(
    (fn: (s: PlanetSimState) => ActionResult, title: string = 'Commander') => {
      const s = simRef.current;
      if (!s) return false;
      const res = fn(s);
      if (!res.ok) {
        audioEngine.playPowerUpExpired();
        showToast('GENERIC', title, res.msg);
        return false;
      }
      simRef.current = res.state;
      setSim(res.state);
      persist(res.state);
      audioEngine.playPowerUpCollect();
      showToast('SUCCESS', title, res.msg);
      return true;
    },
    [persist]
  );

  const runStarDustAction = useCallback(
    (cost: number, fn: (s: PlanetSimState) => ActionResult, title: string) => {
      const s = simRef.current;
      if (!s) return;
      const balance = savedData.totalStarDust || savedData.starDustCurrency || 0;
      if (balance < cost) {
        audioEngine.playPowerUpExpired();
        showToast('GENERIC', 'Not Enough Star Dust', `This order requires ${cost} Star Dust.`);
        return;
      }
      const res = fn(s);
      if (!res.ok) {
        audioEngine.playPowerUpExpired();
        showToast('GENERIC', title, res.msg);
        return;
      }
      simRef.current = res.state;
      setSim(res.state);
      const updated = StorageManager.saveData({
        planetSim: res.state,
        totalStarDust: balance - cost,
        starDustCurrency: balance - cost,
      });
      lastSaveRef.current = Date.now();
      onUpdateSavedData(updated);
      audioEngine.playUnlockSound();
      showToast('SUCCESS', title, res.msg);
    },
    [savedData, onUpdateSavedData]
  );

  const handleCollectExports = () => {
    const s = simRef.current;
    if (!s) return;
    const pool = Math.floor(s.exportPool);
    if (pool < 1) {
      audioEngine.playPowerUpExpired();
      showToast('GENERIC', 'Exports', 'Not enough Star Dust refined to collect yet.');
      return;
    }
    const next: PlanetSimState = { ...s, exportPool: s.exportPool - pool };
    simRef.current = next;
    setSim(next);
    const balance = savedData.totalStarDust || savedData.starDustCurrency || 0;
    const updated = StorageManager.saveData({
      planetSim: next,
      totalStarDust: balance + pool,
      starDustCurrency: balance + pool,
      totalStarDustAllTime: (savedData.totalStarDustAllTime || 0) + pool,
    });
    lastSaveRef.current = Date.now();
    onUpdateSavedData(updated);
    audioEngine.playPowerUpCollect();
    showToast('SUCCESS', 'Exports Collected', `+${pool} Star Dust transferred to your treasury!`);
  };

  const handleRegionClick = (regionId: string) => {
    audioEngine.playClick();
    setSelectedRegionId(regionId);
    setActiveTab('PLANET');
  };

  const handleLaunch = () => {
    if (simRef.current) StorageManager.saveData({ planetSim: simRef.current });
    audioEngine.playPowerUpCollect();
    onStartGame();
  };

  // -------------------------------------------------------------------------
  // Canvas rendering
  // -------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Static starfield
    const stars = Array.from({ length: 110 }, (_, i) => {
      const seed = Math.sin(i * 127.1) * 43758.5453;
      const fx = seed - Math.floor(seed);
      const seed2 = Math.sin(i * 311.7) * 12543.853;
      const fy = seed2 - Math.floor(seed2);
      return {
        x: fx * W,
        y: fy * H,
        r: 0.5 + ((i * 7) % 10) / 8,
        phase: i * 0.7,
      };
    });

    let raf = 0;

    const render = () => {
      const s = simViewRef.current;
      const selectedId = selectedViewRef.current;
      const t = performance.now() / 1000;

      // --- Space backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#060913');
      bgGrad.addColorStop(1, '#0b1022');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      for (const star of stars) {
        const tw = 0.55 + 0.45 * Math.sin(t * 1.4 + star.phase);
        ctx.fillStyle = `rgba(226,232,240,${0.25 + tw * 0.5})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * (0.7 + tw * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      const pollutionT = Math.min(1, s.pollution / 100);

      // --- Atmosphere glow
      const glowColor = lerpColor('#34d399', '#b45309', pollutionT);
      const glow = ctx.createRadialGradient(CX, CY, R * 0.85, CX, CY, R * 1.4);
      glow.addColorStop(0, glowColor.replace('rgb', 'rgba').replace(')', ',0.30)'));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(CX, CY, R * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // --- Moon
      const moonAngle = t * 0.12;
      const mx = CX + Math.cos(moonAngle) * R * 1.72;
      const my = CY + Math.sin(moonAngle) * R * 0.5 - R * 1.1;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(mx, my, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(mx - 3, my - 2, 2.2, 0, Math.PI * 2);
      ctx.arc(mx + 2, my + 3, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // --- Planet body
      const hiColor = lerpColor('#3fae7a', '#8a6b3f', pollutionT);
      const loColor = lerpColor('#0d4531', '#33210f', pollutionT);
      const body = ctx.createRadialGradient(CX - R * 0.4, CY - R * 0.45, R * 0.15, CX, CY, R);
      body.addColorStop(0, hiColor);
      body.addColorStop(1, loColor);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fill();

      // --- Region territories (soft colored patches)
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.clip();
      for (const def of REGION_DEFS) {
        const px = CX + Math.cos(def.angle) * R * 0.62;
        const py = CY + Math.sin(def.angle) * R * 0.62;
        const grad = ctx.createRadialGradient(px, py, 4, px, py, R * 0.42);
        grad.addColorStop(0, hexWithAlpha(def.color, 0.30));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, R * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
      // drifting cloud swirls
      ctx.globalAlpha = 0.10;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 7;
      for (let i = 0; i < 3; i++) {
        const ca = t * 0.05 + (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(CX, CY, R * (0.35 + i * 0.22), ca, ca + 1.7);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // --- Terminator shading
      const shade = ctx.createRadialGradient(CX + R * 0.55, CY + R * 0.6, R * 0.2, CX, CY, R * 1.05);
      shade.addColorStop(0, 'transparent');
      shade.addColorStop(1, 'rgba(2,6,23,0.55)');
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fill();

      // --- Pollution haze ring
      if (s.pollution > 30) {
        const hazeAlpha = Math.min(0.5, (s.pollution - 30) / 120);
        ctx.strokeStyle = `rgba(146, 95, 42, ${hazeAlpha})`;
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(CX, CY, R * 1.02, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- Aegis shield bubble
      if (s.defense.shieldGen > 0) {
        const sa = 0.12 + s.defense.shieldGen * 0.07 + Math.sin(t * 2) * 0.03;
        ctx.strokeStyle = `rgba(56, 189, 248, ${sa + 0.2})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([14, 8]);
        ctx.lineDashOffset = -t * 20;
        ctx.beginPath();
        ctx.arc(CX, CY, R * 1.1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // --- Orbital turret satellites
      const satCount = s.defense.turretGrid * 2;
      for (let i = 0; i < satCount; i++) {
        const ang = t * 0.35 + (i * Math.PI * 2) / Math.max(1, satCount);
        const sx = CX + Math.cos(ang) * R * 1.18;
        const sy = CY + Math.sin(ang) * R * 1.18;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(ang + Math.PI / 4);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();
      }

      // --- Frigates on patrol
      const shipCount = Math.min(s.fleet.frigates, 8);
      for (let i = 0; i < shipCount; i++) {
        const ang = -t * 0.25 + (i * Math.PI * 2) / Math.max(1, shipCount);
        const fx = CX + Math.cos(ang) * R * 1.3;
        const fy = CY + Math.sin(ang) * R * 1.3;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(ang + Math.PI / 2);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(4, 5);
        ctx.lineTo(-4, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // --- Ally / integrated faction ships
      const orbiters = s.factions.filter((f) => f.status === 'ALLIED' || f.status === 'INTEGRATED');
      orbiters.forEach((f, i) => {
        const def = REGION_DEFS[0];
        void def;
        const ang = t * (0.18 + i * 0.05) + i * 2.1;
        const ox = CX + Math.cos(ang) * R * 1.45;
        const oy = CY + Math.sin(ang) * R * 1.45;
        ctx.fillStyle = hexWithAlpha(
          ['#facc15', '#4ade80', '#60a5fa', '#f87171', '#fb7185'][i % 5],
          0.85
        );
        ctx.beginPath();
        ctx.arc(ox, oy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const iconMap: Record<string, string> = {
          LUMINARI: '✨',
          VERDANT_CIRCLE: '🌿',
          TRADE_GUILD: '🪙',
          VOID_RAIDERS: '☠️',
          ASH_LEGION: '🔥',
        };
        ctx.fillText(iconMap[f.id] || '🛸', ox, oy - 11);
      });

      // --- Region markers
      const hits: MarkerHit[] = [];
      for (const def of REGION_DEFS) {
        const region = s.regions.find((r) => r.id === def.id);
        const mxp = CX + Math.cos(def.angle) * R * 0.62;
        const myp = CY + Math.sin(def.angle) * R * 0.62;
        hits.push({ id: def.id, x: mxp, y: myp });
        const isSelected = selectedId === def.id;

        // pulse ring for selection
        if (isSelected) {
          const pulse = 1 + Math.sin(t * 4) * 0.08;
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(mxp, myp, MARKER_R * pulse + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // marker disc
        ctx.fillStyle = 'rgba(2,6,23,0.82)';
        ctx.beginPath();
        ctx.arc(mxp, myp, MARKER_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = hexWithAlpha(def.color, isSelected ? 1 : 0.75);
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        const markerIconUrl = simIcon(def.id);
        const markerIconImg = markerIconUrl ? getArtImage(markerIconUrl) : null;
        if (markerIconImg && markerIconImg.complete && markerIconImg.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(mxp, myp, MARKER_R * 0.86, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            markerIconImg,
            mxp - MARKER_R * 0.86,
            myp - MARKER_R * 0.86,
            MARKER_R * 1.72,
            MARKER_R * 1.72
          );
          ctx.restore();
        } else {
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def.icon, mxp, myp + 1);
        }

        // development badge
        ctx.fillStyle = 'rgba(2,6,23,0.9)';
        ctx.beginPath();
        ctx.arc(mxp - MARKER_R * 0.82, myp - MARKER_R * 0.82, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = hexWithAlpha(def.color, 0.7);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(`${region?.development || 1}`, mxp - MARKER_R * 0.82, myp - MARKER_R * 0.82 + 0.5);

        // explore-ready beacon
        const exploreReady = Date.now() - (region?.lastExploredAt || 0) >= 90_000;
        if (exploreReady) {
          const blip = 0.6 + Math.sin(t * 3 + def.angle) * 0.4;
          ctx.fillStyle = `rgba(52, 211, 153, ${blip})`;
          ctx.beginPath();
          ctx.arc(mxp + MARKER_R * 0.82, myp - MARKER_R * 0.82, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // label
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const label = def.name;
        const ly = myp + MARKER_R + 11;
        ctx.fillStyle = 'rgba(2,6,23,0.7)';
        const tw = ctx.measureText(label).width;
        ctx.fillRect(mxp - tw / 2 - 4, ly - 7, tw + 8, 13);
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(226,232,240,0.85)';
        ctx.fillText(label, mxp, ly);
      }
      markersRef.current = hits;

      // --- Raid warning overlay
      if (s.nextRaidAt > 0 && s.nextRaidAt - Date.now() < 60_000) {
        const blink = 0.35 + Math.abs(Math.sin(t * 5)) * 0.35;
        ctx.strokeStyle = `rgba(244, 63, 94, ${blink})`;
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, W - 6, H - 6);
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(254, 205, 211, ${0.7 + blink * 0.3})`;
        ctx.fillText(
          `⚠️ RAID IMMINENT — ${formatDuration(s.nextRaidAt - Date.now())}`,
          CX,
          24
        );
      }

      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, []);

  const canvasPosFromEvent = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = canvasPosFromEvent(e);
    for (const m of markersRef.current) {
      const d = Math.hypot(m.x - x, m.y - y);
      if (d <= MARKER_R + 8) {
        handleRegionClick(m.id);
        return;
      }
    }
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = canvasPosFromEvent(e);
    const hovered = markersRef.current.some((m) => Math.hypot(m.x - x, m.y - y) <= MARKER_R + 8);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  // -------------------------------------------------------------------------
  // Alert derivation
  // -------------------------------------------------------------------------
  const raidSoon = sim.nextRaidAt > 0 && sim.nextRaidAt - now < 90_000;
  let alert: { msg: string; tone: 'red' | 'amber' } | null = null;
  if (raidSoon) {
    alert = { msg: `⚔️ Hostile raid incoming in ${formatDuration(sim.nextRaidAt - now)} — check the War Room!`, tone: 'red' };
  } else if (sim.pollution >= 70) {
    alert = { msg: '☣️ Pollution critical! Citizens suffer. Build Carbon Scrubbers or Starlight Groves.', tone: 'red' };
  } else if (rates.efficiency < 1) {
    alert = { msg: '🔌 Energy brown-out! Structures are running at reduced efficiency — build Solar Arrays.', tone: 'amber' };
  } else if (rates.food < 0) {
    alert = { msg: '🍽️ Food deficit! Your population will starve — build Hydro Farms in the Heartland.', tone: 'amber' };
  } else if (sim.pollution >= 45) {
    alert = { msg: '🏭 Smog is rising. Industry pays well, but the air is paying more.', tone: 'amber' };
  }

  const pollutionLabel =
    sim.pollution < 25 ? 'Clean' : sim.pollution < 50 ? 'Fair' : sim.pollution < 70 ? 'Smoggy' : 'Toxic';
  const pollutionTone =
    sim.pollution < 25
      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
      : sim.pollution < 50
      ? 'bg-lime-950/60 border-lime-500/40 text-lime-300'
      : sim.pollution < 70
      ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
      : 'bg-rose-950/60 border-rose-500/50 text-rose-300';

  const selectedRegion = sim.regions.find((r) => r.id === selectedRegionId) || null;

  const TABS: { id: SimTab; label: string; icon: React.ReactNode }[] = [
    { id: 'PLANET', label: 'Planet', icon: <Globe2 className="w-3.5 h-3.5" /> },
    { id: 'DIPLOMACY', label: 'Diplomacy', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'WAR', label: 'War Room', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'LOG', label: 'Chronicle', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-slate-950 text-white ui-interactive overflow-hidden select-none">
      {/* Ambient background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 mix-blend-screen">
        <img src={mainBgUrl} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 z-0 bg-slate-950/55 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* ---------------------------------------------------------------- */}
        {/* Header: planet identity + vitals                                 */}
        {/* ---------------------------------------------------------------- */}
        <div className="shrink-0 px-2.5 pt-2 pb-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {onBack && (
                <button
                  onClick={() => {
                    audioEngine.playMenuClick();
                    onBack();
                  }}
                  className="shrink-0 flex items-center gap-1 bg-slate-900/90 border border-slate-700 text-slate-200 text-[10px] font-bold px-2 py-1.5 rounded-xl hover:bg-slate-800 transition"
                >
                  ⬅ <span>Street</span>
                </button>
              )}
              <div className="w-8 h-8 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Globe2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h1 className="text-sm font-black text-white truncate">{planetName}</h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 uppercase tracking-wider shrink-0">
                    {planetTitle(sim)}
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 truncate">
                  Home world · {totalDevelopment(sim)} total development · click a region to manage it
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  audioEngine.playMenuClick();
                  onOpenHomePlanet();
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 transition"
                title="Open your Sanctuary — garden, habitat, decor & the space traveler"
              >
                🏡 Sanctuary
              </button>
              <button
                onClick={() => {
                  audioEngine.playMenuClick();
                  onOpenLogin();
                }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white transition"
              >
                Account
              </button>
            </div>
          </div>

          {/* Resource strip */}
          <div className="grid grid-cols-5 gap-1 mt-1.5 text-center">
            <div className="bg-slate-900/85 border border-slate-800 rounded-xl py-1 px-0.5">
              <span className="text-[8px] text-yellow-400 font-bold uppercase tracking-wider block">⚡ Energy</span>
              <span className="text-[11px] font-black text-white font-mono">{fmt(sim.resources.energy)}</span>
              <span className={`block text-[8px] font-mono ${rates.energy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{rateFmt(rates.energy)}</span>
            </div>
            <div className="bg-slate-900/85 border border-slate-800 rounded-xl py-1 px-0.5">
              <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider block">⚙️ Materials</span>
              <span className="text-[11px] font-black text-white font-mono">{fmt(sim.resources.materials)}</span>
              <span className={`block text-[8px] font-mono ${rates.materials >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{rateFmt(rates.materials)}</span>
            </div>
            <div className="bg-slate-900/85 border border-slate-800 rounded-xl py-1 px-0.5">
              <span className="text-[8px] text-lime-400 font-bold uppercase tracking-wider block">🌾 Food</span>
              <span className="text-[11px] font-black text-white font-mono">{fmt(sim.resources.food)}</span>
              <span className={`block text-[8px] font-mono ${rates.food >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{rateFmt(rates.food)}</span>
            </div>
            <div className="bg-slate-900/85 border border-slate-800 rounded-xl py-1 px-0.5">
              <span className="text-[8px] text-sky-400 font-bold uppercase tracking-wider block">👥 Pop</span>
              <span className="text-[11px] font-black text-white font-mono">{fmt(sim.population)}</span>
              <span className="block text-[8px] font-mono text-slate-400">cap {rates.popCap}</span>
            </div>
            <div className="bg-slate-900/85 border border-slate-800 rounded-xl py-1 px-0.5">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">🛡️ Defense</span>
              <span className="text-[11px] font-black text-white font-mono">{rates.defenseRating}</span>
              <span className="block text-[8px] font-mono text-rose-400">
                {sim.nextRaidAt > 0 ? `raid ${formatDuration(Math.max(0, sim.nextRaidAt - now))}` : 'no threat'}
              </span>
            </div>
          </div>

          {/* Status strip: pollution + exports + treasury */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`text-[9px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 ${pollutionTone}`}>
              {sim.pollution < 45 ? <Leaf className="w-3 h-3" /> : <Factory className="w-3 h-3" />}
              Pollution {Math.round(sim.pollution)}% · {pollutionLabel}
            </span>
            <button
              onClick={handleCollectExports}
              disabled={Math.floor(sim.exportPool) < 1}
              className={`text-[9px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 transition ${
                Math.floor(sim.exportPool) >= 1
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 hover:bg-amber-500/30 animate-pulse'
                  : 'bg-slate-900/80 border-slate-800 text-slate-500'
              }`}
              title="Collect refined Star Dust exports into your treasury"
            >
              <Sparkles className="w-3 h-3" />
              Exports {sim.exportPool.toFixed(1)}✨ — Collect
            </button>
            <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-amber-950/50 border border-amber-500/40 text-amber-300 flex items-center gap-1 ml-auto">
              <Sparkles className="w-3 h-3" /> Treasury {starDustBalance.toLocaleString()}✨
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Planet canvas                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div className="relative shrink-0 px-2.5">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            className="w-full rounded-2xl border border-slate-800/80 shadow-xl shadow-slate-950/60 touch-manipulation"
            style={{ aspectRatio: `${W}/${H}` }}
          />
          {alert && (
            <div
              className={`absolute bottom-4 left-4 right-4 text-[10px] font-bold px-3 py-1.5 rounded-xl border backdrop-blur-sm ${
                alert.tone === 'red'
                  ? 'bg-rose-950/85 border-rose-500/60 text-rose-200 animate-pulse'
                  : 'bg-amber-950/85 border-amber-500/50 text-amber-200'
              }`}
            >
              {alert.msg}
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Tabs                                                             */}
        {/* ---------------------------------------------------------------- */}
        <div className="shrink-0 flex items-center gap-1 px-2.5 pt-2 pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                audioEngine.playClick();
                setActiveTab(tab.id);
                if (tab.id !== 'PLANET') setSelectedRegionId(null);
              }}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition border ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                  : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Panel content                                                    */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 pb-2">
          {activeTab === 'PLANET' && selectedRegion && (
            <RegionPanel
              sim={sim}
              region={selectedRegion}
              now={now}
              onDevelop={(id) => runAction((s) => developRegion(s, id), 'Development')}
              onBuild={(rid, sid) => runAction((s) => buildStructure(s, rid, sid), 'Construction')}
              onExplore={(id) => runAction((s) => exploreRegion(s, id), 'Expedition')}
            />
          )}

          {activeTab === 'PLANET' && !selectedRegion && (
            <PlanetOverview sim={sim} rates={rates} now={now} />
          )}

          {activeTab === 'DIPLOMACY' && (
            <DiplomacyPanel
              sim={sim}
              now={now}
              starDustBalance={starDustBalance}
              onEnvoy={(id) => runAction((s) => sendEnvoy(s, id), 'Diplomacy')}
              onTribute={(id) => runAction((s) => sendTribute(s, id), 'Diplomacy')}
              onAlliance={(id) => runAction((s) => formAlliance(s, id), 'Alliance')}
              onTruce={(id) =>
                runStarDustAction(TRUCE_COST_STARDUST, (s) => negotiateTruce(s, id), 'Truce')
              }
              onIntegrate={(id) =>
                runStarDustAction(INTEGRATE_COST_STARDUST, (s) => integrateFaction(s, id), 'Surrender')
              }
            />
          )}

          {activeTab === 'WAR' && (
            <WarRoomPanel
              sim={sim}
              now={now}
              onBuildDefense={(key) => runAction((s) => buildDefense(s, key), 'Defense Command')}
              onBuildFrigate={(count) => runAction((s) => buildFrigate(s, count), 'Shipyard')}
              onStrike={(id) => {
                audioEngine.playMenuClick();
                runAction((s) => launchStrike(s, id), 'Strike Command');
              }}
            />
          )}

          {activeTab === 'LOG' && <LogPanel sim={sim} />}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Bottom action bar — back into the classic game                   */}
        {/* ---------------------------------------------------------------- */}
        {!onBack && (
        <div className="shrink-0 px-2.5 pb-2 pt-1 space-y-1.5 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
          <div className="flex gap-1.5">
            <button
              onClick={handleLaunch}
              className="relative overflow-hidden flex-1 bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 hover:from-sky-400 hover:via-emerald-400 hover:to-amber-400 text-slate-950 font-black text-sm py-2.5 px-3 rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(56,189,248,0.35)] flex items-center justify-center gap-2 btn-grow"
            >
              <Play className="w-4 h-4 fill-current" />
              <span className="tracking-wider uppercase">Launch Voyage</span>
            </button>
            <button
              onClick={() => {
                audioEngine.playPowerUpCollect();
                onOpenMultiplayer();
              }}
              className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-black text-xs px-3 rounded-2xl transition-all flex items-center gap-1.5 border border-indigo-400/40"
            >
              <Swords className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline uppercase tracking-wide">Arena</span>
            </button>
          </div>

          <div className="grid grid-cols-8 gap-1">
            {[
              { icon: <Compass className="w-4 h-4 text-sky-400" />, label: 'Map', fn: onOpenMap },
              { icon: <ShoppingBag className="w-4 h-4 text-sky-300" />, label: 'Hangar', fn: onOpenWardrobe },
              { icon: <Zap className="w-4 h-4 text-amber-300" />, label: 'Tech', fn: onOpenUpgrades },
              { icon: <Target className="w-4 h-4 text-emerald-300" />, label: 'Quests', fn: onOpenQuests },
              { icon: <Trophy className="w-4 h-4 text-yellow-300" />, label: 'Badges', fn: onOpenAchievements },
              { icon: <Award className="w-4 h-4 text-amber-400" />, label: 'Medals', fn: onOpenMedalChest },
              { icon: <AlertTriangle className="w-4 h-4 text-slate-400" />, label: 'Guide', fn: onOpenTutorial },
              { icon: <FileText className="w-4 h-4 text-sky-400" />, label: 'Settings', fn: onOpenDocs },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => {
                  audioEngine.playMenuClick();
                  btn.fn();
                }}
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-600 text-slate-300 transition btn-grow-sm"
                title={btn.label}
              >
                {btn.icon}
                <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Planet overview (PLANET tab without a selected region)
// ---------------------------------------------------------------------------

const PlanetOverview: React.FC<{
  sim: PlanetSimState;
  rates: ReturnType<typeof computeRates>;
  now: number;
}> = ({ sim, rates, now }) => {
  const totalDev = totalDevelopment(sim);
  return (
    <div className="space-y-3">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
        <h3 className="text-xs font-bold text-white mb-1.5">🪐 Planetary Overview</h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Tap any region on the planet above to explore it, develop its territory, and raise structures.
          Grow your population, keep the air clean, court allies, and hold off the enemies circling your world.
        </p>

        {/* Pollution meter */}
        <div className="mt-3">
          <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-0.5">
            <span>Atmospheric Pollution</span>
            <span>{Math.round(sim.pollution)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                sim.pollution < 40 ? 'bg-emerald-400' : sim.pollution < 70 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${sim.pollution}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-500 mt-1">
            {rates.pollution >= 0
              ? 'Pollution is rising — industry and population produce smog. Scrubbers and groves fight back.'
              : 'Pollution is falling — the atmosphere is recovering.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-lg font-black text-emerald-400 block">{totalDev}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Development</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-lg font-black text-sky-400 block">{sim.stats.explores}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Expeditions Flown</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-lg font-black text-amber-400 block">{sim.stats.raidsSurvived}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Raids Survived</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
          <span className="text-lg font-black text-purple-400 block">
            {sim.stats.alliancesFormed + sim.stats.factionsIntegrated}
          </span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Factions Won Over</span>
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 space-y-1.5">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commander's Handbook</h4>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          🌱 <b className="text-slate-300">Growth</b> — Develop regions to raise output and unlock structures. Domes raise population cap; citizens staff your economy.
        </p>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          🏭 <b className="text-slate-300">Pollution</b> — Foundries and extractors smog the sky. Above 40% crops suffer, above 70% growth stalls, above 85% citizens leave.
        </p>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          🤝 <b className="text-slate-300">Diplomacy</b> — Envoys and tribute win friends; alliances grant permanent bonuses. Enemies can be bought off with truces… or broken with your fleet.
        </p>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          ⚔️ <b className="text-slate-300">War</b> — The War Room builds defenses and frigates. Raid timers are shown there; strike enemies to loot them and force their surrender.
        </p>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          ✨ <b className="text-slate-300">Star Dust</b> — Labs and trade beacons refine exports. Collect the pool to fund diplomacy — it's the same Star Dust you use across your voyages.
        </p>
      </div>

      <p className="text-[9px] text-slate-600 text-center flex items-center justify-center gap-1">
        <ArrowDownToDot className="w-3 h-3" /> The simulation keeps ticking while you're away (up to 4 hours).
      </p>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  Telescope, 
  Sparkles, 
  X, 
  Compass, 
  Globe, 
  Camera, 
  Scan, 
  ChevronRight, 
  Info, 
  Award, 
  Sun, 
  ShieldAlert, 
  Eye, 
  Volume2, 
  VolumeX,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { Planet } from '../entities/Planet';
import { ConstellationData, ConstellationStar, PlanetType } from '../types/game';
import { audioEngine } from '../core/AudioEngine';
import { getStarGazingWeather, StarGazingWeatherConfig } from '../core/Config';
import { 
  CloudRain, 
  Wind, 
  Flame, 
  Zap, 
  Sparkle, 
  Layers as LayersIcon,
  Activity
} from 'lucide-react';

interface StarGazingModalProps {
  planet: Planet | null;
  altitude: number;
  constellation: ConstellationData | null;
  onClose: () => void;
  onRewardClaimed?: (stars: number, diamonds: number, starDust: number) => void;
}

interface CelestialObject {
  id: string;
  name: string;
  latinName: string;
  spectralClass: string;
  distanceLightYears: number;
  apparentMagnitude: number;
  constellationRegion: string;
  lore: string;
  astralBuff: string;
  color: string;
  x: number; // 0..1 in sky panorama
  y: number; // 0..1 in sky panorama
  size: number;
}

const CELESTIAL_STARS_CATALOG: CelestialObject[] = [
  {
    id: 'star_sirius',
    name: 'Sirius (Alpha Canis Majoris)',
    latinName: 'The Brilliant Binary',
    spectralClass: 'A1V (White-Blue Main Sequence)',
    distanceLightYears: 8.6,
    apparentMagnitude: -1.46,
    constellationRegion: 'Canis Major Corridor',
    lore: 'The brightest star in the night sky, a luminous binary system illuminating the celestial horizon.',
    astralBuff: '+15% Slingshot Velocity & +20% Starlight Radius',
    color: '#e0f2fe',
    x: 0.18,
    y: 0.32,
    size: 5.5
  },
  {
    id: 'star_betelgeuse',
    name: 'Betelgeuse (Alpha Orionis)',
    latinName: 'The Pulsing Red Supergiant',
    spectralClass: 'M1-2 (Red Supergiant)',
    distanceLightYears: 642.5,
    apparentMagnitude: 0.50,
    constellationRegion: 'Orion Supercluster',
    lore: 'A pulsing red supergiant destined to explode in a glorious supernova over the next 100,000 years.',
    astralBuff: '+25% Solar Resistance & Comet Burst Duration',
    color: '#f97316',
    x: 0.42,
    y: 0.22,
    size: 6.8
  },
  {
    id: 'star_vega',
    name: 'Vega (Alpha Lyrae)',
    latinName: 'The Sapphire Beacon',
    spectralClass: 'A0V (Blue-White)',
    distanceLightYears: 25.0,
    apparentMagnitude: 0.03,
    constellationRegion: 'Lyra Harmonic Sphere',
    lore: 'The fifth brightest star in the sky, famous as the celestial anchor of the Summer Triangle.',
    astralBuff: '+10% All Currency Magnet Harvest Rate',
    color: '#38bdf8',
    x: 0.68,
    y: 0.28,
    size: 5.2
  },
  {
    id: 'star_polaris',
    name: 'Polaris (Alpha Ursae Minoris)',
    latinName: 'The North Celestial Beacon',
    spectralClass: 'F7Ib (Yellow Supergiant Variable)',
    distanceLightYears: 433.8,
    apparentMagnitude: 1.98,
    constellationRegion: 'Ursa Minor Meridian',
    lore: 'The steadfast navigational lighthouse of ancient cosmonauts, aligning cosmic orbits precisely.',
    astralBuff: '+1 Free Orbital Rewind Recovery Charge',
    color: '#fef08a',
    x: 0.85,
    y: 0.18,
    size: 4.8
  },
  {
    id: 'star_rigel',
    name: 'Rigel (Beta Orionis)',
    latinName: 'The Seventh Star of Orion',
    spectralClass: 'B8Ia (Blue Supergiant)',
    distanceLightYears: 860.0,
    apparentMagnitude: 0.13,
    constellationRegion: 'Orion Stellar Belt',
    lore: 'Radiates with the luminous brilliance of over 120,000 suns across deep intergalactic space.',
    astralBuff: '+20% Jetpack Overdrive Propulsion',
    color: '#93c5fd',
    x: 0.32,
    y: 0.55,
    size: 6.0
  },
  {
    id: 'star_aldebaran',
    name: 'Aldebaran (Alpha Tauri)',
    latinName: 'The Golden Giant',
    spectralClass: 'K5III (Orange Giant)',
    distanceLightYears: 65.3,
    apparentMagnitude: 0.85,
    constellationRegion: 'Hyades Galactic Sector',
    lore: 'An ancient orange giant staring fiercely down the celestial ecliptic highway.',
    astralBuff: '+15% Diamond Drop Chance on Slingshots',
    color: '#fb923c',
    x: 0.52,
    y: 0.48,
    size: 5.4
  }
];

export const StarGazingModal: React.FC<StarGazingModalProps> = ({
  planet,
  altitude,
  constellation,
  onClose,
  onRewardClaimed
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'SKY' | 'PLANET' | 'PHOTO'>('SKY');
  const [selectedStar, setSelectedStar] = useState<CelestialObject | null>(CELESTIAL_STARS_CATALOG[0]);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanResult, setScanResult] = useState<{ stars: number; diamonds: number; starDust: number } | null>(null);
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [weatherInfoOpen, setWeatherInfoOpen] = useState(false);

  // Surface telemetry calculations
  const planetType = planet?.type || 'STANDARD';
  const radius = planet?.radius || 60;
  const gravityG = ((planet?.mass || 500) / 450).toFixed(2);
  const tempC = planetType === 'ICE' ? -185 : planetType === 'MAGMA' || planetType === 'SUN' ? 950 : planetType === 'PLASMA' ? 1400 : 21;
  const atmosphereComposition = 
    planetType === 'ICE' ? '92% Nitrogen, 6% Methane, 2% Frozen Argon' :
    planetType === 'MAGMA' ? '68% Carbon Dioxide, 24% Sulfur Vapor, 8% Silicate Ash' :
    planetType === 'PLASMA' ? '99% Ionized Hydrogen & Helium Superplasma' :
    planetType === 'DARK' ? '74% Exotic Dark Matter, 26% Null Gravitons' :
    '78% Nitrogen, 21% Oxygen, 1% Noble Gases';

  const weatherConfig: StarGazingWeatherConfig = getStarGazingWeather(planetType);

  const weatherParticlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    pulseSpeed: number;
    angle: number;
    color: string;
    aux?: number;
  }>>([]);

  // Initialize weather particles
  useEffect(() => {
    const particles = [];
    const count = weatherConfig.particleCount;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.002 * weatherConfig.speed,
        vy: (Math.random() * 0.003 + 0.001) * weatherConfig.speed,
        size: Math.random() * 3 + 1.5,
        alpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? weatherConfig.ambientColor : weatherConfig.secondaryColor,
        aux: Math.random() * 100
      });
    }
    weatherParticlesRef.current = particles;
  }, [planetType]);

  // Start Procedural Ambient Soundscape on modal mount & cleanup on unmount
  useEffect(() => {
    audioEngine.startStarGazingAmbience(planetType, radius, {
      spinSpeed: (planet as any)?.spinSpeed,
      isHabitable: planetType === 'GRASS' || planetType === 'STANDARD'
    });

    return () => {
      audioEngine.stopStarGazingAmbience();
    };
  }, [planetType, radius]);

  // Render 360 Sky Panorama Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.015;
      const w = canvas.width;
      const h = canvas.height;

      // Deep space atmospheric sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(0.5, '#070f2b');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Nebula atmospheric glow clouds
      ctx.save();
      const nebulaColor = constellation?.elementColor || '#38bdf8';
      const nebGrad = ctx.createRadialGradient(
        w * 0.5 + panOffset.x * 0.4, 
        h * 0.4 + panOffset.y * 0.4, 
        20, 
        w * 0.5 + panOffset.x * 0.4, 
        h * 0.4 + panOffset.y * 0.4, 
        w * 0.45
      );
      nebGrad.addColorStop(0, `${nebulaColor}33`);
      nebGrad.addColorStop(0.6, `${nebulaColor}11`);
      nebGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // ==========================================
      // PROCEDURAL ATMOSPHERIC WEATHER EFFECTS
      // ==========================================
      const pType = weatherConfig.particleType;
      const particles = weatherParticlesRef.current;

      // 1. Shimmering Aurora Curtains (Gas Giants, Ice, Celestial)
      if (pType === 'AURORA_WAVES' || pType === 'CRYSTAL_FLURRIES') {
        ctx.save();
        for (let layer = 0; layer < 3; layer++) {
          const waveGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
          const col1 = layer === 0 ? weatherConfig.ambientColor : weatherConfig.secondaryColor;
          const col2 = layer === 1 ? '#38bdf8' : '#ec4899';
          waveGrad.addColorStop(0, 'transparent');
          waveGrad.addColorStop(0.4, `${col1}33`);
          waveGrad.addColorStop(0.7, `${col2}44`);
          waveGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = waveGrad;
          ctx.beginPath();
          ctx.moveTo(0, h * 0.5);

          const yBase = h * (0.22 + layer * 0.12) + panOffset.y * 0.15;
          for (let x = 0; x <= w; x += 15) {
            const wave1 = Math.sin((x + panOffset.x * 0.5) * 0.008 + time * (1.2 + layer * 0.4)) * 30;
            const wave2 = Math.cos((x + panOffset.x * 0.3) * 0.015 - time * (0.8 + layer * 0.3)) * 18;
            ctx.lineTo(x, yBase + wave1 + wave2);
          }
          ctx.lineTo(w, h * 0.7);
          ctx.lineTo(0, h * 0.7);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Quantum Void Graviton Ripples (Dark/Antimatter)
      if (pType === 'VOID_RIPPLES') {
        ctx.save();
        for (let r = 0; r < 3; r++) {
          const ringX = w * (0.3 + r * 0.25) + panOffset.x * 0.2;
          const ringY = h * (0.35 + r * 0.15) + panOffset.y * 0.2;
          const radiusPulse = ((time * 20 + r * 50) % 120) + 15;
          const ringAlpha = Math.max(0, 1 - radiusPulse / 135) * 0.45;

          ctx.strokeStyle = weatherConfig.ambientColor;
          ctx.globalAlpha = ringAlpha;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ringX, ringY, radiusPulse, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. Ionized Plasma Lightning Arcs (Plasma/Electric)
      if (pType === 'PLASMA_ARCS' && Math.sin(time * 6) > 0.82) {
        ctx.save();
        ctx.strokeStyle = Math.random() > 0.5 ? '#67e8f9' : '#f472b6';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        let lx = (w * 0.5 + (Math.sin(time * 12) * w * 0.35) + panOffset.x) % w;
        let ly = h * 0.1 + panOffset.y * 0.1;
        ctx.moveTo(lx, ly);
        for (let seg = 0; seg < 6; seg++) {
          lx += (Math.random() - 0.5) * 45;
          ly += 30 + Math.random() * 20;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 4. Update & Render Weather Particles (Space Dust, Crystals, Embers, Spores)
      ctx.save();
      particles.forEach((p, idx) => {
        // Position update
        if (pType === 'VOLCANIC_EMBERS') {
          // Embers rise upward with turbulent sway
          p.y -= (p.vy + 0.001);
          p.x += Math.sin(time * 3 + p.aux!) * 0.001;
        } else if (pType === 'SPACE_DUST') {
          // Space dust drifts horizontally with solar wind
          p.x += (p.vx + 0.002);
          p.y += Math.sin(time * 2 + p.aux!) * 0.0006;
        } else {
          // Default downward drift with wind sway
          p.y += p.vy;
          p.x += Math.sin(time * p.pulseSpeed + p.aux!) * 0.0012;
        }

        // Screen wrap
        if (p.x < 0) p.x += 1;
        if (p.x > 1) p.x -= 1;
        if (p.y < 0) p.y += 1;
        if (p.y > 1) p.y -= 1;

        const px = p.x * w + panOffset.x * 0.25;
        const py = p.y * h + panOffset.y * 0.25;
        const pulse = Math.sin(time * p.pulseSpeed + idx) * 0.3 + 0.7;
        const currentAlpha = p.alpha * pulse;

        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;

        if (pType === 'CRYSTAL_FLURRIES') {
          // Diamond frost crystal
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(time * 0.8 + idx);
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.5);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size * 1.5);
          ctx.lineTo(-p.size, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (pType === 'VOLCANIC_EMBERS') {
          // Glowing flame ember with trailing glow
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, p.size * pulse, 0, Math.PI * 2);
          ctx.fill();
        } else if (pType === 'SPACE_DUST') {
          // Sparkling stardust glint
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.9, 0, Math.PI * 2);
          ctx.fill();
          if (idx % 4 === 0) {
            // Horizontal micro glint line
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px - p.size * 2, py);
            ctx.lineTo(px + p.size * 2, py);
            ctx.stroke();
          }
        } else {
          // Bioluminescent spore or graviton
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // Background dense twinkling stars (with parallax)
      ctx.save();
      for (let i = 0; i < 90; i++) {
        const sx = ((i * 73 + panOffset.x * 0.3) % w + w) % w;
        const sy = ((i * 127 + panOffset.y * 0.3) % h + h) % h;
        const twinkle = Math.sin(time * 2.5 + i) * 0.5 + 0.5;
        const starSize = (i % 3 === 0 ? 2.2 : 1.2) * (0.7 + twinkle * 0.5);

        ctx.fillStyle = i % 5 === 0 ? '#bae6fd' : i % 7 === 0 ? '#fef08a' : '#ffffff';
        ctx.globalAlpha = 0.35 + twinkle * 0.55;
        ctx.beginPath();
        ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Constellation Connecting Lines
      if (constellation && constellation.stars && constellation.stars.length > 0) {
        ctx.save();
        ctx.strokeStyle = `${nebulaColor}88`;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 4]);

        const cStars = constellation.stars;
        const cLines = constellation.lines || [];

        cLines.forEach(([s1, s2]) => {
          const starA = cStars[s1];
          const starB = cStars[s2];
          if (starA && starB) {
            const ax = w * (0.2 + starA.x * 0.6) + panOffset.x;
            const ay = h * (0.15 + starA.y * 0.5) + panOffset.y;
            const bx = w * (0.2 + starB.x * 0.6) + panOffset.x;
            const by = h * (0.15 + starB.y * 0.5) + panOffset.y;

            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        });
        ctx.restore();
      }

      // Catalog Major Celestial Stars
      CELESTIAL_STARS_CATALOG.forEach((star) => {
        const starX = w * star.x + panOffset.x;
        const starY = h * star.y + panOffset.y;
        const isSelected = selectedStar?.id === star.id;
        const pulse = Math.sin(time * 3 + star.distanceLightYears) * 0.3 + 0.7;

        ctx.save();
        // Selection reticle ring
        if (isSelected) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(starX, starY, star.size + 10 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
          ctx.stroke();

          // Outer crosshair brackets
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(starX - 18, starY); ctx.lineTo(starX - 12, starY);
          ctx.moveTo(starX + 18, starY); ctx.lineTo(starX + 12, starY);
          ctx.moveTo(starX, starY - 18); ctx.lineTo(starX, starY - 12);
          ctx.moveTo(starX, starY + 18); ctx.lineTo(starX, starY + 12);
          ctx.stroke();
        }

        // Star corona halo
        const haloGrad = ctx.createRadialGradient(starX, starY, 0, starX, starY, star.size * 3.5);
        haloGrad.addColorStop(0, star.color);
        haloGrad.addColorStop(0.4, `${star.color}66`);
        haloGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(starX, starY, star.size * 3.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Star solid bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(starX, starY, star.size * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Star Label
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(224, 242, 254, 0.8)';
        ctx.font = isSelected ? 'bold 11px system-ui' : '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(star.name.split(' ')[0], starX, starY + star.size + 14);

        ctx.restore();
      });

      // Planet Horizon Surface Silhouette (at bottom of star gaze sky)
      ctx.save();
      const horizonY = h * 0.88 + panOffset.y * 0.2;
      const planetColor = planet?.color || '#22c55e';
      const planetSec = planet?.secondaryColor || '#15803d';

      const horizGrad = ctx.createLinearGradient(0, horizonY - 30, 0, h);
      horizGrad.addColorStop(0, 'transparent');
      horizGrad.addColorStop(0.3, `${planetColor}44`);
      horizGrad.addColorStop(1, planetSec);
      ctx.fillStyle = horizGrad;

      ctx.beginPath();
      ctx.ellipse(w * 0.5, horizonY + w * 0.6, w * 0.8, w * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric surface glow line
      ctx.strokeStyle = planetColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = planetColor;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(w * 0.5, horizonY + w * 0.6, w * 0.8, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [panOffset, selectedStar, constellation, planet]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = Math.max(-120, Math.min(80, e.clientY - dragStart.y));
    setPanOffset({
      x: newX,
      y: newY
    });

    // Modulate spatial soundscape pan & filter based on gaze angle
    const canvas = canvasRef.current;
    if (canvas) {
      const azimuthRatio = (newX % canvas.width) / canvas.width;
      const elevationRatio = (newY + 120) / 200;
      audioEngine.updateStarGazingLookDirection(azimuthRatio, elevationRatio);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    // Detect star click
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;

    for (const star of CELESTIAL_STARS_CATALOG) {
      const sx = w * star.x + panOffset.x;
      const sy = h * star.y + panOffset.y;
      const dist = Math.hypot(clickX - sx, clickY - sy);
      if (dist < star.size + 16) {
        setSelectedStar(star);
        audioEngine.playMenuSelect();
        break;
      }
    }
  };

  const handleScanPlanet = () => {
    if (hasScanned || isScanning) return;
    setIsScanning(true);
    audioEngine.playUnlockSound();

    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
      const earnedStars = 45 + Math.floor(Math.random() * 50);
      const earnedDiamonds = Math.random() < 0.6 ? 2 : 0;
      const earnedDust = 30 + Math.floor(Math.random() * 40);
      setScanResult({ stars: earnedStars, diamonds: earnedDiamonds, starDust: earnedDust });
      if (onRewardClaimed) {
        onRewardClaimed(earnedStars, earnedDiamonds, earnedDust);
      }
    }, 1800);
  };

  const handleTakeSnapshot = () => {
    setSnapshotTaken(true);
    audioEngine.playCheckpointReached();
    setTimeout(() => setSnapshotTaken(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-950/95 border-2 border-sky-500/40 rounded-3xl shadow-[0_0_50px_rgba(56,189,248,0.25)] flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-sky-500/20 bg-gradient-to-r from-slate-950 via-sky-950/30 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <Telescope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                  STAR GAZING & PLANET EXPLORER
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold uppercase border border-sky-400/30">
                  Surface Orbit {Math.floor(altitude)}m
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Landed on {planetType.replace('_', ' ')} Celestial Body #{planet?.id.substring(0, 5) || 'ALPHA'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => { setActiveTab('SKY'); audioEngine.playMenuSelect(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'SKY' ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Celestial Sky</span>
            </button>
            <button
              onClick={() => { setActiveTab('PLANET'); audioEngine.playMenuSelect(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'PLANET' ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Planet Bio-Scan</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-4 min-h-[420px]">
          {activeTab === 'SKY' ? (
            <>
              {/* Interactive Sky Canvas */}
              <div className="flex-1 relative rounded-2xl overflow-hidden border border-sky-500/30 bg-slate-950 flex flex-col min-h-[300px]">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={380}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="w-full h-full flex-1 cursor-grab active:cursor-grabbing block"
                />

                {/* Atmospheric Weather Overlay Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  <button
                    onClick={() => {
                      audioEngine.playClick();
                      setWeatherInfoOpen(!weatherInfoOpen);
                    }}
                    className="bg-slate-950/85 hover:bg-slate-900 border border-sky-500/40 text-left px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-2 backdrop-blur-md transition"
                  >
                    <span className="text-base">{weatherConfig.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-white">{weatherConfig.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {weatherConfig.subtitle.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 block">{weatherConfig.description}</span>
                    </div>
                  </button>

                  {/* Expanded Weather Diagnostics Panel */}
                  {weatherInfoOpen && (
                    <div className="bg-slate-950/95 border border-sky-500/40 rounded-2xl p-3 text-xs w-64 space-y-2 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-bold text-sky-300 text-[11px] flex items-center gap-1">
                          <Activity className="w-3 h-3 text-sky-400" />
                          Atmospheric Conditions
                        </span>
                        <button
                          onClick={() => setWeatherInfoOpen(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Atmosphere Type:</span>
                          <span className="font-mono text-white font-bold">{planetType}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Particle Phenomenon:</span>
                          <span className="font-mono text-sky-300">{weatherConfig.particleType}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Particle Density:</span>
                          <span className="font-mono text-amber-300">{weatherConfig.particleCount} units</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Velocity Drift:</span>
                          <span className="font-mono text-emerald-300">{weatherConfig.speed}x Drift</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 italic bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        {atmosphereComposition}
                      </p>
                    </div>
                  )}
                </div>

                {/* Drag hint overlay */}
                <div className="absolute bottom-2 left-3 pointer-events-none bg-slate-950/80 px-2.5 py-1 rounded-full border border-sky-500/30 text-[10px] text-sky-300 font-bold flex items-center gap-1.5 backdrop-blur-sm">
                  <Compass className="w-3 h-3 animate-spin-slow" />
                  <span>Drag to rotate 360° celestial sky • Click stars to inspect</span>
                </div>
              </div>

              {/* Star Lore & Astronomy Card */}
              <div className="w-full lg:w-72 bg-slate-900/80 border border-sky-500/25 rounded-2xl p-4 flex flex-col justify-between">
                {selectedStar ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider block">
                          SPECTRAL SCAN IDENTIFIED
                        </span>
                        <h3 className="text-base font-black text-white leading-snug">
                          {selectedStar.name}
                        </h3>
                        <span className="text-xs text-slate-400 italic">
                          "{selectedStar.latinName}"
                        </span>
                      </div>
                      <div 
                        className="w-5 h-5 rounded-full shrink-0 shadow-lg"
                        style={{ backgroundColor: selectedStar.color, boxShadow: `0 0 12px ${selectedStar.color}` }}
                      />
                    </div>

                    <div className="space-y-1.5 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Spectral Class:</span>
                        <span className="text-sky-300 font-mono font-bold text-[11px]">{selectedStar.spectralClass}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Distance:</span>
                        <span className="text-amber-300 font-mono font-bold">{selectedStar.distanceLightYears} Light-Years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Magnitude:</span>
                        <span className="text-white font-mono">{selectedStar.apparentMagnitude}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Constellation Sector:</span>
                        <span className="text-indigo-300 font-bold">{selectedStar.constellationRegion}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                      {selectedStar.lore}
                    </p>

                    <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/40 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5 text-sky-300 text-xs font-black mb-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Constellation Astral Perk:</span>
                      </div>
                      <p className="text-[11px] text-amber-200 font-medium">
                        {selectedStar.astralBuff}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                    <Telescope className="w-10 h-10 mb-2 opacity-50 text-sky-400" />
                    <p className="text-xs">Click any celestial body in the sky viewport to inspect astrophysical data.</p>
                  </div>
                )}

                <button
                  onClick={handleTakeSnapshot}
                  className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>{snapshotTaken ? 'Celestial Photo Saved! ✨' : 'Capture Stargaze Photo'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Planet Bio-Scan Tab */
            <div className="flex-1 flex flex-col lg:flex-row gap-4">
              {/* Planetary Visual Preview */}
              <div className="flex-1 bg-slate-900/80 border border-sky-500/30 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
                <div 
                  className="w-40 h-40 rounded-full flex items-center justify-center relative shadow-2xl animate-spin-slow"
                  style={{
                    backgroundColor: planet?.color || '#22c55e',
                    boxShadow: `0 0 50px ${planet?.color || '#22c55e'}55`
                  }}
                >
                  {/* Planet core secondary stripes */}
                  <div 
                    className="absolute inset-4 rounded-full border-4 opacity-50"
                    style={{ borderColor: planet?.secondaryColor || '#15803d' }}
                  />
                  <div className="text-4xl">🪐</div>
                </div>

                <div className="mt-4 text-center">
                  <h3 className="text-lg font-black text-white">
                    {planetType} CLASS WORLD
                  </h3>
                  <p className="text-xs text-slate-400">
                    Radius: {radius}km • Core Mass: {planet?.mass || 500} Jovian Units
                  </p>
                </div>
              </div>

              {/* Surface Telemetry Details */}
              <div className="w-full lg:w-80 bg-slate-900/80 border border-sky-500/25 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                    BIOME & EXOSPHERIC TELEMETRY
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Surface Gravity</span>
                      <span className="font-mono font-bold text-amber-300 text-sm">{gravityG} g</span>
                    </div>
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Mean Temperature</span>
                      <span className="font-mono font-bold text-sky-300 text-sm">{tempC}°C</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Atmospheric Composition:</span>
                    <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                      {atmosphereComposition}
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Discovered Surface Features:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {planet?.surfaceDecorations && planet.surfaceDecorations.length > 0 ? (
                        planet.surfaceDecorations.slice(0, 4).map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 font-mono text-[10px] border border-sky-500/30 font-bold">
                            {d.type}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-[11px]">Silicate craters & mineral dust</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mineral Scanner Button */}
                <div>
                  {hasScanned && scanResult ? (
                    <div className="bg-emerald-950/70 border border-emerald-500/50 p-2.5 rounded-xl text-xs space-y-1 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-black">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Mineral Scan Successful!</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-white pt-1">
                        <span className="text-amber-300">+{scanResult.stars} Stars</span>
                        {scanResult.diamonds > 0 && <span className="text-sky-300">+{scanResult.diamonds} Diamonds</span>}
                        <span className="text-indigo-300">+{scanResult.starDust} Star Dust</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleScanPlanet}
                      disabled={isScanning}
                      className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                        isScanning
                          ? 'bg-slate-800 text-slate-400 cursor-wait'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                      }`}
                    >
                      <Scan className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                      <span>{isScanning ? 'Analyzing Core Substrata...' : 'Scan Planet for Mineral Caches'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info & resume */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Star gazing pauses the void timer. Slingshot when ready to resume flight.</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-sky-500/20"
          >
            Resume Spaceflight 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

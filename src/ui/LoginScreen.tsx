import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Sparkles, 
  ShieldCheck, 
  User as UserIcon, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  Globe, 
  Award, 
  HelpCircle, 
  ArrowRight,
  Database,
  RefreshCw,
  Zap,
  Swords,
  Layers,
  X,
  Tv,
  WifiOff
} from 'lucide-react';
import { FirebaseService } from '../core/firebase';
import { StorageManager } from '../core/Storage';
import { UserSavedData } from '../types/game';

import heroArtworkUrl from '../assets/images/little_galaxy_hero_1786680040346.jpg';
import mainBgUrl from '../assets/images/main_menu_cosmic_bg_1786730822424.jpg';
import leoIconUrl from '../assets/images/little_galaxy_icon_1786680049991.jpg';
import galaxyMapBannerUrl from '../assets/images/galaxy_map_banner_1786696571856.jpg';
import hangarBannerUrl from '../assets/images/cosmic_hangar_banner_1786696559208.jpg';
import trophyBannerUrl from '../assets/images/trophy_badges_banner_1786696596962.jpg';

interface LoginScreenProps {
  onLoginSuccess: (userData: UserSavedData, userDisplayName: string) => void;
  onClose?: () => void;
  /** Optional: lets the player skip login entirely and play offline (local saves only). */
  onOfflineContinue?: () => void;
}

type ShowcaseTab = 'GAMEPLAY_SIM' | 'HERO_ART' | 'FEATURES';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onClose, onOfflineContinue }) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [showcaseTab, setShowcaseTab] = useState<ShowcaseTab>('GAMEPLAY_SIM');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverrideExplainer, setShowOverrideExplainer] = useState(false);
  const [simJumpCount, setSimJumpCount] = useState(0);
  const [simCombo, setSimCombo] = useState(1);
  const [simScore, setSimScore] = useState(450);

  // Gameplay simulation canvas ref
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const simAnimFrameRef = useRef<number | null>(null);
  const simStateRef = useRef<{
    planets: Array<{ x: number; y: number; r: number; color: string; ringColor: string; name: string }>;
    playerAngle: number;
    currentPlanetIdx: number;
    targetPlanetIdx: number;
    isFlying: boolean;
    flightT: number;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    stars: Array<{ x: number; y: number; collected: boolean; pulse: number }>;
    particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>;
    floatingTexts: Array<{ x: number; y: number; text: string; alpha: number; vy: number; color: string }>;
  }>({
    planets: [],
    playerAngle: 0,
    currentPlanetIdx: 0,
    targetPlanetIdx: 1,
    isFlying: false,
    flightT: 0,
    startX: 0,
    startY: 0,
    targetX: 0,
    targetY: 0,
    stars: [],
    particles: [],
    floatingTexts: []
  });

  // Setup interactive gameplay simulator
  useEffect(() => {
    if (showcaseTab !== 'GAMEPLAY_SIM') return;

    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    // Initial simulation setup
    const sim = simStateRef.current;
    sim.planets = [
      { x: width * 0.25, y: height * 0.58, r: 38, color: '#38bdf8', ringColor: '#0284c7', name: 'Earth' },
      { x: width * 0.75, y: height * 0.42, r: 44, color: '#fbbf24', ringColor: '#d97706', name: 'Solaris' }
    ];
    sim.stars = [
      { x: width * 0.45, y: height * 0.35, collected: false, pulse: 0 },
      { x: width * 0.55, y: height * 0.32, collected: false, pulse: 1 },
      { x: width * 0.65, y: height * 0.38, collected: false, pulse: 2 }
    ];

    let lastAutoJumpTime = performance.now();

    const triggerSimJump = () => {
      if (sim.isFlying) return;
      const currentP = sim.planets[sim.currentPlanetIdx];
      const nextIdx = (sim.currentPlanetIdx + 1) % sim.planets.length;
      const targetP = sim.planets[nextIdx];

      sim.startX = currentP.x + Math.cos(sim.playerAngle) * (currentP.r + 10);
      sim.startY = currentP.y + Math.sin(sim.playerAngle) * (currentP.r + 10);
      sim.targetX = targetP.x - (nextIdx === 0 ? -(targetP.r + 10) : targetP.r + 10);
      sim.targetY = targetP.y;
      sim.targetPlanetIdx = nextIdx;
      sim.isFlying = true;
      sim.flightT = 0;

      // Spawn jump burst particles
      for (let i = 0; i < 14; i++) {
        sim.particles.push({
          x: sim.startX,
          y: sim.startY,
          vx: (Math.random() - 0.5) * 3 - Math.cos(sim.playerAngle) * 2,
          vy: (Math.random() - 0.5) * 3 - Math.sin(sim.playerAngle) * 2,
          life: 1.0,
          color: Math.random() > 0.5 ? '#38bdf8' : '#f59e0b'
        });
      }

      setSimJumpCount((prev) => prev + 1);
    };

    const handleCanvasClick = () => {
      triggerSimJump();
      lastAutoJumpTime = performance.now();
    };

    canvas.addEventListener('click', handleCanvasClick);

    let lastFrameTime = performance.now();

    const renderSim = (now: number) => {
      const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;

      // Auto jump every 2.8 seconds if idle
      if (!sim.isFlying && now - lastAutoJumpTime > 2800) {
        triggerSimJump();
        lastAutoJumpTime = now;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space Cosmic Background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#082f49');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Starfield dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 28; i++) {
        const sx = ((i * 47) % width);
        const sy = ((i * 31 + Math.sin(now * 0.001 + i) * 3) % height);
        const sr = (i % 3 === 0) ? 1.5 : 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render Planets
      sim.planets.forEach((p, idx) => {
        // Atmosphere glow
        const glow = ctx.createRadialGradient(p.x, p.y, p.r * 0.8, p.x, p.y, p.r * 1.6);
        glow.addColorStop(0, idx === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(251, 191, 36, 0.35)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Orbit Guide Rings
        ctx.strokeStyle = idx === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(251, 191, 36, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Planet Body
        const planetGrad = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.1, p.x, p.y, p.r);
        planetGrad.addColorStop(0, idx === 0 ? '#7dd3fc' : '#fef08a');
        planetGrad.addColorStop(0.7, p.color);
        planetGrad.addColorStop(1, p.ringColor);
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Planetary Detail Cracks / Bands
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y + p.r * 0.2, p.r * 0.6, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
      });

      // 3. Trajectory Projection Dash Line (when attached)
      if (!sim.isFlying) {
        const curP = sim.planets[sim.currentPlanetIdx];
        const nextP = sim.planets[(sim.currentPlanetIdx + 1) % sim.planets.length];
        const px = curP.x + Math.cos(sim.playerAngle) * (curP.r + 10);
        const py = curP.y + Math.sin(sim.playerAngle) * (curP.r + 10);

        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        const midX = (px + nextP.x) / 2;
        const midY = Math.min(px, nextP.y) - 30;
        ctx.quadraticCurveTo(midX, midY, nextP.x, nextP.y - nextP.r);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. Collectable Floating Stars
      sim.stars.forEach((s, idx) => {
        if (!s.collected) {
          const sy = s.y + Math.sin(now * 0.004 + idx) * 3;
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(s.x, sy, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 5. Update & Render Player
      let playerX = 0;
      let playerY = 0;

      if (!sim.isFlying) {
        // Orbit current planet
        sim.playerAngle += dt * 2.2;
        const curP = sim.planets[sim.currentPlanetIdx];
        playerX = curP.x + Math.cos(sim.playerAngle) * (curP.r + 10);
        playerY = curP.y + Math.sin(sim.playerAngle) * (curP.r + 10);
      } else {
        // Parabolic Leap
        sim.flightT += dt * 1.8;
        const t = Math.min(sim.flightT, 1.0);
        const startX = sim.startX;
        const startY = sim.startY;
        const targetP = sim.planets[sim.targetPlanetIdx];
        const endX = targetP.x;
        const endY = targetP.y - targetP.r - 8;

        const controlX = (startX + endX) / 2;
        const controlY = Math.min(startY, endY) - 50;

        // Quadratic Bezier interpolation
        playerX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
        playerY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;

        // Spawn rocket comet particle trail
        sim.particles.push({
          x: playerX,
          y: playerY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 2,
          life: 0.8,
          color: Math.random() > 0.4 ? '#38bdf8' : '#f59e0b'
        });

        // Check star pickups
        sim.stars.forEach((s) => {
          if (!s.collected) {
            const dist = Math.hypot(playerX - s.x, playerY - s.y);
            if (dist < 18) {
              s.collected = true;
              setSimScore((sc) => sc + 100);
              sim.floatingTexts.push({
                x: s.x,
                y: s.y,
                text: '+100 ⭐',
                alpha: 1.0,
                vy: -20,
                color: '#facc15'
              });
            }
          }
        });

        // Land on target planet
        if (t >= 1.0) {
          sim.isFlying = false;
          sim.currentPlanetIdx = sim.targetPlanetIdx;
          sim.playerAngle = -Math.PI / 2;
          setSimCombo((c) => Math.min(c + 1, 8));
          setSimScore((sc) => sc + 250);

          // Spawn landing shockwave & text
          sim.floatingTexts.push({
            x: playerX,
            y: playerY - 14,
            text: 'PERFECT HOP! 🔥',
            alpha: 1.0,
            vy: -25,
            color: '#38bdf8'
          });

          // Reset stars for next jump
          setTimeout(() => {
            sim.stars.forEach((s) => (s.collected = false));
          }, 800);
        }
      }

      // Draw Astronaut Leo Icon/Sprite
      ctx.save();
      ctx.translate(playerX, playerY);
      // Spacesuit glow
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Visor
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(1.5, -1, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Backpack
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-6, -3, 3, 6);
      ctx.restore();

      // 6. Particles
      for (let i = sim.particles.length - 1; i >= 0; i--) {
        const p = sim.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 2.0;
        if (p.life <= 0) {
          sim.particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 7. Floating Texts
      for (let i = sim.floatingTexts.length - 1; i >= 0; i--) {
        const ft = sim.floatingTexts[i];
        ft.y += ft.vy * dt;
        ft.alpha -= dt * 1.2;
        if (ft.alpha <= 0) {
          sim.floatingTexts.splice(i, 1);
          continue;
        }
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillText(ft.text, ft.x - 20, ft.y);
        ctx.globalAlpha = 1.0;
      }

      simAnimFrameRef.current = requestAnimationFrame(renderSim);
    };

    simAnimFrameRef.current = requestAnimationFrame(renderSim);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      if (simAnimFrameRef.current) cancelAnimationFrame(simAnimFrameRef.current);
    };
  }, [showcaseTab]);

  const handleAuthResult = async (user: any) => {
    try {
      setLoading(true);
      setError(null);

      // Check cloud save
      const cloudData = await FirebaseService.loadGameFromCloud(user.uid);
      let authoritativeData: UserSavedData;

      if (cloudData) {
        // Merge cloud and local data according to the authoritative override policy
        authoritativeData = StorageManager.mergeWithCloud(cloudData);
      } else {
        // First time cloud account - seed with local progress
        const localData = StorageManager.loadData();
        authoritativeData = localData;
        await FirebaseService.saveGameToCloud(user.uid, localData);
      }

      const name = user.displayName || displayName || (user.isAnonymous ? 'Cosmic Cadette' : 'Star Commander');
      onLoginSuccess(authoritativeData, name);
    } catch (err: any) {
      console.error('Save sync error:', err);
      // Fallback to local save
      const localData = StorageManager.loadData();
      onLoginSuccess(localData, user.displayName || 'Star Commander');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await FirebaseService.signInWithGoogle();
      if (user) {
        await handleAuthResult(user);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in was cancelled or failed.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }
    if (tab === 'REGISTER' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let user;
      if (tab === 'REGISTER') {
        user = await FirebaseService.registerWithEmail(email, password, displayName || 'Star Commander');
      } else {
        user = await FirebaseService.signInWithEmail(email, password);
      }
      if (user) {
        await handleAuthResult(user);
      }
    } catch (err: any) {
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('email-already-in-use')) {
        msg = 'This email is already registered. Please switch to Sign In.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await FirebaseService.signInGuest();
      if (user) {
        await handleAuthResult(user);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/admin-restricted-operation' || code === 'auth/operation-not-allowed') {
        setError('Guest mode is currently disabled for this project in the Firebase console. You can still play right now — tap "Continue Offline" below. Your progress saves on this device.');
      } else {
        setError(err.message || 'Guest sign-in failed.');
      }
      setLoading(false);
    }
  };

  return (
    <div id="login-screen-root" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/92 backdrop-blur-md overflow-y-auto">
      {/* Background Cosmic Starfield Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src={mainBgUrl} 
          alt="" 
          className="w-full h-full object-cover opacity-20 filter blur-sm scale-105" 
        />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-600/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/25 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div 
        initial={false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-5xl bg-slate-900/95 border border-slate-700/80 rounded-2xl md:rounded-3xl shadow-2xl shadow-cyan-950/60 overflow-hidden text-white z-10 my-auto"
      >
        {/* Optional Close Button if opened as modal */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Close login"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* 2-Column Responsive Layout: Visual Media Showcase (Left) + Auth Gateway (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* ================= LEFT SHOWCASE: HERO GRAPHIC / GAMEPLAY PREVIEW / HIGHLIGHTS ================= */}
          <div className="lg:col-span-7 bg-slate-950/80 p-5 sm:p-7 border-b lg:border-b-0 lg:border-r border-slate-800/90 flex flex-col justify-between relative">
            
            {/* Top Showcase Navigation Bar */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-amber-400 flex items-center justify-center shadow-md shadow-sky-500/20 border border-sky-300/30 shrink-0">
                    <Rocket className="w-4 h-4 text-slate-950 transform -rotate-45" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-amber-200 to-amber-400">
                      COSMIC EXPLORER
                    </h2>
                    <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                      Orbital Physics & Space Odyssey
                    </span>
                  </div>
                </div>

                {/* Showcase Tab Pills */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    onClick={() => setShowcaseTab('GAMEPLAY_SIM')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      showcaseTab === 'GAMEPLAY_SIM'
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Interactive gameplay physics simulation"
                  >
                    <Tv className="w-3 h-3" />
                    <span>Live Demo</span>
                  </button>

                  <button
                    onClick={() => setShowcaseTab('HERO_ART')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      showcaseTab === 'HERO_ART'
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Official game artwork"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Main Art</span>
                  </button>

                  <button
                    onClick={() => setShowcaseTab('FEATURES')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      showcaseTab === 'FEATURES'
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Unlockable features overview"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Sectors</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Showcase View Container */}
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl shadow-slate-950/80 bg-slate-950 group">
                
                {/* 1. INTERACTIVE GAMEPLAY SIMULATION CANVAS */}
                {showcaseTab === 'GAMEPLAY_SIM' && (
                  <div className="relative w-full h-full">
                    <canvas 
                      ref={simCanvasRef} 
                      className="w-full h-full cursor-pointer active:scale-[0.99] transition-transform" 
                    />
                    
                    {/* Live Game HUD Simulation Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono text-sky-300 flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>LIVE ENGINE SIM</span>
                      </div>
                      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono text-amber-300 shadow-md">
                        SCORE {simScore} (x{simCombo})
                      </div>
                    </div>

                    {/* Interactive "Click to Jump" hint badge */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg animate-pulse pointer-events-none">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-bold text-amber-200">Tap to Jump! ({simJumpCount} Hops)</span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 px-2.5 flex items-center gap-2 pointer-events-none">
                      <img src={leoIconUrl} alt="Leo" className="w-6 h-6 rounded-lg object-cover border border-amber-400/40" />
                      <span className="text-[11px] font-semibold text-slate-200">Zero-G Orbital Jumper</span>
                    </div>
                  </div>
                )}

                {/* 2. OFFICIAL MAIN SCREEN HERO ARTWORK GRAPHIC */}
                {showcaseTab === 'HERO_ART' && (
                  <div className="relative w-full h-full">
                    <img 
                      src={heroArtworkUrl} 
                      alt="Cosmic Explorer Main Screen" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-2.5 flex items-center gap-3 shadow-xl max-w-[80%]">
                        <img src={leoIconUrl} alt="Leo" className="w-10 h-10 rounded-lg object-cover border border-amber-400/40 shrink-0" />
                        <div>
                          <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Meet Pilot Leo</div>
                          <p className="text-xs text-slate-200 font-medium leading-tight">
                            Hop between celestial bodies, harness gravity slingshots & collect star dust!
                          </p>
                        </div>
                      </div>

                      <div className="bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 shadow-lg">
                        100% Free
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SECTORS & EXPANSIONS SHOWCASE */}
                {showcaseTab === 'FEATURES' && (
                  <div className="relative w-full h-full p-3 grid grid-cols-3 gap-2 bg-slate-950">
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 group/card">
                      <img src={galaxyMapBannerUrl} alt="Galaxy Map" className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-center">
                        <div className="text-[10px] font-bold text-sky-300">6 Galaxy Sectors</div>
                      </div>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-slate-800 group/card">
                      <img src={hangarBannerUrl} alt="Hangar" className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-center">
                        <div className="text-[10px] font-bold text-amber-300">Cosmic Hangar</div>
                      </div>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-slate-800 group/card">
                      <img src={trophyBannerUrl} alt="Trophies" className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-center">
                        <div className="text-[10px] font-bold text-emerald-300">Military Ribbons</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Value Props / Hesitation Relievers */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="grid grid-cols-3 gap-2 text-left">
                <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px] mb-1">
                    <Rocket className="w-3.5 h-3.5 shrink-0" />
                    <span>Real Physics</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Time launches across rotating planetary gravity wells.
                  </p>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] mb-1">
                    <Swords className="w-3.5 h-3.5 shrink-0" />
                    <span>Multiplayer</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Live head-to-head orbital races & tactical space traps.
                  </p>
                </div>

                <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Cloud Backup</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Seamless sync across devices. Nothing earned is lost.
                  </p>
                </div>
              </div>

              {/* Instant Test Drive Callout */}
              <div className="mt-3 bg-gradient-to-r from-sky-950/60 to-slate-900/90 border border-sky-500/30 rounded-xl p-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="text-[11px] text-slate-300">
                    <strong className="text-white">Hesitant to register?</strong> Try instantly with Guest Mode!
                  </div>
                </div>
                <button
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-[11px] px-3 py-1.5 rounded-lg shadow transition-all active:scale-95 shrink-0 flex items-center gap-1"
                >
                  <span>Play as Guest</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Offline escape hatch — always works, no Firebase account needed */}
              {onOfflineContinue && (
                <button
                  id="btn-continue-offline"
                  type="button"
                  onClick={onOfflineContinue}
                  className="mt-3 w-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2.5 rounded-xl shadow transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-emerald-400/40"
                >
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Continue Offline — play now, save on this device</span>
                </button>
              )}
            </div>

          </div>

          {/* ================= RIGHT COLUMN: AUTHENTICATION FORM & SOCIAL LOGIN ================= */}
          <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-slate-900/70">
            <div>
              {/* Header Branding */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-amber-500 shadow-md shadow-sky-500/20 mb-2 border border-sky-300/30">
                  <Rocket className="w-6 h-6 text-white transform -rotate-45" />
                </div>
                <h3 className="text-xl font-black tracking-tight text-white">
                  {tab === 'LOGIN' ? 'Commander Sign In' : 'Register New Pilot'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Access your unlocked ships, star dust bank & military commendations.
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 mb-4">
                <button
                  id="tab-btn-login"
                  onClick={() => { setTab('LOGIN'); setError(null); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    tab === 'LOGIN' 
                      ? 'bg-sky-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  id="tab-btn-register"
                  onClick={() => { setTab('REGISTER'); setError(null); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    tab === 'REGISTER' 
                      ? 'bg-sky-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3.5 p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Google 1-Click Fast Auth */}
              <button
                id="btn-google-login"
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full mb-3.5 py-2.5 px-4 bg-slate-800 hover:bg-slate-700/90 border border-slate-600 rounded-xl font-medium text-xs flex items-center justify-center gap-2.5 transition-all text-slate-200 hover:text-white disabled:opacity-50 active:scale-[0.98] shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-1.9.4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
                  />
                </svg>
                Continue with Google
              </button>

              {onOfflineContinue && (
                <button
                  type="button"
                  onClick={onOfflineContinue}
                  className="w-full mb-3.5 py-2.5 px-4 bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-500/40 rounded-xl font-medium text-xs flex items-center justify-center gap-2.5 transition-all text-emerald-200 hover:text-white active:scale-[0.98]"
                >
                  <WifiOff className="w-4 h-4" />
                  Skip login — play offline
                </button>
              )}

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-700/80 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Or With Starfleet ID
                </span>
                <div className="border-t border-slate-700/80 w-full" />
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {tab === 'REGISTER' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Pilot Callsign
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        id="input-pilot-callsign"
                        type="text"
                        placeholder="e.g. Orion-9"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Command Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      id="input-command-email"
                      type="email"
                      required
                      autoComplete="username"
                      suppressHydrationWarning
                      placeholder="commander@starfleet.galaxy"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Security Clearance Passkey
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      id="input-command-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      suppressHydrationWarning
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-auth"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-amber-500 hover:from-sky-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] mt-1"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>{tab === 'REGISTER' ? 'Register & Deploy' : 'Authenticate & Launch'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Trust & Save Sync Policy */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <button
                id="btn-override-info"
                type="button"
                onClick={() => setShowOverrideExplainer(!showOverrideExplainer)}
                className="text-[11px] text-slate-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>How Cloud Login & Save Sync Works</span>
              </button>

              {/* Security guarantee pill */}
              <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-center gap-2">
                <span>🛡️ 100% Free</span>
                <span>•</span>
                <span>Instant Cloud Sync</span>
                <span>•</span>
                <span>No Spam</span>
              </div>
            </div>

            {/* Override Policy Details Drawer */}
            <AnimatePresence>
              {showOverrideExplainer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-[11px] text-slate-300 space-y-1.5 overflow-hidden"
                >
                  <div className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Save Conflict & Override System Rules:</span>
                  </div>
                  <ul className="space-y-1 text-slate-400 list-disc list-inside text-[10px]">
                    <li><strong className="text-slate-200">Metrics:</strong> Highest High Score, Max Altitude, Player Level, and XP always override.</li>
                    <li><strong className="text-slate-200">Currency:</strong> Higher accumulated Stars, Diamonds, and Star Dust are preserved.</li>
                    <li><strong className="text-slate-200">Unlocks:</strong> Costumes, rocket skins, and medals from cloud and local are merged together.</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </motion.div>
    </div>
  );
};

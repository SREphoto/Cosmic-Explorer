import { Collectible } from '../entities/Collectible';
import { Planet } from '../entities/Planet';
import { Player } from '../entities/Player';
import { PowerUp } from '../entities/PowerUp';
import { TrajectoryPrediction } from './PhysicsSystem';
import { ActiveSpaceAnomaly, ConstellationData, LevelBiomeInfo } from '../types/game';
import { ZODIAC_CONSTELLATIONS } from '../core/Config';
import cosmicBgUrl from '../assets/images/galaxy_cosmic_bg_1786680029303.jpg';

interface BackgroundStar {
  x: number;
  y: number;
  size: number;
  alpha: number;
  layer: number;
  color: string;
  twinkleOffset: number;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  speed: number;
  active: boolean;
  color: string;
  glowColor: string;
}

interface NebulaCloud {
  x: number;
  y: number;
  radius: number;
  color: string;
  pulseSpeed: number;
  pulsePhase: number;
  driftVx?: number;
  driftVy?: number;
  element?: string;
}

interface CosmicNebulaPasser {
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  vx: number;
  vy: number;
  alpha: number;
  name: string;
  active: boolean;
}

interface SolarFlareWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  active: boolean;
}

interface FrostSpicule {
  angle: number;
  length: number;
  branches: { offset: number; branchLength: number; branchAngle: number }[];
  depth: number;
}

interface AnomalyParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  rotation: number;
  rotSpeed: number;
}

export class RenderSystem {
  private bgStars: BackgroundStar[] = [];
  private distantDuneParticles: { x: number; y: number; size: number; alpha: number; speed: number; color: string }[] = [];
  private nebulae: NebulaCloud[] = [];
  private cosmicNebulae: CosmicNebulaPasser[] = [];
  private solarFlares: SolarFlareWave[] = [];
  private shootingStars: ShootingStar[] = [];
  private voidParticles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number; color: string }[] = [];
  private anomalyParticles: AnomalyParticle[] = [];
  private frostSpicules: FrostSpicule[] = [];
  private shakeIntensity: number = 0;
  private shakeTimer: number = 0;
  private bgImage: HTMLImageElement | null = null;
  private bgImageLoaded: boolean = false;
  private nextShootingStarTimer: number = 2.0;
  private nextCosmicEventTimer: number = 5.0;

  constructor(width: number, height: number) {
    this.initBgImage();
    this.generateBackgroundStars(width, height);
    this.initAnomalyParticles(width, height);
    this.initFrostSpicules();
    this.initCosmicEvents();
  }

  private initFrostSpicules() {
    this.frostSpicules = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
      const length = 120 + Math.random() * 90;
      const branchCount = 3 + Math.floor(Math.random() * 4);
      const branches = [];
      for (let b = 0; b < branchCount; b++) {
        branches.push({
          offset: 0.2 + (b / branchCount) * 0.7,
          branchLength: 20 + Math.random() * 35,
          branchAngle: (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.4)
        });
      }
      this.frostSpicules.push({
        angle,
        length,
        branches,
        depth: Math.random() * 0.5 + 0.5
      });
    }
  }

  private initCosmicEvents() {
    this.cosmicNebulae = [
      {
        x: 0,
        y: 0,
        radius: 450,
        color: 'rgba(244, 63, 94, 0.18)',
        glowColor: 'rgba(251, 113, 133, 0.35)',
        vx: 30,
        vy: -15,
        alpha: 0,
        name: 'Crimson Helix Nebula',
        active: false
      },
      {
        x: 0,
        y: 0,
        radius: 520,
        color: 'rgba(6, 182, 212, 0.20)',
        glowColor: 'rgba(56, 189, 248, 0.40)',
        vx: -25,
        vy: 20,
        alpha: 0,
        name: 'Cygnus Veil Nebula',
        active: false
      },
      {
        x: 0,
        y: 0,
        radius: 480,
        color: 'rgba(168, 85, 247, 0.22)',
        glowColor: 'rgba(192, 132, 252, 0.38)',
        vx: 20,
        vy: 35,
        alpha: 0,
        name: 'Orion Twilight Shroud',
        active: false
      }
    ];

    this.solarFlares = [];
    for (let i = 0; i < 4; i++) {
      this.solarFlares.push({
        x: 0,
        y: 0,
        radius: 0,
        maxRadius: 350 + Math.random() * 250,
        alpha: 0,
        color: '#f59e0b',
        active: false
      });
    }
  }

  private initAnomalyParticles(width: number, height: number) {
    this.anomalyParticles = [];
    for (let i = 0; i < 40; i++) {
      this.anomalyParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 40,
        vy: Math.random() * 80 + 30,
        size: Math.random() * 4 + 2,
        alpha: Math.random() * 0.8 + 0.2,
        color: '#facc15',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 3
      });
    }
  }

  private initBgImage() {
    this.bgImage = new Image();
    this.bgImage.onload = () => {
      this.bgImageLoaded = true;
    };
    this.bgImage.src = cosmicBgUrl;
  }

  public triggerScreenShake(intensity: number = 12, duration: number = 0.3) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  public generateBackgroundStars(width: number, height: number) {
    this.bgStars = [];
    const count = 280;
    const starColors = ['#ffffff', '#bae6fd', '#fef08a', '#fbcfe8', '#ddd6fe', '#a7f3d0'];

    for (let i = 0; i < count; i++) {
      this.bgStars.push({
        x: Math.random() * (width * 3) - width,
        y: Math.random() * height * 6 - height * 3,
        size: Math.random() * 2.8 + 0.5,
        alpha: Math.random() * 0.85 + 0.15,
        layer: Math.random() * 0.55 + 0.05,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 3 + 1.5
      });
    }

    // High speed cosmic dust micro-particles for extreme speed feeling
    this.distantDuneParticles = [];
    for (let i = 0; i < 90; i++) {
      this.distantDuneParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.7 + 0.3,
        color: Math.random() < 0.5 ? '#7dd3fc' : '#c084fc'
      });
    }

    // Procedural Cosmic Nebulae with Little Galaxy magical palettes
    this.nebulae = [
      { x: width * 0.25, y: -450, radius: 320, color: 'rgba(168, 85, 247, 0.24)', pulseSpeed: 1.2, pulsePhase: 0, driftVx: 4, driftVy: -2 },
      { x: width * 0.85, y: -1300, radius: 380, color: 'rgba(56, 189, 248, 0.22)', pulseSpeed: 0.9, pulsePhase: 1.5, driftVx: -3, driftVy: 2 },
      { x: width * 0.2, y: -2200, radius: 420, color: 'rgba(236, 72, 153, 0.20)', pulseSpeed: 1.4, pulsePhase: 3.0, driftVx: 5, driftVy: -3 },
      { x: width * 0.8, y: -3200, radius: 400, color: 'rgba(251, 191, 36, 0.18)', pulseSpeed: 0.8, pulsePhase: 4.2, driftVx: -4, driftVy: 1 },
      { x: width * 0.4, y: -4300, radius: 460, color: 'rgba(99, 102, 241, 0.25)', pulseSpeed: 1.1, pulsePhase: 2.1, driftVx: 2, driftVy: -4 },
      { x: width * 0.7, y: -5400, radius: 480, color: 'rgba(16, 185, 129, 0.22)', pulseSpeed: 1.3, pulsePhase: 1.2, driftVx: -3, driftVy: 3 }
    ];

    // Shooting Stars
    this.shootingStars = [];
    for (let i = 0; i < 6; i++) {
      this.shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: -280 - Math.random() * 240,
        vy: 200 + Math.random() * 180,
        length: Math.random() * 120 + 60,
        alpha: 0,
        speed: 1,
        active: false,
        color: '#ffffff',
        glowColor: '#38bdf8'
      });
    }

    // Void edge particles with energetic glowing cosmic colors
    this.voidParticles = [];
    const voidColors = ['#e879f9', '#c084fc', '#818cf8', '#38bdf8', '#f43f5e'];
    for (let i = 0; i < 65; i++) {
      this.voidParticles.push({
        x: Math.random() * width,
        y: 0,
        vx: (Math.random() - 0.5) * 30,
        vy: -Math.random() * 45 - 15,
        alpha: Math.random(),
        size: Math.random() * 8 + 3,
        color: voidColors[Math.floor(Math.random() * voidColors.length)]
      });
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cameraY: number,
    voidY: number,
    player: Player,
    planets: Planet[],
    collectibles: Collectible[],
    powerUps: PowerUp[],
    prediction: TrajectoryPrediction,
    dt: number,
    cameraX: number = 0,
    freezeRatio: number = 0,
    currentConstellation?: ConstellationData,
    activeAnomaly?: ActiveSpaceAnomaly | null,
    aestheticSeed?: number,
    voidDangerRatio: number = 0,
    sectorFlashTimer: number = 0,
    currentLevel?: LevelBiomeInfo
  ) {
    // Screen shake calculation
    ctx.save();
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(offsetX, offsetY);
    }

    // Calculate player dynamic velocity vector for responsive orbital parallax
    const pSpeedX = player.vx || 0;
    const pSpeedY = player.vy || 0;
    const pSpeedMag = Math.hypot(pSpeedX, pSpeedY);
    const velAngle = Math.atan2(pSpeedY, pSpeedX);

    // 1. Deep Space Cosmic Background
    // Base Deep Cosmic Gradient (custom tinted to active Zodiac Constellation)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (currentConstellation) {
      bgGrad.addColorStop(0, currentConstellation.bgGradient[0]);
      bgGrad.addColorStop(0.45, currentConstellation.bgGradient[1]);
      bgGrad.addColorStop(1, currentConstellation.bgGradient[2]);
    } else {
      bgGrad.addColorStop(0, '#040714');
      bgGrad.addColorStop(0.35, '#0b132b');
      bgGrad.addColorStop(0.7, '#1c183f');
      bgGrad.addColorStop(1, '#090a1a');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Dramatic sector color wash so biome changes are obvious
    const washColors = currentLevel?.nebulaColors || currentConstellation?.nebulaColors;
    if (washColors && washColors.length > 0) {
      ctx.save();
      const wash = ctx.createRadialGradient(width * 0.5, height * 0.38, 20, width * 0.5, height * 0.42, Math.max(width, height) * 0.85);
      wash.addColorStop(0, washColors[0]);
      wash.addColorStop(0.55, washColors[1] || washColors[0]);
      wash.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    if (currentLevel?.bgGradient) {
      ctx.save();
      const sectorBand = ctx.createLinearGradient(0, 0, 0, height);
      sectorBand.addColorStop(0, currentLevel.bgGradient[0] + '00');
      sectorBand.addColorStop(0.08, currentLevel.bgGradient[1]);
      sectorBand.addColorStop(0.18, 'rgba(0,0,0,0)');
      sectorBand.addColorStop(0.82, 'rgba(0,0,0,0)');
      sectorBand.addColorStop(1, currentLevel.bgGradient[2]);
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = sectorBand;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // Dynamic Multi-Layer Parallax Background System
    // Layer 0: Ultra-Deep Celestial Texture Image
    if (this.bgImage && this.bgImageLoaded) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      const imgW = this.bgImage.width;
      const imgH = this.bgImage.height;
      const scale = Math.max(width / imgW, (height * 1.6) / imgH);
      const renderW = imgW * scale;
      const renderH = imgH * scale;

      // React to camera & subtle player orbital trajectory speed skew
      const velWarpX = Math.cos(velAngle) * Math.min(18, pSpeedMag * 0.02);
      const velWarpY = Math.sin(velAngle) * Math.min(18, pSpeedMag * 0.02);

      const parallaxOffsetY = ((-cameraY * 0.05 + velWarpY) % renderH);
      const parallaxOffsetX = ((-cameraX * 0.05 + velWarpX) % renderW);

      ctx.drawImage(this.bgImage, parallaxOffsetX, parallaxOffsetY - renderH, renderW, renderH);
      ctx.drawImage(this.bgImage, parallaxOffsetX, parallaxOffsetY, renderW, renderH);
      ctx.drawImage(this.bgImage, parallaxOffsetX, parallaxOffsetY + renderH, renderW, renderH);
      ctx.restore();
    }

    // Layer 1: Cosmic Events (Passing massive Nebulae clouds & Solar Corona Waves)
    this.updateAndRenderCosmicEvents(ctx, width, height, cameraX, cameraY, dt, currentConstellation, planets, player);

    // Layer 2: Ambient Nebulae Clusters (React to orbital trajectory)
    ctx.save();
    const nowTime = Date.now() * 0.0015;
    this.nebulae.forEach((n) => {
      // Dynamic drift + parallax depth
      const driftX = (n.driftVx || 0) * nowTime * 2;
      const driftY = (n.driftVy || 0) * nowTime * 2;
      const nx = n.x + driftX - cameraX * 0.22;
      const ny = n.y + driftY - cameraY * 0.22;
      const pulsedRadius = n.radius * (1.0 + Math.sin(nowTime * n.pulseSpeed + n.pulsePhase) * 0.1);

      if (ny > -pulsedRadius && ny < height + pulsedRadius && nx > -pulsedRadius && nx < width + pulsedRadius) {
        const nGrad = ctx.createRadialGradient(nx, ny, pulsedRadius * 0.04, nx, ny, pulsedRadius);
        nGrad.addColorStop(0, n.color);
        nGrad.addColorStop(0.55, n.color.replace(/[\d\.]+\)$/, '0.07)'));
        nGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = nGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, pulsedRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    // Layer 3: Constellations Rendering (Astrological glyphs, connecting starlight lines, and glowing stars)
    this.renderConstellations(ctx, width, height, cameraX, cameraY, currentConstellation);

    // Layer 4: Multi-Layer Parallax Twinkling Stars with Speed Stretch
    ctx.save();
    const nowSec = Date.now() * 0.0025;
    const speedRatio = Math.min(2.5, pSpeedMag / 300);

    this.bgStars.forEach((s) => {
      // Parallax layering
      const sx = (s.x - cameraX * s.layer) % (width * 1.8);
      const sy = (s.y - cameraY * s.layer) % (height * 4.0);
      const renderX = sx < -60 ? sx + width * 1.8 : sx;
      const renderY = sy < -60 ? sy + height * 4.0 : sy;

      const twinkle = 0.7 + Math.sin(nowSec * s.twinkleSpeed + s.twinkleOffset) * 0.3;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, s.alpha * twinkle);

      // If player is moving fast, stretch stars along player's velocity trajectory for speed sensation
      if (speedRatio > 0.8 && s.layer > 0.2) {
        const stretchLen = s.size * (1 + speedRatio * 2.2 * s.layer);
        const stretchAngle = velAngle;
        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.rotate(stretchAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, stretchLen, s.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(renderX, renderY, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle cross for brighter forefront stars
        if (s.size > 2.0 && twinkle > 0.82) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(renderX - s.size * 2.2, renderY);
          ctx.lineTo(renderX + s.size * 2.2, renderY);
          ctx.moveTo(renderX, renderY - s.size * 2.2);
          ctx.lineTo(renderX, renderY + s.size * 2.2);
          ctx.stroke();
        }
      }
    });

    // Layer 5: High-speed distant stardust micro-dunes
    this.distantDuneParticles.forEach((dp) => {
      const dx = (dp.x - cameraX * dp.speed) % width;
      const dy = (dp.y - cameraY * dp.speed) % height;
      const rx = dx < 0 ? dx + width : dx;
      const ry = dy < 0 ? dy + height : dy;
      ctx.fillStyle = dp.color;
      ctx.globalAlpha = dp.alpha;
      ctx.beginPath();
      ctx.arc(rx, ry, dp.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 3b. Occasional Cosmic Shooting Stars crossing the celestial sky
    this.updateAndRenderShootingStars(ctx, width, height, cameraX, cameraY, dt, currentConstellation);

    // 3c. Active Space Anomaly Visual Effects
    if (activeAnomaly) {
      this.renderSpaceAnomalyEffects(ctx, width, height, cameraX, cameraY, activeAnomaly, planets, player, dt);
    }

    // 4. Trajectory Prediction Stardust Trail
    if (prediction.points && prediction.points.length > 1) {
      ctx.save();
      const pts = prediction.points;

      // Glow backdrop line with soft gradient
      const isComet = player.isCometActive;
      ctx.strokeStyle = isComet ? 'rgba(251, 191, 36, 0.45)' : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const rx = pt.x - cameraX;
        const ry = pt.y - cameraY;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });
      ctx.stroke();

      // Inner crisp stardust path line
      ctx.strokeStyle = isComet ? 'rgba(254, 240, 138, 0.75)' : 'rgba(224, 242, 254, 0.75)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sparkling Stardust Beads along trajectory
      const animOffset = (Date.now() * 0.012) % 4;
      pts.forEach((pt, i) => {
        if ((i + Math.floor(animOffset)) % 3 === 0) {
          const alpha = 1.0 - (i / pts.length) * 0.65;
          const nodeRadius = 3.5 + Math.sin(nowTime * 5 + i) * 0.8;
          ctx.fillStyle = isComet ? '#fde047' : '#7dd3fc';
          ctx.globalAlpha = Math.max(0.25, alpha);
          ctx.beginPath();
          ctx.arc(pt.x - cameraX, pt.y - cameraY, nodeRadius, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle glint on every 6th node
          if (i % 6 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(pt.x - cameraX, pt.y - cameraY, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      ctx.restore();
    }

    // 5. Target Landing Lock on Destination Planet
    if (prediction.targetPlanet && prediction.landingPoint) {
      prediction.targetPlanet.drawTargetLock(ctx, cameraY, prediction.landingPoint.x, prediction.landingPoint.y, cameraX);
    }

    // 6. Planets (With rich storybook textures, grass tufts, gears, crystals, houses, trees)
    planets.forEach((p) => p.draw(ctx, cameraY, cameraX));

    // 7. Collectibles & PowerUps
    collectibles.forEach((c) => c.draw(ctx, cameraY, cameraX));
    powerUps.forEach((pu) => pu.draw(ctx, cameraY, cameraX));

    // 8. Player (Animated little boy with waving red scarf, running stride, rocket flames)
    player.draw(ctx, cameraX, cameraY, freezeRatio);

    // 8b. Hold-to-Charge Jump Strength Meter Ring
    if (player.isAttached && player.isCharging) {
      ctx.save();
      const px = player.x - cameraX;
      const py = player.y - cameraY;
      const meterRadius = player.radius + 16;

      // Outer Meter Glow Track Arc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(px, py, meterRadius, -Math.PI / 2, Math.PI * 1.5);
      ctx.stroke();

      // Dynamic Meter Charge Fill Arc
      const chargeAngle = -Math.PI / 2 + player.chargeRatio * Math.PI * 2;
      const fillGrad = ctx.createConicGradient(-Math.PI / 2, px, py);
      fillGrad.addColorStop(0, '#38bdf8');
      fillGrad.addColorStop(0.4, '#34d399');
      fillGrad.addColorStop(0.7, '#facc15');
      fillGrad.addColorStop(1, '#f43f5e');

      ctx.strokeStyle = fillGrad;
      ctx.lineWidth = 6;
      ctx.shadowColor = player.chargeRatio > 0.8 ? '#f43f5e' : '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(px, py, meterRadius, -Math.PI / 2, chargeAngle);
      ctx.stroke();

      // Pulsing charge pointer knob
      const knobX = px + Math.cos(chargeAngle) * meterRadius;
      const knobY = py + Math.sin(chargeAngle) * meterRadius;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(knobX, knobY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 9. Advancing Dark Void Boundary
    this.renderDarkVoid(ctx, width, height, cameraY, voidY, dt);

    // 10. Deep Space Freezing Ice Overlay Effect
    this.renderFreezingEffect(ctx, width, height, freezeRatio);

    // 11. Stone Petrification Warning HUD Indicator
    if (player.petrificationRatio > 0.08) {
      this.renderPetrificationWarning(ctx, width, height, player.petrificationRatio);
    }

    // Void danger vignette — edges bleed darkness as the abyss closes in
    if (voidDangerRatio > 0.18) {
      ctx.save();
      const vig = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.22, width / 2, height / 2, Math.max(width, height) * 0.72);
      const a = 0.12 + voidDangerRatio * 0.55;
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, `rgba(76, 5, 25, ${a.toFixed(3)})`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // Sector crossing title card on the canvas
    if (sectorFlashTimer > 0 && currentLevel) {
      ctx.save();
      const flashAlpha = Math.min(1, sectorFlashTimer / 0.6) * Math.min(1, (2.6 - sectorFlashTimer) / 0.45);
      ctx.globalAlpha = 0.22 * Math.max(0.2, flashAlpha);
      ctx.fillStyle = currentLevel.bgGradient[1];
      ctx.fillRect(0, height * 0.36, width, 88);
      ctx.globalAlpha = Math.max(0.4, flashAlpha);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = currentLevel.nebulaColors[0] || '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.fillText(currentLevel.name, width / 2, height * 0.36 + 38);
      ctx.font = '11px "Trebuchet MS", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.shadowBlur = 0;
      ctx.fillText(currentLevel.subtitle, width / 2, height * 0.36 + 58);
      ctx.restore();
    }

    ctx.restore(); // Screen shake restore
  }

  private renderPetrificationWarning(ctx: CanvasRenderingContext2D, width: number, height: number, ratio: number) {
    ctx.save();
    
    // Violet/Charcoal Dark Curse Vignette
    const curseGrad = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.max(width, height) * 0.75
    );
    curseGrad.addColorStop(0, 'rgba(88, 28, 135, 0)');
    curseGrad.addColorStop(0.6, `rgba(59, 7, 100, ${Math.min(0.6, ratio * 0.7)})`);
    curseGrad.addColorStop(1, `rgba(15, 23, 42, ${Math.min(0.9, ratio * 0.95)})`);
    ctx.fillStyle = curseGrad;
    ctx.fillRect(0, 0, width, height);

    // Warning Header Badge
    const now = Date.now() * 0.008;
    const pulse = Math.sin(now * 8) * 2;
    ctx.fillStyle = '#f87171';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `⚠️ TURNING TO STONE IN ${Math.max(0.1, (1 - ratio) * 3.2).toFixed(1)}s! JUMP OFF!`,
      width / 2 + pulse,
      76
    );

    ctx.restore();
  }

  private updateAndRenderCosmicEvents(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cameraX: number,
    cameraY: number,
    dt: number,
    currentConstellation?: ConstellationData,
    planets: Planet[] = [],
    player?: Player
  ) {
    this.nextCosmicEventTimer -= dt;
    if (this.nextCosmicEventTimer <= 0) {
      this.nextCosmicEventTimer = 8 + Math.random() * 10;
      
      // Randomly spawn passing nebula or solar flare wave
      const pickEvent = Math.random();
      if (pickEvent < 0.6) {
        const inactiveNeb = this.cosmicNebulae.find((n) => !n.active);
        if (inactiveNeb) {
          inactiveNeb.active = true;
          inactiveNeb.x = cameraX + (Math.random() < 0.5 ? -width * 0.5 : width * 1.5);
          inactiveNeb.y = cameraY + (Math.random() - 0.5) * height * 1.5;
          inactiveNeb.alpha = 0.01;
          inactiveNeb.radius = 420 + Math.random() * 260;
          if (currentConstellation) {
            inactiveNeb.color = currentConstellation.bgGradient[1] + '44';
            inactiveNeb.glowColor = currentConstellation.elementColor + '66';
          }
        }
      } else {
        const inactiveFlare = this.solarFlares.find((f) => !f.active);
        const sunPlanet = planets.find((p) => p.type === 'SUN');
        if (inactiveFlare && sunPlanet) {
          inactiveFlare.active = true;
          inactiveFlare.x = sunPlanet.x;
          inactiveFlare.y = sunPlanet.y;
          inactiveFlare.radius = sunPlanet.radius;
          inactiveFlare.maxRadius = sunPlanet.radius + 320;
          inactiveFlare.alpha = 0.85;
          inactiveFlare.color = '#f59e0b';
        }
      }
    }

    // Render Cosmic Nebulae
    ctx.save();
    this.cosmicNebulae.forEach((neb) => {
      if (!neb.active) return;
      neb.x += neb.vx * dt;
      neb.y += neb.vy * dt;
      if (neb.alpha < 0.35) neb.alpha += dt * 0.08;

      const rx = neb.x - cameraX * 0.15;
      const ry = neb.y - cameraY * 0.15;

      if (ry > -neb.radius && ry < height + neb.radius && rx > -neb.radius && rx < width + neb.radius) {
        const grad = ctx.createRadialGradient(rx, ry, neb.radius * 0.05, rx, ry, neb.radius);
        grad.addColorStop(0, neb.glowColor);
        grad.addColorStop(0.4, neb.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(rx, ry, neb.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    // Render Solar Corona Flare Waves
    ctx.save();
    this.solarFlares.forEach((flare) => {
      if (!flare.active) return;
      flare.radius += dt * 140;
      flare.alpha -= dt * 0.45;
      if (flare.alpha <= 0 || flare.radius >= flare.maxRadius) {
        flare.active = false;
        return;
      }
      const fx = flare.x - cameraX;
      const fy = flare.y - cameraY;

      ctx.strokeStyle = flare.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = flare.alpha;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(fx, fy, flare.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Flare Corona Rays
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + flare.radius * 0.01;
        const x1 = fx + Math.cos(ang) * flare.radius;
        const y1 = fy + Math.sin(ang) * flare.radius;
        const x2 = fx + Math.cos(ang) * (flare.radius + 35);
        const y2 = fy + Math.sin(ang) * (flare.radius + 35);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  private updateAndRenderShootingStars(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cameraX: number,
    cameraY: number,
    dt: number,
    currentConstellation?: ConstellationData
  ) {
    this.nextShootingStarTimer -= dt;
    if (this.nextShootingStarTimer <= 0) {
      this.nextShootingStarTimer = 2.2 + Math.random() * 3.5;
      const inactive = this.shootingStars.find((s) => !s.active);
      if (inactive) {
        inactive.active = true;
        inactive.x = cameraX + Math.random() * (width * 1.4);
        inactive.y = cameraY - 120 + Math.random() * 250;
        inactive.alpha = 1.0;
        inactive.speed = 520 + Math.random() * 420;
        inactive.length = 100 + Math.random() * 120;
        inactive.color = currentConstellation ? currentConstellation.elementColor : '#bae6fd';
        inactive.glowColor = currentConstellation ? currentConstellation.elementColor : '#38bdf8';
      }
    }

    ctx.save();
    this.shootingStars.forEach((s) => {
      if (!s.active) return;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.alpha -= dt * 0.75;

      if (s.alpha <= 0) {
        s.active = false;
        return;
      }

      const sx = s.x - cameraX;
      const sy = s.y - cameraY;
      const tailX = sx - (s.vx / s.speed) * s.length;
      const tailY = sy - (s.vy / s.speed) * s.length;

      const starGrad = ctx.createLinearGradient(sx, sy, tailX, tailY);
      starGrad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
      starGrad.addColorStop(0.3, s.color);
      starGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.strokeStyle = starGrad;
      ctx.lineWidth = 3;
      ctx.shadowColor = s.glowColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  private renderFreezingEffect(ctx: CanvasRenderingContext2D, width: number, height: number, freezeRatio: number) {
    if (freezeRatio <= 0) return;

    ctx.save();
    const now = Date.now() * 0.003;

    // 1. Multi-Stop Deep Cyan / Crystal White Radial Frost Vignette
    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);
    const safeRadius = minDim * (0.65 - freezeRatio * 0.45);
    const frostGrad = ctx.createRadialGradient(
      width / 2, height / 2, safeRadius,
      width / 2, height / 2, maxDim * 0.85
    );
    frostGrad.addColorStop(0, 'rgba(186, 230, 253, 0)');
    frostGrad.addColorStop(0.3, `rgba(56, 189, 248, ${Math.min(0.55, freezeRatio * 0.5)})`);
    frostGrad.addColorStop(0.65, `rgba(14, 165, 233, ${Math.min(0.82, freezeRatio * 0.8)})`);
    frostGrad.addColorStop(0.9, `rgba(224, 242, 254, ${Math.min(0.96, freezeRatio * 0.95)})`);
    frostGrad.addColorStop(1, `rgba(240, 249, 255, ${Math.min(1.0, freezeRatio * 0.98)})`);

    ctx.fillStyle = frostGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Procedural Crystalline Frost Spicules growing inward from screen perimeter
    const activeSpicules = Math.min(this.frostSpicules.length, Math.floor(this.frostSpicules.length * (freezeRatio * 1.3)));
    
    ctx.save();
    ctx.shadowColor = '#bae6fd';
    ctx.shadowBlur = 10;

    for (let i = 0; i < activeSpicules; i++) {
      const sp = this.frostSpicules[i];
      const startX = width / 2 + Math.cos(sp.angle) * (width * 0.52);
      const startY = height / 2 + Math.sin(sp.angle) * (height * 0.52);
      const currentLength = sp.length * (freezeRatio * 1.5) * sp.depth;
      const endX = startX - Math.cos(sp.angle) * currentLength;
      const endY = startY - Math.sin(sp.angle) * currentLength;

      // Main Crystal Needle
      ctx.strokeStyle = `rgba(240, 249, 255, ${Math.min(0.95, freezeRatio * 1.1)})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Crystal Side Facets / Dendrite Branches
      if (freezeRatio > 0.35) {
        ctx.strokeStyle = `rgba(186, 230, 253, ${Math.min(0.85, freezeRatio * 0.9)})`;
        ctx.lineWidth = 1.4;
        sp.branches.forEach((b) => {
          const bx = startX - Math.cos(sp.angle) * (currentLength * b.offset);
          const by = startY - Math.sin(sp.angle) * (currentLength * b.offset);
          const branchAngle = sp.angle + Math.PI + b.branchAngle;
          const bEndX = bx + Math.cos(branchAngle) * (b.branchLength * freezeRatio);
          const bEndY = by + Math.sin(branchAngle) * (b.branchLength * freezeRatio);

          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bEndX, bEndY);
          ctx.stroke();
        });
      }
    }
    ctx.restore();

    // 3. Shivering Ice Crystals & Diamond Dust Floating
    ctx.save();
    const dustCount = Math.floor(40 * freezeRatio);
    for (let d = 0; d < dustCount; d++) {
      const dx = (d * 73 + now * 40) % width;
      const dy = (d * 57 + Math.sin(now * 3 + d) * 20 + now * 25) % height;
      const dSize = 1.2 + (d % 3) * 0.8;
      const dAlpha = 0.4 + Math.sin(now * 5 + d) * 0.35;

      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = dAlpha * freezeRatio;
      ctx.beginPath();
      ctx.arc(dx, dy, dSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Freeze Warning Text Header with icy frost pulse
    if (freezeRatio > 0.12) {
      const shiver = Math.sin(now * 18) * 3;
      const pulse = 1.0 + Math.sin(now * 8) * 0.05;

      ctx.save();
      ctx.fillStyle = '#bae6fd';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 16;
      ctx.font = '900 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        '❄️ DEEP SPACE FREEZING! RETURN TO A PLANET ORBIT!',
        width / 2 + shiver,
        48
      );

      // Percentage freeze meter bar
      const barW = Math.min(220, width * 0.6);
      const barH = 5;
      const barX = (width - barW) / 2;
      const barY = 56;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(barX, barY, barW, barH);

      const fillGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
      fillGrad.addColorStop(0, '#38bdf8');
      fillGrad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = fillGrad;
      ctx.fillRect(barX, barY, barW * freezeRatio, barH);
      ctx.restore();
    }

    ctx.restore();
  }

  private renderDarkVoid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cameraY: number,
    voidY: number,
    dt: number
  ) {
    const renderVoidY = voidY - cameraY;

    if (renderVoidY < height + 250) {
      ctx.save();

      // Swirling Dark Void Gradient with Little Galaxy signature magenta-violet abyss
      const voidGrad = ctx.createLinearGradient(0, renderVoidY, 0, height + 400);
      voidGrad.addColorStop(0, 'rgba(15, 23, 42, 0.98)');
      voidGrad.addColorStop(0.15, 'rgba(88, 28, 135, 0.92)');
      voidGrad.addColorStop(0.5, 'rgba(49, 10, 101, 0.98)');
      voidGrad.addColorStop(1, '#020617');

      ctx.fillStyle = voidGrad;
      ctx.fillRect(0, renderVoidY, width, height - renderVoidY + 400);

      // Void Warning Edge Glow
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#e879f9';
      ctx.shadowBlur = 16;

      ctx.beginPath();
      ctx.moveTo(0, renderVoidY);

      // Wavy cosmic edge with plasma ripples
      const now = Date.now() * 0.0035;
      for (let x = 0; x <= width; x += 10) {
        const wave = Math.sin(now + x * 0.02) * 10 + Math.cos(now * 1.6 + x * 0.035) * 6;
        ctx.lineTo(x, renderVoidY + wave);
      }
      ctx.stroke();

      // Void plasma particles
      this.voidParticles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= dt * 0.65;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.alpha <= 0) {
          p.x = Math.random() * width;
          p.y = renderVoidY + Math.random() * 35;
          p.alpha = 1.0;
          p.vy = -Math.random() * 35 - 12;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha * 0.75);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  }

  // =========================================================================
  // CONSTELLATION BACKGROUND RENDERING (Clean celestial asterisms & stars only)
  // =========================================================================
  private renderConstellations(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cameraX: number,
    cameraY: number,
    currentConstellation?: ConstellationData
  ) {
    ctx.save();
    const now = Date.now() * 0.002;
    const constellations = ZODIAC_CONSTELLATIONS;
    const horizontalOffsets = [0.5, 0.25, 0.75, 0.38, 0.62, 0.28, 0.72, 0.5, 0.32, 0.68, 0.22, 0.78];

    // Render zodiac constellations in celestial parallax space spaced widely apart
    constellationLoop: for (let i = 0; i < constellations.length; i++) {
      const z = constellations[i];
      const isCurrent = currentConstellation && currentConstellation.id === z.id;

      // Position each constellation in its own dedicated deep space altitude sector (>2200px spacing)
      const baseAltitudeY = -(i * 2400 + 700);
      const renderCenterY = baseAltitudeY - cameraY * 0.14;
      const xOffsetFactor = horizontalOffsets[i % horizontalOffsets.length];
      const renderCenterX = width * xOffsetFactor - cameraX * 0.08;

      // Skip if out of screen view
      if (renderCenterY < -350 || renderCenterY > height + 350) {
        continue constellationLoop;
      }

      const boxW = Math.min(width * 0.8, 380);
      const boxH = 280;
      const originX = renderCenterX - boxW * 0.5;
      const originY = renderCenterY - boxH * 0.5;

      const alphaPulse = 0.55 + Math.sin(now * 1.4 + i) * 0.15;
      const constellationAlpha = isCurrent ? Math.min(0.95, alphaPulse + 0.3) : 0.4;

      // 1. Constellation Luminous Connecting Lines (No text, no glyphs)
      ctx.save();
      ctx.strokeStyle = z.elementColor;
      ctx.lineWidth = isCurrent ? 1.8 : 1.2;
      ctx.globalAlpha = constellationAlpha * 0.7;
      ctx.shadowColor = z.elementColor;
      ctx.shadowBlur = isCurrent ? 10 : 5;

      z.lines.forEach(([startIdx, endIdx]) => {
        const starA = z.stars[startIdx];
        const starB = z.stars[endIdx];
        if (starA && starB) {
          const ax = originX + starA.x * boxW;
          const ay = originY + starA.y * boxH;
          const bx = originX + starB.x * boxW;
          const by = originY + starB.y * boxH;

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      });
      ctx.restore();

      // 2. Constellation Stars (Glowing celestial spheres with soft aura and sparkling flares)
      z.stars.forEach((s, sIdx) => {
        const sx = originX + s.x * boxW;
        const sy = originY + s.y * boxH;
        const starTwinkle = 0.82 + Math.sin(now * 2.8 + sIdx * 1.5 + i) * 0.18;
        const starSize = (s.size || 3.5) * (isCurrent ? 1.15 : 0.95);

        ctx.save();
        // Soft Radial Halo Glow
        const haloRadius = starSize * 4.2;
        const haloGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, haloRadius);
        haloGrad.addColorStop(0, z.elementAuraColor);
        haloGrad.addColorStop(0.5, z.elementAuraColor.replace(/[\d\.]+\)$/, '0.14)'));
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, haloRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core Glowing Star
        ctx.fillStyle = s.isMain ? '#ffffff' : (z.elementSecondaryColor || '#e0f2fe');
        ctx.globalAlpha = constellationAlpha * starTwinkle;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = s.isMain ? 12 : 6;
        ctx.beginPath();
        ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
        ctx.fill();

        // 4-Point Sparkling Lens Flare Cross on Main Named Stars
        if (s.isMain || isCurrent) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.0;
          ctx.globalAlpha = constellationAlpha * starTwinkle * 0.8;
          const spikeLen = starSize * (2.6 + Math.sin(now * 3.5 + sIdx) * 0.5);

          ctx.beginPath();
          ctx.moveTo(sx - spikeLen, sy);
          ctx.lineTo(sx + spikeLen, sy);
          ctx.moveTo(sx, sy - spikeLen);
          ctx.lineTo(sx, sy + spikeLen);
          ctx.stroke();
        }
        ctx.restore();
      });
    }
    ctx.restore();
  }

  // =========================================================================
  // SPACE ANOMALY DYNAMIC EVENT RENDERING
  // =========================================================================
  private renderSpaceAnomalyEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cameraX: number,
    cameraY: number,
    anomaly: ActiveSpaceAnomaly,
    planets: Planet[],
    player: Player,
    dt: number
  ) {
    const data = anomaly.data;
    const now = Date.now() * 0.003;

    ctx.save();

    // 1. Ambient Screen Perimeter Aura Pulse
    const borderPulse = 0.25 + Math.sin(now * 3) * 0.15;
    ctx.strokeStyle = data.color;
    ctx.lineWidth = 4;
    ctx.globalAlpha = borderPulse;
    ctx.shadowColor = data.color;
    ctx.shadowBlur = 18;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // 2. Specific Anomaly Typology Mechanics
    switch (data.type) {
      case 'ASTEROID_SHOWER': {
        // Render Active Hazards / Drifting Meteors
        if (anomaly.activeHazards) {
          anomaly.activeHazards.forEach((h) => {
            const hx = h.x - cameraX;
            const hy = h.y - cameraY;

            if (hy > -100 && hy < height + 100 && hx > -100 && hx < width + 100) {
              ctx.save();
              ctx.translate(hx, hy);
              ctx.rotate(h.rotation);

              // Flaming Meteor Trail
              const trailGrad = ctx.createLinearGradient(0, 0, -h.vx * 0.3, -h.vy * 0.3);
              trailGrad.addColorStop(0, 'rgba(249, 115, 22, 0.85)');
              trailGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.5)');
              trailGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
              ctx.fillStyle = trailGrad;
              ctx.beginPath();
              ctx.moveTo(0, -h.radius);
              ctx.lineTo(-h.vx * 0.35, -h.vy * 0.35);
              ctx.lineTo(0, h.radius);
              ctx.closePath();
              ctx.fill();

              // Jagged Asteroid Body
              ctx.fillStyle = h.color;
              ctx.strokeStyle = '#f97316';
              ctx.lineWidth = 2;
              ctx.shadowColor = '#f97316';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              for (let a = 0; a < 6; a++) {
                const angle = (a * Math.PI) / 3;
                const r = h.radius * (0.8 + Math.sin(a * 2.5) * 0.2);
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (a === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fill();
              ctx.stroke();

              // Fiery Core
              ctx.fillStyle = '#fef08a';
              ctx.beginPath();
              ctx.arc(0, 0, h.radius * 0.45, 0, Math.PI * 2);
              ctx.fill();

              ctx.restore();
            }
          });
        }
        break;
      }

      case 'GRAVITY_SURGE': {
        // Concentric Harmonic Gravity Ripples expanding from nearby planets
        planets.forEach((p) => {
          const px = p.x - cameraX;
          const py = p.y - cameraY;
          const gravityRadius = p.radius * 3.5;
          if (py > -p.radius * 3 && py < height + p.radius * 3) {
            for (let ring = 1; ring <= 3; ring++) {
              const waveRadius = (gravityRadius * 0.4 + (now * 60 * ring) % (gravityRadius * 0.6));
              const waveAlpha = Math.max(0, 1.0 - waveRadius / gravityRadius) * 0.45;
              ctx.save();
              ctx.strokeStyle = ring % 2 === 0 ? '#8b5cf6' : '#c084fc';
              ctx.lineWidth = 2;
              ctx.globalAlpha = waveAlpha;
              ctx.shadowColor = '#8b5cf6';
              ctx.shadowBlur = 12;
              ctx.beginPath();
              ctx.arc(px, py, waveRadius, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
            }
          }
        });
        break;
      }

      case 'STARLIGHT_SHOWER': {
        // Raining Sparkling Diamond Particles
        this.anomalyParticles.forEach((p) => {
          p.y += p.vy * dt;
          p.x += p.vx * dt;
          p.rotation += p.rotSpeed * dt;
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 8;
          ctx.globalAlpha = p.alpha;

          // Diamond Shape
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.5);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size * 1.5);
          ctx.lineTo(-p.size, 0);
          ctx.closePath();
          ctx.fill();

          // Sparkle Spike
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-p.size * 2, 0);
          ctx.lineTo(p.size * 2, 0);
          ctx.moveTo(0, -p.size * 2);
          ctx.lineTo(0, p.size * 2);
          ctx.stroke();
          ctx.restore();
        });
        break;
      }

      case 'DARK_MATTER_PULSE': {
        // Swirling Violet Dark Matter Mist
        const mistGrad = ctx.createRadialGradient(
          width * 0.5, height * 0.5, 40,
          width * 0.5, height * 0.5, width * 0.8
        );
        mistGrad.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
        mistGrad.addColorStop(0.6, 'rgba(88, 28, 135, 0.22)');
        mistGrad.addColorStop(1, 'rgba(49, 10, 101, 0.35)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'SOLAR_FLARE_STORM': {
        // Ascending Solar Plasma Heat Winds
        this.anomalyParticles.forEach((p) => {
          p.y -= (p.vy + 60) * dt;
          p.x += Math.sin(now * 2 + p.y * 0.01) * 30 * dt;
          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.fillStyle = Math.random() > 0.5 ? '#ef4444' : '#f97316';
          ctx.globalAlpha = p.alpha * 0.7;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        break;
      }

      case 'MAGNETIC_SINGULARITY': {
        // Spiraling Magnetic Vortex Field Lines converging toward player
        const playerScreenX = player.x - cameraX;
        const playerScreenY = player.y - cameraY;
        ctx.save();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.45;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;

        for (let a = 0; a < 6; a++) {
          const baseAngle = (a * Math.PI) / 3 + now * 1.5;
          ctx.beginPath();
          for (let r = 240; r > 30; r -= 15) {
            const spiralAngle = baseAngle + r * 0.02;
            const sx = playerScreenX + Math.cos(spiralAngle) * r;
            const sy = playerScreenY + Math.sin(spiralAngle) * r;
            if (r === 240) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
    }

    ctx.restore();
  }
}



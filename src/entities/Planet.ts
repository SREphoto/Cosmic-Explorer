import { PlanetData, PlanetType } from '../types/game';
import { SurfaceHazard } from './SurfaceHazard';

export class Planet implements PlanetData {
  id: string;
  x: number;
  y: number;
  radius: number;
  mass: number;
  angularVelocity: number;
  rotationDirection: 1 | -1;
  type: PlanetType;
  color: string;
  secondaryColor: string;
  surfaceDecorations: { angle: number; type: any; size: number }[];
  visited: boolean;
  orbitStarCount?: number;
  hasRing?: boolean;
  ringColor?: string;
  atmosphereColor?: string;
  isCheckpoint?: boolean;
  checkpointId?: string;
  checkpointName?: string;
  isLevelGoal?: boolean;
  levelGoalNumber?: number;
  isDark?: boolean;
  altitudeTier?: number;
  flareRotation: number = 0;
  hazards: SurfaceHazard[] = [];

  constructor(data: PlanetData) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.radius = data.radius;
    this.mass = data.mass;
    this.angularVelocity = data.angularVelocity;
    this.rotationDirection = data.rotationDirection;
    this.type = data.type;
    this.color = data.color;
    this.secondaryColor = data.secondaryColor;
    this.surfaceDecorations = data.surfaceDecorations || [];
    this.visited = data.visited || false;
    this.orbitStarCount = data.orbitStarCount;
    this.hasRing = data.hasRing;
    this.ringColor = data.ringColor || 'rgba(217, 249, 157, 0.5)';
    this.atmosphereColor = data.atmosphereColor || data.secondaryColor;
    this.isCheckpoint = data.isCheckpoint;
    this.checkpointId = data.checkpointId;
    this.checkpointName = data.checkpointName;
    this.isLevelGoal = data.isLevelGoal;
    this.levelGoalNumber = data.levelGoalNumber;
    this.isDark = data.isDark || data.type === 'DARK';
    this.altitudeTier = data.altitudeTier || 1;

    this.initHazards();
  }

  private initHazards() {
    this.hazards = [];
    this.surfaceDecorations.forEach((decor) => {
      if (decor.type === 'SPIKE' || decor.type === 'LAVA_VENT' || decor.type === 'URCHIN') {
        this.hazards.push(
          new SurfaceHazard(`haz_${this.id}_${decor.angle}`, this.id, decor.angle, decor.type, decor.size)
        );
      }
    });
  }

  public update(dt: number) {
    this.flareRotation += dt * 0.8;
  }

  public draw(ctx: CanvasRenderingContext2D, cameraY: number, cameraX: number = 0) {
    const renderX = this.x - cameraX;
    const renderY = this.y - cameraY;

    ctx.save();
    ctx.translate(renderX, renderY);

    const nowAnim = Date.now() * 0.002;

    // 1. Dual-Layer Atmospheric Glow & Void Aura
    const isSun = this.type === 'SUN';
    const isCelestial = this.type === 'CELESTIAL_SANCTUARY';
    const isDarkPlanet = this.type === 'DARK' || this.isDark;
    const isCheckpoint = this.isCheckpoint;

    const atmosRadius = this.radius * (isSun || isCelestial ? 1.6 : isCheckpoint ? 1.45 : 1.32);
    const radGrad = ctx.createRadialGradient(0, 0, this.radius * 0.7, 0, 0, atmosRadius);

    if (isDarkPlanet) {
      // Ominous Cursed Dark Void Aura
      radGrad.addColorStop(0, 'rgba(88, 28, 135, 0.85)');
      radGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.6)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (isCelestial) {
      // Divine Celestial Sanctuary Starlight Glow
      radGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      radGrad.addColorStop(0.45, 'rgba(250, 204, 21, 0.45)');
      radGrad.addColorStop(0.8, 'rgba(234, 179, 8, 0.15)');
      radGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    } else if (isSun) {
      radGrad.addColorStop(0, 'rgba(251, 146, 60, 0.85)');
      radGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
      radGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    } else {
      radGrad.addColorStop(0, (this.atmosphereColor || this.secondaryColor) + '77');
      radGrad.addColorStop(0.6, this.color + '22');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(0, 0, atmosRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Checkpoint Goal Light Pillar / Star Rays
    if (isCheckpoint) {
      ctx.save();
      // Upward ascending starlight beam
      const beamGrad = ctx.createLinearGradient(0, -this.radius, 0, -this.radius - 120);
      beamGrad.addColorStop(0, 'rgba(250, 204, 21, 0.65)');
      beamGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.3)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-18, -this.radius);
      ctx.lineTo(18, -this.radius);
      ctx.lineTo(32, -this.radius - 120);
      ctx.lineTo(-32, -this.radius - 120);
      ctx.closePath();
      ctx.fill();

      // Rotating holographic sanctuary diamond
      ctx.rotate(nowAnim * 0.6);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-12, -12, 24, 24);
      ctx.restore();
    }

    // 3. Solar & Celestial Coronal Flares
    if (isSun || isCelestial) {
      ctx.save();
      ctx.rotate(this.flareRotation);
      const rayCount = isCelestial ? 20 : 16;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const rayLen = this.radius + 14 + Math.sin(this.flareRotation * 2.5 + i * 1.5) * 8;
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.75)' : 'rgba(251, 146, 60, 0.5)';
        ctx.lineWidth = isCelestial ? 2.5 : 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (this.radius - 2), Math.sin(angle) * (this.radius - 2));
        ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Back Half of Planetary Ring (if enabled)
    if (this.hasRing) {
      ctx.save();
      ctx.rotate(-Math.PI / 8);
      ctx.scale(1.0, 0.32);
      ctx.strokeStyle = this.ringColor!;
      ctx.lineWidth = isCheckpoint ? 14 : 10;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.65, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Procedural 3D Volumetric Spherical Texture Shader Body
    const bodyGrad = ctx.createRadialGradient(
      -this.radius * 0.38,
      -this.radius * 0.38,
      this.radius * 0.03,
      0,
      0,
      this.radius
    );

    if (isDarkPlanet) {
      // Obsidian Cursed Stone Core
      bodyGrad.addColorStop(0, '#334155');
      bodyGrad.addColorStop(0.2, '#1e1b4b');
      bodyGrad.addColorStop(0.55, '#090514');
      bodyGrad.addColorStop(0.85, '#020617');
      bodyGrad.addColorStop(1, '#000000');
    } else if (isCelestial) {
      // Divine Celestial Sanctuary Core
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.2, '#fef9c3');
      bodyGrad.addColorStop(0.5, '#fde047');
      bodyGrad.addColorStop(0.8, '#eab308');
      bodyGrad.addColorStop(1, '#854d0e');
    } else if (this.type === 'CRYSTAL') {
      // Prismatic Amethyst / Sapphire Crystal Core
      bodyGrad.addColorStop(0, '#fdf4ff');
      bodyGrad.addColorStop(0.2, '#d8b4fe');
      bodyGrad.addColorStop(0.5, '#9333ea');
      bodyGrad.addColorStop(0.8, '#581c87');
      bodyGrad.addColorStop(1, '#1e0736');
    } else if (this.type === 'NEON') {
      // Cyber Quantum Matrix Core
      bodyGrad.addColorStop(0, '#e0f2fe');
      bodyGrad.addColorStop(0.18, '#38bdf8');
      bodyGrad.addColorStop(0.48, '#0284c7');
      bodyGrad.addColorStop(0.8, '#0f172a');
      bodyGrad.addColorStop(1, '#020617');
    } else if (this.type === 'MAGMA') {
      // Volcanic Basalt & Lava Core
      bodyGrad.addColorStop(0, '#ffedd5');
      bodyGrad.addColorStop(0.18, '#fb923c');
      bodyGrad.addColorStop(0.48, '#dc2626');
      bodyGrad.addColorStop(0.8, '#7f1d1d');
      bodyGrad.addColorStop(1, '#1c0505');
    } else if (this.type === 'SUN') {
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.15, '#fef08a');
      bodyGrad.addColorStop(0.45, '#fde047');
      bodyGrad.addColorStop(0.75, '#f59e0b');
      bodyGrad.addColorStop(1, '#9a3412');
    } else if (this.type === 'GRASS') {
      bodyGrad.addColorStop(0, '#f0fdf4');
      bodyGrad.addColorStop(0.18, '#86efac');
      bodyGrad.addColorStop(0.48, '#22c55e');
      bodyGrad.addColorStop(0.8, '#15803d');
      bodyGrad.addColorStop(1, '#032e15');
    } else if (this.type === 'MECH') {
      bodyGrad.addColorStop(0, '#fffbeb');
      bodyGrad.addColorStop(0.18, '#fef08a');
      bodyGrad.addColorStop(0.45, '#ca8a04');
      bodyGrad.addColorStop(0.8, '#78350f');
      bodyGrad.addColorStop(1, '#1c0a02');
    } else if (this.type === 'PLASMA' || this.type === 'ICE') {
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.18, '#e0f2fe');
      bodyGrad.addColorStop(0.45, '#38bdf8');
      bodyGrad.addColorStop(0.8, '#0284c7');
      bodyGrad.addColorStop(1, '#082f49');
    } else if (this.type === 'ASTEROID') {
      bodyGrad.addColorStop(0, '#fffbe0');
      bodyGrad.addColorStop(0.18, '#fef3c7');
      bodyGrad.addColorStop(0.48, '#d97706');
      bodyGrad.addColorStop(0.8, '#78350f');
      bodyGrad.addColorStop(1, '#180a01');
    } else {
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.2, this.secondaryColor);
      bodyGrad.addColorStop(0.75, this.color);
      bodyGrad.addColorStop(1, '#050811');
    }

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 6. Volumetric Glossy Specular Key Light Spot
    if (!isDarkPlanet) {
      const specGrad = ctx.createRadialGradient(
        -this.radius * 0.38,
        -this.radius * 0.38,
        0,
        -this.radius * 0.38,
        -this.radius * 0.38,
        this.radius * 0.45
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Atmospheric Rim Lighting (Fresnel Effect)
    const rimGrad = ctx.createRadialGradient(0, 0, this.radius * 0.78, 0, 0, this.radius);
    rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    rimGrad.addColorStop(0.8, isDarkPlanet ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)');
    rimGrad.addColorStop(1, isDarkPlanet ? '#7e22ce' : this.atmosphereColor || this.secondaryColor);

    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 8. Procedural Surface Textures & Dynamics
    ctx.save();
    ctx.clip(); // Clip within planet circle

    if (isDarkPlanet) {
      // Dark Planet: Glowing Cursed Magma/Void Fissures & Dark Runes
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.7, -this.radius * 0.2);
      ctx.lineTo(-this.radius * 0.2, 0);
      ctx.lineTo(this.radius * 0.1, -this.radius * 0.4);
      ctx.lineTo(this.radius * 0.6, -this.radius * 0.1);
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.3, this.radius * 0.3);
      ctx.lineTo(0, this.radius * 0.5);
      ctx.lineTo(this.radius * 0.4, this.radius * 0.2);
      ctx.stroke();

      // Cursed glowing eye/rune at core
      const runePulse = Math.sin(nowAnim * 3) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(168, 85, 247, ${runePulse})`;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'CRYSTAL') {
      // Crystal Nebula: Prismatic Facets & Floating Crystal Shards
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.6)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const ca = (i / 6) * Math.PI * 2 + nowAnim * 0.2;
        const cr = this.radius * 0.6;
        ctx.strokeRect(Math.cos(ca) * cr - 8, Math.sin(ca) * cr - 8, 16, 16);
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, -this.radius * 0.7);
      ctx.lineTo(this.radius * 0.5, 0);
      ctx.lineTo(0, this.radius * 0.7);
      ctx.lineTo(-this.radius * 0.5, 0);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'NEON') {
      // Cyber Quantum Matrix: Glowing Circuit Grid
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      const gridSize = 16;
      for (let x = -this.radius; x <= this.radius; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -this.radius);
        ctx.lineTo(x, this.radius);
        ctx.stroke();
      }
      for (let y = -this.radius; y <= this.radius; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-this.radius, y);
        ctx.lineTo(this.radius, y);
        ctx.stroke();
      }
      // Glowing Nodes
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.arc(16, 16, 3, 0, Math.PI * 2);
      ctx.arc(-16, -16, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'MAGMA') {
      // Molten Basalt Tectonic Plates & Glowing Lava
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.7, -this.radius * 0.1);
      ctx.lineTo(-this.radius * 0.2, -this.radius * 0.3);
      ctx.lineTo(this.radius * 0.3, -this.radius * 0.1);
      ctx.lineTo(this.radius * 0.6, -this.radius * 0.4);
      ctx.stroke();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.4, this.radius * 0.2);
      ctx.lineTo(0, this.radius * 0.4);
      ctx.lineTo(this.radius * 0.4, this.radius * 0.1);
      ctx.stroke();
    } else if (this.type === 'GRASS') {
      // Meadow contours & cute daisy patches
      ctx.fillStyle = '#4ade80';
      const grassCount = 42;
      for (let i = 0; i < grassCount; i++) {
        const ga = (i / grassCount) * Math.PI * 2;
        const gx = Math.cos(ga) * (this.radius - 2);
        const gy = Math.sin(ga) * (this.radius - 2);
        ctx.beginPath();
        ctx.arc(gx, gy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.type === 'MECH') {
      // Rotating Clockwork Brass Gears
      ctx.save();
      ctx.rotate(nowAnim * 0.8 * this.rotationDirection);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      const toothCount = 12;
      for (let i = 0; i < toothCount; i++) {
        const ta = (i / toothCount) * Math.PI * 2;
        ctx.fillRect(Math.cos(ta) * (this.radius * 0.5) - 3, Math.sin(ta) * (this.radius * 0.5) - 3, 6, 6);
      }
      ctx.restore();
    }

    ctx.restore();

    // 9. Surface Craters, Hazards, & Storybook Diorama Props
    this.surfaceDecorations.forEach((decor) => {
      ctx.save();
      ctx.rotate(decor.angle);

      const dx = this.radius - 2;
      if (decor.type === 'CHECKPOINT_BEACON') {
        // High-tech Starlight Beacon with pulsing antenna
        ctx.fillStyle = '#facc15';
        ctx.fillRect(dx, -3, 16, 6);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(dx + 16, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing radio wave ring
        const wave = (Date.now() * 0.004) % 1;
        ctx.strokeStyle = `rgba(56, 189, 248, ${1 - wave})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dx + 16, 0, 5 + wave * 14, 0, Math.PI * 2);
        ctx.stroke();
      } else if (decor.type === 'DARK_CRYSTAL') {
        // Jagged Obsidian Shards on Dark Planets
        ctx.fillStyle = '#581c87';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dx, -5);
        ctx.lineTo(dx + 14, 0);
        ctx.lineTo(dx, 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (decor.type === 'CRATER') {
        ctx.fillStyle = 'rgba(9, 13, 22, 0.5)';
        ctx.beginPath();
        ctx.arc(dx - 3, 0, decor.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(dx - 3, 0, decor.size, Math.PI * 0.7, Math.PI * 1.8);
        ctx.stroke();
      } else if (decor.type === 'DAISY') {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dx, 0);
        ctx.lineTo(dx + 4, 0);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        for (let p = 0; p < 6; p++) {
          const pa = (p / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(dx + 4 + Math.cos(pa) * 3, Math.sin(pa) * 3, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(dx + 4, 0, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (decor.type === 'TREE') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(dx, -1.5, 4, 3);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(dx + 3, -7);
        ctx.lineTo(dx + 12, 0);
        ctx.lineTo(dx + 3, 7);
        ctx.closePath();
        ctx.fill();
      } else if (decor.type === 'HOUSE') {
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(dx + 1, -5, 6, 10);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(dx + 6, -8);
        ctx.lineTo(dx + 12, 0);
        ctx.lineTo(dx + 6, 8);
        ctx.closePath();
        ctx.fill();
      } else if (decor.type === 'TELESCOPE') {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(dx, 0);
        ctx.lineTo(dx + 12, -4);
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(dx + 12, -4, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (decor.type === 'SPIKE') {
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dx, -7);
        ctx.lineTo(dx + 15, 0);
        ctx.lineTo(dx, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (decor.type === 'LAVA_VENT') {
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(dx, -6, 8, 12);
        const lavaPulse = (Date.now() * 0.006) % 1;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(dx + 8 + lavaPulse * 8, 0, 4 * (1 - lavaPulse * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else if (decor.type === 'URCHIN') {
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.arc(dx + 6, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        for (let u = 0; u < 8; u++) {
          const ua = (u / 8) * Math.PI * 2 + nowAnim * 2;
          ctx.beginPath();
          ctx.moveTo(dx + 6, 0);
          ctx.lineTo(dx + 6 + Math.cos(ua) * 13, Math.sin(ua) * 13);
          ctx.stroke();
        }
      }

      ctx.restore();
    });

    // 10. Front Half of Planetary Ring
    if (this.hasRing) {
      ctx.save();
      ctx.rotate(-Math.PI / 8);
      ctx.scale(1.0, 0.32);
      ctx.strokeStyle = this.ringColor!;
      ctx.lineWidth = isCheckpoint ? 14 : 10;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.65, 0, Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    // 11. Level Goal / Sector Flagship Victory Beacon Banner
    if (this.isLevelGoal) {
      ctx.save();
      const flagPulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12 + flagPulse * 6;
      ctx.font = '900 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `🏆 SECTOR ${this.levelGoalNumber || 1} COMMAND FLAGSHIP 🏆`,
        0,
        this.radius + 32
      );

      // Rotating Golden Hyperspace Goal Ring
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.6 + flagPulse * 0.4})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 18 + flagPulse * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    } else if (isCheckpoint) {
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#ca8a04';
      ctx.shadowBlur = 10;
      ctx.font = '900 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `✦ ${this.checkpointName || 'CHECKPOINT'} ✦`,
        0,
        this.radius + 26
      );
      ctx.restore();
    }

    // 12. Visited Star Ring Accent
    if (this.visited) {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  public drawTargetLock(ctx: CanvasRenderingContext2D, cameraY: number, landingX: number, landingY: number, cameraX: number = 0) {
    const now = Date.now() * 0.005;

    ctx.save();
    ctx.translate(landingX - cameraX, landingY - cameraY);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;

    const pulseRadius = 14 + Math.sin(now * 3) * 3;
    ctx.beginPath();
    ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-pulseRadius - 4, 0);
    ctx.lineTo(-pulseRadius + 2, 0);
    ctx.moveTo(pulseRadius + 4, 0);
    ctx.lineTo(pulseRadius - 2, 0);
    ctx.moveTo(0, -pulseRadius - 4);
    ctx.lineTo(0, -pulseRadius + 2);
    ctx.moveTo(0, pulseRadius + 4);
    ctx.lineTo(0, pulseRadius - 2);
    ctx.stroke();

    ctx.restore();
  }
}

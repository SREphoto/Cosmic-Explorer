import { Costume, CostumeId, RocketSkin, RocketSkinId, TrailPoint, Vector2D } from '../types/game';
import { INITIAL_COSTUMES, INITIAL_ROCKET_SKINS, PHYSICS_CONFIG } from '../core/Config';
import { Planet } from './Planet';

interface ClothNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class Player {
  public x: number = 0;
  public y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public radius: number = PHYSICS_CONFIG.PLAYER_RADIUS;

  public isAttached: boolean = true;
  public currentPlanet: Planet | null = null;
  public theta: number = -Math.PI / 2; // Polar surface angle
  public rotationAccumulator: number = 0; // Total radians rotated on current planet
  public isCharging: boolean = false;
  public chargeRatio: number = 0; // 0.0 to 1.0 hold-to-charge jump strength
  public hazardCooldown: number = 0;

  // Kinematic & Animation States
  public runCycle: number = 0;
  public landSquash: number = 1.0;
  public landStretch: number = 1.0;
  public bodyLean: number = 0;
  public hairSway: number = 0;
  public blinkTimer: number = 2.0;
  public isBlinking: boolean = false;
  public blinkProgress: number = 0;
  public haloRotation: number = 0;

  // Physics-driven Cloth Simulation for Scarves & Capes
  public clothNodes: ClothNode[] = [];

  // Accessory Physics (Pendulum for Chrono Pocket Watch / Amulet)
  public watchPendulumAngle: number = 0;
  public watchPendulumVel: number = 0;

  public activeCostume: Costume;
  public activeRocketSkin: RocketSkin;
  public activeAccessoryId: string = 'GEAR_SCARF_RED';
  public isRewinding: boolean = false;
  public rewindProgress: number = 0;
  public trail: TrailPoint[] = [];

  public isCometActive: boolean = false;
  public isMagnetActive: boolean = false;
  public petrificationRatio: number = 0; // 0.0 to 1.0 (stone curse on dark planets)
  public isPetrified: boolean = false;
  public gravityIntensity: number = 0; // 0.0 (deep space) to 1.0 (strong orbit pull)
  public constellationColor: string = '#38bdf8';
  public currentAltitude: number = 0;
  public cometTailIntensity: number = 0; // 0.0 to 1.0 dynamic comet tail strength

  constructor(costumeId: CostumeId = 'ASTRONAUT', rocketSkinId: RocketSkinId = 'APOLLO') {
    this.activeCostume = INITIAL_COSTUMES.find((c) => c.id === costumeId) || INITIAL_COSTUMES[0];
    this.activeRocketSkin = INITIAL_ROCKET_SKINS.find((r) => r.id === rocketSkinId) || INITIAL_ROCKET_SKINS[0];

    // Initialize 8 cloth nodes for ultra-smooth cloth wave dynamics
    for (let i = 0; i < 8; i++) {
      this.clothNodes.push({ x: 0, y: i * 4, vx: 0, vy: 0 });
    }
  }

  public setCostume(costumeId: CostumeId) {
    const found = INITIAL_COSTUMES.find((c) => c.id === costumeId);
    if (found) {
      this.activeCostume = found;
    }
  }

  public setRocketSkin(rocketSkinId: RocketSkinId) {
    const found = INITIAL_ROCKET_SKINS.find((r) => r.id === rocketSkinId);
    if (found) {
      this.activeRocketSkin = found;
    }
  }

  public setAccessory(accessoryId: string) {
    this.activeAccessoryId = accessoryId;
  }

  public setEquippedGear(gear: { accessoryId?: string }) {
    if (gear.accessoryId) {
      this.activeAccessoryId = gear.accessoryId;
    }
  }

  public attachToPlanet(planet: Planet, contactAngle?: number) {
    this.isAttached = true;
    this.currentPlanet = planet;
    this.vx = 0;
    this.vy = 0;
    this.rotationAccumulator = 0;

    // Organic landing squash & stretch with bounce damping
    this.landSquash = 1.38;
    this.landStretch = 0.72;

    if (contactAngle !== undefined) {
      this.theta = contactAngle;
    } else {
      this.theta = Math.atan2(this.y - planet.y, this.x - planet.x);
    }

    this.updateAttachedPosition();
  }

  public launch(overrideCharge?: number): Vector2D | null {
    if (!this.isAttached || !this.currentPlanet) return null;

    const planet = this.currentPlanet;
    const dir = planet.rotationDirection;
    const speedMultiplier = this.isCometActive ? PHYSICS_CONFIG.COMET_SPEED_MULTIPLIER : 1.0;

    const charge = overrideCharge !== undefined ? overrideCharge : this.chargeRatio;
    const minSpeed = PHYSICS_CONFIG.LAUNCH_SPEED_MIN;
    const maxSpeed = PHYSICS_CONFIG.LAUNCH_SPEED_MAX;
    const baseRadialSpeed = minSpeed + charge * (maxSpeed - minSpeed);

    const cosT = Math.cos(this.theta);
    const sinT = Math.sin(this.theta);

    const radialSpeed = baseRadialSpeed * speedMultiplier;
    const tangentSpeed = planet.angularVelocity * planet.radius * PHYSICS_CONFIG.LAUNCH_SPEED_TANGENT_MULT * dir;

    const launchVx = cosT * radialSpeed - sinT * tangentSpeed;
    const launchVy = sinT * radialSpeed + cosT * tangentSpeed;

    this.vx = launchVx;
    this.vy = launchVy;
    this.isAttached = false;
    this.currentPlanet = null;
    this.isCharging = false;
    this.chargeRatio = 0;

    // Launch aerodynamic stretch
    this.landSquash = 0.70;
    this.landStretch = 1.42;

    // Burst of rocket thruster particles matching active rocket skin flame color
    for (let i = 0; i < 24; i++) {
      this.trail.push({
        x: this.x + (Math.random() - 0.5) * 14,
        y: this.y + (Math.random() - 0.5) * 14,
        alpha: 1.0,
        size: Math.random() * 10 + 4,
        color: this.activeRocketSkin.flameColor
      });
    }

    return { x: launchVx, y: launchVy };
  }

  public activateJetpackThrust(targetX: number, targetY: number) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const thrustSpeed = PHYSICS_CONFIG.JETPACK_THRUST_SPEED;
    this.vx = (dx / dist) * thrustSpeed;
    this.vy = (dy / dist) * thrustSpeed;
    this.isAttached = false;
    this.currentPlanet = null;

    // Dynamic jetpack ignition burst
    for (let i = 0; i < 25; i++) {
      this.trail.push({
        x: this.x + (Math.random() - 0.5) * 14,
        y: this.y + (Math.random() - 0.5) * 14,
        alpha: 1.0,
        size: 9.5,
        color: this.activeRocketSkin.flameColor
      });
    }
  }

  public activateRicochetBounce(planetX: number, planetY: number) {
    const dx = this.x - planetX;
    const dy = this.y - planetY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const nx = dx / dist;
    const ny = dy / dist;

    // Vector reflection: v_ref = v - 2(v . n)n
    const dot = this.vx * nx + this.vy * ny;
    const rx = this.vx - 2 * dot * nx;
    const ry = this.vy - 2 * dot * ny;

    // Apply speed boost multiplier
    const speedMult = PHYSICS_CONFIG.RICOCHET_BOOST_MULT;
    this.vx = rx * speedMult;
    this.vy = ry * speedMult;

    // Kinetic bounce stretch
    this.landSquash = 0.75;
    this.landStretch = 1.35;

    for (let i = 0; i < 18; i++) {
      this.trail.push({
        x: this.x + (Math.random() - 0.5) * 12,
        y: this.y + (Math.random() - 0.5) * 12,
        alpha: 1.0,
        size: 8.5,
        color: this.activeRocketSkin.primaryColor
      });
    }
  }

  public update(dt: number) {
    // 1. Smooth Spring Elastic Squash/Stretch Recovery
    this.landSquash += (1.0 - this.landSquash) * (9.5 * dt);
    this.landStretch += (1.0 - this.landStretch) * (9.5 * dt);

    // 2. Natural Eye Blinking Cycle
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      this.blinkProgress += dt * 8.0;
      if (this.blinkProgress >= 1.0) {
        this.isBlinking = false;
        this.blinkProgress = 0;
        this.blinkTimer = 2.8 + Math.random() * 2.5; // Natural randomized blink interval
      }
    }

    // 3. Continuous Celestial Halos & Auras Rotation
    this.haloRotation += dt * 1.8;

    // 4. Movement Logic & Dynamic Kinematics
    if (this.isAttached && this.currentPlanet) {
      const planet = this.currentPlanet;
      const dTheta = planet.angularVelocity * planet.rotationDirection * dt;
      this.theta += dTheta;
      this.rotationAccumulator += Math.abs(dTheta);
      
      // Natural running speed stride
      const strideSpeed = Math.abs(planet.angularVelocity) * 6.5;
      this.runCycle += strideSpeed * dt * 10;

      // Dynamic forward body lean proportional to rotation velocity
      const targetLean = (planet.angularVelocity * planet.rotationDirection) * 0.12;
      this.bodyLean += (targetLean - this.bodyLean) * (8.0 * dt);

      // Inertia hair sway
      const targetHairSway = -planet.rotationDirection * Math.min(1.0, Math.abs(planet.angularVelocity) * 0.35);
      this.hairSway += (targetHairSway - this.hairSway) * (6.0 * dt);

      this.updateAttachedPosition();
      this.cometTailIntensity = Math.max(0, this.cometTailIntensity - dt * 3.0);

      // Scarf & Cloth simulation in surface wind
      this.updateClothSimulation(dt, -planet.rotationDirection * 25, 0);
    } else {
      // Airborne Free Flight Movement
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      this.bodyLean += (0 - this.bodyLean) * (6.0 * dt);

      // Hair trailing back from wind resistance
      const speed = Math.hypot(this.vx, this.vy);
      const windAngle = Math.atan2(this.vy, this.vx);
      this.hairSway += (Math.sin(Date.now() * 0.008) * 0.3 - this.hairSway) * (7.0 * dt);

      // Scarf & Cloth simulation in aerodynamic slipstream
      const dragVx = -Math.cos(windAngle) * (speed * 0.18);
      const dragVy = -Math.sin(windAngle) * (speed * 0.18);
      this.updateClothSimulation(dt, dragVx, dragVy);

      // Dynamic Particle Trail & Comet Tail calculation
      const grav = Math.min(1.0, Math.max(0, this.gravityIntensity));
      const speedCometFactor = Math.min(1.0, Math.max(0, (speed - 380) / 280));
      const altCometFactor = this.currentAltitude >= 1500 ? Math.min(1.0, (this.currentAltitude - 1500) / 2000) : 0;
      const targetCometIntensity = this.isCometActive ? 1.0 : Math.max(speedCometFactor, altCometFactor * 0.85);

      this.cometTailIntensity += (targetCometIntensity - this.cometTailIntensity) * (5.5 * dt);
      
      const particleCount = this.isCometActive ? 6 : this.cometTailIntensity > 0.3 ? 4 : 1 + Math.floor(grav * 3.5 + (speed / 700) * 1.5);
      
      for (let p = 0; p < particleCount; p++) {
        let pColor = this.activeRocketSkin.flameColor;

        if (this.isCometActive) {
          pColor = Math.random() < 0.6 ? '#facc15' : '#f97316';
        } else if (this.cometTailIntensity > 0.25) {
          if (Math.random() < 0.6) {
            pColor = this.constellationColor;
          } else if (Math.random() < 0.5) {
            pColor = '#ffffff';
          } else {
            pColor = this.activeRocketSkin.flameColor;
          }
        } else if (grav > 0.65) {
          pColor = Math.random() < 0.45 ? this.activeRocketSkin.primaryColor : this.activeRocketSkin.flameColor;
        } else if (grav > 0.35) {
          pColor = Math.random() < 0.7 ? this.activeRocketSkin.flameColor : '#ffffff';
        } else {
          pColor = Math.random() < 0.5 ? this.activeRocketSkin.flameColor : '#bae6fd';
        }

        const sizeBase = (this.isCometActive ? 8.5 : this.cometTailIntensity > 0.25 ? 6.5 : 4.5) + grav * 3.5;
        this.trail.push({
          x: this.x + (Math.random() - 0.5) * (8 + grav * 6 + this.cometTailIntensity * 8),
          y: this.y + (Math.random() - 0.5) * (8 + grav * 6 + this.cometTailIntensity * 8),
          alpha: 1.0,
          size: sizeBase * (0.8 + Math.random() * 0.4),
          color: pColor
        });
      }
    }

    // 5. Watch Pendulum Physics
    const targetPendulum = this.isAttached ? Math.sin(this.runCycle * 1.2) * 0.4 : Math.sin(Date.now() * 0.004) * 0.25;
    const accel = (targetPendulum - this.watchPendulumAngle) * 20.0 - this.watchPendulumVel * 4.0;
    this.watchPendulumVel += accel * dt;
    this.watchPendulumAngle += this.watchPendulumVel * dt;

    // 6. Update Particle Trails
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].alpha -= dt * (2.2 - this.gravityIntensity * 0.5 - this.cometTailIntensity * 0.4);
      this.trail[i].size *= 0.95;
      if (this.trail[i].alpha <= 0) {
        this.trail.splice(i, 1);
      }
    }
  }

  private updateClothSimulation(dt: number, externalVx: number, externalVy: number) {
    const rootX = 0;
    const rootY = -2;
    this.clothNodes[0].x = rootX;
    this.clothNodes[0].y = rootY;

    const segmentDist = 3.8;
    const windFlutter = Math.sin(Date.now() * 0.009) * 3.5;

    for (let i = 1; i < this.clothNodes.length; i++) {
      const prev = this.clothNodes[i - 1];
      const curr = this.clothNodes[i];

      // Damping and spring force to follow previous node
      curr.vx += (externalVx + windFlutter * (i * 0.2) - curr.vx) * (14.0 * dt);
      curr.vy += (externalVy + 18.0 - curr.vy) * (14.0 * dt);

      curr.x += curr.vx * dt;
      curr.y += curr.vy * dt;

      // Distance constraint
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.hypot(dx, dy) || 1;
      const factor = (dist - segmentDist) / dist;

      curr.x -= dx * factor * 0.75;
      curr.y -= dy * factor * 0.75;
    }
  }

  private updateAttachedPosition() {
    if (!this.currentPlanet) return;
    const distance = this.currentPlanet.radius + PHYSICS_CONFIG.SURFACE_OFFSET;
    this.x = this.currentPlanet.x + distance * Math.cos(this.theta);
    this.y = this.currentPlanet.y + distance * Math.sin(this.theta);
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, freezeRatio: number = 0) {
    const renderX = this.x - cameraX;
    const renderY = this.y - cameraY;

    // Glowing Comet Tail Ribbon
    if (this.cometTailIntensity > 0.15 && this.trail.length > 3) {
      ctx.save();
      ctx.beginPath();
      const numPts = Math.min(this.trail.length, 14);
      ctx.moveTo(renderX, renderY);
      for (let i = 0; i < numPts; i++) {
        const pt = this.trail[this.trail.length - 1 - i];
        ctx.lineTo(pt.x - cameraX, pt.y - cameraY);
      }
      ctx.strokeStyle = this.constellationColor;
      ctx.lineWidth = 7 * this.cometTailIntensity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = this.constellationColor;
      ctx.shadowBlur = 16 * this.cometTailIntensity;
      ctx.globalAlpha = 0.5 * this.cometTailIntensity;
      ctx.stroke();
      ctx.restore();
    }

    // Dynamic glowing particle trail
    this.trail.forEach((p) => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      
      if (p.size > 5.0 || this.cometTailIntensity > 0.3) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
      }
      
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y - cameraY, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Character Rendering
    ctx.save();
    
    // Freezing shiver jitter
    const shiverX = freezeRatio > 0.05 ? (Math.random() - 0.5) * 2.5 * freezeRatio : 0;
    const shiverY = freezeRatio > 0.05 ? (Math.random() - 0.5) * 2.5 * freezeRatio : 0;
    ctx.translate(renderX + shiverX, renderY + shiverY);

    // Calculate facing rotation
    let angle = 0;
    if (this.isAttached && this.currentPlanet) {
      angle = this.theta + Math.PI / 2 + this.bodyLean;
    } else {
      angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
    }
    ctx.rotate(angle);

    // Squash & Stretch
    ctx.scale(this.landSquash, this.landStretch);

    // Magnet aura
    if (this.isMagnetActive) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Comet aura
    if (this.isCometActive) {
      ctx.save();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Atmospheric Re-entry Plasma Heat Shield & Bow-Shock Flares (Graphics Feature #1)
    const flightSpeed = Math.hypot(this.vx, this.vy);
    if (!this.isAttached && (flightSpeed > 540 || this.isCometActive)) {
      this.drawPlasmaReentryShield(ctx, flightSpeed);
    }

    // 1. Mounted Rocket Thruster Backpack
    this.drawRocketBackpack(ctx);

    // 2. Cloth Simulation / Equipped Accessories (Scarves, Capes, Chrono Watches)
    this.drawAccessory(ctx);

    // 3. Legs, Boots & Articulated Kinematics
    this.drawLegsAndBoots(ctx);

    // 4. Torso, Flight Jacket / Royal Doublet & Pilot Arms
    this.drawTorso(ctx);

    // 5. Boy Head, Animated Blinking Eyes & Warm Smile
    this.drawHeadAndFace(ctx);

    // 6. Hat, Goggles, Helmets, Halos & Crowns
    this.drawHat(ctx);

    // 7. Stone Petrification Overlay
    if (this.petrificationRatio > 0 || this.isPetrified) {
      this.drawStonePetrification(ctx, this.isPetrified ? 1.0 : this.petrificationRatio);
    }

    // 8. Ice Crystal Encasement
    if (freezeRatio > 0.05) {
      this.drawIceCrystalEncasement(ctx, freezeRatio);
    }

    ctx.restore();
  }

  private drawStonePetrification(ctx: CanvasRenderingContext2D, ratio: number) {
    ctx.save();
    const topY = 26 - ratio * 56;

    ctx.save();
    ctx.beginPath();
    ctx.rect(-18, topY, 36, 60);
    ctx.clip();

    ctx.fillStyle = 'rgba(71, 85, 105, 0.88)';
    ctx.fillRect(-18, -30, 36, 60);

    ctx.fillStyle = '#1e293b';
    const speckles = [
      { x: -5, y: -10 }, { x: 4, y: -4 }, { x: -2, y: 8 }, { x: 3, y: 16 }, { x: -4, y: 22 },
      { x: 0, y: -20 }, { x: -6, y: 2 }, { x: 5, y: -14 }, { x: -1, y: -2 }
    ];
    speckles.forEach((s) => {
      ctx.fillRect(s.x, s.y, 2.2, 2.2);
    });

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-6, 24); ctx.lineTo(-2, 14); ctx.lineTo(3, 8); ctx.lineTo(-1, -2); ctx.lineTo(4, -12); ctx.lineTo(1, -22);
    ctx.stroke();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, topY);
    ctx.lineTo(-8, topY + 3);
    ctx.lineTo(0, topY - 2);
    ctx.lineTo(8, topY + 4);
    ctx.lineTo(16, topY - 1);
    ctx.stroke();

    ctx.restore();

    if (ratio < 1.0) {
      const now = Date.now() * 0.008;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.beginPath();
      ctx.arc(-8 + Math.sin(now) * 4, topY - 4, 3.5, 0, Math.PI * 2);
      ctx.arc(6 + Math.cos(now * 1.3) * 4, topY - 6, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawIceCrystalEncasement(ctx: CanvasRenderingContext2D, freezeRatio: number) {
    ctx.save();

    const iceAlpha = Math.min(0.75, freezeRatio * 0.8);
    const iceGrad = ctx.createLinearGradient(0, -32, 0, 32);
    iceGrad.addColorStop(0, `rgba(224, 242, 254, ${iceAlpha})`);
    iceGrad.addColorStop(0.5, `rgba(56, 189, 248, ${iceAlpha * 0.7})`);
    iceGrad.addColorStop(1, `rgba(186, 230, 253, ${iceAlpha * 0.9})`);

    ctx.fillStyle = iceGrad;
    ctx.strokeStyle = `rgba(240, 249, 255, ${Math.min(1.0, freezeRatio + 0.2)})`;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12 * freezeRatio;

    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(16, -16);
    ctx.lineTo(18, 14);
    ctx.lineTo(10, 30);
    ctx.lineTo(0, 34);
    ctx.lineTo(-10, 30);
    ctx.lineTo(-18, 14);
    ctx.lineTo(-16, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -32); ctx.lineTo(0, 34);
    ctx.moveTo(-16, -16); ctx.lineTo(16, -16);
    ctx.moveTo(-18, 14); ctx.lineTo(18, 14);
    ctx.stroke();

    ctx.restore();
  }

  private drawAccessory(ctx: CanvasRenderingContext2D) {
    if (this.isRewinding) {
      this.drawRewindAura(ctx);
    }

    if (this.activeAccessoryId === 'GEAR_CHRONO_CLOCK' || this.activeAccessoryId === 'GEAR_CHRONO_ASTROLABE') {
      this.drawChronoClock(ctx, this.activeAccessoryId === 'GEAR_CHRONO_ASTROLABE');
    } else if (this.activeAccessoryId === 'GEAR_STAR_AMULET') {
      this.drawStarAmulet(ctx);
    } else if (this.activeAccessoryId === 'GEAR_PRISMATIC_CAPE') {
      this.drawPrismaticCape(ctx);
    } else {
      this.drawWavingScarf(ctx);
    }
  }

  private drawRewindAura(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const now = Date.now() * 0.005;
    const pulse = (Math.sin(now * 4) + 1) * 0.5;

    ctx.strokeStyle = `rgba(251, 191, 36, ${0.4 + pulse * 0.4})`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(6, 182, 212, ${0.5 + pulse * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();

    const revAngle = -now * 6;
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(revAngle) * 30, Math.sin(revAngle) * 30);
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(revAngle * 0.2) * 20, Math.sin(revAngle * 0.2) * 20);
    ctx.stroke();

    ctx.restore();
  }

  private drawChronoClock(ctx: CanvasRenderingContext2D, isAstrolabe: boolean = false) {
    const now = Date.now() * 0.003;
    const swing = this.watchPendulumAngle * 14;

    ctx.save();

    // 1. Golden Star Chain Loop draped around neck/chest
    ctx.strokeStyle = isAstrolabe ? '#38bdf8' : '#fbbf24';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-5, -6);
    ctx.quadraticCurveTo(swing * 0.3, 2, 4, -5);
    ctx.stroke();

    // 2. Pocket Watch / Astrolabe Body (Positioned over chest / heart)
    const clockX = 1 + swing;
    const clockY = 2 + Math.abs(swing) * 0.2;

    // Small top crown winder loop
    ctx.fillStyle = isAstrolabe ? '#0284c7' : '#d97706';
    ctx.fillRect(clockX - 1.5, clockY - 8, 3, 2);
    ctx.strokeStyle = isAstrolabe ? '#38bdf8' : '#facc15';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(clockX - 2.5, clockY - 10, 5, 3);

    // Watch Outer Gold Bezel
    ctx.fillStyle = isAstrolabe ? '#0369a1' : '#b45309';
    ctx.beginPath();
    ctx.arc(clockX, clockY, 6.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isAstrolabe ? '#06b6d4' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(clockX, clockY, 5.8, 0, Math.PI * 2);
    ctx.fill();

    // Inner Glowing Dial Glass
    const dialGrad = ctx.createRadialGradient(clockX, clockY, 0, clockX, clockY, 5);
    if (isAstrolabe) {
      dialGrad.addColorStop(0, '#e0f2fe');
      dialGrad.addColorStop(0.6, '#38bdf8');
      dialGrad.addColorStop(1, '#0284c7');
    } else {
      dialGrad.addColorStop(0, '#fef9c3');
      dialGrad.addColorStop(0.7, '#fbbf24');
      dialGrad.addColorStop(1, '#d97706');
    }
    ctx.fillStyle = dialGrad;
    ctx.beginPath();
    ctx.arc(clockX, clockY, 4.8, 0, Math.PI * 2);
    ctx.fill();

    // Animated Ticking Clock Hands
    const secondAngle = now * (this.isRewinding ? -12 : 5);
    const minuteAngle = now * (this.isRewinding ? -2 : 0.8);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.cos(secondAngle) * 3.5, clockY + Math.sin(secondAngle) * 3.5);
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.cos(minuteAngle) * 2.5, clockY + Math.sin(minuteAngle) * 2.5);
    ctx.stroke();

    // Center Gold Pivot Pin
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(clockX, clockY, 1.0, 0, Math.PI * 2);
    ctx.fill();

    // Glass Crystal Glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(clockX - 1.5, clockY - 1.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawStarAmulet(ctx: CanvasRenderingContext2D) {
    const now = Date.now() * 0.005;
    const pulse = (Math.sin(now * 3) + 1) * 0.5;

    ctx.save();

    // Silver Chain
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, -6);
    ctx.quadraticCurveTo(0, 1, 4, -5);
    ctx.stroke();

    const starX = 0;
    const starY = 2;

    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8 + pulse * 6;

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const aInner = a + Math.PI / 5;
      const rOuter = 5.5;
      const rInner = 2.5;
      if (i === 0) ctx.moveTo(starX + Math.cos(a) * rOuter, starY + Math.sin(a) * rOuter);
      else ctx.lineTo(starX + Math.cos(a) * rOuter, starY + Math.sin(a) * rOuter);
      ctx.lineTo(starX + Math.cos(aInner) * rInner, starY + Math.sin(aInner) * rInner);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawPrismaticCape(ctx: CanvasRenderingContext2D) {
    const now = Date.now() * 0.006;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const speedStretch = Math.min(speed / 300, 2.0);
    const runSwing = this.isAttached ? Math.sin(this.runCycle * 1.3) * 8 : Math.sin(now * 2.5) * (10 + speedStretch * 5);
    const windOffset = Math.sin(now * 3.8) * 4;

    ctx.save();

    const capeGrad = ctx.createLinearGradient(-10, 0, 15, 35);
    capeGrad.addColorStop(0, '#f43f5e');
    capeGrad.addColorStop(0.3, '#fb923c');
    capeGrad.addColorStop(0.6, '#38bdf8');
    capeGrad.addColorStop(1, '#a855f7');

    ctx.fillStyle = capeGrad;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.quadraticCurveTo(-16 + runSwing * 1.2, 12 + windOffset, -14 + runSwing * 2, 34 + speedStretch * 12);
    ctx.lineTo(6 + runSwing * 1.5, 30 + speedStretch * 10);
    ctx.quadraticCurveTo(12 + runSwing * 0.8, 10, 3, -3);
    ctx.closePath();
    ctx.fill();

    // Diamond Brooch
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2, -3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawWavingScarf(ctx: CanvasRenderingContext2D) {
    const isPrince = this.activeCostume.id === 'PRINCESS';
    const isNinja = this.activeCostume.id === 'NINJA';
    const isPirate = this.activeCostume.id === 'PIRATE';
    const isSolar = this.activeCostume.id === 'SOLAR_SOVEREIGN';
    const isMage = this.activeCostume.id === 'STELLA_MAGE';
    const isCryo = this.activeCostume.id === 'CRYO_ARCHON';

    let scarfColor = '#ef4444';
    let scarfShadow = '#b91c1c';
    let scarfHighlight = '#fca5a5';

    if (isPrince) {
      scarfColor = '#c084fc';
      scarfShadow = '#7e22ce';
      scarfHighlight = '#f3e8ff';
    } else if (isNinja) {
      scarfColor = '#a855f7';
      scarfShadow = '#6b21a8';
      scarfHighlight = '#e9d5ff';
    } else if (isPirate) {
      scarfColor = '#fbbf24';
      scarfShadow = '#b45309';
      scarfHighlight = '#fef9c3';
    } else if (isSolar) {
      scarfColor = '#f59e0b';
      scarfShadow = '#b45309';
      scarfHighlight = '#fef08a';
    } else if (isMage) {
      scarfColor = '#818cf8';
      scarfShadow = '#4338ca';
      scarfHighlight = '#c7d2fe';
    } else if (isCryo) {
      scarfColor = '#38bdf8';
      scarfShadow = '#0369a1';
      scarfHighlight = '#e0f2fe';
    }

    const now = Date.now() * 0.007;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const speedStretch = Math.min(speed / 300, 1.8);
    const runSwing = this.isAttached ? Math.sin(this.runCycle * 1.3) * 7 : Math.sin(now * 2.2) * (8 + speedStretch * 4);
    const windOffset = Math.sin(now * 3.5) * 3;

    ctx.save();

    // Silk Cape / Scarf Ribbon (Back Layer)
    ctx.fillStyle = scarfShadow;
    ctx.beginPath();
    ctx.moveTo(-3, -2);
    ctx.quadraticCurveTo(8 + runSwing * 0.7, 12 + windOffset, 6 + runSwing * 1.5, 28 + speedStretch * 8);
    ctx.lineTo(13 + runSwing * 1.5, 25 + speedStretch * 8);
    ctx.quadraticCurveTo(11 + runSwing * 0.7, 10, 2, -2);
    ctx.closePath();
    ctx.fill();

    // Primary Flowing Scarf Ribbon (Main Front Layer)
    ctx.fillStyle = scarfColor;
    ctx.beginPath();
    ctx.moveTo(-6, -3);
    ctx.quadraticCurveTo(-14 + runSwing * 1.1, 10 + windOffset, -12 + runSwing * 1.8, 30 + speedStretch * 10);
    ctx.lineTo(-4 + runSwing * 1.8, 27 + speedStretch * 10);
    ctx.quadraticCurveTo(-6 + runSwing * 1.1, 8, -1, -3);
    ctx.closePath();
    ctx.fill();

    // Silky Highlight Fold
    ctx.fillStyle = scarfHighlight;
    ctx.beginPath();
    ctx.moveTo(-5, -3);
    ctx.quadraticCurveTo(-12 + runSwing * 1.1, 9 + windOffset, -8 + runSwing * 1.8, 20);
    ctx.lineTo(-6 + runSwing * 1.8, 19);
    ctx.quadraticCurveTo(-7 + runSwing * 1.1, 7, -2, -3);
    ctx.closePath();
    ctx.fill();

    // Golden Cosmic Star Brooch Pin at Neck
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-2.5, -2, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-3.3, -2.8, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawLegsAndBoots(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const bootColor = this.activeCostume.accentColor;

    if (this.isAttached) {
      // Slender running legs with animated stride & knee flexion
      const stride = Math.sin(this.runCycle);
      const stride2 = Math.sin(this.runCycle + Math.PI);
      const legStride = stride * 8.5;
      const legStride2 = stride2 * 8.5;
      const kneeLift1 = Math.max(0, stride) * 3.5;
      const kneeLift2 = Math.max(0, stride2) * 3.5;

      // Left Leg (Slender Navy Pant + Calf-High Space Explorer Boot)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-5.5 + legStride * 0.4, 5, 3.2, 8 - kneeLift1 * 0.3); // Upper thigh
      ctx.fillRect(-6 + legStride * 0.5, 12 - kneeLift1 * 0.3, 3.4, 7); // Shin

      // Left Tall Boot
      ctx.fillStyle = bootColor;
      ctx.beginPath();
      ctx.roundRect(-7 + legStride * 0.55, 16 - kneeLift1 * 0.5, 5.0, 6.5, 1.5);
      ctx.fill();
      // Gold Buckle Strap
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-7 + legStride * 0.55, 17 - kneeLift1 * 0.5, 5.0, 1.2);
      // Aerodynamic Boot Sole & Thruster
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-7.5 + legStride * 0.55, 21.5 - kneeLift1 * 0.5, 5.6, 1.4);

      // Right Leg (Slender Navy Pant + Calf-High Space Explorer Boot)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2 + legStride2 * 0.4, 5, 3.2, 8 - kneeLift2 * 0.3); // Upper thigh
      ctx.fillRect(2.2 + legStride2 * 0.5, 12 - kneeLift2 * 0.3, 3.4, 7); // Shin

      // Right Tall Boot
      ctx.fillStyle = bootColor;
      ctx.beginPath();
      ctx.roundRect(1.5 + legStride2 * 0.55, 16 - kneeLift2 * 0.5, 5.0, 6.5, 1.5);
      ctx.fill();
      // Gold Buckle Strap
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(1.5 + legStride2 * 0.55, 17 - kneeLift2 * 0.5, 5.0, 1.2);
      // Aerodynamic Boot Sole & Thruster
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(1.2 + legStride2 * 0.55, 21.5 - kneeLift2 * 0.5, 5.6, 1.4);
    } else {
      // Airborne Superhero Flight Pose (Aerodynamic star-flight)
      // Front Left Leg extended
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-5.5, 5, 3.2, 9);
      ctx.fillRect(-6.2, 13, 3.4, 8);

      ctx.fillStyle = bootColor;
      ctx.beginPath();
      ctx.roundRect(-7.2, 19, 5.2, 6.5, 1.5);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-7.2, 20, 5.2, 1.2);
      // Glowing Ion Thruster on sole
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-7.5, 24.5, 5.6, 1.5);

      // Back Right Leg trailing
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2.2, 5, 3.2, 8.5);
      ctx.fillRect(2.8, 12.5, 3.4, 7.5);

      ctx.fillStyle = bootColor;
      ctx.beginPath();
      ctx.roundRect(2.0, 18.5, 5.2, 6.5, 1.5);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(2.0, 19.5, 5.2, 1.2);
      // Glowing Ion Thruster on sole
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(1.8, 24, 5.6, 1.5);
    }

    ctx.restore();
  }

  private drawTorso(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Coat Base (Tapered from shoulders to waist)
    ctx.fillStyle = this.activeCostume.bodyColor;
    ctx.beginPath();
    ctx.moveTo(-7.5, -6);
    ctx.lineTo(7.5, -6);
    ctx.lineTo(6.5, 6);
    ctx.lineTo(-6.5, 6);
    ctx.closePath();
    ctx.fill();

    // Standing High Collar & Epaulets
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(-7.5, -6, 15, 2.5); // Collar trim
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-8.4, -5.5, 3.0, 1.6); // Left gold epaulet
    ctx.fillRect(5.4, -5.5, 3.0, 1.6); // Right gold epaulet

    // Double-breasted Gold Buttons
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-2.5, -2.5, 1.1, 0, Math.PI * 2);
    ctx.arc(2.5, -2.5, 1.1, 0, Math.PI * 2);
    ctx.arc(-2.5, 1.5, 1.1, 0, Math.PI * 2);
    ctx.arc(2.5, 1.5, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Slender Chest Telemetry Badge / Communicator
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-4.5, -1.5, 9, 4.5, 1.8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Blinking Status LEDs
    const pulse = (Math.sin(Date.now() * 0.01) + 1) * 0.5;
    ctx.fillStyle = pulse > 0.4 ? '#22c55e' : '#15803d';
    ctx.beginPath();
    ctx.arc(-2.2, 0.8, 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0.8, 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(2.2, 0.8, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Slender Utility Belt & Celestial Star Buckle
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6.5, 5, 13, 2.2);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 6.1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Slender Articulated Arms & Pilot Gloves
    ctx.fillStyle = this.activeCostume.bodyColor;
    if (!this.isAttached) {
      // Airborne: Soaring Star-Glider flight pose with outstretched slender arms
      // Left Arm
      ctx.beginPath();
      ctx.moveTo(-7.5, -4);
      ctx.quadraticCurveTo(-12, -2, -13.5, -7.5);
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = this.activeCostume.bodyColor;
      ctx.stroke();

      // Right Arm
      ctx.beginPath();
      ctx.moveTo(7.5, -4);
      ctx.quadraticCurveTo(12, -2, 13.5, -7.5);
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = this.activeCostume.bodyColor;
      ctx.stroke();

      // Pilot Gloves
      ctx.fillStyle = this.activeCostume.accentColor;
      ctx.beginPath();
      ctx.arc(-14.0, -8.0, 2.2, 0, Math.PI * 2);
      ctx.arc(14.0, -8.0, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Running: Slender arms swinging naturally with running rhythm
      const armSwing = Math.sin(this.runCycle) * 4.2;

      // Left Arm
      ctx.beginPath();
      ctx.moveTo(-7.5, -4);
      ctx.quadraticCurveTo(-10, 0 + armSwing * 0.5, -10.8, 3 + armSwing);
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = this.activeCostume.bodyColor;
      ctx.stroke();

      // Right Arm
      ctx.beginPath();
      ctx.moveTo(7.5, -4);
      ctx.quadraticCurveTo(10, 0 - armSwing * 0.5, 10.8, 3 - armSwing);
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = this.activeCostume.bodyColor;
      ctx.stroke();

      // Pilot Gloves
      ctx.fillStyle = this.activeCostume.accentColor;
      ctx.beginPath();
      ctx.arc(-11.0, 4.5 + armSwing, 2.1, 0, Math.PI * 2);
      ctx.arc(11.0, 4.5 - armSwing, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawHeadAndFace(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const skinTone = this.activeCostume.id === 'ALIEN' ? '#a7f3d0' : '#fed7aa';
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(0, -11, 8.2, 9.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute Little Ears with inner shading
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(-8.5, -11, 2.4, 0, Math.PI * 2);
    ctx.arc(8.5, -11, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.beginPath();
    ctx.arc(-8.5, -11, 1.2, 0, Math.PI * 2);
    ctx.arc(8.5, -11, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Rosy Blushing Cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-5.0, -9.0, 2.4, 1.5, 0, 0, Math.PI * 2);
    ctx.ellipse(5.0, -9.0, 2.4, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tousled Windswept Golden/Brunette Anime Hair
    const hairColor = this.activeCostume.hairColor || '#78350f';
    const hairShadow = '#451a03';
    const hairHighlight = '#d97706';

    const sway = this.hairSway * 3.5;

    // Hair Back Silhouette
    ctx.fillStyle = hairShadow;
    ctx.beginPath();
    ctx.moveTo(-9.5 + sway, -13);
    ctx.quadraticCurveTo(-11 + sway, -24, -3 + sway * 0.5, -22);
    ctx.quadraticCurveTo(2, -26, 7 + sway * 0.5, -20);
    ctx.quadraticCurveTo(11 + sway, -22, 10 + sway, -12);
    ctx.quadraticCurveTo(0, -17, -9.5 + sway, -13);
    ctx.closePath();
    ctx.fill();

    // Main Hair Volume with dynamic wisps
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.moveTo(-9 + sway, -13.5);
    ctx.quadraticCurveTo(-10 + sway, -25, -2.5 + sway * 0.5, -23);
    ctx.quadraticCurveTo(2.5, -27, 7.5 + sway * 0.5, -21);
    ctx.quadraticCurveTo(11.5 + sway, -21.5, 9.5 + sway, -12.5);
    ctx.quadraticCurveTo(0, -18, -9 + sway, -13.5);
    ctx.closePath();
    ctx.fill();

    // Swept Bangs & Front Locks
    ctx.fillStyle = hairHighlight;
    ctx.beginPath();
    ctx.moveTo(-7.5 + sway * 0.5, -17);
    ctx.quadraticCurveTo(-3, -24, 1, -19);
    ctx.quadraticCurveTo(4, -25, 7 + sway * 0.5, -19);
    ctx.quadraticCurveTo(0, -20, -7.5 + sway * 0.5, -17);
    ctx.closePath();
    ctx.fill();

    // Expressive Big Storybook Eyes with Blinking
    if (this.isBlinking) {
      // Gentle cute blinking line
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-3.8, -11, 2.5, 0.2, Math.PI - 0.2);
      ctx.arc(3.8, -11, 2.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (this.isCharging) {
      // Focused determined wink / squint while charging launch strength
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-3.8, -11, 2.6, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Right Eye open with laser focus
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(3.8, -11, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(3.8, -10.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3.0, -11.8, 1.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Big, beautiful, sparkling anime eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-3.8, -11, 2.6, 0, Math.PI * 2);
      ctx.arc(3.8, -11, 2.6, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Iris
      ctx.fillStyle = this.activeCostume.id === 'ALIEN' ? '#10b981' : this.activeCostume.id === 'PRINCESS' ? '#a855f7' : '#0284c7';
      ctx.beginPath();
      ctx.arc(-3.8, -10.5, 1.6, 0, Math.PI * 2);
      ctx.arc(3.8, -10.5, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Double Glint Highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4.6, -11.8, 1.1, 0, Math.PI * 2);
      ctx.arc(3.0, -11.8, 1.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-3.0, -9.8, 0.6, 0, Math.PI * 2);
      ctx.arc(4.6, -9.8, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warm, Confident Smile
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, -7.5, 2.6, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Eyebrows
    ctx.strokeStyle = hairColor;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-6, -14.5);
    ctx.lineTo(-2.2, -14.2);
    ctx.moveTo(2.2, -14.2);
    ctx.lineTo(6, -14.5);
    ctx.stroke();

    ctx.restore();
  }

  private drawRocketBackpack(ctx: CanvasRenderingContext2D) {
    const skin = this.activeRocketSkin;

    ctx.save();

    // Rocket Tanks
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-12.5, -3, 5.8, 14, 2.5);
    ctx.roundRect(6.8, -3, 5.8, 14, 2.5);
    ctx.fill();

    // Metallic Caps with Specular Shine
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(-9.6, -3, 2.9, Math.PI, 0);
    ctx.arc(9.6, -3, 2.9, Math.PI, 0);
    ctx.fill();

    // Exhaust Nozzles
    ctx.fillStyle = '#334155';
    ctx.fillRect(-12, 11, 4.8, 3.2);
    ctx.fillRect(7.2, 11, 4.8, 3.2);

    // Active Thrust Flame Cone when airborne or charging
    if (!this.isAttached || this.isCharging) {
      const flameHeight = !this.isAttached ? 18 + Math.random() * 9 : 7 + this.chargeRatio * 14;
      const flameGrad = ctx.createLinearGradient(0, 14, 0, 14 + flameHeight);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, skin.flameColor);
      flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-12, 14);
      ctx.lineTo(-9.6, 14 + flameHeight);
      ctx.lineTo(-7.2, 14);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(7.2, 14);
      ctx.lineTo(9.6, 14 + flameHeight);
      ctx.lineTo(12, 14);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private drawHat(ctx: CanvasRenderingContext2D) {
    const hatType = this.activeCostume.hatType;

    if (hatType === 'HELMET') {
      // Glass bubble helmet dome / goggles on forehead
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.65)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, -11, 12, 0, Math.PI * 2);
      ctx.stroke();

      // Specular Visor Glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-5.5, -18, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Brass Steampunk Aviator Goggles on forehead (Hero Art Signature)
      ctx.fillStyle = '#b45309'; // Leather strap
      ctx.fillRect(-9.5, -17.5, 19, 1.8);

      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.roundRect(-8.5, -19.5, 7.5, 5.0, 2.2);
      ctx.roundRect(1.0, -19.5, 7.5, 5.0, 2.2);
      ctx.fill();
      ctx.stroke();

      // Copper Goggle Bridge
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-1.0, -17.8, 2.0, 1.6);

      // Cyan Reflective Glass Lenses
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-7.0, -18.5, 4.5, 3.0);
      ctx.fillRect(2.5, -18.5, 4.5, 3.0);

      // Glass Glare Highlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6.0, -18.5, 1.5, 1.2);
      ctx.fillRect(3.5, -18.5, 1.5, 1.2);
    } else if (hatType === 'PIRATE_HAT') {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-15, -17);
      ctx.lineTo(0, -29);
      ctx.lineTo(15, -17);
      ctx.closePath();
      ctx.fill();
      // Gold feather
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(0, -29);
      ctx.quadraticCurveTo(8, -36, 14, -31);
      ctx.quadraticCurveTo(8, -29, 0, -26);
      ctx.fill();
      // Star Jolly Roger Badge
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -22, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'CROWN') {
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-10, -17);
      ctx.lineTo(-10, -27);
      ctx.lineTo(-5, -22);
      ctx.lineTo(0, -29);
      ctx.lineTo(5, -22);
      ctx.lineTo(10, -27);
      ctx.lineTo(10, -17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crown Jewels
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -24, 2.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-7, -21, 1.4, 0, Math.PI * 2);
      ctx.arc(7, -21, 1.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'FOOTBALL_HELMET') {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.roundRect(-10, -25, 20, 10, 3.5);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -25); ctx.lineTo(0, -15);
      ctx.stroke();
    } else if (hatType === 'NINJA_MASK') {
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-9, -15, 18, 5.5);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, -12.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'ALIEN_ANTENNA') {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -17);
      ctx.lineTo(0, -30);
      ctx.stroke();
      const pulse = (Math.sin(Date.now() * 0.008) + 1) * 0.5;
      ctx.fillStyle = pulse > 0.5 ? '#fef08a' : '#34d399';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, -32, 5.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (hatType === 'VISOR') {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillRect(-9.5, -15, 19, 5.0);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-7, -14, 3.5, 1.2);
    } else if (hatType === 'SOLAR_HALO') {
      // Rotating Golden Solar Halo
      ctx.save();
      const haloRot = this.haloRotation;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, -22, 10, 0, Math.PI * 2);
      ctx.stroke();

      // 6 Solar Corona Ray Flares
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + haloRot;
        const r1 = 10;
        const r2 = 14.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, -22 + Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, -22 + Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.restore();
    } else if (hatType === 'WIZARD_HAT') {
      // Midnight Velvet Pointed Mage Hat
      ctx.fillStyle = '#4338ca';
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-14, -16);
      ctx.quadraticCurveTo(0, -14, 14, -16);
      ctx.lineTo(4, -34);
      ctx.lineTo(-4, -34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gold Crescent Moon Amulet on Hat
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -24, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4338ca';
      ctx.beginPath();
      ctx.arc(1.5, -24, 2.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'CRYO_HORNS') {
      // Frosted Crystalline Ice Horns & Parka Fur
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(-10, -17, 20, 3.5); // Fur trim

      ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      // Left Horn
      ctx.moveTo(-8, -17);
      ctx.lineTo(-14, -28);
      ctx.lineTo(-4, -21);
      ctx.closePath();
      // Right Horn
      ctx.moveTo(8, -17);
      ctx.lineTo(14, -28);
      ctx.lineTo(4, -21);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawPlasmaReentryShield(ctx: CanvasRenderingContext2D, speed: number) {
    ctx.save();
    const heatRatio = Math.min(1.0, Math.max(0, (speed - 540) / 450));
    
    // Choose dynamic plasma color based on heat level & skin
    let plasmaColor = '#fbbf24'; // Amber
    let coreColor = '#ffffff';
    let outerGlow = '#f59e0b';

    if (this.isCometActive || heatRatio > 0.7) {
      plasmaColor = '#38bdf8'; // Electric Cyan
      outerGlow = '#818cf8'; // Violet
    } else if (heatRatio > 0.35) {
      plasmaColor = '#f97316'; // Fiery Orange
      outerGlow = '#ef4444'; // Red
    }

    const arcRadius = 26 + heatRatio * 6;
    const arcSpan = 0.82 + heatRatio * 0.4; // Radians half-width

    // Outer plasma flare aura
    ctx.save();
    ctx.strokeStyle = outerGlow;
    ctx.lineWidth = 4.5 + heatRatio * 3.5;
    ctx.shadowColor = plasmaColor;
    ctx.shadowBlur = 18 + heatRatio * 14;
    ctx.globalAlpha = 0.75 + Math.sin(Date.now() * 0.02) * 0.2;

    ctx.beginPath();
    ctx.arc(0, -10, arcRadius, -Math.PI / 2 - arcSpan, -Math.PI / 2 + arcSpan);
    ctx.stroke();

    // Inner sharp white-hot bow-shock core
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.arc(0, -10, arcRadius - 1.5, -Math.PI / 2 - arcSpan * 0.85, -Math.PI / 2 + arcSpan * 0.85);
    ctx.stroke();
    ctx.restore();

    // Lateral thermal deflection flares & heat particles
    const now = Date.now() * 0.015;
    ctx.fillStyle = plasmaColor;
    ctx.globalAlpha = 0.85;
    for (let f = 0; f < 3; f++) {
      const offset = (f - 1) * 8;
      const flareLen = 12 + Math.sin(now + f * 1.5) * 6 + heatRatio * 10;
      ctx.beginPath();
      ctx.ellipse(offset, -26 - heatRatio * 4, 2.5, flareLen * 0.35, -offset * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

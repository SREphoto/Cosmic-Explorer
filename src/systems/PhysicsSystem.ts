import { PHYSICS_CONFIG } from '../core/Config';
import { Planet } from '../entities/Planet';
import { Player } from '../entities/Player';
import { SurfaceHazard } from '../entities/SurfaceHazard';
import { Vector2D } from '../types/game';

export interface TrajectoryPrediction {
  points: Vector2D[];
  targetPlanet?: Planet;
  landingPoint?: Vector2D;
}

export class PhysicsSystem {
  /**
   * Maps planetary mass proportionally to rendered radius squared (M = M_base * (R / R_ref)^2)
   * so larger planets and suns exert stronger, realistic gravitational pull.
   */
  public static getPlanetMass(planet: Planet): number {
    const normRadius = planet.radius / 55.0;
    const massArea = Math.pow(normRadius, 2.0);
    const typeMult =
      planet.type === 'SUN' || planet.type === 'STORM'
        ? 2.4
        : planet.type === 'RINGED_GIANT' || planet.type === 'CLOUD'
          ? 1.7
          : planet.type === 'MECH'
            ? 1.35
            : planet.type === 'MOON' || planet.type === 'ASTEROID'
              ? 0.62
              : 1.0;
    return PHYSICS_CONFIG.PLANET_MASS_DEFAULT * massArea * typeMult;
  }

  /**
   * Calculates gravitational acceleration using inverse-square law with smooth boundary blending
   * and softening factor, creating realistic, satisfying orbital slingshots and gravity captures.
   */
  public static calculateGravitationalAcceleration(playerX: number, playerY: number, planets: Planet[]): Vector2D {
    let ax = 0;
    let ay = 0;

    for (const planet of planets) {
      const dx = planet.x - playerX;
      const dy = planet.y - playerY;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      const mass = PhysicsSystem.getPlanetMass(planet);
      planet.mass = mass;

      const influenceRadius = planet.radius * (planet.type === 'SUN' ? PHYSICS_CONFIG.SUN_INFLUENCE_MULT : PHYSICS_CONFIG.GRAVITY_INFLUENCE_MULT);

      if (dist <= influenceRadius && dist > 1) {
        // Smooth hermite cubic falloff at boundary so gravity activates smoothly with zero jerk
        const normDist = dist / influenceRadius;
        const fade = 1.0 - normDist;
        const smoothFade = fade * fade * (3.0 - 2.0 * fade);

        // Inverse square gravity with softening factor
        const force = (PHYSICS_CONFIG.GRAVITY_G * mass * (0.35 + 0.65 * smoothFade)) / (distSq + PHYSICS_CONFIG.EPSILON_SOFTENING);

        ax += (dx / dist) * force;
        ay += (dy / dist) * force;
      }
    }

    return { x: ax, y: ay };
  }

  /**
   * Evaluates if attached player traverses a SurfaceHazard entity zone without jumping over it.
   */
  public static checkSurfaceHazards(player: Player, planet: Planet): SurfaceHazard | null {
    if (!player.isAttached || player.hazardCooldown > 0) return null;
    if (!planet.hazards || planet.hazards.length === 0) return null;

    for (const hazard of planet.hazards) {
      if (hazard.isColliding(player.theta)) {
        return hazard;
      }
    }
    return null;
  }

  /**
   * Predicts future jump flight trajectory and target landing location with high precision.
   */
  public static predictTrajectory(player: Player, planets: Planet[], steps: number = 120): TrajectoryPrediction {
    if (!player.isAttached || !player.currentPlanet) {
      return { points: [] };
    }

    const planet = player.currentPlanet;
    const dir = planet.rotationDirection;
    const speedMultiplier = player.isCometActive ? PHYSICS_CONFIG.COMET_SPEED_MULTIPLIER : 1.0;

    // Outward radial unit vector from planet center to player position
    const cosT = Math.cos(player.theta);
    const sinT = Math.sin(player.theta);

    // Radial outward launch speed based on hold-to-charge jump strength
    const charge = player.isCharging ? player.chargeRatio : 0.6;
    const baseSpeed = PHYSICS_CONFIG.LAUNCH_SPEED_MIN + charge * (PHYSICS_CONFIG.LAUNCH_SPEED_MAX - PHYSICS_CONFIG.LAUNCH_SPEED_MIN);
    const radialSpeed = baseSpeed * speedMultiplier;
    const tangentSpeed = planet.angularVelocity * planet.radius * PHYSICS_CONFIG.LAUNCH_SPEED_TANGENT_MULT * dir;

    let px = player.x;
    let py = player.y;
    let pvx = cosT * radialSpeed - sinT * tangentSpeed;
    let pvy = sinT * radialSpeed + cosT * tangentSpeed;

    const points: Vector2D[] = [{ x: px, y: py }];
    const dt = 0.02; // High-resolution simulation step

    for (let i = 0; i < steps; i++) {
      const accel = this.calculateGravitationalAcceleration(px, py, planets);
      pvx += accel.x * dt;
      pvy += accel.y * dt;
      px += pvx * dt;
      py += pvy * dt;

      points.push({ x: px, y: py });

      // Check collision with planets (skipping home planet for first 4 steps)
      for (const p of planets) {
        if (p.id === planet.id && i < 5) continue;
        const dx = p.x - px;
        const dy = p.y - py;
        const distSq = dx * dx + dy * dy;
        const captureRadius = p.radius + PHYSICS_CONFIG.SURFACE_OFFSET;

        if (distSq <= captureRadius * captureRadius) {
          return {
            points,
            targetPlanet: p,
            landingPoint: { x: px, y: py }
          };
        }
      }
    }

    return { points };
  }

  /**
   * Checks if airborne player has contacted any planet surface.
   */
  public static checkLanding(player: Player, planets: Planet[]): { planet: Planet; contactAngle: number } | null {
    if (player.isAttached) return null;

    for (const planet of planets) {
      const dx = player.x - planet.x;
      const dy = player.y - planet.y;
      const distSq = dx * dx + dy * dy;
      const captureRadius = planet.radius + PHYSICS_CONFIG.SURFACE_OFFSET;

      if (distSq <= captureRadius * captureRadius) {
        const contactAngle = Math.atan2(dy, dx);
        return { planet, contactAngle };
      }
    }

    return null;
  }
}

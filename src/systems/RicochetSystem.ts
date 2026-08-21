import { PHYSICS_CONFIG } from '../core/Config';
import { Planet } from '../entities/Planet';
import { Player } from '../entities/Player';
import { Vector2D } from '../types/game';

export class RicochetSystem {
  /**
   * Finds a nearby planet eligible for a spring-shoe ricochet bounce.
   */
  public static findBounceTarget(player: Player, planets: Planet[], proximityMargin: number = 50): Planet | null {
    if (player.isAttached) return null;

    for (const planet of planets) {
      const dx = player.x - planet.x;
      const dy = player.y - planet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minProximity = planet.radius + PHYSICS_CONFIG.SURFACE_OFFSET + proximityMargin;

      if (dist <= minProximity && dist >= planet.radius - 10) {
        return planet;
      }
    }

    return null;
  }

  /**
   * Executes high-speed surface ricochet using surface normal vector reflection.
   * Formula: v_reflected = v - 2 * (v . n) * n
   */
  public static executeRicochet(player: Player, planet: Planet): { newVelocity: Vector2D; speedBoost: number } {
    const dx = player.x - planet.x;
    const dy = player.y - planet.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Unit surface normal pointing outward from planet center
    const nx = dx / dist;
    const ny = dy / dist;

    // Vector dot product: v . n
    const dot = player.vx * nx + player.vy * ny;

    // Reflected velocity vector: v - 2*(v . n)*n
    let rx = player.vx - 2 * dot * nx;
    let ry = player.vy - 2 * dot * ny;

    // Apply speed boost multiplier from rocket shoes
    const speedBoost = PHYSICS_CONFIG.RICOCHET_BOOST_MULT;
    rx *= speedBoost;
    ry *= speedBoost;

    // Update player velocities
    player.vx = rx;
    player.vy = ry;

    // Spawn kinetic ricochet particles along the impact point
    for (let i = 0; i < 16; i++) {
      const pAngle = Math.atan2(ny, nx) + (Math.random() - 0.5) * 1.2;
      const pSpeed = 120 + Math.random() * 200;
      player.trail.push({
        x: player.x + nx * 6,
        y: player.y + ny * 6,
        alpha: 1.0,
        size: 6 + Math.random() * 6,
        color: Math.random() > 0.5 ? '#38bdf8' : '#facc15'
      });
    }

    return {
      newVelocity: { x: rx, y: ry },
      speedBoost
    };
  }
}

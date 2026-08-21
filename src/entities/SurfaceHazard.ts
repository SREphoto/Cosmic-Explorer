export type SurfaceHazardType = 'SPIKE' | 'LAVA_VENT' | 'URCHIN';

export class SurfaceHazard {
  public id: string;
  public planetId: string;
  public angle: number; // Angle on planet surface in radians [0, 2*PI)
  public angularWidth: number; // Angular width radius of hazard zone
  public type: SurfaceHazardType;
  public size: number;

  constructor(id: string, planetId: string, angle: number, type: SurfaceHazardType, size: number = 12) {
    this.id = id;
    this.planetId = planetId;
    this.angle = (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    this.type = type;
    this.size = size;
    this.angularWidth = 0.18; // Half-width zone (~10.3 degrees)
  }

  /**
   * Checks if player's surface rotation angle intersects with this hazard zone.
   */
  public isColliding(playerTheta: number): boolean {
    const pTheta = (playerTheta % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    let diff = Math.abs(pTheta - this.angle);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;

    return diff < this.angularWidth;
  }
}

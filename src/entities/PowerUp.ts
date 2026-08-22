import { PowerUpData, PowerUpType } from '../types/game';
import { drawCenteredSprite, spriteAtlas } from '../core/SpriteAtlas';

export class PowerUp implements PowerUpData {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  radius: number = 16;
  collected: boolean = false;
  duration: number;
  rotation: number = 0;
  pulseTimer: number = 0;

  constructor(data: Omit<PowerUpData, 'collected' | 'radius'>) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.type = data.type;
    this.duration = data.duration;
  }

  public update(dt: number) {
    if (this.collected) return;
    this.rotation += dt * 2.0;
    this.pulseTimer += dt * 4;
  }

  public draw(ctx: CanvasRenderingContext2D, cameraY: number, cameraX: number = 0) {
    if (this.collected) return;

    const renderX = this.x - cameraX;
    const renderY = this.y - cameraY;
    const pulseScale = 1 + Math.sin(this.pulseTimer) * 0.12;

    ctx.save();
    ctx.translate(renderX, renderY);
    ctx.scale(pulseScale, pulseScale);

    const sprite = spriteAtlas.powerup(this.type);
    if (sprite) {
      const aura =
        this.type === 'MAGNET'
          ? 'rgba(56, 189, 248, 0.38)'
          : this.type === 'REWIND'
            ? 'rgba(251, 191, 36, 0.4)'
            : 'rgba(245, 158, 11, 0.38)';
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(this.rotation * 0.35);
      drawCenteredSprite(ctx, sprite, 0, 0, this.radius * 2.4);
      ctx.restore();
      return;
    }

    if (this.type === 'MAGNET') {
      // Blue pulsing aura
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Magnet horseshoe icon
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, Math.PI, 0, false);
      ctx.rect(-this.radius, 0, 6, 8);
      ctx.rect(this.radius - 6, 0, 6, 8);
      ctx.fill();

      // Magnet tips
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-this.radius, 8, 6, 4);
      ctx.fillRect(this.radius - 6, 8, 6, 4);
    } else if (this.type === 'REWIND') {
      // Golden Chrono Time-Warp Clock Aura
      ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Golden Watch Case
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.78, 0, Math.PI * 2);
      ctx.fill();

      // Clock Hands
      const handAngle = -this.rotation * 3;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(handAngle) * (this.radius * 0.55), Math.sin(handAngle) * (this.radius * 0.55));
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(handAngle * 0.3) * (this.radius * 0.4), Math.sin(handAngle * 0.3) * (this.radius * 0.4));
      ctx.stroke();

      // Center Pin
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Comet fire orange aura
      ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Fire star
      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Flame tail
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.6, 0);
      ctx.lineTo(0, -this.radius * 1.4);
      ctx.lineTo(this.radius * 0.6, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

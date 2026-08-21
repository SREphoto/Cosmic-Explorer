import { CollectibleData } from '../types/game';

export class Collectible implements CollectibleData {
  id: string;
  x: number;
  y: number;
  type: 'STAR' | 'DIAMOND';
  radius: number;
  collected: boolean = false;
  floatOffset: number;
  baseY: number;
  rotation: number = 0;

  constructor(data: Omit<CollectibleData, 'collected' | 'floatOffset' | 'baseY'>) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.baseY = data.y;
    this.type = data.type;
    this.radius = data.radius;
    this.floatOffset = Math.random() * Math.PI * 2;
  }

  public update(dt: number, playerX?: number, playerY?: number, isMagnetActive?: boolean, magnetRadius?: number) {
    if (this.collected) return;

    this.floatOffset += dt * 3;
    this.y = this.baseY + Math.sin(this.floatOffset) * 6;
    this.rotation += dt * 1.5;

    // Magnet Pull Logic
    if (isMagnetActive && playerX !== undefined && playerY !== undefined && magnetRadius) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < magnetRadius * magnetRadius) {
        const dist = Math.sqrt(distSq);
        const pullSpeed = 450 * (1 - dist / magnetRadius) + 150;
        this.x += (dx / dist) * pullSpeed * dt;
        this.y += (dy / dist) * pullSpeed * dt;
        this.baseY = this.y;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cameraY: number, cameraX: number = 0) {
    if (this.collected) return;

    const renderX = this.x - cameraX;
    const renderY = this.y - cameraY;

    ctx.save();
    ctx.translate(renderX, renderY);
    ctx.rotate(this.rotation);

    if (this.type === 'STAR') {
      // Pick sparkle color based on ID hash (cyan, magenta, yellow, green, orange)
      const colors = ['#facc15', '#38bdf8', '#e879f9', '#4ade80', '#fb923c'];
      const charCodeSum = this.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const starColor = colors[charCodeSum % colors.length];

      // Outer Sparkle Halo Glow
      ctx.fillStyle = starColor + '55';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 2.0, 0, Math.PI * 2);
      ctx.fill();

      // 4-Pointed Sparkle Star Path (exact to reference screenshots)
      ctx.fillStyle = starColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      const r = this.radius * 1.1;
      const innerR = r * 0.22;
      for (let i = 0; i < 8; i++) {
        const rad = (i * Math.PI) / 4;
        const curR = i % 2 === 0 ? r : innerR;
        const sx = Math.cos(rad) * curR;
        const sy = Math.sin(rad) * curR;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bright center core dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Diamond
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -this.radius * 1.2);
      ctx.lineTo(this.radius, 0);
      ctx.lineTo(0, this.radius * 1.2);
      ctx.lineTo(-this.radius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawStarPath(ctx: CanvasRenderingContext2D, points: number, outerR: number, innerR: number) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
}

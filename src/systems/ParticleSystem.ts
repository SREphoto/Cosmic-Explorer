export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  shape?: 'CIRCLE' | 'STAR' | 'SPARK';
}

export class ParticleSystem {
  public particles: Particle[] = [];

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.95; // Drag
      p.vy *= 0.95;
      p.alpha = Math.max(0, 1.0 - p.life / p.maxLife);
      p.size *= 0.97;

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public emitJetpackTrail(x: number, y: number, color: string) {
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 40 + 20;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 6 + 4,
        alpha: 1.0,
        maxLife: 0.45,
        life: 0,
        shape: 'CIRCLE'
      });
    }
  }

  public emitLandingSparkles(x: number, y: number, color: string = '#facc15') {
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.2;
      const speed = Math.random() * 120 + 60;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() < 0.5 ? color : '#ffffff',
        size: Math.random() * 7 + 4,
        alpha: 1.0,
        maxLife: 0.7,
        life: 0,
        shape: Math.random() < 0.6 ? 'STAR' : 'SPARK'
      });
    }
  }

  public emitHazardImpact(x: number, y: number) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 160 + 40;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#ef4444',
        size: Math.random() * 6 + 3,
        alpha: 1.0,
        maxLife: 0.5,
        life: 0,
        shape: 'SPARK'
      });
    }
  }

  public emitFreezeCrystals(x: number, y: number, intensity: number) {
    const count = 2 + Math.floor(intensity * 5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 18 + Math.random() * 46;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 22,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 12,
        color: Math.random() < 0.45 ? '#e0f2fe' : Math.random() < 0.5 ? '#7dd3fc' : '#ffffff',
        size: Math.random() * 4.5 + 2,
        alpha: 0.9,
        maxLife: 0.55 + intensity * 0.45,
        life: 0,
        shape: Math.random() < 0.55 ? 'STAR' : 'SPARK'
      });
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = p.alpha;

      const rx = p.x - cameraX;
      const ry = p.y - cameraY;

      if (p.shape === 'STAR') {
        ctx.beginPath();
        ctx.arc(rx, ry, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'SPARK') {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rx - p.size, ry);
        ctx.lineTo(rx + p.size, ry);
        ctx.moveTo(rx, ry - p.size);
        ctx.lineTo(rx, ry + p.size);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(rx, ry, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  public reset() {
    this.particles = [];
  }
}

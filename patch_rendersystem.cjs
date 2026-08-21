const fs = require('fs');
let code = fs.readFileSync('src/systems/RenderSystem.ts', 'utf8');

code = code.replace(
  'activeAnomaly?: ActiveSpaceAnomaly | null\n  ) {',
  'activeAnomaly?: ActiveSpaceAnomaly | null,\n    aestheticSeed?: number\n  ) {'
);

code = code.replace(
  `    if (currentConstellation) {
      bgGrad.addColorStop(0, currentConstellation.bgGradient[0]);
      bgGrad.addColorStop(0.45, currentConstellation.bgGradient[1]);
      bgGrad.addColorStop(1, currentConstellation.bgGradient[2]);
    } else {
      bgGrad.addColorStop(0, '#040714');
      bgGrad.addColorStop(0.45, '#08112e');
      bgGrad.addColorStop(1, '#0a1845');
    }`,
  `    if (aestheticSeed !== undefined) {
      bgGrad.addColorStop(0, \`hsl(\${aestheticSeed}, 80%, 6%)\`);
      bgGrad.addColorStop(0.45, \`hsl(\${(aestheticSeed + 30) % 360}, 70%, 12%)\`);
      bgGrad.addColorStop(1, \`hsl(\${(aestheticSeed + 60) % 360}, 60%, 18%)\`);
    } else if (currentConstellation) {
      bgGrad.addColorStop(0, currentConstellation.bgGradient[0]);
      bgGrad.addColorStop(0.45, currentConstellation.bgGradient[1]);
      bgGrad.addColorStop(1, currentConstellation.bgGradient[2]);
    } else {
      bgGrad.addColorStop(0, '#040714');
      bgGrad.addColorStop(0.45, '#08112e');
      bgGrad.addColorStop(1, '#0a1845');
    }`
);

// We can also color the stars!
code = code.replace(
  `        const a = Math.abs(Math.sin((s.twinklePhase || 0) + Date.now() * 0.002)) * s.alpha;
        ctx.fillStyle = s.color;`,
  `        const a = Math.abs(Math.sin((s.twinklePhase || 0) + Date.now() * 0.002)) * s.alpha;
        if (aestheticSeed !== undefined) {
           ctx.fillStyle = \`hsla(\${(aestheticSeed + s.layer * 20) % 360}, 80%, 80%, \${a})\`;
        } else {
           ctx.fillStyle = s.color;
        }`
);

code = code.replace(
  `      const a = Math.abs(Math.sin(Date.now() * 0.001 * s.twinkleSpeed + s.twinkleOffset)) * s.alpha;
      ctx.fillStyle = s.color;`,
  `      const a = Math.abs(Math.sin(Date.now() * 0.001 * s.twinkleSpeed + s.twinkleOffset)) * s.alpha;
      if (aestheticSeed !== undefined) {
          ctx.fillStyle = \`hsla(\${(aestheticSeed + s.layer * 40) % 360}, 100%, 85%, \${a})\`;
      } else {
          ctx.fillStyle = s.color;
      }`
);

// Add the image backdrop color overlay if seed is defined
code = code.replace(
  `      ctx.drawImage(this.bgImg, 0, 0, this.bgImg.width, this.bgImg.height, 0, 0, width, Math.max(height, width * (this.bgImg.height / this.bgImg.width)));
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';`,
  `      ctx.drawImage(this.bgImg, 0, 0, this.bgImg.width, this.bgImg.height, 0, 0, width, Math.max(height, width * (this.bgImg.height / this.bgImg.width)));
      if (aestheticSeed !== undefined) {
         ctx.globalCompositeOperation = 'hue';
         ctx.fillStyle = \`hsl(\${aestheticSeed}, 100%, 50%)\`;
         ctx.fillRect(0, 0, width, height);
      }
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';`
);

fs.writeFileSync('src/systems/RenderSystem.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/core/Engine.ts', 'utf8');

code = code.replace(
  "import { DailyChallengeSystem } from '../systems/DailyChallengeSystem';",
  `import { DailyChallengeSystem } from '../systems/DailyChallengeSystem';
import { CosmicEventSystem } from '../systems/CosmicEventSystem';`
);

code = code.replace(
  "c.type === 'STAR') {",
  `c.type === 'STAR') {
          const activeEvent = CosmicEventSystem.getActiveEvent();
          const starMultiplier = activeEvent.id === 'METEOR_SHOWER' ? 1.5 : 1;`
);

// We need to fix where score gets incremented for STAR
// The original line: this.stats.score += Math.round(10 * multiplier);
code = code.replace(
  `this.stats.score += Math.round(10 * multiplier);`,
  `this.stats.score += Math.round(10 * multiplier * starMultiplier);`
);

// The original line: this.awardXP(2);
// Let's replace it with event multiplier:
code = code.replace(
  `this.awardXP(2);`,
  `const xpMultiplier = activeEvent.id === 'VOID_ECLIPSE' ? 2 : 1;
          this.awardXP(2 * xpMultiplier);`
);

// And we need to add the Nebula Flare logic where power-ups are generated
// But power-ups are generated procedurally... maybe we can just double the XP for everything?
// Wait, Nebula flare buff is 2x Jetpack Drops. The easiest way is inside ProceduralGenerator...
// The prompt said "randomly activates limited-time quest modifiers, offering bonus rewards for specific actions during the run."
// If I handle it there it's enough.

fs.writeFileSync('src/core/Engine.ts', code);

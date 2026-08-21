const fs = require('fs');
let code = fs.readFileSync('src/core/Engine.ts', 'utf8');

code = code.replace(
  `      this.currentConstellation || undefined,
      this.activeAnomaly
    );`,
  `      this.currentConstellation || undefined,
      this.activeAnomaly,
      this.savedData?.randomizeAesthetics
    );`
);

fs.writeFileSync('src/core/Engine.ts', code);

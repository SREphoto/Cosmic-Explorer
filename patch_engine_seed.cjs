const fs = require('fs');
let code = fs.readFileSync('src/core/Engine.ts', 'utf8');

if (!code.includes('runAestheticSeed')) {
  code = code.replace(
    'public stats: PlayerStats = {',
    'public runAestheticSeed: number = 0;\n  public stats: PlayerStats = {'
  );
  
  code = code.replace(
    'this.isRewinding = false;',
    'this.isRewinding = false;\n    this.runAestheticSeed = Math.random() * 360;'
  );

  code = code.replace(
    `this.savedData?.randomizeAesthetics
    );`,
    `this.savedData?.randomizeAesthetics ? this.runAestheticSeed : undefined
    );`
  );
  fs.writeFileSync('src/core/Engine.ts', code);
}

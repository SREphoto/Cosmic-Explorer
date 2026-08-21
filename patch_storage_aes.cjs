const fs = require('fs');
let code = fs.readFileSync('src/core/Storage.ts', 'utf8');

if (!code.includes('randomizeAesthetics')) {
  code = code.replace(
    'soundEnabled: true,',
    'soundEnabled: true,\n  randomizeAesthetics: false,'
  );
  code = code.replace(
    'soundEnabled: boolean;',
    'soundEnabled: boolean;\n  randomizeAesthetics?: boolean;'
  );
  fs.writeFileSync('src/core/Storage.ts', code);
}

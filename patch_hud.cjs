const fs = require('fs');
let code = fs.readFileSync('src/ui/HUD.tsx', 'utf8');

code = code.replace(
  '        {isMagnetActive && (',
  `        {isMagnetActive && (
          <div className={\`bg-slate-900/90 border border-sky-500/50 rounded-lg p-2 w-full text-white text-xs shadow-lg flex flex-col gap-1 \${magnetTimer < 3 ? 'animate-pulse border-sky-400' : ''}\`}>`
);
code = code.replace(
  '          <div className="bg-slate-900/90 border border-sky-500/50 rounded-lg p-2 w-full text-white text-xs shadow-lg flex flex-col gap-1">',
  ''
);

code = code.replace(
  '        {isCometActive && (',
  `        {isCometActive && (
          <div className={\`bg-slate-900/90 border border-amber-500/50 rounded-lg p-2 w-full text-white text-xs shadow-lg flex flex-col gap-1 \${cometTimer < 3 ? 'animate-pulse border-amber-400' : ''}\`}>`
);
code = code.replace(
  '          <div className="bg-slate-900/90 border border-amber-500/50 rounded-lg p-2 w-full text-white text-xs shadow-lg flex flex-col gap-1">',
  ''
);

fs.writeFileSync('src/ui/HUD.tsx', code);

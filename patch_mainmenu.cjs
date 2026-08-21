const fs = require('fs');
let code = fs.readFileSync('src/ui/MainMenu.tsx', 'utf8');

// Replace imports
code = code.replace(
  'VolumeX,\n  Star',
  'User,\n  Star'
);
code = code.replace(
  'Volume2,\n',
  ''
);
code = code.replace('Volume2,', '');
code = code.replace('VolumeX,', '');

// Move Title ABOVE Hero Image
const titleSection = `        {/* Title and Subtitle */}
        <div className="pt-0.5 w-full">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-200 drop-shadow-md pb-1 text-center">
            COSMIC EXPLORER
          </h1>
        </div>`;

code = code.replace(
  `        {/* Clean Hero Artwork Card without cluttered text overlays */}`,
  `        ${titleSection}\n\n        {/* Clean Hero Artwork Card without cluttered text overlays */}`
);

code = code.replace(
  `        {/* Title and Subtitle */}
        <div className="pt-0.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-200 drop-shadow-md">
            COSMIC EXPLORER
          </h1>
          <p className="text-xs text-sky-200/80 font-bold tracking-[0.2em] mt-1">
            ENDLESS ORBITAL PHYSICS JUMPER
          </p>
        </div>`,
  ``
);

// Replace Volume button with User button
code = code.replace(
  `          <button
            onClick={onToggleAudio}
            className="bg-slate-900/90 hover:bg-slate-800 p-2 rounded-full border border-slate-800 transition-all duration-200 shadow-sm text-slate-400 hover:text-white btn-grow-sm glow-subtle-hover"
            title="Toggle Sound"
          >
            {savedData.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>`,
  `          <button
            onClick={() => {
              audioEngine.playMenuClick();
              onOpenDocs();
            }}
            className="bg-slate-900/90 hover:bg-slate-800 p-2 rounded-full border border-slate-800 transition-all duration-200 shadow-sm text-slate-400 hover:text-white btn-grow-sm glow-subtle-hover"
            title="Settings & Nexus"
          >
            <User className="w-4 h-4 text-sky-400" />
          </button>`
);

// Remove Codex from Bottom Menu
code = code.replace(
  `        <button
          onClick={onOpenDocs}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-200 shadow-sm btn-grow glow-purple-hover"
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="text-[11px] font-medium">Codex</span>
        </button>`,
  ``
);

// Change grid-cols-5 to grid-cols-4 and increase padding to give them more room
code = code.replace(
  `<div className="grid grid-cols-5 gap-2 max-w-md mx-auto w-full pt-1">`,
  `<div className="grid grid-cols-4 gap-3 max-w-md mx-auto w-full pt-1">`
);

code = code.replace(/p-2\.5 rounded-xl flex flex-col items-center/g, 'py-3 px-2 rounded-xl flex flex-col items-center');

fs.writeFileSync('src/ui/MainMenu.tsx', code);

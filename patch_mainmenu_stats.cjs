const fs = require('fs');
let code = fs.readFileSync('src/ui/MainMenu.tsx', 'utf8');

// Title animation
code = code.replace(
  '          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-200 drop-shadow-md pb-1 text-center">',
  '          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-200 drop-shadow-md pb-1 text-center animate-title-breathe">'
);

// Expanded stats ribbon
const oldStats = `        {/* Run Stats Ribbon */}
        <div className="flex items-center justify-between w-full px-1">
          {savedData.totalPlanetsAllTime > 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 shadow-sm" title="Total Planets Landed">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-white font-mono">{savedData.totalPlanetsAllTime.toLocaleString()}</span>
            </div>
          ) : <div className="w-10"></div>}

          {savedData.highScore > 0 && (
            <div className="bg-slate-900/80 border border-amber-500/30 px-4 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-2 shadow-sm shadow-amber-500/10">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 hidden sm:inline">High Score:</span>
              <span className="font-bold text-amber-50 text-sm font-mono tracking-wide">{savedData.highScore.toLocaleString()}</span>
            </div>
          )}

          {savedData.maxAltitudeOverall > 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 shadow-sm" title="Furthest Jump Altitude">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-semibold text-white font-mono">{savedData.maxAltitudeOverall.toLocaleString()}m</span>
            </div>
          ) : <div className="w-10"></div>}
        </div>`;

const newStats = `        {/* Expanded Cosmic Stats Dashboard */}
        <div className="w-full bg-slate-900/70 border border-slate-700/60 rounded-2xl p-2.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2 px-1">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
               <Compass className="w-3 h-3 text-sky-400"/> Explorer Log
             </span>
             {savedData.highScore > 0 && (
               <div className="bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded shadow-inner text-[10px] text-amber-300 font-bold flex items-center gap-1">
                 <Trophy className="w-3 h-3"/> RECORD: {savedData.highScore.toLocaleString()}
               </div>
             )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/50 rounded-xl py-1.5 px-1 border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Planets</span>
              <span className="text-xs sm:text-sm font-black text-emerald-400">{savedData.totalPlanetsAllTime.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/50 rounded-xl py-1.5 px-1 border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Distance</span>
              <span className="text-xs sm:text-sm font-black text-rose-400">{savedData.maxAltitudeOverall.toLocaleString()}m</span>
            </div>
            <div className="bg-slate-950/50 rounded-xl py-1.5 px-1 border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Max Combo</span>
              <span className="text-xs sm:text-sm font-black text-sky-400">{savedData.maxConsecutiveJumpsRecord.toLocaleString()}</span>
            </div>
          </div>
        </div>`;

code = code.replace(oldStats, newStats);

// 2x2 Bottom Button Grid
code = code.replace(
  '<div className="grid grid-cols-4 gap-3 max-w-md mx-auto w-full pt-1">',
  '<div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full pt-1">'
);

// Hangar button padding
code = code.replace(
  'className="relative overflow-hidden group border border-slate-700 hover:border-sky-400 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-md btn-grow"',
  'className="relative overflow-hidden group border-2 border-slate-700 hover:border-sky-400 py-5 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-300 hover:text-white transition-all duration-300 shadow-lg shadow-slate-950/50 btn-grow"'
);
// Upgrades button padding
code = code.replace(
  'className="relative overflow-hidden group border border-slate-700 hover:border-amber-400 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-md btn-grow"',
  'className="relative overflow-hidden group border-2 border-slate-700 hover:border-amber-400 py-5 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-300 hover:text-white transition-all duration-300 shadow-lg shadow-slate-950/50 btn-grow"'
);
// Badges button padding
code = code.replace(
  'className="relative overflow-hidden group border border-slate-700 hover:border-yellow-400 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-md btn-grow"',
  'className="relative overflow-hidden group border-2 border-slate-700 hover:border-yellow-400 py-5 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-300 hover:text-white transition-all duration-300 shadow-lg shadow-slate-950/50 btn-grow"'
);
// Quests button padding
code = code.replace(
  'className="relative overflow-hidden group border border-slate-700 hover:border-emerald-400 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-md btn-grow"',
  'className="relative overflow-hidden group border-2 border-slate-700 hover:border-emerald-400 py-5 px-3 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-300 hover:text-white transition-all duration-300 shadow-lg shadow-slate-950/50 btn-grow"'
);

// We need to also import RefreshCw if used, but we used maxConsecutiveJumpsRecord so that's fine.
// Ensure icons are scaled appropriately for the larger buttons
code = code.replace('ShoppingBag className="w-5 h-5 text-sky-300 drop-shadow-md"', 'ShoppingBag className="w-6 h-6 text-sky-300 drop-shadow-md"');
code = code.replace('Zap className="w-5 h-5 text-amber-300 drop-shadow-md"', 'Zap className="w-6 h-6 text-amber-300 drop-shadow-md"');
code = code.replace('Trophy className="w-5 h-5 text-yellow-300 drop-shadow-md"', 'Trophy className="w-6 h-6 text-yellow-300 drop-shadow-md"');
code = code.replace('Target className="w-5 h-5 text-emerald-300 drop-shadow-md"', 'Target className="w-6 h-6 text-emerald-300 drop-shadow-md"');


fs.writeFileSync('src/ui/MainMenu.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/ui/MainMenu.tsx', 'utf8');

// Imports
const imports = `import mainBgUrl from '../assets/images/main_menu_cosmic_bg_1786730822424.jpg';
import btnHangarUrl from '../assets/images/button_bg_hangar_1786730840997.jpg';
import btnUpgradesUrl from '../assets/images/button_bg_upgrades_1786730854147.jpg';
import btnBadgesUrl from '../assets/images/button_bg_badges_1786730869125.jpg';
import btnQuestsUrl from '../assets/images/button_bg_quests_1786730883413.jpg';`;

code = code.replace(
  "import heroArtworkUrl from '../assets/images/little_galaxy_hero_1786680040346.jpg';",
  `import heroArtworkUrl from '../assets/images/little_galaxy_hero_1786680040346.jpg';\n${imports}`
);

// Animated Background for the main container
code = code.replace(
  '<div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none text-white ui-interactive overflow-y-auto">',
  `<div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-5 select-none text-white ui-interactive overflow-y-auto bg-slate-950">
      {/* Animated Cosmic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40 mix-blend-screen">
        <img src={mainBgUrl} alt="" className="w-full h-[150%] object-cover object-center animate-pan-y" />
      </div>
      <div className="absolute inset-0 z-0 bg-slate-950/40 backdrop-blur-sm pointer-events-none"></div>

      <div className="z-10 flex flex-col justify-between h-full w-full">`
);

// Close the wrapper
code = code.replace(
  '    </div>\n  );\n};',
  '      </div>\n    </div>\n  );\n};'
);

// Enhance Launch Voyage Button
code = code.replace(
  `        <button
          onClick={onStartGame}
          className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-base py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 btn-grow glow-sky-hover"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Launch Voyage</span>
        </button>`,
  `        <button
          onClick={() => {
            audioEngine.playPowerUpCollect();
            onStartGame();
          }}
          className="relative overflow-hidden w-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 hover:from-sky-400 hover:via-emerald-400 hover:to-amber-400 text-slate-950 font-black text-lg py-4 rounded-2xl transition-all duration-300 shadow-[0_0_30px_-5px_rgba(56,189,248,0.5)] flex items-center justify-center gap-3 btn-grow hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-12 -translate-x-full hover:animate-[shimmer_1.5s_infinite]" />
          <Play className="w-6 h-6 fill-current animate-pulse" />
          <span className="tracking-widest uppercase text-shadow-sm">Launch Voyage</span>
        </button>`
);

// Enhance Bottom Navigation Buttons
code = code.replace(
  `        <button
          onClick={onOpenWardrobe}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-200 shadow-sm btn-grow glow-subtle-hover"
        >`,
  `        <button
          onClick={onOpenWardrobe}
          className="relative overflow-hidden group border border-slate-700 hover:border-sky-400 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-md btn-grow"
        >
          <div className="absolute inset-0 z-0">
            <img src={btnHangarUrl} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">`
);
code = code.replace(
  `          <ShoppingBag className="w-4 h-4 text-sky-400" />
          <span className="text-[11px] font-medium">Hangar</span>
        </button>`,
  `          <ShoppingBag className="w-5 h-5 text-sky-300 drop-shadow-md" />
          <span className="text-[11px] font-bold tracking-wide uppercase">Hangar</span>
          </div>
        </button>`
);

code = code.replace(
  `        <button
          onClick={onOpenUpgrades}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-200 shadow-sm btn-grow glow-amber-hover"
        >`,
  `        <button
          onClick={onOpenUpgrades}
          className="relative overflow-hidden group border border-slate-700 hover:border-amber-400 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-md btn-grow"
        >
          <div className="absolute inset-0 z-0">
            <img src={btnUpgradesUrl} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">`
);
code = code.replace(
  `          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-medium">Upgrades</span>
        </button>`,
  `          <Zap className="w-5 h-5 text-amber-300 drop-shadow-md" />
          <span className="text-[11px] font-bold tracking-wide uppercase">Upgrades</span>
          </div>
        </button>`
);

code = code.replace(
  `        <button
          onClick={onOpenAchievements}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-200 shadow-sm btn-grow glow-amber-hover relative"
        >`,
  `        <button
          onClick={onOpenAchievements}
          className="relative overflow-hidden group border border-slate-700 hover:border-yellow-400 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-md btn-grow"
        >
          <div className="absolute inset-0 z-0">
            <img src={btnBadgesUrl} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">`
);
code = code.replace(
  `          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-[11px] font-medium">Badges</span>
          {claimableCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
              {claimableCount}
            </span>
          )}
        </button>`,
  `          <Trophy className="w-5 h-5 text-yellow-300 drop-shadow-md" />
          <span className="text-[11px] font-bold tracking-wide uppercase">Badges</span>
          {claimableCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">
              {claimableCount}
            </span>
          )}
          </div>
        </button>`
);

code = code.replace(
  `        <button
          onClick={onOpenQuests}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-200 shadow-sm btn-grow glow-emerald-hover"
        >`,
  `        <button
          onClick={onOpenQuests}
          className="relative overflow-hidden group border border-slate-700 hover:border-emerald-400 py-3 px-2 rounded-xl flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-md btn-grow"
        >
          <div className="absolute inset-0 z-0">
            <img src={btnQuestsUrl} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1">`
);
code = code.replace(
  `          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-medium">Quests</span>
        </button>`,
  `          <Target className="w-5 h-5 text-emerald-300 drop-shadow-md" />
          <span className="text-[11px] font-bold tracking-wide uppercase">Quests</span>
          </div>
        </button>`
);

fs.writeFileSync('src/ui/MainMenu.tsx', code);

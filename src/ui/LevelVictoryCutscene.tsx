import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Sparkles, 
  ChevronRight, 
  Flame, 
  Shield, 
  Star, 
  Gem, 
  Compass, 
  Clock, 
  TrendingUp, 
  Flag,
  Zap,
  RotateCcw,
  CheckCircle2,
  Home
} from 'lucide-react';
import { LevelVictoryData } from '../types/game';

interface LevelVictoryCutsceneProps {
  victoryData: LevelVictoryData;
  onContinue: () => void;
  onOpenMedalChest: () => void;
  onReturnToHQ: () => void;
}

export const LevelVictoryCutscene: React.FC<LevelVictoryCutsceneProps> = ({
  victoryData,
  onContinue,
  onOpenMedalChest,
  onReturnToHQ
}) => {
  const [stage, setStage] = useState<'TOUCHDOWN' | 'STATS' | 'MEDAL_AWARD'>('TOUCHDOWN');
  const { medalAwarded, stats, levelNumber, levelName, subtitle, isFirstClear } = victoryData;

  const renderRibbonBar = (ribbonColors: string[]) => {
    return (
      <div className="w-24 h-6 rounded border border-amber-400/60 shadow-md flex overflow-hidden">
        {ribbonColors.map((color, idx) => (
          <div key={idx} className="h-full flex-1" style={{ backgroundColor: color }} />
        ))}
      </div>
    );
  };

  return (
    <div id="level-victory-cutscene-root" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      {/* Golden Celebration Aura & Starlight Beams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-lg bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/50 p-6 md:p-8 text-white z-10"
      >
        {/* Stage 1: Flagship Touchdown Cinematic */}
        {stage === 'TOUCHDOWN' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-5"
          >
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-bounce">
                <Flag className="w-12 h-12 text-slate-950" />
              </div>
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-amber-400/40 animate-spin" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-black text-[11px] uppercase tracking-widest rounded-full border border-amber-500/30 mb-2">
                SECTOR {levelNumber} CONQUERED
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {levelName}
              </h2>
              <p className="text-xs text-amber-200/80 mt-1 italic">
                "{subtitle}"
              </p>
            </div>

            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Touchdown confirmed on the Sector Flagship Citadel! Starfleet Command has recorded your historic navigation through the orbital expanse.
            </p>

            <button
              id="btn-cutscene-proceed-stats"
              onClick={() => setStage('STATS')}
              className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>View Flight Telemetry & Stats</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Stage 2: Flight Stats Overview */}
        {stage === 'STATS' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                Mission Telemetry Report
              </span>
              <h2 className="text-xl font-black text-white">
                Sector {levelNumber}: {levelName} Clear
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  Planets Landed
                </div>
                <div className="text-lg font-black text-white mt-1">
                  {stats.planetsLanded} <span className="text-[10px] text-slate-400 font-normal">celestials</span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Max Altitude
                </div>
                <div className="text-lg font-black text-white mt-1">
                  {stats.altitudeReached.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">km</span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Stars Harvested
                </div>
                <div className="text-lg font-black text-amber-300 mt-1">
                  +{stats.starsCollected}
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                  <Gem className="w-3.5 h-3.5 text-cyan-400" />
                  Cosmic Diamonds
                </div>
                <div className="text-lg font-black text-cyan-300 mt-1">
                  +{stats.diamondsCollected}
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Perfect Orbit Combos
                </div>
                <div className="text-lg font-black text-rose-300 mt-1">
                  {stats.perfectJumps}x
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Flight Time
                </div>
                <div className="text-lg font-black text-purple-300 mt-1">
                  {Math.floor(stats.timeElapsedSeconds / 60)}m {stats.timeElapsedSeconds % 60}s
                </div>
              </div>
            </div>

            <button
              id="btn-cutscene-proceed-medal"
              onClick={() => setStage('MEDAL_AWARD')}
              className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>Receive Military Commendation Medal</span>
            </button>
          </motion.div>
        )}

        {/* Stage 3: Military Commendation Medal & Permanent Perk Conferral */}
        {stage === 'MEDAL_AWARD' && medalAwarded && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-widest rounded-full border border-amber-500/30">
              Starfleet Military Award Citation
            </div>

            {/* Medal & Ribbon Presentation Box */}
            <div className="p-5 bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-amber-500/50 rounded-2xl shadow-xl shadow-amber-500/10 text-center relative overflow-hidden">
              {/* Ribbon Rack on chest */}
              <div className="flex flex-col items-center justify-center mb-3">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                  Official Uniform Ribbon Bar
                </span>
                {renderRibbonBar(medalAwarded.ribbonColors)}
              </div>

              {/* Medal Medallion */}
              <div className="text-4xl my-2 filter drop-shadow-[0_4px_12px_rgba(251,191,36,0.5)]">
                {medalAwarded.icon}
              </div>

              <h3 className="text-lg font-black text-amber-300 tracking-tight">
                {medalAwarded.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Awarded for heroic planetary clearance of Sector {medalAwarded.levelNumber}
              </p>

              {/* Permanent Perk Badge */}
              <div className="mt-4 p-3 bg-amber-500/15 border border-amber-400/40 rounded-xl text-left flex items-start gap-2.5">
                <div className="p-1.5 bg-amber-500/30 rounded-lg text-amber-300 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-200">
                    PERMANENT UNIFORM PERK UNLOCKED:
                  </div>
                  <div className="text-xs font-bold text-amber-400">
                    {medalAwarded.perkDescription}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    This medal bonus is pinned to your flight chest and applies to all future galactic runs.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-cutscene-continue-next"
                onClick={onContinue}
                className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Continue Expedition to Sector {levelNumber + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-cutscene-open-chest"
                  onClick={onOpenMedalChest}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-xs text-amber-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Uniform Ribbon Rack</span>
                </button>
                <button
                  id="btn-cutscene-return-hq"
                  onClick={onReturnToHQ}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-xs text-slate-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Return to Command HQ</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

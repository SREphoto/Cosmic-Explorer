import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Star, Gem, Compass, Trophy, ShoppingBag, Zap, Home, Award } from 'lucide-react';
import { PlayerStats, UserSavedData } from '../types/game';
import { getXPForLevel } from '../core/Config';
import cosmicVoyageEndImg from '../assets/images/cosmic_voyage_end_1786696607370.jpg';

interface GameOverModalProps {
  stats: PlayerStats;
  savedData: UserSavedData;
  onRetry: () => void;
  onOpenWardrobe: () => void;
  onOpenUpgrades: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  savedData,
  onRetry,
  onOpenWardrobe,
  onOpenUpgrades,
  onGoHome,
}) => {
  const isHighScore = stats.score > 0 && stats.score >= savedData.highScore;
  const playerLvl = savedData.playerLevel || 1;
  const xpNeeded = getXPForLevel(playerLvl);
  const currentXP = savedData.playerXP || 0;

  useEffect(() => {
    if (isHighScore) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isHighScore]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 text-white shadow-2xl flex flex-col items-center text-center ui-interactive relative overflow-hidden my-auto">
        {/* Top Hero Artwork */}
        <div className="w-full h-32 rounded-2xl overflow-hidden relative mb-4 border border-slate-800 shadow-md">
          <img
            src={cosmicVoyageEndImg}
            alt="Cosmic Voyage Concluded"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex items-end justify-center pb-2">
            <span className="text-2xl">
              {stats.deathReason === 'PETRIFIED' ? '🗿' : stats.deathReason === 'FROZEN' ? '❄️' : '✨'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          {stats.deathReason === 'PETRIFIED'
            ? 'Petrified to Stone'
            : stats.deathReason === 'FROZEN'
            ? 'Drifted into Deep Space'
            : 'Cosmic Voyage Concluded'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-3 leading-relaxed max-w-xs">
          {stats.deathReason === 'PETRIFIED'
            ? 'Stayed on a cursed Dark Planet too long and crystallized.'
            : stats.deathReason === 'FROZEN'
            ? 'Drifted too far from planetary gravitational capture.'
            : 'Encountered the advancing dark cosmic void boundary.'}
        </p>

        {/* High Score Banner */}
        {isHighScore && (
          <div className="bg-amber-500/15 border border-amber-400/40 text-amber-300 px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 mb-3">
            <Trophy className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>New High Score!</span>
          </div>
        )}

        {/* Level XP Progress Banner */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-3 mb-3 text-left">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold text-slate-200">Level {playerLvl} Explorer</span>
            </div>
            <span className="text-amber-300 font-mono text-[11px] font-medium">
              +{stats.xpEarnedRun || 0} XP
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentXP / xpNeeded) * 100)}%` }}
            />
          </div>
        </div>

        {/* Score & Run Highlights Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 w-full space-y-2.5 mb-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
            <span className="text-xs text-slate-400 font-medium">Final Score</span>
            <span className="text-2xl font-bold font-mono text-amber-300">{stats.score.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 flex flex-col items-center">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-sky-400" /> Max Altitude
              </span>
              <span className="font-semibold text-sm text-slate-100 mt-0.5">{Math.floor(stats.altitude)}m</span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 flex flex-col items-center">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" /> Max Combo
              </span>
              <span className="font-semibold text-sm text-slate-100 mt-0.5">{stats.maxConsecutiveJumps} Jumps</span>
            </div>
          </div>

          <div className="flex justify-around items-center pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>+{stats.starsCollected} Stars</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-300 font-semibold">
              <Gem className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
              <span>+{stats.diamondsCollected} Diamonds</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <button
            onClick={onRetry}
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 btn-grow glow-sky-hover text-base"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Launch Next Run</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onOpenWardrobe}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium py-2.5 rounded-xl border border-slate-700/60 transition-all duration-200 flex flex-col items-center gap-1 btn-grow-sm glow-subtle-hover"
            >
              <ShoppingBag className="w-4 h-4 text-sky-400" />
              <span>Hangar</span>
            </button>

            <button
              onClick={onOpenUpgrades}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium py-2.5 rounded-xl border border-slate-700/60 transition-all duration-200 flex flex-col items-center gap-1 btn-grow-sm glow-amber-hover"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Upgrades</span>
            </button>

            <button
              onClick={onGoHome}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium py-2.5 rounded-xl border border-slate-700/60 transition-all duration-200 flex flex-col items-center gap-1 btn-grow-sm glow-emerald-hover"
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

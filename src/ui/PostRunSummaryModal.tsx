import React from 'react';
import { Star, Compass, Navigation, ArrowRight, Zap } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface PostRunSummaryModalProps {
  stats: PlayerStats;
  onContinue: () => void;
}

export const PostRunSummaryModal: React.FC<PostRunSummaryModalProps> = ({ stats, onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-white shadow-2xl flex flex-col items-center ui-interactive">
        <h2 className="text-2xl font-bold text-sky-400 mb-6 tracking-tight text-center">Run Analysis</h2>
        
        <div className="w-full space-y-3">
          <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Stars Collected</span>
                <span className="text-lg font-bold text-white">{stats.starsCollected.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Distance Traveled</span>
                <span className="text-lg font-bold text-white">{Math.floor(stats.maxAltitude).toLocaleString()}m</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Planets Landed</span>
                <span className="text-lg font-bold text-white">{stats.planetsLandedCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Power-ups Used</span>
                <span className="text-lg font-bold text-white">{stats.powerUpsUsedCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="mt-6 w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 btn-grow glow-sky-hover"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

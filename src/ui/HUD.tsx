import React from 'react';
import { Pause, AlertTriangle, Magnet, Zap } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface HUDProps {
  stats: PlayerStats;
  isMagnetActive: boolean;
  magnetTimer: number;
  magnetMaxTimer: number;
  isCometActive: boolean;
  cometTimer: number;
  cometMaxTimer: number;
  onPause: () => void;
  onConfirmRewind?: () => void;
  onCancelRewind?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isMagnetActive,
  magnetTimer,
  magnetMaxTimer,
  isCometActive,
  cometTimer,
  cometMaxTimer,
  onPause,
  onConfirmRewind,
  onCancelRewind,
}) => {
  const voidDanger = Math.max(0, Math.min(1, stats.voidDangerRatio ?? 0));
  const voidEta = Math.max(0, stats.voidEtaSeconds ?? 0);
  const voidColor = voidDanger > 0.72 ? '#f43f5e' : voidDanger > 0.45 ? '#f59e0b' : '#38bdf8';
  const hint = stats.gestureHint;
  const exploring = !!stats.isExploring;
  const scrubbing = !!stats.isRewindScrubbing;
  const scrubMax = Math.max(0.001, stats.rewindMaxSeconds || 4);
  const scrubSec = Math.max(0, stats.rewindScrubSeconds || 0);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 z-10 select-none">
      <div className="flex flex-col gap-2">
        <div
          className="w-full h-1 rounded-full overflow-hidden bg-slate-950/70 border border-white/10"
          style={{ boxShadow: `0 0 10px ${voidColor}33` }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{
              width: `${Math.round(voidDanger * 100)}%`,
              backgroundColor: voidColor,
            }}
          />
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-400/35 shadow-lg flex items-baseline gap-2">
            <span className="text-lg font-semibold font-mono tabular-nums text-white leading-none">
              {stats.score.toLocaleString()}
            </span>
            <span className="text-[10px] text-sky-300/90 font-medium tracking-wide">
              {Math.floor(stats.altitude)}m
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div
              className={`bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border text-[11px] font-semibold tabular-nums flex items-center gap-1 ${voidDanger > 0.72 ? 'animate-pulse' : ''}`}
              style={{ borderColor: `${voidColor}99`, color: voidColor }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{voidEta >= 99 ? 'Safe' : `${voidEta.toFixed(1)}s`}</span>
            </div>
            <button
              onClick={onPause}
              className="pointer-events-auto bg-slate-950/90 hover:bg-slate-900 text-sky-300 w-11 h-11 rounded-full border border-sky-400/50 flex items-center justify-center ui-interactive shrink-0"
              title="Pause"
              aria-label="Pause"
            >
              <Pause className="w-4 h-4 fill-sky-300 stroke-sky-300" />
            </button>
          </div>
        </div>

        {exploring && (
          <div className="self-center bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-400/30 text-[11px] text-sky-100 font-medium">
            Exploring {stats.explorePlanetName || 'surface'} · tap veins to dig
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 mb-1">
        {(isMagnetActive || isCometActive) && (
          <div className="flex items-center gap-1.5">
            {isMagnetActive && (
              <div className="bg-slate-950/75 border border-sky-400/40 rounded-full px-2 py-1 flex items-center gap-1 text-[10px] text-sky-300">
                <Magnet className="w-3 h-3" />
                <span className="tabular-nums">{Math.max(0, magnetTimer).toFixed(0)}s</span>
                <span className="sr-only">{magnetMaxTimer}</span>
              </div>
            )}
            {isCometActive && (
              <div className="bg-slate-950/75 border border-amber-400/40 rounded-full px-2 py-1 flex items-center gap-1 text-[10px] text-amber-300">
                <Zap className="w-3 h-3" />
                <span className="tabular-nums">{Math.max(0, cometTimer).toFixed(0)}s</span>
                <span className="sr-only">{cometMaxTimer}</span>
              </div>
            )}
          </div>
        )}

        {scrubbing && (
          <div className="w-[min(92%,320px)] bg-slate-950/90 backdrop-blur-md border border-amber-400/40 rounded-2xl px-4 py-3 pointer-events-auto ui-interactive">
            <div className="flex items-center justify-between text-[11px] text-amber-200 font-medium mb-1.5">
              <span>Rewind</span>
              <span className="font-mono tabular-nums">{scrubSec.toFixed(1)}s back</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full bg-amber-400"
                style={{ width: `${Math.min(100, (scrubSec / scrubMax) * 100)}%` }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancelRewind}
                className="flex-1 text-[11px] font-medium py-2 rounded-xl bg-slate-800 text-slate-200 border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmRewind}
                className="flex-1 text-[11px] font-semibold py-2 rounded-xl bg-sky-400 text-slate-950"
              >
                Jump here
              </button>
            </div>
          </div>
        )}

        {hint && !scrubbing && (
          <div className="bg-slate-950/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 text-[10px] text-slate-200 font-medium max-w-[92%] text-center">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
};

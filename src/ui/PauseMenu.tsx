import React from 'react';
import { Play, RotateCcw, Home, Compass, HelpCircle, Telescope } from 'lucide-react';
import { PlayerStats, StageQuest, CosmicGadgetId } from '../types/game';
import { COSMIC_GADGETS } from '../core/Config';

interface PauseMenuProps {
  stats: PlayerStats;
  currentStage: StageQuest | null;
  isPlayerAttached: boolean;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onOpenMap: () => void;
  onOpenHelp: () => void;
  onExplore?: () => void;
}

const GESTURES = [
  { keys: 'Hold', action: 'Charge jump' },
  { keys: 'Swipe up / W', action: 'Jetpack' },
  { keys: 'Tap near planet', action: 'Ricochet' },
  { keys: 'Swipe down / R', action: 'Rewind, then scrub' },
  { keys: 'Double-tap / E', action: 'Explore & dig' },
  { keys: 'Swipe left / G', action: 'Gadget' },
  { keys: 'Swipe right', action: 'Strafe boost' },
  { keys: 'A · D', action: 'Walk on surface' },
  { keys: 'Ride moons', action: 'Secret side paths' },
];

export const PauseMenu: React.FC<PauseMenuProps> = ({
  stats,
  currentStage,
  isPlayerAttached,
  onResume,
  onRestart,
  onMenu,
  onOpenMap,
  onOpenHelp,
  onExplore,
}) => {
  const gadget = COSMIC_GADGETS.find((g) => g.id === (stats.equippedGadgetId as CosmicGadgetId | undefined));
  const voidEta = Math.max(0, stats.voidEtaSeconds ?? 0);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 text-white">
      <div className="bg-slate-900/95 border border-white/10 rounded-3xl w-full max-w-sm max-h-[92%] overflow-y-auto p-5 shadow-2xl space-y-4 ui-interactive animate-modal-entrance">
        <div className="text-center">
          <div className="text-[10px] tracking-[0.2em] uppercase text-sky-300/80 font-semibold">Voyage paused</div>
          <h2 className="text-xl font-semibold text-white mt-1">{stats.currentLevelName || 'Deep space'}</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {stats.currentConstellationName || 'Open sky'} · {Math.floor(stats.altitude)}m
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <StatChip label="Score" value={stats.score.toLocaleString()} />
          <StatChip label="Stars" value={String(stats.starsCollected)} />
          <StatChip label="Diamonds" value={String(stats.diamondsCollected)} />
          <StatChip label="Jetpack" value={String(stats.jetpackChargesRemaining)} />
          <StatChip label="Rewind" value={String(stats.rewindChargesRemaining)} />
          <StatChip label="Void" value={voidEta >= 99 ? 'Safe' : `${voidEta.toFixed(1)}s`} />
        </div>

        {gadget && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Gadget</div>
            <div className="text-sm font-semibold text-sky-100">
              {gadget.name} · {stats.gadgetChargesRemaining ?? 0} charges
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{gadget.description}</div>
          </div>
        )}

        {currentStage && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                Stage {currentStage.stageId}
              </span>
              <span className="text-[10px] text-sky-300 font-semibold tabular-nums">
                {currentStage.objectives.filter((o) => o.completed).length}/3
              </span>
            </div>
            <div className="text-sm font-medium text-white mb-1.5">{currentStage.stageName}</div>
            <div className="space-y-1">
              {currentStage.objectives.map((obj) => (
                <div key={obj.id} className="flex justify-between gap-2 text-[11px]">
                  <span className={obj.completed ? 'text-slate-500 line-through' : 'text-slate-300'}>
                    {obj.description}
                  </span>
                  <span className="tabular-nums text-slate-400 shrink-0">
                    {obj.completed ? 'Done' : `${obj.currentCount}/${obj.targetCount}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-2">Gestures</div>
          <div className="space-y-1">
            {GESTURES.map((row) => (
              <div key={row.keys} className="flex justify-between gap-3 text-[11px]">
                <span className="text-sky-200/90 font-medium">{row.keys}</span>
                <span className="text-slate-300 text-right">{row.action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onResume}
            className="w-full bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Resume
          </button>
          {isPlayerAttached && onExplore && (
            <button
              onClick={onExplore}
              className="w-full bg-slate-800 hover:bg-slate-700 text-sky-100 font-medium py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-2"
            >
              <Telescope className="w-4 h-4" />
              Explore this world
            </button>
          )}
          <button
            onClick={onRestart}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restart run
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenMap}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 text-xs"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              Map
            </button>
            <button
              onClick={onOpenHelp}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 text-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
              How to play
            </button>
          </div>
          <button
            onClick={onMenu}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            Main menu
          </button>
        </div>
      </div>
    </div>
  );
};

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-2 py-2">
      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className="text-sm font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}

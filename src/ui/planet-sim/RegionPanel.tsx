import React from 'react';
import { simIcon } from './simIcons';
import { ArrowUpCircle, Compass, Lock } from 'lucide-react';
import { PlanetSimState, SimRegionState } from '../../types/planetSim';
import {
  REGION_DEFS,
  STRUCTURE_DEFS,
  MAX_DEVELOPMENT,
  EXPLORE_COOLDOWN_MS,
  EXPLORE_ENERGY_COST,
  REGION_KIND_LABEL,
  developCost,
  structureCost,
  formatDuration,
  fmt,
} from '../../core/PlanetSim';

interface RegionPanelProps {
  sim: PlanetSimState;
  region: SimRegionState;
  now: number;
  onDevelop: (regionId: string) => void;
  onBuild: (regionId: string, structureId: string) => void;
  onExplore: (regionId: string) => void;
}

export const RegionPanel: React.FC<RegionPanelProps> = ({
  sim,
  region,
  now,
  onDevelop,
  onBuild,
  onExplore,
}) => {
  const def = REGION_DEFS.find((r) => r.id === region.id) || REGION_DEFS[0];
  const devCost = developCost(region.development);
  const canDevelop =
    region.development < MAX_DEVELOPMENT &&
    sim.resources.materials >= devCost.materials &&
    sim.resources.energy >= devCost.energy;

  const exploreReady = now - region.lastExploredAt >= EXPLORE_COOLDOWN_MS;
  const exploreCooldownLeft = Math.max(0, EXPLORE_COOLDOWN_MS - (now - region.lastExploredAt));

  const baseLines: string[] = [];
  if (def.baseOutput.food) baseLines.push(`🌾 ${(def.baseOutput.food * region.development).toFixed(2)}/s food`);
  if (def.baseOutput.materials) baseLines.push(`⚙️ ${(def.baseOutput.materials * region.development).toFixed(2)}/s materials`);
  if (def.baseOutput.energy) baseLines.push(`⚡ ${(def.baseOutput.energy * region.development).toFixed(2)}/s energy`);
  if (def.baseOutput.export) baseLines.push(`✨ ${(def.baseOutput.export * region.development).toFixed(3)}/s star dust`);

  const allowedStructures = STRUCTURE_DEFS.filter(
    (s) => s.kinds.length === 0 || s.kinds.includes(def.kind)
  );

  return (
    <div className="space-y-3">
      {/* Region header card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border shadow-inner"
              style={{ backgroundColor: `${def.color}22`, borderColor: `${def.color}66` }}
            >
              {simIcon(def.id) ? (
                <img src={simIcon(def.id)} alt={def.name} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                def.icon
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-white">{def.name}</h3>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                  style={{ color: def.color, borderColor: `${def.color}55`, backgroundColor: `${def.color}15` }}
                >
                  {REGION_KIND_LABEL[def.kind]} · Lv {region.development}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{def.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[11px] font-mono text-slate-300 flex flex-wrap gap-x-3 gap-y-1">
            {baseLines.map((line) => (
              <span key={line} className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-0.5">
                {line}
              </span>
            ))}
            <span className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-0.5">
              🧭 {region.exploredCount} expeditions
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => onDevelop(region.id)}
            disabled={!canDevelop}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              canDevelop
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            {region.development >= MAX_DEVELOPMENT ? (
              <span>Max Development</span>
            ) : (
              <span>
                Develop ({fmt(devCost.materials)}⚙️ {fmt(devCost.energy)}⚡)
              </span>
            )}
          </button>

          <button
            onClick={() => onExplore(region.id)}
            disabled={!exploreReady || sim.resources.energy < EXPLORE_ENERGY_COST}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              exploreReady && sim.resources.energy >= EXPLORE_ENERGY_COST
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Compass className="w-4 h-4" />
            {exploreReady ? (
              <span>Explore ({EXPLORE_ENERGY_COST}⚡)</span>
            ) : (
              <span>Scouts rest {formatDuration(exploreCooldownLeft)}</span>
            )}
          </button>
        </div>
      </div>

      {/* Structures */}
      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
          Construction — {allowedStructures.length} blueprints
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allowedStructures.map((s) => {
            const owned = region.structures[s.id] || 0;
            const cost = structureCost(s, owned);
            const costStr = Object.entries(cost)
              .map(([k, v]) => `${fmt(v as number)}${k === 'energy' ? '⚡' : k === 'materials' ? '⚙️' : '🌾'}`)
              .join(' ');
            const affordable =
              sim.resources.energy >= (cost.energy || 0) &&
              sim.resources.materials >= (cost.materials || 0) &&
              sim.resources.food >= (cost.food || 0);
            const lockedByDev = region.development < s.minDevelopment;
            const maxed = owned >= s.maxCount;
            const buildable = affordable && !lockedByDev && !maxed;

            const effectBits: string[] = [];
            if (s.energy) effectBits.push(`+${s.energy}/s ⚡`);
            if (s.materials) effectBits.push(`+${s.materials}/s ⚙️`);
            if (s.food) effectBits.push(`+${s.food}/s 🌾`);
            if (s.export) effectBits.push(`+${s.export}/s ✨`);
            if (s.pollution && s.pollution < 0) effectBits.push(`${(s.pollution * 100).toFixed(1)}/s pollution`);
            if (s.pollution && s.pollution > 0) effectBits.push(`+${(s.pollution * 100).toFixed(1)}/s pollution`);
            if (s.popCap) effectBits.push(`+${s.popCap} pop cap`);
            if (s.defense) effectBits.push(`+${s.defense} defense`);
            if (s.energyUse) effectBits.push(`uses ${s.energyUse}/s ⚡`);

            return (
              <div
                key={s.id}
                className={`bg-slate-900/90 border rounded-2xl p-2.5 flex flex-col gap-1.5 ${
                  owned > 0 ? 'border-slate-700' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {simIcon(s.id) ? (
                    <img src={simIcon(s.id)} alt={s.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <span className="text-xl shrink-0">{s.icon}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{s.name}</span>
                      {owned > 0 && (
                        <span className="text-[9px] font-black bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 rounded-full px-1.5 py-0.5">
                          ×{owned}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">{effectBits.join(' · ')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{costStr}</span>
                  <button
                    onClick={() => onBuild(region.id, s.id)}
                    disabled={!buildable}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                      buildable
                        ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {maxed ? (
                      'Max'
                    ) : lockedByDev ? (
                      <>
                        <Lock className="w-3 h-3" /> Dev {s.minDevelopment}
                      </>
                    ) : (
                      'Build'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Shield, Radar, Crosshair, Rocket, Swords, AlertTriangle } from 'lucide-react';
import { PlanetSimState, SimFactionId } from '../../types/planetSim';
import {
  DEFENSE_DEFS,
  FACTION_DEFS,
  FRIGATE_COST,
  FRIGATE_POWER,
  getFaction,
  getDefenseRating,
  formatDuration,
  fmt,
} from '../../core/PlanetSim';

interface WarRoomPanelProps {
  sim: PlanetSimState;
  now: number;
  onBuildDefense: (key: 'shieldGen' | 'turretGrid' | 'sensorArray') => void;
  onBuildFrigate: (count: number) => void;
  onStrike: (id: SimFactionId) => void;
}

export const WarRoomPanel: React.FC<WarRoomPanelProps> = ({
  sim,
  now,
  onBuildDefense,
  onBuildFrigate,
  onStrike,
}) => {
  const [targetId, setTargetId] = useState<SimFactionId>('VOID_RAIDERS');

  const defenseRating = getDefenseRating(sim);
  const raidActive = sim.nextRaidAt > 0;
  const raidIn = Math.max(0, sim.nextRaidAt - now);
  const totalEnemyStrength = sim.factions.reduce(
    (s, f) => s + (f.awakened && f.status !== 'INTEGRATED' && FACTION_DEFS.find((d) => d.id === f.id)?.kind === 'ENEMY' ? f.strength : 0),
    0
  );

  const enemies = FACTION_DEFS.filter((d) => d.kind === 'ENEMY').map((d) => ({
    def: d,
    faction: getFaction(sim, d.id),
  })).filter((e) => e.faction.awakened && e.faction.status !== 'INTEGRATED');

  const target = enemies.find((e) => e.def.id === targetId) || enemies[0];
  const attackPower = sim.fleet.frigates * FRIGATE_POWER;
  const winChance = target ? Math.round((attackPower / (attackPower + target.faction.strength)) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Threat summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl py-2">
            <Shield className="w-4 h-4 text-sky-400 mx-auto mb-0.5" />
            <span className="text-base font-black text-sky-300 block">{defenseRating}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Defense</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl py-2">
            <Swords className="w-4 h-4 text-rose-400 mx-auto mb-0.5" />
            <span className="text-base font-black text-rose-300 block">{Math.floor(totalEnemyStrength)}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Enemy Power</span>
          </div>
          <div
            className={`border rounded-xl py-2 ${
              raidActive && raidIn < 60_000
                ? 'bg-rose-950/60 border-rose-500/60 animate-pulse'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 mx-auto mb-0.5 ${raidActive && raidIn < 60_000 ? 'text-rose-400' : 'text-amber-400'}`} />
            <span className={`text-base font-black block ${raidActive && raidIn < 60_000 ? 'text-rose-300' : 'text-amber-300'}`}>
              {raidActive ? formatDuration(raidIn) : '—'}
            </span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Next Raid</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
          Raiders strike when the timer runs out. Defense rating blunts their power; the Aegis shield absorbs
          what gets through. Fleet at anchor adds a little to planetary defense.
        </p>
      </div>

      {/* Defense installations */}
      <div>
        <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Planetary Defenses
        </h4>
        <div className="space-y-2">
          {(Object.keys(DEFENSE_DEFS) as Array<'shieldGen' | 'turretGrid' | 'sensorArray'>).map((key) => {
            const def = DEFENSE_DEFS[key];
            const level = sim.defense[key];
            const maxed = level >= def.maxLevel;
            const cost = maxed ? null : def.levelCost(level);
            const affordable =
              !!cost &&
              sim.resources.materials >= cost.materials &&
              sim.resources.energy >= cost.energy;
            return (
              <div key={key} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
                <span className="text-2xl shrink-0">{def.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{def.name}</span>
                    <span className="text-[9px] font-black bg-slate-800 text-sky-300 rounded-full px-2 py-0.5">
                      Lv {level}/{def.maxLevel}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{def.description}</p>
                </div>
                <button
                  onClick={() => onBuildDefense(key)}
                  disabled={maxed || !affordable}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition shrink-0 ${
                    !maxed && affordable
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {maxed ? 'Max' : `Upgrade ${fmt(cost!.materials)}⚙️ ${fmt(cost!.energy)}⚡`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fleet & offense */}
      <div>
        <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
          <Rocket className="w-3.5 h-3.5" /> Strike Fleet & Offensive Ops
        </h4>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">
                Fleet: <span className="text-amber-300 font-mono">{sim.fleet.frigates}</span> frigates
              </span>
              <span className="text-[9px] text-slate-500 font-mono">({attackPower} attack power)</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => onBuildFrigate(1)}
                disabled={sim.resources.materials < FRIGATE_COST.materials || sim.resources.energy < FRIGATE_COST.energy}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  sim.resources.materials >= FRIGATE_COST.materials && sim.resources.energy >= FRIGATE_COST.energy
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                +1 ({FRIGATE_COST.materials}⚙️{FRIGATE_COST.energy}⚡)
              </button>
              <button
                onClick={() => onBuildFrigate(3)}
                disabled={
                  sim.resources.materials < FRIGATE_COST.materials * 3 ||
                  sim.resources.energy < FRIGATE_COST.energy * 3
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  sim.resources.materials >= FRIGATE_COST.materials * 3 && sim.resources.energy >= FRIGATE_COST.energy * 3
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                +3
              </button>
            </div>
          </div>

          {enemies.length === 0 ? (
            <p className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2 py-1.5">
              🕊️ No active hostiles. Every enemy faction has been subdued or integrated.
            </p>
          ) : (
            <>
              {/* Target selector */}
              <div className="flex gap-1.5">
                {enemies.map(({ def, faction }) => (
                  <button
                    key={def.id}
                    onClick={() => setTargetId(def.id)}
                    className={`flex-1 py-1.5 px-2 rounded-xl border text-[10px] font-bold transition flex items-center justify-center gap-1.5 ${
                      target?.def.id === def.id
                        ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{def.icon}</span>
                    <span className="truncate">{def.name}</span>
                    <span className="font-mono text-slate-500">({Math.floor(faction.strength)})</span>
                  </button>
                ))}
              </div>

              {target && (
                <div className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-300">
                    <span className="text-slate-500 font-bold uppercase tracking-wider block">Estimated Success</span>
                    <span
                      className={`text-lg font-black ${
                        winChance >= 70 ? 'text-emerald-400' : winChance >= 40 ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {sim.fleet.frigates > 0 ? `${winChance}%` : 'No ships'}
                    </span>
                  </div>
                  <button
                    onClick={() => onStrike(target.def.id)}
                    disabled={sim.fleet.frigates < 1}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      sim.fleet.frigates >= 1
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Swords className="w-4 h-4" /> LAUNCH STRIKE
                  </button>
                </div>
              )}

              <p className="text-[9px] text-slate-500 leading-relaxed">
                Victory weakens the enemy (~-38% strength) and loots materials + star dust. Defeat loses ships and
                provokes a swift retaliation. Repeated victories let you force their surrender.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Radar flavor */}
      <div className="flex items-center gap-2 text-[9px] text-slate-500 px-1">
        <Radar className="w-3 h-3" />
        <span>
          Deep sensors track {sim.factions.filter((f) => f.awakened).length} known factions · {sim.stats.strikesLaunched} strikes flown · {sim.stats.raidsSurvived} raids survived
        </span>
      </div>
    </div>
  );
};

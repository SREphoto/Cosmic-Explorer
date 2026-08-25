import React from 'react';
import { Handshake, Gift, HeartHandshake, ShieldOff, Swords, MoonStar } from 'lucide-react';
import { PlanetSimState, SimFactionId } from '../../types/planetSim';
import {
  FACTION_DEFS,
  ALLIANCE_RELATION_REQ,
  TRUCE_COST_STARDUST,
  INTEGRATE_COST_STARDUST,
  INTEGRATE_MAX_STRENGTH,
  getFaction,
  formatDuration,
} from '../../core/PlanetSim';

interface DiplomacyPanelProps {
  sim: PlanetSimState;
  now: number;
  starDustBalance: number;
  onEnvoy: (id: SimFactionId) => void;
  onTribute: (id: SimFactionId) => void;
  onAlliance: (id: SimFactionId) => void;
  onTruce: (id: SimFactionId) => void;
  onIntegrate: (id: SimFactionId) => void;
}

export const DiplomacyPanel: React.FC<DiplomacyPanelProps> = ({
  sim,
  now,
  starDustBalance,
  onEnvoy,
  onTribute,
  onAlliance,
  onTruce,
  onIntegrate,
}) => {
  const allyDefs = FACTION_DEFS.filter((f) => f.kind === 'ALLY_CANDIDATE');
  const enemyDefs = FACTION_DEFS.filter((f) => f.kind === 'ENEMY');

  return (
    <div className="space-y-3">
      {/* ALLIES */}
      <div>
        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5" /> Potential Allies — win them over
        </h4>
        <div className="space-y-2">
          {allyDefs.map((def) => {
            const f = getFaction(sim, def.id);
            const allied = f.status === 'ALLIED';
            const canAlliance = !allied && f.relation >= ALLIANCE_RELATION_REQ;
            return (
              <div
                key={def.id}
                className={`bg-slate-900/90 border rounded-2xl p-3 ${
                  allied ? 'border-emerald-500/50' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                    style={{ backgroundColor: `${def.color}18`, borderColor: `${def.color}55` }}
                  >
                    {def.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{def.name}</span>
                      <span className="text-[9px] text-slate-400 italic">{def.title}</span>
                      {allied && (
                        <span className="text-[9px] font-black bg-emerald-500 text-slate-950 rounded-full px-2 py-0.5 uppercase">
                          Allied
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{def.description}</p>
                    <p className="text-[10px] font-bold mt-1" style={{ color: def.color }}>
                      {def.allianceBonus}
                    </p>
                  </div>
                </div>

                {allied ? (
                  <div className="mt-2 text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2 py-1">
                    ✅ Bonus active — this faction's ambassador orbits your world.
                  </div>
                ) : (
                  <>
                    {/* Relation bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-0.5">
                        <span>Relation</span>
                        <span>
                          {Math.floor(f.relation)} / {ALLIANCE_RELATION_REQ} needed
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            canAlliance ? 'bg-emerald-400' : 'bg-sky-400'
                          }`}
                          style={{ width: `${Math.min(100, (f.relation / ALLIANCE_RELATION_REQ) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      <button
                        onClick={() => onEnvoy(def.id)}
                        disabled={sim.resources.materials < 10}
                        className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                          sim.resources.materials >= 10
                            ? 'bg-sky-600 hover:bg-sky-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Gift className="w-3 h-3" /> Envoy (10⚙️)
                      </button>
                      <button
                        onClick={() => onTribute(def.id)}
                        disabled={sim.resources.materials < 30 || sim.resources.energy < 15}
                        className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                          sim.resources.materials >= 30 && sim.resources.energy >= 15
                            ? 'bg-purple-600 hover:bg-purple-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Handshake className="w-3 h-3" /> Tribute (30⚙️15⚡)
                      </button>
                      <button
                        onClick={() => onAlliance(def.id)}
                        disabled={!canAlliance}
                        className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                          canAlliance
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 animate-pulse'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <HeartHandshake className="w-3 h-3" /> Ally
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ENEMIES */}
      <div>
        <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5" /> Hostile Powers — manage or subdue
        </h4>
        <div className="space-y-2">
          {enemyDefs.map((def) => {
            const f = getFaction(sim, def.id);
            if (!f.awakened) {
              return (
                <div key={def.id} className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-3 opacity-70">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">❔</span>
                    <div>
                      <span className="text-xs font-bold text-slate-400">Unidentified Signal</span>
                      <p className="text-[10px] text-slate-500">
                        A dormant power stirs beyond the veil. Grow your world and it will notice you…
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            const truceActive = f.status === 'TRUCE' && Date.now() < f.truceUntil;
            const integrated = f.status === 'INTEGRATED';
            const canIntegrate = !integrated && f.strength <= INTEGRATE_MAX_STRENGTH;

            return (
              <div
                key={def.id}
                className={`bg-slate-900/90 border rounded-2xl p-3 ${
                  integrated ? 'border-amber-500/40' : 'border-rose-900/60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                    style={{ backgroundColor: `${def.color}15`, borderColor: `${def.color}55` }}
                  >
                    {def.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{def.name}</span>
                      <span className="text-[9px] text-slate-400 italic">{def.title}</span>
                      {integrated ? (
                        <span className="text-[9px] font-black bg-amber-400 text-slate-950 rounded-full px-2 py-0.5 uppercase">
                          Serving You
                        </span>
                      ) : truceActive ? (
                        <span className="text-[9px] font-black bg-sky-500 text-slate-950 rounded-full px-2 py-0.5 uppercase">
                          Truce {formatDuration(f.truceUntil - now)}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full px-2 py-0.5 uppercase">
                          At War
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{def.description}</p>
                  </div>
                </div>

                {integrated ? (
                  <div className="mt-2 text-[10px] text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-lg px-2 py-1">
                    🏴 {def.allianceBonus}
                  </div>
                ) : (
                  <>
                    {/* Strength bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-0.5">
                        <span>Enemy Strength</span>
                        <span>{Math.floor(f.strength)} / 220</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-600 transition-all"
                          style={{ width: `${Math.min(100, (f.strength / 220) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      <button
                        onClick={() => onTruce(def.id)}
                        disabled={truceActive || starDustBalance < TRUCE_COST_STARDUST}
                        className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                          !truceActive && starDustBalance >= TRUCE_COST_STARDUST
                            ? 'bg-sky-600 hover:bg-sky-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <ShieldOff className="w-3 h-3" />
                        {truceActive ? 'Truce Holds' : `Truce (${TRUCE_COST_STARDUST}✨)`}
                      </button>
                      <button
                        onClick={() => onIntegrate(def.id)}
                        disabled={!canIntegrate || starDustBalance < INTEGRATE_COST_STARDUST}
                        title={canIntegrate ? 'Demand their surrender' : `Subdue below ${INTEGRATE_MAX_STRENGTH} strength via strikes first`}
                        className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                          canIntegrate && starDustBalance >= INTEGRATE_COST_STARDUST
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <MoonStar className="w-3 h-3" />
                        {canIntegrate ? `Force Surrender (${INTEGRATE_COST_STARDUST}✨)` : `Subdue to ≤${INTEGRATE_MAX_STRENGTH} first`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

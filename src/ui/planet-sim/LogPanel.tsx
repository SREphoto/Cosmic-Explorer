import React from 'react';
import { ScrollText } from 'lucide-react';
import { PlanetSimState } from '../../types/planetSim';

interface LogPanelProps {
  sim: PlanetSimState;
}

const KIND_STYLE: Record<string, string> = {
  GOOD: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200',
  BAD: 'border-rose-500/30 bg-rose-950/30 text-rose-200',
  WAR: 'border-amber-500/30 bg-amber-950/30 text-amber-200',
  INFO: 'border-slate-700/60 bg-slate-900/70 text-slate-300',
};

export const LogPanel: React.FC<LogPanelProps> = ({ sim }) => {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
        <ScrollText className="w-3.5 h-3.5" /> Planetary Chronicle
      </h4>
      {sim.log.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-6">Nothing has happened yet. Go make history.</p>
      )}
      {sim.log.map((entry, i) => (
        <div
          key={`${entry.ts}-${i}`}
          className={`border rounded-xl px-2.5 py-1.5 text-[11px] leading-relaxed flex gap-2 items-start ${
            KIND_STYLE[entry.kind] || KIND_STYLE.INFO
          }`}
        >
          <span className="text-[9px] font-mono text-slate-500 shrink-0 pt-0.5 w-12">
            {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span>{entry.msg}</span>
        </div>
      ))}
    </div>
  );
};

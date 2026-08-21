import React from 'react';
import { X, Volume2, Music, Check, Play, Sparkles, Radio } from 'lucide-react';
import { SOUND_PACKS } from '../core/Config';
import { SoundPackId, UserSavedData } from '../types/game';
import { audioEngine } from '../core/AudioEngine';
import { StorageManager } from '../core/Storage';

interface SoundPacksModalProps {
  savedData: UserSavedData;
  onClose: () => void;
  onUpdateData: (newData: UserSavedData) => void;
}

export const SoundPacksModal: React.FC<SoundPacksModalProps> = ({
  savedData,
  onClose,
  onUpdateData
}) => {
  const activePackId: SoundPackId = (savedData.activeSoundPack as SoundPackId) || 'ORCHESTRAL';

  const handleSelectPack = (packId: SoundPackId) => {
    audioEngine.setSoundPack(packId);
    audioEngine.previewSoundPack(packId);
    const updated = StorageManager.saveData({ activeSoundPack: packId });
    onUpdateData(updated);
  };

  const handlePreview = (packId: SoundPackId, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.previewSoundPack(packId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 text-white shadow-2xl flex flex-col max-h-[85vh] ui-interactive overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                Audio Synthesizer & Sound Packs
              </h2>
              <p className="text-xs text-slate-400">
                Procedural scales, orbital flutes, and jump timbre presets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200 border border-slate-700/60 shadow btn-grow-sm glow-subtle-hover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sound Pack Cards */}
        <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1">
          {SOUND_PACKS.map((pack) => {
            const isEquipped = activePackId === pack.id;

            return (
              <div
                key={pack.id}
                onClick={() => handleSelectPack(pack.id)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                  isEquipped
                    ? 'bg-sky-950/30 border-sky-500/80 shadow-md'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                      style={{
                        backgroundColor: `${pack.accentColor}22`,
                        border: `1px solid ${pack.accentColor}66`
                      }}
                    >
                      {pack.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-xs text-white">{pack.name}</h3>
                        {isEquipped && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-400/40 flex items-center gap-0.5 uppercase">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-0.5 italic">{pack.subtitle}</p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{pack.description}</p>

                      <div className="mt-1.5 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                        <span className="text-slate-400">Timbre:</span>
                        <span style={{ color: pack.accentColor }}>{pack.previewNote}</span>
                      </div>
                    </div>
                  </div>

                  {/* Preview Button */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handlePreview(pack.id, e)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 border border-slate-700 flex items-center gap-1 transition-all duration-200 shadow-sm btn-grow-sm glow-sky-hover"
                      title="Preview synth chords & jump sound"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Preview</span>
                    </button>

                    {!isEquipped && (
                      <button
                        onClick={() => handleSelectPack(pack.id)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all duration-200 btn-grow-sm glow-subtle-hover"
                      >
                        Equip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Notes */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>Procedurally synthesized via Web Audio API</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all duration-200 text-xs btn-grow-sm glow-subtle-hover border border-slate-700/60"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

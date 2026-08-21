import React from 'react';
import {
  X,
  MapPin,
  Lock,
  Rocket,
  Compass,
  Radio,
  Sparkles
} from 'lucide-react';
import { CHECKPOINT_PLANETS } from '../core/Config';
import { UserSavedData } from '../types/game';
import { audioEngine } from '../core/AudioEngine';
import galaxyMapBannerImg from '../assets/images/galaxy_map_banner_1786696571856.jpg';

interface GalaxyMapModalProps {
  savedData: UserSavedData;
  onClose: () => void;
  onSelectCheckpoint: (checkpointId: string) => void;
  onLaunchRun: (checkpointId: string) => void;
}

export const GalaxyMapModal: React.FC<GalaxyMapModalProps> = ({
  savedData,
  onClose,
  onSelectCheckpoint,
  onLaunchRun
}) => {
  const unlockedIds = savedData.unlockedCheckpointIds || ['CHECKPOINT_EARTH'];
  const currentSelectedId = savedData.selectedStartCheckpointId || 'CHECKPOINT_EARTH';

  const handleSelect = (id: string) => {
    audioEngine.playMenuClick();
    onSelectCheckpoint(id);
  };

  const handleLaunch = (id: string) => {
    audioEngine.playJump();
    onLaunchRun(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white">
        {/* Top Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-md mb-3 shrink-0 h-28 group">
          <img
            src={galaxyMapBannerImg}
            alt="Galaxy Expedition Map"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end justify-between p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-sky-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white">
                  Galaxy Expedition Map
                </h2>
                <p className="text-xs text-slate-300">
                  Select unlocked sector checkpoints to launch directly from orbit
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                audioEngine.playMenuClick();
                onClose();
              }}
              className="p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 border border-slate-700/80 shadow btn-grow-sm glow-subtle-hover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Checkpoint Planet Constellation List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
          {CHECKPOINT_PLANETS.map((cp, idx) => {
            const isUnlocked = unlockedIds.includes(cp.id);
            const isSelected = currentSelectedId === cp.id;

            return (
              <div
                key={cp.id}
                className={`relative overflow-hidden rounded-2xl p-3.5 border transition-all duration-200 ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500/80 shadow-md'
                    : isUnlocked
                    ? 'bg-slate-800/50 hover:bg-slate-800/80 border-slate-750'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Planet Sphere Miniature Icon */}
                    <div
                      className="w-11 h-11 rounded-full border-2 flex items-center justify-center relative shrink-0"
                      style={{
                        backgroundColor: cp.primaryColor,
                        borderColor: isSelected ? '#38bdf8' : isUnlocked ? '#facc15' : '#475569',
                      }}
                    >
                      {isUnlocked ? (
                        <MapPin className="w-4 h-4 text-white" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400" />
                      )}

                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-700 text-[9px] font-semibold text-amber-300">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Checkpoint Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                          {cp.name}
                        </h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/50 text-[10px] font-semibold text-sky-300">
                            Active Spawn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {cp.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-slate-300">
                        <span className="text-amber-400 flex items-center gap-1">
                          <Radio className="w-3 h-3" />
                          Altitude: {cp.altitude.toLocaleString()}m
                        </span>
                        <span className="text-slate-400">
                          Biome: {cp.biomeName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Unlock Status / Start Action */}
                  <div className="flex flex-col items-end justify-center shrink-0 pt-0.5">
                    {isUnlocked ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelect(cp.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border btn-grow-sm ${
                            isSelected
                              ? 'bg-sky-500/20 border-sky-400/60 text-sky-300'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 glow-subtle-hover'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Set as Start'}
                        </button>
                        <button
                          onClick={() => handleLaunch(cp.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md flex items-center gap-1.5 transition-all duration-200 btn-grow glow-sky-hover"
                        >
                          <Rocket className="w-3.5 h-3.5" />
                          Launch
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1 justify-end">
                          <Lock className="w-3 h-3 text-slate-500" />
                          Reach {cp.altitude}m
                        </span>
                        <p className="text-[10px] text-slate-500">Locked Sector</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Note */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Land on milestone planets to unlock permanent fast travel checkpoints</span>
          </div>
          <button
            onClick={() => {
              audioEngine.playMenuClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all duration-200 btn-grow-sm glow-subtle-hover"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

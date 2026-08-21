import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  Star,
  Gem,
  CheckCircle2,
  Clock,
  Flame,
  Gift
} from 'lucide-react';
import { DailyMission, UserSavedData } from '../types/game';
import { DailyChallengeSystem } from '../systems/DailyChallengeSystem';
import { audioEngine } from '../core/AudioEngine';

interface DailyMissionsModalProps {
  savedData: UserSavedData;
  onClose: () => void;
  onUpdateData: (newData: UserSavedData) => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  savedData,
  onClose,
  onUpdateData
}) => {
  const [timeLeft, setTimeLeft] = useState<string>(DailyChallengeSystem.getTimeUntilNextReset());
  const missions = DailyChallengeSystem.getDailyMissions(savedData);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(DailyChallengeSystem.getTimeUntilNextReset());
    }, 1000 * 15);
    return () => clearInterval(timer);
  }, []);

  const handleClaim = (missionId: string) => {
    const res = DailyChallengeSystem.claimMission(savedData, missionId);
    if (res.claimed) {
      audioEngine.playPowerUpCollect();
      onUpdateData(res.updatedData);
    }
  };

  const handleClaimAll = () => {
    const res = DailyChallengeSystem.claimAllMissions(savedData);
    if (res.claimedCount > 0) {
      audioEngine.playCheckpointUnlocked();
      onUpdateData(res.updatedData);
    }
  };

  const completedCount = missions.filter((m) => m.progress >= m.target).length;
  const hasClaimable = missions.some((m) => m.progress >= m.target && !m.claimed);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 text-white shadow-2xl flex flex-col max-h-[90vh] ui-interactive overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                Daily Cosmic Protocol Missions
              </h2>
              <p className="text-xs text-slate-400">
                Three procedurally generated objectives resetting every 24 hours
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

        {/* Status bar */}
        <div className="flex items-center justify-between py-2 px-3 my-2 bg-slate-950/60 rounded-xl border border-slate-800 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Completed: {completedCount} / 3</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Clock className="w-3 h-3" />
            <span>Resets in: {timeLeft}</span>
          </div>
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-1 pr-1">
          {missions.map((mission, index) => {
            const isCompleted = mission.progress >= mission.target;
            const isClaimed = mission.claimed;
            const progressPercent = Math.min(100, Math.floor((mission.progress / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isClaimed
                    ? 'bg-slate-950/40 border-slate-850 opacity-60'
                    : isCompleted
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-md'
                    : 'bg-slate-850/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {mission.icon || '🚀'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          #{index + 1}
                        </span>
                        <h4 className="font-bold text-xs text-white truncate">{mission.title}</h4>
                      </div>

                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{mission.description}</p>

                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                          <span>Progress</span>
                          <span>
                            {mission.progress.toLocaleString()} / {mission.target.toLocaleString()} ({progressPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isClaimed
                                ? 'bg-emerald-500'
                                : isCompleted
                                ? 'bg-amber-400'
                                : 'bg-sky-400'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rewards & Claim Button */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />+{mission.rewardStars}
                      </span>
                      {mission.rewardDiamonds > 0 && (
                        <span className="text-xs font-bold text-sky-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60 flex items-center gap-1">
                          <Gem className="w-3 h-3 fill-sky-400 text-sky-400" />+{mission.rewardDiamonds}
                        </span>
                      )}
                    </div>

                    {isCompleted && !isClaimed ? (
                      <button
                        onClick={() => handleClaim(mission.id)}
                        className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow transition-all duration-200 flex items-center gap-1 btn-grow glow-amber-hover"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Claim</span>
                      </button>
                    ) : isClaimed ? (
                      <span className="text-emerald-400 text-xs font-medium flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claimed</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-medium pt-1">In Progress</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Claim All */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-purple-400" />
            <span>Complete missions during active orbital runs</span>
          </div>

          <div className="flex items-center gap-2">
            {hasClaimable && (
              <button
                onClick={handleClaimAll}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all duration-200 shadow btn-grow glow-amber-hover"
              >
                Claim All
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all duration-200 text-xs btn-grow-sm glow-subtle-hover border border-slate-700/60"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

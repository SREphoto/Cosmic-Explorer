import React, { useState, useEffect } from 'react';
import { 
  X, 
  Target, 
  CheckCircle2, 
  Star, 
  Gem, 
  Sparkles, 
  Calendar, 
  Clock, 
  Flame, 
  Gift, 
  Award,
  Zap,
  Check
} from 'lucide-react';
import { StageQuest, UserSavedData, DailyMission } from '../types/game';
import { DailyChallengeSystem } from '../systems/DailyChallengeSystem';
import { StorageManager } from '../core/Storage';
import { audioEngine } from '../core/AudioEngine';
import questMissionsBannerImg from '../assets/images/quest_missions_banner_1786696581711.jpg';

interface QuestLogModalProps {
  stages: StageQuest[];
  currentStageIndex: number;
  savedData?: UserSavedData;
  onUpdateData?: (newData: UserSavedData) => void;
  onClose: () => void;
}

export const QuestLogModal: React.FC<QuestLogModalProps> = ({ 
  stages, 
  currentStageIndex, 
  savedData,
  onUpdateData,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'EXPEDITIONS' | 'DAILY'>('EXPEDITIONS');
  const [currentSaveData, setCurrentSaveData] = useState<UserSavedData>(savedData || StorageManager.loadData());
  const [timeLeft, setTimeLeft] = useState<string>(DailyChallengeSystem.getTimeUntilNextReset());

  // Keep local save state synced if parent prop changes
  useEffect(() => {
    if (savedData) {
      setCurrentSaveData(savedData);
    }
  }, [savedData]);

  // Update countdown timer every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(DailyChallengeSystem.getTimeUntilNextReset());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const completedStagesCount = stages.filter((s) => s.completed).length;

  // Retrieve or generate the 3 random daily tasks for today
  const dailyMissions: DailyMission[] = DailyChallengeSystem.getDailyMissions(currentSaveData);
  const completedDailyCount = dailyMissions.filter((m) => m.progress >= m.target).length;
  const hasClaimableDaily = dailyMissions.some((m) => m.progress >= m.target && !m.claimed);

  const handleClaimDailyMission = (missionId: string) => {
    const res = DailyChallengeSystem.claimMission(currentSaveData, missionId);
    if (res.claimed) {
      audioEngine.playPowerUpCollect();
      setCurrentSaveData(res.updatedData);
      if (onUpdateData) {
        onUpdateData(res.updatedData);
      }
    }
  };

  const handleClaimAllDaily = () => {
    const res = DailyChallengeSystem.claimAllMissions(currentSaveData);
    if (res.claimedCount > 0) {
      audioEngine.playCheckpointUnlocked();
      setCurrentSaveData(res.updatedData);
      if (onUpdateData) {
        onUpdateData(res.updatedData);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 text-white shadow-2xl flex flex-col max-h-[90vh] ui-interactive overflow-hidden">
        {/* Top Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-md mb-3 shrink-0 h-28 group">
          <img
            src={questMissionsBannerImg}
            alt="Galactic Missions"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end justify-between p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-sky-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white">
                  Galactic Objectives Log
                </h2>
                <p className="text-xs text-slate-300">
                  Expedition milestones and daily cosmic protocols for star rewards
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 border border-slate-700/80 shadow btn-grow-sm glow-subtle-hover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-3 shrink-0">
          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveTab('EXPEDITIONS');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'EXPEDITIONS'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Expedition Stages</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/40 ml-1">
              {completedStagesCount}/{stages.length}
            </span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              setActiveTab('DAILY');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 relative ${
              activeTab === 'DAILY'
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Protocols</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/40 ml-1">
              {completedDailyCount}/3
            </span>
            {hasClaimableDaily && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: EXPEDITION ROADMAP STAGES */}
        {/* ======================================================== */}
        {activeTab === 'EXPEDITIONS' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Progress Tracker Ribbon */}
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-2.5 mb-2.5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-300">Expedition Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold font-mono text-amber-300">
                  {completedStagesCount} / {stages.length} Stages Cleared
                </span>
              </div>
            </div>

            {/* Stage List */}
            <div className="overflow-y-auto space-y-2.5 pr-1 my-1 flex-1">
              {stages.map((stage, idx) => {
                const isCurrent = idx === currentStageIndex && !stage.completed;
                const isCompleted = stage.completed;

                return (
                  <div
                    key={stage.stageId}
                    className={`rounded-2xl border p-3.5 transition-all ${
                      isCompleted
                        ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                        : isCurrent
                        ? 'bg-sky-950/30 border-sky-500/70 shadow-md text-white'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    {/* Stage Title Header */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-sky-400 bg-slate-850 px-2 py-0.5 rounded-lg border border-slate-750">
                          Stage {stage.stageId}
                        </span>
                        <h3 className="font-bold text-xs sm:text-sm text-white">{stage.stageName}</h3>
                      </div>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/50 px-2.5 py-0.5 rounded-full uppercase font-bold">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 font-medium">Locked</span>
                      )}
                    </div>

                    {/* Objectives list */}
                    <div className="space-y-1.5 my-2">
                      {stage.objectives.map((obj) => (
                        <div
                          key={obj.id}
                          className="flex justify-between items-center text-xs bg-slate-950/50 p-2 rounded-xl border border-slate-800/60"
                        >
                          <span className={obj.completed ? 'line-through text-slate-500 text-[11px]' : 'text-slate-300 text-[11px]'}>
                            {obj.description}
                          </span>
                          <span
                            className={`font-mono font-semibold text-xs ${
                              obj.completed ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {obj.completed ? '✓' : `${obj.currentCount}/${obj.targetCount}`}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Rewards footer */}
                    <div className="flex justify-end items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
                      <span className="text-slate-400 text-[11px] font-medium">Reward:</span>
                      <div className="flex items-center gap-1 text-amber-300 font-semibold bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-750">
                        <span>+{stage.rewardStars}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex items-center gap-1 text-sky-300 font-semibold bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-750">
                        <span>+{stage.rewardDiamonds}</span>
                        <Gem className="w-3 h-3 fill-sky-400 text-sky-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DAILY PROTOCOLS & STAR DUST REWARDS */}
        {/* ======================================================== */}
        {activeTab === 'DAILY' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between py-2 px-3 mb-2.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-300 font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{completedDailyCount} / 3 Tasks Complete</span>
                </div>
                {hasClaimableDaily && (
                  <button
                    onClick={handleClaimAllDaily}
                    className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black rounded-lg transition"
                  >
                    Claim All
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>Resets in: {timeLeft}</span>
              </div>
            </div>

            {/* Daily Missions List */}
            <div className="overflow-y-auto space-y-2.5 pr-1 my-1 flex-1">
              {dailyMissions.map((mission, index) => {
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
                        ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border-amber-500/60 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0 shadow-inner">
                          {mission.icon || '🚀'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              TASK #{index + 1}
                            </span>
                            <h4 className="font-bold text-xs text-white truncate">{mission.title}</h4>
                          </div>

                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                            {mission.description}
                          </p>

                          {/* Progress Bar */}
                          <div className="mt-2">
                            <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                              <span>Progress</span>
                              <span className="font-mono text-slate-300">
                                {mission.progress.toLocaleString()} / {mission.target.toLocaleString()} ({progressPercent}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isClaimed
                                    ? 'bg-emerald-500'
                                    : isCompleted
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                                    : 'bg-sky-400'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rewards & Claim Footer */}
                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/80 text-xs">
                      {/* Reward Pills */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[10px] font-medium mr-0.5">Reward:</span>
                        {/* Extra Star Dust Reward Badge */}
                        <div className="flex items-center gap-1 text-amber-300 font-bold bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-500/40 text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                          <span>+{mission.rewardStarDust} Star Dust</span>
                        </div>
                        {mission.rewardStars > 0 && (
                          <div className="flex items-center gap-1 text-amber-200 font-semibold bg-slate-800 px-1.5 py-0.5 rounded-lg text-[10px]">
                            <span>+{mission.rewardStars}</span>
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          </div>
                        )}
                        {(mission.rewardDiamonds || 0) > 0 && (
                          <div className="flex items-center gap-1 text-sky-300 font-semibold bg-slate-800 px-1.5 py-0.5 rounded-lg text-[10px]">
                            <span>+{mission.rewardDiamonds}</span>
                            <Gem className="w-2.5 h-2.5 fill-sky-400 text-sky-400" />
                          </div>
                        )}
                      </div>

                      {/* Claim Button */}
                      <div>
                        {isClaimed ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                            <Check className="w-3 h-3" />
                            <span>Claimed</span>
                          </span>
                        ) : isCompleted ? (
                          <button
                            onClick={() => handleClaimDailyMission(mission.id)}
                            className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 text-xs font-black px-3 py-1 rounded-xl shadow-lg transition flex items-center gap-1.5 animate-bounce-short"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>Claim Reward</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium px-2 py-0.5 bg-slate-800/60 rounded-lg">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

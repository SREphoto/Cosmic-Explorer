import React, { useState, useEffect } from 'react';
import { X, Trophy, Star, Gem, CheckCircle2, Lock, Sparkles, Globe, Award, RefreshCw, Flame } from 'lucide-react';
import { Achievement, UserSavedData } from '../types/game';
import { ACHIEVEMENTS } from '../core/Config';
import { audioEngine } from '../core/AudioEngine';
import { FirebaseService, auth } from '../core/firebase';
import trophyBannerImg from '../assets/images/trophy_badges_banner_1786696596962.jpg';

interface AchievementsModalProps {
  savedData: UserSavedData;
  onClose: () => void;
  onClaimAchievement: (achievementId: string, rewardStars: number, rewardDiamonds: number) => void;
}

type ModalMainTab = 'ACHIEVEMENTS' | 'LEADERBOARD';
type FilterCategory = 'ALL' | 'STARS' | 'JUMPS' | 'PLANETS' | 'ALTITUDE' | 'COLLECTION' | 'MASTERY';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  score: number;
  maxAltitude: number;
  planetsVisited: number;
  levelReached?: number;
  submittedAt?: number;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  savedData,
  onClose,
  onClaimAchievement
}) => {
  const [mainTab, setMainTab] = useState<ModalMainTab>('ACHIEVEMENTS');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmittedMessage, setScoreSubmittedMessage] = useState<string | null>(null);

  const currentUser = auth.currentUser;
  const todayKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (mainTab === 'LEADERBOARD') {
      fetchLeaderboard();
    }
  }, [mainTab]);

  const fetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const data = await FirebaseService.getDailyLeaderboard(todayKey, 30);
      setLeaderboardEntries(data);
    } catch (e) {
      console.warn('Failed to load leaderboard:', e);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const handleSubmitTodayScore = async () => {
    if (!currentUser) {
      try {
        await FirebaseService.signInGuest();
      } catch {
        // proceed
      }
    }
    const user = auth.currentUser;
    if (!user) return;

    setIsSubmittingScore(true);
    try {
      const success = await FirebaseService.submitDailyScore(
        user.uid,
        user.displayName || (user.isAnonymous ? 'Cosmic Pilot' : 'Star Explorer'),
        user.photoURL || '',
        savedData.highScore || 0,
        savedData.maxAltitudeOverall || 0,
        savedData.totalPlanetsAllTime || 0,
        savedData.playerLevel || 1
      );
      audioEngine.playPowerUpCollect();
      if (success) {
        setScoreSubmittedMessage('Daily score posted to leaderboard!');
      } else {
        setScoreSubmittedMessage('Your existing daily score is already higher!');
      }
      await fetchLeaderboard();
      setTimeout(() => setScoreSubmittedMessage(null), 3500);
    } catch (e) {
      console.warn('Failed to submit score:', e);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const getProgressValue = (achievement: Achievement): number => {
    switch (achievement.id) {
      case 'STARS_1':
      case 'STARS_2':
      case 'STARS_3':
        return savedData.totalStarsAllTime || savedData.totalStars || 0;
      case 'DIAMONDS_1':
      case 'DIAMONDS_2':
      case 'DIAMONDS_3':
        return savedData.totalDiamondsAllTime || savedData.totalDiamonds || 0;
      case 'PLANETS_1':
      case 'PLANETS_2':
        return savedData.totalPlanetsAllTime || 0;
      case 'JUMPS_1':
      case 'JUMPS_2':
        return savedData.maxConsecutiveJumpsRecord || 0;
      case 'ALTITUDE_1':
      case 'ALTITUDE_2':
        return savedData.maxAltitudeOverall || 0;
      case 'ORBIT_1':
        return savedData.totalFullOrbitsAllTime || 0;
      case 'SUN_1':
        return savedData.totalSunsAllTime || 0;
      case 'WARDROBE_1':
        return savedData.unlockedCostumes?.length || 1;
      default:
        return 0;
    }
  };

  const claimedIds = savedData.claimedAchievementIds || [];

  const filteredAchievements = ACHIEVEMENTS.filter((ach) => {
    if (activeCategory === 'ALL') return true;
    return ach.category === activeCategory;
  });

  const totalUnlocked = ACHIEVEMENTS.filter((ach) => {
    const progress = getProgressValue(ach);
    return progress >= ach.target;
  }).length;

  const handleClaim = (ach: Achievement) => {
    audioEngine.playPowerUpCollect();
    onClaimAchievement(ach.id, ach.rewardStars, ach.rewardDiamonds);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none text-white ui-interactive animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-md mb-3 shrink-0 h-28 group">
          <img
            src={trophyBannerImg}
            alt="Cosmic Achievements & Leaderboards"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end justify-between p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-amber-400">
                {mainTab === 'ACHIEVEMENTS' ? <Trophy className="w-5 h-5" /> : <Globe className="w-5 h-5 text-sky-400" />}
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white">
                  {mainTab === 'ACHIEVEMENTS' ? 'Cosmic Milestones & Badges' : 'Daily Global Leaderboard'}
                </h2>
                <p className="text-xs text-slate-300">
                  {mainTab === 'ACHIEVEMENTS' 
                    ? `${totalUnlocked} of ${ACHIEVEMENTS.length} achievements unlocked`
                    : `Live rankings for UTC ${todayKey}`}
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

        {/* Primary View Switcher: Achievements vs Daily Leaderboard */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2">
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                audioEngine.playMenuSelect();
                setMainTab('ACHIEVEMENTS');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainTab === 'ACHIEVEMENTS'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Achievements</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playMenuSelect();
                setMainTab('LEADERBOARD');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mainTab === 'LEADERBOARD'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Daily Leaderboard</span>
            </button>
          </div>

          {mainTab === 'LEADERBOARD' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSubmitTodayScore}
                disabled={isSubmittingScore}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition shadow flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isSubmittingScore ? 'Posting...' : 'Post Best Score'}</span>
              </button>
              <button
                onClick={fetchLeaderboard}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Refresh Leaderboard"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {scoreSubmittedMessage && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs px-3 py-1.5 rounded-xl mb-2 flex items-center justify-between animate-fade-in">
            <span>{scoreSubmittedMessage}</span>
          </div>
        )}

        {mainTab === 'ACHIEVEMENTS' ? (
          <>
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 py-1.5 overflow-x-auto no-scrollbar shrink-0">
              {(['ALL', 'STARS', 'JUMPS', 'PLANETS', 'ALTITUDE', 'MASTERY', 'COLLECTION'] as FilterCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    audioEngine.playClick();
                    setActiveCategory(cat);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap btn-grow-sm ${
                    activeCategory === cat
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Achievements List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2">
              {filteredAchievements.map((ach) => {
                const currentProgress = getProgressValue(ach);
                const isCompleted = currentProgress >= ach.target;
                const isClaimed = claimedIds.includes(ach.id);
                const progressRatio = Math.min(1.0, currentProgress / ach.target);
                const progressPercent = Math.floor(progressRatio * 100);

                return (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-2xl border transition relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isClaimed
                        ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                        : isCompleted
                        ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                        : 'bg-slate-800/50 border-slate-750'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Badge Icon */}
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${ach.badgeColor} p-0.5 shadow-sm flex items-center justify-center text-xl shrink-0`}
                      >
                        <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center">
                          {ach.icon}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">{ach.title}</h3>
                          {isClaimed && (
                            <span className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold px-2 py-0.2 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Claimed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>

                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>
                              {currentProgress.toLocaleString()} / {ach.target.toLocaleString()} ({progressPercent}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-950/80 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isClaimed
                                  ? 'bg-emerald-400'
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

                    {/* Reward / Action Button */}
                    <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="text-amber-300 flex items-center gap-1 bg-slate-850 px-2 py-0.5 rounded-lg border border-slate-750">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> +{ach.rewardStars}
                        </span>
                        <span className="text-sky-300 flex items-center gap-1 bg-slate-850 px-2 py-0.5 rounded-lg border border-slate-750">
                          <Gem className="w-3 h-3 fill-sky-400 text-sky-400" /> +{ach.rewardDiamonds}
                        </span>
                      </div>

                      {/* Claim Button or Status */}
                      {isCompleted && !isClaimed ? (
                        <button
                          onClick={() => handleClaim(ach)}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all duration-200 flex items-center gap-1 btn-grow glow-amber-hover"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Claim
                        </button>
                      ) : isClaimed ? (
                        <div className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs font-medium flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Locked
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Daily Global Leaderboard Tab */
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Your Best Run: <strong className="text-white font-mono">{savedData.highScore.toLocaleString()} pts</strong> ({Math.floor(savedData.maxAltitudeOverall)}m ALT)</span>
              </div>
              <span className="text-[11px] text-sky-400 font-mono">Resets at 00:00 UTC</span>
            </div>

            {isLoadingLeaderboard ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                <span>Loading daily cosmic rankings from Firestore...</span>
              </div>
            ) : leaderboardEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs gap-2 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                <Globe className="w-8 h-8 text-sky-400 opacity-60" />
                <span className="font-bold text-white">No scores submitted yet today!</span>
                <p className="text-slate-400">Be the very first space explorer to claim the #1 rank!</p>
              </div>
            ) : (
              leaderboardEntries.map((entry, index) => {
                const rank = index + 1;
                const isTop1 = rank === 1;
                const isTop2 = rank === 2;
                const isTop3 = rank === 3;
                const isCurrentUser = currentUser?.uid === entry.userId;

                return (
                  <div
                    key={entry.userId || index}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                      isCurrentUser
                        ? 'bg-sky-950/40 border-sky-500/60 shadow-md shadow-sky-500/10'
                        : isTop1
                        ? 'bg-amber-950/30 border-amber-400/60'
                        : isTop2
                        ? 'bg-slate-800/70 border-slate-400/50'
                        : isTop3
                        ? 'bg-amber-950/20 border-amber-600/40'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Medal / Badge */}
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                        {isTop1 ? (
                          <div className="w-full h-full rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/30">
                            👑
                          </div>
                        ) : isTop2 ? (
                          <div className="w-full h-full rounded-xl bg-slate-300 text-slate-950 flex items-center justify-center">
                            🥈
                          </div>
                        ) : isTop3 ? (
                          <div className="w-full h-full rounded-xl bg-amber-600 text-white flex items-center justify-center">
                            🥉
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">#{rank}</span>
                        )}
                      </div>

                      {/* User details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white truncate">
                            {entry.displayName}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>{entry.maxAltitude}m ALT</span>
                          <span>•</span>
                          <span>{entry.planetsVisited} Planets</span>
                        </div>
                      </div>
                    </div>

                    {/* Score Value */}
                    <div className="text-right shrink-0">
                      <span className="text-base font-black font-mono text-amber-300">
                        {entry.score.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                        Points
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

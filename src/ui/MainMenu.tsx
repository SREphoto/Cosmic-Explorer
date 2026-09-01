import React, { useState, useEffect } from 'react';
import {
  Play,
  ShoppingBag,
  Zap,
  Target,
  FileText,
  User,
  Star,
  Gem,
  Trophy,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Compass,
  Swords,
  LogIn,
  Award
} from 'lucide-react';
import { UserSavedData } from '../types/game';
import { ACHIEVEMENTS, CHECKPOINT_PLANETS, SECTOR_MILITARY_MEDALS } from '../core/Config';
import { CosmicEventSystem } from '../systems/CosmicEventSystem';
import { DailyChallengeSystem } from '../systems/DailyChallengeSystem';
import { audioEngine } from '../core/AudioEngine';
import { FirebaseService, type AppUser } from '../core/firebase';
import heroArtworkUrl from '../assets/images/little_galaxy_hero_1786680040346.jpg';
import mainBgUrl from '../assets/images/main_menu_cosmic_bg_1786730822424.jpg';
import btnHangarUrl from '../assets/images/button_bg_hangar_1786730840997.jpg';
import btnUpgradesUrl from '../assets/images/button_bg_upgrades_1786730854147.jpg';
import btnBadgesUrl from '../assets/images/button_bg_badges_1786730869125.jpg';
import btnQuestsUrl from '../assets/images/button_bg_quests_1786730883413.jpg';
import leoIconUrl from '../assets/images/little_galaxy_icon_1786680049991.jpg';
import { PLANET_SPRITES, BIOME_SPRITES } from '../core/SpriteAtlas';
import { ItemSprite } from '../components/ItemSprite';

interface MainMenuProps {
  savedData: UserSavedData;
  onStartGame: () => void;
  onOpenMultiplayer: () => void;
  onOpenHomePlanet: () => void;
  onOpenWardrobe: () => void;
  onOpenUpgrades: () => void;
  onOpenQuests: () => void;
  onOpenAchievements: () => void;
  onOpenMedalChest: () => void;
  onOpenLogin: () => void;
  onOpenDocs: () => void;
  onOpenTutorial: () => void;
  onOpenMap: () => void;
  onToggleAudio: () => void;
  onClaimDailyChallenge: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  savedData,
  onStartGame,
  onOpenMultiplayer,
  onOpenHomePlanet,
  onOpenWardrobe,
  onOpenUpgrades,
  onOpenQuests,
  onOpenAchievements,
  onOpenMedalChest,
  onOpenLogin,
  onOpenDocs,
  onOpenTutorial,
  onOpenMap,
  onToggleAudio,
  onClaimDailyChallenge
}) => {
  const [timeLeft, setTimeLeft] = useState<string>(DailyChallengeSystem.getTimeUntilNextReset());
  const [user, setUser] = useState<AppUser>(() => FirebaseService.getCurrentUser());

  useEffect(() => {
    const unsub = FirebaseService.onAuthChange((u) => setUser(u ?? FirebaseService.getCurrentUser()));
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(DailyChallengeSystem.getTimeUntilNextReset());
    }, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const todayChallenge = DailyChallengeSystem.getTodaysChallenge();
  const dailyState = savedData.dailyChallengeState;
  const isToday = dailyState && dailyState.dateKey === todayChallenge.dateKey;
  const dailyProgress = isToday ? dailyState.progress : 0;
  const isDailyCompleted = dailyProgress >= todayChallenge.target;
  const isDailyClaimed = isToday && dailyState.claimed;
  const activeEvent = CosmicEventSystem.getActiveEvent();
  const dailyProgressPercent = Math.min(100, Math.floor((dailyProgress / todayChallenge.target) * 100));

  // Current start checkpoint info
  const selectedCp = CHECKPOINT_PLANETS.find(
    (c) => c.id === (savedData.selectedStartCheckpointId || 'CHECKPOINT_EARTH')
  ) || CHECKPOINT_PLANETS[0];

  // Achievements Summary
  const claimedAchievements = savedData.claimedAchievementIds || [];
  const claimableCount = ACHIEVEMENTS.filter((ach) => {
    if (claimedAchievements.includes(ach.id)) return false;
    let val = 0;
    if (ach.id.startsWith('STARS')) val = savedData.totalStarsAllTime || savedData.totalStars || 0;
    else if (ach.id.startsWith('DIAMONDS')) val = savedData.totalDiamondsAllTime || savedData.totalDiamonds || 0;
    else if (ach.id.startsWith('PLANETS')) val = savedData.totalPlanetsAllTime || 0;
    else if (ach.id.startsWith('JUMPS')) val = savedData.maxConsecutiveJumpsRecord || 0;
    else if (ach.id.startsWith('ALTITUDE')) val = savedData.maxAltitudeOverall || 0;
    else if (ach.id === 'ORBIT_1') val = savedData.totalFullOrbitsAllTime || 0;
    else if (ach.id === 'SUN_1') val = savedData.totalSunsAllTime || 0;
    else if (ach.id === 'WARDROBE_1') val = savedData.unlockedCostumes.length || 1;
    return val >= ach.target;
  }).length;

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-5 select-none text-white ui-interactive overflow-y-auto bg-slate-950">
      {/* Animated Cosmic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40 mix-blend-screen">
        <img src={mainBgUrl} alt="" className="w-full h-[150%] object-cover object-center animate-pan-y" />
      </div>
      <div className="absolute inset-0 z-0 bg-slate-950/40 backdrop-blur-sm pointer-events-none"></div>

      <div className="z-10 flex flex-col justify-between h-full w-full">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center w-full max-w-md mx-auto">
        {/* Currencies */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300 flex items-center gap-1.5 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{savedData.totalStars.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold text-sky-300 flex items-center gap-1.5 shadow-sm">
            <Gem className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
            <span>{savedData.totalDiamonds.toLocaleString()}</span>
          </div>
        </div>

        {/* Header Action Buttons & Auth Pill */}
        <div className="flex items-center gap-2">
          {/* User Account / Cloud Sync Pill */}
          <button
            onClick={() => {
              audioEngine.playMenuClick();
              onOpenLogin();
            }}
            className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              user && !user.isLocalGuest
                ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-200 hover:border-indigo-400'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={user && !user.isLocalGuest
              ? `Signed in as ${user.displayName || 'Explorer'}`
              : 'Playing as guest — progress saves on this device. Click to sign in.'}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-4 h-4 rounded-full" />
            ) : (
              <User className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className="hidden sm:inline">{user && !user.isLocalGuest ? (user.displayName?.split(' ')[0] || 'Pilot') : 'Guest'}</span>
          </button>

          {/* Ribbons / Uniform Medal Chest Quick Pill */}
          <button
            onClick={() => {
              audioEngine.playMenuClick();
              onOpenMedalChest();
            }}
            className="bg-amber-950/70 hover:bg-amber-900/80 px-2.5 py-1 rounded-full border border-amber-500/40 text-xs font-bold text-amber-300 transition-all flex items-center gap-1 shadow-sm"
            title="Military Commendation Ribbons & Flight Chest Perks"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Medals ({(savedData.unlockedMedalIds || []).length})</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              onOpenTutorial();
            }}
            className="bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all duration-200 shadow-sm flex items-center gap-1.5 btn-grow-sm glow-subtle-hover"
            title="How to Play Tutorial"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Guide</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playMenuClick();
              onOpenDocs();
            }}
            className="bg-slate-900/90 hover:bg-slate-800 p-2 rounded-full border border-slate-800 transition-all duration-200 shadow-sm text-slate-400 hover:text-white btn-grow-sm glow-subtle-hover"
            title="Settings & Nexus"
          >
            <FileText className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Main Center Area */}
      <div className="flex flex-col items-center my-auto text-center space-y-3.5 max-w-md mx-auto w-full py-2">
                {/* Title and Subtitle */}
        <div className="pt-0.5 w-full">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-200 drop-shadow-md pb-1 text-center animate-title-breathe">
            COSMIC EXPLORER
          </h1>
        </div>

        {/* Clean Hero Artwork Card without cluttered text overlays */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800 shadow-xl shadow-slate-950/50 bg-slate-900 group">
          <img
            src={heroArtworkUrl}
            alt="Cosmic Explorer Hero"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 flex items-center gap-2.5 shadow-lg">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-500/30">
              <img src={leoIconUrl} alt="Leo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded w-max mb-0.5">Cosmic Jumper</span>
              <span className="text-xs font-bold text-white leading-none">Little Astronaut Leo</span>
            </div>
          </div>
        </div>



        {/* Daily Cosmic Challenge Card */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 text-left shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Challenge</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{timeLeft}</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-slate-100">{todayChallenge.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{todayChallenge.description}</p>
            </div>
            {/* Reward Badges */}
            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
              <span className="text-[11px] font-semibold text-amber-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />+{todayChallenge.rewardStars}
              </span>
              <span className="text-[11px] font-semibold text-sky-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60 flex items-center gap-1">
                <Gem className="w-3 h-3 fill-sky-400 text-sky-400" />+{todayChallenge.rewardDiamonds}
              </span>
            </div>
          </div>

          {/* Progress Bar & Claim Button */}
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                <span>Progress</span>
                <span>
                  {dailyProgress} / {todayChallenge.target} ({dailyProgressPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800/80">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isDailyClaimed
                      ? 'bg-emerald-400'
                      : isDailyCompleted
                      ? 'bg-amber-400'
                      : 'bg-sky-400'
                  }`}
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
            </div>

            {isDailyCompleted && !isDailyClaimed ? (
              <button
                onClick={() => {
                  audioEngine.playPowerUpCollect();
                  onClaimDailyChallenge();
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-md transition-all duration-200 flex items-center gap-1 shrink-0 btn-grow glow-amber-hover"
              >
                <Sparkles className="w-3 h-3" /> Claim
              </button>
            ) : isDailyClaimed ? (
              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
              </span>
            ) : null}
          </div>
        </div>

        {/* Checkpoint Sector Pill & Home Sanctuary Base */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          <button
            onClick={() => {
              audioEngine.playMenuClick();
              onOpenMap();
            }}
            className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-3 py-2.5 rounded-2xl text-left flex items-center justify-between shadow-sm transition-all duration-200 btn-grow-sm glow-subtle-hover group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-sky-500/40 shrink-0 bg-slate-950">
                <ItemSprite src={PLANET_SPRITES[selectedCp.planetType]} className="w-8 h-8 object-cover" alt="" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] uppercase font-semibold text-slate-400 tracking-wider block">
                  Sector Checkpoint
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {selectedCp.name}
                </p>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 group-hover:text-white text-[11px] font-medium border border-slate-700/60 flex items-center gap-1 transition shrink-0">
              <Compass className="w-3 h-3 text-sky-400" />
              <span>Map</span>
            </div>
          </button>

          <button
            onClick={() => {
              audioEngine.playMenuClick();
              onOpenHomePlanet();
            }}
            className="bg-slate-900/80 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/50 px-3 py-2.5 rounded-2xl text-left flex items-center justify-between shadow-sm transition-all duration-200 btn-grow-sm glow-emerald-hover group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/40 shrink-0 bg-slate-950">
                <ItemSprite
                  src={BIOME_SPRITES[savedData.homePlanet?.biomeId || 'VERDANT']}
                  className="w-8 h-8 object-cover"
                  alt=""
                />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] uppercase font-semibold text-emerald-400 tracking-wider block">
                  Sovereign Base
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {savedData.homePlanet?.name || 'Sanctuary Prime'}
                </p>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1 transition shrink-0">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Base</span>
            </div>
          </button>
        </div>

        {/* Expanded Cosmic Stats Dashboard */}
        <div className="w-full bg-slate-900/70 border border-slate-700/60 rounded-2xl p-2.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2 px-1">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
               <Compass className="w-3 h-3 text-sky-400"/> Explorer Log
             </span>
             {savedData.highScore > 0 && (
               <div className="bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded shadow-inner text-[10px] text-amber-300 font-bold flex items-center gap-1">
                 <Trophy className="w-3 h-3"/> RECORD: {savedData.highScore.toLocaleString()}
               </div>
             )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/50 rounded-xl py-1.5 px-1 border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Planets</span>
              <span className="text-xs sm:text-sm font-black text-emerald-400">{savedData.totalPlanetsAllTime.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/50 rounded-xl py-1.5 px-1 border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Distance</span>
              <span className="text-xs sm:text-sm font-black text-rose-400">{savedData.maxAltitudeOverall.toLocaleString()}m</span>
            </div>
            <div className="bg-slate-950/50 rounded-xl py-1.5 px-1 border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Max Combo</span>
              <span className="text-xs sm:text-sm font-black text-sky-400">{savedData.maxConsecutiveJumpsRecord.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Solo Launch & 1v1 Multiplayer Arena */}
        <div className="w-full flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              audioEngine.playPowerUpCollect();
              onStartGame();
            }}
            className="relative overflow-hidden flex-1 bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 hover:from-sky-400 hover:via-emerald-400 hover:to-amber-400 text-slate-950 font-black text-base py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(56,189,248,0.4)] flex items-center justify-center gap-2 btn-grow hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-12 -translate-x-full hover:animate-[shimmer_1.5s_infinite]" />
            <Play className="w-5 h-5 fill-current animate-pulse" />
            <span className="tracking-wider uppercase text-shadow-sm">Solo Voyage</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playPowerUpCollect();
              onOpenMultiplayer();
            }}
            className="relative overflow-hidden flex-1 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-black text-base py-3.5 px-4 rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 btn-grow hover:scale-[1.02] border border-indigo-400/40"
          >
            <Swords className="w-5 h-5 text-amber-300" />
            <span className="tracking-wider uppercase text-shadow-sm">1v1 Arena</span>
          </button>
        </div>
      </div>

      {/* Bottom Menu Navigation Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-w-lg mx-auto w-full pt-1">

        <button
          onClick={() => { audioEngine.playMenuClick(); onOpenWardrobe(); }}
          className="relative overflow-hidden group border-2 border-slate-700 hover:border-sky-400 py-3.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-lg shadow-slate-950/50 btn-grow"
        >
          <div className="absolute inset-0 z-0">
            <img src={btnHangarUrl} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <ShoppingBag className="w-5 h-5 text-sky-300 drop-shadow-md" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Hangar</span>
          </div>
        </button>

        <button
          onClick={() => { audioEngine.playMenuClick(); onOpenUpgrades(); }}
          className="relative overflow-hidden group border-2 border-slate-700 hover:border-amber-400 py-3.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-lg shadow-slate-950/50 btn-grow"
        >
          <div className="absolute inset-0 z-0">
            <img src={btnUpgradesUrl} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <Zap className="w-5 h-5 text-amber-300 drop-shadow-md" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Tech</span>
          </div>
        </button>

        <button
          onClick={() => { audioEngine.playMenuClick(); onOpenMedalChest(); }}
          className="relative overflow-hidden group border-2 border-slate-700 hover:border-amber-400 py-3.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-lg shadow-slate-950/50 btn-grow"
        >
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-amber-950/60 to-slate-900/80" />
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <Award className="w-5 h-5 text-amber-400 drop-shadow-md" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Medals</span>
            {(savedData.unlockedMedalIds || []).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg border border-slate-900">
                {(savedData.unlockedMedalIds || []).length}
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => { audioEngine.playMenuClick(); onOpenAchievements(); }}
          className="relative overflow-hidden group border-2 border-slate-700 hover:border-yellow-400 py-3.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-lg shadow-slate-950/50 btn-grow"
        >
          <div className="absolute inset-0 z-0">
            <img src={btnBadgesUrl} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <Trophy className="w-5 h-5 text-yellow-300 drop-shadow-md" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Badges</span>
            {claimableCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg border border-slate-900">
                {claimableCount}
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => { audioEngine.playMenuClick(); onOpenQuests(); }}
          className="relative overflow-hidden group border-2 border-slate-700 hover:border-emerald-400 py-3.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white transition-all duration-300 shadow-lg shadow-slate-950/50 btn-grow col-span-2 sm:col-span-1"
        >
          <div className="absolute inset-0 z-0">
            <img src={btnQuestsUrl} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <Target className="w-5 h-5 text-emerald-300 drop-shadow-md" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Quests</span>
          </div>
        </button>

      </div>
      </div>
    </div>
  );
};

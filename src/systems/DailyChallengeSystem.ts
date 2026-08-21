import { DailyChallenge, DailyChallengeState, DailyMission, ObjectiveType, PlayerStats, UserSavedData } from '../types/game';
import { StorageManager } from '../core/Storage';

const DAILY_TEMPLATES: {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: ObjectiveType;
  baseTarget: number;
  stars: number;
  diamonds: number;
}[] = [
  {
    id: 'DAILY_HOPS',
    title: 'Cosmic Hopper',
    description: 'Land safely on {target} different planets during a single voyage',
    icon: '🪐',
    type: 'FULL_ROTATIONS',
    baseTarget: 12,
    stars: 300,
    diamonds: 10
  },
  {
    id: 'DAILY_STARS',
    title: 'Starlight Torrent',
    description: 'Gather {target} Cosmic Stars in a single voyage',
    icon: '⭐',
    type: 'COLLECT_STARS_SINGLE_RUN',
    baseTarget: 80,
    stars: 350,
    diamonds: 12
  },
  {
    id: 'DAILY_PERFECT',
    title: 'Perfect Alignment',
    description: 'Execute {target} Consecutive Perfect Jumps without breaking the chain',
    icon: '🎯',
    type: 'CONSECUTIVE_PERFECT_JUMPS',
    baseTarget: 4,
    stars: 400,
    diamonds: 15
  },
  {
    id: 'DAILY_SUNS',
    title: 'Solar Kissed',
    description: 'Land safely on {target} blazing Sun stars in a single voyage',
    icon: '☀️',
    type: 'LAND_ON_SUNS',
    baseTarget: 2,
    stars: 450,
    diamonds: 18
  },
  {
    id: 'DAILY_ALTITUDE',
    title: 'Into the Stratosphere',
    description: 'Ascend to an altitude of {target}m above the void',
    icon: '🚀',
    type: 'REACH_ALTITUDE',
    baseTarget: 3000,
    stars: 350,
    diamonds: 12
  },
  {
    id: 'DAILY_DIAMONDS',
    title: 'Diamond Seeker',
    description: 'Collect {target} rare Space Diamonds in a single voyage',
    icon: '💎',
    type: 'COLLECT_DIAMONDS_SINGLE_RUN',
    baseTarget: 3,
    stars: 400,
    diamonds: 20
  },
  {
    id: 'DAILY_POWERUPS',
    title: 'Cosmic Overcharge',
    description: 'Collect and trigger {target} Power-Ups (Magnets or Comets)',
    icon: '⚡',
    type: 'USE_POWERUPS',
    baseTarget: 3,
    stars: 350,
    diamonds: 15
  },
  {
    id: 'DAILY_ORBITS',
    title: 'Ring Dancer',
    description: 'Complete {target} full 360° orbits in a single voyage',
    icon: '🔄',
    type: 'FULL_ROTATIONS',
    baseTarget: 6,
    stars: 380,
    diamonds: 14
  },
  {
    id: 'DAILY_VOID_RUN',
    title: 'Darkness Outrunner',
    description: 'Reach {target}m while staying ahead of the climbing void',
    icon: '🌑',
    type: 'REACH_ALTITUDE',
    baseTarget: 5000,
    stars: 420,
    diamonds: 16
  },
  {
    id: 'DAILY_DIAMOND_STORM',
    title: 'Prism Rain',
    description: 'Collect {target} Space Diamonds before the void closes in',
    icon: '💠',
    type: 'COLLECT_DIAMONDS_SINGLE_RUN',
    baseTarget: 5,
    stars: 480,
    diamonds: 22
  },
  {
    id: 'DAILY_COMBO',
    title: 'Perfect Cascade',
    description: 'Chain {target} Consecutive Perfect Jumps in one flight',
    icon: '✨',
    type: 'CONSECUTIVE_PERFECT_JUMPS',
    baseTarget: 7,
    stars: 520,
    diamonds: 20
  }
];

export interface MissionTemplateDef {
  key: string;
  title: string;
  template: string;
  icon: string;
  category: 'JUMP' | 'COLLECT' | 'EXPLORE' | 'SPECIAL';
  baseTarget: number;
  multiplier: number;
  rewardStarDust: number;
  rewardStars: number;
  rewardDiamonds?: number;
  evaluate: (stats: PlayerStats, target: number) => number;
}

const MISSION_POOL: MissionTemplateDef[] = [
  {
    key: 'HOPS_SINGLE_RUN',
    title: 'Planet Voyager',
    template: 'Touchdown on {n} orbital bodies in a single voyage',
    icon: '🪐',
    category: 'EXPLORE',
    baseTarget: 14,
    multiplier: 1,
    rewardStarDust: 120,
    rewardStars: 280,
    evaluate: (s) => s.planetsLandedCount
  },
  {
    key: 'PERFECT_STREAK',
    title: 'Kinetic Harmonic',
    template: 'Execute a streak of {n} Perfect Jumps in a single flight',
    icon: '🎯',
    category: 'JUMP',
    baseTarget: 5,
    multiplier: 1,
    rewardStarDust: 160,
    rewardStars: 350,
    rewardDiamonds: 5,
    evaluate: (s) => s.maxConsecutiveJumps
  },
  {
    key: 'STAR_HARVEST',
    title: 'Celestial Dredger',
    template: 'Harvest {n} glowing Cosmic Stars during one voyage',
    icon: '⭐',
    category: 'COLLECT',
    baseTarget: 90,
    multiplier: 1,
    rewardStarDust: 140,
    rewardStars: 300,
    evaluate: (s) => s.starsCollected
  },
  {
    key: 'ALTITUDE_APEX',
    title: 'Deep Zenith',
    template: 'Ascend beyond {n}m into the celestial expanse',
    icon: '🚀',
    category: 'EXPLORE',
    baseTarget: 3500,
    multiplier: 100,
    rewardStarDust: 150,
    rewardStars: 320,
    rewardDiamonds: 6,
    evaluate: (s) => s.maxAltitude
  },
  {
    key: 'DIAMOND_RUSH',
    title: 'Crystalline Bounty',
    template: 'Collect {n} pristine Space Diamonds during a flight',
    icon: '💎',
    category: 'COLLECT',
    baseTarget: 3,
    multiplier: 1,
    rewardStarDust: 180,
    rewardStars: 400,
    rewardDiamonds: 12,
    evaluate: (s) => s.diamondsCollected
  },
  {
    key: 'SOLAR_DIVE',
    title: 'Corona Conqueror',
    template: 'Graze or land safely on {n} molten Star Suns',
    icon: '☀️',
    category: 'SPECIAL',
    baseTarget: 2,
    multiplier: 1,
    rewardStarDust: 200,
    rewardStars: 450,
    rewardDiamonds: 10,
    evaluate: (s) => s.sunsLandedCount
  },
  {
    key: 'POWERUP_MASTERY',
    title: 'Overcharge Dynamo',
    template: 'Trigger {n} powerups (Stardust Magnet or Super Comet)',
    icon: '⚡',
    category: 'SPECIAL',
    baseTarget: 3,
    multiplier: 1,
    rewardStarDust: 130,
    rewardStars: 260,
    evaluate: (s) => s.powerUpsUsedCount
  },
  {
    key: 'SPEED_SURGE',
    title: 'Comet Chaser',
    template: 'Maintain intense super-orbital velocity and leap {n} times',
    icon: '☄️',
    category: 'JUMP',
    baseTarget: 8,
    multiplier: 1,
    rewardStarDust: 145,
    rewardStars: 310,
    evaluate: (s) => s.perfectJumpsCount ?? 0
  },
  {
    key: 'ORBIT_RING',
    title: 'Full Circle',
    template: 'Complete {n} full planetary orbits in one voyage',
    icon: '🔄',
    category: 'JUMP',
    baseTarget: 5,
    multiplier: 1,
    rewardStarDust: 170,
    rewardStars: 360,
    rewardDiamonds: 8,
    evaluate: (s) => s.fullOrbitsCompleted
  },
  {
    key: 'VOID_OUTRUN',
    title: 'Abyss Outrunner',
    template: 'Stay ahead of the darkness and climb beyond {n}m',
    icon: '🌑',
    category: 'EXPLORE',
    baseTarget: 4500,
    multiplier: 100,
    rewardStarDust: 180,
    rewardStars: 380,
    rewardDiamonds: 8,
    evaluate: (s) => s.maxAltitude
  },
  {
    key: 'PLANET_HOPPER',
    title: 'World Hopper',
    template: 'Land on {n} unique worlds before the void claims you',
    icon: '🌍',
    category: 'EXPLORE',
    baseTarget: 20,
    multiplier: 1,
    rewardStarDust: 160,
    rewardStars: 340,
    evaluate: (s) => s.planetsLandedCount
  },
  {
    key: 'SUN_BELT',
    title: 'Solar Belt',
    template: 'Kiss {n} suns in a single voyage',
    icon: '🌞',
    category: 'SPECIAL',
    baseTarget: 3,
    multiplier: 1,
    rewardStarDust: 220,
    rewardStars: 500,
    rewardDiamonds: 12,
    evaluate: (s) => s.sunsLandedCount
  }
];

export class DailyChallengeSystem {
  public static getTodayDateKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ==========================================
  // PROCEDURAL 3 DAILY MISSIONS
  // ==========================================
  public static getDailyMissions(savedData: UserSavedData): DailyMission[] {
    const todayKey = this.getTodayDateKey();

    // Check if valid daily missions exist in save
    if (savedData.dailyMissions && savedData.dailyMissions.dateKey === todayKey && savedData.dailyMissions.missions.length >= 4) {
      return savedData.dailyMissions.missions;
    }

    // Procedurally generate 4 deterministic missions for today
    let seed = 0;
    for (let i = 0; i < todayKey.length; i++) {
      seed = (seed * 37 + todayKey.charCodeAt(i)) >>> 0;
    }

    const shuffled = [...MISSION_POOL];
    for (let i = shuffled.length - 1; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, 4);
    const newMissions: DailyMission[] = selected.map((mDef, index) => {
      // Calculate target
      const target = mDef.baseTarget;
      const description = mDef.template.replace('{n}', target.toLocaleString());

      return {
        id: `${mDef.key}_${todayKey}_${index}`,
        title: mDef.title,
        description,
        icon: mDef.icon,
        category: mDef.category,
        target,
        progress: 0,
        completed: false,
        claimed: false,
        rewardStarDust: mDef.rewardStarDust,
        rewardStars: mDef.rewardStars,
        rewardDiamonds: mDef.rewardDiamonds ?? 0
      };
    });

    // Save into storage
    StorageManager.saveData({
      dailyMissions: {
        dateKey: todayKey,
        missions: newMissions
      }
    });

    return newMissions;
  }

  public static updateMissionsProgress(
    savedData: UserSavedData,
    stats: PlayerStats
  ): { updatedMissions: DailyMission[]; newlyCompletedCount: number } {
    const currentMissions = this.getDailyMissions(savedData);
    let newlyCompletedCount = 0;

    const updatedMissions = currentMissions.map((mission) => {
      if (mission.completed) return mission;

      // Match template def to evaluate
      const prefix = mission.id.split('_')[0];
      const mDef = MISSION_POOL.find((m) => m.key.startsWith(prefix)) || MISSION_POOL[0];
      const progressInRun = mDef.evaluate(stats, mission.target);

      const newProgress = Math.max(mission.progress, progressInRun);
      const completed = newProgress >= mission.target;

      if (completed && !mission.completed) {
        newlyCompletedCount++;
      }

      return {
        ...mission,
        progress: newProgress,
        completed
      };
    });

    StorageManager.saveData({
      dailyMissions: {
        dateKey: this.getTodayDateKey(),
        missions: updatedMissions
      }
    });

    return { updatedMissions, newlyCompletedCount };
  }

  public static claimMission(
    savedData: UserSavedData,
    missionId: string
  ): { claimed: boolean; updatedData: UserSavedData; reward?: { starDust: number; stars: number; diamonds: number } } {
    const missions = this.getDailyMissions(savedData);
    const targetMission = missions.find((m) => m.id === missionId);

    if (!targetMission || !targetMission.completed || targetMission.claimed) {
      return { claimed: false, updatedData: savedData };
    }

    const updatedMissions = missions.map((m) => (m.id === missionId ? { ...m, claimed: true } : m));

    const starDustGained = targetMission.rewardStarDust || 100;
    const starsGained = targetMission.rewardStars || 200;
    const diamondsGained = targetMission.rewardDiamonds || 0;

    const updatedData = StorageManager.saveData({
      totalStarDust: (savedData.totalStarDust || 0) + starDustGained,
      totalStars: savedData.totalStars + starsGained,
      totalDiamonds: savedData.totalDiamonds + diamondsGained,
      dailyMissions: {
        dateKey: this.getTodayDateKey(),
        missions: updatedMissions
      }
    });

    return {
      claimed: true,
      updatedData,
      reward: { starDust: starDustGained, stars: starsGained, diamonds: diamondsGained }
    };
  }

  public static claimAllMissions(
    savedData: UserSavedData
  ): { claimedCount: number; updatedData: UserSavedData; totalGained: { starDust: number; stars: number; diamonds: number } } {
    const missions = this.getDailyMissions(savedData);
    let starDust = 0;
    let stars = 0;
    let diamonds = 0;
    let count = 0;

    const updatedMissions = missions.map((m) => {
      if (m.completed && !m.claimed) {
        count++;
        starDust += m.rewardStarDust || 100;
        stars += m.rewardStars || 200;
        diamonds += m.rewardDiamonds || 0;
        return { ...m, claimed: true };
      }
      return m;
    });

    if (count === 0) {
      return { claimedCount: 0, updatedData: savedData, totalGained: { starDust: 0, stars: 0, diamonds: 0 } };
    }

    const updatedData = StorageManager.saveData({
      totalStarDust: (savedData.totalStarDust || 0) + starDust,
      totalStars: savedData.totalStars + stars,
      totalDiamonds: savedData.totalDiamonds + diamonds,
      dailyMissions: {
        dateKey: this.getTodayDateKey(),
        missions: updatedMissions
      }
    });

    return {
      claimedCount: count,
      updatedData,
      totalGained: { starDust, stars, diamonds }
    };
  }

  // ==========================================
  // SINGLE LEGACY DAILY CHALLENGE SUPPORT
  // ==========================================
  public static getTodaysChallenge(): DailyChallenge {
    const dateKey = this.getTodayDateKey();
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
    }

    const templateIndex = hash % DAILY_TEMPLATES.length;
    const template = DAILY_TEMPLATES[templateIndex];
    const targetCount = template.baseTarget;
    const description = template.description.replace('{target}', targetCount.toLocaleString());

    return {
      dateKey,
      id: `${template.id}_${dateKey}`,
      title: template.title,
      description,
      icon: template.icon,
      type: template.type,
      target: targetCount,
      targetCount,
      rewardStars: template.stars,
      rewardDiamonds: template.diamonds
    };
  }

  public static getDailyChallengeState(savedData: UserSavedData): DailyChallengeState {
    const todayKey = this.getTodayDateKey();
    if (savedData.dailyChallengeState && savedData.dailyChallengeState.dateKey === todayKey) {
      return savedData.dailyChallengeState;
    }
    return {
      dateKey: todayKey,
      progress: 0,
      completed: false,
      claimed: false
    };
  }

  public static claimDailyReward(savedData: UserSavedData): { claimed: boolean; updatedData: UserSavedData } {
    const challenge = this.getTodaysChallenge();
    const currentState = this.getDailyChallengeState(savedData);

    if (currentState.progress >= challenge.target && !currentState.claimed) {
      const updatedState: DailyChallengeState = {
        ...currentState,
        completed: true,
        claimed: true
      };

      const updatedData = StorageManager.saveData({
        totalStars: savedData.totalStars + challenge.rewardStars,
        totalDiamonds: savedData.totalDiamonds + challenge.rewardDiamonds,
        dailyChallengeState: updatedState
      });

      return { claimed: true, updatedData };
    }

    return { claimed: false, updatedData: savedData };
  }

  public static updateProgressFromRun(savedData: UserSavedData, stats: PlayerStats): { updatedState: DailyChallengeState; isNewlyCompleted: boolean } {
    const challenge = this.getTodaysChallenge();
    const currentState = this.getDailyChallengeState(savedData);

    if (currentState.completed) {
      return { updatedState: currentState, isNewlyCompleted: false };
    }

    let achievedInRun = 0;
    switch (challenge.type) {
      case 'COLLECT_STARS_SINGLE_RUN':
        achievedInRun = stats.starsCollected;
        break;
      case 'COLLECT_DIAMONDS_SINGLE_RUN':
        achievedInRun = stats.diamondsCollected;
        break;
      case 'CONSECUTIVE_PERFECT_JUMPS':
        achievedInRun = stats.maxConsecutiveJumps;
        break;
      case 'LAND_ON_SUNS':
        achievedInRun = stats.sunsLandedCount;
        break;
      case 'REACH_ALTITUDE':
        achievedInRun = stats.maxAltitude;
        break;
      case 'USE_POWERUPS':
        achievedInRun = stats.powerUpsUsedCount;
        break;
      case 'FULL_ROTATIONS':
        achievedInRun = stats.planetsLandedCount;
        break;
      default:
        achievedInRun = stats.planetsLandedCount;
        break;
    }

    const newProgress = Math.max(currentState.progress, achievedInRun);
    const completed = newProgress >= challenge.targetCount;
    const isNewlyCompleted = completed && !currentState.completed;

    const updatedState: DailyChallengeState = {
      dateKey: challenge.dateKey,
      progress: newProgress,
      completed,
      claimed: currentState.claimed
    };

    return { updatedState, isNewlyCompleted };
  }

  public static getTimeUntilNextReset(): string {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diffMs = tomorrow.getTime() - now.getTime();

    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  }
}

import { UserSavedData, CostumeId, PowerUpUpgrades, EquippedGear, SkillTreeAllocations } from '../types/game';
import { FirebaseService, auth } from './firebase';

const STORAGE_KEY = 'LITTLE_GALAXY_SAVED_DATA_V1';

export const DEFAULT_SKILL_ALLOCATIONS: SkillTreeAllocations = {
  GRAVITY_AFFINITY: 0,
  ORBITAL_SLINGSHOT_MASTERY: 0,
  AIR_DRIFT_STEERING: 0,
  JETPACK_OVERDRIVE: 0,
  COMET_PROPULSION: 0,
  SUPERNOVA_MAGNET: 0,
  STAR_HARVESTER: 0,
  DIAMOND_TRANSMUTATION: 0,
  COSMIC_EXPEDITION_XP: 0,
  CHECKPOINT_FORTUNE: 0,
  CRYO_INSULATION: 0,
  STONE_WARD: 0,
  VOID_REPULSOR: 0,
  SOLAR_SHIELD: 0,
  PHOENIX_REBIRTH: 0,
  COMET_ECHO: 0,
  VOID_ANCHOR: 0,
  ABYSSAL_TETHER: 0,
  HARVEST_SURGE: 0,
  ORBITAL_FORTUNE: 0,
  GARDEN_ALCHEMY: 0,
  VOID_CARTOGRAPHY: 0
};

export const DEFAULT_EQUIPPED_GEAR: EquippedGear = {
  helmetId: 'HELMET_DEFAULT',
  suitId: 'SUIT_DEFAULT',
  thrusterId: 'THRUSTER_DEFAULT',
  relicId: 'RELIC_DEFAULT',
  accessoryId: 'GEAR_SCARF_RED'
};

export const DEFAULT_SAVE_DATA: UserSavedData = {
  highScore: 0,
  maxAltitudeOverall: 0,
  totalStars: 100, // Starter bonus stars
  totalDiamonds: 10, // Starter bonus diamonds
  totalStarDust: 200, // Starter cosmic star-dust
  totalStarsAllTime: 100,
  totalDiamondsAllTime: 10,
  totalStarDustAllTime: 200,
  totalPlanetsAllTime: 0,
  totalFullOrbitsAllTime: 0,
  totalSunsAllTime: 0,
  totalPowerUpsAllTime: 0,
  maxConsecutiveJumpsRecord: 0,
  currentStageIndex: 0,
  completedStageIds: [],
  unlockedCostumes: ['ASTRONAUT'],
  activeCostumeId: 'ASTRONAUT',
  unlockedRocketSkins: ['APOLLO'],
  activeRocketSkinId: 'APOLLO',
  upgrades: {
    magnetLevel: 1,
    cometLevel: 1,
    multiplierLevel: 1,
    jetpackLevel: 1,
    ricochetLevel: 1,
    rewindLevel: 1
  },
  claimedAchievementIds: [],
  unlockedCheckpointIds: ['CHECKPOINT_EARTH'],
  selectedStartCheckpointId: 'CHECKPOINT_EARTH',
  discoveredConstellationIds: ['ARIES'],
  discoveredPlanetTypes: ['GRASS', 'STANDARD', 'ASTEROID'],
  hasCompletedTutorial: false,
  soundEnabled: true,
  randomizeAesthetics: false,
  soundVolume: 1.0,
  musicVolume: 1.0,
  ambientVolume: 1.0,
  soundPack: 'ORCHESTRAL',
  hapticsEnabled: true,

  // RPG Progression & Skill Tree
  playerLevel: 1,
  playerXP: 0,
  skillPointsAvailable: 1,
  skillTreeAllocations: DEFAULT_SKILL_ALLOCATIONS,

  // RPG Gear & Equipment
  unlockedGearIds: ['HELMET_DEFAULT', 'SUIT_DEFAULT', 'THRUSTER_DEFAULT', 'RELIC_DEFAULT', 'GEAR_SCARF_RED'],
  equippedGear: DEFAULT_EQUIPPED_GEAR
};

export class StorageManager {
  public static loadData(): UserSavedData {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_SAVE_DATA };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged = { ...DEFAULT_SAVE_DATA, ...parsed };
        merged.skillTreeAllocations = {
          ...DEFAULT_SKILL_ALLOCATIONS,
          ...(parsed.skillTreeAllocations || {})
        };
        return merged;
      }
    } catch (e) {
      console.warn('Failed to load saved game state, using defaults', e);
    }
    return { ...DEFAULT_SAVE_DATA };
  }

  public static saveData(data: Partial<UserSavedData>): UserSavedData {
    const current = this.loadData();
    const updated = { ...current, ...data };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist game state to localStorage', e);
    }

    // Auto-sync to Firebase Firestore if user is authenticated
    const currentUser = auth.currentUser;
    if (currentUser) {
      FirebaseService.saveGameToCloud(currentUser.uid, updated).catch(err => {
        console.warn('Cloud sync error:', err);
      });
      FirebaseService.syncUserProfile(currentUser, updated).catch(() => {});
    }

    return updated;
  }

  public static overrideFromCloud(cloudData: UserSavedData): UserSavedData {
    const merged = { ...DEFAULT_SAVE_DATA, ...cloudData };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('Failed to save cloud data to localStorage', e);
    }
    return merged;
  }

  /**
   * System of what overrides what when logging in:
   * 1. Merges local and cloud progression metrics (takes highest highScore, maxAltitude, playerLevel, totalStars).
   * 2. Takes the UNION of all unlocked items (costumes, skins, gear, checkpoint planets, medals, completed levels).
   * 3. Syncs the combined authoritative state back to both local storage and Firestore.
   */
  public static mergeWithCloud(cloudData: Partial<UserSavedData>): UserSavedData {
    const local = this.loadData();
    const unionArray = <T>(a: T[] = [], b: T[] = []): T[] => Array.from(new Set([...a, ...b]));

    const merged: UserSavedData = {
      ...DEFAULT_SAVE_DATA,
      ...local,
      ...cloudData,
      highScore: Math.max(local.highScore || 0, cloudData.highScore || 0),
      maxAltitudeOverall: Math.max(local.maxAltitudeOverall || 0, cloudData.maxAltitudeOverall || 0),
      totalStars: Math.max(local.totalStars || 0, cloudData.totalStars || 0),
      totalDiamonds: Math.max(local.totalDiamonds || 0, cloudData.totalDiamonds || 0),
      totalStarDust: Math.max(local.totalStarDust || 0, cloudData.totalStarDust || 0),
      totalStarsAllTime: Math.max(local.totalStarsAllTime || 0, cloudData.totalStarsAllTime || 0),
      totalDiamondsAllTime: Math.max(local.totalDiamondsAllTime || 0, cloudData.totalDiamondsAllTime || 0),
      totalPlanetsAllTime: Math.max(local.totalPlanetsAllTime || 0, cloudData.totalPlanetsAllTime || 0),
      totalFullOrbitsAllTime: Math.max(local.totalFullOrbitsAllTime || 0, cloudData.totalFullOrbitsAllTime || 0),
      playerLevel: Math.max(local.playerLevel || 1, cloudData.playerLevel || 1),
      playerXP: Math.max(local.playerXP || 0, cloudData.playerXP || 0),
      skillPointsAvailable: Math.max(local.skillPointsAvailable || 0, cloudData.skillPointsAvailable || 0),
      
      // Union of unlocks
      unlockedCostumes: unionArray(local.unlockedCostumes, cloudData.unlockedCostumes),
      unlockedRocketSkins: unionArray(local.unlockedRocketSkins, cloudData.unlockedRocketSkins),
      unlockedGearIds: unionArray(local.unlockedGearIds, cloudData.unlockedGearIds),
      unlockedCheckpointIds: unionArray(local.unlockedCheckpointIds, cloudData.unlockedCheckpointIds),
      unlockedMedalIds: unionArray(local.unlockedMedalIds, cloudData.unlockedMedalIds),
      completedLevelNumbers: unionArray(local.completedLevelNumbers, cloudData.completedLevelNumbers),
      claimedAchievementIds: unionArray(local.claimedAchievementIds, cloudData.claimedAchievementIds),
      discoveredConstellationIds: unionArray(local.discoveredConstellationIds, cloudData.discoveredConstellationIds),
      discoveredPlanetTypes: unionArray(local.discoveredPlanetTypes, cloudData.discoveredPlanetTypes),
      
      // Upgrades: take max level of each
      upgrades: {
        magnetLevel: Math.max(local.upgrades?.magnetLevel || 1, cloudData.upgrades?.magnetLevel || 1),
        cometLevel: Math.max(local.upgrades?.cometLevel || 1, cloudData.upgrades?.cometLevel || 1),
        multiplierLevel: Math.max(local.upgrades?.multiplierLevel || 1, cloudData.upgrades?.multiplierLevel || 1),
        jetpackLevel: Math.max(local.upgrades?.jetpackLevel || 1, cloudData.upgrades?.jetpackLevel || 1),
        ricochetLevel: Math.max(local.upgrades?.ricochetLevel || 1, cloudData.upgrades?.ricochetLevel || 1),
        rewindLevel: Math.max(local.upgrades?.rewindLevel || 1, cloudData.upgrades?.rewindLevel || 1),
      },
      
      // Preferences: cloud overrides if present, otherwise local
      activeCostumeId: cloudData.activeCostumeId || local.activeCostumeId || 'ASTRONAUT',
      activeRocketSkinId: cloudData.activeRocketSkinId || local.activeRocketSkinId || 'APOLLO',
      equippedGear: cloudData.equippedGear || local.equippedGear || DEFAULT_EQUIPPED_GEAR,
      skillTreeAllocations: {
        ...DEFAULT_SKILL_ALLOCATIONS,
        ...(cloudData.skillTreeAllocations || local.skillTreeAllocations || {})
      },
      activeUniformMedals: unionArray(local.activeUniformMedals, cloudData.activeUniformMedals)
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('Failed to save merged data to localStorage', e);
    }

    return merged;
  }

  public static clearData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear game state from localStorage', e);
    }
  }

  public static resetProgress(): UserSavedData {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear storage key', e);
    }
    return DEFAULT_SAVE_DATA;
  }
}

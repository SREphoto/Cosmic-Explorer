export type GameMode = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface Vector2D {
  x: number;
  y: number;
}

export type ZodiacElement = 'FIRE' | 'EARTH' | 'AIR' | 'WATER' | 'AETHER' | 'COSMIC';

export type ConstellationId = 
  | 'URSA_MAJOR'
  | 'ORION'
  | 'CASSIOPEIA'
  | 'CYGNUS'
  | 'PEGASUS'
  | 'ANDROMEDA'
  | 'LYRA'
  | 'PHOENIX'
  | 'CENTAURUS'
  | 'DRACO'
  | 'AQUILA'
  | 'PERSEUS'
  | 'ARIES'
  | 'TAURUS'
  | 'GEMINI'
  | 'CANCER'
  | 'LEO'
  | 'VIRGO'
  | 'LIBRA'
  | 'SCORPIO'
  | 'SAGITTARIUS'
  | 'CAPRICORN'
  | 'AQUARIUS'
  | 'PISCES';

export type ZodiacSignId = ConstellationId;

export interface ConstellationStar {
  x: number; // 0..1 normalized in bounding box
  y: number; // 0..1 normalized in bounding box
  brightness: number; // 0.5..1.5
  size: number; // radius px
  name?: string;
  isMain?: boolean;
}

export interface ConstellationData {
  id: ConstellationId;
  name: string;
  latinName: string;
  element: ZodiacElement;
  elementIcon?: string;
  elementName: string;
  elementColor: string;
  elementSecondaryColor: string;
  elementAuraColor: string;
  minPlanetIndex: number;
  maxPlanetIndex: number;
  stars: ConstellationStar[];
  lines: [number, number][]; // star index pairs
  description: string;
  elementalBuff: string;
  featuredPlanetTypes: PlanetType[];
  bgGradient: [string, string, string];
  nebulaColors: string[];
  starColors: string[];
  glyph?: string; // legacy optional
}

export type SpaceAnomalyType = 
  | 'ASTEROID_SHOWER'
  | 'GRAVITY_SURGE'
  | 'STARLIGHT_SHOWER'
  | 'DARK_MATTER_PULSE'
  | 'SOLAR_FLARE_STORM'
  | 'MAGNETIC_SINGULARITY';

export interface SpaceAnomalyData {
  type: SpaceAnomalyType;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  color: string;
  glowColor: string;
  duration: number; // seconds
  gravityMultiplier?: number;
  starMultiplier?: number;
  magnetBonus?: number;
  speedBoost?: number;
  voidSlowRatio?: number;
}

export interface ActiveSpaceAnomaly {
  data: SpaceAnomalyData;
  durationRemaining: number;
  totalDuration: number;
  activeHazards?: {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    rotation: number;
    rotSpeed: number;
    color: string;
    trailColor: string;
  }[];
}

export type PlanetType = 
  | 'GRASS' 
  | 'ASTEROID' 
  | 'MECH' 
  | 'PLASMA' 
  | 'SUN' 
  | 'STANDARD' 
  | 'ICE' 
  | 'MAGMA'
  | 'CRYSTAL'
  | 'DARK'
  | 'NEON'
  | 'CELESTIAL_SANCTUARY'
  | 'ANTIMATTER'
  | 'RINGED_GIANT'
  | 'OCEAN'
  | 'DESERT'
  | 'JUNGLE'
  | 'STORM'
  | 'TOXIC'
  | 'MOON'
  | 'AURORA'
  | 'FUNGAL'
  | 'CLOUD'
  | 'NEBULA';

export interface LevelBiomeInfo {
  levelNumber: number;
  name: string;
  subtitle: string;
  minPlanetIndex: number;
  maxPlanetIndex: number;
  bgGradient: [string, string, string];
  nebulaColors: string[];
  starColors: string[];
  featuredTypes: PlanetType[];
  themeDescription: string;
}

export interface CheckpointInfo {
  id: string;
  levelNumber: number;
  targetPlanetIndex: number;
  name: string;
  altitude: number;
  y: number;
  biome: string;
  biomeName?: string;
  description: string;
  icon: string;
  planetType: PlanetType;
  primaryColor: string;
  secondaryColor: string;
  atmosphereColor: string;
  ringColor?: string;
  rewardStars: number;
  rewardXP: number;
}

export interface PlanetData {
  id: string;
  x: number;
  y: number;
  radius: number;
  mass: number;
  angularVelocity: number; // radians per second
  rotationDirection: 1 | -1;
  type: PlanetType;
  color: string;
  secondaryColor: string;
  surfaceDecorations: { angle: number; type: 'CRATER' | 'TREE' | 'DAISY' | 'FLAG' | 'TELESCOPE' | 'HOUSE' | 'DOG' | 'RIVET' | 'CANNON' | 'SPIKE' | 'LAVA_VENT' | 'URCHIN' | 'CRYSTAL' | 'FLARE' | 'CHECKPOINT_BEACON' | 'DARK_CRYSTAL' | 'RUNES'; size: number }[];
  visited: boolean;
  orbitStarCount?: number;
  hasRing?: boolean;
  ringColor?: string;
  atmosphereColor?: string;
  isCheckpoint?: boolean;
  checkpointId?: string;
  checkpointName?: string;
  isLevelGoal?: boolean;
  levelGoalNumber?: number;
  isDark?: boolean;
  altitudeTier?: number;
}

export interface CollectibleData {
  id: string;
  x: number;
  y: number;
  type: 'STAR' | 'DIAMOND';
  radius: number;
  collected: boolean;
  floatOffset: number;
  baseY: number;
}

export type PowerUpType = 'MAGNET' | 'COMET' | 'REWIND';

export interface PowerUpData {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  radius: number;
  collected: boolean;
  duration: number; // in seconds
}

export interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  size: number;
  color: string;
}

export type CostumeId = 
  | 'ASTRONAUT' 
  | 'PIRATE' 
  | 'PRINCESS' 
  | 'FOOTBALLER' 
  | 'NINJA' 
  | 'ALIEN' 
  | 'CYBER'
  | 'SOLAR_SOVEREIGN'
  | 'STELLA_MAGE'
  | 'CRYO_ARCHON'
  | 'VOID_RANGER'
  | 'NEBULA_DANCER'
  | 'STAR_KNIGHT'
  | 'COMET_ACE'
  | 'AURORA_SEER';

export type RocketSkinId = 'APOLLO' | 'NEON_CYBER' | 'GOLDEN_FLARE' | 'DRAGON_FIRE' | 'ALIEN_ION' | 'VOID_DRAKE' | 'STARLIGHT_SAIL' | 'PHOENIX_CORE' | 'AURORA_WING';

export interface RocketSkin {
  id: RocketSkinId;
  name: string;
  description: string;
  priceStars: number;
  unlocked: boolean;
  icon: string;
  primaryColor: string;
  flameColor: string;
}

export interface Costume {
  id: CostumeId;
  name: string;
  description: string;
  priceDiamonds: number;
  unlocked: boolean;
  icon: string;
  bodyColor: string;
  accentColor: string;
  trailColor: string;
  hairColor?: string;
  hatType: 'HELMET' | 'PIRATE_HAT' | 'CROWN' | 'FOOTBALL_HELMET' | 'NINJA_MASK' | 'ALIEN_ANTENNA' | 'VISOR' | 'SOLAR_HALO' | 'WIZARD_HAT' | 'CRYO_HORNS';
}

export interface PowerUpUpgrades {
  magnetLevel: number; // Level 1-10
  cometLevel: number;  // Level 1-10
  multiplierLevel: number; // Level 1-10
  jetpackLevel: number; // Level 0-10 (0 = locked, 1+ = jetpack rescue charges)
  ricochetLevel: number; // Level 0-10 (0 = locked, 1+ = rocket shoes bounce boost)
  rewindLevel: number; // Level 0-10 (0 = locked, 1+ = Chrono Time-Warp Rewind charges & auto-rescue)
}

export type ObjectiveType = 
  | 'FULL_ROTATIONS'
  | 'CONSECUTIVE_PERFECT_JUMPS'
  | 'COLLECT_STARS_SINGLE_RUN'
  | 'LAND_ON_SUNS'
  | 'REACH_ALTITUDE'
  | 'COLLECT_DIAMONDS_SINGLE_RUN'
  | 'USE_POWERUPS';

export interface QuestObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}

export interface StageQuest {
  stageId: string; // e.g., "1.1", "1.2", "2.1"
  stageName: string;
  objectives: QuestObjective[];
  completed: boolean;
  rewardStars: number;
  rewardDiamonds: number;
}

export type SkillBranchId = 'MOBILITY' | 'MAGNETISM' | 'RESILIENCE' | 'HARVEST';

export type SkillId = 
  // Mobility & Slingshots
  | 'GRAVITY_AFFINITY'
  | 'ORBITAL_SLINGSHOT_MASTERY'
  | 'AIR_DRIFT_STEERING'
  | 'JETPACK_OVERDRIVE'
  | 'COMET_PROPULSION'
  // Magnetism & Economy
  | 'SUPERNOVA_MAGNET'
  | 'STAR_HARVESTER'
  | 'DIAMOND_TRANSMUTATION'
  | 'COSMIC_EXPEDITION_XP'
  | 'CHECKPOINT_FORTUNE'
  // Resilience & Defense
  | 'CRYO_INSULATION'
  | 'STONE_WARD'
  | 'VOID_REPULSOR'
  | 'SOLAR_SHIELD'
  | 'PHOENIX_REBIRTH'
  | 'COMET_ECHO'
  | 'VOID_ANCHOR'
  | 'ABYSSAL_TETHER'
  | 'HARVEST_SURGE'
  | 'ORBITAL_FORTUNE'
  | 'GARDEN_ALCHEMY'
  | 'VOID_CARTOGRAPHY';

export interface SkillNode {
  id: SkillId;
  branch: SkillBranchId;
  name: string;
  description: string;
  icon: string;
  maxRank: number;
  requiredPlayerLevel: number;
  costPerRank: number; // Skill Points
  perkSummary: (rank: number) => string;
}

export type SkillTreeAllocations = Record<SkillId, number>;

export type GearSlot = 'HELMET' | 'SUIT' | 'THRUSTER' | 'RELIC' | 'ACCESSORY';

export interface GearStats {
  slingshotBonusPercent?: number;
  starValueBonusPercent?: number;
  xpBonusPercent?: number;
  darkCurseResistancePercent?: number;
  freezeResistancePercent?: number;
  jetpackPowerBonusPercent?: number;
  magnetRadiusBonus?: number;
  voidPushbackBonus?: number;
  diamondChanceBonusPercent?: number;
  scoreBonusPercent?: number;
  rewindChargesBonus?: number;
  extraRewindCharges?: number;
  tractorBeamBonusRadius?: number;
  starAttractBonusPercent?: number;
  autoRewindOnVoid?: boolean;
  timeDilationBonusPercent?: number;
  setBonusId?: string;
}

export interface GearItem {
  id: string;
  name: string;
  slot: GearSlot;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'CELESTIAL';
  stats: GearStats;
  priceStars: number;
  priceDiamonds: number;
  requiredPlayerLevel: number;
  unlocked: boolean;
  color: string;
  trailEffectName?: string;
  trailColor?: string;
  accessoryType?: 'SCARF' | 'CHRONO_CLOCK' | 'STAR_AMULET' | 'CAPE' | 'PRISMATIC_PENDANT';
}

export interface EquippedGear {
  helmetId: string;
  suitId: string;
  thrusterId: string;
  relicId: string;
  accessoryId?: string;
}

export interface GearSetBonus {
  id: string;
  name: string;
  icon: string;
  themeColor: string;
  tagline: string;
  requiredCount: number;
  buffDescription: string;
  matchingItemIds: string[];
}

export interface LevelProgressionPerk {
  level: number;
  title: string;
  badgeIcon: string;
  xpRequired: number;
  rewardStars: number;
  rewardDiamonds: number;
  rewardSkillPoints: number;
  unlockedGearTitle?: string;
  unlockedGearId?: string;
  perkDescription: string;
}

export interface PlayerStats {
  score: number;
  altitude: number;
  maxAltitude: number;
  starsCollected: number;
  diamondsCollected: number;
  xpEarnedRun: number;
  consecutivePerfectJumps: number;
  maxConsecutiveJumps: number;
  perfectJumpsCount?: number;
  planetRotationsCurrent: number;
  sunsLandedCount: number;
  powerUpsUsedCount: number;
  planetsLandedCount: number;
  jetpackChargesRemaining: number;
  rewindChargesRemaining: number;
  maxRewindCharges: number;
  isRewinding?: boolean;
  rewindEffectTimer?: number;
  fullOrbitsCompleted: number;
  ricochetsExecuted: number;
  deathReason?: 'VOID' | 'FROZEN' | 'PETRIFIED';
  petrificationRatio?: number;
  currentCheckpointId?: string;
  currentCheckpointName?: string;
  altitudeBiomeName?: string;
  currentLevelNumber: number;
  currentLevelName: string;
  currentLevelSubtitle?: string;
  currentLevelTheme?: string;
  sectorFlashTimer?: number;
  voidDistancePx?: number;
  voidEtaSeconds?: number;
  voidDangerRatio?: number;
  voidSpeedPx?: number;
  currentConstellationId?: ZodiacSignId;
  currentConstellationName?: string;
  currentZodiacGlyph?: string;
  currentZodiacElement?: ZodiacElement;
  currentZodiacElementIcon?: string;
  currentZodiacColor?: string;
  currentConstellationMinPlanet?: number;
  currentConstellationMaxPlanet?: number;
  currentConstellationProgressRatio?: number;
  currentConstellationStars?: ConstellationStar[];
  currentConstellationLines?: [number, number][];
  activeAnomaly?: ActiveSpaceAnomaly | null;
  phoenixReviveUsed?: boolean;
  activeSynergy?: GearSetBonus | null;
  activeSynergyName?: string;
  runSuppliesCollected?: {
    timber: number;
    quartz: number;
    alloys: number;
    plasmaCells: number;
    starDust: number;
  };
}

export interface HomeStorageSupplies {
  timber: number; // Starlight Timber (from GRASS & STANDARD)
  quartz: number; // Astral Quartz (from CRYSTAL & ICE)
  alloys: number; // Cosmic Alloys (from MECH & ASTEROID)
  plasmaCells: number; // Solar Plasma Cells (from PLASMA, SUN & MAGMA)
  starDust?: number; // Star Dust balance
}

export type HomeSeedType = 'STAR_DAISY' | 'MOON_ORCHID' | 'VOID_ROSE' | 'LUMEN_FRUIT' | 'COSMIC_LOTUS' | 'NEBULA_FERN' | 'SOLAR_CACTUS' | 'AURORA_IVY' | 'FROST_BLOSSOM';

export interface HomeGardenPlot {
  id: string;
  seedType?: HomeSeedType | null;
  seedName?: string;
  icon?: string;
  plantedAt?: number;
  plantedAtTimestamp?: number;
  growthDurationSeconds?: number;
  growthProgress?: number;
  isHarvestable?: boolean;
  watered?: boolean;
  rewardStarDust?: number;
  rewardDiamonds?: number;
}

export interface HomePlacedFurniture {
  id: string;
  itemId: string;
  name: string;
  category: 'STRUCTURE' | 'FURNITURE' | 'DECOR' | 'LIGHTING' | 'NATURE';
  angle?: number; // 0..2PI position around planet surface
  placedAngle?: number;
  posX?: number; // 0..100 normalized top-down coordinate X
  posY?: number; // 0..100 normalized top-down coordinate Y
  rotation?: number; // rotation in degrees
  icon: string;
  color: string;
  scale?: number;
}

export interface HomeFurnitureItem {
  id: string;
  name: string;
  category: 'STRUCTURE' | 'FURNITURE' | 'DECOR' | 'LIGHTING' | 'NATURE';
  icon: string;
  color: string;
  costStarDust: number;
  description: string;
}

export interface HomeCraftedTool {
  id: string;
  name: string;
  level: number;
  description: string;
  icon: string;
  perkDescription: string;
  cost: {
    timber: number;
    quartz: number;
    alloys: number;
    plasmaCells: number;
    starDust: number;
  };
}

export interface SpaceTravelerOffer {
  id: string;
  itemId: string;
  name: string;
  category: 'STRUCTURE' | 'FURNITURE' | 'DECOR' | 'LIGHTING' | 'NATURE' | 'EXOTIC';
  icon: string;
  color: string;
  description: string;
  rarity: 'RARE' | 'EXOTIC' | 'MYTHIC';
  cost: {
    timber?: number;
    quartz?: number;
    alloys?: number;
    plasmaCells?: number;
    starDust?: number;
    stars?: number;
    diamonds?: number;
  };
  traded?: boolean;
}

export interface SpaceTravelerVisit {
  id: string;
  travelerName: string;
  title: string;
  avatarIcon: string;
  shipIcon: string;
  accentColor: string;
  dialogue: string;
  arrivalTimestamp: number;
  departureTimestamp: number;
  offers: SpaceTravelerOffer[];
}

export interface HomePlanetData {
  id: string;
  name: string;
  biomeId?: string;
  biome: 'VERDANT' | 'CRYSTALLINE' | 'CYBER' | 'NEBULA' | 'VOLCANIC' | 'GLACIAL';
  habitatTier: number; // 1 to 8
  storageTier: number; // 1 to 8
  greenhouseTier: number; // 1 to 8 (Plot count)
  workshopTier: number; // 1 to 8
  supplies: HomeStorageSupplies;
  gardenPlots: HomeGardenPlot[];
  placedFurniture: HomePlacedFurniture[];
  craftedTools: (HomeCraftedTool | { id: string; level: number })[];
  unlockedDecorIds: string[];
  spaceTraveler?: SpaceTravelerVisit | null;
  lastSavedAt: number;
  hasRing?: boolean;
  ringColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface DailyLeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  score: number;
  altitude: number;
  maxCombo: number;
  costumeId: string;
  rocketSkinId: string;
  dateKey: string;
  timestamp: number;
  rank?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'STARS' | 'JUMPS' | 'PLANETS' | 'ALTITUDE' | 'MASTERY' | 'COLLECTION';
  icon: string;
  badgeColor: string;
  target: number;
  rewardStars: number;
  rewardDiamonds: number;
}

export type SoundPackId = 'ORCHESTRAL' | 'SYNTHWAVE' | 'RETRO_8BIT' | 'CHILL_LOFI';

export interface SoundPackInfo {
  id: SoundPackId;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  accentColor: string;
  previewNote: string;
}

export interface DailyMission {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  category?: 'EXPLORE' | 'JUMP' | 'COLLECT' | 'SPECIAL';
  type?: ObjectiveType;
  tier?: 1 | 2 | 3;
  target: number;
  targetCount?: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardStars: number;
  rewardDiamonds: number;
  rewardStarDust: number;
}

export interface DailyMissionsSaveData {
  dateKey: string;
  missions: DailyMission[];
}

export interface DailyMissionsState {
  dateKey: string;
  missions: {
    id: string;
    progress: number;
    completed: boolean;
    claimed: boolean;
  }[];
  trifectaClaimed: boolean;
}

export interface PlanetLoreEntry {
  type: PlanetType;
  name: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  atmosphereType: string;
  gravitySignature: string;
  hazardRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  lore: string;
  astrophysicalNotes: string;
  discoveryMilestone: string;
}

export interface ConstellationLoreEntry {
  id: ZodiacSignId;
  name: string;
  latinName: string;
  glyph: string;
  element: ZodiacElement;
  elementIcon: string;
  elementColor: string;
  lore: string;
  mythos: string;
  celestialCoordinates: string;
  astralBuff: string;
}

export interface DailyChallenge {
  dateKey: string;
  id: string;
  title: string;
  description: string;
  icon: string;
  type: ObjectiveType;
  target: number;
  targetCount: number;
  rewardStars: number;
  rewardDiamonds: number;
  rewardStarDust?: number;
}

export interface DailyChallengeState {
  dateKey: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface UserSavedData {
  highScore: number;
  maxAltitudeOverall: number;
  totalStars: number;
  totalDiamonds: number;
  totalStarDust: number; // Unique daily mission reward currency
  starDustCurrency?: number; // Alias for star dust balance
  totalStarsAllTime: number;
  totalDiamondsAllTime: number;
  totalStarDustAllTime: number;
  totalPlanetsAllTime: number;
  totalFullOrbitsAllTime: number;
  totalSunsAllTime: number;
  totalPowerUpsAllTime: number;
  maxConsecutiveJumpsRecord: number;
  currentStageIndex: number;
  completedStageIds: string[];
  unlockedCostumes: CostumeId[];
  activeCostumeId: CostumeId;
  unlockedRocketSkins: RocketSkinId[];
  activeRocketSkinId: RocketSkinId;
  upgrades: PowerUpUpgrades;
  claimedAchievementIds: string[];
  unlockedCheckpointIds: string[];
  selectedStartCheckpointId: string;
  dailyChallengeState?: DailyChallengeState;
  dailyMissionsState?: DailyMissionsState;
  dailyMissions?: DailyMissionsSaveData;
  discoveredConstellationIds: ZodiacSignId[];
  discoveredPlanetTypes: PlanetType[];
  hasCompletedTutorial?: boolean;
  hasSeenOnboarding?: boolean;
  soundEnabled: boolean;
  randomizeAesthetics?: boolean;
  soundPack: SoundPackId;
  activeSoundPack?: SoundPackId;
  hapticsEnabled?: boolean;
  soundVolume?: number;
  musicVolume?: number;
  ambientVolume?: number;
  
  // RPG Progression & Skill Tree
  playerLevel: number;
  playerXP: number;
  skillPointsAvailable: number;
  skillTreeAllocations: SkillTreeAllocations;
  
  // RPG Gear & Equipment
  unlockedGearIds: string[];
  equippedGear: EquippedGear;

  // Home Planet Base & Sanctuary
  homePlanet?: HomePlanetData;

  // Military Ribbons & Service Medals Progression
  unlockedMedalIds?: string[];
  completedLevelNumbers?: number[];
  activeUniformMedals?: string[];
  spaceDiamonds?: number;
}

export type MedalTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'CELESTIAL';

export type MedalPerkType = 
  | 'JETPACK_CHARGES'
  | 'MAGNET_RADIUS'
  | 'SLINGSHOT_BOOST'
  | 'STEERING_DRIFT'
  | 'REWIND_CHARGES'
  | 'HARVEST_MULTIPLIER'
  | 'THERMAL_SHIELD'
  | 'CHARGE_POWER';

export interface MilitaryMedal {
  id: string;
  levelNumber: number;
  name: string;
  ribbonTitle: string;
  tier: MedalTier;
  ribbonColors: string[]; // 3-5 stripe colors for authentic military uniform ribbon bar
  icon: string;
  rankCitation: string;
  description?: string;
  perkTitle: string;
  perkDescription: string;
  perkEffect: {
    type: MedalPerkType;
    value: number;
  };
}

export interface LevelVictoryData {
  levelNumber: number;
  levelName: string;
  subtitle: string;
  targetPlanetIndex: number;
  isFirstClear: boolean;
  medalAwarded: MilitaryMedal;
  stats: {
    planetsLanded: number;
    altitudeReached: number;
    starsCollected: number;
    diamondsCollected: number;
    perfectJumps: number;
    runScore: number;
    timeElapsedSeconds: number;
  };
}


/**
 * Planet Simulation ("Planet Sovereignty") types.
 *
 * The home screen of the game is a living simulation of your home planet:
 * growth, resource management, pollution control, diplomacy (allies &
 * enemies), planetary defenses and offensive fleet strikes.
 */

export type SimRegionKind = 'FARM' | 'MINING' | 'INDUSTRY' | 'CIVIC' | 'SCIENCE' | 'FRONTIER';

export type SimResourceId = 'energy' | 'materials' | 'food';

export interface SimResources {
  energy: number;
  materials: number;
  food: number;
}

export interface SimRegionState {
  id: string;
  /** Development level 1..12 — the core "growth" axis of a region. */
  development: number;
  /** structureId -> count built in this region */
  structures: Record<string, number>;
  /** Timestamp when the region was last explored (explore cooldown). */
  lastExploredAt: number;
  /** Total expeditions completed in this region. */
  exploredCount: number;
}

export type SimFactionKind = 'ALLY_CANDIDATE' | 'ENEMY';

export type SimFactionId =
  | 'LUMINARI'
  | 'VERDANT_CIRCLE'
  | 'TRADE_GUILD'
  | 'VOID_RAIDERS'
  | 'ASH_LEGION';

export interface SimFactionState {
  id: SimFactionId;
  /** 0..100 for ally candidates. */
  relation: number;
  /** Ally candidates: NEUTRAL -> ALLIED. Enemies: AT_WAR -> TRUCE -> DEFEATED (integrated). */
  status: 'NEUTRAL' | 'ALLIED' | 'AT_WAR' | 'TRUCE' | 'INTEGRATED';
  /** Enemies only: combat strength. */
  strength: number;
  /** Enemies only: raids paused until this timestamp. */
  truceUntil: number;
  /** Enemies only: times subdued by strikes. */
  subduedCount: number;
  /** Enemies only: whether the faction has been revealed yet. */
  awakened: boolean;
}

export interface SimDefenseState {
  shieldGen: number; // 0..5
  turretGrid: number; // 0..5
  sensorArray: number; // 0..3
}

export interface SimFleetState {
  frigates: number;
}

export interface SimLogEntry {
  ts: number;
  kind: 'GOOD' | 'BAD' | 'INFO' | 'WAR';
  msg: string;
}

export interface SimStats {
  explores: number;
  raidsSurvived: number;
  strikesLaunched: number;
  starDustEarned: number;
  alliancesFormed: number;
  factionsIntegrated: number;
}

export interface PlanetSimState {
  version: number;
  createdAt: number;
  lastTickAt: number;
  resources: SimResources;
  population: number;
  /** 0..100 global pollution index. */
  pollution: number;
  /** Star-dust export income pool, claimable into the main currency balance. */
  exportPool: number;
  regions: SimRegionState[];
  factions: SimFactionState[];
  defense: SimDefenseState;
  fleet: SimFleetState;
  /** 0 = no raid currently scheduled. */
  nextRaidAt: number;
  raidCount: number;
  stats: SimStats;
  log: SimLogEntry[];
}

export interface SimStructureDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  /** Region kinds that may host this structure. Empty = allowed everywhere. */
  kinds: SimRegionKind[];
  cost: Partial<SimResources>;
  /** Cost scales by (1 + COST_SCALE * alreadyOwned). */
  maxCount: number;
  minDevelopment: number;
  // Per-second effects
  energy?: number;
  materials?: number;
  food?: number;
  export?: number;
  pollution?: number; // negative = cleans
  energyUse?: number;
  popCap?: number;
  defense?: number;
}

export interface SimRegionDef {
  id: string;
  name: string;
  kind: SimRegionKind;
  icon: string;
  color: string;
  description: string;
  /** Angle (radians) where the region marker sits on the planet disc. */
  angle: number;
  baseOutput: {
    energy?: number;
    materials?: number;
    food?: number;
    export?: number;
  };
  /** Pollution generated per development level per second. */
  pollutionPerDev: number;
}

export interface SimFactionDef {
  id: SimFactionId;
  name: string;
  kind: SimFactionKind;
  icon: string;
  color: string;
  title: string;
  description: string;
  allianceBonus: string;
}

export interface SimRates {
  energy: number;
  materials: number;
  food: number;
  export: number;
  pollution: number;
  populationGrowth: number;
  /** 0..1 — structures brown-out when energy is empty. */
  efficiency: number;
  popCap: number;
  defenseRating: number;
}

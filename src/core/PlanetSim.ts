/**
 * PlanetSim — the planet sovereignty simulation engine.
 *
 * Pure functions only: every operation takes a PlanetSimState and returns a
 * new one, so the UI can keep React state, refs and persistence in sync.
 *
 * Systems:
 *  - Growth: develop regions, build structures, grow population.
 *  - Resources: energy / materials / food economy with storage caps.
 *  - Pollution: industry pollutes, scrubbers & groves clean, high pollution hurts.
 *  - Diplomacy: win over ally factions, manage / subdue enemy factions.
 *  - Defense: shield generator, turret grid, sensors, regional turret pods.
 *  - Offense: build frigates and launch strikes on enemy strongholds.
 */

import {
  PlanetSimState,
  SimRegionDef,
  SimRegionKind,
  SimRegionState,
  SimStructureDef,
  SimFactionDef,
  SimFactionId,
  SimFactionState,
  SimRates,
  SimLogEntry,
  SimResourceId,
} from '../types/planetSim';

// ---------------------------------------------------------------------------
// Tunables
// ---------------------------------------------------------------------------

export const SIM_VERSION = 1;
export const RESOURCE_CAP = 5000;
export const EXPORT_POOL_CAP = 500;
export const MAX_DEVELOPMENT = 12;
export const EXPLORE_COOLDOWN_MS = 90_000;
export const EXPLORE_ENERGY_COST = 5;
export const MAX_OFFLINE_SECONDS = 4 * 60 * 60; // 4h of catch-up
export const FRIGATE_COST = { materials: 40, energy: 30 };
export const FRIGATE_POWER = 8;

export const PLANET_TITLES: { minTotalDev: number; title: string }[] = [
  { minTotalDev: 60, title: 'Ascendant Dominion' },
  { minTotalDev: 48, title: 'World Power' },
  { minTotalDev: 36, title: 'Star Nation' },
  { minTotalDev: 26, title: 'City-State' },
  { minTotalDev: 18, title: 'Colony' },
  { minTotalDev: 12, title: 'Settlement' },
  { minTotalDev: 0, title: 'Outpost' },
];

// ---------------------------------------------------------------------------
// Region definitions (the clickable territories on the home planet)
// ---------------------------------------------------------------------------

export const REGION_DEFS: SimRegionDef[] = [
  {
    id: 'heartland',
    name: 'Verdant Heartland',
    kind: 'FARM',
    icon: '🌾',
    color: '#34d399',
    description: 'Rolling star-grass plains. The breadbasket of your world — develop it to feed a growing population.',
    angle: -Math.PI / 2,
    baseOutput: { food: 0.35 },
    pollutionPerDev: 0.0008,
  },
  {
    id: 'peaks',
    name: 'Crystal Peaks',
    kind: 'MINING',
    icon: '⛰️',
    color: '#a78bfa',
    description: 'Quartz-capped mountains rich with raw ore. Extractors here feed every build project on the planet.',
    angle: -Math.PI / 6,
    baseOutput: { materials: 0.3 },
    pollutionPerDev: 0.0015,
  },
  {
    id: 'belt',
    name: 'Forge Belt',
    kind: 'INDUSTRY',
    icon: '🏭',
    color: '#fb923c',
    description: 'Foundry district of plasma kilns and assembly drones. Huge output, but watch the smog it belches out.',
    angle: Math.PI / 6,
    baseOutput: { materials: 0.45, energy: 0.15 },
    pollutionPerDev: 0.004,
  },
  {
    id: 'coast',
    name: 'Azure Coast',
    kind: 'CIVIC',
    icon: '🏙️',
    color: '#38bdf8',
    description: 'Tide-lit arcology strip where your citizens live. Housing domes here raise your population cap.',
    angle: Math.PI / 2,
    baseOutput: { food: 0.1, energy: 0.08 },
    pollutionPerDev: 0.0012,
  },
  {
    id: 'spire',
    name: 'Aurora Spire',
    kind: 'SCIENCE',
    icon: '🔭',
    color: '#e879f9',
    description: 'High-altitude research plateau. Labs and trade beacons refine exports into precious Star Dust.',
    angle: (5 * Math.PI) / 6,
    baseOutput: { export: 0.004 },
    pollutionPerDev: 0.0006,
  },
  {
    id: 'wastes',
    name: 'Obsidian Wastes',
    kind: 'FRONTIER',
    icon: '🌋',
    color: '#f43f5e',
    description: 'Scarred frontier badlands bordering enemy space. Dangerous expeditions — and your launch point for strikes.',
    angle: (-5 * Math.PI) / 6,
    baseOutput: { energy: 0.12 },
    pollutionPerDev: 0.002,
  },
];

export const REGION_KIND_LABEL: Record<SimRegionKind, string> = {
  FARM: 'Agrarian',
  MINING: 'Mining',
  INDUSTRY: 'Industrial',
  CIVIC: 'Civic',
  SCIENCE: 'Scientific',
  FRONTIER: 'Frontier',
};

// ---------------------------------------------------------------------------
// Structure catalog
// ---------------------------------------------------------------------------

export const STRUCTURE_DEFS: SimStructureDef[] = [
  {
    id: 'SOLAR_ARRAY',
    name: 'Solar Array',
    icon: '🔆',
    description: 'Orbital-mirror solar farm. Pure energy, zero smog.',
    kinds: [],
    cost: { materials: 20 },
    maxCount: 8,
    minDevelopment: 1,
    energy: 0.25,
  },
  {
    id: 'HYDRO_FARM',
    name: 'Hydro Farm',
    icon: '🌱',
    description: 'Zero-g hydroponic terraces pumping out rations.',
    kinds: ['FARM', 'CIVIC', 'SCIENCE'],
    cost: { materials: 15, energy: 10 },
    maxCount: 8,
    minDevelopment: 1,
    food: 0.4,
    energyUse: 0.03,
  },
  {
    id: 'EXTRACTOR',
    name: 'Deep Extractor',
    icon: '⛏️',
    description: 'Boreholes chewing through crust for ore. Mild pollution.',
    kinds: ['MINING', 'INDUSTRY', 'FRONTIER'],
    cost: { materials: 25, energy: 15 },
    maxCount: 8,
    minDevelopment: 2,
    materials: 0.35,
    energyUse: 0.05,
    pollution: 0.002,
  },
  {
    id: 'FOUNDRY',
    name: 'Plasma Foundry',
    icon: '🏭',
    description: 'Massive output of alloy — and massive exhaust with it.',
    kinds: ['INDUSTRY'],
    cost: { materials: 45, energy: 30 },
    maxCount: 6,
    minDevelopment: 3,
    materials: 0.7,
    energyUse: 0.1,
    pollution: 0.006,
  },
  {
    id: 'HABITAT_DOME',
    name: 'Habitat Dome',
    icon: '🏠',
    description: 'Pressurized arcology dome. +15 population capacity.',
    kinds: ['CIVIC', 'FARM'],
    cost: { materials: 30, food: 20 },
    maxCount: 6,
    minDevelopment: 2,
    popCap: 15,
    energyUse: 0.03,
  },
  {
    id: 'RESEARCH_LAB',
    name: 'Research Lab',
    icon: '🧪',
    description: 'Refines rare isotopes into exportable Star Dust.',
    kinds: ['SCIENCE'],
    cost: { materials: 35, energy: 25 },
    maxCount: 6,
    minDevelopment: 2,
    export: 0.005,
    energyUse: 0.05,
  },
  {
    id: 'TRADE_BEACON',
    name: 'Trade Beacon',
    icon: '📡',
    description: 'Subspace relay attracting merchant convoys.',
    kinds: ['CIVIC', 'SCIENCE'],
    cost: { materials: 30 },
    maxCount: 4,
    minDevelopment: 3,
    export: 0.003,
    energyUse: 0.04,
  },
  {
    id: 'SCRUBBER',
    name: 'Carbon Scrubber',
    icon: '🌀',
    description: 'Atmospheric filter tower. Pulls pollution out of the sky.',
    kinds: [],
    cost: { materials: 25, energy: 20 },
    maxCount: 8,
    minDevelopment: 2,
    pollution: -0.014,
    energyUse: 0.06,
  },
  {
    id: 'GROVE',
    name: 'Starlight Grove',
    icon: '🌳',
    description: 'Bioluminescent forest. Cleans the air and bears fruit.',
    kinds: [],
    cost: { materials: 10, food: 15 },
    maxCount: 6,
    minDevelopment: 1,
    pollution: -0.008,
    food: 0.08,
  },
  {
    id: 'TURRET_POD',
    name: 'Turret Pod',
    icon: '🛰️',
    description: 'Point-defense battery. +4 regional defense rating.',
    kinds: [],
    cost: { materials: 30, energy: 20 },
    maxCount: 6,
    minDevelopment: 2,
    defense: 4,
    energyUse: 0.02,
  },
];

export const STRUCTURE_COST_SCALE = 0.25;

// ---------------------------------------------------------------------------
// Faction definitions
// ---------------------------------------------------------------------------

export const FACTION_DEFS: SimFactionDef[] = [
  {
    id: 'LUMINARI',
    name: 'Luminari Concord',
    kind: 'ALLY_CANDIDATE',
    icon: '✨',
    color: '#facc15',
    title: 'Beings of Living Light',
    description: 'Radiant energy-spirits who once lit the first stars. They admire well-defended worlds.',
    allianceBonus: 'Alliance: +10 defense rating and +15% energy output.',
  },
  {
    id: 'VERDANT_CIRCLE',
    name: 'Verdant Circle',
    kind: 'ALLY_CANDIDATE',
    icon: '🌿',
    color: '#4ade80',
    title: 'Keepers of the Green',
    description: 'An ancient druidic collective that tends wild planets. They despise pollution.',
    allianceBonus: 'Alliance: pollution decays faster and +12% food output.',
  },
  {
    id: 'TRADE_GUILD',
    name: 'Stellar Trade Guild',
    kind: 'ALLY_CANDIDATE',
    icon: '🪙',
    color: '#60a5fa',
    title: 'Merchants of the Lanes',
    description: 'A sprawling merchant cartel controlling the hyperspace trade lanes.',
    allianceBonus: 'Alliance: +30% Star Dust export income.',
  },
  {
    id: 'VOID_RAIDERS',
    name: 'Void Raiders',
    kind: 'ENEMY',
    icon: '☠️',
    color: '#f87171',
    title: 'Corsairs of the Dark',
    description: 'Hit-and-run pirates striking from wormholes. They raid for supplies — build defenses or subdue them.',
    allianceBonus: 'Subdue them to force integration as corsair auxiliaries (+8 defense).',
  },
  {
    id: 'ASH_LEGION',
    name: 'Ash Legion',
    kind: 'ENEMY',
    icon: '🔥',
    color: '#fb7185',
    title: 'The Burning Armada',
    description: 'A militaristic armada that awakens once your world grows bright enough to notice. Far stronger than raiders.',
    allianceBonus: 'Subdue them to force integration as legion guards (+12 defense).',
  },
];

export const DEFENSE_DEFS = {
  shieldGen: {
    name: 'Aegis Shield Generator',
    icon: '🛡️',
    maxLevel: 5,
    description: 'Planetary energy shield. Each level absorbs 12% of raid damage.',
    levelCost: (lvl: number) => ({ materials: 40 * Math.pow(1.7, lvl), energy: 30 * Math.pow(1.7, lvl) }),
  },
  turretGrid: {
    name: 'Orbital Turret Grid',
    icon: '🎯',
    maxLevel: 5,
    description: 'Networked defense satellites. +6 defense rating per level.',
    levelCost: (lvl: number) => ({ materials: 35 * Math.pow(1.7, lvl), energy: 25 * Math.pow(1.7, lvl) }),
  },
  sensorArray: {
    name: 'Deep Sensor Array',
    icon: '📡',
    maxLevel: 3,
    description: 'Early-warning pickets. +3 defense rating per level and earlier raid warnings.',
    levelCost: (lvl: number) => ({ materials: 30 * Math.pow(1.8, lvl), energy: 20 * Math.pow(1.8, lvl) }),
  },
};

export const TRUCE_COST_STARDUST = 8;
export const TRUCE_DURATION_MS = 8 * 60 * 1000;
export const INTEGRATE_COST_STARDUST = 15;
export const INTEGRATE_MAX_STRENGTH = 12;
export const ALLIANCE_RELATION_REQ = 70;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const regionDef = (id: string): SimRegionDef =>
  REGION_DEFS.find((r) => r.id === id) || REGION_DEFS[0];

export const structureDef = (id: string): SimStructureDef | undefined =>
  STRUCTURE_DEFS.find((s) => s.id === id);

export const factionDef = (id: SimFactionId): SimFactionDef =>
  FACTION_DEFS.find((f) => f.id === id) || FACTION_DEFS[0];

export const getFaction = (state: PlanetSimState, id: SimFactionId): SimFactionState =>
  state.factions.find((f) => f.id === id)!;

export const isAllied = (state: PlanetSimState, id: SimFactionId): boolean =>
  getFaction(state, id).status === 'ALLIED';

export function totalDevelopment(state: PlanetSimState): number {
  return state.regions.reduce((sum, r) => sum + r.development, 0);
}

export function planetTitle(state: PlanetSimState): string {
  const total = totalDevelopment(state);
  return PLANET_TITLES.find((t) => total >= t.minTotalDev)?.title || 'Outpost';
}

export function planetLevel(state: PlanetSimState): number {
  const total = totalDevelopment(state);
  let lvl = 1;
  for (const t of PLANET_TITLES) if (total >= t.minTotalDev) lvl = Math.max(lvl, PLANET_TITLES.indexOf(t) + 1);
  return PLANET_TITLES.length - PLANET_TITLES.findIndex((t) => total >= t.minTotalDev);
}

export function structureCost(def: SimStructureDef, owned: number): Partial<Record<SimResourceId, number>> {
  const scale = 1 + STRUCTURE_COST_SCALE * owned;
  const out: Partial<Record<SimResourceId, number>> = {};
  (Object.keys(def.cost) as SimResourceId[]).forEach((k) => {
    out[k] = Math.ceil((def.cost[k] || 0) * scale);
  });
  return out;
}

export function developCost(development: number): { materials: number; energy: number } {
  const m = 1.45;
  return {
    materials: Math.ceil(20 * Math.pow(m, development - 1)),
    energy: Math.ceil(10 * Math.pow(m, development - 1)),
  };
}

export function populationCap(state: PlanetSimState): number {
  let cap = 10;
  for (const region of state.regions) {
    const domes = region.structures['HABITAT_DOME'] || 0;
    cap += domes * 15;
    if (regionDef(region.id).kind === 'CIVIC') cap += region.development * 2;
  }
  return cap;
}

function countStructures(state: PlanetSimState, id: string): number {
  return state.regions.reduce((sum, r) => sum + (r.structures[id] || 0), 0);
}

export function getDefenseRating(state: PlanetSimState): number {
  let def = 6;
  def += state.defense.turretGrid * 6;
  def += state.defense.sensorArray * 3;
  def += countStructures(state, 'TURRET_POD') * 4;
  def += Math.min(state.fleet.frigates, 10);
  if (isAllied(state, 'LUMINARI')) def += 10;
  const raiders = getFaction(state, 'VOID_RAIDERS');
  if (raiders.status === 'INTEGRATED') def += 8;
  const legion = getFaction(state, 'ASH_LEGION');
  if (legion.status === 'INTEGRATED') def += 12;
  return Math.round(def);
}

// ---------------------------------------------------------------------------
// Rate computation (per second)
// ---------------------------------------------------------------------------

export function computeRates(state: PlanetSimState): SimRates {
  const luminari = isAllied(state, 'LUMINARI');
  const verdant = isAllied(state, 'VERDANT_CIRCLE');
  const guild = isAllied(state, 'TRADE_GUILD');

  let energy = 0;
  let materials = 0;
  let food = 0;
  let exports = 0;
  let pollution = 0;
  let energyUse = 0;
  let popCap = populationCap(state);

  // Region base output scales with development
  for (const region of state.regions) {
    const def = regionDef(region.id);
    const dev = region.development;
    energy += (def.baseOutput.energy || 0) * dev;
    materials += (def.baseOutput.materials || 0) * dev;
    food += (def.baseOutput.food || 0) * dev;
    exports += (def.baseOutput.export || 0) * dev;
    pollution += def.pollutionPerDev * dev;

    for (const [sid, count] of Object.entries(region.structures)) {
      if (!count) continue;
      const s = structureDef(sid);
      if (!s) continue;
      energy += (s.energy || 0) * count;
      materials += (s.materials || 0) * count;
      food += (s.food || 0) * count;
      exports += (s.export || 0) * count;
      pollution += (s.pollution || 0) * count;
      energyUse += (s.energyUse || 0) * count;
    }
  }

  // Citizens work: small universal output, and they eat
  const pop = state.population;
  energy += pop * 0.004;
  materials += pop * 0.003;
  food -= pop * 0.012;

  // Pollution affects efficiency
  const pollutionFoodPenalty = state.pollution > 40 ? 1 - clamp((state.pollution - 40) / 120, 0, 0.5) : 1;
  food *= pollutionFoodPenalty;
  if (verdant) food *= 1.12;

  // Population contributes a little smog; cleaning structures remove it
  pollution += pop * 0.0004;
  if (verdant) pollution -= 0.01;
  // Natural atmospheric decay
  pollution -= 0.002 + state.pollution * 0.00008;

  if (luminari) energy *= 1.15;
  if (guild) exports *= 1.3;

  // Brown-out check: consumers go offline when the grid is dry
  const netEnergy = energy - energyUse;
  const efficiency = netEnergy >= 0 || state.resources.energy > 1 ? 1 : 0.5;
  if (efficiency < 1) {
    materials = materials * 0.5;
    food = food * 0.75 + pop * 0.012 * 0.25;
    exports *= 0.5;
  }

  energy = energy - energyUse * efficiency;

  // Population growth model
  let growth = 0;
  if (food > 0 && state.pollution < 70 && pop < popCap) {
    growth = clamp(pop * 0.0008 + 0.002, 0, 0.02) * (1 - pop / popCap);
  } else if (state.pollution >= 85 || food < -0.05) {
    growth = -0.004;
  }

  return {
    energy,
    materials,
    food,
    export: exports,
    pollution,
    populationGrowth: growth,
    efficiency,
    popCap,
    defenseRating: getDefenseRating(state),
  };
}

// ---------------------------------------------------------------------------
// Raids
// ---------------------------------------------------------------------------

function activeRaiders(state: PlanetSimState): SimFactionState[] {
  return state.factions.filter(
    (f) =>
      factionDef(f.id).kind === 'ENEMY' &&
      f.awakened &&
      f.strength > 0 &&
      f.status !== 'TRUCE' &&
      f.status !== 'INTEGRATED' &&
      Date.now() >= f.truceUntil
  );
}

function scheduleNextRaid(state: PlanetSimState, rng: () => number): number {
  if (activeRaiders(state).length === 0) return 0;
  const totalStrength = state.factions.reduce(
    (s, f) => s + (factionDef(f.id).kind === 'ENEMY' && f.awakened ? f.strength : 0),
    0
  );
  const base = clamp(420 - state.raidCount * 8 - totalStrength * 0.6, 150, 420);
  const jitter = 0.8 + rng() * 0.4;
  return Date.now() + base * jitter * 1000;
}

function resolveRaid(state: PlanetSimState, rng: () => number, log: SimLogEntry[]): PlanetSimState {
  const raiders = activeRaiders(state);
  if (raiders.length === 0) return state;

  let raidPower = 0;
  const names: string[] = [];
  for (const r of raiders) {
    raidPower += r.strength * (0.55 + rng() * 0.45);
    names.push(factionDef(r.id).name);
  }

  const defense = getDefenseRating(state);
  const shieldAbsorb = clamp(state.defense.shieldGen * 0.12, 0, 0.6);
  const rawDamage = Math.max(0, raidPower - defense);
  const damage = rawDamage * (1 - shieldAbsorb);
  const ts = Date.now();

  const factions = state.factions.map((f) =>
    raiders.some((r) => r.id === f.id) ? { ...f, strength: f.strength + 2 } : f
  );

  if (damage <= 1) {
    log.unshift({ ts, kind: 'WAR', msg: `⚔️ ${names.join(' & ')} raided — your defenses repelled them!` });
    return {
      ...state,
      factions,
      raidCount: state.raidCount + 1,
      stats: { ...state.stats, raidsSurvived: state.stats.raidsSurvived + 1 },
      nextRaidAt: scheduleNextRaid({ ...state, factions }, rng),
    };
  }

  const lossFactor = clamp(damage / 120, 0.03, 0.35);
  const lostMats = Math.round(state.resources.materials * lossFactor);
  const lostFood = Math.round(state.resources.food * lossFactor);
  const lostEnergy = Math.round(state.resources.energy * lossFactor * 0.6);
  const lostExports = Math.round(state.exportPool * lossFactor * 0.5);

  log.unshift({
    ts,
    kind: 'BAD',
    msg: `🔥 ${names.join(' & ')} broke through! Lost ${lostMats}⚙️ ${lostFood}🌾 ${lostEnergy}⚡ (defense ${Math.round(defense)} vs power ${Math.round(raidPower)}).`,
  });

  return {
    ...state,
    resources: {
      materials: state.resources.materials - lostMats,
      food: state.resources.food - lostFood,
      energy: state.resources.energy - lostEnergy,
    },
    exportPool: state.exportPool - lostExports,
    factions,
    raidCount: state.raidCount + 1,
    stats: { ...state.stats, raidsSurvived: state.stats.raidsSurvived + 1 },
    nextRaidAt: scheduleNextRaid({ ...state, factions }, rng),
  };
}

// ---------------------------------------------------------------------------
// State creation & ticking
// ---------------------------------------------------------------------------

export function createInitialSimState(now: number = Date.now()): PlanetSimState {
  const regions: SimRegionState[] = REGION_DEFS.map((def) => ({
    id: def.id,
    development: 1,
    structures: {},
    lastExploredAt: 0,
    exploredCount: 0,
  }));
  // Starter improvements
  const heartland = regions.find((r) => r.id === 'heartland')!;
  heartland.structures['HYDRO_FARM'] = 1;
  const belt = regions.find((r) => r.id === 'belt')!;
  belt.structures['SOLAR_ARRAY'] = 1;

  return {
    version: SIM_VERSION,
    createdAt: now,
    lastTickAt: now,
    resources: { energy: 60, materials: 80, food: 60 },
    population: 6,
    pollution: 4,
    exportPool: 0,
    regions,
    factions: [
      { id: 'LUMINARI', relation: 20, status: 'NEUTRAL', strength: 0, truceUntil: 0, subduedCount: 0, awakened: true },
      { id: 'VERDANT_CIRCLE', relation: 15, status: 'NEUTRAL', strength: 0, truceUntil: 0, subduedCount: 0, awakened: true },
      { id: 'TRADE_GUILD', relation: 10, status: 'NEUTRAL', strength: 0, truceUntil: 0, subduedCount: 0, awakened: true },
      { id: 'VOID_RAIDERS', relation: 0, status: 'AT_WAR', strength: 18, truceUntil: 0, subduedCount: 0, awakened: true },
      { id: 'ASH_LEGION', relation: 0, status: 'AT_WAR', strength: 45, truceUntil: 0, subduedCount: 0, awakened: false },
    ],
    defense: { shieldGen: 0, turretGrid: 0, sensorArray: 0 },
    fleet: { frigates: 0 },
    nextRaidAt: now + 5 * 60 * 1000,
    raidCount: 0,
    stats: { explores: 0, raidsSurvived: 0, strikesLaunched: 0, starDustEarned: 0, alliancesFormed: 0, factionsIntegrated: 0 },
    log: [
      { ts: now, kind: 'INFO', msg: '🪐 Welcome to your home planet. Click a region to explore and manage it.' },
      { ts: now, kind: 'BAD', msg: '☠️ Intel: Void Raiders have been spotted on approach vectors. Build defenses soon.' },
    ] as SimLogEntry[],
  };
}

function tickOnce(state: PlanetSimState, dt: number, now: number, rng: () => number): PlanetSimState {
  const rates = computeRates(state);

  // Resource accumulation
  const resources = {
    energy: clamp(state.resources.energy + rates.energy * dt, 0, RESOURCE_CAP),
    materials: clamp(state.resources.materials + rates.materials * dt, 0, RESOURCE_CAP),
    food: clamp(state.resources.food + rates.food * dt, 0, RESOURCE_CAP),
  };
  const exportPool = clamp(state.exportPool + rates.export * dt, 0, EXPORT_POOL_CAP);
  const pollution = clamp(state.pollution + rates.pollution * dt, 0, 100);
  const population = clamp(state.population + rates.populationGrowth * dt, 0, rates.popCap);

  let next: PlanetSimState = { ...state, resources, exportPool, pollution, population };

  // Enemy factions grow stronger over time
  next = {
    ...next,
    factions: next.factions.map((f) => {
      if (factionDef(f.id).kind !== 'ENEMY' || !f.awakened || f.status === 'INTEGRATED') return f;
      return { ...f, strength: Math.min(f.strength + 0.0018 * dt * (f.id === 'ASH_LEGION' ? 1.6 : 1), 220) };
    }),
  };

  // Ash Legion awakens when the world grows bright enough
  const legion = getFaction(next, 'ASH_LEGION');
  if (!legion.awakened && totalDevelopment(next) >= 16) {
    next = {
      ...next,
      factions: next.factions.map((f) => (f.id === 'ASH_LEGION' ? { ...f, awakened: true } : f)),
      log: [
        { ts: now, kind: 'BAD', msg: '🔥 The Ash Legion has noticed your growing world! A new threat emerges.' } as SimLogEntry,
        ...next.log,
      ].slice(0, 40),
    };
  }

  // Slow relation drift for neutral ally candidates
  next = {
    ...next,
    factions: next.factions.map((f) =>
      factionDef(f.id).kind === 'ALLY_CANDIDATE' && f.status === 'NEUTRAL'
        ? { ...f, relation: clamp(f.relation - 0.0004 * dt, 0, 100) }
        : f
    ),
  };

  // Raids due?
  if (next.nextRaidAt > 0 && now >= next.nextRaidAt) {
    const log: SimLogEntry[] = [...next.log];
    next = resolveRaid(next, rng, log);
    next = { ...next, log: log.slice(0, 40) };
  }

  return next;
}

/** Advance the simulation by `elapsedSec` (chunked so raids resolve in order). */
export function tickSim(
  state: PlanetSimState,
  elapsedSec: number,
  rng: () => number = Math.random
): PlanetSimState {
  if (elapsedSec <= 0) return state;
  let remaining = Math.min(elapsedSec, MAX_OFFLINE_SECONDS);
  let cursor = state.lastTickAt;
  let next = state;
  const chunk = 30;
  while (remaining > 0.001) {
    const dt = Math.min(chunk, remaining);
    cursor += dt * 1000;
    next = tickOnce(next, dt, cursor, rng);
    remaining -= dt;
  }
  return { ...next, lastTickAt: state.lastTickAt + Math.min(elapsedSec, MAX_OFFLINE_SECONDS) * 1000 };
}

/** Run catch-up for time spent away and log a summary if it mattered. */
export function catchUpFromOffline(state: PlanetSimState, now: number = Date.now()): PlanetSimState {
  const elapsed = clamp((now - state.lastTickAt) / 1000, 0, MAX_OFFLINE_SECONDS);
  if (elapsed < 5) return { ...state, lastTickAt: now };
  const before = state;
  const next = tickSim(state, elapsed);
  const mins = Math.round(elapsed / 60);
  const gainedMats = Math.round(next.resources.materials - before.resources.materials);
  const gainedFood = Math.round(next.resources.food - before.resources.food);
  const gainedEnergy = Math.round(next.resources.energy - before.resources.energy);
  const raids = next.raidCount - before.raidCount;
  const msg = `⏳ While away (${mins}m): ${gainedMats >= 0 ? '+' : ''}${gainedMats}⚙️ ${gainedFood >= 0 ? '+' : ''}${gainedFood}🌾 ${gainedEnergy >= 0 ? '+' : ''}${gainedEnergy}⚡${raids > 0 ? ` — survived ${raids} raid${raids > 1 ? 's' : ''}!` : ''}`;
  const entry: SimLogEntry = { ts: now, kind: 'INFO', msg };
  return {
    ...next,
    lastTickAt: now,
    log: [entry, ...next.log].slice(0, 40),
  };
}

// ---------------------------------------------------------------------------
// Player actions (each returns a new state)
// ---------------------------------------------------------------------------

export type ActionResult = { state: PlanetSimState; ok: boolean; msg: string };

function canAffordResources(state: PlanetSimState, cost: Partial<Record<SimResourceId, number>>): boolean {
  return (
    state.resources.energy >= (cost.energy || 0) &&
    state.resources.materials >= (cost.materials || 0) &&
    state.resources.food >= (cost.food || 0)
  );
}

function payResources(state: PlanetSimState, cost: Partial<Record<SimResourceId, number>>): PlanetSimState {
  return {
    ...state,
    resources: {
      energy: state.resources.energy - (cost.energy || 0),
      materials: state.resources.materials - (cost.materials || 0),
      food: state.resources.food - (cost.food || 0),
    },
  };
}

function withLog(state: PlanetSimState, kind: SimLogEntry['kind'], msg: string): PlanetSimState {
  return { ...state, log: [{ ts: Date.now(), kind, msg }, ...state.log].slice(0, 40) };
}

export function developRegion(state: PlanetSimState, regionId: string): ActionResult {
  const region = state.regions.find((r) => r.id === regionId);
  if (!region) return { state, ok: false, msg: 'Unknown region.' };
  if (region.development >= MAX_DEVELOPMENT) return { state, ok: false, msg: 'Region is fully developed.' };
  const cost = developCost(region.development);
  if (!canAffordResources(state, cost)) return { state, ok: false, msg: 'Not enough resources to develop.' };

  let next = payResources(state, cost);
  next = {
    ...next,
    regions: next.regions.map((r) => (r.id === regionId ? { ...r, development: r.development + 1 } : r)),
  };
  const def = regionDef(regionId);
  next = withLog(next, 'GOOD', `📈 ${def.name} developed to level ${region.development + 1}.`);
  return { state: next, ok: true, msg: `${def.name} is now level ${region.development + 1}!` };
}

export function buildStructure(state: PlanetSimState, regionId: string, structureId: string): ActionResult {
  const region = state.regions.find((r) => r.id === regionId);
  const def = structureDef(structureId);
  if (!region || !def) return { state, ok: false, msg: 'Invalid build target.' };
  const rDef = regionDef(regionId);
  if (def.kinds.length > 0 && !def.kinds.includes(rDef.kind)) {
    return { state, ok: false, msg: `${def.name} can't be built in ${rDef.name}.` };
  }
  if (region.development < def.minDevelopment) {
    return { state, ok: false, msg: `${def.name} requires development level ${def.minDevelopment}.` };
  }
  const owned = region.structures[structureId] || 0;
  if (owned >= def.maxCount) return { state, ok: false, msg: `${def.name} limit reached in this region.` };
  const cost = structureCost(def, owned);
  if (!canAffordResources(state, cost)) return { state, ok: false, msg: 'Not enough resources.' };

  let next = payResources(state, cost);
  next = {
    ...next,
    regions: next.regions.map((r) =>
      r.id === regionId ? { ...r, structures: { ...r.structures, [structureId]: owned + 1 } } : r
    ),
  };
  next = withLog(next, 'GOOD', `${def.icon} ${def.name} constructed in ${rDef.name}.`);
  return { state: next, ok: true, msg: `${def.name} built!` };
}

export function exploreRegion(state: PlanetSimState, regionId: string, rng: () => number = Math.random): ActionResult {
  const region = state.regions.find((r) => r.id === regionId);
  if (!region) return { state, ok: false, msg: 'Unknown region.' };
  const now = Date.now();
  if (now - region.lastExploredAt < EXPLORE_COOLDOWN_MS) return { state, ok: false, msg: 'Expedition team still recovering.' };
  if (state.resources.energy < EXPLORE_ENERGY_COST) return { state, ok: false, msg: `Needs ${EXPLORE_ENERGY_COST} energy for the expedition.` };

  let next = payResources(state, { energy: EXPLORE_ENERGY_COST });
  const def = regionDef(regionId);
  const luck = rng();
  let msg = '';

  // Loot scaled lightly with development
  const scale = 1 + region.development * 0.15;
  let mats = Math.round((8 + rng() * 14) * scale);
  let foodGain = Math.round((5 + rng() * 10) * scale);
  let energyGain = Math.round((4 + rng() * 8) * scale);
  let dust = 0;

  if (def.kind === 'FRONTIER') {
    // Dangerous: 30% hostile encounter
    if (luck < 0.3) {
      mats = Math.round(mats * 0.4);
      foodGain = 0;
      energyGain = 0;
      dust = rng() < 0.4 ? Math.round(3 + rng() * 5) : 0;
      msg = `⚠️ Expedition in ${def.name} hit a skirmish line — fought through and salvaged what they could.`;
      next = withLog(next, 'WAR', msg);
    } else {
      dust = Math.round(4 + rng() * 8);
      msg = `🚀 Deep-recon in ${def.name} discovered enemy supply caches!`;
      next = withLog(next, 'GOOD', msg);
    }
  } else if (luck < 0.12) {
    dust = Math.round(5 + rng() * 10);
    msg = `✨ Expedition in ${def.name} uncovered a buried star-dust vein!`;
    next = withLog(next, 'GOOD', msg);
  } else {
    msg = `🧭 Expedition returned from ${def.name} with supplies.`;
    next = withLog(next, 'INFO', msg);
  }

  next = {
    ...next,
    resources: {
      energy: clamp(next.resources.energy + energyGain, 0, RESOURCE_CAP),
      materials: clamp(next.resources.materials + mats, 0, RESOURCE_CAP),
      food: clamp(next.resources.food + foodGain, 0, RESOURCE_CAP),
    },
    exportPool: clamp(next.exportPool + dust, 0, EXPORT_POOL_CAP),
    regions: next.regions.map((r) =>
      r.id === regionId ? { ...r, lastExploredAt: now, exploredCount: r.exploredCount + 1 } : r
    ),
    stats: { ...next.stats, explores: next.stats.explores + 1, starDustEarned: next.stats.starDustEarned + dust },
  };

  return {
    state: next,
    ok: true,
    msg: `${msg} (+${mats}⚙️${foodGain ? ` +${foodGain}🌾` : ''}${energyGain ? ` +${energyGain}⚡` : ''}${dust ? ` +${dust}✨` : ''})`,
  };
}

export function sendEnvoy(state: PlanetSimState, factionId: SimFactionId, rng: () => number = Math.random): ActionResult {
  const faction = getFaction(state, factionId);
  const def = factionDef(factionId);
  if (!faction || def.kind !== 'ALLY_CANDIDATE') return { state, ok: false, msg: 'Invalid faction.' };
  if (faction.status === 'ALLIED') return { state, ok: false, msg: 'Already allied.' };
  const cost = { materials: 10 };
  if (!canAffordResources(state, cost)) return { state, ok: false, msg: 'Needs 10 materials for envoy gifts.' };

  const gain = 5 + Math.round(rng() * 5);
  let next = payResources(state, cost);
  next = {
    ...next,
    factions: next.factions.map((f) =>
      f.id === factionId ? { ...f, relation: clamp(f.relation + gain, 0, 100) } : f
    ),
  };
  next = withLog(next, 'INFO', `🕊️ Envoy returned: ${def.name} relation +${gain}.`);
  return { state: next, ok: true, msg: `${def.name} relation +${gain}.` };
}

export function sendTribute(state: PlanetSimState, factionId: SimFactionId, rng: () => number = Math.random): ActionResult {
  const faction = getFaction(state, factionId);
  const def = factionDef(factionId);
  if (!faction || def.kind !== 'ALLY_CANDIDATE') return { state, ok: false, msg: 'Invalid faction.' };
  if (faction.status === 'ALLIED') return { state, ok: false, msg: 'Already allied.' };
  const cost = { materials: 30, energy: 15 };
  if (!canAffordResources(state, cost)) return { state, ok: false, msg: 'Needs 30⚙️ + 15⚡ as tribute.' };

  const gain = 12 + Math.round(rng() * 6);
  let next = payResources(state, cost);
  next = {
    ...next,
    factions: next.factions.map((f) =>
      f.id === factionId ? { ...f, relation: clamp(f.relation + gain, 0, 100) } : f
    ),
  };
  next = withLog(next, 'GOOD', `🎁 Tribute impressed the ${def.name}: relation +${gain}.`);
  return { state: next, ok: true, msg: `${def.name} relation +${gain}!` };
}

export function formAlliance(state: PlanetSimState, factionId: SimFactionId): ActionResult {
  const faction = getFaction(state, factionId);
  const def = factionDef(factionId);
  if (!faction || def.kind !== 'ALLY_CANDIDATE') return { state, ok: false, msg: 'Invalid faction.' };
  if (faction.status === 'ALLIED') return { state, ok: false, msg: 'Already allied.' };
  if (faction.relation < ALLIANCE_RELATION_REQ) {
    return { state, ok: false, msg: `Requires ${ALLIANCE_RELATION_REQ} relation.` };
  }
  let next: PlanetSimState = {
    ...state,
    factions: state.factions.map((f) => (f.id === factionId ? { ...f, status: 'ALLIED' } : f)),
    stats: { ...state.stats, alliancesFormed: state.stats.alliancesFormed + 1 },
  };
  next = withLog(next, 'GOOD', `🤝 Alliance formed with the ${def.name}! ${def.allianceBonus}`);
  return { state: next, ok: true, msg: `Alliance with ${def.name} formed!` };
}

export function negotiateTruce(state: PlanetSimState, factionId: SimFactionId): ActionResult {
  // Star-dust cost is handled by the caller (player balance); here we validate + apply.
  const faction = getFaction(state, factionId);
  const def = factionDef(factionId);
  if (!faction || def.kind !== 'ENEMY') return { state, ok: false, msg: 'Invalid faction.' };
  if (faction.status === 'INTEGRATED') return { state, ok: false, msg: 'Faction already integrated.' };
  let next: PlanetSimState = {
    ...state,
    factions: state.factions.map((f) =>
      f.id === factionId ? { ...f, status: 'TRUCE', truceUntil: Date.now() + TRUCE_DURATION_MS } : f
    ),
  };
  next = { ...next, nextRaidAt: scheduleNextRaid(next, Math.random) };
  next = withLog(next, 'INFO', `🏳️ Truce signed with the ${def.name} — raids paused for ${TRUCE_DURATION_MS / 60000} minutes.`);
  return { state: next, ok: true, msg: `Truce with ${def.name} holds for ${TRUCE_DURATION_MS / 60000} min.` };
}

export function launchStrike(state: PlanetSimState, factionId: SimFactionId, rng: () => number = Math.random): ActionResult {
  const faction = getFaction(state, factionId);
  const def = factionDef(factionId);
  if (!faction || def.kind !== 'ENEMY') return { state, ok: false, msg: 'Invalid target.' };
  if (faction.status === 'INTEGRATED') return { state, ok: false, msg: 'They already serve you.' };
  if (state.fleet.frigates < 1) return { state, ok: false, msg: 'No frigates in the fleet.' };

  const attackPower = state.fleet.frigates * FRIGATE_POWER * (0.8 + rng() * 0.4);
  const winChance = attackPower / (attackPower + faction.strength);
  const roll = rng();
  const now = Date.now();

  let next: PlanetSimState = { ...state, stats: { ...state.stats, strikesLaunched: state.stats.strikesLaunched + 1 } };

  if (roll < winChance) {
    const lootMats = Math.round(20 + faction.strength * (0.8 + rng() * 0.6));
    const lootDust = Math.round(faction.strength * 0.25 + rng() * 6);
    const lostShips = Math.min(state.fleet.frigates, Math.floor(state.fleet.frigates * rng() * 0.2));
    const newStrength = Math.max(4, Math.round(faction.strength * 0.62 - 4));
    next = {
      ...next,
      resources: { ...next.resources, materials: clamp(next.resources.materials + lootMats, 0, RESOURCE_CAP) },
      exportPool: clamp(next.exportPool + lootDust, 0, EXPORT_POOL_CAP),
      fleet: { frigates: state.fleet.frigates - lostShips },
      factions: next.factions.map((f) =>
        f.id === factionId ? { ...f, strength: newStrength, subduedCount: f.subduedCount + 1, truceUntil: 0, status: f.status === 'TRUCE' ? 'AT_WAR' : f.status } : f
      ),
      stats: { ...next.stats, starDustEarned: next.stats.starDustEarned + lootDust },
    };
    next = withLog(next, 'WAR', `🚀 Strike on ${def.name} succeeded! Looted ${lootMats}⚙️ + ${lootDust}✨, enemy weakened to ${newStrength}.${lostShips ? ` Lost ${lostShips} frigate(s).` : ''}`);
    return { state: next, ok: true, msg: `Victory! ${def.name} weakened to ${newStrength}. Looted ${lootMats}⚙️ + ${lootDust}✨${lostShips ? `, lost ${lostShips} ship(s)` : ''}.` };
  } else {
    const lostShips = Math.max(1, Math.floor(state.fleet.frigates * (0.25 + rng() * 0.3)));
    next = {
      ...next,
      fleet: { frigates: Math.max(0, state.fleet.frigates - lostShips) },
      factions: next.factions.map((f) =>
        f.id === factionId ? { ...f, strength: Math.min(220, f.strength + 5), truceUntil: 0, status: f.status === 'TRUCE' ? 'AT_WAR' : f.status } : f
      ),
      nextRaidAt: Math.min(next.nextRaidAt > 0 ? next.nextRaidAt : Infinity, now + 45_000),
    };
    next = withLog(next, 'BAD', `💥 Strike on ${def.name} failed! Lost ${lostShips} frigate(s) — they will retaliate soon.`);
    return { state: next, ok: false, msg: `Strike failed. Lost ${lostShips} frigate(s); retaliation incoming!` };
  }
}

export function integrateFaction(state: PlanetSimState, factionId: SimFactionId): ActionResult {
  const faction = getFaction(state, factionId);
  const def = factionDef(factionId);
  if (!faction || def.kind !== 'ENEMY') return { state, ok: false, msg: 'Invalid faction.' };
  if (faction.status === 'INTEGRATED') return { state, ok: false, msg: 'Already integrated.' };
  if (faction.strength > INTEGRATE_MAX_STRENGTH) {
    return { state, ok: false, msg: `Subdue them below ${INTEGRATE_MAX_STRENGTH} strength first.` };
  }
  let next: PlanetSimState = {
    ...state,
    factions: state.factions.map((f) =>
      f.id === factionId ? { ...f, status: 'INTEGRATED', strength: 0, truceUntil: 0 } : f
    ),
    stats: { ...state.stats, factionsIntegrated: state.stats.factionsIntegrated + 1 },
    nextRaidAt: 0,
  };
  next = { ...next, nextRaidAt: scheduleNextRaid(next, Math.random) };
  next = withLog(next, 'GOOD', `🏴 The ${def.name} surrendered and now serve your world! ${def.allianceBonus}`);
  return { state: next, ok: true, msg: `${def.name} integrated into your dominion!` };
}

export function buildDefense(state: PlanetSimState, key: keyof typeof DEFENSE_DEFS): ActionResult {
  const def = DEFENSE_DEFS[key];
  const level = state.defense[key];
  if (level >= def.maxLevel) return { state, ok: false, msg: `${def.name} is at max level.` };
  const cost = def.levelCost(level);
  if (!canAffordResources(state, cost)) return { state, ok: false, msg: 'Not enough resources.' };

  let next = payResources(state, cost);
  next = { ...next, defense: { ...next.defense, [key]: level + 1 } };
  next = withLog(next, 'GOOD', `${def.icon} ${def.name} upgraded to level ${level + 1}.`);
  return { state: next, ok: true, msg: `${def.name} is now level ${level + 1}.` };
}

export function buildFrigate(state: PlanetSimState, count: number = 1): ActionResult {
  const cost = { materials: FRIGATE_COST.materials * count, energy: FRIGATE_COST.energy * count };
  if (!canAffordResources(state, cost)) return { state, ok: false, msg: 'Not enough resources for frigates.' };
  let next = payResources(state, cost);
  next = { ...next, fleet: { frigates: next.fleet.frigates + count } };
  next = withLog(next, 'INFO', `🚀 ${count} frigate${count > 1 ? 's' : ''} commissioned. Fleet: ${next.fleet.frigates}.`);
  return { state: next, ok: true, msg: `${count} frigate(s) joined the fleet!` };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function fmt(n: number): string {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return Math.floor(n).toString();
}

export function rateFmt(n: number): string {
  const sign = n >= 0 ? '+' : '';
  if (Math.abs(n) < 0.01) return `${sign}0.0/s`;
  if (Math.abs(n) < 10) return `${sign}${n.toFixed(2)}/s`;
  return `${sign}${n.toFixed(1)}/s`;
}

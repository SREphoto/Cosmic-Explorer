import type {
  Achievement,
  CheckpointInfo,
  CosmicGadget,
  Costume,
  GearItem,
  HomeCraftedTool,
  HomeFurnitureItem,
  HomeSeedType,
  LevelBiomeInfo,
  MilitaryMedal,
  RocketSkin,
  SkillNode,
  StageQuest,
} from '../types/game';

export const MODULE_MAX_LEVEL = 10;

export const EXTRA_HABITAT_UPGRADES = [
  { tier: 6, name: 'Astral Sanctuary Temple', icon: '🛕', cost: { timber: 220, quartz: 180, alloys: 140, plasmaCells: 90, starDust: 1100 }, description: 'Marble-and-gold sanctuary with a living cyan energy dome.' },
  { tier: 7, name: 'Aurora Sky Palace', icon: '🏯', cost: { timber: 300, quartz: 260, alloys: 210, plasmaCells: 140, starDust: 1600 }, description: 'Stacked crystal towers flying aurora banners above the clouds.' },
  { tier: 8, name: 'World-Tree Citadel', icon: '🌳', cost: { timber: 420, quartz: 360, alloys: 300, plasmaCells: 200, starDust: 2400 }, description: 'A living fortress grown from a bioluminescent cosmic world-tree.' }
];

export const EXTRA_STORAGE_UPGRADES = [
  { tier: 6, name: 'Phase-Locked Vault', icon: '🧊', capacity: 25000, cost: { timber: 200, quartz: 180, alloys: 150, plasmaCells: 90, starDust: 900 } },
  { tier: 7, name: 'Singularity Warehouse', icon: '🕳️', capacity: 80000, cost: { timber: 280, quartz: 250, alloys: 220, plasmaCells: 140, starDust: 1400 } },
  { tier: 8, name: 'Omniverse Matter Archive', icon: '♾️', capacity: 999999, cost: { timber: 400, quartz: 360, alloys: 320, plasmaCells: 220, starDust: 2200 } }
];

export const EXTRA_GREENHOUSE_UPGRADES = [
  { tier: 6, name: 'Nebula Arboretum', plots: 16, cost: { timber: 180, quartz: 140, alloys: 110, plasmaCells: 70, starDust: 750 } },
  { tier: 7, name: 'Aurora Canopy Conservatory', plots: 20, cost: { timber: 250, quartz: 200, alloys: 160, plasmaCells: 110, starDust: 1100 } },
  { tier: 8, name: 'Living World-Tree Grove', plots: 28, cost: { timber: 360, quartz: 300, alloys: 240, plasmaCells: 170, starDust: 1700 } }
];

export const EXTRA_GARDEN_SEEDS: Array<{
  type: HomeSeedType;
  name: string;
  icon: string;
  description: string;
  costStarDust: number;
  growthDurationSeconds: number;
  rewardStarDust: number;
  rewardDiamonds: number;
}> = [
  { type: 'NEBULA_FERN', name: 'Nebula Fern', icon: '🌿', description: 'Iridescent violet fronds that shed prismatic stardust pollen.', costStarDust: 70, growthDurationSeconds: 90, rewardStarDust: 150, rewardDiamonds: 8 },
  { type: 'SOLAR_CACTUS', name: 'Solar Cactus', icon: '🌵', description: 'Sunburst succulent that stores coronal heat as diamond nectar.', costStarDust: 95, growthDurationSeconds: 140, rewardStarDust: 200, rewardDiamonds: 14 },
  { type: 'AURORA_IVY', name: 'Aurora Ivy', icon: '🍃', description: 'Cascading cyan-rose tendrils that weave living light.', costStarDust: 130, growthDurationSeconds: 200, rewardStarDust: 280, rewardDiamonds: 22 },
  { type: 'FROST_BLOSSOM', name: 'Frostblossom', icon: '❄️', description: 'Icy diamond-center bloom that crystallizes ambient starlight.', costStarDust: 210, growthDurationSeconds: 260, rewardStarDust: 420, rewardDiamonds: 36 }
];

export const EXTRA_HOME_TOOLS: HomeCraftedTool[] = [
  { id: 'VOID_COMPASS', name: 'Voidheart Compass', level: 1, description: 'Obsidian navigator that senses the approaching darkness.', icon: '🧭', perkDescription: '+18% Void warning distance and slower void crawl', cost: { timber: 20, quartz: 30, alloys: 25, plasmaCells: 18, starDust: 140 } },
  { id: 'STAR_SICKLE', name: 'Starlight Sickle', level: 1, description: 'Crescent harvest blade that reaps extra garden yield.', icon: '🌙', perkDescription: '+40% garden Star Dust and diamond harvest', cost: { timber: 28, quartz: 18, alloys: 22, plasmaCells: 10, starDust: 110 } },
  { id: 'GRAVITON_HAMMER', name: 'Graviton Forge Hammer', level: 1, description: 'Meteorite hammer that compresses building materials.', icon: '🔨', perkDescription: 'Habitat & storage upgrades cost 15% fewer alloys', cost: { timber: 18, quartz: 22, alloys: 40, plasmaCells: 20, starDust: 160 } },
  { id: 'PRISM_SPYGLASS', name: 'Solar Prism Spyglass', level: 1, description: 'Brass-crystal spyglass for deep planetary core scans.', icon: '🔭', perkDescription: '+75% Star Dust from Star Gazing scans', cost: { timber: 12, quartz: 35, alloys: 18, plasmaCells: 22, starDust: 150 } }
];

export const EXTRA_FURNITURE: HomeFurnitureItem[] = [
  { id: 'FURN_STAR_GLOBE', name: 'Celestial Orrery', category: 'STRUCTURE', icon: '🌐', color: '#facc15', costStarDust: 85, description: 'A miniature solar system of gold rings orbiting a living star core.' },
  { id: 'FURN_VOID_LANTERN', name: 'Voidheart Lantern', category: 'LIGHTING', icon: '🕯️', color: '#a855f7', costStarDust: 55, description: 'Dark crystal lantern that drinks nearby shadows and glows violet.' },
  { id: 'FURN_COMET_BED', name: 'Comet Silk Canopy', category: 'FURNITURE', icon: '🛌', color: '#38bdf8', costStarDust: 95, description: 'Zero-g canopy bed woven from captured comet tails.' },
  { id: 'FURN_AURORA_CURTAIN', name: 'Aurora Light Curtain', category: 'LIGHTING', icon: '🎐', color: '#22d3ee', costStarDust: 70, description: 'Standing ribbons of living cyan and magenta aurora.' },
  { id: 'FURN_METEOR_GRILL', name: 'Meteorite Grill', category: 'DECOR', icon: '🍖', color: '#f97316', costStarDust: 60, description: 'Basalt hearth that cooks with captured meteor embers.' },
  { id: 'FURN_CRYSTAL_HARP', name: 'Amethyst Wind Harp', category: 'DECOR', icon: '🎶', color: '#c084fc', costStarDust: 80, description: 'Crystal strings that sing when solar wind passes through.' },
  { id: 'FURN_ORBIT_POOL', name: 'Starlight Reflecting Pool', category: 'NATURE', icon: '🌀', color: '#06b6d4', costStarDust: 120, description: 'Circular zero-g pool of liquid starlight for quiet meditation.' },
  { id: 'FURN_STAR_MAP', name: 'Holographic Star Chart', category: 'STRUCTURE', icon: '🗺️', color: '#818cf8', costStarDust: 100, description: 'Table projector mapping every constellation you have discovered.' },
  { id: 'FURN_MOON_GATE', name: 'Lunar Rune Arch', category: 'STRUCTURE', icon: '🚪', color: '#e2e8f0', costStarDust: 160, description: 'Pale stone gateway carved with glowing lunar navigation runes.' },
  { id: 'FURN_PLASMA_HEARTH', name: 'Plasma Hearth', category: 'LIGHTING', icon: '🔥', color: '#22d3ee', costStarDust: 90, description: 'Cyan-fire fireplace that warms the sanctuary without smoke.' },
  { id: 'FURN_GARDEN_OBELISK', name: 'Garden Star Obelisk', category: 'NATURE', icon: '🗼', color: '#2dd4bf', costStarDust: 130, description: 'Teal crystal pillar that accelerates nearby garden plots.' },
  { id: 'FURN_WISHING_WELL', name: 'Cosmic Wishing Well', category: 'DECOR', icon: '🪙', color: '#f59e0b', costStarDust: 145, description: 'Dark stone well that returns a trickle of stardust each dawn.' },
  { id: 'FURN_CRYSTAL_BOOKSHELF', name: 'Levitating Crystal Archive', category: 'FURNITURE', icon: '📚', color: '#67e8f9', costStarDust: 110, description: 'Floating amethyst shelves holding planetary lore tablets.' },
  { id: 'FURN_NEBULA_WINDMILL', name: 'Nebula Windmill', category: 'STRUCTURE', icon: '🌬️', color: '#f472b6', costStarDust: 170, description: 'Pastel-sailed mill that harvests solar wind into plasma cells.' },
  { id: 'FURN_SOLAR_SUNDIAL', name: 'Golden Solar Sundial', category: 'DECOR', icon: '☀️', color: '#fde047', costStarDust: 75, description: 'Brass sundial that always points toward the nearest sun planet.' },
  { id: 'FURN_MOSAIC_BENCH', name: 'Constellation Mosaic Bench', category: 'FURNITURE', icon: '🪑', color: '#fb7185', costStarDust: 65, description: 'Inlaid star-map bench for watching the void from home.' },
  { id: 'FURN_GRAVITY_HAMMOCK', name: 'Gravity Loom Hammock', category: 'FURNITURE', icon: '🪢', color: '#818cf8', costStarDust: 88, description: 'Woven graviton mesh that floats you a handspan above the lawn.' },
  { id: 'FURN_RADIO_TELESCOPE', name: 'Deep-Array Radio Dish', category: 'STRUCTURE', icon: '📡', color: '#94a3b8', costStarDust: 155, description: 'Brass-and-cyan dish that listens for distant constellation songs.' },
  { id: 'FURN_PLASMA_COFFEE', name: 'Plasma Espresso Cart', category: 'DECOR', icon: '☕', color: '#fb923c', costStarDust: 72, description: 'Steaming brass cart that brews solar-flare espresso at dawn.' },
  { id: 'FURN_CONSTELLATION_RUG', name: 'Living Constellation Rug', category: 'DECOR', icon: '🧶', color: '#c084fc', costStarDust: 58, description: 'Floor tapestry whose stars rearrange into maps you have discovered.' },
  { id: 'FURN_MOON_SCULPTURE', name: 'Moon-Phase Sculpture', category: 'DECOR', icon: '🌕', color: '#e2e8f0', costStarDust: 96, description: 'Carved lunar marble that slowly cycles through glowing phases.' },
  { id: 'FURN_SOLAR_BENCH', name: 'Sun-Warm Solar Bench', category: 'FURNITURE', icon: '🌅', color: '#fbbf24', costStarDust: 78, description: 'Gold-leaf bench that stores coronal heat for chilly nights.' },
  { id: 'FURN_CRYSTAL_RAINCHAIN', name: 'Crystal Rainchain', category: 'LIGHTING', icon: '💧', color: '#67e8f9', costStarDust: 84, description: 'Hanging prism beads that turn stardust rain into chimes of light.' },
  { id: 'FURN_NEBULA_BIRDHOUSE', name: 'Nebula Birdhouse', category: 'NATURE', icon: '🪺', color: '#f472b6', costStarDust: 64, description: 'Pastel roost for migrating comet-finches and aurora swallows.' },
  { id: 'FURN_ANTIMATTER_LAMP', name: 'Antimatter Desk Lamp', category: 'LIGHTING', icon: '💡', color: '#a78bfa', costStarDust: 110, description: 'Contained violet singularity that casts a calm reading glow.' },
  { id: 'FURN_COMET_VANE', name: 'Comet Weather Vane', category: 'DECOR', icon: '☄️', color: '#fb7185', costStarDust: 70, description: 'Spinning brass vane that always points toward the next comet.' },
  { id: 'FURN_STAR_MAILBOX', name: 'Starlight Mailbox', category: 'STRUCTURE', icon: '📫', color: '#38bdf8', costStarDust: 52, description: 'Cyan postbox that collects traveler letters and bonus star dust.' },
  { id: 'FURN_KOI_POND', name: 'Cosmic Koi Pond', category: 'NATURE', icon: '🐟', color: '#22d3ee', costStarDust: 140, description: 'Still pool of liquid starlight with glowing koi that grant luck.' },
  { id: 'FURN_VOID_GONG', name: 'Voidheart Gong', category: 'DECOR', icon: '🔔', color: '#7c3aed', costStarDust: 125, description: 'Obsidian gong whose strike pushes the darkness a little farther.' },
  { id: 'FURN_AURORA_SAIL', name: 'Aurora Garden Sail', category: 'LIGHTING', icon: '🎏', color: '#34d399', costStarDust: 92, description: 'Ribbon sail that paints the sanctuary with living aurora sheets.' },
  { id: 'FURN_METEOR_ANVIL', name: 'Meteor Forge Anvil', category: 'STRUCTURE', icon: '⚒️', color: '#f97316', costStarDust: 168, description: 'Iron-meteor anvil that sparks workshop tools to a higher craft.' },
  { id: 'FURN_SEED_VAULT', name: 'Star-Seed Vault', category: 'NATURE', icon: '🌱', color: '#86efac', costStarDust: 150, description: 'Crystal cabinet that stores extra garden seeds between seasons.' }
];

export const EXTRA_SKILL_NODES: SkillNode[] = [
  {
    id: 'COMET_ECHO',
    branch: 'MOBILITY',
    name: 'Comet Echo Trail',
    description: 'Comet boosts slam the void farther back and linger as a second pulse.',
    icon: '🌠',
    maxRank: 5,
    requiredPlayerLevel: 6,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 80}px extra Comet void pushback`
  },
  {
    id: 'VOID_ANCHOR',
    branch: 'RESILIENCE',
    name: 'Void Anchor Tether',
    description: 'Graviton tethers slow the climbing darkness and buy precious seconds.',
    icon: '⚓',
    maxRank: 5,
    requiredPlayerLevel: 5,
    costPerRank: 1,
    perkSummary: (rank) => `-${rank * 8}% Void crawl speed`
  },
  {
    id: 'ABYSSAL_TETHER',
    branch: 'RESILIENCE',
    name: 'Abyssal Distance Buffer',
    description: 'A shock-absorbing aura keeps the void edge from snapping shut as quickly.',
    icon: '🌊',
    maxRank: 5,
    requiredPlayerLevel: 9,
    costPerRank: 2,
    perkSummary: (rank) => `+${rank * 40}px extra landing void pushback`
  },
  {
    id: 'HARVEST_SURGE',
    branch: 'HARVEST',
    name: 'Planetary Harvest Surge',
    description: 'Voyages return richer timber, quartz, alloys and plasma from every landing.',
    icon: '🌾',
    maxRank: 5,
    requiredPlayerLevel: 2,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 20}% home-base supply yield`
  },
  {
    id: 'ORBITAL_FORTUNE',
    branch: 'HARVEST',
    name: 'Orbital Fortune Ring',
    description: 'Full orbits rain extra stars as the planet’s ring resonates with your path.',
    icon: '💍',
    maxRank: 5,
    requiredPlayerLevel: 4,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 3} bonus stars per full orbit`
  },
  {
    id: 'GARDEN_ALCHEMY',
    branch: 'HARVEST',
    name: 'Garden Star Alchemy',
    description: 'Greenhouse plots transmute more star dust and diamonds at harvest.',
    icon: '🧪',
    maxRank: 5,
    requiredPlayerLevel: 6,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 15}% garden harvest rewards`
  },
  {
    id: 'VOID_CARTOGRAPHY',
    branch: 'HARVEST',
    name: 'Void Cartography',
    description: 'Star Gazing scans pierce deeper planetary cores for extra star dust.',
    icon: '📜',
    maxRank: 5,
    requiredPlayerLevel: 8,
    costPerRank: 2,
    perkSummary: (rank) => `+${rank * 20}% Star Gaze star dust`
  }
];

export const EXTRA_GEAR: GearItem[] = [
  {
    id: 'HELMET_VOID',
    name: 'Voidseer Helm',
    slot: 'HELMET',
    description: 'Obsidian visor that predicts the darkness and hardens against curses.',
    icon: '🕶️',
    rarity: 'EPIC',
    stats: { voidPushbackBonus: 70, darkCurseResistancePercent: 25, magnetRadiusBonus: 20 },
    priceStars: 980,
    priceDiamonds: 18,
    requiredPlayerLevel: 8,
    unlocked: false,
    color: '#7c3aed'
  },
  {
    id: 'HELMET_AURORA',
    name: 'Aurora Crown Circlet',
    slot: 'HELMET',
    description: 'Living aurora filaments that convert starlight into XP.',
    icon: '👑',
    rarity: 'LEGENDARY',
    stats: { xpBonusPercent: 22, starValueBonusPercent: 18, freezeResistancePercent: 20 },
    priceStars: 1400,
    priceDiamonds: 28,
    requiredPlayerLevel: 11,
    unlocked: false,
    color: '#22d3ee'
  },
  {
    id: 'SUIT_HARVEST',
    name: 'Star-Reaper Duster',
    slot: 'SUIT',
    description: 'Garden-forged coat that magnetizes minerals during voyages.',
    icon: '🧥',
    rarity: 'RARE',
    stats: { diamondChanceBonusPercent: 12, starValueBonusPercent: 15, magnetRadiusBonus: 35 },
    priceStars: 620,
    priceDiamonds: 12,
    requiredPlayerLevel: 5,
    unlocked: false,
    color: '#34d399'
  },
  {
    id: 'SUIT_VOIDWALK',
    name: 'Voidwalk Pressure Suit',
    slot: 'SUIT',
    description: 'Abyssal weave that pushes the darkness and resists freeze.',
    icon: '🥋',
    rarity: 'EPIC',
    stats: { voidPushbackBonus: 140, freezeResistancePercent: 30, darkCurseResistancePercent: 20 },
    priceStars: 1250,
    priceDiamonds: 24,
    requiredPlayerLevel: 10,
    unlocked: false,
    color: '#1e1b4b'
  },
  {
    id: 'THRUSTER_AURORA',
    name: 'Aurora Sail Engine',
    slot: 'THRUSTER',
    description: 'Ribbon-sail booster that paints the sky with cyan fire.',
    icon: '🪁',
    rarity: 'EPIC',
    stats: { slingshotBonusPercent: 18, jetpackPowerBonusPercent: 20, xpBonusPercent: 12 },
    priceStars: 1100,
    priceDiamonds: 22,
    requiredPlayerLevel: 9,
    unlocked: false,
    color: '#38bdf8',
    trailEffectName: 'Aurora Ribbon',
    trailColor: '#22d3ee'
  },
  {
    id: 'THRUSTER_VOIDDRAKE',
    name: 'Void Drake Coil',
    slot: 'THRUSTER',
    description: 'Serpentine anti-gravity coil that bites the void backward.',
    icon: '🐉',
    rarity: 'LEGENDARY',
    stats: { voidPushbackBonus: 110, slingshotBonusPercent: 12, darkCurseResistancePercent: 18 },
    priceStars: 1800,
    priceDiamonds: 36,
    requiredPlayerLevel: 13,
    unlocked: false,
    color: '#a855f7',
    trailEffectName: 'Void Drake Wake',
    trailColor: '#c084fc'
  },
  {
    id: 'RELIC_ANCHOR',
    name: 'Graviton Anchor Core',
    slot: 'RELIC',
    description: 'A captured micro-singularity that tethers the void and fuels rewinds.',
    icon: '⚓',
    rarity: 'LEGENDARY',
    stats: { voidPushbackBonus: 90, rewindChargesBonus: 1, freezeResistancePercent: 15 },
    priceStars: 1600,
    priceDiamonds: 32,
    requiredPlayerLevel: 12,
    unlocked: false,
    color: '#818cf8'
  },
  {
    id: 'RELIC_HARVEST_CORNUCOPIA',
    name: 'Star Cornucopia',
    slot: 'RELIC',
    description: 'Horn of plenty that transmutes landings into diamonds and score.',
    icon: '📯',
    rarity: 'EPIC',
    stats: { diamondChanceBonusPercent: 18, starValueBonusPercent: 20, scoreBonusPercent: 15 },
    priceStars: 980,
    priceDiamonds: 20,
    requiredPlayerLevel: 7,
    unlocked: false,
    color: '#fbbf24'
  },
  {
    id: 'GEAR_VOID_CLOAK',
    name: 'Abyssal Night Cloak',
    slot: 'ACCESSORY',
    accessoryType: 'CAPE',
    description: 'A flowing void-silk cape that slows the darkness and hides your trail.',
    icon: '🧥',
    rarity: 'EPIC',
    stats: { voidPushbackBonus: 60, darkCurseResistancePercent: 15, scoreBonusPercent: 10 },
    priceStars: 740,
    priceDiamonds: 16,
    requiredPlayerLevel: 6,
    unlocked: false,
    color: '#4c1d95',
    trailEffectName: 'Night Silk',
    trailColor: '#7c3aed'
  },
  {
    id: 'GEAR_STAR_AMULET_PLUS',
    name: 'Living Star Amulet',
    slot: 'ACCESSORY',
    accessoryType: 'STAR_AMULET',
    description: 'A captured dwarf-star pendant that magnetizes nearby starlight.',
    icon: '⭐',
    rarity: 'RARE',
    stats: { magnetRadiusBonus: 50, starValueBonusPercent: 12, xpBonusPercent: 10 },
    priceStars: 520,
    priceDiamonds: 10,
    requiredPlayerLevel: 4,
    unlocked: false,
    color: '#facc15'
  }
];

export const EXTRA_COSTUMES: Costume[] = [
  {
    id: 'VOID_RANGER',
    name: 'Void Ranger Nyx',
    description: 'Abyss scout in obsidian plating with a violet targeting visor and silent night trail.',
    priceDiamonds: 80,
    unlocked: false,
    icon: '🌑',
    bodyColor: '#1e1b4b',
    accentColor: '#a855f7',
    trailColor: '#c084fc',
    hairColor: '#0f172a',
    hatType: 'VISOR'
  },
  {
    id: 'NEBULA_DANCER',
    name: 'Nebula Dancer Lyra',
    description: 'Starlight performer in rose-cyan silks with a pointed nebula hat and ribbon trail.',
    priceDiamonds: 90,
    unlocked: false,
    icon: '💃',
    bodyColor: '#ec4899',
    accentColor: '#67e8f9',
    trailColor: '#f9a8d4',
    hairColor: '#f472b6',
    hatType: 'WIZARD_HAT'
  },
  {
    id: 'STAR_KNIGHT',
    name: 'Star Knight Helios',
    description: 'Gilded paladin of the solar rim with a radiant halo and white-gold armor.',
    priceDiamonds: 110,
    unlocked: false,
    icon: '🛡️',
    bodyColor: '#f8fafc',
    accentColor: '#facc15',
    trailColor: '#fde68a',
    hairColor: '#78350f',
    hatType: 'SOLAR_HALO'
  },
  {
    id: 'COMET_ACE',
    name: 'Comet Ace Vega',
    description: 'Hotshot orbital racer with a bubble helmet, flame scarf, and amber afterburners.',
    priceDiamonds: 70,
    unlocked: false,
    icon: '🏁',
    bodyColor: '#fb923c',
    accentColor: '#38bdf8',
    trailColor: '#fdba74',
    hairColor: '#1e293b',
    hatType: 'HELMET'
  },
  {
    id: 'AURORA_SEER',
    name: 'Aurora Seer Sable',
    description: 'Cryo-mystic with frost horns, teal robes, and a living aurora cape.',
    priceDiamonds: 130,
    unlocked: false,
    icon: '🔮',
    bodyColor: '#0ea5e9',
    accentColor: '#a5f3fc',
    trailColor: '#67e8f9',
    hairColor: '#e0f2fe',
    hatType: 'CRYO_HORNS'
  },
  {
    id: 'LUNAR_MONK',
    name: 'Lunar Monk Koji',
    description: 'Barefoot moon-temple wanderer in cream robes, prayer beads, and a living crescent halo.',
    priceDiamonds: 95,
    unlocked: false,
    icon: '🧘',
    bodyColor: '#f8fafc',
    accentColor: '#fde68a',
    trailColor: '#fef08a',
    hairColor: '#1c1917',
    hatType: 'SOLAR_HALO'
  },
  {
    id: 'STORM_PILOT',
    name: 'Storm Pilot Juno',
    description: 'Thunder-fleet ace in a brass-trimmed flight jacket, visor, and crackling cyan afterburners.',
    priceDiamonds: 85,
    unlocked: false,
    icon: '🌩️',
    bodyColor: '#1e3a8a',
    accentColor: '#38bdf8',
    trailColor: '#67e8f9',
    hairColor: '#0f172a',
    hatType: 'VISOR'
  },
  {
    id: 'PHOENIX_HEIR',
    name: 'Phoenix Heir Ember',
    description: 'Reborn solar scion wrapped in living flame-feather armor with a gold rebirth crown.',
    priceDiamonds: 140,
    unlocked: false,
    icon: '🔥',
    bodyColor: '#ef4444',
    accentColor: '#fbbf24',
    trailColor: '#fb923c',
    hairColor: '#7c2d12',
    hatType: 'SOLAR_HALO'
  },
  {
    id: 'QUANTUM_THIEF',
    name: 'Quantum Thief Nyx',
    description: 'Phase-shifting cat burglar in a hooded prism cloak that leaves after-images of starlight.',
    priceDiamonds: 125,
    unlocked: false,
    icon: '🦊',
    bodyColor: '#312e81',
    accentColor: '#22d3ee',
    trailColor: '#a78bfa',
    hairColor: '#0f172a',
    hatType: 'NINJA_MASK'
  }
];

export const EXTRA_ROCKETS: RocketSkin[] = [
  {
    id: 'VOID_DRAKE',
    name: 'Void Drake Coil',
    description: 'Serpentine anti-gravity engine trailing violet gravity fire.',
    priceStars: 1800,
    unlocked: false,
    icon: '🐉',
    primaryColor: '#7c3aed',
    flameColor: '#c084fc'
  },
  {
    id: 'STARLIGHT_SAIL',
    name: 'Starlight Solar Sail',
    description: 'Gossamer photon sail that burns with pale gold starfire.',
    priceStars: 900,
    unlocked: false,
    icon: '⛵',
    primaryColor: '#fde68a',
    flameColor: '#facc15'
  },
  {
    id: 'PHOENIX_CORE',
    name: 'Phoenix Heart Engine',
    description: 'Rebirth reactor that sheds crimson-gold feathers of flame.',
    priceStars: 2200,
    unlocked: false,
    icon: '🐦',
    primaryColor: '#ef4444',
    flameColor: '#fbbf24'
  },
  {
    id: 'AURORA_WING',
    name: 'Aurora Wing Array',
    description: 'Ribbon-wing booster painting cyan and magenta light-sheets.',
    priceStars: 1400,
    unlocked: false,
    icon: '🦋',
    primaryColor: '#22d3ee',
    flameColor: '#f472b6'
  },
  {
    id: 'ICE_LANCE',
    name: 'Ice Lance Cryojet',
    description: 'Needle-thin frost engine that vents diamond-blue cryo fire.',
    priceStars: 1600,
    unlocked: false,
    icon: '❄️',
    primaryColor: '#67e8f9',
    flameColor: '#e0f2fe'
  },
  {
    id: 'CLOCKWORK',
    name: 'Clockwork Chrono Engine',
    description: 'Brass orrery thruster ticking with amber temporal exhaust.',
    priceStars: 1900,
    unlocked: false,
    icon: '⚙️',
    primaryColor: '#b45309',
    flameColor: '#fbbf24'
  },
  {
    id: 'TITAN_FORGE',
    name: 'Titan Forge Reactor',
    description: 'Heavy meteor-steel booster shedding molten gold slag trails.',
    priceStars: 2400,
    unlocked: false,
    icon: '🪨',
    primaryColor: '#78716c',
    flameColor: '#f97316'
  },
  {
    id: 'NEBULA_DRIVE',
    name: 'Nebula Drive Coil',
    description: 'Pastel plasma ring engine that unfurls a violet-cyan nebula wake.',
    priceStars: 2100,
    unlocked: false,
    icon: '🌌',
    primaryColor: '#c084fc',
    flameColor: '#22d3ee'
  }
];

export const COSMIC_GADGETS: CosmicGadget[] = [
  {
    id: 'VOID_FLARE',
    name: 'Void Flare Beacon',
    description: 'Detonates a violet shockwave that slams the climbing darkness far below you.',
    icon: '💥',
    color: '#a855f7',
    priceStars: 0,
    priceDiamonds: 0,
    chargesPerRun: 2,
    effect: 'VOID_PUSH',
    unlocked: true
  },
  {
    id: 'STAR_BURST',
    name: 'Star Burst Prism',
    description: 'Shatters a captured star into a ring of collectible starlight around you.',
    icon: '✨',
    color: '#facc15',
    priceStars: 420,
    priceDiamonds: 8,
    chargesPerRun: 3,
    effect: 'STAR_BURST',
    unlocked: false
  },
  {
    id: 'ICE_SHELL',
    name: 'Cryo Ice Shell',
    description: 'Wraps Leo in a diamond-ice aegis that ignores freeze for several seconds.',
    icon: '🧊',
    color: '#67e8f9',
    priceStars: 560,
    priceDiamonds: 12,
    chargesPerRun: 2,
    effect: 'ICE_SHIELD',
    unlocked: false
  },
  {
    id: 'DIAMOND_PRISM',
    name: 'Diamond Prism Cascade',
    description: 'Splits a prism into a shower of space diamonds you can scoop mid-flight.',
    icon: '💎',
    color: '#38bdf8',
    priceStars: 780,
    priceDiamonds: 18,
    chargesPerRun: 2,
    effect: 'DIAMOND_RAIN',
    unlocked: false
  },
  {
    id: 'ORBITAL_BEACON',
    name: 'Orbital Beacon',
    description: 'Locks a blessing onto the nearest world and yanks you into a safe landing orbit.',
    icon: '📡',
    color: '#818cf8',
    priceStars: 640,
    priceDiamonds: 14,
    chargesPerRun: 2,
    effect: 'ORBIT_BLESS',
    unlocked: false
  },
  {
    id: 'MAGNET_CORE',
    name: 'Magnet Core Pulse',
    description: 'Overcharges your tractor field so nearby stars and diamonds rush into your hands.',
    icon: '🧲',
    color: '#22d3ee',
    priceStars: 500,
    priceDiamonds: 10,
    chargesPerRun: 3,
    effect: 'MAGNET_PULSE',
    unlocked: false
  },
  {
    id: 'SOLAR_CELL',
    name: 'Solar Cell Overdrive',
    description: 'Ignites a short comet burn and showers the run in bonus score.',
    icon: '☀️',
    color: '#f59e0b',
    priceStars: 720,
    priceDiamonds: 16,
    chargesPerRun: 2,
    effect: 'SOLAR_CELL',
    unlocked: false
  },
  {
    id: 'GRAVITY_HOOK',
    name: 'Gravity Hook',
    description: 'Fires a graviton tether that slings you toward the nearest planet above.',
    icon: '🪝',
    color: '#34d399',
    priceStars: 680,
    priceDiamonds: 14,
    chargesPerRun: 3,
    effect: 'GRAVITY_HOOK',
    unlocked: false
  },
  {
    id: 'PHOENIX_CHARM',
    name: 'Phoenix Charm',
    description: 'Stores a rebirth spark — blasting the void and restoring a jetpack charge.',
    icon: '🐦',
    color: '#fb7185',
    priceStars: 1100,
    priceDiamonds: 28,
    chargesPerRun: 1,
    effect: 'PHOENIX_CHARM',
    unlocked: false
  }
];

export const EXTRA_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'STARS_4',
    title: 'Star Ocean Sovereign',
    description: 'Gather a lifetime total of 15,000 Cosmic Stars',
    category: 'STARS',
    icon: '🌟',
    badgeColor: 'from-amber-200 to-yellow-600',
    target: 15000,
    rewardStars: 2500,
    rewardDiamonds: 80
  },
  {
    id: 'DIAMONDS_3',
    title: 'Crown of Prism',
    description: 'Collect a lifetime total of 400 Space Diamonds',
    category: 'COLLECTION',
    icon: '💎',
    badgeColor: 'from-cyan-200 to-indigo-600',
    target: 400,
    rewardStars: 1500,
    rewardDiamonds: 50
  },
  {
    id: 'PLANETS_3',
    title: 'Thousand Worlds',
    description: 'Land on a lifetime total of 400 Planets',
    category: 'PLANETS',
    icon: '🪐',
    badgeColor: 'from-emerald-300 to-teal-700',
    target: 400,
    rewardStars: 1200,
    rewardDiamonds: 40
  },
  {
    id: 'JUMPS_3',
    title: 'Perfect Storm',
    description: 'Achieve 18 Consecutive Perfect Jumps in a single run',
    category: 'JUMPS',
    icon: '🎯',
    badgeColor: 'from-rose-300 to-fuchsia-700',
    target: 18,
    rewardStars: 1400,
    rewardDiamonds: 45
  },
  {
    id: 'ALTITUDE_3',
    title: 'Voidline Breaker',
    description: 'Ascend to an altitude of 15,000m in a single run',
    category: 'ALTITUDE',
    icon: '🚀',
    badgeColor: 'from-indigo-300 to-violet-800',
    target: 15000,
    rewardStars: 1800,
    rewardDiamonds: 55
  },
  {
    id: 'ORBIT_2',
    title: 'Ring Dancer',
    description: 'Complete a lifetime total of 80 full 360° planetary orbits',
    category: 'MASTERY',
    icon: '🔄',
    badgeColor: 'from-orange-300 to-amber-700',
    target: 80,
    rewardStars: 900,
    rewardDiamonds: 30
  },
  {
    id: 'SUN_2',
    title: 'Corona Champion',
    description: 'Land safely on a lifetime total of 25 Sun Planets',
    category: 'PLANETS',
    icon: '☀️',
    badgeColor: 'from-amber-300 to-orange-700',
    target: 25,
    rewardStars: 1100,
    rewardDiamonds: 35
  },
  {
    id: 'WARDROBE_2',
    title: 'Constellation Couture',
    description: 'Unlock 6 unique Cosmic Costumes',
    category: 'COLLECTION',
    icon: '👗',
    badgeColor: 'from-pink-300 to-rose-700',
    target: 6,
    rewardStars: 800,
    rewardDiamonds: 25
  },
  {
    id: 'VOID_1',
    title: 'Darkness Defier',
    description: 'Use 10 Power-Ups across your lifetime voyages',
    category: 'MASTERY',
    icon: '⚡',
    badgeColor: 'from-violet-400 to-fuchsia-700',
    target: 10,
    rewardStars: 500,
    rewardDiamonds: 18
  },
  {
    id: 'HOME_1',
    title: 'Sanctuary Steward',
    description: 'Reach Habitat Tier 3 on your Home Planet',
    category: 'MASTERY',
    icon: '🏡',
    badgeColor: 'from-lime-300 to-emerald-700',
    target: 3,
    rewardStars: 600,
    rewardDiamonds: 20
  }
];

export const EXTRA_STAGES: StageQuest[] = [
  {
    stageId: '2.3',
    stageName: 'Voidline Gauntlet',
    completed: false,
    rewardStars: 1400,
    rewardDiamonds: 40,
    objectives: [
      { id: '2.3.1', description: 'Execute 8 Consecutive Perfect Jumps', type: 'CONSECUTIVE_PERFECT_JUMPS', targetCount: 8, currentCount: 0, completed: false },
      { id: '2.3.2', description: 'Collect 6 Diamonds in a single run', type: 'COLLECT_DIAMONDS_SINGLE_RUN', targetCount: 6, currentCount: 0, completed: false },
      { id: '2.3.3', description: 'Reach an Altitude of 8,000m', type: 'REACH_ALTITUDE', targetCount: 8000, currentCount: 0, completed: false }
    ]
  },
  {
    stageId: '3.1',
    stageName: 'Corona Cartographer',
    completed: false,
    rewardStars: 1800,
    rewardDiamonds: 50,
    objectives: [
      { id: '3.1.1', description: 'Land on 5 Suns in a single run', type: 'LAND_ON_SUNS', targetCount: 5, currentCount: 0, completed: false },
      { id: '3.1.2', description: 'Collect 120 Stars in a single run', type: 'COLLECT_STARS_SINGLE_RUN', targetCount: 120, currentCount: 0, completed: false },
      { id: '3.1.3', description: 'Use 5 Power-Ups in a single run', type: 'USE_POWERUPS', targetCount: 5, currentCount: 0, completed: false }
    ]
  },
  {
    stageId: '3.2',
    stageName: 'Abyssal Cartographer',
    completed: false,
    rewardStars: 2400,
    rewardDiamonds: 65,
    objectives: [
      { id: '3.2.1', description: 'Complete 12 full rotations in a single run', type: 'FULL_ROTATIONS', targetCount: 12, currentCount: 0, completed: false },
      { id: '3.2.2', description: 'Collect 10 Diamonds in a single run', type: 'COLLECT_DIAMONDS_SINGLE_RUN', targetCount: 10, currentCount: 0, completed: false },
      { id: '3.2.3', description: 'Reach an Altitude of 12,000m', type: 'REACH_ALTITUDE', targetCount: 12000, currentCount: 0, completed: false }
    ]
  },
  {
    stageId: '4.1',
    stageName: 'Eternity Horizon',
    completed: false,
    rewardStars: 3200,
    rewardDiamonds: 80,
    objectives: [
      { id: '4.1.1', description: 'Execute 12 Consecutive Perfect Jumps', type: 'CONSECUTIVE_PERFECT_JUMPS', targetCount: 12, currentCount: 0, completed: false },
      { id: '4.1.2', description: 'Collect 200 Stars in a single run', type: 'COLLECT_STARS_SINGLE_RUN', targetCount: 200, currentCount: 0, completed: false },
      { id: '4.1.3', description: 'Reach an Altitude of 18,000m', type: 'REACH_ALTITUDE', targetCount: 18000, currentCount: 0, completed: false }
    ]
  }
];

export const EXTRA_SECTORS: LevelBiomeInfo[] = [
  {
    levelNumber: 9,
    name: 'Sector 9: Tempest Aurora Veil',
    subtitle: 'Living Lightning & Polar Fire • Planets 551 - 650',
    minPlanetIndex: 551,
    maxPlanetIndex: 650,
    bgGradient: ['#082f49', '#1d4ed8', '#4c1d95'],
    nebulaColors: ['rgba(56, 189, 248, 0.55)', 'rgba(99, 102, 241, 0.42)', 'rgba(244, 114, 182, 0.38)'],
    starColors: ['#ffffff', '#7dd3fc', '#c4b5fd', '#f9a8d4'],
    featuredTypes: ['STORM', 'AURORA', 'CLOUD', 'ICE', 'NEON'],
    themeDescription: 'Sheet-lightning nebulae, polar curtains, and storm giants spinning at lethal speed.'
  },
  {
    levelNumber: 10,
    name: 'Sector 10: Verdant Abyss Jungles',
    subtitle: 'Living Oceans & Canopy Worlds • Planets 651 - 750',
    minPlanetIndex: 651,
    maxPlanetIndex: 750,
    bgGradient: ['#022c22', '#14532d', '#0e7490'],
    nebulaColors: ['rgba(16, 185, 129, 0.52)', 'rgba(34, 211, 238, 0.40)', 'rgba(74, 222, 128, 0.32)'],
    starColors: ['#ffffff', '#bbf7d0', '#67e8f9', '#fef08a'],
    featuredTypes: ['JUNGLE', 'OCEAN', 'FUNGAL', 'GRASS', 'CELESTIAL_SANCTUARY'],
    themeDescription: 'Bioluminescent canopies, tidal ring-oceans, and breathing world-trees.'
  },
  {
    levelNumber: 11,
    name: 'Sector 11: Viridian Plague Belt',
    subtitle: 'Toxic Spores & Acid Giants • Planets 751 - 850',
    minPlanetIndex: 751,
    maxPlanetIndex: 850,
    bgGradient: ['#14532d', '#365314', '#3b0764'],
    nebulaColors: ['rgba(163, 230, 53, 0.50)', 'rgba(132, 204, 22, 0.40)', 'rgba(168, 85, 247, 0.34)'],
    starColors: ['#ffffff', '#d9f99d', '#e9d5ff', '#fde047'],
    featuredTypes: ['TOXIC', 'FUNGAL', 'DARK', 'PLASMA', 'NEBULA'],
    themeDescription: 'Acid-rain atmospheres, spore storms, and worlds that try to digest you.'
  },
  {
    levelNumber: 12,
    name: 'Sector 12: Eternity Core',
    subtitle: 'All Realities Converge • Planets 851 - 1000+',
    minPlanetIndex: 851,
    maxPlanetIndex: 1000,
    bgGradient: ['#020617', '#4c1d95', '#9f1239'],
    nebulaColors: ['rgba(244, 63, 94, 0.55)', 'rgba(168, 85, 247, 0.48)', 'rgba(56, 189, 248, 0.40)'],
    starColors: ['#ffffff', '#fda4af', '#e9d5ff', '#7dd3fc', '#fde68a'],
    featuredTypes: ['ANTIMATTER', 'NEBULA', 'AURORA', 'RINGED_GIANT', 'CELESTIAL_SANCTUARY', 'DARK'],
    themeDescription: 'The core of everything: colliding galaxies, inverted gravity, and living constellations.'
  }
];

export const EXTRA_MEDALS: MilitaryMedal[] = [
  {
    id: 'MEDAL_SECTOR_9',
    levelNumber: 9,
    name: 'Tempest Veil Cross',
    ribbonTitle: 'Aurora Lightning Ribbon',
    tier: 'PLATINUM',
    ribbonColors: ['#1d4ed8', '#22d3ee', '#c084fc', '#1d4ed8'],
    icon: '⚡',
    rankCitation: 'Awarded for riding living lightning through the Tempest Aurora Veil.',
    perkTitle: '+15% Air Steering in Storm Sectors',
    perkDescription: 'Gyro-fins lock onto aurora sheets, granting extra mid-air drift.',
    perkEffect: { type: 'STEERING_DRIFT', value: 0.15 }
  },
  {
    id: 'MEDAL_SECTOR_10',
    levelNumber: 10,
    name: 'Canopy Sovereign Order',
    ribbonTitle: 'Living Ocean Ribbon',
    tier: 'CELESTIAL',
    ribbonColors: ['#14532d', '#34d399', '#67e8f9', '#14532d'],
    icon: '🌴',
    rankCitation: 'Awarded for charting the breathing jungles and tidal ring-oceans.',
    perkTitle: '+25% Harvest Yield',
    perkDescription: 'Botanical scanners extract extra supplies from every world.',
    perkEffect: { type: 'HARVEST_MULTIPLIER', value: 0.25 }
  },
  {
    id: 'MEDAL_SECTOR_11',
    levelNumber: 11,
    name: 'Plaguebreaker Seal',
    ribbonTitle: 'Toxic Belt Ribbon',
    tier: 'CELESTIAL',
    ribbonColors: ['#365314', '#a3e635', '#7c3aed', '#365314'],
    icon: '☣️',
    rankCitation: 'Awarded for surviving spore storms and acid giant atmospheres.',
    perkTitle: '+1 Thermal Shield Charge',
    perkDescription: 'Bio-filter aura automatically deflects one fatal void contact.',
    perkEffect: { type: 'THERMAL_SHIELD', value: 1 }
  },
  {
    id: 'MEDAL_SECTOR_12',
    levelNumber: 12,
    name: 'Eternity Core Star',
    ribbonTitle: 'Omniverse Core Ribbon',
    tier: 'CELESTIAL',
    ribbonColors: ['#4c1d95', '#f43f5e', '#38bdf8', '#facc15', '#4c1d95'],
    icon: '♾️',
    rankCitation: 'The final honor: command of the Eternity Core where all realities meet.',
    perkTitle: '+25% Charge Power',
    perkDescription: 'Celestial kinetics raise slingshot ceiling and XP yield at the core.',
    perkEffect: { type: 'CHARGE_POWER', value: 0.25 }
  }
];

export const EXTRA_CHECKPOINTS: CheckpointInfo[] = [
  {
    id: 'CHECKPOINT_CITADEL',
    levelNumber: 7,
    targetPlanetIndex: 400,
    name: 'Hyper-Giant Citadel Gate',
    altitude: 220000,
    y: -220000,
    biome: 'Level 7 Apex: Hyper-Giant Citadel (Planet #400)',
    biomeName: 'Level 7 Apex: Hyper-Giant Citadel',
    description: 'Ancient ring-world fortress overlooking stardust fountains and astral ruins.',
    icon: '🏰',
    planetType: 'CELESTIAL_SANCTUARY',
    primaryColor: '#059669',
    secondaryColor: '#fbbf24',
    atmosphereColor: '#6ee7b7',
    ringColor: 'rgba(250, 204, 21, 0.7)',
    rewardStars: 5000,
    rewardXP: 10000
  },
  {
    id: 'CHECKPOINT_HORIZON',
    levelNumber: 8,
    targetPlanetIndex: 520,
    name: 'Eternity Horizon Beacon',
    altitude: 310000,
    y: -310000,
    biome: 'Level 8 Apex: Eternity Horizon (Planet #520)',
    biomeName: 'Level 8 Apex: Eternity Horizon',
    description: 'Dimensional lighthouse at the seam where parallel universes overlap.',
    icon: '🌌',
    planetType: 'ANTIMATTER',
    primaryColor: '#6d28d9',
    secondaryColor: '#f43f5e',
    atmosphereColor: '#c4b5fd',
    ringColor: 'rgba(244, 63, 94, 0.8)',
    rewardStars: 8000,
    rewardXP: 16000
  },
  {
    id: 'CHECKPOINT_TEMPEST',
    levelNumber: 9,
    targetPlanetIndex: 620,
    name: 'Stormveil Aurora Keep',
    altitude: 370000,
    y: -370000,
    biome: 'Level 9 Apex: Stormveil Keep (Planet #620)',
    biomeName: 'Level 9 Apex: Stormveil Keep',
    description: 'Lightning-crowned citadel riding a living aurora sheet.',
    icon: '⛈️',
    planetType: 'STORM',
    primaryColor: '#1d4ed8',
    secondaryColor: '#22d3ee',
    atmosphereColor: '#c4b5fd',
    ringColor: 'rgba(56, 189, 248, 0.75)',
    rewardStars: 10000,
    rewardXP: 20000
  },
  {
    id: 'CHECKPOINT_CANOPY',
    levelNumber: 10,
    targetPlanetIndex: 720,
    name: 'World-Tree Canopy Port',
    altitude: 430000,
    y: -430000,
    biome: 'Level 10 Apex: World-Tree Port (Planet #720)',
    biomeName: 'Level 10 Apex: World-Tree Port',
    description: 'Harbor grown into a living cosmic tree above tidal ring-oceans.',
    icon: '🌳',
    planetType: 'JUNGLE',
    primaryColor: '#15803d',
    secondaryColor: '#67e8f9',
    atmosphereColor: '#bbf7d0',
    ringColor: 'rgba(16, 185, 129, 0.7)',
    rewardStars: 12000,
    rewardXP: 24000
  },
  {
    id: 'CHECKPOINT_PLAGUE',
    levelNumber: 11,
    targetPlanetIndex: 820,
    name: 'Plaguebreaker Bastion',
    altitude: 490000,
    y: -490000,
    biome: 'Level 11 Apex: Plaguebreaker Bastion (Planet #820)',
    biomeName: 'Level 11 Apex: Plaguebreaker Bastion',
    description: 'Sealed bio-fortress holding the toxic belt at bay.',
    icon: '☣️',
    planetType: 'TOXIC',
    primaryColor: '#65a30d',
    secondaryColor: '#a855f7',
    atmosphereColor: '#d9f99d',
    ringColor: 'rgba(163, 230, 53, 0.65)',
    rewardStars: 14000,
    rewardXP: 28000
  },
  {
    id: 'CHECKPOINT_CORE',
    levelNumber: 12,
    targetPlanetIndex: 920,
    name: 'Eternity Core Spire',
    altitude: 560000,
    y: -560000,
    biome: 'Level 12 Apex: Eternity Core (Planet #920)',
    biomeName: 'Level 12 Apex: Eternity Core',
    description: 'The last spire, where every galaxy you have flown collapses into one horizon.',
    icon: '♾️',
    planetType: 'NEBULA',
    primaryColor: '#9f1239',
    secondaryColor: '#38bdf8',
    atmosphereColor: '#fda4af',
    ringColor: 'rgba(244, 63, 94, 0.85)',
    rewardStars: 20000,
    rewardXP: 40000
  }
];

export const MODULE_UPGRADE_PRICES = {
  MAGNET: [100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000],
  COMET: [100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000],
  MULTIPLIER: [150, 300, 600, 1200, 2500, 4000, 6500, 9500, 14000],
  JETPACK: [200, 450, 800, 1500, 3000, 4800, 7200, 10500, 15500],
  RICOCHET: [250, 500, 1000, 1800, 3500, 5400, 8000, 11500, 17000],
  REWIND: [250, 600, 1200, 2200, 4500, 7000, 10000, 14500, 21000]
};

export function hasCraftedTool(
  tools: Array<{ id: string; level?: number }> | undefined,
  id: string
): boolean {
  return !!tools?.some((t) => t.id === id && (t.level ?? 1) >= 1);
}

export function homeUpgradeCostMultiplier(tools: Array<{ id: string; level?: number }> | undefined): number {
  let m = 1;
  if (hasCraftedTool(tools, 'SOLAR_WELDER')) m *= 0.8;
  if (hasCraftedTool(tools, 'GRAVITON_HAMMER')) m *= 0.85;
  return m;
}

export function gardenGrowthMultiplier(tools: Array<{ id: string; level?: number }> | undefined): number {
  return hasCraftedTool(tools, 'STARLIGHT_CAN') ? 0.67 : 1;
}

export function gardenHarvestMultiplier(
  tools: Array<{ id: string; level?: number }> | undefined,
  harvestSkillRank = 0
): number {
  let m = 1 + harvestSkillRank * 0.15;
  if (hasCraftedTool(tools, 'STAR_SICKLE')) m *= 1.4;
  return m;
}

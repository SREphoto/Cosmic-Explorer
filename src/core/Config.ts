import { 
  Achievement, 
  CheckpointInfo, 
  ConstellationData,
  ConstellationLoreEntry,
  Costume, 
  EquippedGear, 
  GearItem, 
  GearSetBonus,
  GearStats, 
  LevelBiomeInfo, 
  LevelProgressionPerk,
  MilitaryMedal,
  PlanetLoreEntry,
  PowerUpUpgrades, 
  RocketSkin, 
  SkillNode, 
  SkillTreeAllocations, 
  SoundPackInfo,
  SpaceAnomalyData,
  StageQuest 
} from '../types/game';

export { CELESTIAL_CONSTELLATIONS, ZODIAC_CONSTELLATIONS } from './Constellations';
import {
  EXTRA_ACHIEVEMENTS,
  EXTRA_CHECKPOINTS,
  EXTRA_COSTUMES,
  EXTRA_FURNITURE,
  EXTRA_GARDEN_SEEDS,
  EXTRA_GEAR,
  EXTRA_GREENHOUSE_UPGRADES,
  EXTRA_HABITAT_UPGRADES,
  EXTRA_HOME_TOOLS,
  EXTRA_MEDALS,
  EXTRA_ROCKETS,
  EXTRA_SECTORS,
  EXTRA_SKILL_NODES,
  EXTRA_STAGES,
  EXTRA_STORAGE_UPGRADES,
  MODULE_UPGRADE_PRICES,
} from './ProgressionPack';

export { MODULE_MAX_LEVEL, hasCraftedTool, homeUpgradeCostMultiplier, gardenGrowthMultiplier, gardenHarvestMultiplier, COSMIC_GADGETS } from './ProgressionPack';

// Legacy stub
const _UNUSED_LEGACY: ConstellationData[] = [
  // 1. FIRE: ARIES ♈ (Planets 1 - 25)
  {
    id: 'ARIES',
    name: 'Aries',
    latinName: 'Aries • The Celestial Ram',
    glyph: '♈',
    element: 'FIRE',
    elementIcon: '🔥',
    elementName: 'Fire Sign',
    elementColor: '#ef4444',
    elementSecondaryColor: '#f97316',
    elementAuraColor: 'rgba(239, 68, 68, 0.45)',
    minPlanetIndex: 1,
    maxPlanetIndex: 25,
    description: 'The cardinal fire sign of bold pioneers. Blazing ember sparks and meadow world horizons.',
    elementalBuff: '+15% Slingshot Initial Velocity & Radiant Solar Coronas',
    featuredPlanetTypes: ['GRASS', 'ASTEROID', 'STANDARD', 'SUN'],
    bgGradient: ['#0b1021', '#1e1b4b', '#450a0a'],
    nebulaColors: ['rgba(239, 68, 68, 0.22)', 'rgba(249, 115, 22, 0.18)', 'rgba(250, 204, 21, 0.14)'],
    starColors: ['#ffffff', '#fecaca', '#fed7aa', '#fef08a'],
    stars: [
      { x: 0.22, y: 0.65, brightness: 1.4, size: 4.2, name: 'Hamal', isMain: true },
      { x: 0.48, y: 0.40, brightness: 1.2, size: 3.5, name: 'Sheratan', isMain: true },
      { x: 0.72, y: 0.30, brightness: 1.0, size: 3.0, name: 'Mesarthim' },
      { x: 0.88, y: 0.45, brightness: 0.9, size: 2.6, name: '41 Arietis' }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3]
    ]
  },

  // 2. EARTH: TAURUS ♉ (Planets 26 - 50)
  {
    id: 'TAURUS',
    name: 'Taurus',
    latinName: 'Taurus • The Cosmic Bull',
    glyph: '♉',
    element: 'EARTH',
    elementIcon: '🌍',
    elementName: 'Earth Sign',
    elementColor: '#10b981',
    elementSecondaryColor: '#059669',
    elementAuraColor: 'rgba(16, 185, 129, 0.45)',
    minPlanetIndex: 26,
    maxPlanetIndex: 50,
    description: 'The enduring earth sign of crystalline monoliths, emerald auroras, and dense asteroid belts.',
    elementalBuff: '+20% Diamond & Mineral Stardust Yield from Orbits',
    featuredPlanetTypes: ['CRYSTAL', 'ICE', 'ASTEROID', 'RINGED_GIANT'],
    bgGradient: ['#022c22', '#064e3b', '#1e1b4b'],
    nebulaColors: ['rgba(16, 185, 129, 0.24)', 'rgba(52, 211, 153, 0.18)', 'rgba(168, 85, 247, 0.15)'],
    starColors: ['#ffffff', '#a7f3d0', '#6ee7b7', '#fde047'],
    stars: [
      { x: 0.50, y: 0.52, brightness: 1.6, size: 4.8, name: 'Aldebaran', isMain: true }, // Glowing red giant eye
      { x: 0.32, y: 0.38, brightness: 1.1, size: 3.2, name: 'Ain' },
      { x: 0.20, y: 0.22, brightness: 1.3, size: 3.8, name: 'Elnath', isMain: true }, // Horn tip 1
      { x: 0.68, y: 0.24, brightness: 1.1, size: 3.2, name: 'Tianguan' }, // Horn tip 2
      { x: 0.76, y: 0.58, brightness: 1.0, size: 2.8, name: 'Hyades Beta' },
      { x: 0.85, y: 0.35, brightness: 1.4, size: 4.0, name: 'Pleiades Cluster', isMain: true }
    ],
    lines: [
      [2, 1],
      [1, 0],
      [0, 4],
      [4, 3],
      [3, 0],
      [0, 5]
    ]
  },

  // 3. AIR: GEMINI ♊ (Planets 51 - 75)
  {
    id: 'GEMINI',
    name: 'Gemini',
    latinName: 'Gemini • The Celestial Twins',
    glyph: '♊',
    element: 'AIR',
    elementIcon: '💨',
    elementName: 'Air Sign',
    elementColor: '#06b6d4',
    elementSecondaryColor: '#38bdf8',
    elementAuraColor: 'rgba(6, 182, 212, 0.45)',
    minPlanetIndex: 51,
    maxPlanetIndex: 75,
    description: 'The swift air sign of twin pulsars, dual orbital rings, and ethereal cyan solar wind currents.',
    elementalBuff: '+25% Mid-Air Steering Drift & Gravitational Buoyancy',
    featuredPlanetTypes: ['NEON', 'RINGED_GIANT', 'PLASMA', 'STANDARD'],
    bgGradient: ['#082f49', '#0e7490', '#164e63'],
    nebulaColors: ['rgba(6, 182, 212, 0.26)', 'rgba(56, 189, 248, 0.22)', 'rgba(129, 140, 248, 0.18)'],
    starColors: ['#ffffff', '#a5f3fc', '#bae6fd', '#e0e7ff'],
    stars: [
      { x: 0.28, y: 0.18, brightness: 1.5, size: 4.4, name: 'Castor', isMain: true },
      { x: 0.62, y: 0.18, brightness: 1.6, size: 4.6, name: 'Pollux', isMain: true },
      { x: 0.32, y: 0.42, brightness: 1.0, size: 3.0, name: 'Wasat' },
      { x: 0.65, y: 0.45, brightness: 1.1, size: 3.2, name: 'Mebsuta' },
      { x: 0.35, y: 0.72, brightness: 1.2, size: 3.5, name: 'Alhena', isMain: true },
      { x: 0.70, y: 0.75, brightness: 1.0, size: 3.0, name: 'Tejat' }
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
      [2, 3]
    ]
  },

  // 4. WATER: CANCER ♋ (Planets 76 - 100)
  {
    id: 'CANCER',
    name: 'Cancer',
    latinName: 'Cancer • The Abyssal Crab',
    glyph: '♋',
    element: 'WATER',
    elementIcon: '💧',
    elementName: 'Water Sign',
    elementColor: '#3b82f6',
    elementSecondaryColor: '#6366f1',
    elementAuraColor: 'rgba(59, 130, 246, 0.45)',
    minPlanetIndex: 76,
    maxPlanetIndex: 100,
    description: 'The intuitive water sign of bioluminescent deep space, iridescent pearl planets, and soothing tides.',
    elementalBuff: '+30% Starlight Magnet Pull Range & Safe Gravitational Enclosure',
    featuredPlanetTypes: ['ICE', 'CRYSTAL', 'CELESTIAL_SANCTUARY', 'RINGED_GIANT'],
    bgGradient: ['#0f172a', '#172554', '#311042'],
    nebulaColors: ['rgba(59, 130, 246, 0.25)', 'rgba(99, 102, 241, 0.20)', 'rgba(192, 132, 252, 0.16)'],
    starColors: ['#ffffff', '#bfdbfe', '#c7d2fe', '#e9d5ff'],
    stars: [
      { x: 0.50, y: 0.42, brightness: 1.5, size: 4.4, name: 'Praesepe Beehive', isMain: true },
      { x: 0.50, y: 0.22, brightness: 1.2, size: 3.4, name: 'Tegmine' },
      { x: 0.32, y: 0.65, brightness: 1.3, size: 3.6, name: 'Acubens', isMain: true },
      { x: 0.72, y: 0.68, brightness: 1.2, size: 3.4, name: 'Altarf', isMain: true },
      { x: 0.44, y: 0.36, brightness: 1.0, size: 2.8, name: 'Asellus Borealis' },
      { x: 0.56, y: 0.48, brightness: 1.0, size: 2.8, name: 'Asellus Australis' }
    ],
    lines: [
      [1, 0],
      [0, 2],
      [0, 3],
      [4, 0],
      [0, 5]
    ]
  },

  // 5. FIRE: LEO ♌ (Planets 101 - 125)
  {
    id: 'LEO',
    name: 'Leo',
    latinName: 'Leo • The Blazing Lion',
    glyph: '♌',
    element: 'FIRE',
    elementIcon: '🔥',
    elementName: 'Fire Sign',
    elementColor: '#f59e0b',
    elementSecondaryColor: '#ef4444',
    elementAuraColor: 'rgba(245, 158, 11, 0.45)',
    minPlanetIndex: 101,
    maxPlanetIndex: 125,
    description: 'The majestic fire sign of roaring solar flare coronas, molten magma oceans, and fierce supernovas.',
    elementalBuff: '+25% Extra Score Multiplier & Blazing Jetpack Flame Trail',
    featuredPlanetTypes: ['MAGMA', 'SUN', 'PLASMA', 'ASTEROID'],
    bgGradient: ['#2e0808', '#450a0a', '#7c2d12'],
    nebulaColors: ['rgba(245, 158, 11, 0.28)', 'rgba(239, 68, 68, 0.24)', 'rgba(251, 191, 36, 0.20)'],
    starColors: ['#ffffff', '#fde68a', '#fed7aa', '#fecaca'],
    stars: [
      { x: 0.25, y: 0.70, brightness: 1.8, size: 5.0, name: 'Regulus (Alpha Leonis)', isMain: true }, // The Heart of the Lion
      { x: 0.22, y: 0.50, brightness: 1.2, size: 3.4, name: 'Eta Leonis' },
      { x: 0.32, y: 0.32, brightness: 1.4, size: 4.0, name: 'Algieba', isMain: true },
      { x: 0.42, y: 0.20, brightness: 1.1, size: 3.2, name: 'Adhafera' },
      { x: 0.52, y: 0.16, brightness: 1.0, size: 2.8, name: 'Rasalas' },
      { x: 0.65, y: 0.38, brightness: 1.3, size: 3.6, name: 'Zosma', isMain: true },
      { x: 0.82, y: 0.48, brightness: 1.5, size: 4.2, name: 'Denebola', isMain: true }, // The Lion Tail
      { x: 0.60, y: 0.65, brightness: 1.1, size: 3.0, name: 'Chertan' }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
      [5, 6],
      [6, 7],
      [7, 0]
    ]
  },

  // 6. EARTH: VIRGO ♍ (Planets 126 - 150)
  {
    id: 'VIRGO',
    name: 'Virgo',
    latinName: 'Virgo • The Astral Maiden',
    glyph: '♍',
    element: 'EARTH',
    elementIcon: '🌍',
    elementName: 'Earth Sign',
    elementColor: '#14b8a6',
    elementSecondaryColor: '#10b981',
    elementAuraColor: 'rgba(20, 184, 166, 0.45)',
    minPlanetIndex: 126,
    maxPlanetIndex: 150,
    description: 'The analytical earth sign of pure diamond quartz spires, celestial monoliths, and astral sanctuaries.',
    elementalBuff: '+100% Checkpoint Exploration Rewards & Stone Curse Resistance',
    featuredPlanetTypes: ['CRYSTAL', 'CELESTIAL_SANCTUARY', 'GRASS', 'STANDARD'],
    bgGradient: ['#042f2e', '#0f766e', '#134e4a'],
    nebulaColors: ['rgba(20, 184, 166, 0.25)', 'rgba(45, 212, 191, 0.20)', 'rgba(250, 204, 21, 0.16)'],
    starColors: ['#ffffff', '#99f6e4', '#ccfbf1', '#fef08a'],
    stars: [
      { x: 0.62, y: 0.75, brightness: 1.9, size: 5.2, name: 'Spica (Alpha Virginis)', isMain: true },
      { x: 0.40, y: 0.50, brightness: 1.3, size: 3.8, name: 'Porrima', isMain: true },
      { x: 0.25, y: 0.35, brightness: 1.2, size: 3.4, name: 'Vindemiatrix', isMain: true },
      { x: 0.50, y: 0.30, brightness: 1.1, size: 3.0, name: 'Auva' },
      { x: 0.30, y: 0.65, brightness: 1.0, size: 2.8, name: 'Zaniah' },
      { x: 0.78, y: 0.55, brightness: 1.2, size: 3.5, name: 'Heze', isMain: true }
    ],
    lines: [
      [2, 3],
      [3, 1],
      [1, 4],
      [1, 0],
      [0, 5],
      [5, 1]
    ]
  },

  // 7. AIR: LIBRA ♎ (Planets 151 - 175)
  {
    id: 'LIBRA',
    name: 'Libra',
    latinName: 'Libra • The Cosmic Scales',
    glyph: '♎',
    element: 'AIR',
    elementIcon: '💨',
    elementName: 'Air Sign',
    elementColor: '#8b5cf6',
    elementSecondaryColor: '#06b6d4',
    elementAuraColor: 'rgba(139, 92, 246, 0.45)',
    minPlanetIndex: 151,
    maxPlanetIndex: 175,
    description: 'The harmonizing air sign of anti-gravity balance beams, prism atmospheres, and frictionless speed.',
    elementalBuff: 'Zero-Gravity Float Extension & Trajectory Precision Guide',
    featuredPlanetTypes: ['NEON', 'MECH', 'PLASMA', 'RINGED_GIANT'],
    bgGradient: ['#1e1b4b', '#2e1065', '#0284c7'],
    nebulaColors: ['rgba(139, 92, 246, 0.26)', 'rgba(192, 132, 252, 0.22)', 'rgba(56, 189, 248, 0.18)'],
    starColors: ['#ffffff', '#ddd6fe', '#c4b5fd', '#a5f3fc'],
    stars: [
      { x: 0.30, y: 0.40, brightness: 1.5, size: 4.4, name: 'Zubenelgenubi', isMain: true },
      { x: 0.70, y: 0.35, brightness: 1.6, size: 4.6, name: 'Zubeneschamali', isMain: true },
      { x: 0.22, y: 0.65, brightness: 1.2, size: 3.4, name: 'Brachium' },
      { x: 0.78, y: 0.60, brightness: 1.2, size: 3.4, name: 'Zubenelhakrabi' },
      { x: 0.50, y: 0.20, brightness: 1.1, size: 3.0, name: 'Fulx' }
    ],
    lines: [
      [4, 0],
      [4, 1],
      [0, 1],
      [0, 2],
      [1, 3]
    ]
  },

  // 8. WATER: SCORPIO ♏ (Planets 176 - 200)
  {
    id: 'SCORPIO',
    name: 'Scorpio',
    latinName: 'Scorpio • The Abyssal Scorpion',
    glyph: '♏',
    element: 'WATER',
    elementIcon: '💧',
    elementName: 'Water Sign',
    elementColor: '#a855f7',
    elementSecondaryColor: '#ec4899',
    elementAuraColor: 'rgba(168, 85, 247, 0.45)',
    minPlanetIndex: 176,
    maxPlanetIndex: 200,
    description: 'The intense water sign of dark matter vortices, mystic violet nebulae, and high-gravity vortex planets.',
    elementalBuff: 'Singularity Orbital Slingshots & +35% Void Pushback On Landings',
    featuredPlanetTypes: ['DARK', 'ANTIMATTER', 'PLASMA', 'MAGMA'],
    bgGradient: ['#2e1065', '#4c0519', '#18181b'],
    nebulaColors: ['rgba(168, 85, 247, 0.28)', 'rgba(236, 72, 153, 0.24)', 'rgba(147, 51, 234, 0.20)'],
    starColors: ['#ffffff', '#f5d0fe', '#fbcfe8', '#e9d5ff'],
    stars: [
      { x: 0.38, y: 0.38, brightness: 1.9, size: 5.2, name: 'Antares (Heart of Scorpio)', isMain: true }, // Glowing red supergiant
      { x: 0.22, y: 0.25, brightness: 1.3, size: 3.6, name: 'Graffias', isMain: true },
      { x: 0.28, y: 0.28, brightness: 1.2, size: 3.4, name: 'Dschubba' },
      { x: 0.45, y: 0.52, brightness: 1.1, size: 3.2, name: 'Larawag' },
      { x: 0.52, y: 0.65, brightness: 1.3, size: 3.6, name: 'Sargas', isMain: true },
      { x: 0.68, y: 0.75, brightness: 1.2, size: 3.4, name: 'Girtab' },
      { x: 0.82, y: 0.68, brightness: 1.6, size: 4.5, name: 'Shaula (The Stinger)', isMain: true },
      { x: 0.78, y: 0.58, brightness: 1.2, size: 3.2, name: 'Lesath' }
    ],
    lines: [
      [1, 2],
      [2, 0],
      [0, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7]
    ]
  },

  // 9. FIRE: SAGITTARIUS ♐ (Planets 201 - 250)
  {
    id: 'SAGITTARIUS',
    name: 'Sagittarius',
    latinName: 'Sagittarius • The Astral Archer',
    glyph: '♐',
    element: 'FIRE',
    elementIcon: '🔥',
    elementName: 'Fire Sign',
    elementColor: '#f97316',
    elementSecondaryColor: '#eab308',
    elementAuraColor: 'rgba(249, 115, 22, 0.45)',
    minPlanetIndex: 201,
    maxPlanetIndex: 250,
    description: 'The adventurous fire sign pointing directly at the Supermassive Galactic Center. Golden pulsar energy.',
    elementalBuff: '+40% Perfect Jump Combo Multiplier & Hyper-Speed Slingshots',
    featuredPlanetTypes: ['SUN', 'MAGMA', 'CELESTIAL_SANCTUARY', 'PLASMA'],
    bgGradient: ['#431407', '#713f12', '#451a03'],
    nebulaColors: ['rgba(249, 115, 22, 0.30)', 'rgba(234, 179, 8, 0.25)', 'rgba(239, 68, 68, 0.20)'],
    starColors: ['#ffffff', '#fde047', '#fed7aa', '#fef08a'],
    stars: [
      { x: 0.52, y: 0.65, brightness: 1.7, size: 4.8, name: 'Kaus Australis', isMain: true },
      { x: 0.75, y: 0.42, brightness: 1.5, size: 4.4, name: 'Nunki', isMain: true },
      { x: 0.68, y: 0.62, brightness: 1.3, size: 3.8, name: 'Ascella', isMain: true },
      { x: 0.48, y: 0.48, brightness: 1.3, size: 3.6, name: 'Kaus Media' },
      { x: 0.45, y: 0.32, brightness: 1.4, size: 4.0, name: 'Kaus Borealis', isMain: true },
      { x: 0.28, y: 0.52, brightness: 1.2, size: 3.4, name: 'Alnasl (Spout tip)' },
      { x: 0.85, y: 0.35, brightness: 1.1, size: 3.0, name: 'Rukbat' }
    ],
    lines: [
      [0, 2],
      [2, 1],
      [1, 4],
      [4, 3],
      [3, 0],
      [3, 5],
      [4, 5],
      [1, 6]
    ]
  },

  // 10. EARTH: CAPRICORN ♑ (Planets 251 - 300)
  {
    id: 'CAPRICORN',
    name: 'Capricorn',
    latinName: 'Capricorn • The Sea-Goat Citadel',
    glyph: '♑',
    element: 'EARTH',
    elementIcon: '🌍',
    elementName: 'Earth Sign',
    elementColor: '#15803d',
    elementSecondaryColor: '#047857',
    elementAuraColor: 'rgba(21, 128, 61, 0.45)',
    minPlanetIndex: 251,
    maxPlanetIndex: 300,
    description: 'The master architect earth sign of immortal titanium bastions, petrified monoliths, and ancient stone wards.',
    elementalBuff: 'Immunity to Void Shock & Double XP on Milestone Checkpoints',
    featuredPlanetTypes: ['MECH', 'CRYSTAL', 'ANTIMATTER', 'RINGED_GIANT'],
    bgGradient: ['#052e16', '#064e3b', '#1e293b'],
    nebulaColors: ['rgba(34, 197, 94, 0.26)', 'rgba(16, 185, 129, 0.22)', 'rgba(100, 116, 139, 0.20)'],
    starColors: ['#ffffff', '#bbf7d0', '#a7f3d0', '#cbd5e1'],
    stars: [
      { x: 0.25, y: 0.30, brightness: 1.5, size: 4.2, name: 'Algedi', isMain: true },
      { x: 0.32, y: 0.38, brightness: 1.4, size: 4.0, name: 'Dabih', isMain: true },
      { x: 0.50, y: 0.70, brightness: 1.2, size: 3.5, name: 'Marakk' },
      { x: 0.75, y: 0.45, brightness: 1.3, size: 3.8, name: 'Nashira' },
      { x: 0.85, y: 0.35, brightness: 1.6, size: 4.6, name: 'Deneb Algedi', isMain: true }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0]
    ]
  },

  // 11. AIR: AQUARIUS ♒ (Planets 301 - 400)
  {
    id: 'AQUARIUS',
    name: 'Aquarius',
    latinName: 'Aquarius • The Cosmic Water-Bearer',
    glyph: '♒',
    element: 'AIR',
    elementIcon: '💨',
    elementName: 'Air Sign',
    elementColor: '#0284c7',
    elementSecondaryColor: '#06b6d4',
    elementAuraColor: 'rgba(2, 132, 199, 0.45)',
    minPlanetIndex: 301,
    maxPlanetIndex: 400,
    description: 'The visionary air sign pouring cascading streams of stardust particles and quantum warp slipstreams.',
    elementalBuff: '+50% PowerUp Duration & Free Jetpack Charge Generation',
    featuredPlanetTypes: ['NEON', 'PLASMA', 'CELESTIAL_SANCTUARY', 'RINGED_GIANT'],
    bgGradient: ['#082f49', '#0369a1', '#1e1b4b'],
    nebulaColors: ['rgba(2, 132, 199, 0.30)', 'rgba(6, 182, 212, 0.25)', 'rgba(168, 85, 247, 0.20)'],
    starColors: ['#ffffff', '#bae6fd', '#a5f3fc', '#fbcfe8'],
    stars: [
      { x: 0.45, y: 0.25, brightness: 1.6, size: 4.6, name: 'Sadalsuud', isMain: true },
      { x: 0.58, y: 0.32, brightness: 1.5, size: 4.4, name: 'Sadalmelik', isMain: true },
      { x: 0.68, y: 0.28, brightness: 1.2, size: 3.5, name: 'Sadachbia' },
      { x: 0.55, y: 0.52, brightness: 1.1, size: 3.2, name: 'Ancha' },
      { x: 0.72, y: 0.70, brightness: 1.4, size: 4.0, name: 'Skat', isMain: true },
      { x: 0.32, y: 0.62, brightness: 1.2, size: 3.4, name: 'Situla' }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
      [0, 5],
      [5, 4]
    ]
  },

  // 12. WATER: PISCES ♓ (Planets 401 - 500+)
  {
    id: 'PISCES',
    name: 'Pisces',
    latinName: 'Pisces • The Infinite Dual Fishes',
    glyph: '♓',
    element: 'WATER',
    elementIcon: '💧',
    elementName: 'Water Sign',
    elementColor: '#6366f1',
    elementSecondaryColor: '#c084fc',
    elementAuraColor: 'rgba(99, 102, 241, 0.45)',
    minPlanetIndex: 401,
    maxPlanetIndex: 1000,
    description: 'The transcendent water sign connecting the celestial cords into the infinite omniverse singularity.',
    elementalBuff: 'Phoenix Nova Eternity Revival & +100% Cosmic XP Ascension',
    featuredPlanetTypes: ['ANTIMATTER', 'CELESTIAL_SANCTUARY', 'DARK', 'RINGED_GIANT', 'NEON'],
    bgGradient: ['#09090b', '#1e1b4b', '#3b0764'],
    nebulaColors: ['rgba(99, 102, 241, 0.35)', 'rgba(192, 132, 252, 0.30)', 'rgba(244, 63, 94, 0.25)'],
    starColors: ['#ffffff', '#c7d2fe', '#e9d5ff', '#f43f5e', '#38bdf8'],
    stars: [
      { x: 0.50, y: 0.75, brightness: 1.8, size: 5.0, name: 'Alrescha (The Celestial Knot)', isMain: true },
      // Western Fish Circlet
      { x: 0.25, y: 0.35, brightness: 1.3, size: 3.8, name: 'Gamma Piscium' },
      { x: 0.18, y: 0.45, brightness: 1.2, size: 3.4, name: 'Theta Piscium' },
      { x: 0.22, y: 0.55, brightness: 1.1, size: 3.2, name: 'Iota Piscium' },
      { x: 0.32, y: 0.48, brightness: 1.4, size: 4.0, name: 'Fumalsamakah', isMain: true },
      // Eastern Fish Cord
      { x: 0.75, y: 0.28, brightness: 1.3, size: 3.8, name: 'Torcular' },
      { x: 0.82, y: 0.40, brightness: 1.2, size: 3.5, name: 'Eta Piscium' },
      { x: 0.68, y: 0.58, brightness: 1.3, size: 3.6, name: 'Kullat Nunu', isMain: true }
    ],
    lines: [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
      [3, 0],
      [0, 7],
      [7, 6],
      [6, 5]
    ]
  }
];

// Space Anomalies (Random Event System triggered every 50 planets)
export const SPACE_ANOMALIES: SpaceAnomalyData[] = [
  {
    type: 'ASTEROID_SHOWER',
    name: 'Asteroid Belt Torrent',
    subtitle: 'Hazard Alert: Rogue Meteors Inbound!',
    icon: '☄️',
    description: 'Swarm of high-speed cosmic meteorites traversing space! Dodge or shatter them for huge bonus XP!',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    duration: 26,
    speedBoost: 1.15,
    starMultiplier: 2.0
  },
  {
    type: 'GRAVITY_SURGE',
    name: 'Hyper-Gravitational Surge',
    subtitle: 'Physics Surge: Gravitational Amplification',
    icon: '🌀',
    description: 'Planetary gravity wells surged by +60%! Enables colossal orbital slingshots and soaring leaps!',
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    duration: 28,
    gravityMultiplier: 1.6,
    speedBoost: 1.35
  },
  {
    type: 'STARLIGHT_SHOWER',
    name: 'Starlight Supernova Rain',
    subtitle: 'Cosmic Fortune: Diamond Rain Detected',
    icon: '✨',
    description: 'A distant celestial supernova showers the sector with sparkling stardust diamonds & triple star value!',
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.5)',
    duration: 30,
    starMultiplier: 3.0,
    magnetBonus: 120
  },
  {
    type: 'DARK_MATTER_PULSE',
    name: 'Dark Matter Eclipse',
    subtitle: 'Void Inversion: Abyssal Slowdown',
    icon: '🌌',
    description: 'Dense violet dark matter mist envelops space, slowing the void while spawning rare antimatter orbs.',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    duration: 25,
    voidSlowRatio: 0.35,
    starMultiplier: 2.5
  },
  {
    type: 'SOLAR_FLARE_STORM',
    name: 'Solar Coronal Tempest',
    subtitle: 'Thermal Boost: Updraft Solar Winds',
    icon: '☀️',
    description: 'Massive solar winds push upward, granting +35% launch velocity and fiery rocket aura shields!',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    duration: 28,
    speedBoost: 1.45,
    gravityMultiplier: 0.8
  },
  {
    type: 'MAGNETIC_SINGULARITY',
    name: 'Vortex Magnetic Singularity',
    subtitle: 'Starlight Vortex: Extreme Attraction',
    icon: '🧲',
    description: 'All stars and diamonds across the cosmos are pulled irresistibly into your orbit from extreme distance!',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    duration: 24,
    magnetBonus: 380,
    starMultiplier: 2.0
  }
];

// Handcrafted Dynamic & Unique Levels & Biomes
export const DYNAMIC_LEVELS: LevelBiomeInfo[] = [
  {
    levelNumber: 1,
    name: 'Sector 1: Orbit of Genesis',
    subtitle: 'Verdant Stratosphere • Planets 1 - 25',
    minPlanetIndex: 1,
    maxPlanetIndex: 25,
    bgGradient: ['#0b1021', '#1e1b4b', '#064e3b'],
    nebulaColors: ['rgba(34, 197, 94, 0.48)', 'rgba(16, 185, 129, 0.38)', 'rgba(56, 189, 248, 0.32)'],
    starColors: ['#ffffff', '#bbf7d0', '#fed7aa', '#fef08a'],
    featuredTypes: ['GRASS', 'STANDARD', 'ASTEROID', 'SUN', 'MOON', 'OCEAN'],
    themeDescription: 'Gentle orbital gravity, blooming starlight daisies, and tranquil solar wind.'
  },
  {
    levelNumber: 2,
    name: 'Sector 2: Crystalline Asteroid Belt',
    subtitle: 'Refractive Prisms • Planets 26 - 60',
    minPlanetIndex: 26,
    maxPlanetIndex: 60,
    bgGradient: ['#022c22', '#064e3b', '#1e1b4b'],
    nebulaColors: ['rgba(168, 85, 247, 0.50)', 'rgba(52, 211, 153, 0.40)', 'rgba(236, 72, 153, 0.34)'],
    starColors: ['#ffffff', '#a7f3d0', '#e9d5ff', '#fde047'],
    featuredTypes: ['CRYSTAL', 'ICE', 'ASTEROID', 'RINGED_GIANT', 'DESERT', 'MOON'],
    themeDescription: 'Floating crystal clusters, spinning amethyst rings, and rich diamond deposits.'
  },
  {
    levelNumber: 3,
    name: 'Sector 3: Binary Solaris Nexus',
    subtitle: 'Twin Coronas & Magma Crusts • Planets 61 - 100',
    minPlanetIndex: 61,
    maxPlanetIndex: 100,
    bgGradient: ['#450a0a', '#1e1b4b', '#7c2d12'],
    nebulaColors: ['rgba(239, 68, 68, 0.55)', 'rgba(249, 115, 22, 0.46)', 'rgba(250, 204, 21, 0.38)'],
    starColors: ['#ffffff', '#fecaca', '#fed7aa', '#fef08a'],
    featuredTypes: ['MAGMA', 'PLASMA', 'SUN', 'ASTEROID', 'TOXIC', 'JUNGLE'],
    themeDescription: 'Intense thermal solar updrafts (+25% launch speed) and molten basalt planets.'
  },
  {
    levelNumber: 4,
    name: 'Sector 4: Quantum Cyber Nebula',
    subtitle: 'Neon Pulsars & Digital Streams • Planets 101 - 160',
    minPlanetIndex: 101,
    maxPlanetIndex: 160,
    bgGradient: ['#082f49', '#0e7490', '#164e63'],
    nebulaColors: ['rgba(6, 182, 212, 0.55)', 'rgba(236, 72, 153, 0.46)', 'rgba(129, 140, 248, 0.40)'],
    starColors: ['#ffffff', '#a5f3fc', '#fbcfe8', '#e0e7ff'],
    featuredTypes: ['NEON', 'MECH', 'PLASMA', 'RINGED_GIANT', 'CLOUD', 'FUNGAL'],
    themeDescription: 'Pulsing cybernetic rings, electromagnetic speed trails, and gravity flips.'
  },
  {
    levelNumber: 5,
    name: 'Sector 5: Diamond Glaciers & Aurora Rim',
    subtitle: 'Super-Slick Cryo Worlds • Planets 161 - 230',
    minPlanetIndex: 161,
    maxPlanetIndex: 230,
    bgGradient: ['#0f172a', '#172554', '#311042'],
    nebulaColors: ['rgba(59, 130, 246, 0.55)', 'rgba(56, 189, 248, 0.46)', 'rgba(192, 132, 252, 0.40)'],
    starColors: ['#ffffff', '#bae6fd', '#bfdbfe', '#e9d5ff'],
    featuredTypes: ['ICE', 'CRYSTAL', 'CELESTIAL_SANCTUARY', 'RINGED_GIANT', 'AURORA', 'STORM'],
    themeDescription: 'Super-slick low-friction ice surfaces, rapid planetary spins, and cryo geysers.'
  },
  {
    levelNumber: 6,
    name: 'Sector 6: Abyssal Void Singularity',
    subtitle: 'Dark Matter & Time Dilation • Planets 231 - 320',
    minPlanetIndex: 231,
    maxPlanetIndex: 320,
    bgGradient: ['#1e1b4b', '#2e1065', '#09090b'],
    nebulaColors: ['rgba(124, 58, 237, 0.58)', 'rgba(147, 51, 234, 0.48)', 'rgba(244, 63, 94, 0.40)'],
    starColors: ['#ffffff', '#ddd6fe', '#e9d5ff', '#f43f5e'],
    featuredTypes: ['DARK', 'ANTIMATTER', 'PLASMA', 'MECH', 'TOXIC', 'NEBULA'],
    themeDescription: 'Gravitational time-dilation pull, antimatter hazards, and pulsing dark matter nodes.'
  },
  {
    levelNumber: 7,
    name: 'Sector 7: Celestial Citadel & Sanctuary',
    subtitle: 'Hyper-Giant Ring Worlds • Planets 321 - 450',
    minPlanetIndex: 321,
    maxPlanetIndex: 450,
    bgGradient: ['#052e16', '#064e3b', '#1e1b4b'],
    nebulaColors: ['rgba(34, 197, 94, 0.55)', 'rgba(16, 185, 129, 0.46)', 'rgba(250, 204, 21, 0.40)'],
    starColors: ['#ffffff', '#bbf7d0', '#fef08a', '#e0e7ff'],
    featuredTypes: ['CELESTIAL_SANCTUARY', 'RINGED_GIANT', 'CRYSTAL', 'NEON', 'JUNGLE', 'OCEAN'],
    themeDescription: 'Massive ringed hyper-giants, stardust fountains, and ancient astral ruins.'
  },
  {
    levelNumber: 8,
    name: 'Sector 8: Omniverse Eternity Horizon',
    subtitle: 'Infinite Dimension Convergence • Planets 451 - 550',
    minPlanetIndex: 451,
    maxPlanetIndex: 550,
    bgGradient: ['#09090b', '#1e1b4b', '#3b0764'],
    nebulaColors: ['rgba(99, 102, 241, 0.58)', 'rgba(192, 132, 252, 0.50)', 'rgba(244, 63, 94, 0.44)'],
    starColors: ['#ffffff', '#c7d2fe', '#e9d5ff', '#f43f5e', '#38bdf8'],
    featuredTypes: ['ANTIMATTER', 'CELESTIAL_SANCTUARY', 'DARK', 'RINGED_GIANT', 'NEON', 'STORM', 'AURORA', 'FUNGAL'],
    themeDescription: 'The pinnacle of cosmic space: all biomes converge in harmonic singularity.'
  },
  ...EXTRA_SECTORS
];

export const LEVEL_BIOMES: LevelBiomeInfo[] = DYNAMIC_LEVELS;

// Authentic Military-Style Sector Service Medals & Uniform Ribbons
export const SECTOR_MILITARY_MEDALS: MilitaryMedal[] = [
  {
    id: 'MEDAL_SECTOR_1',
    levelNumber: 1,
    name: 'Verdant Vanguard Cross',
    ribbonTitle: 'Stratosphere Expedition Ribbon',
    tier: 'BRONZE',
    ribbonColors: ['#15803d', '#22c55e', '#eab308', '#22c55e', '#15803d'],
    icon: '🎖️',
    rankCitation: 'Awarded by Cosmic High Command for pioneering orbital navigation through Sector 1 (Verdant Stratosphere).',
    perkTitle: '+1 Max Jetpack Burst',
    perkDescription: 'Emergency thrusters fitted with high-yield fuel cells, granting +1 initial jetpack rescue charge every run.',
    perkEffect: {
      type: 'JETPACK_CHARGES',
      value: 1
    }
  },
  {
    id: 'MEDAL_SECTOR_2',
    levelNumber: 2,
    name: 'Crystalline Valor Legion',
    ribbonTitle: 'Prism Refraction Ribbon',
    tier: 'SILVER',
    ribbonColors: ['#0284c7', '#38bdf8', '#e0e7ff', '#a855f7', '#0284c7'],
    icon: '🏅',
    rankCitation: 'Awarded for conquering the dense crystalline asteroid rings and prismatic hazards of Sector 2.',
    perkTitle: '+15px Cosmic Magnet Radius',
    perkDescription: 'Calibrates magnetic suit resonators to effortlessly draw stars and diamonds from +15px further away.',
    perkEffect: {
      type: 'MAGNET_RADIUS',
      value: 15
    }
  },
  {
    id: 'MEDAL_SECTOR_3',
    levelNumber: 3,
    name: 'Solaris Flame Star of Honor',
    ribbonTitle: 'Binary Sun Campaign Ribbon',
    tier: 'GOLD',
    ribbonColors: ['#b91c1c', '#f97316', '#facc15', '#f97316', '#b91c1c'],
    icon: '⭐',
    rankCitation: 'Conferred for enduring extreme coronal heat storms and navigating binary solar flares in Sector 3.',
    perkTitle: '+12% Slingshot Impulse Velocity',
    perkDescription: 'Thermal rocket nozzle boosters amplify planetary slingshot launch velocity by +12%.',
    perkEffect: {
      type: 'SLINGSHOT_BOOST',
      value: 0.12
    }
  },
  {
    id: 'MEDAL_SECTOR_4',
    levelNumber: 4,
    name: 'Cyber Slipstream Distinguished Order',
    ribbonTitle: 'Quantum Nebula Ribbon',
    tier: 'GOLD',
    ribbonColors: ['#06b6d4', '#ec4899', '#8b5cf6', '#06b6d4'],
    icon: '⚡',
    rankCitation: 'Awarded for exceptional aerodynamic skill traversing the neon pulsar streams of Sector 4.',
    perkTitle: '+25% Free Air Steering Drift',
    perkDescription: 'Micro-gyro stabilizers grant +25% mid-air directional drift and tilt responsiveness.',
    perkEffect: {
      type: 'STEERING_DRIFT',
      value: 0.25
    }
  },
  {
    id: 'MEDAL_SECTOR_5',
    levelNumber: 5,
    name: 'Cryo-Bastion Defense Cross',
    ribbonTitle: 'Diamond Aurora Ribbon',
    tier: 'PLATINUM',
    ribbonColors: ['#0f172a', '#38bdf8', '#f8fafc', '#38bdf8', '#0f172a'],
    icon: '🛡️',
    rankCitation: 'Awarded for enduring deep-space sub-zero freezing and treacherous low-friction glacial orbits in Sector 5.',
    perkTitle: '+1 Chrono Time-Warp Rewind',
    perkDescription: 'Equips a chronometric flux capacitor granting +1 emergency rewind charge per run.',
    perkEffect: {
      type: 'REWIND_CHARGES',
      value: 1
    }
  },
  {
    id: 'MEDAL_SECTOR_6',
    levelNumber: 6,
    name: 'Abyssal Void Breaker Medal',
    ribbonTitle: 'Dark Matter Citation Ribbon',
    tier: 'PLATINUM',
    ribbonColors: ['#3b0764', '#7c3aed', '#fbbf24', '#7c3aed', '#3b0764'],
    icon: '🔮',
    rankCitation: 'Awarded for escaping the dark matter event horizon and singularity gravitational well in Sector 6.',
    perkTitle: '+30% Stardust Transmutation Yield',
    perkDescription: 'Antimatter converter transmutes harvested stardust into +30% additional stars and diamond value.',
    perkEffect: {
      type: 'HARVEST_MULTIPLIER',
      value: 0.30
    }
  },
  {
    id: 'MEDAL_SECTOR_7',
    levelNumber: 7,
    name: 'Astral Sovereign Citadel Crest',
    ribbonTitle: 'Hyper-Giant Ribbon of Merit',
    tier: 'CELESTIAL',
    ribbonColors: ['#1e1b4b', '#f59e0b', '#10b981', '#f59e0b', '#1e1b4b'],
    icon: '🦅',
    rankCitation: 'Awarded for establishing command over the celestial citadels and ancient astral monoliths of Sector 7.',
    perkTitle: 'Solar Thermal Void Shield',
    perkDescription: 'Aura generates a protective thermal barrier that automatically deflects the first fatal void contact each run.',
    perkEffect: {
      type: 'THERMAL_SHIELD',
      value: 1
    }
  },
  {
    id: 'MEDAL_SECTOR_8',
    levelNumber: 8,
    name: 'Grand Omniverse Marshal Star',
    ribbonTitle: 'Eternity Singularity Ribbon',
    tier: 'CELESTIAL',
    ribbonColors: ['#4c1d95', '#ec4899', '#38bdf8', '#facc15', '#4c1d95'],
    icon: '👑',
    rankCitation: 'The supreme military honor bestowed upon grand commanders who master the infinite dimensional singularity of Sector 8.',
    perkTitle: '+20% Charge Jump Power & +50% XP',
    perkDescription: 'Unlocks peak celestial kinetic charge output (+20% power ceiling) and +50% pilot XP ascension.',
    perkEffect: {
      type: 'CHARGE_POWER',
      value: 0.20
    }
  },
  ...EXTRA_MEDALS
];

export function calculateTotalMedalBonuses(unlockedMedalIds: string[] = []) {
  let jetpackChargesBonus = 0;
  let magnetRadiusBonus = 0;
  let slingshotBoostBonus = 0;
  let steeringDriftBonus = 0;
  let rewindChargesBonus = 0;
  let harvestMultiplierBonus = 0;
  let hasThermalShield = false;
  let chargePowerBonus = 0;

  for (const medalId of unlockedMedalIds) {
    const medal = SECTOR_MILITARY_MEDALS.find((m) => m.id === medalId);
    if (!medal) continue;
    switch (medal.perkEffect.type) {
      case 'JETPACK_CHARGES':
        jetpackChargesBonus += medal.perkEffect.value;
        break;
      case 'MAGNET_RADIUS':
        magnetRadiusBonus += medal.perkEffect.value;
        break;
      case 'SLINGSHOT_BOOST':
        slingshotBoostBonus += medal.perkEffect.value;
        break;
      case 'STEERING_DRIFT':
        steeringDriftBonus += medal.perkEffect.value;
        break;
      case 'REWIND_CHARGES':
        rewindChargesBonus += medal.perkEffect.value;
        break;
      case 'HARVEST_MULTIPLIER':
        harvestMultiplierBonus += medal.perkEffect.value;
        break;
      case 'THERMAL_SHIELD':
        hasThermalShield = true;
        break;
      case 'CHARGE_POWER':
        chargePowerBonus += medal.perkEffect.value;
        break;
    }
  }

  return {
    jetpackChargesBonus,
    magnetRadiusBonus,
    slingshotBoostBonus,
    steeringDriftBonus,
    rewindChargesBonus,
    harvestMultiplierBonus,
    hasThermalShield,
    chargePowerBonus
  };
}


// Home Planet Sanctuary Systems & Blueprints
export const HOME_PLANET_BIOMES = [
  { id: 'VERDANT', name: 'Verdant Haven', description: 'Lush emerald meadows, starlight daisies, and gentle breeze.', color: '#22c55e', secondaryColor: '#15803d', icon: '🌱' },
  { id: 'CRYSTALLINE', name: 'Crystalline Oasis', description: 'Glowing amethyst spires, prism crystals, and aurora tides.', color: '#a855f7', secondaryColor: '#7e22ce', icon: '💎' },
  { id: 'CYBER', name: 'Cyber Sanctuary', description: 'Futuristic neon synth grids, digital streams, and pulse nodes.', color: '#06b6d4', secondaryColor: '#0891b2', icon: '⚡' },
  { id: 'NEBULA', name: 'Nebula Dreamscape', description: 'Iridescent star clouds, floating stardust, and celestial calm.', color: '#ec4899', secondaryColor: '#be185d', icon: '🌌' },
  { id: 'VOLCANIC', name: 'Basalt Forge', description: 'Warm volcanic basalt, thermal vents, and glowing magma crust.', color: '#f97316', secondaryColor: '#c2410c', icon: '🌋' },
  { id: 'GLACIAL', name: 'Aurora Frostland', description: 'Pristine diamond ice sheets, glacial geysers, and cyan auroras.', color: '#38bdf8', secondaryColor: '#0284c7', icon: '❄️' }
];

export const HABITAT_UPGRADES = [
  { tier: 1, name: 'Cosmonaut Outpost Tent', icon: '⛺', cost: { timber: 0, quartz: 0, alloys: 0, plasmaCells: 0, starDust: 0 }, description: 'Basic sheltered explorer camp.' },
  { tier: 2, name: 'Starlight Timber Cabin', icon: '🛖', cost: { timber: 25, quartz: 10, alloys: 5, plasmaCells: 2, starDust: 50 }, description: 'Cozy reinforced wooden cabin with stargazing porch.' },
  { tier: 3, name: 'Geodesic Bio-Dome', icon: '🏡', cost: { timber: 50, quartz: 30, alloys: 20, plasmaCells: 8, starDust: 150 }, description: 'Pressurized bio-dome with atmospheric temperature control.' },
  { tier: 4, name: 'Quantum Energy Villa', icon: '🏢', cost: { timber: 80, quartz: 60, alloys: 50, plasmaCells: 25, starDust: 350 }, description: 'Advanced habitat powered by a solar plasma micro-reactor.' },
  { tier: 5, name: 'Celestial Astral Citadel', icon: '🏰', cost: { timber: 150, quartz: 120, alloys: 100, plasmaCells: 60, starDust: 750 }, description: 'Masterpiece transcendent sanctuary commanding the cosmos.' },
  ...EXTRA_HABITAT_UPGRADES
];

export const STORAGE_UPGRADES = [
  { tier: 1, name: 'Explorer Backpack Shed', icon: '📦', capacity: 100, cost: { timber: 0, quartz: 0, alloys: 0, plasmaCells: 0, starDust: 0 } },
  { tier: 2, name: 'Reinforced Cargo Vault', icon: '🗄️', capacity: 300, cost: { timber: 20, quartz: 10, alloys: 15, plasmaCells: 0, starDust: 40 } },
  { tier: 3, name: 'Quantum Material Silo', icon: '🏭', capacity: 800, cost: { timber: 45, quartz: 35, alloys: 30, plasmaCells: 10, starDust: 120 } },
  { tier: 4, name: 'Sub-Atomic Storage Matrix', icon: '🌐', capacity: 2000, cost: { timber: 90, quartz: 70, alloys: 60, plasmaCells: 30, starDust: 300 } },
  { tier: 5, name: 'Infinite Matter Bank', icon: '🌌', capacity: 99999, cost: { timber: 160, quartz: 140, alloys: 120, plasmaCells: 75, starDust: 650 } },
  ...EXTRA_STORAGE_UPGRADES
];

export const GREENHOUSE_UPGRADES = [
  { tier: 1, name: 'Garden Soil Patch', plots: 2, cost: { timber: 0, quartz: 0, alloys: 0, plasmaCells: 0, starDust: 0 } },
  { tier: 2, name: 'Hydroponic Garden Terrace', plots: 4, cost: { timber: 15, quartz: 10, alloys: 5, plasmaCells: 0, starDust: 30 } },
  { tier: 3, name: 'Bioluminescent Greenhouse', plots: 6, cost: { timber: 35, quartz: 25, alloys: 20, plasmaCells: 5, starDust: 90 } },
  { tier: 4, name: 'Solar Flora Accelerator', plots: 8, cost: { timber: 70, quartz: 50, alloys: 40, plasmaCells: 20, starDust: 240 } },
  { tier: 5, name: 'Eden Astral Biosphere', plots: 12, cost: { timber: 130, quartz: 100, alloys: 80, plasmaCells: 50, starDust: 500 } },
  ...EXTRA_GREENHOUSE_UPGRADES
];

export const GARDEN_SEEDS: Array<{
  type: import('../types/game').HomeSeedType;
  name: string;
  icon: string;
  description: string;
  costStarDust: number;
  growthDurationSeconds: number;
  rewardStarDust: number;
  rewardDiamonds: number;
}> = [
  { type: 'STAR_DAISY', name: 'Starlight Daisy', icon: '🌼', description: 'Grows rapidly and blooms with golden stardust.', costStarDust: 15, growthDurationSeconds: 40, rewardStarDust: 35, rewardDiamonds: 2 },
  { type: 'MOON_ORCHID', name: 'Luminescent Moon Orchid', icon: '🌸', description: 'Shimmers under lunar light, yielding pure diamonds.', costStarDust: 35, growthDurationSeconds: 75, rewardStarDust: 65, rewardDiamonds: 6 },
  { type: 'VOID_ROSE', name: 'Abyssal Void Rose', icon: '🌹', description: 'Rare dark flower absorbing antimatter particles.', costStarDust: 60, growthDurationSeconds: 120, rewardStarDust: 120, rewardDiamonds: 12 },
  { type: 'LUMEN_FRUIT', name: 'Stellar Lumen Fruit Tree', icon: '🍎', description: 'Produces glowing celestial fruits bursting with energy.', costStarDust: 100, growthDurationSeconds: 180, rewardStarDust: 220, rewardDiamonds: 20 },
  { type: 'COSMIC_LOTUS', name: 'Astral Lotus of Eternity', icon: '🪷', description: 'The pinnacle of cosmic flora, radiating immense stardust.', costStarDust: 180, growthDurationSeconds: 300, rewardStarDust: 450, rewardDiamonds: 45 },
  ...EXTRA_GARDEN_SEEDS
];

export const CRAFTABLE_HOME_TOOLS: import('../types/game').HomeCraftedTool[] = [
  { id: 'GRAVITON_PICKAXE', name: 'Graviton Pickaxe', level: 1, description: 'Harvests double minerals from crystalline worlds.', icon: '⛏️', perkDescription: '+100% Astral Quartz from voyages', cost: { timber: 15, quartz: 15, alloys: 10, plasmaCells: 0, starDust: 40 } },
  { id: 'STARLIGHT_CAN', name: 'Starlight Watering Can', level: 1, description: 'Infuses garden crops with solar radiation.', icon: '🪴', perkDescription: '+50% Crop Growth Speed in Astral Garden', cost: { timber: 20, quartz: 5, alloys: 15, plasmaCells: 5, starDust: 60 } },
  { id: 'BIO_SCANNER_MK2', name: 'Spectral Bio-Scanner Mk II', level: 1, description: 'Extracts deeper planetary core data during voyages.', icon: '🔬', perkDescription: '+50% Star Dust from Planetary Star Gazing scans', cost: { timber: 10, quartz: 25, alloys: 20, plasmaCells: 15, starDust: 100 } },
  { id: 'SOLAR_WELDER', name: 'Plasma Arc Welder', level: 1, description: 'Thermal forging tool for home construction.', icon: '👨‍🏭', perkDescription: 'Reduces all Home Base upgrade costs by 20%', cost: { timber: 25, quartz: 20, alloys: 35, plasmaCells: 25, starDust: 120 } },
  ...EXTRA_HOME_TOOLS
];

export const HOME_FURNITURE_CATALOG = [
  { id: 'FURN_FIREPIT', name: 'Stardust Firepit', category: 'DECOR' as const, icon: '🔥', color: '#f97316', costStarDust: 30, description: 'Warm comforting cosmic embers for chilly space nights.' },
  { id: 'FURN_TELESCOPE', name: 'Deep Space Observatory', category: 'STRUCTURE' as const, icon: '🔭', color: '#38bdf8', costStarDust: 50, description: 'High-power optic lens for observing distant nebulae.' },
  { id: 'FURN_HAMMOCK', name: 'Cosmonaut Star Hammock', category: 'FURNITURE' as const, icon: '🛏️', color: '#a855f7', costStarDust: 40, description: 'Suspended zero-gravity hammock for peaceful rest.' },
  { id: 'FURN_LANTERNS', name: 'Bioluminescent Glow Lanterns', category: 'LIGHTING' as const, icon: '🏮', color: '#facc15', costStarDust: 25, description: 'Soft amber lanterns powered by captured solar wind.' },
  { id: 'FURN_CRYSTAL_FOUNTAIN', name: 'Astral Quartz Fountain', category: 'NATURE' as const, icon: '⛲', color: '#06b6d4', costStarDust: 75, description: 'Cascades shimmering liquid stardust in zero-g.' },
  { id: 'FURN_HOLOGRAM_EMITTER', name: 'Constellation Hologram Projector', category: 'STRUCTURE' as const, icon: '📡', color: '#ec4899', costStarDust: 90, description: 'Projects 3D models of discovered constellations into the sky.' },
  { id: 'FURN_CHIMES', name: 'Solar Wind Chimes', category: 'DECOR' as const, icon: '🎐', color: '#10b981', costStarDust: 35, description: 'Resonates musical chimes when celestial winds pass.' },
  { id: 'FURN_ROVER', name: 'Mini Exploration Rover', category: 'FURNITURE' as const, icon: '🚜', color: '#fbbf24', costStarDust: 110, description: 'Cute autonomous companion vehicle parked by base.' },
  // Exclusive Space Traveler Rare & Exotic Items
  { id: 'FURN_QUANTUM_ORB', name: 'Quantum Singularity Orb', category: 'DECOR' as const, icon: '🔮', color: '#a855f7', costStarDust: 180, description: 'A miniature contained galaxy swirling with perpetual anti-gravity starlight.' },
  { id: 'FURN_STARGATE_ARCH', name: 'Ancient Astral Stargate', category: 'STRUCTURE' as const, icon: '⛩️', color: '#38bdf8', costStarDust: 250, description: 'Mysterious celestial gateway carved with glowing inter-dimensional glyphs.' },
  { id: 'FURN_ANTIGRAV_BONSAI', name: 'Levitating Stardust Bonsai', category: 'NATURE' as const, icon: '🪴', color: '#10b981', costStarDust: 140, description: 'Bioluminescent alien flora that floats gracefully above a magnetic planter.' },
  { id: 'FURN_AURA_MONOLITH', name: 'Resonant Aura Monolith', category: 'DECOR' as const, icon: '🗿', color: '#6366f1', costStarDust: 220, description: 'Carved obsidian obelisk that pulses in harmonic resonance with passing comets.' },
  { id: 'FURN_CELESTIAL_THRONE', name: 'Sun Sovereign Throne', category: 'FURNITURE' as const, icon: '👑', color: '#f59e0b', costStarDust: 300, description: 'Gilded royal seat forged from hardened solar flares and meteorite gold.' },
  { id: 'FURN_NEBULA_AQUARIUM', name: 'Void Plasma Terrarium', category: 'LIGHTING' as const, icon: '🪼', color: '#ec4899', costStarDust: 160, description: 'Zero-g spherical habitat housing floating, bioluminescent interstellar medusae.' },
  { id: 'FURN_CRYSTAL_SPIRE', name: 'Prismatic Starlight Spire', category: 'STRUCTURE' as const, icon: '💎', color: '#06b6d4', costStarDust: 210, description: 'Towering crystal pillar that refracts cosmic starlight into rainbow sky beams.' },
  { id: 'FURN_NOMAD_TENT', name: 'Astral Nomad Pavilion', category: 'FURNITURE' as const, icon: '🎪', color: '#f43f5e', costStarDust: 175, description: 'Silken thermal tent woven from comet fibers by wandering cosmic nomads.' },
  ...EXTRA_FURNITURE
];

// ==========================================
// SPACE TRAVELERS & NOMAD TRADING POST
// ==========================================
export interface SpaceTravelerArchetype {
  id: string;
  travelerName: string;
  title: string;
  avatarIcon: string;
  shipIcon: string;
  accentColor: string;
  dialogueGreeting: string;
  possibleOffers: Array<{
    itemId: string;
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
  }>;
}

export const SPACE_TRAVELER_PROFILES: SpaceTravelerArchetype[] = [
  {
    id: 'TRAVELER_XYLAR',
    travelerName: 'Xylar the Void Collector',
    title: 'Antimatter Antiquarian',
    avatarIcon: '🧙‍♂️',
    shipIcon: '🛸',
    accentColor: '#a855f7',
    dialogueGreeting: 'Greetings, Commander! I drift along the cosmic ley-lines salvaging ancient relics. Offer me raw materials and I shall bestow upon you miraculous sanctuary artifacts!',
    possibleOffers: [
      { itemId: 'FURN_QUANTUM_ORB', rarity: 'MYTHIC', cost: { quartz: 25, plasmaCells: 15, alloys: 20, starDust: 80 } },
      { itemId: 'FURN_STARGATE_ARCH', rarity: 'MYTHIC', cost: { alloys: 40, quartz: 35, timber: 30, diamonds: 5 } },
      { itemId: 'FURN_AURA_MONOLITH', rarity: 'EXOTIC', cost: { quartz: 30, plasmaCells: 10, starDust: 60 } }
    ]
  },
  {
    id: 'TRAVELER_NOVA',
    travelerName: 'Captain Nova of Orion',
    title: 'Interstellar Guild Merchant',
    avatarIcon: '👩‍🚀',
    shipIcon: '🚀',
    accentColor: '#38bdf8',
    dialogueGreeting: 'Well met, pilot! The Orion Merchant Fleet is refitting warp thrusters. We desperately need Starlight Timber and Cosmic Alloys for ship hulls. Look at our rare furnishings!',
    possibleOffers: [
      { itemId: 'FURN_CELESTIAL_THRONE', rarity: 'MYTHIC', cost: { alloys: 45, timber: 50, stars: 300, diamonds: 8 } },
      { itemId: 'FURN_NOMAD_TENT', rarity: 'EXOTIC', cost: { timber: 35, quartz: 20, starDust: 50 } },
      { itemId: 'FURN_ROVER', rarity: 'RARE', cost: { alloys: 30, timber: 25, stars: 150 } }
    ]
  },
  {
    id: 'TRAVELER_ZEPHYR',
    travelerName: 'Botanist Zephyr',
    title: 'Extraterrestrial Flora Weaver',
    avatarIcon: '🧝',
    shipIcon: '🪐',
    accentColor: '#10b981',
    dialogueGreeting: 'Peace in the stars, friend. I seek living solar plasma and refined quartz to nourish my galactic greenhouse nursery. In return, take these blooming cosmic wonders!',
    possibleOffers: [
      { itemId: 'FURN_ANTIGRAV_BONSAI', rarity: 'EXOTIC', cost: { timber: 30, plasmaCells: 12, starDust: 45 } },
      { itemId: 'FURN_NEBULA_AQUARIUM', rarity: 'EXOTIC', cost: { quartz: 28, plasmaCells: 16, starDust: 70 } },
      { itemId: 'FURN_CRYSTAL_SPIRE', rarity: 'EXOTIC', cost: { quartz: 45, alloys: 15, diamonds: 4 } }
    ]
  },
  {
    id: 'TRAVELER_LYRA',
    travelerName: 'Lyra the Astral Artisan',
    title: 'Constellation Weaver',
    avatarIcon: '🧚',
    shipIcon: '✨',
    accentColor: '#ec4899',
    dialogueGreeting: 'Ah, what a tranquil sanctuary you have cultivated! I craft celestial decor from harvested starlight threads. Exchange your excess minerals for timeless beauty!',
    possibleOffers: [
      { itemId: 'FURN_CRYSTAL_SPIRE', rarity: 'EXOTIC', cost: { quartz: 35, timber: 25, starDust: 65 } },
      { itemId: 'FURN_NEBULA_AQUARIUM', rarity: 'EXOTIC', cost: { plasmaCells: 18, quartz: 22, starDust: 55 } },
      { itemId: 'FURN_STARGATE_ARCH', rarity: 'MYTHIC', cost: { alloys: 35, quartz: 30, plasmaCells: 20, diamonds: 6 } }
    ]
  }
];

export function generateSpaceTravelerVisit(): import('../types/game').SpaceTravelerVisit {
  const profile = SPACE_TRAVELER_PROFILES[Math.floor(Math.random() * SPACE_TRAVELER_PROFILES.length)];
  const now = Date.now();
  const departureTimestamp = now + 45 * 60 * 1000; // Departs in 45 minutes

  const offers: import('../types/game').SpaceTravelerOffer[] = profile.possibleOffers.map((off, idx) => {
    const itemDef = HOME_FURNITURE_CATALOG.find((f) => f.id === off.itemId) || HOME_FURNITURE_CATALOG[0];
    return {
      id: `offer_${profile.id}_${off.itemId}_${idx}`,
      itemId: off.itemId,
      name: itemDef.name,
      category: itemDef.category,
      icon: itemDef.icon,
      color: itemDef.color,
      description: itemDef.description,
      rarity: off.rarity,
      cost: off.cost,
      traded: false
    };
  });

  return {
    id: `visit_${profile.id}_${now}`,
    travelerName: profile.travelerName,
    title: profile.title,
    avatarIcon: profile.avatarIcon,
    shipIcon: profile.shipIcon,
    accentColor: profile.accentColor,
    dialogue: profile.dialogueGreeting,
    arrivalTimestamp: now,
    departureTimestamp,
    offers
  };
}

// ==========================================
// STAR GAZING PROCEDURAL WEATHER PRESETS
// ==========================================
export interface StarGazingWeatherConfig {
  type: string;
  name: string;
  subtitle: string;
  icon: string;
  ambientColor: string;
  secondaryColor: string;
  particleType: 'SPACE_DUST' | 'AURORA_WAVES' | 'VOLCANIC_EMBERS' | 'PLASMA_ARCS' | 'CRYSTAL_FLURRIES' | 'VOID_RIPPLES' | 'BIO_SPORES';
  particleCount: number;
  speed: number;
  description: string;
}

export function getStarGazingWeather(planetType: string): StarGazingWeatherConfig {
  switch (planetType) {
    case 'ROCKY':
    case 'ASTEROID':
    case 'DESERT':
      return {
        type: 'SPACE_DUST_STORM',
        name: 'Glittering Space Dust Stream',
        subtitle: 'Micro-Meteorite & Mineral Drift',
        icon: '✨',
        ambientColor: '#fde047',
        secondaryColor: '#94a3b8',
        particleType: 'SPACE_DUST',
        particleCount: 75,
        speed: 1.2,
        description: 'Fine cosmic stardust and shimmering silicate particles drift gently across the horizon in solar winds.'
      };
    case 'ICE':
    case 'GLACIAL':
      return {
        type: 'CRYSTALLINE_AURORA_FLURRY',
        name: 'Crystalline Snow & Cryo Aurora',
        subtitle: 'Sub-Zero Ionized Photons',
        icon: '❄️',
        ambientColor: '#38bdf8',
        secondaryColor: '#a855f7',
        particleType: 'CRYSTAL_FLURRIES',
        particleCount: 85,
        speed: 0.9,
        description: 'Translucent ice flakes swirl through luminous cyan-violet ionospheric aurora curtains.'
      };
    case 'RINGED_GIANT':
    case 'GAS_GIANT':
      return {
        type: 'SHIMMERING_AURORA_BOREALIS',
        name: 'Shimmering Magnetosphere Aurora',
        subtitle: 'Undulating Plasma Ribbons',
        icon: '🌌',
        ambientColor: '#34d399',
        secondaryColor: '#c084fc',
        particleType: 'AURORA_WAVES',
        particleCount: 60,
        speed: 0.7,
        description: 'Sweeping emerald and magenta magnetic aurora curtains dance across the upper atmosphere.'
      };
    case 'MAGMA':
    case 'SUN':
    case 'VOLCANIC':
      return {
        type: 'SOLAR_VOLCANIC_EMBERS',
        name: 'Incandescent Pyro Embers',
        subtitle: 'Thermal Updraft Sparks',
        icon: '🌋',
        ambientColor: '#f97316',
        secondaryColor: '#ef4444',
        particleType: 'VOLCANIC_EMBERS',
        particleCount: 65,
        speed: 1.5,
        description: 'Molten cinder sparks and shimmering heat distortion ripples rise from the planet’s basalt mantle.'
      };
    case 'PLASMA':
    case 'ELECTRIC':
    case 'MECH':
      return {
        type: 'IONIZED_PLASMA_DISCHARGE',
        name: 'Ionized Plasma Lightning Arcs',
        subtitle: 'High-Frequency Electromagnetic Flux',
        icon: '⚡',
        ambientColor: '#ec4899',
        secondaryColor: '#06b6d4',
        particleType: 'PLASMA_ARCS',
        particleCount: 50,
        speed: 1.8,
        description: 'Crackling static discharge sparks and branching cyan-pink energy filaments leap through the magnetosphere.'
      };
    case 'DARK':
    case 'ANTIMATTER':
      return {
        type: 'QUANTUM_GRAVITON_RIPPLES',
        name: 'Quantum Void Ripples',
        subtitle: 'Singularity Spacetime Distortion',
        icon: '🌀',
        ambientColor: '#8b5cf6',
        secondaryColor: '#475569',
        particleType: 'VOID_RIPPLES',
        particleCount: 45,
        speed: 0.6,
        description: 'Dark matter gravitational lens rings and anti-gravity void motes pulse through the spacetime fabric.'
      };
    case 'CRYSTAL':
      return {
        type: 'PRISMATIC_REFRACTION_BEAMS',
        name: 'Prismatic Crystal Sparkles',
        subtitle: 'Harmonic Starlight Refraction',
        icon: '💎',
        ambientColor: '#c084fc',
        secondaryColor: '#38bdf8',
        particleType: 'CRYSTAL_FLURRIES',
        particleCount: 70,
        speed: 1.1,
        description: 'Geometric crystal prisms refract stellar rays into dazzling rainbow motes.'
      };
    case 'GRASS':
    case 'STANDARD':
    case 'CELESTIAL_SANCTUARY':
    default:
      return {
        type: 'BIOLUMINESCENT_SPORE_DRIFT',
        name: 'Bioluminescent Spore Breeze',
        subtitle: 'Gentle Planetary Atmosphere',
        icon: '🌱',
        ambientColor: '#4ade80',
        secondaryColor: '#38bdf8',
        particleType: 'BIO_SPORES',
        particleCount: 55,
        speed: 0.8,
        description: 'Floating luminescent floral spores and gentle twilight firefly motes drift in soft atmospheric eddies.'
      };
  }
}

export const CHECKPOINT_PLANETS: CheckpointInfo[] = [
  {
    id: 'CHECKPOINT_EARTH',
    levelNumber: 1,
    targetPlanetIndex: 1,
    name: 'Earth Alpha Base',
    altitude: 0,
    y: 0,
    biome: 'Level 1: Verdant Stratosphere (Planet #1)',
    biomeName: 'Level 1: Verdant Stratosphere',
    description: 'Home world meadow base with blooming daisies, cosy cottages, and starlight observatories.',
    icon: '🌍',
    planetType: 'GRASS',
    primaryColor: '#16a34a',
    secondaryColor: '#4ade80',
    atmosphereColor: '#38bdf8',
    ringColor: 'rgba(56, 189, 248, 0.5)',
    rewardStars: 0,
    rewardXP: 0
  },
  {
    id: 'CHECKPOINT_TERRA_NOVA',
    levelNumber: 1,
    targetPlanetIndex: 25,
    name: 'Terra Nova Station',
    altitude: 12000,
    y: -12000,
    biome: 'Level 1 Apex: Terra Nova (Planet #25)',
    biomeName: 'Level 1 Apex: Terra Nova',
    description: 'Massive orbital spaceport overlooking the upper troposphere with solar energy arrays.',
    icon: '🛰️',
    planetType: 'MECH',
    primaryColor: '#0284c7',
    secondaryColor: '#38bdf8',
    atmosphereColor: '#7dd3fc',
    ringColor: 'rgba(56, 189, 248, 0.65)',
    rewardStars: 250,
    rewardXP: 500
  },
  {
    id: 'CHECKPOINT_CRYSTAL',
    levelNumber: 2,
    targetPlanetIndex: 50,
    name: 'Zephyr Haven Sanctuary',
    altitude: 26000,
    y: -26000,
    biome: 'Level 2 Apex: Zephyr Haven (Planet #50)',
    biomeName: 'Level 2 Apex: Zephyr Haven',
    description: 'Iridescent violet gas & crystalline sanctuary surrounded by shimmering aurora rings.',
    icon: '🔮',
    planetType: 'CRYSTAL',
    primaryColor: '#7c3aed',
    secondaryColor: '#c084fc',
    atmosphereColor: '#e879f9',
    ringColor: 'rgba(192, 132, 252, 0.6)',
    rewardStars: 500,
    rewardXP: 1000
  },
  {
    id: 'CHECKPOINT_MAGMA',
    levelNumber: 3,
    targetPlanetIndex: 100,
    name: 'Vulcan Forge Citadel',
    altitude: 54000,
    y: -54000,
    biome: 'Level 3 Apex: Vulcan Forge (Planet #100)',
    biomeName: 'Level 3 Apex: Vulcan Forge',
    description: 'Molten volcanic powerhouse with glowing basalt tectonic plates and solar flare coronas.',
    icon: '🌋',
    planetType: 'MAGMA',
    primaryColor: '#b91c1c',
    secondaryColor: '#f97316',
    atmosphereColor: '#fbbf24',
    ringColor: 'rgba(249, 115, 22, 0.55)',
    rewardStars: 1000,
    rewardXP: 2000
  },
  {
    id: 'CHECKPOINT_NEON',
    levelNumber: 4,
    targetPlanetIndex: 200,
    name: 'Chronos Prime Gateway',
    altitude: 110000,
    y: -110000,
    biome: 'Level 4 Apex: Chronos Prime (Planet #200)',
    biomeName: 'Level 4 Apex: Chronos Prime',
    description: 'Holographic cybernetic sphere with rotating brass clockwork gears and neon circuits.',
    icon: '⚡',
    planetType: 'NEON',
    primaryColor: '#0284c7',
    secondaryColor: '#38bdf8',
    atmosphereColor: '#67e8f9',
    ringColor: 'rgba(6, 182, 212, 0.65)',
    rewardStars: 2000,
    rewardXP: 4000
  },
  {
    id: 'CHECKPOINT_ZENITH',
    levelNumber: 5,
    targetPlanetIndex: 300,
    name: 'Astraea Celestial Sanctuary',
    altitude: 170000,
    y: -170000,
    biome: 'Level 5 Apex: Astraea (Planet #300)',
    biomeName: 'Level 5 Apex: Astraea',
    description: 'Divine golden sun sanctuary at the edge of the universe projecting eternal starlight halos.',
    icon: '✨',
    planetType: 'CELESTIAL_SANCTUARY',
    primaryColor: '#eab308',
    secondaryColor: '#fef08a',
    atmosphereColor: '#fde047',
    ringColor: 'rgba(254, 240, 138, 0.8)',
    rewardStars: 3500,
    rewardXP: 7500
  },
  {
    id: 'CHECKPOINT_OMNIVERSE',
    levelNumber: 6,
    targetPlanetIndex: 500,
    name: 'Infinity Omniverse Horizon',
    altitude: 290000,
    y: -290000,
    biome: 'Level 6 Apex: Infinity Omniverse (Planet #500)',
    biomeName: 'Level 6 Apex: Infinity Omniverse',
    description: 'Transcendent antimatter singularity bridging infinite parallel universes together.',
    icon: '🌌',
    planetType: 'ANTIMATTER',
    primaryColor: '#4c1d95',
    secondaryColor: '#db2777',
    atmosphereColor: '#f43f5e',
    ringColor: 'rgba(244, 63, 94, 0.85)',
    rewardStars: 7500,
    rewardXP: 15000
  },
  ...EXTRA_CHECKPOINTS
];

// RPG Skill Trees
export const RPG_SKILL_NODES: SkillNode[] = [
  // BRANCH 1: MOBILITY & SLINGSHOTS
  {
    id: 'GRAVITY_AFFINITY',
    branch: 'MOBILITY',
    name: 'Gravitational Affinity',
    description: 'Harness planetary gravity fields more efficiently to slingshot with immense launch speed.',
    icon: '🪐',
    maxRank: 5,
    requiredPlayerLevel: 1,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 8}% Slingshot Velocity & Gravity Assist Boost`
  },
  {
    id: 'ORBITAL_SLINGSHOT_MASTERY',
    branch: 'MOBILITY',
    name: 'Orbital Slingshot Mastery',
    description: 'Perfect timing during high-speed orbit curves grants explosive momentum and score bonuses.',
    icon: '💫',
    maxRank: 5,
    requiredPlayerLevel: 3,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 15}% Perfect Jump Velocity & +${rank * 10}% Score`
  },
  {
    id: 'AIR_DRIFT_STEERING',
    branch: 'MOBILITY',
    name: 'Sub-Orbital Aerobatics',
    description: 'Enables delicate aerodynamic flight adjustment while airborne to steer towards planets.',
    icon: '🕊️',
    maxRank: 5,
    requiredPlayerLevel: 5,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 20}% Mid-Air Gravity Steering Control`
  },
  {
    id: 'JETPACK_OVERDRIVE',
    branch: 'MOBILITY',
    name: 'Jetpack Overdrive',
    description: 'Supercharges emergency rescue thrust with hyper-velocity and extra fuel reserves.',
    icon: '🚀',
    maxRank: 5,
    requiredPlayerLevel: 8,
    costPerRank: 2,
    perkSummary: (rank) => `+${rank * 12}% Jetpack Speed & +${rank >= 3 ? (rank >= 5 ? 2 : 1) : 0} Free Jetpack Charges`
  },
  {
    id: 'COMET_PROPULSION',
    branch: 'MOBILITY',
    name: 'Comet Propulsion Pulse',
    description: 'Extends Comet Power-Up duration and boosts max flight velocity during hyper-speed.',
    icon: '☄️',
    maxRank: 5,
    requiredPlayerLevel: 12,
    costPerRank: 2,
    perkSummary: (rank) => `+${rank * 1.0}s Comet Duration & +${rank * 10}% Comet Velocity`
  },

  // BRANCH 2: MAGNETISM & ECONOMY
  {
    id: 'SUPERNOVA_MAGNET',
    branch: 'MAGNETISM',
    name: 'Supernova Magnetism',
    description: 'Expands the magnetic starlight attraction field to vacuum distant celestial collectibles.',
    icon: '🧲',
    maxRank: 5,
    requiredPlayerLevel: 1,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 35}px Magnet Aura Radius & +${rank * 1.2}s Magnet Duration`
  },
  {
    id: 'STAR_HARVESTER',
    branch: 'MAGNETISM',
    name: 'Starlight Harvester',
    description: 'Increases the value of collected stars and grants extra bonus currency per leap.',
    icon: '⭐',
    maxRank: 5,
    requiredPlayerLevel: 3,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 12}% Star Value & +${rank * 2} Bonus Stars on Orbit`
  },
  {
    id: 'DIAMOND_TRANSMUTATION',
    branch: 'MAGNETISM',
    name: 'Diamond Transmutation',
    description: 'Cosmic alchemy transforms a percentage of ordinary stars into rare sparkling Diamonds.',
    icon: '💎',
    maxRank: 5,
    requiredPlayerLevel: 6,
    costPerRank: 2,
    perkSummary: (rank) => `${rank * 6}% Chance for Stars to spawn as Rare Diamonds`
  },
  {
    id: 'COSMIC_EXPEDITION_XP',
    branch: 'MAGNETISM',
    name: 'Astral Scholar',
    description: 'Deep celestial understanding grants bonus XP from all planetary landings and orbits.',
    icon: '📜',
    maxRank: 5,
    requiredPlayerLevel: 9,
    costPerRank: 2,
    perkSummary: (rank) => `+${rank * 15}% Bonus XP from all actions & discoveries`
  },
  {
    id: 'CHECKPOINT_FORTUNE',
    branch: 'MAGNETISM',
    name: 'Galaxy Pioneer Treasure',
    description: 'Unlocking and landing on milestone checkpoint planets grants immense star bounties.',
    icon: '🏆',
    maxRank: 5,
    requiredPlayerLevel: 15,
    costPerRank: 3,
    perkSummary: (rank) => `+${rank * 25}% Checkpoint Star & Diamond Rewards`
  },

  // BRANCH 3: RESILIENCE & SURVIVAL
  {
    id: 'CRYO_INSULATION',
    branch: 'RESILIENCE',
    name: 'Cryo-Thermal Suit Weave',
    description: 'Provides advanced thermal insulation against the deadly freezing void of deep space.',
    icon: '❄️',
    maxRank: 5,
    requiredPlayerLevel: 1,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 25}% Freeze Resistance (Doubles deep space survival time)`
  },
  {
    id: 'STONE_WARD',
    branch: 'RESILIENCE',
    name: 'Aegis Stone Ward',
    description: 'Purifying celestial ward delays the petrification curse of Dark Planets significantly.',
    icon: '🗿',
    maxRank: 5,
    requiredPlayerLevel: 4,
    costPerRank: 1,
    perkSummary: (rank) => `+${rank * 20}% Dark Planet Curse Delay (Take longer to turn to stone)`
  },
  {
    id: 'VOID_REPULSOR',
    branch: 'RESILIENCE',
    name: 'Void Graviton Repulsor',
    description: 'Landing on undiscovered planets creates a sonic blast that repels the advancing void downward.',
    icon: '🛡️',
    maxRank: 5,
    requiredPlayerLevel: 7,
    costPerRank: 2,
    perkSummary: (rank) => `+${rank * 60}px Void Pushback on Landing new planets`
  },
  {
    id: 'SOLAR_SHIELD',
    branch: 'RESILIENCE',
    name: 'Solar Corona Barrier',
    description: 'Immunity to solar radiation and instant 1.5x score bonus when landing on Suns.',
    icon: '☀️',
    maxRank: 5,
    requiredPlayerLevel: 10,
    costPerRank: 2,
    perkSummary: (rank) => `+${rank * 20}% Sun Bonus Stars & +${rank * 50}px Void Repel on Sun Landing`
  },
  {
    id: 'PHOENIX_REBIRTH',
    branch: 'RESILIENCE',
    name: 'Phoenix Nova Rebirth',
    description: 'Once per run, if swallowed by the dark void, trigger an emergency solar explosion upwards!',
    icon: '🔥',
    maxRank: 1,
    requiredPlayerLevel: 15,
    costPerRank: 3,
    perkSummary: (rank) => rank >= 1 ? `Active: 1 Automatic Emergency Revival per voyage!` : 'Inactive'
  },
  ...EXTRA_SKILL_NODES
];

export interface SkillTreeBranch {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: SkillNode[];
}

export const SKILL_TREES: SkillTreeBranch[] = [
  {
    id: 'MOBILITY',
    name: 'Mobility',
    description: 'Slingshot physics, mid-air gravity steering, and hyper-velocity propulsion.',
    icon: '🚀',
    nodes: RPG_SKILL_NODES.filter((n) => n.branch === 'MOBILITY')
  },
  {
    id: 'MAGNETISM',
    name: 'Magnetism',
    description: 'Aura collection radii, diamond transmutation, and cosmic research XP bonuses.',
    icon: '🧲',
    nodes: RPG_SKILL_NODES.filter((n) => n.branch === 'MAGNETISM')
  },
  {
    id: 'RESILIENCE',
    name: 'Resilience',
    description: 'Deep freeze insulation, stone curse wards, void repulsors, and Phoenix Nova revival.',
    icon: '🛡️',
    nodes: RPG_SKILL_NODES.filter((n) => n.branch === 'RESILIENCE')
  },
  {
    id: 'HARVEST',
    name: 'Harvest',
    description: 'Planetary yield, garden alchemy, orbital fortune, and star-gaze cartography.',
    icon: '🌾',
    nodes: RPG_SKILL_NODES.filter((n) => n.branch === 'HARVEST')
  }
];

// RPG Equipment Catalogue
export const RPG_GEAR_ITEMS: GearItem[] = [
  // HELMETS
  {
    id: 'HELMET_DEFAULT',
    name: 'Explorer Bubble Helmet',
    slot: 'HELMET',
    description: 'Standard retro-futuristic spherical glass bubble helmet with gold visor rim.',
    icon: '🪖',
    rarity: 'COMMON',
    stats: {},
    priceStars: 0,
    priceDiamonds: 0,
    requiredPlayerLevel: 1,
    unlocked: true,
    color: '#38bdf8'
  },
  {
    id: 'HELMET_CHRONO',
    name: 'Chrono Cyber Visor',
    slot: 'HELMET',
    description: 'Tactical HUD calculating exact planetary orbital trajectories in real-time.',
    icon: '👓',
    rarity: 'RARE',
    stats: { slingshotBonusPercent: 15, scoreBonusPercent: 10 },
    priceStars: 350,
    priceDiamonds: 5,
    requiredPlayerLevel: 3,
    unlocked: false,
    color: '#06b6d4'
  },
  {
    id: 'HELMET_FROST',
    name: 'Cryo-Knight Crown',
    slot: 'HELMET',
    description: 'Chilled crystalline helm granting supreme thermal protection in deep cosmic space.',
    icon: '👑',
    rarity: 'EPIC',
    stats: { freezeResistancePercent: 40, darkCurseResistancePercent: 20 },
    priceStars: 750,
    priceDiamonds: 15,
    requiredPlayerLevel: 7,
    unlocked: false,
    color: '#a855f7'
  },
  {
    id: 'HELMET_ASTRAL',
    name: 'Astral Solar Halo',
    slot: 'HELMET',
    description: 'Radiant ring of perpetual solar starlight blessing the wearer with celestial wisdom.',
    icon: '✨',
    rarity: 'LEGENDARY',
    stats: { xpBonusPercent: 30, starValueBonusPercent: 25, scoreBonusPercent: 20 },
    priceStars: 1600,
    priceDiamonds: 30,
    requiredPlayerLevel: 12,
    unlocked: false,
    color: '#facc15'
  },

  // SUITS
  {
    id: 'SUIT_DEFAULT',
    name: 'Aviator Flight Jumpsuit',
    slot: 'SUIT',
    description: 'Classic durable sky-blue flight suit with insulated seams and magnetic jump boots.',
    icon: '👔',
    rarity: 'COMMON',
    stats: {},
    priceStars: 0,
    priceDiamonds: 0,
    requiredPlayerLevel: 1,
    unlocked: true,
    color: '#0284c7'
  },
  {
    id: 'SUIT_NANOTECH',
    name: 'Nanotech Warp Exosuit',
    slot: 'SUIT',
    description: 'Lightweight carbon-nanotube weave amplifying jump propulsion and jetpack thrust.',
    icon: '🥋',
    rarity: 'RARE',
    stats: { jetpackPowerBonusPercent: 20, slingshotBonusPercent: 10 },
    priceStars: 450,
    priceDiamonds: 8,
    requiredPlayerLevel: 4,
    unlocked: false,
    color: '#3b82f6'
  },
  {
    id: 'SUIT_VULCAN',
    name: 'Vulcan Titanium Cuirass',
    slot: 'SUIT',
    description: 'Heavy magma-forged armor that slams into planets with immense void-repelling shockwaves.',
    icon: '🛡️',
    rarity: 'EPIC',
    stats: { voidPushbackBonus: 120, darkCurseResistancePercent: 30 },
    priceStars: 900,
    priceDiamonds: 20,
    requiredPlayerLevel: 8,
    unlocked: false,
    color: '#ef4444'
  },
  {
    id: 'SUIT_CELESTIAL',
    name: 'Prismatic Star-Weave Shroud',
    slot: 'SUIT',
    description: 'Glistening celestial robe woven from the tails of shooting stars.',
    icon: '👘',
    rarity: 'CELESTIAL',
    stats: { starValueBonusPercent: 35, diamondChanceBonusPercent: 15, magnetRadiusBonus: 60, scoreBonusPercent: 25 },
    priceStars: 2200,
    priceDiamonds: 45,
    requiredPlayerLevel: 15,
    unlocked: false,
    color: '#ec4899'
  },

  // THRUSTERS
  {
    id: 'THRUSTER_DEFAULT',
    name: 'Apollo Chemical Booster',
    slot: 'THRUSTER',
    description: 'Reliable rocket booster discharging classic fiery orange flame trails.',
    icon: '🚀',
    rarity: 'COMMON',
    stats: {},
    priceStars: 0,
    priceDiamonds: 0,
    requiredPlayerLevel: 1,
    unlocked: true,
    color: '#f97316',
    trailEffectName: 'Golden Fire',
    trailColor: '#f97316'
  },
  {
    id: 'THRUSTER_CYBER',
    name: 'Neon Ion Pulse Engine',
    slot: 'THRUSTER',
    description: 'High-energy pulse engine creating vibrant cyan and magenta particle streams.',
    icon: '⚡',
    rarity: 'RARE',
    stats: { slingshotBonusPercent: 15, jetpackPowerBonusPercent: 15 },
    priceStars: 500,
    priceDiamonds: 10,
    requiredPlayerLevel: 5,
    unlocked: false,
    color: '#06b6d4',
    trailEffectName: 'Neon Cyber Plasma',
    trailColor: '#06b6d4'
  },
  {
    id: 'THRUSTER_DARK_MATTER',
    name: 'Dark Matter Singularity Core',
    slot: 'THRUSTER',
    description: 'Harnesses miniature black holes to project mystical purple gravity distortions.',
    icon: '🔮',
    rarity: 'EPIC',
    stats: { voidPushbackBonus: 80, darkCurseResistancePercent: 25, freezeResistancePercent: 25 },
    priceStars: 1100,
    priceDiamonds: 25,
    requiredPlayerLevel: 10,
    unlocked: false,
    color: '#a855f7',
    trailEffectName: 'Dark Matter Void',
    trailColor: '#a855f7'
  },
  {
    id: 'THRUSTER_PRISMATIC',
    name: 'Prismatic Rainbow Hyper-Drive',
    slot: 'THRUSTER',
    description: 'Cosmic light splitter unleashing a magnificent chromatic rainbow particle trail.',
    icon: '🌈',
    rarity: 'CELESTIAL',
    stats: { slingshotBonusPercent: 25, diamondChanceBonusPercent: 20, xpBonusPercent: 25, scoreBonusPercent: 30 },
    priceStars: 2800,
    priceDiamonds: 60,
    requiredPlayerLevel: 16,
    unlocked: false,
    color: '#f43f5e',
    trailEffectName: 'Prismatic Rainbow Spectrum',
    trailColor: '#f43f5e'
  },

  // RELICS
  {
    id: 'RELIC_DEFAULT',
    name: 'Starlight Compass',
    slot: 'RELIC',
    description: 'Antique brass celestial compass pointing toward the nearest planetary gravity well.',
    icon: '🧭',
    rarity: 'COMMON',
    stats: { magnetRadiusBonus: 20 },
    priceStars: 0,
    priceDiamonds: 0,
    requiredPlayerLevel: 1,
    unlocked: true,
    color: '#eab308'
  },
  {
    id: 'RELIC_CHRONOS',
    name: 'Chronos Hourglass',
    slot: 'RELIC',
    description: 'Contains cosmic sand that slows down the passage of time during critical jumps.',
    icon: '⏳',
    rarity: 'RARE',
    stats: { freezeResistancePercent: 25, darkCurseResistancePercent: 25, rewindChargesBonus: 1 },
    priceStars: 400,
    priceDiamonds: 8,
    requiredPlayerLevel: 4,
    unlocked: false,
    color: '#f59e0b'
  },
  {
    id: 'RELIC_ASTRAEA',
    name: 'Astraea Star Crystal',
    slot: 'RELIC',
    description: 'A pure tear shed by the goddess of stars, showering the voyager in celestial fortune.',
    icon: '✨',
    rarity: 'LEGENDARY',
    stats: { xpBonusPercent: 25, starValueBonusPercent: 25, diamondChanceBonusPercent: 12 },
    priceStars: 1500,
    priceDiamonds: 30,
    requiredPlayerLevel: 11,
    unlocked: false,
    color: '#facc15'
  },

  // ACCESSORIES / CLOCKS & SCARVES (Worn at the boy's neck/chest)
  {
    id: 'GEAR_SCARF_RED',
    name: 'Crimson Explorer Scarf',
    slot: 'ACCESSORY',
    accessoryType: 'SCARF',
    description: 'The iconic flowing crimson silk scarf that waves triumphantly in stellar solar winds.',
    icon: '🧣',
    rarity: 'COMMON',
    stats: { slingshotBonusPercent: 5 },
    priceStars: 0,
    priceDiamonds: 0,
    requiredPlayerLevel: 1,
    unlocked: true,
    color: '#ef4444'
  },
  {
    id: 'GEAR_CHRONO_CLOCK',
    name: 'Aethelgard Chrono Pocket Watch',
    slot: 'ACCESSORY',
    accessoryType: 'CHRONO_CLOCK',
    description: 'Earned ancient celestial pocket watch worn instead of a scarf. Ticking on a star chain, it grants +2 Rewind charges and auto-rewinds fatal void falls!',
    icon: '⏱️',
    rarity: 'LEGENDARY',
    stats: { 
      rewindChargesBonus: 2, 
      autoRewindOnVoid: true, 
      timeDilationBonusPercent: 40, 
      freezeResistancePercent: 30,
      scoreBonusPercent: 15 
    },
    priceStars: 1200,
    priceDiamonds: 25,
    requiredPlayerLevel: 5,
    unlocked: false,
    color: '#fbbf24',
    trailEffectName: 'Golden Chrono Gears',
    trailColor: '#f59e0b'
  },
  {
    id: 'GEAR_CHRONO_ASTROLABE',
    name: 'Cosmic Constellation Astrolabe',
    slot: 'ACCESSORY',
    accessoryType: 'CHRONO_CLOCK',
    description: 'Masterwork celestial time machine worn on your chest. Grants +3 Rewinds, expands slow-motion jump precision, and repels entropic voids.',
    icon: '🕰️',
    rarity: 'CELESTIAL',
    stats: { 
      rewindChargesBonus: 3, 
      autoRewindOnVoid: true, 
      timeDilationBonusPercent: 70, 
      voidPushbackBonus: 100, 
      xpBonusPercent: 35,
      scoreBonusPercent: 30 
    },
    priceStars: 3000,
    priceDiamonds: 55,
    requiredPlayerLevel: 14,
    unlocked: false,
    color: '#06b6d4',
    trailEffectName: 'Celestial Clockwork Stardust',
    trailColor: '#38bdf8'
  },
  {
    id: 'GEAR_STAR_AMULET',
    name: 'Luminescent Nova Amulet',
    slot: 'ACCESSORY',
    accessoryType: 'STAR_AMULET',
    description: 'Radiates warm stellar photons that pull cosmic stars toward you across vast orbital distances.',
    icon: '⭐',
    rarity: 'RARE',
    stats: { starValueBonusPercent: 20, magnetRadiusBonus: 45, xpBonusPercent: 15 },
    priceStars: 500,
    priceDiamonds: 10,
    requiredPlayerLevel: 3,
    unlocked: false,
    color: '#f59e0b'
  },
  {
    id: 'GEAR_PRISMATIC_CAPE',
    name: 'Aurora Rainbow Cape',
    slot: 'ACCESSORY',
    accessoryType: 'CAPE',
    description: 'Flowing chromatic silk cape that harnesses stellar radiation for hyper-speed slingshots.',
    icon: '✨',
    rarity: 'EPIC',
    stats: { slingshotBonusPercent: 25, jetpackPowerBonusPercent: 20, scoreBonusPercent: 20 },
    priceStars: 950,
    priceDiamonds: 20,
    requiredPlayerLevel: 8,
    unlocked: false,
    color: '#ec4899'
  },
  ...EXTRA_GEAR
];

export const COSMIC_GEAR_ITEMS = RPG_GEAR_ITEMS;

// ==========================================
// GEAR SET SYNERGY BONUSES
// ==========================================
export const GEAR_SET_BONUSES: GearSetBonus[] = [
  {
    id: 'SET_CHRONO',
    name: 'Chrono Time-Lord Set',
    icon: '⏳',
    themeColor: '#06b6d4',
    tagline: 'Mastery over Spacetime & Temporal Reversal',
    requiredCount: 2,
    buffDescription: '+2 Bonus Rewind Charges • +50% Slow-Motion Aim Window • Instant Rewind Recovery',
    matchingItemIds: ['HELMET_CHRONO', 'RELIC_CHRONOS', 'GEAR_CHRONO_CLOCK', 'GEAR_CHRONO_ASTROLABE', 'THRUSTER_CYBER']
  },
  {
    id: 'SET_SOLAR',
    name: 'Solar Sovereign Set',
    icon: '☀️',
    themeColor: '#f59e0b',
    tagline: 'Immunity to Solar Flare Turbulence & Golden Radiance',
    requiredCount: 2,
    buffDescription: '+40% Star Collection Value • +150px Void Blast on Planet Landings • Sun Multiplier x2',
    matchingItemIds: ['HELMET_ASTRAL', 'SUIT_VULCAN', 'THRUSTER_DEFAULT', 'RELIC_ASTRAEA', 'GEAR_STAR_AMULET']
  },
  {
    id: 'SET_PRISMATIC',
    name: 'Celestial Archon Set',
    icon: '🌈',
    themeColor: '#ec4899',
    tagline: 'Transcendental Starlight Velocity & Fortune',
    requiredCount: 2,
    buffDescription: '+35% Diamond Transmutation Rate • +50% Global Score • Rainbow Nebula Aura',
    matchingItemIds: ['SUIT_CELESTIAL', 'THRUSTER_PRISMATIC', 'GEAR_PRISMATIC_CAPE', 'GEAR_CHRONO_ASTROLABE']
  }
];

// ==========================================
// LEVEL PROGRESSION REWARD TIERS (LEVEL 1-25)
// ==========================================
export const LEVEL_PROGRESSION_PERKS: LevelProgressionPerk[] = [
  {
    level: 1,
    title: 'Orbital Cadet',
    badgeIcon: '🌱',
    xpRequired: 0,
    rewardStars: 50,
    rewardDiamonds: 2,
    rewardSkillPoints: 1,
    perkDescription: 'Welcome to the Astral Archipelago! Basic jump physics unlocked.'
  },
  {
    level: 2,
    title: 'Gravity Hopper',
    badgeIcon: '🚀',
    xpRequired: 120,
    rewardStars: 100,
    rewardDiamonds: 3,
    rewardSkillPoints: 1,
    perkDescription: '+5% Slingshot Velocity & Unlocks Level 2 Upgrades in the Arsenal.'
  },
  {
    level: 3,
    title: 'Starlight Scout',
    badgeIcon: '⭐',
    xpRequired: 280,
    rewardStars: 150,
    rewardDiamonds: 5,
    rewardSkillPoints: 1,
    unlockedGearTitle: 'Chrono Cyber Visor & Nova Amulet',
    unlockedGearId: 'HELMET_CHRONO',
    perkDescription: 'Unlocks Tactical Chrono HUD and Luminescent Star Amulet in the Wardrobe.'
  },
  {
    level: 4,
    title: 'Solar Voyager',
    badgeIcon: '🔥',
    xpRequired: 500,
    rewardStars: 200,
    rewardDiamonds: 6,
    rewardSkillPoints: 1,
    unlockedGearTitle: 'Nanotech Warp Exosuit',
    unlockedGearId: 'SUIT_NANOTECH',
    perkDescription: 'Unlocks Nanotech Warp Exosuit for high-altitude mid-air jetpack control.'
  },
  {
    level: 5,
    title: 'Chrono Apprentice',
    badgeIcon: '⏱️',
    xpRequired: 800,
    rewardStars: 300,
    rewardDiamonds: 10,
    rewardSkillPoints: 2,
    unlockedGearTitle: 'Aethelgard Chrono Pocket Watch',
    unlockedGearId: 'GEAR_CHRONO_CLOCK',
    perkDescription: 'Earn the legendary Chrono Pocket Watch necklace! Replaces scarf with Rewind time-warp powers.'
  },
  {
    level: 7,
    title: 'Cryo-Knight',
    badgeIcon: '❄️',
    xpRequired: 1400,
    rewardStars: 450,
    rewardDiamonds: 12,
    rewardSkillPoints: 2,
    unlockedGearTitle: 'Cryo-Knight Crown',
    unlockedGearId: 'HELMET_FROST',
    perkDescription: 'Deep cosmic freeze protection and high-orbit thermal shielding unlocked.'
  },
  {
    level: 10,
    title: 'Singularity Master',
    badgeIcon: '🔮',
    xpRequired: 2500,
    rewardStars: 650,
    rewardDiamonds: 18,
    rewardSkillPoints: 2,
    unlockedGearTitle: 'Dark Matter Core',
    unlockedGearId: 'THRUSTER_DARK_MATTER',
    perkDescription: 'Harnesses black hole gravitations to push the dark void downward.'
  },
  {
    level: 12,
    title: 'Solar Sovereign',
    badgeIcon: '✨',
    xpRequired: 3800,
    rewardStars: 900,
    rewardDiamonds: 25,
    rewardSkillPoints: 3,
    unlockedGearTitle: 'Astral Solar Halo',
    unlockedGearId: 'HELMET_ASTRAL',
    perkDescription: 'Radiant golden starlight halo conferring massive XP and star score multipliers.'
  },
  {
    level: 14,
    title: 'Time Lord Archon',
    badgeIcon: '🕰️',
    xpRequired: 5400,
    rewardStars: 1200,
    rewardDiamonds: 35,
    rewardSkillPoints: 3,
    unlockedGearTitle: 'Constellation Astrolabe Clock',
    unlockedGearId: 'GEAR_CHRONO_ASTROLABE',
    perkDescription: 'The ultimate timepiece: 3 Rewind charges and celestial stasis field.'
  },
  {
    level: 16,
    title: 'Celestial Ascendant',
    badgeIcon: '👑',
    xpRequired: 7500,
    rewardStars: 2000,
    rewardDiamonds: 50,
    rewardSkillPoints: 4,
    unlockedGearTitle: 'Prismatic Rainbow Hyper-Drive',
    unlockedGearId: 'THRUSTER_PRISMATIC',
    perkDescription: 'Supreme chromatic rainbow propulsion and eternal cosmic voyager supremacy.'
  }
];

// Helper calculations for RPG systems
export function getXPForLevel(level: number): number {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.35));
}

export function getActiveSetBonus(equippedGear: EquippedGear): GearSetBonus | null {
  const equippedIds = [
    equippedGear.helmetId,
    equippedGear.suitId,
    equippedGear.thrusterId,
    equippedGear.relicId,
    equippedGear.accessoryId
  ].filter(Boolean);

  for (const set of GEAR_SET_BONUSES) {
    const matchCount = equippedIds.filter((id) => id && set.matchingItemIds.includes(id)).length;
    if (matchCount >= set.requiredCount) {
      return set;
    }
  }
  return null;
}

export function calculateTotalGearStats(equippedGear: EquippedGear): GearStats {
  const stats: GearStats = {
    slingshotBonusPercent: 0,
    starValueBonusPercent: 0,
    xpBonusPercent: 0,
    darkCurseResistancePercent: 0,
    freezeResistancePercent: 0,
    jetpackPowerBonusPercent: 0,
    magnetRadiusBonus: 0,
    voidPushbackBonus: 0,
    diamondChanceBonusPercent: 0,
    scoreBonusPercent: 0,
    rewindChargesBonus: 0,
    autoRewindOnVoid: false,
    timeDilationBonusPercent: 0
  };

  const gearIds = [
    equippedGear.helmetId, 
    equippedGear.suitId, 
    equippedGear.thrusterId, 
    equippedGear.relicId,
    equippedGear.accessoryId
  ].filter(Boolean);

  gearIds.forEach((id) => {
    const item = RPG_GEAR_ITEMS.find((g) => g.id === id);
    if (item && item.stats) {
      if (item.stats.slingshotBonusPercent) stats.slingshotBonusPercent! += item.stats.slingshotBonusPercent;
      if (item.stats.starValueBonusPercent) stats.starValueBonusPercent! += item.stats.starValueBonusPercent;
      if (item.stats.xpBonusPercent) stats.xpBonusPercent! += item.stats.xpBonusPercent;
      if (item.stats.darkCurseResistancePercent) stats.darkCurseResistancePercent! += item.stats.darkCurseResistancePercent;
      if (item.stats.freezeResistancePercent) stats.freezeResistancePercent! += item.stats.freezeResistancePercent;
      if (item.stats.jetpackPowerBonusPercent) stats.jetpackPowerBonusPercent! += item.stats.jetpackPowerBonusPercent;
      if (item.stats.magnetRadiusBonus) stats.magnetRadiusBonus! += item.stats.magnetRadiusBonus;
      if (item.stats.voidPushbackBonus) stats.voidPushbackBonus! += item.stats.voidPushbackBonus;
      if (item.stats.diamondChanceBonusPercent) stats.diamondChanceBonusPercent! += item.stats.diamondChanceBonusPercent;
      if (item.stats.scoreBonusPercent) stats.scoreBonusPercent! += item.stats.scoreBonusPercent;
      if (item.stats.rewindChargesBonus) stats.rewindChargesBonus! += item.stats.rewindChargesBonus;
      if (item.stats.autoRewindOnVoid) stats.autoRewindOnVoid = true;
      if (item.stats.timeDilationBonusPercent) stats.timeDilationBonusPercent! += item.stats.timeDilationBonusPercent;
    }
  });

  // Apply Set Synergy Bonus if active
  const setBonus = getActiveSetBonus(equippedGear);
  if (setBonus) {
    if (setBonus.id === 'SET_CHRONO') {
      stats.rewindChargesBonus! += 2;
      stats.autoRewindOnVoid = true;
      stats.timeDilationBonusPercent! += 50;
    } else if (setBonus.id === 'SET_SOLAR') {
      stats.starValueBonusPercent! += 40;
      stats.voidPushbackBonus! += 150;
    } else if (setBonus.id === 'SET_PRISMATIC') {
      stats.diamondChanceBonusPercent! += 35;
      stats.scoreBonusPercent! += 50;
    }
  }

  return stats;
}

export function calculateSkillBonuses(allocations: SkillTreeAllocations) {
  const getRank = (id: string) => (allocations as Record<string, number>)[id] || 0;

  return {
    slingshotVelocityBonus: getRank('GRAVITY_AFFINITY') * 0.08,
    perfectJumpBonus: getRank('ORBITAL_SLINGSHOT_MASTERY') * 0.15,
    scoreMultiplierBonus: getRank('ORBITAL_SLINGSHOT_MASTERY') * 0.10,
    airSteeringBonus: getRank('AIR_DRIFT_STEERING') * 0.20,
    jetpackSpeedBonus: getRank('JETPACK_OVERDRIVE') * 0.12,
    freeJetpackCharges: getRank('JETPACK_OVERDRIVE') >= 5 ? 2 : getRank('JETPACK_OVERDRIVE') >= 3 ? 1 : 0,
    cometDurationBonus: getRank('COMET_PROPULSION') * 1.0,
    cometVelocityBonus: getRank('COMET_PROPULSION') * 0.10,
    magnetRadiusBonus: getRank('SUPERNOVA_MAGNET') * 35,
    magnetDurationBonus: getRank('SUPERNOVA_MAGNET') * 1.2,
    starValueBonus: getRank('STAR_HARVESTER') * 0.12,
    orbitStarBonus: getRank('STAR_HARVESTER') * 2,
    diamondTransmuteChance: getRank('DIAMOND_TRANSMUTATION') * 0.06,
    xpMultiplierBonus: getRank('COSMIC_EXPEDITION_XP') * 0.15,
    checkpointRewardBonus: getRank('CHECKPOINT_FORTUNE') * 0.25,
    freezeResistance: getRank('CRYO_INSULATION') * 0.25,
    stoneCurseDelay: getRank('STONE_WARD') * 0.20,
    voidPushbackBonus: getRank('VOID_REPULSOR') * 60,
    sunBonusStars: getRank('SOLAR_SHIELD') * 0.20,
    hasPhoenixRebirth: getRank('PHOENIX_REBIRTH') >= 1,
    cometVoidPushBonus: getRank('COMET_ECHO') * 80,
    voidSlowRatio: getRank('VOID_ANCHOR') * 0.08,
    harvestYieldBonus: getRank('HARVEST_SURGE') * 0.20,
    orbitFortuneStars: getRank('ORBITAL_FORTUNE') * 3,
    gardenAlchemyBonus: getRank('GARDEN_ALCHEMY') * 0.15,
    starGazeDustBonus: getRank('VOID_CARTOGRAPHY') * 0.20,
    extraLandingPush: getRank('ABYSSAL_TETHER') * 40
  };
}

export const PHYSICS_CONFIG = {
  GRAVITY_G: 3200000,            // Strong, palpable gravitational constant G for dramatic orbital slingshots
  PLANET_MASS_DEFAULT: 1.4,      // Default base planet mass
  GRAVITY_INFLUENCE_MULT: 6.0,   // Gravity well radius multiplier relative to planet radius
  SUN_INFLUENCE_MULT: 8.5,       // Gravity well radius multiplier for Suns
  EPSILON_SOFTENING: 450,        // Softening factor to prevent infinite forces near surface
  LAUNCH_SPEED_MIN: 300,         // Short tap quick hop speed
  LAUNCH_SPEED_MAX: 720,         // Full charged launch velocity
  CHARGE_TIME_MAX: 0.55,         // Seconds of holding down to reach 100% launch charge
  LAUNCH_SPEED_TANGENT_MULT: 1.25,// Preserved tangential angular speed multiplier
  VOID_INITIAL_SPEED: 38,        // Pixels per second void upward speed
  VOID_SPEED_ACCELERATION: 0.7,  // Speed increase per 1000 pixels of altitude
  VOID_PUSHBACK_ON_LAND: 200,    // Pixels pushed back on landing new planet
  VOID_PUSHBACK_COMET: 450,      // Pixels pushed back on collecting Comet
  PLAYER_RADIUS: 16,             // Hitbox radius of player character
  SURFACE_OFFSET: 20,            // Distance from planet surface to player center for tall slender character
  ROTATION_SPEED_DEFAULT: 2.2,   // Radians per second default angular rotation speed
  MAGNET_RADIUS_BASE: 170,       // Base magnet pull radius
  MAGNET_RADIUS_PER_LEVEL: 40,   // Radius bonus per magnet level
  MAGNET_DURATION_BASE: 6.0,     // Base magnet duration in seconds
  MAGNET_DURATION_PER_LEVEL: 1.5,
  COMET_SPEED_MULTIPLIER: 1.65,  // Speed boost during Comet powerup
  COMET_DURATION_BASE: 4.5,      // Base comet duration in seconds
  COMET_DURATION_PER_LEVEL: 1.2,
  JETPACK_THRUST_SPEED: 680,     // Jetpack emergency rescue thrust velocity
  RICOCHET_BOOST_MULT: 1.55,     // Spring-board bounce multiplier on planet surface
};

export const INITIAL_COSTUMES: Costume[] = [
  {
    id: 'ASTRONAUT',
    name: 'Young Explorer Leo',
    description: 'The brave star jumper boy with tousled hair, aviator suit, brass goggles, and waving silk cape.',
    priceDiamonds: 0,
    unlocked: true,
    icon: '👦',
    bodyColor: '#38bdf8',
    accentColor: '#f0f9ff',
    trailColor: '#7dd3fc',
    hairColor: '#78350f',
    hatType: 'HELMET'
  },
  {
    id: 'PIRATE',
    name: 'Cosmic Buccaneer',
    description: 'Space pirate captain with gold-trimmed coat, starry tricorn hat, feathered plume, and swashbuckler boots.',
    priceDiamonds: 15,
    unlocked: false,
    icon: '🏴‍☠️',
    bodyColor: '#ef4444',
    accentColor: '#fef08a',
    trailColor: '#f87171',
    hairColor: '#1c1917',
    hatType: 'PIRATE_HAT'
  },
  {
    id: 'PRINCESS',
    name: 'Star Prince Orion',
    description: 'Royal galaxy prince with diamond-encrusted gold crown, silver anime locks, and velvet embroidered doublet.',
    priceDiamonds: 25,
    unlocked: false,
    icon: '👑',
    bodyColor: '#ec4899',
    accentColor: '#fdf4ff',
    trailColor: '#f472b6',
    hairColor: '#e2e8f0',
    hatType: 'CROWN'
  },
  {
    id: 'FOOTBALLER',
    name: 'Astro Striker',
    description: 'Energetic solar sports striker with blonde spikes, holographic jersey, and high-speed agility cleats.',
    priceDiamonds: 30,
    unlocked: false,
    icon: '⚽',
    bodyColor: '#22c55e',
    accentColor: '#facc15',
    trailColor: '#4ade80',
    hairColor: '#facc15',
    hatType: 'FOOTBALL_HELMET'
  },
  {
    id: 'NINJA',
    name: 'Shadow Kaito',
    description: 'Cosmic shinobi with glowing rune headband, stealth ninja mask, purple kunai sashes, and midnight curls.',
    priceDiamonds: 40,
    unlocked: false,
    icon: '🥷',
    bodyColor: '#1e293b',
    accentColor: '#a855f7',
    trailColor: '#c084fc',
    hairColor: '#0f172a',
    hatType: 'NINJA_MASK'
  },
  {
    id: 'ALIEN',
    name: 'Nebula Nomad',
    description: 'Bioluminescent emerald space wanderer with starlight antenna, sparkling starry smile, and levitation aura.',
    priceDiamonds: 50,
    unlocked: false,
    icon: '👽',
    bodyColor: '#10b981',
    accentColor: '#6EE7B7',
    trailColor: '#34d399',
    hairColor: '#059669',
    hatType: 'ALIEN_ANTENNA'
  },
  {
    id: 'CYBER',
    name: 'Cyber Knight Xenon',
    description: 'Futuristic mecha paladin with holographic targeting visor, glowing neon circuit plates, and ion thrusters.',
    priceDiamonds: 75,
    unlocked: false,
    icon: '🤖',
    bodyColor: '#6366f1',
    accentColor: '#38bdf8',
    trailColor: '#818cf8',
    hairColor: '#38bdf8',
    hatType: 'VISOR'
  },
  {
    id: 'SOLAR_SOVEREIGN',
    name: 'Solar Sovereign Sol',
    description: 'Golden sun emperor surrounded by a rotating solar flare corona halo, fiery robes, and sunburst trails.',
    priceDiamonds: 100,
    unlocked: false,
    icon: '☀️',
    bodyColor: '#f59e0b',
    accentColor: '#fef08a',
    trailColor: '#fbbf24',
    hairColor: '#ea580c',
    hatType: 'SOLAR_HALO'
  },
  {
    id: 'STELLA_MAGE',
    name: 'Astral Sorcerer Stella',
    description: 'Celestial starlight mage wearing a starry pointed hat with crescent moon amulet and nebula aura robes.',
    priceDiamonds: 120,
    unlocked: false,
    icon: '🧙‍♂️',
    bodyColor: '#8b5cf6',
    accentColor: '#e9d5ff',
    trailColor: '#c084fc',
    hairColor: '#38bdf8',
    hatType: 'WIZARD_HAT'
  },
  {
    id: 'CRYO_ARCHON',
    name: 'Cryo Frost Archon',
    description: 'Deep-space arctic voyager with frosted icicle horns, warm fur-lined parka, and shimmering frost crystals.',
    priceDiamonds: 150,
    unlocked: false,
    icon: '❄️',
    bodyColor: '#0284c7',
    accentColor: '#e0f2fe',
    trailColor: '#38bdf8',
    hairColor: '#bae6fd',
    hatType: 'CRYO_HORNS'
  },
  ...EXTRA_COSTUMES
];

export const INITIAL_ROCKET_SKINS: RocketSkin[] = [
  {
    id: 'APOLLO',
    name: 'Saturn V Apollo',
    description: 'Classic red & silver space race rocket thruster with fiery exhaust.',
    priceStars: 0,
    unlocked: true,
    icon: '🚀',
    primaryColor: '#ef4444',
    flameColor: '#f97316'
  },
  {
    id: 'NEON_CYBER',
    name: 'Cyber Ion Engine',
    description: 'High-energy cyan plasma booster with hyper-speed ion particles.',
    priceStars: 250,
    unlocked: false,
    icon: '⚡',
    primaryColor: '#38bdf8',
    flameColor: '#818cf8'
  },
  {
    id: 'GOLDEN_FLARE',
    name: 'Golden Comet Jet',
    description: '24K gold-plated luxury rocket booster creating glittering solar flares.',
    priceStars: 600,
    unlocked: false,
    icon: '✨',
    primaryColor: '#facc15',
    flameColor: '#fde047'
  },
  {
    id: 'DRAGON_FIRE',
    name: 'Dragon Flame Rocket',
    description: 'Blazing crimson dragon engine spewing intense molten flame bursts.',
    priceStars: 1000,
    unlocked: false,
    icon: '🔥',
    primaryColor: '#dc2626',
    flameColor: '#ea580c'
  },
  {
    id: 'ALIEN_ION',
    name: 'Cosmic Emerald UFO',
    description: 'Extraterrestrial anti-gravity engine projecting emerald plasma waves.',
    priceStars: 1500,
    unlocked: false,
    icon: '🛸',
    primaryColor: '#10b981',
    flameColor: '#34d399'
  },
  ...EXTRA_ROCKETS
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'STARS_1',
    title: 'Starlight Novice',
    description: 'Gather a lifetime total of 250 Cosmic Stars',
    category: 'STARS',
    icon: '🌟',
    badgeColor: 'from-amber-400 to-amber-600',
    target: 250,
    rewardStars: 100,
    rewardDiamonds: 5
  },
  {
    id: 'STARS_2',
    title: 'Galaxy Collector',
    description: 'Gather a lifetime total of 1,000 Cosmic Stars',
    category: 'STARS',
    icon: '⭐',
    badgeColor: 'from-yellow-300 to-amber-500',
    target: 1000,
    rewardStars: 350,
    rewardDiamonds: 15
  },
  {
    id: 'STARS_3',
    title: 'Celestial Hoarder',
    description: 'Gather a lifetime total of 5,000 Cosmic Stars',
    category: 'STARS',
    icon: '💫',
    badgeColor: 'from-amber-300 to-yellow-600',
    target: 5000,
    rewardStars: 1000,
    rewardDiamonds: 40
  },
  {
    id: 'DIAMONDS_1',
    title: 'Gem Discoverer',
    description: 'Collect a lifetime total of 25 Space Diamonds',
    category: 'COLLECTION',
    icon: '💎',
    badgeColor: 'from-sky-400 to-blue-600',
    target: 25,
    rewardStars: 200,
    rewardDiamonds: 10
  },
  {
    id: 'DIAMONDS_2',
    title: 'Diamond Tycoon',
    description: 'Collect a lifetime total of 100 Space Diamonds',
    category: 'COLLECTION',
    icon: '💠',
    badgeColor: 'from-cyan-300 to-blue-600',
    target: 100,
    rewardStars: 600,
    rewardDiamonds: 25
  },
  {
    id: 'PLANETS_1',
    title: 'Orbital Pioneer',
    description: 'Land on a lifetime total of 25 Planets',
    category: 'PLANETS',
    icon: '🪐',
    badgeColor: 'from-emerald-400 to-teal-600',
    target: 25,
    rewardStars: 150,
    rewardDiamonds: 5
  },
  {
    id: 'PLANETS_2',
    title: 'Solar System Voyager',
    description: 'Land on a lifetime total of 100 Planets',
    category: 'PLANETS',
    icon: '🌍',
    badgeColor: 'from-teal-300 to-emerald-600',
    target: 100,
    rewardStars: 500,
    rewardDiamonds: 20
  },
  {
    id: 'JUMPS_1',
    title: 'Precision Leaper',
    description: 'Achieve 5 Consecutive Perfect Jumps in a single run',
    category: 'JUMPS',
    icon: '🎯',
    badgeColor: 'from-rose-400 to-pink-600',
    target: 5,
    rewardStars: 200,
    rewardDiamonds: 8
  },
  {
    id: 'JUMPS_2',
    title: 'Gravity Master',
    description: 'Achieve 10 Consecutive Perfect Jumps in a single run',
    category: 'JUMPS',
    icon: '✨',
    badgeColor: 'from-fuchsia-400 to-purple-600',
    target: 10,
    rewardStars: 600,
    rewardDiamonds: 25
  },
  {
    id: 'ALTITUDE_1',
    title: 'Stratosphere Breaker',
    description: 'Ascend to an altitude of 2,000m in a single run',
    category: 'ALTITUDE',
    icon: '🚀',
    badgeColor: 'from-indigo-400 to-violet-600',
    target: 2000,
    rewardStars: 250,
    rewardDiamonds: 10
  },
  {
    id: 'ALTITUDE_2',
    title: 'Deep Cosmos Explorer',
    description: 'Ascend to an altitude of 6,000m in a single run',
    category: 'ALTITUDE',
    icon: '🌌',
    badgeColor: 'from-purple-400 to-indigo-700',
    target: 6000,
    rewardStars: 750,
    rewardDiamonds: 30
  },
  {
    id: 'ORBIT_1',
    title: 'Orbital Loop Master',
    description: 'Complete a lifetime total of 20 full 360° planetary orbits',
    category: 'MASTERY',
    icon: '🔄',
    badgeColor: 'from-orange-400 to-amber-600',
    target: 20,
    rewardStars: 300,
    rewardDiamonds: 12
  },
  {
    id: 'SUN_1',
    title: 'Solar Flare Surfer',
    description: 'Land safely on a lifetime total of 5 Sun Planets',
    category: 'PLANETS',
    icon: '☀️',
    badgeColor: 'from-amber-400 to-orange-600',
    target: 5,
    rewardStars: 400,
    rewardDiamonds: 15
  },
  {
    id: 'WARDROBE_1',
    title: 'Cosmic Fashionista',
    description: 'Unlock 3 unique Boy Costumes',
    category: 'COLLECTION',
    icon: '👑',
    badgeColor: 'from-pink-400 to-rose-600',
    target: 3,
    rewardStars: 350,
    rewardDiamonds: 15
  },
  ...EXTRA_ACHIEVEMENTS
];

export const UPGRADE_PRICES = MODULE_UPGRADE_PRICES;

export const INITIAL_STAGES: StageQuest[] = [
  {
    stageId: '1.1',
    stageName: 'First Steps in Orbit',
    completed: false,
    rewardStars: 150,
    rewardDiamonds: 5,
    objectives: [
      {
        id: '1.1.1',
        description: 'Complete 2 full rotations on any planet',
        type: 'FULL_ROTATIONS',
        targetCount: 2,
        currentCount: 0,
        completed: false
      },
      {
        id: '1.1.2',
        description: 'Collect 15 Stars in a single run',
        type: 'COLLECT_STARS_SINGLE_RUN',
        targetCount: 15,
        currentCount: 0,
        completed: false
      },
      {
        id: '1.1.3',
        description: 'Reach an Altitude of 800m',
        type: 'REACH_ALTITUDE',
        targetCount: 800,
        currentCount: 0,
        completed: false
      }
    ]
  },
  {
    stageId: '1.2',
    stageName: 'Gravitational Precision',
    completed: false,
    rewardStars: 250,
    rewardDiamonds: 10,
    objectives: [
      {
        id: '1.2.1',
        description: 'Execute 3 Consecutive Perfect Jumps',
        type: 'CONSECUTIVE_PERFECT_JUMPS',
        targetCount: 3,
        currentCount: 0,
        completed: false
      },
      {
        id: '1.2.2',
        description: 'Collect 1 Diamond in orbital flight',
        type: 'COLLECT_DIAMONDS_SINGLE_RUN',
        targetCount: 1,
        currentCount: 0,
        completed: false
      },
      {
        id: '1.2.3',
        description: 'Reach an Altitude of 1,800m',
        type: 'REACH_ALTITUDE',
        targetCount: 1800,
        currentCount: 0,
        completed: false
      }
    ]
  },
  {
    stageId: '1.3',
    stageName: 'Solar Flare Mastery',
    completed: false,
    rewardStars: 400,
    rewardDiamonds: 15,
    objectives: [
      {
        id: '1.3.1',
        description: 'Land safely on a Sun planet',
        type: 'LAND_ON_SUNS',
        targetCount: 1,
        currentCount: 0,
        completed: false
      },
      {
        id: '1.3.2',
        description: 'Collect 40 Stars in a single run',
        type: 'COLLECT_STARS_SINGLE_RUN',
        targetCount: 40,
        currentCount: 0,
        completed: false
      },
      {
        id: '1.3.3',
        description: 'Use 2 Power-Ups in a single run',
        type: 'USE_POWERUPS',
        targetCount: 2,
        currentCount: 0,
        completed: false
      }
    ]
  },
  {
    stageId: '2.1',
    stageName: 'Cosmic Velocity',
    completed: false,
    rewardStars: 600,
    rewardDiamonds: 20,
    objectives: [
      {
        id: '2.1.1',
        description: 'Execute 5 Consecutive Perfect Jumps',
        type: 'CONSECUTIVE_PERFECT_JUMPS',
        targetCount: 5,
        currentCount: 0,
        completed: false
      },
      {
        id: '2.1.2',
        description: 'Collect 3 Diamonds in a single run',
        type: 'COLLECT_DIAMONDS_SINGLE_RUN',
        targetCount: 3,
        currentCount: 0,
        completed: false
      },
      {
        id: '2.1.3',
        description: 'Reach an Altitude of 3,500m',
        type: 'REACH_ALTITUDE',
        targetCount: 3500,
        currentCount: 0,
        completed: false
      }
    ]
  },
  {
    stageId: '2.2',
    stageName: 'Deep Space Legend',
    completed: false,
    rewardStars: 1000,
    rewardDiamonds: 30,
    objectives: [
      {
        id: '2.2.1',
        description: 'Collect 80 Stars in a single run',
        type: 'COLLECT_STARS_SINGLE_RUN',
        targetCount: 80,
        currentCount: 0,
        completed: false
      },
      {
        id: '2.2.2',
        description: 'Land on 3 Suns in a single run',
        type: 'LAND_ON_SUNS',
        targetCount: 3,
        currentCount: 0,
        completed: false
      },
      {
        id: '2.2.3',
        description: 'Reach an Altitude of 6,000m',
        type: 'REACH_ALTITUDE',
        targetCount: 6000,
        currentCount: 0,
        completed: false
      }
    ]
  },
  ...EXTRA_STAGES
];

// ==========================================
// SOUND PACK RETHEMING CONFIGURATION
// ==========================================
export const SOUND_PACKS: SoundPackInfo[] = [
  {
    id: 'ORCHESTRAL',
    name: 'Cosmic Orchestral',
    subtitle: 'Monument Valley & Flute Symphony',
    description: 'Soothing ethereal ambient pads, warm harp sweeps, gentle flute chimes, and smooth airy launches.',
    icon: '🎻',
    accentColor: '#38bdf8',
    previewNote: 'C Major 9 Pad • Flute Jump • Soothing Atmosphere'
  },
  {
    id: 'SYNTHWAVE',
    name: 'Neon Synthwave',
    subtitle: '80s Cyberpunk & Analog Dream',
    description: 'Punchy saw-wave retro arpeggios, driving analog basslines, laser-sweep jump thrusts, and neon delay.',
    icon: '🕹️',
    accentColor: '#ec4899',
    previewNote: 'Sawtooth Bass • Laser Sweep Jump • Cyber Pulse'
  },
  {
    id: 'RETRO_8BIT',
    name: 'Chiptune 8-Bit',
    subtitle: 'Classic Arcade & Pixel Adventure',
    description: 'Authentic 8-bit pulse square waves, rapid arpeggiated melodic blips, noise percussion, and retro arcade jumps.',
    icon: '👾',
    accentColor: '#facc15',
    previewNote: 'Square Wave Lead • 8-Bit Jump Boing • NES Synth'
  },
  {
    id: 'CHILL_LOFI',
    name: 'Celestial Lo-Fi',
    subtitle: 'Warm Rhodes & Starry Beats',
    description: 'Mellow electric piano chords, soft tape flutter, warm filtered sub-bass, and gentle raindrop chime launches.',
    icon: '☕',
    accentColor: '#a78bfa',
    previewNote: 'Rhodes Keys • Vinyl Warmth • Soft Water-Drop Jump'
  }
];

// ==========================================
// GALAXY ARCHIVE: PLANET LORE CODEX
// ==========================================
export const PLANET_LORE_DATABASE: PlanetLoreEntry[] = [
  {
    type: 'GRASS',
    name: 'Verdant Meadow Worlds',
    subtitle: 'Class-T Biogenic Terrestrial',
    icon: '🌱',
    accentColor: '#22c55e',
    atmosphereType: 'Oxygen-Nitrogen Super-Rich',
    gravitySignature: 'Standard Earth Baseline (1.00g)',
    hazardRisk: 'NONE',
    lore: 'Lush, miniature garden worlds blanketed in bioluminescent clover and blooming celestial daisies. These tranquil spheres serve as nurseries for fledgling star jumpers, offering steady rotational momentum and comforting gravitational wells.',
    astrophysicalNotes: 'Core composed of compacted silicate loam with geothermal subterranean aquifers providing perpetual organic hydration.',
    discoveryMilestone: 'Discovered in Sector 1 (Planets 1-10)'
  },
  {
    type: 'STANDARD',
    name: 'Continental Terran Spheres',
    subtitle: 'Class-M Habitable Core',
    icon: '🌍',
    accentColor: '#0ea5e9',
    atmosphereType: 'Stable Hydrospheric Envelope',
    gravitySignature: 'Balanced Polar Axis (1.05g)',
    hazardRisk: 'NONE',
    lore: 'Harmonious terrestrial planets featuring deep sapphire oceans and azure continents. Ancient cosmic beacons planted on their surface broadcast orbital vectors to passing explorers drifting through the interstellar expanse.',
    astrophysicalNotes: 'Symmetric iron-nickel magnetosphere repels solar wind turbulence, generating stable launch vectors.',
    discoveryMilestone: 'Discovered in Sector 1 (Planets 1-15)'
  },
  {
    type: 'ASTEROID',
    name: 'Barren Chondrite Asteroids',
    subtitle: 'Class-C Metallic Rock',
    icon: '🪨',
    accentColor: '#94a3b8',
    atmosphereType: 'Exosphere Vacuum / None',
    gravitySignature: 'Low Variable Gravity (0.75g)',
    hazardRisk: 'LOW',
    lore: 'Heavily cratered fragments of shattered proto-planets frozen in the deep void. Their jagged surfaces are embedded with stellar diamonds and dense mineral deposits formed during primordial supernova collisions.',
    astrophysicalNotes: 'High iron-silicate density produces unexpectedly sharp gravitational slingshot curves despite compact radii.',
    discoveryMilestone: 'Discovered in Sector 1 (Planets 5+)'
  },
  {
    type: 'SUN',
    name: 'Radiant Stellar Furnaces',
    subtitle: 'Class-G Yellow Dwarf Star',
    icon: '☀️',
    accentColor: '#f59e0b',
    atmosphereType: 'Superheated Photosphere Corona',
    gravitySignature: 'High Magnetic Well (1.30g)',
    hazardRisk: 'MEDIUM',
    lore: 'Blazing spheres of hydrogen-helium fusion that illuminate the planetary archipelago. Touching their golden perimeter supercharges kinetic jump propulsion, launching adventurers into high-velocity orbital trajectories.',
    astrophysicalNotes: 'Solar flare eruptions periodically blast ionized plasma rings across adjacent sectors, supercharging nearby star collectibles.',
    discoveryMilestone: 'Discovered in Sector 1 (Planets 10+)'
  },
  {
    type: 'ICE',
    name: 'Glacial Cryo-Spheres',
    subtitle: 'Class-P Cryogenic Frozen World',
    icon: '❄️',
    accentColor: '#38bdf8',
    atmosphereType: 'Super-Cooled Methane & Nitrogen',
    gravitySignature: 'Crisp Cryo-Well (0.90g)',
    hazardRisk: 'HIGH',
    lore: 'Crystalline spheres wrapped in perpetual blizzards and translucent frost spicules. Prolonged exposure outside their orbital warmth rapidly chills life support systems, frosting the visor with intricate dendrite ice needles.',
    astrophysicalNotes: 'Sub-zero temperatures create ultra-low surface friction, resulting in accelerated rotation velocities.',
    discoveryMilestone: 'Discovered in Sector 2 (Planets 25+)'
  },
  {
    type: 'CRYSTAL',
    name: 'Prismatic Quartz Geodes',
    subtitle: 'Class-Q Resonant Crystalline Core',
    icon: '💎',
    accentColor: '#a855f7',
    atmosphereType: 'Refractive Ionized Aurora',
    gravitySignature: 'Harmonic Frequency Well (1.10g)',
    hazardRisk: 'NONE',
    lore: 'Luminous planetary monoliths carved from solid violet amethyst and star-quartz. Their prismatic facets refract cosmic starlight into harmonic energy pulses, creating natural gravitational focal points.',
    astrophysicalNotes: 'Piezoelectric crystalline lattices generate natural stardust multiplier fields when orbited at high velocity.',
    discoveryMilestone: 'Discovered in Sector 2 (Planets 35+)'
  },
  {
    type: 'MAGMA',
    name: 'Volcanic Pyro-Globes',
    subtitle: 'Class-Y Superheated Basalt',
    icon: '🌋',
    accentColor: '#ef4444',
    atmosphereType: 'Sulfur & Molten Plasma Vapor',
    gravitySignature: 'Heavy Dense Core (1.25g)',
    hazardRisk: 'EXTREME',
    lore: 'Churning cauldrons of incandescent obsidian and liquid mantle vents. Fiery thermal geysers erupt along the crust, providing extreme upward thermal updrafts for skilled acrobatic slingers.',
    astrophysicalNotes: 'Core convection currents create intense localized magnetic spikes that accelerate escape velocity by +25%.',
    discoveryMilestone: 'Discovered in Sector 3 (Planets 50+)'
  },
  {
    type: 'MECH',
    name: 'Clockwork Cyber-Automata',
    subtitle: 'Class-X Synthetic Machine Sphere',
    icon: '⚙️',
    accentColor: '#06b6d4',
    atmosphereType: 'Synthetic Coolant Mist',
    gravitySignature: 'Precision Magnetic Field (1.15g)',
    hazardRisk: 'LOW',
    lore: 'Planetary engines forged from interlocking brass gears, gyroscopes, and clockwork escapements. Built by ancient cosmic architects, they maintain the synchronized orbital rhythms of the entire constellation.',
    astrophysicalNotes: 'Precision gear ratios dictate mathematically exact rotational periods, making launch timing exceptionally crisp.',
    discoveryMilestone: 'Discovered in Sector 3 (Planets 60+)'
  },
  {
    type: 'PLASMA',
    name: 'Ionized Fusion Vortices',
    subtitle: 'Class-E High-Energy Plasma Sphere',
    icon: '⚡',
    accentColor: '#ec4899',
    atmosphereType: 'High-Frequency Electric Arc Corona',
    gravitySignature: 'Dynamic Electromagnetic Core (1.20g)',
    hazardRisk: 'HIGH',
    lore: 'Swirling spheres of pure electrified plasma held together by intense magnetic containment fields. Traversal along their neon perimeter sparks crackling electric ribbons and hyper-charged particle bursts.',
    astrophysicalNotes: 'Electromagnetic repulsion fields impart instant kinetic momentum to passing metallic thruster suits.',
    discoveryMilestone: 'Discovered in Sector 4 (Planets 75+)'
  },
  {
    type: 'NEON',
    name: 'Luminescent Cyber-Synths',
    subtitle: 'Class-N Fluorescent Noble Gas Sphere',
    icon: '🔮',
    accentColor: '#8b5cf6',
    atmosphereType: 'Excited Neon-Xenon Glow Field',
    gravitySignature: 'Light Ambient Well (0.95g)',
    hazardRisk: 'LOW',
    lore: 'Radiant celestial spheres glowing with synthwave magentas and ultraviolet auroras. Their surfaces resonate with retro-futuristic harmonic frequencies that guide jumpers through dense star fields.',
    astrophysicalNotes: 'Fluorescent photon emissions reduce void encroachment rate when player orbits along illuminated hemispheres.',
    discoveryMilestone: 'Discovered in Sector 4 (Planets 85+)'
  },
  {
    type: 'RINGED_GIANT',
    name: 'Saturnian Halo Giants',
    subtitle: 'Class-J Accretion Ring Super-Planet',
    icon: '🪐',
    accentColor: '#f59e0b',
    atmosphereType: 'Stratified Hydrogen Gas Bands',
    gravitySignature: 'Massive Gravitational Well (1.35g)',
    hazardRisk: 'MEDIUM',
    lore: 'Colossal gas spheres encircled by shimmering rings of crystalline ice shards and golden stardust. Navigating their vast orbital circumference allows jumpers to build immense tangential slingshot momentum.',
    astrophysicalNotes: 'Dual ring resonance creates stable orbital transit corridors that capture passing diamonds and star clusters.',
    discoveryMilestone: 'Discovered in Sector 5 (Planets 100+)'
  },
  {
    type: 'DARK',
    name: 'Cursed Obsidian Gloom-Worlds',
    subtitle: 'Class-D Void-Corrupted Null-Planet',
    icon: '🖤',
    accentColor: '#64748b',
    atmosphereType: 'Shadow Miasma & Entropic Mist',
    gravitySignature: 'Unstable Gravitational Sink (1.10g)',
    hazardRisk: 'EXTREME',
    lore: 'Ominous worlds infused with entropic dark matter. Prolonged contact slowly encrusts the jumper in stone petrification runes, requiring swift leaps before movement is completely frozen.',
    astrophysicalNotes: 'Dark matter decay pulls down cosmic ambient temperature and accelerates local void ascent.',
    discoveryMilestone: 'Discovered in Sector 5 (Planets 110+)'
  },
  {
    type: 'CELESTIAL_SANCTUARY',
    name: 'Golden Elysian Sanctuaries',
    subtitle: 'Class-A Divine Astral Haven',
    icon: '✨',
    accentColor: '#fbbf24',
    atmosphereType: 'Pure Starlight Aether',
    gravitySignature: 'Harmonic Anti-Entropy Cradle (1.00g)',
    hazardRisk: 'NONE',
    lore: 'Sacred celestial havens adorned with floating marble pillars, golden runes, and divine starlight fountains. Landing on a sanctuary instantly purges all cold and petrification curses, granting invulnerability.',
    astrophysicalNotes: 'Aetheric core actively repels the advancing Dark Void, pushing the spatial boundary back by 400 meters.',
    discoveryMilestone: 'Discovered in Sector 6 (Planets 125+)'
  },
  {
    type: 'ANTIMATTER',
    name: 'Singularity Null-Cores',
    subtitle: 'Class-Z Quantum Inversion Anomaly',
    icon: '🌀',
    accentColor: '#d946ef',
    atmosphereType: 'Quantum Flux & Event Horizon',
    gravitySignature: 'Hyper-Dense Singular Point (1.45g)',
    hazardRisk: 'EXTREME',
    lore: 'Exotic matter spheres teetering on the edge of gravitational collapse. Their event horizon warps local spacetime, creating intense slingshot catapults capable of launching voyagers into distant constellations.',
    astrophysicalNotes: 'Bends light rays into gravitational Einstein rings and doubles stardust point values during orbital capture.',
    discoveryMilestone: 'Discovered in Sector 6 (Planets 140+)'
  },
  {
    type: 'OCEAN',
    name: 'Pelagic Azure Worlds',
    subtitle: 'Class-W Hydrostatic Water Sphere',
    icon: '🌊',
    accentColor: '#0ea5e9',
    atmosphereType: 'Humid Marine Nitrogen-Oxygen',
    gravitySignature: 'Deep Well (1.08g)',
    hazardRisk: 'LOW',
    lore: 'Globe-spanning sapphire oceans broken by archipelagos of mossy islands. Trade winds and glittering cloud bands make these worlds the cartographers’ favorite rest stop between meadow belts.',
    astrophysicalNotes: 'High thermal capacity of the world-ocean damps temperature swings, producing unusually stable launch windows.',
    discoveryMilestone: 'Discovered in Sector 1 (Planets 1+)'
  },
  {
    type: 'DESERT',
    name: 'Dune-Scarred Arid Spheres',
    subtitle: 'Class-H Xeric Terrestrial',
    icon: '🏜️',
    accentColor: '#f59e0b',
    atmosphereType: 'Thin Dust-Laden Nitrogen',
    gravitySignature: 'Crisp Dry Well (0.92g)',
    hazardRisk: 'LOW',
    lore: 'Wind-carved ochre worlds of migrating dunes, rust canyons, and a single pale frost cap. Sunlight ricochets off the silica, painting the void in warm copper.',
    astrophysicalNotes: 'Airborne dust grains seed faint rings and raise local albedo, making desert worlds easy to spot from several jumps away.',
    discoveryMilestone: 'Discovered in Sector 2 (Planets 26+)'
  },
  {
    type: 'JUNGLE',
    name: 'Canopy Wilds',
    subtitle: 'Class-T Hyper-Biogenic Rainforest',
    icon: '🌿',
    accentColor: '#22c55e',
    atmosphereType: 'Dense Oxygen-Rich Mist',
    gravitySignature: 'Soft Organic Well (1.02g)',
    hazardRisk: 'LOW',
    lore: 'Entire globes swallowed by stacked rainforest canopies, river-cut valleys, and perpetual tropical fog. Every landing is a crash through luminous leaves.',
    astrophysicalNotes: 'Photosynthetic biomass generates a faint green airglow visible even from neighboring orbits.',
    discoveryMilestone: 'Discovered in Sector 3 (Planets 61+)'
  },
  {
    type: 'STORM',
    name: 'Banded Tempest Giants',
    subtitle: 'Class-J Cyclonic Gas Super-Planet',
    icon: '🌪️',
    accentColor: '#ea580c',
    atmosphereType: 'Hydrogen Bands & Ammonia Cells',
    gravitySignature: 'Titan Grav Well (1.50g)',
    hazardRisk: 'HIGH',
    lore: 'Colossal cream-and-copper gas worlds wearing a single crimson storm-eye. Their belts rotate at different speeds, flinging jumpers on wild, high-momentum slings.',
    astrophysicalNotes: 'Differential rotation of cloud decks produces a wide capture radius and thunderous thermal updrafts.',
    discoveryMilestone: 'Discovered in Sector 5 (Planets 161+)'
  },
  {
    type: 'TOXIC',
    name: 'Venom Cloud Cauldrons',
    subtitle: 'Class-X Acidic Greenhouse',
    icon: '☠️',
    accentColor: '#84cc16',
    atmosphereType: 'Chlorine-Sulfur Acid Haze',
    gravitySignature: 'Sour Dense Well (1.18g)',
    hazardRisk: 'HIGH',
    lore: 'Chartreuse poison worlds where lime clouds chew through hull paint and bubbling vents spit glowing spores. Stay only long enough to steal the updraft.',
    astrophysicalNotes: 'Corrosive aerosols scatter lime-yellow light, creating a toxic halo that warns navigators from a distance.',
    discoveryMilestone: 'Discovered in Sector 3 (Planets 61+)'
  },
  {
    type: 'MOON',
    name: 'Ashen Moonlets',
    subtitle: 'Class-S Cratered Satellite',
    icon: '🌑',
    accentColor: '#94a3b8',
    atmosphereType: 'Exosphere Dust / None',
    gravitySignature: 'Feather Well (0.42g)',
    hazardRisk: 'NONE',
    lore: 'Tiny grey companions pocked with impact basins. Their gentle pull makes them perfect stepping-stones — hop, charge, and leap to the next giant.',
    astrophysicalNotes: 'Low mass and compact radius create snappy, short-period orbits ideal for chaining micro-slingshots.',
    discoveryMilestone: 'Discovered in Sector 1 (Planets 1+)'
  },
  {
    type: 'AURORA',
    name: 'Polar Aurora Spheres',
    subtitle: 'Class-M Magnetospheric Jewel',
    icon: '🌌',
    accentColor: '#22d3ee',
    atmosphereType: 'Ionized Nitrogen Curtains',
    gravitySignature: 'Magnetic Cradle (1.12g)',
    hazardRisk: 'NONE',
    lore: 'Night-side indigo worlds wrapped in living green and cyan aurora ribbons. Landing feels like stepping into a cathedral of light.',
    astrophysicalNotes: 'Powerful magnetospheres funnel solar wind into polar ovals, supercharging nearby star collectibles.',
    discoveryMilestone: 'Discovered in Sector 5 (Planets 161+)'
  },
  {
    type: 'FUNGAL',
    name: 'Mycelial Bloom Worlds',
    subtitle: 'Class-B Bioluminescent Fungal Sphere',
    icon: '🍄',
    accentColor: '#d946ef',
    atmosphereType: 'Spore-Mist Argon Mix',
    gravitySignature: 'Soft Spore Well (0.96g)',
    hazardRisk: 'LOW',
    lore: 'Violet-teal globes forested with colossal mushroom caps. Spores glitter like slow snow, and the whole planet pulses with a gentle bioluminescent heartbeat.',
    astrophysicalNotes: 'Symbiotic mycelium conducts weak electrical currents, producing a faint radio hymn along the equator.',
    discoveryMilestone: 'Discovered in Sector 4 (Planets 101+)'
  },
  {
    type: 'CLOUD',
    name: 'Creamdeck Greenhouse Worlds',
    subtitle: 'Class-V Opaque Cloud Planet',
    icon: '☁️',
    accentColor: '#fdba74',
    atmosphereType: 'Sulfuric Peach Cloud Decks',
    gravitySignature: 'Veiled Well (1.22g)',
    hazardRisk: 'MEDIUM',
    lore: 'Venus-like cream and apricot cloud worlds hiding a furnace below. Lightning glows gold in the depths; the surface is a rumor.',
    astrophysicalNotes: 'Stacked cloud decks refract sunlight into a warm halo, making these giants look larger than their true radius.',
    discoveryMilestone: 'Discovered in Sector 4 (Planets 101+)'
  },
  {
    type: 'NEBULA',
    name: 'Ember Nebula Cores',
    subtitle: 'Class-N Condensed Emission Nebula',
    icon: '🎆',
    accentColor: '#f472b6',
    atmosphereType: 'Ionized Hydrogen & Dust Veils',
    gravitySignature: 'Diffuse Well (0.88g)',
    hazardRisk: 'MEDIUM',
    lore: 'Planets still being born — glowing rose and gold gas wrapped around a dense embryonic core. Flying past them is like surfing a frozen firework.',
    astrophysicalNotes: 'Residual accretion heat keeps a luminous envelope that slowly sheds stardust into nearby orbits.',
    discoveryMilestone: 'Discovered in Sector 6 (Planets 231+)'
  }
];

// ==========================================
// GALAXY ARCHIVE: CONSTELLATION LORE CODEX
// ==========================================
export const CONSTELLATION_LORE_DATABASE: ConstellationLoreEntry[] = [
  {
    id: 'ARIES',
    name: 'Aries',
    latinName: 'Aries • The Celestial Ram',
    glyph: '♈',
    element: 'FIRE',
    elementIcon: '🔥',
    elementColor: '#ef4444',
    lore: 'The cardinal fire constellation representing the primordial dawn of each celestial voyage. Its stars burn with fearless scarlet radiance, fueling the courage of rookie astronauts stepping onto their first orbital pathways.',
    mythos: 'In ancient celestial lore, the Golden Ram carried cosmic dreamers across the abyssal void, leaving behind a wake of fiery star embers.',
    celestialCoordinates: 'RA 02h 38m / Dec +20° 47\' • Planets 1-25',
    astralBuff: '+15% Initial Launch Slingshot Velocity'
  },
  {
    id: 'TAURUS',
    name: 'Taurus',
    latinName: 'Taurus • The Cosmic Bull',
    glyph: '♉',
    element: 'EARTH',
    elementIcon: '🌍',
    elementColor: '#10b981',
    lore: 'An enduring emerald sanctuary anchored by the mighty red giant star Aldebaran and the sparkling Pleiades cluster. Taurus represents resilience, deep mineral wealth, and unyielding gravitational anchors.',
    mythos: 'The celestial bull whose horns hold up the celestial sphere, guarding secret crystalline vaults filled with space diamonds.',
    celestialCoordinates: 'RA 04h 35m / Dec +16° 30\' • Planets 26-50',
    astralBuff: '+20% Mineral Diamonds & Stardust Orbital Yield'
  },
  {
    id: 'GEMINI',
    name: 'Gemini',
    latinName: 'Gemini • The Celestial Twins',
    glyph: '♊',
    element: 'AIR',
    elementIcon: '💨',
    elementColor: '#06b6d4',
    lore: 'Twin luminous stars, Castor and Pollux, guiding dual solar wind currents. Gemini weaves synchronized orbital rhythms, granting jumpers exquisite aerodynamic control and mid-air steering dexterity.',
    mythos: 'Two brothers immortalized in the stars, forever dancing around each other in synchronized binary orbit across the heavens.',
    celestialCoordinates: 'RA 07h 00m / Dec +22° 00\' • Planets 51-75',
    astralBuff: '+25% Mid-Air Steering Drift & Gravitational Buoyancy'
  },
  {
    id: 'CANCER',
    name: 'Cancer',
    latinName: 'Cancer • The Abyssal Crab',
    glyph: '♋',
    element: 'WATER',
    elementIcon: '💧',
    elementColor: '#3b82f6',
    lore: 'A bioluminescent water sign harboring the enchanting Praesepe Beehive nebula. Its cool, indigo gravity wells shield travelers from deep space hazards and draw distant starlight like gentle oceanic tides.',
    mythos: 'A creature of the deep celestial ocean whose shell glistens with pearls formed from compacted stardust.',
    celestialCoordinates: 'RA 08h 40m / Dec +20° 00\' • Planets 76-100',
    astralBuff: '+30% Starlight Magnet Pull Radius'
  },
  {
    id: 'LEO',
    name: 'Leo',
    latinName: 'Leo • The Solar Lion',
    glyph: '♌',
    element: 'FIRE',
    elementIcon: '🔥',
    elementColor: '#f59e0b',
    lore: 'A majestic constellation crowned by the brilliant blue-white star Regulus. Leo ignites nearby sun planets with roaring coronal energy, empowering daring jumpers with solar shielding and explosive launch momentum.',
    mythos: 'The golden lion whose radiant mane shines so brightly that darkness cannot take hold within its celestial domain.',
    celestialCoordinates: 'RA 10h 40m / Dec +15° 00\' • Planets 101-125',
    astralBuff: '+25% Sun Landing Points & Supercharged Solar Shield'
  },
  {
    id: 'VIRGO',
    name: 'Virgo',
    latinName: 'Virgo • The Astral Maiden',
    glyph: '♍',
    element: 'EARTH',
    elementIcon: '🌍',
    elementColor: '#84cc16',
    lore: 'The largest zodiac constellation, holding the brilliant sapphire star Spica. Virgo oversees the cosmic harvest, creating abundant fields of starlight collectibles along orbital rings.',
    mythos: 'The maiden who planted the celestial grain fields, turning empty vacuum into flourishing stellar orchards.',
    celestialCoordinates: 'RA 13h 25m / Dec -04° 00\' • Planets 126-150',
    astralBuff: '+20% Star Combo Multiplier Duration'
  },
  {
    id: 'LIBRA',
    name: 'Libra',
    latinName: 'Libra • The Cosmic Scales',
    glyph: '♎',
    element: 'AIR',
    elementIcon: '💨',
    elementColor: '#14b8a6',
    lore: 'The celestial scales of perfect equilibrium. Under Libra\'s harmonious sway, gravitational pull and launch velocity achieve flawless mathematical balance, making perfect jumps effortlessly natural.',
    mythos: 'The golden balance used to weigh the hearts of voyagers seeking entrance to the celestial sanctuaries.',
    celestialCoordinates: 'RA 15h 18m / Dec -15° 00\' • Planets 151-175',
    astralBuff: '+35% Perfect Jump Timing Window'
  },
  {
    id: 'SCORPIO',
    name: 'Scorpio',
    latinName: 'Scorpio • The Stellar Scorpion',
    glyph: '♏',
    element: 'WATER',
    elementIcon: '💧',
    elementColor: '#8b5cf6',
    lore: 'A piercing constellation centered on the titanic ruby supergiant Antares. Scorpio tempers jumpers with intense gravitational whirlpools and powerful ricochet propulsion.',
    mythos: 'The celestial guardian whose stinger releases bursts of ionized plasma to shatter space debris.',
    celestialCoordinates: 'RA 16h 53m / Dec -30° 00\' • Planets 176-200',
    astralBuff: '+40% Rocket Shoes Ricochet Bounce Impulse'
  },
  {
    id: 'SAGITTARIUS',
    name: 'Sagittarius',
    latinName: 'Sagittarius • The Cosmic Archer',
    glyph: '♐',
    element: 'FIRE',
    elementIcon: '🔥',
    elementColor: '#f97316',
    lore: 'An adventurous fire sign pointing its astral arrow straight toward the galactic core. Sagittarius inspires fearless high-altitude leaps, opening trajectories into the deepest frontiers of space.',
    mythos: 'The celestial archer whose arrows of pure starlight pierce through the advancing dark void.',
    celestialCoordinates: 'RA 19h 05m / Dec -25° 00\' • Planets 201-225',
    astralBuff: '+30% Jetpack Altitude Boost & Trajectory Reach'
  },
  {
    id: 'CAPRICORN',
    name: 'Capricorn',
    latinName: 'Capricorn • The Sea-Goat Titan',
    glyph: '♑',
    element: 'EARTH',
    elementIcon: '🌍',
    elementColor: '#64748b',
    lore: 'An ancient constellation bridging mountainous crystal crags with abyssal gravitational seas. Capricorn fortifies astronauts against petrification curses and icy space freezes.',
    mythos: 'The primordial sea-goat capable of climbing the steepest gravitational slopes in the cosmos.',
    celestialCoordinates: 'RA 21h 02m / Dec -18° 00\' • Planets 226-250',
    astralBuff: '+50% Resistance to Freezing & Stone Curse'
  },
  {
    id: 'AQUARIUS',
    name: 'Aquarius',
    latinName: 'Aquarius • The Celestial Water-Bearer',
    glyph: '♒',
    element: 'AIR',
    elementIcon: '💨',
    elementColor: '#0ea5e9',
    lore: 'The visionary air sign pouring forth streams of pure cosmic energy and stardust. Aquarius fills the void with radiant power-up capsules and celestial magnetic auras.',
    mythos: 'The cosmic cupbearer whose urn overflows with the living starlight that nourishes newly born planets.',
    celestialCoordinates: 'RA 22h 17m / Dec -00° 15\' • Planets 251-275',
    astralBuff: '+40% Magnet & Comet Power-Up Duration'
  },
  {
    id: 'PISCES',
    name: 'Pisces',
    latinName: 'Pisces • The Astral Koi',
    glyph: '♓',
    element: 'WATER',
    elementIcon: '💧',
    elementColor: '#6366f1',
    lore: 'The ethereal culminating sign of two celestial koi swimming in infinite harmony. Pisces weaves the tapestry of the entire zodiac into an unending loop of transcendental starlight and rebirth.',
    mythos: 'Two mystical koi tied with a golden celestial ribbon, guiding fallen voyagers to rise anew into the stars.',
    celestialCoordinates: 'RA 00h 28m / Dec +15° 00\' • Planets 276-300+',
    astralBuff: 'Phoenix Aura: 1 Free Auto-Rescue per Voyage'
  }
];

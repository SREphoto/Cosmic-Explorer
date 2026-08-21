import { ConstellationData } from '../types/game';

// Pure Astronomical Constellations (Zodiac glyphs removed)
export const CELESTIAL_CONSTELLATIONS: ConstellationData[] = [
  // 1. URSA MAJOR (The Great Bear / Big Dipper) - Planets 1 - 25
  {
    id: 'URSA_MAJOR',
    name: 'Ursa Major',
    latinName: 'Ursa Major • The Great Bear',
    element: 'EARTH',
    elementName: 'Terrestrial Corridor',
    elementColor: '#10b981',
    elementSecondaryColor: '#059669',
    elementAuraColor: 'rgba(16, 185, 129, 0.45)',
    minPlanetIndex: 1,
    maxPlanetIndex: 25,
    description: 'The ancient circumpolar constellation guiding early voyagers through blooming meadow worlds.',
    elementalBuff: '+15% Slingshot Initial Velocity & Mineral Stardust Yield',
    featuredPlanetTypes: ['GRASS', 'ASTEROID', 'STANDARD', 'SUN'],
    bgGradient: ['#0b1021', '#1e1b4b', '#064e3b'],
    nebulaColors: ['rgba(16, 185, 129, 0.22)', 'rgba(52, 211, 153, 0.18)', 'rgba(250, 204, 21, 0.14)'],
    starColors: ['#ffffff', '#a7f3d0', '#fed7aa', '#fef08a'],
    stars: [
      { x: 0.20, y: 0.35, brightness: 1.5, size: 4.5, name: 'Dubhe', isMain: true },
      { x: 0.22, y: 0.65, brightness: 1.4, size: 4.2, name: 'Merak', isMain: true },
      { x: 0.45, y: 0.62, brightness: 1.2, size: 3.6, name: 'Phecda' },
      { x: 0.44, y: 0.38, brightness: 1.1, size: 3.4, name: 'Megrez' },
      { x: 0.62, y: 0.32, brightness: 1.4, size: 4.0, name: 'Alioth', isMain: true },
      { x: 0.78, y: 0.25, brightness: 1.3, size: 3.8, name: 'Mizar', isMain: true },
      { x: 0.92, y: 0.45, brightness: 1.5, size: 4.4, name: 'Alkaid', isMain: true }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4],
      [4, 5],
      [5, 6]
    ]
  },

  // 2. ORION (The Cosmic Hunter & Great Nebula) - Planets 26 - 50
  {
    id: 'ORION',
    name: 'Orion',
    latinName: 'Orion • The Great Nebula Hunter',
    element: 'FIRE',
    elementName: 'Solar Expanse',
    elementColor: '#ef4444',
    elementSecondaryColor: '#f97316',
    elementAuraColor: 'rgba(239, 68, 68, 0.45)',
    minPlanetIndex: 26,
    maxPlanetIndex: 50,
    description: 'Blazing red supergiants and blue hypergiants cradling crystalline star nurseries.',
    elementalBuff: '+20% Diamond & Mineral Stardust Yield from Orbits',
    featuredPlanetTypes: ['CRYSTAL', 'ICE', 'ASTEROID', 'RINGED_GIANT'],
    bgGradient: ['#022c22', '#064e3b', '#1e1b4b'],
    nebulaColors: ['rgba(239, 68, 68, 0.24)', 'rgba(249, 115, 22, 0.18)', 'rgba(168, 85, 247, 0.15)'],
    starColors: ['#ffffff', '#fecaca', '#6ee7b7', '#fde047'],
    stars: [
      { x: 0.25, y: 0.22, brightness: 1.7, size: 5.0, name: 'Betelgeuse', isMain: true },
      { x: 0.75, y: 0.20, brightness: 1.4, size: 4.0, name: 'Bellatrix', isMain: true },
      { x: 0.40, y: 0.48, brightness: 1.3, size: 3.8, name: 'Alnitak' },
      { x: 0.50, y: 0.50, brightness: 1.4, size: 4.0, name: 'Alnilam', isMain: true },
      { x: 0.60, y: 0.52, brightness: 1.3, size: 3.8, name: 'Mintaka' },
      { x: 0.30, y: 0.78, brightness: 1.3, size: 3.6, name: 'Saiph' },
      { x: 0.78, y: 0.80, brightness: 1.8, size: 5.2, name: 'Rigel', isMain: true }
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 4],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 6],
      [5, 6]
    ]
  },

  // 3. CASSIOPEIA (The Celestial Throne) - Planets 51 - 75
  {
    id: 'CASSIOPEIA',
    name: 'Cassiopeia',
    latinName: 'Cassiopeia • The Celestial Crown',
    element: 'AIR',
    elementName: 'Ethereal Slipstream',
    elementColor: '#06b6d4',
    elementSecondaryColor: '#38bdf8',
    elementAuraColor: 'rgba(6, 182, 212, 0.45)',
    minPlanetIndex: 51,
    maxPlanetIndex: 75,
    description: 'Iconic W-asterism shimmering across the Milky Way stream with luminous neon auroras.',
    elementalBuff: '+25% Mid-Air Steering Drift & Gravitational Buoyancy',
    featuredPlanetTypes: ['NEON', 'RINGED_GIANT', 'PLASMA', 'STANDARD'],
    bgGradient: ['#082f49', '#0e7490', '#164e63'],
    nebulaColors: ['rgba(6, 182, 212, 0.26)', 'rgba(56, 189, 248, 0.22)', 'rgba(129, 140, 248, 0.18)'],
    starColors: ['#ffffff', '#a5f3fc', '#bae6fd', '#e0e7ff'],
    stars: [
      { x: 0.15, y: 0.35, brightness: 1.4, size: 4.2, name: 'Caph', isMain: true },
      { x: 0.35, y: 0.65, brightness: 1.6, size: 4.6, name: 'Schedar', isMain: true },
      { x: 0.52, y: 0.38, brightness: 1.7, size: 4.8, name: 'Gamma Cassiopeiae', isMain: true },
      { x: 0.70, y: 0.70, brightness: 1.3, size: 3.8, name: 'Ruchbah' },
      { x: 0.88, y: 0.42, brightness: 1.2, size: 3.5, name: 'Segin' }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4]
    ]
  },

  // 4. CYGNUS (The Northern Cross & Stellar Swan) - Planets 76 - 100
  {
    id: 'CYGNUS',
    name: 'Cygnus',
    latinName: 'Cygnus • The Northern Swan',
    element: 'WATER',
    elementName: 'Aquatic Nebula',
    elementColor: '#3b82f6',
    elementSecondaryColor: '#6366f1',
    elementAuraColor: 'rgba(59, 130, 246, 0.45)',
    minPlanetIndex: 76,
    maxPlanetIndex: 100,
    description: 'Cruising through the interstellar rift with sparkling sapphire stars and ocean worlds.',
    elementalBuff: '+30% Starlight Magnet Pull Range & Safe Gravitational Enclosure',
    featuredPlanetTypes: ['ICE', 'CRYSTAL', 'CELESTIAL_SANCTUARY', 'RINGED_GIANT'],
    bgGradient: ['#0f172a', '#172554', '#311042'],
    nebulaColors: ['rgba(59, 130, 246, 0.25)', 'rgba(99, 102, 241, 0.20)', 'rgba(192, 132, 252, 0.16)'],
    starColors: ['#ffffff', '#bfdbfe', '#c7d2fe', '#e9d5ff'],
    stars: [
      { x: 0.50, y: 0.18, brightness: 1.8, size: 5.2, name: 'Deneb', isMain: true },
      { x: 0.50, y: 0.50, brightness: 1.5, size: 4.4, name: 'Sadr', isMain: true },
      { x: 0.22, y: 0.48, brightness: 1.3, size: 3.8, name: 'Gienah' },
      { x: 0.78, y: 0.48, brightness: 1.3, size: 3.8, name: 'Delta Cygni' },
      { x: 0.50, y: 0.85, brightness: 1.6, size: 4.6, name: 'Albireo (Golden-Sapphire Binary)', isMain: true }
    ],
    lines: [
      [0, 1],
      [1, 4],
      [2, 1],
      [1, 3]
    ]
  },

  // 5. PEGASUS (The Great Stellar Square) - Planets 101 - 130
  {
    id: 'PEGASUS',
    name: 'Pegasus',
    latinName: 'Pegasus • The Winged Cosmic Steed',
    element: 'AETHER',
    elementName: 'Aetherial Wind',
    elementColor: '#ec4899',
    elementSecondaryColor: '#f43f5e',
    elementAuraColor: 'rgba(236, 72, 153, 0.45)',
    minPlanetIndex: 101,
    maxPlanetIndex: 130,
    description: 'The great square bridging planetary systems across luminous photon storms.',
    elementalBuff: '+20% Overdrive Speed & Jetpack Charge Capacity',
    featuredPlanetTypes: ['NEON', 'PLASMA', 'SUN', 'RINGED_GIANT'],
    bgGradient: ['#3b0764', '#4c0519', '#1e1b4b'],
    nebulaColors: ['rgba(236, 72, 153, 0.28)', 'rgba(244, 63, 94, 0.22)', 'rgba(251, 191, 36, 0.18)'],
    starColors: ['#ffffff', '#fbcfe8', '#fecdd3', '#fef08a'],
    stars: [
      { x: 0.30, y: 0.30, brightness: 1.5, size: 4.4, name: 'Scheat', isMain: true },
      { x: 0.70, y: 0.30, brightness: 1.5, size: 4.4, name: 'Alpheratz', isMain: true },
      { x: 0.70, y: 0.70, brightness: 1.4, size: 4.0, name: 'Algenib', isMain: true },
      { x: 0.30, y: 0.70, brightness: 1.5, size: 4.4, name: 'Markab', isMain: true },
      { x: 0.12, y: 0.85, brightness: 1.6, size: 4.6, name: 'Enif (The Celestial Muzzle)', isMain: true }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4]
    ]
  },

  // 6. ANDROMEDA (The Spiral Galaxia Realm) - Planets 131 - 160
  {
    id: 'ANDROMEDA',
    name: 'Andromeda',
    latinName: 'Andromeda • The Great Spiral Galaxy',
    element: 'COSMIC',
    elementName: 'Spiral Singularity',
    elementColor: '#8b5cf6',
    elementSecondaryColor: '#a855f7',
    elementAuraColor: 'rgba(139, 92, 246, 0.45)',
    minPlanetIndex: 131,
    maxPlanetIndex: 160,
    description: 'Trillions of distant stars spinning in grand galactic spirals, cradling antimatter realms.',
    elementalBuff: '+35% XP Progression Rate & Automatic Anomaly Defense',
    featuredPlanetTypes: ['CRYSTAL', 'ANTIMATTER', 'DARK', 'RINGED_GIANT'],
    bgGradient: ['#1e1b4b', '#2e1065', '#0f172a'],
    nebulaColors: ['rgba(139, 92, 246, 0.30)', 'rgba(168, 85, 247, 0.25)', 'rgba(56, 189, 248, 0.18)'],
    starColors: ['#ffffff', '#ddd6fe', '#e9d5ff', '#bae6fd'],
    stars: [
      { x: 0.25, y: 0.65, brightness: 1.6, size: 4.8, name: 'Alpheratz', isMain: true },
      { x: 0.48, y: 0.50, brightness: 1.5, size: 4.5, name: 'Mirach', isMain: true },
      { x: 0.72, y: 0.35, brightness: 1.7, size: 4.9, name: 'Almach', isMain: true },
      { x: 0.55, y: 0.30, brightness: 1.9, size: 5.5, name: 'Andromeda Galaxy Core (M31)', isMain: true }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [1, 3]
    ]
  },

  // 7. LYRA (The Harp of Vega) - Planets 161 - 200
  {
    id: 'LYRA',
    name: 'Lyra',
    latinName: 'Lyra • The Celestial Harp',
    element: 'AIR',
    elementName: 'Harmonic Frequency',
    elementColor: '#0ea5e9',
    elementSecondaryColor: '#38bdf8',
    elementAuraColor: 'rgba(14, 165, 233, 0.45)',
    minPlanetIndex: 161,
    maxPlanetIndex: 200,
    description: 'Resonates pure harmonic celestial chords anchored by the brilliant blue-white star Vega.',
    elementalBuff: 'Planetary Ricochet Impulse Boost & +50% Star Dust Multiplier',
    featuredPlanetTypes: ['CRYSTAL', 'CELESTIAL_SANCTUARY', 'NEON', 'ICE'],
    bgGradient: ['#082f49', '#1e1b4b', '#0369a1'],
    nebulaColors: ['rgba(14, 165, 233, 0.32)', 'rgba(56, 189, 248, 0.24)', 'rgba(192, 132, 252, 0.18)'],
    starColors: ['#ffffff', '#bae6fd', '#e0e7ff', '#fef08a'],
    stars: [
      { x: 0.45, y: 0.20, brightness: 2.0, size: 5.8, name: 'Vega (Alpha Lyrae)', isMain: true },
      { x: 0.30, y: 0.55, brightness: 1.3, size: 3.8, name: 'Sheliak' },
      { x: 0.60, y: 0.58, brightness: 1.4, size: 4.0, name: 'Sulafat', isMain: true },
      { x: 0.25, y: 0.80, brightness: 1.2, size: 3.5, name: 'Delta Lyrae' },
      { x: 0.55, y: 0.82, brightness: 1.3, size: 3.7, name: 'Zeta Lyrae' }
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4]
    ]
  },

  // 8. PHOENIX (The Stellar Fire Rebirth) - Planets 201 - 250
  {
    id: 'PHOENIX',
    name: 'Phoenix',
    latinName: 'Phoenix • The Stellar Fire Reborn',
    element: 'FIRE',
    elementName: 'Supernova Rebirth',
    elementColor: '#f97316',
    elementSecondaryColor: '#fb923c',
    elementAuraColor: 'rgba(249, 115, 22, 0.45)',
    minPlanetIndex: 201,
    maxPlanetIndex: 250,
    description: 'Forged in stellar supernovae, radiating golden flares and indestructible cosmic energy.',
    elementalBuff: 'Phoenix Automatic Chrono Revive & Thermal Thrust Shield',
    featuredPlanetTypes: ['MAGMA', 'PLASMA', 'SUN', 'ANTIMATTER'],
    bgGradient: ['#450a0a', '#1e1b4b', '#7c2d12'],
    nebulaColors: ['rgba(249, 115, 22, 0.32)', 'rgba(239, 68, 68, 0.28)', 'rgba(250, 204, 21, 0.20)'],
    starColors: ['#ffffff', '#fed7aa', '#fecaca', '#fef08a'],
    stars: [
      { x: 0.50, y: 0.25, brightness: 1.8, size: 5.0, name: 'Ankaa (Alpha Phoenicis)', isMain: true },
      { x: 0.25, y: 0.60, brightness: 1.4, size: 4.0, name: 'Beta Phoenicis' },
      { x: 0.75, y: 0.58, brightness: 1.4, size: 4.0, name: 'Gamma Phoenicis' },
      { x: 0.50, y: 0.85, brightness: 1.3, size: 3.8, name: 'Zeta Phoenicis' }
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3]
    ]
  },

  // 9. CENTAURUS (The Alpha Star Sanctuary) - Planets 251 - 320
  {
    id: 'CENTAURUS',
    name: 'Centaurus',
    latinName: 'Centaurus • The Alpha Star Sanctuary',
    element: 'EARTH',
    elementName: 'Titanium Monolith',
    elementColor: '#15803d',
    elementSecondaryColor: '#047857',
    elementAuraColor: 'rgba(21, 128, 61, 0.45)',
    minPlanetIndex: 251,
    maxPlanetIndex: 320,
    description: 'Home to the closest star systems, ancient titanium bastions, and fertile mineral moons.',
    elementalBuff: 'Immunity to Void Shock & Double Raw Supply Yield on Landing',
    featuredPlanetTypes: ['MECH', 'CRYSTAL', 'ANTIMATTER', 'RINGED_GIANT'],
    bgGradient: ['#052e16', '#064e3b', '#1e293b'],
    nebulaColors: ['rgba(34, 197, 94, 0.26)', 'rgba(16, 185, 129, 0.22)', 'rgba(100, 116, 139, 0.20)'],
    starColors: ['#ffffff', '#bbf7d0', '#a7f3d0', '#cbd5e1'],
    stars: [
      { x: 0.35, y: 0.30, brightness: 2.0, size: 5.6, name: 'Alpha Centauri (Rigil Kentaurus)', isMain: true },
      { x: 0.55, y: 0.35, brightness: 1.8, size: 5.2, name: 'Hadar (Beta Centauri)', isMain: true },
      { x: 0.30, y: 0.65, brightness: 1.4, size: 4.0, name: 'Menkent' },
      { x: 0.70, y: 0.60, brightness: 1.3, size: 3.8, name: 'Muhlifain' }
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3]
    ]
  },

  // 10. DRACO (The Circumpolar Dragon) - Planets 321 - 400
  {
    id: 'DRACO',
    name: 'Draco',
    latinName: 'Draco • The Circumpolar Dragon',
    element: 'COSMIC',
    elementName: 'Quantum Void',
    elementColor: '#7c3aed',
    elementSecondaryColor: '#9333ea',
    elementAuraColor: 'rgba(124, 58, 237, 0.45)',
    minPlanetIndex: 321,
    maxPlanetIndex: 400,
    description: 'Winding across the northern heavens, guarding ancient antimatter celestial vaults.',
    elementalBuff: '+50% PowerUp Duration & Free Jetpack Charge Generation',
    featuredPlanetTypes: ['DARK', 'ANTIMATTER', 'PLASMA', 'CELESTIAL_SANCTUARY'],
    bgGradient: ['#1e1b4b', '#3b0764', '#09090b'],
    nebulaColors: ['rgba(124, 58, 237, 0.32)', 'rgba(147, 51, 234, 0.26)', 'rgba(56, 189, 248, 0.20)'],
    starColors: ['#ffffff', '#ddd6fe', '#e9d5ff', '#bae6fd'],
    stars: [
      { x: 0.20, y: 0.30, brightness: 1.6, size: 4.8, name: 'Eltanin', isMain: true },
      { x: 0.35, y: 0.22, brightness: 1.5, size: 4.4, name: 'Rastaban', isMain: true },
      { x: 0.50, y: 0.45, brightness: 1.3, size: 3.8, name: 'Grumium' },
      { x: 0.65, y: 0.60, brightness: 1.4, size: 4.0, name: 'Thuban (Ancient Pole Star)', isMain: true },
      { x: 0.85, y: 0.75, brightness: 1.2, size: 3.5, name: 'Gianfar' }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4]
    ]
  },

  // 11. AQUILA (The Starlight Eagle) - Planets 401 - 500
  {
    id: 'AQUILA',
    name: 'Aquila',
    latinName: 'Aquila • The Celestial Eagle',
    element: 'AIR',
    elementName: 'Solar Stream',
    elementColor: '#0284c7',
    elementSecondaryColor: '#06b6d4',
    elementAuraColor: 'rgba(2, 132, 199, 0.45)',
    minPlanetIndex: 401,
    maxPlanetIndex: 500,
    description: 'Soaring through cosmic clouds, featuring the rapid rotator star Altair and diamond worlds.',
    elementalBuff: 'Infinite Magnet Range in High Orbits & +100% Star Value',
    featuredPlanetTypes: ['NEON', 'PLASMA', 'CELESTIAL_SANCTUARY', 'RINGED_GIANT'],
    bgGradient: ['#082f49', '#0369a1', '#1e1b4b'],
    nebulaColors: ['rgba(2, 132, 199, 0.30)', 'rgba(6, 182, 212, 0.25)', 'rgba(168, 85, 247, 0.20)'],
    starColors: ['#ffffff', '#bae6fd', '#a5f3fc', '#fbcfe8'],
    stars: [
      { x: 0.50, y: 0.35, brightness: 2.0, size: 5.8, name: 'Altair (Alpha Aquilae)', isMain: true },
      { x: 0.42, y: 0.25, brightness: 1.4, size: 4.0, name: 'Tarazed' },
      { x: 0.58, y: 0.45, brightness: 1.3, size: 3.8, name: 'Alshain' },
      { x: 0.28, y: 0.65, brightness: 1.2, size: 3.5, name: 'Deneb el Okab' },
      { x: 0.72, y: 0.70, brightness: 1.2, size: 3.5, name: 'Bezek' }
    ],
    lines: [
      [1, 0],
      [0, 2],
      [0, 3],
      [0, 4]
    ]
  },

  // 12. PERSEUS (The Radiant Perseid Stream) - Planets 501 - 1000+
  {
    id: 'PERSEUS',
    name: 'Perseus',
    latinName: 'Perseus • The Radiant Perseid Stream',
    element: 'AETHER',
    elementName: 'Omniverse Singularity',
    elementColor: '#6366f1',
    elementSecondaryColor: '#c084fc',
    elementAuraColor: 'rgba(99, 102, 241, 0.45)',
    minPlanetIndex: 501,
    maxPlanetIndex: 1000,
    description: 'The radiant source of the Perseid meteor storms, crowning the infinite omniverse horizon.',
    elementalBuff: 'Perseid Meteor Storm Mastery & +200% Cosmic Ascension XP',
    featuredPlanetTypes: ['ANTIMATTER', 'CELESTIAL_SANCTUARY', 'DARK', 'RINGED_GIANT', 'NEON'],
    bgGradient: ['#09090b', '#1e1b4b', '#3b0764'],
    nebulaColors: ['rgba(99, 102, 241, 0.35)', 'rgba(192, 132, 252, 0.30)', 'rgba(244, 63, 94, 0.25)'],
    starColors: ['#ffffff', '#c7d2fe', '#e9d5ff', '#f43f5e', '#38bdf8'],
    stars: [
      { x: 0.45, y: 0.30, brightness: 1.9, size: 5.4, name: 'Mirfak (Alpha Persei)', isMain: true },
      { x: 0.30, y: 0.55, brightness: 1.7, size: 5.0, name: 'Algol (The Demon Star Eclipsing Binary)', isMain: true },
      { x: 0.65, y: 0.50, brightness: 1.4, size: 4.0, name: 'Atik' },
      { x: 0.70, y: 0.75, brightness: 1.3, size: 3.8, name: 'Menkib' },
      { x: 0.25, y: 0.80, brightness: 1.3, size: 3.8, name: 'Miram' }
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 4],
      [2, 3]
    ]
  }
];

export const ZODIAC_CONSTELLATIONS = CELESTIAL_CONSTELLATIONS;

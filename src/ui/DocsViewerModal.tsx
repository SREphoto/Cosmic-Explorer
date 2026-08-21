import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  BookOpen, 
  Sparkles, 
  Lock, 
  Settings as SettingsIcon, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Lightbulb,
  Globe,
  Search,
  SlidersHorizontal,
  Compass,
  Eye,
  Flame,
  Snowflake,
  Wind,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Telescope
} from 'lucide-react';
import { CONSTELLATION_LORE_DATABASE, PLANET_LORE_DATABASE, getStarGazingWeather } from '../core/Config';
import { StorageManager } from '../core/Storage';
import { UserSavedData } from '../types/game';
import { audioEngine } from '../core/AudioEngine';
import galaxyMapBannerImg from '../assets/images/galaxy_map_banner_1786696571856.jpg';

interface DocsViewerModalProps {
  onClose: () => void;
  savedData: UserSavedData;
  onToggleAudio: () => void;
  onVolumeChange?: (type: 'music' | 'sfx' | 'ambient', value: number) => void;
  onClearData: () => void;
}

const DOC_FILES = [
  {
    id: 'encyclopedia',
    label: 'Planet Encyclopedia',
    icon: <Globe className="w-4 h-4 text-cyan-400" />
  },
  {
    id: 'archive',
    label: 'Galaxy Codex',
    icon: <BookOpen className="w-4 h-4 text-purple-400" />
  },
  {
    id: 'roadmap',
    label: 'Ideas & Roadmap',
    icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
    content: `# Cosmic Explorer - Feature Ideas & Implementation Roadmap

## 📋 Catalog of 20 Planned Features

### 🎨 1. Graphics & Visual Polish
1. Dynamic Atmospheric Re-Entry & Heat Flares [FEATURE FOCUS #1]
2. Volumetric Planet Atmospheres & Polar Aurora Borealis Rings
3. Hyper-Jump Warp & Speed Lines Canvas Effect
4. Constellation Stargazing Constellation Lines in Background
5. Impact Kinetic Shockwaves & Floating Mineral Debris

### 🚀 2. Playability & Excitement
6. "Gravity Wells" & Wormhole Hazard Portals [FEATURE FOCUS #2]
7. Cosmic Storm Emergency Events (Solar Flare Rush)
8. Boss Celestial Encounters (The Leviathan Comet / Galactic Golem)
9. Mystery Astral Relic Crates & Mid-Flight Lockboxes
10. Time-Attack "Hyper Sprint" Mode (60s Score Attack)

### 🌌 3. Physics & Orbital Mechanics
11. Binary & Trinary Star Orbital Systems [FEATURE FOCUS #3]
12. Elliptical & Orbiting Asteroid Belts
13. Repulsor & Magnetar Magnetic Poles
14. Variable Gravity Planetary Densities
15. Solar Sail & Solar Wind Vector Physics

### 🎵 4. Sounds & Dynamic Music
16. Adaptive Interactive Music Engine (Stem Layering) [FEATURE FOCUS #4]
17. Harmonic Slingshot Scale Feedback (Musical Pitch Climbing)
18. Gravitational Doppler & Zero-G Doppler Shift
19. Deep Sub-Bass Rumble on Orbital Capture
20. Custom Radio Transmissions & Retro Cosmonaut Voice Chimes

---

## 🌟 Deep Dives & Architecture for #1 in Each Category

### 🎨 [GRAPHICS #1] Dynamic Atmospheric Re-Entry & Heat Flares
- Bow-shock plasma shield rendered 12px ahead of player trajectory.
- Temperature color spectrum: Golden Amber (Mach 1) -> Fiery Orange (Mach 2) -> Electric Cyan (Mach 3+).
- Deforming thermal wake particle system trailing behind astronaut.
- Screen-space chromatic aberration and speed lines at extreme velocity (>700 px/s).

### 🚀 [PLAYABILITY #1] "Gravity Wells" & Wormhole Hazard Portals
- Paired Einstein-Rosen Wormhole portals (Cyan Entry / Violet Exit) granting +1,500m to +3,000m instant altitude leaps with 1.5x speed boost and +50 Star Dust bonus.
- Singularity Black Holes with dangerous event horizons (instant crash) and outer ergospheres for risky gravitational whip slingshots (+2x combo multiplier).
- Off-screen HUD radar pings alerting upcoming portals and cosmic anomalies.

### 🌌 [PHYSICS #1] Binary & Trinary Star Orbital Systems
- Multi-body barycenter gravitation: F_total = sum(G * M_i / r_i^2).
- Dynamic L1 Lagrange Saddle Point allowing zero-energy figure-eight orbital switches between paired suns/planets.
- Awards the "Galileo Maneuver" achievement badge and triples star collection values during figure-eight transfers.

### 🎵 [AUDIO #1] Adaptive Interactive Music Engine (Stem Layering)
- 4-Channel dynamic WebAudio mixer:
  * Channel 1: Ambient Space Drone (Always on)
  * Channel 2: Shimmering Pentatonic Synth Chimes (Fades in with Altitude)
  * Channel 3: Rhythmic Drive & Sidechained Kick (Triggers on 3x+ Combo & Velocity >500 px/s)
  * Channel 4: Climax Lead & Acid Synth (Active during Comet Boosts & Solar Storms)
- Seamless 400ms linear gain ramping for smooth emotional soundtrack transitions.`
  },
  {
    id: 'version',
    label: 'Version History',
    icon: <Code2 className="w-4 h-4 text-emerald-400" />,
    content: `# Version History - Cosmic Explorer Engine

## v1.0.0 (2026-08-11) - Production Release
### Added
- Complete 2D Orbital Physics Engine with point-mass inverse-square gravity.
- Tangential single-touch launch with star trail trajectory prediction.
- Advancing Dark Void time-limit system with landing setbacks.
- Procedural planetary galaxy generator with planets, suns, stars, diamonds.
- Magnet and Comet power-ups with upgradeable level ranks.
- 3-Objective stage quest pipeline with real-time HUD progress tracking.
- Character Wardrobe shop with unlockable skins (Astronaut, Pirate, Princess, Ninja, etc.).`
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon className="w-4 h-4 text-slate-400" />
  }
];

export const DocsViewerModal: React.FC<DocsViewerModalProps> = ({ onClose, savedData, onToggleAudio, onVolumeChange, onClearData }) => {
  const [activeTab, setActiveTab] = useState('encyclopedia');
  const [archiveFilter, setArchiveFilter] = useState<'ALL' | 'CONSTELLATIONS' | 'PLANETS'>('ALL');
  const [encyclopediaFilter, setEncyclopediaFilter] = useState<'ALL' | 'SAFE' | 'HAZARD' | 'EXTREME' | 'DISCOVERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanetType, setSelectedPlanetType] = useState<string | null>(null);

  const discoveredConstellations = savedData.discoveredConstellationIds || ['ARIES'];
  const discoveredPlanets = savedData.discoveredPlanetTypes || ['GRASS', 'STANDARD', 'SUN'];

  const currentDoc = DOC_FILES.find((d) => d.id === activeTab) || DOC_FILES[0];

  const totalConstellations = CONSTELLATION_LORE_DATABASE.length;
  const unlockedConstellationsCount = CONSTELLATION_LORE_DATABASE.filter((c) =>
    discoveredConstellations.includes(c.id)
  ).length;

  const totalPlanets = PLANET_LORE_DATABASE.length;
  const unlockedPlanetsCount = PLANET_LORE_DATABASE.filter((p) =>
    discoveredPlanets.includes(p.type)
  ).length;

  // Filtered planet list for the Encyclopedia
  const filteredEncyclopediaPlanets = PLANET_LORE_DATABASE.filter((planet) => {
    const isUnlocked = discoveredPlanets.includes(planet.type);
    
    // Text search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = planet.name.toLowerCase().includes(q);
      const matchSubtitle = planet.subtitle.toLowerCase().includes(q);
      const matchType = planet.type.toLowerCase().includes(q);
      const matchLore = planet.lore.toLowerCase().includes(q);
      const weather = getStarGazingWeather(planet.type);
      const matchWeather = weather.name.toLowerCase().includes(q) || weather.description.toLowerCase().includes(q);
      if (!matchName && !matchSubtitle && !matchType && !matchLore && !matchWeather) {
        return false;
      }
    }

    // Category / Hazard filter
    if (encyclopediaFilter === 'DISCOVERED') return isUnlocked;
    if (encyclopediaFilter === 'SAFE') return planet.hazardRisk === 'NONE' || planet.hazardRisk === 'LOW';
    if (encyclopediaFilter === 'HAZARD') return planet.hazardRisk === 'MEDIUM' || planet.hazardRisk === 'HIGH';
    if (encyclopediaFilter === 'EXTREME') return planet.hazardRisk === 'EXTREME';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-3xl p-5 sm:p-6 text-white shadow-2xl flex flex-col h-[88vh] ui-interactive overflow-hidden">
        {/* Top Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-md mb-3 shrink-0 h-24 group">
          <img
            src={galaxyMapBannerImg}
            alt="Galaxy Codex"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end justify-between p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-purple-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white">
                  Galaxy Codex & Logs
                </h2>
                <p className="text-xs text-slate-300">
                  Planetary biome logs, zodiac lore archives, and system notes
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

        {/* Document Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 shrink-0 no-scrollbar">
          {DOC_FILES.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveTab(doc.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 btn-grow-sm ${
                activeTab === doc.id
                  ? 'bg-purple-600 text-white shadow-sm glow-purple-hover'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {doc.icon}
              <span>{doc.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'encyclopedia' ? (
          <div className="flex-1 flex flex-col overflow-hidden my-2">
            {/* Encyclopedia Sub-header / Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 pt-1 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setEncyclopediaFilter('ALL')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    encyclopediaFilter === 'ALL'
                      ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                  }`}
                >
                  All Worlds ({totalPlanets})
                </button>
                <button
                  onClick={() => setEncyclopediaFilter('DISCOVERED')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    encyclopediaFilter === 'DISCOVERED'
                      ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                  }`}
                >
                  Discovered ({unlockedPlanetsCount}/{totalPlanets})
                </button>
                <button
                  onClick={() => setEncyclopediaFilter('SAFE')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    encyclopediaFilter === 'SAFE'
                      ? 'bg-blue-500/20 border border-blue-500/60 text-blue-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                  }`}
                >
                  Habitable / Low Hazard
                </button>
                <button
                  onClick={() => setEncyclopediaFilter('HAZARD')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    encyclopediaFilter === 'HAZARD'
                      ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                  }`}
                >
                  Hazardous Environments
                </button>
                <button
                  onClick={() => setEncyclopediaFilter('EXTREME')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    encyclopediaFilter === 'EXTREME'
                      ? 'bg-rose-500/20 border border-rose-500/60 text-rose-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                  }`}
                >
                  Singularities & Extremes
                </button>
              </div>

              {/* Search Field */}
              <div className="relative flex items-center min-w-[200px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lore, weather, specs..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-slate-500 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Encyclopedia Planet Cards Grid */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800/80 my-2">
              {filteredEncyclopediaPlanets.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  No celestial planet records match your search criteria.
                </div>
              ) : (
                filteredEncyclopediaPlanets.map((planet) => {
                  const isUnlocked = discoveredPlanets.includes(planet.type);
                  const weather = getStarGazingWeather(planet.type);

                  const hazardColor =
                    planet.hazardRisk === 'NONE'
                      ? 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
                      : planet.hazardRisk === 'LOW'
                      ? 'text-sky-400 bg-sky-950/50 border-sky-500/40'
                      : planet.hazardRisk === 'MEDIUM'
                      ? 'text-amber-400 bg-amber-950/50 border-amber-500/40'
                      : planet.hazardRisk === 'HIGH'
                      ? 'text-orange-400 bg-orange-950/50 border-orange-500/40'
                      : 'text-rose-400 bg-rose-950/50 border-rose-500/40';

                  return (
                    <div
                      key={planet.type}
                      className={`bg-slate-900/90 border rounded-2xl p-4 transition-all duration-300 space-y-3 relative overflow-hidden ${
                        isUnlocked
                          ? 'border-slate-800 hover:border-cyan-500/40 shadow-lg'
                          : 'border-slate-800/60 opacity-85'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md border"
                            style={{
                              backgroundColor: `${planet.accentColor}25`,
                              borderColor: `${planet.accentColor}60`
                            }}
                          >
                            {planet.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-sm text-white">{planet.name}</h3>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                {planet.type}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${hazardColor}`}>
                                Hazard: {planet.hazardRisk}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{planet.subtitle}</p>
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-xl">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Discovered
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-xl">
                              <Lock className="w-3.5 h-3.5" /> Uncharted
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scientific & Astrophysical Specifications Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2">
                          <span className="text-[10px] text-slate-400 block font-sans">Atmospheric Envelope</span>
                          <span className="text-white font-bold block truncate" title={planet.atmosphereType}>
                            {planet.atmosphereType}
                          </span>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2">
                          <span className="text-[10px] text-slate-400 block font-sans">Gravity Well</span>
                          <span className="text-cyan-300 font-bold block">{planet.gravitySignature}</span>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2">
                          <span className="text-[10px] text-slate-400 block font-sans">Discovery Sector</span>
                          <span className="text-amber-300 font-bold block">{planet.discoveryMilestone}</span>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2">
                          <span className="text-[10px] text-slate-400 block font-sans">Thermal Index</span>
                          <span className="text-purple-300 font-bold block truncate">
                            {planet.type === 'SUN' || planet.type === 'MAGMA' || planet.type === 'STORM' || planet.type === 'CLOUD'
                              ? 'Extreme Heat'
                              : planet.type === 'ICE' || planet.type === 'AURORA'
                              ? 'Cryogenic Sub-Zero'
                              : planet.type === 'DARK' || planet.type === 'NEBULA'
                              ? 'Absolute Zero'
                              : planet.type === 'TOXIC'
                              ? 'Corrosive Greenhouse'
                              : planet.type === 'MOON'
                              ? 'Airless Vacuum'
                              : 'Temperate'}
                          </span>
                        </div>
                      </div>

                      {/* Geological Lore & Research Notes */}
                      <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                          <span>Cosmic Lore & Geological Origin</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{planet.lore}</p>
                        {planet.astrophysicalNotes && (
                          <div className="pt-1.5 mt-1 border-t border-slate-800/50 flex items-start gap-1.5 text-[11px] text-cyan-300/90 font-mono">
                            <span className="text-cyan-400 font-bold shrink-0">🔬 Astrophysical Research:</span>
                            <span>{planet.astrophysicalNotes}</span>
                          </div>
                        )}
                      </div>

                      {/* Star Gazing Mode Weather Effects Callout Box */}
                      <div
                        className="rounded-xl p-3 border space-y-2 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${weather.ambientColor}15, rgba(15, 23, 42, 0.8))`,
                          borderColor: `${weather.ambientColor}40`
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                              <Telescope className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white">
                                  {weather.name}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                                  {weather.subtitle}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Star Gazing Mode Weather Effect
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                            <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                              Particles: <strong className="text-white">{weather.particleCount}</strong>
                            </span>
                            <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                              Type: <strong className="text-cyan-300">{weather.particleType}</strong>
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{weather.description}"
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'archive' ? (
          <div className="flex-1 flex flex-col overflow-hidden my-2">
            {/* Archive Sub-header / Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 pt-1 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setArchiveFilter('ALL')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all duration-200 btn-grow-sm ${
                    archiveFilter === 'ALL'
                      ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({unlockedConstellationsCount + unlockedPlanetsCount}/{totalConstellations + totalPlanets})
                </button>
                <button
                  onClick={() => setArchiveFilter('CONSTELLATIONS')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all duration-200 btn-grow-sm ${
                    archiveFilter === 'CONSTELLATIONS'
                      ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Constellations ({unlockedConstellationsCount}/{totalConstellations})
                </button>
                <button
                  onClick={() => setArchiveFilter('PLANETS')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all duration-200 btn-grow-sm ${
                    archiveFilter === 'PLANETS'
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Biomes ({unlockedPlanetsCount}/{totalPlanets})
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Voyage across planets to decipher logs</span>
              </div>
            </div>

            {/* Archive Grid */}
            <div className="flex-1 overflow-y-auto p-2.5 grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-slate-950/50 rounded-2xl border border-slate-800/80 my-2">
              {/* Constellation Entries */}
              {(archiveFilter === 'ALL' || archiveFilter === 'CONSTELLATIONS') &&
                CONSTELLATION_LORE_DATABASE.map((lore) => {
                  const isUnlocked = discoveredConstellations.includes(lore.id);

                  return (
                    <div
                      key={lore.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isUnlocked
                          ? 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-sm'
                          : 'bg-slate-950/40 border-slate-850/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                          style={{
                            backgroundColor: isUnlocked ? `${lore.elementColor}22` : '#1e293b',
                            border: `1px solid ${isUnlocked ? lore.elementColor : '#334155'}`
                          }}
                        >
                          {isUnlocked ? lore.glyph : <Lock className="w-4 h-4 text-slate-500" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3
                              className="font-bold text-xs truncate"
                              style={{ color: isUnlocked ? lore.elementColor : '#94a3b8' }}
                            >
                              {isUnlocked ? lore.name : 'Unknown Constellation'}
                            </h3>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              {lore.celestialCoordinates}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span>{lore.elementIcon}</span>
                            <span className="font-medium">{lore.element} Sign</span>
                            <span>•</span>
                            <span className="italic truncate">{isUnlocked ? lore.latinName : 'Locked'}</span>
                          </div>

                          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                            {isUnlocked ? lore.lore : `Explore and land on worlds in this sector to discover and decipher this Zodiac constellation's celestial lore.`}
                          </p>

                          {isUnlocked && (
                            <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="text-purple-300/90 font-medium">✨ {lore.astralBuff}</span>
                              <span className="text-slate-500">ZOD-{lore.id.slice(0, 3)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Planet Lore Entries */}
              {(archiveFilter === 'ALL' || archiveFilter === 'PLANETS') &&
                PLANET_LORE_DATABASE.map((lore) => {
                  const isUnlocked = discoveredPlanets.includes(lore.type);

                  return (
                    <div
                      key={lore.type}
                      className={`p-3 rounded-2xl border transition-all ${
                        isUnlocked
                          ? 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-sm'
                          : 'bg-slate-950/40 border-slate-850/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                          style={{
                            backgroundColor: isUnlocked ? `${lore.accentColor}22` : '#1e293b',
                            border: `1px solid ${isUnlocked ? lore.accentColor : '#334155'}`
                          }}
                        >
                          {isUnlocked ? lore.icon : <Lock className="w-4 h-4 text-slate-500" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3
                              className="font-bold text-xs truncate"
                              style={{ color: isUnlocked ? lore.accentColor : '#94a3b8' }}
                            >
                              {isUnlocked ? lore.name : 'Unmapped Orbital Body'}
                            </h3>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              Hazard: {lore.hazardRisk}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 mt-0.5 italic truncate">
                            {isUnlocked ? lore.subtitle : 'Undiscovered Planetary Mantle'}
                          </div>

                          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                            {isUnlocked ? lore.lore : `Touch down on a ${lore.name} body during your journey to decipher this planet's geological and cosmic origin.`}
                          </p>

                          {isUnlocked && (
                            <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="text-emerald-300/90 font-medium">⚡ {lore.gravitySignature}</span>
                              <span className="text-slate-500">Type: {lore.type}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          /* Settings Box */
          <div className="flex-1 overflow-y-auto p-4 my-2 bg-slate-950/80 rounded-2xl border border-slate-800 text-slate-300 space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Game Settings</h3>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">Randomize Aesthetics</h4>
                <p className="text-xs text-slate-400 mt-1">Cycle through random color palettes and star-fields at the start of every run.</p>
              </div>
              <button 
                onClick={() => {
                  const updated = { ...savedData, randomizeAesthetics: !savedData.randomizeAesthetics };
                  // We need to dispatch a custom event or have an onSaveData prop, but we only have onClearData and onToggleAudio.
                  // Let's use window.dispatchEvent to notify App to update it.
                  window.dispatchEvent(new CustomEvent('TOGGLE_RANDOM_AESTHETICS', { detail: !savedData.randomizeAesthetics }));
                }}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${savedData.randomizeAesthetics ? 'bg-sky-500' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${savedData.randomizeAesthetics ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Master Audio Toggle</h4>
                  <p className="text-xs text-slate-400 mt-1">Enable or disable all game sounds globally.</p>
                </div>
                <button 
                  onClick={onToggleAudio}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition shrink-0 ml-4"
                >
                  {savedData.soundEnabled ? <Volume2 className="w-5 h-5 text-sky-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                </button>
              </div>

              {savedData.soundEnabled && (
                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-300">Background Music</span>
                      <span className="text-sky-400">{Math.round((savedData.musicVolume ?? 1.0) * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.05" 
                      value={savedData.musicVolume ?? 1.0}
                      onChange={(e) => onVolumeChange?.('music', parseFloat(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-800 rounded-full h-1.5 appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-300">Sound Effects</span>
                      <span className="text-amber-400">{Math.round((savedData.soundVolume ?? 1.0) * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.05" 
                      value={savedData.soundVolume ?? 1.0}
                      onChange={(e) => onVolumeChange?.('sfx', parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 rounded-full h-1.5 appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-300">Ambient Sounds</span>
                      <span className="text-purple-400">{Math.round((savedData.ambientVolume ?? 1.0) * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.05" 
                      value={savedData.ambientVolume ?? 1.0}
                      onChange={(e) => onVolumeChange?.('ambient', parseFloat(e.target.value))}
                      className="w-full accent-purple-500 bg-slate-800 rounded-full h-1.5 appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        audioEngine.playLevelUpFanfare();
                      }}
                      className="flex-1 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold rounded-lg border border-sky-500/30 transition text-xs"
                    >
                      Test Music
                    </button>
                    <button
                      onClick={() => {
                        audioEngine.playJump();
                      }}
                      className="flex-1 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-lg border border-amber-500/30 transition text-xs"
                    >
                      Test SFX
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-rose-400">Clear Save Data</h4>
                <p className="text-xs text-slate-400 mt-1">Reset all progress, upgrades, and unlocks. This cannot be undone.</p>
              </div>
              <button 
                onClick={() => {
                  if(window.confirm('Are you sure you want to completely reset all your progress? This cannot be undone!')) {
                    onClearData();
                  }
                }}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl border border-rose-500/30 transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Reset Data
              </button>
            </div>
          </div>
        ) : (
          /* Document Content Box */
          <div className="flex-1 overflow-y-auto p-4 my-2 bg-slate-950/80 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
            {currentDoc.content}
          </div>
        )}
      </div>
    </div>
  );
};

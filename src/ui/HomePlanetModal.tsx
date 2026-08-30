import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Edit3,
  Home,
  Info,
  Lock,
  Package,
  Radio,
  Rocket,
  ShoppingBag,
  Sparkles,
  Sprout,
  Star,
  Timer,
  Wrench,
  X
} from 'lucide-react';
import {
  HomeFurnitureItem,
  HomeGardenPlot,
  HomePlanetData,
  HomePlacedFurniture,
  HomeSeedType,
  SpaceTravelerOffer,
  UserSavedData
} from '../types/game';
import {
  CRAFTABLE_HOME_TOOLS,
  GARDEN_SEEDS,
  GREENHOUSE_UPGRADES,
  HABITAT_UPGRADES,
  HOME_FURNITURE_CATALOG,
  HOME_PLANET_BIOMES,
  STORAGE_UPGRADES,
  calculateSkillBonuses,
  gardenGrowthMultiplier,
  gardenHarvestMultiplier,
  generateSpaceTravelerVisit,
  hasCraftedTool,
  homeUpgradeCostMultiplier
} from '../core/Config';
import { audioEngine } from '../core/AudioEngine';
import { StorageManager } from '../core/Storage';
import {
  BIOME_SPRITES,
  COSTUME_SPRITES,
  COSTUME_WALK_FRAMES,
  FURNITURE_SPRITES,
  HABITAT_SPRITES,
  PLANT_SPRITES,
  RESOURCE_SPRITES,
  STORAGE_SPRITE,
  TOOL_SPRITES
} from '../core/SpriteAtlas';
import { ItemSprite } from '../components/ItemSprite';
import galaxyBgUrl from '../assets/images/galaxy_cosmic_bg_1786680029303.jpg';

interface HomePlanetModalProps {
  savedData: UserSavedData;
  onClose: () => void;
  onUpdateSavedData: (updated: UserSavedData) => void;
}

type SanctuaryScene = 'TOWN' | 'HABITAT' | 'GREENHOUSE' | 'VAULT' | 'WORKSHOP' | 'MARKET' | 'TRAVELER';
type ResourceCost = {
  timber?: number;
  quartz?: number;
  alloys?: number;
  plasmaCells?: number;
  starDust?: number;
  stars?: number;
  diamonds?: number;
};

type TownBuilding = {
  scene: SanctuaryScene;
  x: number;
  name: string;
  subtitle: string;
  accent: string;
  kind: 'traveler' | 'greenhouse' | 'habitat' | 'workshop' | 'vault' | 'market';
};

const TOWN_WIDTH = 2180;
const TOWN_BUILDINGS: TownBuilding[] = [
  { scene: 'TRAVELER', x: 185, name: 'Landing Pad', subtitle: 'Talk & trade', accent: '#c084fc', kind: 'traveler' },
  { scene: 'GREENHOUSE', x: 535, name: 'Astral Greenhouse', subtitle: 'Plant & harvest', accent: '#34d399', kind: 'greenhouse' },
  { scene: 'HABITAT', x: 900, name: 'The Habitat', subtitle: 'Home & grounds', accent: '#fbbf24', kind: 'habitat' },
  { scene: 'WORKSHOP', x: 1270, name: 'Meteor Workshop', subtitle: 'Craft tools', accent: '#fb7185', kind: 'workshop' },
  { scene: 'VAULT', x: 1620, name: 'Cargo Vault', subtitle: 'Store supplies', accent: '#38bdf8', kind: 'vault' },
  { scene: 'MARKET', x: 1970, name: 'Stardust Market', subtitle: 'Browse decor', accent: '#f472b6', kind: 'market' }
];

const DEFAULT_HOME_PLANET: HomePlanetData = {
  id: 'home_sanctuary_alpha',
  name: 'Sanctuary Prime',
  biomeId: 'VERDANT',
  biome: 'VERDANT',
  habitatTier: 1,
  storageTier: 1,
  greenhouseTier: 1,
  workshopTier: 1,
  supplies: { timber: 20, quartz: 15, alloys: 10, plasmaCells: 5, starDust: 0 },
  gardenPlots: [
    {
      id: 'plot_1',
      seedType: 'STAR_DAISY',
      seedName: 'Starlight Daisy',
      icon: '🌼',
      plantedAtTimestamp: Date.now() - 30000,
      isHarvestable: false,
      growthProgress: 0.75
    },
    { id: 'plot_2', seedType: null, plantedAtTimestamp: 0, isHarvestable: false, growthProgress: 0 }
  ],
  craftedTools: [],
  placedFurniture: [
    {
      id: 'furn_1',
      itemId: 'FURN_FIREPIT',
      name: 'Stardust Firepit',
      category: 'DECOR',
      angle: 0.4,
      placedAngle: 0.4,
      icon: '🔥',
      color: '#f97316'
    },
    {
      id: 'furn_2',
      itemId: 'FURN_LANTERNS',
      name: 'Bioluminescent Glow Lanterns',
      category: 'LIGHTING',
      angle: 2.2,
      placedAngle: 2.2,
      icon: '🏮',
      color: '#facc15'
    }
  ],
  unlockedDecorIds: ['FURN_FIREPIT', 'FURN_LANTERNS'],
  spaceTraveler: generateSpaceTravelerVisit(),
  lastSavedAt: Date.now()
};

const RESOURCE_LABELS: Array<{ key: 'timber' | 'quartz' | 'alloys' | 'plasmaCells'; label: string; src: string; color: string }> = [
  { key: 'timber', label: 'Timber', src: RESOURCE_SPRITES.timber, color: '#fbbf24' },
  { key: 'quartz', label: 'Quartz', src: RESOURCE_SPRITES.quartz, color: '#c084fc' },
  { key: 'alloys', label: 'Alloys', src: RESOURCE_SPRITES.alloys, color: '#22d3ee' },
  { key: 'plasmaCells', label: 'Plasma', src: RESOURCE_SPRITES.plasma, color: '#fb7185' }
];

function sceneName(scene: SanctuaryScene): string {
  return TOWN_BUILDINGS.find((building) => building.scene === scene)?.name || 'Sanctuary Town';
}

function formatCost(cost: ResourceCost): Array<{ key: string; label: string; value: number; icon: string }> {
  const rows = [
    { key: 'timber', label: 'Timber', value: cost.timber || 0, icon: '🪵' },
    { key: 'quartz', label: 'Quartz', value: cost.quartz || 0, icon: '💎' },
    { key: 'alloys', label: 'Alloys', value: cost.alloys || 0, icon: '⚙️' },
    { key: 'plasmaCells', label: 'Plasma', value: cost.plasmaCells || 0, icon: '🔥' },
    { key: 'starDust', label: 'Dust', value: cost.starDust || 0, icon: '✨' },
    { key: 'stars', label: 'Stars', value: cost.stars || 0, icon: '⭐' },
    { key: 'diamonds', label: 'Diamonds', value: cost.diamonds || 0, icon: '💠' }
  ];
  return rows.filter((row) => row.value > 0);
}

const CostLine: React.FC<{ cost: ResourceCost; canAfford?: boolean }> = ({ cost, canAfford = true }) => {
  const entries = formatCost(cost);
  if (!entries.length) return <span className="sanctuary-free">Ready</span>;
  return (
    <div className="sanctuary-cost-line">
      {entries.map((entry) => (
        <span key={entry.key} className={canAfford ? '' : 'is-short'} title={entry.label}>
          {entry.icon} {entry.value}
        </span>
      ))}
    </div>
  );
};

interface SceneObjectProps {
  id?: string;
  label: string;
  hint?: string;
  src?: string;
  fallback?: string;
  accent?: string;
  selected?: boolean;
  locked?: boolean;
  scale?: 'small' | 'medium' | 'large';
  onClick: () => void;
}

const SceneObject: React.FC<SceneObjectProps> = ({
  label,
  hint,
  src,
  fallback,
  accent = '#38bdf8',
  selected,
  locked,
  scale = 'medium',
  onClick
}) => (
  <button
    type="button"
    className={`sanctuary-scene-object size-${scale}${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}`}
    style={{ '--object-accent': accent } as React.CSSProperties}
    onClick={onClick}
    aria-label={`${label}${hint ? `, ${hint}` : ''}`}
  >
    <span className="sanctuary-object-glow" />
    <span className="sanctuary-object-art">
      {src ? <ItemSprite src={src} fallback={fallback} alt="" /> : <span className="sanctuary-object-emoji">{fallback}</span>}
    </span>
    {locked && <Lock className="sanctuary-object-lock" />}
    <span className="sanctuary-object-label">{label}</span>
    {hint && <span className="sanctuary-object-hint">{hint}</span>}
  </button>
);

interface InteractionDockProps {
  eyebrow?: string;
  title: string;
  text: string;
  portrait?: React.ReactNode;
  onDismiss: () => void;
  children?: React.ReactNode;
}

const InteractionDock: React.FC<InteractionDockProps> = ({ eyebrow = 'INTERACT', title, text, portrait, onDismiss, children }) => (
  <section className="sanctuary-dialogue" aria-live="polite">
    <button className="sanctuary-dialogue-close" onClick={onDismiss} aria-label="Close interaction">
      <X />
    </button>
    {portrait && <div className="sanctuary-dialogue-portrait">{portrait}</div>}
    <div className="sanctuary-dialogue-copy">
      <span className="sanctuary-dialogue-eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
    {children && <div className="sanctuary-dialogue-actions">{children}</div>}
  </section>
);

const BuildingArt: React.FC<{ building: TownBuilding; habitatTier: number; travelerIcon?: string }> = ({ building, habitatTier, travelerIcon }) => {
  if (building.kind === 'habitat') {
    return <ItemSprite src={HABITAT_SPRITES[habitatTier]} fallback="🏡" className="sanctuary-building-sprite habitat" alt="" />;
  }
  if (building.kind === 'vault') {
    return <ItemSprite src={STORAGE_SPRITE} fallback="🏭" className="sanctuary-building-sprite" alt="" />;
  }
  if (building.kind === 'greenhouse') {
    return (
      <div className="sanctuary-greenhouse-art">
        <span className="greenhouse-dome" />
        <ItemSprite src={PLANT_SPRITES.COSMIC_LOTUS} fallback="🪷" alt="" />
        <ItemSprite src={PLANT_SPRITES.STAR_DAISY} fallback="🌼" alt="" />
        <ItemSprite src={PLANT_SPRITES.MOON_ORCHID} fallback="🌸" alt="" />
      </div>
    );
  }
  if (building.kind === 'traveler') {
    return (
      <div className="sanctuary-landing-art">
        <span className="landing-beam" />
        <span>{travelerIcon || '🛸'}</span>
      </div>
    );
  }
  if (building.kind === 'workshop') {
    return (
      <div className="sanctuary-building-facade workshop-facade">
        <ItemSprite src={TOOL_SPRITES.GRAVITON_HAMMER} fallback="🔨" alt="" />
        <span className="facade-door" />
        <span className="facade-window" />
      </div>
    );
  }
  return (
    <div className="sanctuary-building-facade market-facade">
      <ItemSprite src={FURNITURE_SPRITES.FURN_STAR_GLOBE} fallback="🔮" alt="" />
      <span className="market-awning" />
      <span className="facade-door" />
    </div>
  );
};

export const HomePlanetModal: React.FC<HomePlanetModalProps> = ({ savedData, onClose, onUpdateSavedData }) => {
  const initialPlanet = savedData.homePlanet || DEFAULT_HOME_PLANET;
  const [homePlanet, setHomePlanet] = useState<HomePlanetData>(() => {
    if (!initialPlanet.spaceTraveler || Date.now() > initialPlanet.spaceTraveler.departureTimestamp) {
      return { ...initialPlanet, spaceTraveler: generateSpaceTravelerVisit() };
    }
    return initialPlanet;
  });
  const [scene, setScene] = useState<SanctuaryScene>('TOWN');
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [selectedSeed, setSelectedSeed] = useState<HomeSeedType>('STAR_DAISY');
  const [avatarX, setAvatarX] = useState(850);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [walkFrame, setWalkFrame] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [clock, setClock] = useState(Date.now());
  const [renameValue, setRenameValue] = useState(homePlanet.name);
  const [isRenaming, setIsRenaming] = useState(false);

  const townViewportRef = useRef<HTMLDivElement | null>(null);
  const pressedKeysRef = useRef(new Set<string>());
  const touchDirectionRef = useRef<-1 | 0 | 1>(0);
  const lastWalkFrameRef = useRef(0);
  const noticeTimerRef = useRef<number | null>(null);

  const starDustBalance = savedData.totalStarDust || savedData.starDustCurrency || 0;
  const biome = HOME_PLANET_BIOMES.find((item) => item.id === (homePlanet.biomeId || homePlanet.biome)) || HOME_PLANET_BIOMES[0];
  const currentHabitat = HABITAT_UPGRADES.find((item) => item.tier === homePlanet.habitatTier) || HABITAT_UPGRADES[0];
  const currentStorage = STORAGE_UPGRADES.find((item) => item.tier === homePlanet.storageTier) || STORAGE_UPGRADES[0];
  const currentGreenhouse = GREENHOUSE_UPGRADES.find((item) => item.tier === homePlanet.greenhouseTier) || GREENHOUSE_UPGRADES[0];

  const flash = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 3200);
  }, []);

  useEffect(() => () => {
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const persist = useCallback((planet: HomePlanetData, patch: Partial<UserSavedData> = {}) => {
    const stamped = { ...planet, lastSavedAt: Date.now() };
    const updated = StorageManager.saveData({ ...patch, homePlanet: stamped });
    setHomePlanet(stamped);
    onUpdateSavedData(updated);
    return updated;
  }, [onUpdateSavedData]);

  const canAfford = useCallback((cost: ResourceCost) => (
    homePlanet.supplies.timber >= (cost.timber || 0) &&
    homePlanet.supplies.quartz >= (cost.quartz || 0) &&
    homePlanet.supplies.alloys >= (cost.alloys || 0) &&
    homePlanet.supplies.plasmaCells >= (cost.plasmaCells || 0) &&
    starDustBalance >= (cost.starDust || 0) &&
    (savedData.totalStars || 0) >= (cost.stars || 0) &&
    (savedData.spaceDiamonds ?? savedData.totalDiamonds ?? 0) >= (cost.diamonds || 0)
  ), [homePlanet.supplies, savedData.spaceDiamonds, savedData.totalDiamonds, savedData.totalStars, starDustBalance]);

  const deductSupplies = useCallback((cost: ResourceCost) => ({
    ...homePlanet.supplies,
    timber: homePlanet.supplies.timber - (cost.timber || 0),
    quartz: homePlanet.supplies.quartz - (cost.quartz || 0),
    alloys: homePlanet.supplies.alloys - (cost.alloys || 0),
    plasmaCells: homePlanet.supplies.plasmaCells - (cost.plasmaCells || 0)
  }), [homePlanet.supplies]);

  const spendPatch = useCallback((cost: ResourceCost): Partial<UserSavedData> => ({
    totalStarDust: Math.max(0, starDustBalance - (cost.starDust || 0)),
    starDustCurrency: Math.max(0, starDustBalance - (cost.starDust || 0)),
    totalStars: Math.max(0, (savedData.totalStars || 0) - (cost.stars || 0)),
    spaceDiamonds: Math.max(0, (savedData.spaceDiamonds ?? savedData.totalDiamonds ?? 0) - (cost.diamonds || 0))
  }), [savedData.spaceDiamonds, savedData.totalDiamonds, savedData.totalStars, starDustBalance]);

  const enterScene = useCallback((nextScene: SanctuaryScene) => {
    audioEngine.playMenuClick();
    setScene(nextScene);
    setSelectedObject(null);
  }, []);

  const returnToTown = useCallback(() => {
    audioEngine.playMenuClick();
    setSelectedObject(null);
    setScene('TOWN');
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedObject) setSelectedObject(null);
        else if (scene !== 'TOWN') returnToTown();
        else onClose();
        return;
      }
      if (scene !== 'TOWN') return;
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(event.key)) {
        event.preventDefault();
        pressedKeysRef.current.add(event.key.toLowerCase());
      }
      if (event.key === 'Enter') {
        const closest = TOWN_BUILDINGS.reduce((best, building) => (
          Math.abs(building.x - avatarX) < Math.abs(best.x - avatarX) ? building : best
        ), TOWN_BUILDINGS[0]);
        if (Math.abs(closest.x - avatarX) < 175) enterScene(closest.scene);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => pressedKeysRef.current.delete(event.key.toLowerCase());
    const stopTouchWalking = () => { touchDirectionRef.current = 0; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerup', stopTouchWalking);
    window.addEventListener('pointercancel', stopTouchWalking);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerup', stopTouchWalking);
      window.removeEventListener('pointercancel', stopTouchWalking);
    };
  }, [avatarX, enterScene, onClose, returnToTown, scene, selectedObject]);

  useEffect(() => {
    if (scene !== 'TOWN') return;
    let frame = 0;
    let previous = performance.now();
    const animate = (now: number) => {
      const delta = Math.min(32, now - previous);
      previous = now;
      const keys = pressedKeysRef.current;
      const keyboardDirection = keys.has('arrowleft') || keys.has('a') ? -1 : keys.has('arrowright') || keys.has('d') ? 1 : 0;
      const direction = touchDirectionRef.current || keyboardDirection;
      setIsWalking(direction !== 0);
      if (direction !== 0) {
        setFacing(direction as 1 | -1);
        setAvatarX((x) => Math.max(60, Math.min(TOWN_WIDTH - 60, x + direction * delta * 0.28)));
        if (now - lastWalkFrameRef.current > 105) {
          setWalkFrame((current) => (current + 1) % 8);
          lastWalkFrameRef.current = now;
        }
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [scene]);

  useEffect(() => {
    if (scene !== 'TOWN' || !townViewportRef.current) return;
    const viewport = townViewportRef.current;
    viewport.scrollTo({ left: avatarX - viewport.clientWidth / 2, behavior: isWalking ? 'auto' : 'smooth' });
  }, [avatarX, isWalking, scene]);

  const walkToBuilding = (building: TownBuilding) => {
    setAvatarX(building.x);
    enterScene(building.scene);
  };

  const handleGroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setAvatarX(Math.max(60, Math.min(TOWN_WIDTH - 60, event.clientX - rect.left)));
  };

  const handleUpgradeHabitat = () => {
    const next = HABITAT_UPGRADES.find((item) => item.tier === homePlanet.habitatTier + 1);
    if (!next) return flash('Your habitat has reached its final form.');
    const multiplier = homeUpgradeCostMultiplier(homePlanet.craftedTools as Array<{ id: string; level?: number }>);
    const cost = {
      timber: Math.ceil(next.cost.timber * multiplier),
      quartz: Math.ceil(next.cost.quartz * multiplier),
      alloys: Math.ceil(next.cost.alloys * multiplier),
      plasmaCells: Math.ceil(next.cost.plasmaCells * multiplier),
      starDust: Math.ceil(next.cost.starDust * multiplier)
    };
    if (!canAfford(cost)) {
      audioEngine.playPowerUpExpired();
      return flash('The construction console is missing materials. Visit the vault after your next voyage.');
    }
    audioEngine.playPowerUpCollect();
    persist({ ...homePlanet, habitatTier: next.tier, supplies: deductSupplies(cost) }, spendPatch(cost));
    flash(`${next.name} constructed! The town skyline has changed.`);
  };

  const handleUpgradeGreenhouse = () => {
    const next = GREENHOUSE_UPGRADES.find((item) => item.tier === homePlanet.greenhouseTier + 1);
    if (!next) return flash('The greenhouse is already at maximum capacity.');
    if (!canAfford(next.cost)) {
      audioEngine.playPowerUpExpired();
      return flash('The expansion rig needs more construction supplies.');
    }
    const plots = [...homePlanet.gardenPlots];
    while (plots.length < next.plots) {
      plots.push({ id: `plot_${plots.length + 1}`, seedType: null, plantedAtTimestamp: 0, growthProgress: 0, isHarvestable: false });
    }
    audioEngine.playPowerUpCollect();
    persist({ ...homePlanet, greenhouseTier: next.tier, gardenPlots: plots, supplies: deductSupplies(next.cost) }, spendPatch(next.cost));
    flash(`${next.name} online — ${next.plots} living planters are ready.`);
  };

  const handleUpgradeStorage = () => {
    const next = STORAGE_UPGRADES.find((item) => item.tier === homePlanet.storageTier + 1);
    if (!next) return flash('The vault is already infinite.');
    if (!canAfford(next.cost)) {
      audioEngine.playPowerUpExpired();
      return flash('The vault fabricator needs more materials.');
    }
    audioEngine.playPowerUpCollect();
    persist({ ...homePlanet, storageTier: next.tier, supplies: deductSupplies(next.cost) }, spendPatch(next.cost));
    flash(`${next.name} installed. Capacity is now ${next.capacity.toLocaleString()}.`);
  };

  const handleDeposit = () => {
    const capacity = currentStorage.capacity;
    const pickaxe = hasCraftedTool(homePlanet.craftedTools as Array<{ id: string }>, 'GRAVITON_PICKAXE');
    const harvestBonus = 1 + (calculateSkillBonuses(savedData.skillTreeAllocations || ({} as never)).harvestYieldBonus || 0);
    const supplies = {
      ...homePlanet.supplies,
      timber: Math.min(capacity, homePlanet.supplies.timber + Math.round(15 * harvestBonus)),
      quartz: Math.min(capacity, homePlanet.supplies.quartz + Math.round(10 * (pickaxe ? 2 : 1) * harvestBonus)),
      alloys: Math.min(capacity, homePlanet.supplies.alloys + Math.round(8 * harvestBonus)),
      plasmaCells: Math.min(capacity, homePlanet.supplies.plasmaCells + Math.round(4 * harvestBonus))
    };
    audioEngine.playPowerUpCollect();
    persist({ ...homePlanet, supplies });
    flash('The cargo drone unloaded your voyage supplies into the room.');
  };

  const getPlotProgress = useCallback((plot: HomeGardenPlot) => {
    if (!plot.seedType) return 0;
    const seed = GARDEN_SEEDS.find((item) => item.type === plot.seedType);
    if (!seed) return plot.growthProgress || 0;
    const plantedAt = plot.plantedAtTimestamp ?? plot.plantedAt ?? clock;
    const growthMultiplier = gardenGrowthMultiplier(homePlanet.craftedTools as Array<{ id: string; level?: number }>);
    return Math.min(1, (clock - plantedAt) / 1000 / (seed.growthDurationSeconds * growthMultiplier));
  }, [clock, homePlanet.craftedTools]);

  const handlePlant = (plotId: string) => {
    const seed = GARDEN_SEEDS.find((item) => item.type === selectedSeed);
    const plot = homePlanet.gardenPlots.find((item) => item.id === plotId);
    if (!seed || !plot || plot.seedType) return;
    if (starDustBalance < seed.costStarDust) {
      audioEngine.playPowerUpExpired();
      return flash(`You need ${seed.costStarDust} Star Dust to plant ${seed.name}.`);
    }
    const plots = homePlanet.gardenPlots.map((item) => item.id === plotId ? {
      ...item,
      seedType: seed.type,
      seedName: seed.name,
      icon: seed.icon,
      plantedAtTimestamp: Date.now(),
      growthProgress: 0,
      isHarvestable: false
    } : item);
    audioEngine.playClick();
    persist({ ...homePlanet, gardenPlots: plots }, {
      totalStarDust: starDustBalance - seed.costStarDust,
      starDustCurrency: starDustBalance - seed.costStarDust
    });
    flash(`${seed.name} planted. You can watch it grow right here.`);
  };

  const handleHarvest = (plotId: string) => {
    const plot = homePlanet.gardenPlots.find((item) => item.id === plotId);
    if (!plot?.seedType || getPlotProgress(plot) < 1) return;
    const seed = GARDEN_SEEDS.find((item) => item.type === plot.seedType);
    if (!seed) return;
    const alchemy = calculateSkillBonuses(savedData.skillTreeAllocations || ({} as never)).gardenAlchemyBonus || 0;
    const multiplier = gardenHarvestMultiplier(homePlanet.craftedTools as Array<{ id: string; level?: number }>, alchemy / 0.15);
    const dust = Math.round(seed.rewardStarDust * multiplier);
    const diamonds = Math.round(seed.rewardDiamonds * multiplier);
    const plots = homePlanet.gardenPlots.map((item) => item.id === plotId ? {
      ...item,
      seedType: null,
      seedName: undefined,
      icon: undefined,
      plantedAtTimestamp: 0,
      growthProgress: 0,
      isHarvestable: false
    } : item);
    audioEngine.playPowerUpCollect();
    persist({ ...homePlanet, gardenPlots: plots }, {
      totalStarDust: starDustBalance + dust,
      starDustCurrency: starDustBalance + dust,
      totalStarDustAllTime: (savedData.totalStarDustAllTime || 0) + dust,
      totalDiamonds: (savedData.totalDiamonds || 0) + diamonds,
      totalDiamondsAllTime: (savedData.totalDiamondsAllTime || 0) + diamonds
    });
    flash(`Harvested ${seed.name}: +${dust} Star Dust and +${diamonds} Diamonds.`);
  };

  const handleCraftTool = (toolId: string) => {
    const tool = CRAFTABLE_HOME_TOOLS.find((item) => item.id === toolId);
    if (!tool) return;
    if (!canAfford(tool.cost)) {
      audioEngine.playPowerUpExpired();
      return flash(`The workbench does not have enough material for ${tool.name}.`);
    }
    const existingIndex = homePlanet.craftedTools.findIndex((item) => item.id === tool.id);
    const tools = [...homePlanet.craftedTools];
    if (existingIndex >= 0) {
      const existing = tools[existingIndex] as { id: string; level?: number };
      tools[existingIndex] = { ...tool, ...existing, level: (existing.level || 1) + 1 };
    } else {
      tools.push({ ...tool, level: 1 });
    }
    audioEngine.playPowerUpCollect();
    persist({ ...homePlanet, craftedTools: tools, supplies: deductSupplies(tool.cost) }, spendPatch(tool.cost));
    flash(`${tool.name} forged at the workbench.`);
  };

  const handleBuyFurniture = (item: HomeFurnitureItem) => {
    const cost = { starDust: item.costStarDust };
    if (!canAfford(cost)) {
      audioEngine.playPowerUpExpired();
      return flash(`The shopkeeper needs ${item.costStarDust} Star Dust for ${item.name}.`);
    }
    const angle = ((homePlanet.placedFurniture.length * 1.15) % (Math.PI * 2));
    const furniture: HomePlacedFurniture = {
      id: `furn_${Date.now()}_${item.id}`,
      itemId: item.id,
      name: item.name,
      category: item.category,
      angle,
      placedAngle: angle,
      icon: item.icon,
      color: item.color
    };
    audioEngine.playPowerUpCollect();
    persist({
      ...homePlanet,
      placedFurniture: [...homePlanet.placedFurniture, furniture],
      unlockedDecorIds: Array.from(new Set([...(homePlanet.unlockedDecorIds || []), item.id]))
    }, spendPatch(cost));
    flash(`${item.name} was carried outside and placed in Sanctuary Town.`);
  };

  const handleStashFurniture = (furnitureId: string) => {
    const furniture = homePlanet.placedFurniture.find((item) => item.id === furnitureId);
    if (!furniture) return;
    audioEngine.playClick();
    persist({ ...homePlanet, placedFurniture: homePlanet.placedFurniture.filter((item) => item.id !== furnitureId) });
    setSelectedObject(null);
    flash(`${furniture.name} returned to your decor collection.`);
  };

  const handleChangeBiome = (biomeId: string) => {
    const nextBiome = HOME_PLANET_BIOMES.find((item) => item.id === biomeId);
    if (!nextBiome) return;
    audioEngine.playClick();
    persist({
      ...homePlanet,
      biomeId: nextBiome.id,
      biome: nextBiome.id as HomePlanetData['biome'],
      primaryColor: nextBiome.color,
      secondaryColor: nextBiome.secondaryColor
    });
    flash(`${nextBiome.name} now colors the whole town.`);
  };

  const handleRename = () => {
    const name = renameValue.trim();
    if (!name) return;
    persist({ ...homePlanet, name });
    setIsRenaming(false);
    flash(`Welcome to ${name}.`);
  };

  const handleTrade = (offer: SpaceTravelerOffer) => {
    if (!homePlanet.spaceTraveler || offer.traded) return;
    if (!canAfford(offer.cost)) {
      audioEngine.playPowerUpExpired();
      return flash(`${homePlanet.spaceTraveler.travelerName} shakes their head: you need more trade goods.`);
    }
    const angle = ((homePlanet.placedFurniture.length * 1.32) % (Math.PI * 2));
    const furniture: HomePlacedFurniture = {
      id: `furn_${Date.now()}_${offer.itemId}`,
      itemId: offer.itemId,
      name: offer.name,
      category: offer.category as HomePlacedFurniture['category'],
      angle,
      placedAngle: angle,
      icon: offer.icon,
      color: offer.color
    };
    const offers = homePlanet.spaceTraveler.offers.map((item) => item.id === offer.id ? { ...item, traded: true } : item);
    audioEngine.playLevelUp();
    persist({
      ...homePlanet,
      supplies: deductSupplies(offer.cost),
      placedFurniture: [...homePlanet.placedFurniture, furniture],
      unlockedDecorIds: Array.from(new Set([...(homePlanet.unlockedDecorIds || []), offer.itemId])),
      spaceTraveler: { ...homePlanet.spaceTraveler, offers }
    }, spendPatch(offer.cost));
    flash(`${homePlanet.spaceTraveler.travelerName}: “A fine trade. It is yours.”`);
  };

  const handleSummonTraveler = () => {
    const traveler = generateSpaceTravelerVisit();
    audioEngine.playPowerUpCollect();
    persist({ ...homePlanet, spaceTraveler: traveler });
    setSelectedObject('traveler:npc');
    flash(`${traveler.travelerName}'s ship just dropped out of hyperspace.`);
  };

  const selectedFurniture = selectedObject?.startsWith('furn:')
    ? homePlanet.placedFurniture.find((item) => item.id === selectedObject.slice(5))
    : null;
  const selectedBiome = selectedObject?.startsWith('biome:')
    ? HOME_PLANET_BIOMES.find((item) => item.id === selectedObject.slice(6))
    : null;
  const selectedPlot = selectedObject?.startsWith('plot:')
    ? homePlanet.gardenPlots.find((item) => item.id === selectedObject.slice(5))
    : null;
  const selectedTool = selectedObject?.startsWith('tool:')
    ? CRAFTABLE_HOME_TOOLS.find((item) => item.id === selectedObject.slice(5))
    : null;
  const selectedMarketItem = selectedObject?.startsWith('market:')
    ? HOME_FURNITURE_CATALOG.find((item) => item.id === selectedObject.slice(7))
    : null;
  const selectedOffer = selectedObject?.startsWith('offer:') && homePlanet.spaceTraveler
    ? homePlanet.spaceTraveler.offers.find((item) => item.id === selectedObject.slice(6))
    : null;

  const nearestBuilding = useMemo(() => TOWN_BUILDINGS.reduce((best, building) => (
    Math.abs(building.x - avatarX) < Math.abs(best.x - avatarX) ? building : best
  ), TOWN_BUILDINGS[0]), [avatarX]);

  const activeCostume = savedData.activeCostumeId || 'ASTRONAUT';
  const avatarSprite = isWalking
    ? COSTUME_WALK_FRAMES[activeCostume]?.[walkFrame] || COSTUME_SPRITES[activeCostume]
    : COSTUME_SPRITES[activeCostume];

  const renderTopBar = () => (
    <header className="sanctuary-topbar">
      <div className="sanctuary-location">
        {scene !== 'TOWN' && (
          <button className="sanctuary-icon-button" onClick={returnToTown} aria-label="Back to town">
            <ArrowLeft />
          </button>
        )}
        <div className="sanctuary-location-mark">
          {scene === 'TOWN' ? <Home /> : scene === 'GREENHOUSE' ? <Sprout /> : scene === 'WORKSHOP' ? <Wrench /> : scene === 'VAULT' ? <Package /> : scene === 'MARKET' ? <ShoppingBag /> : scene === 'TRAVELER' ? <Rocket /> : <Home />}
        </div>
        <div>
          <span>{scene === 'TOWN' ? homePlanet.name : sceneName(scene)}</span>
          <small>{scene === 'TOWN' ? 'SANCTUARY TOWN' : `${homePlanet.name} • INTERIOR`}</small>
        </div>
      </div>
      <div className="sanctuary-wallet">
        <span title="Stars"><Star /> {savedData.totalStars.toLocaleString()}</span>
        <span title="Diamonds">💠 {(savedData.spaceDiamonds ?? savedData.totalDiamonds ?? 0).toLocaleString()}</span>
        <span title="Star Dust"><Sparkles /> {starDustBalance.toLocaleString()}</span>
        <button className="sanctuary-icon-button" onClick={onClose} aria-label="Leave sanctuary">
          <X />
        </button>
      </div>
    </header>
  );

  const renderTown = () => (
    <div className="sanctuary-town-screen">
      <div className="sanctuary-town-viewport" ref={townViewportRef}>
        <div
          className="sanctuary-town-world"
          style={{ width: TOWN_WIDTH, backgroundImage: `linear-gradient(180deg, rgba(4,8,25,.04), rgba(6,12,30,.52)), url(${galaxyBgUrl})` }}
          onClick={handleGroundClick}
        >
          <div className="sanctuary-moon">
            <ItemSprite src={BIOME_SPRITES[biome.id]} fallback={biome.icon} alt="" />
          </div>
          <div className="sanctuary-aurora" />
          <div className="sanctuary-distant-ridge ridge-one" />
          <div className="sanctuary-distant-ridge ridge-two" />
          <div className="sanctuary-town-ground" />
          <div className="sanctuary-path" />

          {TOWN_BUILDINGS.map((building) => (
            <button
              key={building.scene}
              className={`sanctuary-building building-${building.kind}`}
              style={{ left: building.x, '--building-accent': building.accent } as React.CSSProperties}
              onClick={(event) => {
                event.stopPropagation();
                walkToBuilding(building);
              }}
              aria-label={`Enter ${building.name}`}
            >
              <span className="sanctuary-building-name">
                <strong>{building.name}</strong>
                <small>{building.subtitle}</small>
              </span>
              <span className="sanctuary-building-art">
                <BuildingArt building={building} habitatTier={homePlanet.habitatTier} travelerIcon={homePlanet.spaceTraveler?.shipIcon} />
              </span>
              <span className="sanctuary-building-door">ENTER</span>
            </button>
          ))}

          {homePlanet.placedFurniture.slice(0, 12).map((furniture, index) => (
            <button
              key={furniture.id}
              className="sanctuary-town-decor"
              style={{ left: 285 + index * 151, '--decor-color': furniture.color } as React.CSSProperties}
              onClick={(event) => {
                event.stopPropagation();
                setAvatarX(285 + index * 151);
                enterScene('HABITAT');
                setSelectedObject(`furn:${furniture.id}`);
              }}
              title={`${furniture.name} — inspect in the habitat`}
            >
              <ItemSprite src={FURNITURE_SPRITES[furniture.itemId]} fallback={furniture.icon} alt={furniture.name} />
            </button>
          ))}

          <div
            className={`sanctuary-avatar${isWalking ? ' is-walking' : ''}`}
            style={{ left: avatarX, transform: `translateX(-50%) scaleX(${facing})` }}
          >
            <span className="sanctuary-avatar-beam" />
            <ItemSprite src={avatarSprite} fallback="🧑‍🚀" alt="Your explorer" />
          </div>
        </div>
      </div>

      <div className="sanctuary-town-prompt">
        <span><strong>{nearestBuilding.name}</strong> · {nearestBuilding.subtitle}</span>
        <button onClick={() => walkToBuilding(nearestBuilding)}>Enter building</button>
      </div>

      <div className="sanctuary-walk-controls">
        <button
          onPointerDown={() => { touchDirectionRef.current = -1; }}
          aria-label="Walk left"
        ><ChevronLeft /></button>
        <span><span className="desktop-walk-hint">A / D or arrows to walk · Enter to visit</span><span className="mobile-walk-hint">Hold to walk</span></span>
        <button
          onPointerDown={() => { touchDirectionRef.current = 1; }}
          aria-label="Walk right"
        ><ChevronRight /></button>
      </div>
    </div>
  );

  const renderHabitat = () => {
    const nextHabitat = HABITAT_UPGRADES.find((item) => item.tier === homePlanet.habitatTier + 1);
    const multiplier = homeUpgradeCostMultiplier(homePlanet.craftedTools as Array<{ id: string; level?: number }>);
    const nextCost = nextHabitat ? {
      timber: Math.ceil(nextHabitat.cost.timber * multiplier),
      quartz: Math.ceil(nextHabitat.cost.quartz * multiplier),
      alloys: Math.ceil(nextHabitat.cost.alloys * multiplier),
      plasmaCells: Math.ceil(nextHabitat.cost.plasmaCells * multiplier),
      starDust: Math.ceil(nextHabitat.cost.starDust * multiplier)
    } : null;
    return (
      <div className="sanctuary-room habitat-room">
        <div className="sanctuary-room-stars" />
        <div className="sanctuary-room-title"><span>Living quarters</span><small>Everything you own lives in the room</small></div>
        <div className="sanctuary-room-scroll">
          <div className="sanctuary-room-world habitat-world">
            <div className="sanctuary-window"><ItemSprite src={BIOME_SPRITES[biome.id]} fallback={biome.icon} alt="" /></div>
            <div className="sanctuary-wall-stripe" />
            <div className="sanctuary-room-floor" />

            <div className="sanctuary-zone construction-zone">
              <span className="sanctuary-zone-label">CONSTRUCTION HOLOGRAM</span>
              <SceneObject
                label={`Tier ${currentHabitat.tier} Habitat`}
                hint={nextHabitat ? 'Inspect next upgrade' : 'Maximum tier'}
                src={HABITAT_SPRITES[currentHabitat.tier]}
                fallback={currentHabitat.icon}
                accent="#fbbf24"
                scale="large"
                selected={selectedObject === 'habitat:upgrade'}
                onClick={() => setSelectedObject('habitat:upgrade')}
              />
            </div>

            <div className="sanctuary-zone biome-zone">
              <span className="sanctuary-zone-label">BIOME PROJECTORS</span>
              <div className="sanctuary-object-shelf biome-shelf">
                {HOME_PLANET_BIOMES.map((item) => (
                  <SceneObject
                    key={item.id}
                    label={item.name.replace(/ .*/, '')}
                    src={BIOME_SPRITES[item.id]}
                    fallback={item.icon}
                    accent={item.color}
                    scale="small"
                    selected={selectedObject === `biome:${item.id}`}
                    onClick={() => setSelectedObject(`biome:${item.id}`)}
                  />
                ))}
              </div>
            </div>

            <button className="sanctuary-name-plaque" onClick={() => { setRenameValue(homePlanet.name); setIsRenaming(true); setSelectedObject('habitat:name'); }}>
              <Edit3 /> <span>{homePlanet.name}</span><small>Rename sanctuary</small>
            </button>

            <div className="sanctuary-zone living-zone">
              <span className="sanctuary-zone-label">YOUR FURNISHINGS</span>
              <div className="sanctuary-object-shelf furniture-shelf">
                {homePlanet.placedFurniture.length ? homePlanet.placedFurniture.map((furniture) => (
                  <SceneObject
                    key={furniture.id}
                    label={furniture.name}
                    src={FURNITURE_SPRITES[furniture.itemId]}
                    fallback={furniture.icon}
                    accent={furniture.color}
                    scale="small"
                    selected={selectedObject === `furn:${furniture.id}`}
                    onClick={() => setSelectedObject(`furn:${furniture.id}`)}
                  />
                )) : (
                  <button className="sanctuary-empty-room" onClick={() => enterScene('MARKET')}>
                    <ShoppingBag /> This corner is empty. Visit the Stardust Market.
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedObject === 'habitat:upgrade' && (
          <InteractionDock
            eyebrow="CONSTRUCTION AI"
            title={nextHabitat ? nextHabitat.name : currentHabitat.name}
            text={nextHabitat ? nextHabitat.description : 'The sanctuary has reached the highest known habitat tier.'}
            portrait={<ItemSprite src={HABITAT_SPRITES[nextHabitat?.tier || currentHabitat.tier]} fallback={nextHabitat?.icon || currentHabitat.icon} alt="" />}
            onDismiss={() => setSelectedObject(null)}
          >
            {nextHabitat && nextCost ? (
              <>
                <CostLine cost={nextCost} canAfford={canAfford(nextCost)} />
                <button className="sanctuary-action primary" onClick={handleUpgradeHabitat}><ArrowUpCircle /> Build tier {nextHabitat.tier}</button>
              </>
            ) : <span className="sanctuary-complete"><Check /> Complete</span>}
          </InteractionDock>
        )}

        {selectedBiome && (
          <InteractionDock
            eyebrow="BIOME PROJECTOR"
            title={selectedBiome.name}
            text={selectedBiome.description}
            portrait={<ItemSprite src={BIOME_SPRITES[selectedBiome.id]} fallback={selectedBiome.icon} alt="" />}
            onDismiss={() => setSelectedObject(null)}
          >
            <button className="sanctuary-action primary" onClick={() => handleChangeBiome(selectedBiome.id)}>
              <Sparkles /> {selectedBiome.id === biome.id ? 'Theme active' : 'Project across town'}
            </button>
          </InteractionDock>
        )}

        {selectedFurniture && (
          <InteractionDock
            eyebrow="YOUR FURNISHING"
            title={selectedFurniture.name}
            text="This object appears in your home and outside in Sanctuary Town. Stash it to clear it from the scene without losing the unlock."
            portrait={<ItemSprite src={FURNITURE_SPRITES[selectedFurniture.itemId]} fallback={selectedFurniture.icon} alt="" />}
            onDismiss={() => setSelectedObject(null)}
          >
            <button className="sanctuary-action" onClick={() => handleStashFurniture(selectedFurniture.id)}><Package /> Stash object</button>
            <button className="sanctuary-action primary" onClick={() => enterScene('MARKET')}><ShoppingBag /> Visit market</button>
          </InteractionDock>
        )}

        {selectedObject === 'habitat:name' && (
          <InteractionDock
            eyebrow="ENTRY PLAQUE"
            title="Name your sanctuary"
            text="The new name will be engraved above town and synced with your home planet save."
            portrait={<Edit3 />}
            onDismiss={() => { setSelectedObject(null); setIsRenaming(false); }}
          >
            <input className="sanctuary-name-input" value={renameValue} maxLength={28} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleRename()} autoFocus={isRenaming} />
            <button className="sanctuary-action primary" onClick={handleRename}><Check /> Engrave</button>
          </InteractionDock>
        )}
      </div>
    );
  };

  const renderGreenhouse = () => {
    const selectedSeedDefinition = GARDEN_SEEDS.find((item) => item.type === selectedSeed) || GARDEN_SEEDS[0];
    const nextGreenhouse = GREENHOUSE_UPGRADES.find((item) => item.tier === homePlanet.greenhouseTier + 1);
    const plotProgress = selectedPlot ? getPlotProgress(selectedPlot) : 0;
    const plotSeed = selectedPlot?.seedType ? GARDEN_SEEDS.find((item) => item.type === selectedPlot.seedType) : null;
    return (
      <div className="sanctuary-room greenhouse-room">
        <div className="sanctuary-room-title"><span>{currentGreenhouse.name}</span><small>Select a seed pod, then touch an empty planter</small></div>
        <div className="sanctuary-room-scroll">
          <div className="sanctuary-room-world greenhouse-world">
            <div className="greenhouse-glass" />
            <div className="greenhouse-stars" />
            <div className="sanctuary-room-floor greenhouse-floor" />

            <div className="sanctuary-zone seed-bank-zone">
              <span className="sanctuary-zone-label">SEED BANK · SELECT A POD</span>
              <div className="sanctuary-object-shelf seed-shelf">
                {GARDEN_SEEDS.map((seed) => (
                  <SceneObject
                    key={seed.type}
                    label={seed.name}
                    hint={`${seed.costStarDust} dust`}
                    src={PLANT_SPRITES[seed.type]}
                    fallback={seed.icon}
                    accent={selectedSeed === seed.type ? '#fbbf24' : '#34d399'}
                    scale="small"
                    selected={selectedObject === `seed:${seed.type}` || selectedSeed === seed.type}
                    onClick={() => { setSelectedSeed(seed.type); setSelectedObject(`seed:${seed.type}`); }}
                  />
                ))}
              </div>
            </div>

            <div className="sanctuary-zone planter-zone">
              <span className="sanctuary-zone-label">LIVING PLANTERS</span>
              <div className="sanctuary-planters">
                {homePlanet.gardenPlots.map((plot, index) => {
                  const progress = getPlotProgress(plot);
                  const seed = plot.seedType ? GARDEN_SEEDS.find((item) => item.type === plot.seedType) : null;
                  return (
                    <button
                      key={plot.id}
                      className={`sanctuary-planter${progress >= 1 ? ' is-ready' : ''}${selectedObject === `plot:${plot.id}` ? ' is-selected' : ''}`}
                      onClick={() => setSelectedObject(`plot:${plot.id}`)}
                    >
                      <span className="planter-number">{index + 1}</span>
                      {seed ? <span className="planter-plant" style={{ transform: `scale(${0.55 + progress * 0.45})` }}><ItemSprite src={PLANT_SPRITES[seed.type]} fallback={seed.icon} alt="" /></span> : <span className="empty-soil">+</span>}
                      <span className="planter-soil" />
                      <span className="planter-label">{seed ? (progress >= 1 ? 'Harvest!' : `${Math.round(progress * 100)}% grown`) : 'Empty planter'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <SceneObject
              label={`Greenhouse T${homePlanet.greenhouseTier}`}
              hint={nextGreenhouse ? `Expand to ${nextGreenhouse.plots} plots` : 'Maximum size'}
              fallback="🧪"
              accent="#22d3ee"
              selected={selectedObject === 'greenhouse:upgrade'}
              onClick={() => setSelectedObject('greenhouse:upgrade')}
            />
          </div>
        </div>

        {selectedObject?.startsWith('seed:') && (
          <InteractionDock
            eyebrow="SEED BANK"
            title={selectedSeedDefinition.name}
            text={`${selectedSeedDefinition.description} It matures in ${selectedSeedDefinition.growthDurationSeconds} seconds and yields ${selectedSeedDefinition.rewardStarDust} dust.`}
            portrait={<ItemSprite src={PLANT_SPRITES[selectedSeedDefinition.type]} fallback={selectedSeedDefinition.icon} alt="" />}
            onDismiss={() => setSelectedObject(null)}
          >
            <CostLine cost={{ starDust: selectedSeedDefinition.costStarDust }} canAfford={starDustBalance >= selectedSeedDefinition.costStarDust} />
            <span className="sanctuary-selected-note"><Check /> Loaded — choose an empty planter</span>
          </InteractionDock>
        )}

        {selectedPlot && (
          <InteractionDock
            eyebrow={`PLANTER ${homePlanet.gardenPlots.indexOf(selectedPlot) + 1}`}
            title={plotSeed ? plotSeed.name : 'Empty living soil'}
            text={plotSeed ? (plotProgress >= 1 ? 'The bloom is radiating energy and ready to harvest.' : `Growth cycle is ${Math.round(plotProgress * 100)}% complete. It stays here and grows in real time.`) : `${selectedSeedDefinition.name} is loaded in the seed bank.`}
            portrait={plotSeed ? <ItemSprite src={PLANT_SPRITES[plotSeed.type]} fallback={plotSeed.icon} alt="" /> : <Sprout />}
            onDismiss={() => setSelectedObject(null)}
          >
            {plotSeed ? (
              plotProgress >= 1
                ? <button className="sanctuary-action primary" onClick={() => handleHarvest(selectedPlot.id)}><Sparkles /> Harvest bloom</button>
                : <div className="sanctuary-progress"><span style={{ width: `${Math.round(plotProgress * 100)}%` }} /></div>
            ) : (
              <>
                <CostLine cost={{ starDust: selectedSeedDefinition.costStarDust }} canAfford={starDustBalance >= selectedSeedDefinition.costStarDust} />
                <button className="sanctuary-action primary" onClick={() => handlePlant(selectedPlot.id)}><Sprout /> Plant {selectedSeedDefinition.name}</button>
              </>
            )}
          </InteractionDock>
        )}

        {selectedObject === 'greenhouse:upgrade' && (
          <InteractionDock
            eyebrow="EXPANSION REACTOR"
            title={nextGreenhouse ? nextGreenhouse.name : currentGreenhouse.name}
            text={nextGreenhouse ? `Power this reactor to grow the room from ${currentGreenhouse.plots} to ${nextGreenhouse.plots} physical planters.` : 'Every planter slot is already unlocked.'}
            portrait={<span>🧪</span>}
            onDismiss={() => setSelectedObject(null)}
          >
            {nextGreenhouse ? <><CostLine cost={nextGreenhouse.cost} canAfford={canAfford(nextGreenhouse.cost)} /><button className="sanctuary-action primary" onClick={handleUpgradeGreenhouse}><ArrowUpCircle /> Expand room</button></> : <span className="sanctuary-complete"><Check /> Complete</span>}
          </InteractionDock>
        )}
      </div>
    );
  };

  const renderVault = () => {
    const selectedResource = selectedObject?.startsWith('resource:')
      ? RESOURCE_LABELS.find((item) => item.key === selectedObject.slice(9))
      : null;
    const nextStorage = STORAGE_UPGRADES.find((item) => item.tier === homePlanet.storageTier + 1);
    return (
      <div className="sanctuary-room vault-room">
        <div className="sanctuary-room-title"><span>{currentStorage.name}</span><small>Capacity {currentStorage.capacity.toLocaleString()} per material</small></div>
        <div className="sanctuary-room-scroll">
          <div className="sanctuary-room-world vault-world">
            <div className="vault-pipes" />
            <div className="sanctuary-room-floor vault-floor" />
            <div className="sanctuary-zone cargo-zone">
              <span className="sanctuary-zone-label">PHYSICAL INVENTORY BAYS</span>
              <div className="sanctuary-cargo-bays">
                {RESOURCE_LABELS.map((resource) => (
                  <button
                    key={resource.key}
                    className={`sanctuary-cargo-crate${selectedObject === `resource:${resource.key}` ? ' is-selected' : ''}`}
                    style={{ '--crate-color': resource.color } as React.CSSProperties}
                    onClick={() => setSelectedObject(`resource:${resource.key}`)}
                  >
                    <ItemSprite src={resource.src} fallback="📦" alt="" />
                    <strong>{homePlanet.supplies[resource.key]}</strong>
                    <span>{resource.label}</span>
                    <small>{Math.round((homePlanet.supplies[resource.key] / currentStorage.capacity) * 100)}% bay</small>
                  </button>
                ))}
              </div>
            </div>
            <SceneObject
              label="Cargo drone"
              hint="Unload voyage supplies"
              fallback="🛸"
              accent="#38bdf8"
              scale="large"
              selected={selectedObject === 'vault:deposit'}
              onClick={() => setSelectedObject('vault:deposit')}
            />
            <SceneObject
              label={`Vault core T${homePlanet.storageTier}`}
              hint={nextStorage ? 'Increase capacity' : 'Infinite capacity'}
              src={STORAGE_SPRITE}
              fallback="🏭"
              accent="#c084fc"
              scale="large"
              selected={selectedObject === 'vault:upgrade'}
              onClick={() => setSelectedObject('vault:upgrade')}
            />
          </div>
        </div>

        {selectedResource && (
          <InteractionDock
            eyebrow="CARGO BAY"
            title={`${homePlanet.supplies[selectedResource.key]} ${selectedResource.label}`}
            text={`These are real construction materials stored in this bay. The ${currentStorage.name} can hold ${currentStorage.capacity.toLocaleString()} of each resource.`}
            portrait={<ItemSprite src={selectedResource.src} fallback="📦" alt="" />}
            onDismiss={() => setSelectedObject(null)}
          >
            <button className="sanctuary-action primary" onClick={() => setSelectedObject('vault:deposit')}><CloudUpload /> Call cargo drone</button>
          </InteractionDock>
        )}

        {selectedObject === 'vault:deposit' && (
          <InteractionDock
            eyebrow="CARGO DRONE"
            title="Unload the expedition hold?"
            text="The drone will carry gathered timber, quartz, alloys, and plasma into their visible bays. Crafted tools can improve the delivery."
            portrait={<span>🛸</span>}
            onDismiss={() => setSelectedObject(null)}
          >
            <button className="sanctuary-action primary" onClick={handleDeposit}><CloudUpload /> Unload supplies</button>
          </InteractionDock>
        )}

        {selectedObject === 'vault:upgrade' && (
          <InteractionDock
            eyebrow="VAULT CORE"
            title={nextStorage ? nextStorage.name : currentStorage.name}
            text={nextStorage ? `Install a larger matter matrix and raise each material bay to ${nextStorage.capacity.toLocaleString()} capacity.` : 'The core is already bending space into an effectively infinite store room.'}
            portrait={<ItemSprite src={STORAGE_SPRITE} fallback="🏭" alt="" />}
            onDismiss={() => setSelectedObject(null)}
          >
            {nextStorage ? <><CostLine cost={nextStorage.cost} canAfford={canAfford(nextStorage.cost)} /><button className="sanctuary-action primary" onClick={handleUpgradeStorage}><ArrowUpCircle /> Upgrade vault</button></> : <span className="sanctuary-complete"><Check /> Complete</span>}
          </InteractionDock>
        )}
      </div>
    );
  };

  const renderWorkshop = () => (
    <div className="sanctuary-room workshop-room">
      <div className="sanctuary-room-title"><span>Meteor Workshop</span><small>Touch a tool on the bench to forge or improve it</small></div>
      <div className="sanctuary-room-scroll">
        <div className="sanctuary-room-world workshop-world">
          <div className="workshop-sparks" />
          <div className="workshop-gantry" />
          <div className="sanctuary-room-floor workshop-floor" />
          <div className="sanctuary-zone tool-zone">
            <span className="sanctuary-zone-label">FORGE BENCH · OWNED TOOLS GLOW GOLD</span>
            <div className="sanctuary-tool-benches">
              {CRAFTABLE_HOME_TOOLS.map((tool) => {
                const owned = homePlanet.craftedTools.find((item) => item.id === tool.id) as { id: string; level?: number } | undefined;
                return (
                  <div className={`sanctuary-workbench${owned ? ' is-owned' : ''}`} key={tool.id}>
                    <span className="workbench-lamp" />
                    <SceneObject
                      label={tool.name}
                      hint={owned ? `Forged · Level ${owned.level || 1}` : 'Blueprint ready'}
                      src={TOOL_SPRITES[tool.id]}
                      fallback={tool.icon}
                      accent={owned ? '#fbbf24' : '#fb7185'}
                      selected={selectedObject === `tool:${tool.id}`}
                      onClick={() => setSelectedObject(`tool:${tool.id}`)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedTool && (() => {
        const owned = homePlanet.craftedTools.find((item) => item.id === selectedTool.id) as { id: string; level?: number } | undefined;
        return (
          <InteractionDock
            eyebrow={owned ? `OWNED · LEVEL ${owned.level || 1}` : 'TOOL BLUEPRINT'}
            title={selectedTool.name}
            text={`${selectedTool.description} ${selectedTool.perkDescription}. The object will remain on this bench after forging.`}
            portrait={<ItemSprite src={TOOL_SPRITES[selectedTool.id]} fallback={selectedTool.icon} alt="" />}
            onDismiss={() => setSelectedObject(null)}
          >
            <CostLine cost={selectedTool.cost} canAfford={canAfford(selectedTool.cost)} />
            <button className="sanctuary-action primary" onClick={() => handleCraftTool(selectedTool.id)}><Wrench /> {owned ? 'Improve tool' : 'Forge tool'}</button>
          </InteractionDock>
        );
      })()}
    </div>
  );

  const renderMarket = () => (
    <div className="sanctuary-room market-room">
      <div className="sanctuary-room-title"><span>Stardust Market</span><small>The merchandise is on the shelves — touch any object to inspect it</small></div>
      <div className="sanctuary-room-scroll market-scroll">
        <div className="sanctuary-room-world market-world">
          <div className="market-neon">OPEN · SANCTUARY OBJECTS · OPEN</div>
          <div className="market-curtains" />
          <div className="sanctuary-room-floor market-floor" />
          <div className="sanctuary-shopkeeper">
            <span>🧑‍🔧</span>
            <div>“Pick it up. See how it feels in the room.”</div>
          </div>
          <div className="sanctuary-market-shelves">
            {HOME_FURNITURE_CATALOG.map((item) => {
              const ownedCount = homePlanet.placedFurniture.filter((placed) => placed.itemId === item.id).length;
              return (
                <div className="sanctuary-market-pedestal" key={item.id}>
                  <span className="pedestal-price"><Sparkles /> {item.costStarDust}</span>
                  <SceneObject
                    label={item.name}
                    hint={ownedCount ? `${ownedCount} in town` : item.category}
                    src={FURNITURE_SPRITES[item.id]}
                    fallback={item.icon}
                    accent={item.color}
                    scale="small"
                    selected={selectedObject === `market:${item.id}`}
                    onClick={() => setSelectedObject(`market:${item.id}`)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedMarketItem && (
        <InteractionDock
          eyebrow={`${selectedMarketItem.category} · MARKET OBJECT`}
          title={selectedMarketItem.name}
          text={`${selectedMarketItem.description} Buying it places the object directly outside in Sanctuary Town and in your habitat.`}
          portrait={<ItemSprite src={FURNITURE_SPRITES[selectedMarketItem.id]} fallback={selectedMarketItem.icon} alt="" />}
          onDismiss={() => setSelectedObject(null)}
        >
          <CostLine cost={{ starDust: selectedMarketItem.costStarDust }} canAfford={starDustBalance >= selectedMarketItem.costStarDust} />
          <button className="sanctuary-action primary" onClick={() => handleBuyFurniture(selectedMarketItem)}><ShoppingBag /> Buy & place</button>
        </InteractionDock>
      )}
    </div>
  );

  const renderTraveler = () => {
    const traveler = homePlanet.spaceTraveler;
    const minutes = traveler ? Math.max(0, Math.ceil((traveler.departureTimestamp - clock) / 60000)) : 0;
    return (
      <div className="sanctuary-room traveler-room">
        <div className="sanctuary-room-title"><span>Landing Pad</span><small>Walk up to the visitor or touch one of their floating wares</small></div>
        <div className="sanctuary-room-scroll">
          <div className="sanctuary-room-world traveler-world">
            <div className="traveler-spaceport" />
            <div className="landing-horizon" />
            <div className="sanctuary-room-floor landing-floor" />
            {traveler ? (
              <>
                <button className={`sanctuary-traveler-npc${selectedObject === 'traveler:npc' ? ' is-selected' : ''}`} onClick={() => setSelectedObject('traveler:npc')}>
                  <span className="traveler-ship">{traveler.shipIcon}</span>
                  <span className="traveler-avatar">{traveler.avatarIcon}</span>
                  <strong>{traveler.travelerName}</strong>
                  <small>{traveler.title}</small>
                  <em><Timer /> {minutes}m before departure</em>
                </button>
                <div className="sanctuary-offer-platforms">
                  {traveler.offers.map((offer) => (
                    <div className={`sanctuary-offer-platform rarity-${offer.rarity.toLowerCase()}`} key={offer.id}>
                      <span className="offer-rarity">{offer.rarity}</span>
                      <SceneObject
                        label={offer.name}
                        hint={offer.traded ? 'Traded' : 'Ask about this'}
                        src={FURNITURE_SPRITES[offer.itemId]}
                        fallback={offer.icon}
                        accent={offer.color}
                        locked={offer.traded}
                        selected={selectedObject === `offer:${offer.id}`}
                        onClick={() => setSelectedObject(`offer:${offer.id}`)}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="sanctuary-empty-landing">No ship on approach.</div>
            )}
            <SceneObject
              label="Subspace beacon"
              hint="Call a new traveler"
              fallback="📡"
              accent="#c084fc"
              selected={selectedObject === 'traveler:beacon'}
              onClick={() => setSelectedObject('traveler:beacon')}
            />
          </div>
        </div>

        {traveler && selectedObject === 'traveler:npc' && (
          <InteractionDock
            eyebrow={`${traveler.title} · ${minutes}M REMAINING`}
            title={traveler.travelerName}
            text={`“${traveler.dialogue} My wares are floating beside me — touch one and we will discuss its price.”`}
            portrait={<span>{traveler.avatarIcon}</span>}
            onDismiss={() => setSelectedObject(null)}
          >
            <span className="sanctuary-selected-note">Select a floating object to trade</span>
          </InteractionDock>
        )}

        {traveler && selectedOffer && (
          <InteractionDock
            eyebrow={`${selectedOffer.rarity} OFFER · ${traveler.travelerName}`}
            title={selectedOffer.name}
            text={`“${selectedOffer.description} I will place it in your town the moment our trade is complete.”`}
            portrait={<ItemSprite src={FURNITURE_SPRITES[selectedOffer.itemId]} fallback={selectedOffer.icon} alt="" />}
            onDismiss={() => setSelectedObject(null)}
          >
            <CostLine cost={selectedOffer.cost} canAfford={canAfford(selectedOffer.cost)} />
            <button className="sanctuary-action primary" disabled={selectedOffer.traded} onClick={() => handleTrade(selectedOffer)}>{selectedOffer.traded ? <><Check /> Already traded</> : <><Sparkles /> Accept trade</>}</button>
          </InteractionDock>
        )}

        {selectedObject === 'traveler:beacon' && (
          <InteractionDock
            eyebrow="SUBSPACE BEACON"
            title="Signal a different traveler?"
            text="The current visitor and their offers will depart. A new merchant will land immediately with a new conversation and physical wares."
            portrait={<Radio />}
            onDismiss={() => setSelectedObject(null)}
          >
            <button className="sanctuary-action primary" onClick={handleSummonTraveler}><Radio /> Send signal</button>
          </InteractionDock>
        )}
      </div>
    );
  };

  return (
    <div
      className="sanctuary-shell ui-interactive"
      style={{ '--biome-color': biome.color, '--biome-dark': biome.secondaryColor } as React.CSSProperties}
    >
      {renderTopBar()}
      {notice && <div className="sanctuary-notice"><Sparkles /> {notice}</div>}
      <main className="sanctuary-main">
        {scene === 'TOWN' && renderTown()}
        {scene === 'HABITAT' && renderHabitat()}
        {scene === 'GREENHOUSE' && renderGreenhouse()}
        {scene === 'VAULT' && renderVault()}
        {scene === 'WORKSHOP' && renderWorkshop()}
        {scene === 'MARKET' && renderMarket()}
        {scene === 'TRAVELER' && renderTraveler()}
      </main>
      {scene !== 'TOWN' && (
        <button className="sanctuary-back-to-town" onClick={returnToTown}><ArrowLeft /> Town</button>
      )}
      <div className="sanctuary-screen-label"><Info /> Full-screen interactive sanctuary · objects are the menu</div>
    </div>
  );
};

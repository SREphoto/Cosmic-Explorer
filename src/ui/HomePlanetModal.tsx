import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Home,
  Sprout,
  Package,
  Wrench,
  ShoppingBag,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Clock,
  Droplets,
  Plus,
  RefreshCw,
  Edit3,
  CloudUpload,
  Layers,
  ArrowUpCircle,
  Compass,
  Radio,
  Rocket,
  Gift,
  Timer,
  Check
} from 'lucide-react';
import {
  UserSavedData,
  HomePlanetData,
  HomeSeedType,
  HomeGardenPlot,
  HomePlacedFurniture,
  HomeFurnitureItem,
  SpaceTravelerVisit,
  SpaceTravelerOffer
} from '../types/game';
import {
  HOME_PLANET_BIOMES,
  HABITAT_UPGRADES,
  STORAGE_UPGRADES,
  GREENHOUSE_UPGRADES,
  GARDEN_SEEDS,
  CRAFTABLE_HOME_TOOLS,
  HOME_FURNITURE_CATALOG,
  generateSpaceTravelerVisit,
  homeUpgradeCostMultiplier,
  gardenGrowthMultiplier,
  gardenHarvestMultiplier,
  hasCraftedTool,
  calculateSkillBonuses
} from '../core/Config';
import { audioEngine } from '../core/AudioEngine';
import { FirebaseService, auth } from '../core/firebase';
import { StorageManager } from '../core/Storage';
import { VisualGardenLayout } from './VisualGardenLayout';
import { spriteAtlas, BIOME_SPRITES, FURNITURE_SPRITES, HABITAT_SPRITES, PLANT_SPRITES, TOOL_SPRITES, RESOURCE_SPRITES, STORAGE_SPRITE } from '../core/SpriteAtlas';
import { ItemSprite } from '../components/ItemSprite';

interface HomePlanetModalProps {
  savedData: UserSavedData;
  onClose: () => void;
  onUpdateSavedData: (updated: UserSavedData) => void;
}

type HomeTab = 'HABITAT' | 'GARDEN' | 'VISUAL_GARDEN' | 'STORAGE' | 'WORKSHOP' | 'SHOP' | 'TRAVELER';

export const HomePlanetModal: React.FC<HomePlanetModalProps> = ({
  savedData,
  onClose,
  onUpdateSavedData
}) => {
  const [activeTab, setActiveTab] = useState<HomeTab>('HABITAT');
  const [selectedSeedType, setSelectedSeedType] = useState<HomeSeedType>('STAR_DAISY');
  const [isRenaming, setIsRenaming] = useState(false);
  const [newPlanetName, setNewPlanetName] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Initialize Home Planet state if not present
  const defaultHomePlanet: HomePlanetData = {
    id: 'home_sanctuary_alpha',
    name: 'Sanctuary Prime',
    biomeId: 'VERDANT',
    biome: 'VERDANT',
    habitatTier: 1,
    storageTier: 1,
    greenhouseTier: 1,
    workshopTier: 1,
    supplies: {
      timber: 20,
      quartz: 15,
      alloys: 10,
      plasmaCells: 5,
      starDust: 0
    },
    gardenPlots: [
      { id: 'plot_1', seedType: 'STAR_DAISY', seedName: 'Starlight Daisy', icon: '🌼', plantedAtTimestamp: Date.now() - 30000, isHarvestable: false, growthProgress: 0.75 },
      { id: 'plot_2', seedType: null, plantedAtTimestamp: 0, isHarvestable: false, growthProgress: 0 }
    ],
    craftedTools: [],
    placedFurniture: [
      { id: 'furn_1', itemId: 'FURN_FIREPIT', name: 'Stardust Firepit', category: 'DECOR', angle: 0.4, placedAngle: 0.4, icon: '🔥', color: '#f97316' },
      { id: 'furn_2', itemId: 'FURN_LANTERNS', name: 'Bioluminescent Glow Lanterns', category: 'LIGHTING', angle: 2.2, placedAngle: 2.2, icon: '🏮', color: '#facc15' }
    ],
    unlockedDecorIds: ['FURN_FIREPIT', 'FURN_LANTERNS'],
    spaceTraveler: generateSpaceTravelerVisit(),
    lastSavedAt: Date.now()
  };

  const [homePlanet, setHomePlanet] = useState<HomePlanetData>(() => {
    const hp = savedData.homePlanet || defaultHomePlanet;
    // Check if space traveler visit expired or missing
    if (!hp.spaceTraveler || Date.now() > hp.spaceTraveler.departureTimestamp) {
      return {
        ...hp,
        spaceTraveler: generateSpaceTravelerVisit()
      };
    }
    return hp;
  });

  const starDustBalance = savedData.totalStarDust || savedData.starDustCurrency || 0;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Growth loop timer for crops
  useEffect(() => {
    const timer = setInterval(() => {
      setHomePlanet((prev) => {
        let hasChanges = false;
        const now = Date.now();
        const updatedPlots = prev.gardenPlots.map((plot) => {
          if (!plot.seedType || plot.isHarvestable) return plot;
          const seedConfig = GARDEN_SEEDS.find((s) => s.type === plot.seedType);
          if (!seedConfig) return plot;

          const elapsedSec = (now - (plot.plantedAtTimestamp ?? plot.plantedAt ?? now)) / 1000;
          const growthMult = gardenGrowthMultiplier(prev.craftedTools as Array<{ id: string; level?: number }>);
          const progress = Math.min(1.0, elapsedSec / (seedConfig.growthDurationSeconds * growthMult));
          const isHarvestable = progress >= 1.0;

          if (progress !== (plot.growthProgress ?? 0) || isHarvestable !== plot.isHarvestable) {
            hasChanges = true;
            return {
              ...plot,
              growthProgress: progress,
              isHarvestable
            };
          }
          return plot;
        });

        if (hasChanges) {
          const updated = { ...prev, gardenPlots: updatedPlots };
          saveHomePlanetState(updated);
          return updated;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Save changes locally and optionally to cloud
  const saveHomePlanetState = (updated: HomePlanetData) => {
    const newUserData: UserSavedData = {
      ...savedData,
      homePlanet: updated
    };
    StorageManager.saveData(newUserData);
    onUpdateSavedData(newUserData);

    if (auth.currentUser) {
      FirebaseService.saveHomePlanet(auth.currentUser.uid, updated).catch((e) => {
        console.warn('Cloud sync error:', e);
      });
    }
  };

  // Canvas Drawing of interactive 3D/2D home world
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      rotationAngleRef.current += 0.003;
      const angle = rotationAngleRef.current;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 + 10;
      const radius = Math.min(w, h) * 0.32;

      ctx.clearRect(0, 0, w, h);

      // Deep space starry backdrop
      ctx.fillStyle = '#050714';
      ctx.fillRect(0, 0, w, h);

      // Atmospheric Glow
      const currentBiome = HOME_PLANET_BIOMES.find((b) => b.id === homePlanet.biomeId) || HOME_PLANET_BIOMES[0];
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.35);
      glowGrad.addColorStop(0, `${currentBiome.color}44`);
      glowGrad.addColorStop(0.6, `${currentBiome.color}15`);
      glowGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Back Planetary Ring
      if (homePlanet.hasRing) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.3);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.7, radius * 0.45, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = homePlanet.ringColor || 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 14;
        ctx.stroke();
        ctx.restore();
      }

      // Painted planet globe
      const biomeSprite = spriteAtlas.biome(currentBiome.id);
      if (biomeSprite) {
        const size = radius * 2.12;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.03, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(biomeSprite, cx - size / 2, cy - size / 2, size, size);
        ctx.restore();
      } else {
        const bodyGrad = ctx.createRadialGradient(
          cx - radius * 0.35,
          cy - radius * 0.35,
          radius * 0.1,
          cx,
          cy,
          radius
        );
        bodyGrad.addColorStop(0, currentBiome.color);
        bodyGrad.addColorStop(0.8, currentBiome.secondaryColor);
        bodyGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Surface features & decorations
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      if (!biomeSprite) {
        for (let i = 0; i < 6; i++) {
          const patchAngle = (i * Math.PI) / 3;
          const px = Math.cos(patchAngle) * (radius * 0.6);
          const py = Math.sin(patchAngle) * (radius * 0.6);
          ctx.fillStyle = `${currentBiome.color}33`;
          ctx.beginPath();
          ctx.arc(px, py, radius * 0.28, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Habitat structure
      const habitatDef = HABITAT_UPGRADES.find((h) => h.tier === homePlanet.habitatTier) || HABITAT_UPGRADES[0];
      const habitatImg = spriteAtlas.habitat(homePlanet.habitatTier);
      const habitatSize = Math.floor(radius * 0.55);
      if (habitatImg) {
        ctx.drawImage(habitatImg, -habitatSize / 2, -radius - habitatSize * 0.35, habitatSize, habitatSize);
      } else {
        ctx.font = `${Math.floor(radius * 0.32)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(habitatDef.icon, 0, -radius - 12);
      }

      // Storage shed
      const storageDef = STORAGE_UPGRADES.find((s) => s.tier === homePlanet.storageTier) || STORAGE_UPGRADES[0];
      const storageAngle = 1.3;
      const sx = Math.cos(storageAngle) * (radius + 8);
      const sy = Math.sin(storageAngle) * (radius + 8);
      const storageImg = spriteAtlas.get(STORAGE_SPRITE);
      const storageSize = Math.floor(radius * 0.38);
      if (storageImg) {
        ctx.drawImage(storageImg, sx - storageSize / 2, sy - storageSize / 2, storageSize, storageSize);
      } else {
        ctx.font = `${Math.floor(radius * 0.22)}px sans-serif`;
        ctx.fillText(storageDef.icon, sx, sy);
      }

      // Greenhouse
      const gardenAngle = -1.3;
      const gx = Math.cos(gardenAngle) * (radius + 8);
      const gy = Math.sin(gardenAngle) * (radius + 8);
      const plantImg = spriteAtlas.plant('STAR_DAISY');
      const plantSize = Math.floor(radius * 0.36);
      if (plantImg) {
        ctx.drawImage(plantImg, gx - plantSize / 2, gy - plantSize / 2, plantSize, plantSize);
      } else {
        ctx.font = `${Math.floor(radius * 0.22)}px sans-serif`;
        ctx.fillText('🪴', gx, gy);
      }

      // Render Space Traveler Landing Site if present
      if (homePlanet.spaceTraveler) {
        const travelerAngle = 0.0;
        const tx = Math.cos(travelerAngle) * (radius + 14);
        const ty = Math.sin(travelerAngle) * (radius + 14);
        
        // Glowing subspace landing beacon
        ctx.save();
        ctx.beginPath();
        ctx.arc(tx, ty, radius * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.fill();
        ctx.strokeStyle = homePlanet.spaceTraveler.accentColor || '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = `${Math.floor(radius * 0.2)}px sans-serif`;
        ctx.fillText(homePlanet.spaceTraveler.shipIcon || '🛸', tx - 6, ty - 6);
        ctx.font = `${Math.floor(radius * 0.16)}px sans-serif`;
        ctx.fillText(homePlanet.spaceTraveler.avatarIcon || '🧙‍♂️', tx + 8, ty + 6);
        ctx.restore();
      }

      // Render placed furniture
      (homePlanet.placedFurniture || []).forEach((furn) => {
        const catalogItem = HOME_FURNITURE_CATALOG.find((f) => f.id === furn.itemId);
        if (!catalogItem) return;
        const itemAngle = furn.placedAngle !== undefined
          ? furn.placedAngle
          : (furn.posX !== undefined && furn.posY !== undefined ? Math.atan2(furn.posY, furn.posX) : (furn.angle || 0));
        const fx = Math.cos(itemAngle) * (radius + 10);
        const fy = Math.sin(itemAngle) * (radius + 10);
        const furnImg = spriteAtlas.furniture(furn.itemId);
        const furnSize = Math.floor(radius * 0.34);
        if (furnImg) {
          ctx.drawImage(furnImg, fx - furnSize / 2, fy - furnSize / 2, furnSize, furnSize);
        } else {
          ctx.font = `${Math.floor(radius * 0.18)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(catalogItem.icon, fx, fy);
        }
      });

      ctx.restore();

      // Front Planetary Ring
      if (homePlanet.hasRing) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.3);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.7, radius * 0.45, 0, 0, Math.PI);
        ctx.strokeStyle = homePlanet.ringColor || 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 14;
        ctx.stroke();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [homePlanet]);

  // Upgrade Habitat
  const handleUpgradeHabitat = () => {
    const nextTier = homePlanet.habitatTier + 1;
    const nextDef = HABITAT_UPGRADES.find((h) => h.tier === nextTier);
    if (!nextDef) return;
    const m = homeUpgradeCostMultiplier(homePlanet.craftedTools as Array<{ id: string; level?: number }>);
    const cost = {
      timber: Math.ceil(nextDef.cost.timber * m),
      quartz: Math.ceil(nextDef.cost.quartz * m),
      alloys: Math.ceil(nextDef.cost.alloys * m),
      plasmaCells: Math.ceil(nextDef.cost.plasmaCells * m),
      starDust: Math.ceil(nextDef.cost.starDust * m)
    };

    if (
      homePlanet.supplies.timber < cost.timber ||
      homePlanet.supplies.quartz < cost.quartz ||
      homePlanet.supplies.alloys < cost.alloys ||
      homePlanet.supplies.plasmaCells < cost.plasmaCells ||
      starDustBalance < cost.starDust
    ) {
      audioEngine.playPowerUpExpired();
      return;
    }

    audioEngine.playPowerUpCollect();
    const updated: HomePlanetData = {
      ...homePlanet,
      habitatTier: nextTier,
      supplies: {
        ...homePlanet.supplies,
        timber: homePlanet.supplies.timber - cost.timber,
        quartz: homePlanet.supplies.quartz - cost.quartz,
        alloys: homePlanet.supplies.alloys - cost.alloys,
        plasmaCells: homePlanet.supplies.plasmaCells - cost.plasmaCells
      }
    };

    // Deduct star dust
    const newUserData = {
      ...savedData,
      totalStarDust: Math.max(0, starDustBalance - cost.starDust),
      starDustCurrency: Math.max(0, starDustBalance - cost.starDust),
      homePlanet: updated
    };
    setHomePlanet(updated);
    StorageManager.saveData(newUserData);
    onUpdateSavedData(newUserData);
  };

  // Upgrade Storage Shed
  const handleUpgradeStorage = () => {
    const nextTier = homePlanet.storageTier + 1;
    const nextDef = STORAGE_UPGRADES.find((s) => s.tier === nextTier);
    if (!nextDef) return;

    if (
      homePlanet.supplies.timber < nextDef.cost.timber ||
      homePlanet.supplies.quartz < nextDef.cost.quartz ||
      homePlanet.supplies.alloys < nextDef.cost.alloys ||
      starDustBalance < nextDef.cost.starDust
    ) {
      audioEngine.playPowerUpExpired();
      return;
    }

    audioEngine.playPowerUpCollect();
    const updated: HomePlanetData = {
      ...homePlanet,
      storageTier: nextTier,
      supplies: {
        ...homePlanet.supplies,
        timber: homePlanet.supplies.timber - nextDef.cost.timber,
        quartz: homePlanet.supplies.quartz - nextDef.cost.quartz,
        alloys: homePlanet.supplies.alloys - nextDef.cost.alloys
      }
    };

    const newUserData = {
      ...savedData,
      totalStarDust: Math.max(0, starDustBalance - nextDef.cost.starDust),
      homePlanet: updated
    };
    setHomePlanet(updated);
    StorageManager.saveData(newUserData);
    onUpdateSavedData(newUserData);
  };

  // Upgrade Greenhouse
  const handleUpgradeGreenhouse = () => {
    const nextTier = homePlanet.greenhouseTier + 1;
    const nextDef = GREENHOUSE_UPGRADES.find((g) => g.tier === nextTier);
    if (!nextDef) return;

    if (
      homePlanet.supplies.timber < nextDef.cost.timber ||
      homePlanet.supplies.quartz < nextDef.cost.quartz ||
      homePlanet.supplies.alloys < nextDef.cost.alloys ||
      starDustBalance < nextDef.cost.starDust
    ) {
      audioEngine.playPowerUpExpired();
      return;
    }

    audioEngine.playPowerUpCollect();

    // Create new plots to match capacity
    const currentCount = homePlanet.gardenPlots.length;
    const newPlots: HomeGardenPlot[] = [...homePlanet.gardenPlots];
    for (let i = currentCount; i < nextDef.plots; i++) {
      newPlots.push({
        id: `plot_${i + 1}`,
        seedType: null,
        plantedAtTimestamp: 0,
        isHarvestable: false,
        growthProgress: 0
      });
    }

    const updated: HomePlanetData = {
      ...homePlanet,
      greenhouseTier: nextTier,
      gardenPlots: newPlots,
      supplies: {
        ...homePlanet.supplies,
        timber: homePlanet.supplies.timber - nextDef.cost.timber,
        quartz: homePlanet.supplies.quartz - nextDef.cost.quartz,
        alloys: homePlanet.supplies.alloys - nextDef.cost.alloys
      }
    };

    const newUserData = {
      ...savedData,
      totalStarDust: Math.max(0, starDustBalance - nextDef.cost.starDust),
      homePlanet: updated
    };
    setHomePlanet(updated);
    StorageManager.saveData(newUserData);
    onUpdateSavedData(newUserData);
  };

  // Plant Seed in a plot
  const handlePlantSeed = (plotId: string) => {
    const seed = GARDEN_SEEDS.find((s) => s.type === selectedSeedType);
    if (!seed || starDustBalance < seed.costStarDust) {
      audioEngine.playPowerUpExpired();
      return;
    }

    audioEngine.playClick();
    const updatedPlots = homePlanet.gardenPlots.map((p) => {
      if (p.id === plotId && !p.seedType) {
        return {
          ...p,
          seedType: selectedSeedType,
          seedName: seed.name,
          icon: seed.icon,
          plantedAtTimestamp: Date.now(),
          isHarvestable: false,
          growthProgress: 0
        };
      }
      return p;
    });

    const updated = { ...homePlanet, gardenPlots: updatedPlots };
    const newUserData = {
      ...savedData,
      totalStarDust: Math.max(0, starDustBalance - seed.costStarDust),
      homePlanet: updated
    };
    setHomePlanet(updated);
    StorageManager.saveData(newUserData);
    onUpdateSavedData(newUserData);
  };

  // Harvest Crop
  const handleHarvestCrop = (plotId: string) => {
    const plot = homePlanet.gardenPlots.find((p) => p.id === plotId);
    if (!plot || !plot.seedType || !plot.isHarvestable) return;

    const seed = GARDEN_SEEDS.find((s) => s.type === plot.seedType);
    if (!seed) return;

    audioEngine.playPowerUpCollect();
    const alchemy = calculateSkillBonuses(savedData.skillTreeAllocations || ({} as any)).gardenAlchemyBonus || 0;
    const hMult = gardenHarvestMultiplier(homePlanet.craftedTools as Array<{ id: string; level?: number }>, alchemy / 0.15);
    const dustGain = Math.round(seed.rewardStarDust * hMult);
    const diamondGain = Math.round(seed.rewardDiamonds * hMult);

    const updatedPlots = homePlanet.gardenPlots.map((p) => {
      if (p.id === plotId) {
        return {
          ...p,
          seedType: null,
          seedName: undefined,
          icon: undefined,
          plantedAtTimestamp: 0,
          isHarvestable: false,
          growthProgress: 0
        };
      }
      return p;
    });

    const updated = {
      ...homePlanet,
      gardenPlots: updatedPlots,
      lastHarvestTimestamp: Date.now()
    };

    const newUserData = {
      ...savedData,
      totalStarDust: starDustBalance + dustGain,
      totalDiamonds: (savedData.totalDiamonds || 0) + diamondGain,
      totalDiamondsAllTime: (savedData.totalDiamondsAllTime || 0) + diamondGain,
      homePlanet: updated
    };

    setHomePlanet(updated);
    StorageManager.saveData(newUserData);
    onUpdateSavedData(newUserData);
  };

  // Craft Tool
  const handleCraftTool = (toolId: string) => {
    const toolDef = CRAFTABLE_HOME_TOOLS.find((t) => t.id === toolId);
    if (!toolDef) return;

    if (
      homePlanet.supplies.timber < toolDef.cost.timber ||
      homePlanet.supplies.quartz < toolDef.cost.quartz ||
      homePlanet.supplies.alloys < toolDef.cost.alloys ||
      starDustBalance < toolDef.cost.starDust
    ) {
      audioEngine.playPowerUpExpired();
      return;
    }

    audioEngine.playPowerUpCollect();

    const existingToolIndex = homePlanet.craftedTools.findIndex((t: any) => t.id === toolId);
    let updatedTools = [...homePlanet.craftedTools];
    if (existingToolIndex >= 0) {
      const existing = updatedTools[existingToolIndex] as any;
      updatedTools[existingToolIndex] = {
        ...existing,
        level: (existing.level || 1) + 1
      };
    } else {
      updatedTools.push({ ...toolDef, level: 1 });
    }

    const updated: HomePlanetData = {
      ...homePlanet,
      craftedTools: updatedTools,
      supplies: {
        ...homePlanet.supplies,
        timber: homePlanet.supplies.timber - toolDef.cost.timber,
        quartz: homePlanet.supplies.quartz - toolDef.cost.quartz,
        alloys: homePlanet.supplies.alloys - toolDef.cost.alloys,
        plasmaCells: homePlanet.supplies.plasmaCells - (toolDef.cost.plasmaCells || 0)
      }
    };

    const newUserData = {
      ...savedData,
      totalStarDust: Math.max(0, starDustBalance - toolDef.cost.starDust),
      homePlanet: updated
    };
    setHomePlanet(updated);
    StorageManager.saveData(newUserData);
    onUpdateSavedData(newUserData);
  };

  // Purchase & Place Furniture with Star Dust
  const handleBuyFurniture = (itemId: string) => {
    const item = HOME_FURNITURE_CATALOG.find((f) => f.id === itemId);
    if (!item || starDustBalance < item.costStarDust) {
      audioEngine.playPowerUpExpired();
      return;
    }

    audioEngine.playPowerUpCollect();
    const newFurn: HomePlacedFurniture = {
      id: `furn_${Date.now()}`,
      itemId,
      name: item.name,
      category: item.category,
      angle: Math.random() * Math.PI * 2,
      placedAngle: Math.random() * Math.PI * 2,
      icon: item.icon,
      color: item.color
    };

    const updated: HomePlanetData = {
      ...homePlanet,
      placedFurniture: [...(homePlanet.placedFurniture || []), newFurn]
    };

    const newUserData = {
      ...savedData,
      totalStarDust: Math.max(0, starDustBalance - item.costStarDust),
      homePlanet: updated
    };

    setHomePlanet(updated);
    StorageManager.saveData(newUserData);
    onUpdateSavedData(newUserData);
  };

  // Direct Planet Data Update (e.g. from Visual Garden layout)
  const handleUpdatePlanetDirectly = (updatedPlanet: HomePlanetData) => {
    const updatedUser: UserSavedData = {
      ...savedData,
      homePlanet: updatedPlanet
    };
    setHomePlanet(updatedPlanet);
    StorageManager.saveData(updatedUser);
    onUpdateSavedData(updatedUser);
  };

  // Change Biome
  const handleChangeBiome = (biomeId: string) => {
    const biome = HOME_PLANET_BIOMES.find((b) => b.id === biomeId);
    if (!biome) return;

    audioEngine.playClick();
    const updated: HomePlanetData = {
      ...homePlanet,
      biomeId: biome.id as any,
      primaryColor: biome.color,
      secondaryColor: biome.secondaryColor
    };

    setHomePlanet(updated);
    saveHomePlanetState(updated);
  };

  // Rename Planet
  const handleSaveRename = () => {
    if (!newPlanetName.trim()) return;
    const updated = { ...homePlanet, name: newPlanetName.trim() };
    setHomePlanet(updated);
    saveHomePlanetState(updated);
    setIsRenaming(false);
  };

  // Quick Deposit Exploration Loot
  const handleDepositExplorationLoot = () => {
    audioEngine.playPowerUpCollect();
    const storageLimit = (STORAGE_UPGRADES.find((s) => s.tier === homePlanet.storageTier) || STORAGE_UPGRADES[0]).capacity;
    const pickaxe = hasCraftedTool(homePlanet.craftedTools as Array<{ id: string }>, 'GRAVITON_PICKAXE');
    const harvestBonus = 1 + (calculateSkillBonuses(savedData.skillTreeAllocations || ({} as any)).harvestYieldBonus || 0);
    
    // Add bonus materials gathered from travels
    const updatedSupplies = {
      timber: Math.min(storageLimit, homePlanet.supplies.timber + Math.round(15 * harvestBonus)),
      quartz: Math.min(storageLimit, homePlanet.supplies.quartz + Math.round(10 * (pickaxe ? 2 : 1) * harvestBonus)),
      alloys: Math.min(storageLimit, homePlanet.supplies.alloys + Math.round(8 * harvestBonus)),
      plasmaCells: Math.min(storageLimit, homePlanet.supplies.plasmaCells + Math.round(4 * harvestBonus))
    };

    const updated = { ...homePlanet, supplies: updatedSupplies };
    setHomePlanet(updated);
    saveHomePlanetState(updated);
    setSyncStatus('Supplies deposited to Home Base vault!');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  // Trade with Space Traveler
  const handleTradeWithTraveler = (offerId: string) => {
    if (!homePlanet.spaceTraveler) return;
    const offer = homePlanet.spaceTraveler.offers.find((o) => o.id === offerId);
    if (!offer || offer.traded) return;

    const reqTimber = offer.cost.timber || 0;
    const reqQuartz = offer.cost.quartz || 0;
    const reqAlloys = offer.cost.alloys || 0;
    const reqPlasma = offer.cost.plasmaCells || 0;
    const reqStarDust = offer.cost.starDust || 0;
    const reqStars = offer.cost.stars || 0;
    const reqDiamonds = offer.cost.diamonds || 0;

    const playerStars = savedData.totalStars || 0;
    const playerDiamonds = (savedData.spaceDiamonds ?? savedData.totalDiamonds ?? 0);

    const canAfford =
      homePlanet.supplies.timber >= reqTimber &&
      homePlanet.supplies.quartz >= reqQuartz &&
      homePlanet.supplies.alloys >= reqAlloys &&
      homePlanet.supplies.plasmaCells >= reqPlasma &&
      starDustBalance >= reqStarDust &&
      playerStars >= reqStars &&
      playerDiamonds >= reqDiamonds;

    if (!canAfford) {
      setSyncStatus('Insufficient resources for this cosmic trade!');
      setTimeout(() => setSyncStatus(null), 3000);
      return;
    }

    audioEngine.playLevelUp();

    const updatedSupplies = {
      timber: homePlanet.supplies.timber - reqTimber,
      quartz: homePlanet.supplies.quartz - reqQuartz,
      alloys: homePlanet.supplies.alloys - reqAlloys,
      plasmaCells: homePlanet.supplies.plasmaCells - reqPlasma,
      starDust: homePlanet.supplies.starDust || 0
    };

    const newPlacedFurniture: HomePlacedFurniture = {
      id: `furn_${Date.now()}_${offer.itemId}`,
      itemId: offer.itemId,
      name: offer.name,
      category: offer.category as any,
      angle: Math.random() * Math.PI * 2,
      placedAngle: Math.random() * Math.PI * 2,
      icon: offer.icon,
      color: offer.color
    };

    const updatedOffers = homePlanet.spaceTraveler.offers.map((o) =>
      o.id === offerId ? { ...o, traded: true } : o
    );

    const updatedPlanet: HomePlanetData = {
      ...homePlanet,
      supplies: updatedSupplies,
      placedFurniture: [...(homePlanet.placedFurniture || []), newPlacedFurniture],
      unlockedDecorIds: Array.from(new Set([...(homePlanet.unlockedDecorIds || []), offer.itemId])),
      spaceTraveler: {
        ...homePlanet.spaceTraveler,
        offers: updatedOffers
      },
      lastSavedAt: Date.now()
    };

    const updatedUser: UserSavedData = {
      ...savedData,
      totalStarDust: Math.max(0, starDustBalance - reqStarDust),
      totalStars: Math.max(0, playerStars - reqStars),
      spaceDiamonds: Math.max(0, playerDiamonds - reqDiamonds),
      homePlanet: updatedPlanet
    };

    setHomePlanet(updatedPlanet);
    StorageManager.saveData(updatedUser);
    onUpdateSavedData(updatedUser);

    if (auth.currentUser) {
      FirebaseService.saveGameToCloud(auth.currentUser.uid, updatedUser);
    }

    setSyncStatus(`Traded for ${offer.name}! Placed onto your sanctuary.`);
    setTimeout(() => setSyncStatus(null), 3500);
  };

  // Summon / Refresh Space Traveler with Subspace Beacon
  const handleSummonSpaceTraveler = () => {
    audioEngine.playPowerUpCollect();
    const newVisit = generateSpaceTravelerVisit();
    const updatedPlanet: HomePlanetData = {
      ...homePlanet,
      spaceTraveler: newVisit,
      lastSavedAt: Date.now()
    };

    const updatedUser: UserSavedData = {
      ...savedData,
      homePlanet: updatedPlanet
    };

    setHomePlanet(updatedPlanet);
    StorageManager.saveData(updatedUser);
    onUpdateSavedData(updatedUser);

    setSyncStatus(`${newVisit.travelerName} has landed in your sanctuary!`);
    setTimeout(() => setSyncStatus(null), 3500);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none text-white ui-interactive animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isRenaming ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newPlanetName}
                      onChange={(e) => setNewPlanetName(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-sm text-white font-bold"
                      placeholder="Planet Name"
                    />
                    <button
                      onClick={handleSaveRename}
                      className="bg-emerald-500 text-slate-950 text-xs px-2 py-1 rounded font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>{homePlanet.name}</span>
                      <button
                        onClick={() => {
                          setNewPlanetName(homePlanet.name);
                          setIsRenaming(true);
                        }}
                        className="text-slate-400 hover:text-white transition"
                        title="Rename Home World"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </h2>
                  </>
                )}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  Tier {homePlanet.habitatTier} Sanctuary
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Your personal sovereign homestead & cosmic sanctuary
              </p>
            </div>
          </div>

          {/* Star Dust Currency Balance & Close Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-2xl shadow-sm">
              <ItemSprite src={RESOURCE_SPRITES.stardust} className="w-5 h-5 object-contain" alt="Star Dust" />
              <span className="font-mono font-bold text-sm text-amber-300">
                {starDustBalance.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                Star Dust
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-xl mb-2 flex items-center justify-between">
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Visual 3D/2D Planet Stage */}
          <div className="md:col-span-5 flex flex-col items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={340}
              height={260}
              className="w-full h-56 rounded-xl object-contain"
            />

            {/* Quick Storage Overview & Deposit */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 mt-2 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-sky-400" /> Vault Supplies
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Cap: {(STORAGE_UPGRADES.find((s) => s.tier === homePlanet.storageTier) || STORAGE_UPGRADES[0]).capacity}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center font-mono">
                <div className="bg-slate-950/60 p-1 rounded border border-slate-800">
                  <ItemSprite src={RESOURCE_SPRITES.timber} className="w-6 h-6 mx-auto object-contain" alt="Timber" />
                  <span className="block text-[10px] text-amber-400">Timber</span>
                  <span className="font-bold text-white">{homePlanet.supplies.timber}</span>
                </div>
                <div className="bg-slate-950/60 p-1 rounded border border-slate-800">
                  <ItemSprite src={RESOURCE_SPRITES.quartz} className="w-6 h-6 mx-auto object-contain" alt="Quartz" />
                  <span className="block text-[10px] text-purple-400">Quartz</span>
                  <span className="font-bold text-white">{homePlanet.supplies.quartz}</span>
                </div>
                <div className="bg-slate-950/60 p-1 rounded border border-slate-800">
                  <ItemSprite src={RESOURCE_SPRITES.alloys} className="w-6 h-6 mx-auto object-contain" alt="Alloys" />
                  <span className="block text-[10px] text-cyan-400">Alloys</span>
                  <span className="font-bold text-white">{homePlanet.supplies.alloys}</span>
                </div>
                <div className="bg-slate-950/60 p-1 rounded border border-slate-800">
                  <ItemSprite src={RESOURCE_SPRITES.plasma} className="w-6 h-6 mx-auto object-contain" alt="Plasma" />
                  <span className="block text-[10px] text-rose-400">Plasma</span>
                  <span className="font-bold text-white">{homePlanet.supplies.plasmaCells}</span>
                </div>
              </div>

              <button
                onClick={handleDepositExplorationLoot}
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-sm"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Deposit Supplies From Voyages</span>
              </button>
            </div>
          </div>

          {/* Right Column: Multi-tab Operations */}
          <div className="md:col-span-7 flex flex-col min-h-0 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 overflow-hidden">
            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => {
                  audioEngine.playClick();
                  setActiveTab('HABITAT');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'HABITAT'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Habitat</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  setActiveTab('GARDEN');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'GARDEN'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Astral Garden</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  setActiveTab('VISUAL_GARDEN');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'VISUAL_GARDEN'
                    ? 'bg-emerald-400 text-slate-950 shadow-md'
                    : 'text-emerald-300 hover:text-white bg-emerald-950/40 border border-emerald-500/30'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Visual Layout</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  setActiveTab('STORAGE');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'STORAGE'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Storage Vault</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  setActiveTab('WORKSHOP');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'WORKSHOP'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Tools Workshop</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  setActiveTab('SHOP');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'SHOP'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Decor Shop</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  setActiveTab('TRAVELER');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap relative ${
                  activeTab === 'TRAVELER'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-purple-300 hover:text-white bg-purple-950/40 border border-purple-500/30'
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Space Traveler</span>
                {homePlanet.spaceTraveler && (
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-3">
              {/* TAB 1: HABITAT */}
              {activeTab === 'HABITAT' && (
                <div className="space-y-3">
                  {/* Current Shelter Card */}
                  {(() => {
                    const currentDef = HABITAT_UPGRADES.find((h) => h.tier === homePlanet.habitatTier) || HABITAT_UPGRADES[0];
                    const nextDef = HABITAT_UPGRADES.find((h) => h.tier === homePlanet.habitatTier + 1);
                    return (
                      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ItemSprite src={HABITAT_SPRITES[currentDef.tier]} fallback={currentDef.icon} className="w-12 h-12 object-contain shrink-0" alt={currentDef.name} />
                            <div>
                              <h3 className="font-bold text-sm text-white">{currentDef.name}</h3>
                              <p className="text-xs text-slate-400">{currentDef.description}</p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30">
                            Tier {currentDef.tier}
                          </span>
                        </div>

                        {nextDef ? (
                          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-300">Next Upgrade: {nextDef.name}</span>
                              <span className="text-amber-400">{nextDef.cost.starDust} Star Dust</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1 text-[11px] font-mono text-center">
                              <div className={`p-1 rounded ${homePlanet.supplies.timber >= nextDef.cost.timber ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'}`}>
                                {homePlanet.supplies.timber}/{nextDef.cost.timber} Timber
                              </div>
                              <div className={`p-1 rounded ${homePlanet.supplies.quartz >= nextDef.cost.quartz ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'}`}>
                                {homePlanet.supplies.quartz}/{nextDef.cost.quartz} Quartz
                              </div>
                              <div className={`p-1 rounded ${homePlanet.supplies.alloys >= nextDef.cost.alloys ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'}`}>
                                {homePlanet.supplies.alloys}/{nextDef.cost.alloys} Alloys
                              </div>
                              <div className={`p-1 rounded ${homePlanet.supplies.plasmaCells >= nextDef.cost.plasmaCells ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'}`}>
                                {homePlanet.supplies.plasmaCells}/{nextDef.cost.plasmaCells} Plasma
                              </div>
                            </div>
                            <button
                              onClick={handleUpgradeHabitat}
                              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                            >
                              <ArrowUpCircle className="w-4 h-4" /> Upgrade Habitat to Tier {nextDef.tier}
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-emerald-400 text-xs font-bold">
                            ✨ Maximum Citadel Tier Reached!
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Biome Customization */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                    <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" /> Planetary Biome Theme
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {HOME_PLANET_BIOMES.map((b) => {
                        const isSelected = homePlanet.biomeId === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => handleChangeBiome(b.id)}
                            className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                              isSelected
                                ? 'bg-purple-950/40 border-purple-500/70 shadow'
                                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <ItemSprite src={BIOME_SPRITES[b.id]} fallback={b.icon} className="w-9 h-9 object-contain rounded-full shrink-0" alt={b.name} />
                            <div className="min-w-0">
                              <span className="font-bold text-xs block text-white truncate">{b.name}</span>
                              <span className="text-[10px] text-slate-400 block line-clamp-1">{b.description}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ASTRAL GARDEN */}
              {activeTab === 'GARDEN' && (
                <div className="space-y-3">
                  {/* Seed Selector */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Select Seed to Plant:</span>
                      <button
                        onClick={() => {
                          audioEngine.playClick();
                          setActiveTab('VISUAL_GARDEN');
                        }}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-lg transition"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Open Surface Layout</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {GARDEN_SEEDS.map((seed) => {
                        const isSelected = selectedSeedType === seed.type;
                        return (
                          <button
                            key={seed.type}
                            onClick={() => {
                              audioEngine.playClick();
                              setSelectedSeedType(seed.type);
                            }}
                            className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                              isSelected
                                ? 'bg-emerald-950/50 border-emerald-500 text-white'
                                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <ItemSprite src={PLANT_SPRITES[seed.type]} fallback={seed.icon} className="w-9 h-9 object-contain shrink-0" alt={seed.name} />
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">{seed.name}</span>
                              <span className="text-[10px] text-amber-400 font-mono">
                                {seed.costStarDust} Star Dust • {seed.growthDurationSeconds}s
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Garden Plots Grid */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-emerald-400" /> Active Garden Plots ({homePlanet.gardenPlots.length})
                      </h3>
                      {(() => {
                        const nextG = GREENHOUSE_UPGRADES.find((g) => g.tier === homePlanet.greenhouseTier + 1);
                        return nextG ? (
                          <button
                            onClick={handleUpgradeGreenhouse}
                            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Expand (+2 Plots, {nextG.cost.starDust} SD)
                          </button>
                        ) : null;
                      })()}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {homePlanet.gardenPlots.map((plot) => {
                        const seedConfig = GARDEN_SEEDS.find((s) => s.type === plot.seedType);

                        return (
                          <div
                            key={plot.id}
                            className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-between text-center min-h-[110px]"
                          >
                            {plot.seedType && seedConfig ? (
                              <>
                                <ItemSprite src={PLANT_SPRITES[plot.seedType]} fallback={seedConfig.icon} className="w-10 h-10 object-contain" alt={seedConfig.name} />
                                <span className="text-xs font-bold text-white mt-1">{seedConfig.name}</span>
                                {plot.isHarvestable ? (
                                   <button
                                    onClick={() => handleHarvestCrop(plot.id)}
                                    className="mt-2 w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-1 rounded-lg shadow animate-pulse"
                                  >
                                    Harvest (+{seedConfig.rewardStarDust} SD)
                                  </button>
                                ) : (
                                  <div className="w-full mt-2">
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-400 transition-all duration-300"
                                        style={{ width: `${Math.floor((plot.growthProgress ?? 0) * 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                                      Growing... {Math.floor((plot.growthProgress ?? 0) * 100)}%
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full py-2">
                                <ItemSprite src={PLANT_SPRITES.STAR_DAISY} className="w-8 h-8 object-contain opacity-40" alt="" />
                                <span className="text-[11px] text-slate-500 mt-1">Empty Plot</span>
                                <button
                                  onClick={() => handlePlantSeed(plot.id)}
                                  className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] px-2.5 py-0.5 rounded-lg shadow"
                                >
                                  Plant
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: VISUAL GARDEN & SURFACE LAYOUT */}
              {activeTab === 'VISUAL_GARDEN' && (
                <VisualGardenLayout
                  homePlanet={homePlanet}
                  onUpdatePlanet={handleUpdatePlanetDirectly}
                  starDustBalance={starDustBalance}
                  onOpenShop={() => setActiveTab('SHOP')}
                />
              )}

              {/* TAB 3: STORAGE VAULT */}
              {activeTab === 'STORAGE' && (
                <div className="space-y-3">
                  {(() => {
                    const currentStorage = STORAGE_UPGRADES.find((s) => s.tier === homePlanet.storageTier) || STORAGE_UPGRADES[0];
                    const nextStorage = STORAGE_UPGRADES.find((s) => s.tier === homePlanet.storageTier + 1);

                    return (
                      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ItemSprite src={STORAGE_SPRITE} fallback={currentStorage.icon} className="w-12 h-12 object-contain shrink-0" alt={currentStorage.name} />
                            <div>
                              <h3 className="font-bold text-sm text-white">{currentStorage.name}</h3>
                              <p className="text-xs text-slate-400">Total Material Storage Capacity: {currentStorage.capacity} units</p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-1 rounded-lg border border-sky-500/30">
                            Tier {currentStorage.tier}
                          </span>
                        </div>

                        {nextStorage ? (
                          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-300">Next Vault: {nextStorage.name} (+{nextStorage.capacity} Cap)</span>
                              <span className="text-amber-400">{nextStorage.cost.starDust} Star Dust</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-center">
                              <div className={`p-1 rounded ${homePlanet.supplies.timber >= nextStorage.cost.timber ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'}`}>
                                {homePlanet.supplies.timber}/{nextStorage.cost.timber} Timber
                              </div>
                              <div className={`p-1 rounded ${homePlanet.supplies.quartz >= nextStorage.cost.quartz ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'}`}>
                                {homePlanet.supplies.quartz}/{nextStorage.cost.quartz} Quartz
                              </div>
                              <div className={`p-1 rounded ${homePlanet.supplies.alloys >= nextStorage.cost.alloys ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'}`}>
                                {homePlanet.supplies.alloys}/{nextStorage.cost.alloys} Alloys
                              </div>
                            </div>
                            <button
                              onClick={handleUpgradeStorage}
                              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                            >
                              <ArrowUpCircle className="w-4 h-4" /> Upgrade Vault Capacity
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-sky-400 text-xs font-bold">
                            ✨ Maximum Vault Capacity Reached!
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: TOOLS WORKSHOP */}
              {activeTab === 'WORKSHOP' && (
                <div className="space-y-2.5">
                  {CRAFTABLE_HOME_TOOLS.map((tool) => {
                    const existingTool = homePlanet.craftedTools.find((t) => t.id === tool.id);
                    const currentLevel = existingTool ? existingTool.level : 0;
                    const canAfford =
                      homePlanet.supplies.timber >= tool.cost.timber &&
                      homePlanet.supplies.quartz >= tool.cost.quartz &&
                      homePlanet.supplies.alloys >= tool.cost.alloys &&
                      starDustBalance >= tool.cost.starDust;

                    return (
                      <div
                        key={tool.id}
                        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ItemSprite src={TOOL_SPRITES[tool.id]} fallback={tool.icon} className="w-12 h-12 object-contain shrink-0" alt={tool.name} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-white truncate">{tool.name}</h4>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                                {currentLevel > 0 ? `Lvl ${currentLevel}` : 'Not Crafted'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{tool.description}</p>
                            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                              ✨ {tool.perkDescription}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <button
                            onClick={() => handleCraftTool(tool.id)}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                              canAfford
                                ? 'bg-purple-500 hover:bg-purple-400 text-slate-950 shadow'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>{currentLevel > 0 ? 'Upgrade' : 'Craft'} ({tool.cost.starDust} SD)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 5: STAR DUST DECOR SHOP */}
              {activeTab === 'SHOP' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {HOME_FURNITURE_CATALOG.map((item) => {
                    const isPlaced = (homePlanet.placedFurniture || []).some((f) => f.itemId === item.id);
                    const canBuy = starDustBalance >= item.costStarDust;

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-start gap-2.5">
                          <ItemSprite src={FURNITURE_SPRITES[item.id]} fallback={item.icon} className="w-12 h-12 object-contain shrink-0" alt={item.name} />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-white block truncate">{item.name}</span>
                            <span className="text-[10px] text-slate-400 block line-clamp-2">{item.description}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                          <span className="font-mono font-bold text-amber-300">{item.costStarDust} Star Dust</span>
                          <button
                            onClick={() => handleBuyFurniture(item.id)}
                            disabled={!canBuy}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                              canBuy
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>{isPlaced ? 'Buy Another' : 'Place Item'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 6: SPACE TRAVELER TRADING POST */}
              {activeTab === 'TRAVELER' && (
                <div className="space-y-3">
                  {homePlanet.spaceTraveler ? (
                    <>
                      {/* Traveler Character Header Card */}
                      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-pink-950/60 border border-purple-500/40 rounded-2xl p-3.5 relative overflow-hidden shadow-lg">
                        <div className="flex items-start justify-between gap-3 relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-2xl bg-purple-900/80 border-2 border-purple-400 flex items-center justify-center text-2xl shadow-md">
                                {homePlanet.spaceTraveler.avatarIcon}
                              </div>
                              <span className="absolute -bottom-1 -right-1 text-sm bg-slate-950 border border-purple-500/50 rounded-full px-1">
                                {homePlanet.spaceTraveler.shipIcon}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-white">
                                  {homePlanet.spaceTraveler.travelerName}
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  {homePlanet.spaceTraveler.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                <Clock className="w-3 h-3 text-pink-400" />
                                <span>
                                  Departs in{' '}
                                  {Math.max(
                                    0,
                                    Math.floor(
                                      (homePlanet.spaceTraveler.departureTimestamp - Date.now()) /
                                        60000
                                    )
                                  )}{' '}
                                  mins
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={handleSummonSpaceTraveler}
                            className="text-xs bg-purple-900/50 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40 px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 shrink-0"
                            title="Signal Subspace Beacon to invite another traveler"
                          >
                            <Radio className="w-3 h-3" />
                            <span>Summon Beacon</span>
                          </button>
                        </div>

                        {/* Dialogue Speech Bubble */}
                        <div className="mt-3 bg-slate-950/70 border border-purple-500/20 rounded-xl p-2.5 text-xs text-purple-200/90 italic flex items-start gap-2">
                          <span className="text-base not-italic">💬</span>
                          <span>"{homePlanet.spaceTraveler.dialogue}"</span>
                        </div>
                      </div>

                      {/* Trade Offers List */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                          <span>Exclusive Relics & Furnishings</span>
                          <span>Exchange Collected Raw Resources</span>
                        </div>

                        {homePlanet.spaceTraveler.offers.map((offer) => {
                          const reqTimber = offer.cost.timber || 0;
                          const reqQuartz = offer.cost.quartz || 0;
                          const reqAlloys = offer.cost.alloys || 0;
                          const reqPlasma = offer.cost.plasmaCells || 0;
                          const reqStarDust = offer.cost.starDust || 0;
                          const reqStars = offer.cost.stars || 0;
                          const reqDiamonds = offer.cost.diamonds || 0;

                          const hasTimber = homePlanet.supplies.timber >= reqTimber;
                          const hasQuartz = homePlanet.supplies.quartz >= reqQuartz;
                          const hasAlloys = homePlanet.supplies.alloys >= reqAlloys;
                          const hasPlasma = homePlanet.supplies.plasmaCells >= reqPlasma;
                          const hasStarDust = starDustBalance >= reqStarDust;
                          const hasStars = (savedData.totalStars || 0) >= reqStars;
                          const hasDiamonds = ((savedData.spaceDiamonds ?? savedData.totalDiamonds ?? 0)) >= reqDiamonds;

                          const canTrade =
                            !offer.traded &&
                            hasTimber &&
                            hasQuartz &&
                            hasAlloys &&
                            hasPlasma &&
                            hasStarDust &&
                            hasStars &&
                            hasDiamonds;

                          return (
                            <div
                              key={offer.id}
                              className={`bg-slate-900/90 border rounded-2xl p-3.5 flex flex-col gap-2.5 transition ${
                                offer.traded
                                  ? 'border-emerald-500/40 bg-emerald-950/10'
                                  : 'border-slate-800 hover:border-purple-500/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden bg-slate-950/60 border border-slate-700">
                                    <ItemSprite
                                      src={FURNITURE_SPRITES[offer.itemId]}
                                      fallback={offer.icon}
                                      className="w-11 h-11 object-contain"
                                      alt={offer.name}
                                    />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-xs text-white">
                                        {offer.name}
                                      </h4>
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                          offer.rarity === 'MYTHIC'
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                            : offer.rarity === 'EXOTIC'
                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                        }`}
                                      >
                                        {offer.rarity}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      {offer.description}
                                    </p>
                                  </div>
                                </div>

                                {offer.traded ? (
                                  <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-xs font-bold shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Acquired</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleTradeWithTraveler(offer.id)}
                                    disabled={!canTrade}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                      canTrade
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                  >
                                    <Gift className="w-3.5 h-3.5" />
                                    <span>Trade</span>
                                  </button>
                                )}
                              </div>

                              {/* Resource Cost Badges */}
                              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono">
                                {reqTimber > 0 && (
                                  <span
                                    className={`px-2 py-0.5 rounded-lg border ${
                                      hasTimber
                                        ? 'bg-amber-950/30 text-amber-300 border-amber-500/30'
                                        : 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                                    }`}
                                  >
                                    🪵 {homePlanet.supplies.timber}/{reqTimber} Timber
                                  </span>
                                )}
                                {reqQuartz > 0 && (
                                  <span
                                    className={`px-2 py-0.5 rounded-lg border ${
                                      hasQuartz
                                        ? 'bg-purple-950/30 text-purple-300 border-purple-500/30'
                                        : 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                                    }`}
                                  >
                                    💎 {homePlanet.supplies.quartz}/{reqQuartz} Quartz
                                  </span>
                                )}
                                {reqAlloys > 0 && (
                                  <span
                                    className={`px-2 py-0.5 rounded-lg border ${
                                      hasAlloys
                                        ? 'bg-cyan-950/30 text-cyan-300 border-cyan-500/30'
                                        : 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                                    }`}
                                  >
                                    ⚙️ {homePlanet.supplies.alloys}/{reqAlloys} Alloys
                                  </span>
                                )}
                                {reqPlasma > 0 && (
                                  <span
                                    className={`px-2 py-0.5 rounded-lg border ${
                                      hasPlasma
                                        ? 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                                        : 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                                    }`}
                                  >
                                    ⚡ {homePlanet.supplies.plasmaCells}/{reqPlasma} Plasma
                                  </span>
                                )}
                                {reqStarDust > 0 && (
                                  <span
                                    className={`px-2 py-0.5 rounded-lg border ${
                                      hasStarDust
                                        ? 'bg-yellow-950/30 text-yellow-300 border-yellow-500/30'
                                        : 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                                    }`}
                                  >
                                    ✨ {starDustBalance}/{reqStarDust} Star Dust
                                  </span>
                                )}
                                {reqStars > 0 && (
                                  <span
                                    className={`px-2 py-0.5 rounded-lg border ${
                                      hasStars
                                        ? 'bg-amber-950/30 text-amber-300 border-amber-500/30'
                                        : 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                                    }`}
                                  >
                                    ⭐ {savedData.totalStars || 0}/{reqStars} Stars
                                  </span>
                                )}
                                {reqDiamonds > 0 && (
                                  <span
                                    className={`px-2 py-0.5 rounded-lg border ${
                                      hasDiamonds
                                        ? 'bg-sky-950/30 text-sky-300 border-sky-500/30'
                                        : 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                                    }`}
                                  >
                                    💠 {(savedData.spaceDiamonds ?? savedData.totalDiamonds ?? 0)}/{reqDiamonds} Diamonds
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <Radio className="w-8 h-8 text-purple-400 mx-auto animate-pulse" />
                      <p className="text-sm text-slate-300 font-bold">No Space Traveler docked currently</p>
                      <button
                        onClick={handleSummonSpaceTraveler}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                      >
                        Transmit Subspace Beacon
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

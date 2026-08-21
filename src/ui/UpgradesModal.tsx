import React, { useState } from 'react';
import {
  X,
  Star,
  Zap,
  Sparkles,
  ArrowUp,
  Rocket,
  Footprints,
  ShieldCheck,
  Shield,
  Award,
  Flame,
  Magnet,
  Compass,
  Cpu,
  Layers,
  Sparkle,
  CheckCircle2,
  Lock,
  RotateCcw,
  Clock,
  Gift,
  ChevronRight,
  Filter
} from 'lucide-react';
import { UserSavedData, SkillTreeAllocations, SkillId, GearSlot, GearItem } from '../types/game';
import {
  UPGRADE_PRICES,
  SKILL_TREES,
  RPG_GEAR_ITEMS,
  GEAR_SET_BONUSES,
  LEVEL_PROGRESSION_PERKS,
  getXPForLevel,
  calculateTotalGearStats,
  calculateSkillBonuses,
  getActiveSetBonus,
  MODULE_MAX_LEVEL
} from '../core/Config';
import { StorageManager, DEFAULT_SKILL_ALLOCATIONS } from '../core/Storage';
import { audioEngine } from '../core/AudioEngine';
import workshopHeroImg from '../assets/images/cosmic_hangar_banner_1786696559208.jpg';
import cardBgImg from '../assets/images/galaxy_cosmic_bg_1786680029303.jpg';

interface UpgradesModalProps {
  savedData: UserSavedData;
  onClose: () => void;
  onUpdateData: (newData: UserSavedData) => void;
}

type ModalTab = 'SKILLS' | 'GEAR' | 'PERKS' | 'MODULES';

interface UpgradeDetail {
  id: 'MAGNET' | 'COMET' | 'MULTIPLIER' | 'JETPACK' | 'RICOCHET' | 'REWIND';
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  themeColor: string;
  statLabel: string;
  statValues: string[];
}

const UPGRADE_DETAILS: UpgradeDetail[] = [
  {
    id: 'REWIND',
    title: 'Chrono Time-Warp',
    subtitle: 'Temporal Rewind',
    description: 'Rewinds celestial physics and time on hazard collision or manual trigger, restoring safe orbit.',
    icon: <Clock className="w-5 h-5 text-amber-400" />,
    themeColor: '#fbbf24',
    statLabel: 'Rewind Charges',
    statValues: [
      '1 Charge · 350px Void Blast',
      '2 Charges · 450px Void Blast',
      '3 Charges · 550px Void Blast',
      '4 Charges · 650px Void Blast',
      '5 Charges · Supernova Blast',
      '6 Charges · Chrono Cascade',
      '7 Charges · Twin Timeline',
      '8 Charges · Eternal Loop',
      '9 Charges · Paradox Guard',
      '10 Charges · Time Lord'
    ]
  },
  {
    id: 'MAGNET',
    title: 'Cosmic Magnet Core',
    subtitle: 'Gravitational Tractor',
    description: 'Generates an electromagnetic tractor field drawing nearby stars, diamonds, and power-up orbs.',
    icon: <Magnet className="w-5 h-5 text-sky-400" />,
    themeColor: '#38bdf8',
    statLabel: 'Tractor Pull Radius',
    statValues: ['160px (Base)', '200px (+25%)', '240px (+50%)', '280px (+75%)', '320px (Hyper-Pull)', '360px', '400px', '450px', '510px', '580px (Event Horizon)']
  },
  {
    id: 'COMET',
    title: 'Hyper Comet Drive',
    subtitle: 'Starlight Warp Boost',
    description: 'Blasts through deep space with blazing velocity, granting invulnerability and knocking void back.',
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    themeColor: '#f59e0b',
    statLabel: 'Comet Duration',
    statValues: ['4.5s · 450px Push', '5.7s · 600px Push', '6.9s · 750px Push', '8.1s · 900px Push', '9.5s · Supernova Push', '10.7s', '12.0s', '13.4s', '15.0s', '17s · Quasar Drive']
  },
  {
    id: 'JETPACK',
    title: 'Emergency Jetpack',
    subtitle: 'Abyss Thruster Rescue',
    description: 'Fires an automated emergency vertical thruster when descending dangerously close to the void.',
    icon: <Rocket className="w-5 h-5 text-rose-400" />,
    themeColor: '#f43f5e',
    statLabel: 'Rescue Charges',
    statValues: ['1 Rescue Save', '2 Rescue Saves', '3 Rescue Saves', '4 Rescue Saves', '5 Rescue Saves', '6 Saves', '7 Saves', '8 Saves', '9 Saves', '10 Saves (Max)']
  },
  {
    id: 'RICOCHET',
    title: 'Kinetic Ricochet Boots',
    subtitle: 'Orbital Springboard',
    description: 'Tap while airborne near planet surfaces to bounce at high speed with zero kinetic energy loss.',
    icon: <Footprints className="w-5 h-5 text-purple-400" />,
    themeColor: '#a855f7',
    statLabel: 'Kinetic Lift',
    statValues: ['+55% Lift', '+70% Lift (+100 Score)', '+85% Lift (+200 Score)', '+100% Lift (+300 Score)', '+120% Orbital Slingshot', '+135% Lift', '+150% Lift', '+170% Lift', '+190% Lift', '+220% Super Bounce']
  },
  {
    id: 'MULTIPLIER',
    title: 'Prism Score Multiplier',
    subtitle: 'Celestial Amplifier',
    description: 'Amplifies all score yield gathered from stars, diamonds, high leaps, and orbit completions.',
    icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
    themeColor: '#34d399',
    statLabel: 'Score Multiplier',
    statValues: ['1.0x (Standard)', '1.2x (+20% Bonus)', '1.4x (+40% Bonus)', '1.6x (+60% Bonus)', '2.0x (Double Yield)', '2.2x', '2.5x', '2.8x', '3.2x', '3.8x (Prism Overdrive)']
  }
];

export const UpgradesModal: React.FC<UpgradesModalProps> = ({ savedData, onClose, onUpdateData }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('GEAR');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('MOBILITY');
  const [gearSlotFilter, setGearSlotFilter] = useState<GearSlot | 'ALL'>('HELMET');
  const [celebratingUpgrade, setCelebratingUpgrade] = useState<string | null>(null);

  const playerLevel = savedData.playerLevel || 1;
  const playerXP = savedData.playerXP || 0;
  const xpNeeded = getXPForLevel(playerLevel);
  const skillPoints = savedData.skillPointsAvailable || 0;
  const allocations = savedData.skillTreeAllocations || ({} as SkillTreeAllocations);
  const equippedGear = savedData.equippedGear || { helmetId: null, suitId: null, thrusterId: null, accessoryId: null, relicId: null };
  const unlockedGearIds = savedData.unlockedGearIds || ['HELM_SCOUT', 'SUIT_TRAINEE', 'THRUST_SPARK', 'ACC_CHRONO_CLOCK', 'RELIC_STAR_COMPASS'];

  const totalGearStats = calculateTotalGearStats(equippedGear);
  const skillBonuses = calculateSkillBonuses(allocations);
  const activeSynergy = getActiveSetBonus(equippedGear);

  // Upgrade Power-Up Module
  const handleUpgradeModule = (type: 'MAGNET' | 'COMET' | 'MULTIPLIER' | 'JETPACK' | 'RICOCHET' | 'REWIND') => {
    const levelKey =
      type === 'MAGNET'
        ? 'magnetLevel'
        : type === 'COMET'
        ? 'cometLevel'
        : type === 'MULTIPLIER'
        ? 'multiplierLevel'
        : type === 'JETPACK'
        ? 'jetpackLevel'
        : type === 'REWIND'
        ? 'rewindLevel'
        : 'ricochetLevel';

    const currentLvl = savedData.upgrades[levelKey] || 1;
    if (currentLvl >= MODULE_MAX_LEVEL) return;

    const price = UPGRADE_PRICES[type][currentLvl - 1];
    if (savedData.totalStars >= price) {
      audioEngine.playPowerUpCollect();
      setCelebratingUpgrade(type);
      setTimeout(() => setCelebratingUpgrade(null), 1200);

      const updatedStars = savedData.totalStars - price;
      const updatedUpgrades = {
        ...savedData.upgrades,
        [levelKey]: currentLvl + 1
      };
      const newSaved = StorageManager.saveData({
        totalStars: updatedStars,
        upgrades: updatedUpgrades
      });
      onUpdateData(newSaved);
    }
  };

  // Spend Skill Point
  const handleSpendSkillPoint = (nodeId: SkillId, maxRank: number, reqLevel: number) => {
    if (skillPoints <= 0 || playerLevel < reqLevel) return;
    const currentRank = (allocations[nodeId] as number) || 0;
    if (currentRank >= maxRank) return;

    audioEngine.playClick();
    const updatedAllocations: SkillTreeAllocations = {
      ...allocations,
      [nodeId]: currentRank + 1
    };

    const newSaved = StorageManager.saveData({
      skillPointsAvailable: skillPoints - 1,
      skillTreeAllocations: updatedAllocations
    });
    onUpdateData(newSaved);
  };

  // Reset / Respec Skills
  const handleRespecSkills = () => {
    let totalInvested = 0;
    Object.values(allocations).forEach((v) => {
      totalInvested += (Number(v) || 0);
    });

    if (totalInvested === 0) return;

    audioEngine.playClick();
    const resetAllocations: SkillTreeAllocations = { ...DEFAULT_SKILL_ALLOCATIONS };

    const newSaved = StorageManager.saveData({
      skillPointsAvailable: (savedData.skillPointsAvailable || 0) + totalInvested,
      skillTreeAllocations: resetAllocations
    });
    onUpdateData(newSaved);
  };

  // Unlock Gear Item
  const handleUnlockGear = (gearId: string, starPrice: number, diamondPrice: number, reqLevel: number) => {
    if (playerLevel < reqLevel) return;
    if (savedData.totalStars < starPrice || savedData.totalDiamonds < diamondPrice) return;

    audioEngine.playPowerUpCollect();
    const updatedUnlocked = [...unlockedGearIds, gearId];
    const newSaved = StorageManager.saveData({
      totalStars: savedData.totalStars - starPrice,
      totalDiamonds: savedData.totalDiamonds - diamondPrice,
      unlockedGearIds: updatedUnlocked
    });
    onUpdateData(newSaved);
  };

  // Equip / Unequip Gear Item
  const handleEquipGear = (gear: GearItem) => {
    if (!unlockedGearIds.includes(gear.id)) return;
    audioEngine.playClick();

    const slotKey =
      gear.slot === 'HELMET'
        ? 'helmetId'
        : gear.slot === 'SUIT'
        ? 'suitId'
        : gear.slot === 'THRUSTER'
        ? 'thrusterId'
        : gear.slot === 'ACCESSORY'
        ? 'accessoryId'
        : 'relicId';

    // If already equipped, toggle/unequip or replace
    const currentEquippedId = equippedGear[slotKey];
    const newEquipped = {
      ...equippedGear,
      [slotKey]: currentEquippedId === gear.id ? null : gear.id
    };

    const newSaved = StorageManager.saveData({
      equippedGear: newEquipped
    });
    onUpdateData(newSaved);
  };

  const activeBranch = SKILL_TREES.find((b) => b.id === selectedBranchId) || SKILL_TREES[0];

  const filteredGear = RPG_GEAR_ITEMS.filter((g) => {
    if (gearSlotFilter === 'ALL') return true;
    return g.slot === gearSlotFilter;
  });

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none text-white ui-interactive animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-md mb-3 shrink-0 h-24 sm:h-28 group">
          <img
            src={workshopHeroImg}
            alt="Cosmic Gear Workshop"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-60"
          />
          <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
            <div className="bg-indigo-950/80 border border-indigo-500/30 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold text-indigo-300 flex items-center gap-1.5 backdrop-blur-sm shadow-sm">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>{skillPoints} Pts</span>
            </div>
            <div className="bg-amber-950/80 border border-amber-500/30 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold text-amber-300 flex items-center gap-1.5 backdrop-blur-sm shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{savedData.totalStars.toLocaleString()}</span>
            </div>
            <div className="bg-sky-950/80 border border-sky-500/30 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold text-sky-300 flex items-center gap-1.5 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{savedData.totalDiamonds}</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-end justify-between p-3.5 pointer-events-none">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-sm">
                <Cpu className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-md">
                  Upgrades
                </h2>
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 border border-slate-700/80 shadow btn-grow-sm glow-subtle-hover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Level & XP Ribbon */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800/90 p-3 mb-3 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center font-black shadow border border-indigo-300/40 shrink-0">
              <span className="text-[8px] uppercase tracking-wider text-indigo-200">LVL</span>
              <span className="text-xs leading-none text-white">{playerLevel}</span>
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center w-full">
                <span className="text-sky-300 text-sm font-bold">Starlight Astronaut</span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {playerXP.toLocaleString()} / {xpNeeded.toLocaleString()} XP
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-1">
                <div
                  className="bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (playerXP / xpNeeded) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-3 gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('MODULES')}
            className={`flex-1 min-w-[120px] py-2 px-2.5 text-xs font-bold rounded-t-xl transition-all duration-200 flex items-center justify-center gap-1.5 border-b-2 btn-grow-sm ${
              activeTab === 'MODULES'
                ? 'bg-slate-800/90 text-amber-300 border-amber-400 shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Power-Up Modules</span>
          </button>

          <button
            onClick={() => setActiveTab('GEAR')}
            className={`flex-1 min-w-[120px] py-2 px-2.5 text-xs font-bold rounded-t-xl transition-all duration-200 flex items-center justify-center gap-1.5 border-b-2 btn-grow-sm ${
              activeTab === 'GEAR'
                ? 'bg-slate-800/90 text-sky-300 border-sky-400 shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850/40'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Gear & Sets</span>
          </button>

          <button
            onClick={() => setActiveTab('SKILLS')}
            className={`flex-1 min-w-[120px] py-2 px-2.5 text-xs font-bold rounded-t-xl transition-all duration-200 flex items-center justify-center gap-1.5 border-b-2 btn-grow-sm ${
              activeTab === 'SKILLS'
                ? 'bg-slate-800/90 text-emerald-300 border-emerald-400 shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Ability Trees</span>
          </button>

          <button
            onClick={() => setActiveTab('PERKS')}
            className={`flex-1 min-w-[120px] py-2 px-2.5 text-xs font-bold rounded-t-xl transition-all duration-200 flex items-center justify-center gap-1.5 border-b-2 btn-grow-sm ${
              activeTab === 'PERKS'
                ? 'bg-slate-800/90 text-indigo-300 border-indigo-400 shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850/40'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Level Rewards</span>
          </button>
        </div>

        {/* TAB 1: COSMIC GEAR & SYNERGIES */}
        {activeTab === 'GEAR' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {/* Active Synergy & Total Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Set Synergy Card */}
              <div className="md:col-span-1 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Active Synergy
                    </span>
                    {activeSynergy && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                        {activeSynergy.requiredCount}+ Pieces
                      </span>
                    )}
                  </div>
                  {activeSynergy ? (
                    <div>
                      <h4 className="text-xs font-bold text-white">{activeSynergy.name}</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{activeSynergy.buffDescription}</p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 py-1">
                      Equip 2 or 3 pieces from <strong className="text-amber-300">Chrono Weaver</strong>,{' '}
                      <strong className="text-sky-300">Solar Phoenix</strong>, or{' '}
                      <strong className="text-purple-300">Prismatic Voyager</strong> sets.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 mt-2 text-[10px] text-slate-400 flex justify-between">
                  <span>Equipped Slots:</span>
                  <span className="font-semibold text-sky-300">
                    {Object.entries(equippedGear).filter(([_, id]) => Boolean(id)).length} / 5
                  </span>
                </div>
              </div>

              {/* Total Stats Summary Card */}
              <div className="md:col-span-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                <h4 className="font-semibold text-slate-300 text-xs mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" /> Total Gear Stats & Resistances
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                  <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Slingshot</span>
                    <span className="font-bold text-amber-300">+{totalGearStats.slingshotBonusPercent}%</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Freeze Resist</span>
                    <span className="font-bold text-sky-300">+{totalGearStats.freezeResistancePercent}%</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Curse Resist</span>
                    <span className="font-bold text-purple-300">+{totalGearStats.darkCurseResistancePercent}%</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">XP Bonus</span>
                    <span className="font-bold text-emerald-300">+{totalGearStats.xpBonusPercent}%</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Rewinds</span>
                    <span className="font-bold text-amber-400">+{totalGearStats.extraRewindCharges}</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Tractor Beam</span>
                    <span className="font-bold text-sky-300">+{totalGearStats.tractorBeamBonusRadius}px</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Void Push</span>
                    <span className="font-bold text-rose-300">+{totalGearStats.voidPushbackBonus}px</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Star Magnet</span>
                    <span className="font-bold text-yellow-300">+{totalGearStats.starAttractBonusPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gear Slot Filter Ribbon */}
            <div className="flex items-center gap-1.5 pb-1">
              {(['HELMET', 'SUIT', 'THRUSTER', 'ACCESSORY', 'RELIC'] as const).map((slot) => (
                <button
                  key={slot}
                  onClick={() => setGearSlotFilter(slot)}
                  className={`flex-1 min-w-0 px-2 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition whitespace-nowrap truncate text-center ${
                    gearSlotFilter === slot
                      ? 'bg-amber-400 text-slate-950 font-black shadow'
                      : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {slot === 'ACCESSORY' ? 'Accessory' : slot === 'HELMET' ? 'Helmet' : slot === 'SUIT' ? 'Suit' : slot === 'THRUSTER' ? 'Thruster' : 'Relic'}
                </button>
              ))}
            </div>

            {/* Gear Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredGear.map((gear) => {
                const isUnlocked = unlockedGearIds.includes(gear.id);
                const isEquipped =
                  equippedGear.helmetId === gear.id ||
                  equippedGear.suitId === gear.id ||
                  equippedGear.thrusterId === gear.id ||
                  equippedGear.accessoryId === gear.id ||
                  equippedGear.relicId === gear.id;

                const isLevelLocked = playerLevel < gear.requiredPlayerLevel;
                const canAfford =
                  savedData.totalStars >= gear.priceStars && savedData.totalDiamonds >= gear.priceDiamonds;

                return (
                  <div
                    key={gear.id}
                    className={`relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 overflow-hidden ${
                      isEquipped
                        ? 'bg-slate-900/95 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                        : isUnlocked
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        : isLevelLocked
                        ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                        : 'bg-slate-900/60 border-slate-800/70'
                    }`}
                  >
                    {/* Background image for items */}
                    <img 
                      src={cardBgImg} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover opacity-[0.15] mix-blend-screen pointer-events-none" 
                    />
                    <div className="relative flex items-start gap-2.5 z-10">
                      <div className="w-10 h-10 rounded-xl bg-slate-950/80 backdrop-blur border border-slate-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
                        {gear.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                            {gear.name}
                          </h4>
                        </div>
                        {/* Stats Badges */}
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {Object.entries(gear.stats).map(([k, v]) => {
                            if (!v) return null;
                            let label = `+${v}`;
                            if (k.includes('Percent')) label = `+${v}%`;
                            else if (k.includes('Radius') || k.includes('Pushback')) label = `+${v}px`;
                            return (
                              <span
                                key={k}
                                className="text-[10px] font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-sky-300"
                              >
                                {label} {k.replace('Bonus', '').replace('Percent', '').replace('Resistance', ' Res')}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="relative z-10 mt-1 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400">
                        {gear.slot} {isLevelLocked && `(Req Lvl ${gear.requiredPlayerLevel})`}
                      </span>

                      {isEquipped ? (
                        <button
                          onClick={() => handleEquipGear(gear)}
                          className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all duration-200 btn-grow glow-amber-hover flex items-center gap-1 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Equipped
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleEquipGear(gear)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold rounded-xl text-xs transition-all duration-200 btn-grow-sm shadow"
                        >
                          Equip
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleUnlockGear(gear.id, gear.priceStars, gear.priceDiamonds, gear.requiredPlayerLevel)
                          }
                          disabled={!canAfford || isLevelLocked}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                            canAfford && !isLevelLocked
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow btn-grow glow-amber-hover'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <span>Unlock</span>
                          {gear.priceStars > 0 && (
                            <span className="flex items-center gap-0.5 font-mono">
                              {gear.priceStars.toLocaleString()}
                              <Star className="w-3 h-3 fill-current text-amber-400" />
                            </span>
                          )}
                          {gear.priceDiamonds > 0 && (
                            <span className="flex items-center gap-0.5 font-mono">
                              {gear.priceDiamonds}
                              <Sparkles className="w-3 h-3 text-sky-400" />
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LEVEL PERKS ROADMAP */}
        {activeTab === 'PERKS' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-indigo-300 text-sm flex items-center gap-1.5">
                    <Gift className="w-4 h-4" /> Level Progression Milestones
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Earn XP during orbital voyages to level up and claim stars, diamonds, and skill points.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Current Rank</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">Level {playerLevel}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {LEVEL_PROGRESSION_PERKS.map((perk) => {
                const isReached = playerLevel >= perk.level;
                const isCurrent = playerLevel === perk.level;

                return (
                  <div
                    key={perk.level}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-slate-900/95 border-indigo-400 shadow-md ring-1 ring-indigo-400/40'
                        : isReached
                        ? 'bg-slate-900/80 border-slate-800'
                        : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${
                          isReached
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-wider">LVL</span>
                        <span className="text-xs leading-none">{perk.level}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{perk.title}</h4>
                          {isCurrent && (
                            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 px-1.5 py-0.2 rounded font-bold">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          +{perk.rewardSkillPoints} Skill Point{perk.rewardSkillPoints > 1 ? 's' : ''}
                          {perk.rewardStars > 0 && ` • +${perk.rewardStars} Stars`}
                          {perk.rewardDiamonds > 0 && ` • +${perk.rewardDiamonds} Diamonds`}
                          {perk.unlockedGearTitle && ` • 🎁 ${perk.unlockedGearTitle}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isReached ? (
                        <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SKILL TREES */}
        {activeTab === 'SKILLS' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {/* Branch Selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {SKILL_TREES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranchId(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap btn-grow-sm ${
                    selectedBranchId === b.id
                      ? 'bg-slate-800 border border-slate-600 text-white shadow'
                      : 'bg-slate-950/60 text-slate-400 border border-transparent hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                </button>
              ))}
            </div>

            {/* Branch Description */}
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
              <span className="font-bold text-amber-300">{activeBranch.name}: </span>
              <span>{activeBranch.description}</span>
            </div>

            {/* Nodes in Selected Branch */}
            <div className="space-y-2.5">
              {activeBranch.nodes.map((node) => {
                const currentRank = allocations[node.id] || 0;
                const isMax = currentRank >= node.maxRank;
                const isLevelLocked = playerLevel < node.requiredPlayerLevel;
                const canUpgrade = !isMax && !isLevelLocked && skillPoints > 0;

                return (
                  <div
                    key={node.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isLevelLocked
                        ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                        : isMax
                        ? 'bg-slate-900/80 border-slate-800'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg shrink-0">
                          {node.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{node.name}</h4>
                            {isLevelLocked && (
                              <span className="text-[10px] bg-rose-950/70 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Reqs Lvl {node.requiredPlayerLevel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">{node.description}</p>
                          <p className="text-[11px] text-amber-300/90 font-medium mt-1">
                            {currentRank > 0 ? (
                              <span>Current: {typeof node.perkSummary === 'function' ? node.perkSummary(currentRank) : node.perkSummary}</span>
                            ) : (
                              <span>Rank 1: {typeof node.perkSummary === 'function' ? node.perkSummary(1) : node.perkSummary}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Rank / Upgrade button */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-300">
                          {currentRank} / {node.maxRank}
                        </div>
                        {!isMax ? (
                          <button
                            onClick={() => handleSpendSkillPoint(node.id, node.maxRank, node.requiredPlayerLevel)}
                            disabled={!canUpgrade}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                              canUpgrade
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md btn-grow glow-amber-hover'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Zap className="w-3 h-3" />
                            <span>Upgrade</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> MAX
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Respec Button */}
            <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-end">
              <button
                onClick={handleRespecSkills}
                className="px-3 py-2 bg-slate-800/60 hover:bg-slate-800 text-[11px] font-semibold text-rose-300 rounded-xl border border-rose-500/30 flex items-center gap-1.5 transition-all duration-200 shrink-0 btn-grow-sm glow-subtle-hover shadow-sm"
                title="Reset all invested skill points"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Respec Skills</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: POWER-UP MODULES */}
        {activeTab === 'MODULES' && (
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {UPGRADE_DETAILS.map((detail) => {
                const levelKey =
                  detail.id === 'MAGNET'
                    ? 'magnetLevel'
                    : detail.id === 'COMET'
                    ? 'cometLevel'
                    : detail.id === 'MULTIPLIER'
                    ? 'multiplierLevel'
                    : detail.id === 'JETPACK'
                    ? 'jetpackLevel'
                    : detail.id === 'REWIND'
                    ? 'rewindLevel'
                    : 'ricochetLevel';

                const currentLevel = savedData.upgrades[levelKey] || 1;
                const isMaxed = currentLevel >= MODULE_MAX_LEVEL;
                const price = !isMaxed ? UPGRADE_PRICES[detail.id][currentLevel - 1] : null;
                const canAfford = price !== null && savedData.totalStars >= price;
                const isCelebrating = celebratingUpgrade === detail.id;
                const nextStat = !isMaxed ? detail.statValues[currentLevel] : null;

                return (
                  <div
                    key={detail.id}
                    className={`relative rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between gap-3 overflow-hidden ${
                      isCelebrating
                        ? 'bg-amber-950/30 border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.01]'
                        : isMaxed
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700/80 shadow-md'
                        : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700/90 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {/* Atmospheric glow corner */}
                    <div
                      className="absolute -right-10 -top-10 w-28 h-28 rounded-full opacity-10 blur-xl pointer-events-none"
                      style={{ background: detail.themeColor }}
                    />

                    {/* Top row: Icon + Title + Level Tag */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-center shrink-0 shadow-inner">
                          {detail.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-100 truncate tracking-tight">{detail.title}</h3>
                          <span className="text-[11px] font-medium text-slate-400 block tracking-wide truncate">
                            {detail.subtitle}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shrink-0 border ${
                          isMaxed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm'
                            : 'bg-slate-950 text-sky-300 border-slate-800'
                        }`}
                      >
                        {isMaxed ? 'MAX' : `LVL ${currentLevel}/5`}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300/90 leading-relaxed">{detail.description}</p>

                    {/* Current Stat Capsule & Segmented Level Track */}
                    <div className="space-y-2 pt-0.5">
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium text-[11px]">{detail.statLabel}</span>
                        <span className="font-bold text-slate-100 font-mono text-[11px]">
                          {detail.statValues[currentLevel - 1]}
                        </span>
                      </div>

                      {/* 5-Pip Smooth Segment Indicator */}
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((lvl) => {
                          const isActive = lvl <= currentLevel;
                          return (
                            <div
                              key={lvl}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                isActive ? 'shadow-sm' : 'bg-slate-950 border border-slate-800'
                              }`}
                              style={{
                                background: isActive ? detail.themeColor : undefined,
                                boxShadow: isActive ? `0 0 6px ${detail.themeColor}80` : undefined
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between gap-2">
                      {!isMaxed && nextStat ? (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 min-w-0">
                          <span className="text-slate-500 shrink-0">Next:</span>
                          <span className="text-slate-300 font-medium truncate">{nextStat}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Max Level Reached</span>
                        </div>
                      )}

                      {!isMaxed && price !== null ? (
                        <button
                          onClick={() => handleUpgradeModule(detail.id)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
                            canAfford
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md btn-grow glow-amber-hover'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                          }`}
                        >
                          <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                          <span>Upgrade</span>
                          <span className="flex items-center gap-0.5 font-mono">
                            {price.toLocaleString()}
                            <Star className="w-3 h-3 fill-current" />
                          </span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 shrink-0">
                          <Sparkles className="w-3 h-3" /> Mastered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

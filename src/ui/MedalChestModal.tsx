import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  X, 
  Shield, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  Info,
  Layers,
  Star
} from 'lucide-react';
import { MilitaryMedal, UserSavedData } from '../types/game';
import { SECTOR_MILITARY_MEDALS, calculateTotalMedalBonuses } from '../core/Config';

interface MedalChestModalProps {
  savedData: UserSavedData;
  onClose: () => void;
}

export const MedalChestModal: React.FC<MedalChestModalProps> = ({
  savedData,
  onClose
}) => {
  const [selectedMedal, setSelectedMedal] = useState<MilitaryMedal>(SECTOR_MILITARY_MEDALS[0]);
  const unlockedIds = savedData.unlockedMedalIds || [];
  const activeBonuses = calculateTotalMedalBonuses(unlockedIds);

  const renderRibbonBar = (ribbonColors: string[], isUnlocked: boolean) => {
    return (
      <div className={`w-20 h-5.5 rounded border transition-all flex overflow-hidden ${
        isUnlocked 
          ? 'border-amber-400/80 shadow-sm shadow-amber-500/30' 
          : 'border-slate-700 opacity-30 grayscale'
      }`}>
        {ribbonColors.map((c, i) => (
          <div key={i} className="h-full flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>
    );
  };

  return (
    <div id="medal-chest-modal-root" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-5 md:p-7 text-white z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-600 to-yellow-500 rounded-xl shadow-lg shadow-amber-500/20">
              <Award className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
                Starfleet Military Uniform Rack
                <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 font-bold">
                  {unlockedIds.length} / {SECTOR_MILITARY_MEDALS.length} Conferred
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official flight chest commendations & permanent passive operational perks.
              </p>
            </div>
          </div>
          <button
            id="btn-close-medal-chest"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cumulative Uniform Buffs Bar */}
        <div className="my-4 p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-sky-950/40 border border-amber-500/30 rounded-xl">
          <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Active Cumulative Flight Chest Perks:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block font-semibold">Jetpack Charges</span>
              <strong className="text-amber-300 font-black">+{activeBonuses.jetpackChargesBonus} Boost</strong>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block font-semibold">Magnet Pull</span>
              <strong className="text-sky-300 font-black">+{activeBonuses.magnetRadiusBonus}px Radius</strong>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block font-semibold">Slingshot Impulse</span>
              <strong className="text-emerald-300 font-black">+{Math.round(activeBonuses.slingshotBoostBonus * 100)}% Power</strong>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-[10px] block font-semibold">Thermal Shield</span>
              <strong className={activeBonuses.hasThermalShield ? "text-amber-300 font-black" : "text-slate-500"}>
                {activeBonuses.hasThermalShield ? 'ACTIVE DEFENSE' : 'LOCKED (S8)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Content: Uniform Flight Jacket Chest Showcase & Medal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
          {/* Left Column: Uniform Ribbon Rack & Medallions on Chest */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Flight Jacket Left Chest Rack</span>
              <span className="text-slate-500 font-mono text-[10px]">MIL-SPEC RACK</span>
            </div>

            {/* Authentic 4x2 Military Ribbon Rack Bar */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-inner mb-4">
              <div className="grid grid-cols-4 gap-2 justify-items-center">
                {SECTOR_MILITARY_MEDALS.map((medal) => {
                  const isUnlocked = unlockedIds.includes(medal.id);
                  const isSelected = selectedMedal.id === medal.id;

                  return (
                    <button
                      key={medal.id}
                      id={`btn-ribbon-${medal.id}`}
                      onClick={() => setSelectedMedal(medal)}
                      className={`group relative p-1 rounded-md transition-all ${
                        isSelected ? 'ring-2 ring-amber-400 bg-slate-800' : 'hover:bg-slate-800/60'
                      }`}
                      title={medal.name}
                    >
                      {renderRibbonBar(medal.ribbonColors, isUnlocked)}
                      {isSelected && (
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mx-auto mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medallions Grid Display */}
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Sector Commendation Medallions
            </div>
            <div className="grid grid-cols-4 gap-2 flex-1">
              {SECTOR_MILITARY_MEDALS.map((medal) => {
                const isUnlocked = unlockedIds.includes(medal.id);
                const isSelected = selectedMedal.id === medal.id;

                return (
                  <button
                    key={`medallion-${medal.id}`}
                    id={`btn-medal-card-${medal.id}`}
                    onClick={() => setSelectedMedal(medal)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10'
                        : isUnlocked
                        ? 'border-slate-700 bg-slate-900 hover:border-slate-600'
                        : 'border-slate-800/80 bg-slate-950/40 opacity-40 hover:opacity-70'
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {isUnlocked ? medal.icon : '🔒'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 truncate w-full">
                      S{medal.levelNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Medal Citation & Perk Inspector */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between">
            {selectedMedal ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-400/40 flex items-center justify-center text-2xl shadow-md shadow-amber-500/10">
                      {selectedMedal.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Sector {selectedMedal.levelNumber} Commendation
                      </span>
                      <h3 className="text-base font-black text-white">
                        {selectedMedal.name}
                      </h3>
                    </div>
                  </div>
                  {unlockedIds.includes(selectedMedal.id) ? (
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-full border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      AWARDED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-700 text-slate-400 text-[10px] font-black rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Ribbon Illustration */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Service Ribbon:</span>
                  {renderRibbonBar(selectedMedal.ribbonColors, unlockedIds.includes(selectedMedal.id))}
                </div>

                {/* Description & Lore */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Official Citation & Mission Record:
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {selectedMedal.description || selectedMedal.rankCitation}
                  </p>
                </div>

                {/* Specific Perk Card */}
                <div className="p-3 bg-amber-500/15 border border-amber-400/40 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-black">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>PERK BONUS:</span>
                  </div>
                  <div className="text-xs font-bold text-amber-200 mt-1">
                    {selectedMedal.perkDescription}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {unlockedIds.includes(selectedMedal.id) 
                      ? '✦ Currently active on your uniform flight suit.' 
                      : `✦ Reach the Sector ${selectedMedal.levelNumber} flagship planet to pin this ribbon.`}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-700/80 text-[11px] text-slate-400 text-center">
              All medals stack cumulatively to enhance your orbital flight performance.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

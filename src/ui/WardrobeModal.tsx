import React, { useState, useEffect, useRef } from 'react';
import { X, Gem, Check, Lock, Star, Rocket, User, Sparkles } from 'lucide-react';
import { Costume, CostumeId, RocketSkin, RocketSkinId, UserSavedData } from '../types/game';
import { INITIAL_COSTUMES, INITIAL_ROCKET_SKINS } from '../core/Config';
import { COSTUME_SPRITES, ROCKET_SPRITES } from '../core/SpriteAtlas';
import { ItemSprite } from '../components/ItemSprite';
import { StorageManager } from '../core/Storage';
import { Player } from '../entities/Player';
import cosmicHangarBannerImg from '../assets/images/cosmic_hangar_banner_1786696559208.jpg';

interface WardrobeModalProps {
  savedData: UserSavedData;
  onClose: () => void;
  onSelectCostume: (costumeId: CostumeId) => void;
  onSelectRocketSkin: (rocketSkinId: RocketSkinId) => void;
  onUpdateData: (newData: UserSavedData) => void;
}

type PreviewAnimMode = 'RUNNING' | 'FLYING' | 'CHARGING';

import { showToast } from './Toast';

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  savedData,
  onClose,
  onSelectCostume,
  onSelectRocketSkin,
  onUpdateData,
}) => {
  const [activeTab, setActiveTab] = useState<'CHARACTERS' | 'ROCKETS'>('CHARACTERS');
  const [previewAnimMode, setPreviewAnimMode] = useState<PreviewAnimMode>('RUNNING');
  const [hoveredCostumeId, setHoveredCostumeId] = useState<CostumeId | null>(null);
  const [hoveredRocketSkinId, setHoveredRocketSkinId] = useState<RocketSkinId | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dummyPlayerRef = useRef<Player | null>(null);

  // Selected or hovered costume for live interactive showcase
  const previewCostumeId = hoveredCostumeId || savedData.activeCostumeId || 'ASTRONAUT';
  const previewRocketId = hoveredRocketSkinId || savedData.activeRocketSkinId || 'APOLLO';

  useEffect(() => {
    dummyPlayerRef.current = new Player(previewCostumeId, previewRocketId);
  }, []);

  useEffect(() => {
    if (dummyPlayerRef.current) {
      dummyPlayerRef.current.setCostume(previewCostumeId);
      dummyPlayerRef.current.setRocketSkin(previewRocketId);
      if (savedData.equippedGear?.accessoryId) {
        dummyPlayerRef.current.setAccessory(savedData.equippedGear.accessoryId);
      }
    }
  }, [previewCostumeId, previewRocketId, savedData.equippedGear]);

  // Live Canvas Animation Loop in Wardrobe Stage
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const canvas = canvasRef.current;
      if (canvas && dummyPlayerRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Starfield Backdrop in Preview Box
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;

          // Radial background glow
          const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
          bgGrad.addColorStop(0, 'rgba(14, 165, 233, 0.22)');
          bgGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.6)');
          bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Star dots
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          for (let i = 0; i < 15; i++) {
            const sx = (Math.sin(i * 123.4) * 0.5 + 0.5) * canvas.width;
            const sy = (Math.cos(i * 567.8) * 0.5 + 0.5) * canvas.height;
            const size = (i % 3 === 0 ? 2.2 : 1.2);
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
          }

          // Orbit pedestal platform ring
          if (previewAnimMode === 'RUNNING') {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 34, 48, 12, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
            ctx.fill();
          }

          // Update dummy player
          const p = dummyPlayerRef.current;
          if (previewAnimMode === 'RUNNING') {
            p.isAttached = true;
            p.isCharging = false;
            p.chargeRatio = 0;
            p.runCycle += dt * 7.5;
            p.theta = -Math.PI / 2;
          } else if (previewAnimMode === 'FLYING') {
            p.isAttached = false;
            p.isCharging = false;
            p.chargeRatio = 0;
            p.vx = 0;
            p.vy = -180;
          } else if (previewAnimMode === 'CHARGING') {
            p.isAttached = true;
            p.isCharging = true;
            p.chargeRatio = 0.85;
            p.landSquash = 1.25;
            p.landStretch = 0.78;
          }

          p.update(dt);
          p.x = cx;
          p.y = cy + (previewAnimMode === 'RUNNING' ? 8 : previewAnimMode === 'FLYING' ? 12 : 10);

          // Draw the high-fidelity player
          p.draw(ctx, 0, 0, 0);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [previewAnimMode]);

  const handleUnlockCostume = (costume: Costume) => {
    if (savedData.totalDiamonds >= costume.priceDiamonds) {
      const updatedDiamonds = savedData.totalDiamonds - costume.priceDiamonds;
      const updatedUnlocked = [...savedData.unlockedCostumes, costume.id];
      const newSaved = StorageManager.saveData({
        totalDiamonds: updatedDiamonds,
        unlockedCostumes: updatedUnlocked,
        activeCostumeId: costume.id,
      });
      onUpdateData(newSaved);
      onSelectCostume(costume.id);
      showToast('SKIN_UNLOCK', 'Suit Unlocked!', `${costume.name} has been added to your wardrobe.`);
    }
  };

  const handleEquipCostume = (costumeId: CostumeId) => {
    const newSaved = StorageManager.saveData({ activeCostumeId: costumeId });
    onUpdateData(newSaved);
    onSelectCostume(costumeId);
  };

  const handleUnlockRocket = (rocket: RocketSkin) => {
    if (savedData.totalStars >= rocket.priceStars) {
      const updatedStars = savedData.totalStars - rocket.priceStars;
      const updatedUnlocked = [...(savedData.unlockedRocketSkins || ['APOLLO']), rocket.id];
      const newSaved = StorageManager.saveData({
        totalStars: updatedStars,
        unlockedRocketSkins: updatedUnlocked,
        activeRocketSkinId: rocket.id,
      });
      onUpdateData(newSaved);
      onSelectRocketSkin(rocket.id);
      showToast('SKIN_UNLOCK', 'Thruster Unlocked!', `${rocket.name} is now available to equip.`);
    }
  };

  const handleEquipRocket = (rocketSkinId: RocketSkinId) => {
    const newSaved = StorageManager.saveData({ activeRocketSkinId: rocketSkinId });
    onUpdateData(newSaved);
    onSelectRocketSkin(rocketSkinId);
  };

  const currentPreviewCostume = INITIAL_COSTUMES.find((c) => c.id === previewCostumeId) || INITIAL_COSTUMES[0];
  const currentPreviewRocket = INITIAL_ROCKET_SKINS.find((r) => r.id === previewRocketId) || INITIAL_ROCKET_SKINS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-4xl p-5 sm:p-6 text-white shadow-2xl flex flex-col max-h-[90vh] ui-interactive overflow-hidden">
        {/* Top Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-md mb-3 shrink-0 h-28 group">
          <img
            src={cosmicHangarBannerImg}
            alt="Cosmic Hangar"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end justify-between p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-sky-400">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white">
                  Cosmic Wardrobe & Hangar
                </h2>
                <p className="text-xs text-slate-300">
                  Equip explorer outfits and high-thrust propulsion boosters
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

        {/* Currency Display & Tabs */}
        <div className="flex flex-wrap items-center justify-between mb-3 gap-2 shrink-0">
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('CHARACTERS')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 btn-grow-sm ${
                activeTab === 'CHARACTERS'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Suits ({INITIAL_COSTUMES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('ROCKETS')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 btn-grow-sm ${
                activeTab === 'ROCKETS'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Thrusters ({INITIAL_ROCKET_SKINS.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950/60 border border-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-sky-300 flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
              <span>{savedData.totalDiamonds} Diamonds</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{savedData.totalStars} Stars</span>
            </div>
          </div>
        </div>

        {/* 2-Column Showcase Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Live Animated Character Stage */}
          <div className="md:col-span-5 bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col items-center justify-between">
            <div className="w-full flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Live Character Preview
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                Real-time
              </span>
            </div>

            {/* Canvas Stage */}
            <div className="relative w-full aspect-square max-w-[210px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center my-1">
              <canvas
                ref={canvasRef}
                width={240}
                height={240}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Character Info Card */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 my-1.5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="text-base">{currentPreviewCostume.icon}</span>
                <h4 className="text-xs font-bold text-white">{currentPreviewCostume.name}</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{currentPreviewCostume.description}</p>
            </div>

            {/* Animation Stride Controls */}
            <div className="w-full flex items-center justify-center gap-1.5 pt-0.5">
              <button
                onClick={() => setPreviewAnimMode('RUNNING')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all duration-200 btn-grow-sm ${
                  previewAnimMode === 'RUNNING'
                    ? 'bg-sky-500 text-slate-950 font-bold glow-sky-hover'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Run
              </button>
              <button
                onClick={() => setPreviewAnimMode('FLYING')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all duration-200 btn-grow-sm ${
                  previewAnimMode === 'FLYING'
                    ? 'bg-sky-500 text-slate-950 font-bold glow-sky-hover'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Flight
              </button>
              <button
                onClick={() => setPreviewAnimMode('CHARGING')}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all duration-200 btn-grow-sm ${
                  previewAnimMode === 'CHARGING'
                    ? 'bg-sky-500 text-slate-950 font-bold glow-sky-hover'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Charge
              </button>
            </div>
          </div>

          {/* Right Column: Outfits & Thrusters Selection List */}
          <div className="md:col-span-7 flex flex-col min-h-0 overflow-y-auto pr-1 space-y-2">
            {activeTab === 'CHARACTERS' && (
              <div className="space-y-2">
                {INITIAL_COSTUMES.map((costume) => {
                  const isUnlocked = savedData.unlockedCostumes.includes(costume.id);
                  const isActive = savedData.activeCostumeId === costume.id;
                  const isHovered = hoveredCostumeId === costume.id;

                  return (
                    <div
                      key={costume.id}
                      onMouseEnter={() => setHoveredCostumeId(costume.id)}
                      onMouseLeave={() => setHoveredCostumeId(null)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                        isActive
                          ? 'bg-sky-950/30 border-sky-500/80 shadow-md'
                          : isHovered
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 shadow-inner relative shrink-0 overflow-hidden bg-slate-950"
                        >
                          <ItemSprite
                            src={COSTUME_SPRITES[costume.id]}
                            fallback={costume.icon}
                            className="w-11 h-11 object-contain"
                            alt={costume.name}
                          />
                          <div
                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border border-slate-900"
                            style={{ backgroundColor: costume.trailColor }}
                            title="Aura Trail Color"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                            {costume.name}
                            {isActive && (
                              <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-400/40 px-1.5 py-0.2 rounded-full uppercase font-bold">
                                Equipped
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{costume.description}</p>
                        </div>
                      </div>

                      <div className="pl-2">
                        {isUnlocked ? (
                          isActive ? (
                            <div className="text-emerald-400 p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEquipCostume(costume.id)}
                              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs px-3 py-1.5 rounded-xl transition-all duration-200 btn-grow-sm glow-subtle-hover"
                            >
                              Equip
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleUnlockCostume(costume)}
                            disabled={savedData.totalDiamonds < costume.priceDiamonds}
                            className={`flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-xl transition-all duration-200 whitespace-nowrap ${
                              savedData.totalDiamonds >= costume.priceDiamonds
                                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 btn-grow glow-sky-hover'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>{costume.priceDiamonds}</span>
                            <Gem className="w-3 h-3 fill-current" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'ROCKETS' && (
              <div className="space-y-2">
                {INITIAL_ROCKET_SKINS.map((rocket) => {
                  const unlockedList = savedData.unlockedRocketSkins || ['APOLLO'];
                  const isUnlocked = unlockedList.includes(rocket.id);
                  const isActive = (savedData.activeRocketSkinId || 'APOLLO') === rocket.id;
                  const isHovered = hoveredRocketSkinId === rocket.id;

                  return (
                    <div
                      key={rocket.id}
                      onMouseEnter={() => setHoveredRocketSkinId(rocket.id)}
                      onMouseLeave={() => setHoveredRocketSkinId(null)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                        isActive
                          ? 'bg-amber-950/30 border-amber-500/80 shadow-md'
                          : isHovered
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 shadow-inner relative shrink-0 overflow-hidden bg-slate-950"
                        >
                          <ItemSprite
                            src={ROCKET_SPRITES[rocket.id]}
                            fallback={rocket.icon}
                            className="w-11 h-11 object-contain"
                            alt={rocket.name}
                          />
                          <div
                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border border-slate-900 flex items-center justify-center text-[7px]"
                            style={{ backgroundColor: rocket.flameColor }}
                            title="Flame Color"
                          >
                            🔥
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                            {rocket.name}
                            {isActive && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded-full uppercase font-bold">
                                Equipped
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{rocket.description}</p>
                        </div>
                      </div>

                      <div className="pl-2">
                        {isUnlocked ? (
                          isActive ? (
                            <div className="text-emerald-400 p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEquipRocket(rocket.id)}
                              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs px-3 py-1.5 rounded-xl transition-all duration-200 btn-grow-sm glow-subtle-hover"
                            >
                              Equip
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleUnlockRocket(rocket)}
                            disabled={savedData.totalStars < rocket.priceStars}
                            className={`flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-xl transition-all duration-200 whitespace-nowrap ${
                              savedData.totalStars >= rocket.priceStars
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 btn-grow glow-amber-hover'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>{rocket.priceStars}</span>
                            <Star className="w-3 h-3 fill-current" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

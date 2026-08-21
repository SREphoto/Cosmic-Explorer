import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Move,
  RotateCw,
  Trash2,
  Plus,
  Sparkles,
  Layers,
  Compass,
  Grid,
  ShoppingBag,
  Info,
  CheckCircle2,
  Undo2
} from 'lucide-react';
import {
  HomePlanetData,
  HomePlacedFurniture,
  HomeFurnitureItem
} from '../types/game';
import {
  HOME_PLANET_BIOMES,
  HOME_FURNITURE_CATALOG,
  HABITAT_UPGRADES
} from '../core/Config';
import { audioEngine } from '../core/AudioEngine';
import { spriteAtlas, FURNITURE_SPRITES } from '../core/SpriteAtlas';
import { ItemSprite } from '../components/ItemSprite';

interface VisualGardenLayoutProps {
  homePlanet: HomePlanetData;
  onUpdatePlanet: (updated: HomePlanetData) => void;
  starDustBalance: number;
  onOpenShop: () => void;
}

export const VisualGardenLayout: React.FC<VisualGardenLayoutProps> = ({
  homePlanet,
  onUpdatePlanet,
  starDustBalance,
  onOpenShop
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [hoveredFurnitureId, setHoveredFurnitureId] = useState<string | null>(null);
  const [spritesReady, setSpritesReady] = useState(false);

  useEffect(() => {
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      if (spriteAtlas.biome(homePlanet.biomeId || 'VERDANT') || n > 50) {
        setSpritesReady(true);
        window.clearInterval(t);
      }
    }, 80);
    return () => window.clearInterval(t);
  }, [homePlanet.biomeId]);

  const biome = HOME_PLANET_BIOMES.find((b) => b.id === homePlanet.biomeId) || HOME_PLANET_BIOMES[0];
  const habitatDef = HABITAT_UPGRADES.find((h) => h.tier === homePlanet.habitatTier) || HABITAT_UPGRADES[0];

  // Normalized placed furniture list with valid posX/posY coordinates
  const placedFurniture: HomePlacedFurniture[] = (homePlanet.placedFurniture || []).map((furn, idx) => {
    if (furn.posX !== undefined && furn.posY !== undefined) {
      return furn;
    }
    // Initialize default circular layout coordinates if posX/posY not set yet
    const angle = furn.placedAngle !== undefined ? furn.placedAngle : (furn.angle || (idx * Math.PI * 0.4));
    const dist = 90;
    return {
      ...furn,
      posX: Math.cos(angle) * dist,
      posY: Math.sin(angle) * dist,
      rotation: furn.rotation || 0
    };
  });

  // Calculate list of owned items available in tray
  const ownedCatalogItems = HOME_FURNITURE_CATALOG.filter((item) => {
    const isUnlocked = (homePlanet.unlockedDecorIds || []).includes(item.id);
    const hasPlaced = placedFurniture.some((f) => f.itemId === item.id);
    return isUnlocked || hasPlaced;
  });

  // Helper to get Canvas center & scale
  const getCanvasMetrics = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { cx: 160, cy: 160, radius: 130, scale: 1 };
    const w = canvas.width;
    const h = canvas.height;
    return {
      cx: w / 2,
      cy: h / 2,
      radius: Math.min(w, h) * 0.44,
      scale: 1
    };
  }, []);

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cx, cy, radius } = getCanvasMetrics();
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Deep Space Backdrop
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, w, h);

    // Twinkling background starlight dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 35; i++) {
      const sx = (i * 73) % w;
      const sy = (i * 127) % h;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // 2. Painted planet globe
    const biomeSprite = spriteAtlas.biome(biome.id);
    const atmGrad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.15);
    atmGrad.addColorStop(0, `${biome.color}40`);
    atmGrad.addColorStop(0.7, `${biome.color}15`);
    atmGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = atmGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    if (biomeSprite) {
      const size = radius * 2.08;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.02, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(biomeSprite, cx - size / 2, cy - size / 2, size, size);
      ctx.restore();
    } else {
      const bodyGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      bodyGrad.addColorStop(0, biome.color);
      bodyGrad.addColorStop(0.75, biome.secondaryColor);
      bodyGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = `${biome.color}80`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Concentric garden zone rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    [0.35, 0.65, 0.9].forEach((frac) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * frac, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Optional Radial Alignment Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const rad = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * radius, cy + Math.sin(rad) * radius);
        ctx.stroke();
      }
    }

    // 3. Central Sanctuary Citadel / Habitat Zone
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.24, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const habitatImg = spriteAtlas.habitat(homePlanet.habitatTier);
    if (habitatImg) {
      const hs = radius * 0.42;
      ctx.drawImage(habitatImg, cx - hs / 2, cy - hs / 2 - 4, hs, hs);
    } else {
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(habitatDef.icon, cx, cy - 2);
    }

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Citadel T${homePlanet.habitatTier}`, cx, cy + 18);
    ctx.restore();

    // 4. Render Placed Furniture Items on Surface
    placedFurniture.forEach((furn) => {
      const isSelected = furn.id === selectedFurnitureId;
      const isHovered = furn.id === hoveredFurnitureId;
      const catalogDef = HOME_FURNITURE_CATALOG.find((c) => c.id === furn.itemId);

      const fx = cx + (furn.posX || 0);
      const fy = cy + (furn.posY || 0);
      const rot = ((furn.rotation || 0) * Math.PI) / 180;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(rot);

      // Item aura/pedestal
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fillStyle = isSelected
        ? 'rgba(56, 189, 248, 0.4)'
        : isHovered
        ? 'rgba(168, 85, 247, 0.35)'
        : 'rgba(15, 23, 42, 0.65)';
      ctx.fill();

      ctx.strokeStyle = isSelected
        ? '#38bdf8'
        : isHovered
        ? '#c084fc'
        : furn.color || '#a855f7';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();

      // Selection crosshair or rotation indicator
      if (isSelected) {
        ctx.strokeStyle = '#38bdf8';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Forward orientation pointer
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(4, -20);
        ctx.lineTo(-4, -20);
        ctx.closePath();
        ctx.fill();
      }

      // Furniture artwork sprite
      const furnImg = spriteAtlas.furniture(furn.itemId);
      if (furnImg) {
        ctx.drawImage(furnImg, -18, -18, 36, 36);
      } else {
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(furn.icon || catalogDef?.icon || '🪴', 0, 0);
      }

      ctx.restore();

      // Name Label under item
      ctx.save();
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isSelected ? '#38bdf8' : '#e2e8f0';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(furn.name, fx, fy + 22);
      ctx.restore();
    });
  }, [placedFurniture, selectedFurnitureId, hoveredFurnitureId, showGrid, biome, habitatDef, getCanvasMetrics, spritesReady, homePlanet.habitatTier]);

  // Convert Mouse/Touch coordinate to Canvas relative coords
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Find Furniture under mouse
  const findFurnitureAt = (cx: number, cy: number, mx: number, my: number) => {
    for (let i = placedFurniture.length - 1; i >= 0; i--) {
      const furn = placedFurniture[i];
      const fx = cx + (furn.posX || 0);
      const fy = cy + (furn.posY || 0);
      const dist = Math.hypot(mx - fx, my - fy);
      if (dist <= 26) {
        return furn;
      }
    }
    return null;
  };

  // Mouse Down: Selection or Start Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { cx, cy } = getCanvasMetrics();
    const { x, y } = getCanvasCoords(e);
    const hit = findFurnitureAt(cx, cy, x, y);

    if (hit) {
      setSelectedFurnitureId(hit.id);
      setIsDragging(true);
      setDraggedItemId(hit.id);
      setDragOffset({
        x: (hit.posX || 0) - (x - cx),
        y: (hit.posY || 0) - (y - cy)
      });
      audioEngine.playClick();
    } else {
      setSelectedFurnitureId(null);
    }
  };

  // Mouse Move: Dragging & Hover state
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { cx, cy, radius } = getCanvasMetrics();
    const { x, y } = getCanvasCoords(e);

    if (isDragging && draggedItemId) {
      let targetX = x - cx + dragOffset.x;
      let targetY = y - cy + dragOffset.y;

      // Constrain inside sanctuary perimeter
      const distFromCenter = Math.hypot(targetX, targetY);
      const maxAllowedDist = radius * 0.88;
      if (distFromCenter > maxAllowedDist) {
        const angle = Math.atan2(targetY, targetX);
        targetX = Math.cos(angle) * maxAllowedDist;
        targetY = Math.sin(angle) * maxAllowedDist;
      }

      // Optional Snap to 20px grid
      if (snapToGrid) {
        targetX = Math.round(targetX / 20) * 20;
        targetY = Math.round(targetY / 20) * 20;
      }

      const updatedPlaced = placedFurniture.map((f) => {
        if (f.id === draggedItemId) {
          const placedAngle = Math.atan2(targetY, targetX);
          return {
            ...f,
            posX: targetX,
            posY: targetY,
            placedAngle
          };
        }
        return f;
      });

      onUpdatePlanet({
        ...homePlanet,
        placedFurniture: updatedPlaced
      });
    } else {
      const hit = findFurnitureAt(cx, cy, x, y);
      setHoveredFurnitureId(hit ? hit.id : null);
    }
  };

  // Mouse Up: End Dragging
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedItemId(null);
    }
  };

  // Rotate Selected Item
  const handleRotateSelected = (deltaDegrees: number = 45) => {
    if (!selectedFurnitureId) return;
    audioEngine.playClick();

    const updatedPlaced = placedFurniture.map((f) => {
      if (f.id === selectedFurnitureId) {
        const newRot = ((f.rotation || 0) + deltaDegrees) % 360;
        return {
          ...f,
          rotation: newRot
        };
      }
      return f;
    });

    onUpdatePlanet({
      ...homePlanet,
      placedFurniture: updatedPlaced
    });
  };

  // Stash / Remove Selected Item from surface
  const handleRemoveSelected = () => {
    if (!selectedFurnitureId) return;
    audioEngine.playPowerUpExpired();

    const updatedPlaced = placedFurniture.filter((f) => f.id !== selectedFurnitureId);
    setSelectedFurnitureId(null);
    onUpdatePlanet({
      ...homePlanet,
      placedFurniture: updatedPlaced
    });
  };

  // Place New Item from catalog onto canvas
  const handlePlaceNewItem = (catalogItem: HomeFurnitureItem) => {
    audioEngine.playPowerUpCollect();

    // Find unoccupied open angle
    const count = placedFurniture.length;
    const angle = (count * 0.8) % (Math.PI * 2);
    const dist = 75 + (count % 3) * 20;

    const newFurn: HomePlacedFurniture = {
      id: `furn_${Date.now()}_${catalogItem.id}`,
      itemId: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      angle,
      placedAngle: angle,
      posX: Math.cos(angle) * dist,
      posY: Math.sin(angle) * dist,
      rotation: 0,
      icon: catalogItem.icon,
      color: catalogItem.color
    };

    const updatedPlaced = [...placedFurniture, newFurn];
    setSelectedFurnitureId(newFurn.id);
    onUpdatePlanet({
      ...homePlanet,
      placedFurniture: updatedPlaced,
      unlockedDecorIds: Array.from(new Set([...(homePlanet.unlockedDecorIds || []), catalogItem.id]))
    });
  };

  // Auto-Arrange Feng Shui Sacred Harmony
  const handleAutoArrange = () => {
    audioEngine.playLevelUp();
    const count = placedFurniture.length;
    if (count === 0) return;

    const { radius } = getCanvasMetrics();
    const orbitDist = radius * 0.65;

    const updatedPlaced = placedFurniture.map((furn, idx) => {
      const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
      const deg = Math.round(((angle * 180) / Math.PI + 90) % 360);
      return {
        ...furn,
        posX: Math.cos(angle) * orbitDist,
        posY: Math.sin(angle) * orbitDist,
        placedAngle: angle,
        rotation: deg
      };
    });

    onUpdatePlanet({
      ...homePlanet,
      placedFurniture: updatedPlaced
    });
  };

  // Clear All Placed Items
  const handleClearAll = () => {
    audioEngine.playPowerUpExpired();
    setSelectedFurnitureId(null);
    onUpdatePlanet({
      ...homePlanet,
      placedFurniture: []
    });
  };

  const selectedItem = placedFurniture.find((f) => f.id === selectedFurnitureId);

  return (
    <div className="flex flex-col h-full space-y-3" ref={containerRef}>
      {/* Top Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 flex-wrap text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Surface Garden Layout</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            {placedFurniture.length} Placed
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
              showGrid
                ? 'bg-slate-800 text-sky-300 border-sky-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
            title="Toggle Radial Layout Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
              snapToGrid
                ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
            title="Toggle Snap to Coordinate Grid"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Snap</span>
          </button>

          <button
            onClick={handleAutoArrange}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1"
            title="Sacred Geometry Auto-Arrange"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Auto-Arrange</span>
          </button>

          {placedFurniture.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1"
              title="Stash all items back into inventory"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Stash All</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Top-Down Canvas Stage */}
      <div className="relative bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center p-2 min-h-[260px] shadow-inner">
        <canvas
          ref={canvasRef}
          width={380}
          height={320}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="max-w-full max-h-[320px] rounded-xl cursor-grab active:cursor-grabbing select-none"
        />

        {/* Selected Item Floating Controls Overlay */}
        {selectedItem && (
          <div className="absolute top-3 left-3 bg-slate-900/95 border border-sky-500/50 shadow-xl rounded-2xl p-2.5 flex items-center gap-2 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 z-20">
            <ItemSprite src={FURNITURE_SPRITES[selectedItem.itemId]} fallback={selectedItem.icon} className="w-8 h-8 object-contain" alt="" />
            <div className="pr-2 border-r border-slate-700">
              <span className="font-bold text-white block">{selectedItem.name}</span>
              <span className="text-[10px] text-sky-400 font-mono">
                X:{Math.round(selectedItem.posX || 0)} Y:{Math.round(selectedItem.posY || 0)} • {selectedItem.rotation || 0}°
              </span>
            </div>

            <button
              onClick={() => handleRotateSelected(45)}
              className="p-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/40 font-bold transition flex items-center gap-1"
              title="Rotate 45 degrees"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>

            <button
              onClick={handleRemoveSelected}
              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold transition flex items-center gap-1"
              title="Remove from surface"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Stash</span>
            </button>
          </div>
        )}

        {/* Instructions Hint */}
        <div className="absolute bottom-2 right-2 bg-slate-950/80 border border-slate-800/80 rounded-xl px-2.5 py-1 text-[10px] text-slate-400 flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
          <Info className="w-3 h-3 text-sky-400" />
          <span>Click & Drag to position • Select to rotate</span>
        </div>
      </div>

      {/* Available Furniture Inventory Tray */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Unlocked Furnishings Tray</span>
          </span>

          <button
            onClick={onOpenShop}
            className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 transition text-[11px]"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Visit Decor Shop</span>
          </button>
        </div>

        {ownedCatalogItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1 no-scrollbar">
            {ownedCatalogItems.map((item) => {
              const placedCount = placedFurniture.filter((f) => f.itemId === item.id).length;

              return (
                <div
                  key={item.id}
                  className="bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 rounded-xl p-2 flex items-center justify-between gap-2 transition group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ItemSprite src={FURNITURE_SPRITES[item.id]} fallback={item.icon} className="w-8 h-8 object-contain shrink-0" alt={item.name} />
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-white block truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {placedCount > 0 ? `${placedCount} Placed` : 'In Vault'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlaceNewItem(item)}
                    className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition flex items-center gap-0.5 shrink-0"
                    title="Place onto planet surface"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Place</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 space-y-1">
            <p className="text-xs text-slate-400">No unlocked decorations yet!</p>
            <button
              onClick={onOpenShop}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-1 rounded-xl shadow transition"
            >
              Browse Decor Shop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

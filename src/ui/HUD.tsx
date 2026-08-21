import React from 'react';
import { Pause, Star, Gem, Compass, Zap, Magnet, Award, MapPin, Sparkles, Clock, RotateCcw, Telescope } from 'lucide-react';
import { PlayerStats, StageQuest } from '../types/game';

interface HUDProps {
  stats: PlayerStats;
  currentStage: StageQuest | null;
  isMagnetActive: boolean;
  magnetTimer: number;
  magnetMaxTimer: number;
  isCometActive: boolean;
  cometTimer: number;
  cometMaxTimer: number;
  isPlayerAttached?: boolean;
  onPause: () => void;
  onTriggerJetpack?: () => void;
  onTriggerRewind?: () => void;
  onOpenStarGazing?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  currentStage,
  isMagnetActive,
  magnetTimer,
  magnetMaxTimer,
  isCometActive,
  cometTimer,
  cometMaxTimer,
  isPlayerAttached,
  onPause,
  onTriggerJetpack,
  onTriggerRewind,
  onOpenStarGazing,
}) => {
  const constellationProgress = Math.min(100, Math.max(0, Math.round((stats.currentConstellationProgressRatio ?? 0) * 100)));
  const currentZodiacColor = stats.currentZodiacColor || '#38bdf8';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 z-10 select-none">
      {/* Rewind Time-Dilation Visual Banner */}
      {stats.isRewinding && (
        <div className="absolute inset-0 z-50 bg-amber-500/15 backdrop-blur-[2px] flex items-center justify-center pointer-events-none animate-pulse">
          <div className="bg-slate-950/90 border-2 border-amber-400 px-6 py-3 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center gap-3 text-amber-300">
            <Clock className="w-8 h-8 animate-spin text-amber-400" />
            <div>
              <span className="text-sm font-black tracking-widest uppercase block text-white">
                TEMPORAL CHRONO REWIND
              </span>
              <span className="text-xs text-amber-200">Reversing flight trajectory to safe orbit...</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-start justify-between w-full">
          {/* Crescent Moon Score Badge */}
          <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-sky-400/40 shadow-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-slate-100 flex items-center justify-center text-slate-950 font-black text-sm shadow">
              🌙
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black font-mono tracking-tight text-white leading-none">
                {stats.score.toLocaleString()}
              </span>
              <span className="text-[10px] text-sky-300 font-semibold tracking-wider">
                {Math.floor(stats.altitude)}m ALT
              </span>
            </div>
          </div>

          {/* Currencies, XP Bar & Synergy */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {stats.activeSynergyName && (
              <div className="bg-amber-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-amber-400/50 text-amber-300 text-xs font-black flex items-center gap-1 shadow-md shadow-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{stats.activeSynergyName}</span>
                <span className="sm:hidden">Set Bonus</span>
              </div>
            )}

            <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 shadow">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{stats.starsCollected}</span>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center gap-1 shadow">
              <Gem className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
              <span>{stats.diamondsCollected}</span>
            </div>

            {stats.xpEarnedRun !== undefined && stats.xpEarnedRun > 0 && (
              <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1 shadow">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span>+{stats.xpEarnedRun} XP</span>
              </div>
            )}
          </div>
        </div>

        {/* Level / Biome Theme & Zodiac Constellation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 w-full">
          <div className="flex flex-wrap items-center gap-1.5">
            {stats.currentLevelName && (
              <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-500/40 shadow-lg flex items-center gap-1.5 text-[11px] font-bold text-indigo-200">
                <MapPin className="w-3 h-3 text-sky-400" />
                <span className="text-amber-300">Level {stats.currentLevelNumber}:</span>
                <span className="text-white">{stats.currentLevelName}</span>
                <span className="text-[10px] text-slate-400 ml-1">({stats.planetsLandedCount} Planets)</span>
              </div>
            )}

            {stats.currentConstellationName && (
              <div
                className="bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-full border shadow-lg flex items-center gap-1.5 text-[11px] font-black"
                style={{
                  borderColor: currentZodiacColor,
                  boxShadow: `0 0 12px ${currentZodiacColor}33`
                }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: currentZodiacColor }} />
                <span className="text-white tracking-wide">
                  {stats.currentConstellationName}
                </span>
                {stats.currentZodiacElement && (
                  <span
                    className="px-1.5 py-0.2 text-[9px] rounded font-black tracking-wider uppercase"
                    style={{
                      backgroundColor: `${currentZodiacColor}22`,
                      color: currentZodiacColor
                    }}
                  >
                    {stats.currentZodiacElement}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Subtle Glowing Constellation Shape & Progress Indicator */}
          {stats.currentConstellationName && (
            <div
              className="bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border shadow-xl flex items-center gap-2.5"
              style={{
                borderColor: `${currentZodiacColor}55`,
                boxShadow: `0 0 14px ${currentZodiacColor}25`
              }}
            >
              {/* Star Pattern Mini-Constellation SVG Canvas */}
              {stats.currentConstellationStars && stats.currentConstellationStars.length > 0 && (
                <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    {/* Constellation Connecting Lines */}
                    {stats.currentConstellationLines?.map(([sIdx, eIdx], lIdx) => {
                      const s = stats.currentConstellationStars![sIdx];
                      const e = stats.currentConstellationStars![eIdx];
                      if (!s || !e) return null;
                      const sX = (s.x ?? (s as any).relX ?? 0.5) * 100;
                      const sY = (s.y ?? (s as any).relY ?? 0.5) * 100;
                      const eX = (e.x ?? (e as any).relX ?? 0.5) * 100;
                      const eY = (e.y ?? (e as any).relY ?? 0.5) * 100;
                      const lineProgressThreshold = (lIdx / (stats.currentConstellationLines?.length || 1)) * 100;
                      const isLineActive = constellationProgress >= lineProgressThreshold;
                      return (
                        <line
                          key={`line_${lIdx}`}
                          x1={sX}
                          y1={sY}
                          x2={eX}
                          y2={eY}
                          stroke={isLineActive ? currentZodiacColor : '#475569'}
                          strokeWidth={isLineActive ? 2.5 : 1.2}
                          strokeOpacity={isLineActive ? 0.95 : 0.4}
                          strokeDasharray={isLineActive ? undefined : '2 2'}
                        />
                      );
                    })}
                    {/* Constellation Star Nodes */}
                    {stats.currentConstellationStars.map((star, sIdx) => {
                      const starThreshold = (sIdx / stats.currentConstellationStars!.length) * 100;
                      const isStarFilled = constellationProgress >= starThreshold;
                      const stX = (star.x ?? (star as any).relX ?? 0.5) * 100;
                      const stY = (star.y ?? (star as any).relY ?? 0.5) * 100;
                      const b = star.brightness ?? 1;
                      return (
                        <g key={`star_${sIdx}`}>
                          {isStarFilled && (
                            <circle
                              cx={stX}
                              cy={stY}
                              r={b * 7}
                              fill={currentZodiacColor}
                              opacity={0.35}
                              className="animate-pulse"
                            />
                          )}
                          <circle
                            cx={stX}
                            cy={stY}
                            r={b * 3.5}
                            fill={isStarFilled ? '#ffffff' : '#64748b'}
                            stroke={isStarFilled ? currentZodiacColor : '#334155'}
                            strokeWidth={1}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* Progress Text & Meter */}
              <div className="flex flex-col justify-center min-w-[75px]">
                <div className="flex items-center justify-between text-[10px] font-black leading-none mb-1">
                  <span className="text-slate-300 font-sans tracking-wide">ALIGNMENT</span>
                  <span className="font-mono text-[10px]" style={{ color: currentZodiacColor }}>
                    {constellationProgress}%
                  </span>
                </div>
                <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${constellationProgress}%`,
                      backgroundColor: currentZodiacColor,
                      boxShadow: `0 0 8px ${currentZodiacColor}`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Space Anomaly Active Banner */}
        {stats.activeAnomaly && (
          <div
            className="w-full bg-slate-950/90 backdrop-blur-md rounded-xl p-2.5 border shadow-2xl animate-pulse"
            style={{
              borderColor: stats.activeAnomaly.data.color,
              boxShadow: `0 0 18px ${stats.activeAnomaly.data.glowColor}`
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none animate-bounce">{stats.activeAnomaly.data.icon}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-white uppercase tracking-wider">
                      SPACE ANOMALY: {stats.activeAnomaly.data.name}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${stats.activeAnomaly.data.color}33`,
                        color: stats.activeAnomaly.data.color
                      }}
                    >
                      {stats.activeAnomaly.data.subtitle}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 line-clamp-1">
                    {stats.activeAnomaly.data.description}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-black font-mono" style={{ color: stats.activeAnomaly.data.color }}>
                  {Math.ceil(stats.activeAnomaly.durationRemaining)}s
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full transition-all rounded-full"
                style={{
                  width: `${Math.max(0, (stats.activeAnomaly.durationRemaining / stats.activeAnomaly.totalDuration) * 100)}%`,
                  backgroundColor: stats.activeAnomaly.data.color
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Middle Active PowerUp Timers */}
      <div className="flex flex-col gap-2 my-auto items-start max-w-[160px]">
        {isMagnetActive && (
          <div className={`bg-slate-900/90 border border-sky-500/50 rounded-lg p-2 w-full text-white text-xs shadow-lg flex flex-col gap-1 ${magnetTimer < 3 ? 'animate-pulse border-sky-400' : ''}`}>

            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Magnet className="w-3.5 h-3.5" />
              <span>Magnet</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full transition-all"
                style={{ width: `${Math.max(0, (magnetTimer / magnetMaxTimer) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {isCometActive && (
          <div className={`bg-slate-900/90 border border-amber-500/50 rounded-lg p-2 w-full text-white text-xs shadow-lg flex flex-col gap-1 ${cometTimer < 3 ? 'animate-pulse border-amber-400' : ''}`}>

            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Comet Boost</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all"
                style={{ width: `${Math.max(0, (cometTimer / cometMaxTimer) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quest Tracker & Controls */}
      <div className="flex items-end justify-between w-full gap-2">
        {/* Quest Tracker Banner */}
        {currentStage && (
          <div className="bg-slate-950/85 backdrop-blur-md border border-sky-400/30 rounded-2xl p-3 text-slate-200 text-xs shadow-2xl flex-1 max-w-sm">
            <div className="flex justify-between items-center mb-1 border-b border-slate-800 pb-1">
              <span className="font-black text-sky-300 uppercase tracking-wider text-[11px]">
                Stage {currentStage.stageId}: {currentStage.stageName}
              </span>
              <span className="text-[10px] text-amber-300 font-bold">
                {currentStage.objectives.filter((o) => o.completed).length}/3
              </span>
            </div>
            <div className="space-y-1">
              {currentStage.objectives.map((obj) => (
                <div key={obj.id} className="flex justify-between items-center text-[10px]">
                  <span className={obj.completed ? 'line-through text-slate-500' : 'text-slate-300'}>
                    {obj.description}
                  </span>
                  <span className={obj.completed ? 'text-emerald-400 font-bold' : 'text-amber-400 font-mono'}>
                    {obj.completed ? '✓' : `${obj.currentCount}/${obj.targetCount}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Star Gaze / Planet Explorer Button (When Landed on a Planet) */}
        {isPlayerAttached && onOpenStarGazing && (
          <button
            onClick={onOpenStarGazing}
            className="pointer-events-auto bg-gradient-to-tr from-sky-500 via-indigo-500 to-sky-400 hover:from-sky-400 hover:to-indigo-400 text-slate-950 px-3.5 py-2 rounded-full border-2 border-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all duration-200 flex items-center gap-1.5 font-black text-xs ui-interactive shrink-0 btn-grow glow-sky-hover"
            title="Star Gaze & Explore Planet Surface (Pauses Void)"
          >
            <Telescope className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">Star Gaze & Explore</span>
            <span className="sm:hidden">Star Gaze</span>
          </button>
        )}

        {/* Rewind Power-Up / Chrono Clock Button (When Available) */}
        {stats.rewindChargesRemaining !== undefined && stats.rewindChargesRemaining > 0 && (
          <button
            onClick={onTriggerRewind}
            className="pointer-events-auto bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-3.5 py-2 rounded-full border-2 border-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all duration-200 flex items-center gap-1.5 font-black text-xs ui-interactive shrink-0 animate-pulse btn-grow glow-amber-hover"
            title="Rewind Flight Trajectory (HotKey: R)"
          >
            <Clock className="w-4 h-4 text-slate-950 animate-spin-slow" />
            <span>Rewind ({stats.rewindChargesRemaining})</span>
            <span className="text-[9px] bg-slate-950/40 text-slate-950 px-1 rounded font-mono font-bold">R</span>
          </button>
        )}

        {/* Jetpack Rescue Button (When Available) */}
        {stats.jetpackChargesRemaining !== undefined && stats.jetpackChargesRemaining > 0 && (
          <button
            onClick={onTriggerJetpack}
            className="pointer-events-auto bg-gradient-to-tr from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 px-3.5 py-2 rounded-full border-2 border-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.5)] transition-all duration-200 flex items-center gap-1.5 font-black text-xs ui-interactive shrink-0 btn-grow glow-amber-hover"
            title="Fire Jetpack Thrusters!"
          >
            <span className="text-sm">🚀</span>
            <span>Jetpack ({stats.jetpackChargesRemaining})</span>
          </button>
        )}

        {/* Circular Glowing Pause Button (Matching Screenshots) */}
        <button
          onClick={onPause}
          className="pointer-events-auto bg-slate-950/90 hover:bg-slate-900 text-sky-300 w-12 h-12 rounded-full border-2 border-sky-400/60 transition-all duration-200 shadow-[0_0_15px_rgba(56,189,248,0.3)] flex items-center justify-center ui-interactive shrink-0 btn-grow glow-sky-hover"
          title="Pause Game"
        >
          <Pause className="w-5 h-5 fill-sky-300 stroke-sky-300" />
        </button>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { 
  Swords, 
  Flag, 
  Shield, 
  Bomb, 
  Zap, 
  Radio, 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  X, 
  Flame, 
  AlertTriangle,
  Send
} from 'lucide-react';
import { RoomData, TrapType } from '../types/multiplayer';
import { audioEngine } from '../core/AudioEngine';

interface MultiplayerGameOverlayProps {
  room: RoomData;
  isHost: boolean;
  currentUserId: string;
  isPlayerAttached: boolean;
  currentPlanetId: string | null;
  onDeployTrap: (trapType: TrapType) => void;
  onLeaveMatch: () => void;
  onRematch?: () => void;
}

export const MultiplayerGameOverlay: React.FC<MultiplayerGameOverlayProps> = ({
  room,
  isHost,
  currentUserId,
  isPlayerAttached,
  currentPlanetId,
  onDeployTrap,
  onLeaveMatch,
  onRematch
}) => {
  const [selectedEmote, setSelectedEmote] = useState<string | null>(null);

  const myState = isHost ? room.hostState : room.guestState;
  const oppState = isHost ? room.guestState : room.hostState;
  const myParticipant = isHost ? room.host : room.guest;
  const oppParticipant = isHost ? room.guest : room.host;

  const myShields = myState?.shields ?? 100;
  const oppShields = oppState?.shields ?? 100;
  const trapsLeft = myState?.trapsAvailable ?? 0;

  const totalPlanetsClaimed = Object.keys(room.claimedPlanets || {}).length;
  const myClaimedCount = Object.values(room.claimedPlanets || {}).filter(uid => uid === currentUserId).length;
  const oppClaimedCount = Object.values(room.claimedPlanets || {}).filter(uid => uid !== currentUserId).length;

  const isGameOver = room.status === 'FINISHED';
  const isWinner = room.winnerId === currentUserId;

  // Race calculations
  const myAlt = Math.floor(myState?.altitude || 0);
  const oppAlt = Math.floor(oppState?.altitude || 0);
  const targetAlt = room.targetAltitude || 3500;
  const myProgress = Math.min(100, Math.max(0, (myAlt / targetAlt) * 100));
  const oppProgress = Math.min(100, Math.max(0, (oppAlt / targetAlt) * 100));
  const altDelta = myAlt - oppAlt;

  // Check if current landed planet already has a trap or is claimed
  const currentPlanetClaimedBy = currentPlanetId ? room.claimedPlanets?.[currentPlanetId] : null;
  const currentPlanetHasTrap = currentPlanetId ? room.traps?.[currentPlanetId] : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 select-none">
      
      {/* Top Multiplayer Match Telemetry Banner */}
      <div className="w-full max-w-lg mx-auto bg-slate-950/90 backdrop-blur-md border border-indigo-500/40 rounded-2xl p-2.5 shadow-2xl space-y-2 pointer-events-auto">
        {/* Match Header info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-sm">
              {room.mode === 'BATTLE' ? '⚔️' : '🏁'}
            </span>
            <span className="text-white font-black">
              {room.mode === 'BATTLE' ? 'PLANETARY BATTLE' : 'WARP RACE (3,500m)'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-mono font-bold">
              ROOM: {room.roomCode}
            </span>
          </div>

          <button
            onClick={onLeaveMatch}
            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-bold"
          >
            Leave Match
          </button>
        </div>

        {/* BATTLE MODE: Shields & Territory Status */}
        {room.mode === 'BATTLE' ? (
          <div className="space-y-2">
            {/* Player Shields vs Opponent Shields */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {/* My Shield */}
              <div className="bg-slate-900/80 p-1.5 rounded-xl border border-sky-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sky-300 font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-sky-400" />
                    <span>You ({myParticipant?.displayName?.substring(0, 8)})</span>
                  </span>
                  <span className="font-mono font-black text-white">{myShields}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 transition-all"
                    style={{ width: `${myShields}%` }}
                  />
                </div>
              </div>

              {/* Opponent Shield */}
              <div className="bg-slate-900/80 p-1.5 rounded-xl border border-rose-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-rose-300 font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-rose-400" />
                    <span>Rival ({oppParticipant?.displayName?.substring(0, 8) || 'Waiting'})</span>
                  </span>
                  <span className="font-mono font-black text-white">{oppShields}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 transition-all"
                    style={{ width: `${oppShields}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Territory Control Tug-of-War Bar */}
            <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-300 mb-0.5">
                <span className="text-sky-300">🔵 {myClaimedCount} Planets Claimed</span>
                <span className="text-slate-500">TERRITORY CONTROL</span>
                <span className="text-rose-300">🔴 {oppClaimedCount} Planets Claimed</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-sky-400 transition-all"
                  style={{ width: `${totalPlanetsClaimed > 0 ? (myClaimedCount / totalPlanetsClaimed) * 100 : 50}%` }}
                />
                <div
                  className="h-full bg-rose-400 transition-all"
                  style={{ width: `${totalPlanetsClaimed > 0 ? (oppClaimedCount / totalPlanetsClaimed) * 100 : 50}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* RACE MODE: Altitude Progress Track */
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <div className="flex items-center gap-1 text-sky-300 font-mono">
                <span>YOU: {myAlt}m</span>
                {altDelta !== 0 && (
                  <span className={`text-[10px] px-1 rounded ${altDelta > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {altDelta > 0 ? `+${altDelta}m Ahead` : `${altDelta}m Behind`}
                  </span>
                )}
              </div>
              <div className="text-amber-300 font-mono font-bold">
                GATE: {targetAlt}m
              </div>
              <div className="text-rose-300 font-mono">
                RIVAL: {oppAlt}m
              </div>
            </div>

            {/* Race Track Bar */}
            <div className="relative w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
              {/* My Progress Runner */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all"
                style={{ width: `${myProgress}%` }}
              />
              {/* Opponent Marker */}
              <div
                className="absolute top-0 bottom-0 w-2 bg-rose-400 rounded-full shadow-[0_0_8px_#f43f5e] transition-all -ml-1"
                style={{ left: `${oppProgress}%` }}
                title="Rival Position"
              />
            </div>
          </div>
        )}

        {/* Live Event Ticker (Latest event) */}
        {room.events && room.events.length > 0 && (
          <div className="bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800/80 text-[10px] text-slate-300 flex items-center gap-1.5 truncate">
            <Radio className="w-2.5 h-2.5 text-indigo-400 shrink-0 animate-pulse" />
            <span className="truncate">{room.events[room.events.length - 1].message}</span>
          </div>
        )}
      </div>

      {/* BATTLE MODE: Active Trap Deployment Action Bar (When Landed on a Planet) */}
      {room.mode === 'BATTLE' && isPlayerAttached && currentPlanetId && (
        <div className="w-full max-w-md mx-auto bg-slate-950/95 backdrop-blur-md border-2 border-indigo-500/50 rounded-2xl p-3 shadow-2xl pointer-events-auto space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🪐</span>
              <span className="text-xs font-black text-white">
                {currentPlanetClaimedBy === currentUserId ? 'Your Territory' : currentPlanetClaimedBy ? 'Hostile Territory!' : 'Unclaimed Planet'}
              </span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono font-bold">
              Traps Available: {trapsLeft}/3
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onDeployTrap('PLASMA_MINE')}
              disabled={trapsLeft <= 0 || Boolean(currentPlanetHasTrap)}
              className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                trapsLeft <= 0 || currentPlanetHasTrap
                  ? 'border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed'
                  : 'border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 shadow-md shadow-amber-500/10'
              }`}
            >
              <Bomb className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-[10px]">Plasma Mine</span>
              <span className="text-[8px] text-slate-400">-25% Shield</span>
            </button>

            <button
              onClick={() => onDeployTrap('GRAVITY_REVERSAL')}
              disabled={trapsLeft <= 0 || Boolean(currentPlanetHasTrap)}
              className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                trapsLeft <= 0 || currentPlanetHasTrap
                  ? 'border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed'
                  : 'border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 shadow-md shadow-indigo-500/10'
              }`}
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-[10px]">Gravity Flip</span>
              <span className="text-[8px] text-slate-400">-20% Shield</span>
            </button>

            <button
              onClick={() => onDeployTrap('SOLAR_EMP')}
              disabled={trapsLeft <= 0 || Boolean(currentPlanetHasTrap)}
              className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                trapsLeft <= 0 || currentPlanetHasTrap
                  ? 'border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed'
                  : 'border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 shadow-md shadow-rose-500/10'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-[10px]">Solar EMP</span>
              <span className="text-[8px] text-slate-400">-30% Shield</span>
            </button>
          </div>
        </div>
      )}

      {/* Game Over Victory / Defeat Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto animate-fade-in">
          <div className="bg-slate-900/95 border-2 border-indigo-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(99,102,241,0.3)] text-slate-100">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-3xl shadow-lg">
              {isWinner ? '🏆' : '💀'}
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-widest block">
                MATCH CONCLUDED
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {isWinner ? 'VICTORY IN THE ARENA!' : 'DEFEAT IN THE VOID'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isWinner 
                  ? `Congratulations! You conquered the cosmic sector against ${oppParticipant?.displayName || 'your rival'}!`
                  : `Good match! ${room.winnerName || 'Your opponent'} triumphed in this duel.`
                }
              </p>
            </div>

            {/* Match Rewards */}
            {isWinner && (
              <div className="bg-slate-950/80 border border-amber-500/40 p-3 rounded-2xl flex items-center justify-around text-xs font-bold text-amber-300">
                <span>+150 Bonus Stars</span>
                <span>+3 Diamonds</span>
                <span>+100 Star Dust</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={onLeaveMatch}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                Exit to Menu
              </button>
              {onRematch && (
                <button
                  onClick={onRematch}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-indigo-500/20"
                >
                  Rematch ⚔️
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

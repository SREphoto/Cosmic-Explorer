import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Flag, 
  Users, 
  Zap, 
  ShieldAlert, 
  Trophy, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  Play, 
  Radio, 
  Globe, 
  LogIn, 
  LogOut,
  Flame,
  Shield,
  Crosshair,
  Crown
} from 'lucide-react';
import { FirebaseService, isFirebaseAvailable, type AppUser } from '../core/firebase';
import { RoomData, MultiplayerMode, PlayerOnlineState } from '../types/multiplayer';
import { UserSavedData } from '../types/game';
import { audioEngine } from '../core/AudioEngine';

interface MultiplayerModalProps {
  savedData: UserSavedData;
  onClose: () => void;
  onStartMatch: (room: RoomData, isHost: boolean) => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  savedData,
  onClose,
  onStartMatch
}) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(FirebaseService.getSignedInUser());
  const [selectedMode, setSelectedMode] = useState<MultiplayerMode>('BATTLE');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoom, setActiveRoom] = useState<RoomData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const firebaseReady = isFirebaseAvailable();
  const canPlayOnline = firebaseReady && !!currentUser;

  // Listen to Auth State
  useEffect(() => {
    const unsub = FirebaseService.onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Listen to Active Room Changes if in a room
  useEffect(() => {
    if (!activeRoom?.id) return;
    const unsub = FirebaseService.subscribeToRoom(activeRoom.id, (updated) => {
      if (!updated) {
        setActiveRoom(null);
        setErrorMessage('The room was closed or disconnected.');
        return;
      }

      setActiveRoom(updated);

      // Check if game is starting or active
      if (updated.status === 'STARTING' || updated.status === 'ACTIVE') {
        const isHost = updated.host.userId === currentUser?.uid;
        audioEngine.playUnlockSound();
        onStartMatch(updated, isHost);
      }
    });

    return () => unsub();
  }, [activeRoom?.id, currentUser?.uid]);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setErrorMessage(null);
    try {
      await FirebaseService.signInWithGoogle();
      audioEngine.playMenuSelect();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed. You can also play as guest.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsAuthLoading(true);
    setErrorMessage(null);
    try {
      await FirebaseService.signInGuest();
      audioEngine.playMenuSelect();
    } catch (err: any) {
      setErrorMessage(err.message || 'Guest sign-in failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!canPlayOnline) {
      setErrorMessage('Online multiplayer needs a Firebase connection. You are in local guest mode.');
      return;
    }
    setIsCreating(true);
    setErrorMessage(null);
    try {
      const initialState: Partial<PlayerOnlineState> = {
        costumeId: savedData.activeCostumeId,
        rocketSkinId: savedData.activeRocketSkinId,
        score: 0,
        shields: 100,
        trapsAvailable: 3
      };

      const room = await FirebaseService.createMatchRoom(currentUser, selectedMode, initialState);
      setActiveRoom(room);
      audioEngine.playMenuSelect();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create room.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!canPlayOnline) {
      setErrorMessage('Online multiplayer needs a Firebase connection. You are in local guest mode.');
      return;
    }
    if (!roomCodeInput.trim()) return;
    setIsJoining(true);
    setErrorMessage(null);
    try {
      const initialState: Partial<PlayerOnlineState> = {
        costumeId: savedData.activeCostumeId,
        rocketSkinId: savedData.activeRocketSkinId,
        score: 0,
        shields: 100,
        trapsAvailable: 3
      };

      const joinedRoom = await FirebaseService.joinRoomByCode(
        roomCodeInput.trim().toUpperCase(),
        currentUser,
        initialState
      );

      if (!joinedRoom) {
        setErrorMessage('Room not found or match has already started.');
      } else {
        setActiveRoom(joinedRoom);
        audioEngine.playMenuSelect();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to join room.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeRoom?.roomCode) return;
    navigator.clipboard.writeText(activeRoom.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLeaveRoom = async () => {
    if (activeRoom && currentUser) {
      await FirebaseService.leaveRoom(activeRoom.id, currentUser.uid);
      setActiveRoom(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-950/95 border-2 border-indigo-500/40 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.25)] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                1V1 ONLINE MULTIPLAYER ARENA
              </h2>
              <p className="text-xs text-indigo-300">
                Real-time Battle territory warfare & hyper-speed warp races!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* User Auth Banner */}
          {!firebaseReady ? (
            <div className="bg-gradient-to-r from-slate-900/90 to-slate-950/90 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="font-black text-sm text-white">Offline Build — Multiplayer Unavailable</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  This build runs without Firebase, so online matches are disabled. Your progress still saves locally — play single-player anytime!
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
              >
                <span>Back to Game</span>
              </button>
            </div>
          ) : !currentUser ? (
            <div className="bg-gradient-to-r from-indigo-950/70 to-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span className="font-black text-sm text-white">Sign In to Play Online</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in with Google to sync save data across devices and challenge rivals online!
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isAuthLoading}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google Sign-In</span>
                </button>
                <button
                  onClick={handleGuestSignIn}
                  disabled={isAuthLoading}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
                >
                  <span>Play as Guest</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    '🚀'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {currentUser.displayName || (currentUser.isAnonymous ? 'Cosmic Guest' : 'Explorer')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      Cloud Connected
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    High Score: {savedData.highScore.toLocaleString()} • Level {savedData.playerLevel}
                  </span>
                </div>
              </div>

              <button
                onClick={() => FirebaseService.signOut()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Active Lobby Waiting State */}
          {activeRoom ? (
            <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900/90 border-2 border-indigo-500/40 rounded-2xl p-5 space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-500/40">
                <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                <span>LOBBY CODE:</span>
                <span className="font-mono text-base text-amber-300 tracking-widest">{activeRoom.roomCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-indigo-500/30 rounded-lg text-indigo-200 transition-colors"
                  title="Copy Room Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <h3 className="text-xl font-black text-white">
                {activeRoom.mode === 'BATTLE' ? 'Cosmic Territory Battle Arena' : 'Warp Gate Speed Race'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Share room code <span className="font-mono font-bold text-amber-300">{activeRoom.roomCode}</span> with your challenger. Match will start automatically when opponent enters!
              </p>

              {/* Opponent & Host Status Boxes */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                <div className="bg-slate-950/80 border-2 border-sky-400/50 p-3 rounded-2xl flex flex-col items-center gap-1.5 shadow-lg shadow-sky-500/10">
                  <div className="w-8 h-8 rounded-full bg-sky-500/30 border border-sky-400 flex items-center justify-center text-sm text-sky-200 font-black">
                    🔵
                  </div>
                  <span className="text-xs font-bold text-white line-clamp-1">{activeRoom.host.displayName}</span>
                  <span className="text-[10px] text-sky-400 font-bold uppercase">Host (Ready)</span>
                </div>

                <div className="bg-slate-950/80 border-2 border-dashed border-slate-700 p-3 rounded-2xl flex flex-col items-center gap-1.5">
                  {activeRoom.guest ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-rose-500/30 border border-rose-400 flex items-center justify-center text-sm text-rose-200 font-black">
                        🔴
                      </div>
                      <span className="text-xs font-bold text-white line-clamp-1">{activeRoom.guest.displayName}</span>
                      <span className="text-[10px] text-rose-400 font-bold uppercase">Challenger Ready!</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 animate-pulse">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Waiting for challenger...</span>
                      <span className="text-[10px] text-slate-600">Enter code {activeRoom.roomCode}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLeaveRoom}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel & Leave Lobby
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Game Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 tracking-wide uppercase">
                  Select 1v1 Multiplayer Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Battle Mode Option */}
                  <button
                    onClick={() => { setSelectedMode('BATTLE'); audioEngine.playMenuSelect(); }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      selectedMode === 'BATTLE'
                        ? 'border-indigo-400 bg-indigo-950/40 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                        <Swords className="w-4 h-4" />
                      </div>
                      {selectedMode === 'BATTLE' && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-slate-950 text-[10px] font-black uppercase">
                          Selected
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">Planetary Territory Battle</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">
                        Claim planets, deploy orbital traps (Plasma Mines, Gravity Inverters, EMPs), and duel to deplete opponent shields!
                      </p>
                    </div>
                  </button>

                  {/* Race Mode Option */}
                  <button
                    onClick={() => { setSelectedMode('RACE'); audioEngine.playMenuSelect(); }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      selectedMode === 'RACE'
                        ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                        <Flag className="w-4 h-4" />
                      </div>
                      {selectedMode === 'RACE' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                          Selected
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">Warp Gate Speed Race</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">
                        High-velocity race to reach the 3,500m Warp Gate first! Features live opponent ghost trackers and altitude meters.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Matchmaking Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Host a New Match */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Host 1v1 Arena</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Create a new room with custom 5-letter code to challenge friends or open to rivals.
                    </p>
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    disabled={isCreating || !canPlayOnline}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                      !canPlayOnline
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-slate-950 shadow-indigo-500/25'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>{isCreating ? 'Generating Arena...' : 'Create Match Room'}</span>
                  </button>
                </div>

                {/* Join by Room Code */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <Crosshair className="w-4 h-4 text-sky-400" />
                      <span>Join with Room Code</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter the 5-letter code provided by your rival.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="CODE (e.g. ASTRO)"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest text-center text-amber-300 placeholder:text-slate-600 uppercase focus:outline-none focus:border-sky-400"
                    />
                    <button
                      onClick={handleJoinByCode}
                      disabled={isJoining || !canPlayOnline || !roomCodeInput.trim()}
                      className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${
                        !canPlayOnline || !roomCodeInput.trim()
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                      }`}
                    >
                      <span>{isJoining ? 'Joining...' : 'Join'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Multiplayer powered by Firebase Firestore live synchronization</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

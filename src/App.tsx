/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine } from './core/AudioEngine';
import { Engine } from './core/Engine';
import { InputManager } from './core/InputManager';
import { StorageManager } from './core/Storage';
import { CostumeId, GameMode, PlayerStats, RocketSkinId, UserSavedData, LevelVictoryData } from './types/game';
import { AchievementsModal } from './ui/AchievementsModal';
import { DocsViewerModal } from './ui/DocsViewerModal';
import { GameOverModal } from './ui/GameOverModal';
import { PostRunSummaryModal } from './ui/PostRunSummaryModal';
import { HUD } from './ui/HUD';
import { MainMenu } from './ui/MainMenu';
import { QuestLogModal } from './ui/QuestLogModal';
import { UpgradesModal } from './ui/UpgradesModal';
import { WardrobeModal } from './ui/WardrobeModal';
import { TutorialOverlay } from './ui/TutorialOverlay';
import { OnboardingTutorialOverlay } from './ui/OnboardingTutorialOverlay';
import { GalaxyMapModal } from './ui/GalaxyMapModal';
import { StarGazingModal } from './ui/StarGazingModal';
import { HomePlanetModal } from './ui/HomePlanetModal';
import { MultiplayerModal } from './ui/MultiplayerModal';
import { MultiplayerGameOverlay } from './ui/MultiplayerGameOverlay';
import { LoginScreen } from './ui/LoginScreen';
import { LevelVictoryCutscene } from './ui/LevelVictoryCutscene';
import { MedalChestModal } from './ui/MedalChestModal';
import { FirebaseService, auth } from './core/firebase';
import { RoomData, TrapType } from './types/multiplayer';
import { DailyChallengeSystem } from './systems/DailyChallengeSystem';
import { Play, RotateCcw, Home, HelpCircle, Compass } from 'lucide-react';
import { ToastContainer, showToast } from './ui/Toast';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);

  const [gameMode, setGameMode] = useState<GameMode>('MENU');
  const [savedData, setSavedData] = useState<UserSavedData>(() => StorageManager.loadData());
  const [currentUser, setCurrentUser] = useState<typeof auth.currentUser>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [levelVictoryData, setLevelVictoryData] = useState<LevelVictoryData | null>(null);
  const [activeModal, setActiveModal] = useState<
    'WARDROBE' | 'UPGRADES' | 'QUESTS' | 'ACHIEVEMENTS' | 'DOCS' | 'TUTORIAL' | 'ONBOARDING' | 'MAP' | 'MULTIPLAYER' | 'HOME_PLANET' | 'MEDAL_CHEST' | null
  >(null);

  const [isStarGazingOpen, setIsStarGazingOpen] = useState(false);
  const [activeMultiplayerRoom, setActiveMultiplayerRoom] = useState<RoomData | null>(null);
  const [isMultiplayerHost, setIsMultiplayerHost] = useState(true);
  const [multiplayerShields, setMultiplayerShields] = useState(100);
  const [showPostRunSummary, setShowPostRunSummary] = useState(false);
  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    altitude: 0,
    maxAltitude: 0,
    starsCollected: 0,
    diamondsCollected: 0,
    xpEarnedRun: 0,
    consecutivePerfectJumps: 0,
    maxConsecutiveJumps: 0,
    planetRotationsCurrent: 0,
    sunsLandedCount: 0,
    powerUpsUsedCount: 0,
    planetsLandedCount: 0,
    jetpackChargesRemaining: 1,
    rewindChargesRemaining: 1,
    maxRewindCharges: 1,
    fullOrbitsCompleted: 0,
    ricochetsExecuted: 0,
    currentLevelNumber: 1,
    currentLevelName: 'Verdant Stratosphere'
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current);
    engineRef.current = engine;

    const inputManager = new InputManager();
    inputManagerRef.current = inputManager;

    inputManager.setCallbacks(
      () => {
        if (engineRef.current) {
          engineRef.current.onChargeStart();
        }
      },
      (holdDuration) => {
        if (engineRef.current) {
          engineRef.current.onChargeRelease(holdDuration);
        }
      }
    );

    inputManager.startListening(canvasRef.current);

    engine.onStateChange = (newMode) => {
      setGameMode(newMode);
      if (newMode === 'GAMEOVER') {
        setSavedData(StorageManager.loadData());
        setShowPostRunSummary(true);
      }
    };

    engine.onStatsUpdate = (newStats) => {
      setStats({ ...newStats });
    };

    engine.onLevelVictory = (victoryData) => {
      setLevelVictoryData(victoryData);
      setSavedData(StorageManager.loadData());
      audioEngine.playPowerUpCollect();
      if (currentUser?.uid) {
        FirebaseService.saveGameToCloud(currentUser.uid, StorageManager.loadData());
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const currentMode = engineRef.current?.state;
        if (currentMode === 'GAMEOVER' || currentMode === 'PAUSED') {
          handleStartGame();
          return;
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        if (engineRef.current && engineRef.current.state === 'PLAYING') {
          engineRef.current.triggerRewind();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      inputManager.stopListening(canvasRef.current || undefined);
      engine.destroy();
    };
  }, []);

  // Sync Auth State & Cloud Merging
  useEffect(() => {
    const unsub = FirebaseService.onAuthChange(async (u) => {
      setCurrentUser(u);
      if (u) {
        try {
          const cloudData = await FirebaseService.loadGameFromCloud(u.uid);
          if (cloudData) {
            const merged = StorageManager.mergeWithCloud(cloudData);
            setSavedData(merged);
            if (engineRef.current) {
              engineRef.current.savedData = merged;
            }
          }
        } catch (e) {
          console.warn('Auto cloud sync failed:', e);
        }
      }
    });
    return () => unsub();
  }, []);

  // Real-time Multiplayer Sync & Game Rules
  useEffect(() => {
    if (!activeMultiplayerRoom?.id || gameMode !== 'PLAYING') return;

    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    // 1. Subscribe to Live Room Updates
    const unsub = FirebaseService.subscribeToRoom(activeMultiplayerRoom.id, (updated) => {
      if (!updated) {
        showToast('GENERIC', 'Multiplayer Ended', 'The room has ended.');
        setActiveMultiplayerRoom(null);
        return;
      }
      setActiveMultiplayerRoom(updated);

      const myState = isMultiplayerHost ? updated.hostState : updated.guestState;
      if (myState?.shields !== undefined) {
        setMultiplayerShields(myState.shields);
      }
    });

    // 2. Periodic Telemetry broadcast (every 120ms)
    const telemetryInterval = setInterval(() => {
      if (!engineRef.current || engineRef.current.state !== 'PLAYING') return;
      const player = engineRef.current.player;

      FirebaseService.updatePlayerState(activeMultiplayerRoom.id, currentUserId, {
        x: player.x,
        y: player.y,
        altitude: stats.altitude,
        score: stats.score,
        shields: multiplayerShields,
        currentPlanetId: player.currentPlanet?.id || null,
        isAttached: player.isAttached,
      });

      // Race mode finish line check
      if (activeMultiplayerRoom.mode === 'RACE' && activeMultiplayerRoom.status === 'ACTIVE') {
        const target = activeMultiplayerRoom.targetAltitude || 3500;
        if (stats.altitude >= target) {
          const userName = auth.currentUser?.displayName || 'Cosmic Runner';
          FirebaseService.endMatch(activeMultiplayerRoom.id, currentUserId, userName);
        }
      }
    }, 120);

    return () => {
      unsub();
      clearInterval(telemetryInterval);
    };
  }, [activeMultiplayerRoom?.id, activeMultiplayerRoom?.status, gameMode, stats.altitude, isMultiplayerHost, multiplayerShields]);

  // Battle Mode: Land on planet -> Claim & Trigger enemy traps
  useEffect(() => {
    if (!activeMultiplayerRoom || activeMultiplayerRoom.mode !== 'BATTLE' || gameMode !== 'PLAYING') return;
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId || !engineRef.current) return;

    const player = engineRef.current.player;
    if (player.isAttached && player.currentPlanet) {
      const pId = player.currentPlanet.id;

      // Claim planet if unclaimed
      if (!activeMultiplayerRoom.claimedPlanets?.[pId]) {
        FirebaseService.claimPlanet(activeMultiplayerRoom.id, pId, currentUserId);
      }

      // Check if enemy trap is armed on this planet
      const trap = activeMultiplayerRoom.traps?.[pId];
      if (trap && trap.deployedBy !== currentUserId) {
        // Detonate trap!
        let damage = 25;
        if (trap.type === 'SOLAR_EMP') damage = 30;
        if (trap.type === 'GRAVITY_REVERSAL') damage = 20;

        const newShields = Math.max(0, multiplayerShields - damage);
        setMultiplayerShields(newShields);
        audioEngine.playPowerUpExpired();
        engineRef.current.renderSystem.triggerScreenShake(12, 0.4);
        showToast('GENERIC', 'Enemy Trap Detonated!', `Detonated ${trap.type}! Shields -${damage}%`);

        FirebaseService.detonateTrap(activeMultiplayerRoom.id, pId, currentUserId);
        FirebaseService.updatePlayerState(activeMultiplayerRoom.id, currentUserId, {
          shields: newShields
        });

        // Shield depleted -> opponent wins
        if (newShields <= 0) {
          const oppId = isMultiplayerHost ? activeMultiplayerRoom.guest?.userId : activeMultiplayerRoom.host.userId;
          const oppName = isMultiplayerHost ? activeMultiplayerRoom.guest?.displayName : activeMultiplayerRoom.host.displayName;
          if (oppId) {
            FirebaseService.endMatch(activeMultiplayerRoom.id, oppId, oppName || 'Challenger');
          }
        }
      }
    }
  }, [stats.planetsLandedCount, activeMultiplayerRoom?.claimedPlanets, activeMultiplayerRoom?.traps]);

  const handleStartGame = (startCheckpointId?: string) => {
    setActiveMultiplayerRoom(null);
    if (!savedData.hasSeenOnboarding && !savedData.hasCompletedTutorial) {
      setActiveModal('ONBOARDING');
      return;
    }
    setActiveModal(null);
    if (engineRef.current) {
      engineRef.current.startNewGame(startCheckpointId);
    }
  };

  const handleStartMultiplayerMatch = (room: RoomData, isHost: boolean) => {
    setActiveMultiplayerRoom(room);
    setIsMultiplayerHost(isHost);
    setMultiplayerShields(100);
    setActiveModal(null);
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
    showToast('GENERIC', 'Match Commenced!', `1v1 ${room.mode} match active!`);
  };

  const handleDeployTrap = async (trapType: TrapType) => {
    if (!activeMultiplayerRoom || !engineRef.current?.player.currentPlanet) return;
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const pId = engineRef.current.player.currentPlanet.id;
    await FirebaseService.deployTrap(activeMultiplayerRoom.id, pId, trapType, currentUserId);
    audioEngine.playUnlockSound();
    showToast('SUCCESS', 'Orbital Trap Armed!', `Armed ${trapType.replace('_', ' ')} on current planet!`);
  };

  const handleLeaveMultiplayerMatch = async () => {
    if (activeMultiplayerRoom && auth.currentUser) {
      await FirebaseService.leaveRoom(activeMultiplayerRoom.id, auth.currentUser.uid);
    }
    setActiveMultiplayerRoom(null);
    handleGoToMenu();
  };

  const handleOpenStarGazing = () => {
    if (engineRef.current && gameMode === 'PLAYING') {
      engineRef.current.pauseGame();
      setIsStarGazingOpen(true);
    }
  };

  const handleCloseStarGazing = () => {
    setIsStarGazingOpen(false);
    if (engineRef.current && gameMode === 'PAUSED') {
      engineRef.current.resumeGame();
    }
  };

  const handleStarGazingReward = (stars: number, diamonds: number, starDust: number) => {
    const updated = StorageManager.saveData({
      totalStars: (savedData.totalStars || 0) + stars,
      totalDiamonds: (savedData.totalDiamonds || 0) + diamonds,
      starDustCurrency: (savedData.starDustCurrency || 0) + starDust
    });
    setSavedData(updated);
    if (engineRef.current) {
      engineRef.current.savedData = updated;
    }
    showToast('SUCCESS', 'Planet Scan Complete!', `Harvested +${stars} Stars, +${diamonds} Diamonds & +${starDust} Star Dust!`);
  };

  const handleOnboardingComplete = () => {
    const updated = StorageManager.saveData({
      hasSeenOnboarding: true,
      hasCompletedTutorial: true
    });
    setSavedData(updated);
    if (engineRef.current) {
      engineRef.current.savedData = updated;
    }
    setActiveModal(null);
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  };

  const handleTutorialComplete = (dontShowAgain: boolean) => {
    const updated = StorageManager.saveData({ hasCompletedTutorial: dontShowAgain });
    setSavedData(updated);
    if (engineRef.current) {
      engineRef.current.savedData = updated;
    }
    setActiveModal(null);
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  };

  const handleSelectCheckpoint = (checkpointId: string) => {
    const updated = StorageManager.saveData({ selectedStartCheckpointId: checkpointId });
    setSavedData(updated);
    if (engineRef.current) {
      engineRef.current.selectStartCheckpoint(checkpointId);
    }
  };

  const handleLaunchFromMap = (checkpointId: string) => {
    handleSelectCheckpoint(checkpointId);
    setActiveModal(null);
    if (engineRef.current) {
      engineRef.current.startNewGame(checkpointId);
    }
  };

  const handlePauseGame = () => {
    if (engineRef.current) {
      engineRef.current.pauseGame();
    }
  };

  const handleResumeGame = () => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  };

  const handleGoToMenu = () => {
    if (engineRef.current) {
      engineRef.current.setMode('MENU');
    }
    audioEngine.stopMusic();
    setSavedData(StorageManager.loadData());
    setActiveModal(null);
  };

  const handleSelectCostume = (costumeId: CostumeId) => {
    if (engineRef.current) {
      engineRef.current.player.setCostume(costumeId);
    }
  };

  const handleSelectRocketSkin = (rocketSkinId: RocketSkinId) => {
    if (engineRef.current) {
      engineRef.current.player.setRocketSkin(rocketSkinId);
    }
  };

  const handleVolumeChange = (type: 'music' | 'sfx' | 'ambient', value: number) => {
    const updates: any = {};
    if (type === 'music') updates.musicVolume = value;
    if (type === 'sfx') updates.soundVolume = value;
    if (type === 'ambient') updates.ambientVolume = value;
    const updated = StorageManager.saveData(updates);
    setSavedData(updated);
    audioEngine.setVolumes(1.0, updated.musicVolume ?? 1.0, updated.soundVolume ?? 1.0, updated.ambientVolume ?? 1.0);
  };

  const handleToggleRandomAesthetics = (e: any) => {
    const updated = StorageManager.saveData({ randomizeAesthetics: e.detail });
    setSavedData(updated);
    if (engineRef.current) {
      engineRef.current.savedData = updated;
    }
  };

  useEffect(() => {
    window.addEventListener('TOGGLE_RANDOM_AESTHETICS', handleToggleRandomAesthetics as any);
    return () => window.removeEventListener('TOGGLE_RANDOM_AESTHETICS', handleToggleRandomAesthetics as any);
  }, []);

  const handleToggleAudio = () => {
    const newSoundState = !savedData.soundEnabled;
    const updated = StorageManager.saveData({ soundEnabled: newSoundState });
    setSavedData(updated);
    audioEngine.setSoundEnabled(newSoundState);
  };

  const handleClaimAchievement = (achievementId: string, rewardStars: number, rewardDiamonds: number) => {
    const updatedClaimed = [...(savedData.claimedAchievementIds || [])];
    if (!updatedClaimed.includes(achievementId)) {
      updatedClaimed.push(achievementId);
    }
    const updated = StorageManager.saveData({
      totalStars: savedData.totalStars + rewardStars,
      totalDiamonds: savedData.totalDiamonds + rewardDiamonds,
      claimedAchievementIds: updatedClaimed
    });
    setSavedData(updated);
    if (engineRef.current) {
      engineRef.current.savedData = updated;
    }
    showToast('QUEST_COMPLETE', 'Achievement Claimed!', `You received ${rewardStars} stars and ${rewardDiamonds} diamonds!`);
  };

  const handleClaimDailyChallenge = () => {
    const res = DailyChallengeSystem.claimDailyReward(savedData);
    if (res.claimed) {
      setSavedData(res.updatedData);
      if (engineRef.current) {
        engineRef.current.savedData = res.updatedData;
      }
      showToast('QUEST_COMPLETE', 'Daily Challenge Complete!', `You claimed your reward for the daily challenge.`);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 flex justify-center items-center overflow-hidden font-sans select-none">
      <ToastContainer />
      {/* Game Canvas Container */}
      <div className="relative w-full max-w-[600px] h-full bg-slate-900 shadow-2xl overflow-hidden flex flex-col justify-center items-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full block touch-none cursor-pointer"
        />

        {/* 1. Main Menu Screen */}
        {gameMode === 'MENU' && (
          <MainMenu
            savedData={savedData}
            onStartGame={() => handleStartGame()}
            onOpenMultiplayer={() => setActiveModal('MULTIPLAYER')}
            onOpenHomePlanet={() => setActiveModal('HOME_PLANET')}
            onOpenWardrobe={() => setActiveModal('WARDROBE')}
            onOpenUpgrades={() => setActiveModal('UPGRADES')}
            onOpenAchievements={() => setActiveModal('ACHIEVEMENTS')}
            onOpenQuests={() => setActiveModal('QUESTS')}
            onOpenMedalChest={() => setActiveModal('MEDAL_CHEST')}
            onOpenLogin={() => setShowLoginModal(true)}
            onOpenDocs={() => setActiveModal('DOCS')}
            onOpenTutorial={() => setActiveModal('ONBOARDING')}
            onOpenMap={() => setActiveModal('MAP')}
            onToggleAudio={handleToggleAudio}
            onClaimDailyChallenge={handleClaimDailyChallenge}
          />
        )}

        {/* 2. HUD Game Overlay */}
        {gameMode === 'PLAYING' && engineRef.current && (
          <>
            <HUD
              stats={stats}
              currentStage={engineRef.current.questSystem.getCurrentStage()}
              isMagnetActive={engineRef.current.powerUpSystem.isMagnetActive}
              magnetTimer={engineRef.current.powerUpSystem.magnetTimer}
              magnetMaxTimer={engineRef.current.powerUpSystem.magnetDurationMax}
              isCometActive={engineRef.current.powerUpSystem.isCometActive}
              cometTimer={engineRef.current.powerUpSystem.cometTimer}
              cometMaxTimer={engineRef.current.powerUpSystem.cometDurationMax}
              isPlayerAttached={engineRef.current.player.isAttached}
              onPause={handlePauseGame}
              onTriggerJetpack={() => engineRef.current?.triggerJetpackRescue()}
              onTriggerRewind={() => engineRef.current?.triggerRewind()}
              onOpenStarGazing={handleOpenStarGazing}
            />

            {/* Multiplayer 1v1 In-Game HUD Overlay (When in a live match) */}
            {activeMultiplayerRoom && (
              <MultiplayerGameOverlay
                room={activeMultiplayerRoom}
                isHost={isMultiplayerHost}
                currentUserId={currentUser?.uid || 'guest'}
                isPlayerAttached={engineRef.current.player.isAttached}
                currentPlanetId={engineRef.current.player.currentPlanet?.id || null}
                onDeployTrap={handleDeployTrap}
                onLeaveMatch={handleLeaveMultiplayerMatch}
              />
            )}
          </>
        )}

        {/* 3. Pause Screen Overlay */}
        {gameMode === 'PAUSED' && (
          <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-white">
            <div className="bg-slate-900/95 border border-slate-750 rounded-3xl w-full max-w-xs p-6 flex flex-col items-center text-center shadow-2xl space-y-4 ui-interactive">
              <h2 className="text-2xl font-bold text-sky-400">Voyage Paused</h2>
              <div className="w-full space-y-2.5">
                <button
                  onClick={handleResumeGame}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl transition-all duration-200 shadow flex items-center justify-center gap-2 btn-grow glow-sky-hover"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Resume</span>
                </button>
                <button
                  onClick={() => handleStartGame()}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl border border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 btn-grow-sm glow-subtle-hover"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Run</span>
                </button>
                <button
                  onClick={() => setActiveModal('MAP')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded-xl border border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 text-xs btn-grow-sm glow-sky-hover"
                >
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sector Map</span>
                </button>
                <button
                  onClick={() => setActiveModal('ONBOARDING')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded-xl border border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 text-xs btn-grow-sm glow-amber-hover"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>How to Play</span>
                </button>
                <button
                  onClick={handleGoToMenu}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl border border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 btn-grow-sm glow-emerald-hover"
                >
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span>Main Menu</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Run Summary Screen Overlay */}
        {gameMode === 'GAMEOVER' && showPostRunSummary && (
          <PostRunSummaryModal 
             stats={stats} 
             onContinue={() => setShowPostRunSummary(false)} 
          />
        )}
        
        {/* 4. Game Over Screen Overlay */}
        {gameMode === 'GAMEOVER' && !showPostRunSummary && (
          <GameOverModal
            stats={stats}
            savedData={savedData}
            onRetry={() => handleStartGame()}
            onOpenWardrobe={() => setActiveModal('WARDROBE')}
            onOpenUpgrades={() => setActiveModal('UPGRADES')}
            onGoHome={handleGoToMenu}
          />
        )}

        {/* Modals */}
        {activeModal === 'ONBOARDING' && (
          <OnboardingTutorialOverlay onComplete={handleOnboardingComplete} />
        )}

        {activeModal === 'MAP' && (
          <GalaxyMapModal
            savedData={savedData}
            onClose={() => setActiveModal(null)}
            onSelectCheckpoint={handleSelectCheckpoint}
            onLaunchRun={handleLaunchFromMap}
          />
        )}

        {activeModal === 'TUTORIAL' && (
          <TutorialOverlay
            onComplete={handleTutorialComplete}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === 'WARDROBE' && (
          <WardrobeModal
            savedData={savedData}
            onClose={() => setActiveModal(null)}
            onSelectCostume={handleSelectCostume}
            onSelectRocketSkin={handleSelectRocketSkin}
            onUpdateData={setSavedData}
          />
        )}

        {activeModal === 'UPGRADES' && (
          <UpgradesModal
            savedData={savedData}
            onClose={() => setActiveModal(null)}
            onUpdateData={setSavedData}
          />
        )}

        {activeModal === 'ACHIEVEMENTS' && (
          <AchievementsModal
            savedData={savedData}
            onClose={() => setActiveModal(null)}
            onClaimAchievement={handleClaimAchievement}
          />
        )}

        {activeModal === 'QUESTS' && (
          <QuestLogModal
            stages={engineRef.current?.questSystem?.stages || []}
            currentStageIndex={engineRef.current?.questSystem?.currentStageIndex || 0}
            savedData={savedData}
            onUpdateData={setSavedData}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === 'MULTIPLAYER' && (
          <MultiplayerModal
            savedData={savedData}
            onClose={() => setActiveModal(null)}
            onStartMatch={handleStartMultiplayerMatch}
          />
        )}

        {activeModal === 'HOME_PLANET' && (
          <HomePlanetModal
            savedData={savedData}
            onClose={() => setActiveModal(null)}
            onUpdateSavedData={(updated) => {
              setSavedData(updated);
              if (engineRef.current) {
                engineRef.current.savedData = updated;
              }
            }}
          />
        )}

        {isStarGazingOpen && engineRef.current && (
          <StarGazingModal
            planet={engineRef.current.player.currentPlanet}
            altitude={stats.altitude}
            constellation={engineRef.current.currentConstellation}
            onClose={handleCloseStarGazing}
            onRewardClaimed={handleStarGazingReward}
          />
        )}

        {activeModal === 'MEDAL_CHEST' && (
          <MedalChestModal
            savedData={savedData}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* Level Goal Planetary Touchdown Victory Cutscene */}
        {levelVictoryData && (
          <LevelVictoryCutscene
            victoryData={levelVictoryData}
            onContinue={() => {
              setLevelVictoryData(null);
              if (engineRef.current && engineRef.current.state === 'PAUSED') {
                engineRef.current.resumeGame();
              }
            }}
            onOpenMedalChest={() => {
              setLevelVictoryData(null);
              setActiveModal('MEDAL_CHEST');
            }}
            onReturnToHQ={() => {
              setLevelVictoryData(null);
              handleGoToMenu();
            }}
          />
        )}

        {/* Authentication Login Screen (Enforces user login before play) */}
        {(!currentUser || showLoginModal) && (
          <LoginScreen
            onLoginSuccess={(mergedData, displayName) => {
              setSavedData(mergedData);
              if (engineRef.current) {
                engineRef.current.savedData = mergedData;
              }
              setCurrentUser(auth.currentUser);
              setShowLoginModal(false);
              showToast('SUCCESS', 'Starfleet Verification Confirmed', `Welcome Commander ${displayName}!`);
            }}
            onClose={currentUser ? () => setShowLoginModal(false) : undefined}
          />
        )}

        {activeModal === 'DOCS' && (
          <DocsViewerModal 
            onClose={() => setActiveModal(null)} 
            savedData={savedData}
            onToggleAudio={handleToggleAudio}
            onVolumeChange={handleVolumeChange}
            onClearData={() => {
              StorageManager.clearData();
              setSavedData(StorageManager.loadData());
              if (engineRef.current) {
                engineRef.current.savedData = StorageManager.loadData();
              }
              showToast('SUCCESS', 'Data Cleared', 'All progress has been reset.');
            }}
          />
        )}
      </div>
    </div>
  );
}


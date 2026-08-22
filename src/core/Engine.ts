import { audioEngine } from './AudioEngine';
import { PHYSICS_CONFIG, calculateTotalGearStats, calculateSkillBonuses, getXPForLevel, SPACE_ANOMALIES, ZODIAC_CONSTELLATIONS, getActiveSetBonus, LEVEL_PROGRESSION_PERKS, SECTOR_MILITARY_MEDALS, calculateTotalMedalBonuses, hasCraftedTool, COSMIC_GADGETS } from './Config';
import { StorageManager } from './Storage';
import { HapticManager } from '../utils/HapticManager';
import { Collectible } from '../entities/Collectible';
import { Planet } from '../entities/Planet';
import { Player } from '../entities/Player';
import { PowerUp } from '../entities/PowerUp';
import { ParticleSystem } from '../systems/ParticleSystem';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { PowerUpSystem } from '../systems/PowerUpSystem';
import { ProceduralGenerator } from '../systems/ProceduralGenerator';
import { QuestSystem } from '../systems/QuestSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { RicochetSystem } from '../systems/RicochetSystem';
import { DailyChallengeSystem } from '../systems/DailyChallengeSystem';
import { CosmicEventSystem } from '../systems/CosmicEventSystem';
import { GameMode, PlayerStats, UserSavedData, ActiveSpaceAnomaly, ConstellationData, SpaceAnomalyData, LevelVictoryData, CosmicGadgetId } from '../types/game';

interface PlayerStateSnapshot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  theta: number;
  isAttached: boolean;
  planetId: string | null;
  voidY: number;
  time: number;
}

export class Engine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public mode: GameMode = 'MENU';
  public savedData: UserSavedData;

  public player: Player;
  public planets: Planet[] = [];
  public collectibles: Collectible[] = [];
  public powerUps: PowerUp[] = [];

  public particleSystem: ParticleSystem;
  public physicsSystem: PhysicsSystem;
  public powerUpSystem: PowerUpSystem;
  public proceduralGenerator: ProceduralGenerator;
  public questSystem: QuestSystem;
  public renderSystem: RenderSystem;

  public cameraX: number = 0;
  public cameraY: number = 0;
  public voidY: number = 300; // Advancing dark void Y boundary
  public voidSpeed: number = PHYSICS_CONFIG.VOID_INITIAL_SPEED;

  public freezeTimer: number = 0;
  public freezeRatio: number = 0;
  public iceShieldTimer: number = 0;

  public darkPlanetStayTimer: number = 0;
  public stoneWarningTimer: number = 0;

  public isRewinding: boolean = false;
  public rewindTimer: number = 0;
  private stateHistory: PlayerStateSnapshot[] = [];
  private lastSafeLandedPlanet: Planet | null = null;

  public currentConstellation: ConstellationData | null = null;
  public activeAnomaly: ActiveSpaceAnomaly | null = null;

  public runAestheticSeed: number = 0;
  public stats: PlayerStats = {
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
    gadgetChargesRemaining: 2,
    equippedGadgetId: 'VOID_FLARE',
    iceShieldTimer: 0,
    isRewinding: false,
    fullOrbitsCompleted: 0,
    ricochetsExecuted: 0,
    petrificationRatio: 0,
    deathReason: 'VOID',
    currentLevelNumber: 1,
    currentLevelName: 'Verdant Stratosphere',
    phoenixReviveUsed: false,
    activeAnomaly: null,
    activeSynergy: null
  };

  private lastTime: number = 0;
  private animFrameId: number | null = null;
  public onStateChange: ((mode: GameMode) => void) | null = null;
  public onStatsUpdate: ((stats: PlayerStats) => void) | null = null;
  public onLevelVictory: ((data: LevelVictoryData) => void) | null = null;
  private runStartTime: number = Date.now();
  private thermalShieldUsed: boolean = false;
  private sectorFlashTimer: number = 0;
  private lastAnnouncedLevel: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.savedData = StorageManager.loadData();
    audioEngine.setSoundEnabled(this.savedData.soundEnabled);

    this.particleSystem = new ParticleSystem();
    this.player = new Player(this.savedData.activeCostumeId, this.savedData.activeRocketSkinId);
    this.powerUpSystem = new PowerUpSystem();
    this.proceduralGenerator = new ProceduralGenerator();
    this.questSystem = new QuestSystem(this.savedData);
    this.renderSystem = new RenderSystem(canvas.width, canvas.height);
    this.physicsSystem = new PhysicsSystem();

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    if (typeof window !== 'undefined') {
      (window as Window & { __controlsTest?: unknown }).__controlsTest = {
        getYaw: () => this.player.theta,
        getSpeed: () => Math.hypot(this.player.vx, this.player.vy),
        getMode: () => this.mode,
      };
    }
  }

  public resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = Math.min(parent.clientWidth, 600);
      this.canvas.height = parent.clientHeight;
      this.proceduralGenerator.init(this.canvas.width);
      this.renderSystem.generateBackgroundStars(this.canvas.width, this.canvas.height);
    }
  }

  public selectStartCheckpoint(checkpointId: string) {
    if (this.savedData.unlockedCheckpointIds.includes(checkpointId)) {
      this.savedData.selectedStartCheckpointId = checkpointId;
      StorageManager.saveData(this.savedData);
    }
  }

  public startNewGame(startCheckpointId?: string) {
    this.savedData = StorageManager.loadData();
    audioEngine.init();

    this.player = new Player(this.savedData.activeCostumeId, this.savedData.activeRocketSkinId);
    this.player.setEquippedGear(this.savedData.equippedGear);
    this.powerUpSystem.reset(this.player);

    const gearStats = calculateTotalGearStats(this.savedData.equippedGear);
    const skillBonuses = calculateSkillBonuses(this.savedData.skillTreeAllocations || ({} as any));
    const medalBonuses = calculateTotalMedalBonuses(this.savedData.unlockedMedalIds || []);
    const initialJetpack = (this.savedData.upgrades.jetpackLevel || 1) + (skillBonuses.freeJetpackCharges || 0) + medalBonuses.jetpackChargesBonus;
    const initialRewind = (this.savedData.upgrades.rewindLevel || 1) + (gearStats.rewindChargesBonus || 0) + medalBonuses.rewindChargesBonus;
    const equippedGadgetId = this.savedData.equippedGadgetId || 'VOID_FLARE';
    const gadgetDef = COSMIC_GADGETS.find((g) => g.id === equippedGadgetId) || COSMIC_GADGETS[0];
    const gadgetUnlocked = (this.savedData.unlockedGadgetIds || ['VOID_FLARE']).includes(gadgetDef.id);
    const initialGadgetCharges = gadgetUnlocked ? gadgetDef.chargesPerRun : 0;
    const checkpointToUse = startCheckpointId || this.savedData.selectedStartCheckpointId || 'CHECKPOINT_EARTH';

    const currentLevel = ProceduralGenerator.getLevelForPlanetIndex(1);
    this.currentConstellation = ProceduralGenerator.getConstellationForPlanetIndex(1);
    this.activeAnomaly = null;
    this.isRewinding = false;
    this.runAestheticSeed = Math.random() * 360;
    this.rewindTimer = 0;
    this.stateHistory = [];
    this.runStartTime = Date.now();
    this.thermalShieldUsed = false;
    this.sectorFlashTimer = 2.4;
    this.lastAnnouncedLevel = currentLevel.levelNumber;

    this.stats = {
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
      jetpackChargesRemaining: initialJetpack,
      rewindChargesRemaining: initialRewind,
      maxRewindCharges: initialRewind,
      gadgetChargesRemaining: initialGadgetCharges,
      equippedGadgetId: gadgetUnlocked ? gadgetDef.id : null,
      iceShieldTimer: 0,
      isRewinding: false,
      fullOrbitsCompleted: 0,
      ricochetsExecuted: 0,
      petrificationRatio: 0,
      currentCheckpointId: checkpointToUse,
      currentLevelNumber: currentLevel.levelNumber,
      currentLevelName: currentLevel.name,
      currentLevelSubtitle: currentLevel.subtitle,
      currentLevelTheme: currentLevel.themeDescription,
      sectorFlashTimer: 2.4,
      voidDistancePx: 420,
      voidEtaSeconds: 99,
      voidDangerRatio: 0,
      voidSpeedPx: PHYSICS_CONFIG.VOID_INITIAL_SPEED,
      currentConstellationId: this.currentConstellation?.id,
      currentConstellationName: this.currentConstellation?.name,
      currentZodiacGlyph: this.currentConstellation?.glyph,
      currentZodiacElement: this.currentConstellation?.element,
      currentZodiacElementIcon: this.currentConstellation?.elementIcon,
      currentZodiacColor: this.currentConstellation?.elementColor,
      activeAnomaly: null,
      deathReason: 'VOID',
      phoenixReviveUsed: false,
      activeSynergy: getActiveSetBonus(this.savedData.equippedGear)
    };

    this.proceduralGenerator.generateInitialCluster(this.planets, this.collectibles, this.powerUps, checkpointToUse);

    // Attach player to start planet
    const startPlanet = this.planets[0];
    this.lastSafeLandedPlanet = startPlanet;
    this.player.attachToPlanet(startPlanet, -Math.PI / 2);

    this.cameraX = this.player.x - this.canvas.width / 2;
    this.cameraY = this.player.y - this.canvas.height / 2;
    this.voidY = this.player.y + 420;
    this.voidSpeed = PHYSICS_CONFIG.VOID_INITIAL_SPEED;
    this.freezeTimer = 0;
    this.freezeRatio = 0;
    this.iceShieldTimer = 0;
    this.player.iceShieldActive = false;
    this.darkPlanetStayTimer = 0;
    this.stoneWarningTimer = 0;

    this.setMode('PLAYING');
    audioEngine.startMusic();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public triggerRewind(manual: boolean = false): boolean {
    if (this.mode !== 'PLAYING') return false;
    if (this.stats.rewindChargesRemaining <= 0) return false;

    this.stats.rewindChargesRemaining--;
    this.isRewinding = true;
    this.player.isRewinding = true;
    this.rewindTimer = 0.7;

    audioEngine.playRewindSound();
    HapticManager.triggerHeavy();
    this.renderSystem.triggerScreenShake(14, 0.35);

    const gearStats = calculateTotalGearStats(this.savedData.equippedGear);
    this.voidY += 480 + (gearStats.voidPushbackBonus || 0);

    // Reset hazard curses
    this.freezeTimer = 0;
    this.freezeRatio = 0;
    this.darkPlanetStayTimer = 0;
    this.player.petrificationRatio = 0;
    this.player.isPetrified = false;

    // Emit Rewind Chrono Sparkles
    this.particleSystem.emitLandingSparkles(this.player.x, this.player.y, '#fbbf24');

    // Restore to safe state: either from history snapshot ~2.5s ago or last safe landed planet
    if (this.lastSafeLandedPlanet) {
      this.player.attachToPlanet(this.lastSafeLandedPlanet, -Math.PI / 2);
    } else if (this.stateHistory.length > 0) {
      const snap = this.stateHistory[0];
      this.player.x = snap.x;
      this.player.y = snap.y;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.isAttached = snap.isAttached;
      this.player.theta = snap.theta;
    }

    return true;
  }

  public onChargeStart() {
    if (this.mode !== 'PLAYING') return;

    if (this.player.isAttached) {
      this.player.isCharging = true;
      this.player.chargeRatio = 0.08;
      HapticManager.triggerLight();
    } else {
      // Airborne: Check for Ricochet Rocket Shoes bounce or Jetpack Rescue
      const nearPlanet = RicochetSystem.findBounceTarget(this.player, this.planets, 50);
      if (nearPlanet) {
        RicochetSystem.executeRicochet(this.player, nearPlanet);
        this.stats.ricochetsExecuted++;
        this.stats.score += 200;
        audioEngine.playRicochet();
        HapticManager.triggerPerfectJump();
      } else if (this.stats.jetpackChargesRemaining > 0) {
        this.triggerJetpackRescue();
      }
    }
  }

  public onChargeRelease(holdDuration?: number) {
    if (this.mode !== 'PLAYING') return;

    if (this.player.isAttached && this.player.isCharging) {
      if (holdDuration !== undefined) {
        this.player.chargeRatio = Math.min(1.0, holdDuration / PHYSICS_CONFIG.CHARGE_TIME_MAX);
      }
      
      const isFullCharge = this.player.chargeRatio >= 0.85;
      const gearStats = calculateTotalGearStats(this.savedData.equippedGear);
      const skillBonuses = calculateSkillBonuses(this.savedData.skillTreeAllocations || ({} as any));
      const slingshotMultiplier = 1 + (gearStats.slingshotBonusPercent || 0) / 100 + skillBonuses.slingshotVelocityBonus;

      const launchVec = this.player.launch();
      if (launchVec) {
        this.player.vx *= slingshotMultiplier;
        this.player.vy *= slingshotMultiplier;

        audioEngine.playJump();
        if (isFullCharge) {
          HapticManager.triggerPerfectJump();
        } else {
          HapticManager.triggerMedium();
        }
        this.renderSystem.triggerScreenShake(5, 0.15);
        this.particleSystem.emitJetpackTrail(this.player.x, this.player.y, this.player.activeRocketSkin.flameColor);
      }
    }
  }

  public triggerJetpackRescue() {
    if (this.mode !== 'PLAYING') return;
    if (this.stats.jetpackChargesRemaining <= 0) return;

    HapticManager.triggerMedium();

    let targetPlanet: Planet | null = null;
    let minDist = Infinity;

    for (const p of this.planets) {
      if (p.y < this.player.y) {
        const dx = p.x - this.player.x;
        const dy = p.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          targetPlanet = p;
        }
      }
    }

    const targetX = targetPlanet ? targetPlanet.x : this.player.x;
    const targetY = targetPlanet ? targetPlanet.y : this.player.y - 450;

    this.stats.jetpackChargesRemaining--;
    this.player.activateJetpackThrust(targetX, targetY);
    this.voidY += 160; // Extra pushback on jetpack rescue
    audioEngine.playJetpack();
  }

  public triggerGadget(): boolean {
    if (this.mode !== 'PLAYING') return false;
    if ((this.stats.gadgetChargesRemaining || 0) <= 0) return false;

    const gadgetId = (this.stats.equippedGadgetId || this.savedData.equippedGadgetId) as CosmicGadgetId | null;
    if (!gadgetId) return false;
    const gadget = COSMIC_GADGETS.find((g) => g.id === gadgetId);
    if (!gadget) return false;

    this.stats.gadgetChargesRemaining = (this.stats.gadgetChargesRemaining || 1) - 1;
    this.player.gadgetFlashTimer = 0.7;
    this.particleSystem.emitLandingSparkles(this.player.x, this.player.y, gadget.color);
    this.renderSystem.triggerScreenShake(10, 0.22);
    HapticManager.triggerMedium();
    audioEngine.playPowerUpCollect();

    switch (gadget.effect) {
      case 'VOID_PUSH':
        this.voidY += 480;
        break;
      case 'STAR_BURST':
        this.spawnBurstCollectibles('STAR', 8, 46);
        this.stats.score += 120;
        break;
      case 'ICE_SHIELD':
        this.iceShieldTimer = 8;
        this.player.iceShieldActive = true;
        this.freezeTimer = 0;
        this.freezeRatio = 0;
        break;
      case 'DIAMOND_RAIN':
        this.spawnBurstCollectibles('DIAMOND', 4, 52);
        this.stats.score += 200;
        break;
      case 'ORBIT_BLESS': {
        const nearest = this.findNearestPlanet(true);
        if (nearest) {
          this.player.attachToPlanet(nearest);
          this.lastSafeLandedPlanet = nearest;
          this.voidY += 180;
          this.stats.score += 150;
        } else {
          this.pullTowardNearestPlanet();
        }
        break;
      }
      case 'MAGNET_PULSE':
        this.powerUpSystem.activateMagnet(this.savedData.upgrades, this.player);
        this.powerUpSystem.magnetTimer = Math.max(this.powerUpSystem.magnetTimer, 5.5);
        this.powerUpSystem.magnetRadius += 80;
        break;
      case 'SOLAR_CELL':
        this.powerUpSystem.activateComet(this.savedData.upgrades, this.player);
        this.stats.score += 250;
        this.voidY += 220;
        break;
      case 'GRAVITY_HOOK':
        this.pullTowardNearestPlanet();
        break;
      case 'PHOENIX_CHARM':
        this.stats.phoenixReviveUsed = false;
        this.stats.jetpackChargesRemaining += 1;
        this.voidY += 360;
        this.player.vy = Math.min(this.player.vy, -420);
        break;
    }

    this.stats.powerUpsUsedCount++;
    return true;
  }

  private spawnBurstCollectibles(type: 'STAR' | 'DIAMOND', count: number, radius: number) {
    for (let i = 0; i < count; i++) {
      const sa = (i / count) * Math.PI * 2;
      this.collectibles.push(
        new Collectible({
          id: `gadget_${type}_${Date.now()}_${i}`,
          x: this.player.x + Math.cos(sa) * radius,
          y: this.player.y + Math.sin(sa) * radius,
          type,
          radius: type === 'DIAMOND' ? 11 : 9
        })
      );
    }
  }

  private findNearestPlanet(preferAbove: boolean): Planet | null {
    let best: Planet | null = null;
    let minDist = Infinity;
    for (const p of this.planets) {
      if (preferAbove && p.y > this.player.y + 40) continue;
      const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (dist < minDist) {
        minDist = dist;
        best = p;
      }
    }
    return best;
  }

  private pullTowardNearestPlanet() {
    const target = this.findNearestPlanet(true) || this.findNearestPlanet(false);
    if (!target) {
      this.player.vy = -PHYSICS_CONFIG.JETPACK_THRUST_SPEED;
      return;
    }
    this.player.activateJetpackThrust(target.x, target.y);
  }

  private findNearbyPlanetForRicochet(): Planet | null {
    for (const planet of this.planets) {
      const dx = this.player.x - planet.x;
      const dy = this.player.y - planet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= planet.radius + PHYSICS_CONFIG.SURFACE_OFFSET + 45) {
        return planet;
      }
    }
    return null;
  }

  public get state(): GameMode {
    return this.mode;
  }

  public setMode(newMode: GameMode) {
    this.mode = newMode;
    if (this.onStateChange) {
      this.onStateChange(newMode);
    }
  }

  public pauseGame() {
    if (this.mode === 'PLAYING') {
      this.setMode('PAUSED');
      audioEngine.pauseMusic();
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    }
  }

  public resumeGame() {
    if (this.mode === 'PAUSED') {
      this.setMode('PLAYING');
      audioEngine.resumeMusic();
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  private loop = (now: number) => {
    if (this.mode !== 'PLAYING') return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // Cap delta to prevent tunneling
    this.lastTime = now;

    this.update(dt);
    this.render(dt);

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public awardXP(baseAmount: number) {
    const gearStats = calculateTotalGearStats(this.savedData.equippedGear);
    const skillBonuses = calculateSkillBonuses(this.savedData.skillTreeAllocations || ({} as any));
    const bonusMult = 1 + (gearStats.xpBonusPercent || 0) / 100 + skillBonuses.xpMultiplierBonus;
    const finalXP = Math.max(1, Math.round(baseAmount * bonusMult));

    this.stats.xpEarnedRun += finalXP;
    this.savedData.playerXP = (this.savedData.playerXP || 0) + finalXP;

    // Check for level ups
    let reqXP = getXPForLevel(this.savedData.playerLevel || 1);
    while (this.savedData.playerXP >= reqXP) {
      this.savedData.playerXP -= reqXP;
      this.savedData.playerLevel = (this.savedData.playerLevel || 1) + 1;
      this.savedData.skillPointsAvailable = (this.savedData.skillPointsAvailable || 0) + 1;
      reqXP = getXPForLevel(this.savedData.playerLevel);

      // Check for level progression perks reward (Stars, Diamonds, or Gear unlocks)
      const currentPerk = LEVEL_PROGRESSION_PERKS.find((p) => p.level === this.savedData.playerLevel);
      if (currentPerk) {
        if (currentPerk.rewardStars) {
          this.savedData.totalStars += currentPerk.rewardStars;
          this.stats.starsCollected += currentPerk.rewardStars;
        }
        if (currentPerk.rewardDiamonds) {
          this.savedData.totalDiamonds += currentPerk.rewardDiamonds;
          this.stats.diamondsCollected += currentPerk.rewardDiamonds;
        }
        if (currentPerk.unlockedGearId) {
          if (!this.savedData.unlockedGearIds) this.savedData.unlockedGearIds = [];
          if (!this.savedData.unlockedGearIds.includes(currentPerk.unlockedGearId)) {
            this.savedData.unlockedGearIds.push(currentPerk.unlockedGearId);
          }
        }
      }

      audioEngine.playLevelUpFanfare();
      this.renderSystem.triggerScreenShake(14, 0.35);
      this.particleSystem.emitLandingSparkles(this.player.x, this.player.y, '#facc15');
    }

    StorageManager.saveData(this.savedData);
  }

  private update(dt: number) {
    // Particle system update
    this.particleSystem.update(dt);

    // Rewind visual timer countdown
    if (this.isRewinding) {
      this.rewindTimer -= dt;
      if (this.rewindTimer <= 0) {
        this.isRewinding = false;
        this.player.isRewinding = false;
        this.stats.isRewinding = false;
      } else {
        this.stats.isRewinding = true;
      }
    } else {
      // Record player state snapshot for rewind buffer (up to ~4s of flight)
      this.stateHistory.push({
        x: this.player.x,
        y: this.player.y,
        vx: this.player.vx,
        vy: this.player.vy,
        theta: this.player.theta,
        isAttached: this.player.isAttached,
        planetId: this.player.currentPlanet?.id || null,
        voidY: this.voidY,
        time: performance.now()
      });
      if (this.stateHistory.length > 240) {
        this.stateHistory.shift();
      }
    }

    // 1. Update Player & Hold-to-Charge Jump Strength
    if (this.player.isAttached && this.player.isCharging) {
      this.player.chargeRatio = Math.min(1.0, this.player.chargeRatio + dt / PHYSICS_CONFIG.CHARGE_TIME_MAX);
      audioEngine.playChargeSound(this.player.chargeRatio);
    }

    this.player.update(dt);

    // Track Rotations & Orbit Rewards on current planet
    if (this.player.isAttached && this.player.currentPlanet) {
      const fullOrbits = Math.floor(this.player.rotationAccumulator / (Math.PI * 2));
      this.stats.planetRotationsCurrent = fullOrbits;

      // Full 360-Degree Orbit Reward!
      if (this.player.rotationAccumulator >= Math.PI * 2) {
        this.player.rotationAccumulator -= Math.PI * 2;
        this.stats.fullOrbitsCompleted++;
        const orbitFortune = calculateSkillBonuses(this.savedData.skillTreeAllocations || ({} as any)).orbitFortuneStars || 0;
        this.stats.starsCollected += 15 + orbitFortune;
        this.stats.score += 250;
        this.awardXP(40);
        audioEngine.playFullOrbit();
        this.renderSystem.triggerScreenShake(4, 0.15);

        // Spawn bonus orbiting stars around current planet
        const currentPlanet = this.player.currentPlanet;
        for (let i = 0; i < 5; i++) {
          const sa = (i / 5) * Math.PI * 2;
          const sx = currentPlanet.x + (currentPlanet.radius + 30) * Math.cos(sa);
          const sy = currentPlanet.y + (currentPlanet.radius + 30) * Math.sin(sa);
          this.collectibles.push(
            new Collectible({
              id: `orbit_star_${Date.now()}_${i}`,
              x: sx,
              y: sy,
              type: 'STAR',
              radius: 9
            })
          );
        }
      }

      // Check Surface Hazards Collision (Spikes, Lava Vents, Urchins)
      this.player.hazardCooldown = Math.max(0, this.player.hazardCooldown - dt);
      if (this.player.hazardCooldown <= 0) {
        const hazardHit = PhysicsSystem.checkSurfaceHazards(this.player, this.player.currentPlanet);
        if (hazardHit) {
          this.player.hazardCooldown = 1.2;
          audioEngine.playHazardHit();
          HapticManager.triggerAnomalyHit();
          this.particleSystem.emitHazardImpact(this.player.x, this.player.y);
          this.renderSystem.triggerScreenShake(14, 0.35);
          this.voidY -= 150; // Void advances rapidly as penalty
          this.stats.consecutivePerfectJumps = 0;
        }
      }
    }

    // 2. Physics & Gravity update when airborne
    if (!this.player.isAttached) {
      this.particleSystem.emitJetpackTrail(this.player.x, this.player.y, this.player.activeRocketSkin.flameColor);

      const gravity = PhysicsSystem.calculateGravitationalAcceleration(this.player.x, this.player.y, this.planets);
      
      // Anomaly gravity modulation (e.g. Gravity Surge or Solar Flare Storm)
      let gravMult = 1.0;
      if (this.activeAnomaly) {
        if (this.activeAnomaly.data.type === 'GRAVITY_SURGE') {
          gravMult = 1.45;
        } else if (this.activeAnomaly.data.type === 'DARK_MATTER_PULSE') {
          gravMult = 0.75;
        }
      }

      const gravMag = Math.hypot(gravity.x * gravMult, gravity.y * gravMult);
      this.player.gravityIntensity = Math.min(1.0, gravMag / 800);

      this.player.vx += gravity.x * gravMult * dt;
      this.player.vy += gravity.y * gravMult * dt;

      // Check landing on planets
      const landing = PhysicsSystem.checkLanding(this.player, this.planets);
      if (landing) {
        this.onLandOnPlanet(landing.planet, landing.contactAngle);
      }
    } else {
      this.player.gravityIntensity = 0;
    }

    // 2b. Update Active Space Anomaly Dynamic Events
    if (this.activeAnomaly) {
      this.activeAnomaly.durationRemaining -= dt;

      // Handle Asteroid Shower meteors
      if (this.activeAnomaly.data.type === 'ASTEROID_SHOWER' && this.activeAnomaly.activeHazards) {
        for (let i = this.activeAnomaly.activeHazards.length - 1; i >= 0; i--) {
          const h = this.activeAnomaly.activeHazards[i];
          h.x += h.vx * dt;
          h.y += h.vy * dt;
          h.rotation += h.rotSpeed * dt;

          // Wrap or respawn meteor near player
          if (h.y > this.player.y + 700 || h.x < this.player.x - 600 || h.x > this.player.x + 600) {
            h.x = this.player.x + (Math.random() - 0.5) * 800;
            h.y = this.player.y - 700 - Math.random() * 300;
            h.vx = (Math.random() - 0.5) * 120;
            h.vy = Math.random() * 220 + 160;
          }

          // Check player collision with flying meteor
          const dx = this.player.x - h.x;
          const dy = this.player.y - h.y;
          const distSq = dx * dx + dy * dy;
          const minColDist = this.player.radius + h.radius;

          if (distSq <= minColDist * minColDist) {
            this.player.vx += (dx / Math.sqrt(distSq || 1)) * 320;
            this.player.vy += -240;
            this.renderSystem.triggerScreenShake(15, 0.35);
            this.particleSystem.emitHazardImpact(this.player.x, this.player.y);
            audioEngine.playHazardHit();
            this.voidY -= 100; // Void push penalty
            this.stats.consecutivePerfectJumps = 0;
            // Respawn hazard higher up
            h.y = this.player.y - 800;
          }
        }
      }

      // Handle Starlight Shower spontaneous star spawns
      if (this.activeAnomaly.data.type === 'STARLIGHT_SHOWER' && Math.random() < 0.08) {
        const spawnX = this.player.x + (Math.random() - 0.5) * 350;
        const spawnY = this.player.y - 300 - Math.random() * 200;
        this.collectibles.push(
          new Collectible({
            id: `starlight_shower_${Date.now()}_${Math.random()}`,
            x: spawnX,
            y: spawnY,
            type: Math.random() < 0.15 ? 'DIAMOND' : 'STAR',
            radius: 9
          })
        );
      }

      // Check Anomaly Expiration
      if (this.activeAnomaly.durationRemaining <= 0) {
        this.activeAnomaly = null;
        this.stats.activeAnomaly = null;
      } else {
        this.stats.activeAnomaly = this.activeAnomaly;
      }
    }

    // 3. Collectibles Check
    const gearStats = calculateTotalGearStats(this.savedData.equippedGear);
    const skillBonuses = calculateSkillBonuses(this.savedData.skillTreeAllocations || ({} as any));

    const magnetRadius = this.powerUpSystem.magnetRadius + (gearStats.magnetRadiusBonus || 0) + skillBonuses.magnetRadiusBonus;
    const isMagnetActive = this.powerUpSystem.isMagnetActive;

    this.collectibles.forEach((c) => {
      if (c.collected) return;
      c.update(dt, this.player.x, this.player.y, isMagnetActive, magnetRadius);

      const dx = this.player.x - c.x;
      const dy = this.player.y - c.y;
      const distSq = dx * dx + dy * dy;

      if (distSq <= (this.player.radius + c.radius) * (this.player.radius + c.radius)) {
        c.collected = true;
        if (c.type === 'STAR') {
          const activeEvent = CosmicEventSystem.getActiveEvent();
          const starMultiplier = activeEvent.id === 'METEOR_SHOWER' ? 1.5 : 1;
          this.stats.starsCollected++;
          const multiplier = (1 + (this.savedData.upgrades.multiplierLevel - 1) * 0.2) * (1 + (gearStats.scoreBonusPercent || 0) / 100 + skillBonuses.scoreMultiplierBonus);
          this.stats.score += Math.round(10 * multiplier * starMultiplier);
          const xpMultiplier = activeEvent.id === 'VOID_ECLIPSE' ? 2 : 1;
          this.awardXP(2 * xpMultiplier);
          audioEngine.playStarCollect(this.stats.consecutivePerfectJumps);
        } else {
          this.stats.diamondsCollected++;
          this.stats.score += 100;
          this.awardXP(20);
          audioEngine.playDiamondCollect();
        }
      }
    });

    // 4. PowerUps Check
    this.powerUps.forEach((pu) => {
      if (pu.collected) return;
      pu.update(dt);

      const dx = this.player.x - pu.x;
      const dy = this.player.y - pu.y;
      const distSq = dx * dx + dy * dy;

      if (distSq <= (this.player.radius + pu.radius) * (this.player.radius + pu.radius)) {
        pu.collected = true;
        this.stats.powerUpsUsedCount++;
        audioEngine.playPowerUpCollect();
        this.awardXP(15);

        if (pu.type === 'MAGNET') {
          this.powerUpSystem.activateMagnet(this.savedData.upgrades, this.player);
        } else if (pu.type === 'COMET') {
          this.powerUpSystem.activateComet(this.savedData.upgrades, this.player);
          this.voidY += PHYSICS_CONFIG.VOID_PUSHBACK_COMET + (skillBonuses.cometVoidPushBonus || 0);
        } else if (pu.type === 'REWIND') {
          // Extra Rewind Charge + Void Pushback + Holographic Aura
          this.stats.rewindChargesRemaining = Math.min(this.stats.rewindChargesRemaining + 1, this.stats.maxRewindCharges + 2);
          this.voidY += 350;
          this.freezeTimer = 0;
          this.freezeRatio = 0;
          audioEngine.playClockTick();
          this.particleSystem.emitLandingSparkles(this.player.x, this.player.y, '#fbbf24');
        }
      }
    });

    this.powerUpSystem.update(dt, this.player);

    // 5. Update Planets
    this.planets.forEach((p) => p.update(dt));

    // 6. Altitude & Smooth 2D Camera Centering on Player
    const currentAlt = Math.max(0, Math.floor(-this.player.y));
    this.stats.altitude = currentAlt;
    this.player.currentAltitude = currentAlt;
    if (this.currentConstellation) {
      this.player.constellationColor = this.currentConstellation.elementColor;
    }
    if (currentAlt > this.stats.maxAltitude) {
      this.stats.maxAltitude = currentAlt;
      this.stats.score += 2; // Altitude score bonus
    }

    // Centering camera on player in both X and Y
    const targetCamX = this.player.x - this.canvas.width / 2;
    const targetCamY = this.player.y - this.canvas.height / 2;
    this.cameraX += (targetCamX - this.cameraX) * (7 * dt);
    this.cameraY += (targetCamY - this.cameraY) * (7 * dt);

    // 7. Procedural World Spawning ahead of player
    this.proceduralGenerator.generateUpTo(this.player.y - 1800, this.planets, this.collectibles, this.powerUps);
    this.proceduralGenerator.cleanupFarObjects(this.cameraY + this.canvas.height, this.planets, this.collectibles, this.powerUps);

    // 8. Advancing Dark Void
    const voidSlow = 1 - Math.min(0.55, skillBonuses.voidSlowRatio || 0);
    this.voidSpeed = (PHYSICS_CONFIG.VOID_INITIAL_SPEED + (this.stats.maxAltitude / 1000) * PHYSICS_CONFIG.VOID_SPEED_ACCELERATION) * voidSlow;
    this.voidY -= this.voidSpeed * dt;

    const distToVoid = this.voidY - this.player.y;
    audioEngine.updateVoidWarning(distToVoid);
    this.stats.voidDistancePx = distToVoid;
    this.stats.voidSpeedPx = this.voidSpeed;
    this.stats.voidEtaSeconds = this.voidSpeed > 1 ? Math.max(0, distToVoid / this.voidSpeed) : 99;
    const compass = hasCraftedTool(this.savedData.homePlanet?.craftedTools as Array<{ id: string }> | undefined, 'VOID_COMPASS');
    const warnDist = compass ? 860 : 720;
    this.stats.voidDangerRatio = Math.max(0, Math.min(1, 1 - distToVoid / warnDist));
    this.sectorFlashTimer = Math.max(0, this.sectorFlashTimer - dt);
    this.stats.sectorFlashTimer = this.sectorFlashTimer;

    this.iceShieldTimer = Math.max(0, this.iceShieldTimer - dt);
    this.player.iceShieldActive = this.iceShieldTimer > 0;
    this.stats.iceShieldTimer = this.iceShieldTimer;

    // 9. Deep Space Freezing Check (with Cryo gear and skill resistances)
    const freezeResist = Math.min(0.85, (gearStats.freezeResistancePercent || 0) / 100 + skillBonuses.freezeResistance);
    const freezeRate = 1 - freezeResist;

    if (this.iceShieldTimer > 0) {
      this.freezeTimer = 0;
      this.freezeRatio = 0;
    } else if (!this.player.isAttached) {
      let minPlanetDist = Infinity;
      let closestPlanet: Planet | null = null;
      for (const p of this.planets) {
        const dx = p.x - this.player.x;
        const dy = p.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minPlanetDist) {
          minPlanetDist = dist;
          closestPlanet = p;
        }
      }

      const safeThreshold = closestPlanet ? closestPlanet.radius + 360 : 450;
      if (minPlanetDist > safeThreshold && this.stats.jetpackChargesRemaining <= 0) {
        this.freezeTimer += dt * freezeRate;
        this.freezeRatio = Math.min(1.0, this.freezeTimer / 2.5);

        if (Math.random() < 0.12) {
          audioEngine.playFreezeWarning();
          HapticManager.triggerFreezeShiver();
        }

        if (this.freezeTimer >= 2.5) {
          // Attempt Auto-Rewind Rescue if charges are available
          if (this.stats.rewindChargesRemaining > 0 && this.triggerRewind()) {
            return;
          }
          this.stats.deathReason = 'FROZEN';
          this.gameOver();
          return;
        }
      } else {
        this.freezeTimer = Math.max(0, this.freezeTimer - dt * 2);
        this.freezeRatio = Math.min(1.0, this.freezeTimer / 2.5);
      }
    } else {
      this.freezeTimer = 0;
      this.freezeRatio = 0;
    }

    // 9b. Dark Planet Petrification Curse Check (with Dark Curse gear & skill resistances)
    const curseResist = Math.min(0.85, (gearStats.darkCurseResistancePercent || 0) / 100 + skillBonuses.stoneCurseDelay);
    const curseRate = 1 - curseResist;

    if (this.player.isAttached && (this.player.currentPlanet?.type === 'DARK' || this.player.currentPlanet?.isDark)) {
      this.darkPlanetStayTimer += dt * curseRate;
      this.player.petrificationRatio = Math.min(1.0, this.darkPlanetStayTimer / 3.5);
      this.stats.petrificationRatio = this.player.petrificationRatio;

      // Audio warnings as petrification escalates
      this.stoneWarningTimer -= dt;
      if (this.stoneWarningTimer <= 0) {
        this.stoneWarningTimer = 0.55;
        audioEngine.playStoneWarning(this.player.petrificationRatio);
      }

      if (this.player.petrificationRatio > 0.55 && Math.random() < 0.15) {
        audioEngine.playStoneCrack();
      }

      // Complete Petrification Death
      if (this.darkPlanetStayTimer >= 3.5) {
        if (this.stats.rewindChargesRemaining > 0 && this.triggerRewind()) {
          return;
        }
        this.stats.deathReason = 'PETRIFIED';
        this.player.isPetrified = true;
        audioEngine.playPetrifiedDeath();
        this.particleSystem.emitHazardImpact(this.player.x, this.player.y);
        this.renderSystem.triggerScreenShake(16, 0.4);
        this.gameOver();
        return;
      }
    } else {
      // Leaping off dark planet cures stone curse rapidly
      this.darkPlanetStayTimer = Math.max(0, this.darkPlanetStayTimer - dt * 2.8);
      this.player.petrificationRatio = Math.min(1.0, this.darkPlanetStayTimer / 3.5);
      this.stats.petrificationRatio = this.player.petrificationRatio;
    }

    // 10. Death Condition Check (Dark Void engulf with Phoenix Nova Rebirth capability or Rewind)
    if (this.player.y >= this.voidY || this.player.y > this.cameraY + this.canvas.height + 250) {
      if (this.stats.rewindChargesRemaining > 0 && this.triggerRewind()) {
        return;
      }

      const medalBonuses = calculateTotalMedalBonuses(this.savedData.unlockedMedalIds || []);
      if (medalBonuses.hasThermalShield && !this.thermalShieldUsed) {
        this.thermalShieldUsed = true;
        this.voidY += 550;
        this.player.vy = -680;
        this.player.vx = 0;
        this.renderSystem.triggerScreenShake(18, 0.45);
        this.particleSystem.emitLandingSparkles(this.player.x, this.player.y, '#f59e0b');
        audioEngine.playPowerUpCollect();
        return;
      }

      if (skillBonuses.hasPhoenixRebirth && !this.stats.phoenixReviveUsed) {
        this.stats.phoenixReviveUsed = true;
        this.voidY += 500; // Void blasted downward by phoenix explosion
        this.player.vy = -750; // Super launch upward
        this.player.vx = 0;
        this.renderSystem.triggerScreenShake(20, 0.5);
        this.particleSystem.emitLandingSparkles(this.player.x, this.player.y, '#f59e0b');
        audioEngine.playPowerUpCollect();
        return;
      }

      if (this.stats.equippedGadgetId === 'PHOENIX_CHARM' && (this.stats.gadgetChargesRemaining || 0) > 0) {
        this.triggerGadget();
        this.player.vy = -750;
        this.player.vx = 0;
        return;
      }

      this.stats.deathReason = 'VOID';
      this.gameOver();
      return;
    }

    // 11. Dynamic Music Altitude & Intensity modulation
    const playerSpeed = Math.hypot(this.player.vx, this.player.vy);
    const speedRatio = Math.min(1.0, playerSpeed / 800);
    audioEngine.updateAltitudeMusic(this.stats.altitude, speedRatio);

    // 12. Update Quests
    const questResult = this.questSystem.updateMetrics(this.stats);
    if (questResult.stageCleared) {
      this.savedData.totalStars += questResult.rewardStars;
      this.savedData.totalDiamonds += questResult.rewardDiamonds;
      this.savedData.completedStageIds.push(this.questSystem.stages[this.questSystem.currentStageIndex].stageId);
      this.savedData.currentStageIndex = this.questSystem.currentStageIndex;
      StorageManager.saveData(this.savedData);
    }

    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.stats);
    }
  }

  private onLandOnPlanet(planet: Planet, contactAngle: number) {
    this.lastSafeLandedPlanet = planet;
    this.player.attachToPlanet(planet, contactAngle);
    audioEngine.playLand();

    this.particleSystem.emitLandingSparkles(this.player.x, this.player.y, planet.color);
    this.renderSystem.triggerScreenShake(8, 0.2);

    this.stats.planetsLandedCount++;

    // Update current level and biome information
    const currentLevel = ProceduralGenerator.getLevelForPlanetIndex(this.stats.planetsLandedCount);
    if (currentLevel.levelNumber !== this.lastAnnouncedLevel) {
      this.lastAnnouncedLevel = currentLevel.levelNumber;
      this.sectorFlashTimer = 2.6;
      this.renderSystem.triggerScreenShake(14, 0.35);
      audioEngine.playCheckpointUnlocked();
    }
    this.stats.currentLevelNumber = currentLevel.levelNumber;
    this.stats.currentLevelName = currentLevel.name;
    this.stats.currentLevelSubtitle = currentLevel.subtitle;
    this.stats.currentLevelTheme = currentLevel.themeDescription;

    // Update current Zodiac Constellation & Constellation Progress
    this.currentConstellation = ProceduralGenerator.getConstellationForPlanetIndex(this.stats.planetsLandedCount);
    if (this.currentConstellation) {
      this.stats.currentConstellationId = this.currentConstellation.id;
      this.stats.currentConstellationName = this.currentConstellation.name;
      this.stats.currentZodiacGlyph = this.currentConstellation.glyph;
      this.stats.currentZodiacElement = this.currentConstellation.element;
      this.stats.currentZodiacElementIcon = this.currentConstellation.elementIcon;
      this.stats.currentZodiacColor = this.currentConstellation.elementColor;
      this.stats.currentConstellationMinPlanet = this.currentConstellation.minPlanetIndex;
      this.stats.currentConstellationMaxPlanet = this.currentConstellation.maxPlanetIndex;
      this.stats.currentConstellationStars = this.currentConstellation.stars;
      this.stats.currentConstellationLines = this.currentConstellation.lines;

      const cSpan = Math.max(1, this.currentConstellation.maxPlanetIndex - this.currentConstellation.minPlanetIndex);
      const cCurrent = Math.max(0, this.stats.planetsLandedCount - this.currentConstellation.minPlanetIndex);
      this.stats.currentConstellationProgressRatio = Math.min(1.0, cCurrent / cSpan);

      // Track discovered constellation lore in archive
      if (!this.savedData.discoveredConstellationIds) {
        this.savedData.discoveredConstellationIds = [];
      }
      if (!this.savedData.discoveredConstellationIds.includes(this.currentConstellation.id)) {
        this.savedData.discoveredConstellationIds.push(this.currentConstellation.id);
      }

      // Celestial haptic when reaching new constellation boundary
      if (cCurrent === 0 && this.stats.planetsLandedCount > 1) {
        HapticManager.triggerConstellationComplete();
      }
    }

    // Track discovered planet type lore in archive
    if (!this.savedData.discoveredPlanetTypes) {
      this.savedData.discoveredPlanetTypes = [];
    }
    if (planet.type && !this.savedData.discoveredPlanetTypes.includes(planet.type)) {
      this.savedData.discoveredPlanetTypes.push(planet.type);
    }

    // Trigger Random Space Anomaly every 50 planets!
    if (this.stats.planetsLandedCount > 0 && this.stats.planetsLandedCount % 50 === 0 && !this.activeAnomaly) {
      this.triggerRandomSpaceAnomaly();
    }

    const gearStats = calculateTotalGearStats(this.savedData.equippedGear);
    const skillBonuses = calculateSkillBonuses(this.savedData.skillTreeAllocations || ({} as any));

    // Award planetary exploration XP
    this.awardXP(15);

    // Checkpoint Goal Planet Landing & Discovery
    if (planet.isCheckpoint && planet.checkpointId) {
      this.stats.currentCheckpointId = planet.checkpointId;
      if (!this.savedData.unlockedCheckpointIds.includes(planet.checkpointId)) {
        this.savedData.unlockedCheckpointIds.push(planet.checkpointId);
        
        const cpRewardBonus = 1 + skillBonuses.checkpointRewardBonus;
        const starReward = Math.round(100 * cpRewardBonus);
        const diamondReward = Math.round(5 * cpRewardBonus);

        this.savedData.totalStars += starReward;
        this.savedData.totalDiamonds += diamondReward;
        this.stats.starsCollected += starReward;
        this.stats.diamondsCollected += diamondReward;
        this.stats.score += 1000;
        this.awardXP(150);

        audioEngine.playCheckpointUnlocked();
        this.particleSystem.emitLandingSparkles(this.player.x, this.player.y, '#facc15');
        this.renderSystem.triggerScreenShake(14, 0.35);
        StorageManager.saveData(this.savedData);
      }
    }

    // Sector Level Final Planet Victory & Military Commendation Medal Ceremony
    if (planet.isLevelGoal) {
      const levelNumber = planet.levelGoalNumber || currentLevel.levelNumber;
      const medal = SECTOR_MILITARY_MEDALS.find((m) => m.levelNumber === levelNumber) || SECTOR_MILITARY_MEDALS[0];

      if (!this.savedData.unlockedMedalIds) {
        this.savedData.unlockedMedalIds = [];
      }
      if (!this.savedData.completedLevelNumbers) {
        this.savedData.completedLevelNumbers = [];
      }

      const isFirstClear = !this.savedData.completedLevelNumbers.includes(levelNumber);

      if (isFirstClear) {
        this.savedData.completedLevelNumbers.push(levelNumber);
      }
      if (!this.savedData.unlockedMedalIds.includes(medal.id)) {
        this.savedData.unlockedMedalIds.push(medal.id);
      }

      const clearBonusStars = isFirstClear ? 500 * levelNumber : 150 * levelNumber;
      const clearBonusDiamonds = isFirstClear ? 25 * levelNumber : 5 * levelNumber;
      this.savedData.totalStars += clearBonusStars;
      this.savedData.totalDiamonds += clearBonusDiamonds;
      this.stats.starsCollected += clearBonusStars;
      this.stats.diamondsCollected += clearBonusDiamonds;
      this.stats.score += 5000 * levelNumber;
      this.awardXP(300 * levelNumber);

      StorageManager.saveData(this.savedData);

      audioEngine.playCheckpointUnlocked();
      this.particleSystem.emitLandingSparkles(this.player.x, this.player.y, '#fbbf24');
      this.renderSystem.triggerScreenShake(20, 0.5);

      const victoryData: LevelVictoryData = {
        levelNumber,
        levelName: currentLevel.name,
        subtitle: currentLevel.subtitle,
        targetPlanetIndex: this.stats.planetsLandedCount,
        isFirstClear,
        medalAwarded: medal,
        stats: {
          planetsLanded: this.stats.planetsLandedCount,
          altitudeReached: Math.round(this.stats.altitude),
          starsCollected: this.stats.starsCollected,
          diamondsCollected: this.stats.diamondsCollected,
          perfectJumps: this.stats.consecutivePerfectJumps,
          runScore: this.stats.score,
          timeElapsedSeconds: Math.max(1, Math.floor((Date.now() - this.runStartTime) / 1000))
        }
      };

      this.setMode('PAUSED');
      if (this.onLevelVictory) {
        this.onLevelVictory(victoryData);
      }
    }

    if (!planet.visited) {
      planet.visited = true;
      // Void pushback reward for new planet landing (+ gear and skill pushbacks)
      const pushbackBonus = (gearStats.voidPushbackBonus || 0) + skillBonuses.voidPushbackBonus + (skillBonuses.extraLandingPush || 0);
      this.voidY += PHYSICS_CONFIG.VOID_PUSHBACK_ON_LAND + pushbackBonus;

      this.stats.consecutivePerfectJumps++;
      if (this.stats.consecutivePerfectJumps > this.stats.maxConsecutiveJumps) {
        this.stats.maxConsecutiveJumps = this.stats.consecutivePerfectJumps;
      }
      HapticManager.triggerMedium();
    } else {
      // Re-landing on visited planet breaks combo streak
      this.stats.consecutivePerfectJumps = 0;
      HapticManager.triggerLight();
    }

    if (planet.type === 'SUN') {
      this.stats.sunsLandedCount++;
      const sunStars = Math.round(10 * (1 + skillBonuses.sunBonusStars));
      this.stats.starsCollected += sunStars;
      this.awardXP(25);
    }
  }

  public triggerRandomSpaceAnomaly(forcedAnomalyType?: string) {
    const anomalyPool = SPACE_ANOMALIES;
    let selectedData: SpaceAnomalyData;

    if (forcedAnomalyType) {
      selectedData = anomalyPool.find((a) => a.type === forcedAnomalyType) || anomalyPool[0];
    } else {
      const randIdx = Math.floor(Math.random() * anomalyPool.length);
      selectedData = anomalyPool[randIdx];
    }

    const activeHazards: ActiveSpaceAnomaly['activeHazards'] = [];
    if (selectedData.type === 'ASTEROID_SHOWER') {
      for (let i = 0; i < 8; i++) {
        activeHazards.push({
          id: `meteor_${Date.now()}_${i}`,
          x: this.player.x + (Math.random() - 0.5) * 800,
          y: this.player.y - 400 - Math.random() * 500,
          vx: (Math.random() - 0.5) * 140,
          vy: Math.random() * 220 + 160,
          radius: Math.random() * 14 + 10,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 4,
          color: '#78716c',
          trailColor: '#f97316'
        });
      }
    }

    this.activeAnomaly = {
      data: selectedData,
      durationRemaining: selectedData.duration,
      totalDuration: selectedData.duration,
      activeHazards
    };
    this.stats.activeAnomaly = this.activeAnomaly;

    // Audio and Visual Feedback for Anomaly Alert
    audioEngine.playCheckpointUnlocked();
    HapticManager.triggerAnomalyHit();
    this.renderSystem.triggerScreenShake(16, 0.4);
    this.particleSystem.emitLandingSparkles(this.player.x, this.player.y, selectedData.color);
    this.awardXP(50);
  }

  private render(dt: number) {
    const prediction = PhysicsSystem.predictTrajectory(this.player, this.planets);
    const currentLevelForRender = ProceduralGenerator.getLevelForPlanetIndex(Math.max(1, this.stats.planetsLandedCount || 1));

    this.renderSystem.render(
      this.ctx,
      this.canvas.width,
      this.canvas.height,
      this.cameraY,
      this.voidY,
      this.player,
      this.planets,
      this.collectibles,
      this.powerUps,
      prediction,
      dt,
      this.cameraX,
      this.freezeRatio,
      this.currentConstellation || undefined,
      this.activeAnomaly,
      this.savedData?.randomizeAesthetics ? this.runAestheticSeed : undefined,
      this.stats.voidDangerRatio || 0,
      this.sectorFlashTimer,
      currentLevelForRender
    );

    // Render ParticleSystem overlay
    this.particleSystem.draw(this.ctx, this.cameraX, this.cameraY);
  }

  private gameOver() {
    audioEngine.stopAll();
    audioEngine.playGameOver();

    // Save High Score and Earned Currencies
    this.savedData.totalStars += this.stats.starsCollected;
    this.savedData.totalDiamonds += this.stats.diamondsCollected;

    // Lifetime metrics for Achievements
    this.savedData.totalStarsAllTime = (this.savedData.totalStarsAllTime || 0) + this.stats.starsCollected;
    this.savedData.totalDiamondsAllTime = (this.savedData.totalDiamondsAllTime || 0) + this.stats.diamondsCollected;
    this.savedData.totalPlanetsAllTime = (this.savedData.totalPlanetsAllTime || 0) + this.stats.planetsLandedCount;
    this.savedData.totalFullOrbitsAllTime = (this.savedData.totalFullOrbitsAllTime || 0) + this.stats.fullOrbitsCompleted;
    this.savedData.totalSunsAllTime = (this.savedData.totalSunsAllTime || 0) + this.stats.sunsLandedCount;
    this.savedData.totalPowerUpsAllTime = (this.savedData.totalPowerUpsAllTime || 0) + this.stats.powerUpsUsedCount;
    this.savedData.maxConsecutiveJumpsRecord = Math.max(this.savedData.maxConsecutiveJumpsRecord || 0, this.stats.maxConsecutiveJumps);

    if (this.stats.score > this.savedData.highScore) {
      this.savedData.highScore = this.stats.score;
    }
    if (this.stats.maxAltitude > this.savedData.maxAltitudeOverall) {
      this.savedData.maxAltitudeOverall = this.stats.maxAltitude;
    }

    // Update Daily Cosmic Challenge & 3 Procedural Missions Progress
    const dailyRes = DailyChallengeSystem.updateProgressFromRun(this.savedData, this.stats);
    this.savedData.dailyChallengeState = dailyRes.updatedState;
    DailyChallengeSystem.updateMissionsProgress(this.savedData, this.stats);

    StorageManager.saveData(this.savedData);

    this.setMode('GAMEOVER');
  }

  public destroy() {
    audioEngine.stopAll();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}

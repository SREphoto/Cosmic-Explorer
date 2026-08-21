import { PHYSICS_CONFIG } from '../core/Config';
import { Player } from '../entities/Player';
import { PowerUpUpgrades } from '../types/game';

export class PowerUpSystem {
  public isMagnetActive: boolean = false;
  public magnetTimer: number = 0;
  public magnetDurationMax: number = 0;
  public magnetRadius: number = 0;

  public isCometActive: boolean = false;
  public cometTimer: number = 0;
  public cometDurationMax: number = 0;

  public activateMagnet(upgrades: PowerUpUpgrades, player: Player) {
    this.isMagnetActive = true;
    this.magnetDurationMax = PHYSICS_CONFIG.MAGNET_DURATION_BASE + (upgrades.magnetLevel - 1) * PHYSICS_CONFIG.MAGNET_DURATION_PER_LEVEL;
    this.magnetTimer = this.magnetDurationMax;
    this.magnetRadius = PHYSICS_CONFIG.MAGNET_RADIUS_BASE + (upgrades.magnetLevel - 1) * PHYSICS_CONFIG.MAGNET_RADIUS_PER_LEVEL;
    player.isMagnetActive = true;
  }

  public activateComet(upgrades: PowerUpUpgrades, player: Player) {
    this.isCometActive = true;
    this.cometDurationMax = PHYSICS_CONFIG.COMET_DURATION_BASE + (upgrades.cometLevel - 1) * PHYSICS_CONFIG.COMET_DURATION_PER_LEVEL;
    this.cometTimer = this.cometDurationMax;
    player.isCometActive = true;
  }

  public update(dt: number, player: Player) {
    if (this.isMagnetActive) {
      this.magnetTimer -= dt;
      if (this.magnetTimer <= 0) {
        this.isMagnetActive = false;
        player.isMagnetActive = false;
      }
    }

    if (this.isCometActive) {
      this.cometTimer -= dt;
      if (this.cometTimer <= 0) {
        this.isCometActive = false;
        player.isCometActive = false;
      }
    }
  }

  public reset(player: Player) {
    this.isMagnetActive = false;
    this.magnetTimer = 0;
    this.isCometActive = false;
    this.cometTimer = 0;
    player.isMagnetActive = false;
    player.isCometActive = false;
  }
}

/**
 * Mobile Device Haptic Vibration Utility
 * Supports patterns with fallbacks for browsers / devices with navigator.vibrate
 */

export class HapticManager {
  private static enabled: boolean = true;

  public static setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  /**
   * Light haptic feedback for UI taps, regular jumps, minor star collections
   */
  public static triggerLight() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(12);
    } catch {
      // Ignore vibration errors on non-supported platforms
    }
  }

  /**
   * Medium crisp haptic feedback for landing on planets, slingshots, powerup activations
   */
  public static triggerMedium() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([25, 20, 25]);
    } catch {
      // Ignore
    }
  }

  /**
   * Heavy double-pulse haptic feedback for Perfect Jumps, Ricochets, Level up
   */
  public static triggerPerfectJump() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([35, 30, 45, 25, 60]);
    } catch {
      // Ignore
    }
  }

  /**
   * Intense buzzing rhythm for Space Anomaly alerts, Asteroid strikes, Deep Space Freezing
   */
  public static triggerAnomalyHit() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([60, 40, 70, 40, 90]);
    } catch {
      // Ignore
    }
  }

  /**
   * Subtle shivering vibration pulse when deep space freezing is high
   */
  public static triggerFreezeShiver() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([15, 60, 15]);
    } catch {
      // Ignore
    }
  }

  public static triggerHeavy() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([50, 30, 80]);
    } catch {
      // Ignore
    }
  }

  /**
   * Celestial triumphant vibration pattern when unlocking checkpoints or clearing constellations
   */
  public static triggerConstellationComplete() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([40, 30, 60, 30, 80, 40, 120]);
    } catch {
      // Ignore
    }
  }
}

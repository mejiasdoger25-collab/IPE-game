/**
 * src/core/FeedbackManager.ts
 * Game Feel ("Juice") and Visual Feedback Engine for DevLife RPG.
 * Follows:
 * - skills/game-feel/SKILL.md: Decaying trauma model (shake = trauma^2), hit-stops, and accessibility toggles.
 */

export type FeedbackTier = 'small' | 'medium' | 'large' | 'critical';

export interface FeedbackAccessibilitySettings {
  reduceScreenShake: boolean;
  reduceMotion: boolean;
  coachMode: boolean;
}

export class FeedbackManager {
  private static trauma = 0;
  private static decayRate = 1.2; // trauma decays per second
  private static shakeCallback?: (intensity: number, duration: number) => void;

  public static settings: FeedbackAccessibilitySettings = {
    reduceScreenShake: false,
    reduceMotion: false,
    coachMode: true,
  };

  /**
   * Registers Phaser camera shake hook
   */
  public static registerCameraHook(
    callback: (intensity: number, duration: number) => void
  ): void {
    this.shakeCallback = callback;
  }

  /**
   * Adds trauma using the power-of-two response curve
   */
  public static addTrauma(amount: number): void {
    if (this.settings.reduceScreenShake) return;
    this.trauma = Math.min(this.trauma + amount, 1.0);

    const intensity = Math.pow(this.trauma, 2) * 0.03;
    const duration = 250;

    if (this.shakeCallback) {
      this.shakeCallback(intensity, duration);
    }
  }

  /**
   * Triggers visual punch / screen shake by importance tier
   */
  public static triggerImpact(tier: FeedbackTier): void {
    switch (tier) {
      case 'small':
        this.addTrauma(0.2);
        break;
      case 'medium':
        this.addTrauma(0.4);
        break;
      case 'large':
        this.addTrauma(0.7);
        break;
      case 'critical':
        this.addTrauma(1.0);
        this.triggerHitStop(120); // 120ms freeze frame
        break;
    }
  }

  /**
   * Hit-stop / frame freeze on critical alerts (e.g. Strike 3 or Server Crash)
   */
  public static triggerHitStop(durationMs = 80): void {
    if (this.settings.reduceMotion) return;
    const originalTimeScale = 1.0;
    // Dispatch custom DOM event or freeze signal
    window.dispatchEvent(
      new CustomEvent('game:hitstop', { detail: { durationMs, originalTimeScale } })
    );
  }

  /**
   * Updates trauma decay in the game loop
   */
  public static update(deltaSeconds: number): void {
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - this.decayRate * deltaSeconds);
    }
  }
}

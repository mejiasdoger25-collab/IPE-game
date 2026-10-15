/**
 * src/core/AudioManager.ts
 * Game Audio Mixer and Procedural Web Audio Synthesizer for DevLife RPG.
 * Implements:
 * - Master, Music, SFX, UI bus volume controls in decibels (dB)
 * - Procedural Web Audio API synthesis fallback for mechanical keyboards, notifications, and alarms
 * - Dynamic sidechain music ducking during active dialogues
 */

export type AudioBusType = 'master' | 'music' | 'sfx' | 'ui';

export class AudioManager {
  private static ctx: AudioContext | null = null;
  private static buses: Record<AudioBusType, GainNode | null> = {
    master: null,
    music: null,
    sfx: null,
    ui: null,
  };

  private static volumesDb: Record<AudioBusType, number> = {
    master: 0,
    music: -6,
    sfx: -3,
    ui: -3,
  };

  /**
   * Converts decibels (dB) to linear gain [0.0, 1.0]
   */
  public static dbToLinear(db: number): number {
    if (db <= -60) return 0;
    return Math.pow(10, db / 20);
  }

  /**
   * Converts linear gain to decibels
   */
  public static linearToDb(linear: number): number {
    if (linear <= 0.0001) return -60;
    return 20 * Math.log10(linear);
  }

  /**
   * Initializes Web Audio Context on first user interaction
   */
  public static init(): void {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Build Audio Bus Tree
      const master = this.ctx.createGain();
      const music = this.ctx.createGain();
      const sfx = this.ctx.createGain();
      const ui = this.ctx.createGain();

      music.connect(master);
      sfx.connect(master);
      ui.connect(master);
      master.connect(this.ctx.destination);

      this.buses = { master, music, sfx, ui };
      this.updateBusGains();
    } catch (e) {
      console.warn('Web Audio API not supported in this environment.', e);
    }
  }

  public static setBusVolumeDb(bus: AudioBusType, db: number): void {
    this.volumesDb[bus] = Math.max(-60, Math.min(db, 6));
    this.updateBusGains();
  }

  public static getBusVolumeDb(bus: AudioBusType): number {
    return this.volumesDb[bus];
  }

  private static updateBusGains(): void {
    if (!this.ctx) return;
    Object.entries(this.buses).forEach(([busName, node]) => {
      if (node) {
        const linear = this.dbToLinear(this.volumesDb[busName as AudioBusType]);
        node.gain.setValueAtTime(linear, this.ctx!.currentTime);
      }
    });
  }

  /**
   * Music ducking during key dialogue moments
   */
  public static duckMusic(ducked = true): void {
    if (!this.buses.music || !this.ctx) return;
    const targetDb = ducked ? this.volumesDb.music - 12 : this.volumesDb.music;
    const linear = this.dbToLinear(targetDb);
    this.buses.music.gain.linearRampToValueAtTime(linear, this.ctx.currentTime + 0.3);
  }

  // ==========================================
  // PROCEDURAL WEB AUDIO SYNTHESIS FALLBACKS
  // ==========================================

  /**
   * Mechanical keyboard clack with pitch randomization (+-6%)
   */
  public static playKeyClack(): void {
    this.init();
    if (!this.ctx || !this.buses.sfx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pitch randomization around 600Hz
    const randomFactor = 0.94 + Math.random() * 0.12;
    osc.frequency.setValueAtTime(600 * randomFactor, this.ctx.currentTime);
    osc.type = 'triangle';

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.buses.sfx);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Slack / Notification ping
   */
  public static playNotificationPing(): void {
    this.init();
    if (!this.ctx || !this.buses.ui) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.15); // A6

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.buses.ui);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  /**
   * Strike Buzzer Alarm
   */
  public static playStrikeAlarm(): void {
    this.init();
    if (!this.ctx || !this.buses.sfx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(this.buses.sfx);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  /**
   * Act 3 Black Friday Crisis Siren
   */
  public static playServerAlarm(): void {
    this.init();
    if (!this.ctx || !this.buses.sfx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.25);
    osc.frequency.linearRampToValueAtTime(400, t + 0.5);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.buses.sfx);

    osc.start();
    osc.stop(t + 0.6);
  }
}

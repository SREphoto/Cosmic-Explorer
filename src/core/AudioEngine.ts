import { SoundPackId } from '../types/game';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private masterOut: GainNode | null = null;
  public musicOut: GainNode | null = null;
  public sfxOut: GainNode | null = null;
  public ambientOut: GainNode | null = null;

  public setVolumes(master: number, music: number, sfx: number, ambient: number) {
    if (this.masterOut) this.masterOut.gain.setValueAtTime(master, this.ctx!.currentTime);
    if (this.musicOut) this.musicOut.gain.setValueAtTime(music, this.ctx!.currentTime);
    if (this.sfxOut) this.sfxOut.gain.setValueAtTime(sfx, this.ctx!.currentTime);
    if (this.ambientOut) this.ambientOut.gain.setValueAtTime(ambient, this.ctx!.currentTime);
  }
  private currentSoundPack: SoundPackId = 'ORCHESTRAL';
  private voidAlarmOsc: OscillatorNode | null = null;
  private voidAlarmGain: GainNode | null = null;

  // Active Charging Sound Nodes (for continuous, smooth, soothing pitch glide)
  private chargeOsc: OscillatorNode | null = null;
  private chargeHarmonicOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;
  private chargeFilter: BiquadFilterNode | null = null;
  private isChargingAudio: boolean = false;

  // Dynamic Background Music State
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;
  private musicGainNode: GainNode | null = null;
  private musicFilterNode: BiquadFilterNode | null = null;
  private currentBpm: number = 84;
  private targetBpm: number = 84;
  private currentAltitude: number = 0;
  private currentSpeedRatio: number = 0;
  private nextStepTime: number = 0;
  private currentStep: number = 0;
  private currentBar: number = 0;

  // Soothing, melodic celestial chord progressions (Little Galaxy / Monument Valley inspired)
  private readonly CHORDS = [
    // 0: F major 9 (Warm, inviting, soaring)
    {
      root: 43.65, // F1
      bass: [87.31, 130.81, 174.61], // F2, C3, F3
      pad: [174.61, 220.00, 261.63, 329.63, 392.00], // F3, A3, C4, E4, G4
      arp: [349.23, 392.00, 440.00, 523.25, 659.25, 783.99, 880.00, 1046.50]
    },
    // 1: G dominant 9 sus4 (Uplifting cosmic suspension)
    {
      root: 49.00, // G1
      bass: [98.00, 146.83, 196.00], // G2, D3, G3
      pad: [196.00, 261.63, 293.66, 392.00, 440.00], // G3, C4, D4, G4, A4
      arp: [392.00, 440.00, 523.25, 587.33, 783.99, 880.00, 1046.50, 1174.66]
    },
    // 2: E minor 9 (Deep starry space wonder)
    {
      root: 41.20, // E1
      bass: [82.41, 123.47, 164.81], // E2, B2, E3
      pad: [164.81, 196.00, 246.94, 293.66, 329.63], // E3, G3, B3, D4, E4
      arp: [329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 987.77, 1174.66]
    },
    // 3: A minor 9 (Melancholic & beautiful starlight)
    {
      root: 55.00, // A1
      bass: [110.00, 164.81, 220.00], // A2, E3, A3
      pad: [220.00, 261.63, 329.63, 392.00, 440.00], // A3, C4, E4, G4, A4
      arp: [440.00, 523.25, 659.25, 783.99, 880.00, 1046.50, 1318.51, 1567.98]
    },
    // 4: D minor 9 (Cosmic drift)
    {
      root: 36.71, // D1
      bass: [73.42, 110.00, 146.83], // D2, A2, D3
      pad: [146.83, 174.61, 220.00, 261.63, 329.63], // D3, F3, A3, C4, E4
      arp: [293.66, 349.23, 440.00, 523.25, 587.33, 698.46, 880.00, 1046.50]
    },
    // 5: C major 9 (Pure celestial sanctuary radiance)
    {
      root: 65.41, // C2
      bass: [130.81, 196.00, 261.63], // C3, G3, C4
      pad: [261.63, 329.63, 392.00, 493.88, 587.33], // C4, E4, G4, B4, D5
      arp: [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98, 1975.53]
    }
  ];

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterOut = this.ctx.createGain();
        this.musicOut = this.ctx.createGain();
        this.sfxOut = this.ctx.createGain();
        this.ambientOut = this.ctx.createGain();
        this.musicOut.connect(this.masterOut);
        this.sfxOut.connect(this.masterOut);
        this.ambientOut.connect(this.masterOut);
        this.masterOut.connect(this.ctx.destination);
        this.setupMusicRouting();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupMusicRouting() {
    if (!this.ctx) return;

    this.musicFilterNode = this.ctx.createBiquadFilter();
    this.musicFilterNode.type = 'lowpass';
    this.musicFilterNode.frequency.setValueAtTime(800, this.ctx.currentTime);
    this.musicFilterNode.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(this.soundEnabled ? 0.16 : 0, this.ctx.currentTime);

    this.musicFilterNode.connect(this.musicGainNode);
    this.musicGainNode.connect(this.musicOut || this.ctx.destination);
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (this.musicGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.musicGainNode.gain.cancelScheduledValues(now);
      this.musicGainNode.gain.setValueAtTime(enabled ? 0.16 : 0, now);
    }
    if (!enabled) {
      this.stopChargeSound();
      if (this.voidAlarmGain) {
        this.voidAlarmGain.gain.value = 0;
      }
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundPack(pack: SoundPackId) {
    this.currentSoundPack = pack;
  }

  public getSoundPack(): SoundPackId {
    return this.currentSoundPack;
  }

  // ==========================================
  // SOUND PACK PREVIEW AUDITION
  // ==========================================
  public previewSoundPack(pack: SoundPackId) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const prevPack = this.currentSoundPack;
    this.currentSoundPack = pack;

    // Play signature jump SFX
    this.playJump();

    // Play themed preview chord
    if (pack === 'SYNTHWAVE') {
      [220, 277.18, 329.63, 440].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + 0.12 + idx * 0.04);
        gain.gain.setValueAtTime(0.04, now + 0.12 + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(this.sfxOut || this.ctx.destination);
        osc.start(now + 0.12 + idx * 0.04);
        osc.stop(now + 0.56);
      });
    } else if (pack === 'RETRO_8BIT') {
      [330, 440, 554.37, 659.25, 880].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + 0.1 + idx * 0.06);
        gain.gain.setValueAtTime(0.05, now + 0.1 + idx * 0.06);
        gain.gain.setValueAtTime(0.001, now + 0.1 + (idx + 1) * 0.06);
        osc.connect(gain);
        gain.connect(this.sfxOut || this.ctx.destination);
        osc.start(now + 0.1 + idx * 0.06);
        osc.stop(now + 0.1 + (idx + 1) * 0.06);
      });
    } else if (pack === 'CHILL_LOFI') {
      [174.61, 220, 261.63, 329.63, 392].forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + 0.15);
        gain.gain.setValueAtTime(0.035, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(this.sfxOut || this.ctx.destination);
        osc.start(now + 0.15);
        osc.stop(now + 0.72);
      });
    } else {
      // Orchestral preview
      [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.1 + idx * 0.05);
        gain.gain.setValueAtTime(0.03, now + 0.1 + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.connect(gain);
        gain.connect(this.sfxOut || this.ctx.destination);
        osc.start(now + 0.1 + idx * 0.05);
        osc.stop(now + 0.68);
      });
    }
  }

  // ==========================================
  // DYNAMIC AMBIENT BACKGROUND MUSIC
  // ==========================================

  public startMusic() {
    this.init();
    if (!this.ctx) return;

    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    if (!this.musicGainNode) {
      this.setupMusicRouting();
    }

    if (this.musicGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.musicGainNode.gain.setValueAtTime(this.soundEnabled ? 0.16 : 0, now);
    }

    this.currentBpm = 84;
    this.targetBpm = 84;
    this.nextStepTime = this.ctx.currentTime + 0.1;
    this.currentStep = 0;
    this.currentBar = 0;

    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
    }

    this.musicIntervalId = window.setInterval(() => {
      this.scheduler();
    }, 25);
  }

  public pauseMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  public resumeMusic() {
    if (!this.isMusicPlaying) {
      this.startMusic();
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    if (this.musicGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.musicGainNode.gain.setValueAtTime(0, now);
    }
  }

  public updateAltitudeMusic(altitude: number, speedRatio: number = 0) {
    this.currentAltitude = Math.max(0, altitude);
    this.currentSpeedRatio = Math.max(0, Math.min(1, speedRatio));

    // Dynamic Tempo: Gentle 84 BPM on surface up to majestic 112 BPM high above
    const altitudeBpmBonus = Math.min(24, (this.currentAltitude / 6000) * 24);
    const speedBpmBonus = this.currentSpeedRatio * 6;
    this.targetBpm = Math.round(84 + altitudeBpmBonus + speedBpmBonus);

    // Smoothly glide current BPM
    this.currentBpm += (this.targetBpm - this.currentBpm) * 0.05;

    // Dynamic Biquad Filter Cutoff: Mellow 700Hz opens to 2800Hz in deep cosmos
    if (this.musicFilterNode && this.ctx) {
      const now = this.ctx.currentTime;
      const targetCutoff = Math.min(2800, 700 + (this.currentAltitude / 4000) * 1800 + this.currentSpeedRatio * 300);
      this.musicFilterNode.frequency.setTargetAtTime(targetCutoff, now, 0.2);
    }
  }

  private scheduler() {
    if (!this.ctx || !this.isMusicPlaying || !this.musicFilterNode) return;

    while (this.nextStepTime < this.ctx.currentTime + 0.1) {
      this.scheduleStep(this.currentStep, this.nextStepTime);

      const stepDuration = (60 / this.currentBpm) / 4; // 16th note
      this.nextStepTime += stepDuration;

      this.currentStep++;
      if (this.currentStep >= 16) {
        this.currentStep = 0;
        this.currentBar = (this.currentBar + 1) % this.CHORDS.length;
      }
    }
  }

  private scheduleStep(step: number, time: number) {
    if (!this.ctx || !this.musicFilterNode) return;

    const chord = this.CHORDS[this.currentBar];
    const altitudeIntensity = Math.min(1.0, this.currentAltitude / 4000);

    // 1. Lush Rhodes/E-Piano Pad (Soft swelling chord on step 0 and 8)
    if (step === 0 || step === 8) {
      this.playPadChord(chord.pad, time, (60 / this.currentBpm) * 2);
    }

    // 2. Warm Sub-Bass Pulse (Gentle round acoustic/sine tone)
    if (step === 0 || step === 6 || step === 10) {
      const bassNote = chord.bass[step === 0 ? 0 : step === 6 ? 1 : 2] || chord.bass[0];
      this.playSynthBass(bassNote, time, (60 / this.currentBpm) * 0.7);
    }

    // 3. Delicate Glockenspiel / Music Box Sparkles (Selected 16th steps)
    const arpPattern = [0, 3, 6, 8, 11, 14];
    if (arpPattern.includes(step)) {
      const noteIdx = (step * 2 + this.currentBar * 3) % chord.arp.length;
      const freq = chord.arp[noteIdx];
      this.playArpNote(freq, time, (60 / this.currentBpm) * 0.35, altitudeIntensity);
    }

    // 4. Soft Cosmic Stardust Shimmer (Subtle ambient ticks on high altitude)
    if (altitudeIntensity > 0.35 && (step === 4 || step === 12)) {
      this.playCosmicShimmer(time);
    }
  }

  private playPadChord(frequencies: number[], time: number, duration: number) {
    if (!this.ctx || !this.musicFilterNode) return;

    const pack = this.currentSoundPack;

    frequencies.slice(0, 4).forEach((freq, idx) => {
      if (!this.ctx || !this.musicFilterNode) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (pack === 'SYNTHWAVE') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.8 : idx === 2 ? -0.8 : 0), time);
      } else if (pack === 'RETRO_8BIT') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);
      } else if (pack === 'CHILL_LOFI') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.2 : idx === 2 ? -0.2 : 0), time);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.3 : idx === 2 ? -0.3 : 0), time);
      }

      const attack = pack === 'SYNTHWAVE' ? duration * 0.15 : duration * 0.35;
      const release = duration * 0.45;
      const padVol = pack === 'SYNTHWAVE' ? 0.015 : pack === 'RETRO_8BIT' ? 0.018 : 0.022;

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(padVol, time + attack);
      gain.gain.setValueAtTime(padVol, time + duration - release);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(this.musicFilterNode);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  private playSynthBass(frequency: number, time: number, duration: number) {
    if (!this.ctx || !this.musicFilterNode) return;

    const pack = this.currentSoundPack;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (pack === 'SYNTHWAVE') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, time);
      const bassVol = 0.028;
      gain.gain.setValueAtTime(bassVol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    } else if (pack === 'RETRO_8BIT') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, time);
      const bassVol = 0.045;
      gain.gain.setValueAtTime(bassVol, time);
      gain.gain.setValueAtTime(0.001, time + duration);
    } else if (pack === 'CHILL_LOFI') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency * 0.5, time);
      const bassVol = 0.04;
      gain.gain.setValueAtTime(bassVol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, time);
      const bassVol = 0.035;
      gain.gain.setValueAtTime(bassVol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    }

    osc.connect(gain);
    gain.connect(this.musicFilterNode);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private playArpNote(frequency: number, time: number, duration: number, intensity: number) {
    if (!this.ctx || !this.musicFilterNode) return;

    const pack = this.currentSoundPack;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (pack === 'SYNTHWAVE') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, time);
      const bellVol = 0.014 + intensity * 0.012;
      gain.gain.setValueAtTime(bellVol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.8);
    } else if (pack === 'RETRO_8BIT') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(frequency, time);
      const bellVol = 0.022 + intensity * 0.01;
      gain.gain.setValueAtTime(bellVol, time);
      gain.gain.setValueAtTime(0.0001, time + duration * 0.5);
    } else if (pack === 'CHILL_LOFI') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, time);
      const bellVol = 0.018 + intensity * 0.012;
      gain.gain.setValueAtTime(bellVol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 1.2);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, time);
      const bellVol = 0.018 + intensity * 0.012;
      gain.gain.setValueAtTime(bellVol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    }

    osc.connect(gain);
    gain.connect(this.musicFilterNode);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private playCosmicShimmer(time: number) {
    if (!this.ctx || !this.musicFilterNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800 + Math.random() * 600, time);

    gain.gain.setValueAtTime(0.008, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.musicFilterNode);

    osc.start(time);
    osc.stop(time + 0.06);
  }

  // ==========================================
  // JUMP CHARGE SOUND (Pleasant, Soft, Gentle Hum)
  // ==========================================

  public playChargeSound(ratio: number) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const pack = this.currentSoundPack;

    // Base pitch glide
    const baseFreq = pack === 'SYNTHWAVE' ? 140 + clampedRatio * 280 : 220 + clampedRatio * 220;

    if (!this.isChargingAudio || !this.chargeOsc || !this.chargeGain || !this.chargeFilter) {
      this.isChargingAudio = true;

      this.chargeFilter = this.ctx.createBiquadFilter();
      this.chargeFilter.type = 'lowpass';
      this.chargeFilter.frequency.setValueAtTime(450, now);
      this.chargeFilter.Q.setValueAtTime(1.0, now);

      this.chargeGain = this.ctx.createGain();
      this.chargeGain.gain.setValueAtTime(0.0001, now);
      this.chargeGain.gain.linearRampToValueAtTime(0.018, now + 0.08);

      this.chargeOsc = this.ctx.createOscillator();
      this.chargeOsc.type = pack === 'SYNTHWAVE' ? 'sawtooth' : pack === 'RETRO_8BIT' ? 'square' : pack === 'CHILL_LOFI' ? 'triangle' : 'sine';
      this.chargeOsc.frequency.setValueAtTime(baseFreq, now);

      this.chargeOsc.connect(this.chargeGain);
      this.chargeGain.connect(this.chargeFilter);
      this.chargeFilter.connect(this.sfxOut || this.ctx.destination);

      this.chargeOsc.start(now);
    } else {
      this.chargeOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);
      this.chargeFilter.frequency.setTargetAtTime(450 + clampedRatio * 350, now, 0.05);

      const targetVol = (pack === 'SYNTHWAVE' ? 0.010 : 0.014) + clampedRatio * 0.010;
      this.chargeGain.gain.setTargetAtTime(targetVol, now, 0.05);
    }
  }

  public playClick() {
    this.playMenuClick();
  }

  public stopChargeSound() {
    if (!this.isChargingAudio || !this.ctx || !this.chargeGain) return;

    const now = this.ctx.currentTime;
    try {
      this.chargeGain.gain.cancelScheduledValues(now);
      this.chargeGain.gain.linearRampToValueAtTime(0.0001, now + 0.05);

      if (this.chargeOsc) {
        this.chargeOsc.stop(now + 0.06);
        this.chargeOsc.disconnect();
      }
      if (this.chargeHarmonicOsc) {
        this.chargeHarmonicOsc.stop(now + 0.06);
        this.chargeHarmonicOsc.disconnect();
      }
    } catch {
      // Safe cleanup
    }

    this.chargeOsc = null;
    this.chargeHarmonicOsc = null;
    this.chargeGain = null;
    this.chargeFilter = null;
    this.isChargingAudio = false;
  }

  // ==========================================
  // GAME SOUND EFFECTS (Warm, Magical & Crisply Tuned)
  // ==========================================

  public playJump() {
    this.stopChargeSound();
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const pack = this.currentSoundPack;

    if (pack === 'SYNTHWAVE') {
      // 80s Punchy Laser-Sweep Jump
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.2);
      filter.Q.setValueAtTime(3.5, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);

      // High cyber ping
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = 'square';
      ping.frequency.setValueAtTime(1760, now);
      ping.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      pingGain.gain.setValueAtTime(0.04, now);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      ping.connect(pingGain);
      pingGain.connect(this.sfxOut || this.ctx.destination);
      ping.start(now);
      ping.stop(now + 0.13);
    } else if (pack === 'RETRO_8BIT') {
      // Authentic NES 8-bit Pitch Glide Jump
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.14);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0.08, now + 0.12);
      gain.gain.setValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);

      // Noise click at start
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'sawtooth';
      click.frequency.setValueAtTime(60, now);
      clickGain.gain.setValueAtTime(0.06, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      click.connect(clickGain);
      clickGain.connect(this.sfxOut || this.ctx.destination);
      click.start(now);
      click.stop(now + 0.05);
    } else if (pack === 'CHILL_LOFI') {
      // Soft Mellow Water-drop / Raindrop Chime Launch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.22);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } else {
      // Default Orchestral: Airy ethereal whoosh + sparkle
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.22);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.18);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);

      const glint = this.ctx.createOscillator();
      const glintGain = this.ctx.createGain();
      glint.type = 'triangle';
      glint.frequency.setValueAtTime(880, now);
      glint.frequency.exponentialRampToValueAtTime(1400, now + 0.1);

      glintGain.gain.setValueAtTime(0.05, now);
      glintGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      glint.connect(glintGain);
      glintGain.connect(this.sfxOut || this.ctx.destination);
      glint.start(now);
      glint.stop(now + 0.13);
    }
  }

  public playLand() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Harmonic soft bass bloom + gentle harp sweep
    const notes = [220, 330, 440];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + idx * 0.02 + 0.18);

      gain.gain.setValueAtTime(0.12, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now + idx * 0.02);
      osc.stop(now + idx * 0.02 + 0.24);
    });
  }

  public playStarCollect(comboCount: number = 0) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    // Pure crystal bells ascending along Major Pentatonic Scale
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const noteFreq = scale[Math.min(comboCount, scale.length - 1)];

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq, now);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(noteFreq * 2, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    overtone.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 0.24);
    overtone.stop(now + 0.24);
  }

  public playDiamondCollect() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const diamondNotes = [880, 1174.66, 1760]; // A5 -> D6 -> A6

    diamondNotes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.14, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.32);
    });
  }

  public playFullOrbit() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C flourishing bell sweep
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.16, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.32);

      osc.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.35);
    });
  }

  public playPowerUpCollect() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [440, 554.37, 659.25, 880]; // A Major power chime

    chords.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.38);
    });
  }

  public playJetpack() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.22);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playRicochet() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.14);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playHazardHit() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playCheckpointUnlocked() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    // Grand celestial major fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0.22, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.55);

      osc.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.6);
    });
  }

  public playLevelUp() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.5);
    });
  }

  public playEquipGear() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playSkillUnlock() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 783.99, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.38);
    });
  }

  public playMenuClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.035);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playStoneWarning(ratio: number = 0.5) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 95 + ratio * 35;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, now + 0.12);

    const vol = 0.08 + ratio * 0.1;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playStoneCrack() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playPetrifiedDeath() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playFreezeWarning() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playGameOver() {
    this.stopChargeSound();
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.5);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  public playQuestClear() {
    this.playCheckpointUnlocked();
  }

  public playRewindSound() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Time-Reversal Sweep Oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(4.0, now);
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.45);

    // Fast backwards pitch arpeggio
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.45);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);

    // 2. Clock Tick Chimes
    const tickOsc = this.ctx.createOscillator();
    const tickGain = this.ctx.createGain();
    tickOsc.type = 'sine';
    tickOsc.frequency.setValueAtTime(1200, now);
    tickOsc.frequency.setValueAtTime(1500, now + 0.12);
    tickOsc.frequency.setValueAtTime(1800, now + 0.24);
    tickOsc.frequency.setValueAtTime(2200, now + 0.36);

    tickGain.gain.setValueAtTime(0.18, now);
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    tickOsc.connect(tickGain);
    tickGain.connect(this.sfxOut || this.ctx.destination);
    tickOsc.start(now);
    tickOsc.stop(now + 0.5);
  }

  public playClockTick() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playLevelUpFanfare() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = now + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxOut || this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  public updateDynamicMusic(speedRatio: number, voidProximityRatio: number) {
    this.updateAltitudeMusic(this.currentAltitude, speedRatio);
  }

  public updateVoidWarning(distanceToVoid: number) {
    if (!this.soundEnabled || !this.ctx) return;

    if (distanceToVoid < 240) {
      if (!this.voidAlarmOsc) {
        this.voidAlarmOsc = this.ctx.createOscillator();
        this.voidAlarmGain = this.ctx.createGain();

        this.voidAlarmOsc.type = 'sine';
        this.voidAlarmOsc.frequency.setValueAtTime(65, this.ctx.currentTime);

        this.voidAlarmGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

        this.voidAlarmOsc.connect(this.voidAlarmGain);
        this.voidAlarmGain.connect(this.ambientOut || this.ctx.destination);
        this.voidAlarmOsc.start();
      }

      if (this.voidAlarmGain) {
        const intensity = Math.max(0, 1 - distanceToVoid / 240);
        this.voidAlarmGain.gain.setValueAtTime(intensity * 0.08, this.ctx.currentTime);
      }
    } else {
      if (this.voidAlarmOsc) {
        try {
          this.voidAlarmOsc.stop();
          this.voidAlarmOsc.disconnect();
        } catch {
          // ignore
        }
        this.voidAlarmOsc = null;
        this.voidAlarmGain = null;
      }
    }
  }

  public playMenuSelect() {
    this.playMenuClick();
  }

  public playUnlockSound() {
    this.playPowerUpCollect();
  }

  public playCheckpointReached() {
    this.playLevelUp();
  }

  public playPowerUpExpired() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxOut || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Procedural Star Gazing Ambient Soundscape Engine
  private starGazeOscs: OscillatorNode[] = [];
  private starGazeGains: GainNode[] = [];
  private starGazeFilter: BiquadFilterNode | null = null;
  private starGazeMasterGain: GainNode | null = null;
  private starGazeLfo: OscillatorNode | null = null;
  private starGazeLfoGain: GainNode | null = null;
  private isStarGazingActive: boolean = false;
  private starGazePanner: StereoPannerNode | null = null;
  private starGazeIntervalId: number | null = null;

  public startStarGazingAmbience(planetType: string = 'STANDARD', radius: number = 60, options?: { element?: string; spinSpeed?: number; isHabitable?: boolean }) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    this.stopStarGazingAmbience();
    this.isStarGazingActive = true;

    const now = this.ctx.currentTime;

    // Master Star Gazing Gain
    this.starGazeMasterGain = this.ctx.createGain();
    this.starGazeMasterGain.gain.setValueAtTime(0.001, now);
    this.starGazeMasterGain.gain.exponentialRampToValueAtTime(0.28, now + 2.5);

    // Multi-pole Lowpass/Bandpass Filter with resonance
    this.starGazeFilter = this.ctx.createBiquadFilter();
    this.starGazeFilter.type = 'lowpass';
    this.starGazeFilter.frequency.setValueAtTime(650, now);
    this.starGazeFilter.Q.setValueAtTime(2.5, now);

    // Stereo Panner (if available)
    if (this.ctx.createStereoPanner) {
      this.starGazePanner = this.ctx.createStereoPanner();
      this.starGazePanner.pan.setValueAtTime(0, now);
      this.starGazeFilter.connect(this.starGazePanner);
      this.starGazePanner.connect(this.starGazeMasterGain);
    } else {
      this.starGazeFilter.connect(this.starGazeMasterGain);
    }

    this.starGazeMasterGain.connect(this.ambientOut || this.masterOut || this.ctx.destination);

    // Slow atmospheric breathing LFO
    this.starGazeLfo = this.ctx.createOscillator();
    this.starGazeLfoGain = this.ctx.createGain();
    const lfoRate = Math.max(0.05, 0.18 - (radius / 500));
    this.starGazeLfo.frequency.setValueAtTime(lfoRate, now);
    this.starGazeLfoGain.gain.setValueAtTime(220, now);

    this.starGazeLfo.connect(this.starGazeFilter.frequency);
    this.starGazeLfo.start(now);

    // Determine Base Harmonic Frequencies according to Planet Personality
    let baseFreq = 55.0; // A1
    let chordFreqs: number[] = [110, 165, 220, 330, 440];
    let oscType: OscillatorType = 'sine';

    switch (planetType.toUpperCase()) {
      case 'ICE':
      case 'GLACIAL':
        // Crystalline pure Sine High Harmonics (Ethereal Frost)
        baseFreq = 65.41; // C2
        chordFreqs = [130.81, 196.00, 261.63, 392.00, 523.25, 659.25];
        oscType = 'sine';
        this.starGazeFilter.frequency.setValueAtTime(1200, now);
        break;

      case 'CRYSTAL':
      case 'CELESTIAL_SANCTUARY':
        // Lydian mode ethereal overtone shimmer (F# / D / A)
        baseFreq = 73.42; // D2
        chordFreqs = [146.83, 220.00, 293.66, 415.30, 587.33, 880.00];
        oscType = 'triangle';
        this.starGazeFilter.frequency.setValueAtTime(950, now);
        break;

      case 'MAGMA':
      case 'VOLCANIC':
        // Deep thermal subterranean low rumble with warm sawtooth harmonics
        baseFreq = 41.20; // E1
        chordFreqs = [82.41, 123.47, 164.81, 246.94];
        oscType = 'triangle';
        this.starGazeFilter.frequency.setValueAtTime(380, now);
        break;

      case 'NEON':
      case 'CYBER':
      case 'MECH':
        // Cybernetic pulsating fifths and minor ninth textures
        baseFreq = 58.27; // Bb1
        chordFreqs = [116.54, 174.61, 233.08, 349.23, 466.16];
        oscType = 'sawtooth';
        this.starGazeFilter.frequency.setValueAtTime(520, now);
        break;

      case 'DARK':
      case 'ANTIMATTER':
        // Mysterious sub-bass void abyss
        baseFreq = 36.71; // D1
        chordFreqs = [73.42, 103.83, 146.83, 207.65]; // Diminished/tritone tension
        oscType = 'sine';
        this.starGazeFilter.frequency.setValueAtTime(320, now);
        break;

      case 'SUN':
      case 'PLASMA':
        // Radiant golden solar drone (Major chord brilliance)
        baseFreq = 65.41; // C2
        chordFreqs = [130.81, 163.50, 196.00, 327.00, 392.00, 523.25];
        oscType = 'sine';
        this.starGazeFilter.frequency.setValueAtTime(800, now);
        break;

      case 'GRASS':
      case 'VERDANT':
      default:
        // Pastoral, warm, peaceful Pentatonic sanctuary
        baseFreq = 55.0; // A1
        chordFreqs = [110.0, 165.0, 220.0, 330.0, 440.0, 660.0];
        oscType = 'sine';
        this.starGazeFilter.frequency.setValueAtTime(700, now);
        break;
    }

    // Spawn drone harmonic oscillators
    chordFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.starGazeFilter) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = oscType;
      // Slight micro-detuning for lush analog celestial thickness
      const detuneCents = (idx % 2 === 0 ? 1 : -1) * (idx * 3.5);
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detuneCents, now);

      const harmonicVolume = Math.max(0.015, 0.12 / (idx + 1));
      gain.gain.setValueAtTime(harmonicVolume, now);

      osc.connect(gain);
      gain.connect(this.starGazeFilter);

      osc.start(now);
      this.starGazeOscs.push(osc);
      this.starGazeGains.push(gain);
    });

    // Sub-harmonic foundational drone
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq, now);
    subGain.gain.setValueAtTime(0.22, now);
    subOsc.connect(subGain);
    if (this.starGazeFilter) subGain.connect(this.starGazeFilter);
    subOsc.start(now);
    this.starGazeOscs.push(subOsc);
    this.starGazeGains.push(subGain);

    // Random Procedural Celestial Chimes every 3-5 seconds
    this.starGazeIntervalId = window.setInterval(() => {
      if (!this.isStarGazingActive || !this.ctx || !this.soundEnabled) return;
      this.triggerProceduralStarChime(chordFreqs, planetType);
    }, 3200);
  }

  public updateStarGazingLookDirection(azimuthRatio: number, elevationRatio: number) {
    if (!this.isStarGazingActive || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Pan audio dynamically as player looks around the sky (-1 to +1)
    if (this.starGazePanner) {
      const targetPan = Math.sin(azimuthRatio * Math.PI * 2);
      this.starGazePanner.pan.setTargetAtTime(targetPan * 0.7, now, 0.1);
    }

    // Modulate filter frequency based on elevation (higher look angle = brighter stars)
    if (this.starGazeFilter) {
      const baseFilterFreq = 400 + (elevationRatio * 900);
      this.starGazeFilter.frequency.setTargetAtTime(baseFilterFreq, now, 0.2);
    }
  }

  private triggerProceduralStarChime(scaleFreqs: number[], planetType: string) {
    if (!this.ctx || !this.starGazeMasterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Select random chord note 2 octaves up
    const randomFreq = scaleFreqs[Math.floor(Math.random() * scaleFreqs.length)] * 2;
    osc.type = planetType === 'ICE' || planetType === 'CRYSTAL' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(randomFreq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain);
    gain.connect(this.starGazeMasterGain);

    osc.start(now);
    osc.stop(now + 2.0);
  }

  public stopStarGazingAmbience() {
    this.isStarGazingActive = false;

    if (this.starGazeIntervalId) {
      clearInterval(this.starGazeIntervalId);
      this.starGazeIntervalId = null;
    }

    if (this.starGazeMasterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.starGazeMasterGain.gain.cancelScheduledValues(now);
      this.starGazeMasterGain.gain.setValueAtTime(this.starGazeMasterGain.gain.value, now);
      this.starGazeMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    }

    setTimeout(() => {
      this.starGazeOscs.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.starGazeOscs = [];
      this.starGazeGains = [];

      if (this.starGazeLfo) {
        try {
          this.starGazeLfo.stop();
          this.starGazeLfo.disconnect();
        } catch {
          // ignore
        }
        this.starGazeLfo = null;
      }
      this.starGazeFilter = null;
      this.starGazeMasterGain = null;
      this.starGazePanner = null;
    }, 1300);
  }

  public stopAll() {
    this.stopChargeSound();
    this.stopMusic();
    this.stopStarGazingAmbience();
    if (this.voidAlarmOsc) {
      try {
        this.voidAlarmOsc.stop();
        this.voidAlarmOsc.disconnect();
      } catch {
        // ignore
      }
      this.voidAlarmOsc = null;
      this.voidAlarmGain = null;
    }
  }
}

export const audioEngine = new AudioEngine();


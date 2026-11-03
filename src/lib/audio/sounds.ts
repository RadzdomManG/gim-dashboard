"use client";

// Web Audio API Synthesizer - 100% reliable, zero external MP3 dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private taskSoundEnabled: boolean = true;
  private messageSoundEnabled: boolean = true;
  private reminderSoundEnabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      const savedSound = localStorage.getItem("gim_sound_enabled");
      const savedTask = localStorage.getItem("gim_task_sound");
      const savedMsg = localStorage.getItem("gim_msg_sound");
      const savedRem = localStorage.getItem("gim_rem_sound");

      this.soundEnabled = savedSound !== null ? savedSound === "true" : true;
      this.taskSoundEnabled = savedTask !== null ? savedTask === "true" : true;
      this.messageSoundEnabled = savedMsg !== null ? savedMsg === "true" : true;
      this.reminderSoundEnabled = savedRem !== null ? savedRem === "true" : true;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getSettings() {
    return {
      master: this.soundEnabled,
      task: this.taskSoundEnabled,
      message: this.messageSoundEnabled,
      reminder: this.reminderSoundEnabled,
    };
  }

  public updateSettings(settings: {
    master?: boolean;
    task?: boolean;
    message?: boolean;
    reminder?: boolean;
  }) {
    if (settings.master !== undefined) {
      this.soundEnabled = settings.master;
      localStorage.setItem("gim_sound_enabled", String(settings.master));
    }
    if (settings.task !== undefined) {
      this.taskSoundEnabled = settings.task;
      localStorage.setItem("gim_task_sound", String(settings.task));
    }
    if (settings.message !== undefined) {
      this.messageSoundEnabled = settings.message;
      localStorage.setItem("gim_msg_sound", String(settings.message));
    }
    if (settings.reminder !== undefined) {
      this.reminderSoundEnabled = settings.reminder;
      localStorage.setItem("gim_rem_sound", String(settings.reminder));
    }
  }

  public play(type: "task" | "message" | "reminder") {
    if (!this.soundEnabled) return;
    if (type === "task" && !this.taskSoundEnabled) return;
    if (type === "message" && !this.messageSoundEnabled) return;
    if (type === "reminder" && !this.reminderSoundEnabled) return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (type === "message") {
        // Crisp Slack/Apple-style pop: 520Hz -> 880Hz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "task") {
        // Uplifting 2-note harmonic chime (C5 -> G5)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(783.99, now + 0.1); // G5

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(659.25, now); // E5
        osc2.frequency.setValueAtTime(1046.5, now + 0.1); // C6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      } else if (type === "reminder") {
        // Soft urgent 3-pulse bell chime
        const freqs = [659.25, 880, 1174.66]; // E5, A5, D6
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startTime = now + idx * 0.08;

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.25);
        });
      }
    } catch (e) {
      console.warn("Audio playback not permitted or unsupported:", e);
    }
  }
}

export const soundManager = new SoundManager();

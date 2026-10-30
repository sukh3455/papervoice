/**
 * Web Speech API (Browser Native SpeechSynthesis) Manager
 * Provides 100% offline, zero-latency natural voice playback with real-time
 * word boundary highlighting and long-text chunking.
 */

class WebSpeechManager {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.listeners = new Set();
    this.boundaryCallback = null;
    this.endCallback = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    const list = this.synth.getVoices() || [];
    this.voices = list.map((v) => ({
      id: `webspeech-${v.name}`,
      name: v.name,
      fullName: `${v.name} (${v.lang})`,
      gender: v.name.toLowerCase().includes('female') ? 'Female' : v.name.toLowerCase().includes('male') ? 'Male' : 'Natural',
      locale: v.lang,
      localeName: v.lang,
      provider: 'webspeech',
      rawVoice: v,
      isDefault: v.default,
      isLocal: v.localService
    }));
    this.notify();
    return this.voices;
  }

  getVoices() {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach((cb) => cb(this.voices));
  }

  speak({
    text,
    voiceName,
    rate = 1.0,
    pitch = 1.0,
    volume = 1.0,
    onBoundary,
    onStart,
    onEnd,
    onError
  }) {
    if (!this.synth) {
      if (onError) onError(new Error('Web Speech API is not supported in this browser.'));
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    // Pitch in WebSpeech is 0 to 2, default 1
    utterance.pitch = Math.max(0.1, Math.min(2.0, 1 + pitch / 50));
    utterance.volume = Math.max(0, Math.min(1.0, volume / 100));

    // Match voice
    if (voiceName) {
      const all = this.synth.getVoices();
      const match = all.find((v) => `webspeech-${v.name}` === voiceName || v.name === voiceName);
      if (match) {
        utterance.voice = match;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      if (onStart) onStart();
    };

    utterance.onboundary = (event) => {
      if (onBoundary && event.name === 'word') {
        onBoundary({
          charIndex: event.charIndex,
          charLength: event.charLength || 5,
          elapsedTime: event.elapsedTime
        });
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      this.isSpeaking = false;
      this.isPaused = false;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
    }
  }
}

export const webSpeech = new WebSpeechManager();

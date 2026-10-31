import React from 'react';
import { 
  X, Sparkles, Globe, Zap, ShieldCheck, 
  Layers, Volume2, BookOpen, Feather
} from 'lucide-react';

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[var(--paper-surface)] border border-[var(--paper-border)] shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--paper-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--paper-accent)] text-white flex items-center justify-center shadow-md">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-[var(--paper-ink)]">
                About PaperVoice Studio
              </h3>
              <p className="text-xs text-[var(--paper-ink-muted)]">
                Artisan Text-to-Speech with Multi-Provider Neural Synthesis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface-alt)] hover:bg-[var(--paper-border)] text-[var(--paper-ink)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Providers Section */}
        <div className="space-y-4">
          <h4 className="font-display font-bold text-base text-[var(--paper-ink)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--paper-accent)]" /> 100% Free Voice Providers
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface-alt)]/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[var(--paper-ink)]">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>Microsoft Edge Neural</span>
              </div>
              <p className="text-[var(--paper-ink-muted)] leading-relaxed">
                Over 320+ world-class neural voices across 70+ languages. Delivers human-grade intonation, natural breathing, and downloadable 24kHz MP3 audio with zero API keys required.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface-alt)]/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[var(--paper-ink)]">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Web Speech API</span>
              </div>
              <p className="text-[var(--paper-ink-muted)] leading-relaxed">
                100% offline, native browser engine. Zero network latency and real-time word boundary events that enable live karaoke-style reading synchronization.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface-alt)]/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[var(--paper-ink)]">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Google Web Speech</span>
              </div>
              <p className="text-[var(--paper-ink-muted)] leading-relaxed">
                Standard crisp pronunciation for 60+ global languages. Reliable, lightweight, and ideal for quick multi-lingual translations.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface-alt)]/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-[var(--paper-ink)]">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Kokoro Open Neural</span>
              </div>
              <p className="text-[var(--paper-ink-muted)] leading-relaxed">
                State-of-the-art open-weights neural voices (Bella, Sarah, Adam, Michael) crafted specifically for high-expression audiobook narration.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface-alt)]/60 space-y-1.5 sm:col-span-2">
              <div className="flex items-center gap-2 font-bold text-[var(--paper-ink)]">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Google Gemini 3.8 & 2.5 Native Audio (BYOK)</span>
              </div>
              <p className="text-[var(--paper-ink-muted)] leading-relaxed">
                Google's latest multimodal conversational voices (Puck, Charon, Kore, Fenrir, Zephyr, Orbit, Nova, Ursa) plus Google Cloud Journey broadcaster voices. Free 1,500 requests/day with your Google AI Studio key.
              </p>
            </div>
          </div>
        </div>

        {/* Paper Texture & Ergonomics */}
        <div className="space-y-3 pt-2 border-t border-[var(--paper-border)] text-xs text-[var(--paper-ink-muted)]">
          <h4 className="font-display font-bold text-sm text-[var(--paper-ink)] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--paper-accent)]" /> Tactile Paper Design
          </h4>
          <p className="leading-relaxed">
            PaperVoice combines digital speech synthesis with physical stationery aesthetics: genuine SVG fractal noise fiber texture, Italian cotton parchment styling in light mode, heavy slate graphite paper in dark mode, and ruled notebook lines.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--paper-border)] flex justify-between items-center text-xs font-mono-code text-[var(--paper-ink-muted)]">
          <span>Version 1.0.0 • Mobile & Desktop</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink)] font-semibold hover:bg-[var(--paper-border)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

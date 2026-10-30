import React from 'react';
import { 
  Sun, Moon, Feather, SlidersHorizontal, 
  History, Sparkles, HelpCircle, Layers, Volume2
} from 'lucide-react';

export default function Header({
  isDark,
  setIsDark,
  paperStyle,
  setPaperStyle,
  onOpenHistory,
  historyCount = 0,
  onOpenInfo,
  totalVoices = 320
}) {
  return (
    <header className="w-full border-b border-[var(--paper-border)] bg-[var(--paper-bg)]/85 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--paper-accent)] text-white flex items-center justify-center shadow-md border border-white/20">
            <Feather className="w-5 h-5 -rotate-12" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-[var(--paper-ink)]">
                PaperVoice
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono-code font-semibold rounded-full bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink-muted)]">
                TTS Studio
              </span>
            </div>
            <p className="text-xs text-[var(--paper-ink-muted)] hidden md:block">
              Tactile Speech Synthesizer • {totalVoices}+ Natural Voices
            </p>
          </div>
        </div>

        {/* Center / Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Paper Style Selector */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-xs">
            <span className="px-2 text-[var(--paper-ink-muted)] font-mono-code flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Paper:
            </span>
            {[
              { id: 'plain', label: 'Vellum' },
              { id: 'ruled', label: 'Ruled' },
              { id: 'grid', label: 'Grid' },
              { id: 'linen', label: 'Linen' }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setPaperStyle(style.id)}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                  paperStyle === style.id
                    ? 'bg-[var(--paper-surface)] text-[var(--paper-ink)] shadow-sm font-semibold'
                    : 'text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)]'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:bg-[var(--paper-surface-alt)] transition-all text-xs font-medium shadow-sm relative"
            title="Saved Audio Clips"
          >
            <History className="w-4 h-4 text-[var(--paper-ink-muted)]" />
            <span className="hidden sm:inline">Clips</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[var(--paper-accent)] text-white text-[10px] flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* About / Providers Info */}
          <button
            onClick={onOpenInfo}
            className="p-2 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:bg-[var(--paper-surface-alt)] transition-all text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)] shadow-sm"
            title="Providers & Technology"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle paper theme mode"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:bg-[var(--paper-surface-alt)] transition-all text-xs font-semibold shadow-sm group"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span className="hidden sm:inline">Vellum</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-stone-600 group-hover:-rotate-12 transition-transform" />
                <span className="hidden sm:inline">Graphite</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

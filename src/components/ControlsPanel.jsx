import React from 'react';
import { 
  Gauge, Activity, Volume2, RotateCcw, 
  Sparkles, Sliders, ShieldCheck
} from 'lucide-react';

export default function ControlsPanel({
  rate,
  setRate,
  pitch,
  setPitch,
  volume,
  setVolume,
  selectedVoice
}) {
  const resetDefaults = () => {
    setRate(1.0);
    setPitch(0);
    setVolume(100);
  };

  const isModified = rate !== 1.0 || pitch !== 0 || volume !== 100;

  return (
    <div className="paper-sheet p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[var(--paper-border)]">
        <h3 className="font-display font-bold text-base text-[var(--paper-ink)] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--paper-accent)]" /> Voice Modulation
        </h3>
        {isModified && (
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1 text-[11px] font-mono-code text-[var(--paper-accent)] hover:underline"
            title="Reset dials to default"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Speed / Rate Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--paper-ink)] flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[var(--paper-ink-muted)]" /> Speed / Pace:
            </span>
            <span className="font-mono-code font-bold text-[var(--paper-accent)] bg-[var(--paper-surface-alt)] px-2 py-0.5 rounded-md border border-[var(--paper-border)]">
              {rate.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full"
          />
          {/* Quick preset buttons */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {[0.75, 1.0, 1.25, 1.5].map((preset) => (
              <button
                key={preset}
                onClick={() => setRate(preset)}
                className={`px-2 py-1 rounded-md text-[10px] font-mono-code transition-colors ${
                  rate === preset
                    ? 'bg-[var(--paper-accent)] text-white font-semibold'
                    : 'bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)]'
                }`}
              >
                {preset}x
              </button>
            ))}
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--paper-ink)] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[var(--paper-ink-muted)]" /> Pitch Tuning:
            </span>
            <span className="font-mono-code font-bold text-[var(--paper-accent)] bg-[var(--paper-surface-alt)] px-2 py-0.5 rounded-md border border-[var(--paper-border)]">
              {pitch > 0 ? `+${pitch}` : pitch}Hz
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={pitch}
            onChange={(e) => setPitch(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] font-mono-code text-[var(--paper-ink-muted)] px-0.5">
            <span>Deeper (-50)</span>
            <span>Natural (0)</span>
            <span>Higher (+50)</span>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--paper-ink)] flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[var(--paper-ink-muted)]" /> Master Volume:
            </span>
            <span className="font-mono-code font-bold text-[var(--paper-accent)] bg-[var(--paper-surface-alt)] px-2 py-0.5 rounded-md border border-[var(--paper-border)]">
              {volume}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>

        {/* Selected Provider Badge Card */}
        {selectedVoice && (
          <div className="p-3 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--paper-ink)] truncate">{selectedVoice.name}</span>
              <span className="text-[10px] font-mono-code uppercase px-1.5 py-0.5 rounded bg-[var(--paper-surface)] border border-[var(--paper-border)] font-semibold text-[var(--paper-accent)]">
                {selectedVoice.provider}
              </span>
            </div>
            <p className="text-[11px] text-[var(--paper-ink-muted)]">
              {selectedVoice.localeName || selectedVoice.locale} • 24kHz High Fidelity Audio
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

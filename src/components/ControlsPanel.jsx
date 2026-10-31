import React from 'react';
import { 
  Gauge, Activity, Volume2, RotateCcw, 
  Sparkles, Sliders, MessageSquareQuote, Check
} from 'lucide-react';

const GEMINI_STYLE_PRESETS = [
  { label: 'Natural / Default', prompt: '', desc: 'Clean, neutral and natural delivery' },
  { label: 'Cheerful & Warm 😊', prompt: 'cheerful and warmly with a friendly smile', desc: 'Positive, happy, welcoming tone' },
  { label: 'Calm & Soothing 🧘', prompt: 'in a calm, gentle, soothing meditation voice', desc: 'Peaceful, unhurried, relaxing pace' },
  { label: 'Dramatic Story 🎭', prompt: 'in a dramatic, suspenseful storytelling voice', desc: 'Expressive audiobook narration with tension' },
  { label: 'Whispered 🤫', prompt: 'in a soft, mysterious whisper', desc: 'Hushed, intimate, and secretive delivery' },
  { label: 'Radio DJ 🎙️', prompt: 'like a relaxed late-night radio DJ, smooth and unhurried', desc: 'Deep, laid-back, velvet broadcast voice' },
  { label: 'News Anchor 📺', prompt: 'in a crisp, authoritative, professional news broadcast style', desc: 'Fast, articulate, formal broadcast tone' },
  { label: 'Excited & Fast ⚡', prompt: 'with high energy, fast enthusiasm, and excitement', desc: 'Uplifting, rapid, celebratory tone' },
  { label: 'Poetic & Reflective 📜', prompt: 'in a thoughtful, poetic, and reflective cadence', desc: 'Pensive, literary, and evocative rhythm' },
  { label: 'Sarcastic & Dry 😏', prompt: 'in a dry, witty, mildly sarcastic tone', desc: 'Deadpan humor and ironic inflection' }
];

export default function ControlsPanel({
  rate,
  setRate,
  pitch,
  setPitch,
  volume,
  setVolume,
  selectedVoice,
  geminiStyle = '',
  setGeminiStyle
}) {
  const resetDefaults = () => {
    setRate(1.0);
    setPitch(0);
    setVolume(100);
    if (setGeminiStyle) setGeminiStyle('');
  };

  const isGemini = selectedVoice?.provider === 'gemini';
  const isModified = rate !== 1.0 || pitch !== 0 || volume !== 100 || (isGemini && Boolean(geminiStyle));

  return (
    <div className="paper-sheet p-4 sm:p-6 transition-all space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--paper-border)]">
        <h3 className="font-display font-bold text-base text-[var(--paper-ink)] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--paper-accent)]" /> Voice Modulation
        </h3>
        {isModified && (
          <button
            type="button"
            onClick={resetDefaults}
            className="flex items-center gap-1 text-[11px] font-mono-code text-[var(--paper-accent)] hover:underline cursor-pointer"
            title="Reset dials to default"
          >
            <RotateCcw className="w-3 h-3" /> Reset All
          </button>
        )}
      </div>

      {/* Google AI Studio Style & Expression Controls (Active for Gemini Voices) */}
      {isGemini && setGeminiStyle && (
        <div className="p-3.5 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--paper-ink)] flex items-center gap-1.5 font-mono-code">
              <Sparkles className="w-3.5 h-3.5 text-[var(--paper-accent)]" /> Style & Delivery (Google Studio)
            </span>
            {geminiStyle && (
              <button
                type="button"
                onClick={() => setGeminiStyle('')}
                className="text-[10px] font-mono-code text-[var(--paper-accent)] hover:underline cursor-pointer"
              >
                Clear Style
              </button>
            )}
          </div>

          <p className="text-[11px] text-[var(--paper-ink-muted)] leading-relaxed">
            Direct how the voice performs the script using emotional cues and vocal personas:
          </p>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {GEMINI_STYLE_PRESETS.map((preset) => {
              const isSelected = (geminiStyle || '') === preset.prompt;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setGeminiStyle(preset.prompt)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium text-left truncate transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--paper-accent)] text-white border-[var(--paper-accent)] font-semibold shadow-xs'
                      : 'bg-[var(--paper-surface)] border-[var(--paper-border)] text-[var(--paper-ink)] hover:border-[var(--paper-accent)]'
                  }`}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Editable Prompt Field */}
          <div className="space-y-1 pt-1">
            <label className="text-[10px] font-mono-code text-[var(--paper-ink-muted)] flex items-center gap-1">
              <MessageSquareQuote className="w-3 h-3 text-[var(--paper-accent)]" />
              Direction prompt (editable or type custom style):
            </label>
            <input
              type="text"
              value={geminiStyle}
              onChange={(e) => setGeminiStyle(e.target.value)}
              placeholder="e.g. cheerful and warmly, British accent, dramatic narrator..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--paper-surface)] border border-[var(--paper-border)] text-[var(--paper-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--paper-accent)] font-mono-code placeholder-[var(--paper-ink-muted)]/50"
            />
          </div>
        </div>
      )}

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
              type="button"
              onClick={() => setRate(preset)}
              className={`px-2 py-1 rounded-md text-[10px] font-mono-code transition-colors cursor-pointer ${
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

      {/* Pitch Slider (Hidden for Gemini since Gemini models use prompt-based vocal directing) */}
      {!isGemini && (
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
      )}

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
            {selectedVoice.localeName || selectedVoice.locale} • {isGemini ? 'Expressive Neural Audio with Google AI Studio Tags' : '24kHz High Fidelity Audio'}
          </p>
        </div>
      )}
    </div>
  );
}

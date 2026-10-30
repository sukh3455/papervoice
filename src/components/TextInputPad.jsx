import React, { useRef, useState } from 'react';
import { 
  FileText, Copy, Trash2, Clipboard, Upload, 
  Sparkles, Clock, Type, AlignLeft, Check, Eye
} from 'lucide-react';
import { SAMPLE_TEXTS } from '../utils/sampleTexts';

export default function TextInputPad({
  text,
  setText,
  paperStyle,
  speakingRate = 1.0,
  activeWordIndex = -1,
  isSpeaking = false,
  isKaraoke = false,
  setIsKaraoke
}) {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Statistics calculation
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Average speaking rate: ~150 words per minute at 1.0x
  const estSeconds = wordCount > 0 ? Math.ceil((wordCount / (150 * speakingRate)) * 60) : 0;
  const estDuration = estSeconds >= 60 
    ? `${Math.floor(estSeconds / 60)}m ${estSeconds % 60}s` 
    : `${estSeconds}s`;

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
      }
    } catch (err) {
      alert('Clipboard access denied. Please paste directly using Ctrl+V or long press.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Get paper style class
  const getPaperPatternClass = () => {
    switch (paperStyle) {
      case 'ruled':
        return 'paper-ruled';
      case 'grid':
        return 'paper-grid';
      case 'linen':
        return 'paper-linen';
      default:
        return '';
    }
  };

  const wordsList = text.split(/(\s+)/);

  return (
    <div className="paper-sheet-elevated p-4 sm:p-7 relative transition-all">
      {/* Brass Bookmark / Stationery Clip */}
      <div className="brass-clip hidden sm:block" title="Stationery Paper Clip" />

      {/* Sheet Header / Toolset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--paper-border)]">
        {/* Sample presets dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-code text-[var(--paper-ink-muted)] flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[var(--paper-accent)]" /> Preset:
          </span>
          <select
            onChange={(e) => {
              const sample = SAMPLE_TEXTS.find((s) => s.id === e.target.value);
              if (sample) setText(sample.text);
            }}
            defaultValue=""
            className="text-xs font-medium bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--paper-accent)] cursor-pointer"
          >
            <option value="" disabled>Load curated sample text...</option>
            {SAMPLE_TEXTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.category}: {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Karaoke Mode Toggle */}
          <button
            onClick={() => setIsKaraoke(!isKaraoke)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isKaraoke
                ? 'bg-[var(--paper-highlight)] border-[var(--paper-brass)] text-[var(--paper-ink)] font-semibold'
                : 'border-[var(--paper-border)] bg-[var(--paper-surface-alt)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)]'
            }`}
            title="Toggle Word Highlighting View"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlight Read</span>
          </button>

          {/* Paste */}
          <button
            onClick={handlePaste}
            className="p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface-alt)] hover:bg-[var(--paper-border)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)] transition-colors"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            disabled={!text.trim()}
            className="p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface-alt)] hover:bg-[var(--paper-border)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)] transition-colors disabled:opacity-40"
            title="Copy text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Upload file */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface-alt)] hover:bg-[var(--paper-border)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)] transition-colors"
            title="Upload .txt text file"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.text"
            className="hidden"
          />

          {/* Clear */}
          <button
            onClick={() => setText('')}
            disabled={!text.trim()}
            className="p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface-alt)] hover:bg-rose-500/10 hover:border-rose-400 text-[var(--paper-ink-muted)] hover:text-rose-600 transition-colors disabled:opacity-40"
            title="Clear text"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Text Writing Area */}
      <div className="relative min-h-[260px] sm:min-h-[340px]">
        {isKaraoke && isSpeaking ? (
          /* Karaoke Reading Overlay */
          <div
            className={`w-full min-h-[260px] sm:min-h-[340px] p-2 text-base sm:text-lg font-editorial leading-relaxed tracking-wide text-[var(--paper-ink)] select-text ${getPaperPatternClass()}`}
          >
            {wordsList.map((segment, idx) => {
              const isMatch = activeWordIndex >= 0 && Math.floor(idx / 2) === activeWordIndex;
              return (
                <span
                  key={idx}
                  className={isMatch ? 'karaoke-word-active' : ''}
                >
                  {segment}
                </span>
              );
            })}
          </div>
        ) : (
          /* Editable Textarea */
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Dip your quill in ink... Type or paste text here to hear it brought to life with natural neural voice."
            className={`w-full min-h-[260px] sm:min-h-[340px] bg-transparent text-base sm:text-lg font-editorial text-[var(--paper-ink)] placeholder-[var(--paper-ink-muted)]/50 resize-y focus:outline-none leading-relaxed tracking-wide ${getPaperPatternClass()}`}
          />
        )}
      </div>

      {/* Footer Info: Word count, Char count, Duration */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-[var(--paper-border)] text-xs font-mono-code text-[var(--paper-ink-muted)]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            <strong className="text-[var(--paper-ink)] font-semibold">{charCount}</strong> chars
          </span>
          <span className="flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5" />
            <strong className="text-[var(--paper-ink)] font-semibold">{wordCount}</strong> words
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--paper-surface-alt)] px-2.5 py-1 rounded-full border border-[var(--paper-border)]">
          <Clock className="w-3.5 h-3.5 text-[var(--paper-accent)]" />
          <span>Est. read: <strong className="text-[var(--paper-ink)] font-semibold">{estDuration}</strong></span>
        </div>
      </div>
    </div>
  );
}

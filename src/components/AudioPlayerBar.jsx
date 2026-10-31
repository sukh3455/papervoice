import React, { useState } from 'react';
import { 
  Play, Pause, Square, Download, 
  Loader2, Feather, ChevronDown, ChevronUp,
  Volume2
} from 'lucide-react';
import InkWaveform from './InkWaveform';

export default function AudioPlayerBar({
  isPlaying,
  isLoading,
  currentTime = 0,
  duration = 0,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onDownload,
  selectedVoice,
  hasAudio = false,
  isDark = false
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--paper-bg)]/95 backdrop-blur-md border-t border-[var(--paper-border)] shadow-2xl transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">

        {/* 1. Mobile Collapsed (Mini Player) View */}
        {isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            {/* Active voice info - tap to expand */}
            <div 
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 py-1"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] flex items-center justify-center text-[var(--paper-accent)] shrink-0">
                <Feather className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--paper-ink)] truncate">
                  {selectedVoice ? selectedVoice.name : 'Select Voice'}
                </p>
                <p className="text-[10px] text-[var(--paper-ink-muted)] truncate flex items-center gap-1">
                  <span>{isLoading ? 'Synthesizing...' : isPlaying ? 'Speaking...' : hasAudio ? 'Ready' : 'Tap to expand'}</span>
                  {duration > 0 && <span>• {formatTime(currentTime)} / {formatTime(duration)}</span>}
                </p>
              </div>
            </div>

            {/* Quick Play/Pause & Expand Button */}
            <div className="flex items-center gap-2 shrink-0">
              {hasAudio && (
                <button
                  onClick={onDownload}
                  className="p-2 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface)] text-[var(--paper-ink)] hover:text-[var(--paper-accent)]"
                  title="Save MP3"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={isPlaying ? onPause : onPlay}
                disabled={isLoading}
                className="paper-stamp-button px-4 py-2 rounded-full flex items-center gap-1.5 font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{hasAudio ? 'Play' : 'Speak'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface-alt)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)] transition-colors"
                title="Expand full player"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* 2. Expanded Player View */
          <div>
            {/* Mobile Drag / Collapse Tab Bar */}
            <div className="flex sm:hidden items-center justify-between pb-1 mb-1 border-b border-[var(--paper-border)]/50">
              <span className="text-[10px] font-mono-code text-[var(--paper-ink-muted)] flex items-center gap-1">
                <Feather className="w-3 h-3 text-[var(--paper-accent)]" /> Audio Player
              </span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="flex items-center gap-1 text-[11px] font-mono-code text-[var(--paper-accent)] hover:underline py-0.5 px-2 rounded-md hover:bg-[var(--paper-surface-alt)]"
              >
                <span>Minimize</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop & Mobile Main Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
              
              {/* Voice info */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] flex items-center justify-center text-[var(--paper-accent)] shrink-0">
                    <Feather className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--paper-ink)] truncate max-w-[150px] sm:max-w-[200px]">
                      {selectedVoice ? selectedVoice.name : 'No Voice Selected'}
                    </p>
                    <p className="text-[10px] text-[var(--paper-ink-muted)] truncate">
                      {isLoading ? 'Synthesizing voice...' : isPlaying ? 'Speaking now' : hasAudio ? 'Ready to play' : 'Ready'}
                    </p>
                  </div>
                </div>

                {/* Time Indicator on mobile */}
                <div className="sm:hidden text-[11px] font-mono-code text-[var(--paper-ink-muted)]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Center Controls & Scrubber */}
              <div className="flex-1 max-w-xl w-full flex flex-col items-center gap-1">
                <div className="flex items-center gap-3">
                  {/* Stop */}
                  <button
                    onClick={onStop}
                    disabled={!hasAudio && !isPlaying && !isLoading}
                    className="p-1.5 sm:p-2 rounded-full border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:bg-[var(--paper-surface-alt)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)] transition-all disabled:opacity-40"
                    title="Stop playback"
                  >
                    <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                  </button>

                  {/* Primary Speak / Play button */}
                  <button
                    onClick={isPlaying ? onPause : onPlay}
                    disabled={isLoading}
                    className="paper-stamp-button px-5 sm:px-6 py-2 sm:py-2.5 rounded-full flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-white" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{hasAudio ? 'Play' : 'Speak Text'}</span>
                      </>
                    )}
                  </button>

                  {/* Save MP3 on mobile */}
                  <button
                    onClick={onDownload}
                    disabled={!hasAudio}
                    className="sm:hidden p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:bg-[var(--paper-surface-alt)] text-[var(--paper-ink)] disabled:opacity-40"
                    title="Save MP3"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Desktop Minimize toggle */}
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="hidden sm:inline-flex p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface-alt)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)]"
                    title="Minimize player"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Timeline Scrubber */}
                <div className="w-full flex items-center gap-2">
                  <span className="hidden sm:inline text-[10px] font-mono-code text-[var(--paper-ink-muted)] w-8 text-right">
                    {formatTime(currentTime)}
                  </span>

                  <div
                    onClick={(e) => {
                      if (!duration || !onSeek) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                      onSeek(ratio * duration);
                    }}
                    className="flex-1 h-2 bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] rounded-full overflow-hidden cursor-pointer relative group"
                  >
                    <div
                      className="h-full bg-[var(--paper-accent)] transition-all duration-100 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <span className="hidden sm:inline text-[10px] font-mono-code text-[var(--paper-ink-muted)] w-8">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Right: Waveform and Desktop Download */}
              <div className="hidden sm:flex items-center gap-3 w-56 justify-end">
                <div className="w-32 h-9">
                  <InkWaveform isPlaying={isPlaying} isDark={isDark} />
                </div>

                <button
                  onClick={onDownload}
                  disabled={!hasAudio}
                  className="p-2 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:bg-[var(--paper-surface-alt)] text-[var(--paper-ink)] hover:text-[var(--paper-accent)] transition-all shadow-sm disabled:opacity-40"
                  title="Download MP3"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

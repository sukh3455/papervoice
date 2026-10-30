import React, { useState } from 'react';
import { 
  Play, Pause, Square, Download, RotateCcw, 
  Volume2, VolumeX, Loader2, Sparkles, Feather
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
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--paper-bg)]/95 backdrop-blur-md border-t border-[var(--paper-border)] shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Mobile & Desktop Flexible Grid */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left: Active Voice & Playback Status */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] flex items-center justify-center text-[var(--paper-accent)] shrink-0">
                <Feather className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--paper-ink)] truncate max-w-[140px] sm:max-w-[200px]">
                  {selectedVoice ? selectedVoice.name : 'No Voice Selected'}
                </p>
                <p className="text-[10px] text-[var(--paper-ink-muted)] truncate">
                  {isLoading ? 'Synthesizing voice...' : isPlaying ? 'Speaking now' : hasAudio ? 'Ready to play' : 'Ready'}
                </p>
              </div>
            </div>

            {/* Time Indicator (Mobile) */}
            <div className="sm:hidden text-[11px] font-mono-code text-[var(--paper-ink-muted)]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Center: Main Controls & Scrubber */}
          <div className="flex-1 max-w-xl w-full flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-3">
              {/* Stop */}
              <button
                onClick={onStop}
                disabled={!hasAudio && !isPlaying && !isLoading}
                className="p-2 rounded-full border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:bg-[var(--paper-surface-alt)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)] transition-all disabled:opacity-40"
                title="Stop playback"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Master Play / Pause / Synthesize Button */}
              <button
                onClick={isPlaying ? onPause : onPlay}
                disabled={isLoading}
                className="paper-stamp-button px-6 py-2.5 rounded-full flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>{hasAudio ? 'Play' : 'Speak Text'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Timeline scrubber bar */}
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

          {/* Right: Waveform Preview & Download MP3 */}
          <div className="hidden md:flex items-center gap-3 w-64 justify-end">
            <div className="w-36 h-10">
              <InkWaveform isPlaying={isPlaying} isDark={isDark} />
            </div>

            {/* Download Button */}
            <button
              onClick={onDownload}
              disabled={!hasAudio}
              className="p-2.5 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:bg-[var(--paper-surface-alt)] text-[var(--paper-ink)] hover:text-[var(--paper-accent)] transition-all shadow-sm disabled:opacity-40"
              title="Download generated MP3 audio"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Download action */}
          <div className="md:hidden w-full flex items-center justify-between pt-1 border-t border-[var(--paper-border)]">
            <div className="flex-1 mr-2">
              <InkWaveform isPlaying={isPlaying} isDark={isDark} />
            </div>
            <button
              onClick={onDownload}
              disabled={!hasAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface)] text-xs font-semibold text-[var(--paper-ink)] disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save MP3</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

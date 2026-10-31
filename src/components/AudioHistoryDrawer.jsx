import React from 'react';
import { 
  X, Play, Download, Trash2, Clock, 
  Volume2, History, AlertCircle
} from 'lucide-react';

export default function AudioHistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onPlayItem,
  onDownloadItem,
  onDeleteItem,
  onClearAll
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md h-full bg-[var(--paper-surface)] border-l border-[var(--paper-border)] shadow-2xl flex flex-col p-5 overflow-hidden animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--paper-border)]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--paper-accent)]" />
            <h3 className="font-display font-bold text-lg text-[var(--paper-ink)]">
              Voice Archive
            </h3>
            <span className="text-xs font-mono-code px-2 py-0.5 rounded-full bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink-muted)]">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface-alt)] hover:bg-[var(--paper-border)] text-[var(--paper-ink)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 px-4 text-[var(--paper-ink-muted)]">
              <History className="w-10 h-10 mx-auto opacity-30 mb-3" />
              <p className="font-editorial text-base text-[var(--paper-ink)] mb-1">Archive is Empty</p>
              <p className="text-xs">
                Generated speech clips will be preserved here so you can replay and export them anytime.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface-alt)]/60 hover:bg-[var(--paper-surface-alt)] transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--paper-ink)] truncate max-w-[200px]">
                    <Volume2 className="w-3.5 h-3.5 text-[var(--paper-accent)]" />
                    <span>{item.voiceName}</span>
                  </div>
                  <span className="text-[10px] font-mono-code text-[var(--paper-ink-muted)]">
                    {item.date}
                  </span>
                </div>

                {/* Text snippet */}
                <p className="text-xs text-[var(--paper-ink)] font-editorial line-clamp-2 leading-relaxed italic opacity-90">
                  "{item.text}"
                </p>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--paper-border)]/60 text-xs">
                  <span className="text-[10px] font-mono-code text-[var(--paper-ink-muted)]">
                    {item.duration || 'MP3 Audio'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onPlayItem(item)}
                      className="p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:text-[var(--paper-accent)] transition-colors"
                      title="Replay audio"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDownloadItem(item)}
                      className="p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:text-[var(--paper-accent)] transition-colors"
                      title="Download MP3"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface)] hover:text-rose-500 transition-colors"
                      title="Delete from archive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions (left-aligned with bottom clearance so Netlify badge cannot overlap) */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-[var(--paper-border)] flex justify-start pb-16 sm:pb-3">
            <button
              onClick={onClearAll}
              className="text-xs font-mono-code text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, KeyRound, Check, AlertCircle, Eye, EyeOff, 
  ExternalLink, Sparkles, Shield, Trash2, Loader2
} from 'lucide-react';

export default function ApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  onRemoveKey,
  geminiModel = 'gemini-3.8-flash',
  setGeminiModel = () => {}
}) {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid Google API key.' });
      return;
    }

    try {
      setIsValidating(true);
      setStatusMessage(null);

      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.valid) {
        onSaveKey(trimmed);
        setStatusMessage({ type: 'success', text: '✅ Key verified! Gemini 3.8 Audio & Journey voices unlocked.' });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Even if validation ping failed due to network or restricted scopes, allow saving with warning
        setStatusMessage({ 
          type: 'warning', 
          text: `Validation notice: ${data.error || 'Could not verify immediately'}. Key saved anyway.` 
        });
        onSaveKey(trimmed);
      }
    } catch (err) {
      onSaveKey(trimmed);
      setStatusMessage({ type: 'warning', text: 'Saved key locally (offline test).' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setInputKey('');
    onRemoveKey();
    setStatusMessage({ type: 'info', text: 'Google API key removed.' });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[var(--paper-surface)] border border-[var(--paper-border)] shadow-2xl rounded-2xl p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--paper-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[var(--paper-ink)]">
                Google Gemini API Key
              </h3>
              <p className="text-[11px] text-[var(--paper-ink-muted)]">
                Unlocks Gemini 3.8 & 2.5 Audio (Puck, Charon, Kore, Fenrir, Zephyr) & Journey voices
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

        {/* Info Box */}
        <div className="p-3.5 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[var(--paper-ink)]">
            <Sparkles className="w-4 h-4 text-[var(--paper-accent)]" />
            <span>1,500 Free Generations Per Day</span>
          </div>
          <p className="text-[var(--paper-ink-muted)] leading-relaxed">
            Google AI Studio provides 100% free API keys with up to 15 requests per minute. Your key is stored securely inside your browser's private local storage.
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono-code text-[11px] text-[var(--paper-accent)] hover:underline font-medium pt-1"
          >
            <span>Get your free Google API key at AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Model Preference */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono-code font-medium text-[var(--paper-ink)]">
            Preferred Gemini Model:
          </label>
          <select
            value={geminiModel}
            onChange={(e) => setGeminiModel(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono-code rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--paper-accent)] cursor-pointer"
          >
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (Latest & Recommended)</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-Fast Multimodal)</option>
            <option value="gemini-3.8-pro">Gemini 3.8 Pro (High-Fidelity Expressive)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Studio Long-Form)</option>
          </select>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-xs font-mono-code font-medium text-[var(--paper-ink)]">
            API Key (starts with AIzaSy...):
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste your AIzaSy... key here"
              className="w-full pl-3 pr-10 py-2.5 text-xs font-mono-code rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink)] placeholder-[var(--paper-ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--paper-accent)]"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)]"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
          }`}>
            {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--paper-border)]">
          {apiKey ? (
            <button
              onClick={handleRemove}
              className="text-xs font-mono-code text-rose-500 hover:text-rose-600 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Key
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[var(--paper-border)] bg-[var(--paper-surface-alt)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)]"
            >
              Cancel
            </button>
            <button
              onClick={handleTestAndSave}
              disabled={isValidating || !inputKey.trim()}
              className="paper-stamp-button px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-40"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

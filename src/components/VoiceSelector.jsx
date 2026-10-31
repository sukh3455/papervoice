import React, { useState, useMemo } from 'react';
import { 
  Search, Star, Play, Pause, Globe, Zap, 
  Sparkles, Filter, Check, Volume2, User, KeyRound, RotateCcw
} from 'lucide-react';

export default function VoiceSelector({
  selectedVoice,
  setSelectedVoice,
  voicesByProvider,
  favorites = [],
  onToggleFavorite,
  onPreviewVoice,
  previewingVoiceId = null,
  hasGoogleKey = false,
  onOpenKeyModal,
  geminiModel = 'gemini-2.5-flash-preview-tts',
  setGeminiModel = () => {},
  geminiModels = []
}) {
  const [activeProvider, setActiveProvider] = useState('edge'); // 'edge', 'gemini', 'webspeech', 'google', 'kokoro'
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 'female', 'male'
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Common language filter tags
  const LANGUAGE_TAGS = [
    { id: 'all', label: 'All Locales' },
    { id: 'en-US', label: 'English (US)' },
    { id: 'en-GB', label: 'English (UK)' },
    { id: 'es', label: 'Spanish' },
    { id: 'fr', label: 'French' },
    { id: 'de', label: 'German' },
    { id: 'ja', label: 'Japanese' },
    { id: 'hi', label: 'Hindi' },
    { id: 'zh', label: 'Chinese' },
    { id: 'it', label: 'Italian' }
  ];

  const currentVoicesList = voicesByProvider[activeProvider] || [];

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setGenderFilter('all');
    setSelectedLanguage('all');
  };

  // Switch provider tab with safety filter reset
  const handleSelectProvider = (provId) => {
    setActiveProvider(provId);
    setSearchQuery('');
    setSelectedLanguage('all');
    setGenderFilter('all');
  };

  // Filter voices based on search, gender, and language
  const filteredVoices = useMemo(() => {
    return currentVoicesList.filter((voice) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = voice.name?.toLowerCase().includes(query);
        const matchesFull = voice.fullName?.toLowerCase().includes(query);
        const matchesLocale = voice.locale?.toLowerCase().includes(query);
        const matchesLocaleName = voice.localeName?.toLowerCase().includes(query);
        if (!matchesName && !matchesFull && !matchesLocale && !matchesLocaleName) {
          return false;
        }
      }

      // 2. Gender filter
      if (genderFilter !== 'all') {
        const voiceGender = (voice.gender || '').toLowerCase();
        if (genderFilter === 'female' && !voiceGender.includes('female')) return false;
        if (genderFilter === 'male' && !voiceGender.includes('male')) return false;
      }

      // 3. Language filter
      if (selectedLanguage !== 'all') {
        // Gemini voices natively support 130+ languages (multilingual)
        if (voice.provider === 'gemini' || voice.locale === 'multilingual') {
          return true;
        }
        const locale = (voice.locale || '').toLowerCase();
        if (!locale.startsWith(selectedLanguage.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [currentVoicesList, searchQuery, genderFilter, selectedLanguage]);

  // Separate favorites from the rest for top placement
  const sortedVoices = useMemo(() => {
    return [...filteredVoices].sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [filteredVoices, favorites]);

  const hasActiveFilters = searchQuery.trim() !== '' || genderFilter !== 'all' || selectedLanguage !== 'all';

  return (
    <div className="paper-sheet p-4 sm:p-6 transition-all space-y-4">
      {/* Title & Active Voice Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-lg text-[var(--paper-ink)] flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[var(--paper-accent)]" /> Voice Catalog
          </h2>
          <p className="text-xs text-[var(--paper-ink-muted)]">
            Explore 350+ free neural & native voices across multiple providers
          </p>
        </div>

        {/* Selected badge */}
        {selectedVoice && (
          <div className="px-3 py-1 rounded-full bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-xs font-mono-code text-[var(--paper-ink)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active: <strong>{selectedVoice.name}</strong></span>
          </div>
        )}
      </div>

      {/* Provider Selector Tabs (1-row horizontal scroll on mobile, 5-col grid on desktop) */}
      <div className="flex sm:grid sm:grid-cols-5 gap-1.5 p-1 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] overflow-x-auto no-scrollbar">
        {[
          { id: 'edge', label: 'Edge Neural', icon: Globe, count: voicesByProvider.edge?.length || 320, badge: 'Free' },
          { id: 'gemini', label: 'Gemini Audio', icon: Sparkles, count: voicesByProvider.gemini?.length || 28, badge: hasGoogleKey ? 'Active' : 'Key Needed' },
          { id: 'webspeech', label: 'Web Speech', icon: Zap, count: voicesByProvider.webspeech?.length || 0, badge: 'Offline' },
          { id: 'google', label: 'Google Web', icon: Volume2, count: voicesByProvider.google?.length || 10, badge: 'Standard' },
          { id: 'kokoro', label: 'Kokoro Neural', icon: User, count: voicesByProvider.kokoro?.length || 6, badge: 'Open' }
        ].map((prov) => {
          const Icon = prov.icon;
          const isActive = activeProvider === prov.id;
          return (
            <button
              key={prov.id}
              type="button"
              onClick={() => handleSelectProvider(prov.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg text-xs transition-all shrink-0 sm:shrink min-w-[100px] sm:min-w-0 cursor-pointer ${
                isActive
                  ? 'bg-[var(--paper-surface)] text-[var(--paper-ink)] font-bold shadow-xs border border-[var(--paper-border)] ring-1 ring-[var(--paper-accent)]/30'
                  : 'text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)] hover:bg-[var(--paper-surface)]/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--paper-accent)]' : ''}`} />
                <span className="truncate whitespace-nowrap">{prov.label}</span>
              </div>
              <span className="text-[10px] font-mono-code opacity-75 mt-0.5">
                {prov.count} voices
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2.5">
        <div className="flex gap-2">
          {/* Search box */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--paper-ink-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voices by name or accent..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink)] placeholder-[var(--paper-ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--paper-accent)]"
            />
          </div>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink)] focus:outline-none cursor-pointer shrink-0"
          >
            <option value="all">Any Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        {/* Quick Language Chips or Gemini Multilingual Banner */}
        {activeProvider !== 'gemini' ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {LANGUAGE_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedLanguage(tag.id)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  selectedLanguage === tag.id
                    ? 'bg-[var(--paper-accent)] text-white font-medium shadow-xs'
                    : 'bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)]'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[11px] font-mono-code text-[var(--paper-ink-muted)]">
            <span className="flex items-center gap-1.5 text-[var(--paper-accent)] font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> 28 Gemini Expressive Voices
            </span>
            <span className="text-[10px] text-[var(--paper-ink)] bg-[var(--paper-surface)] px-2 py-0.5 rounded border border-[var(--paper-border)]">
              Speaks 130+ languages natively
            </span>
          </div>
        )}
      </div>

      {/* Gemini Model Selector Card */}
      {activeProvider === 'gemini' && (
        <div className="p-3 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-[var(--paper-ink)] flex items-center gap-1.5 font-mono-code">
              <Sparkles className="w-3.5 h-3.5 text-[var(--paper-accent)]" /> Gemini Engine:
            </span>
            <span className="text-[10px] text-[var(--paper-ink-muted)] font-mono-code">
              Google AI Studio
            </span>
          </div>
          <select
            value={geminiModel}
            onChange={(e) => setGeminiModel(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg bg-[var(--paper-surface)] border border-[var(--paper-border)] text-[var(--paper-ink)] font-mono-code focus:outline-none focus:ring-1 focus:ring-[var(--paper-accent)] cursor-pointer"
          >
            <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash TTS (Latest &amp; Recommended)</option>
            <option value="gemini-2.5-pro-preview-tts">Gemini 2.5 Pro TTS (Highest Quality)</option>
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (Multimodal Latest)</option>
          </select>
        </div>
      )}

      {/* Gemini Key Warning Banner */}
      {activeProvider === 'gemini' && !hasGoogleKey && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[var(--paper-ink)]">
            <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Google API Key required for Gemini TTS voices.</span>
          </div>
          <button
            type="button"
            onClick={onOpenKeyModal}
            className="px-3 py-1.5 rounded-lg bg-[var(--paper-accent)] text-white font-bold text-xs shrink-0 shadow-xs hover:opacity-90 cursor-pointer"
          >
            Enter Key
          </button>
        </div>
      )}

      {/* Voices List */}
      <div className="max-h-[50vh] sm:max-h-[440px] overflow-y-auto space-y-2 pr-1 pb-4">
        {sortedVoices.length === 0 ? (
          <div className="text-center py-8 px-4 text-[var(--paper-ink-muted)] text-xs space-y-3">
            <p className="font-editorial text-base text-[var(--paper-ink)]">No voices found matching criteria</p>
            <p className="text-[11px] max-w-xs mx-auto text-[var(--paper-ink-muted)]">
              {searchQuery ? `No results for "${searchQuery}". ` : ''}
              {selectedLanguage !== 'all' ? `Filtered by ${selectedLanguage}. ` : ''}
              Try resetting your filters to see all available voices.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--paper-accent)] text-white font-medium text-xs shadow-xs hover:opacity-90 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset All Filters
              </button>
            )}
          </div>
        ) : (
          sortedVoices.map((voice) => {
            const isSelected = selectedVoice?.id === voice.id;
            const isFav = favorites.includes(voice.id);
            const isPreviewing = previewingVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                onClick={() => setSelectedVoice(voice)}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--paper-accent)] bg-[var(--paper-surface-alt)] shadow-xs'
                    : 'border-[var(--paper-border)] bg-[var(--paper-surface)] hover:border-[var(--paper-ink-muted)]/40 hover:bg-[var(--paper-surface-alt)]/50'
                }`}
              >
                {/* Voice Details */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Select radio pill */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-[var(--paper-accent)] bg-[var(--paper-accent)] text-white'
                        : 'border-[var(--paper-border)] bg-[var(--paper-surface)]'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-[var(--paper-ink)] truncate">
                        {voice.name}
                      </span>
                      <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded-md bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink-muted)] shrink-0">
                        {voice.gender}
                      </span>
                      {voice.requiresKey && (
                        <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 shrink-0 flex items-center gap-0.5">
                          <KeyRound className="w-2.5 h-2.5" /> Key
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--paper-ink-muted)] truncate mt-0.5">
                      {voice.localeName || voice.locale}
                    </p>
                  </div>
                </div>

                {/* Right Actions: Favorite & Preview */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  {/* Star Favorite */}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(voice.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isFav
                        ? 'text-amber-500 fill-amber-500 hover:text-amber-600'
                        : 'text-[var(--paper-ink-muted)] hover:text-amber-500'
                    }`}
                    title={isFav ? 'Remove favorite' : 'Add to favorites'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>

                  {/* Preview snippet button */}
                  <button
                    type="button"
                    onClick={() => onPreviewVoice(voice)}
                    className={`p-1.5 rounded-lg border border-[var(--paper-border)] transition-colors cursor-pointer ${
                      isPreviewing
                        ? 'bg-[var(--paper-accent)] text-white border-[var(--paper-accent)]'
                        : 'bg-[var(--paper-surface-alt)] text-[var(--paper-ink)] hover:bg-[var(--paper-border)]'
                    }`}
                    title="Preview 2-second voice sample"
                  >
                    {isPreviewing ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

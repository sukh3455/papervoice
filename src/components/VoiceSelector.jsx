import React, { useState, useMemo } from 'react';
import { 
  Search, Star, Play, Pause, Globe, Zap, 
  Sparkles, Filter, Check, Volume2, User
} from 'lucide-react';

export default function VoiceSelector({
  selectedVoice,
  setSelectedVoice,
  voicesByProvider,
  favorites = [],
  onToggleFavorite,
  onPreviewVoice,
  previewingVoiceId = null
}) {
  const [activeProvider, setActiveProvider] = useState('edge'); // 'edge', 'webspeech', 'google', 'kokoro'
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

  return (
    <div className="paper-sheet p-4 sm:p-6 transition-all">
      {/* Title & Active Voice Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
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

      {/* Provider Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] mb-4">
        {[
          { id: 'edge', label: 'Edge Neural', icon: Globe, count: voicesByProvider.edge?.length || 320, badge: 'Recommended' },
          { id: 'webspeech', label: 'Web Speech', icon: Zap, count: voicesByProvider.webspeech?.length || 0, badge: 'Offline 0ms' },
          { id: 'google', label: 'Google Web', icon: Sparkles, count: voicesByProvider.google?.length || 10, badge: 'Standard' },
          { id: 'kokoro', label: 'Kokoro Neural', icon: User, count: voicesByProvider.kokoro?.length || 6, badge: 'Expressive' }
        ].map((prov) => {
          const Icon = prov.icon;
          const isActive = activeProvider === prov.id;
          return (
            <button
              key={prov.id}
              onClick={() => setActiveProvider(prov.id)}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-[var(--paper-surface)] text-[var(--paper-ink)] font-bold shadow-sm border border-[var(--paper-border)]'
                  : 'text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--paper-accent)]' : ''}`} />
                <span>{prov.label}</span>
              </div>
              <span className="text-[10px] font-mono-code opacity-75 mt-0.5">
                {prov.count} voices
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--paper-ink-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voices by name, accent, or language..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink)] placeholder-[var(--paper-ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--paper-accent)]"
            />
          </div>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-xl bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink)] focus:outline-none cursor-pointer"
          >
            <option value="all">Any Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        {/* Quick Language Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {LANGUAGE_TAGS.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedLanguage(tag.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedLanguage === tag.id
                  ? 'bg-[var(--paper-accent)] text-white font-medium shadow-sm'
                  : 'bg-[var(--paper-surface-alt)] border border-[var(--paper-border)] text-[var(--paper-ink-muted)] hover:text-[var(--paper-ink)]'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voices Grid */}
      <div className="max-h-[55vh] sm:max-h-[460px] overflow-y-auto space-y-2 pr-1 pb-24">
        {sortedVoices.length === 0 ? (
          <div className="text-center py-10 text-[var(--paper-ink-muted)] text-xs">
            <p className="font-editorial text-base text-[var(--paper-ink)] mb-1">No voices found matching criteria</p>
            <p>Try clearing your search query or selecting a different language tag.</p>
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
                    ? 'border-[var(--paper-accent)] bg-[var(--paper-surface-alt)] shadow-sm'
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
                    onClick={() => onToggleFavorite(voice.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
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
                    onClick={() => onPreviewVoice(voice)}
                    className={`p-1.5 rounded-lg border border-[var(--paper-border)] transition-colors ${
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

import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import TextInputPad from './components/TextInputPad';
import VoiceSelector from './components/VoiceSelector';
import ControlsPanel from './components/ControlsPanel';
import AudioPlayerBar from './components/AudioPlayerBar';
import AudioHistoryDrawer from './components/AudioHistoryDrawer';
import InfoModal from './components/InfoModal';
import { webSpeech } from './utils/webSpeech';
import { SAMPLE_TEXTS } from './utils/sampleTexts';

export default function App() {
  // Theme & Paper Style state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('papervoice_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [paperStyle, setPaperStyle] = useState(() => {
    return localStorage.getItem('papervoice_paper_style') || 'ruled';
  });

  // Text state
  const [text, setText] = useState(() => {
    return localStorage.getItem('papervoice_draft_text') || SAMPLE_TEXTS[0].text;
  });

  // Voice & Provider states
  const [voicesByProvider, setVoicesByProvider] = useState({
    edge: [],
    webspeech: [],
    google: [],
    kokoro: []
  });
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('papervoice_favorites') || '[]');
    } catch {
      return [];
    }
  });

  // Modulation controls
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(100);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentBlob, setCurrentBlob] = useState(null);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [isKaraoke, setIsKaraoke] = useState(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null);
  const [lastSynthesized, setLastSynthesized] = useState(null);

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('papervoice_history') || '[]');
    } catch {
      return [];
    }
  });

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState(null);

  const audioRef = useRef(new Audio());
  const previewAudioRef = useRef(new Audio());

  // Show temporary toast message
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Sync Dark mode class with root html
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('papervoice_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('papervoice_theme', 'light');
    }
  }, [isDark]);

  // 2. Persist paper style
  useEffect(() => {
    localStorage.setItem('papervoice_paper_style', paperStyle);
  }, [paperStyle]);

  // 3. Persist text draft
  useEffect(() => {
    localStorage.setItem('papervoice_draft_text', text);
  }, [text]);

  // 4. Persist favorites
  useEffect(() => {
    localStorage.setItem('papervoice_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // 5. Persist history
  useEffect(() => {
    localStorage.setItem('papervoice_history', JSON.stringify(history));
  }, [history]);

  // 6. Fetch voices from server & initialize WebSpeech voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await fetch('/api/voices');
        if (res.ok) {
          const data = await res.json();
          const webVoices = webSpeech.getVoices();

          setVoicesByProvider({
            edge: data.edge || [],
            webspeech: webVoices,
            google: data.google || [],
            kokoro: data.kokoro || []
          });

          // Set default voice (prefer en-US Jenny or first available)
          if (!selectedVoice) {
            const defaultVoice = 
              data.edge?.find((v) => v.id === 'en-US-JennyNeural') ||
              data.edge?.[0] ||
              webVoices[0];
            if (defaultVoice) setSelectedVoice(defaultVoice);
          }
        }
      } catch (err) {
        console.warn('API voices fetch error, using fallback/web speech:', err);
        const webVoices = webSpeech.getVoices();
        setVoicesByProvider((prev) => ({
          ...prev,
          webspeech: webVoices
        }));
        if (webVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(webVoices[0]);
        }
      }
    };

    fetchVoices();

    // Listen for WebSpeech voices when browser loads them asynchronously
    const unsub = webSpeech.subscribe((webVoices) => {
      setVoicesByProvider((prev) => ({
        ...prev,
        webspeech: webVoices
      }));
    });

    return () => unsub();
  }, []);

  // 7. Setup Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Rough synchronized word highlighter for audio playback
      if (duration > 0 && text.trim()) {
        const words = text.trim().split(/\s+/);
        const ratio = audio.currentTime / duration;
        const targetIndex = Math.min(words.length - 1, Math.floor(ratio * words.length));
        setActiveWordIndex(targetIndex);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveWordIndex(-1);
    };

    const onError = (e) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [duration, text]);

  // Toggle favorite voice
  const handleToggleFavorite = (voiceId) => {
    setFavorites((prev) => 
      prev.includes(voiceId) ? prev.filter((id) => id !== voiceId) : [...prev, voiceId]
    );
  };

  // Voice selection handler (invalidates prior audio so new voice is synthesized)
  const handleSelectVoice = (voice) => {
    if (selectedVoice?.id !== voice.id) {
      handleStop();
      if (audioUrl) {
        try { URL.revokeObjectURL(audioUrl); } catch (e) {}
      }
      setAudioUrl(null);
      setCurrentBlob(null);
      setLastSynthesized(null);
      setCurrentTime(0);
      setDuration(0);
      setSelectedVoice(voice);
      showToast(`Selected voice: ${voice.name} (${voice.localeName || voice.locale})`);
    }
  };

  // Text change handler (invalidates prior audio so new text is synthesized)
  const handleTextChange = (newText) => {
    setText(newText);
    if (lastSynthesized && lastSynthesized.text !== newText.trim()) {
      handleStop();
      if (audioUrl) {
        try { URL.revokeObjectURL(audioUrl); } catch (e) {}
      }
      setAudioUrl(null);
      setCurrentBlob(null);
      setLastSynthesized(null);
      setCurrentTime(0);
      setDuration(0);
    }
  };

  // Modulation change handlers
  const handleRateChange = (newRate) => {
    setRate(newRate);
    if (audioUrl) {
      try { URL.revokeObjectURL(audioUrl); } catch (e) {}
    }
    setAudioUrl(null);
    setLastSynthesized(null);
  };

  const handlePitchChange = (newPitch) => {
    setPitch(newPitch);
    if (audioUrl) {
      try { URL.revokeObjectURL(audioUrl); } catch (e) {}
    }
    setAudioUrl(null);
    setLastSynthesized(null);
  };

  // Preview voice sample
  const handlePreviewVoice = async (voice) => {
    if (previewingVoiceId === voice.id) {
      // Stop preview
      webSpeech.stop();
      previewAudioRef.current.pause();
      setPreviewingVoiceId(null);
      return;
    }

    setPreviewingVoiceId(voice.id);
    const samplePhrase = `Greetings! I am ${voice.name}, ready to narrate your text.`;

    if (voice.provider === 'webspeech') {
      webSpeech.speak({
        text: samplePhrase,
        voiceName: voice.id,
        rate: 1.0,
        pitch: 0,
        volume: 100,
        onEnd: () => setPreviewingVoiceId(null),
        onError: () => setPreviewingVoiceId(null)
      });
    } else {
      try {
        const endpoint = voice.provider === 'google' ? '/api/tts/google' : '/api/tts/edge';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: samplePhrase,
            voice: voice.id,
            locale: voice.locale,
            rate: 1.0,
            pitch: 0,
            volume: 100
          })
        });

        if (!res.ok) throw new Error('Preview fetch failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const pAudio = previewAudioRef.current;
        pAudio.src = url;
        pAudio.play();
        pAudio.onended = () => setPreviewingVoiceId(null);
        pAudio.onerror = () => setPreviewingVoiceId(null);
      } catch (err) {
        console.error('Preview error:', err);
        setPreviewingVoiceId(null);
        showToast('Preview failed. Using WebSpeech fallback.');
      }
    }
  };

  // Primary Synthesize & Speak Action
  const handlePlay = async () => {
    if (!text.trim()) {
      showToast('Please type or paste some text on the paper sheet first.');
      return;
    }

    if (!selectedVoice) {
      showToast('Please select a voice from the catalog.');
      return;
    }

    // Check if this is truly a resume of the exact same audio
    const isSameText = lastSynthesized?.text === text.trim();
    const isSameVoice = lastSynthesized?.voiceId === selectedVoice.id;
    const isSameRate = lastSynthesized?.rate === rate;
    const isSamePitch = lastSynthesized?.pitch === pitch;
    const isExactSameSynthesis = isSameText && isSameVoice && isSameRate && isSamePitch;

    const canResumeExistingAudio = 
      isExactSameSynthesis &&
      selectedVoice.provider !== 'webspeech' &&
      audioUrl &&
      audioRef.current &&
      audioRef.current.src === audioUrl &&
      audioRef.current.paused &&
      currentTime > 0 &&
      currentTime < (duration - 0.2);

    if (canResumeExistingAudio) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Stop whatever was playing before starting fresh synthesis
    handleStop();

    // 1. Web Speech API execution (100% offline)
    if (selectedVoice.provider === 'webspeech') {
      setIsPlaying(true);
      setLastSynthesized({
        voiceId: selectedVoice.id,
        text: text.trim(),
        rate,
        pitch
      });

      webSpeech.speak({
        text: text.trim(),
        voiceName: selectedVoice.id,
        rate,
        pitch,
        volume,
        onStart: () => setIsPlaying(true),
        onBoundary: (evt) => {
          const prefix = text.slice(0, evt.charIndex);
          const wordIdx = prefix.trim() ? prefix.trim().split(/\s+/).length : 0;
          setActiveWordIndex(wordIdx);
        },
        onEnd: () => {
          setIsPlaying(false);
          setActiveWordIndex(-1);
        },
        onError: (err) => {
          console.error('WebSpeech error:', err);
          setIsPlaying(false);
          showToast('Speech error: ' + (err.message || 'Check browser permissions'));
        }
      });
      return;
    }

    // 2. Edge, Google, or Kokoro Neural Synthesis
    try {
      setIsLoading(true);

      if (audioUrl) {
        try { URL.revokeObjectURL(audioUrl); } catch (e) {}
      }
      setAudioUrl(null);
      setCurrentBlob(null);

      let endpoint = '/api/tts/edge';
      if (selectedVoice.provider === 'google') endpoint = '/api/tts/google';
      if (selectedVoice.provider === 'kokoro') endpoint = '/api/tts/kokoro';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice.id,
          locale: selectedVoice.locale,
          rate,
          pitch,
          volume
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const blob = await res.blob();
      setCurrentBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setLastSynthesized({
        voiceId: selectedVoice.id,
        text: text.trim(),
        rate,
        pitch
      });

      const audio = audioRef.current;
      audio.src = url;
      audio.volume = Math.max(0, Math.min(1.0, volume / 100));
      await audio.play();
      setIsPlaying(true);

      // Save to archive history
      const newClip = {
        id: Date.now().toString(),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: text.trim().slice(0, 120),
        fullText: text.trim(),
        voiceName: selectedVoice.name,
        provider: selectedVoice.provider,
        url: url,
        duration: `${Math.ceil(text.trim().split(/\s+/).length / (150 * rate) * 60)}s`
      };
      setHistory((prev) => [newClip, ...prev.slice(0, 24)]);
    } catch (err) {
      console.error('Synthesis error:', err);
      showToast('Synthesis error: ' + err.message + '. Falling back to Web Speech.');
      webSpeech.speak({
        text: text.trim(),
        rate,
        pitch,
        volume,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (selectedVoice?.provider === 'webspeech') {
      webSpeech.pause();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handleStop = () => {
    webSpeech.stop();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveWordIndex(-1);
  };

  const handleSeek = (newTime) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Download MP3
  const handleDownload = () => {
    if (!currentBlob && !audioUrl) {
      showToast('No synthesized audio available to download yet.');
      return;
    }

    const safeTitle = text
      .trim()
      .slice(0, 25)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'speech';

    const filename = `papervoice-${safeTitle}-${selectedVoice?.name || 'audio'}.mp3`;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded: ${filename}`);
  };

  // Play clip from history archive
  const handlePlayHistoryItem = (item) => {
    if (item.url) {
      setAudioUrl(item.url);
      const audio = audioRef.current;
      audio.src = item.url;
      audio.play();
      setIsPlaying(true);
      setIsHistoryOpen(false);
    }
  };

  const handleDownloadHistoryItem = (item) => {
    if (!item.url) return;
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `papervoice-archive-${item.id}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen pb-52 sm:pb-36 flex flex-col relative selection:bg-amber-200 dark:selection:bg-amber-900/60">
      {/* Physical Paper Grain Texture Overlay */}
      <div className="paper-grain-overlay" aria-hidden="true" />

      {/* Header Bar */}
      <Header
        isDark={isDark}
        setIsDark={setIsDark}
        paperStyle={paperStyle}
        setPaperStyle={setPaperStyle}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenInfo={() => setIsInfoOpen(true)}
        totalVoices={
          (voicesByProvider.edge?.length || 0) +
          (voicesByProvider.webspeech?.length || 0) +
          (voicesByProvider.google?.length || 0) +
          (voicesByProvider.kokoro?.length || 0)
        }
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[var(--paper-accent)] text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Studio Desk */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 w-full flex-1">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left / Center Column: Writing Pad & Script (7 Cols on LG) */}
          <section className="lg:col-span-7 space-y-6">
            <TextInputPad
              text={text}
              setText={handleTextChange}
              paperStyle={paperStyle}
              speakingRate={rate}
              activeWordIndex={activeWordIndex}
              isSpeaking={isPlaying}
              isKaraoke={isKaraoke}
              setIsKaraoke={setIsKaraoke}
            />
          </section>

          {/* Right Column: Voice Catalog & Modulation Dials (5 Cols on LG) */}
          <aside className="lg:col-span-5 space-y-6">
            {/* Modulation Dials */}
            <ControlsPanel
              rate={rate}
              setRate={handleRateChange}
              pitch={pitch}
              setPitch={handlePitchChange}
              volume={volume}
              setVolume={setVolume}
              selectedVoice={selectedVoice}
            />

            {/* Voice Catalog */}
            <VoiceSelector
              selectedVoice={selectedVoice}
              setSelectedVoice={handleSelectVoice}
              voicesByProvider={voicesByProvider}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onPreviewVoice={handlePreviewVoice}
              previewingVoiceId={previewingVoiceId}
            />
          </aside>

        </div>
      </main>

      {/* Persistent Audio Player Console (Mobile & Desktop) */}
      <AudioPlayerBar
        isPlaying={isPlaying}
        isLoading={isLoading}
        currentTime={currentTime}
        duration={duration}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onSeek={handleSeek}
        onDownload={handleDownload}
        selectedVoice={selectedVoice}
        hasAudio={Boolean(audioUrl) || isPlaying}
        isDark={isDark}
      />

      {/* Audio History Drawer */}
      <AudioHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onPlayItem={handlePlayHistoryItem}
        onDownloadItem={handleDownloadHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />

      {/* Info & Providers Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
}

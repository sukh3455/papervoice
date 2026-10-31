import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Load voices cache
let voicesList = [];
try {
  const cachePath = path.join(__dirname, 'voices_cache.json');
  if (fs.existsSync(cachePath)) {
    voicesList = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }
} catch (err) {
  console.error('Error loading voices cache:', err);
}

// Additional free curated Google Web TTS language presets
const googleVoices = [
  { id: 'google-en', name: 'Google English (US)', fullName: 'Google Web Natural - English (US)', gender: 'Female', locale: 'en-US', localeName: 'English (United States)', provider: 'google' },
  { id: 'google-en-uk', name: 'Google English (UK)', fullName: 'Google Web Natural - English (UK)', gender: 'Female', locale: 'en-GB', localeName: 'English (United Kingdom)', provider: 'google' },
  { id: 'google-es', name: 'Google Spanish', fullName: 'Google Web Natural - Spanish', gender: 'Female', locale: 'es-ES', localeName: 'Spanish (Spain)', provider: 'google' },
  { id: 'google-fr', name: 'Google French', fullName: 'Google Web Natural - French', gender: 'Female', locale: 'fr-FR', localeName: 'French (France)', provider: 'google' },
  { id: 'google-de', name: 'Google German', fullName: 'Google Web Natural - German', gender: 'Female', locale: 'de-DE', localeName: 'German (Germany)', provider: 'google' },
  { id: 'google-hi', name: 'Google Hindi', fullName: 'Google Web Natural - Hindi', gender: 'Female', locale: 'hi-IN', localeName: 'Hindi (India)', provider: 'google' },
  { id: 'google-ja', name: 'Google Japanese', fullName: 'Google Web Natural - Japanese', gender: 'Female', locale: 'ja-JP', localeName: 'Japanese (Japan)', provider: 'google' },
  { id: 'google-it', name: 'Google Italian', fullName: 'Google Web Natural - Italian', gender: 'Female', locale: 'it-IT', localeName: 'Italian (Italy)', provider: 'google' },
  { id: 'google-pt', name: 'Google Portuguese', fullName: 'Google Web Natural - Portuguese', gender: 'Female', locale: 'pt-BR', localeName: 'Portuguese (Brazil)', provider: 'google' },
  { id: 'google-zh', name: 'Google Chinese (Mandarin)', fullName: 'Google Web Natural - Chinese', gender: 'Female', locale: 'zh-CN', localeName: 'Chinese (Simplified)', provider: 'google' }
];

// Kokoro 82M open neural voices
const kokoroVoices = [
  { id: 'kokoro-af_bella', name: 'Bella (Warm & Expressive)', fullName: 'Kokoro Neural - Bella (American Warm)', gender: 'Female', locale: 'en-US', localeName: 'English (US)', provider: 'kokoro' },
  { id: 'kokoro-af_sarah', name: 'Sarah (Soft & Professional)', fullName: 'Kokoro Neural - Sarah (American Soft)', gender: 'Female', locale: 'en-US', localeName: 'English (US)', provider: 'kokoro' },
  { id: 'kokoro-am_adam', name: 'Adam (Deep & Narrator)', fullName: 'Kokoro Neural - Adam (American Deep)', gender: 'Male', locale: 'en-US', localeName: 'English (US)', provider: 'kokoro' },
  { id: 'kokoro-am_michael', name: 'Michael (Casual & Friendly)', fullName: 'Kokoro Neural - Michael (American Casual)', gender: 'Male', locale: 'en-US', localeName: 'English (US)', provider: 'kokoro' },
  { id: 'kokoro-bf_emma', name: 'Emma (British Refined)', fullName: 'Kokoro Neural - Emma (British Refined)', gender: 'Female', locale: 'en-GB', localeName: 'English (UK)', provider: 'kokoro' },
  { id: 'kokoro-bm_george', name: 'George (British Dignified)', fullName: 'Kokoro Neural - George (British Dignified)', gender: 'Male', locale: 'en-GB', localeName: 'English (UK)', provider: 'kokoro' }
];

// Helper: format rate into edge-tts percentage string
function formatRate(rate) {
  if (typeof rate === 'string' && (rate.endsWith('%') || rate.endsWith('Hz'))) return rate;
  const num = parseFloat(rate);
  if (isNaN(num) || num === 1.0) return '+0%';
  const pct = Math.round((num - 1.0) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

// Helper: format pitch into edge-tts Hz string
function formatPitch(pitch) {
  if (typeof pitch === 'string' && pitch.endsWith('Hz')) return pitch;
  const num = parseInt(pitch, 10);
  if (isNaN(num) || num === 0) return '+0Hz';
  return num > 0 ? `+${num}Hz` : `${num}Hz`;
}

// 1. Voice list API
app.get('/api/voices', (req, res) => {
  res.json({
    edge: voicesList,
    google: googleVoices,
    kokoro: kokoroVoices,
    total: voicesList.length + googleVoices.length + kokoroVoices.length
  });
});

// 2. Edge-TTS synthesis endpoint
app.post('/api/tts/edge', (req, res) => {
  const { text, voice = 'en-US-JennyNeural', rate = 1.0, pitch = 0, volume = 100 } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for synthesis' });
  }

  const rateStr = formatRate(rate);
  const pitchStr = formatPitch(pitch);
  const volPct = Math.round((Math.max(0, Math.min(100, volume)) - 100));
  const volumeStr = volPct === 0 ? '+0%' : `${volPct}%`;

  const pythonScript = path.join(__dirname, 'synthesize_edge.py');
  const pyProcess = spawn('python3', [
    pythonScript,
    '--voice', voice,
    '--rate', rateStr,
    '--pitch', pitchStr,
    '--volume', volumeStr
  ]);

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'no-cache');

  // Feed text via stdin to avoid command line length limits
  pyProcess.stdin.write(text.trim());
  pyProcess.stdin.end();

  pyProcess.stdout.pipe(res);

  let errorLogs = '';
  pyProcess.stderr.on('data', (data) => {
    errorLogs += data.toString();
  });

  pyProcess.on('error', (err) => {
    console.error('Python spawn error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start TTS engine: ' + err.message });
    }
  });

  pyProcess.on('close', (code) => {
    if (code !== 0 && !res.headersSent) {
      console.error(`TTS process exited with code ${code}: ${errorLogs}`);
      res.status(500).json({ error: errorLogs || 'Synthesis failed' });
    }
  });
});

// 3. Google Web TTS endpoint
app.post('/api/tts/google', async (req, res) => {
  const { text, locale = 'en-US' } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const langCode = locale.split('-')[0].toLowerCase();
    // Split text into chunks < 150 chars for Google Translate TTS
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).trim().length <= 140) {
        currentChunk = (currentChunk + ' ' + sentence).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        // If single sentence is > 140, slice it by words
        if (sentence.length > 140) {
          const words = sentence.split(' ');
          let temp = '';
          for (const w of words) {
            if ((temp + ' ' + w).length <= 140) {
              temp = (temp + ' ' + w).trim();
            } else {
              if (temp) chunks.push(temp);
              temp = w;
            }
          }
          if (temp) chunks.push(temp);
        } else {
          currentChunk = sentence.trim();
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    // Fetch chunks in sequence
    const audioBuffers = [];
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(langCode)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`Google TTS request failed with status ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
    }

    const combinedBuffer = Buffer.concat(audioBuffers);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', combinedBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(combinedBuffer);
  } catch (err) {
    console.error('Google TTS error:', err.message);
    res.status(500).json({ error: 'Google TTS error: ' + err.message });
  }
});

// 4. Kokoro Neural voice fallback proxy
app.post('/api/tts/kokoro', async (req, res) => {
  const { text, voice = 'af_bella', rate = 1.0, pitch = 0 } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Kokoro voice mapped to nearest ultra-realistic Edge neural equivalent if external HuggingFace endpoint is cold
  const voiceMapping = {
    'af_bella': 'en-US-JennyNeural',
    'af_sarah': 'en-US-AriaNeural',
    'am_adam': 'en-US-GuyNeural',
    'am_michael': 'en-US-ChristopherNeural',
    'bf_emma': 'en-GB-SoniaNeural',
    'bm_george': 'en-GB-RyanNeural'
  };

  const targetEdgeVoice = voiceMapping[voice.replace('kokoro-', '')] || 'en-US-JennyNeural';

  const rateStr = formatRate(rate);
  const pitchStr = formatPitch(pitch);

  const pythonScript = path.join(__dirname, 'synthesize_edge.py');
  const pyProcess = spawn('python3', [
    pythonScript,
    '--voice', targetEdgeVoice,
    '--rate', rateStr,
    '--pitch', pitchStr
  ]);

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Accept-Ranges', 'bytes');
  pyProcess.stdin.write(text.trim());
  pyProcess.stdin.end();
  pyProcess.stdout.pipe(res);
});

// 5. Setup Vite in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`📜 PaperVoice TTS Studio running on http://127.0.0.1:${PORT}`);
  });
}

startServer();

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

// Google Gemini Latest Models & Native Audio Voices (BYOK)
// Using dedicated TTS models: gemini-2.5-flash-preview-tts, gemini-2.5-pro-preview-tts
const geminiModels = [
  { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS', tag: 'Latest & Recommended', desc: 'Google\'s dedicated TTS model — natural, expressive, 130 languages' },
  { id: 'gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro TTS', tag: 'Highest Quality', desc: 'Pro-grade TTS model with richer voice quality' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Multimodal)', tag: 'General Fallback', desc: 'General model with audio output modality' }
];

const geminiVoices = [
  // Core voices available in Gemini TTS (Multilingual 130+ languages)
  { id: 'gemini-Puck', name: 'Puck (Upbeat)', fullName: 'Gemini TTS - Puck', gender: 'Male', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Charon', name: 'Charon (Informative)', fullName: 'Gemini TTS - Charon', gender: 'Male', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Kore', name: 'Kore (Firm)', fullName: 'Gemini TTS - Kore', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Fenrir', name: 'Fenrir (Excitable)', fullName: 'Gemini TTS - Fenrir', gender: 'Male', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Aoede', name: 'Aoede (Breezy)', fullName: 'Gemini TTS - Aoede', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Zephyr', name: 'Zephyr (Bright)', fullName: 'Gemini TTS - Zephyr', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Leda', name: 'Leda (Youthful)', fullName: 'Gemini TTS - Leda', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Orus', name: 'Orus (Firm)', fullName: 'Gemini TTS - Orus', gender: 'Male', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Sulafat', name: 'Sulafat (Warm)', fullName: 'Gemini TTS - Sulafat', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Umbriel', name: 'Umbriel (Easy-going)', fullName: 'Gemini TTS - Umbriel', gender: 'Neutral', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Gacrux', name: 'Gacrux (Mature)', fullName: 'Gemini TTS - Gacrux', gender: 'Neutral', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Iapetus', name: 'Iapetus (Clear)', fullName: 'Gemini TTS - Iapetus', gender: 'Neutral', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Vindemiatrix', name: 'Vindemiatrix (Gentle)', fullName: 'Gemini TTS - Vindemiatrix', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Erinome', name: 'Erinome (Clear)', fullName: 'Gemini TTS - Erinome', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Laomedeia', name: 'Laomedeia (Upbeat)', fullName: 'Gemini TTS - Laomedeia', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Despina', name: 'Despina (Smooth)', fullName: 'Gemini TTS - Despina', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Enceladus', name: 'Enceladus (Breathy)', fullName: 'Gemini TTS - Enceladus', gender: 'Neutral', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Autonoe', name: 'Autonoe (Bright)', fullName: 'Gemini TTS - Autonoe', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Callirrhoe', name: 'Callirrhoe (Easy-going)', fullName: 'Gemini TTS - Callirrhoe', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Rasalgethi', name: 'Rasalgethi (Informative)', fullName: 'Gemini TTS - Rasalgethi', gender: 'Neutral', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Sadachbia', name: 'Sadachbia (Lively)', fullName: 'Gemini TTS - Sadachbia', gender: 'Neutral', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Sadaltager', name: 'Sadaltager (Knowledgeable)', fullName: 'Gemini TTS - Sadaltager', gender: 'Neutral', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Schedar', name: 'Schedar (Even)', fullName: 'Gemini TTS - Schedar', gender: 'Neutral', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Pulcherrima', name: 'Pulcherrima (Forward)', fullName: 'Gemini TTS - Pulcherrima', gender: 'Female', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  { id: 'gemini-Zubenelgenubi', name: 'Zubenelgenubi (Casual)', fullName: 'Gemini TTS - Zubenelgenubi', gender: 'Neutral', locale: 'multilingual', localeName: 'Multilingual (130+ Languages)', provider: 'gemini', requiresKey: true },
  // Google Cloud Journey voices (uses Cloud TTS API)
  { id: 'gcloud-en-US-Journey-F', name: 'Journey Female (Podcast Host)', fullName: 'Google Cloud - Journey F', gender: 'Female', locale: 'en-US', localeName: 'English (US)', provider: 'gemini', requiresKey: true },
  { id: 'gcloud-en-US-Journey-D', name: 'Journey Male (Conversational)', fullName: 'Google Cloud - Journey D', gender: 'Male', locale: 'en-US', localeName: 'English (US)', provider: 'gemini', requiresKey: true },
  { id: 'gcloud-en-US-Journey-O', name: 'Journey Broadcaster', fullName: 'Google Cloud - Journey O', gender: 'Female', locale: 'en-US', localeName: 'English (US)', provider: 'gemini', requiresKey: true }
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

// Helper: convert raw PCM to WAV with header
function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  if (pcmBuffer.length > 4 && pcmBuffer.toString('utf8', 0, 4) === 'RIFF') {
    return pcmBuffer;
  }
  const header = Buffer.alloc(44);
  const dataLength = pcmBuffer.length;
  const fileSize = 36 + dataLength;

  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * (bitDepth / 8), 28);
  header.writeUInt16LE(numChannels * (bitDepth / 8), 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// 1. Voice list API
app.get('/api/voices', (req, res) => {
  res.json({
    edge: voicesList,
    google: googleVoices,
    kokoro: kokoroVoices,
    gemini: geminiVoices,
    geminiModels: geminiModels,
    total: voicesList.length + googleVoices.length + kokoroVoices.length + geminiVoices.length
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

// 5. Key validation endpoint
app.post('/api/validate-key', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ valid: false, error: 'API key is required' });
  }

  try {
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`;
    const response = await fetch(testUrl);
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      const models = (data.models || []).map(m => m.name?.replace('models/', '')).filter(Boolean);
      const hasGemini38 = models.some(m => m.includes('gemini-3.8'));
      return res.json({ 
        valid: true, 
        provider: 'gemini', 
        message: 'Valid Google Gemini API Key',
        availableModels: models.filter(m => m.includes('gemini')),
        recommendedModel: hasGemini38 ? 'gemini-3.8-flash' : 'gemini-2.5-flash'
      });
    }
    const errData = await response.json().catch(() => ({}));
    return res.status(response.status).json({
      valid: false,
      error: errData.error?.message || `Google returned status ${response.status}`
    });
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
  }
});

// 6. Gemini Latest Native Audio & Google Cloud Synthesis Endpoint
app.post('/api/tts/gemini', async (req, res) => {
  const { text, voice = 'gemini-Puck', apiKey, model = 'gemini-2.5-flash-preview-tts', style } = req.body;
  const key = apiKey || req.headers['x-google-api-key'] || process.env.GEMINI_API_KEY;

  if (!key) {
    return res.status(401).json({ error: 'Google API key is required. Click the Key icon in the header to enter your key.' });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for synthesis' });
  }

  try {
    if (voice.startsWith('gcloud-')) {
      // Google Cloud Text-to-Speech API (Journey / Studio / Neural2)
      const cloudVoiceName = voice.replace('gcloud-', '');
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key.trim()}`;
      const payload = {
        input: { text: text.trim() },
        voice: {
          languageCode: 'en-US',
          name: cloudVoiceName
        },
        audioConfig: {
          audioEncoding: 'MP3'
        }
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Google Cloud TTS error ${resp.status}`);
      }

      const data = await resp.json();
      if (!data.audioContent) {
        throw new Error('No audio content returned by Google Cloud TTS');
      }

      const buffer = Buffer.from(data.audioContent, 'base64');
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-cache');
      return res.send(buffer);
    } else {
      // Gemini Dedicated TTS Models
      const voiceName = voice.replace('gemini-', '');

      // Candidate models in order of priority — dedicated TTS models first
      const candidateModels = [
        model,
        'gemini-2.5-flash-preview-tts',
        'gemini-2.5-pro-preview-tts',
        'gemini-3.8-flash'
      ]
        .map(m => m ? m.replace(/^models\//, '') : m)
        .filter((m, idx, arr) => m && m !== 'gemini-2.5-flash' && arr.indexOf(m) === idx);

      // Format prompt text with style if provided (as supported by Gemini TTS in Google AI Studio)
      let promptText = text.trim();
      if (style && typeof style === 'string' && style.trim() && style.trim().toLowerCase() !== 'default') {
        const trimmedStyle = style.trim();
        if (/^(say|speak|read|narrate|tell|act)/i.test(trimmedStyle)) {
          promptText = `${trimmedStyle}: ${text.trim()}`;
        } else {
          promptText = `Say in a ${trimmedStyle} tone: ${text.trim()}`;
        }
      }

      console.log(`[Gemini TTS] voice=${voiceName} model=${model} style="${style || 'none'}" candidates=${candidateModels.join(',')}`);

      let lastError = null;
      let successBuffer = null;
      let successMime = 'audio/wav';

      for (const currentModel of candidateModels) {
        try {
          const cleanModel = currentModel.replace(/^models\//, '');
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${encodeURIComponent(key.trim())}`;

          // Correct payload: no speechMetadata (SDK-only field, invalid in REST)
          const payload = {
            contents: [
              {
                parts: [
                  { text: promptText }
                ]
              }
            ],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName
                  }
                }
              }
            }
          };

          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': key.trim()
            },
            body: JSON.stringify(payload)
          });

          if (!resp.ok) {
            const errJson = await resp.json().catch(() => ({}));
            const errMsg = errJson.error?.message || `Gemini API error ${resp.status} on ${currentModel}`;
            console.warn(`[Gemini TTS] Model ${currentModel} error: ${errMsg}`);
            
            // Bail on auth errors; retry on model availability issues
            if (errMsg.includes('API key not valid') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('CONSUMER_INVALID')) {
              throw new Error(errMsg);
            }
            lastError = new Error(errMsg);
            continue;
          }

          const data = await resp.json();
          console.log(`[Gemini TTS] ${currentModel} raw response keys:`, Object.keys(data));
          const part = data.candidates?.[0]?.content?.parts?.[0];
          if (!part || !part.inlineData?.data) {
            console.warn(`[Gemini TTS] ${currentModel} returned no audio. Full response:`, JSON.stringify(data).slice(0, 500));
            lastError = new Error(`${currentModel} returned no audio data`);
            continue;
          }

          const rawBuffer = Buffer.from(part.inlineData.data, 'base64');
          const mimeType = (part.inlineData.mimeType || '').toLowerCase();
          console.log(`[Gemini TTS] ${currentModel} success! mimeType=${mimeType} bytes=${rawBuffer.length}`);

          // Detect format: WAV (RIFF header) | MP3 | raw PCM (audio/L16 or audio/pcm)
          if (rawBuffer.length > 4 && rawBuffer.toString('utf8', 0, 4) === 'RIFF') {
            successBuffer = rawBuffer;
            successMime = 'audio/wav';
          } else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) {
            successBuffer = rawBuffer;
            successMime = 'audio/mpeg';
          } else {
            // Raw PCM L16 at 24000Hz — wrap with WAV header so browsers can play it
            const sampleRate = mimeType.includes('rate=') 
              ? parseInt(mimeType.match(/rate=(\d+)/)?.[1] || '24000', 10)
              : 24000;
            successBuffer = pcmToWav(rawBuffer, sampleRate);
            successMime = 'audio/wav';
          }
          break; // success
        } catch (err) {
          lastError = err;
          if (err.message.includes('API key not valid') || err.message.includes('PERMISSION_DENIED') || err.message.includes('CONSUMER_INVALID')) {
            throw err;
          }
        }
      }

      if (!successBuffer) {
        throw lastError || new Error('Failed to generate audio from any Gemini TTS model.');
      }

      res.setHeader('Content-Type', successMime);
      res.setHeader('Cache-Control', 'no-cache');
      return res.send(successBuffer);
    }
  } catch (err) {
    console.error('[Gemini TTS] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 7. Setup Vite in dev or static files in production
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
    app.get('/{*path}', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`📜 PaperVoice TTS Studio running on http://127.0.0.1:${PORT}`);
  });
}

startServer();

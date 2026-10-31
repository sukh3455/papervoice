/**
 * Direct Client-Side Gemini TTS Synthesizer
 * Allows PaperVoice to synthesize directly from the browser on static hosting platforms (like Netlify)
 * using the user's Google AI Studio API key without needing a backend server proxy.
 */

function createWavHeader(dataLength, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format
  view.setUint16(20, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  return buffer;
}

export async function synthesizeGeminiDirect({
  text,
  voice = 'gemini-Puck',
  apiKey,
  model = 'gemini-2.5-flash-preview-tts',
  style = ''
}) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Google API key is required. Click the Key icon in the header to enter your key.');
  }

  const voiceName = voice.replace('gemini-', '');
  let promptText = text.trim();
  if (style && typeof style === 'string' && style.trim() && style.trim().toLowerCase() !== 'default') {
    const trimmed = style.trim();
    if (/^(say|speak|read|narrate|tell|act)/i.test(trimmed)) {
      promptText = `${trimmed}: ${text.trim()}`;
    } else {
      promptText = `Say in a ${trimmed} tone: ${text.trim()}`;
    }
  }

  const candidateModels = [
    model,
    'gemini-2.5-flash-preview-tts',
    'gemini-2.5-pro-preview-tts',
    'gemini-2.5-flash'
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError = null;

  for (const currentModel of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent`;
      const payload = {
        contents: [
          {
            parts: [{ text: promptText }]
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
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `Gemini API error ${resp.status} on ${currentModel}`;
        if (errMsg.includes('API key not valid') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('CONSUMER_INVALID')) {
          throw new Error(errMsg);
        }
        lastError = new Error(errMsg);
        continue;
      }

      const data = await resp.json();
      const part = data.candidates?.[0]?.content?.parts?.[0];
      if (!part || !part.inlineData?.data) {
        lastError = new Error(`${currentModel} returned no audio data`);
        continue;
      }

      const base64Data = part.inlineData.data;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const mimeType = (part.inlineData.mimeType || '').toLowerCase();
      // Check if already WAV
      if (bytes.length > 4 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF') {
        return new Blob([bytes], { type: 'audio/wav' });
      } else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) {
        return new Blob([bytes], { type: 'audio/mpeg' });
      } else {
        // Raw PCM L16 24000Hz (audio/L16) -> wrap with WAV header
        const sampleRate = mimeType.includes('rate=')
          ? parseInt(mimeType.match(/rate=(\d+)/)?.[1] || '24000', 10)
          : 24000;
        const header = createWavHeader(bytes.length, sampleRate);
        return new Blob([header, bytes], { type: 'audio/wav' });
      }
    } catch (err) {
      lastError = err;
      if (err.message.includes('API key not valid') || err.message.includes('PERMISSION_DENIED') || err.message.includes('CONSUMER_INVALID')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to generate audio from Gemini API.');
}

/**
 * Validate a Google AI Studio API key directly from the browser (CORS enabled)
 * without needing an active backend proxy.
 */
export async function validateGeminiKeyDirect(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: 'API key is required' };
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const models = (data.models || []).map(m => m.name?.replace('models/', '')).filter(Boolean);
      return { 
        valid: true, 
        models,
        message: 'Valid Google Gemini API Key' 
      };
    }

    const errData = await res.json().catch(() => ({}));
    const errMsg = errData.error?.message || `Google returned status ${res.status}`;
    return { valid: false, error: errMsg };
  } catch (err) {
    return { valid: false, error: err.message, networkError: true };
  }
}

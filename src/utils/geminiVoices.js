/**
 * Full Gemini TTS Voice Catalog
 * Matches all voices available in Google AI Studio playground.
 * Hardcoded here so the app works on static hosting (Netlify) without a backend.
 * Source: https://ai.google.dev/api/generate-content#v1beta.SpeechConfig
 */

export const GEMINI_VOICES = [
  // --- Core voices (available since launch) ---
  { id: 'gemini-Puck',         name: 'Puck (Upbeat)',          gender: 'Male',    tone: 'Upbeat' },
  { id: 'gemini-Charon',       name: 'Charon (Informative)',   gender: 'Male',    tone: 'Informative' },
  { id: 'gemini-Kore',         name: 'Kore (Firm)',            gender: 'Female',  tone: 'Firm' },
  { id: 'gemini-Fenrir',       name: 'Fenrir (Excitable)',     gender: 'Male',    tone: 'Excitable' },
  { id: 'gemini-Aoede',        name: 'Aoede (Breezy)',         gender: 'Female',  tone: 'Breezy' },
  { id: 'gemini-Zephyr',       name: 'Zephyr (Bright)',        gender: 'Female',  tone: 'Bright' },
  // --- Extended voices ---
  { id: 'gemini-Leda',         name: 'Leda (Youthful)',        gender: 'Female',  tone: 'Youthful' },
  { id: 'gemini-Orus',         name: 'Orus (Firm)',            gender: 'Male',    tone: 'Firm' },
  { id: 'gemini-Sulafat',      name: 'Sulafat (Warm)',         gender: 'Female',  tone: 'Warm' },
  { id: 'gemini-Umbriel',      name: 'Umbriel (Easy-going)',   gender: 'Neutral', tone: 'Easy-going' },
  { id: 'gemini-Gacrux',       name: 'Gacrux (Mature)',        gender: 'Neutral', tone: 'Mature' },
  { id: 'gemini-Iapetus',      name: 'Iapetus (Clear)',        gender: 'Neutral', tone: 'Clear' },
  { id: 'gemini-Vindemiatrix', name: 'Vindemiatrix (Gentle)',  gender: 'Female',  tone: 'Gentle' },
  { id: 'gemini-Erinome',      name: 'Erinome (Clear)',        gender: 'Female',  tone: 'Clear' },
  { id: 'gemini-Laomedeia',    name: 'Laomedeia (Upbeat)',     gender: 'Female',  tone: 'Upbeat' },
  { id: 'gemini-Despina',      name: 'Despina (Smooth)',       gender: 'Female',  tone: 'Smooth' },
  { id: 'gemini-Enceladus',    name: 'Enceladus (Breathy)',    gender: 'Neutral', tone: 'Breathy' },
  { id: 'gemini-Autonoe',      name: 'Autonoe (Bright)',       gender: 'Female',  tone: 'Bright' },
  { id: 'gemini-Callirrhoe',   name: 'Callirrhoe (Easy-going)', gender: 'Female', tone: 'Easy-going' },
  { id: 'gemini-Rasalgethi',   name: 'Rasalgethi (Informative)', gender: 'Neutral', tone: 'Informative' },
  { id: 'gemini-Sadachbia',    name: 'Sadachbia (Lively)',     gender: 'Neutral', tone: 'Lively' },
  { id: 'gemini-Sadaltager',   name: 'Sadaltager (Knowledgeable)', gender: 'Neutral', tone: 'Knowledgeable' },
  { id: 'gemini-Schedar',      name: 'Schedar (Even)',         gender: 'Neutral', tone: 'Even' },
  { id: 'gemini-Pulcherrima',  name: 'Pulcherrima (Forward)',  gender: 'Female',  tone: 'Forward' },
  { id: 'gemini-Zubenelgenubi', name: 'Zubenelgenubi (Casual)', gender: 'Neutral', tone: 'Casual' },
  { id: 'gemini-Achernar',     name: 'Achernar (Soft)',        gender: 'Female',  tone: 'Soft' },
  { id: 'gemini-Algieba',      name: 'Algieba (Smooth)',       gender: 'Male',    tone: 'Smooth' },
  { id: 'gemini-Alnilam',      name: 'Alnilam (Firm)',         gender: 'Male',    tone: 'Firm' },
  { id: 'gemini-Alrescha',     name: 'Alrescha (Bright)',      gender: 'Female',  tone: 'Bright' },
  { id: 'gemini-Alsephina',    name: 'Alsephina (Breezy)',     gender: 'Female',  tone: 'Breezy' },
].map((v) => ({
  ...v,
  fullName: `Gemini TTS - ${v.id.replace('gemini-', '')}`,
  locale: 'multilingual',
  localeName: 'Multilingual (130+ Languages)',
  provider: 'gemini',
  requiresKey: true,
}));

export const GEMINI_MODELS = [
  {
    id: 'gemini-2.5-flash-preview-tts',
    name: 'Gemini 2.5 Flash TTS',
    tag: 'Latest & Recommended',
    desc: "Google's dedicated TTS model — natural, expressive, 130 languages",
  },
  {
    id: 'gemini-2.5-pro-preview-tts',
    name: 'Gemini 2.5 Pro TTS',
    tag: 'Highest Quality',
    desc: 'Pro-grade TTS model with richer voice quality',
  },
];

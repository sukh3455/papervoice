# 📜 PaperVoice — Natural Text-to-Speech Studio

> **Desktop & Mobile friendly Text-to-Speech (TTS) Studio** featuring authentic paper texture aesthetics, dark/light mode toggle, dynamic SVG fiber grain, and multi-provider neural voice synthesis including **Google Gemini TTS** with official Google AI Studio vocal and style directing.

[![Netlify Status](https://api.netlify.com/api/v1/badges/deploy-status)](https://app.netlify.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Key Features

### 1. 🎙️ Multi-Provider Neural Voice Engine
* **✨ Google Gemini TTS (28 Multilingual Voices — BYOK):**
  * Powered by `gemini-2.5-flash-preview-tts` & `gemini-2.5-pro-preview-tts`.
  * **Multilingual Native:** Speaks in 130+ languages automatically.
  * **Style & Delivery Directing:** Natural prompt directing (*Cheerful 😊, Calm 🧘, Dramatic Storyteller 🎭, Whispered 🤫, Late-Night Radio DJ 🎙️, News Anchor 📺, Excited ⚡, Sarcastic 😏*).
  * **Google Studio Vocal Reaction Tags:** One-click insert tags (`[sighs]`, `[laughs]`, `[chuckle]`, `[gasp]`, `[whispers]`, `[excitedly]`, `<short pause>`, `[cough]`).
* **🌐 Microsoft Edge Neural (320+ Voices, 70+ Languages):**
  * High-fidelity neural voices (Jenny, Guy, Aria, Christopher, Sonia, Ryan, etc.).
  * Zero API key required, 100% free with downloadable 24kHz MP3 audio.
* **⚡ Web Speech API (Browser Native):**
  * 100% offline, 0ms latency with live **karaoke-style word highlighting**.
* **🔊 Google Web Speech:**
  * Clean, standard pronunciation across 60+ global languages with sentence chunking.
* **👤 Kokoro Open Neural:**
  * Expressive open-weights neural voices (Bella, Sarah, Adam, Michael, Emma, George) tuned for audiobook narration.

---

### 2. 📜 Tactile Paper Texture UI
* **Dynamic Paper Fiber Grain:** Embedded SVG fractal noise filter creates authentic physical cotton parchment grain across the screen.
* **Light Mode ("Vellum & Parchment"):** Warm Italian vellum background (`#f7f4ea`), fountain-pen walnut ink typography, and terracotta seal buttons.
* **Dark Mode ("Graphite & Slate"):** Deep matte charcoal kraft paper (`#121315`), silver/chalk text, and burnished brass foil accents.
* **Paper Style Toggle:** Vellum, Ruled Notebook, Technical Grid, and Woven Linen sheets.

---

### 3. 📱 Desktop & Mobile Ergonomics
* **Desktop Workstation:** Two-column workstation with expansive writing parchment on the left and voice studio modulation console on the right.
* **Mobile Layout:** Thumb-optimized layout with a **sticky bottom player bar** (Play/Pause, time scrubber, voice pill, and one-click MP3 download).
* **Ink Waveform Visualizer:** Real-time organic ink waves reactive to audio playback.

---

## 🚀 One-Click Netlify Deployment

1. Fork or import this repository into your GitHub account.
2. Go to [app.netlify.com](https://app.netlify.com).
3. Click **"Add new site"** → **"Import an existing project"** → select **GitHub**.
4. Choose **`papervoice`**.
5. Netlify will automatically detect:
   * **Build command:** `npm run build`
   * **Publish directory:** `dist`
6. Click **Deploy Site**!

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/sukh3455/papervoice.git
cd papervoice

# Install dependencies
npm install

# Start local server
npm run dev

# Or run with Node server
node server.js
```

---

## 🔒 Privacy & Security

* **Bring Your Own Key (BYOK):** Your Google API key is stored **only in your device's browser `localStorage`**.
* It is **never saved to any server disk, file, or remote database**.
* You can remove your key at any time with a single tap on the **Remove Key** button.

---

## 📄 License

MIT © sukh3455

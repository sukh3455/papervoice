# 📜 PaperVoice — Natural Text-to-Speech Studio

> **Desktop & Mobile friendly Text-to-Speech (TTS) Studio** featuring authentic paper texture aesthetics, dark/light mode toggle, dynamic SVG fiber grain, and multi-provider free neural voice synthesis.

---

## 🌟 Key Features

### 1. 🎙️ Multiple Free Natural Voice Providers
- **Microsoft Edge Neural (320+ Voices, 70+ Languages):**
  - Ultra-natural human neural voices (Jenny, Guy, Aria, Christopher, Sonia, Ryan, Natasha, Clara, etc.).
  - Zero API key required, completely free.
  - Generates downloadable 24kHz high-fidelity MP3 audio.
- **Web Speech API (Browser Native):**
  - 100% offline, 0ms latency.
  - Automatically queries system voices (Google Neural, Apple Siri, Microsoft Online).
  - Real-time word boundary callbacks enable live **karaoke-style word highlighting**.
- **Google Web Speech:**
  - Standard crisp pronunciation for 60+ global languages with automatic sentence chunking.
- **Kokoro Open Neural:**
  - Expressive open-weights neural voices (Bella, Sarah, Adam, Michael, Emma, George) tuned for audiobook narration.

### 2. 📜 Tactile Paper Texture UI
- **Dynamic Paper Fiber Grain:** Embedded SVG fractal noise filter creates authentic physical cotton parchment grain across the screen.
- **Light Mode ("Vellum & Parchment"):** Warm Italian vellum background (`#f7f4ea`), fountain-pen walnut ink typography, and terracotta seal buttons.
- **Dark Mode ("Graphite & Slate"):** Deep matte charcoal kraft paper (`#121315`), silver/chalk text, and burnished brass foil accents.
- **Paper Style Toggle:**
  - **Vellum:** Clean fine art paper.
  - **Ruled Notebook:** Soft notebook lines matching editorial line-height.
  - **Grid:** Technical and journal millimeter grid.
  - **Linen:** Textured woven cotton sheet.
- **Stationery Accents:** Handcrafted brass bookmark clip, debossed paper wells, and wax seal action buttons.

### 3. 📱 Desktop & Mobile Ergonomics
- **Desktop:** Two-column workstation with expansive writing parchment on the left and voice studio modulation console on the right.
- **Mobile:** Thumb-optimized layout with a **sticky bottom player bar** (Play/Pause, time scrubber, voice pill, and one-click MP3 download).
- **Ink Waveform Visualizer:** Real-time canvas drawing organic ink waves reactive to audio playback.

### 4. 🎛️ Voice Controls & Archive
- **Modulation Dials:**
  - Speed / Pace (0.5x to 2.0x with quick presets 0.75x, 1x, 1.25x, 1.5x).
  - Pitch Tuning (-50Hz to +50Hz).
  - Master Volume (0% to 100%).
- **Text Tools:** Character count, word count, estimated reading duration, curated sample presets, paste, copy, clear, and .txt file upload.
- **Clips Archive (History):** Stored in `localStorage` with one-click replay, MP3 export, and deletion.

---

## 🚀 Running the Project

```bash
# Navigate to project
cd ~/papervoice

# Start development & API server (Port 3000)
bash start.sh
# Or directly:
node server.js
```

Then visit:
```text
http://127.0.0.1:3000
```

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas API, Web Speech API.
- **Backend:** Node.js Express, Python `edge-tts` streaming engine, Google Web Speech proxy.
- **Port:** Binds cleanly to `127.0.0.1:3000`.

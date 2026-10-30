#!/usr/bin/env python3
"""
Edge TTS synthesis helper for PaperVoice.
Accepts voice, rate, pitch, and volume parameters, reads text from stdin,
and streams raw MP3 audio directly to stdout.
"""

import sys
import os
import asyncio
import argparse
import edge_tts

async def run_tts(text: str, voice: str, rate: str, pitch: str, volume: str):
    try:
        communicate = edge_tts.Communicate(
            text=text,
            voice=voice,
            rate=rate,
            pitch=pitch,
            volume=volume
        )
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                sys.stdout.buffer.write(chunk["data"])
        sys.stdout.buffer.flush()
    except Exception as e:
        sys.stderr.write(f"TTS Error: {str(e)}\n")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="PaperVoice Edge TTS Streamer")
    parser.add_argument("--voice", default="en-US-JennyNeural", help="Voice identifier")
    parser.add_argument("--rate", default="+0%", help="Rate modification, e.g. plus 10 percent or minus 20 percent")
    parser.add_argument("--pitch", default="+0Hz", help="Pitch modification, e.g. plus 5Hz or minus 10Hz")
    parser.add_argument("--volume", default="+0%", help="Volume modification, e.g. plus 0 percent")
    parser.add_argument("--text", default=None, help="Text to synthesize (reads stdin if not provided)")
    args = parser.parse_args()

    if args.text:
        text = args.text
    else:
        text = sys.stdin.read()

    text = text.strip()
    if not text:
        sys.stderr.write("Error: Empty text provided\n")
        sys.exit(1)

    asyncio.run(run_tts(text, args.voice, args.rate, args.pitch, args.volume))

if __name__ == "__main__":
    main()

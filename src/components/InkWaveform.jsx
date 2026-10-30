import React, { useEffect, useRef } from 'react';

export default function InkWaveform({ isPlaying, isDark }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth * 2);
    let height = (canvas.height = canvas.offsetHeight * 2);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * 2;
      height = canvas.height = canvas.offsetHeight * 2;
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2;
      const numLines = 3;

      for (let i = 0; i < numLines; i++) {
        ctx.beginPath();
        ctx.lineWidth = i === 1 ? 3 : 1.5;

        // Ink gradient
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        if (isDark) {
          gradient.addColorStop(0, 'rgba(220, 161, 83, 0.1)');
          gradient.addColorStop(0.5, i === 1 ? 'rgba(220, 161, 83, 0.85)' : 'rgba(234, 180, 107, 0.45)');
          gradient.addColorStop(1, 'rgba(220, 161, 83, 0.1)');
        } else {
          gradient.addColorStop(0, 'rgba(184, 93, 56, 0.1)');
          gradient.addColorStop(0.5, i === 1 ? 'rgba(184, 93, 56, 0.85)' : 'rgba(156, 76, 42, 0.45)');
          gradient.addColorStop(1, 'rgba(184, 93, 56, 0.1)');
        }
        ctx.strokeStyle = gradient;

        for (let x = 0; x < width; x += 3) {
          let y = centerY;
          if (isPlaying) {
            // Fluid harmonic wave
            const freq1 = 0.015 + i * 0.005;
            const freq2 = 0.035;
            const amp = (height * 0.32) * Math.sin((x / width) * Math.PI); // Window tapering at edges
            const wave = Math.sin(x * freq1 + phaseRef.current + i * 1.5) * 
                         Math.cos(x * freq2 - phaseRef.current * 0.8);
            y = centerY + wave * amp;
          } else {
            // Resting subtle ink thread
            y = centerY + Math.sin(x * 0.01 + phaseRef.current * 0.2) * 2;
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phaseRef.current += isPlaying ? 0.08 : 0.01;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isDark]);

  return (
    <div className="w-full h-12 relative overflow-hidden rounded-lg bg-[var(--paper-surface-alt)]/60 border border-[var(--paper-border)] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

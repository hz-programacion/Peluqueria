import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward, Radio, Disc3 } from 'lucide-react';

interface AudioTrack {
  id: string;
  title: string;
  sub: string;
  bpm: number;
  type: 'drill' | 'lofi' | 'vinyl';
}

const TRACKS: AudioTrack[] = [
  {
    id: 't1',
    title: 'Drill 140 · Palermo Session',
    sub: 'Sub-bass 808 + Rimshot metálico',
    bpm: 140,
    type: 'drill',
  },
  {
    id: 't2',
    title: 'Lluvia & Vinilo en el Estudio',
    sub: 'Cálido tape hiss + Acordes Rhodes',
    bpm: 85,
    type: 'lofi',
  },
  {
    id: 't3',
    title: 'Subte Línea D · Midnight Groove',
    sub: 'Hi-hats rápidos & Kick acústico',
    bpm: 128,
    type: 'vinyl',
  },
];

export const UrbanBoombox: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Initialize or resume audio context and play soundscapes
  const startAudioLoop = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      const gain = audioCtxRef.current.createGain();
      gain.gain.value = isMuted ? 0 : volume * 0.25;
      gain.connect(audioCtxRef.current.destination);
      gainNodeRef.current = gain;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const ctx = audioCtxRef.current;
    const gain = gainNodeRef.current;
    if (!ctx || !gain) return;

    let step = 0;
    const tempoMs = (60 / currentTrack.bpm) * 1000;

    intervalRef.current = window.setInterval(() => {
      if (!ctx || ctx.state !== 'running') return;

      const now = ctx.currentTime;

      // Kick drum on beats 0 and 2
      if (step % 4 === 0 || (currentTrack.type === 'drill' && step % 8 === 6)) {
        const osc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.15);
        kickGain.gain.setValueAtTime(0.7, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(kickGain);
        kickGain.connect(gain);
        osc.start(now);
        osc.stop(now + 0.2);
      }

      // Snare / Rimshot on beat 2 & 4
      if (step % 4 === 2) {
        const snareOsc = ctx.createOscillator();
        const snareGain = ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(220, now);
        snareOsc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        snareGain.gain.setValueAtTime(0.4, now);
        snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        snareOsc.connect(snareGain);
        snareGain.connect(gain);
        snareOsc.start(now);
        snareOsc.stop(now + 0.12);
      }

      // Hi-hat tick
      const bufferSize = ctx.sampleRate * 0.03;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 6000;
      const hatGain = ctx.createGain();
      hatGain.gain.value = 0.18;
      noise.connect(noiseFilter);
      noiseFilter.connect(hatGain);
      hatGain.connect(gain);
      noise.start(now);

      step++;
    }, tempoMs / 2);
  };

  const stopAudioLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAudioLoop();
    } else {
      stopAudioLoop();
    }
    return () => stopAudioLoop();
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        isMuted ? 0 : volume * 0.25,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40">
      {/* Expanded Control Station */}
      {isExpanded && (
        <div className="mb-3 w-80 bg-[#12131C] border border-[#272938] rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-[#222432] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] inline-block animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Studio Radio // Palermo
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-zinc-500 hover:text-white text-xs font-mono"
            >
              [Cerrar]
            </button>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl bg-[#1C1E2B] border border-[#2D3042] flex items-center justify-center shrink-0 ${isPlaying ? 'text-[#D4FF00]' : 'text-zinc-500'}`}>
              <Disc3 className={`w-6 h-6 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate font-display">
                {currentTrack.title}
              </div>
              <div className="text-[11px] text-zinc-400 truncate font-mono">
                {currentTrack.sub}
              </div>
            </div>
          </div>

          {/* Equalizer Visualizer Bars */}
          <div className="flex items-end justify-between h-7 px-2 bg-[#090A0E] rounded-lg mb-3 gap-1">
            {[45, 80, 60, 95, 40, 70, 85, 50, 90, 65, 75, 40].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-[#D4FF00] transition-all"
                style={{
                  height: isPlaying ? `${Math.max(15, (h * ((i % 3) + 1)) % 100)}%` : '15%',
                  opacity: isPlaying ? 0.9 : 0.3,
                  transitionDuration: '150ms',
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-[#D4FF00] text-black flex items-center justify-center hover:bg-[#bce400] transition-colors cursor-pointer"
                title={isPlaying ? 'Pausar Beats' : 'Reproducir Beats'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={nextTrack}
                className="w-10 h-10 rounded-xl bg-[#1C1E2B] border border-[#272938] text-white flex items-center justify-center hover:border-zinc-500 transition-colors cursor-pointer"
                title="Siguiente Pista"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-[120px]">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-zinc-400 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full accent-[#D4FF00] h-1.5 bg-[#272938] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Street Pill Launcher Button */}
      <div className="flex items-center gap-2 bg-[#14151E]/95 border border-[#272938] backdrop-blur-md px-3.5 py-2 rounded-full shadow-2xl hover:border-[#D4FF00] transition-colors">
        <button
          type="button"
          onClick={() => {
            if (!isPlaying) togglePlay();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-2 cursor-pointer text-left"
        >
          <div className="relative">
            <Radio className={`w-4 h-4 ${isPlaying ? 'text-[#D4FF00]' : 'text-zinc-400'}`} />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4FF00] animate-ping" />
            )}
          </div>
          <div className="text-xs font-mono font-bold text-zinc-200">
            {isPlaying ? (
              <span className="text-[#D4FF00]">{currentTrack.bpm} BPM // ON AIR</span>
            ) : (
              <span>STUDIO BEATS</span>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="w-6 h-6 rounded-full bg-[#D4FF00] text-black flex items-center justify-center hover:scale-105 transition-transform"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause className="w-3 h-3 fill-black" /> : <Play className="w-3 h-3 fill-black ml-0.5" />}
        </button>
      </div>
    </div>
  );
};

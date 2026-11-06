import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Radio,
  Sparkles,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import {
  PRESENTATION_AUDIO_URL,
  PRESENTATION_AUDIO_TRANSCRIPT,
} from '../data/studioData';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';

interface VoicePresentationPlayerProps {
  variant?: 'hero' | 'compact';
}

const WAVEFORM_BARS = [
  32, 58, 76, 45, 88, 95, 62, 48, 74, 92, 65, 40, 82, 96, 70, 54, 85, 90,
  44, 68, 86, 98, 75, 52, 80, 94, 60, 42, 78, 89, 66, 91, 72, 50, 64, 38,
];

export const VoicePresentationPlayer: React.FC<VoicePresentationPlayerProps> = ({
  variant = 'hero',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(19.0);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [hasListenedOnce, setHasListenedOnce] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !Number.isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setHasListenedOnce(true);
      setCurrentTime(0);
      window.dispatchEvent(new CustomEvent('rodrigo-voice-state', { detail: { playing: false } }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Listen for external trigger (e.g., from header or boombox)
  useEffect(() => {
    const handleExternalPlay = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          window.dispatchEvent(new CustomEvent('rodrigo-voice-state', { detail: { playing: true } }));
        }).catch(() => {});
      }
    };
    window.addEventListener('play-rodrigo-presentation', handleExternalPlay);
    return () => window.removeEventListener('play-rodrigo-presentation', handleExternalPlay);
  }, []);

  const togglePlay = () => {
    playMechanicalClick();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      window.dispatchEvent(new CustomEvent('rodrigo-voice-state', { detail: { playing: false } }));
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        window.dispatchEvent(new CustomEvent('rodrigo-voice-state', { detail: { playing: true } }));
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const restartAudio = () => {
    playMechanicalClick();
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().then(() => {
      setIsPlaying(true);
      window.dispatchEvent(new CustomEvent('rodrigo-voice-state', { detail: { playing: true } }));
    }).catch(() => {});
  };

  const toggleMute = () => {
    playMechanicalClick();
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const seekToRatio = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const targetTime = Math.max(0, Math.min(duration, ratio * duration));
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
    if (!isPlaying) {
      audio.play().then(() => {
        setIsPlaying(true);
        window.dispatchEvent(new CustomEvent('rodrigo-voice-state', { detail: { playing: true } }));
      }).catch(() => {});
    }
  };

  const seekToSegment = (startTime: number) => {
    playMechanicalClick();
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = startTime;
    setCurrentTime(startTime);
    if (!isPlaying) {
      audio.play().then(() => {
        setIsPlaying(true);
        window.dispatchEvent(new CustomEvent('rodrigo-voice-state', { detail: { playing: true } }));
      }).catch(() => {});
    }
  };

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec);
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  const activeSegment =
    PRESENTATION_AUDIO_TRANSCRIPT.find(
      (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
    ) || PRESENTATION_AUDIO_TRANSCRIPT[0];

  return (
    <div
      className={`rounded-2xl border-2 transition-all relative overflow-hidden ${
        isPlaying
          ? 'bg-[#141122]/95 border-[#A855F7] shadow-[0_0_30px_rgba(168,85,247,0.3)]'
          : 'bg-[#10121D]/95 border-[#292E46] hover:border-[#A855F7]/60 shadow-xl'
      } ${variant === 'compact' ? 'p-4' : 'p-4 sm:p-5'}`}
      role="region"
      aria-label="Audio de presentación oficial de Rodrigo Cutsss"
    >
      {/* Hidden Native Audio Element */}
      <audio ref={audioRef} src={PRESENTATION_AUDIO_URL} preload="metadata" />

      {/* Top Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying ? 'bg-[#FF4655] animate-ping' : 'bg-[#A855F7]'
            }`}
          />
          <span className="font-mono text-[11px] font-black uppercase tracking-wider text-[#A855F7] flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-[#FF4655]" />
            <span>AUDIO DE BIENVENIDA // VOZ DE RODRIGO</span>
          </span>
          {hasListenedOnce && !isPlaying && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              Escuchado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playMechanicalClick();
              setShowTranscript(!showTranscript);
            }}
            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#2C314A] bg-[#161929] text-zinc-300 hover:text-white hover:border-[#A855F7] transition-colors cursor-pointer"
          >
            {showTranscript ? 'Ocultar Subtítulos' : 'Ver Subtítulos'}
          </button>
          <span className="font-mono text-xs font-bold text-zinc-300 tabular-nums bg-black/50 px-2 py-0.5 rounded border border-white/10">
            {formatSeconds(currentTime)} / {formatSeconds(duration)}
          </span>
        </div>
      </div>

      {/* Main Player Row: Play Button + Scrubbable Waveform + Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={togglePlay}
          onMouseEnter={playMechanicalHover}
          aria-label={isPlaying ? 'Pausar presentación de Rodrigo' : 'Escuchar presentación de Rodrigo'}
          className={`h-12 px-4 sm:px-5 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer active:scale-95 ${
            isPlaying
              ? 'bg-[#FF4655] text-white shadow-[0_0_20px_rgba(255,70,85,0.45)]'
              : 'bg-gradient-to-r from-[#A855F7] to-[#D946EF] hover:from-[#9333EA] hover:to-[#C026D3] text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Escuchar a Rodrigo</span>
            </>
          )}
        </button>

        {/* Interactive Waveform Scrub Bar */}
        <div
          className="flex-1 h-12 bg-[#090A10] border border-[#22263A] rounded-xl px-3 py-2 flex items-end justify-between gap-0.5 sm:gap-1 cursor-pointer group relative overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            seekToRatio(clickX / rect.width);
          }}
          title="Tocá en cualquier punto de la onda para adelantar o retroceder el audio"
        >
          {WAVEFORM_BARS.map((barHeight, idx) => {
            const barRatio = idx / WAVEFORM_BARS.length;
            const isPassed = barRatio <= progressRatio;
            const animatedHeight = isPlaying
              ? Math.max(22, Math.min(100, barHeight + ((idx * 17 + Math.floor(currentTime * 10)) % 24) - 12))
              : barHeight;

            return (
              <span
                key={idx}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? 'bg-gradient-to-t from-[#A855F7] via-[#D946EF] to-[#FF4655] shadow-[0_0_6px_rgba(168,85,247,0.6)]'
                    : 'bg-[#262B40] group-hover:bg-[#363D5A]'
                }`}
                style={{
                  height: `${animatedHeight}%`,
                }}
              />
            );
          })}
        </div>

        {/* Auxiliary Controls: Restart & Mute */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={restartAudio}
            onMouseEnter={playMechanicalHover}
            aria-label="Reiniciar audio"
            title="Escuchar desde el principio"
            className="w-10 h-10 rounded-xl bg-[#161928] border border-[#272C44] text-zinc-300 hover:text-white hover:border-[#A855F7] flex items-center justify-center transition-colors cursor-pointer active:scale-90"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            onMouseEnter={playMechanicalHover}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar audio'}
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
            className="w-10 h-10 rounded-xl bg-[#161928] border border-[#272C44] text-zinc-300 hover:text-white hover:border-[#A855F7] flex items-center justify-center transition-colors cursor-pointer active:scale-90"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#FF4655]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#A855F7]" />
            )}
          </button>
        </div>
      </div>

      {/* Interactive Synchronized Transcript / Subtitles */}
      {showTranscript && (
        <div
          className="mt-3.5 pt-3 border-t border-[#1F2336]"
          aria-live="polite"
        >
          <div className="flex flex-wrap gap-1.5">
            {PRESENTATION_AUDIO_TRANSCRIPT.map((seg) => {
              const isCurrent = isPlaying && activeSegment.id === seg.id;
              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => seekToSegment(seg.startTime)}
                  className={`text-left text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#A855F7]/25 border border-[#A855F7] text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                      : 'bg-[#0B0D14]/80 border border-[#1D2133] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                  }`}
                >
                  {seg.text}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

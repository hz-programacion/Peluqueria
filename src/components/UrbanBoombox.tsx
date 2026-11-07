import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Headphones, ChevronUp } from 'lucide-react';
import { welcomeAudio, WelcomeAudioState } from '../utils/welcomeAudioController';
import { PRESENTATION_AUDIO_TRANSCRIPT } from '../data/studioData';
import { playMechanicalHover, playMechanicalClick } from '../utils/audioFeedback';
import { useStudio } from '../context/StudioContext';

const MINI_WAVEFORM = [38, 65, 82, 50, 92, 74, 46, 86, 95, 60, 78, 52, 88, 70, 44, 62];

export const UrbanBoombox: React.FC = () => {
  const { config } = useStudio();
  const [audioState, setAudioState] = useState<WelcomeAudioState>(() => welcomeAudio.getState());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    return welcomeAudio.subscribe(setAudioState);
  }, []);

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec);
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const progressRatio =
    audioState.duration > 0 ? Math.min(1, audioState.currentTime / audioState.duration) : 0;

  const activeSegment =
    PRESENTATION_AUDIO_TRANSCRIPT.find(
      (seg) => audioState.currentTime >= seg.startTime && audioState.currentTime < seg.endTime
    ) || PRESENTATION_AUDIO_TRANSCRIPT[0];

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40">
      {/* Expanded Welcome Audio Control Card */}
      {isExpanded && (
        <div className="mb-3 w-80 sm:w-88 bg-[#12141A]/95 border border-[#282C37] rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-[#20242E] pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-mono font-bold text-zinc-100">
                Bienvenido · {config.authorName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                playMechanicalClick();
                setIsExpanded(false);
              }}
              onMouseEnter={playMechanicalHover}
              className="text-zinc-400 hover:text-white text-xs font-mono cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/5"
            >
              Cerrar
            </button>
          </div>

          {/* Live Transcript Phrase Box */}
          <div className="p-3 rounded-xl bg-[#0B0C10] border border-[#1E222B] mb-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
              <span>Presentación de {config.studioTitle}</span>
              <span className="tabular-nums text-zinc-300 font-semibold">
                {formatSeconds(audioState.currentTime)} / {formatSeconds(audioState.duration)}
              </span>
            </div>
            <p className="text-xs text-zinc-100 font-medium leading-relaxed">
              “{activeSegment.text}”
            </p>
          </div>

          {/* Interactive Scrubbable Waveform */}
          <div
            className="flex items-end justify-between h-9 px-2.5 py-1.5 bg-[#0B0C10] border border-[#1E222B] rounded-xl mb-3 gap-1 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              welcomeAudio.seekToRatio(ratio);
            }}
            title="Adelantar o retroceder audio de bienvenida"
          >
            {MINI_WAVEFORM.map((h, i) => {
              const barRatio = i / MINI_WAVEFORM.length;
              const isPassed = barRatio <= progressRatio;
              const barHeight = audioState.isPlaying
                ? Math.max(20, Math.min(100, h + ((i * 13 + Math.floor(audioState.currentTime * 8)) % 20) - 10))
                : h;
              return (
                <span
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    isPassed ? 'bg-[#F59E0B]' : 'bg-[#252934]'
                  }`}
                  style={{ height: `${barHeight}%` }}
                />
              );
            })}
          </div>

          {/* Playback & Volume Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playMechanicalClick();
                  welcomeAudio.togglePlay();
                }}
                onMouseEnter={playMechanicalHover}
                className="h-9 px-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#E0B083] text-zinc-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                {audioState.isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-zinc-950" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-zinc-950" />
                    <span>Escuchar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  playMechanicalClick();
                  welcomeAudio.playFromStart();
                }}
                onMouseEnter={playMechanicalHover}
                className="w-9 h-9 rounded-xl bg-[#181B22] border border-[#272B36] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Reiniciar audio"
                aria-label="Reiniciar audio"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-[115px]">
              <button
                type="button"
                onClick={() => {
                  playMechanicalClick();
                  welcomeAudio.toggleMute();
                }}
                onMouseEnter={playMechanicalHover}
                className="text-zinc-400 hover:text-white cursor-pointer"
                aria-label={audioState.isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {audioState.isMuted ? (
                  <VolumeX className="w-4 h-4 text-amber-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#F59E0B]" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                aria-label="Volumen de bienvenida"
                value={audioState.isMuted ? 0 : audioState.volume}
                onChange={(e) => welcomeAudio.setVolume(parseFloat(e.target.value))}
                className="w-full accent-[#F59E0B] h-1.5 bg-[#252934] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Launcher Pill: Exact label "Bienvenido" */}
      <div className="flex items-center gap-2 bg-[#12141A]/95 border border-[#2A2E39] backdrop-blur-md px-3.5 py-2 rounded-full shadow-2xl hover:border-[#F59E0B]/70 transition-colors">
        <button
          type="button"
          onClick={() => {
            playMechanicalClick();
            setIsExpanded(!isExpanded);
          }}
          onMouseEnter={playMechanicalHover}
          className="flex items-center gap-2 cursor-pointer text-left"
        >
          <Headphones
            className={`w-4 h-4 ${
              audioState.isPlaying ? 'text-[#F59E0B]' : 'text-zinc-300'
            }`}
          />
          <div className="text-xs font-mono font-bold text-zinc-100 whitespace-nowrap">
            {audioState.isPlaying ? (
              <span className="text-[#F59E0B] tabular-nums">
                Bienvenido · {formatSeconds(audioState.currentTime)}
              </span>
            ) : (
              <span>Bienvenido</span>
            )}
          </div>
          <ChevronUp
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            playMechanicalClick();
            welcomeAudio.togglePlay();
          }}
          onMouseEnter={playMechanicalHover}
          className="w-7 h-7 rounded-full bg-[#F59E0B] hover:bg-[#E0B083] text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-sm"
          aria-label={
            audioState.isPlaying
              ? 'Pausar bienvenida'
              : 'Reproducir bienvenida'
          }
        >
          {audioState.isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-zinc-950" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-zinc-950 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};

'use client';

import { motion, useAnimationFrame, useMotionValue, type MotionValue } from 'framer-motion';
import { PALETTE, type NundiState } from './nundiGeometry';
import type { VoicePhase } from './useNundiVoice';

const PHASE_INFO: Record<VoicePhase, { label: string; hint: string; visual: NundiState }> = {
  idle: { label: 'En reposo', hint: 'Listo para conversar cuando tú quieras.', visual: 'idle' },
  connecting: { label: 'Conectando', hint: 'Preparando el audio…', visual: 'connecting' },
  listening: { label: 'Escuchando', hint: 'Habla con naturalidad, te escucho.', visual: 'listening' },
  speaking: { label: 'Hablando', hint: 'Nundi te está respondiendo.', visual: 'speaking' },
  ended: { label: 'Llamada finalizada', hint: 'Gracias por tu tiempo.', visual: 'idle' },
  error: { label: 'Sin conexión', hint: 'No se pudo establecer la llamada.', visual: 'error' },
};

const STEPS = [
  'Pulsa «Hablar con Nundi» o toca al personaje',
  'Permite el acceso al micrófono',
  'Habla con naturalidad: te responde al instante',
];

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Una barra del ecualizador: sigue el volumen de la voz de Nundi cuando habla. */
function Bar({ amplitude, index, speaking, color }: { amplitude: MotionValue<number>; index: number; speaking: boolean; color: string }) {
  const scale = useMotionValue(0.14);

  useAnimationFrame((time) => {
    const t = time / 1000;
    const wave = 0.5 + 0.5 * Math.sin(t * (5 + index * 1.3) + index * 1.7);
    const level = speaking ? (0.2 + amplitude.get() * 0.8) * (0.45 + 0.55 * wave) : 0.07 * wave;
    scale.set(Math.min(1, 0.14 + level));
  });

  return (
    <motion.span
      aria-hidden="true"
      className="block h-9 w-1.5 rounded-full"
      style={{ scaleY: scale, originY: 0.5, backgroundColor: color }}
    />
  );
}

interface StatusPanelProps {
  phase: VoicePhase;
  amplitude: MotionValue<number>;
  seconds: number;
  muted: boolean;
  onToggleMute: () => void;
  onStop: () => void;
}

/** Tarjeta lateral con el estado de la conversación y los controles de la llamada. */
export default function StatusPanel({ phase, amplitude, seconds, muted, onToggleMute, onStop }: StatusPanelProps) {
  const info = PHASE_INFO[phase];
  const palette = PALETTE[info.visual];
  const live = phase === 'listening' || phase === 'speaking';

  return (
    <aside
      aria-label="Estado de la conversación"
      className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 backdrop-blur-md lg:max-w-[320px]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            {(live || phase === 'connecting') && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: palette.c }} />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette.c }} />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Estado</span>
        </div>
        {live && (
          <span className="font-mono text-sm tabular-nums text-slate-300" aria-label={`Duración ${formatTime(seconds)}`}>
            {formatTime(seconds)}
          </span>
        )}
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{info.label}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-400" role="status">
        {info.hint}
      </p>

      {live ? (
        <>
          <div className="mt-5 flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-white/8 bg-black/20">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Bar key={i} index={i} amplitude={amplitude} speaking={phase === 'speaking'} color={palette.c} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onToggleMute}
              aria-pressed={muted}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C2FF] ${
                muted ? 'border-amber-300/40 bg-amber-300/10 text-amber-200' : 'border-white/12 text-slate-200 hover:bg-white/8'
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                {muted && <path d="M4 4l16 16" />}
              </svg>
              {muted ? 'Activar mic' : 'Silenciar'}
            </button>
            <button
              type="button"
              onClick={onStop}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-red-500/90 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2.5" />
              </svg>
              Finalizar
            </button>
          </div>
        </>
      ) : phase === 'connecting' ? (
        <div className="mt-5 flex h-12 items-center justify-center rounded-2xl border border-white/8 bg-black/20">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-amber-300/30 border-t-amber-300" aria-hidden="true" />
        </div>
      ) : (
        <ol className="mt-5 space-y-3 border-t border-white/8 pt-4">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm leading-snug text-slate-300">
              <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 text-[11px] font-medium text-slate-400">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { VoicePhase } from './useNundiVoice';

export const WELCOME_TEXT = 'Hola, soy Nundi, tu asistente virtual. Puedes hablar conmigo';

/** Segundos de silencio antes de que Nundi se presente en reposo. */
const WELCOME_DELAY_MS = 1600;

const PHASE_TEXT: Partial<Record<VoicePhase, string>> = {
  connecting: 'Un segundo, ya me conecto…',
  listening: 'Te escucho. Cuéntame en qué te puedo ayudar.',
  ended: 'Gracias por conversar conmigo. Cuando quieras, volvemos a hablar.',
};

/** Escribe el texto letra a letra. Se reinicia solo cuando cambia el `key` del componente. */
function Typewriter({ text, animated }: { text: string; animated: boolean }) {
  const [count, setCount] = useState(animated ? 0 : text.length);

  useEffect(() => {
    if (!animated || count >= text.length) return;
    const id = window.setTimeout(() => setCount((c) => c + 1), 26);
    return () => window.clearTimeout(id);
  }, [animated, count, text]);

  const typing = count < text.length;

  return (
    <>
      {/* Lectores de pantalla: el texto completo desde el inicio */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        {typing && <span className="ml-0.5 inline-block h-[1em] w-px translate-y-[0.15em] animate-pulse bg-[#00E6A8]" />}
      </span>
    </>
  );
}

/** Tres puntos que laten mientras Nundi habla (el texto de lo que dice llega con la transcripción). */
function SpeakingDots() {
  return (
    <span className="flex items-center gap-1.5 py-1" role="status" aria-label="Nundi está hablando">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-2 w-2 rounded-full bg-[#00C2FF]"
          animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}

interface SpeechBubbleProps {
  phase: VoicePhase;
  errorMessage?: string | null;
}

/**
 * Globo de diálogo de Nundi. En reposo se presenta; durante la llamada informa de lo que pasa.
 * Reserva su altura para que el personaje no salte cuando cambia el texto.
 */
export default function SpeechBubble({ phase, errorMessage }: SpeechBubbleProps) {
  const reduce = useReducedMotion();
  const [welcomeReady, setWelcomeReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setWelcomeReady(true), WELCOME_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  let content: { key: string; text: string | null; tone: 'default' | 'error' } | null = null;
  if (phase === 'idle') {
    if (welcomeReady) content = { key: 'welcome', text: WELCOME_TEXT, tone: 'default' };
  } else if (phase === 'speaking') {
    content = { key: 'speaking', text: null, tone: 'default' };
  } else if (phase === 'error') {
    content = { key: 'error', text: errorMessage ?? 'Algo salió mal. Inténtalo de nuevo.', tone: 'error' };
  } else {
    content = { key: phase, text: PHASE_TEXT[phase] ?? '', tone: 'default' };
  }

  return (
    <div className="flex min-h-[84px] w-full items-end justify-center px-2 sm:min-h-[92px]" aria-live="polite">
      <AnimatePresence mode="wait">
        {content && (
          <motion.div
            key={content.key}
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.16 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            style={{ originY: 1 }}
            className={`relative max-w-[min(88vw,340px)] rounded-2xl border px-4 py-3 text-center text-[15px] leading-snug shadow-xl shadow-black/30 backdrop-blur-md ${
              content.tone === 'error'
                ? 'border-red-400/30 bg-red-950/50 text-red-100'
                : 'border-white/12 bg-white/[0.07] text-slate-100'
            }`}
          >
            {content.text === null ? (
              <SpeakingDots />
            ) : (
              <Typewriter key={content.text} text={content.text} animated={!reduce} />
            )}
            {/* Colita que apunta al personaje */}
            <span
              aria-hidden="true"
              className={`absolute left-1/2 top-full block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r ${
                content.tone === 'error' ? 'border-red-400/30 bg-[#2a1218]' : 'border-white/12 bg-[#1a2030]'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import NundiCharacter from './nundi/NundiCharacter';
import SpeechBubble from './nundi/SpeechBubble';
import StatusPanel from './nundi/StatusPanel';
import { PALETTE, type NundiState } from './nundi/nundiGeometry';
import { useNundiVoice } from './nundi/useNundiVoice';

const GRID_BG = {
  backgroundImage:
    'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
  backgroundSize: '56px 56px',
  maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black, transparent 75%)',
  WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black, transparent 75%)',
} as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] } }),
};

function MicIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

export default function Hero() {
  const voice = useNundiVoice();
  const { phase, isActive } = voice;
  const reduce = useReducedMotion();

  // Fases de la llamada → estado visual del personaje (la despedida vuelve al reposo)
  const charState: NundiState = phase === 'ended' ? 'idle' : phase;
  const glow = PALETTE[charState].glow;

  const figure = <NundiCharacter state={charState} amplitude={voice.amplitude} className="block h-auto w-full" />;

  const ctaLabel =
    phase === 'connecting' ? 'Cancelar' : isActive ? 'Finalizar llamada' : phase === 'error' ? 'Reintentar' : 'Hablar con Nundi';

  return (
    <section id="inicio" className="relative isolate flex min-h-svh flex-col overflow-hidden bg-[#0B0F19]">
      {/* Fondo: rejilla suave + resplandor que cambia de color con el estado */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0" style={GRID_BG} />
        <motion.div
          className="absolute left-1/2 top-[44%] h-[min(120vw,640px)] w-[min(120vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
          initial={false}
          animate={{ backgroundColor: glow, scale: phase === 'speaking' && !reduce ? 1.12 : 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-5 pb-6 pt-[88px] sm:px-8 lg:pt-28">
        <div className="grid flex-1 grid-cols-1 items-center gap-x-8 gap-y-4 sm:gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)_minmax(0,1fr)] lg:grid-rows-[1fr_auto]">
          {/* Titular */}
          <div className="order-1 lg:col-start-1 lg:row-start-1 lg:self-end">
            <motion.p
              custom={0}
              variants={fadeUp}
              initial={reduce ? false : 'hidden'}
              animate="show"
              className="mb-4 hidden w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-300 sm:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E6A8]" aria-hidden="true" />
              Agentes de voz con IA para tu negocio
            </motion.p>
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial={reduce ? false : 'hidden'}
              animate="show"
              className="text-[clamp(2.6rem,5.4vw,5rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-white"
            >
              Destaca
              <br />
              <span className="bg-gradient-to-r from-[#00C2FF] to-[#00E6A8] bg-clip-text text-transparent">sin esfuerzo.</span>
            </motion.h1>
            <motion.p
              custom={2}
              variants={fadeUp}
              initial={reduce ? false : 'hidden'}
              animate="show"
              className="mt-3 max-w-md text-base leading-relaxed text-slate-400 sm:mt-5 sm:text-lg"
            >
              Nundi atiende llamadas, resuelve dudas y agenda citas por ti, a cualquier hora.<span className="hidden sm:inline"> Compruébalo hablando con él ahora mismo.</span>
            </motion.p>
          </div>

          {/* Escenario: burbuja + personaje */}
          <div className="order-2 flex flex-col items-center lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <SpeechBubble phase={phase} errorMessage={voice.errorMessage} />
            {/* Siempre el mismo elemento: así el personaje no se vuelve a dibujar al empezar o terminar la llamada */}
            <button
              type="button"
              onClick={() => void voice.start()}
              disabled={isActive}
              aria-label={isActive ? 'Nundi, en llamada' : 'Hablar con Nundi'}
              className={`relative mt-2 block w-[min(60vw,250px)] rounded-[2rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00C2FF] sm:w-[min(60vw,380px)] lg:w-full ${
                isActive ? 'cursor-default' : 'cursor-pointer transition-transform duration-300 hover:scale-[1.025] active:scale-[0.99]'
              }`}
            >
              {figure}
            </button>
          </div>

          {/* Botones */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial={reduce ? false : 'hidden'}
            animate="show"
            className="order-3 flex flex-col items-start gap-3 lg:col-start-1 lg:row-start-2 lg:self-start lg:pt-2"
          >
            <div className="flex w-full flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={voice.toggle}
                className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-full py-2 pl-6 pr-2 sm:w-auto sm:justify-start text-[15px] font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00C2FF] ${
                  isActive
                    ? 'bg-red-500 text-white shadow-lg shadow-red-950/40 hover:bg-red-400'
                    : 'bg-white text-slate-950 shadow-lg shadow-black/30 hover:bg-slate-100'
                }`}
              >
                {ctaLabel}
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-950 text-white'
                  }`}
                >
                  {phase === 'connecting' ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                  ) : isActive ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <rect x="6" y="6" width="12" height="12" rx="2.5" />
                    </svg>
                  ) : (
                    <MicIcon className="h-[18px] w-[18px]" />
                  )}
                </span>
              </button>

              <a
                href="#citas"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-4 sm:w-auto text-[15px] font-medium text-slate-200 transition-colors hover:border-white/30 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00C2FF]"
              >
                Agendar una sesión
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
            <p className="text-sm text-slate-500">Sin descargas · Directo desde tu navegador</p>
          </motion.div>

          {/* Panel de estado */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial={reduce ? false : 'hidden'}
            animate="show"
            className="order-4 flex justify-center lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:justify-end"
          >
            <StatusPanel
              phase={phase}
              amplitude={voice.amplitude}
              seconds={voice.seconds}
              muted={voice.muted}
              onToggleMute={voice.toggleMute}
              onStop={voice.stop}
            />
          </motion.div>
        </div>

        {/* Franja inferior */}
        <div className="mt-8 flex flex-col items-center gap-4 border-t border-white/[0.07] pt-5 text-sm sm:flex-row sm:justify-between">
          <a href="#servicios" className="group order-3 flex items-center gap-2 text-slate-400 transition-colors hover:text-white sm:order-1">
            Ver qué puede hacer Nundi
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </a>
          <p className="order-1 text-center text-base font-medium tracking-tight text-slate-200 sm:order-2">
            Siempre despierto. <span className="text-slate-500">Siempre atento.</span>
          </p>
          <span className="order-2 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-300 sm:order-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00E6A8]" aria-hidden="true" />
            Disponible 24/7
          </span>
        </div>
      </div>
    </section>
  );
}
'use client';

import { useEffect, useId, useRef } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import {
  BASE_POINTS,
  PALETTE,
  STATE_LABEL,
  STATE_PARAMS,
  VIEWBOX,
  createScratch,
  deform,
  toPathD,
  type MotionParams,
  type NundiState,
} from './nundiGeometry';

interface NundiCharacterProps {
  /** Estado visual del personaje. */
  state: NundiState;
  /**
   * Volumen de la voz de la IA, de 0 a 1. Es un MotionValue para que el personaje reaccione
   * a 60 fps sin re-renderizar React. Si no se pasa, el personaje usa un movimiento base.
   */
  amplitude?: MotionValue<number>;
  className?: string;
}

/** Estado mutable de la simulación (vive fuera del render de React). */
function createSim() {
  return {
    cur: { ...STATE_PARAMS.idle } as MotionParams,
    scratch: createScratch(),
    level: 0,
    comet: 0,
    blinkAt: 2.6,
    blinkStart: -1,
  };
}

type Sim = ReturnType<typeof createSim>;

const BLINK_DURATION = 0.17;
const INITIAL_D = toPathD(createScratch());

export default function NundiCharacter({ state, amplitude, className }: NundiCharacterProps) {
  const uid = useId().replace(/:/g, '');
  const reduce = useReducedMotion();
  const simRef = useRef<Sim | null>(null);

  // El bucle de animación lee el estado desde aquí (así no se reinicia al cambiar de estado)
  const stateRef = useRef<NundiState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Valores animados (se actualizan sin re-render)
  const d = useMotionValue(INITIAL_D);
  const draw = useMotionValue(0);
  const figureY = useMotionValue(0);
  const figureScale = useMotionValue(1);
  const glowOpacity = useMotionValue(0.4);
  const coreWidth = useMotionValue(5);
  const glowWidth = useMotionValue(13);
  const comet = useMotionValue(0);
  const cometOpacity = useTransform(draw, [0.92, 1], [0, 0.95]);
  const shadowScale = useTransform(figureY, [-10, 10], [0.86, 1.08]);

  // Entrada: el trazo se dibuja solo, como si alguien lo trazara de un golpe
  useEffect(() => {
    if (reduce) {
      draw.set(1);
      return;
    }
    const controls = animate(draw, 1, { duration: 2.6, delay: 0.2, ease: [0.65, 0, 0.35, 1] });
    return () => controls.stop();
  }, [draw, reduce]);

  useAnimationFrame((time, delta) => {
    const sim = (simRef.current ??= createSim());
    const live = stateRef.current;
    const t = time / 1000;
    const dt = Math.min(delta / 1000, 0.05);
    const target = STATE_PARAMS[live];
    const cur = sim.cur;

    // Transición suave entre estados (todos los parámetros convergen al objetivo)
    const k = 1 - Math.exp(-dt * 4.5);
    (Object.keys(target) as (keyof MotionParams)[]).forEach((key) => {
      cur[key] += (target[key] - cur[key]) * k;
    });

    // Volumen de la voz: solo cuando "habla"; con un mínimo para que nunca quede inmóvil
    const raw = amplitude ? amplitude.get() : 0;
    const wantsTalk = live === 'speaking';
    const targetLevel = wantsTalk ? Math.min(1, 0.18 + raw * 0.95) * (reduce ? 0.4 : 1) : 0;
    sim.level += (targetLevel - sim.level) * (1 - Math.exp(-dt * (targetLevel > sim.level ? 18 : 8)));

    // Parpadeo ocasional
    let blink = 0;
    const canBlink = !reduce && (live === 'idle' || live === 'listening');
    if (canBlink) {
      if (sim.blinkStart < 0 && t > sim.blinkAt) sim.blinkStart = t;
      if (sim.blinkStart >= 0) {
        const p = (t - sim.blinkStart) / BLINK_DURATION;
        if (p >= 1) {
          sim.blinkStart = -1;
          sim.blinkAt = t + 2.4 + Math.random() * 3.4;
        } else {
          blink = 1 - Math.abs(2 * p - 1);
        }
      }
    }

    deform(BASE_POINTS, sim.scratch, { t, p: cur, level: sim.level, blink, still: !!reduce });
    d.set(toPathD(sim.scratch));

    // Levitación y respiración del cuerpo completo
    figureY.set(reduce ? 0 : Math.sin(t * cur.floatSpeed) * cur.float);
    figureScale.set(1 + (reduce ? 0 : Math.sin(t * 1.7) * 0.006) + sim.level * 0.03);

    // Resplandor y grosor
    const width = cur.width + sim.level * 1.6;
    coreWidth.set(width);
    glowWidth.set(width * 2.6);
    glowOpacity.set(0.18 + cur.glow * 0.34 + sim.level * 0.3);

    // Destello que recorre la línea
    sim.comet = (sim.comet + dt * cur.comet) % 1;
    comet.set(sim.comet);
  });

  const palette = PALETTE[state];
  const gradId = `nundi-grad-${uid}`;
  const glowId = `nundi-glow-${uid}`;
  const softId = `nundi-soft-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      role="img"
      aria-label={`Nundi, tu asistente virtual. Estado: ${STATE_LABEL[state]}`}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="370" y2="440">
          <motion.stop offset="0%" initial={false} stopColor={PALETTE.idle.a} animate={{ stopColor: palette.a }} transition={{ duration: 0.7 }} />
          <motion.stop offset="55%" initial={false} stopColor={PALETTE.idle.b} animate={{ stopColor: palette.b }} transition={{ duration: 0.7 }} />
          <motion.stop offset="100%" initial={false} stopColor={PALETTE.idle.c} animate={{ stopColor: palette.c }} transition={{ duration: 0.7 }} />
        </linearGradient>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={softId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ondas: solo mientras escucha */}
      <AnimatePresence>
        {state === 'listening' && !reduce && (
          <g key="ripples">
            {[0, 1].map((i) => (
              <motion.circle
                key={i}
                cx={200}
                cy={165}
                fill="none"
                stroke={PALETTE.listening.c}
                strokeWidth={1.5}
                initial={{ r: 120, opacity: 0 }}
                animate={{ r: [120, 215], opacity: [0.4, 0] }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: i * 1.3 }}
              />
            ))}
          </g>
        )}
      </AnimatePresence>

      {/* Sombra proyectada en el suelo */}
      <motion.ellipse
        cx={205}
        cy={432}
        rx={118}
        ry={7}
        fill={palette.c}
        style={{ scale: shadowScale, originX: 0.5, originY: 0.5, opacity: 0.16 }}
      />

      {/* Personaje */}
      <motion.g style={{ y: figureY, scale: figureScale, originX: 0.5, originY: 1 }}>
        {/* Resplandor */}
        <motion.path
          d={d}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glowId})`}
          pathLength={draw}
          style={{ strokeWidth: glowWidth, opacity: glowOpacity }}
        />
        {/* Trazo principal */}
        <motion.path
          d={d}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${softId})`}
          pathLength={draw}
          style={{ strokeWidth: coreWidth }}
        />
        {/* Destello que viaja por la línea */}
        <motion.path
          d={d}
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={0.045}
          style={{ pathSpacing: 0.955, pathOffset: comet, strokeWidth: 3.2, opacity: cometOpacity }}
        />
      </motion.g>
    </svg>
  );
}

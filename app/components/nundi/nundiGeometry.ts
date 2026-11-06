/**
 * Geometría y reglas de movimiento del personaje Nundi.
 *
 * El personaje es UN solo trazo continuo. Se define como una lista de puntos por los que
 * pasa la línea; de ahí se genera una curva suave (Catmull-Rom → Bézier cúbica). Como el
 * trazo se reconstruye en cada fotograma, podemos "deformar" los puntos y hacer que la
 * línea respire, parpadee, escuche o hable sin necesidad de sprites ni frames.
 */

export type NundiState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

export type NundiGroup =
  | 'ground'
  | 'body'
  | 'head'
  | 'face'
  | 'mouth'
  | 'antenna'
  | 'earL'
  | 'earR'
  | 'handL'
  | 'handR'
  | 'eyeL'
  | 'eyeR';

export interface NundiPoint {
  x: number;
  y: number;
  g: NundiGroup;
  /** Origen de escala/rotación del grupo (ojos: su centro; orejas y manos: donde se unen al cuerpo). */
  ox: number;
  oy: number;
  /** Peso de apertura para los puntos de la boca (0 en las comisuras, 1 en el centro). */
  m: number;
}

export interface Vec {
  x: number;
  y: number;
}

export const VIEWBOX = { w: 410, h: 450 };

/* ------------------------------------------------------------------ */
/* Construcción de los puntos                                          */
/* ------------------------------------------------------------------ */

const rad = (deg: number) => (deg * Math.PI) / 180;

const pt = (x: number, y: number, g: NundiGroup = 'body'): NundiPoint => ({ x, y, g, ox: x, oy: y, m: 0 });

/**
 * Lazo o espiral: va de r0 a r1 mientras gira `sweep` grados
 * (negativo = antihorario en pantalla). `origin: 'center'` escala desde el centro (ojos);
 * `origin: 'start'` escala desde el punto de unión con la línea (orejas y manos).
 */
function loop(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  startDeg: number,
  sweepDeg: number,
  steps: number,
  g: NundiGroup,
  origin: 'center' | 'start'
): NundiPoint[] {
  const out: NundiPoint[] = [];
  const sx = cx + Math.cos(rad(startDeg)) * r0;
  const sy = cy + Math.sin(rad(startDeg)) * r0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = rad(startDeg + sweepDeg * t);
    const r = r0 + (r1 - r0) * t;
    out.push({
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      g,
      ox: origin === 'center' ? cx : sx,
      oy: origin === 'center' ? cy : sy,
      m: 0,
    });
  }
  return out;
}

const mouth = (x: number, y: number, m: number): NundiPoint => ({ ...pt(x, y, 'mouth'), m });

/**
 * Recorrido del lápiz (de principio a fin, sin levantarlo):
 *  A. pie izquierdo → cuerpo (mano izquierda en lazo)
 *  B. cabeza en sentido horario: oreja izquierda, antena, oreja derecha, base
 *  C. cara: ojo izquierdo → sonrisa → ojo derecho
 *  D. cuerpo derecho (mano derecha en lazo) → pie derecho
 */
export const BASE_POINTS: NundiPoint[] = [
  // A
  pt(30, 408, 'ground'), pt(82, 405, 'ground'), pt(122, 394), pt(140, 364),
  ...loop(127, 334, 13, 13, 0, -360, 8, 'handL', 'start'),
  pt(142, 306), pt(146, 284),
  // B
  pt(126, 260, 'head'), pt(104, 250, 'head'), pt(88, 234, 'head'), pt(80, 208, 'head'), pt(80, 178, 'head'),
  ...loop(65, 150, 15, 15, 0, -360, 8, 'earL', 'start'),
  pt(80, 124, 'head'), pt(82, 100, 'head'), pt(96, 86, 'head'), pt(120, 77, 'head'), pt(156, 74, 'head'), pt(186, 74, 'head'),
  pt(202, 62, 'antenna'), pt(200, 46, 'antenna'), pt(188, 30, 'antenna'), pt(200, 16, 'antenna'),
  pt(220, 20, 'antenna'), pt(224, 38, 'antenna'), pt(210, 50, 'antenna'),
  pt(230, 66, 'head'), pt(266, 74, 'head'), pt(298, 80, 'head'), pt(314, 96, 'head'), pt(320, 122, 'head'),
  ...loop(335, 150, 15, 15, 180, -360, 8, 'earR', 'start'),
  pt(320, 178, 'head'), pt(318, 210, 'head'), pt(306, 234, 'head'), pt(282, 244, 'head'), pt(250, 246, 'head'),
  pt(214, 247, 'head'), pt(176, 246, 'head'), pt(146, 243, 'head'), pt(124, 234, 'head'),
  // C
  pt(118, 214, 'face'), pt(126, 192, 'face'), pt(140, 172, 'face'),
  ...loop(150, 142, 24, 11, 110, -400, 12, 'eyeL', 'center'),
  pt(172, 176, 'face'),
  mouth(180, 198, 0.15), mouth(192, 212, 0.7), mouth(208, 217, 1), mouth(224, 212, 0.7), mouth(236, 198, 0.15),
  pt(246, 178, 'face'),
  ...loop(254, 142, 24, 11, 100, -400, 12, 'eyeR', 'center'),
  pt(280, 162, 'face'), pt(288, 194, 'face'),
  // D
  pt(284, 228), pt(274, 262), pt(268, 296),
  ...loop(281, 328, 13, 13, 180, -360, 8, 'handR', 'start'),
  pt(266, 360), pt(278, 386), pt(300, 399),
  pt(330, 405, 'ground'), pt(356, 407, 'ground'), pt(380, 408, 'ground'),
];

/** Memoria reutilizable para no crear objetos en cada fotograma. */
export function createScratch(): Vec[] {
  return BASE_POINTS.map((p) => ({ x: p.x, y: p.y }));
}

/* ------------------------------------------------------------------ */
/* Parámetros de movimiento por estado                                 */
/* ------------------------------------------------------------------ */

export interface MotionParams {
  /** Amplitud del temblor orgánico de la línea (px en el viewBox). */
  wobble: number;
  /** Velocidad del temblor. */
  speed: number;
  /** 0–1: las "orejas" se agrandan y pulsan (escuchando). */
  ears: number;
  /** 0–1: el personaje habla (boca, manos, ojos reaccionan al volumen). */
  talk: number;
  /** Amplitud de la levitación del cuerpo entero (px). */
  float: number;
  /** Velocidad de la levitación. */
  floatSpeed: number;
  /** Intensidad base del resplandor. */
  glow: number;
  /** Grosor base del trazo. */
  width: number;
  /** Velocidad del destello que recorre la línea (vueltas por segundo). */
  comet: number;
}

export const STATE_PARAMS: Record<NundiState, MotionParams> = {
  idle:       { wobble: 1.3, speed: 1.2, ears: 0, talk: 0, float: 7,   floatSpeed: 1.3, glow: 0.45, width: 5,   comet: 0.1 },
  connecting: { wobble: 2.8, speed: 3.4, ears: 0, talk: 0, float: 4,   floatSpeed: 3.0, glow: 0.6,  width: 5,   comet: 0.5 },
  listening:  { wobble: 2.2, speed: 1.9, ears: 1, talk: 0, float: 5,   floatSpeed: 1.8, glow: 0.7,  width: 5.5, comet: 0.2 },
  speaking:   { wobble: 3.0, speed: 3.6, ears: 0, talk: 1, float: 3.5, floatSpeed: 2.6, glow: 1.0,  width: 6,   comet: 0.4 },
  error:      { wobble: 4.2, speed: 8.0, ears: 0, talk: 0, float: 2,   floatSpeed: 6.0, glow: 0.7,  width: 5,   comet: 0 },
};

/** Cuánto "tiembla" cada parte (0 = fija). */
const WOBBLE_WEIGHT: Record<NundiGroup, number> = {
  ground: 0,
  body: 0.5,
  head: 0.55,
  face: 0.35,
  mouth: 0.3,
  antenna: 1.8,
  earL: 0.6,
  earR: 0.6,
  handL: 1,
  handR: 1,
  eyeL: 0.25,
  eyeR: 0.25,
};

/* ------------------------------------------------------------------ */
/* Paleta de colores por estado                                        */
/* ------------------------------------------------------------------ */

export const PALETTE: Record<NundiState, { a: string; b: string; c: string; glow: string }> = {
  idle:       { a: '#E6F8FF', b: '#9BDDFB', c: '#7DD3FC', glow: 'rgba(125,211,252,0.20)' },
  connecting: { a: '#FEF3C7', b: '#FCD34D', c: '#FBBF24', glow: 'rgba(251,191,36,0.18)' },
  listening:  { a: '#C8FFEE', b: '#4DF0C0', c: '#00E6A8', glow: 'rgba(0,230,168,0.22)' },
  speaking:   { a: '#D6F6FF', b: '#00C2FF', c: '#A78BFA', glow: 'rgba(0,194,255,0.30)' },
  error:      { a: '#FFE4E4', b: '#FCA5A5', c: '#F87171', glow: 'rgba(248,113,113,0.20)' },
};

export const STATE_LABEL: Record<NundiState, string> = {
  idle: 'En reposo',
  connecting: 'Conectando',
  listening: 'Escuchando',
  speaking: 'Hablando',
  error: 'Sin conexión',
};

/* ------------------------------------------------------------------ */
/* Deformación por fotograma                                           */
/* ------------------------------------------------------------------ */

export interface Frame {
  /** Segundos desde que arrancó la animación. */
  t: number;
  /** Parámetros ya suavizados del estado actual. */
  p: MotionParams;
  /** 0–1: volumen de la voz de la IA (suavizado). */
  level: number;
  /** 0–1: parpadeo (1 = ojos cerrados). */
  blink: number;
  /** Prefers-reduced-motion: sin temblor ni gestos. */
  still: boolean;
}

export function deform(base: NundiPoint[], out: Vec[], f: Frame): void {
  const { t, p, level, blink, still } = f;
  const wobble = still ? 0 : p.wobble;
  const lookX = still ? 0 : Math.sin(t * 0.55) * 3.2 * (1 - p.talk * 0.5);
  const lookY = still ? 0 : Math.sin(t * 0.41 + 1.1) * 1.6;
  const mouthOpen = level * 16 + (still ? 0 : Math.sin(t * 1.1) * 0.7);

  for (let i = 0; i < base.length; i++) {
    const b = base[i];
    let x = b.x;
    let y = b.y;

    switch (b.g) {
      case 'eyeL':
      case 'eyeR': {
        const boost = 1 + p.ears * 0.1 + level * 0.14;
        const sx = (1 + blink * 0.08) * boost;
        const sy = (1 - blink * 0.9) * boost;
        x = b.ox + (b.x - b.ox) * sx + lookX;
        y = b.oy + (b.y - b.oy) * sy + lookY;
        break;
      }
      case 'earL':
      case 'earR': {
        const s = 1 + p.ears * (0.25 + 0.2 * Math.sin(t * 5.5 + (b.g === 'earR' ? 0.9 : 0)));
        x = b.ox + (b.x - b.ox) * s;
        y = b.oy + (b.y - b.oy) * s;
        break;
      }
      case 'handL':
      case 'handR': {
        const left = b.g === 'handL';
        const swing = still
          ? 0
          : level * 0.6 * Math.sin(t * 5.2 + (left ? 0 : 2.1)) + Math.sin(t * 1.3 + (left ? 0 : 1.7)) * 0.07;
        const th = left ? swing : -swing;
        const dx = b.x - b.ox;
        const dy = b.y - b.oy;
        const c = Math.cos(th);
        const s = Math.sin(th);
        x = b.ox + dx * c - dy * s;
        y = b.oy + dx * s + dy * c;
        break;
      }
      case 'mouth':
        y += b.m * mouthOpen;
        break;
      case 'antenna':
        if (!still) y += level * 3 * Math.sin(t * 13 + i);
        break;
      default:
        break;
    }

    const w = WOBBLE_WEIGHT[b.g];
    if (w > 0 && wobble > 0) {
      x += Math.sin(t * p.speed + i * 0.45) * wobble * w;
      y += Math.sin(t * p.speed * 0.83 + i * 0.37 + 1.7) * wobble * w;
    }

    out[i].x = x;
    out[i].y = y;
  }
}

/* ------------------------------------------------------------------ */
/* Puntos → atributo `d` del <path>                                    */
/* ------------------------------------------------------------------ */

const r1 = (n: number) => Math.round(n * 10) / 10;

export function toPathD(pts: Vec[]): string {
  const last = pts.length - 1;
  let d = `M${r1(pts[0].x)} ${r1(pts[0].y)}`;
  for (let i = 0; i < last; i++) {
    const p0 = pts[i > 0 ? i - 1 : 0];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 <= last ? i + 2 : last];
    d +=
      `C${r1(p1.x + (p2.x - p0.x) / 6)} ${r1(p1.y + (p2.y - p0.y) / 6)} ` +
      `${r1(p2.x - (p3.x - p1.x) / 6)} ${r1(p2.y - (p3.y - p1.y) / 6)} ` +
      `${r1(p2.x)} ${r1(p2.y)}`;
  }
  return d;
}

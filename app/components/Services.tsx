'use client';

import { useEffect, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Vista previa 1: conversación del agente (se escribe sola)           */
/* ------------------------------------------------------------------ */

const CHAT = [
  { from: 'bot', text: '¡Hola! 👋 Bienvenido a Dental Care FX. ¿Buscas cotizar o agendar una cita?' },
  { from: 'user', text: 'Hola, quisiera agendar una valoración de ortodoncia este jueves.' },
  { from: 'bot', text: '¡Perfecto! Tengo espacio a las 10:00 AM y a las 3:30 PM. ¿Cuál te queda mejor? 📅' },
  { from: 'user', text: 'A las 3:30 PM, por favor.' },
  { from: 'bot', text: 'Listo ✅ Tu valoración quedó agendada para el jueves a las 3:30 PM.' },
] as const;

function ChatPreview() {
  const [shown, setShown] = useState(0);
  const done = shown >= CHAT.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 500 : 1400);
    return () => clearTimeout(t);
  }, [shown, done]);

  const nextFrom = !done ? CHAT[shown].from : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2.5 overflow-hidden text-sm">
        {CHAT.slice(0, shown).map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl border px-3 py-2 ${
                m.from === 'user'
                  ? 'rounded-tr-sm border-[#00C2FF]/30 bg-[#00C2FF]/20 font-medium text-[#8fe3ff]'
                  : 'rounded-tl-sm border-slate-700/50 bg-slate-800/60 text-gray-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {nextFrom && (
          <div className={`flex ${nextFrom === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex gap-1 rounded-2xl border border-slate-700/50 bg-slate-800/60 px-3 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
        <span className="text-xs text-gray-500">Así conversa tu agente con un cliente</span>
        <button
          type="button"
          onClick={() => setShown(0)}
          className="cursor-pointer rounded-md border border-slate-700 px-3 py-1 text-xs text-gray-300 transition-colors hover:border-[#00C2FF]/60 hover:text-white"
        >
          ↻ Repetir
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vista previa 2: agenda con horarios clicables                       */
/* ------------------------------------------------------------------ */

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const SLOTS = ['09:00', '10:00', '11:30', '14:00', '15:30', '16:30'];
const BUSY = new Set(['Lun-10:00', 'Mar-14:00', 'Mié-09:00', 'Jue-16:30', 'Vie-11:30', 'Mar-11:30']);

function AgendaPreview() {
  const [day, setDay] = useState('Jue');
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const reset = () => {
    setSlot(null);
    setBooked(false);
  };

  if (booked) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00E6A8]/15 text-2xl text-[#00E6A8]">
          ✓
        </div>
        <p className="text-base font-semibold text-white">Cita confirmada</p>
        <p className="max-w-xs text-sm text-gray-400">
          {day} a las {slot}. Se agregó a tu calendario y el cliente recibe su confirmación al instante.
        </p>
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-md border border-slate-700 px-3 py-1 text-xs text-gray-300 transition-colors hover:border-[#00C2FF]/60 hover:text-white"
        >
          ↻ Probar otra vez
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Elige un día</p>
      <div className="mb-4 grid grid-cols-5 gap-2">
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              setDay(d);
              setSlot(null);
            }}
            className={`cursor-pointer rounded-lg border py-2 text-sm font-medium transition-all ${
              day === d
                ? 'border-[#00C2FF] bg-[#00C2FF]/15 text-white'
                : 'border-slate-800 bg-slate-900/60 text-gray-400 hover:border-slate-600'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Horarios disponibles</p>
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map((s) => {
          const busy = BUSY.has(`${day}-${s}`);
          const selected = slot === s;
          return (
            <button
              key={s}
              type="button"
              disabled={busy}
              onClick={() => setSlot(s)}
              className={`rounded-lg border py-2 text-sm transition-all ${
                busy
                  ? 'cursor-not-allowed border-slate-900 bg-slate-900/40 text-gray-600 line-through'
                  : selected
                  ? 'cursor-pointer border-[#00E6A8] bg-[#00E6A8]/15 font-semibold text-white'
                  : 'cursor-pointer border-slate-800 bg-slate-900/60 text-gray-300 hover:border-[#00C2FF]/60'
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-3">
        <span className="text-xs text-gray-500">
          {slot ? `Seleccionado: ${day} · ${slot}` : 'Simulación: así ven tus clientes la disponibilidad'}
        </span>
        <button
          type="button"
          disabled={!slot}
          onClick={() => setBooked(true)}
          className="cursor-pointer rounded-md bg-gradient-to-r from-[#00C2FF] to-[#00E6A8] px-4 py-1.5 text-xs font-bold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Confirmar cita
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vista previa 3: flujo de un lead hacia tus herramientas             */
/* ------------------------------------------------------------------ */

const OUTPUTS = [
  { icon: '💬', label: 'WhatsApp' },
  { icon: '🗂️', label: 'CRM' },
  { icon: '📊', label: 'Hoja de cálculo' },
];

function FlowPreview() {
  // 0 = reposo, 1 = web, 2 = agente IA, 3 = destinos, 4 = terminado
  const [step, setStep] = useState(0);
  const running = step > 0 && step < 4;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [step, running]);

  const lit = (n: number) =>
    step >= n
      ? 'border-[#00C2FF] bg-[#00C2FF]/10 text-white shadow-[0_0_24px_rgba(0,194,255,0.25)]'
      : 'border-slate-800 bg-slate-900/60 text-gray-500';

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4">
        <div className={`rounded-xl border px-3 py-4 text-center text-xs transition-all duration-500 ${lit(1)}`}>
          <div className="mb-1 text-xl">🌐</div>
          Tu web
        </div>

        <span className={`text-lg transition-colors ${step >= 2 ? 'text-[#00C2FF]' : 'text-slate-700'}`}>→</span>

        <div className={`rounded-xl border px-3 py-4 text-center text-xs transition-all duration-500 ${lit(2)}`}>
          <div className="mb-1 text-xl">🤖</div>
          Agente IA
        </div>

        <span className={`text-lg transition-colors ${step >= 3 ? 'text-[#00C2FF]' : 'text-slate-700'}`}>→</span>

        <div className="flex flex-col gap-2">
          {OUTPUTS.map((o) => (
            <div
              key={o.label}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all duration-500 ${lit(3)}`}
            >
              <span>{o.icon}</span>
              {o.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-800 pt-3">
        <span className="text-xs text-gray-500">
          {step === 4 ? '✅ Lead entregado a todos tus canales' : 'Simulación: envía un lead de prueba'}
        </span>
        <button
          type="button"
          disabled={running}
          onClick={() => setStep(1)}
          className="cursor-pointer rounded-md bg-gradient-to-r from-[#00C2FF] to-[#00E6A8] px-4 py-1.5 text-xs font-bold text-slate-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? 'Enviando…' : step === 4 ? '↻ Repetir' : 'Enviar lead de prueba'}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sección                                                              */
/* ------------------------------------------------------------------ */

const SERVICES = [
  {
    id: 'agentes',
    icon: '🤖',
    title: 'Agentes de IA Conversacional',
    description:
      'Chatbots inteligentes entrenados con la información de tu negocio para responder preguntas frecuentes y cerrar prospectos 24/7.',
    preview: 'Conversación con un cliente',
    Preview: ChatPreview,
  },
  {
    id: 'agenda',
    icon: '📅',
    title: 'Agendamiento Automatizado',
    description:
      'Sincronización directa con Google Calendar o Cal.com para agendar citas sin intervención humana ni llamadas perdidas.',
    preview: 'Agenda en tiempo real',
    Preview: AgendaPreview,
  },
  {
    id: 'flujos',
    icon: '⚡',
    title: 'Integración de Flujos & CRM',
    description:
      'Conectamos tu web con WhatsApp, hojas de cálculo o CRM para que recibas los datos de tus clientes al instante.',
    preview: 'Flujo de datos automático',
    Preview: FlowPreview,
  },
];

export default function Services() {
  const [active, setActive] = useState(0);
  const current = SERVICES[active];

  return (
    <section id="servicios" className="scroll-mt-20 border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-extrabold md:text-4xl">
            Lo que construimos para tu{' '}
            <span className="bg-gradient-to-r from-[#00C2FF] to-[#00E6A8] bg-clip-text text-transparent">
              Negocio
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-gray-400">
            Reemplazamos webs estáticas por infraestructura digital que genera ventas. Toca cada servicio
            para verlo en acción.
          </p>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-5">
          {/* Selector */}
          <div role="tablist" aria-label="Servicios" className="flex flex-col gap-3 lg:col-span-2">
            {SERVICES.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className={`cursor-pointer rounded-2xl border p-5 text-left transition-all duration-300 ${
                    isActive
                      ? 'border-[#00C2FF]/60 bg-gradient-to-br from-[#00C2FF]/10 to-slate-900/60 shadow-lg shadow-[#00C2FF]/5'
                      : 'border-slate-800 bg-slate-900/40 hover:-translate-y-0.5 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl transition-colors ${
                        isActive ? 'bg-[#00C2FF]/15' : 'bg-slate-800/60'
                      }`}
                    >
                      {s.icon}
                    </span>
                    <h3 className={`font-bold transition-colors ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {s.title}
                    </h3>
                  </div>

                  <div
                    className={`grid transition-all duration-300 ${
                      isActive ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <p className="overflow-hidden text-sm leading-relaxed text-gray-400">{s.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Vista previa */}
          <div className="lg:col-span-3">
            <div className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0B0F19] shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-2 text-xs text-gray-400">{current.preview}</span>
                </div>
                <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gray-500">
                  Simulación
                </span>
              </div>

              {/* key = reinicia la animación al cambiar de servicio */}
              <div key={current.id} className="min-h-0 flex-1 p-4">
                <current.Preview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
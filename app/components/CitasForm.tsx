'use client';

import { useEffect, useState } from 'react';

const WEBHOOK_URL = 'https://hook.eu1.make.com/ppgtach0xqsudpf0qpwnv3jinpwix6xd';

// Colombia no tiene horario de verano: siempre UTC-5.
// Si tu escenario de Make ya compensa la zona horaria, cambia esto a 'Z' (como tenías antes).
const TIMEZONE_OFFSET = '-05:00';

const SERVICIOS = [
  'Agentes de Voz IA para Citas',
  'Automatización de CRM y Webhooks',
  'Sistema de Agendamiento Web 24/7',
  'Consultoría General Chatrax',
];

const HORAS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
];

const QUICK_DATES = [
  { label: 'Mañana', days: 1 },
  { label: 'En 2 días', days: 2 },
  { label: 'En 1 semana', days: 7 },
];

const BENEFICIOS = [
  { icon: '🔍', title: 'Revisamos tu operación', text: 'Cómo atiendes y agendas hoy, y dónde se te escapan clientes.' },
  { icon: '🎯', title: 'Definimos qué automatizar primero', text: 'Priorizamos lo que más impacto tiene en tus ventas.' },
  { icon: '🚀', title: 'Te mostramos el camino', text: 'Sales con una propuesta clara de cómo implementarlo.' },
];

const INITIAL = {
  nombre: '',
  telefono: '',
  email: '',
  servicio: SERVICIOS[0],
  fecha: '',
  hora: '10:00',
};

type Status = 'idle' | 'loading' | 'success' | 'error';

function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#00C2FF] focus:outline-none focus:ring-1 focus:ring-[#00C2FF]/40';

export default function CitasForm() {
  const [formData, setFormData] = useState(INITIAL);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  // La fecha mínima se calcula tras montar (evita diferencias entre servidor y navegador)
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    setMinDate(toInputDate(new Date()));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const pickQuickDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFormData((prev) => ({ ...prev, fecha: toInputDate(d) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fecha) {
      setStatus('error');
      setMessage('Por favor selecciona una fecha para la sesión.');
      return;
    }

    setStatus('loading');
    setMessage('');

    const payload = {
      nombre: formData.nombre,
      telefono: formData.telefono,
      email: formData.email,
      servicio: formData.servicio,
      fecha: `${formData.fecha}T${formData.hora}:00${TIMEZONE_OFFSET}`,
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setMessage('Ocurrió un error al agendar. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Error de conexión con el servidor.');
    }
  };

  const resetForm = () => {
    setFormData(INITIAL);
    setStatus('idle');
    setMessage('');
  };

  const loading = status === 'loading';

  return (
    <section id="citas" className="scroll-mt-20 border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-6 shadow-2xl md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#00C2FF]/10 blur-3xl"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-5">
            {/* Texto */}
            <div className="lg:col-span-2">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-[#00E6A8]">
                Hablemos
              </span>
              <h2 className="mb-3 text-3xl font-extrabold md:text-4xl">
                Agenda una{' '}
                <span className="bg-gradient-to-r from-[#00C2FF] to-[#00E6A8] bg-clip-text text-transparent">
                  Sesión Estratégica
                </span>
              </h2>
              <p className="mb-6 text-gray-400">
                Analicemos cómo automatizar el agendamiento y ventas de tu empresa con IA.
              </p>

              <ul className="space-y-4">
                {BENEFICIOS.map((b) => (
                  <li key={b.title} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/70 text-lg">
                      {b.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{b.title}</p>
                      <p className="text-sm text-gray-400">{b.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-3">
              {status === 'success' ? (
                <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#00E6A8]/30 bg-[#00E6A8]/5 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00E6A8]/15 text-3xl text-[#00E6A8]">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    ¡Sesión agendada{formData.nombre ? `, ${formData.nombre.split(' ')[0]}` : ''}!
                  </h3>
                  <p className="max-w-sm text-sm text-gray-400">
                    Recibimos tus datos y nos pondremos en contacto contigo para confirmar la sesión.
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-2 cursor-pointer rounded-lg border border-slate-700 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-[#00C2FF]/60 hover:text-white"
                  >
                    Agendar otra sesión
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="nombre" className="mb-1 block text-xs font-medium text-gray-300">
                        Nombre completo
                      </label>
                      <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        required
                        autoComplete="name"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej. Andrés Gómez"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="telefono" className="mb-1 block text-xs font-medium text-gray-300">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        id="telefono"
                        type="tel"
                        name="telefono"
                        required
                        autoComplete="tel"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Ej. 3001234567"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-300">
                        Correo corporativo
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="andres@miempresa.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="servicio" className="mb-1 block text-xs font-medium text-gray-300">
                        Solución de interés
                      </label>
                      <select
                        id="servicio"
                        name="servicio"
                        value={formData.servicio}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        {SERVICIOS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                      <label htmlFor="fecha" className="text-xs font-medium text-gray-300">
                        Fecha
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_DATES.map((q) => (
                          <button
                            key={q.label}
                            type="button"
                            onClick={() => pickQuickDate(q.days)}
                            className="cursor-pointer whitespace-nowrap rounded-full border border-slate-700 px-2.5 py-0.5 text-[11px] text-gray-300 transition-colors hover:border-[#00C2FF]/60 hover:text-white"
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      id="fecha"
                      type="date"
                      name="fecha"
                      required
                      min={minDate || undefined}
                      value={formData.fecha}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-300">Hora</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {HORAS.map((h) => {
                        const selected = formData.hora === h.value;
                        return (
                          <button
                            key={h.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setFormData((prev) => ({ ...prev, hora: h.value }))}
                            className={`cursor-pointer rounded-lg border py-2 text-xs font-medium transition-all ${
                              selected
                                ? 'border-[#00C2FF] bg-[#00C2FF]/15 text-white'
                                : 'border-slate-700 bg-slate-800/60 text-gray-400 hover:border-slate-500'
                            }`}
                          >
                            {h.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#00C2FF] to-[#00E6A8] py-3 font-bold text-slate-950 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    )}
                    {loading ? 'Procesando...' : 'Agendar Demostración'}
                  </button>

                  {status === 'error' && message && (
                    <p role="alert" className="text-center text-sm font-medium text-red-400">
                      {message}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
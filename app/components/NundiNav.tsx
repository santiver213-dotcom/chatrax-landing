'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'citas', label: 'Agendar' },
] as const;

/** Barra de navegación flotante en forma de píldora. Resalta la sección que estás viendo. */
export default function NundiNav() {
  const [active, setActive] = useState<string>('inicio');

  useEffect(() => {
    // La sección que cruza la franja central de la pantalla es la activa
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4">
      <nav
        aria-label="Principal"
        className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0B0F19]/70 py-1.5 pl-4 pr-1.5 shadow-lg shadow-black/30 backdrop-blur-xl sm:gap-2 sm:pl-5"
      >
        <a href="#inicio" className="mr-1 flex items-center gap-2 pr-2 sm:mr-3" aria-label="Nundi, ir al inicio">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#00C2FF] to-[#00E6A8] shadow-[0_0_12px_#00C2FF]" aria-hidden="true" />
          <span className="text-[17px] font-semibold tracking-tight text-white">nundi</span>
        </a>

        <ul className="flex items-center">
          {LINKS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={active === id ? 'true' : undefined}
                className={`relative block rounded-full px-3 py-2 text-[13px] font-medium transition-colors sm:px-4 sm:text-sm ${
                  active === id ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {active === id && (
                  <motion.span
                    layoutId="nundi-nav-pill"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative">{label}</span>
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#citas"
          className="ml-1 hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200 md:block"
        >
          Agendar sesión
        </a>
      </nav>
    </header>
  );
}

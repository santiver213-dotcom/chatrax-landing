'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
      CHATRAX © {year ?? '2026'} - Desarrollo de Software, Agentes de IA y Automatizaciones B2B.
    </footer>
  );
}
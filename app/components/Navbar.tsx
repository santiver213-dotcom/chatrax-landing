import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00C2FF] to-[#00E6A8]">
          CHATRAX
        </span>
      </div>

      {/* Menú Enlaces */}
      <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
        <Link href="#servicios" className="hover:text-white transition-colors">Servicios</Link>
        <Link href="#demo" className="hover:text-white transition-colors">Demo IA</Link>
        <Link href="#casos" className="hover:text-white transition-colors">Casos de Uso</Link>
      </div>

      {/* Botón CTA Navbar */}
      <button className="bg-gradient-to-r from-[#00C2FF] to-[#00E6A8] text-slate-950 font-bold px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-all">
        Contactar
      </button>
    </nav>
  );
}
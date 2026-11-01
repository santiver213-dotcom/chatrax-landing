export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#0B0F19] text-gray-500 py-8 px-6 text-center text-sm">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00C2FF] to-[#00E6A8]">
          CHATRAX © {new Date().getFullYear()}
        </span>
        <p className="text-xs">
          Desarrollo de Software, Agentes de IA y Automatizaciones B2B.
        </p>
      </div>
    </footer>
  );
}
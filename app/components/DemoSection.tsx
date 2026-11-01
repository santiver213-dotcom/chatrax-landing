export default function DemoSection() {
  return (
    <section id="demo" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/60">
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#00C2FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[#00E6A8] text-sm font-semibold tracking-wider uppercase mb-2 block">
            Prueba de Concepto
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experimenta el Poder de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2FF] to-[#00E6A8]">IA en Vivo</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Interactúa con nuestro agente demo de agendamiento para ver cómo califica clientes y agenda en tiempo real.
          </p>
        </div>

        {/* Contenedor Mockup del Chatbot / Widget */}
        <div className="max-w-xl mx-auto bg-[#0B0F19] border border-slate-700/80 rounded-2xl p-6 shadow-inner flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#00E6A8] animate-pulse" />
              <span className="font-semibold text-sm">Asistente Virtual Chatrax</span>
            </div>
            <span className="text-xs text-gray-500">En línea 24/7</span>
          </div>

          <div className="space-y-3 py-4 text-sm">
            <div className="bg-slate-800/60 text-gray-200 p-3 rounded-xl rounded-tl-none max-w-[85%] border border-slate-700/50">
              ¡Hola! 👋 Bienvenido a Dental Care FX. ¿En qué te puedo ayudar hoy? ¿Buscas cotizar o agendar una cita?
            </div>
            <div className="bg-[#00C2FF]/20 text-[#00C2FF] p-3 rounded-xl rounded-tr-none max-w-[85%] ml-auto font-medium border border-[#00C2FF]/30">
              Hola, quisiera agendar una valoración para ortodoncia este jueves.
            </div>
            <div className="bg-slate-800/60 text-gray-200 p-3 rounded-xl rounded-tl-none max-w-[85%] border border-slate-700/50">
              ¡Perfecto! Tengo espacio disponible a las 10:00 AM y a las 3:30 PM. ¿Cuál horario te queda mejor? 📅
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <input 
              type="text" 
              placeholder="Escribe tu mensaje de prueba..." 
              disabled 
              className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-gray-400 w-full focus:outline-none"
            />
            <button className="bg-gradient-to-r from-[#00C2FF] to-[#00E6A8] text-slate-950 font-bold px-4 py-2 rounded-lg text-sm">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
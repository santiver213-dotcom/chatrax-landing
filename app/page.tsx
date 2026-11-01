import Navbar from './components/Navbar';
import Services from './components/Services';
import DemoSection from './components/DemoSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="flex flex-col items-center justify-center px-6 py-20 text-center">
          {/* Badge / Etiqueta */}
          <div className="bg-[#00C2FF]/10 border border-[#00C2FF]/30 text-[#00C2FF] px-4 py-1 rounded-full text-sm font-medium mb-6 inline-flex items-center gap-2">
            ⚡ Chatrax Tech & AI
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl md:text-6xl font-extrabold max-w-4xl leading-tight mb-6">
            Automatiza la atención y agendamiento de tu negocio con <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2FF] to-[#00E6A8]">Inteligencia Artificial</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-8">
            Convertimos sitios web estáticos en sistemas inteligentes que responden dudas, cotizan y agendan citas 24/7.
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button className="bg-gradient-to-r from-[#00C2FF] to-[#00E6A8] text-slate-950 font-bold px-8 py-3 rounded-lg shadow-lg hover:opacity-90 transition-all">
              Probar Demo Interactiva
            </button>
            <button className="border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white font-medium px-8 py-3 rounded-lg transition-all">
              Agendar una Llamada
            </button>
          </div>
        </main>

        {/* Secciones */}
        <Services />
        <DemoSection />
      </div>

      <Footer />
    </div>
  );
}
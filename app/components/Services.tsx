export default function Services() {
  const services = [
    {
      icon: "🤖",
      title: "Agentes de IA Conversacional",
      description: "Chatbots inteligentes entrenados con la información de tu negocio para responder preguntas frecuentes y cerrar prospectos 24/7."
    },
    {
      icon: "📅",
      title: "Agendamiento Automatizado",
      description: "Sincronización directa con Google Calendar o Cal.com para agendar citas sin intervención humana ni llamadas pérdidas."
    },
    {
      icon: "⚡",
      title: "Integración de Flujos & CRM",
      description: "Conectamos tu web con WhatsApp, hojas de cálculo o CRM para que recibas los datos de tus clientes al instante."
    }
  ];

  return (
    <section id="servicios" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
          Lo que construimos para tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2FF] to-[#00E6A8]">Negocio</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Reemplazamos webs estáticas por infraestructura digital que genera ventas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((item, index) => (
          <div 
            key={index} 
            className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl hover:border-[#00C2FF]/50 transition-all group hover:-translate-y-1"
          >
            <div className="text-4xl mb-4 p-3 bg-slate-800/50 rounded-xl w-fit group-hover:bg-[#00C2FF]/10 transition-colors">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#00C2FF] transition-colors">
              {item.title}
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
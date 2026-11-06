import NundiNav from './components/NundiNav';
import Hero from './components/Hero';
import Services from './components/Services';
import CitasForm from './components/CitasForm';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B0F19] text-white">
      <NundiNav />
      <main className="flex-1">
        <Hero />
        <Services />
        <CitasForm />
      </main>
      <Footer />
    </div>
  );
}
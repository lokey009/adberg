import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ServiceSelector from '@/components/ServiceSelector';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main>
        <Hero />
        <ServiceSelector />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

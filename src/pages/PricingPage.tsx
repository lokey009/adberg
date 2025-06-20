import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EnhancedPricing from '@/components/EnhancedPricing';

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="pt-24">
        <EnhancedPricing />
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage; 
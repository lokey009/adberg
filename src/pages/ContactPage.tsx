import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/Contact';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="pt-24">
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage; 
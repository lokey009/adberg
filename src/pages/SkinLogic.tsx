import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BestPracticesModal from '@/components/skin-logic/BestPracticesModal';
import GetStartedSection from '@/components/skin-logic/GetStartedSection';
import PreservedAreasPanel from '@/components/skin-logic/PreservedAreasPanel';
import PricingModal from '@/components/skin-logic/PricingModal';
import ResultPanel from '@/components/skin-logic/ResultPanel';
import UploadPanel from '@/components/skin-logic/UploadPanel';

const SkinLogic = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showBestPractices, setShowBestPractices] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [enhancementSettings, setEnhancementSettings] = useState({
    mode: 'standard',
    skinTexture: 0.37,
    skinRealism: 1.7,
    preservedAreas: [] as string[],
    agreedToBestPractices: false
  });

  const handleImageUpload = (imageUrl: string) => {
    console.log('Image uploaded:', imageUrl);
    setUploadedImage(imageUrl);
    setEnhancedImage(null);
  };

  const handleEnhance = async () => {
    if (!uploadedImage || !enhancementSettings.agreedToBestPractices) return;
    
    setIsEnhancing(true);
    console.log('Enhancing with settings:', enhancementSettings);
    
    // Simulate AI enhancement process
    setTimeout(() => {
      // For demo, we'll use a different placeholder image to simulate enhancement
      setEnhancedImage('https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop');
      setIsEnhancing(false);
    }, 3000);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setEnhancedImage(null);
    setIsEnhancing(false);
    setEnhancementSettings({
      mode: 'standard',
      skinTexture: 0.37,
      skinRealism: 1.7,
      preservedAreas: [],
      agreedToBestPractices: false
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-5xl font-bold text-white text-center mb-10">Skin Enhancement Studio</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload Panel */}
          <div className="lg:col-span-4">
            <UploadPanel
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              enhancementSettings={enhancementSettings}
              setEnhancementSettings={setEnhancementSettings}
              onEnhance={handleEnhance}
              isEnhancing={isEnhancing}
              onReset={handleReset}
            />
          </div>

          {/* Right Side Panels */}
          <div className="lg:col-span-8 space-y-6">
            {/* Result Panel */}
            <ResultPanel
              originalImage={uploadedImage}
              enhancedImage={enhancedImage}
              isEnhancing={isEnhancing}
            />

            {/* Preserved Areas Panel */}
            <PreservedAreasPanel
              preservedAreas={enhancementSettings.preservedAreas}
              onPreservedAreasChange={(areas) =>
                setEnhancementSettings(prev => ({ ...prev, preservedAreas: areas }))
              }
            />

            {/* Get Started Section */}
            <GetStartedSection
              onShowBestPractices={() => setShowBestPractices(true)}
              onShowPricing={() => setShowPricing(true)}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <BestPracticesModal
        isOpen={showBestPractices}
        onClose={() => setShowBestPractices(false)}
      />
      
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </div>
  );
};

export default SkinLogic; 
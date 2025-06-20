import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceSelector = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* AI Image Studio Card */}
          <Card className="bg-gray-900/50 border border-primary/30 backdrop-blur-sm shadow-2xl h-full flex flex-col hover:border-primary transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-10 flex-grow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <ImageIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-montserrat font-bold text-3xl text-white mb-4">AI Image Studio</h3>
              <p className="text-gray-400 mb-8 flex-grow">
                Generate stunning, high-quality marketing and product images in seconds with our intuitive, self-service SaaS platform.
              </p>
              <Button onClick={() => navigate('/image-studio')} className="w-full mt-auto bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-lg group">
                Explore The Studio
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Skin Enhancement Studio Card */}
          <Card className="bg-gray-900/50 border border-primary/30 backdrop-blur-sm shadow-2xl h-full flex flex-col hover:border-primary transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-10 flex-grow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-montserrat font-bold text-3xl text-white mb-4">Skin Studio</h3>
              <p className="text-gray-400 mb-8 flex-grow">
                Enhance skin quality in product photos and promotional materials with our AI-powered retouching that preserves natural features.
              </p>
              <Button onClick={() => navigate('/skin-studio')} className="w-full mt-auto bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-lg group">
                Try Skin Enhancement
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Video Ad Service Card */}
          <Card className="bg-gray-900/50 border border-gray-700 backdrop-blur-sm shadow-2xl h-full flex flex-col hover:border-accent transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-10 flex-grow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
                <Video className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-montserrat font-bold text-3xl text-white mb-4">Video Ad Service</h3>
              <p className="text-gray-400 mb-8 flex-grow">
                Collaborate with our expert team to produce bespoke, cinematic AI-powered video ads tailored to your brand's unique story.
              </p>
              <Button onClick={() => navigate('/video-service')} className="w-full mt-auto bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg group">
                Learn About Our Service
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServiceSelector; 
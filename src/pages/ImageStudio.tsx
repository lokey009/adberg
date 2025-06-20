import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check } from 'lucide-react'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom';

const ImageStudioPage = () => {
  const navigate = useNavigate();

  const imageFeatures = [
    { title: 'Image Skin Realism', description: "Generate photorealistic images with incredible detail and natural skin tones. Simply adjust sliders in our intuitive interface to control realism, seeing instant visual previews of the effect. You'll clearly understand how the AI enhances your visuals, building trust in its capabilities." },
    { title: 'Image Upscaler', description: "Enhance the resolution of your visuals without losing quality. Just upload your image, click 'Upscale,' and watch as our user-friendly application transforms it. Understand exactly how your images are transformed with before-and-after comparisons." },
    { title: 'Flux Context in Canvas Mode', description: "Seamlessly integrate and manipulate elements within a flexible canvas. Our drag-and-drop UI allows you to place and adjust objects, offering clear visual feedback for dynamic compositions. Our UI guides you through every creative choice, showing you how elements interact." },
    { title: 'Product to Models', description: "Transform your product shots by placing them on diverse AI-generated models. Upload your product, select a model from our library, and our clear, step-by-step process within the application guides you to effortlessly see your products come to life in new contexts." },
    { title: 'Brand Consistency', description: "Our platform ensures all generated images align with your brand guidelines, colors, and themes. Easily upload your brand kit, and our UI provides visual previews and warnings to maintain a consistent brand identity across all your creations." },
    { title: 'Rapid Prototyping', description: "Quickly generate multiple image variations for A/B testing and campaign optimization. Input your prompt, click 'Generate,' and receive a batch of options in seconds, all within a responsive and clear interface. Understand the impact of each prompt by comparing outputs side-by-side." }
  ];

  const imageExamples = [
      { type: 'image', title: 'Product Shots', src: 'https://placehold.co/600x600/1a1a1a/ffffff?text=Product+Shot', description: 'Clean, professional images of your products on customizable backgrounds.' },
      { type: 'image', title: 'Lifestyle Imagery', src: 'https://placehold.co/600x600/2a2a2a/ffffff?text=Lifestyle+Image', description: 'Show your products in real-world scenarios with AI-generated models and settings.' },
      { type: 'image', title: 'Social Media Graphics', src: 'https://placehold.co/600x600/3a3a3a/ffffff?text=Social+Graphic', description: 'Eye-catching graphics optimized for Instagram, Facebook, and other platforms.' },
      { type: 'image', title: 'Website Banners', src: 'https://placehold.co/600x600/4a4a4a/ffffff?text=Website+Banner', description: 'High-resolution banners for your homepage or promotional campaigns.' },
  ];

  const imagePlans = [
    {
      name: 'Starter',
      price: '$29',
      pricePeriod: '/month',
      description: 'For small businesses, individual creators, and for testing AI image capabilities.',
      features: [
        '500 Image Credits/month',
        'Standard Upscaling',
        'Basic Canvas Mode',
        '24/7 AI Support',
      ],
      cta: 'Choose Starter',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$79',
      pricePeriod: '/month',
      description: 'For growing businesses, active marketers, and frequent content creators.',
      features: [
        '2,000 Image Credits/month',
        'Advanced Upscaling',
        'Flux Context',
        'Product to Models',
        'Skin Realism',
        'Priority AI Support',
        'Brand Kit Integration',
      ],
      cta: 'Choose Pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      pricePeriod: '',
      description: 'For large agencies, e-commerce platforms, and brands with high-volume needs.',
      features: [
        'Unlimited Image Credits',
        'Dedicated Account Manager',
        'API Access',
        'Custom AI Model Training',
        'Advanced Analytics',
        'Premium Support',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="pt-20">
        {/* Page Header */}
        <section className="py-20 text-center bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-montserrat font-bold text-5xl text-white mb-4">AI Image Studio</h1>
            <p className="font-opensans text-xl text-gray-300">
              Unleash your creativity with our intuitive AI image generation tool. Instantly create high-quality, photorealistic marketing and product images tailored to your brand, all within a seamless SaaS application designed for clarity and ease of use.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">Studio Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {imageFeatures.map((feature, index) => (
                <Card key={index} className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-white text-lg mb-2">{feature.title}</h3>
                        <p className="text-gray-400 text-sm">{feature.description}</p>
                        {feature.title === 'Image Skin Realism' && (
                          <Button 
                            onClick={() => navigate('/skin-studio')} 
                            className="mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold px-4 py-2 rounded-xl transition-all duration-300"
                          >
                            Try Skin Studio
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">Content Formats for Every Platform</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
              {imageExamples.map((image, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg overflow-hidden group transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
                  <div className="aspect-square bg-cover bg-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundImage: `url(${image.src})` }}></div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">{image.title}</h3>
                    <p className="text-sm text-gray-400">{image.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-white">Flexible SaaS Plans</h2>
            <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">Choose the plan that best fits your creative volume and feature requirements. All managed easily through your dashboard with full transparency.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {imagePlans.map((plan, index) => (
                <Card key={index} className={`relative h-full flex flex-col transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg rounded-2xl bg-black/50 backdrop-blur-sm border ${plan.popular ? 'ring-2 ring-green-400 border-green-400/50' : 'border-gray-600/60'}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-400 text-black px-4 py-1 font-semibold">Most Popular</Badge>
                  )}
                  <CardHeader className="p-8 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className={`w-6 h-6 ${plan.popular ? 'text-green-400' : 'text-white'}`} />
                    </div>
                    <CardTitle className="font-montserrat text-xl font-bold text-white">{plan.name}</CardTitle>
                    <div className="my-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400">{plan.pricePeriod}</span>
                    </div>
                    <p className="font-opensans text-gray-400 text-sm">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="p-8 flex-grow flex flex-col">
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start">
                          <Check className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="font-opensans text-gray-300">
                            {feature}
                            {feature === 'Skin Realism' && (
                              <Button 
                                onClick={() => navigate('/skin-studio')} 
                                className="ml-2 bg-transparent hover:bg-primary/10 text-primary font-opensans text-xs px-2 py-0 rounded-md transition-all duration-300"
                              >
                                Try Now
                              </Button>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full mt-auto font-semibold py-3 rounded-lg ${plan.popular ? 'bg-green-400 text-black hover:bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      
      {/* Floating Skin Realism Button */}
      <div className="fixed bottom-24 right-6 z-50 animate-bounce-slow">
        <Button 
          onClick={() => navigate('/skin-studio')} 
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold px-6 py-6 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 group shadow-primary/25"
        >
          <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
          <span className="ml-2">Try Skin Realism</span>
        </Button>
      </div>
      
      <Footer />
    </div>
  );
};

export default ImageStudioPage; 
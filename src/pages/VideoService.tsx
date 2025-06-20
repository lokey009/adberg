import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Video, Play, Sparkles, MonitorSmartphone, TabletSmartphone, ArrowLeft, Star, Clock, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useState, useRef, useEffect } from 'react';

const VideoServicePage = () => {

  const videoFeatures = [
    { title: 'Personalized Consultation', description: "Discuss your vision and goals with our specialists through a transparent process. We use a dedicated client portal for clear communication, ensuring you understand your project needs and how our service will deliver, from initial concept to final output." },
    { title: 'Google Veo3 Powered', description: "We leverage Google's cutting-edge Veo3 model to generate cinematic visuals, synchronized dialogue, ambient sound, and music from your prompts, delivering unparalleled quality and realism. Our team expertly crafts prompts to maximize Veo3's capabilities for your specific ad." },
    { title: 'Advanced Creative Control', description: "Our team utilizes Veo3's features like 4K output, accurate lip-syncing, realistic character animation, and scene-level control over camera angles, lighting, and tone. We provide clear communication on capabilities and expected outcomes, showing you how these controls shape your final video." },
    { title: 'Story-Driven Video Creation', description: "Transform text or image prompts into compelling narratives with realistic movement and sound. Our team guides you through the creative process, ensuring prompt adherence and translating your ideas into a powerful video story." },
    { title: 'Unlimited Revisions (Premium)', description: "Iterate on your video ads with simple text instructions, eliminating costly reshoots. We manage the revision process through our collaborative platform, ensuring your vision is perfectly realized with transparent feedback loops." }
  ];

  // AdShowcase Content and Logic
  const [activeFormat, setActiveFormat] = useState("landscape");
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const landscapeAds = [
    { title: 'AI Camera in Action', industry: 'Technology', videoSrc: '/AICamera.mp4', thumbnailBg: 'bg-gradient-to-br from-green-500/20 to-teal-500/20' },
    { title: 'Dynamic Product Showcase', industry: 'E-commerce', videoSrc: '/commercial.mp4', thumbnailBg: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' },
    { title: 'Refreshing Soda Ad', industry: 'Food & Beverage', videoSrc: '/sodaCommercial.mp4', thumbnailBg: 'bg-gradient-to-br from-pink-500/20 to-orange-500/20' }
  ];
  const portraitAds = [
    { title: 'Beauty Brand Showcase', industry: 'Beauty & Cosmetics', videoSrc: '/beauty brand.mov', thumbnailBg: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20' },
  ];
  const ads = activeFormat === "landscape" ? landscapeAds : portraitAds;
  const currentAd = ads[currentAdIndex >= ads.length ? 0 : currentAdIndex];
  
  useEffect(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [currentAd?.videoSrc, activeFormat]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const nextAd = () => setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  const prevAd = () => setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);

  // Pricing Content and Logic
  const shortFormPlans = [
    { name: 'Basic Short Ad', price: 'Starting at $199', duration: '15-30 seconds', timeline: '3-5 business days', description: 'Perfect for social media and quick promotions', features: ['Template-based approach', 'Stock music & voices', '1 revision included', '1080p resolution', 'Commercial license', 'Multiple format outputs'], popular: false, complexity: 'basic' },
    { name: 'Standard Short Ad', price: 'Starting at $349', duration: '15-30 seconds', timeline: '5-7 business days', description: 'Semi-custom with AI voice generation', features: ['Semi-custom approach', 'Custom AI voice generation', '2-3 revisions included', '2K resolution', 'Multiple format outputs', 'Priority support', 'Brand voice training'], popular: true, complexity: 'standard' },
    { name: 'Premium Short Ad', price: 'Starting at $599', duration: '15-30 seconds', timeline: '7-10 business days', description: 'Fully custom creation with unlimited revisions', features: ['Fully custom creation', 'Multiple voice options', 'Unlimited revisions', '4K resolution', 'Rush delivery available', 'Dedicated project manager', 'Extended usage rights', 'A/B testing variants'], popular: false, complexity: 'premium' }
  ];
  const longFormPlans = [
      // ... similar structure for long form ads
  ];
  const scrollToContact = () => document.querySelector('/contact')?.scrollIntoView({ behavior: 'smooth' });

  const PlanCard = ({ plan, index }: { plan: any, index: number }) => {
    const Icon = plan.complexity === 'basic' ? Clock : plan.complexity === 'standard' ? Video : Star;
    const iconColor = plan.complexity === 'basic' ? 'text-blue-400' : plan.complexity === 'standard' ? 'text-primary' : 'text-yellow-400';
    return (
        <Card className={`relative h-full transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg rounded-2xl bg-black/50 backdrop-blur-sm border ${plan.popular ? 'ring-2 ring-primary scale-105 border-primary/50' : 'border-gray-600/60'}`}>
        {plan.popular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-opensans font-semibold">Most Popular</div>}
        <CardContent className="p-8">
            <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4"><div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center`}><Icon className={`w-6 h-6 ${iconColor}`} /></div></div>
            <h3 className="font-montserrat font-bold text-xl text-white mb-2">{plan.name}</h3>
            <p className="font-opensans text-gray-400 text-sm mb-4">{plan.description}</p>
            <div className="mb-4"><div className="flex items-center justify-center gap-3 mb-2"><span className="font-montserrat font-bold text-3xl text-white">{plan.price}</span></div><p className="text-gray-400 text-sm">Final price determined after consultation</p></div>
            <div className="flex items-center justify-center gap-4 mb-6"><Badge variant="outline" className="text-xs">{plan.duration}</Badge><Badge variant="outline" className="text-xs">{plan.timeline}</Badge></div>
            </div>
            <ul className="space-y-4 mb-8">
            {plan.features.map((feature: string, featureIndex: number) => (<li key={featureIndex} className="flex items-start"><CheckCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" /><span className="font-opensans text-gray-300">{feature}</span></li>))}
            </ul>
            <Button onClick={scrollToContact} className={`w-full py-3 rounded-2xl font-opensans font-semibold transition-all duration-200 ${plan.popular ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white' : 'bg-gray-700/50 hover:bg-gray-600/50 text-white border-2 border-gray-600'}`}><MessageSquare className="w-4 h-4 mr-2" />Request Free Consultation</Button>
        </CardContent>
        </Card>
    )
  };


  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="pt-20">
        {/* Page Header */}
        <section className="py-20 text-center bg-gray-900/50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="w-20 h-20 bg-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6"><Video className="w-10 h-10 text-accent" /></div>
                <h1 className="font-montserrat font-bold text-5xl text-white mb-4">Bespoke AI Video Ad Production</h1>
                <p className="font-opensans text-xl text-gray-300">For cinematic quality and tailored storytelling, our expert team collaborates with you to produce bespoke video ads using state-of-the-art AI. This service offers a personalized touch, ensuring your unique vision is realized through a transparent and trustworthy process.</p>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">Our Video Service Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videoFeatures.map((feature, index) => (
                    <Card key={index} className="bg-gray-900/50 border-gray-800"><CardContent className="p-6"><div className="flex items-start gap-4"><CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" /><div><h3 className="font-semibold text-white text-lg mb-2">{feature.title}</h3><p className="text-gray-400 text-sm">{feature.description}</p></div></div></CardContent></Card>
                ))}
            </div>
          </div>
        </section>

        {/* Video Examples Section */}
        <section className="py-20 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">Video Ad Showcase</h2>
            <Tabs defaultValue="landscape" onValueChange={setActiveFormat} className="w-full">
                <div className="flex justify-center mb-8"><TabsList className="bg-black/50 backdrop-blur-sm border border-gray-600/60 p-1"><TabsTrigger value="landscape" className="px-8 py-3 data-[state=active]:bg-accent/20 data-[state=active]:text-accent"><MonitorSmartphone className="w-5 h-5 mr-2" />Landscape</TabsTrigger><TabsTrigger value="portrait" className="px-8 py-3 data-[state=active]:bg-accent/20 data-[state=active]:text-accent"><TabletSmartphone className="w-5 h-5 mr-2" />Portrait</TabsTrigger></TabsList></div>
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-1 flex lg:flex-col gap-4 justify-center order-2 lg:order-1">{ads.map((ad, index) => (<div key={`${activeFormat}-${index}`} onClick={() => setCurrentAdIndex(index)} className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${currentAdIndex === index ? 'border-2 border-accent shadow-lg shadow-accent/20 scale-105' : 'border border-gray-600/60 opacity-70 hover:opacity-100'} ${activeFormat === "portrait" ? 'lg:w-24 lg:mx-auto' : 'lg:w-full'} ${ad.thumbnailBg} relative aspect-${activeFormat === "landscape" ? "video" : "[9/16]"}`}><video src={ad.videoSrc} className="w-full h-full object-cover" muted preload="metadata" playsInline /></div>))}</div>
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        <div className="bg-black/70 backdrop-blur-sm border border-gray-600/60 rounded-2xl p-4">
                            <div className={`${currentAd?.thumbnailBg || 'bg-gray-800'} aspect-${activeFormat === "landscape" ? "video" : "[9/16]"} rounded-lg flex items-center justify-center relative overflow-hidden group`}>
                                <video ref={videoRef} key={currentAd.videoSrc} src={currentAd.videoSrc} controls className="w-full h-full rounded-lg" preload="metadata" loop onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
                                <Badge className="absolute top-4 right-4 bg-accent/80 hover:bg-accent text-white z-20"><Sparkles className="w-3 h-3 mr-1" /> Generated by AI</Badge>
                                {!isPlaying && <button onClick={handlePlayPause} className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50" aria-label="Play video"><Play className="w-16 h-16 text-white/80 group-hover:text-white" /></button>}
                            </div>
                        </div>
                        <div className="flex justify-between mt-4"><Button onClick={prevAd} variant="outline" size="icon" className="..."><ArrowLeft/></Button><Button onClick={nextAd} variant="outline" size="icon" className="..."><ArrowRight/></Button></div>
                    </div>
                    <div className="lg:col-span-1 order-3">{currentAd && <div className="bg-black/50 p-6 rounded-2xl"><h3 className="text-xl font-semibold text-white">{currentAd.title}</h3><p className="text-gray-300">{currentAd.industry}</p></div>}</div>
                </div>
            </Tabs>
            </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-white">Consultation-Based Pricing</h2>
            <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">Every project begins with a free consultation to ensure a personalized approach and transparent pricing.</p>
            <Tabs defaultValue="short" className="w-full">
                <div className="flex justify-center mb-8"><TabsList><TabsTrigger value="short">Short-Form Ads (15-30s)</TabsTrigger><TabsTrigger value="long" disabled>Long-Form Ads (60-90s)</TabsTrigger></TabsList></div>
                <TabsContent value="short"><div className="grid md:grid-cols-3 gap-8">{shortFormPlans.map((plan, index) => (<PlanCard key={index} plan={plan} index={index} />))}</div></TabsContent>
            </Tabs>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default VideoServicePage; 
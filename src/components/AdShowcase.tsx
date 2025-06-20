import { useState, useRef, useEffect } from 'react';
import { Play, Pause, TabletSmartphone, MonitorSmartphone, ArrowRight, ArrowLeft, Sparkles, Image as ImageIcon, Video } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AdShowcase = () => {
  const [activeFormat, setActiveFormat] = useState("landscape");
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const content = {
    landscape: [
      { type: 'video', title: 'AI Camera in Action', industry: 'Technology', src: '/AICamera.mp4' },
      { type: 'video', title: 'Dynamic Product Showcase', industry: 'E-commerce', src: '/commercial.mp4' },
      { type: 'video', title: 'Refreshing Soda Ad', industry: 'Food & Beverage', src: '/sodaCommercial.mp4' },
    ],
    portrait: [
        { type: 'video', title: 'Beauty Brand Showcase', industry: 'Beauty & Cosmetics', src: '/beauty brand.mov' },
        { type: 'video', title: 'Disneyland Portrait', industry: 'Entertainment', src: '/Disneyland.mp4' },
    ],
    images: [
      { type: 'image', title: 'Product Shots', src: 'https://placehold.co/600x600/1a1a1a/ffffff?text=Product+Shot', description: 'Clean, professional images of your products on customizable backgrounds.' },
      { type: 'image', title: 'Lifestyle Imagery', src: 'https://placehold.co/600x600/2a2a2a/ffffff?text=Lifestyle+Image', description: 'Show your products in real-world scenarios with AI-generated models and settings.' },
      { type: 'image', title: 'Social Media Graphics', src: 'https://placehold.co/600x600/3a3a3a/ffffff?text=Social+Graphic', description: 'Eye-catching graphics optimized for Instagram, Facebook, and other platforms.' },
      { type: 'image', title: 'Website Banners', src: 'https://placehold.co/600x600/4a4a4a/ffffff?text=Website+Banner', description: 'High-resolution banners for your homepage or promotional campaigns.' },
    ]
  };
  
  const [activeTab, setActiveTab] = useState('video');
  const [activeVideoFormat, setActiveVideoFormat] = useState('landscape');

  const currentVideoAds = activeVideoFormat === 'landscape' ? content.landscape : content.portrait;

  const landscapeAds = [
    {
      title: "AI Camera in Action",
      description: "Demonstrating advanced AI camera technology.",
      industry: "Technology",
      videoSrc: "/AICamera.mp4",
      thumbnailBg: "bg-gradient-to-br from-green-500/20 to-teal-500/20"
    },
    {
      title: "Dynamic Product Showcase",
      description: "Engaging commercial highlighting product features.",
      industry: "E-commerce",
      videoSrc: "/commercial.mp4",
      thumbnailBg: "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
    },
    {
      title: "Refreshing Soda Ad",
      description: "Vibrant and catchy soda commercial.",
      industry: "Food & Beverage",
      videoSrc: "/sodaCommercial.mp4", 
      thumbnailBg: "bg-gradient-to-br from-pink-500/20 to-orange-500/20"
    }
  ];

  const portraitAds = [
    {
      title: "Beauty Brand Showcase",
      description: "Elegant beauty product demonstration with stunning visuals.",
      industry: "Beauty & Cosmetics",
      videoSrc: "/beauty brand.mov",
      thumbnailBg: "bg-gradient-to-br from-pink-500/20 to-rose-500/20"
    },
    {
      title: "Product Launch Vertical",
      description: "Placeholder for new product announcement.",
      industry: "Consumer Goods",
      videoSrc: undefined,
      thumbnailBg: "bg-gradient-to-br from-indigo-500/20 to-cyan-500/20"
    },
    {
      title: "Mobile App Promo Vertical",
      description: "Placeholder for app store ad format.",
      industry: "Gaming/Apps",
      videoSrc: undefined,
      thumbnailBg: "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20"
    }
  ];

  const ads = activeFormat === "landscape" ? landscapeAds : portraitAds;
  const currentAd = ads[currentAdIndex >= ads.length ? 0 : currentAdIndex];

  useEffect(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [currentAd?.videoSrc]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTabChange = (newFormat: string) => {
    setActiveFormat(newFormat);
    setCurrentAdIndex(0);
    setIsPlaying(false);
  };

  const nextAd = () => {
    setCurrentAdIndex((prev) => {
      const newIndex = (prev + 1) % ads.length;
      setIsPlaying(false);
      return newIndex;
    });
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => {
      const newIndex = (prev - 1 + ads.length) % ads.length;
      setIsPlaying(false);
      return newIndex;
    });
  };

  if (!ads || ads.length === 0) {
    return <section id="ad-showcase" className="py-20 bg-black"><p className="text-white text-center">Loading ads...</p></section>;
  }

  return (
    <section id="ad-showcase" className="py-20 bg-black relative overflow-hidden" role="main">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-5rem] left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/60"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-4">
            CONTENT FORMATS FOR EVERY PLATFORM: Designed for Seamless Creation
          </h2>
          <p className="font-opensans text-xl text-gray-300 max-w-3xl mx-auto">
            Our intuitive platform allows you to create stunning images and dynamic videos optimized for any screen size or platform—all from a single AI studio, with a modern UI/UX that makes content adaptation effortless and clear. You'll always understand the optimal format for your needs, with visual guides and previews built into the application.
          </p>
        </div>

        <Tabs defaultValue="video" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video">
              <Video className="w-5 h-5 mr-2" /> Video Formats
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="w-5 h-5 mr-2" /> Image Formats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="video">
            <div className="text-center mt-8">
                <Tabs defaultValue="landscape" onValueChange={setActiveVideoFormat} className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="bg-black/50 backdrop-blur-sm border border-gray-600/60 p-1">
                            <TabsTrigger value="landscape" className="px-8 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><MonitorSmartphone className="w-5 h-5 mr-2" />Landscape</TabsTrigger>
                            <TabsTrigger value="portrait" className="px-8 py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><TabletSmartphone className="w-5 h-5 mr-2" />Portrait</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="grid lg:grid-cols-5 gap-8 items-center">
                        <div className="lg:col-span-1 flex lg:flex-col gap-4 justify-center order-2 lg:order-1">
                            {ads.map((ad, index) => (
                                <div 
                                    key={`${activeFormat}-${index}-${ad.title}`}
                                    onClick={() => setCurrentAdIndex(index)}
                                    className={`
                                        cursor-pointer rounded-xl overflow-hidden transition-[transform,border-color,opacity] duration-300
                                        ${currentAdIndex === index 
                                            ? 'border-2 border-primary shadow-lg shadow-primary/20 scale-105'
                                            : 'border border-gray-600/60 opacity-70 hover:opacity-100'}
                                        ${activeFormat === "portrait" ? 'lg:w-24 lg:mx-auto' : 'lg:w-full'}
                                        ${ad.thumbnailBg}
                                        relative
                                        aspect-${activeFormat === "landscape" ? "video" : "[9/16]"}
                                    `}
                                >
                                    {ad.videoSrc ? (
                                        <video
                                            src={ad.videoSrc}
                                            className="w-full h-full object-cover"
                                            muted
                                            preload="metadata"
                                            playsInline
                                            disablePictureInPicture
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Play className={`w-10 h-10 ${currentAdIndex === index ? 'text-primary' : 'text-white/50'}`} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className="lg:col-span-3 order-1 lg:order-2">
                            <TabsContent value="landscape" className="mt-0">
                                <div className="bg-black/70 backdrop-blur-sm border border-gray-600/60 rounded-2xl p-4">
                                    <div className={`${currentAd?.thumbnailBg || 'bg-gray-800'} aspect-video rounded-lg flex items-center justify-center relative overflow-hidden group`}>
                                        {currentAd?.videoSrc ? (
                                            <>
                                                <video 
                                                    ref={videoRef}
                                                    key={currentAd.videoSrc} 
                                                    src={currentAd.videoSrc} 
                                                    controls 
                                                    className="w-full h-full rounded-lg"
                                                    preload="metadata"
                                                    loop
                                                    onPlay={() => setIsPlaying(true)}
                                                    onPause={() => setIsPlaying(false)}
                                                    onEnded={() => setIsPlaying(false)}
                                                />
                                                <Badge className="absolute top-4 right-4 bg-primary/80 hover:bg-primary text-white z-20 flex items-center gap-1 px-3 py-1 rounded-full shadow-lg">
                                                    <Sparkles className="w-3 h-3" /> Generated by our AI Experts
                                                </Badge>
                                                {!isPlaying && (
                                                    <button 
                                                        onClick={handlePlayPause}
                                                        className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300 z-10 cursor-pointer"
                                                        aria-label="Play video"
                                                    >
                                                        <Play className="w-16 h-16 text-white/80 group-hover:text-white transform group-hover:scale-110 transition-transform duration-300" />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                                                <div className="relative z-10 bg-black/50 backdrop-blur-sm border border-primary/30 rounded-full p-4 shadow-lg">
                                                    <Play className="w-12 h-12 text-primary" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="portrait" className="mt-0">
                                <div className="bg-black/70 backdrop-blur-sm border border-gray-600/60 rounded-2xl p-4 max-w-[400px] mx-auto">
                                    <div className={`${currentAd?.thumbnailBg || 'bg-gray-800'} aspect-[9/16] rounded-lg flex items-center justify-center relative overflow-hidden group`}>
                                        {currentAd?.videoSrc ? (
                                            <>
                                                <video 
                                                    ref={videoRef}
                                                    key={currentAd.videoSrc + '-portrait'} 
                                                    src={currentAd.videoSrc} 
                                                    controls 
                                                    className="w-full h-full rounded-lg"
                                                    preload="metadata"
                                                    loop
                                                    onPlay={() => setIsPlaying(true)}
                                                    onPause={() => setIsPlaying(false)}
                                                    onEnded={() => setIsPlaying(false)}
                                                />
                                                <Badge className="absolute top-4 right-4 bg-primary/80 hover:bg-primary text-white z-20 flex items-center gap-1 px-3 py-1 rounded-full shadow-lg">
                                                    <Sparkles className="w-3 h-3" /> Generated by our AI Experts
                                                </Badge>
                                                {!isPlaying && (
                                                    <button 
                                                        onClick={handlePlayPause}
                                                        className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300 z-10 cursor-pointer"
                                                        aria-label="Play video"
                                                    >
                                                        <Play className="w-16 h-16 text-white/80 group-hover:text-white transform group-hover:scale-110 transition-transform duration-300" />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                                                <div className="relative z-10 bg-black/50 backdrop-blur-sm border border-primary/30 rounded-full p-4 shadow-lg">
                                                    <Play className="w-12 h-12 text-primary" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <div className="flex justify-between mt-4">
                                <Button onClick={prevAd} variant="outline" className="bg-black/50 text-white border border-gray-600/60 hover:bg-primary/20 hover:text-primary rounded-full p-3" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                                <Button onClick={nextAd} variant="outline" className="bg-black/50 text-white border border-gray-600/60 hover:bg-primary/20 hover:text-primary rounded-full p-3" size="icon"><ArrowRight className="w-5 h-5" /></Button>
                            </div>
                        </div>
                        
                        <div className="lg:col-span-1 order-3">
                            {currentAd && (
                                <div className="bg-black/50 backdrop-blur-sm border border-gray-600/60 rounded-2xl p-6">
                                    <h3 className="font-montserrat font-semibold text-xl text-white mb-3">{currentAd.title}</h3>
                                    <p className="font-opensans text-gray-300 mb-4">{currentAd.description}</p>
                                    <div className="flex items-center">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider mr-2">Industry:</span>
                                        <span className="text-sm text-primary">{currentAd.industry}</span>
                                    </div>
                                    <div className="mt-6">
                                        <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl">Create Similar Ad</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="images">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
              {content.images.map((image, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg overflow-hidden group transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
                  <div className="aspect-square bg-cover bg-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundImage: `url(${image.src})` }}></div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">{image.title}</h3>
                    <p className="text-sm text-gray-400">{image.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-800/40 p-6 rounded-lg">
                <h3 className="font-semibold text-lg text-primary mb-2">Social Media Content</h3>
                <p className="text-gray-400 text-sm">Optimized for Instagram, TikTok, Facebook, LinkedIn, and more (images & videos), ensuring your content looks perfect on every feed, with clear guidance from our UI and platform-specific templates.</p>
            </div>
            <div className="bg-gray-800/40 p-6 rounded-lg">
                <h3 className="font-semibold text-lg text-primary mb-2">Web & Display Visuals</h3>
                <p className="text-gray-400 text-sm">Perfect for websites, landing pages, and display networks (images & videos), designed to capture attention and drive conversions, with easy export options and recommended dimensions.</p>
            </div>
            <div className="bg-gray-800/40 p-6 rounded-lg">
                <h3 className="font-semibold text-lg text-primary mb-2">Custom Formats</h3>
                <p className="text-gray-400 text-sm">Tailor dimensions, aspect ratios, and content to your specific needs (images & videos), with easy-to-use controls and real-time visual previews in our application, so you see exactly what you're creating.</p>
            </div>
        </div>
      </div>
    </section>
  );
};

export default AdShowcase; 
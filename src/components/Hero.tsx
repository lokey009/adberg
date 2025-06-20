import { useState, useRef, useEffect } from 'react';
import { Play, Pause, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Hero = () => {
  const [heroVideoIsPlaying, setHeroVideoIsPlaying] = useState(true);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroPlayPause = () => {
    if (heroVideoRef.current) {
      if (heroVideoIsPlaying) {
        heroVideoRef.current.pause();
      } else {
        heroVideoRef.current.play();
      }
    }
  };
  
  useEffect(() => {
    const videoElement = heroVideoRef.current;
    // Attempt to autoplay when component mounts
    if (videoElement) {
      const playPromise = videoElement.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Auto-play prevented:', error);
          setHeroVideoIsPlaying(false);
        });
      }
    }
    
    // Add scroll event listener to check if hero section is in viewport
    const handleScroll = () => {
      if (sectionRef.current && videoElement) {
        const rect = sectionRef.current.getBoundingClientRect();
        
        // If the bottom of the hero section is above the viewport (scrolled past it)
        if (rect.bottom <= 0) {
          if (!videoElement.paused) {
            videoElement.pause();
            setHeroVideoIsPlaying(false);
          }
        } else if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          // Hero section is at least partially visible
          if (videoElement.paused && !videoElement.ended) {
            videoElement.play()
              .then(() => setHeroVideoIsPlaying(true))
              .catch(error => console.log('Play error:', error));
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (videoElement) {
        videoElement.pause();
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="pt-32 pb-20 bg-black overflow-hidden relative" role="banner">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/60"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <div className="flex items-center space-x-3 mb-8 animate-slide-in-left">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <span className="font-opensans text-primary text-sm font-semibold uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">AI-Powered Studio</span>
            </div>
            
            <h1 className="font-montserrat font-bold text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              Your AI-Powered Creative Hub: From Stunning Images to
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]" style={{ animationDelay: '0.4s' }}>
                Dynamic Video Ads
              </span>
            </h1>
            
            <p className="font-opensans text-xl text-gray-300 mb-10 leading-relaxed animate-slide-in-left max-w-2xl" style={{ animationDelay: '0.6s' }}>
              We believe every brand deserves authentic human connection through compelling visuals and video—without barriers of cost, time, or complexity. Our intuitive, high-quality AI SaaS platform delivers this faster and more affordably than traditional production, ensuring you always understand the powerful tools at your fingertips through a seamless UI/UX.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mb-12 animate-slide-in-left" style={{ animationDelay: '0.8s' }}>
              <Button 
                onClick={() => scrollToSection('#contact')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold px-10 py-5 rounded-3xl transition-all duration-300 transform hover:scale-105 group shadow-2xl shadow-primary/25 text-lg"
                size="lg"
              >
                Start Generating Images Now
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => scrollToSection('#contact')}
                className="border-2 border-primary/50 text-white hover:bg-primary hover:text-black font-opensans font-semibold px-10 py-5 rounded-3xl transition-all duration-300 bg-transparent backdrop-blur-sm hover:shadow-xl hover:shadow-primary/20 text-lg group"
                size="lg"
              >
                Discuss Custom Video Ads
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="text-center group">
                <div className="font-montserrat font-bold text-3xl md:text-4xl text-white group-hover:text-primary transition-colors duration-300 mb-2">90%</div>
                <div className="font-opensans text-base text-gray-400">Cost Savings</div>
              </div>
              <div className="text-center group">
                <div className="font-montserrat font-bold text-3xl md:text-4xl text-white group-hover:text-primary transition-colors duration-300 mb-2">24h</div>
                <div className="font-opensans text-base text-gray-400">Turnaround</div>
              </div>
              <div className="text-center group">
                <div className="font-montserrat font-bold text-3xl md:text-4xl text-white group-hover:text-primary transition-colors duration-300 mb-2">95%</div>
                <div className="font-opensans text-base text-gray-400">Client Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Video Preview */}
          <div className="animate-slide-in-right">
            <div className="relative bg-gradient-to-br from-primary to-accent rounded-3xl p-2 shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/60 transition-all duration-500 animate-scale-in" style={{ animationDelay: '1.2s' }}>
              <div className="bg-black rounded-[1.5rem] p-3 backdrop-blur-sm aspect-video relative overflow-hidden group">
                <video
                  ref={heroVideoRef}
                  src="/AICamera.mp4"
                  className="w-full h-full rounded-xl object-cover"
                  controls
                  preload="metadata"
                  playsInline
                  muted
                  autoPlay
                  loop
                  onPlay={() => setHeroVideoIsPlaying(true)}
                  onPause={() => setHeroVideoIsPlaying(false)}
                  onEnded={() => setHeroVideoIsPlaying(false)}
                />
                <Badge className="absolute top-4 right-4 bg-primary/80 hover:bg-primary text-white z-20 flex items-center gap-1 px-3 py-1 rounded-full shadow-lg">
                  <Sparkles className="w-3 h-3" /> AI Video Ad Generated by medianode.ai
                </Badge>
                {!heroVideoIsPlaying && (
                  <button 
                    onClick={handleHeroPlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors duration-300 z-10 cursor-pointer rounded-xl"
                    aria-label="Play Hero Video"
                  >
                    <Play className="w-20 h-20 text-white/80 group-hover:text-white transform group-hover:scale-110 transition-transform duration-300" />
                  </button>
                )}
                <div className="absolute top-6 left-6 w-3 h-3 bg-primary rounded-full animate-bounce-subtle opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-8 right-8 w-2 h-2 bg-accent rounded-full animate-bounce-subtle opacity-50 group-hover:opacity-100 transition-opacity" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="mt-6 text-center px-4 space-y-3">
                <p className="font-opensans text-sm text-gray-300">
                  See our AI in action: Studio-quality video, generated in hours.
                </p>
                <button 
                  onClick={() => scrollToSection('#ad-showcase')}
                  className="font-opensans text-sm text-white hover:text-gray-200 transition-colors duration-300 group inline-flex items-center py-1 px-2 rounded-md hover:bg-white/10"
                >
                  Explore Ad Showcase
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import { Upload, Play, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Share Your Brand Purpose',
      description: 'Begin with your values and vision, not just visual assets. We capture your brand\'s essence, voice, and the emotional connection you want to create with your audience.',
    },
    {
      icon: Play,
      title: 'AI Creates Human Connections',
      description: 'Our technology transforms your purpose into authentic storytelling with genuine human actors and emotion-evoking soundtracks designed to foster real connection.',
    },
    {
      icon: ArrowRight,
      title: 'Amplify Your Impact',
      description: 'Review, refine, and publish powerful videos that genuinely connect with your audience. Focus on measuring emotional engagement, not just technical metrics.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-black relative overflow-hidden" role="main">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent"></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/60"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-4 animate-fade-in">
            Purpose-Driven Process
          </h2>
          <p className="font-opensans text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Our approach focuses on why your brand exists and who you want to connect with, not just what your video looks like.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
              <Card className="relative p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border-0 shadow-xl rounded-2xl bg-black/50 backdrop-blur-sm border border-gray-800/30 group overflow-hidden">
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-0 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-primary to-accent text-white rounded-full flex items-center justify-center font-montserrat font-bold text-sm shadow-lg animate-scale-in" style={{ animationDelay: `${index * 0.2 + 0.4}s` }}>
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-primary/20">
                    <step.icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors duration-300" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-montserrat font-semibold text-xl text-white mb-4 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="font-opensans text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Purpose Statement */}
        <div className="mt-16 bg-black/50 backdrop-blur-sm border border-gray-800/30 rounded-2xl p-8 text-center">
          <h3 className="font-montserrat font-bold text-2xl text-white mb-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            It's Not What We Do, It's Why We Do It
          </h3>
          <p className="font-opensans text-lg text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '1s' }}>
            We're creating a world where any brand—regardless of budget or technical expertise—can forge meaningful human connections through authentic video storytelling. Our technology exists to serve this purpose.
          </p>
          
          {/* Process Flow */}
          <div className="inline-flex items-center space-x-4 text-gray-600 animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <p className="font-opensans text-sm text-gray-400 mt-4 animate-fade-in" style={{ animationDelay: '1.4s' }}>
            From purpose to connection in 24-48 hours
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

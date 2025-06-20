import { useState } from 'react';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CaseStudies = () => {
  const [currentStudy, setCurrentStudy] = useState(0);

  const caseStudies = [
    {
      company: 'EcoStyle Fashion',
      industry: 'E-commerce',
      challenge: 'Needed to showcase sustainable fashion line with authentic storytelling',
      solution: 'AI-generated lifestyle videos featuring diverse models in natural settings',
      results: {
        engagement: '+340%',
        conversions: '+89%',
        cost: '-75%',
      },
      quote: "SwiftReel AI helped us create authentic content that resonates with our eco-conscious customers. The quality is indistinguishable from traditional shoots.",
      author: 'Sarah Chen, Marketing Director',
      thumbnail: '🌿',
    },
    {
      company: 'TechFlow SaaS',
      industry: 'Technology',
      challenge: 'Complex product demos were expensive and time-consuming to produce',
      solution: 'AI-powered explainer videos with technical accuracy and engaging visuals',
      results: {
        engagement: '+285%',
        conversions: '+156%',
        cost: '-82%',
      },
      quote: "The AI perfectly captured our technical messaging while making it accessible. Our demo videos now convert 3x better than before.",
      author: 'Marcus Rodriguez, VP Marketing',
      thumbnail: '💻',
    },
    {
      company: 'FitLife Nutrition',
      industry: 'Health & Wellness',
      challenge: 'Needed diverse, motivational content for multiple demographic segments',
      solution: 'Personalized AI videos targeting different fitness goals and demographics',
      results: {
        engagement: '+425%',
        conversions: '+203%',
        cost: '-69%',
      },
      quote: "Creating personalized content for each customer segment was impossible before. Now we have hundreds of targeted videos that perform incredibly well.",
      author: 'Jessica Park, Growth Manager',
      thumbnail: '💪',
    },
  ];

  const nextStudy = () => {
    setCurrentStudy((prev) => (prev + 1) % caseStudies.length);
  };

  const prevStudy = () => {
    setCurrentStudy((prev) => (prev - 1 + caseStudies.length) % caseStudies.length);
  };

  const currentCase = caseStudies[currentStudy];

  return (
    <section id="case-studies" className="py-20 bg-black relative overflow-hidden" role="main">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/60"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-4">
            Real Results, Real Impact
          </h2>
          <p className="font-opensans text-xl text-gray-300 max-w-3xl mx-auto">
            See how businesses across industries are achieving remarkable results with AI-generated video content.
          </p>
        </div>

        {/* Main Case Study Display */}
        <div className="bg-black/50 backdrop-blur-sm border border-gray-800/30 rounded-2xl p-8 mb-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="animate-fade-in">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-4">{currentCase.thumbnail}</div>
                <div>
                  <h3 className="font-montserrat font-bold text-2xl text-white">
                    {currentCase.company}
                  </h3>
                  <p className="font-opensans text-gray-300">{currentCase.industry}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-montserrat font-semibold text-lg text-white mb-2">
                    Challenge
                  </h4>
                  <p className="font-opensans text-gray-300">{currentCase.challenge}</p>
                </div>

                <div>
                  <h4 className="font-montserrat font-semibold text-lg text-white mb-2">
                    Solution
                  </h4>
                  <p className="font-opensans text-gray-300">{currentCase.solution}</p>
                </div>

                <div>
                  <h4 className="font-montserrat font-semibold text-lg text-white mb-4">
                    Results
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-black/70 rounded-2xl border border-gray-800/50">
                      <div className="font-montserrat font-bold text-2xl text-primary">
                        {currentCase.results.engagement}
                      </div>
                      <div className="font-opensans text-sm text-gray-300">Engagement</div>
                    </div>
                    <div className="text-center p-4 bg-black/70 rounded-2xl border border-gray-800/50">
                      <div className="font-montserrat font-bold text-2xl text-accent">
                        {currentCase.results.conversions}
                      </div>
                      <div className="font-opensans text-sm text-gray-300">Conversions</div>
                    </div>
                    <div className="text-center p-4 bg-black/70 rounded-2xl border border-gray-800/50">
                      <div className="font-montserrat font-bold text-2xl text-secondary">
                        {currentCase.results.cost}
                      </div>
                      <div className="font-opensans text-sm text-gray-300">Cost</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Preview & Quote */}
            <div className="animate-slide-in-right">
              <div className="bg-black/70 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 shadow-lg mb-6">
                <div className="aspect-video bg-black/50 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
                  <div className="relative z-10 bg-black/70 border border-primary/30 rounded-full p-4 shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <p className="font-opensans text-sm text-gray-300 text-center">
                  Watch the case study video
                </p>
              </div>

              <div className="bg-black/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-6">
                <blockquote className="font-opensans text-gray-300 italic mb-4">
                  "{currentCase.quote}"
                </blockquote>
                <cite className="font-opensans font-semibold text-primary not-italic">
                  {currentCase.author}
                </cite>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={prevStudy}
            variant="outline"
            className="flex items-center space-x-2 bg-black/50 text-white border-2 border-gray-700 hover:border-primary hover:text-primary rounded-2xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {/* Indicators */}
          <div className="flex space-x-2">
            {caseStudies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStudy(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStudy ? 'bg-primary' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStudy}
            variant="outline"
            className="flex items-center space-x-2 bg-black/50 text-white border-2 border-gray-700 hover:border-primary hover:text-primary rounded-2xl"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="mt-16 bg-black/50 backdrop-blur-sm border border-gray-800/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="font-montserrat font-bold text-2xl text-white mb-2">
              Collective Impact Across All Case Studies
            </h3>
            <p className="font-opensans text-gray-300">
              The power of AI video generation in numbers
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-montserrat font-bold text-3xl text-primary mb-2">350%</div>
              <div className="font-opensans text-sm text-gray-300">Average Engagement Increase</div>
            </div>
            <div>
              <div className="font-montserrat font-bold text-3xl text-primary mb-2">149%</div>
              <div className="font-opensans text-sm text-gray-300">Average Conversion Boost</div>
            </div>
            <div>
              <div className="font-montserrat font-bold text-3xl text-primary mb-2">75%</div>
              <div className="font-opensans text-sm text-gray-300">Average Cost Reduction</div>
            </div>
            <div>
              <div className="font-montserrat font-bold text-3xl text-primary mb-2">24h</div>
              <div className="font-opensans text-sm text-gray-300">Average Turnaround Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;

import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const teamMembers = [
    {
      name: 'Alex Chen',
      role: 'CEO & Co-founder',
      avatar: '👨‍💼',
      background: 'Former VP at Adobe, 15 years in video tech',
    },
    {
      name: 'Sarah Rodriguez',
      role: 'CTO & Co-founder',
      avatar: '👩‍💻',
      background: 'Ex-Google AI researcher, Stanford PhD',
    },
    {
      name: 'Marcus Johnson',
      role: 'Head of AI',
      avatar: '👨‍🔬',
      background: 'Former Tesla AI team, MIT alumnus',
    },
    {
      name: 'Emily Park',
      role: 'Creative Director',
      avatar: '👩‍🎨',
      background: 'Award-winning filmmaker, Disney veteran',
    },
  ];

  const whyAiFirst = [
    {
      title: 'Democratizing Communication',
      description: 'We believe everyone deserves the power to connect emotionally through high-quality video, regardless of budget or resources.',
      icon: '🌍',
    },
    {
      title: 'Breaking Down Barriers',
      description: 'Traditional video production excludes too many voices. Our mission is to change that by making professional storytelling accessible to all.',
      icon: '⚡',
    },
    {
      title: 'Human Connection at Scale',
      description: 'Technology should enhance humanity, not replace it. We use AI to expand human creative potential and foster authentic connections.',
      icon: '🎯',
    },
  ];

  return (
    <section id="about" className="py-20 bg-black relative overflow-hidden" role="main">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/60"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Mission Statement */}
        <div className="text-center mb-20">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-6">
            Our Purpose at medianode.ai
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="font-opensans text-xl text-gray-300 leading-relaxed mb-8">
              <span className="text-primary font-semibold">It's not what we do, it's why we do it.</span> We're on a mission to democratize professional video production because we believe in the power of authentic human connection. 
              We see a world where video's emotional impact is accessible to every brand, not just those with massive budgets and resources.
            </p>
            <div className="bg-black/50 backdrop-blur-sm border border-gray-800/30 rounded-2xl p-8 shadow-lg">
              <h3 className="font-montserrat font-bold text-2xl text-white mb-4">
                Our Vision
              </h3>
              <p className="font-opensans text-lg text-gray-300">
                To make professional video production as accessible as writing an email. We envision a world 
                where every brand, regardless of size, can tell their story through compelling, high-quality video content that creates genuine human connections at scale.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="font-montserrat font-bold text-2xl md:text-3xl text-white mb-4">
              The Passionate Team Behind Our Mission
            </h3>
            <p className="font-opensans text-lg text-gray-300">
              United by a shared belief in technology's power to amplify human creativity and connection
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg rounded-2xl bg-black/50 backdrop-blur-sm border border-gray-800/30">
                  <CardContent className="p-8">
                    <div className="text-6xl mb-4">{member.avatar}</div>
                    <h4 className="font-montserrat font-semibold text-lg text-white mb-2">
                      {member.name}
                    </h4>
                    <p className="font-opensans text-primary font-semibold mb-3">
                      {member.role}
                    </p>
                    <p className="font-opensans text-sm text-gray-400">
                      {member.background}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Why AI-First Section */}
        <div>
          <div className="text-center mb-12">
            <h3 className="font-montserrat font-bold text-2xl md:text-3xl text-white mb-4">
              Our Core Beliefs
            </h3>
            <p className="font-opensans text-lg text-gray-300 max-w-3xl mx-auto">
              We believe AI is not just a tool, but a creative partner that enables more authentic human connection through accessible, high-quality video.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyAiFirst.map((reason, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <Card className="h-full text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg rounded-2xl bg-black/50 backdrop-blur-sm border border-gray-800/30">
                  <CardContent className="p-8">
                    <div className="text-4xl mb-6">{reason.icon}</div>
                    <h4 className="font-montserrat font-semibold text-xl text-white mb-4">
                      {reason.title}
                    </h4>
                    <p className="font-opensans text-gray-300 leading-relaxed">
                      {reason.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Company Stats */}
        <div className="mt-20 bg-black/50 backdrop-blur-sm border border-gray-800/30 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="font-montserrat font-bold text-2xl text-white">
              Our Impact So Far
            </h3>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-montserrat font-bold text-3xl text-primary mb-2">500+</div>
              <div className="font-opensans text-gray-300">Brands Empowered</div>
            </div>
            <div>
              <div className="font-montserrat font-bold text-3xl text-primary mb-2">10K+</div>
              <div className="font-opensans text-gray-300">Stories Told</div>
            </div>
            <div>
              <div className="font-montserrat font-bold text-3xl text-primary mb-2">50+</div>
              <div className="font-opensans text-gray-300">Countries Reached</div>
            </div>
            <div>
              <div className="font-montserrat font-bold text-3xl text-primary mb-2">99%</div>
              <div className="font-opensans text-gray-300">Connection Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

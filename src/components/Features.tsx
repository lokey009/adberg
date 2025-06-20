import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, DollarSign, Sparkles, FileEdit, Brush, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Features = () => {
  const comparisonData = [
    {
      feature: 'Timeline',
      traditional: 'Weeks of planning, production, and post-processing',
      ai: 'Visuals delivered within hours, videos within 24-48 hours, all via our efficient SaaS platform',
    },
    {
      feature: 'Costs',
      traditional: 'High upfront costs for crew, equipment, and locations',
      ai: 'Up to 90% cost reduction with flexible SaaS subscription options',
    },
    {
      feature: 'Revisions',
      traditional: 'Limited revisions without significant additional costs',
      ai: 'Unlimited revisions with simple text prompts, easily managed within our application',
    },
    {
      feature: 'Logistics',
      traditional: 'Scheduling complexities with actors and locations',
      ai: 'No scheduling or logistics to manage, as AI handles the heavy lifting',
    },
    {
      feature: 'Localization',
      traditional: 'New production needed for each language or market',
      ai: 'One-click translation to multiple languages (for video), seamlessly integrated',
    },
    {
      feature: 'Consistency',
      traditional: 'Varies by production team',
      ai: 'AI learns your brand guidelines and applies them consistently across all visuals, ensuring a unified brand identity',
    },
    {
      feature: 'Personalization',
      traditional: 'Limited, manual effort',
      ai: 'AI analyzes preferences for hyper-personalized content, easily generated through our intuitive UI',
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-900" role="main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-4">
            THE AI ADVANTAGE: REVOLUTIONIZING ALL YOUR VISUAL CONTENT WITH A SEAMLESS SAAS EXPERIENCE
          </h2>
          <p className="font-opensans text-xl text-gray-300 max-w-3xl mx-auto">
            Our AI-powered SaaS platform delivers unparalleled quality, speed, and cost-efficiency across all your visual content needs, all within a modern, intuitive interface designed for clarity and trust. You'll immediately understand the power you're harnessing, making complex tasks simple and accessible.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-16 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="font-montserrat p-4 border-b-2 border-gray-700 text-primary">Feature</th>
                <th className="font-montserrat p-4 border-b-2 border-gray-700 text-gray-400">Traditional Production (Images & Videos)</th>
                <th className="font-montserrat p-4 border-b-2 border-gray-700 text-white bg-primary/10 rounded-t-lg">AI-Powered Production (Images & Videos)</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((item, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 font-semibold text-white">{item.feature}</td>
                  <td className="p-4 text-gray-400">{item.traditional}</td>
                  <td className="p-4 text-white bg-primary/5">
                    <span className="text-green-400 font-bold mr-2">✔</span>
                    {item.ai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ROI Section */}
        <div className="mt-16 bg-gray-800/50 backdrop-blur-sm border border-gray-600/60 rounded-2xl p-8 shadow-lg">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-montserrat font-bold text-2xl text-white mb-4">
                PROVEN ROI: Real Results, Measurable Impact Across All Visual Content with Our SaaS Platform
              </h3>
              <p className="font-opensans text-gray-300 mb-6 leading-relaxed">
                Our clients experience an average 3x ROI within the first month of leveraging our AI-generated visual content through our intuitive SaaS platform, seeing clear, measurable impact and understanding their performance through our transparent UI.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="min-w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <span className="font-opensans text-white font-semibold">Produce 10x more content (images & videos)</span>
                    <p className="font-opensans text-gray-300 text-sm">Test multiple concepts and variations at a fraction of traditional costs, all within our efficient application, with clear tracking of your output.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="min-w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <span className="font-opensans text-white font-semibold">Launch campaigns 95% faster (for all visual assets)</span>
                    <p className="font-opensans text-gray-300 text-sm">Respond to market trends and opportunities in hours, not weeks, thanks to our streamlined SaaS workflow and easy content adaptation.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="min-w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <span className="font-opensans text-white font-semibold">Reduce production costs by 90% (across image and video creation)</span>
                    <p className="font-opensans text-gray-300 text-sm">Reallocate budget to media spend and campaign optimization, maximizing your marketing investment with clear cost savings visible.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-6 text-center backdrop-blur-sm border border-primary/20">
                <div className="text-3xl font-bold text-white mb-2">90%</div>
                <div className="text-lg font-semibold text-primary mb-1">Cost Reduction</div>
                <p className="font-opensans text-gray-300 text-sm">
                  vs. traditional production
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-6 text-center backdrop-blur-sm border border-primary/20">
                <div className="text-3xl font-bold text-white mb-2">24h</div>
                <div className="text-lg font-semibold text-primary mb-1">Turnaround</div>
                <p className="font-opensans text-gray-300 text-sm">
                  vs. weeks of waiting (for most content)
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-6 text-center backdrop-blur-sm border border-primary/20">
                <div className="text-3xl font-bold text-white mb-2">10x</div>
                <div className="text-lg font-semibold text-primary mb-1">More Content</div>
                <p className="font-opensans text-gray-300 text-sm">
                  for the same budget
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-6 text-center backdrop-blur-sm border border-primary/20">
                <div className="text-3xl font-bold text-white mb-2">3x</div>
                <div className="text-lg font-semibold text-primary mb-1">ROI Increase</div>
                <p className="font-opensans text-gray-300 text-sm">
                  reported by clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

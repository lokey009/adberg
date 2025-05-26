
import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Pay-per-Video',
      price: isYearly ? '$199' : '$249',
      period: 'per video',
      description: 'Perfect for testing or occasional needs',
      features: [
        '1 professional video ad',
        'Up to 60 seconds duration',
        '4K resolution output',
        'Basic revisions included',
        'Standard turnaround (48h)',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Monthly Retainer',
      price: isYearly ? '$999' : '$1,199',
      period: 'per month',
      description: 'Best for growing businesses',
      features: [
        '5 professional video ads',
        'Up to 90 seconds duration',
        '4K resolution output',
        'Unlimited revisions',
        'Priority turnaround (24h)',
        'Dedicated account manager',
        'Brand voice training',
        'Multi-platform optimization',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For agencies and large teams',
      features: [
        'Unlimited video creation',
        'Custom duration limits',
        '4K + HDR output',
        'White-label solution',
        'Same-day turnaround',
        'Dedicated support team',
        'Advanced brand training',
        'API access',
        'Custom integrations',
      ],
      popular: false,
    },
  ];

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="py-20 bg-black" role="main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="font-opensans text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your video production needs. All plans include our core AI technology.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`font-opensans ${!isYearly ? 'text-white font-semibold' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                isYearly ? 'bg-primary' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                  isYearly ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-opensans ${isYearly ? 'text-white font-semibold' : 'text-gray-400'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-opensans font-semibold">
                Save 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <Card className={`relative h-full transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 ${
                plan.popular ? 'ring-2 ring-primary scale-105' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-opensans font-semibold">
                    Most Popular
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="font-montserrat font-bold text-xl text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="font-opensans text-gray-400 text-sm mb-4">
                      {plan.description}
                    </p>
                    <div className="mb-4">
                      <span className="font-montserrat font-bold text-3xl text-white">
                        {plan.price}
                      </span>
                      <span className="font-opensans text-gray-400 ml-2">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                        <span className="font-opensans text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={scrollToContact}
                    className={`w-full py-3 rounded-2xl font-opensans font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-primary hover:bg-primary/90 text-white'
                        : 'bg-gray-700/50 hover:bg-gray-600/50 text-white border-2 border-gray-600'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 shadow-lg">
          <h3 className="font-montserrat font-bold text-2xl text-white text-center mb-8">
            Feature Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left font-opensans font-semibold text-gray-300 py-4">Feature</th>
                  <th className="text-center font-opensans font-semibold text-gray-300 py-4">Pay-per-Video</th>
                  <th className="text-center font-opensans font-semibold text-gray-300 py-4">Monthly</th>
                  <th className="text-center font-opensans font-semibold text-gray-300 py-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Video Quality', '4K', '4K', '4K + HDR'],
                  ['Turnaround Time', '48 hours', '24 hours', 'Same day'],
                  ['Revisions', 'Basic', 'Unlimited', 'Unlimited'],
                  ['Support', 'Email', 'Account Manager', 'Dedicated Team'],
                  ['API Access', '✗', '✗', '✓'],
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="font-opensans text-gray-300 py-4">{row[0]}</td>
                    <td className="text-center font-opensans text-gray-400 py-4">{row[1]}</td>
                    <td className="text-center font-opensans text-gray-400 py-4">{row[2]}</td>
                    <td className="text-center font-opensans text-gray-400 py-4">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

import React, { useState } from 'react';
import { Check, ArrowRight, Image as ImageIcon, Video, Star, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const EnhancedPricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const navigate = useNavigate();

  const imagePlans = [
    { name: 'Starter', monthlyPrice: '$29', annualPrice: '$23', description: 'Perfect for individuals and small projects getting started with AI.', features: ['500 Image Credits/month', 'Standard Upscaling', 'Basic Canvas Mode', '24/7 AI Support'], cta: 'Choose Starter', popular: false },
    { name: 'Pro', monthlyPrice: '$79', annualPrice: '$63', description: 'For growing businesses and professionals who need more power.', features: ['2,000 Image Credits/month', 'Advanced Upscaling', 'Flux Context & Product Models', 'Skin Realism Controls', 'Priority AI Support', 'Brand Kit Integration'], cta: 'Choose Pro', popular: true },
    { name: 'Enterprise', monthlyPrice: 'Custom', annualPrice: 'Custom', description: 'For large organizations with high-volume and custom needs.', features: ['Unlimited Image Credits', 'Dedicated Account Manager', 'API Access', 'Custom AI Model Training', 'Advanced Analytics', 'Premium Support'], cta: 'Contact Sales', popular: false },
  ];

  const videoPlans = [
    { name: 'Basic Short Ad', price: 'Starting at $199', duration: '15-30s', timeline: '3-5 days', description: 'Template-based ads for quick social media promotions.', features: ['Stock music & voices', '1 revision included', '1080p resolution', 'Commercial license'], cta: 'Request Consultation', popular: false, complexity: 'basic' },
    { name: 'Standard Short Ad', price: 'Starting at $349', duration: '15-30s', timeline: '5-7 days', description: 'Semi-custom ads with AI voice generation for branding.', features: ['Custom AI voice generation', '2-3 revisions included', '2K resolution', 'Priority support', 'Brand voice training'], cta: 'Request Consultation', popular: true, complexity: 'standard' },
    { name: 'Premium Short Ad', price: 'Starting at $599', duration: '15-30s', timeline: '7-10 days', description: 'Fully custom ads with unlimited revisions for high impact.', features: ['Multiple voice options', 'Unlimited revisions', '4K resolution', 'Dedicated project manager', 'A/B testing variants'], cta: 'Request Consultation', popular: false, complexity: 'premium' },
  ];

  const FeatureListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
      <Check className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
      <span className="font-opensans text-gray-300">{children}</span>
    </li>
  );

  return (
    <section id="pricing" className="py-20 bg-black relative overflow-hidden" role="main">
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/60"></div>
        </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-4">
            TRANSPARENT PRICING: FLEXIBLE PLANS FOR EVERY CREATIVE NEED
          </h2>
          <p className="font-opensans text-lg text-gray-300 max-w-4xl mx-auto">
            At medianode.ai, we offer clear, flexible pricing designed to fit your unique visual content needs. Our intuitive UI/UX ensures you always understand your plan and what you're getting, building trust and confidence in our SaaS application.
          </p>
        </div>

        <Tabs defaultValue="image-studio" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 p-2 h-auto">
              <TabsTrigger value="image-studio" className="px-6 py-3 text-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <ImageIcon className="w-5 h-5 mr-2" /> AI Image Studio
              </TabsTrigger>
              <TabsTrigger value="video-service" className="px-6 py-3 text-lg data-[state=active]:bg-accent data-[state=active]:text-white">
                <Video className="w-5 h-5 mr-2" /> Video Ad Service
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="image-studio">
            <div className="flex items-center justify-center space-x-4 mb-10">
              <Label htmlFor="billing-cycle" className={`font-opensans text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>Monthly</Label>
              <Switch id="billing-cycle" checked={billingCycle === 'annually'} onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')} className="data-[state=checked]:bg-primary"/>
              <Label htmlFor="billing-cycle" className={`font-opensans text-lg ${billingCycle === 'annually' ? 'text-white' : 'text-gray-400'}`}>
                Annually <Badge className="ml-2 bg-green-500/20 text-green-300 border border-green-500/30">Save 20%</Badge>
              </Label>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {imagePlans.map((plan, index) => {
                const price = billingCycle === 'annually' ? plan.annualPrice : plan.monthlyPrice;
                return (
                  <Card key={index} className={`relative h-full flex flex-col transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg rounded-2xl bg-black/50 backdrop-blur-sm border ${plan.popular ? 'ring-2 ring-primary border-primary/50' : 'border-gray-600/60'}`}>
                    {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 font-semibold">Most Popular</Badge>}
                    <CardHeader className="p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4 border border-gray-700"><ImageIcon className="w-8 h-8 text-primary" /></div>
                      <CardTitle className="font-montserrat text-2xl font-bold text-white">{plan.name}</CardTitle>
                      <div className="my-4">
                        <span className="text-5xl font-bold text-white">{price}</span>
                        <span className="text-gray-400">/month</span>
                      </div>
                      <p className="font-opensans text-gray-400 text-sm h-10">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="p-8 flex-grow flex flex-col">
                      <ul className="space-y-4 mb-8 flex-grow">
                        {plan.features.map((feature: string, i: number) => <FeatureListItem key={i}>{feature}</FeatureListItem>)}
                      </ul>
                      <Button onClick={() => navigate('/auth')} className={`w-full mt-auto font-semibold py-3 rounded-lg text-lg ${plan.popular ? 'bg-gradient-to-r from-primary to-accent text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        {plan.cta} <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="video-service">
            <div>
              <div className="text-center mt-10 mb-10">
                  <p className="text-lg text-gray-400">Our video ads are a bespoke service. Pricing is determined after a free consultation to understand your needs.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {videoPlans.map((plan, index) => {
                    const Icon = plan.complexity === 'basic' ? Clock : plan.complexity === 'standard' ? Star : Video;
                    const iconColor = plan.complexity === 'basic' ? 'text-blue-400' : plan.complexity === 'standard' ? 'text-yellow-400' : 'text-accent';
                    return (
                      <Card key={index} className={`relative h-full flex flex-col transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg rounded-2xl bg-black/50 backdrop-blur-sm border ${plan.popular ? 'ring-2 ring-accent border-accent/50' : 'border-gray-600/60'}`}>
                        {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 font-semibold">Most Popular</Badge>}
                        <CardHeader className="p-8 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4 border border-gray-700"><Icon className={`w-8 h-8 ${iconColor}`} /></div>
                          <CardTitle className="font-montserrat text-2xl font-bold text-white">{plan.name}</CardTitle>
                          <div className="my-4">
                            <span className="text-2xl font-bold text-white">{plan.price}</span>
                          </div>
                          <p className="font-opensans text-gray-400 text-sm h-10">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="p-8 flex-grow flex flex-col">
                          <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                              <Badge variant="outline" className="border-gray-600">{plan.duration}</Badge>
                              <Badge variant="outline" className="border-gray-600">{plan.timeline}</Badge>
                          </div>
                          <ul className="space-y-4 mb-8 flex-grow">
                            {plan.features.map((feature: string, i: number) => <FeatureListItem key={i}>{feature}</FeatureListItem>)}
                          </ul>
                          <Button onClick={() => navigate('/contact')} className={`w-full mt-auto font-semibold py-3 rounded-lg text-lg ${plan.popular ? 'bg-accent text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            <MessageSquare className="w-5 h-5 mr-2" /> {plan.cta}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                })}
              </div>
              
              {/* Process Steps */}
              <div className="mt-20 bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20 rounded-2xl p-8 shadow-lg">
                <h3 className="font-montserrat font-bold text-2xl text-white text-center mb-8">
                  Our Consultation Process
                </h3>
                <div className="grid md:grid-cols-4 gap-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-white font-bold text-xl">1</span></div>
                    <h4 className="font-semibold text-white mb-2">Free Consultation</h4>
                    <p className="text-gray-400 text-sm">Discuss your project needs and creative vision with our experts.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-white font-bold text-xl">2</span></div>
                    <h4 className="font-semibold text-white mb-2">Custom Quote</h4>
                    <p className="text-gray-400 text-sm">Receive detailed pricing and a clear project roadmap.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-white font-bold text-xl">3</span></div>
                    <h4 className="font-semibold text-white mb-2">50% Deposit</h4>
                    <p className="text-gray-400 text-sm">Begin production with a transparent upfront payment.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-white font-bold text-xl">4</span></div>
                    <h4 className="font-semibold text-white mb-2">Final Payment</h4>
                    <p className="text-gray-400 text-sm">Pay the remaining 50% upon completion and receive your files.</p>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-20 text-center">
                <h3 className="font-montserrat font-bold text-2xl text-white mb-4">
                  Ready to Create Your Video Ad?
                </h3>
                <p className="font-opensans text-gray-300 mb-8 max-w-2xl mx-auto">
                  Every project begins with a free 30-minute consultation. We'll discuss your vision, provide expert guidance, and create a custom quote tailored to your needs.
                </p>
                <Button
                  onClick={() => navigate('/contact')}
                  className="bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-600 text-white font-opensans font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Schedule Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

export default EnhancedPricing;
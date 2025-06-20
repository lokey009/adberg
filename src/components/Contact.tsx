import { useState } from 'react';
import { MessageCircle, Video, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createConsultation, CreateConsultationData } from '@/lib/consultationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Contact = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Omit<CreateConsultationData, 'source'>;

    try {
      const { error } = await createConsultation({ ...data, source: 'homepage' });

      if (error) {
        toast.error("Error submitting consultation request", { description: error });
      } else {
        toast.success("Consultation request submitted successfully!", {
          description: "We'll review your requirements and get back to you within 24 hours.",
        });
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      toast.error("An unexpected error occurred.", { description: "Please try again or contact support." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-black relative overflow-hidden" role="main">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-montserrat font-bold text-4xl text-white">Let's Build Your Next Big Thing</h2>
          <p className="text-lg text-gray-400 mt-4">Get in touch for a custom video quote or start creating images right away.</p>
              </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Custom Video Consultation */}
          <Card className="bg-gray-900/50 border border-primary/30 backdrop-blur-sm shadow-2xl h-full">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                  </div>
                <div>
                  <h3 className="font-montserrat font-bold text-2xl text-white">Custom Video Ads</h3>
                  <p className="text-gray-400">Let's discuss your vision. Fill out the form below.</p>
                </div>
                  </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="name" type="text" placeholder="Full Name *" required className="bg-gray-800/60" />
                <Input name="email" type="email" placeholder="Email Address *" required className="bg-gray-800/60" />
                <Input name="company" type="text" placeholder="Company Name" className="bg-gray-800/60" />
                <Textarea name="message" placeholder="Tell us about your project... *" required className="bg-gray-800/60" />
                <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-lg">
                  {isSubmitting ? 'Submitting...' : 'Request Free Consultation'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Self-Serve Image Studio */}
          <Card className="bg-gray-900/50 border border-gray-700 backdrop-blur-sm shadow-2xl h-full">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-2xl text-white">Self-Serve Image Studio</h3>
                  <p className="text-gray-400">Ready to create? Sign up and start generating images now.</p>
              </div>
            </div>

              {user ? (
                <div className="text-center bg-gray-800/50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">Welcome back, {user.user_metadata?.name || 'Creator'}!</h4>
                  <p className="text-gray-400 mb-4">Continue to your dashboard to manage your projects.</p>
                  <Button onClick={() => window.location.href = '/dashboard'} className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg">
                      Go to Dashboard
                    </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-6 rounded-lg space-y-3">
                    <p className="text-gray-300">Access powerful AI image generation tools, manage your assets, and explore flexible plans.</p>
                    <ul className="text-gray-400 text-sm space-y-2">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400"/> Photorealistic Images</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400"/> Brand Consistency Tools</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400"/> Rapid Prototyping</li>
                    </ul>
                  </div>
                  <Button onClick={() => window.location.href = '/auth'} className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-3 rounded-lg">
                    Sign Up & Start Creating
                      </Button>
                    </div>
              )}
            </CardContent>
            </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;

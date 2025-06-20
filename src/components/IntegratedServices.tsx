import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, SlidersHorizontal, ArrowRight, Video, Image as ImageIcon } from 'lucide-react';

const IntegratedServices = () => {

  const imageFeatures = [
    { title: 'Image Skin Realism', description: "Generate photorealistic images with incredible detail and natural skin tones. Simply adjust sliders in our intuitive interface to control realism, seeing instant visual previews of the effect. You'll clearly understand how the AI enhances your visuals, building trust in its capabilities." },
    { title: 'Image Upscaler', description: "Enhance the resolution of your visuals without losing quality. Just upload your image, click 'Upscale,' and watch as our user-friendly application transforms it. Understand exactly how your images are transformed with before-and-after comparisons." },
    { title: 'Flux Context in Canvas Mode', description: "Seamlessly integrate and manipulate elements within a flexible canvas. Our drag-and-drop UI allows you to place and adjust objects, offering clear visual feedback for dynamic compositions. Our UI guides you through every creative choice, showing you how elements interact." },
    { title: 'Product to Models', description: "Transform your product shots by placing them on diverse AI-generated models. Upload your product, select a model from our library, and our clear, step-by-step process within the application guides you to effortlessly see your products come to life in new contexts." },
    { title: 'Brand Consistency', description: "Our platform ensures all generated images align with your brand guidelines, colors, and themes. Easily upload your brand kit, and our UI provides visual previews and warnings to maintain a consistent brand identity across all your creations." },
    { title: 'Rapid Prototyping', description: "Quickly generate multiple image variations for A/B testing and campaign optimization. Input your prompt, click 'Generate,' and receive a batch of options in seconds, all within a responsive and clear interface. Understand the impact of each prompt by comparing outputs side-by-side." }
  ];

  const videoFeatures = [
    { title: 'Personalized Consultation', description: "Discuss your vision and goals with our specialists through a transparent process. We use a dedicated client portal for clear communication, ensuring you understand your project needs and how our service will deliver, from initial concept to final output." },
    { title: 'Google Veo3 Powered', description: "We leverage Google's cutting-edge Veo3 model to generate cinematic visuals, synchronized dialogue, ambient sound, and music from your prompts, delivering unparalleled quality and realism. Our team expertly crafts prompts to maximize Veo3's capabilities for your specific ad." },
    { title: 'Advanced Creative Control', description: "Our team utilizes Veo3's features like 4K output, accurate lip-syncing, realistic character animation, and scene-level control over camera angles, lighting, and tone. We provide clear communication on capabilities and expected outcomes, showing you how these controls shape your final video." },
    { title: 'Story-Driven Video Creation', description: "Transform text or image prompts into compelling narratives with realistic movement and sound. Our team guides you through the creative process, ensuring prompt adherence and translating your ideas into a powerful video story." },
    { title: 'Unlimited Revisions (Premium)', description: "Iterate on your video ads with simple text instructions, eliminating costly reshoots. We manage the revision process through our collaborative platform, ensuring your vision is perfectly realized with transparent feedback loops." }
  ];

  return (
    <section id="features" className="py-20 bg-black border-y border-gray-800/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-white mb-4">
            Our Integrated AI Creative Services: A Seamless SaaS Experience
          </h2>
          <p className="font-opensans text-lg text-gray-300 max-w-4xl mx-auto">
            At medianode.ai, we empower you with a cutting-edge SaaS platform to create all your essential marketing visuals, from stunning product images to engaging video ads, all powered by advanced AI. Our modern UI/UX ensures clarity and ease of use, so you always know what you're getting and can trust the application's powerful capabilities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* AI Image Generation Studio */}
          <Card className="bg-gray-900/50 border border-primary/30 backdrop-blur-sm shadow-2xl h-full flex flex-col">
            <CardContent className="p-8 flex-grow flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-2xl text-white">Intuitive AI Image Generation Studio</h3>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Unleash your creativity with our intuitive AI image generation tool, delivered as a seamless SaaS application. Our modern UI/UX makes it easy to instantly create high-quality marketing and product images tailored to your brand, ensuring you understand every feature and its output, and how to achieve your desired results.
              </p>
              <ul className="space-y-4 mb-8 flex-grow">
                {imageFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">{feature.title}</h4>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button onClick={() => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })} className="w-full mt-auto bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-lg group">
                Explore Image Studio Features & Plans
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Bespoke AI Video Ad Production */}
          <Card className="bg-gray-900/50 border border-gray-700 backdrop-blur-sm shadow-2xl h-full flex flex-col">
            <CardContent className="p-8 flex-grow flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-montserrat font-bold text-2xl text-white">Bespoke AI Video Ad Production Service</h3>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                For cinematic quality and tailored storytelling, our expert team collaborates with you to produce bespoke video ads using state-of-the-art AI. This service complements our self-service tools, offering a personalized touch within our high-quality ecosystem, ensuring your unique vision is realized through a transparent and trustworthy process. You'll have a dedicated point of contact and clear project tracking every step of the way.
              </p>
              <ul className="space-y-4 mb-8 flex-grow">
                {videoFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">{feature.title}</h4>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })} className="w-full mt-auto bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg group">
                Book Your Video Ad Consultation
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default IntegratedServices; 
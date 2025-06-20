
import { X, Check, Zap, Crown, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal = ({ isOpen, onClose }: PricingModalProps) => {
  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      price: '$9',
      credits: '50 credits',
      features: [
        'Standard enhancement mode',
        'Basic skin texture adjustment',
        'Download in JPG format',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Professional',
      icon: Crown,
      price: '$19',
      credits: '150 credits',
      features: [
        'Standard + Heavy enhancement',
        'Advanced skin realism controls',
        'Preserved areas selection',
        'High-resolution output',
        'Priority support'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      icon: Rocket,
      price: '$49',
      credits: '500 credits',
      features: [
        'All Professional features',
        'Batch processing',
        'API access included',
        'Custom enhancement profiles',
        'Dedicated support'
      ],
      popular: false
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-derma-card border-derma-border text-derma-text">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-derma-text text-center">
            Choose Your Plan
          </DialogTitle>
          <p className="text-derma-text-muted text-center">
            Select the perfect plan for your skin enhancement needs
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-derma-blue bg-derma-blue/5'
                    : 'border-derma-border bg-derma-card'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-derma-blue text-white">
                    Most Popular
                  </Badge>
                )}

                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-derma-blue/20 flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-derma-blue" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-derma-text">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-derma-text">{plan.price}</span>
                      <span className="text-derma-text-muted">/{plan.credits}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-derma-text-muted text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-derma-blue hover:bg-derma-blue-hover text-white'
                        : 'bg-derma-border hover:bg-derma-border/80 text-derma-text'
                    }`}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-derma-border pt-6">
          <div className="text-center space-y-2">
            <p className="text-derma-text-muted text-sm">
              All plans include secure processing and lifetime access to enhanced images
            </p>
            <p className="text-derma-text-muted text-xs">
              Credits never expire • Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;

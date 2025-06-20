
import { BookOpen, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GetStartedSectionProps {
  onShowBestPractices: () => void;
  onShowPricing: () => void;
}

const GetStartedSection = ({ onShowBestPractices, onShowPricing }: GetStartedSectionProps) => {
  return (
    <section className="mt-12 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Button
          variant="outline"
          size="lg"
          onClick={onShowBestPractices}
          className="h-24 border-derma-border text-derma-text hover:bg-derma-border/30 hover:border-derma-blue/50 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-derma-blue/20 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-derma-blue" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-derma-text">Best Practices</h3>
              <p className="text-derma-text-muted text-sm">Learn tips for optimal results</p>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onShowPricing}
          className="h-24 border-derma-border text-derma-text hover:bg-derma-border/30 hover:border-derma-blue/50 transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-derma-text">Pricing</h3>
              <p className="text-derma-text-muted text-sm">View our credit packages</p>
            </div>
          </div>
        </Button>
      </div>
    </section>
  );
};

export default GetStartedSection;

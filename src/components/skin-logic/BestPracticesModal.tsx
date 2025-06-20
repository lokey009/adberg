
import { X, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BestPracticesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BestPracticesModal = ({ isOpen, onClose }: BestPracticesModalProps) => {
  const bestPractices = [
    "Use images ≥ 1024x1024 for best results",
    "Well-lit portraits with clear detail",
    "Avoid blurry or compressed images",
    "Use Face Detection & Cropping if subject is small"
  ];

  const dos = [
    "High resolution, clear lighting",
    "Centered subject in frame",
    "Minimal background noise",
    "Good contrast and sharpness"
  ];

  const donts = [
    "Low resolution or pixelated images",
    "Extreme lighting conditions",
    "Heavy compression artifacts",
    "Multiple faces in one image"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-derma-card border-derma-border text-derma-text">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-derma-text flex items-center">
            <div className="w-8 h-8 rounded-lg bg-derma-blue/20 flex items-center justify-center mr-3">
              <Check className="h-5 w-5 text-derma-blue" />
            </div>
            Best Practices & Tips
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Tips */}
          <div>
            <h3 className="font-semibold text-derma-text mb-3">General Guidelines</h3>
            <ul className="space-y-2">
              {bestPractices.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-derma-text-muted text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Do's and Don'ts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-medium text-green-400 mb-3 flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Do's
              </h4>
              <ul className="space-y-2">
                {dos.map((item, index) => (
                  <li key={index} className="text-derma-text-muted text-sm">• {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h4 className="font-medium text-red-400 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Don'ts
              </h4>
              <ul className="space-y-2">
                {donts.map((item, index) => (
                  <li key={index} className="text-derma-text-muted text-sm">• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Ranges */}
          <div className="bg-derma-border/20 rounded-lg p-4">
            <h4 className="font-medium text-derma-text mb-3">Recommended Ranges</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-derma-text-muted text-sm">Skin Texture Adjuster:</span>
                <span className="text-derma-blue font-medium">3.2 - 4.2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-derma-text-muted text-sm">Skin Realism Level:</span>
                <span className="text-derma-blue font-medium">1.7 - 2.3</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-derma-border">
            <Button
              onClick={onClose}
              className="bg-derma-blue hover:bg-derma-blue-hover text-white px-6"
            >
              Got it, thanks!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BestPracticesModal;

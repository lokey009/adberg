import React, { useState, useRef, useEffect } from 'react';
import { Download, Maximize2, Wand2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FaceParsingConfig, { FaceParsingConfig as FaceParsingConfigType } from './FaceParsingConfig';
import EnhancementProgress from './EnhancementProgress';
import { EnhancementService, EnhancementStatus } from '@/services/enhancementService';

interface ResultPanelProps {
  originalImage?: string;
  enhancedImage?: string;
  isLoading?: boolean;
  processingTime?: string;
  enhancementLevel?: string;
  // New props for enhancement integration
  imageId?: string;
  originalImageUrl?: string;
  onEnhancementStart?: (jobId: string) => void;
  onEnhancementComplete?: (enhancedImageUrl: string) => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ 
  originalImage = '/images/input.jpg', 
  enhancedImage = '/images/enhanced.jpg',
  isLoading = false,
  processingTime = '1.23s',
  enhancementLevel = '1.7x',
  imageId,
  originalImageUrl,
  onEnhancementStart,
  onEnhancementComplete
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Enhancement state
  const [showFaceParsingConfig, setShowFaceParsingConfig] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementJobId, setEnhancementJobId] = useState<string | null>(null);
  const [currentEnhancedImage, setCurrentEnhancedImage] = useState<string | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  
  // Handle mouse move on the container
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newPosition = Math.round((x / rect.width) * 100);
    
    setSliderPosition(newPosition);
  };
  
  // Handle mouse down on the container
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newPosition = Math.round((x / rect.width) * 100);
    
    setSliderPosition(newPosition);
    e.preventDefault();
  };
  
  // Handle touch events for mobile
  const handleTouchMove = (e: TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const newPosition = Math.round((x / rect.width) * 100);
    
    setSliderPosition(newPosition);
    e.preventDefault();
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const newPosition = Math.round((x / rect.width) * 100);
    
    setSliderPosition(newPosition);
  };
  
  // Enhancement functions
  const handleEnhanceClick = () => {
    if (!imageId || !originalImageUrl) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image first to enhance it.",
        variant: "destructive",
      });
      return;
    }
    setShowFaceParsingConfig(true);
  };

  const handleFaceParsingConfirm = async (config: FaceParsingConfigType) => {
    setIsConfigLoading(true);
    try {
      const result = await EnhancementService.startEnhancement(
        imageId!,
        originalImageUrl!,
        config
      );

      if (result.success) {
        setEnhancementJobId(result.job_id);
        setIsEnhancing(true);
        setShowFaceParsingConfig(false);
        
        if (onEnhancementStart) {
          onEnhancementStart(result.job_id);
        }

        toast({
          title: "Enhancement started",
          description: "Your image enhancement is now processing. This will take 3-4 minutes.",
        });
      } else {
        throw new Error(result.error || 'Failed to start enhancement');
      }
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Failed to start enhancement",
        variant: "destructive",
      });
    } finally {
      setIsConfigLoading(false);
    }
  };

  const handleEnhancementComplete = (result: EnhancementStatus) => {
    if (result.enhanced_image_url) {
      setCurrentEnhancedImage(result.enhanced_image_url);
      setIsEnhancing(false);
      setEnhancementJobId(null);
      
      if (onEnhancementComplete) {
        onEnhancementComplete(result.enhanced_image_url);
      }

      toast({
        title: "Enhancement completed!",
        description: "Your image has been successfully enhanced.",
      });
    }
  };

  const handleEnhancementError = (error: string) => {
    setIsEnhancing(false);
    setEnhancementJobId(null);
    
    toast({
      title: "Enhancement failed",
      description: error,
      variant: "destructive",
    });
  };

  const handleDownload = async () => {
    const downloadImage = currentEnhancedImage || enhancedImage;
    if (!downloadImage) {
      toast({
        title: "No image to download",
        description: "Please enhance an image first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const filename = imageId ? `enhanced_${imageId}` : 'enhanced_image.jpg';
      await EnhancementService.downloadImage(downloadImage, filename);
      
      toast({
        title: "Download started",
        description: "Your enhanced image is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download image",
        variant: "destructive",
      });
    }
  };

  // Add global event listeners
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    // Add event listeners if in dragging state
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white">Result</h2>
        <div className="flex space-x-2">
          {/* Enhance Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnhanceClick}
            disabled={isEnhancing || !imageId}
            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
          >
            {isEnhancing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            {isEnhancing ? 'Enhancing...' : 'Enhance Skin'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Expand
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={!currentEnhancedImage && !enhancedImage}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      
      {/* Comparison Container */}
      <div className="p-6">
        {/* Enhancement Progress */}
        {isEnhancing && enhancementJobId && (
          <div className="mb-6">
            <EnhancementProgress
              jobId={enhancementJobId}
              onComplete={handleEnhancementComplete}
              onError={handleEnhancementError}
            />
          </div>
        )}

        <div 
          ref={containerRef}
          className="relative h-[500px] w-full rounded-lg overflow-hidden cursor-col-resize bg-black"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Original Image (right side) */}
          <div 
            className="absolute inset-0 bg-black"
            style={{ 
              clipPath: `inset(0 0 0 ${sliderPosition}%)`
            }}
          >
            <img
              src={originalImage}
              alt="Original"
              className="w-full h-full object-cover"
              draggable="false"
            />
            <div className="text-white text-sm opacity-70 absolute bottom-2 right-4">
              Original
            </div>
          </div>
          
          {/* Enhanced Image (left side) */}
          <div 
            className="absolute inset-0 bg-black"
            style={{ 
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
            }}
          >
            <img
              src={currentEnhancedImage || enhancedImage}
              alt="Enhanced"
              className="w-full h-full object-cover"
              draggable="false"
            />
            <div className="text-white text-sm opacity-70 absolute bottom-2 left-4">
              {currentEnhancedImage ? 'AI Enhanced' : 'Enhanced'}
            </div>
          </div>
          
          {/* Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-white shadow-lg z-10"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Slider Handle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing">
              <div className="flex flex-col items-center justify-center gap-[2px]">
                <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                <div className="flex gap-[3px]">
                  <div className="w-[3px] h-[3px] rounded-full bg-gray-400"></div>
                  <div className="w-[3px] h-[3px] rounded-full bg-gray-400"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-white font-medium">Enhancing image...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Image Processing Info */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-sm mb-1">Processing Time</p>
            <p className="text-white font-medium">{processingTime}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-sm mb-1">Enhanced Level</p>
            <p className="text-white font-medium">{enhancementLevel}</p>
          </div>
        </div>
      </div>

      {/* Face Parsing Configuration Modal */}
      <FaceParsingConfig
        isOpen={showFaceParsingConfig}
        onClose={() => setShowFaceParsingConfig(false)}
        onConfirm={handleFaceParsingConfirm}
        isLoading={isConfigLoading}
      />
    </div>
  );
};

export default ResultPanel;

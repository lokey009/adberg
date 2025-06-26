import React, { useState, useRef, useEffect } from 'react';
import { Download, Maximize2, Wand2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  onEnhanceClick?: () => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({
  originalImage = '/images/input.jpg',
  enhancedImage,
  isLoading = false,
  processingTime = '1.23s',
  enhancementLevel = '1.7x',
  imageId,
  originalImageUrl,
  onEnhancementStart,
  onEnhancementComplete,
  onEnhanceClick
}) => {

  // Debug logging
  console.log('🔍 ResultPanel props:');
  console.log('  - originalImage:', originalImage);
  console.log('  - enhancedImage:', enhancedImage);
  console.log('  - isLoading:', isLoading);
  console.log('  - imageId:', imageId);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Use the isLoading prop from parent instead of local isEnhancing state
  const isEnhancing = isLoading;
  
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
    console.log('🔥 ENHANCE SKIN BUTTON CLICKED!');

    if (!imageId || !originalImageUrl) {
      console.error('❌ Missing required data for enhancement');
      toast({
        title: "No image uploaded",
        description: "Please upload an image first to enhance it.",
        variant: "destructive",
      });
      return;
    }

    // Call the parent's enhance function instead of handling it internally
    if (onEnhanceClick) {
      onEnhanceClick();
    } else {
      toast({
        title: "Enhancement not configured",
        description: "Enhancement function not provided.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!enhancedImage) {
      toast({
        title: "No image to download",
        description: "Please enhance an image first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const filename = imageId ? `enhanced_${imageId}` : 'enhanced_image.jpg';

      // Simple download implementation
      const response = await fetch(enhancedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

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
            disabled={!enhancedImage}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      
      {/* Comparison Container */}
      <div className="p-6">


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
            {/* Only show enhanced image if we have one AND we're not currently loading */}
            {(enhancedImage && !isLoading) ? (
              <>
                <img
                  src={enhancedImage}
                  alt="Enhanced"
                  className="w-full h-full object-cover"
                  draggable="false"
                />
                <div className="text-white text-sm opacity-70 absolute bottom-2 left-4">
                  AI Enhanced
                </div>
              </>
            ) : isLoading ? (
              <>
                {/* Show original image with loading overlay when processing */}
                <img
                  src={originalImage}
                  alt="Processing..."
                  className="w-full h-full object-cover opacity-30"
                  draggable="false"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/80 text-white px-6 py-4 rounded-lg text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <div className="text-sm font-medium">Processing with AI...</div>
                    <div className="text-xs text-gray-300 mt-1">This may take 2-5 minutes</div>
                  </div>
                </div>
                <div className="text-white text-sm opacity-70 absolute bottom-2 left-4">
                  Processing...
                </div>
              </>
            ) : (
              <>
                {/* Show original image when no enhancement yet */}
                <img
                  src={originalImage}
                  alt="Original (no enhancement yet)"
                  className="w-full h-full object-cover opacity-50"
                  draggable="false"
                />
                <div className="text-white text-sm opacity-70 absolute bottom-2 left-4">
                  Click "Enhance Skin"
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
                    No enhancement yet
                  </div>
                </div>
              </>
            )}
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
            <p className="text-white font-medium">
              {isLoading ? 'Processing...' : processingTime}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-sm mb-1">Enhanced Level</p>
            <p className="text-white font-medium">
              {isLoading ? 'Calculating...' : enhancementLevel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPanel;

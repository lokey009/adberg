import React, { useState, useRef, useEffect } from 'react';
import { Download, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultPanelProps {
  originalImage?: string;
  enhancedImage?: string;
  isLoading?: boolean;
  processingTime?: string;
  enhancementLevel?: string;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ 
  originalImage = '/images/input.jpg', 
  enhancedImage = '/images/enhanced.jpg',
  isLoading = false,
  processingTime = '1.23s',
  enhancementLevel = '1.7x'
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
            <img
              src={enhancedImage}
              alt="Enhanced"
              className="w-full h-full object-cover"
              draggable="false"
            />
            <div className="text-white text-sm opacity-70 absolute bottom-2 left-4">
              Enhanced
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
        
        {/* Caption Text */}
        <p className="mt-4 text-sm text-gray-400 text-center">
          Drag or click across the image to compare the original and enhanced versions
        </p>
      </div>
    </div>
  );
};

export default ResultPanel;

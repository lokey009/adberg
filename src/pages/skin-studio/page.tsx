import { useState, useEffect } from 'react';
import UploadPanel from '@/components/skin-logic/UploadPanel';
import ResultPanel from '@/components/skin-logic/ResultPanel';
import PreservedAreasPanel from '@/components/skin-logic/PreservedAreasPanel';
import NavigationBar from '@/components/skin-logic/NavigationBar';
import { useToast } from '@/hooks/use-toast';

interface EnhancementSettings {
  mode: 'standard' | 'heavy';
  skinTexture: number;
  skinRealism: number;
  preservedAreas: string[];
  agreedToBestPractices: boolean;
}

interface ProcessingStatus {
  status: 'processing' | 'completed' | 'failed';
  uploaded_url?: string;
  enhanced_url?: string;
  local_url?: string;
  error?: string;
}

export default function SkinStudio() {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [b2ImageUrl, setB2ImageUrl] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const [enhancementSettings, setEnhancementSettings] = useState<EnhancementSettings>({
    mode: 'standard',
    skinTexture: 2.5,
    skinRealism: 3.0,
    preservedAreas: [],
    agreedToBestPractices: false
  });

  // Auto-check status when image is uploaded and settings are valid
  useEffect(() => {
    if (uploadedImage && currentFilename && enhancementSettings.agreedToBestPractices && !isEnhancing && !enhancedImage) {
      checkEnhancementStatus(currentFilename);
    }
  }, [uploadedImage, enhancementSettings.agreedToBestPractices, currentFilename]);

  const checkEnhancementStatus = async (filename: string) => {
    try {
      setIsEnhancing(true);
      console.log('Starting enhancement status check for:', filename);
      
      const statusCheckInterval = setInterval(async () => {
        try {
          const statusUrl = `http://localhost:5001/skin-studio/status/${filename}`;
          console.log('Checking status at URL:', statusUrl);
          
          const response = await fetch(statusUrl);
          console.log('Status response received:', response.status, response.statusText);
          
          if (!response.ok) {
            console.error('Status check failed:', response.status, response.statusText);
            throw new Error(`Failed to check status: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Status check response data:', data);
          
          // Check for either 'complete' or 'completed' status for compatibility
          if ((data.status === 'complete' || data.status === 'completed') && data.enhanced_url) {
            clearInterval(statusCheckInterval);
            setIsEnhancing(false);
            console.log('Setting enhanced image URL:', data.enhanced_url);
            setEnhancedImage(data.enhanced_url);
            
            const isB2Storage = data.enhanced_url.includes('backblazeb2.com') || data.enhanced_url.includes('b2-proxy');
            console.log('Enhancement complete, using B2 storage:', isB2Storage);
            
            toast({
              title: "Enhancement complete",
              description: "Your image has been successfully enhanced and saved to " + 
                          (isB2Storage ? "Backblaze B2." : "local storage."),
            });
          } else if (data.status === 'failed') {
            clearInterval(statusCheckInterval);
            setIsEnhancing(false);
            console.error('Enhancement failed:', data.error);
            
            toast({
              title: "Enhancement failed",
              description: data.error || "An unknown error occurred",
              variant: "destructive",
            });
          } else {
            console.log('Still processing, status:', data.status);
          }
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }, 1000);
      
      // Clean up interval after 30 seconds (timeout)
      setTimeout(() => {
        clearInterval(statusCheckInterval);
        if (isEnhancing) {
          setIsEnhancing(false);
          console.warn('Enhancement timed out after 30 seconds');
          
          toast({
            title: "Enhancement timed out",
            description: "The enhancement process is taking longer than expected.",
            variant: "destructive",
          });
        }
      }, 30000);
    } catch (error) {
      console.error('Error initiating status check:', error);
      setIsEnhancing(false);
    }
  };

  const handleImageUpload = (imageUrl: string, serverUrl?: string) => {
    console.log('handleImageUpload called with:', { imageUrl, serverUrl });
    
    // Always set the local preview image
    setUploadedImage(imageUrl);
    
    // Reset enhanced image when new image is uploaded
    setEnhancedImage(null);
    
    if (serverUrl) {
      // Store the server URL
      setB2ImageUrl(serverUrl);
      console.log('Image uploaded to server:', serverUrl);
      
      // Extract filename from URL
      const urlParts = serverUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      console.log('Extracted filename:', filename);
      setCurrentFilename(filename);
      
      // Check if it's a B2 URL or proxy URL
      const isB2 = serverUrl.includes('backblazeb2.com') || serverUrl.includes('b2-proxy');
      console.log('Is B2 URL:', isB2, 'URL contains backblazeb2.com:', serverUrl.includes('backblazeb2.com'), 'URL contains b2-proxy:', serverUrl.includes('b2-proxy'));
      
      // Show appropriate toast notification
      if (enhancementSettings.agreedToBestPractices) {
        toast({
          title: isB2 ? "Image uploaded to B2" : "Image uploaded locally",
          description: "Your image will be automatically enhanced.",
        });
        
        // Auto-start enhancement if best practices are agreed to
        if (filename) {
          checkEnhancementStatus(filename);
        }
      } else {
        toast({
          title: isB2 ? "Image uploaded to B2" : "Image uploaded locally",
          description: "Please agree to best practices to enhance your image.",
        });
      }
    } else {
      console.warn('No server URL provided, using local preview only');
      toast({
        title: "Using local preview only",
        description: "Server upload unavailable. Using local preview only.",
      });
    }
  };

  const handleEnhance = () => {
    if (!uploadedImage || !currentFilename) return;
    checkEnhancementStatus(currentFilename);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setEnhancedImage(null);
    setEnhancementSettings({
      mode: 'standard',
      skinTexture: 2.5,
      skinRealism: 3.0,
      preservedAreas: [],
      agreedToBestPractices: false
    });
    console.log('Reset state in skin studio page');
  };

  const handlePreservedAreasChange = (areas: string[]) => {
    setEnhancementSettings(prev => ({
      ...prev,
      preservedAreas: areas
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Skin Studio</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <UploadPanel
              onImageUpload={handleImageUpload}
              uploadedImageUrl={uploadedImage}
              enhancementSettings={enhancementSettings}
              setEnhancementSettings={setEnhancementSettings}
              onEnhance={handleEnhance}
              isEnhancing={isEnhancing}
              onReset={handleReset}
            />
            
            {uploadedImage && (
              <PreservedAreasPanel
                preservedAreas={enhancementSettings.preservedAreas}
                onPreservedAreasChange={handlePreservedAreasChange}
              />
            )}
          </div>
          
          <div>
            {(enhancedImage || isEnhancing || uploadedImage) && (
              <ResultPanel
                originalImage={uploadedImage}
                enhancedImage={enhancedImage}
                isLoading={isEnhancing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
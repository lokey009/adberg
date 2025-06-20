import { useState, useEffect } from 'react';
import UploadPanel from '@/components/skin-logic/UploadPanel';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
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
  is_b2?: boolean;
}

export default function TestUpload() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [serverImageUrl, setServerImageUrl] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const [isB2Storage, setIsB2Storage] = useState(false);
  const [enhancementSettings, setEnhancementSettings] = useState<EnhancementSettings>({
    mode: 'standard',
    skinTexture: 2.5,
    skinRealism: 3.0,
    preservedAreas: [],
    agreedToBestPractices: true
  });
  
  const { toast } = useToast();

  // Auto-check status when image is uploaded
  useEffect(() => {
    if (serverImageUrl && currentFilename) {
      setIsEnhancing(true);
      const statusCheckInterval = setInterval(() => {
        checkEnhancementStatus(currentFilename);
      }, 1000);
      
      return () => clearInterval(statusCheckInterval);
    }
  }, [serverImageUrl, currentFilename]);

  const checkEnhancementStatus = async (filename: string) => {
    try {
      const response = await fetch(`http://localhost:5001/skin-studio/status/${filename}`);
      if (!response.ok) {
        throw new Error('Failed to check status');
      }
      
      const data = await response.json();
      console.log('Status check:', data);
      
      if (data.status === 'completed' && data.enhanced_url) {
        setIsEnhancing(false);
        setEnhancedImage(data.enhanced_url);
        
        // Check if using B2 storage
        if (data.enhanced_url.includes('backblazeb2.com')) {
          setIsB2Storage(true);
        }
        
        toast({
          title: "Enhancement complete",
          description: "Your image has been successfully enhanced and saved to " + 
                      (data.enhanced_url.includes('backblazeb2.com') ? "Backblaze B2." : "local storage."),
        });
      } else if (data.status === 'failed') {
        setIsEnhancing(false);
        toast({
          title: "Enhancement failed",
          description: data.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleImageUpload = (imageUrl: string, serverUrl?: string) => {
    console.log('Image uploaded:', imageUrl);
    console.log('Server URL:', serverUrl);
    setUploadedImage(imageUrl);
    setEnhancedImage(null); // Reset enhanced image when new image is uploaded
    setIsB2Storage(false);
    
    if (serverUrl) {
      setServerImageUrl(serverUrl);
      
      // Check if using B2 storage
      if (serverUrl.includes('backblazeb2.com')) {
        setIsB2Storage(true);
      }
      
      // Extract filename from URL
      const urlParts = serverUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      setCurrentFilename(filename);
      
      toast({
        title: "Processing image",
        description: "Your image will be automatically enhanced.",
      });
    }
  };

  const handleEnhance = () => {
    if (!serverImageUrl || !currentFilename) return;
    
    setIsEnhancing(true);
    checkEnhancementStatus(currentFilename);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setServerImageUrl(null);
    setEnhancedImage(null);
    setCurrentFilename(null);
    setIsB2Storage(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Test Upload</h1>
      
      <div className="max-w-2xl mx-auto">
        <UploadPanel
          onImageUpload={handleImageUpload}
          uploadedImage={uploadedImage}
          enhancementSettings={enhancementSettings}
          setEnhancementSettings={setEnhancementSettings}
          onEnhance={handleEnhance}
          isEnhancing={isEnhancing}
          onReset={handleReset}
        />
        
        {isEnhancing && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Enhancing your image...</p>
          </div>
        )}
        
        {enhancedImage && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Enhanced Image</h2>
            <div className="mb-2 flex items-center">
              <span className={`px-2 py-1 rounded text-xs mr-2 ${isB2Storage ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
                {isB2Storage ? 'Backblaze B2' : 'Local Storage'}
              </span>
              {isB2Storage && (
                <span className="text-xs text-gray-400">Stored in ShortHive bucket</span>
              )}
            </div>
            <img 
              src={enhancedImage} 
              alt="Enhanced image" 
              className="w-full h-auto rounded-lg"
            />
            
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Upload New Image
              </Button>
              <Button 
                variant="default" 
                onClick={() => window.open(enhancedImage, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Image
              </Button>
            </div>
          </div>
        )}
        
        {serverImageUrl && !enhancedImage && !isEnhancing && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Server Image URL</h2>
            <div className="mb-2">
              <span className={`px-2 py-1 rounded text-xs ${isB2Storage ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
                {isB2Storage ? 'Backblaze B2' : 'Local Storage'}
              </span>
            </div>
            <p className="text-sm text-gray-300 break-all mb-4">{serverImageUrl}</p>
            <img 
              src={serverImageUrl} 
              alt="Server stored image" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import UploadPanel from '@/components/skin-logic/UploadPanel';
import ResultPanel from '@/components/skin-logic/ResultPanel';
import PreservedAreasPanel from '@/components/skin-logic/PreservedAreasPanel';
import NavigationBar from '@/components/skin-logic/NavigationBar';
import FaceParsingConfig, { FaceParsingConfig as FaceParsingConfigType } from '@/components/skin-logic/FaceParsingConfig';
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

  // Face parsing configuration state
  const [showFaceParsingConfig, setShowFaceParsingConfig] = useState(false);
  const [faceParsingConfig, setFaceParsingConfig] = useState<FaceParsingConfigType>({
    background: false,
    skin: true,
    nose: true,
    eye_g: true,
    r_eye: true,
    l_eye: true,
    r_brow: true,
    l_brow: true,
    r_ear: false,
    l_ear: false,
    mouth: true,
    u_lip: true,
    l_lip: true,
    hair: true,
    hat: false,
    ear_r: false,
    neck_l: false,
    neck: false,
    cloth: false
  });
  const [enhancementStatus, setEnhancementStatus] = useState<string>('');

  // Disable automatic enhancement - only manual "Enhance Skin" button should trigger RunPod API
  // useEffect(() => {
  //   if (uploadedImage && currentFilename && enhancementSettings.agreedToBestPractices && !isEnhancing && !enhancedImage) {
  //     checkEnhancementStatus(currentFilename);
  //   }
  // }, [uploadedImage, enhancementSettings.agreedToBestPractices, currentFilename]);

  const startEnhancement = async () => {
    if (!currentFilename || !uploadedImage) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEnhancing(true);
      setEnhancementStatus('Starting enhancement...');
      console.log('🚀 Starting enhancement with RunPod API');
      console.log('Image ID:', currentFilename);
      console.log('Face parsing config:', faceParsingConfig);

      // Call RunPod API directly through our backend
      const response = await fetch('http://localhost:5001/skin-studio/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_id: currentFilename,
          original_image_url: b2ImageUrl || uploadedImage,
          face_parsing_config: faceParsingConfig
        }),
      });

      const data = await response.json();
      console.log('Enhancement API response:', data);

      if (data.success && data.job_id) {
        setEnhancementStatus('Enhancement started, processing...');

        toast({
          title: "Enhancement started",
          description: "Your image is being processed with AI enhancement.",
        });

        // Start polling for job status
        pollEnhancementStatus(data.job_id);
      } else {
        throw new Error(data.error || 'Failed to start enhancement');
      }
    } catch (error) {
      console.error('❌ Error starting enhancement:', error);
      setIsEnhancing(false);
      setEnhancementStatus('');

      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Failed to start enhancement process.",
        variant: "destructive",
      });
    }
  };

  const pollEnhancementStatus = async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes max (5 second intervals)
    let attempts = 0;

    const statusInterval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`http://localhost:5001/skin-studio/enhance/status/${jobId}`);
        const data = await response.json();

        console.log(`Status check ${attempts}/${maxAttempts}:`, data);

        if (data.success) {
          if (data.status === 'completed' && data.enhanced_image_url) {
            clearInterval(statusInterval);
            setIsEnhancing(false);
            setEnhancementStatus('');
            setEnhancedImage(data.enhanced_image_url);

            toast({
              title: "Enhancement complete!",
              description: "Your image has been successfully enhanced.",
            });
          } else if (data.status === 'failed') {
            clearInterval(statusInterval);
            setIsEnhancing(false);
            setEnhancementStatus('');

            toast({
              title: "Enhancement failed",
              description: data.error_message || "The enhancement process failed.",
              variant: "destructive",
            });
          } else if (data.status === 'processing') {
            setEnhancementStatus(`Processing... ${data.progress || 0}%`);
          }
        }

        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(statusInterval);
          setIsEnhancing(false);
          setEnhancementStatus('');

          toast({
            title: "Enhancement timeout",
            description: "The enhancement is taking longer than expected. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking enhancement status:', error);
      }
    }, 5000); // Check every 5 seconds
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
      
      // Show appropriate toast notification (no automatic enhancement)
      toast({
        title: isB2 ? "Image uploaded to B2" : "Image uploaded locally",
        description: "Click 'Enhance Skin' button to process with RunPod AI.",
      });
    } else {
      console.warn('No server URL provided, using local preview only');
      toast({
        title: "Using local preview only",
        description: "Server upload unavailable. Using local preview only.",
      });
    }
  };

  const handleEnhance = () => {
    if (!uploadedImage || !currentFilename) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    // Start the enhancement process
    startEnhancement();
  };

  const handleFaceParsingConfirm = (config: FaceParsingConfigType) => {
    setFaceParsingConfig(config);
    setShowFaceParsingConfig(false);

    const selectedCount = Object.values(config).filter(Boolean).length;
    toast({
      title: "Face parsing configured",
      description: `${selectedCount} facial areas selected for enhancement.`,
    });
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
              enhancementStatus={enhancementStatus}
              faceParsingConfig={faceParsingConfig}
              onOpenFaceParsingConfig={() => setShowFaceParsingConfig(true)}
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
                imageId={currentFilename}
                originalImageUrl={b2ImageUrl}
                onEnhanceClick={() => {
                  console.log('🚀 Enhance button clicked, calling startEnhancement');
                  console.log('🚀 Current state:');
                  console.log('  - uploadedImage:', uploadedImage);
                  console.log('  - enhancedImage:', enhancedImage);
                  console.log('  - isEnhancing:', isEnhancing);
                  console.log('  - currentFilename:', currentFilename);
                  console.log('  - b2ImageUrl:', b2ImageUrl);
                  startEnhancement();
                }}
                onEnhancementStart={(jobId) => {
                  console.log('RunPod enhancement started with job ID:', jobId);
                  setIsEnhancing(true);
                }}
                onEnhancementComplete={(enhancedImageUrl) => {
                  console.log('RunPod enhancement completed:', enhancedImageUrl);
                  setEnhancedImage(enhancedImageUrl);
                  setIsEnhancing(false);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Face Parsing Configuration Dialog */}
      <FaceParsingConfig
        isOpen={showFaceParsingConfig}
        onClose={() => setShowFaceParsingConfig(false)}
        onConfirm={handleFaceParsingConfirm}
        isLoading={isEnhancing}
      />
    </div>
  );
}
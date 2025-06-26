import { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Scissors, Zap, RotateCcw, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FaceParsingConfig } from './FaceParsingConfig';

interface EnhancementSettings {
  mode: 'standard' | 'heavy';
  skinTexture: number;
  skinRealism: number;
  preservedAreas: string[];
  agreedToBestPractices: boolean;
}

interface UploadedImage {
  id: string;
  url: string;
  originalUrl?: string;
  enhancedUrl?: string;
  originalEnhancedUrl?: string;
  storageType: string;
  status: string;
  name: string;
  size: number;
  type: string;
}

interface UploadPanelProps {
  onImageUpload: (imageUrl: string, originalUrl?: string) => void;
  uploadedImageUrl: string | null;
  enhancementSettings: EnhancementSettings;
  setEnhancementSettings: (settings: EnhancementSettings | ((prev: EnhancementSettings) => EnhancementSettings)) => void;
  onEnhance: () => void;
  isEnhancing: boolean;
  onReset: () => void;
  enhancementStatus?: string;
  faceParsingConfig?: FaceParsingConfig;
  onOpenFaceParsingConfig?: () => void;
}

const UploadPanel = ({
  onImageUpload,
  uploadedImageUrl,
  enhancementSettings,
  setEnhancementSettings,
  onEnhance,
  isEnhancing,
  onReset,
  enhancementStatus,
  faceParsingConfig,
  onOpenFaceParsingConfig
}: UploadPanelProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageId, setImageId] = useState('');
  const [enhancedImageUrl, setEnhancedImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [statusInterval, setStatusInterval] = useState<NodeJS.Timeout | null>(null);

  // Backend API URL
  const API_URL = 'http://localhost:5001';
  
  // Log when props change
  useEffect(() => {
    console.log('UploadPanel props updated:', { 
      uploadedImageUrl, 
      isEnhancing,
      hasEnhancementSettings: !!enhancementSettings
    });
  }, [uploadedImageUrl, isEnhancing, enhancementSettings]);

  const uploadToB2 = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');
    
    try {
      // First, create a local preview regardless of API upload success
      const reader = new FileReader();
      reader.onload = async (e) => {
        const localPreview = e.target?.result as string;
        console.log('Local preview created');
        
        try {
          // Create form data for upload
          const formData = new FormData();
          formData.append('file', file);
          
          console.log('Starting upload to server:', file.name);
          console.log('API URL:', API_URL);
          
          // Upload to server
          const response = await fetch(`${API_URL}/skin-studio/upload`, {
            method: 'POST',
            body: formData,
          });
          
          console.log('Response status:', response.status);
          console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
          
          if (!response.ok) {
            console.error('Upload failed with status:', response.status);
            console.error('Response text:', await response.text());
            throw new Error(`Upload failed with status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Upload response:', data);
          
          if (data.success) {
            // Set image URL and ID from response
            setImageUrl(data.file_url);
            setImageId(data.file_name);
            setUploadedImage({
              id: data.file_name,
              url: data.file_url,
              originalUrl: data.original_url || data.file_url,
              storageType: data.storage_type || (data.is_b2 ? 'b2' : 'local'),
              status: data.status || 'complete',
              name: file.name,
              size: file.size,
              type: file.type
            });
            
            // Update status message based on storage type
            if (data.storage_type === 'b2' || data.is_b2) {
              setUploadStatus('Image uploaded to B2');
              toast({
                title: "Upload successful",
                description: "Your image was successfully uploaded to Backblaze B2.",
              });
            } else {
              setUploadStatus('Image uploaded locally');
              toast({
                title: "Upload successful",
                description: "Your image was uploaded to local storage.",
              });
            }
            
            // Start polling for enhancement status if processing
            if (data.status === 'processing') {
              setUploadStatus('Processing image...');
              startPollingStatus(data.file_name);
            }
            
            // Call the parent's onImageUpload function to update the parent component
            onImageUpload(localPreview, data.file_url);
          } else {
            throw new Error(data.error || 'Upload failed');
          }
        } catch (error) {
          console.error('Upload error:', error);
          setUploadStatus('Upload failed');
          toast({
            title: "Upload failed",
            description: error instanceof Error ? error.message : 'An unknown error occurred',
            variant: "destructive",
          });
          
          // Still show local preview on error
          setImageUrl(localPreview);
          
          // Call the parent's onImageUpload function with just the local preview
          onImageUpload(localPreview);
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error creating preview:', error);
      setIsUploading(false);
      setUploadStatus('Upload failed');
      toast({
        title: "Upload failed",
        description: "Failed to create image preview",
        variant: "destructive",
      });
    }
  };

  // Add a function to start polling for enhancement status
  const startPollingStatus = (imageId: string) => {
    console.log('Starting polling for image ID:', imageId);
    
    const checkStatus = async () => {
      try {
        console.log('Checking status for:', imageId);
        const response = await fetch(`${API_URL}/skin-studio/status/${imageId}`);
        
        if (!response.ok) {
          console.error('Status check failed:', response.status);
          return false;
        }
        
        const data = await response.json();
        console.log('Status check response:', data);
        
        // Check for either 'complete' or 'completed' status for compatibility
        if (data.status === 'complete' || data.status === 'completed') {
          // Enhancement is done
          setUploadStatus('Enhancement complete');
          
          if (data.enhanced_url) {
            setEnhancedImageUrl(data.enhanced_url);
            console.log('Enhanced image URL:', data.enhanced_url);
            
            // Call parent's onImageUpload with enhanced image
            onImageUpload(imageUrl, data.enhanced_url);
          }
          
          return true; // Done
        } else if (data.status === 'failed' || data.status === 'error') {
          // Enhancement failed
          setUploadStatus(`Enhancement failed: ${data.error || 'Unknown error'}`);
          toast({
            title: "Enhancement failed",
            description: data.error || "An unknown error occurred",
            variant: "destructive",
          });
          
          return true; // Done (with error)
        } else {
          // Still processing
          setUploadStatus(`Processing image... (${data.status})`);
          return false; // Not done yet
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setUploadStatus('Error checking status');
        return false;
      }
    };
    
    // Check immediately
    checkStatus().then(isDone => {
      if (!isDone) {
        // If not done, set up interval
        const intervalId = setInterval(async () => {
          const isDone = await checkStatus();
          if (isDone) {
            clearInterval(intervalId);
          }
        }, 2000); // Check every 2 seconds
        
        // Store interval ID for cleanup
        setStatusInterval(intervalId);
      }
    });
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [statusInterval]);

  // Handle reset button click
  const handleReset = () => {
    // Clear all image state
    setImageUrl('');
    setImageId('');
    setEnhancedImageUrl('');
    setUploadedImage(null);
    setUploadStatus('');
    
    // Clear any polling interval
    if (statusInterval) {
      clearInterval(statusInterval);
      setStatusInterval(null);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Call the parent onReset function
    onReset();
    
    // Show toast notification
    toast({
      title: "Reset complete",
      description: "Image has been cleared. You can upload a new one.",
    });
  };

  const handleFileSelect = (file: File) => {
    uploadToB2(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const canEnhance = uploadedImage && enhancementSettings.agreedToBestPractices && !isEnhancing;

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
      {/* Header with Help and Reset buttons */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Input Image</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 px-3 py-1.5 h-8"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Help
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 px-3 py-1.5 h-8"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      {isUploading ? (
        <div className="flex justify-center items-center h-64 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-white mb-2">{uploadStatus || 'Uploading your image...'}</p>
            <p className="text-gray-400 text-sm">This might take a moment</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-lg overflow-hidden bg-gray-800/70">
            {uploadedImage ? (
              <img
                src={uploadedImage.url}
                alt="Uploaded"
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 w-full h-full flex flex-col items-center justify-center ${
                    isDragOver ? 'border-primary bg-primary/10' : 'border-gray-700'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-gray-400 text-sm text-center">
                    Drag & drop your image here or <span className="text-primary">browse</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Supported formats: JPG, PNG, WEBP
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload image"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              </div>
            )}
            {uploadedImage && (
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                <ImageIcon className="h-3 w-3 inline mr-1" />
                {uploadedImage.name}
              </div>
            )}
          </div>

          {/* Crop Recommendation */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-3">
              <a href="#" className="text-primary hover:underline">
                Use Photo Resizer to crop & resize
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Select Enhancement Mode */}
      <div className="mt-6 space-y-4">
        <h3 className="text-white font-medium">Select Enhancement Mode</h3>
        <div className="flex items-center bg-gray-800/50 rounded-xl p-1">
          <button
            onClick={() => setEnhancementSettings((prev: EnhancementSettings) => ({ ...prev, mode: 'standard' }))}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              enhancementSettings.mode === 'standard'
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setEnhancementSettings((prev: EnhancementSettings) => ({ ...prev, mode: 'heavy' }))}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              enhancementSettings.mode === 'heavy'
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Heavy
          </button>
        </div>
        {enhancementSettings.mode === 'standard' && (
          <p className="text-xs text-gray-400">
            Balanced enhancement suitable for most images. Keeps image identity intact.
          </p>
        )}

        {/* Skin Texture Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-white text-sm">Skin Texture Adjuster</label>
            <span className="text-primary text-sm font-medium">{enhancementSettings.skinTexture}</span>
          </div>
          <Slider
            value={[enhancementSettings.skinTexture]}
            onValueChange={([value]) =>
              setEnhancementSettings((prev: EnhancementSettings) => ({ ...prev, skinTexture: value }))
            }
            max={5}
            min={0}
            step={0.01}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Smooth</span>
            <span>Detailed</span>
          </div>
        </div>

        {/* Skin Realism Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-white text-sm">Skin Realism Level</label>
            <span className="text-primary text-sm font-medium">{enhancementSettings.skinRealism}</span>
          </div>
          <Slider
            value={[enhancementSettings.skinRealism]}
            onValueChange={([value]) =>
              setEnhancementSettings((prev: EnhancementSettings) => ({ ...prev, skinRealism: value }))
            }
            max={5}
            min={1}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Stylized</span>
            <span>Realistic</span>
          </div>
        </div>

        {/* Cost and Resolution Info */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-sm text-gray-400">
            <span className="text-primary font-medium">Cost: 0 Credits</span>
            {uploadedImage && (
              <span className="ml-2">928 x 1232 px</span>
            )}
          </p>
        </div>

        {/* Face Parsing Configuration */}
        {faceParsingConfig && onOpenFaceParsingConfig && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white text-sm">Facial Enhancement Areas</label>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenFaceParsingConfig}
                className="text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </Button>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex flex-wrap gap-1">
                {Object.entries(faceParsingConfig)
                  .filter(([_, enabled]) => enabled)
                  .slice(0, 6)
                  .map(([key, _]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key.replace('_', ' ')}
                    </Badge>
                  ))}
                {Object.values(faceParsingConfig).filter(Boolean).length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{Object.values(faceParsingConfig).filter(Boolean).length - 6} more
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {Object.values(faceParsingConfig).filter(Boolean).length} areas selected for enhancement
              </p>
            </div>
          </div>
        )}

        {/* Best Practices Checkbox */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="bestPractices"
            checked={enhancementSettings.agreedToBestPractices}
            onCheckedChange={(checked) =>
              setEnhancementSettings((prev: EnhancementSettings) => ({
                ...prev,
                agreedToBestPractices: checked === true
              }))
            }
          />
          <label htmlFor="bestPractices" className="text-sm text-gray-400 leading-relaxed">
            Yes, I have read the <a href="#" className="text-primary hover:underline">best practices</a>
          </label>
        </div>

        {/* Enhance Button */}
        <div className="space-y-2">
          <Button
            onClick={onEnhance}
            disabled={!canEnhance || isEnhancing}
            className={`w-full ${
              canEnhance && !isEnhancing
                ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Zap className="h-4 w-4 mr-2" />
            {isEnhancing ? 'Enhancing...' : 'Enhance Skin ⚡'}
          </Button>

          {/* Enhancement Status */}
          {enhancementStatus && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-200 text-center">
                {enhancementStatus}
              </p>
            </div>
          )}
        </div>

        {/* Testing Notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <p className="text-xs text-amber-200">
            Use smaller images (512px) for testing. Higher resolution images consume more credits.
          </p>
        </div>
      </div>

      {/* Add debug info section */}
      {uploadedImage && (
        <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-300">
          <details>
            <summary className="cursor-pointer">Debug Information</summary>
            <div className="mt-2 space-y-1">
              <p>Storage Type: {uploadedImage.storageType}</p>
              <p>Status: {uploadedImage.status}</p>
              <p>File Name: {uploadedImage.name}</p>
              <p>File Size: {(uploadedImage.size / 1024).toFixed(2)} KB</p>
              <p>File Type: {uploadedImage.type}</p>
              <p className="break-all">URL: {uploadedImage.url}</p>
              {uploadedImage.originalUrl && uploadedImage.originalUrl !== uploadedImage.url && (
                <p className="break-all">Original URL: {uploadedImage.originalUrl}</p>
              )}
              {uploadedImage.enhancedUrl && (
                <p className="break-all">Enhanced URL: {uploadedImage.enhancedUrl}</p>
              )}
              {uploadedImage.originalEnhancedUrl && uploadedImage.originalEnhancedUrl !== uploadedImage.enhancedUrl && (
                <p className="break-all">Original Enhanced URL: {uploadedImage.originalEnhancedUrl}</p>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default UploadPanel;

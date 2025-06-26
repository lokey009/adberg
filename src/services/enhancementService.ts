import { FaceParsingConfig } from '@/components/skin-logic/FaceParsingConfig';

const API_BASE_URL = 'http://localhost:5001';

export interface EnhancementJob {
  success: boolean;
  job_id: string;
  db_job_id?: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  error?: string;
}

export interface EnhancementStatus {
  success: boolean;
  job_id: string;
  image_id: string;
  original_image_url: string;
  enhanced_image_url?: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  error_message?: string;
  face_parsing_config?: FaceParsingConfig;
  created_at?: string;
  updated_at?: string;
}

export interface EnhancementResult {
  success: boolean;
  job_id: string;
  original_image_url: string;
  enhanced_image_url: string;
  status: 'completed';
  progress: 100;
}

export class EnhancementService {
  
  /**
   * Start a new enhancement job
   */
  static async startEnhancement(
    imageId: string,
    originalImageUrl: string,
    faceParsingConfig: FaceParsingConfig
  ): Promise<EnhancementJob> {
    console.log('🔥 EnhancementService.startEnhancement called');
    console.log('🔥 API_BASE_URL:', API_BASE_URL);
    console.log('🔥 imageId:', imageId);
    console.log('🔥 originalImageUrl:', originalImageUrl);
    console.log('🔥 faceParsingConfig:', faceParsingConfig);
    
    try {
      const requestBody = {
        image_id: imageId,
        original_image_url: originalImageUrl,
        face_parsing_config: faceParsingConfig,
      };
      
      console.log('🔥 Request body:', JSON.stringify(requestBody, null, 2));
      console.log('🔥 Making fetch request to:', `${API_BASE_URL}/skin-studio/enhance`);
      
      const response = await fetch(`${API_BASE_URL}/skin-studio/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔥 Response status:', response.status);
      console.log('🔥 Response ok:', response.ok);

      const data = await response.json();
      console.log('🔥 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Error starting enhancement:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to start enhancement'
      );
    }
  }

  /**
   * Check the status of an enhancement job
   */
  static async checkStatus(jobId: string): Promise<EnhancementStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/skin-studio/enhance/status/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error checking enhancement status:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to check enhancement status'
      );
    }
  }

  /**
   * Download an enhanced image
   */
  static async downloadImage(imageUrl: string, filename: string): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to download image'
      );
    }
  }
} 
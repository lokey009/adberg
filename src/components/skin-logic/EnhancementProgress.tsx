import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface EnhancementStatus {
  success: boolean;
  job_id: string;
  image_id: string;
  original_image_url: string;
  enhanced_image_url?: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

interface EnhancementProgressProps {
  jobId: string;
  onComplete: (result: EnhancementStatus) => void;
  onError: (error: string) => void;
  onRetry?: () => void;
  autoRefresh?: boolean;
}

const statusConfig = {
  processing: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-800 dark:text-blue-200",
    badge: "secondary"
  },
  completed: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-800 dark:text-green-200",
    badge: "default"
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    color: "bg-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-800 dark:text-red-200",
    badge: "destructive"
  }
};

const getStatusMessage = (status: string, progress: number) => {
  switch (status) {
    case 'processing':
      if (progress <= 10) return 'Queuing your enhancement...';
      if (progress <= 30) return 'Initializing AI processing...';
      if (progress <= 60) return 'Enhancing facial features...';
      if (progress <= 90) return 'Finalizing enhancements...';
      return 'Almost ready...';
    case 'completed':
      return 'Enhancement completed successfully!';
    case 'failed':
      return 'Enhancement failed. Please try again.';
    default:
      return 'Processing...';
  }
};

const getEstimatedTime = (progress: number, status: string) => {
  if (status === 'completed') return 'Completed';
  if (status === 'failed') return 'Failed';
  
  // Estimate based on typical 3-4 minute processing time
  const totalEstimatedTime = 240; // 4 minutes in seconds
  const remainingTime = Math.max(0, totalEstimatedTime * (100 - progress) / 100);
  
  if (remainingTime <= 0) return 'Completing...';
  if (remainingTime < 60) return `~${Math.ceil(remainingTime)}s remaining`;
  
  const minutes = Math.ceil(remainingTime / 60);
  return `~${minutes}m remaining`;
};

export default function EnhancementProgress({ 
  jobId, 
  onComplete, 
  onError, 
  onRetry,
  autoRefresh = true 
}: EnhancementProgressProps) {
  const [status, setStatus] = useState<EnhancementStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5001/skin-studio/enhance/status/${jobId}`);
      const data = await response.json();

      if (data.success) {
        setStatus(data);
        setError(null);
        setLastUpdate(new Date());

        // Handle completion or failure
        if (data.status === 'completed') {
          onComplete(data);
        } else if (data.status === 'failed') {
          onError(data.error_message || 'Enhancement failed');
        }
      } else {
        setError(data.error || 'Failed to check status');
        onError(data.error || 'Failed to check status');
      }
    } catch (err) {
      const errorMessage = `Network error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;

    // Initial status check
    checkStatus();

    if (!autoRefresh) return;

    // Set up polling for status updates
    const interval = setInterval(() => {
      if (status?.status === 'processing') {
        checkStatus();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [jobId, status?.status, autoRefresh]);

  const config = status ? statusConfig[status.status] : statusConfig.processing;

  if (error && !status) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert className={config.bgColor}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          {onRetry && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={onRetry} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {config.icon}
            Enhancement Progress
          </div>
          <Badge variant={config.badge as "default" | "secondary" | "destructive" | "outline"}>
            {status?.status?.toUpperCase() || 'PROCESSING'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              {getStatusMessage(status?.status || 'processing', status?.progress || 0)}
            </span>
            <span className="text-muted-foreground">
              {status?.progress || 0}%
            </span>
          </div>
          <Progress 
            value={status?.progress || 0} 
            className="h-3"
            // Apply custom styling based on status
            style={{
              '--progress-foreground': config.color
            } as React.CSSProperties}
          />
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Estimated Time:</span>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              <span>{getEstimatedTime(status?.progress || 0, status?.status || 'processing')}</span>
            </div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Job ID:</span>
            <div className="font-mono text-xs mt-1 truncate">
              {jobId}
            </div>
          </div>
        </div>

        {/* Image Info */}
        {status?.image_id && (
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Image:</span>
            <div className="mt-1 truncate">
              {status.image_id}
            </div>
          </div>
        )}

        {/* Error Message */}
        {status?.error_message && (
          <Alert className={statusConfig.failed.bgColor}>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {status.error_message}
            </AlertDescription>
          </Alert>
        )}

        {/* Last Update */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Last updated: {lastUpdate.toLocaleTimeString()}
          {isLoading && (
            <span className="ml-2">
              <Loader2 className="h-3 w-3 inline animate-spin" />
            </span>
          )}
        </div>

        {/* Retry Button for Failed Status */}
        {status?.status === 'failed' && onRetry && (
          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={onRetry} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Manual Refresh for Processing */}
        {status?.status === 'processing' && (
          <div className="flex justify-center pt-2">
            <Button 
              variant="ghost" 
              onClick={checkStatus} 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
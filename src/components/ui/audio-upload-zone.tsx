"use client";

import { useCallback, useState } from "react";
import { Upload, X, Music, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AudioUploadZoneProps {
  value?: File | string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

const ACCEPTED_AUDIO_TYPES = ["audio/mp3", "audio/mpeg", "audio/aac", "audio/wav"];
const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB

export function AudioUploadZone({
  value,
  onChange,
  disabled = false,
  className,
}: AudioUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_AUDIO_TYPES.includes(file.type)) {
      return "Please upload an MP3, AAC, or WAV file";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 150MB";
    }
    return null;
  };

  const simulateUpload = useCallback((file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onChange(file);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onChange]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    simulateUpload(file);
  }, [simulateUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    onChange(null);
    setUploadProgress(0);
    setError(null);
  }, [onChange]);

  const currentFile = value instanceof File ? value : null;
  const hasFile = currentFile || (typeof value === "string" && value);

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200",
          "hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          isDragOver && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive bg-destructive/5",
          hasFile && "border-green-500 bg-green-50 dark:bg-green-950/20"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={ACCEPTED_AUDIO_TYPES.join(",")}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Upload audio file"
        />

        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {isUploading ? (
            <>
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <Progress 
                    value={uploadProgress} 
                    className="w-12 h-12 rounded-full"
                    aria-label={`Upload progress: ${Math.round(uploadProgress)}%`}
                  />
                </div>
                <Music className="absolute inset-0 m-auto w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Uploading audio...</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(uploadProgress)}% complete
                </p>
              </div>
            </>
          ) : hasFile ? (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Audio uploaded successfully
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentFile?.name || "Audio file attached"}
                </p>
                {currentFile && (
                  <p className="text-xs text-muted-foreground">
                    {(currentFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="mt-2"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drag and drop your audio file here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse files
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports MP3, AAC, WAV (max 150MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

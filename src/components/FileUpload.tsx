import { useState, useRef } from "react";
import { Upload, X, Check, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImagePreviewModal } from "./ImagePreviewModal";
import Image from "next/image";

interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  onFileSelect: (file: File | null) => void;
  error?: string;
  maxSize?: number; // in MB
  preview?: boolean;
  imageUrl?: string;
  file: File | null;
  previewUrl: string | null;
  onRemove: () => void;
}

export const FileUpload = ({ 
  id,
  label, 
  accept = "image/*", 
  onFileSelect, 
  error, 
  maxSize = 5,
  preview = true,
  imageUrl,
  file,
  previewUrl,
  onRemove
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > maxSize * 1024 * 1024) {
      onFileSelect(null);
      return;
    }
    onFileSelect(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const removeFile = () => {
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200",
          isDragOver ? "border-primary bg-primary/5" : "border-border",
          error ? "border-destructive" : "",
          "hover:border-primary/50 hover:bg-muted/20"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {previewUrl || imageUrl ? (
          <div className="flex flex-col sm:flex-row items-center justify-between sm:space-y-0 space-y-4">
              <div className="flex items-center space-x-3">
                <Image 
                  src={previewUrl || imageUrl || ''} 
                  alt="Preview" 
                  width={96}
                  height={96}
                  unoptimized={true}
                  className="w-24 h-24 object-cover rounded-md border"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{file ? file.name : 'Current Image'}</p>
                  {file && (
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                  {(previewUrl || imageUrl) && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {e.stopPropagation(); setIsModalOpen(true);}}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={file ? removeFile : () => fileInputRef.current?.click()}
                className="text-muted-foreground hover:text-destructive w-full sm:w-auto"
              >
                {file ? <X className="w-4 h-4" /> : 'Replace'}
              </Button>
            </div>
        ) : (
          <label htmlFor={id} className="text-center cursor-pointer">
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              Drop your file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: {maxSize}MB • {accept.replace('image/', '').toUpperCase()} files
            </p>
          </label>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <ImagePreviewModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        imageUrl={previewUrl || imageUrl || ''}
        fileName={file?.name}
      />
    </div>
  );
};
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  imageUrl: string;
  fileName?: string;
}

export const ImagePreviewModal = ({ isOpen, onOpenChange, imageUrl, fileName }: ImagePreviewModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{fileName || 'Image Preview'}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <img src={imageUrl} alt="Preview" className="w-full h-auto object-contain rounded-md" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import "cropperjs/dist/cropper.css";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { CropIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import Cropper, { ReactCropperElement } from "react-cropper";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";
import { useLogger } from "@/lib/hooks/useLogger";

export enum ImageType {
  AVATAR = "avatar",
  LOGO = "logo",
  BANNER = "banner",
  POSTER = "poster",
}

const IMAGE_DIMENSIONS: Record<
  ImageType,
  { aspectRatio: number; minWidth: number; minHeight: number }
> = {
  [ImageType.AVATAR]: { aspectRatio: 1, minWidth: 200, minHeight: 200 },
  [ImageType.LOGO]: { aspectRatio: 1, minWidth: 300, minHeight: 300 },
  [ImageType.BANNER]: { aspectRatio: 16 / 9, minWidth: 1200, minHeight: 675 },
  [ImageType.POSTER]: { aspectRatio: 2 / 3, minWidth: 1000, minHeight: 1500 },
};

export type FileWithPreview = File & { preview: string };

interface ImageCropperProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFile: FileWithPreview | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  onImageEdited: (item: Blob) => void;
  imageType?: ImageType;
  imageAspectRatio?: number;
}

export default function ImageCropper({
  dialogOpen,
  setDialogOpen,
  selectedFile,
  setSelectedFile,
  onImageEdited,
  imageType = ImageType.AVATAR,
  imageAspectRatio,
}: Readonly<ImageCropperProps>) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [croppedImage, setCroppedImage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const MAX_FILE_SIZE = 70 * 1024 * 1024; // 70MB
  const logger = useLogger({ context: "ImageCropper" });
  const dimensions = IMAGE_DIMENSIONS[imageType];
  const aspectRatio = imageAspectRatio ?? dimensions.aspectRatio;

  const getCropData = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      setIsLoading(true);
      logger.info("Starting image crop process", { imageType, aspectRatio });

      cropperRef.current?.cropper.getCroppedCanvas().toBlob(async (blob) => {
        if (!blob) {
          logger.error("Failed to get cropped canvas blob");
          setIsLoading(false);
          return;
        }
        // Convert to WebP format
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new window.Image();

        img.onload = async () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          canvas.toBlob(
            async (webpBlob) => {
              if (!webpBlob) {
                logger.error("Failed to convert to WebP format");
                setIsLoading(false);
                return;
              }
              if (webpBlob.size > MAX_FILE_SIZE) {
                const errorMsg =
                  "Image size is too large. Please try a smaller image or crop further.";
                logger.warn(errorMsg, {
                  size: webpBlob.size,
                  maxSize: MAX_FILE_SIZE,
                });
                toast.error(errorMsg);
                setIsLoading(false);
                return;
              }
              setCroppedImage(URL.createObjectURL(webpBlob));
              onImageEdited(webpBlob);
              setDialogOpen(false);
              setIsLoading(false);

              // Track successful crop event
              trackEvent({
                event: "image_cropped",
                imageType,
                aspectRatio,
                finalSize: webpBlob.size,
                dimensions: {
                  width: img.width,
                  height: img.height,
                },
              });

              logger.info("Image successfully cropped and converted", {
                imageType,
                size: webpBlob.size,
                dimensions: {
                  width: img.width,
                  height: img.height,
                },
              });
            },
            "image/webp",
            0.8
          );
        };
        img.src = URL.createObjectURL(blob);
      }, "image/webp");
    }
  };

  // Track dialog open/close events
  React.useEffect(() => {
    if (dialogOpen) {
      trackEvent({
        event: "image_cropper_opened",
        imageType,
      });
      logger.info("Image cropper dialog opened", { imageType });
    }
  }, [dialogOpen, imageType]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Avatar className="size-36 cursor-pointer ring-2 ring-slate-200 ring-offset-2">
          <AvatarImage src={croppedImage ?? selectedFile?.preview} alt="" />
        </Avatar>
      </DialogTrigger>
      <DialogContent className="gap-0 p-0">
        <DialogHeader className="items-center p-4">
          <DialogTitle>Image Editor</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <Separator />
        <div className="size-full p-6">
          <Cropper
            src={selectedFile?.preview}
            style={{ height: 400, width: "100%" }}
            aspectRatio={aspectRatio}
            guides={false}
            minCropBoxHeight={dimensions.minHeight}
            minCropBoxWidth={dimensions.minWidth}
            background={false}
            responsive={true}
            ref={cropperRef}
          />
        </div>
        <DialogFooter className="flex flex-row items-center p-6 pt-0">
          <DialogClose asChild>
            <Button
              size="sm"
              type="reset"
              className="w-fit"
              variant="outline"
              onClick={() => setSelectedFile(null)}
              disabled={isLoading}
            >
              <Trash2Icon className="mr-1.5 size-4" />
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            size="sm"
            className="w-fit"
            onClick={getCropData}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-1.5 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CropIcon className="mr-1.5 size-4" />
                Crop
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { ChevronLeft, ChevronRight, Download, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { EventMedia } from "@/types/event";
import Image from "next/image";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";

interface EventGalleryProps {
  mediaGallery: EventMedia[];
  eventTitle: string;
  eventId?: string;
  coverImage?: string | null;
}

const EventGallery: React.FC<EventGalleryProps> = ({
  mediaGallery,
  eventTitle,
  eventId,
  coverImage,
}) => {
  const analytics = useAnalytics();
  const logger = useLogger({ context: "EventGallery" });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const imageErrorsRef = useRef<Set<number>>(new Set());

  // Create combined array with cover image first, then gallery images
  const galleryImages =
    mediaGallery?.filter(
      (media) => media.media_type === "IMAGE" && media.is_public
    ) || [];

  // Create combined images array with cover image as first item if it exists
  const allImages = [
    ...(coverImage
      ? [
          {
            id: "cover-image",
            file_url: coverImage,
            alt_text: `${eventTitle} - Cover Image`,
            media_type: "IMAGE" as const,
            is_public: true,
          },
        ]
      : []),
    ...galleryImages,
  ];

  // Use allImages for the gallery, but separate for analytics
  const images = allImages;

  const handleImageError = useCallback((index: number) => {
    imageErrorsRef.current.add(index);
  }, []);

  const handleMainImageClick = useCallback(() => {
    setIsModalOpen(true);

    analytics.trackEvent({
      event: "gallery_main_image_click",
      event_id: eventId,
      event_name: eventTitle,
      image_index: selectedImageIndex,
      image_url: images[selectedImageIndex]?.file_url,
    });

    logger.info("Gallery main image clicked", {
      event_id: eventId,
      event_name: eventTitle,
      image_index: selectedImageIndex,
    });
  }, [analytics, logger, eventId, eventTitle, selectedImageIndex, images]);

  const handleThumbnailClick = useCallback(
    (index: number) => {
      setSelectedImageIndex(index);

      analytics.trackEvent({
        event: "gallery_thumbnail_click",
        event_id: eventId,
        event_name: eventTitle,
        image_index: index,
        image_url: images[index]?.file_url,
      });

      logger.info("Gallery thumbnail clicked", {
        event_id: eventId,
        event_name: eventTitle,
        image_index: index,
      });
    },
    [analytics, logger, eventId, eventTitle, images]
  );

  const handlePreviousImage = useCallback(() => {
    const newIndex =
      selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1;
    setSelectedImageIndex(newIndex);

    analytics.trackEvent({
      event: "gallery_navigation",
      event_id: eventId,
      event_name: eventTitle,
      direction: "previous",
      image_index: newIndex,
    });
  }, [selectedImageIndex, images.length, analytics, eventId, eventTitle]);

  const handleNextImage = useCallback(() => {
    const newIndex =
      selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0;
    setSelectedImageIndex(newIndex);

    analytics.trackEvent({
      event: "gallery_navigation",
      event_id: eventId,
      event_name: eventTitle,
      direction: "next",
      image_index: newIndex,
    });
  }, [selectedImageIndex, images.length, analytics, eventId, eventTitle]);

  const handleDownloadImage = useCallback(() => {
    const currentImage = images[selectedImageIndex];
    if (currentImage?.file_url) {
      const link = document.createElement("a");
      link.href = currentImage.file_url;
      link.download = `${eventTitle}_image_${selectedImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      analytics.trackEvent({
        event: "gallery_image_download",
        event_id: eventId,
        event_name: eventTitle,
        image_url: currentImage.file_url,
      });
    }
  }, [selectedImageIndex, images, eventTitle, analytics, eventId]);

  // Don't render if no images
  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[selectedImageIndex];
  const thumbnailImages = images.slice(0, 6); // Show first 6 as thumbnails

  return (
    <div className="w-full mb-6 sm:mb-8">
      {/* Main Image Display */}
      <div className="relative w-full mb-4">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <div
              className="relative w-full rounded-lg sm:rounded-xl overflow-hidden transition-transform duration-500 ease-in-out hover:scale-[1.02] cursor-pointer group"
              onClick={handleMainImageClick}
            >
              {currentImage &&
              !imageErrorsRef.current.has(selectedImageIndex) ? (
                <Image
                  src={currentImage.file_url}
                  alt={currentImage.alt_text || `${eventTitle} - Event Gallery`}
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "auto",
                    maxHeight: "70vh",
                    backgroundColor: "#18181b",
                  }}
                  className="transition-opacity duration-300 ease-in-out group-hover:opacity-90 rounded-lg sm:rounded-xl"
                  priority
                  onError={() => handleImageError(selectedImageIndex)}
                />
              ) : (
                <Image
                  src="/images/placeholdere.jpeg"
                  alt="Default event image"
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "auto",
                    maxHeight: "70vh",
                    backgroundColor: "#18181b",
                  }}
                  className="transition-opacity duration-300 ease-in-out group-hover:opacity-90 rounded-lg sm:rounded-xl"
                  priority
                />
              )}

              {/* Overlay with zoom icon and image count */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 ease-in-out flex items-center justify-center pointer-events-none">
                <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex items-center gap-3">
                  <div className="bg-black/50 rounded-full p-2 sm:p-3 backdrop-blur-sm">
                    <ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  {/* {images.length > 1 && (
                    <div className="bg-black/50 rounded-full px-3 py-2 backdrop-blur-sm">
                      <span className="text-white text-sm sm:text-base font-medium">
                        {images.length} images
                      </span>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </DialogTrigger>

          {/* Full Screen Modal */}
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black border-none overflow-hidden">
            <DialogTitle className="sr-only">
              {eventTitle} - Gallery Image {selectedImageIndex + 1}
            </DialogTitle>
            <div className="relative w-full h-full flex flex-col">
              {/* Navigation Controls */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12"
                    onClick={handlePreviousImage}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Download Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-16 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12"
                onClick={handleDownloadImage}
              >
                <Download className="w-6 h-6" />
              </Button>

              {/* Main Image in Modal - Auto-sizing container */}
              <div className="flex items-center justify-center min-h-0 flex-1 p-4">
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <Image
                    src={
                      images[selectedImageIndex]?.file_url ||
                      "/images/placeholdere.jpeg"
                    }
                    alt={
                      images[selectedImageIndex]?.alt_text ||
                      `${eventTitle} - Gallery Image ${selectedImageIndex + 1}`
                    }
                    width={1200}
                    height={800}
                    sizes="95vw"
                    style={{
                      width: "auto",
                      height: "auto",
                      maxWidth: "90vw",
                      maxHeight: "85vh",
                      objectFit: "contain",
                    }}
                    className="block"
                  />
                </div>
              </div>

              {/* Image Counter and Navigation Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                  <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    {selectedImageIndex + 1} of {images.length}
                  </span>
                  <div className="flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === selectedImageIndex
                            ? "bg-white"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {thumbnailImages.map((image, index) => {
            const isSelected = index === selectedImageIndex;
            const hasError = imageErrorsRef.current.has(index);

            return (
              <div
                key={`${image.id}-${index}`}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 ${
                  isSelected
                    ? "ring-2 ring-blue-500"
                    : "hover:ring-2 hover:ring-blue-300"
                }`}
                onClick={() => handleThumbnailClick(index)}
              >
                <Image
                  src={hasError ? "/images/placeholdere.jpeg" : image.file_url}
                  alt={
                    image.alt_text ||
                    `${eventTitle} - Gallery Thumbnail ${index + 1}`
                  }
                  fill
                  sizes="(max-width: 640px) 33vw, 16vw"
                  style={{ objectFit: "cover" }}
                  className="transition-opacity duration-300"
                  onError={() => handleImageError(index)}
                />

                {/* Overlay for non-first images */}
                {index === 0 && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}

                {/* Show more indicator for 6th thumbnail if there are more images */}
                {index === 5 && images.length > 6 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      +{images.length - 6}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventGallery;

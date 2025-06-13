import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Camera, CameraOff, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Result } from "@zxing/library";

interface QRScannerProps {
  onScan: (data: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export function QRScanner({ onScan, isActive, onToggle }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const startScanner = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setIsScanning(true);

        // Initialize QR code reader
        const codeReader = new BrowserQRCodeReader();

        // Start scanning
        controlsRef.current = await codeReader.decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current,
          (result: Result | undefined, error: Error | undefined) => {
            if (result) {
              // Stop scanning after successful scan
              stopScanner();
              onScan(result.getText());
            }
            if (
              error &&
              error.message !==
                "No MultiFormat Readers were able to detect the code."
            ) {
              console.error("Scanning error:", error);
            }
          }
        );
      }
    } catch (err) {
      setError("Camera access denied or not available");
      setHasPermission(false);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => stopScanner();
  }, [isActive]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">QR Code Scanner</h3>
        <Button
          onClick={onToggle}
          variant={isActive ? "destructive" : "default"}
          className="gap-2"
        >
          {isActive ? (
            <>
              <CameraOff className="h-4 w-4" />
              Stop Scanner
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              Start Scanner
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          <Button
            onClick={startScanner}
            variant="ghost"
            size="sm"
            className="mt-2 text-destructive hover:text-destructive/90"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      <div className="relative">
        {isActive ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-muted rounded-lg object-cover"
            />
            <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
            </div>
            {isScanning && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-sm">
                Scanning...
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Camera not active</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        <p>• Point the camera at a QR code to scan</p>
        <p>• Ensure good lighting for best results</p>
        <p>• Hold steady until the code is detected</p>
      </div>
    </div>
  );
}

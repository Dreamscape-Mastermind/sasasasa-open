"use client";

import { AlertCircle, Camera, RotateCcw } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { useEffect, useRef, useState } from "react";
import { X } from "@/components/social-icons/icons";

interface QRScanResult {
  text: string;
  timestamp: Date;
  format?: string;
}

interface QRScannerProps {
  onScan: (result: QRScanResult) => void;
  isActive: boolean;
  onToggle: () => void;
  className?: string;
  fullscreen?: boolean;
}

export function QRScanner({
  onScan,
  isActive,
  onToggle,
  className = "",
  fullscreen = false,
}: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Initialize the QR code reader
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    // Get available video devices
    readerRef.current
      .listVideoInputDevices()
      .then((videoDevices) => {
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          // Prefer back camera on mobile devices
          const backCamera = videoDevices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear") ||
              device.label.toLowerCase().includes("environment")
          );
          setSelectedDeviceId(backCamera?.deviceId || videoDevices[0].deviceId);
        }
      })
      .catch((err) => {
        console.error("Error listing video devices:", err);
        setError("Failed to access camera devices");
      });

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, []);

  // Start scanning
  const startScanning = async () => {
    if (!readerRef.current || !videoRef.current) return;

    try {
      setError("");
      setIsScanning(true);
      setHasPermission(null);

      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: selectedDeviceId ? undefined : { ideal: "environment" },
          width: { ideal: fullscreen ? 1920 : 640 },
          height: { ideal: fullscreen ? 1080 : 480 },
        },
      };

      await readerRef.current.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scanResult: QRScanResult = {
              text: result.getText(),
              timestamp: new Date(),
              format: result.getBarcodeFormat()?.toString(),
            };
            setScanResult(scanResult);
            onScan(scanResult);
          }

          if (error && !(error instanceof NotFoundException)) {
            console.error("Scanning error:", error);
            setError("Scan failed. Please try again.");
          }
        }
      );

      setHasPermission(true);
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setIsScanning(false);
      setHasPermission(false);

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError(
            "Camera access denied. Please allow camera access and try again."
          );
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          setError("Camera is already in use by another application.");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError(
          "Failed to start camera. Please check your camera permissions."
        );
      }
    }
  };

  // Stop scanning
  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Handle toggle
  useEffect(() => {
    if (isActive && !isScanning) {
      startScanning();
    } else if (!isActive && isScanning) {
      stopScanning();
    }
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const handleRetry = () => {
    setError("");
    setHasPermission(null);
    startScanning();
  };

  const containerClasses = fullscreen
    ? "fixed inset-0 z-50 bg-black flex flex-col justify-center items-center p-0 m-0"
    : `bg-muted rounded-lg ${className}`;

  return (
    <div className={containerClasses}>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-[#CC322D]/10 border border-[#CC322D] rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-[#CC322D]" />
            <p className="text-sm text-[#CC322D]">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="mt-2 flex items-center text-sm text-[#CC322D] hover:text-[#a8231b]"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Try Again
          </button>
        </div>
      )}

      {/* Close Fullscreen Button */}
      {fullscreen && (
        <button
          onClick={onToggle}
          className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 rounded-full p-2"
          aria-label="Close Scanner"
        >
          <X className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Scanner Content */}
      <div className="relative">
        {isActive ? (
          <div className="relative">
            <video
              ref={videoRef}
              className={
                fullscreen
                  ? "w-screen h-screen object-cover"
                  : "w-full h-64 md:h-80 rounded-lg object-cover bg-muted"
              }
              playsInline
              muted
            />

            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 border-2 border-[#CC322D] rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-[#CC322D]"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-[#CC322D]"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-[#CC322D]"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-[#CC322D]"></div>

                {/* Scanning line animation */}
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-[#CC322D] opacity-75 animate-pulse"></div>
              </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm bg-[#CC322D] bg-opacity-90 text-white">
              {isScanning
                ? "Scanning for QR codes..."
                : "Position QR code in frame"}
            </div>

            {/* Device Selection */}
            {devices.length > 1 && (
              <div className="absolute top-4 left-4">
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="text-sm rounded px-2 py-1 bg-muted text-primary border border-[#CC322D]"
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${devices.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 md:h-80 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-primary mb-3">Camera not active</p>
              <p className="text-sm text-muted-foreground">
                Click "Start Scanner" to begin scanning
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="hidden md:block mt-4 px-4 text-sm text-muted-foreground">
        <p>• Point the camera at a QR code to scan</p>
        <p>• Ensure good lighting for best results</p>
        <p>• Hold steady until the code is detected</p>
      </div>
    </div>
  );
}

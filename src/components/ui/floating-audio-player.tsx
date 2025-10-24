"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface FloatingAudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export function FloatingAudioPlayer({
  src,
  title = "Audio",
  className,
  onPlay,
  onPause,
  onEnded,
}: FloatingAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      onPause?.();
    } else {
      audioRef.current.play();
      onPlay?.();
    }
  }, [isPlaying, onPlay, onPause]);

  const handleSeek = useCallback((value: number[]) => {
    if (!audioRef.current) return;
    const newTime = (value[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0] / 100;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handleSkip = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [currentTime, duration]);

  const handleSpeedChange = useCallback(() => {
    if (!audioRef.current) return;
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newRate = speeds[nextIndex];
    
    audioRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  }, [playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsVisible(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      
      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleSkip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSkip(10);
          break;
        case "m":
        case "M":
          e.preventDefault();
          handleMuteToggle();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onEnded]);

  if (!isVisible) {
    return (
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="sr-only"
        aria-label={`Audio player for ${title}`}
      />
    );
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="sr-only"
        aria-label={`Audio player for ${title}`}
      />
      
      <div
        className={cn(
          "fixed bottom-4 left-4 right-4 z-50 bg-background/95 backdrop-blur-sm",
          "border border-border rounded-lg shadow-lg p-3 transition-all duration-300",
          "md:left-auto md:right-4 md:w-96 md:max-w-sm",
          "animate-in slide-in-from-bottom-2 fade-in-0",
          "focus-within:ring-2 focus-within:ring-primary/20",
          className
        )}
        role="region"
        aria-label="Audio player"
        aria-live="polite"
        tabIndex={-1}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            className="shrink-0 h-10 w-10 rounded-full"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium truncate" title={title}>
                {title}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeedChange}
                className="h-6 px-2 text-xs shrink-0"
                aria-label={`Playback speed: ${playbackRate}x`}
              >
                {playbackRate}x
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSkip(-10)}
                className="h-6 w-6 p-0 shrink-0"
                aria-label="Skip back 10 seconds"
              >
                <SkipBack className="h-3 w-3" />
              </Button>

              <div className="flex-1 space-y-1">
                <Slider
                  value={[progressPercentage]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                  aria-label="Audio progress"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSkip(10)}
                className="h-6 w-6 p-0 shrink-0"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMuteToggle}
              className="h-8 w-8 p-0"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-16"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </>
  );
}

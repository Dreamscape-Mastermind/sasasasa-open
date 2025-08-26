"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Switch } from "./switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { useConsent, type ConsentPreferences } from "@/contexts/ConsentContext";

export function CookieBanner() {
  const { showBanner, grantConsent, denyConsent, isLoading } = useConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<ConsentPreferences>({
    analytics: true,
    functional: true,
    marketing: false,
  });

  // Mobile detection for enhanced mobile experience
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't show Ebanner while loading or if banner shouldn't be shown
  if (isLoading || !showBanner) return null;

  const handleAcceptAll = () => {
    grantConsent({
      analytics: true,
      functional: true,
      marketing: false,
    });
  };

  const handleAcceptSelected = () => {
    grantConsent(tempPreferences);
    setShowDetails(false);
  };

  const handleDenyAll = () => {
    denyConsent();
  };

  return (
    <>
      {/* Mobile-first cookie banner */}
      <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
        <Card className="mx-auto max-w-4xl border border-white/20 bg-background/90 backdrop-blur-xl shadow-2xl dark:border-white/10 dark:bg-background/80">
          {/* Mobile Layout (< 640px) */}
          <div className="p-3 sm:hidden">
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold leading-tight">
                  We value your privacy
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  We use analytics to improve your experience.
                </p>
              </div>
              
              {/* Mobile button layout - compact and thumb-friendly */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleAcceptAll}
                  className="flex-1 h-9 text-xs font-medium"
                >
                  Accept
                </Button>
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 px-3 text-xs font-medium"
                    >
                      Options
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDenyAll}
                  className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  Decline
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout (≥ 640px) */}
          <div className="hidden p-6 sm:block">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">We value your privacy</h3>
                <p className="text-sm text-muted-foreground">
                  We use telemetry analytics and cookies to improve your experience and analyze how our service is used. 
                  Your data helps us make our platform better for everyone.
                </p>
              </div>
              
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 sm:flex-shrink-0">
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 px-4">
                      Customize
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                <Button variant="outline" size="sm" onClick={handleDenyAll} className="h-9 px-4">
                  Decline
                </Button>
                <Button size="sm" onClick={handleAcceptAll} className="h-9 px-6">
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Preferences dialog - different approaches for mobile vs desktop */}
      {isMobile ? (
        /* Custom mobile modal */
        showDetails && (
          <div className="fixed inset-0 z-[100] flex items-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDetails(false)}
            />
            
            {/* Mobile modal content */}
            <div className="relative w-full bg-background/95 backdrop-blur-xl border-t border-white/20 dark:border-white/10 rounded-t-2xl p-4 max-h-[80vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-base font-semibold">Privacy Preferences</h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="space-y-4 py-4 overflow-y-auto max-h-[50vh]">
                {/* Essential */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Essential</p>
                    <p className="text-xs text-muted-foreground">Required for basic functionality</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                
                {/* Analytics */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Analytics</p>
                    <p className="text-xs text-muted-foreground">Help us improve your experience</p>
                  </div>
                  <Switch
                    checked={tempPreferences.analytics}
                    onCheckedChange={(checked) =>
                      setTempPreferences(prev => ({ ...prev, analytics: checked }))
                    }
                  />
                </div>
                
                {/* Marketing */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">Marketing</p>
                    <p className="text-xs text-muted-foreground">Personalized content and ads</p>
                  </div>
                  <Switch
                    checked={tempPreferences.marketing}
                    onCheckedChange={(checked) =>
                      setTempPreferences(prev => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-2 pt-3 border-t border-white/10">
                <Button 
                  onClick={handleAcceptSelected} 
                  className="flex-1 h-10 text-sm"
                >
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDenyAll}
                  className="h-10 px-4 text-sm"
                >
                  Deny All
                </Button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Desktop dialog */
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-md border border-white/20 bg-background/95 backdrop-blur-xl shadow-2xl dark:border-white/10 dark:bg-background/90">
            <DialogHeader>
              <DialogTitle>Privacy Preferences</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Essential */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Essential</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Required for basic functionality
                  </p>
                </div>
                <Switch checked={true} disabled className="flex-shrink-0" />
              </div>
              
              {/* Analytics */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Analytics</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Help us improve your experience
                  </p>
                </div>
                <Switch
                  checked={tempPreferences.analytics}
                  onCheckedChange={(checked) =>
                    setTempPreferences(prev => ({ ...prev, analytics: checked }))
                  }
                  className="flex-shrink-0"
                />
              </div>
              
              {/* Marketing */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Marketing</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Personalized content and ads
                  </p>
                </div>
                <Switch
                  checked={tempPreferences.marketing}
                  onCheckedChange={(checked) =>
                    setTempPreferences(prev => ({ ...prev, marketing: checked }))
                  }
                  className="flex-shrink-0"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleAcceptSelected} 
                className="flex-1"
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDenyAll}
              >
                Deny All
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
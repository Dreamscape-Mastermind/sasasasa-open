"use client";

import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "@/lib/constants";
import { usePreferences } from "@/hooks/usePreferences";
import { cookieService } from "@/services/cookie.service";
import { createContext, useContext, useCallback, useEffect, useState, useRef } from "react";

export type ConsentPreferences = {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

type ConsentStatus = 'pending' | 'granted' | 'denied';

interface ConsentContextType {
  consentStatus: ConsentStatus;
  preferences: ConsentPreferences;
  showBanner: boolean;
  grantConsent: (preferences: ConsentPreferences) => void;
  denyConsent: () => void;
  updatePreferences: (preferences: Partial<ConsentPreferences>) => void;
  hasAnalyticsConsent: () => boolean;
  resetConsent: () => void;
  isLoading: boolean;
}

const defaultPreferences: ConsentPreferences = {
  analytics: false,
  functional: true, // Always allow functional cookies
  marketing: false,
};

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');
  const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Track initialization state to prevent loops
  const initializationCompleteRef = useRef(false);
  const isInitializingRef = useRef(false);
  
  // Check authentication once
  useEffect(() => {
    setIsAuthenticated(!!cookieService.getTokens()?.result?.access);
  }, []);
  
  const { useConsentPreferences, useUpdateConsent } = usePreferences();
  
  // Backend consent data - only load when authenticated
  const { data: backendConsent, isLoading: isBackendLoading, error: backendError } = useConsentPreferences({
    enabled: isAuthenticated
  });
  const updateConsentMutation = useUpdateConsent();

  // Initial load from localStorage - runs once only
  useEffect(() => {
    if (initializationCompleteRef.current) return;
    
    const loadLocalConsent = () => {
      setIsLoading(true);
      
      try {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
        
        if (stored) {
          const { preferences: storedPrefs, version, timestamp } = JSON.parse(stored);
          
          // Check if consent is still valid (within 1 year)
          const oneYear = 365 * 24 * 60 * 60 * 1000;
          const isValid = version === CONSENT_VERSION && 
                          Date.now() - timestamp < oneYear;
          
          if (isValid) {
            setPreferences(storedPrefs);
            setConsentStatus('granted');
            setShowBanner(false);
            setIsLoading(false);
            return;
          }
        }
        
        // No valid local consent - show banner
        setShowBanner(true);
        setIsLoading(false);
      } catch (error) {
        console.warn('Failed to load local consent:', error);
        setShowBanner(true);
        setIsLoading(false);
      }
    };

    loadLocalConsent();
  }, []); // Empty dependency - run once only

  // Sync with backend when data becomes available - separate from initialization
  useEffect(() => {
    // Skip if not authenticated or still loading backend data
    if (!isAuthenticated || isBackendLoading || isInitializingRef.current) {
      return;
    }

    // Skip if we haven't completed local initialization
    if (isLoading) {
      return;
    }

    const syncWithBackend = async () => {
      isInitializingRef.current = true;
      
      try {
        // Backend has consent data - use it as source of truth
        if (backendConsent && !backendError) {
          const backendConsentData = backendConsent.consent;
          
          if (backendConsentData) {
            const backendPrefs = backendConsentData.preferences;
            setPreferences(backendPrefs);
            setConsentStatus('granted');
            setShowBanner(false);
            
            // Update localStorage to match backend
            const consentData = {
              preferences: backendPrefs,
              version: backendConsentData.version,
              timestamp: backendConsentData.timestamp,
            };
            localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
          } else {
            // Backend has no consent data - check if we have local data to sync
            const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
            if (stored) {
              const { preferences: localPrefs } = JSON.parse(stored);
              
              // Don't trigger sync if backend might refetch - just update backend silently
              try {
                await updateConsentMutation.mutateAsync({
                  preferences: localPrefs,
                  version: CONSENT_VERSION,
                });
              } catch (error) {
                console.warn('Failed to sync local consent to backend:', error);
              }
            }
          }
        } else if (backendError) {
          // Backend error - continue with local storage behavior
          console.warn('Backend consent fetch failed:', backendError);
        }
      } catch (error) {
        console.warn('Failed to sync with backend:', error);
      } finally {
        isInitializingRef.current = false;
        initializationCompleteRef.current = true;
      }
    };

    syncWithBackend();
  }, [isAuthenticated, backendConsent, backendError, isBackendLoading, isLoading, updateConsentMutation]);

  const saveConsent = useCallback((prefs: ConsentPreferences) => {
    try {
      const consentData = {
        preferences: prefs,
        version: CONSENT_VERSION,
        timestamp: Date.now(),
      };
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    } catch (error) {
      console.warn('Failed to save consent preferences:', error);
    }
  }, []);

  const grantConsent = useCallback(async (prefs: ConsentPreferences) => {
    setPreferences(prefs);
    setConsentStatus('granted');
    setShowBanner(false);
    saveConsent(prefs);
    
    // Sync to backend if authenticated (don't await to avoid blocking UI)
    if (isAuthenticated) {
      try {
        updateConsentMutation.mutate({
          preferences: prefs,
          version: CONSENT_VERSION,
        });
      } catch (error) {
        console.warn('Failed to sync consent to backend:', error);
      }
    }
  }, [saveConsent, updateConsentMutation, isAuthenticated]);

  const denyConsent = useCallback(async () => {
    const deniedPrefs = { ...defaultPreferences, analytics: false, marketing: false };
    setPreferences(deniedPrefs);
    setConsentStatus('denied');
    setShowBanner(false);
    saveConsent(deniedPrefs);
    
    // Sync to backend if authenticated (don't await to avoid blocking UI)
    if (isAuthenticated) {
      try {
        updateConsentMutation.mutate({
          preferences: deniedPrefs,
          version: CONSENT_VERSION,
        });
      } catch (error) {
        console.warn('Failed to sync consent to backend:', error);
      }
    }
  }, [saveConsent, updateConsentMutation, isAuthenticated]);

  const updatePreferences = useCallback(async (newPrefs: Partial<ConsentPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    saveConsent(updated);
    
    // Sync to backend if authenticated (don't await to avoid blocking UI)
    if (isAuthenticated) {
      try {
        updateConsentMutation.mutate({
          preferences: updated,
          version: CONSENT_VERSION,
        });
      } catch (error) {
        console.warn('Failed to sync consent to backend:', error);
      }
    }
  }, [preferences, saveConsent, updateConsentMutation, isAuthenticated]);

  const hasAnalyticsConsent = useCallback(() => {
    return consentStatus === 'granted' && preferences.analytics;
  }, [consentStatus, preferences.analytics]);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setPreferences(defaultPreferences);
    setConsentStatus('pending');
    setShowBanner(true);
    initializationCompleteRef.current = false;
  }, []);

  return (
    <ConsentContext.Provider
      value={{
        consentStatus,
        preferences,
        showBanner,
        grantConsent,
        denyConsent,
        updatePreferences,
        hasAnalyticsConsent,
        resetConsent,
        isLoading,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};
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
  functional: true,
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
  const hasSyncedWithBackendRef = useRef(false);
  
  // Check authentication once
  useEffect(() => {
    setIsAuthenticated(!!cookieService.getTokens()?.result?.access);
  }, []);
  
  const { useConsentPreferences, useUpdateConsent } = usePreferences();
  
  // Backend consent data - only load when authenticated
  const { data: backendConsent, isLoading: isBackendLoading, error: backendError } = useConsentPreferences({
    enabled: isAuthenticated
  });
  
  // Get mutation function but use it carefully to avoid dependency loops
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
            initializationCompleteRef.current = true;
            return;
          }
        }
        
        // No valid local consent - show banner
        setShowBanner(true);
        setIsLoading(false);
        initializationCompleteRef.current = true;
      } catch (error) {
        console.warn('Failed to load local consent:', error);
        setShowBanner(true);
        setIsLoading(false);
        initializationCompleteRef.current = true;
      }
    };

    loadLocalConsent();
  }, []); // Empty dependency - run once only

  // Sync with backend - much more controlled
  useEffect(() => {
    // Skip if not ready for backend sync or already synced
    if (!isAuthenticated || 
        isBackendLoading || 
        !initializationCompleteRef.current ||
        hasSyncedWithBackendRef.current) {
      return;
    }

    // Only sync once per session when backend data is available
    if (backendConsent && !backendError) {
      const backendConsentData = backendConsent.consent;
      
      if (backendConsentData) {
        const backendPrefs = backendConsentData.preferences;
        
        // Only update if different from current state to avoid unnecessary re-renders
        if (JSON.stringify(backendPrefs) !== JSON.stringify(preferences)) {
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
        }
      }
      
      hasSyncedWithBackendRef.current = true;
    } else if (backendError) {
      console.warn('Backend consent fetch failed:', backendError);
      hasSyncedWithBackendRef.current = true;
    }
  }, [isAuthenticated, backendConsent, backendError, isBackendLoading, preferences]);
  // CRITICAL: Removed updateConsentMutation from dependencies to prevent loops

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
    
    // Sync to backend if authenticated - use setTimeout to break the invalidation loop
    if (isAuthenticated) {
      setTimeout(() => {
        updateConsentMutation.mutate({
          preferences: prefs,
          version: CONSENT_VERSION,
        });
      }, 100); // Small delay prevents immediate query invalidation cycle
    }
  }, [saveConsent, isAuthenticated]); // Removed updateConsentMutation from dependencies

  const denyConsent = useCallback(async () => {
    const deniedPrefs = { ...defaultPreferences, analytics: false, marketing: false };
    setPreferences(deniedPrefs);
    setConsentStatus('denied');
    setShowBanner(false);
    saveConsent(deniedPrefs);
    
    if (isAuthenticated) {
      setTimeout(() => {
        updateConsentMutation.mutate({
          preferences: deniedPrefs,
          version: CONSENT_VERSION,
        });
      }, 100);
    }
  }, [saveConsent, isAuthenticated]);

  const updatePreferences = useCallback(async (newPrefs: Partial<ConsentPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    saveConsent(updated);
    
    if (isAuthenticated) {
      setTimeout(() => {
        updateConsentMutation.mutate({
          preferences: updated,
          version: CONSENT_VERSION,
        });
      }, 100);
    }
  }, [preferences, saveConsent, isAuthenticated]);

  const hasAnalyticsConsent = useCallback(() => {
    return consentStatus === 'granted' && preferences.analytics;
  }, [consentStatus, preferences.analytics]);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setPreferences(defaultPreferences);
    setConsentStatus('pending');
    setShowBanner(true);
    initializationCompleteRef.current = false;
    hasSyncedWithBackendRef.current = false;
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
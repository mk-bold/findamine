'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CookiePreferences, CookieConsent, DEFAULT_COOKIE_PREFERENCES } from '@/types/cookies';

interface CookieConsentContextType {
  consent: CookieConsent | null;
  hasConsented: boolean;
  preferences: CookiePreferences;
  showBanner: boolean;
  showSettings: boolean;
  acceptAll: () => void;
  acceptSelected: (preferences: CookiePreferences) => void;
  rejectAll: () => void;
  updatePreferences: (preferences: CookiePreferences) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const initialized = useRef(false);
  
  // Load consent from localStorage on mount - only once
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    const savedConsent = localStorage.getItem('cookie-consent');
    
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent) as CookieConsent;
        setConsent(parsed);
      } catch (error) {
        console.error('Failed to parse saved cookie consent:', error);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = useCallback((preferences: CookiePreferences) => {
    const newConsent: CookieConsent = {
      preferences,
      timestamp: Date.now(),
      version: '1.0',
    };

    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  const acceptAll = useCallback(() => {
    const allEnabled: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allEnabled);
  }, [saveConsent]);

  const acceptSelected = useCallback((preferences: CookiePreferences) => {
    saveConsent(preferences);
  }, [saveConsent]);

  const rejectAll = useCallback(() => {
    saveConsent(DEFAULT_COOKIE_PREFERENCES);
  }, [saveConsent]);

  const updatePreferences = useCallback((preferences: CookiePreferences) => {
    setConsent(prevConsent => {
      if (prevConsent) {
        const updatedConsent: CookieConsent = {
          ...prevConsent,
          preferences,
          timestamp: Date.now(),
        };
        localStorage.setItem('cookie-consent', JSON.stringify(updatedConsent));
        return updatedConsent;
      }
      return prevConsent;
    });
  }, []); // Empty dependency array to prevent recreation

  const openSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const value = useMemo(() => ({
    consent,
    hasConsented: consent !== null,
    preferences: consent?.preferences || DEFAULT_COOKIE_PREFERENCES,
    showBanner,
    showSettings,
    acceptAll,
    acceptSelected,
    rejectAll,
    updatePreferences,
    openSettings,
    closeSettings,
  }), [consent, showBanner, showSettings, acceptAll, acceptSelected, rejectAll, updatePreferences, openSettings, closeSettings]);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
} 
'use client';

import React, { useState } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { CookiePreferences, COOKIE_CATEGORIES } from '@/types/cookies';
import { Settings, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

export function CookieConsentBanner() {
  const { showBanner, acceptAll, acceptSelected, rejectAll, openSettings } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always enabled
    functional: false,
    analytics: false,
    marketing: false,
  });

  if (!showBanner) return null;

  const handleAcceptSelected = () => {
    acceptSelected(preferences);
  };

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Main content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              We use cookies to enhance your experience
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We use cookies and similar technologies to help personalize content, provide a better user experience,
              and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              You can customize your preferences in our{' '}
              <button
                onClick={openSettings}
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Cookie Settings
              </button>
              .
            </p>

            {/* Cookie categories */}
            {showDetails && (
              <div className="mt-4 space-y-3">
                {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{category.title}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {category.examples.join(', ')}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={preferences[key as keyof CookiePreferences]}
                            onChange={(e) => handlePreferenceChange(key as keyof CookiePreferences, e.target.checked)}
                            disabled={key === 'necessary'}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Toggle details */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Hide cookie details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show cookie details
                </>
              )}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
            <button
              onClick={rejectAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Reject All
            </button>
            <button
              onClick={handleAcceptSelected}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Accept Selected
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
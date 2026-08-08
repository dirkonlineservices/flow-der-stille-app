import React from 'react';
import { isNativeApp } from '../platformHelper';
import NativeOnboardingGate from './NativeOnboardingGate';
import WebConsentBanner from './WebConsentBanner';

const AppLayout = () => {
  return (
    <div className="app-container">
      {isNativeApp() ? (
        <NativeOnboardingGate /> // Konsolidiertes Gate für Android / Native
      ) : (
        <WebConsentBanner />     // Klassischer Cookie-Banner fürs Web
      )}
    </div>
  );
};

export default AppLayout;

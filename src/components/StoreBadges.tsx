/**
 * StoreBadges.tsx – Official App Store and Google Play badges side by side.
 * The badge matching the visitor's device is shown first.
 */

import React from 'react';
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  APP_STORE_BADGE_URL,
  PLAY_STORE_BADGE_URL,
  detectMobilePlatform,
  trackAppDownloadClick,
} from '../lib/appStoreLinks';

interface StoreBadgesProps {
  source: string;
  size?: 'sm' | 'lg';
  className?: string;
}

export function StoreBadges({ source, size = 'sm', className = '' }: StoreBadgesProps) {
  // Apple badge has no padding, Google badge has a transparent margin. Heights are balanced visually.
  const appleHeight = size === 'lg' ? 'h-12' : 'h-10';
  const googleHeight = size === 'lg' ? 'h-[70px]' : 'h-[58px]';

  const apple = (
    <a
      key="apple"
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackAppDownloadClick(source, 'app_store')}
      className="hover:scale-105 transition-transform shrink-0"
      title="Flow der Stille im Apple App Store öffnen"
    >
      <img src={APP_STORE_BADGE_URL} alt="Laden im App Store" width="150" height="50" className={`${appleHeight} w-auto object-contain`} />
    </a>
  );

  const google = (
    <a
      key="google"
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackAppDownloadClick(source, 'google_play_store')}
      className="hover:scale-105 transition-transform shrink-0"
      title="Flow der Stille im Google Play Store öffnen"
    >
      <img src={PLAY_STORE_BADGE_URL} alt="Jetzt bei Google Play" width="180" height="70" className={`${googleHeight} w-auto object-contain`} />
    </a>
  );

  const badges = detectMobilePlatform() === 'android' ? [google, apple] : [apple, google];

  return <div className={`flex flex-wrap items-center justify-center gap-1 ${className}`}>{badges}</div>;
}

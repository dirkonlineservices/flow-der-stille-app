/**
 * AppDownloadBanner.tsx – Compact banner for the native apps (iOS and Android).
 * Fits max-w-5xl and is symmetrical on smartphones and desktops.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { StoreBadges } from './StoreBadges';

export function AppDownloadBanner() {
  const qrTargetUrl = 'https://flow-der-stille.de/app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrTargetUrl)}`;

  return (
    <div id="app-download" className="w-full max-w-5xl mx-auto my-6">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] hover:border-black rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 group">

        {/* Left side: text and info */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-800/10 text-emerald-900 group-hover:bg-black group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <Smartphone size={13} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 transition-colors">
              Jetzt für iPhone und Android
            </span>
          </div>
          <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-950 leading-tight mb-1">
            Flow der Stille als App nutzen
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-2">
            Die kostenlose App gibt es im Apple App Store und bei Google Play<span className="hidden md:inline">. Oder scanne einfach den QR-Code</span>.
          </p>
          <Link
            to="/app"
            className="text-xs font-semibold text-emerald-900 hover:underline inline-flex items-center gap-1 transition-colors"
          >
            Alle App-Features und Details ansehen →
          </Link>
        </div>

        {/* Right side: store badges and compact QR code */}
        <div className="flex items-center gap-3 shrink-0">
          <StoreBadges source="app_download_banner" className="sm:flex-col sm:items-end" />

          {/* QR code (tablet/desktop only) leads to /app, which links both stores */}
          <div className="hidden md:flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-[var(--border)] group-hover:border-black transition-colors shadow-2xs">
            <img src={qrCodeUrl} alt="QR-Code zur App-Seite" width="70" height="70" className="rounded-md" />
            <span className="text-[9px] text-stone-700 font-medium">Scannen</span>
          </div>
        </div>

      </div>
    </div>
  );
}

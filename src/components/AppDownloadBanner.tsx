/**
 * AppDownloadBanner.tsx – Kompakte, schlanke Banner-Komponente für die Android App.
 * Paßt sich perfekt an max-w-3xl an und ist auf Smartphones/Desktops symmetrisch aufgebaut.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';

export function AppDownloadBanner() {
  const playStoreUrl = "https://play.google.com/store/apps/details?id=app.flowderstille.de";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(playStoreUrl)}`;

  return (
    <div id="google-play-download" className="w-full max-w-5xl mx-auto my-6">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] hover:border-black dark:hover:border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 group">
        
        {/* Linke Seite: Text & Info */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1.5">
            <span className="w-6 h-6 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
              <Smartphone size={13} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Android App verfügbar
            </span>
          </div>
          <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--text-main)] leading-tight mb-1">
            Flow der Stille als App nutzen
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-2">
            Lade dir unsere kostenlose App direkt im Google Play Store herunter<span className="hidden md:inline"> oder scanne den QR-Code</span>.
          </p>
          <Link 
            to="/app" 
            className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1 transition-colors hover:opacity-80"
          >
            Alle App-Features &amp; Details ansehen →
          </Link>
        </div>

        {/* Rechte Seite: Play Store Badge + Kompakter QR Code */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Badge Link */}
          <a 
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform shrink-0"
            title="Flow der Stille im Google Play Store öffnen"
          >
            <img 
              src="/images/google-play-badge.png" 
              alt="Jetzt bei Google Play" 
              width="150" 
              height="58"
              className="h-11 w-auto object-contain"
              loading="lazy"
              decoding="async"
            />
          </a>

          {/* QR Code (Nur auf Tablet/Desktop sichtbar) */}
          <div className="hidden md:flex flex-col items-center gap-1 p-2 bg-white dark:bg-stone-900 rounded-xl border border-[var(--border)] group-hover:border-black dark:group-hover:border-stone-200 transition-colors shadow-2xs">
            <img 
              src={qrCodeUrl} 
              alt="QR-Code" 
              width="70" 
              height="70" 
              className="rounded-md"
            />
            <span className="text-[9px] text-[var(--text-muted)] font-medium">Scannen</span>
          </div>
        </div>

      </div>
    </div>
  );
}

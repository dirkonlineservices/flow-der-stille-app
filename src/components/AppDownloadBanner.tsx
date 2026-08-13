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
    <div id="google-play-download" className="w-full max-w-3xl mx-auto my-6">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Linke Seite: Text & Info */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
            <span className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
              <Smartphone size={12} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Android App verfügbar
            </span>
          </div>
          <h3 className="font-serif font-semibold text-base sm:text-lg text-[var(--text-main)] leading-tight mb-1">
            Flow der Stille als App nutzen
          </h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-2">
            Lade dir unsere kostenlose App direkt im Google Play Store herunter<span className="hidden md:inline"> oder scanne den QR-Code</span>.
          </p>
          <Link 
            to="/app" 
            className="text-[11px] font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
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
              src="https://play.google.com/intl/en_us/badges/static/images/badges/de_badge_web_generic.png" 
              alt="Jetzt bei Google Play" 
              width="150" 
              className="h-11 w-auto object-contain"
            />
          </a>

          {/* QR Code (Nur auf Tablet/Desktop sichtbar) */}
          <div className="hidden md:flex flex-col items-center gap-1 p-2 bg-white dark:bg-stone-900 rounded-xl border border-[var(--border)] shadow-2xs">
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

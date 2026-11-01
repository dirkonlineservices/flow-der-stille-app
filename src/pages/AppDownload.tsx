/**
 * AppDownload.tsx – Dedicated landing page for the Flow der Stille Android App.
 */

import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Download, ShieldCheck, Zap, Sparkles, CheckCircle2, Headphones, Bell } from 'lucide-react';
import SEO from '../components/SEO';

export function GooglePlayIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a1.45 1.45 0 01-.61-1.186V3a1.45 1.45 0 01.609-1.186z" fill="#4285F4"/>
      <path d="M17.062 8.73L13.792 12l3.27 3.27 3.659-2.091c.712-.407.712-1.951 0-2.358l-3.659-2.091z" fill="#FBBC04"/>
      <path d="M3.609 1.814l10.183 10.186L17.062 8.73 6.136 2.486c-.752-.43-1.748-.288-2.527.328z" fill="#EA4335"/>
      <path d="M3.609 22.186l2.527.328 10.926-6.244-3.27-3.27L3.609 22.186z" fill="#34A853"/>
    </svg>
  );
}

export default function AppDownload() {
  const playStoreUrl = "https://play.google.com/store/apps/details?id=app.flowderstille.de";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(playStoreUrl)}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <SEO 
        title="Flow der Stille App – Android App im Google Play Store" 
        description="Lade die offizielle Flow der Stille Android App herunter. Achtsamkeit, Atemübungen & Meditationen direkt auf deinem Smartphone."
      />

      <header className="text-center space-y-3">
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] inline-flex items-center gap-1.5">
          <Smartphone size={14} /> Offizielle Android App
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-[var(--color-text-main)]">
          Flow der Stille auf deinem Smartphone
        </h1>
        <p className="text-[var(--color-text-muted)] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Nimm deine täglichen Atempausen, Entspannungsübungen und Meditationen überall hin mit.
        </p>
      </header>

      {/* Haupt-Download-Box */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 sm:p-10 shadow-md text-center space-y-6"
      >
        <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[var(--color-text-main)]">
          Jetzt bei Google Play herunterladen
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
          Kostenlos im Google Play Store verfügbar. Kompatibel mit allen Android-Smartphones und Tablets.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-2">
          {/* Direct Play Store Link */}
          <div className="flex flex-col items-center gap-3">
            <a 
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform shrink-0"
            >
              <img 
                src="https://play.google.com/intl/en_us/badges/static/images/badges/de_badge_web_generic.png" 
                alt="Jetzt bei Google Play" 
                width="220" 
                className="h-16 w-auto object-contain"
              />
            </a>
            <span className="text-xs text-[var(--color-text-muted)]">Für Smartphone-Nutzer</span>
          </div>

          {/* QR Code für Desktop */}
          <div className="hidden sm:flex flex-col items-center gap-2 p-4 bg-white dark:bg-stone-900 rounded-2xl border border-[var(--color-border-main)] shadow-xs">
            <img 
              src={qrCodeUrl} 
              alt="QR Code zum Play Store" 
              width="150" 
              height="150" 
              className="rounded-xl"
            />
            <span className="text-[11px] font-medium text-[var(--color-text-muted)]">Mit der Handykamera scannen</span>
          </div>
        </div>
      </motion.div>

      {/* Vorteile der App */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-main)] flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--color-text-main)] mb-1">100 % Werbefrei</h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">Genieße deine Entspannung ohne störende Banner, Pop-ups oder Unterbrechungen.</p>
          </div>
        </div>

        <div className="p-5 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-main)] flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--color-text-main)] mb-1">Kein Abo-Zwang</h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">Faire Einzelkäufe mit lebenslangem Zugriff. Keine versteckten monatlichen Gebühren.</p>
          </div>
        </div>

        <div className="p-5 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-main)] flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
            <Headphones size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--color-text-main)] mb-1">Audio für unterwegs</h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">Höre deine gekauften Meditationen und Übungen direkt auf deinem Smartphone.</p>
          </div>
        </div>

        <div className="p-5 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-main)] flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--color-text-main)] mb-1">Morgen- & Abendrituale</h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">Gezielte Übungen zur Aktivierung des Vagusnervs für deinen Alltag.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

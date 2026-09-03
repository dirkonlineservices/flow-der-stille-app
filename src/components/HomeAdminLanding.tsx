import React, { useState, useRef } from 'react';
import { 
  Wind, Play, Pause, Sparkles, 
  ArrowRight, Eye, RefreshCw, Check, Send, MessageCircle, 
  Share2, Moon, BookOpen, Heart, ShieldCheck, WifiOff, LogIn, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterBanner from './NewsletterBanner';
import { HoerprobenPlayer } from './HoerprobenPlayer';

interface HomeAdminLandingProps {
  user: any;
  isAdmin?: boolean;
  onTogglePreview: () => void;
  todaysWisdom: { title: string; text: string };
  isCompleted: boolean;
  handleCompleteWisdom: () => Promise<void>;
  loading: boolean;
  hoerprobenList: any[];
}

// Social Media Icons
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export const HomeAdminLanding: React.FC<HomeAdminLandingProps> = ({
  user,
  isAdmin,
  onTogglePreview,
  todaysWisdom,
  isCompleted,
  handleCompleteWisdom,
  loading,
  hoerprobenList
}) => {
  // 🎙️ Audio Player für die persönliche Begrüßung
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Toast für Teilen-Aktion
  const [shareToast, setShareToast] = useState('');

  // Modal für Reflexions-Fortschritt bei unregistrierten Gästen
  const [showWisdomProgressModal, setShowWisdomProgressModal] = useState(false);

  // Platzhalter-Audio (kann sofort durch die finale Begrüßung ersetzt werden)
  const VOICE_INTRO_URL = "https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Kostenfreie%20Produkte/anleitung_atmen.mp3";

  const toggleVoicePlay = () => {
    const audio = voiceAudioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(e => console.warn('Audio play fehler:', e));
      setIsPlayingVoice(true);
    } else {
      audio.pause();
      setIsPlayingVoice(false);
    }
  };

  const handleVoiceTimeUpdate = () => {
    const audio = voiceAudioRef.current;
    if (audio && audio.duration) {
      setVoiceProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  const handleVoiceEnded = () => {
    setIsPlayingVoice(false);
    setVoiceProgress(0);
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'Flow der Stille',
      text: 'Entdecke Flow der Stille: Meditation, Vagusnerv-Entspannung & Achtsamkeit ohne teures Abo.',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        setShareToast('Link in die Zwischenablage kopiert!');
        setTimeout(() => setShareToast(''), 3500);
      } catch {
        setShareToast('Teilen fehlgeschlagen');
        setTimeout(() => setShareToast(''), 2500);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl lg:max-w-5xl mx-auto pb-0">
      {/* ─── ADMIN-STEUERUNGSLEISTE (Nur für eingeloggte Admins sichtbar) ─────────────── */}
      {user && isAdmin && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-3.5 text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-sm font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <Eye size={17} className="text-emerald-300 shrink-0" />
            <span><strong>Admin-Vorschau aktiv:</strong> Gast-Startseite</span>
          </div>
          <button
            onClick={onTogglePreview}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition border border-white/20 cursor-pointer shrink-0"
          >
            <RefreshCw size={14} />
            Persönliches Dashboard anzeigen
          </button>
        </div>
      )}

      {/* ─── 1. HERO & PERSÖNLICHE BEGRÜSSUNG (Flach, symmetrisch, in die Breite gezogen) ─── */}
      <section className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] p-5 sm:p-7 md:p-8 shadow-xs relative overflow-hidden text-center">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo & Sub-Badge */}
        <div className="flex flex-col items-center justify-center mb-3">
          <img 
            src="/logo-transparent.png" 
            alt="Flow der Stille Logo" 
            className="h-16 sm:h-20 md:h-24 w-auto object-contain mx-auto mb-3 drop-shadow-sm transition-transform hover:scale-105" 
          />
          <span className="px-3.5 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-bold tracking-wider uppercase inline-block">
            Von Herzen für dich gemacht
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-[var(--text-main)] font-normal leading-tight mb-2.5">
          Finde deine innere Ruhe.
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed mb-4">
          Schön, dass du da bist. Wir sind <strong className="text-[var(--text-main)] font-semibold">Jacqueline, Lisa und Dirk</strong>. 
          Wir haben dieses Projekt ins Leben gerufen, weil echte Entspannung, 
          Achtsamkeit und Vagusnerv-Regulation keine teuren Luxusgüter sein dürfen.
        </p>

        {/* Unser Versprechen: Echte Handarbeit – flach und in die Breite gezogen */}
        <div className="p-3 sm:p-4 bg-[var(--bg-main)]/70 border border-[var(--border)] rounded-2xl text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed text-center sm:text-left flex flex-col sm:flex-row items-center gap-3 max-w-4xl mx-auto shadow-2xs">
          <Sparkles className="w-5 h-5 text-[var(--accent)] shrink-0" />
          <span className="flex-1">
            <strong>Echte Handarbeit &amp; faire Preise:</strong> Alle Meditationen verfasst Jacqueline persönlich mit viel Herzblut. 
            Unsere Premium-Inhalte spricht <strong className="text-[var(--text-main)] font-semibold">Lisa Ragusa mit warmer Menschenstimme</strong> persönlich ein. 
            Moderne KI nutzen wir transparent als kreatives Werkzeug für meditative Klangwelten sowie beruhigende Bildwelten &amp; Designs – für 
            <strong> dauerhaft faire Einzelpreise ab 1,99 € ganz ohne Abo</strong>.
          </span>
        </div>

        {/* 🌟 LOGIN- & REGISTRIERUNGS-BEREICH (Flach, symmetrisch, raumsparend) */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--accent)]/40 shadow-2xs max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
                <Sparkles size={13} />
                <span>Kostenlos mitmachen &amp; unser Herzensprojekt unterstützen</span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] leading-snug">
                Jetzt registrieren oder einloggen
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                Hilf uns zu wachsen, damit wir echte Entspannung dauerhaft günstig ohne Abo und ohne Werbung anbieten können. Gratis-Meditation sofort aktiv!
              </p>
            </div>

            {/* Kompakte, symmetrische Buttons direkt daneben auf Desktop */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full md:w-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Kostenlos registrieren</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-alt)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-main)] text-xs sm:text-sm font-bold active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <LogIn size={16} className="text-[var(--accent)]" />
                <span>Einloggen</span>
              </Link>
            </div>
          </div>

          {/* Vertrauens-Signale dezent in einer flachen Zeile */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-1 text-[11px] sm:text-xs text-[var(--text-muted)] pt-2.5 mt-2.5 border-t border-[var(--border)]/60">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Check size={14} strokeWidth={2.5} /> Gratis Meditation sofort aktiv
            </span>
            <span className="flex items-center gap-1">
              <Check size={14} strokeWidth={2.5} /> Keine Zahlungsdaten nötig
            </span>
            <span className="flex items-center gap-1">
              <Check size={14} strokeWidth={2.5} /> 100 % Werbefrei
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. CUSTOMER JOURNEY: BEDÜRFNIS-FINDER (FÜR GESTRESSTE NUTZER) ── */}
      <section className="space-y-4">
        <div className="text-center">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
            Schnell-Einstieg
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[var(--text-main)] font-normal mt-1">
            Was brauchst du in diesem Moment?
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-lg mx-auto mt-1 leading-relaxed">
            Wähle dein aktuelles Bedürfnis – wir führen dich direkt zur passenden Unterstützung.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Bedürfnis 1: Schlaf & Gedankenkreisen */}
          <Link
            to="/premium?filter=Selbsthypnose"
            className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-2xs hover:shadow-sm group flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
              <Moon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                Gedanken abschalten &amp; tief schlafen
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Selbsthypnosen für neuronale Tiefenentspannung &amp; ruhigen, erholsamen Schlaf.
              </p>
              <span className="text-xs sm:text-sm font-semibold text-[var(--accent)] mt-2.5 inline-flex items-center gap-1">
                Zu den Selbsthypnosen <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {/* Bedürfnis 2: Akuter Stress & Nervensystem */}
          <Link
            to="/premium?filter=Kostenfreie%20Anwendungen"
            className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-2xs hover:shadow-sm group flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
              <Wind size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                Akuten Stress &amp; Unruhe abbauen
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Gezielte Atemübungen &amp; PMR zur schnellen Beruhigung des Vagusnervs.
              </p>
              <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-2.5 inline-flex items-center gap-1">
                Kostenlos starten <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {/* Bedürfnis 3: Herzöffnung & Loslassen */}
          <Link
            to="/premium?filter=Meditation"
            className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-2xs hover:shadow-sm group flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
              <Heart size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                Innere Stärke &amp; Loslassen
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Geführte Herz- &amp; Seelen-Meditationen, persönlich von Lisa gesprochen.
              </p>
              <span className="text-xs sm:text-sm font-semibold text-[var(--accent)] mt-2.5 inline-flex items-center gap-1">
                Meditationen entdecken <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {/* Bedürfnis 4: Berührende Hör-Reise */}
          <Link
            to="/hoerbuch/hoerbuch_der_tag_an_dem_der_schmetterling_erwachte"
            className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-2xs hover:shadow-sm group flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
              <BookOpen size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                Achtsam eintauchen &amp; lauschen
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Hörbuch „Der Tag, an dem der Schmetterling erwachte“ (58 Min. mit Kapiteln).
              </p>
              <span className="text-xs sm:text-sm font-semibold text-[var(--accent)] mt-2.5 inline-flex items-center gap-1">
                Hörbuch öffnen <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── 3. PRODUKT-KATEGORIEN & FORMATE (DIE MEDIATHEK) ─────────────── */}
      <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 sm:p-7 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border)] mb-5">
          <div>
            <h2 className="font-serif font-semibold text-xl sm:text-2xl text-[var(--text-main)]">
              Unsere Mediathek nach Kategorien
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Alle Inhalte einzeln freischaltbar – 100 % werbefrei und ohne Abonnement.
            </p>
          </div>
          <Link 
            to="/premium" 
            className="text-xs sm:text-sm font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1 shrink-0"
          >
            Gesamter Shop →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kategorie 1: Meditationen */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between h-full shadow-2xs group">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                🧘‍♀️ Geführte Meditationen
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Herzkompass, Loslassen &amp; Innere Ruhe (Lisa Ragusa)
              </p>
            </div>
            <div className="mt-4 pt-3.5 border-t border-[var(--border)]/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-md whitespace-nowrap inline-flex items-center">
                  1,99&nbsp;€
                </span>
                <span className="text-xs text-[var(--text-muted)]">einmalig</span>
              </div>
              <Link
                to="/premium?filter=Meditation"
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-semibold transition shrink-0 shadow-xs text-center"
              >
                Ansehen
              </Link>
            </div>
          </div>

          {/* Kategorie 2: Selbsthypnosen */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between h-full shadow-2xs group">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                🌀 Selbsthypnosen
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Tiefer Schlaf, Fokus, Selbstbewusstsein &amp; Ernährung
              </p>
            </div>
            <div className="mt-4 pt-3.5 border-t border-[var(--border)]/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-md whitespace-nowrap inline-flex items-center">
                  1,99&nbsp;€
                </span>
                <span className="text-xs text-[var(--text-muted)]">einmalig</span>
              </div>
              <Link
                to="/premium?filter=Selbsthypnose"
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-semibold transition shrink-0 shadow-xs text-center"
              >
                Ansehen
              </Link>
            </div>
          </div>

          {/* Kategorie 3: Hörbuch */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between h-full shadow-2xs group">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                🎧 Hörbücher
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Der Schmetterling (58:43 Min. inkl. Kapitel-Navigation)
              </p>
            </div>
            <div className="mt-4 pt-3.5 border-t border-[var(--border)]/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-md whitespace-nowrap inline-flex items-center">
                  ab 4,99&nbsp;€
                </span>
                <span className="text-xs text-[var(--text-muted)]">einmalig</span>
              </div>
              <Link
                to="/premium?filter=H%C3%B6rbuch"
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-semibold transition shrink-0 shadow-xs text-center"
              >
                Ansehen
              </Link>
            </div>
          </div>

          {/* Kategorie 4: Kostenfreie Schnupper-Übungen */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] hover:border-emerald-500/50 transition-all flex flex-col justify-between h-full shadow-2xs group">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                🌿 Schnupper-Übungen
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Geführte Atemübung &amp; Progressive Muskelentspannung
              </p>
            </div>
            <div className="mt-4 pt-3.5 border-t border-[var(--border)]/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md whitespace-nowrap inline-flex items-center">
                  100 % Gratis
                </span>
                <span className="text-xs text-[var(--text-muted)]">ohne Kosten</span>
              </div>
              <Link
                to="/premium?filter=Kostenfreie%20Anwendungen"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition shrink-0 shadow-xs text-center"
              >
                Starten
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. UNSER VERSPRECHEN: DER UNTERSCHIED ZU WERBE-PLATTFORMEN & ABO-APPS ─── */}
      <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 sm:p-7 shadow-2xs space-y-4">
        <div className="text-center max-w-xl mx-auto mb-2">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
            Unser Versprechen
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[var(--text-main)] font-normal mt-1">
            Warum Flow der Stille?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Dein Unterschied zu werbefinanzierten Plattformen und teuren Dauer-Abos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Vorteil 1: 100% Werbefrei */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] leading-snug">
                100 % Werbefrei – Kein Aufschrecken
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Auf werbefinanzierten Plattformen wie YouTube, Podcasts &amp; Co. wirst du mitten in der Entspannung plötzlich von lauter Werbung herausgerissen – außer du bezahlst ein teures Monats-Abo, nur um die Werbung abzuschalten. Bei uns gibt es niemals Werbung.
              </p>
            </div>
          </div>

          {/* Vorteil 2: Echter Flugmodus & Display aus */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
              <WifiOff size={22} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] leading-snug">
                Flugmodus &amp; Display aus für gesunden Schlaf
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Schalte dein Handy nachts in den Flugmodus. Höre deine Schlafmeditation bei komplett gesperrtem, dunklem Display – ohne Strahlung am Bett und ohne unbemerktes nächtliches Weiterlaufen.
              </p>
            </div>
          </div>

          {/* Vorteil 3: Kein Abo-Zwang */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] leading-snug">
                Einmalig ab 1,99 € statt teurer Monats-Abos
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Gängige Meditations-Apps zwingen dich in teure Dauer-Abos (oft 60–100 € pro Jahr). Kündigst du, ist der Zugang weg oder es läuft Werbung. Bei uns kannst du auf deine gekauften Inhalte zugreifen, solange du ein registriertes Konto bei uns hast – ohne monatliche Folgekosten oder Abo-Zwang.
              </p>
            </div>
          </div>

          {/* Vorteil 4: Echte Menschen & KI als Werkzeug */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Heart size={22} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)] leading-snug">
                Herzensprojekt statt Großkonzern
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Von Jacqueline, Lisa &amp; Dirk mit Leidenschaft geschaffen. Eigene Texte, echte Sprecherstimmen sowie KI als bewusstes Werkzeug für Klangwelten und visuelle Bildwelten &amp; Designs für dauerhaft faire Preise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. TAGESIMPULS ÜBER DIE VOLLE BREITE (Schlank & Angenehm groß) ── */}
      <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[var(--accent)]" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
                Täglicher Impuls
              </span>
            </div>
            <blockquote className="text-base sm:text-lg text-[var(--text-main)] italic font-serif leading-relaxed border-l-2 border-[var(--accent)] pl-4 py-1">
              {todaysWisdom.text}
            </blockquote>
          </div>

          <div className="shrink-0 sm:self-center">
            <button
              onClick={() => {
                handleCompleteWisdom();
                if (!user) {
                  setShowWisdomProgressModal(true);
                }
              }}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                isCompleted 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-xs active:scale-95'
              }`}
            >
              {isCompleted ? <Check size={15} /> : null}
              {isCompleted ? 'Reflektiert' : 'Als reflektiert markieren'}
            </button>
          </div>
        </div>
      </section>

      {/* 🌟 DIALOG: FORTSCHRITT SPEICHERN NACH REFLEXION FÜR GÄSTE */}
      {showWisdomProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-[var(--accent)] text-center relative">
            <button
              onClick={() => setShowWisdomProgressModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-alt)] transition cursor-pointer"
              aria-label="Schließen"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Check size={28} strokeWidth={2.5} />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Täglicher Impuls reflektiert
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-main)] mt-1 mb-2.5">
              Fortschritt dauerhaft speichern?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
              Wunderbar, du hast dir heute einen Moment der Stille geschenkt! 
              Dein täglicher Reflexions-Fortschritt und deine Serie (Streak) können dauerhaft in deinem Profil gespeichert werden, sobald du dich kostenlos registriert hast.
            </p>

            <div className="space-y-2.5">
              <Link
                to="/register"
                onClick={() => setShowWisdomProgressModal(false)}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>👉 Jetzt kostenlos registrieren &amp; Fortschritt sichern</span>
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/login"
                onClick={() => setShowWisdomProgressModal(false)}
                className="w-full py-3 px-6 rounded-2xl bg-[var(--bg-alt)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] text-sm font-semibold hover:border-[var(--accent)] active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn size={16} className="text-[var(--accent)]" />
                <span>Bereits registriert? Hier einloggen</span>
              </Link>
              <button
                onClick={() => setShowWisdomProgressModal(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] pt-2 transition cursor-pointer"
              >
                Schließen (ohne Speichern fortfahren)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. KOSTENLOSE HÖRPROBEN (Kompakt & Angenehm lesbar) ───────────── */}
      {hoerprobenList.length > 0 && (
        <section className="bg-[var(--bg-card)] p-5 sm:p-6 rounded-2xl border border-[var(--border)] shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-[var(--accent)] text-white">
                Hörproben
              </span>
              <h3 className="font-serif font-semibold text-base sm:text-lg text-[var(--text-main)]">
                Kostenlose Hörproben ({hoerprobenList.length})
              </h3>
            </div>
            <Link
              to="/premium?filter=H%C3%B6rprobe"
              className="text-xs sm:text-sm font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              Alle im Shop →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hoerprobenList.slice(0, 4).map((p: any) => (
              <HoerprobenPlayer key={p.id} produkt={p} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* ─── 7. NEWSLETTER (KOMPAKT & SCHLANK) ────────────────────────────── */}
      <section className="pt-1">
        <NewsletterBanner variant="in-content" />
      </section>

      {/* ─── ZUSÄTZLICHER SCHLANKER CALL-TO-ACTION FÜR GÄSTE AM SEITENENDE ─── */}
      <section className="bg-gradient-to-r from-[var(--accent)]/15 via-[var(--bg-card)] to-[var(--accent)]/15 border-2 border-[var(--accent)]/40 rounded-2xl p-5 sm:p-6 text-center shadow-sm space-y-3">
        <h4 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-main)]">
          Bereit für deinen persönlichen Ruhepol?
        </h4>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Registriere dich jetzt in 20 Sekunden kostenlos – deine erste Meditation ist sofort für dich freigeschaltet.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>👉 Jetzt kostenlos registrieren (0 €)</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-main)] text-xs sm:text-sm font-bold active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <LogIn size={16} className="text-[var(--accent)]" />
            <span>Hier einloggen</span>
          </Link>
        </div>
      </section>

      {/* ─── 8. SYMMETRISCHE COMMUNITY & SOCIAL MEDIA BAR ─────────────────── */}
      <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-[var(--text-main)]">
            Verbinde dich mit unserer Community
          </h4>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Tägliche Inspirationen &amp; Austausch auf deinen Lieblings-Kanälen
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {/* Telegram */}
          <a 
            href="https://t.me/+ccWPbkn00zs4Zjc6" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-xs sm:text-sm font-medium transition shadow-2xs hover:border-[var(--accent)]"
            title="Folge uns auf Telegram"
          >
            <Send size={15} className="text-sky-500" />
            <span>Telegram</span>
          </a>

          {/* WhatsApp */}
          <a 
            href="https://whatsapp.com/channel/0029VbDGNKFKmCPPBOppWs2M" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-xs sm:text-sm font-medium transition shadow-2xs hover:border-[var(--accent)]"
            title="Folge uns auf WhatsApp"
          >
            <MessageCircle size={15} className="text-emerald-500" />
            <span>WhatsApp</span>
          </a>

          {/* Instagram */}
          <a 
            href="https://www.instagram.com/flowderstille" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-xs sm:text-sm font-medium transition shadow-2xs hover:border-[var(--accent)]"
            title="Folge uns auf Instagram"
          >
            <InstagramIcon className="w-4 h-4 text-pink-500" />
            <span>Instagram</span>
          </a>

          {/* Facebook */}
          <a 
            href="https://www.facebook.com/flowderstille" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-xs sm:text-sm font-medium transition shadow-2xs hover:border-[var(--accent)]"
            title="Folge uns auf Facebook"
          >
            <FacebookIcon className="w-4 h-4 text-blue-600" />
            <span>Facebook</span>
          </a>

          {/* Kleiner Teilen-Button */}
          <button
            onClick={handleShareApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-semibold transition shadow-2xs cursor-pointer active:scale-95"
            title="App mit Freunden teilen"
          >
            <Share2 size={14} />
            <span>Teilen</span>
          </button>
        </div>
      </section>

      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg animate-bounce">
          {shareToast}
        </div>
      )}
    </div>
  );
};

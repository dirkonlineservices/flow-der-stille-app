import React, { useState, useRef } from 'react';
import { 
  Wind, Utensils, BookOpen, Play, Pause, Sparkles, 
  ArrowRight, Eye, RefreshCw, Check, Send, MessageCircle, 
  Share2, Trophy, Award, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterBanner from './NewsletterBanner';
import { HoerprobenPlayer } from './HoerprobenPlayer';

interface HomeAdminLandingProps {
  user: any;
  onTogglePreview: () => void;
  todaysWisdom: { title: string; text: string };
  isCompleted: boolean;
  handleCompleteWisdom: () => Promise<void>;
  loading: boolean;
  hoerprobenList: any[];
}

// Social Media Icons
function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export const HomeAdminLanding: React.FC<HomeAdminLandingProps> = ({
  user,
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
      } catch (err) {
        // abgebrochen oder nicht unterstützt
      }
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
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* ─── ADMIN-STEUERUNGSLEISTE (Nur für Admins sichtbar) ─────────────── */}
      <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-3.5 text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <Eye size={16} className="text-emerald-300 shrink-0" />
          <span><strong>Admin-Vorschau aktiv:</strong> Schlanke Startseite (nur für Admins sichtbar)</span>
        </div>
        <button
          onClick={onTogglePreview}
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-white/20 cursor-pointer shrink-0"
        >
          <RefreshCw size={13} />
          Zur gewohnten Startseite wechseln
        </button>
      </div>

      {/* ─── 1. HERO & PERSÖNLICHE ENTSTEHUNGSGESCHICHTE ─────────────────── */}
      <section className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <img src="/logo-transparent.png" alt="Flow der Stille" className="h-14 sm:h-16 mb-4" />
          
          <span className="px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold tracking-wider uppercase mb-2.5">
            Von Herzen für dich gemacht
          </span>

          <h1 className="text-2xl sm:text-4xl font-serif text-[var(--text-main)] font-normal leading-tight mb-3">
            Finde deine innere Ruhe im Flow der Stille
          </h1>

          <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed mb-5 font-light">
            Schön, dass du da bist. Wir sind <strong className="text-[var(--text-main)] font-semibold">Jacqueline, Lisa und Dirk</strong>. 
            Wir haben dieses Projekt ins Leben gerufen, weil echte Entspannung, 
            Achtsamkeit und Vagusnerv-Regulation keine teuren Luxusgüter sein dürfen.
          </p>

          {/* 🎙️ KOMPAKTER VOICE-PLAYER */}
          <div className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl p-4 mb-4 text-left shadow-2xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleVoicePlay}
                  className="w-11 h-11 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center shadow-md active:scale-95 transition shrink-0 cursor-pointer"
                  aria-label={isPlayingVoice ? "Pause" : "Sprachnachricht abspielen"}
                >
                  {isPlayingVoice ? <Pause size={18} fill="white" /> : <Play size={18} className="ml-0.5" fill="white" />}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-main)]">
                      Persönliche Begrüßung von uns dreien
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-medium">
                      35 Sek.
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Höre kurz rein, wer hinter Flow der Stille steht.
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-[var(--text-muted)] font-medium hidden sm:block shrink-0">
                🎙️ Jacqueline • Lisa • Dirk
              </div>
            </div>

            {/* Fortschrittsbalken */}
            <div className="w-full bg-[var(--border)] h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-[var(--accent)] h-full transition-all duration-200"
                style={{ width: `${voiceProgress}%` }}
              ></div>
            </div>

            <audio
              ref={voiceAudioRef}
              src={VOICE_INTRO_URL}
              onTimeUpdate={handleVoiceTimeUpdate}
              onEnded={handleVoiceEnded}
              preload="none"
              className="hidden"
            />
          </div>

          {/* Ehrlicher Nutzen-Satz: Eigene Texte & Freischaltung nach Registrierung */}
          <div className="p-3.5 bg-[var(--bg-main)]/60 border border-[var(--border)] rounded-xl text-xs text-[var(--text-muted)] leading-relaxed text-center sm:text-left flex flex-col sm:flex-row items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>
              <strong>Eigene Texte &amp; faire Preise:</strong> Alle Übungen schreiben wir selbst. 
              Nach deiner kostenlosen Registrierung sind unsere <strong>kostenfreien Übungen sowie eine geführte Meditation sofort freigeschaltet</strong> – und alle weiteren Premium-Inhalte gibt es dauerhaft günstig <strong>ab 1,99 € einmalig ganz ohne Abo</strong>.
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. DIE DREI THEMEN-SÄULEN (Inkl. Wochenaufgabe in Säule 3) ───── */}
      <section className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Säule 1: Atmen */}
          <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-2xs flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Wind size={20} />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-main)] mb-1.5">1. Atmen &amp; Vagusnerv</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Atemtechniken (4-7-8 &amp; PMR) zur sanften Aktivierung deines Vagusnervs und sofortigen körperlichen Beruhigung.
              </p>
            </div>
            <Link 
              to="/exercises" 
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Atemübungen entdecken <ArrowRight size={13} />
            </Link>
          </div>

          {/* Säule 2: Ernährung & Darm */}
          <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-2xs flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Utensils size={20} />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-main)] mb-1.5">2. Ernährung &amp; Darm</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Die Darm-Hirn-Achse: Wie bewusste Ernährung deine Stimmung und Stressresistenz stärkt (von Jacqueline).
              </p>
            </div>
            <Link 
              to="/premium?filter=Selbsthypnose" 
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Gesunder Lebensstil <ArrowRight size={13} />
            </Link>
          </div>

          {/* Säule 3: Lernen, Achtsamkeit & Wochen-Challenge (Gamification) */}
          <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-2xs flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Trophy size={20} />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-main)] mb-1.5">3. Lernen &amp; Challenges</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Selbsthypnosen für tiefen Schlaf und unsere wöchentliche Achtsamkeits-Challenge zur spielerischen Gewohnheitsbildung.
              </p>
            </div>
            <Link 
              to="/premium" 
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Mediathek &amp; Challenges <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 3. TAGESIMPULS ÜBER DIE VOLLE BREITE (Schlank & Quer) ─────────── */}
      <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[var(--accent)]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Täglicher Impuls
              </span>
            </div>
            <blockquote className="text-sm sm:text-base text-[var(--text-main)] italic font-serif leading-relaxed border-l-2 border-[var(--accent)] pl-3.5 py-0.5">
              {todaysWisdom.text}
            </blockquote>
          </div>

          <div className="shrink-0 sm:self-center">
            <button
              onClick={handleCompleteWisdom}
              disabled={loading || isCompleted}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isCompleted 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm active:scale-95'
              }`}
            >
              {isCompleted ? <Check size={14} /> : null}
              {isCompleted ? 'Für heute verinnerlicht' : 'Als verinnerlicht markieren'}
            </button>
          </div>
        </div>
      </section>

      {/* ─── 4. KOSTENLOSE HÖRPROBEN (Kompakt & Schlank) ───────────────────── */}
      {hoerprobenList.length > 0 && (
        <section className="bg-[var(--bg-card)] p-5 sm:p-6 rounded-2xl border border-[var(--border)] shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[var(--accent)] text-white">
                Kostenlos
              </span>
              <h3 className="font-serif font-semibold text-base text-[var(--text-main)]">
                Kostenlose Hörproben ({hoerprobenList.length})
              </h3>
            </div>
            <Link
              to="/premium?filter=H%C3%B6rprobe"
              className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              Alle Hörproben im Shop →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {hoerprobenList.slice(0, 4).map((p: any) => (
              <HoerprobenPlayer key={p.id} produkt={p} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* ─── 5. FOOTER-BEREICH: NEWSLETTER, SOCIAL MEDIA & TEILEN ─────────── */}
      <section className="space-y-5 pt-2">
        <NewsletterBanner variant="prominent" />

        {/* Social Media & Teilen Bar */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-main)]">
              Verbinde dich mit unserer Community
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Tägliche Inspirationen, Updates und direkter Austausch
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Telegram */}
            <a 
              href="https://t.me/+ccWPbkn00zs4Zjc6" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-xs font-medium transition shadow-2xs hover:border-[var(--accent)]"
              title="Folge uns auf Telegram"
            >
              <Send size={14} className="text-sky-500" />
              <span>Telegram</span>
            </a>

            {/* WhatsApp */}
            <a 
              href="https://whatsapp.com/channel/0029VbDGNKFKmCPPBOppWs2M" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-xs font-medium transition shadow-2xs hover:border-[var(--accent)]"
              title="Folge uns auf WhatsApp"
            >
              <MessageCircle size={14} className="text-emerald-500" />
              <span>WhatsApp</span>
            </a>

            {/* Instagram */}
            <a 
              href="https://www.instagram.com/flowderstille" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-xs font-medium transition shadow-2xs hover:border-[var(--accent)]"
              title="Folge uns auf Instagram"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
              <span>Instagram</span>
            </a>

            {/* Facebook */}
            <a 
              href="https://www.facebook.com/flowderstille" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-xs font-medium transition shadow-2xs hover:border-[var(--accent)]"
              title="Folge uns auf Facebook"
            >
              <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Facebook</span>
            </a>

            {/* Kleiner Teilen-Button */}
            <button
              onClick={handleShareApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold transition shadow-2xs cursor-pointer active:scale-95"
              title="App mit Freunden teilen"
            >
              <Share2 size={13} />
              <span>App teilen</span>
            </button>
          </div>
        </div>

        {shareToast && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg animate-bounce">
            {shareToast}
          </div>
        )}
      </section>
    </div>
  );
};

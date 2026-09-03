import React, { useState, useRef } from 'react';
import { 
  Wind, Utensils, BookOpen, Headphones, Play, Pause, Sparkles, 
  Smartphone, ArrowRight, Eye, RefreshCw, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterBanner from './NewsletterBanner';
import WeeklyChallenge from './WeeklyChallenge';
import { FriendInviteWidget } from './FriendInviteWidget';
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

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* ─── ADMIN-STEUERUNGSLEISTE (Nur für Admins sichtbar) ─────────────── */}
      <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-4 text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <Eye size={16} className="text-emerald-300 shrink-0" />
          <span><strong>Admin-Vorschau aktiv:</strong> Neue vorgeschaltete Startseite (nur für Admins sichtbar)</span>
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
      <section className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <img src="/logo-transparent.png" alt="Flow der Stille" className="h-16 sm:h-20 mb-5" />
          
          <span className="px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold tracking-wider uppercase mb-3">
            Von Herzen für dich gemacht
          </span>

          <h1 className="text-3xl sm:text-5xl font-serif text-[var(--text-main)] font-normal leading-tight mb-4">
            Finde deine innere Ruhe im Flow der Stille
          </h1>

          <p className="text-[var(--text-muted)] text-base sm:text-lg leading-relaxed mb-6 font-light">
            Schön, dass du da bist. Wir sind <strong className="text-[var(--text-main)] font-semibold">Jacqueline, Lisa und Dirk</strong>. 
            Wir haben dieses Projekt ins Leben gerufen, weil wir glauben, dass echte Entspannung, 
            Achtsamkeit und Vagusnerv-Regulation keine teuren Luxusgüter sein dürfen.
          </p>

          {/* 🎙️ PERSÖNLICHER VOICE-PLAYER */}
          <div className="w-full bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 mt-2 mb-6 text-left shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <button
                  onClick={toggleVoicePlay}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center shadow-md active:scale-95 transition shrink-0 cursor-pointer"
                  aria-label={isPlayingVoice ? "Pause" : "Sprachnachricht abspielen"}
                >
                  {isPlayingVoice ? <Pause size={22} fill="white" /> : <Play size={22} className="ml-1" fill="white" />}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm sm:text-base text-[var(--text-main)]">
                      Persönliche Begrüßung von uns dreien
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-medium">
                      35 Sek.
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Höre kurz rein, wer hinter Flow der Stille steht und warum wir für dich da sind.
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-[var(--text-muted)] font-medium sm:text-right shrink-0">
                🎙️ Jacqueline • Lisa • Dirk
              </div>
            </div>

            {/* Fortschrittsbalken */}
            <div className="w-full bg-[var(--border)] h-1.5 rounded-full mt-4 overflow-hidden">
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

          {/* Ehrlicher Nutzen-Absatz: Warum Technologie = Fairer Preis */}
          <div className="p-4 bg-[var(--bg-main)]/60 border border-[var(--border)] rounded-2xl text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed text-center sm:text-left flex flex-col sm:flex-row items-center gap-3">
            <Sparkles className="w-5 h-5 text-[var(--accent)] shrink-0" />
            <span>
              <strong>Echte Handarbeit &amp; faire Preise:</strong> Jedes Audio und jedes Hörbuch wird von uns persönlich geschrieben und mit echter Stimme eingesprochen. 
              Moderne KI nutzen wir bewusst als Werkzeug für meditative Klangwelten – und weil wir so keine teuren Studios bezahlen müssen, 
              erhältst du unsere Premium-Inhalte <strong>ab 1,99 € einmalig statt teurer Monats-Abos</strong>.
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. DIE DREI THEMEN-SÄULEN ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif text-[var(--text-main)] font-normal">
            Die drei Säulen für dein Wohlbefinden
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Ganzheitliche Balance für Körper, Nervensystem und Geist
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Säule 1: Atmen */}
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-2xs flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Wind size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">1. Atmen &amp; Vagusnerv</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Gezielte Atemtechniken (wie 4-7-8 und PMR) aktivieren deinen Vagusnerv und signalisieren deinem Körper sofortige Sicherheit und Erholung.
              </p>
            </div>
            <Link 
              to="/exercises" 
              className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Atemübungen entdecken <ArrowRight size={14} />
            </Link>
          </div>

          {/* Säule 2: Ernährung & Darm */}
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-2xs flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Utensils size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">2. Ernährung &amp; Darm</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Über die Darm-Hirn-Achse beeinflusst deine Ernährung maßgeblich deine Stimmung und Stressresistenz. Begleitet von Jacquelines Fachexpertise.
              </p>
            </div>
            <Link 
              to="/premium?filter=Selbsthypnose" 
              className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Gesunder Lebensstil Audio <ArrowRight size={14} />
            </Link>
          </div>

          {/* Säule 3: Lernen & Achtsamkeit */}
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-2xs flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">3. Lernen &amp; Achtsamkeit</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Selbsthypnosen für tiefen Schlaf, geführte Meditationen und kleine Routinen für deinen Alltag – von morgens bis abends.
              </p>
            </div>
            <Link 
              to="/premium" 
              className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Zur Mediathek <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 3. DIE FORMATE & KATEGORIEN-ÜBERSICHT ────────────────────────── */}
      <section className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-[var(--text-main)] font-medium">
              Unsere Formate auf einen Blick
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Entdecke das passende Format für deinen Moment
            </p>
          </div>
          <Link
            to="/premium"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-xs transition shrink-0"
          >
            Alle Inhalte ansehen <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Hörbücher */}
          <Link 
            to="/premium?filter=H%C3%B6rbuch"
            className="p-4 bg-[var(--bg-alt)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl mb-2 block">🎧</span>
              <h3 className="font-semibold text-sm text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                Hörbücher
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-normal">
                Persönlich verfasst &amp; eingesprochen mit thematischen Kapiteln.
              </p>
            </div>
            <span className="text-[11px] font-medium text-[var(--accent)] mt-3 block">Ab 4,99 € einmalig</span>
          </Link>

          {/* Meditationen */}
          <Link 
            to="/premium?filter=Meditation"
            className="p-4 bg-[var(--bg-alt)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl mb-2 block">🧘‍♀️</span>
              <h3 className="font-semibold text-sm text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                Meditationen
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-normal">
                Geführte Meditationen für Herzöffnung, Loslassen und innere Ruhe.
              </p>
            </div>
            <span className="text-[11px] font-medium text-[var(--accent)] mt-3 block">Ab 1,99 € einmalig</span>
          </Link>

          {/* Selbsthypnosen */}
          <Link 
            to="/premium?filter=Selbsthypnose"
            className="p-4 bg-[var(--bg-alt)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl mb-2 block">🌀</span>
              <h3 className="font-semibold text-sm text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                Selbsthypnosen
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-normal">
                Tiefenentspannung für Schlaf, Fokus und inneres Vertrauen.
              </p>
            </div>
            <span className="text-[11px] font-medium text-[var(--accent)] mt-3 block">Ab 2,49 € einmalig</span>
          </Link>

          {/* Kostenfreie Basis-Übungen */}
          <Link 
            to="/premium?filter=Kostenfreie%20Anwendungen"
            className="p-4 bg-[var(--bg-alt)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all group flex flex-col justify-between"
          >
            <div>
              <span className="text-2xl mb-2 block">🌿</span>
              <h3 className="font-semibold text-sm text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                Schnupper-Übungen
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-normal">
                Kompakte Übungen mit KI-Klangwelten – sofort ohne Anmeldung testen.
              </p>
            </div>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-3 block">100 % Kostenlos</span>
          </Link>
        </div>
      </section>

      {/* ─── 4. TAGESIMPULS & WOCHENAUFGABE ──────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Tägliche Weisheit */}
        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-[var(--accent)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                Täglicher Impuls
              </span>
            </div>
            <h3 className="text-xl font-serif font-medium text-[var(--text-main)] mb-3">
              {todaysWisdom.title}
            </h3>
            <blockquote className="text-sm sm:text-base text-[var(--text-muted)] italic leading-relaxed border-l-2 border-[var(--accent)]/40 pl-4 py-1">
              {todaysWisdom.text}
            </blockquote>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Täglich ein neuer Impuls zur Achtsamkeit</span>
            <button
              onClick={handleCompleteWisdom}
              disabled={loading || isCompleted}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                isCompleted 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)]'
              }`}
            >
              {isCompleted ? <Check size={14} /> : null}
              {isCompleted ? 'Für heute verinnerlicht' : 'Als verinnerlicht markieren'}
            </button>
          </div>
        </div>

        {/* Wochenaufgabe Vorschau */}
        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] flex flex-col justify-between shadow-2xs">
          <WeeklyChallenge />
        </div>
      </section>

      {/* ─── 5. KOSTENLOSE HÖRPROBEN MEDIATHEK ────────────────────────────── */}
      {hoerprobenList.length > 0 && (
        <section className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[var(--accent)] text-white">
                  Kostenlos reinschnuppern
                </span>
                <h3 className="font-serif font-semibold text-lg text-[var(--text-main)]">
                  Kostenlose Hörproben ({hoerprobenList.length})
                </h3>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Höre unverbindlich rein – 100 % werbefrei und ohne Anmeldung.
              </p>
            </div>
            <Link
              to="/premium?filter=H%C3%B6rprobe"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-xs transition shrink-0"
            >
              Im Shop öffnen <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {hoerprobenList.slice(0, 4).map((p: any) => (
              <HoerprobenPlayer key={p.id} produkt={p} variant="card" />
            ))}
          </div>

          {hoerprobenList.length > 4 && (
            <div className="text-center pt-2">
              <Link
                to="/premium?filter=H%C3%B6rprobe"
                className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                Alle {hoerprobenList.length} Hörproben im Shop anhören <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ─── 6. APP-HINWEIS (SMARTPHONE APP) ──────────────────────────────── */}
      <section className="bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-alt)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
            <Smartphone size={28} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-[var(--text-main)] mb-1">
              Flow der Stille für dein Smartphone
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Als native Android App im Google Play Store oder direkt im Browser als Web App. 
              Deine gekauften Inhalte sind auch offline im Flugmodus abspielbar.
            </p>
          </div>
        </div>
        <Link
          to="/app"
          className="px-5 py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-semibold shadow-md transition shrink-0 inline-flex items-center gap-2"
        >
          App herunterladen <ArrowRight size={16} />
        </Link>
      </section>

      {/* ─── 7. FOOTER-BEREICH: NEWSLETTER & COMMUNITY ───────────────────── */}
      <section className="space-y-6 pt-4">
        <FriendInviteWidget />
        <NewsletterBanner variant="prominent" />
      </section>
    </div>
  );
};

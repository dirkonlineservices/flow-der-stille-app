import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Headphones, Sparkles, Play, Pause, ShieldCheck, 
  Moon, Clock, Volume2, ArrowRight, CheckCircle2, 
  HelpCircle, Shield, Award, Wind, Smartphone, ChevronDown, ChevronUp,
  Gift
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { useDisclaimerStatus } from '../hooks/useDisclaimerStatus';
import AudioDisclaimerNotice from '../components/AudioDisclaimerNotice';
import FullAudioRegistrationModal from '../components/FullAudioRegistrationModal';
import { HoerprobenPlayer } from '../components/HoerprobenPlayer';
import { getOfflineProductById } from '../lib/offlineProductsService';

interface MeditationItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  isFree?: boolean;
  price?: string;
  cover: string;
  description: string;
  focusTag: string;
}

const MEDITATIONS: MeditationItem[] = [
  {
    id: 'meditation_zur_herzoeffnung',
    title: 'Meditation zur Herzöffnung',
    subtitle: 'Brustraum weiten, Schutzpanzer lösen & innere Wärme zulassen',
    duration: '16:45 Min.',
    isFree: true,
    cover: '/images/products/cover_herzoeffnung.jpg',
    description: 'Eine sanfte Einladung, Schutzmechanismen abzulegen und dem eigenen Herzen mit Wärme und Mitgefühl zu begegnen. Bringt spürbare Weite in einen verengten Brustbereich.',
    focusTag: 'Kostenlose Schnupper-Meditation'
  },
  {
    id: 'meditation_innere_ruhe',
    title: 'Meditation Innere Ruhe',
    subtitle: 'Gedanklichen Druck sanft abgeben & wieder festen Boden spüren',
    duration: '19:10 Min.',
    price: '1,99 €',
    cover: '/images/products/cover_innere_ruhe.jpg',
    description: 'Wenn Reizüberflutung und To-Do-Listen den Kopf einnehmen: Diese Session holt dich in dein natürliches Tempo zurück und verankert Ruhe in deinem Nervensystem.',
    focusTag: 'Nervensystem & Stressabbau'
  },
  {
    id: 'meditation_inneres_kind',
    title: 'Meditation Inneres Kind',
    subtitle: 'Bedürfnissen achtsam zuhören & alte Schutzmuster auflösen',
    duration: '16:10 Min.',
    price: '1,99 €',
    cover: '/images/products/cover_inneres_kind.jpg',
    description: 'Ein geschützter, sicherer Rahmen, um verletzten Anteilen mit aufrichtiger Zuwendung zu begegnen. Schafft tiefes Urvertrauen und emotionale Geborgenheit.',
    focusTag: 'Tiefe emotionale Heilung'
  },
  {
    id: 'meditation_herzkompass',
    title: 'Meditation Herzkompass',
    subtitle: 'Mit Sanftheit die eigene innere Richtung wieder spüren',
    duration: '20:00 Min.',
    price: '1,99 €',
    cover: '/images/products/cover_herzkompass.jpg',
    description: 'Schenke deinen Empfindungen ungeteilte Aufmerksamkeit. Du löst innere Blockaden und stärkst das Vertrauen in deine eigene Intuition und Wahrheit.',
    focusTag: 'Klarheit & Selbstverbundenheit'
  }
];

export default function MeditationLanding() {
  const { user } = useAuth();
  const { hasAccepted } = useDisclaimerStatus();
  const [showRegModal, setShowRegModal] = useState(false);

  // Nicht-eingeloggte Besucher dürfen 45 Sek. reinhören
  const GUEST_PREVIEW_LIMIT = 45;

  const SAMPLE_AUDIO_URL = 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20zur%20Herz%C3%B6ffnung.mp3';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1005);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Wenn Gast und 45 Sek. bereits erreicht sind: Registrierungsschranke anzeigen
      if (!user && currentTime >= GUEST_PREVIEW_LIMIT) {
        setShowRegModal(true);
        return;
      }
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    let time = Number(e.target.value);
    if (!user && time > GUEST_PREVIEW_LIMIT) {
      time = GUEST_PREVIEW_LIMIT;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = GUEST_PREVIEW_LIMIT;
      }
      setIsPlaying(false);
      setCurrentTime(GUEST_PREVIEW_LIMIT);
      setShowRegModal(true);
      return;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-24 selection:bg-[var(--accent)] selection:text-white">
      <SEO
        title="Geführte Meditationen für innere Ruhe & Nervensystem – Flow der Stille"
        description="Finde zurück in deine Stille. Geführte Meditationen von Jacqueline Schmetzer, gesprochen von Lisa Ragusa. Jetzt kostenlos reinhören ohne Abo."
      />

      <audio
        ref={audioRef}
        src={SAMPLE_AUDIO_URL}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 1005);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const cur = audioRef.current.currentTime;
            setCurrentTime(cur);

            // Für nicht eingeloggte Nutzer: Stopp bei Sekunde 45 & Registrierungs-Modal
            if (!user && cur >= GUEST_PREVIEW_LIMIT) {
              audioRef.current.pause();
              audioRef.current.currentTime = GUEST_PREVIEW_LIMIT;
              setCurrentTime(GUEST_PREVIEW_LIMIT);
              setIsPlaying(false);
              setShowRegModal(true);
            }
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[var(--border)] bg-gradient-to-b from-[var(--accent)]/10 via-[var(--bg-alt)]/50 to-[var(--bg-main)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold tracking-wide uppercase border border-[var(--accent)]/30">
            <Heart size={14} />
            <span>Geführte Meditationen • Flow der Stille</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-[1.15] max-w-3xl mx-auto">
            Finde zurück in deinen inneren Fluss der Stille.
          </h1>

          <p className="text-sm sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Kein spiritueller Leistungsdruck, kein stundenlanges Stillsitzen. Unsere geführten Meditationen beruhigen dein Nervensystem sanft und holen dich behutsam in den jetzigen Moment zurück.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={togglePlay}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause size={16} />
                  <span>Meditation pausieren</span>
                </>
              ) : (
                <>
                  <Play size={16} className="fill-white" />
                  <span>{user ? 'Kostenlos abspielen (16:45 Min.)' : 'Kostenlos reinhören (Hörprobe 45 Sek.)'}</span>
                </>
              )}
            </button>

            <a
              href="#meditationen"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-alt)] text-[var(--text-main)] border border-[var(--border)] font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Alle Meditationen ansehen</span>
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="pt-3 flex items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[var(--accent)]" /> Sofort im Web abspielbar
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[var(--accent)]" /> 100% Werbe- & Abofrei
            </span>
          </div>
        </div>
      </section>

      {/* 2. INTERAKTIVER SCHNUPPER-PLAYER */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-[var(--border)] relative group">
              <img
                src="/images/products/cover_herzoeffnung.jpg"
                alt="Meditation zur Herzöffnung"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[var(--accent)] text-white text-[10px] font-bold">
                GRATIS
              </div>
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
                Deine kostenlose Schnupper-Meditation
              </span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                Meditation zur Herzöffnung (16:45 Min.)
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Nimm dir einen kurzen Moment für dich. Schließe die Augen, atme tief ein und lausche der warmen Stimme von Lisa Ragusa.
              </p>
            </div>
          </div>

          {/* Haftungsausschluss-Kennzeichnung direkt vor dem Player */}
          <AudioDisclaimerNotice isLoggedIn={!!user} />

          {/* Mini-Player Interface */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label={isPlaying ? 'Pausieren' : 'Abspielen'}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} className="fill-white ml-0.5" />}
            </button>

            <div className="flex-1 w-full space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-main)]">
                  {isPlaying ? 'Spielt jetzt...' : 'Bereit zum Abspielen'}
                  {!user && (
                    <span className="ml-2 text-[10px] text-[var(--accent)] font-normal">
                      (Hörprobe 45 Sek.)
                    </span>
                  )}
                </span>
                <span className="font-mono text-[var(--text-muted)]">
                  {formatTime(currentTime)} / {formatTime(user ? duration : GUEST_PREVIEW_LIMIT)}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={user ? (duration || 1005) : GUEST_PREVIEW_LIMIT}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-[var(--border)] rounded-full appearance-none"
              />

              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Sprecherin: <strong>Lisa Ragusa</strong></span>
                <span>Autorin: <strong>Jacqueline Schmetzer</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KATALOG: Alle Meditationen im Detail */}
      <section id="meditationen" className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              Gezielte Anwendungen
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[var(--text-main)]">
              Finde die passende Meditation für deinen Tag
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Jede Sitzung ist auf ein konkretes emotionales Bedürfnis deines Körpers und Geistes abgestimmt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MEDITATIONS.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--bg-card)] rounded-3xl p-5 sm:p-6 border border-[var(--border)] shadow-md hover:border-[var(--accent)]/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-[var(--border)] relative">
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.isFree && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[var(--accent)] text-white text-[9px] font-bold">
                        GRATIS
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="inline-block px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-semibold">
                      {item.focusTag}
                    </div>
                    <h3 className="font-serif font-bold text-lg text-[var(--text-main)] leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)]">
                      <Clock size={12} className="text-[var(--accent)]" />
                      <span>{item.duration}</span>
                      <span>•</span>
                      <span className="font-bold text-[var(--text-main)]">
                        {item.isFree ? 'Kostenfrei' : item.price}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {item.description}
                </p>

                {/* Kostenlose Klangprobe für die Meditation */}
                {!item.isFree && (
                  <div className="pt-2">
                    <HoerprobenPlayer 
                      produkt={getOfflineProductById(item.id) || {
                        id: item.id,
                        titel: item.title,
                        audio_path: item.id === 'meditation_innere_ruhe' 
                          ? 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20innere%20Ruhe.mp3'
                          : item.id === 'meditation_inneres_kind'
                          ? 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20inneres%20Kind.mp3'
                          : 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20Herzkompass.mp3'
                      }} 
                      variant="compact" 
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                  {item.isFree ? (
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                        togglePlay();
                      }}
                      className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[var(--accent-hover)] transition-all cursor-pointer"
                    >
                      <Play size={13} className="fill-white" />
                      <span>Jetzt kostenlos abspielen</span>
                    </button>
                  ) : (
                    <Link
                      to={`/premium#product-${item.id}`}
                      className="px-4 py-2 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-main)] border border-[var(--border)] text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <span>Freischalten ({item.price})</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">Kein Abo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SCHNUPPERÜBUNGEN SEKTION (Atemübungen & PMR) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[var(--bg-alt)]/40 border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              Sofortige Entlastung
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              Kostenfreie Schnupperübungen
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto">
              Für Momente, in denen du nur wenige Minuten Zeit hast, aber sofort dein Nervensystem herunterregulieren möchtest.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link
              to="/exercises"
              className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-xs hover:border-[var(--accent)]/50 transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wind size={24} />
                </div>
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                  Interaktive Atemübungen
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Box Breathing, 4-7-8 Taktung und Beruhigungsatmung mit visuellem Atemkreis. Bringt den Vagusnerv in unter 3 Minuten in die Entspannung.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
                <span>Jetzt ausprobieren</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/exercises/pmr_basis"
              className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-xs hover:border-[var(--accent)]/50 transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Moon size={24} />
                </div>
                <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                  Progressive Muskelentspannung (PMR)
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Geführte körperliche Tiefenentspannung (4:14 Min.). Löst verspannte Schultern, Nackenblockaden und Unruhe am Abend.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
                <span>Kostenlos starten</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. DAS FLOW-PRINZIP */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              Warum Meditation bei uns anders wirkt
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Drei Prinzipien für echte, spürbare Tiefenwirkung.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mx-auto flex items-center justify-center">
                <Volume2 size={20} />
              </div>
              <h4 className="font-semibold text-sm text-[var(--text-main)]">Menschliche Wärme</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Keine kühlen Algorithmen. Eingesprochen von Lisa Ragusa mit echter emotionaler Tiefe, die Geborgenheit schenkt.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mx-auto flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-semibold text-sm text-[var(--text-main)]">Keine Abo-Falle</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Keine 90-Euro-Jahresabos. Viele Übungen sind gratis, Einzeltitel kosten faire 1,99 € und gehören dir dauerhaft.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mx-auto flex items-center justify-center">
                <Moon size={20} />
              </div>
              <h4 className="font-semibold text-sm text-[var(--text-main)]">Flugmodus & Offline</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Speichere deine Lieblingsmeditationen direkt in der App. Perfekt für störungsfreie Nächte ohne WLAN.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
            Häufige Fragen zu unseren Meditationen
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 1,
              q: 'Ich kann meine Gedanken nicht abschalten – ist Meditation trotzdem etwas für mich?',
              a: 'Absolut! Das Ziel ist nicht, "nichts zu denken", sondern die Gedanken sanft wie Wolken vorbeiziehen zu lassen. Lisas beruhigende Stimme leitet dich behutsam an, sodass dein Körper ganz von selbst in die Entspannung findet.'
            },
            {
              id: 2,
              q: 'Muss ich im Lotussitz sitzen?',
              a: 'Nein, überhaupt nicht. Du kannst bequem im Sessel sitzen, dich auf die Couch legen oder die Meditation im Bett zum Einschlafen hören. Wichtig ist nur, dass dein Körper sich wohl und gestützt fühlt.'
            },
            {
              id: 3,
              q: 'Kann ich die Meditationen auch in der App anhören?',
              a: 'Ja! Du kannst alle Meditationen sowohl hier im Web als auch in unserer Flow der Stille Android-App nutzen. In der App stehen dir zusätzlich Offline-Speicherung und Schlaf-Timer zur Verfügung.'
            },
            {
              id: 4,
              q: 'Gibt es versteckte Kosten oder ein Abonnement?',
              a: 'Nein. Flow der Stille verzichtet bewusst auf Abo-Modelle. Schnupperübungen sind komplett kostenfrei. Alle weiteren Meditationen lassen sich einzeln für einmalig 1,99 € dauerhaft freischalten.'
            }
          ].map((item) => (
            <div
              key={item.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                className="w-full p-4 sm:p-5 text-left font-medium text-xs sm:text-sm flex items-center justify-between gap-3 text-[var(--text-main)] hover:bg-[var(--bg-alt)]/50 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <span className="text-[var(--accent)] font-bold text-base">
                  {openFaq === item.id ? '−' : '+'}
                </span>
              </button>
              {openFaq === item.id && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] bg-[var(--bg-alt)]/20">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. FINAL CONVERSION CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-[var(--accent)]/15 via-[var(--bg-card)] to-[var(--bg-card)] p-8 sm:p-12 rounded-3xl border border-[var(--accent)]/30 text-center space-y-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] text-white mx-auto flex items-center justify-center shadow-lg">
            <Heart size={28} />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              Beginne noch heute deinen Weg zu innerer Gelassenheit
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
              Lade dir die Flow der Stille App herunter oder erstelle ein kostenloses Profil, um deinen persönlichen Fortschritt zu sichern.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/app"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Smartphone size={16} />
              <span>App herunterladen</span>
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-alt)] text-[var(--text-main)] border border-[var(--border)] font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Kostenlos registrieren</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Registrierungs-Modal mit Haftungsausschluss-Begründung */}
      <FullAudioRegistrationModal
        isOpen={showRegModal}
        onClose={() => {
          setShowRegModal(false);
          if (audioRef.current && !user) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
          }
        }}
        audioTitle="Meditation zur Herzöffnung"
        durationText="16:45 Min."
        returnPath="/meditation"
      />
    </div>
  );
}

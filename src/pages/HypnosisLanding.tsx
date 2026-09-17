import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Headphones, Play, Pause, ShieldCheck, 
  Moon, Clock, Volume2, ArrowRight, CheckCircle2, 
  HelpCircle, Shield, Award, Wind, Smartphone, ChevronDown, ChevronUp,
  Brain, Zap, Lock
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { useDisclaimerStatus } from '../hooks/useDisclaimerStatus';
import AudioDisclaimerNotice from '../components/AudioDisclaimerNotice';
import FullAudioRegistrationModal from '../components/FullAudioRegistrationModal';
import { HoerprobenPlayer } from '../components/HoerprobenPlayer';
import { getOfflineProductById } from '../lib/offlineProductsService';

interface HypnosisItem {
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

const HYPNOSES: HypnosisItem[] = [
  {
    id: 'selbsthypnose_besser_und_erholsamer_schlaf',
    title: 'Selbsthypnose: Tiefer und erholsamer Schlaf',
    subtitle: 'Gedankenkarussell stoppen & sanft in die Tiefschlafphase gleiten',
    duration: '12:54 Min.',
    isFree: true,
    cover: '/images/products/cover_schlaf.jpg',
    description: 'Am Abend fällt es oft schwer, den Tag loszulassen. Diese Selbsthypnose führt dich sanft in eine wohlige körperliche Schwere, schaltet das Grübeln ab und begleitet dich in einen regenerierenden Schlaf.',
    focusTag: '100% Kostenfreie Vollversion'
  },
  {
    id: 'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen',
    title: 'Selbsthypnose: Mehr Selbstbewusstsein & Inneres Vertrauen',
    subtitle: 'Selbstzweifel auflösen & eine ruhige innere Stärke verankern',
    duration: '15:30 Min.',
    price: '1,99 €',
    cover: '/images/products/cover_vertrauen.jpg',
    description: 'Echtes Selbstvertrauen ist nicht laut – es ist eine unerschütterliche Ruhe in dir selbst. Verankere den Glauben an deine Fähigkeiten tief in deinem Unterbewusstsein.',
    focusTag: 'Innere Stärke & Gelassenheit'
  },
  {
    id: 'selbsthypnose_fokus&konzentration',
    title: 'Selbsthypnose: Fokus & Absolute Konzentration',
    subtitle: 'Mentale Zerstreuung beenden & mühelos in den Flow-Zustand kommen',
    duration: '15:41 Min.',
    price: '1,99 €',
    cover: '/images/products/cover_fokus.jpg',
    description: 'Schalte das permanente Grundrauschen aus. Diese Sitzung bündelt deine Aufmerksamkeit und lässt dich anspruchsvolle Aufgaben mit Leichtigkeit und Klarheit bewältigen.',
    focusTag: 'Klarheit & Produktivität'
  },
  {
    id: 'selbsthypnose_ernaehrung',
    title: 'Selbsthypnose: Gesunde Ernährung & Aktiver Lebensstil',
    subtitle: 'Heißhunger mindern & die intuitive Lust auf Wohlbefinden stärken',
    duration: '14:07 Min.',
    price: '1,99 €',
    cover: '/images/products/cover_ernaehrung.jpg',
    description: 'Veränderung ohne Quälerei und Verzicht: Richte deine unbewussten Gewohnheiten neu aus, sodass gesunde Entscheidungen sich ganz natürlich und leicht anfühlen.',
    focusTag: 'Körpergefühl & Balance'
  }
];

export default function HypnosisLanding() {
  const { user } = useAuth();
  const { hasAccepted } = useDisclaimerStatus();
  const [showRegModal, setShowRegModal] = useState(false);

  // Nicht-eingeloggte Besucher dürfen 45 Sek. reinhören
  const GUEST_PREVIEW_LIMIT = 45;

  const SAMPLE_AUDIO_URL = 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Selbsthypnose%20Tiefer%20%26%20Erholsamer%20Schlaf.mp3';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(774); // ca. 12:54 Min in Sek.

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
        title="Sanfte Selbsthypnose für Schlaf & Selbstvertrauen – Flow der Stille"
        description="Löse Blockaden im Unterbewusstsein. Sanfte Selbsthypnosen von Jacqueline Schmetzer & Lisa Ragusa. Jetzt kostenlos testen – 100% werbe- & abofrei."
      />

      <audio
        ref={audioRef}
        src={SAMPLE_AUDIO_URL}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 774);
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
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[var(--border)] bg-gradient-to-b from-indigo-950/20 via-[var(--bg-alt)]/50 to-[var(--bg-main)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold tracking-wide uppercase border border-[var(--accent)]/30">
            <Brain size={14} />
            <span>Sanfte Selbsthypnose • Wissenschaftlich fundiert</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-[1.15] max-w-3xl mx-auto">
            Löse Blockaden dort, wo sie entstehen: In deinem Unterbewusstsein.
          </h1>

          <p className="text-sm sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Erlebe die heilsame Wirkung tiefer Trance-Entspannung. Kein Kontrollverlust, keine Show – sondern ein sicherer Raum, in dem dein Geist alte Muster ablegen darf.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={togglePlay}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause size={16} />
                  <span>Selbsthypnose pausieren</span>
                </>
              ) : (
                <>
                  <Play size={16} className="fill-white" />
                  <span>{user ? 'Kostenlos abspielen (12:54 Min.)' : 'Kostenlos reinhören (Hörprobe 45 Sek.)'}</span>
                </>
              )}
            </button>

            <a
              href="#hypnosen"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-alt)] text-[var(--text-main)] border border-[var(--border)] font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Alle Themen ansehen</span>
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

      {/* 2. SCHNUPPER-PLAYER: KOSTENLOSE SCHLAF-HYPNOSE */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-[var(--border)] relative group">
              <img
                src="/images/products/cover_schlaf.jpg"
                alt="Selbsthypnose Tiefer Schlaf"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[var(--accent)] text-white text-[10px] font-bold">
                GRATIS
              </div>
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
                Deine kostenlose Schnupper-Selbsthypnose
              </span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
                Tiefer und erholsamer Schlaf (12:54 Min.)
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Lege dich bequem hin, schließe die Augen und lasse den Tag los. Lisa Ragusa begleitet dich sanft in eine tiefe, natürliche Regeneration.
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
                  {isPlaying ? 'Selbsthypnose läuft...' : 'Bereit zum Abspielen'}
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
                max={user ? (duration || 774) : GUEST_PREVIEW_LIMIT}
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

      {/* 3. ENTMYSTIFIZIERUNG: Was Selbsthypnose wirklich ist */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[var(--bg-alt)]/30 border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              Aufklärung &amp; Vertrauen
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[var(--text-main)]">
              Was Selbsthypnose wirklich ist (und was nicht)
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Vergiss Bühnenshows und Klischees. Seriöse Selbsthypnose ist eine anerkannte Methode der Tiefenentspannung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <Lock size={22} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                Volle Selbstkontrolle
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Du bist zu keinem Zeitpunkt ohnmächtig oder fremdgesteuert. Du hörst jedes Wort und kannst die Sitzung bei Bedarf jederzeit selbstbestimmt beenden.
              </p>
            </div>

            <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <Brain size={22} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                Biologisch messbare Ruhe
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Deine Gehirnwellen wechseln vom hektischen Beta- in den entspannten Alpha- und Theta-Zustand. Herzschlag und Atmung harmonisieren sich nachweislich.
              </p>
            </div>

            <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <Sparkles size={22} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                Direkter Zugang zur Ursache
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Während der analytische Verstand ruht, nimmt das Unterbewusstsein positive Suggestionen widerstandsfrei auf – für nachhaltige innere Veränderung.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KATALOG: Alle Selbsthypnosen */}
      <section id="hypnosen" className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              Gezielte Transformation
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[var(--text-main)]">
              Unsere Selbsthypnose-Sitzungen
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Wähle den Bereich deines Lebens, in dem du mehr Leichtigkeit und Vertrauen verankern möchtest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HYPNOSES.map((item) => (
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

                {/* Kostenlose Klangprobe für die Selbsthypnose */}
                {!item.isFree && (
                  <div className="pt-2">
                    <HoerprobenPlayer 
                      produkt={getOfflineProductById(item.id) || {
                        id: item.id,
                        titel: item.title,
                        audio_path: item.id === 'selbsthypnose_ernaehrung'
                          ? 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Hynose%20Gesunde%20Ern%C3%A4hrung%20%26%20Aktiver%20Lebensstil.mp3'
                          : item.id === 'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen'
                          ? 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Mehr%20Selbstbewusstsein%20%26%20Inneres%20Vertrauen%2015_30%20min.mp3'
                          : 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Selbsthypnose%20Fokus%20%26%20Absolute%20Konzentration%2015_41%20min.mp3.mp3'
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

      {/* 5. SCHNUPPERÜBUNGEN SEKTION */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[var(--bg-alt)]/40 border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              Körperliche Vorbereitung
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              Kostenfreie Schnupperübungen
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto">
              Optimiere deine Trancefähigkeit: Nutze diese kurzen somatischen Übungen, um körperliche Restspannung vor der Hypnose abzustreifen.
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
                  Atemübungen zur Beruhigung
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Aktiviere den Parasympathikus mit Box Breathing oder 4-7-8 Rhythmus. Bereitet den Geist ideal auf tiefe Trance vor.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
                <span>Übungen öffnen</span>
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
                  Löse muskuläre Verspannungen gezielt auf. Ideal vor dem Einschlafen in Kombination mit der Schlaf-Selbsthypnose.
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

      {/* 6. FAQ ACCORDION */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
            Häufige Fragen zu unseren Selbsthypnosen
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 1,
              q: 'Kann ich in der Selbsthypnose „steckenbleiben“?',
              a: 'Nein, das ist neurologisch unmöglich. Sollte die Audio-Aufnahme enden oder gestört werden, wechselt dein Zustand entweder ganz natürlich in einen normalen Schlaf oder du öffnest nach wenigen Momenten völlig erfrischt die Augen.'
            },
            {
              id: 2,
              q: 'Brauche ich zwingend Kopfhörer?',
              a: 'Kopfhörer sind empfehlenswert, um Umgebungsgeräusche abzuschirmen und die Stimmenführung sowie die Frequenzen intensiver wahrzunehmen. Du kannst die Sessions aber auch über Smartphone- oder Zimmerlautsprecher hören.'
            },
            {
              id: 3,
              q: 'Darf ich die Selbsthypnose beim Autofahren hören?',
              a: 'Nein, niemals! Selbsthypnosen erzeugen eine tiefe Muskel- und Sinnesentspannung. Höre sie ausschließlich in sicherer Umgebung, am besten im Bett oder in einem bequemen Sessel.'
            },
            {
              id: 4,
              q: 'Gibt es ein monatliches Abo?',
              a: 'Nein. Bei Flow der Stille gibt es keine Abofallen. Unsere Schlaf-Selbsthypnose ist dauerhaft gratis. Alle weiteren Themen kannst du als faire Einmalkäufe (1,99 €) lebenslang behalten.'
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
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-indigo-950/20 via-[var(--bg-card)] to-[var(--bg-card)] p-8 sm:p-12 rounded-3xl border border-[var(--accent)]/30 text-center space-y-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] text-white mx-auto flex items-center justify-center shadow-lg">
            <Moon size={28} />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              Gleite heute Nacht in die erholsamste Ruhe deines Lebens
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
              Lade dir die Flow der Stille App herunter, aktiviere den Schlafmodus und wache morgen voller Energie und Gelassenheit auf.
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
        audioTitle="Selbsthypnose: Tiefer und erholsamer Schlaf"
        durationText="12:54 Min."
        returnPath="/selbsthypnose"
      />
    </div>
  );
}

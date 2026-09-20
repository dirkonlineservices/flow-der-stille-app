import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Headphones, Sparkles, Play, Pause, ShieldCheck, 
  Moon, Clock, Heart, Volume2, ArrowRight, CheckCircle2, 
  HelpCircle, Shield, ArrowLeft, Loader2, Award, User, Gift,
  Wind, Smartphone
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import { offlineManager } from '../lib/offlineAudioService';
import AudioDisclaimerNotice from '../components/AudioDisclaimerNotice';
import FullAudioRegistrationModal from '../components/FullAudioRegistrationModal';
import { HoerprobenPlayer } from '../components/HoerprobenPlayer';
import QuickSocialUnlockBox from '../components/QuickSocialUnlockBox';

export default function AudiobooksHub() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Besitzprüfung für die Hörbücher
  const [isAudiobookOwned, setIsAudiobookOwned] = useState(false);
  const [isMenschSeinOwned, setIsMenschSeinOwned] = useState(false);

  // 2. Audio-Probe Zustand (Startet ab 1:19 Min. = 79 Sek. für genau 90 Sekunden)
  const SNIPPET_START_TIME = 79;
  const SNIPPET_DURATION = 90;
  const GUEST_PREVIEW_LIMIT = 45; // 45 Sekunden Hörprobe für Gäste
  const [isPlayingSnippet, setIsPlayingSnippet] = useState(false);
  const [snippetCurrentTime, setSnippetCurrentTime] = useState(79);
  const [showRegModal, setShowRegModal] = useState(false);
  const snippetAudioRef = useRef<HTMLAudioElement | null>(null);

  // 3. FAQ Accordion State
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // Klangprobe URL (Cloudflare R2)
  const SAMPLE_AUDIO_URL = 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerbucher/Der%20Tag%20an%20dem%20der%20Schmetterling%20erwachte%20Final.mp3';

  useEffect(() => {
    async function checkOwnership() {
      // Offline-Fallback prüfen
      const isOfflineSchmetterling = offlineManager.isPurchasedOffline('schmetterling');
      const isOfflineMenschSein = offlineManager.isPurchasedOffline('mensch_sein');
      setIsAudiobookOwned(isOfflineSchmetterling);
      setIsMenschSeinOwned(isOfflineMenschSein);

      if (!user) return;

      try {
        const supabase = getSupabase();
        const { data: purchases } = await supabase
          .from('kaeufe')
          .select('produkt_id')
          .eq('user_id', user.id);

        if (purchases) {
          const ownedSchmetterling = purchases.some(p => p.produkt_id?.toLowerCase().includes('schmetterling'));
          const ownedMenschSein = purchases.some(p => p.produkt_id?.toLowerCase().includes('mensch_sein'));
          
          setIsAudiobookOwned(ownedSchmetterling);
          setIsMenschSeinOwned(ownedMenschSein);

          if (ownedSchmetterling) {
            offlineManager.savePurchasedProducts(['schmetterling', 'fds_hoerbuch_schmetterling']);
          }
          if (ownedMenschSein) {
            offlineManager.savePurchasedProducts(['mensch_sein', 'fds_mensch_sein']);
          }
        }
      } catch (err) {
        console.error('Fehler bei Hörbuch-Besitzprüfung (ggf. offline):', err);
      }
    }

    checkOwnership();
  }, [user]);

  // Audio Snippet Steuerung (Startet ab 1:19 Min. und läuft für 90 Sek., Gäste 45 Sek.)
  const togglePlaySnippet = () => {
    const audio = snippetAudioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlayingSnippet(false);
    } else {
      // Wenn Gast und bereits 45 Sek. gehört, Modal öffnen
      const elapsed = audio.currentTime - SNIPPET_START_TIME;
      if (!user && elapsed >= GUEST_PREVIEW_LIMIT) {
        setShowRegModal(true);
        return;
      }

      // Wenn die Position außerhalb des 90-Sekunden-Bereichs liegt, zurück zu 1:19 Min. springen
      if (audio.currentTime < SNIPPET_START_TIME || audio.currentTime >= SNIPPET_START_TIME + SNIPPET_DURATION) {
        audio.currentTime = SNIPPET_START_TIME;
        setSnippetCurrentTime(SNIPPET_START_TIME);
      }
      audio.play().then(() => setIsPlayingSnippet(true)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // =========================================================================
  // Hauptansicht für alle Besucher
  // =========================================================================
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-20 selection:bg-[var(--accent)] selection:text-white">
      <SEO
        title="Hörbücher für Achtsamkeit, Trost & Innere Ruhe – Flow der Stille"
        description="Ganzheitliche Hörbücher von Jacqueline Schmetzer, gesprochen von Lisa Ragusa. Beruhigende Geschichten über Wandel, Loslassen und echtes Menschsein. Kapitel 1 jetzt kostenlos anhören."
        keywords="Hörbuch Achtsamkeit, Hörbuch Loslassen, Hörbuch Trost und Trauer, Der Tag an dem der Schmetterling erwachte, Mut zum Echtsein, Jacqueline Schmetzer Hörbuch, Lisa Ragusa Hörbuch, Hörbuch Nervensystem, Hörbuch Einschlafen, spirituelles Hörbuch, Hörbuch Lebenskrise bewältigen, Flow der Stille Hörbuch"
        image="/images/products/cover_schmetterling.jpg"
      />

      {/* Audio-Element für die Klangprobe (startet ab 1:19 Min. und läuft für genau 90 Sek. bzw. 45 Sek. Gast) */}
      <audio
        ref={snippetAudioRef}
        src={SAMPLE_AUDIO_URL}
        preload="none"
        onTimeUpdate={() => {
          if (snippetAudioRef.current) {
            const cur = snippetAudioRef.current.currentTime;
            setSnippetCurrentTime(cur);
            const elapsed = cur - SNIPPET_START_TIME;

            // Für Gäste: Nach 45 Sekunden stoppen & Registrierungs-Modal zur Haftungsabsicherung anzeigen
            if (!user && elapsed >= GUEST_PREVIEW_LIMIT) {
              snippetAudioRef.current.pause();
              setIsPlayingSnippet(false);
              setShowRegModal(true);
              return;
            }

            // Stopp nach 90 Sekunden ab 1:19 Min. (also bei 2:49 Min. = 169 Sek.)
            if (cur >= SNIPPET_START_TIME + SNIPPET_DURATION) {
              snippetAudioRef.current.pause();
              snippetAudioRef.current.currentTime = SNIPPET_START_TIME;
              setSnippetCurrentTime(SNIPPET_START_TIME);
              setIsPlayingSnippet(false);
            }
          }
        }}
        onEnded={() => {
          setIsPlayingSnippet(false);
          setSnippetCurrentTime(SNIPPET_START_TIME);
        }}
      />

      {/* 1. HERO SECTION: Emotionaler Einstieg */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[var(--border)] bg-gradient-to-b from-[var(--bg-alt)]/60 to-[var(--bg-main)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold tracking-wide uppercase border border-[var(--accent)]/30">
            <BookOpen size={14} />
            <span>Ganzheitliche Hörreisen von Flow der Stille</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-[1.15] max-w-3xl mx-auto">
            Geschichten, die dein Nervensystem beruhigen.
          </h1>

          <p className="text-sm sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Wenn das Gedankenkarussell nicht stoppt, braucht der Geist keine strenge Disziplin – sondern eine sanfte Geschichte, die das Herz tröstet und Raum für tiefen Frieden schenkt.
          </p>

          {/* Call-to-Action Tasten */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={togglePlaySnippet}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isPlayingSnippet ? (
                <>
                  <Pause size={16} />
                  <span>Klangprobe pausieren</span>
                </>
              ) : (
                <>
                  <Play size={16} className="fill-white" />
                  <span>{user ? 'Klangprobe lauschen (1:30 Min.)' : 'Klangprobe reinhören (Hörprobe 45 Sek.)'}</span>
                </>
              )}
            </button>

            <a
              href="#showcase"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-alt)] text-[var(--text-main)] border border-[var(--border)] font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Hörbuch entdecken</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 2. DER INTERAKTIVE KLANGRAUM (Mikro-Commitment) */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-lg text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] mx-auto flex items-center justify-center">
            <Headphones size={24} />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
              Schließe kurz die Augen und atme durch
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto">
              Ein Auszug aus unserem Werk <em>„Der Tag, an dem der Schmetterling erwachte“</em>. Nimm dir 90 Sekunden Zeit, setze am besten Kopfhörer auf und spüre, wie dein Puls zur Ruhe kommt.
            </p>
          </div>

          {/* Haftungsausschluss-Kennzeichnung direkt vor dem Player */}
          <AudioDisclaimerNotice isLoggedIn={!!user} />

          {/* Mini-Player Interface */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={togglePlaySnippet}
              className="w-14 h-14 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label={isPlayingSnippet ? 'Pausieren' : 'Abspielen'}
            >
              {isPlayingSnippet ? <Pause size={22} /> : <Play size={22} className="fill-white ml-0.5" />}
            </button>

            <div className="flex-1 w-full space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-main)]">
                  Hörprobe: Kapitel 1 (Auszug nach der Einleitung)
                  {!user && (
                    <span className="ml-2 text-[10px] text-[var(--accent)] font-normal">
                      (Hörprobe 45 Sek.)
                    </span>
                  )}
                </span>
                <span className="font-mono text-[var(--text-muted)]">
                  {formatTime(Math.max(0, snippetCurrentTime - SNIPPET_START_TIME))} / {formatTime(user ? SNIPPET_DURATION : GUEST_PREVIEW_LIMIT)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden relative">
                <div
                  className="h-full bg-[var(--accent)] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (Math.max(0, snippetCurrentTime - SNIPPET_START_TIME) / (user ? SNIPPET_DURATION : GUEST_PREVIEW_LIMIT)) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Sprecherin: <strong>Lisa Ragusa</strong></span>
                <span>Autorin: <strong>Jacqueline Schmetzer</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DIE 3 SÄULEN: Was Flow der Stille Hörbücher besonders macht */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-y border-[var(--border)] bg-[var(--bg-alt)]/40">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              Unser Qualitäts-Versprechen
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[var(--text-main)]">
              Drei Säulen für dein Wohlbefinden
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Jedes Hörbuch bei Flow der Stille ist das Ergebnis sorgfältiger Handarbeit dreier Disziplinen, die perfekt ineinandergreifen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Säule 1: Text */}
            <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-xs space-y-4 hover:border-[var(--accent)]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <Heart size={24} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                Worte, die tragen
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Geschrieben von <strong>Jacqueline</strong> aus jahrelanger Achtsamkeitspraxis. Jede Zeile zielt darauf ab, sanften Trost zu spenden, Ängste vor Veränderung aufzulösen und innere Kraftquellen zu aktivieren.
              </p>
            </div>

            {/* Säule 2: Stimme */}
            <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-xs space-y-4 hover:border-[var(--accent)]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <Volume2 size={24} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                Eine Stimme, die ankommt
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Eingesprochen von <strong>Lisa</strong> mit einer warmen, tief geerdeten Stimmfarbe. Ihr sanftes Lesetempo verlangsamt den Atemrhythmus und vermittelt ein Gefühl von Geborgenheit und Sicherheit.
              </p>
            </div>

            {/* Säule 3: Klang */}
            <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-xs space-y-4 hover:border-[var(--accent)]/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <Moon size={24} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
                Akustische Harmonie
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Produziert von <strong>Dirk</strong>. Abgestimmt auf eine sanfte Dynamik ohne laute Spitzen oder störende Nebengeräusche – perfekt zum Abschalten am Abend oder für den erholsamen Mittagsschlaf.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SHOWCASE: Unser aktuelles Werk im Detail */}
      <section id="showcase" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              Aktuelles Meisterwerk
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[var(--text-main)]">
              Der Tag, an dem der Schmetterling erwachte
            </h2>
          </div>

          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-10 border border-[var(--border)] shadow-xl flex flex-col md:flex-row gap-8 items-center">
            {/* Cover Image */}
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-2 border-[var(--border)] shrink-0 relative group">
              <img
                src="/images/products/cover_schmetterling.jpg"
                alt="Hörbuch Cover: Der Tag an dem der Schmetterling erwachte"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

              {/* Preis-Tag oben links über dem Bild */}
              <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-bold tracking-wider rounded-xl uppercase shadow-lg bg-[var(--accent)] text-white flex items-center gap-1.5 border border-white/20">
                  <Gift size={13} />
                  <span>4,99 €</span>
                  <span className="text-[10px] font-normal opacity-90">• Einmalkauf</span>
                </span>
              </div>

              {/* Info-Banner über unterem Bildrand */}
              <div className="absolute bottom-3 inset-x-3 z-10">
                <div className="px-2.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-center shadow-lg">
                  <span className="text-[11px] font-semibold block leading-tight">
                    Kapitel 1 kostenlos anhören
                  </span>
                  <span className="text-[10px] text-amber-200 font-medium block mt-0.5">
                    Nach Registrierung 4,99 € zum Kaufen
                  </span>
                </div>
              </div>
            </div>

            {/* Content & Action */}
            <div className="space-y-4 flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-xs font-mono text-[var(--text-muted)]">
                <Clock size={13} className="text-[var(--accent)]" />
                <span>58:43 Minuten Gesamtlaufzeit</span>
              </div>

              <h3 className="font-serif font-bold text-2xl text-[var(--text-main)] leading-tight">
                Vollständige Audioausgabe
              </h3>

              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Eine Geschichte über den Wandel des Lebens, die Raum für Trost, Zuversicht und tiefen Frieden schenkt. Sie begleitet dich dabei, dem Thema Abschied mit mehr innerer Ruhe und Vertrauen zu begegnen.
              </p>

              {/* Kapitel-Übersicht: Harmonisch & synchron mit sauberer Unterzeile */}
              <div className="bg-[var(--bg-alt)] rounded-2xl p-4 sm:p-5 border border-[var(--border)] text-left space-y-3">
                <div className="flex items-center justify-between font-semibold text-xs text-[var(--text-main)] pb-2 border-b border-[var(--border)]">
                  <span>Kapitel und Abschnitte</span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">Start &amp; Dauer</span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      num: 'Einleitung',
                      title: 'Rechtlicher Hinweis und Einstimmung',
                      sub: 'Wichtige Orientierung vor Beginn der Hörreise',
                      start: '00:00',
                      dur: '1:19 Min.'
                    },
                    {
                      num: 'Kapitel 1',
                      title: 'Warum der Übergang erst der Anfang ist',
                      sub: 'Wie wir die Angst vor dem Wandel verlieren',
                      start: 'ab 01:19',
                      dur: '17:48 Min.'
                    },
                    {
                      num: 'Kapitel 2',
                      title: 'Der Übergang',
                      sub: 'Wenn Wissenschaft auf Spiritualität trifft',
                      start: 'ab 19:07',
                      dur: '17:10 Min.'
                    },
                    {
                      num: 'Kapitel 3',
                      title: 'Die andere Ebene',
                      sub: 'Jenseits des schweren Kostüms',
                      start: 'ab 36:17',
                      dur: '13:18 Min.'
                    },
                    {
                      num: 'Kapitel 4',
                      title: 'Das Erwachen im Hier und Jetzt',
                      sub: 'Die Befreiung zum bewussten Leben',
                      start: 'ab 49:35',
                      dur: '9:08 Min.'
                    }
                  ].map((ch, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded border border-[var(--accent)]/20">
                            {ch.num}
                          </span>
                          <span className="font-semibold text-[var(--text-main)]">{ch.title}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] italic pl-1">
                          {ch.sub}
                        </p>
                      </div>
                      <div className="text-right font-mono text-[11px] shrink-0">
                        <div className="text-[var(--text-main)] font-medium">{ch.start}</div>
                        <div className="text-[var(--text-muted)] text-[10px]">Dauer: {ch.dur}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-[var(--border)] flex justify-between items-center text-xs font-semibold text-[var(--text-main)]">
                  <span>Gesamtlaufzeit:</span>
                  <span className="font-mono text-[var(--accent)]">58:43 Minuten</span>
                </div>
              </div>

              {/* Preisanker & Kauf-Verlinkung */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-[var(--text-main)]">4,99 €</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Einmalig • Kein Abo</div>
                </div>

                {isAudiobookOwned ? (
                  <div className="w-full sm:flex-1 flex flex-col sm:flex-row gap-2">
                    <Link
                      to="/hoerbuch/schmetterling"
                      className="flex-1 py-3.5 px-5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play size={16} className="fill-white" />
                      <span>Vollständiges Hörbuch abspielen</span>
                    </Link>
                    <Link
                      to="/hoerbuch/schmetterling?autoplay=true"
                      className="px-4 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <Play size={13} className="fill-white" />
                      <span>Mit 1 Klick Kapitel 1 anhören</span>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/hoerbuch/schmetterling?autoplay=true"
                      className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <Play size={16} className="fill-white" />
                      <span>Mit 1 Klick Kapitel 1 kostenlos anhören</span>
                    </Link>

                    <Link
                      to="/premium#product-hoerbuch_der_tag_an_dem_der_schmetterling_erwachte"
                      className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <Gift size={15} />
                      <span>Freischalten (4,99 €)</span>
                    </Link>

                    <Link
                      to="/hoerbuch/schmetterling"
                      className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-main)] font-semibold text-xs border border-[var(--border)] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <BookOpen size={14} />
                      <span>Details</span>
                    </Link>
                  </>
                )}
              </div>

              {!user && !isAudiobookOwned && (
                <div className="pt-2 text-left">
                  <QuickSocialUnlockBox
                    produkt={{
                      id: 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte',
                      titel: 'Der Tag, an dem der Schmetterling erwachte',
                      preis: 4.99,
                      kategorie: 'Hörbuch'
                    }}
                    isAudiobook={true}
                    price="4,99 €"
                    returnPath="/hoerbuch/schmetterling?autoplay=true"
                    compact={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Werk 2: Mut zum Echtsein */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-10 border border-[var(--border)] shadow-xl flex flex-col md:flex-row gap-8 items-center">
            {/* Cover Image */}
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-2 border-[var(--border)] shrink-0 relative group">
              <img
                src="/images/products/cover_mensch_sein.jpg"
                alt="Hörbuch Cover: Mut zum Echtsein - Was steckt hinter einem echten Menschen"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

              {/* Preis-Tag oben links über dem Bild */}
              <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-bold tracking-wider rounded-xl uppercase shadow-lg bg-[var(--accent)] text-white flex items-center gap-1.5 border border-white/20">
                  <Gift size={13} />
                  <span>4,99 €</span>
                  <span className="text-[10px] font-normal opacity-90">• Einmalkauf</span>
                </span>
              </div>

              {/* Info-Banner über unterem Bildrand */}
              <div className="absolute bottom-3 inset-x-3 z-10">
                <div className="px-2.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-center shadow-lg">
                  <span className="text-[11px] font-semibold block leading-tight">
                    Kapitel 1 kostenlos anhören
                  </span>
                  <span className="text-[10px] text-amber-200 font-medium block mt-0.5">
                    Nach Registrierung 4,99 € zum Kaufen
                  </span>
                </div>
              </div>
            </div>

            {/* Content & Action */}
            <div className="space-y-4 flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-xs font-mono text-[var(--text-muted)]">
                <Clock size={13} className="text-[var(--accent)]" />
                <span>58:39 Minuten Gesamtlaufzeit</span>
              </div>

              <h3 className="font-serif font-bold text-2xl text-[var(--text-main)] leading-tight">
                Mut zum Echtsein – Was steckt hinter einem echten Menschen
              </h3>

              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Oft passen wir uns an, um Erwartungen im Außen zu erfüllen, und verlieren dabei den Kontakt zu unseren eigentlichen Bedürfnissen. Dieses Hörbuch lädt dich ein, innezuhalten und zu erkunden, was dich in der Tiefe wirklich ausmacht. In deinem eigenen Tempo darf ein Gefühl von innerer Sicherheit und Klarheit wachsen, das dich stärkt, ganz du selbst zu sein.
              </p>

              {/* Highlights */}
              <div className="bg-[var(--bg-alt)] rounded-2xl p-4 border border-[var(--border)] text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-[var(--text-main)]">
                  <Sparkles size={14} className="text-[var(--accent)]" />
                  <span>Themenschwerpunkte der Hörreise</span>
                </div>
                <ul className="space-y-1 text-[11px] text-[var(--text-muted)] pl-5 list-disc">
                  <li>Die Masken des Alltags erkennen und behutsam ablegen</li>
                  <li>Innere Werte statt äußerem Erwartungsdruck leben</li>
                  <li>Wohlwollender Umgang mit eigenen Grenzen und Gefühlen</li>
                  <li>Echtes Selbstvertrauen aus der inneren Stille schöpfen</li>
                </ul>
              </div>

              {/* Kostenlose Klangprobe für Mut zum Echtsein (startet ab 1:10 Min. nach Disclaimer) */}
              <div className="pt-2">
                <HoerprobenPlayer
                  produkt={{
                    id: 'mensch_sein',
                    titel: 'Mut zum Echtsein - Was steckt hinter einem echtem Menschen',
                    audio_path: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerbucher/Mut%20zum%20echtsein.....mp3',
                    dauer: 3519
                  }}
                  variant="compact"
                />
              </div>

              {/* Preisanker & Kauf-Verlinkung */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-[var(--text-main)]">4,99 €</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Einmalig • Kein Abo</div>
                </div>

                {isMenschSeinOwned ? (
                  <div className="w-full sm:flex-1 flex flex-col sm:flex-row gap-2">
                    <Link
                      to="/hoerbuch/mensch_sein"
                      className="flex-1 py-3.5 px-5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play size={16} className="fill-white" />
                      <span>Vollständiges Hörbuch abspielen</span>
                    </Link>
                    <Link
                      to="/hoerbuch/mensch_sein?autoplay=true"
                      className="px-4 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <Play size={13} className="fill-white" />
                      <span>Mit 1 Klick Kapitel 1 anhören</span>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/hoerbuch/mensch_sein?autoplay=true"
                      className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <Play size={16} className="fill-white" />
                      <span>Mit 1 Klick Kapitel 1 kostenlos anhören</span>
                    </Link>

                    <Link
                      to="/premium#product-mensch_sein"
                      className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <Gift size={15} />
                      <span>Freischalten (4,99 €)</span>
                    </Link>

                    <Link
                      to="/hoerbuch/mensch_sein"
                      className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-main)] font-semibold text-xs border border-[var(--border)] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <BookOpen size={14} />
                      <span>Details</span>
                    </Link>
                  </>
                )}
              </div>

              {!user && !isMenschSeinOwned && (
                <div className="pt-2 text-left">
                  <QuickSocialUnlockBox
                    produkt={{
                      id: 'mensch_sein',
                      titel: 'Mut zum Echtsein - Was steckt hinter einem echtem Menschen',
                      preis: 4.99,
                      kategorie: 'Hörbuch'
                    }}
                    isAudiobook={true}
                    price="4,99 €"
                    returnPath="/hoerbuch/mensch_sein?autoplay=true"
                    compact={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4b. SCHNUPPERÜBUNGEN SEKTION (Atemübungen & PMR) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[var(--bg-alt)]/40 border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              Kostenfreier Einstieg
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              Schnupperübungen für zwischendurch
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto">
              Du möchtest sofort etwas für dein Wohlbefinden tun? Probiere unsere kostenlosen geführten Entspannungsübungen aus.
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
                  Geführte Atemübungen
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Box Breathing und Entspannungstaktung mit interaktivem Atemkreis. Reguliert den Herzschlag in wenigen Atemzügen.
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
                  Geführte somatische Tiefenentspannung (4:14 Min.). Löst muskuläre Verspannungen und bereitet sanft auf das Hören vor.
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

      {/* 5. USABILITY-VORTEILE: Warum Hörer unsere Plattform schätzen */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[var(--bg-alt)]/30 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              Entspannung ohne Hürden
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Einfache Bedienung, entwickelt für Momente der Ruhe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mx-auto flex items-center justify-center">
                <Moon size={20} />
              </div>
              <h4 className="font-semibold text-sm text-[var(--text-main)]">Sanfter Schlaf-Modus</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Stoppt automatisch am Ende der Aufnahme. Kein Endlos-Loop, kein leergelaufener Smartphone-Akku am Morgen.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mx-auto flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-semibold text-sm text-[var(--text-main)]">Flugmodus-fähig</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Speichere das Hörbuch direkt im internen App-Puffer. Perfekt, wenn du nachts dein WLAN ausschaltest.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mx-auto flex items-center justify-center">
                <Award size={20} />
              </div>
              <h4 className="font-semibold text-sm text-[var(--text-main)]">100% Werbe- & Abofrei</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Keine monatlichen Abo-Gebühren wie bei Großkonzernen. Einmal erwerben und dauerhaft im persönlichen Profil behalten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ: Häufig gestellte Fragen */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
            Häufige Fragen zu unseren Hörbüchern
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 1,
              q: 'Wie kann ich das Hörbuch nach dem Kauf anhören?',
              a: 'Direkt nach der Freischaltung findest du das Hörbuch dauerhaft in deinem persönlichen Flow der Stille Dashboard sowie auf der Hörbuch-Seite. Du kannst es sowohl im Web-Browser als auch in unserer Android-App abspielen.'
            },
            {
              id: 2,
              q: 'Funktioniert das Hörbuch auch ohne Internetverbindung?',
              a: 'Ja! In der Flow der Stille Android-App kannst du das Hörbuch mit einem Klick im geschützten App-Speicher hinterlegen. So steht es dir auch im Flugmodus oder bei ausgeschaltetem WLAN unterbrechungsfrei zur Verfügung.'
            },
            {
              id: 3,
              q: 'Eignet sich das Werk zum Einschlafen?',
              a: 'Absolut. Sowohl die Stimmführung von Lisa Ragusa als auch die feinfühlige Audioproduktion sind darauf ausgelegt, das Nervensystem sanft herunterzufahren. Der Player stoppt am Ende automatisch und weckt dich nicht durch neue Tracks auf.'
            },
            {
              id: 4,
              q: 'Werden weitere Hörbücher erscheinen?',
              a: 'Ja, unser Autoren- und Produktionsteam arbeitet bereits an weiteren Werken und heilsamen Geschichten. Sobald neue Titel bereitstehen, wirst du sie hier und in deinem Dashboard finden.'
            },
            {
              id: 5,
              q: 'Warum gibt es vor dem Anhören einen rechtlichen Haftungsausschluss?',
              a: 'Unsere Hörbücher berühren emotionale und tiefgehende Lebensthemen (wie Wandlung, Trost und das Finden der eigenen Wahrheit). Da es sich um mentale Selbsterfahrung und ganzheitliche Entspannung handelt, greifen in Deutschland strenge Verbraucherschutz- und Gesundheitsgesetze: Sie verlangen eine eindeutige Abgrenzung zu medizinischer Therapie oder psychologischer Behandlung. Der Haftungsausschluss sorgt für rechtliche Klarheit und Transparenz für Hörer und Autoren gleichermaßen.'
            }
          ].map((item) => (
            <div
              key={item.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaqId(openFaqId === item.id ? null : item.id)}
                className="w-full p-4 sm:p-5 text-left font-medium text-xs sm:text-sm flex items-center justify-between gap-3 text-[var(--text-main)] hover:bg-[var(--bg-alt)]/50 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <span className="text-[var(--accent)] font-bold text-base">
                  {openFaqId === item.id ? '−' : '+'}
                </span>
              </button>
              {openFaqId === item.id && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] bg-[var(--bg-alt)]/20">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Registrierungs-Modal zur Haftungsabsicherung für Gäste nach Ablauf der 45s-Hörprobe */}
      <FullAudioRegistrationModal
        isOpen={showRegModal}
        onClose={() => {
          setShowRegModal(false);
          if (snippetAudioRef.current && !user) {
            snippetAudioRef.current.currentTime = SNIPPET_START_TIME;
            setSnippetCurrentTime(SNIPPET_START_TIME);
          }
        }}
        title="Klangprobe vollständig anhören"
        subtitle="Kurze Registrierung zur rechtlichen Haftungsabsicherung"
        returnPath="/hoerbuecher"
      />

    </div>
  );
}

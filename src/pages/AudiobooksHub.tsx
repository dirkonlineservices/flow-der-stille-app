import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Headphones, Sparkles, Play, Pause, ShieldCheck, 
  Moon, Clock, Heart, Volume2, ArrowRight, CheckCircle2, 
  HelpCircle, Shield, ArrowLeft, Loader2, Award, User
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';

export default function AudiobooksHub() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Admin-Prüfung (Seite ist aktuell exklusiv nur für Admins freigeschaltet)
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 2. Audio-Probe Zustand (Start bei 1:19 Min. = 79 Sek. für genau 90 Sekunden)
  const SNIPPET_START_TIME = 79;
  const SNIPPET_DURATION = 90;
  const [isPlayingSnippet, setIsPlayingSnippet] = useState(false);
  const [snippetCurrentTime, setSnippetCurrentTime] = useState(79);
  const snippetAudioRef = useRef<HTMLAudioElement | null>(null);

  // 3. FAQ Accordion State
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // Klangprobe URL (Cloudflare R2)
  const SAMPLE_AUDIO_URL = 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerbucher/Der%20Tag%20an%20dem%20der%20Schmetterling%20erwachte%20Final.mp3';

  useEffect(() => {
    async function verifyAdmin() {
      setCheckingAuth(true);
      if (!user) {
        setIsAdmin(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('profiles')
          .select('rolle')
          .eq('id', user.id)
          .maybeSingle();

        if (data?.rolle?.toLowerCase() === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Fehler bei Admin-Verifizierung:', err);
        setIsAdmin(false);
      } finally {
        setCheckingAuth(false);
      }
    }

    verifyAdmin();
  }, [user]);

  // Audio Snippet Steuerung (Startet ab 1:19 Min. und läuft für 90 Sek.)
  const togglePlaySnippet = () => {
    const audio = snippetAudioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlayingSnippet(false);
    } else {
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
  // A) Ladeanzeige während der Admin-Prüfung
  // =========================================================================
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 text-[var(--text-main)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
          <span className="text-xs text-[var(--text-muted)] font-mono">Prüfe Administrator-Berechtigung...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // B) Zugriff verwehrt (Wenn kein Admin)
  // =========================================================================
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Shield size={32} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Vorschau-Modus
            </span>
            <h2 className="text-2xl font-serif font-bold mt-3">Nur für Administratoren</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
              Die neue Hörbuch-Themenseite wird aktuell vorbereitet und ist vor der Veröffentlichung ausschließlich für das Flow der Stille Team einsehbar.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Zurück zur Startseite</span>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // C) Hauptansicht für Admins
  // =========================================================================
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-20 selection:bg-[var(--accent)] selection:text-white">
      <SEO
        title="Die Hörbuch-Welt von Flow der Stille – Achtsamkeit, Trost & Innere Ruhe"
        description="Ganzheitliche Hörbücher von Jacqueline Schmetzer, gesprochen von Lisa Ragusa. Beruhigende Geschichten, die dein Nervensystem sanft entspannen."
      />

      {/* Admin-Hinweisleiste oben */}
      <div className="bg-emerald-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
        <Sparkles size={14} className="shrink-0" />
        <span>
          <strong>Admin-Vorschau aktiv:</strong> Diese Seite ist aktuell nur für dich und autorisierte Administratoren sichtbar.
        </span>
      </div>

      {/* Audio-Element für die Klangprobe (startet ab 1:19 Min. und läuft für genau 90 Sek.) */}
      <audio
        ref={snippetAudioRef}
        src={SAMPLE_AUDIO_URL}
        preload="none"
        onTimeUpdate={() => {
          if (snippetAudioRef.current) {
            const cur = snippetAudioRef.current.currentTime;
            setSnippetCurrentTime(cur);
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
                  <span>Klangprobe lauschen (1:30 Min)</span>
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
                </span>
                <span className="font-mono text-[var(--text-muted)]">
                  {formatTime(Math.max(0, snippetCurrentTime - SNIPPET_START_TIME))} / {formatTime(SNIPPET_DURATION)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden relative">
                <div
                  className="h-full bg-[var(--accent)] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (Math.max(0, snippetCurrentTime - SNIPPET_START_TIME) / SNIPPET_DURATION) * 100)}%` }}
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
                Geschrieben von <strong>Jacqueline Schmetzer</strong> aus jahrelanger Achtsamkeitspraxis. Jede Zeile zielt darauf ab, sanften Trost zu spenden, Ängste vor Veränderung aufzulösen und innere Kraftquellen zu aktivieren.
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
                Eingesprochen von <strong>Lisa Ragusa</strong> mit einer warmen, tief geerdeten Stimmfarbe. Ihr sanftes Lesetempo verlangsamt den Atemrhythmus und vermittelt ein Gefühl von Geborgenheit und Sicherheit.
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
                Produziert von <strong>Dirk Schmetzer</strong>. Abgestimmt auf eine sanfte Dynamik ohne laute Spitzen oder störende Nebengeräusche – perfekt zum Abschalten am Abend oder für den erholsamen Mittagsschlaf.
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

              {/* Kapitel-Übersicht mit Startzeiten und Dauer */}
              <div className="bg-[var(--bg-alt)] rounded-2xl p-4 border border-[var(--border)] text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between font-semibold text-[var(--text-main)] mb-1 pb-1.5 border-b border-[var(--border)]">
                  <span>Kapitel und Abschnitte</span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">Startzeit und Dauer</span>
                </div>
                <div className="space-y-2 text-[var(--text-muted)]">
                  <div className="flex justify-between items-start gap-2">
                    <span>• Einleitung und rechtlicher Hinweis</span>
                    <span className="font-mono text-[11px] shrink-0 text-[var(--text-main)]">00:00 (Dauer 1:19 Min.)</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span>• 1. Warum der Übergang erst der Anfang ist</span>
                    <span className="font-mono text-[11px] shrink-0 text-[var(--text-main)]">ab 01:19 (Dauer 17:48 Min.)</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span>• 2. Der Übergang: Wenn Wissenschaft auf Spiritualität trifft</span>
                    <span className="font-mono text-[11px] shrink-0 text-[var(--text-main)]">ab 19:07 (Dauer 17:10 Min.)</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span>• 3. Die andere Ebene: Jenseits des schweren Kostüms</span>
                    <span className="font-mono text-[11px] shrink-0 text-[var(--text-main)]">ab 36:17 (Dauer 13:18 Min.)</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span>• 4. Das Erwachen im Hier und Jetzt: Die Befreiung zum Leben</span>
                    <span className="font-mono text-[11px] shrink-0 text-[var(--text-main)]">ab 49:35 (Dauer 9:08 Min.)</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center text-[11px] font-semibold text-[var(--text-main)]">
                  <span>Gesamtlaufzeit:</span>
                  <span className="font-mono text-[var(--accent)]">58:43 Minuten</span>
                </div>
              </div>

              {/* Preisanker & Kauf-Verlinkung */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-[var(--text-main)]">4,99 €</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Einmalig • Lebenslanger Zugriff</div>
                </div>

                <Link
                  to="/hoerbuch/hoerbuch_der_tag_an_dem_der_schmetterling_erwachte"
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen size={16} />
                  <span>Hörbuch-Seite öffnen & anhören</span>
                </Link>
              </div>
            </div>
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

    </div>
  );
}

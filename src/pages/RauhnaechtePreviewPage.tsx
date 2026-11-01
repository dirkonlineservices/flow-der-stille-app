import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Play, Pause, Volume2, VolumeX, Moon, Clock, 
  BookOpen, Star, Flame, ArrowLeft, ArrowRight, 
  ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, Bell, 
  Heart, Compass, Leaf, Music, Shield, Mail, Loader2, Gift
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { isKnownAdminEmail } from '../lib/adminSecurity';
import { offlineManager } from '../lib/offlineAudioService';
import { getSupabase } from '../lib/supabaseClient';
import { subscribeToNewsletter } from '../lib/newsletterService';

interface MeditationStation {
  number: string;
  date: string;
  month: string;
  title: string;
  focus: string;
  animal: string;
  herb: string;
  description: string;
}

const STATIONS: MeditationStation[] = [
  {
    number: 'Auftakt • Meditation 1',
    date: '21. Dezember',
    month: 'Wintersonnenwende (Julzeit)',
    title: 'Die Wintersonnenwende – Das Julfeuer & Yggdrasils Wurzeln',
    focus: 'Die dunkelste Nacht ehren, das innere Licht entzünden und sich an den Wurzeln des Weltenbaums erden.',
    animal: 'Der weise Uhu (Blick in die Dunkelheit)',
    herb: 'Fichtenharz & Wacholderspitzen',
    description: 'Der feierliche Auftakt noch vor den eigentlichen 12 Nächten. An der Wintersonnenwende kehrt das Licht zurück. Du steigst hinab zu den uralten Wurzeln von Yggdrasil an den Brunnen Urdars.'
  },
  {
    number: '1. Rauhnacht • Meditation 2',
    date: '24./25. Dezember',
    month: 'Januar (Das Fundament)',
    title: 'Basis & Urvertrauen – Die Wurzeln des neuen Jahres',
    focus: 'Erdung, Verankerung im Körper, Loslassen von Existenzängsten und Festigung des inneren Fundaments.',
    animal: 'Die Schneeeule (Klarheit & Schutz)',
    herb: 'Fichtenharz & Kiefernnadeln',
    description: 'Die erste geweihte Nacht legt den Grundstein für das gesamte kommende Jahr. Sie steht für den Monat Januar und schenkt dir Stabilität und tiefes Urvertrauen.'
  },
  {
    number: '2. Rauhnacht • Meditation 3',
    date: '25./26. Dezember',
    month: 'Februar (Die innere Stimme)',
    title: 'Stille & Höheres Selbst – Der Flügelschlag der Intuition',
    focus: 'Verbindung mit der eigenen inneren Weisheit, Lauschen in die Stille jenseits des Verstandeslärms.',
    animal: 'Der stolze Hirsch (Führung & Würde)',
    herb: 'Wacholderholz & Salbeiblätter',
    description: 'Dem Februar zugeordnet, bringt diese Nacht Klärung. Der Hirsch führt dich durch die verschneite Waldlichtung zu deiner eigenen inneren Wahrhaftigkeit.'
  },
  {
    number: '3. Rauhnacht • Meditation 4',
    date: '26./27. Dezember',
    month: 'März (Die Herzöffnung)',
    title: 'Herzöffnung & Mitgefühl – Die Quelle der Liebe',
    focus: 'Alte Kränkungen und Groll sanft erlösen, Selbstliebe und weiche Hingabe ans Leben stärken.',
    animal: 'Der weiße Schwan (Reinheit & Vergebung)',
    herb: 'Wilde Rose, Beifuß & Lavendel',
    description: 'Die Nacht des Frühlingserwachens (März). Dein Herzchakra wird von alten Schutzpanzern befreit, damit neue Liebe und Freundschaft einströmen dürfen.'
  },
  {
    number: '4. Rauhnacht • Meditation 5',
    date: '27./28. Dezember',
    month: 'April (Die Transformation)',
    title: 'Auflösung des Alten – Das alchemistische Julfeuer',
    focus: 'Radikales Entrümpeln mentaler und emotionaler Lasten, Wandlung von Begrenzungen in Lebenskraft.',
    animal: 'Die Schlange (Häutung & Regeneration)',
    herb: 'Weißer Salbei & Weihrauch',
    description: 'Im Zeichen des Monats April vollzieht sich eine reinigende Wandlung. Was dir nicht mehr dient, wird symbolisch dem heiligen Feuer übergeben.'
  },
  {
    number: '5. Rauhnacht • Meditation 6',
    date: '28./29. Dezember',
    month: 'Mai (Gemeinschaft & Freundschaft)',
    title: 'Herzensbande & Treue – Der Kreis der Gefährten',
    focus: 'Echtes Miteinander, heilsame Beziehungen und die Verbundenheit mit Seelenverwandten stärken.',
    animal: 'Der treue Wolf (Loyalität & Rudelkraft)',
    herb: 'Lindenblüten & Quendel (Wilder Thymian)',
    description: 'Zugeordnet dem Wonnemonat Mai. Diese Seelenreise stärkt dein soziales Band und öffnet den Raum für Menschen, die dich in deinem wahren Wesen erkennen.'
  },
  {
    number: '6. Rauhnacht • Meditation 7',
    date: '29./30. Dezember',
    month: 'Juni (Ahnenkraft & Bereinigung)',
    title: 'Der Segen der Ahnen – Die Kraft der Generationen',
    focus: 'Dank an die Vorfahren, Erlösung vererbter Bürden und Empfang des uralten Familiensegens.',
    animal: 'Der Höhlenbär (Urmut & Erdverbundenheit)',
    herb: 'Myrrhe, Engelwurz & Wacholder',
    description: 'Mitte des Jahreszyklus (Juni). Du betrittst den Kreis der Ahnen und empfängst deren unerschütterliche Kraft für deinen eigenen Lebensweg.'
  },
  {
    number: '7. Rauhnacht • Meditation 8',
    date: '30./31. Dezember',
    month: 'Juli (Gefühlsreichtum & Lebensfreude)',
    title: 'Auf der Brücke Bifröst – Das Farbenspiel der Gefühle',
    focus: 'Freude, Schöpferkraft, Leichtigkeit und die Versöhnung aller inneren Gemütszustände.',
    animal: 'Der goldene Hahn Gullinkambi (Erwachen)',
    herb: 'Johanniskraut & Ringelblume',
    description: 'Der Hochsommermonat Juli lädt ein zur puren Lebensfreude. Auf der schimmernden Regenbogenbrücke Bifröst verbinden sich Himmel und Erde.'
  },
  {
    number: '8. Rauhnacht • Meditation 9',
    date: '31. Dez. / 01. Jan.',
    month: 'August (Urkraft & Neubeginn)',
    title: 'Thors Hammer – Entschlusskraft & Manifestation',
    focus: 'Die Schwellennacht zum neuen bürgerlichen Jahr. Willenskraft bündeln, klare Grenzen setzen.',
    animal: 'Der gehörnte Bock Tanngrisnir (Ausdauer)',
    herb: 'Meisterwurz & Alantwurzel',
    description: 'An der Schwelle von Alt zu Neu (August). Mit Thors Blitz und dem heiligen Hammer Mjöllnir schlägst du einen Funken für deinen wahrhaftigen Lebensweg.'
  },
  {
    number: '9. Rauhnacht • Meditation 10',
    date: '01./02. Januar',
    month: 'September (Zukunft & Schicksalsfäden)',
    title: 'Skulds Runen – Das Weben der Zukunft',
    focus: 'Blick auf das Schicksal, Erkennen göttlicher Synchronizitäten und bewusste Lebensgestaltung.',
    animal: 'Der Himmelsfalke Vedrfölnir (Weitblick)',
    herb: 'Eichenmistel & Beifußspitzen',
    description: 'Der September steht für die Norn Skuld. In dieser Meditation darfst du die goldenen Schicksalsfäden deines neuen Jahres bewusst mitweben.'
  },
  {
    number: '10. Rauhnacht • Meditation 11',
    date: '02./03. Januar',
    month: 'Oktober (Geistige Klarheit)',
    title: 'Odins Speer des Fokus – Konzentration & Weisheit',
    focus: 'Überwindung von Zerstreuung und Zweifel, scharfe Ausrichtung auf deine wahren Lebensziele.',
    animal: 'Die Raben Hugin (Gedanke) & Munin (Erinnerung)',
    herb: 'Kiefernharz & Rosmarin',
    description: 'Dem Monat Oktober zugeordnet. Die beiden Raben Odins schenken dir den klaren Blick aus der Vogelperspektive auf alle Lebensbereiche.'
  },
  {
    number: '11. Rauhnacht • Meditation 12',
    date: '03./04. Januar',
    month: 'November (Loslassen & Wandlung)',
    title: 'Das Ahnengedenken – Friede mit dem Werden & Vergehen',
    focus: 'Tiefer Seelenfrieden mit Vergänglichkeit, Versöhnung mit Verlusten und Vertrauen in den ewigen Kreislauf.',
    animal: 'Die Wölfe Geri & Freki (Unbeirrbarkeit)',
    herb: 'Holunderholz & Weihrauch',
    description: 'Der November erinnert an den Übergang. Eine meditative Einkehr voller Sanftmut, die dich spüren lässt, dass keine Energie im Kosmos je verloren geht.'
  },
  {
    number: '12. Rauhnacht • Meditation 13',
    date: '04./05. Januar',
    month: 'Dezember (Vollendung & Segen)',
    title: 'Frau Holle schüttelt das Tor – Der ewige Segen',
    focus: 'Integration aller 12 Nächte, Vollendung des Reifeprozesses und Empfang des Segens für das ganze Jahr.',
    animal: 'Der weiße Hirsch von Yggdrasil (Reines Licht)',
    herb: 'Styrax, Weihrauch & Fichtenharz',
    description: 'Die krönende 12. Rauhnacht schließt den magischen Kreis. Frau Holle schüttelt ihr Segensbett und lässt weiße Kristalle des Friedens über dein Leben rieseln.'
  }
];

export default function RauhnaechtePreviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isKnownAdminEmail(user?.email);

  // Kaufstatus prüfen
  const [isOwned, setIsOwned] = useState<boolean>(() => {
    return (
      offlineManager.isPurchasedOffline('rauhnaechte') ||
      offlineManager.isPurchasedOffline('fds_rauhnaechte') ||
      isKnownAdminEmail(user?.email)
    );
  });

  useEffect(() => {
    if (!user) return;
    async function checkOwnership() {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('kaeufe')
          .select('id')
          .eq('user_id', user!.id)
          .eq('produkt_id', 'rauhnaechte')
          .maybeSingle();

        if (data || isKnownAdminEmail(user!.email)) {
          setIsOwned(true);
        }
      } catch (e) {
        console.warn('Ownership check error:', e);
      }
    }
    checkOwnership();
  }, [user]);

  // Audio Player Zustand (Hörprobe bis ca. 2:30 Min.)
  const AUDIO_SRC = 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerbucher/Raun%C3%A4chte%20-%20final-neu.mp3';
  const PREVIEW_LIMIT = 150; // 2:30 Min. Vorschau
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Accordion Zustand für Kapitel
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Newsletter / News Eintragung
  const [newsEmail, setNewsEmail] = useState('');
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsStatus, setNewsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [newsErrorMsg, setNewsErrorMsg] = useState('');

  useEffect(() => {
    if (user?.email) {
      setNewsEmail(user.email);
    }
  }, [user]);

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail || newsLoading) return;

    setNewsLoading(true);
    setNewsErrorMsg('');
    try {
      const res = await subscribeToNewsletter({
        email: newsEmail.trim(),
        userId: user?.id,
        source: 'rauhnaechte_news'
      });
      if (res.success) {
        setNewsStatus('success');
      } else {
        setNewsStatus('error');
        setNewsErrorMsg(res.message || 'Eintragung fehlgeschlagen. Bitte versuche es später noch einmal.');
      }
    } catch (err: any) {
      setNewsStatus('error');
      setNewsErrorMsg(err?.message || 'Verbindungsfehler beim Eintragen.');
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const curr = audio.currentTime;
      setCurrentTime(curr);
      if (curr >= PREVIEW_LIMIT) {
        audio.pause();
        audio.currentTime = PREVIEW_LIMIT;
        setIsPlaying(false);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (currentTime >= PREVIEW_LIMIT) {
        audio.currentTime = 0;
      }
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Audio play blocked:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(val, PREVIEW_LIMIT);
      setCurrentTime(audio.currentTime);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 pb-20">
      <SEO 
        title="Yggdrasils Atem – 12 Rauhnächte auf der Schwelle | Flow der Stille"
        description="13 geführte schamanische Meditationen & Seelenreisen zur Wintersonnenwende und den 12 heiligen Rauhnächten. Jetzt vorab sichern und anhören, wann immer es für dich stimmig ist."
      />

      <audio 
        ref={audioRef} 
        src={AUDIO_SRC} 
        preload="metadata" 
      />

      {/* Hero Section mit Winteratmosphäre */}
      <div className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-[var(--bg-alt)]/60 via-[var(--bg-main)] to-[var(--bg-main)] pt-8 pb-14 sm:pt-12 sm:pb-20">
        
        {/* Dekorative Hintergrund-Lichter (Nordlicht / Wintersonnenwende-Atmosphäre) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-gradient-to-r from-emerald-500/10 via-amber-500/15 to-indigo-500/10 blur-3xl pointer-events-none rounded-full opacity-60 dark:opacity-40" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
            <Link to="/hoerbuecher" className="hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1">
              <ArrowLeft size={13} />
              <span>Zurück zur Übersicht</span>
            </Link>
            <span>/</span>
            <span className="text-[var(--accent)] font-medium">Hörbuch-Begleitung</span>
          </div>

          {/* Admin Banner (NUR für Admins sichtbar) */}
          {isAdmin && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Administrator-Zugang aktiv
                  </div>
                  <div className="text-xs text-amber-800/90 dark:text-amber-200/90">
                    Du hast vollen Zugriff auf das komplette Hörbuch (2 Std. 58 Min.) mit allen 16 Kapitel-Sprungmarken.
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/hoerbuch/rauhnaechte')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Vollen Player öffnen</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles size={14} />
            <span>Jetzt vorab verfügbar • Höre hinein, wann immer es für dich stimmig ist</span>
          </div>

          {/* Haupttitel & Subline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4 text-left">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold text-[var(--text-main)] tracking-tight leading-tight">
                Yggdrasils Atem
              </h1>
              <p className="font-serif text-xl sm:text-2xl text-[var(--accent)] italic">
                12 Rauhnächte auf der Schwelle
              </p>
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                13 schamanische Seelenreisen und geführte Meditationen durch die heilige Julzeit und die geweihten Nächte zwischen den Jahren. Verbinde dich an den Wurzeln des Weltenbaums Yggdrasil mit heimischen Pflanzenhelfern, altem Räucherwerk und den Fylgja-Krafttieren.
              </p>

              {/* Eckdaten Pills */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-main)] font-medium shadow-xs">
                  <Moon size={14} className="text-[var(--accent)]" />
                  <span>Auftakt: Wintersonnenwende (21. Dezember)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-main)] font-medium shadow-xs">
                  <BookOpen size={14} className="text-[var(--accent)]" />
                  <span>13 geführte Meditationen</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-main)] font-medium shadow-xs">
                  <Clock size={14} className="text-[var(--accent)]" />
                  <span>2 Std. 58 Min. Gesamtdauer</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-main)] font-medium shadow-xs">
                  <Music size={14} className="text-[var(--accent)]" />
                  <span>Stimme: Lisa Ragusa</span>
                </div>
              </div>

              {/* Kauf- / Freischaltungs-Box */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xs flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    {isOwned ? 'Dein Status' : 'Ruhe-Shop Einzelkauf'}
                  </div>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-2xl font-bold font-serif text-[var(--text-main)] whitespace-nowrap">
                      {isOwned ? 'Freigeschaltet' : '9,99\u00A0€'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {isOwned ? '(Voller Zugriff auf alle 13 Meditationen)' : '(Einmalig • Zeitlich unbegrenztes Streaming)'}
                    </span>
                  </div>
                </div>

                {isOwned ? (
                  <Link
                    to="/hoerbuch/rauhnaechte"
                    className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play size={18} className="fill-white" />
                    <span>Jetzt anhören</span>
                  </Link>
                ) : (
                  <Link
                    to="/premium#product-rauhnaechte"
                    className="px-6 py-4 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Gift size={18} />
                    <span>Jetzt vorab kaufen (9,99\u00A0€)</span>
                  </Link>
                )}
              </div>

              <p className="text-xs text-[var(--text-muted)] italic pt-1">
                💡 Du darfst selbst entscheiden, wann es für dich stimmig ist: Du kannst das Hörbuch schon jetzt erwerben und vorab hineinhören oder traditionell zur Wintersonnenwende starten.
              </p>

            </div>

            {/* Cover Spalte mit Leuchteffekt */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-80 aspect-square rounded-3xl overflow-hidden shadow-2xl border border-[var(--border)] group">
                <img
                  src="/images/products/cover_rauhnaechte.jpg"
                  alt="Yggdrasils Atem – 12 Rauhnächte auf der Schwelle"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e: any) => {
                    e.target.src = '/images/products/cover_mensch_sein.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    13 Meditationen • 2h 58m
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Hörproben-Bereich (Direkt integrierter Audioplayer) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xl">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[var(--border)]">
            <div className="space-y-1 text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                <Sparkles size={13} />
                <span>Kostenlose Hörprobe</span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--text-main)]">
                Rechtlicher Hinweis & Vorwort
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Gesprochen von Lisa Ragusa • Einstimmung auf die schamanische Seelenreise
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                onClick={toggleMute}
                className="p-2.5 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                aria-label="Ton stumm schalten"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>

          {/* Player Leiste */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0 cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Abspielen'}
            >
              {isPlaying ? <Pause size={24} className="fill-white" /> : <Play size={24} className="fill-white ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1.5">
              <input
                type="range"
                min="0"
                max={PREVIEW_LIMIT}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
                <span>{formatTime(currentTime)}</span>
                <span>Vorschau: {formatTime(PREVIEW_LIMIT)} Min.</span>
              </div>
            </div>
          </div>

          {currentTime >= PREVIEW_LIMIT && (
            <div className="mt-4 p-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-xs text-[var(--text-muted)] text-center">
              ✨ Die Hörprobe ist beendet. Sichere dir das vollständige Hörbuch mit allen 13 Meditationen für 9,99&nbsp;€ oder trage dich unten für News & Impulse ein.
            </div>
          )}

        </div>
      </div>

      {/* NEU: E-Mail Benachrichtigung & News-Eintragung */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-alt)] border border-[var(--border)] shadow-lg text-left relative overflow-hidden">
          
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
              <Mail size={13} />
              <span>Rauhnächte-News & Begleit-Impulse</span>
            </div>

            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
              Bleibe informiert & erhalte heilsame Impulse
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Trage dich unverbindlich für unsere Rauhnächte-News ein: Wir senden dir rechtzeitig vor und während der Julzeit wertvolle Hintergrundinformationen, Räucheranleitungen und heilsame Meditationstipps direkt in dein E-Mail-Postfach.
            </p>

            {newsStatus === 'success' ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-500" />
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="font-bold">Herzlichen Dank für deine Eintragung!</div>
                  <p className="opacity-90">
                    Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte prüfe kurz dein Postfach (und ggf. den Spam-Ordner) und bestätige deine Anmeldung, damit unsere Rauhnächte-Impulse sicher bei dir ankommen.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNewsSubmit} className="pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={newsEmail}
                    onChange={(e) => setNewsEmail(e.target.value)}
                    placeholder="Deine E-Mail-Adresse"
                    className="flex-1 px-4 py-3.5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] focus:border-[var(--accent)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={newsLoading}
                    className="px-6 py-3.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {newsLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Wird eingetragen...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        <span>Für News & Impulse eintragen</span>
                      </>
                    )}
                  </button>
                </div>

                {newsStatus === 'error' && (
                  <p className="text-xs text-red-500">
                    {newsErrorMsg}
                  </p>
                )}

                <p className="text-[11px] text-[var(--text-muted)]">
                  🔒 Kein Spam. Du kannst dich jederzeit mit nur einem Klick wieder abmelden.
                </p>
              </form>
            )}

          </div>

        </div>
      </div>

      {/* Die 13 Meditationen im Überblick */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-14 sm:mt-20">
        
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            <Compass size={13} />
            <span>Reiseplan durch die heilige Zeit</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)]">
            Die 13 geführten Seelenreisen
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Vom feierlichen Auftakt an der Wintersonnenwende bis zur Vollendung in der 12. Rauhnacht. Jede Station birgt eine eigenständige Tiefenmeditation, ein schützendes Seelentier (Fylgja) und ein heilendes Räucherritual.
          </p>
        </div>

        {/* Stationsliste als edle Karten */}
        <div className="space-y-3">
          {STATIONS.map((station, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden transition-all shadow-xs hover:border-[var(--accent)]/50"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-alt)] text-[var(--accent)] flex items-center justify-center font-serif font-bold text-sm shrink-0 border border-[var(--border)]">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-wider">
                          {station.number}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">•</span>
                        <span className="text-[11px] text-[var(--text-muted)] font-medium">
                          {station.date}
                        </span>
                        <span className="text-[10px] bg-[var(--bg-alt)] px-2 py-0.5 rounded-full text-[var(--text-muted)] border border-[var(--border)]">
                          {station.month}
                        </span>
                      </div>
                      <h3 className="font-serif font-semibold text-sm sm:text-base text-[var(--text-main)] truncate pt-0.5">
                        {station.title}
                      </h3>
                    </div>
                  </div>

                  <div className="text-[var(--text-muted)] shrink-0">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-[var(--border)]/60 bg-[var(--bg-alt)]/30 space-y-3 text-left animate-in fade-in duration-200">
                    <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
                      {station.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
                      <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-start gap-2.5">
                        <Star size={15} className="text-[var(--accent)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[var(--text-main)]">Seelentier (Fylgja):</div>
                          <div className="text-[var(--text-muted)]">{station.animal}</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-start gap-2.5">
                        <Flame size={15} className="text-[var(--accent)] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[var(--text-main)]">Heimisches Räucherwerk:</div>
                          <div className="text-[var(--text-muted)]">{station.herb}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-card)]/80 border border-[var(--border)]/60 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                      <Leaf size={14} className="text-emerald-500 shrink-0" />
                      <span><strong>Fokus:</strong> {station.focus}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Schamanischer Hintergrund & Weltenbaum Yggdrasil */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-14 sm:mt-20">
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-md text-left space-y-6">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              Über dieses Werk
            </h2>
            <p className="text-xs sm:text-sm text-[var(--accent)] font-medium">
              Verfasst von Dirk Schmetzer • Mit Hingabe gesprochen von Lisa Ragusa
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Die Rauhnächte sind die heiligen zwölf Nächte zwischen Heiligabend und dem Dreikönigstag (Epiphanias). Nach altem nordischem und keltischem Brauchtum stehen in dieser Zeit die Tore zur geistigen Welt weit offen – die Gesetze von Zeit und Raum verflüssigen sich.
          </p>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            <em>Yggdrasils Atem</em> verbindet diese uralte Tradition mit fundierter Tiefenentspannung und geführter Meditation. Es ist kein theoretisches Sachbuch, sondern eine lebendige Erfahrung: Dreizehn akustische Seelenreisen, untermalt von meditativen Naturklängen, die dich ruhig durch den Jahreswechsel begleiten.
          </p>

          {/* Rechtlicher Audio-Hinweis gemäß Sicherheitsrichtlinien */}
          <div className="p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-start gap-3">
            <Shield size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--text-main)]">Sicherheits- und Anwendungshinweis:</span>{' '}
              Die geführten Meditationen führen in tiefe Entspannungszustände. Bitte höre diese Aufnahmen niemals beim Steuern von Kraftfahrzeugen oder beim Bedienen schwerer Maschinen an. Reine Online-Nutzung (Streaming im Ruhe-Shop von Flow der Stille).
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

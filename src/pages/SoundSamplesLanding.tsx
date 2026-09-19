import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Headphones, Sparkles, Volume2, ArrowLeft, ArrowRight, 
  CheckCircle2, Clock, ShieldCheck, Heart, Moon, BookOpen, 
  Wind, HelpCircle, ChevronDown, ChevronUp, Mic, Cpu, Compass, Lock, Play
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import AudioDisclaimerNotice from '../components/AudioDisclaimerNotice';
import { HoerprobenPlayer } from '../components/HoerprobenPlayer';
import { DEFAULT_PRODUCTS, ProductData } from '../lib/offlineProductsService';

interface SampleCardData {
  id: string;
  title: string;
  category: 'meditation' | 'selbsthypnose' | 'hoerbuch' | 'uebung';
  categoryLabel: string;
  badge: string;
  duration: string;
  priceLabel: string;
  isFree: boolean;
  cover: string;
  shortDesc: string;
  voiceInfo: string;
  musicInfo: string;
  shopAnchor: string;
  landingUrl?: string;
  landingLabel?: string;
  audioPath: string;
  hoerprobeUrl?: string | null;
}

const ALL_SAMPLES: SampleCardData[] = [
  // ─── 1. GEFÜHRTE MEDITATIONEN ──────────────────────────────────
  {
    id: 'meditation_zur_herzoeffnung',
    title: 'Meditation zur Herzöffnung',
    category: 'meditation',
    categoryLabel: 'Geführte Meditation',
    badge: '100% Kostenfrei',
    duration: '16:45 Min.',
    priceLabel: 'Kostenfrei',
    isFree: true,
    cover: '/images/products/cover_herzoeffnung.jpg',
    shortDesc: 'Eine behutsame Einladung, emotionale Schutzpanzer abzulegen und Weite, Sanftheit und innere Wärme im Herzraum zuzulassen.',
    voiceInfo: 'Echte menschliche Stimme (Lisa Ragusa) • Text: Jacqueline Schmetzer',
    musicInfo: 'Harmonische Meditationsfrequenzen (KI-unterstützt)',
    shopAnchor: '/premium#product-fds_herzoeffnung_meditation',
    landingUrl: '/meditation',
    landingLabel: 'Zur Meditations-Themenseite',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20zur%20Herz%C3%B6ffnung.mp3',
    hoerprobeUrl: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerproben/Werbung(Hoerprobe)%20Herzoeffnung%20-%20%20Schutzpanzer.mp3'
  },
  {
    id: 'meditation_innere_ruhe',
    title: 'Meditation Innere Ruhe',
    category: 'meditation',
    categoryLabel: 'Geführte Meditation',
    badge: 'Nervensystem & Erdung',
    duration: '19:10 Min.',
    priceLabel: '1,99 €',
    isFree: false,
    cover: '/images/products/cover_innere_ruhe.jpg',
    shortDesc: 'Schalte das permanente Grundrauschen ab. Finde zurück in dein natürliches Tempo und spüre wieder festen Boden unter den Füßen.',
    voiceInfo: 'Echte menschliche Stimme (Lisa Ragusa) • Text: Jacqueline Schmetzer',
    musicInfo: 'Harmonische Meditationsfrequenzen (KI-unterstützt)',
    shopAnchor: '/premium#product-fds_meditation_innere_ruhe',
    landingUrl: '/meditation',
    landingLabel: 'Zur Meditations-Themenseite',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20innere%20Ruhe.mp3'
  },
  {
    id: 'meditation_inneres_kind',
    title: 'Meditation Inneres Kind',
    category: 'meditation',
    categoryLabel: 'Geführte Meditation',
    badge: 'Emotionale Heilung',
    duration: '16:10 Min.',
    priceLabel: '1,99 €',
    isFree: false,
    cover: '/images/products/cover_inneres_kind.jpg',
    shortDesc: 'Ein geschützter, sicherer Rahmen, um alten Schutzmustern und ungestillten Bedürfnissen mit aufrichtiger Zuwendung zu begegnen.',
    voiceInfo: 'Echte menschliche Stimme (Lisa Ragusa) • Text: Jacqueline Schmetzer',
    musicInfo: 'Harmonische Meditationsfrequenzen (KI-unterstützt)',
    shopAnchor: '/premium#product-fds_meditation_inneres_kind',
    landingUrl: '/meditation',
    landingLabel: 'Zur Meditations-Themenseite',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20inneres%20Kind.mp3'
  },
  {
    id: 'meditation_herzkompass',
    title: 'Meditation Herzkompass',
    category: 'meditation',
    categoryLabel: 'Geführte Meditation',
    badge: 'Intuition & Klarheit',
    duration: '20:00 Min.',
    priceLabel: '1,99 €',
    isFree: false,
    cover: '/images/products/cover_herzkompass.jpg',
    shortDesc: 'Verbinde dich wieder mit deiner inneren Stimme und schenke deinen Empfindungen Raum, um stimmige Entscheidungen im Alltag zu treffen.',
    voiceInfo: 'Echte menschliche Stimme (Lisa Ragusa) • Text: Jacqueline Schmetzer',
    musicInfo: 'Harmonische Meditationsfrequenzen (KI-unterstützt)',
    shopAnchor: '/premium#product-fds_herzkompass_meditation',
    landingUrl: '/meditation',
    landingLabel: 'Zur Meditations-Themenseite',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/meditation/Meditation%20Herzkompass.mp3'
  },

  // ─── 2. GEZIELTE SELBSTHYPNOSEN ────────────────────────────────
  {
    id: 'selbsthypnose_besser_und_erholsamer_schlaf',
    title: 'Selbsthypnose: Tiefer & Erholsamer Schlaf',
    category: 'selbsthypnose',
    categoryLabel: 'Gezielte Selbsthypnose',
    badge: '100% Kostenfrei',
    duration: '12:54 Min.',
    priceLabel: 'Kostenfrei',
    isFree: true,
    cover: '/images/products/cover_schlaf.jpg',
    shortDesc: 'Gedankenkarussell abschalten: Gleite durch sanfte Trance-Impulse in eine schwere, wohlige Tiefenentspannung und regenerierenden Schlaf.',
    voiceInfo: 'Echte menschliche Stimme (Lisa Ragusa) • Text: Jacqueline Schmetzer',
    musicInfo: 'Sanfte Schlafwellen & Frequenzen (KI-unterstützt)',
    shopAnchor: '/premium#product-fds_selbsthypnose_besserer_tieferer_schlaf',
    landingUrl: '/selbsthypnose',
    landingLabel: 'Zur Selbsthypnose-Themenseite',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Selbsthypnose%20Tiefer%20%26%20Erholsamer%20Schlaf.mp3',
    hoerprobeUrl: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerproben/Werbung(hoerprobe)%20Selbsthypnose%20-%20%20Besser%20Schlafen.mp3'
  },
  {
    id: 'selbshypnose_mehr_selbsbewusstsein_&_inneres_vertrauen',
    title: 'Selbsthypnose: Mehr Selbstbewusstsein & Vertrauen',
    category: 'selbsthypnose',
    categoryLabel: 'Gezielte Selbsthypnose',
    badge: 'Innere Stärke',
    duration: '15:30 Min.',
    priceLabel: '1,99 €',
    isFree: false,
    cover: '/images/products/cover_vertrauen.jpg',
    shortDesc: 'Echtes Selbstvertrauen ist nicht laut. Verankere ein unerschütterliches, ruhiges Fundament direkt in deinem Unterbewusstsein.',
    voiceInfo: 'Echte menschliche Stimme (Lisa Ragusa) • Text: Jacqueline Schmetzer',
    musicInfo: 'Stärkende Tiefenklänge (KI-unterstützt)',
    shopAnchor: '/premium#product-fds_hypnose_selbstbewusstsein',
    landingUrl: '/selbsthypnose',
    landingLabel: 'Zur Selbsthypnose-Themenseite',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Mehr%20Selbstbewusstsein%20%26%20Inneres%20Vertrauen%2015_30%20min.mp3'
  },
  {
    id: 'selbsthypnose_fokus&konzentration',
    title: 'Selbsthypnose: Fokus & Absolute Konzentration',
    category: 'selbsthypnose',
    categoryLabel: 'Gezielte Selbsthypnose',
    badge: 'Flow-Zustand',
    duration: '15:41 Min.',
    priceLabel: '1,99 €',
    isFree: false,
    cover: '/images/products/cover_fokus.jpg',
    shortDesc: 'Beende mentale Zerstreuung. Gelange mühelos und ohne anstrengende Willenskraft in deinen klaren, fokussierten Arbeitsmodus.',
    voiceInfo: 'Echte menschliche Stimme (Lisa Ragusa) • Text: Jacqueline Schmetzer',
    musicInfo: 'Konzentrationsfördernde Klangarchitektur (KI-unterstützt)',
    shopAnchor: '/premium#product-fds_hypnose_fokus',
    landingUrl: '/selbsthypnose',
    landingLabel: 'Zur Selbsthypnose-Themenseite',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Selbsthypnose%20Fokus%20%26%20Absolute%20Konzentration%2015_41%20min.mp3.mp3'
  },
  {
    id: 'selbsthypnose_ernaehrung',
    title: 'Selbsthypnose: Gesunde Ernährung & Lebensstil',
    category: 'selbsthypnose',
    categoryLabel: 'Gezielte Selbsthypnose',
    badge: 'Leichtigkeit & Balance',
    duration: '14:07 Min.',
    priceLabel: '1,99 €',
    isFree: false,
    cover: '/images/products/cover_ernaehrung.jpg',
    shortDesc: 'Wohlbefinden ohne Verzicht: Richte deine unbewussten Routinen neu aus, sodass gesunde Entscheidungen sich natürlich anfühlen.',
    voiceInfo: 'Echte menschliche Stimme (Lisa Ragusa) • Text: Jacqueline Schmetzer',
    musicInfo: 'Harmonische Wohlfühlfrequenzen (KI-unterstützt)',
    shopAnchor: '/premium#product-fds_hypnose_gesunde_ernaehrung',
    landingUrl: '/selbsthypnose',
    landingLabel: 'Zur Selbsthypnose-Themenseite',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Selbsthypnosen/Hynose%20Gesunde%20Ern%C3%A4hrung%20%26%20Aktiver%20Lebensstil.mp3'
  },

  // ─── 3. GANZHEITLICHE HÖRBÜCHER ────────────────────────────────
  {
    id: 'hoerbuch_der_tag_an_dem_der_schmetterling_erwachte',
    title: 'Der Tag, an dem der Schmetterling erwachte',
    category: 'hoerbuch',
    categoryLabel: 'Ganzheitliches Hörbuch',
    badge: 'Meisterwerk über das Loslassen',
    duration: '58:43 Min.',
    priceLabel: '4,99 €',
    isFree: false,
    cover: '/images/products/cover_schmetterling.jpg',
    shortDesc: 'Eine tröstende Reise über den Wandel des Bewusstseins: Warum der Übergang kein finsterer Abgrund ist, sondern der Flug eines Schmetterlings.',
    voiceInfo: 'Echte menschliche Stimme (Lisa Ragusa) • Buch & Skript: Jacqueline Schmetzer',
    musicInfo: 'Feinsinnige atmosphärische Musikuntermalung (KI-unterstützt)',
    shopAnchor: '/premium#product-fds_schmetterling',
    landingUrl: '/hoerbuecher',
    landingLabel: 'Zur Hörbuch-Themenseite',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerbucher/Der%20Tag%20an%20dem%20der%20Schmetterling%20erwachte%20Final.mp3'
  },
  {
    id: 'mensch_sein',
    title: 'Mut zum Echtsein – Was steckt hinter einem echten Menschen',
    category: 'hoerbuch',
    categoryLabel: 'Ganzheitliches Hörbuch',
    badge: 'Authentizität & Werte',
    duration: '58:39 Min.',
    priceLabel: '4,99 €',
    isFree: false,
    cover: '/images/products/cover_mensch_sein.jpg',
    shortDesc: 'Lege die Masken äußerer Erwartungen ab. Lerne, mit deinen eigenen Grenzen und Gefühlen in tiefer Ehrlichkeit und Würde im Einklang zu sein.',
    voiceInfo: 'Echte menschliche Stimme (Lisa Ragusa) • Buch & Skript: Jacqueline Schmetzer',
    musicInfo: 'Feinsinnige atmosphärische Musikuntermalung (KI-unterstützt)',
    shopAnchor: '/premium#product-fds_mensch_sein',
    landingUrl: '/hoerbuecher',
    landingLabel: 'Zur Hörbuch-Themenseite',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/hoerbucher/Mut%20zum%20echtsein.....mp3'
  },

  // ─── 4. SCHNUPPER- & ENTSPANNUNGSÜBUNGEN ────────────────────────
  {
    id: 'gefuehrte_atemuebung',
    title: 'Geführte Atemübung',
    category: 'uebung',
    categoryLabel: 'Kostenfreie Schnupperübung',
    badge: 'Sofort-Entspannung',
    duration: '1:49 Min.',
    priceLabel: 'Kostenfrei',
    isFree: true,
    cover: '/images/products/cover_atemarbeit.jpg',
    shortDesc: 'Beruhige dein Nervensystem und deinen Vagusnerv in unter zwei Minuten. Ideal bei akutem Stress, innerer Unruhe oder vor wichtigen Terminen.',
    voiceInfo: 'Digitale Sprachsynthese für schnellen, barrierefreien Zugriff • Text: Jacqueline Schmetzer',
    musicInfo: 'Akustische Frequenz-Ruhezone',
    shopAnchor: '/premium#product-fds_gefuehrte_atemuebung',
    landingUrl: '/exercises',
    landingLabel: 'Zu den Atemübungen',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Kostenfreie%20Produkte/anleitung_atmen.mp3'
  },
  {
    id: 'pmr_basis',
    title: 'Progressive Muskelentspannung (PMR)',
    category: 'uebung',
    categoryLabel: 'Kostenfreie Schnupperübung',
    badge: 'Körperliche Tiefenruhe',
    duration: '4:14 Min.',
    priceLabel: 'Kostenfrei',
    isFree: true,
    cover: '/images/products/cover_pmr.jpg',
    shortDesc: 'Das bewährte Prinzip von bewusstem Anspannen und Loslassen: Löst hartnäckige Muskelverspannungen in Schultern, Nacken und Rücken.',
    voiceInfo: 'Digitale Sprachsynthese für schnellen, barrierefreien Zugriff • Text: Jacqueline Schmetzer',
    musicInfo: 'Sanfte Begleitmelodie',
    shopAnchor: '/premium#product-fds_pmr_basis',
    landingUrl: '/exercises',
    landingLabel: 'Zu den Körperübungen',
    audioPath: 'https://pub-c96216cb10da46cdb69f5cdbc44b742c.r2.dev/Kostenfreie%20Produkte/Progressive%20Muskelentspannung.mp3'
  }
];

const FAQS = [
  {
    q: 'Kann ich mir die Hörproben wirklich kostenlos und ohne Registrierung anhören?',
    a: 'Ja, alle hier aufgeführten Klangproben und Ausschnitte kannst du direkt mit einem Klick abspielen – komplett ohne Registrierung, ohne versteckte Kosten und ohne Abo.'
  },
  {
    q: 'Wer spricht die Meditationen und Selbsthypnosen?',
    a: 'Unsere Meditationen und Selbsthypnosen werden von der professionellen Sprecherin Lisa Ragusa eingesprochen. Die Texte stammen von Entspannungstherapeutin Jacqueline Schmetzer.'
  },
  {
    q: 'Wie kann ich die vollständigen Audios freischalten?',
    a: 'Nach einer einfachen 1-Klick-Registrierung (z.B. per Google oder Facebook) kannst du kostenfreie Audios sofort in voller Länge hören oder kostenpflichtige Sessions für eine kleine einmalige Gebühr dauerhaft erwerben – ganz ohne Abonnement.'
  },
  {
    q: 'Funktionieren die Audios auch auf dem Smartphone und offline?',
    a: 'Ja! Du kannst die Audios im mobilen Webbrowser nutzen oder dir unsere kostenlose Flow der Stille Android-App herunterladen, in der du Sessions auch für den Offline-Flugmodus speichern kannst.'
  }
];

export default function SoundSamplesLanding() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const paramCat = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (paramCat && ['meditation', 'selbsthypnose', 'hoerbuch', 'uebung'].includes(paramCat.toLowerCase())) {
      return paramCat.toLowerCase();
    }
    return 'all';
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (paramCat && ['meditation', 'selbsthypnose', 'hoerbuch', 'uebung', 'all'].includes(paramCat.toLowerCase())) {
      setSelectedCategory(paramCat.toLowerCase());
    }
  }, [paramCat]);

  const filteredSamples = selectedCategory === 'all'
    ? ALL_SAMPLES
    : ALL_SAMPLES.filter(s => s.category === selectedCategory);

  // SEO Schema.org Structured Data (GEO & Google Search)
  const schemaJson = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Kostenlose Meditationen & Selbsthypnosen bei Flow der Stille",
      "description": "Kostenlose geführte Meditationen, Selbsthypnosen und Hörproben von Jacqueline Schmetzer, eingesprochen von Lisa Ragusa.",
      "numberOfItems": ALL_SAMPLES.length,
      "itemListElement": ALL_SAMPLES.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "AudioObject",
          "name": item.title,
          "description": item.shortDesc,
          "contentUrl": item.hoerprobeUrl || item.audioPath,
          "encodingFormat": "audio/mpeg",
          "duration": item.duration,
          "author": {
            "@type": "Person",
            "name": "Jacqueline Schmetzer"
          },
          "performer": {
            "@type": "Person",
            "name": item.category === 'uebung' ? "Flow der Stille Sprachsynthese" : "Lisa Ragusa"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Flow der Stille",
            "url": "https://flow-der-stille.de"
          }
        }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQS.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    }
  ];

  return (
    <div className="min-h-screen text-[var(--text-main)] transition-colors duration-300">
      <SEO
        title="Kostenlose Meditation & kostenlose Selbsthypnose – Hörproben | Flow der Stille"
        description="Entdecke kostenlose Meditationen und geführte Selbsthypnosen zum sofortigen Anhören. Von Jacqueline Schmetzer, gesprochen von Lisa Ragusa – ohne Abo, ohne Risiko."
        keywords="kostenlose Meditation, kostenlose Selbsthypnose, Meditation kostenlos anhören, Selbsthypnose Hörprobe, Meditation zum Einschlafen, Herzöffnung, innerer Frieden, Lisa Ragusa Sprecherin, Jacqueline Schmetzer, Flow der Stille Audio"
        image="/images/products/cover_herzoeffnung.jpg"
        schemaJson={schemaJson}
      />

      {/* ─── OBERE NAVIGATION / BREADCRUMB ──────────────────────────── */}
      <div className="pt-4 pb-2 px-4 sm:px-6 max-w-6xl mx-auto flex items-center justify-between gap-4">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Zurück zur Startseite</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Link to="/premium" className="hover:text-[var(--accent)] transition-colors">Shop</Link>
          <span>/</span>
          <span className="font-semibold text-[var(--text-main)]">Klangproben</span>
        </div>
      </div>

      {/* ─── HERO SECTION ───────────────────────────────────────────── */}
      <header className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider mb-4 border border-[var(--accent)]/30 shadow-2xs">
            <Headphones size={14} />
            <span>Kostenlose Meditationen &amp; Selbsthypnose Hörproben</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-[var(--text-main)] leading-[1.18] max-w-3xl mx-auto">
            Spüre den Unterschied wahrer innerer Ruhe.
          </h1>

          <p className="text-sm sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Möchtest du eine <strong className="text-[var(--text-main)]">kostenlose Meditation</strong> oder geführte <strong className="text-[var(--text-main)]">kostenlose Selbsthypnose</strong> ausprobieren? 
            Höre hier völlig unverbindlich in jede Session rein – 100% werbefrei, ohne Abo und sofort im Browser.
          </p>

          {/* Schnelle Vorteilsleiste */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[var(--text-muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>Sofort im Web abspielbar</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>Haftungsausschluss vorab übersprungen</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>100 % Werbefrei &amp; ohne Abo</span>
            </span>
          </div>
        </div>
      </header>

      {/* ─── TRANSPARENZ & HERKUNFTS-HINWEIS (KI vs. MENSCHLICH) ────── */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto mb-10">
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-[var(--text-main)]">
                Transparenz &amp; Authentizität: Wie unsere Audios entstehen
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Echte menschliche Herzensarbeit trifft auf moderne, harmonisierende Klangwelten.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
            {/* Box 1: Lisa & Jacqueline */}
            <div className="p-4 rounded-2xl bg-[var(--bg-alt)]/70 border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-main)]">
                <Mic size={16} className="text-rose-500 shrink-0" />
                <span>Menschliche Stimme &amp; Herz</span>
              </div>
              <p className="text-[var(--text-muted)]">
                Alle Meditationen, Selbsthypnosen und Hörbücher sind zu <strong>100 % von Jacqueline Schmetzer</strong> geschrieben und von <strong>Lisa Ragusa</strong> mit ihrer warmen, echten menschlichen Stimme eingesprochen.
              </p>
            </div>

            {/* Box 2: KI Hintergrundmusik */}
            <div className="p-4 rounded-2xl bg-[var(--bg-alt)]/70 border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-main)]">
                <Volume2 size={16} className="text-amber-500 shrink-0" />
                <span>Harmonisierende Frequenzen</span>
              </div>
              <p className="text-[var(--text-muted)]">
                Die meditativen Hintergrundmusiken wurden <strong>mit KI-Unterstützung komponiert</strong>. Sie sind harmonisch auf Alpha- und Theta-Wellen abgestimmt, um dein Nervensystem sanft zu entspannen.
              </p>
            </div>

            {/* Box 3: Schnupperübungen */}
            <div className="p-4 rounded-2xl bg-[var(--bg-alt)]/70 border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-main)]">
                <Cpu size={16} className="text-teal-500 shrink-0" />
                <span>Schnupper- &amp; Sofort-Übungen</span>
              </div>
              <p className="text-[var(--text-muted)]">
                Die geführte Atemübung und die PMR basieren auf Jacquelines Texten und nutzen <strong>digitale Sprachsynthese</strong>, um dir einen schnellen, barrierefreien und kostenlosen Soforteinstieg zu schenken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KATEGORIEN FILTER-TABS ─────────────────────────────────── */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto mb-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'all', label: 'Alle Klangproben', count: ALL_SAMPLES.length },
            { id: 'meditation', label: 'Geführte Meditationen', count: ALL_SAMPLES.filter(s => s.category === 'meditation').length },
            { id: 'selbsthypnose', label: 'Selbsthypnosen', count: ALL_SAMPLES.filter(s => s.category === 'selbsthypnose').length },
            { id: 'hoerbuch', label: 'Hörbücher', count: ALL_SAMPLES.filter(s => s.category === 'hoerbuch').length },
            { id: 'uebung', label: 'Schnupper- & Entspannungsübungen', count: ALL_SAMPLES.filter(s => s.category === 'uebung').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-[var(--accent)] text-white shadow-md scale-105'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] hover:bg-[var(--bg-alt)]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedCategory === tab.id ? 'bg-white/25 text-white' : 'bg-[var(--bg-alt)] text-[var(--text-muted)]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── HAFTUNGSAUSSCHLUSS DIREKT VOR DEN PROBEN ──────────────── */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto mb-8">
        <AudioDisclaimerNotice isLoggedIn={!!user} />
      </section>

      {/* ─── KLANGPROBEN LISTE / GRID ───────────────────────────────── */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSamples.map((sample) => {
            const productObj: Partial<ProductData> = {
              id: sample.id,
              titel: sample.title,
              audio_path: sample.audioPath,
              hoerprobe_url: sample.hoerprobeUrl || null,
              dauer: sample.duration.includes(':') 
                ? parseInt(sample.duration.split(':')[0]) * 60 + parseInt(sample.duration.split(':')[1]) 
                : 900
            };

            return (
              <div
                key={sample.id}
                id={`probe-${sample.id}`}
                className="bg-[var(--bg-card)] rounded-3xl p-5 sm:p-6 border border-[var(--border)] shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header: Cover + Info */}
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-[var(--border)] relative group">
                    <img
                      src={sample.cover}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {sample.isFree && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold shadow-xs">
                        GRATIS
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-[10px] font-semibold">
                        {sample.badge}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        {sample.categoryLabel}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-main)] leading-snug break-words">
                      {sample.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-[var(--accent)]" />
                        <span>{sample.duration}</span>
                      </span>
                      <span>•</span>
                      <span className="font-bold text-[var(--text-main)]">
                        {sample.priceLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kurzbeschreibung */}
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {sample.shortDesc}
                </p>

                {/* Transparenz-Zeile je Produkt */}
                <div className="p-2.5 rounded-xl bg-[var(--bg-alt)]/70 border border-[var(--border)] space-y-1 text-[11px] text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5 font-medium text-[var(--text-main)]">
                    <Mic size={12} className="text-[var(--accent)]" />
                    <span>{sample.voiceInfo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>{sample.musicInfo}</span>
                  </div>
                </div>

                {/* Interaktiver HoerprobenPlayer (überspringt autom. 70 Sek. Disclaimer) */}
                <div className="pt-2">
                  <HoerprobenPlayer
                    produkt={productObj}
                    variant="compact"
                  />
                </div>

                {sample.category === 'hoerbuch' && (
                  <div className="pt-2">
                    <Link
                      to={sample.id === 'mensch_sein' ? '/hoerbuch/mensch_sein?autoplay=true' : '/hoerbuch/schmetterling?autoplay=true'}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Play size={13} className="fill-white" />
                      <span>Mit 1 Klick Kapitel 1 kostenlos anhören →</span>
                    </Link>
                  </div>
                )}

                {/* Fußzeile mit Aktionen */}
                <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
                  {sample.landingUrl && (
                    <Link
                      to={sample.landingUrl}
                      className="text-[var(--accent)] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{sample.landingLabel || 'Mehr erfahren'}</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}

                  <Link
                    to={sample.shopAnchor}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-main)] font-semibold border border-[var(--border)] transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                  >
                    <span>Im Shop ansehen</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── HINWEIS ZUR VOLLVERSION & REGISTRIERUNG ─────────────────── */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto mb-16">
        <div className="bg-gradient-to-r from-emerald-900/10 via-[var(--bg-card)] to-emerald-900/10 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
            Du möchtest die vollständigen kostenfreien Audios hören?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Für die Vollversionen der kostenfreien Meditationen und Selbsthypnosen ist lediglich ein kostenloses Kundenkonto erforderlich. 
            Damit stellen wir rechtlich sicher, dass du vor der ersten Entspannungssitzung den gesundheitlichen Haftungsausschluss bestätigt hast.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <Link
                to="/premium"
                className="px-6 py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                <span>Zum Premium-Bereich &amp; Mediathek</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/registrieren"
                  className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <span>Kostenlos &amp; unverbindlich registrieren</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/anmelden"
                  className="px-6 py-3 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-main)] font-semibold text-xs sm:text-sm transition-all shadow-xs"
                >
                  Bereits ein Konto? Anmelden
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── HÄUFIG GESTELLTE FRAGEN (FAQ) ─────────────────────────── */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto pb-20">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
            <HelpCircle size={14} />
            <span>Transparenz &amp; Klarheit</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
            Häufige Fragen zu den Klangproben
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[var(--text-main)] cursor-pointer hover:bg-[var(--bg-alt)] transition-colors"
                aria-expanded={openFaq === idx}
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp size={18} className="text-[var(--accent)] shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-[var(--text-muted)] shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-3 bg-[var(--bg-alt)]/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Zurück nach oben / Startseite */}
        <div className="pt-10 text-center">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Zurück zur Startseite</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Gift, Calendar, BookOpen, Heart, Compass,
  CheckCircle2, ArrowRight, Mail, Loader2, X, Eye,
  LayoutGrid, Table as TableIcon, Flame, Moon, ShieldCheck,
  ChevronLeft, ChevronRight, Volume2, Clock
} from 'lucide-react';
import SEO from '../components/SEO';
import {
  ADVENT_DAYS,
  ADVENT_PILLARS,
  AdventCategory,
  AdventDay
} from '../data/adventskalender';
import { AdventskalenderPopupModal } from '../components/AdventskalenderPromo';
import { subscribeToNewsletter } from '../lib/newsletterService';
import { useAuth } from '../context/AuthContext';

const CATEGORY_STYLES: Record<
  AdventCategory,
  {
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    cardBorder: string;
    cardAccent: string;
    iconBg: string;
  }
> = {
  meditation: {
    badgeBg: 'bg-[#7C8B6F]/15',
    badgeText: 'text-[#3F4A36]',
    badgeBorder: 'border-[#7C8B6F]/35',
    cardBorder: 'border-[#7C8B6F]/30 hover:border-[#7C8B6F]',
    cardAccent: 'from-[#7C8B6F]/15 to-transparent',
    iconBg: 'bg-[#7C8B6F] text-white'
  },
  gewinnspiel: {
    badgeBg: 'bg-[#C8A96E]/25',
    badgeText: 'text-[#6E531D]',
    badgeBorder: 'border-[#C8A96E]/50',
    cardBorder: 'border-[#C8A96E]/60 hover:border-[#B38F4D] ring-1 ring-[#C8A96E]/30',
    cardAccent: 'from-[#C8A96E]/25 via-[#C8A96E]/5 to-transparent',
    iconBg: 'bg-[#B38F4D] text-white'
  },
  altes_wissen: {
    badgeBg: 'bg-amber-900/10',
    badgeText: 'text-amber-950',
    badgeBorder: 'border-amber-900/25',
    cardBorder: 'border-stone-200/90 hover:border-amber-800/50',
    cardAccent: 'from-amber-900/10 to-transparent',
    iconBg: 'bg-amber-900 text-amber-50'
  },
  achtsamkeit: {
    badgeBg: 'bg-emerald-900/10',
    badgeText: 'text-emerald-950',
    badgeBorder: 'border-emerald-800/25',
    cardBorder: 'border-stone-200/90 hover:border-emerald-700/50',
    cardAccent: 'from-emerald-800/10 to-transparent',
    iconBg: 'bg-emerald-800 text-emerald-50'
  }
};

export const AdventskalenderPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [selectedPart, setSelectedPart] = useState<'all' | 1 | 2>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | AdventCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Active Day Modal
  const [activeDay, setActiveDay] = useState<AdventDay | null>(null);

  // Promo Popup Preview state
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Opened doors persisted in localStorage
  const [openedDays, setOpenedDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('fds_advent_opened_days_2026');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Newsletter / Daily Impulse & Giveaway form state
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Modal-specific giveaway comment/entry state
  const [raffleAnswer, setRaffleAnswer] = useState('');
  const [raffleEmail, setRaffleEmail] = useState(user?.email || '');
  const [raffleSubmitting, setRaffleSubmitting] = useState(false);
  const [raffleSuccess, setRaffleSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      setEmail((prev) => prev || user.email || '');
      setRaffleEmail((prev) => prev || user.email || '');
    }
  }, [user]);

  // URL Deep-link support (?tag=6 or ?kategorie=gewinnspiel or ?popup=1)
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    const katParam = searchParams.get('kategorie') as AdventCategory | null;
    const popupParam = searchParams.get('popup');

    if (tagParam) {
      const dayNum = parseInt(tagParam, 10);
      const found = ADVENT_DAYS.find((d) => d.day === dayNum);
      if (found) {
        setActiveDay(found);
        markDayAsOpened(found.day);
      }
    }
    if (
      katParam &&
      ['meditation', 'gewinnspiel', 'altes_wissen', 'achtsamkeit'].includes(katParam)
    ) {
      setSelectedCategory(katParam);
    }
    if (popupParam === '1' || popupParam === 'true') {
      setIsPopupOpen(true);
    }
  }, [searchParams]);

  const markDayAsOpened = (dayNum: number) => {
    setOpenedDays((prev) => {
      if (prev.includes(dayNum)) return prev;
      const updated = [...prev, dayNum];
      try {
        localStorage.setItem('fds_advent_opened_days_2026', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  const handleOpenDay = (day: AdventDay) => {
    setActiveDay(day);
    setRaffleSuccess(null);
    setRaffleAnswer('');
    markDayAsOpened(day.day);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tag', String(day.day));
    setSearchParams(nextParams, { replace: true });
  };

  const handleCloseDay = () => {
    setActiveDay(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('tag');
    setSearchParams(nextParams, { replace: true });
  };

  const filteredDays = useMemo(() => {
    return ADVENT_DAYS.filter((item) => {
      if (selectedPart !== 'all' && item.part !== selectedPart) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedPart, selectedCategory]);

  const part1Days = useMemo(
    () => filteredDays.filter((d) => d.part === 1),
    [filteredDays]
  );
  const part2Days = useMemo(
    () => filteredDays.filter((d) => d.part === 2),
    [filteredDays]
  );

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setSubscribeStatus({
        type: 'error',
        text: 'Bitte gib eine gültige E-Mail-Adresse ein.'
      });
      return;
    }
    setSubmitting(true);
    setSubscribeStatus(null);
    try {
      const res = await subscribeToNewsletter({
        email: email.trim(),
        userId: user?.id,
        source: 'adventskalender_landing_2026'
      });
      if (res.success) {
        setSubscribeStatus({
          type: 'success',
          text:
            res.message ||
            'Wunderbar! Bitte bestätige kurz den Link in deiner E-Mail, um keinen Impuls und keine Verlosung zu verpassen.'
        });
      } else {
        setSubscribeStatus({
          type: 'error',
          text: res.message || 'Anmeldung konnte nicht abgeschlossen werden.'
        });
      }
    } catch {
      setSubscribeStatus({
        type: 'error',
        text: 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRaffleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raffleEmail.trim() || !raffleEmail.includes('@')) {
      return;
    }
    setRaffleSubmitting(true);
    try {
      await subscribeToNewsletter({
        email: raffleEmail.trim(),
        userId: user?.id,
        source: `adventskalender_gewinnspiel_tag_${activeDay?.day || 0}`
      });
      setRaffleSuccess(
        'Dein Impuls wurde gespeichert und du bist für die Verlosung des Rauhnacht-Hörbuchs eingetragen! Bitte bestätige falls nötig noch kurz deine E-Mail-Adresse.'
      );
    } catch {
      setRaffleSuccess(
        'Vielen Dank für deinen Impuls! Du nimmst an der Verlosung teil.'
      );
    } finally {
      setRaffleSubmitting(false);
    }
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    if (!activeDay) return;
    const targetNum = direction === 'prev' ? activeDay.day - 1 : activeDay.day + 1;
    const found = ADVENT_DAYS.find((d) => d.day === targetNum);
    if (found) {
      handleOpenDay(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-stone-800 pb-24">
      <SEO
        title="Der Adventskalender – 24 Tage Innehalten | Flow der Stille"
        description="Ein ganzheitlicher Begleiter durch den Dezember: 5 geführte Meditationen, 8× Altes Wissen zur Julzeit & Wintersonnenwende, 8× Achtsamkeit und 3× Rauhnacht-Hörbuch Gewinnspiele."
        canonical="https://flow-der-stille.de/adventskalender"
      />

      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#232B22] via-[#2F3A2B] to-[#1A2019] text-[#F5F5F0] pt-12 pb-16 md:py-24 px-4 sm:px-6 border-b border-[#C8A96E]/25">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#C8A96E]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-[24rem] h-[24rem] rounded-full bg-[#7C8B6F]/20 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C8A96E]/20 border border-[#C8A96E]/40 text-[#EBD3A2] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              FLOW DER STILLE • DEZEMBER-BEGLEITUNG
            </div>

            <button
              type="button"
              onClick={() => setIsPopupOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-stone-200 text-xs font-medium transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#EBD3A2]" />
              Pop-Up-Vorschau öffnen
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.12] tracking-tight">
                Der Adventskalender –{' '}
                <span className="text-[#EBD3A2] italic font-normal block sm:inline">
                  24 Tage Innehalten
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-200/95 leading-relaxed max-w-2xl">
                Ein ganzheitlicher Begleiter durch den Dezember: vom bewussten Ankommen im
                Stillstand der Natur über die Wintersonnenwende bis zur Schwelle der
                heiligen Rauhnächte.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#kalender-tuerchen"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#C8A96E] hover:bg-[#B89758] text-stone-950 font-bold text-sm transition-all shadow-lg"
                >
                  <Calendar className="w-4 h-4" />
                  Zu den 24 Türchen
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#advents-erinnerung"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-colors"
                >
                  <Gift className="w-4 h-4 text-[#EBD3A2]" />
                  Tägliche Begleitung &amp; Gewinnspiele (0&nbsp;€)
                </a>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-300">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A96E]" />
                  100&nbsp;% kostenfreie Advents-Impulse
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A96E]" />
                  3× Rauhnacht-Hörbuch Verlosung (06., 13. &amp; 21. Dez)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A96E]" />
                  Optimale Vorbereitung auf die 12 Rauhnächte
                </span>
              </div>
            </div>

            {/* Right Column: Highlight Box for the 3 Giveaways & Journey */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-[#C8A96E]/35 p-6 sm:p-7 shadow-2xl space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#EBD3A2] block mb-1">
                      Highlight an 3 Terminen
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                      3× Rauhnacht-Hörbuch gewinnen
                    </h2>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-[#C8A96E]/20 border border-[#C8A96E]/40 flex items-center justify-center text-xl shrink-0">
                    🎁
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  Zu Nikolaus, zur Halbzeit (Luciafest) und zur Wintersonnenwende verlosen
                  wir unser großes Begleit-Hörbuch{' '}
                  <strong className="text-white">
                    „Yggdrasils Atem – 12 Rauhnächte auf der Schwelle“
                  </strong>{' '}
                  rechtzeitig vor dem Start am 24./25. Dezember:
                </p>

                <div className="space-y-2.5">
                  {[
                    {
                      day: 6,
                      date: '06. Dez',
                      label: '1. Verlosung: Nikolaus-Gewinnspiel',
                      sub: 'Was möchtest du in diesem Jahr endgültig loslassen?'
                    },
                    {
                      day: 13,
                      date: '13. Dez',
                      label: '2. Verlosung: Halbzeit & Luciafest',
                      sub: 'Wie sieht dein perfekter Abend der Stille aus?'
                    },
                    {
                      day: 21,
                      date: '21. Dez',
                      label: '3. Verlosung: Wintersonnenwende-Finale',
                      sub: 'Welches neue Licht darf im kommenden Jahr wachsen?'
                    }
                  ].map((g) => {
                    const dayObj = ADVENT_DAYS.find((d) => d.day === g.day);
                    return (
                      <button
                        key={g.day}
                        type="button"
                        onClick={() => dayObj && handleOpenDay(dayObj)}
                        className="w-full text-left p-3 rounded-2xl bg-black/25 hover:bg-black/40 border border-white/10 hover:border-[#C8A96E]/50 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-[#C8A96E]/25 text-[#EBD3A2] text-[11px] font-bold">
                              {g.date}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#EBD3A2] transition-colors">
                              {g.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-300 mt-1 line-clamp-1">
                            {g.sub}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#EBD3A2] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-stone-300 border-t border-white/10">
                  <span>Bereits geöffnete Türchen:</span>
                  <span className="font-bold text-[#EBD3A2]">
                    {openedDays.length} von 24 entdeckt
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── DIE 4 SÄULEN (INTERAKTIVE FILTER-KARTEN) ──────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {ADVENT_PILLARS.map((pillar) => {
              const isSelected = selectedCategory === pillar.category;
              return (
                <button
                  key={pillar.title}
                  type="button"
                  onClick={() => {
                    setSelectedCategory((prev) =>
                      prev === pillar.category ? 'all' : pillar.category
                    );
                    const el = document.getElementById('kalender-tuerchen');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-left rounded-2xl p-5 transition-all border backdrop-blur-sm ${
                    isSelected
                      ? 'bg-[#C8A96E]/25 border-[#EBD3A2] ring-2 ring-[#EBD3A2]/40 shadow-lg'
                      : 'bg-white/10 hover:bg-white/15 border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#EBD3A2]">
                      {pillar.count}
                    </span>
                    <span className="text-2xl" aria-hidden="true">
                      {pillar.emoji}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                      {pillar.title}
                    </h3>
                    {isSelected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBD3A2] text-stone-950 font-bold">
                        Filter aktiv
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-200/90 leading-relaxed">
                    {pillar.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FILTER & ANSICHTS-LEISTE ─────────────────────────────────────── */}
      <section id="kalender-tuerchen" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-sm mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Phase Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-1">
                Zeitraum:
              </span>
              <button
                type="button"
                onClick={() => setSelectedPart('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedPart === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Alle 24 Tage
              </button>
              <button
                type="button"
                onClick={() => setSelectedPart(1)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedPart === 1
                    ? 'bg-[#7C8B6F] text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Teil 1: Tage 1–12 (Entschleunigung)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPart(2)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedPart === 2
                    ? 'bg-[#7C8B6F] text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Teil 2: Tage 13–24 (Sonnenwende &amp; Weihezeit)
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-200">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Ansicht:
              </span>
              <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  24 Türchen
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  Gesamtübersicht (Tabelle)
                </button>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-stone-100">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-1">
              Kategorie:
            </span>
            {[
              { id: 'all', label: 'Alle Kategorien (24)', emoji: '✨' },
              { id: 'meditation', label: 'Meditationen (5)', emoji: '🧘' },
              { id: 'gewinnspiel', label: 'Gewinnspiele (3)', emoji: '🎁' },
              { id: 'altes_wissen', label: 'Altes Wissen (8)', emoji: '📜' },
              { id: 'achtsamkeit', label: 'Achtsamkeit (8)', emoji: '🌿' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as 'all' | AdventCategory)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#2C3628] text-white shadow-sm'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── TEIL 1: TAGE 1 BIS 12 ──────────────────────────────────────── */}
        {part1Days.length > 0 && (
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#5C6B50] block mb-1">
                  1. bis 12. Dezember
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Teil 1: Tage 1 bis 12 – Verlangsamung &amp; Loslassen
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md">
                Klicke auf ein Türchen, um den vollständigen Tagesimpuls, die Übung oder
                das Gewinnspiel zu öffnen.
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {part1Days.map((item) => (
                  <AdventDoorCard
                    key={item.day}
                    item={item}
                    isOpened={openedDays.includes(item.day)}
                    onOpen={() => handleOpenDay(item)}
                  />
                ))}
              </div>
            ) : (
              <AdventOverviewTable days={part1Days} onSelectDay={handleOpenDay} />
            )}

            {/* Pädagogischer Leitfaden für Teil 1 */}
            <div className="mt-8 rounded-3xl bg-gradient-to-r from-[#7C8B6F]/15 via-[#7C8B6F]/10 to-stone-100 border border-[#7C8B6F]/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#7C8B6F] text-white flex items-center justify-center shrink-0 shadow-md">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  Pädagogischer Leitfaden für Teil 1 (Tage 1–12)
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed">
                  In den ersten zwölf Tagen liegt der Fokus auf der{' '}
                  <strong>Verlangsamung und dem Loslassen des Alltagsdrucks</strong>.
                  Meditationen und praktische Körperübungen helfen dir dabei, das
                  vegetative Nervensystem sanft herunterzufahren, Reizüberflutung abzubauen
                  und wieder in deinen eigenen körperlichen Rhythmus zurückzufinden.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TEIL 2: TAGE 13 BIS 24 ─────────────────────────────────────── */}
        {part2Days.length > 0 && (
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#8C6D32] block mb-1">
                  13. bis 24. Dezember
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Teil 2: Tage 13 bis 24 – Wendepunkt &amp; Weihezeit
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md">
                Vom Luciafest über die Wintersonnenwende am 21. Dezember bis zur Schwelle
                der heiligen Rauhnächte an Heiligabend.
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {part2Days.map((item) => (
                  <AdventDoorCard
                    key={item.day}
                    item={item}
                    isOpened={openedDays.includes(item.day)}
                    onOpen={() => handleOpenDay(item)}
                  />
                ))}
              </div>
            ) : (
              <AdventOverviewTable days={part2Days} onSelectDay={handleOpenDay} />
            )}

            {/* Energetischer Leitfaden für Teil 2 & Gewinnspiel-Tipp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="rounded-3xl bg-gradient-to-br from-stone-900 to-[#232B22] text-stone-100 p-6 sm:p-7 border border-stone-800 shadow-lg space-y-2.5">
                <div className="inline-flex items-center gap-2 text-[#EBD3A2] text-xs font-bold uppercase tracking-widest">
                  <Flame className="w-4 h-4" />
                  Energetischer Leitfaden (Tage 13–24)
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Von der tiefsten Nacht zur Geburt des Lichts
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Ab dem 18. Dezember weicht die lineare Zeit. Mit der{' '}
                  <strong className="text-white">Wintersonnenwende am 21. Dezember</strong>{' '}
                  kippt der Zyklus wieder in Richtung Licht. Am 24. Dezember bist du
                  innerlich und äußerlich optimal vorbereitet, um in die{' '}
                  <strong className="text-[#EBD3A2]">
                    zwölf heiligen Rauhnächte (25. Dez bis 06. Jan)
                  </strong>{' '}
                  überzutreten.
                </p>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-[#C8A96E]/20 via-[#C8A96E]/10 to-white p-6 sm:p-7 border border-[#C8A96E]/45 shadow-sm space-y-2.5">
                <div className="inline-flex items-center gap-2 text-[#7A5B1E] text-xs font-bold uppercase tracking-widest">
                  <Gift className="w-4 h-4" />
                  Die 3 Rauhnacht-Hörbuch Verlosungen
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Rechtzeitig vor den Rauhnächten freigeschaltet
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  Die drei Gewinnspiele am <strong>06., 13. und 21. Dezember</strong>{' '}
                  stellen sicher, dass alle Gewinnerinnen und Gewinner ihr{' '}
                  <strong>Rauhnacht-Hörbuch</strong> rechtzeitig vor dem 24./25. Dezember
                  in ihrer Mediathek (Web-Player &amp; App) freigeschaltet bekommen und
                  entspannt starten können.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── BRÜCKE ZUM RAUHNACHT-HÖRBUCH (AB 24./25. DEZEMBER) ──────────── */}
        <div className="rounded-3xl bg-gradient-to-br from-[#1F261E] via-[#2B3528] to-[#1A2018] text-white p-6 sm:p-10 md:p-12 border border-[#C8A96E]/35 shadow-xl mb-16 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#C8A96E]/15 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C8A96E]/20 border border-[#C8A96E]/40 text-[#EBD3A2] text-xs font-bold uppercase tracking-widest">
                <Moon className="w-3.5 h-3.5" />
                Die Fortsetzung ab 24. / 25. Dezember
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
                Yggdrasils Atem – 12 Rauhnächte auf der Schwelle
              </h2>

              <p className="text-sm sm:text-base text-stone-200/95 leading-relaxed max-w-2xl">
                Wenn sich am 24. Dezember das letzte Türchen schließt, öffnen sich die{' '}
                <strong className="text-[#EBD3A2]">
                  zwölf heiligen Nächte außerhalb der Zeit
                </strong>
                . Unser großes Begleit-Hörbuch führt dich Nacht für Nacht mit altem
                nordischem Wissen, Schwellen-Geschichten und geführten Innenreisen vom
                25. Dezember bis zum 6. Januar.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/hoerbuch/rauhnaechte"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#C8A96E] hover:bg-[#B89758] text-stone-950 font-bold text-sm transition-all shadow-md"
                >
                  <BookOpen className="w-4 h-4" />
                  Rauhnacht-Hörbuch entdecken &amp; reinhören
                </Link>

                <Link
                  to="/ruhe-shop#product-fds_rauhnaechte"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-colors whitespace-nowrap"
                >
                  🔑 Express-Kauf im Ruhe-Shop (9,99&nbsp;€ • Kein Abo)
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl bg-black/30 border border-white/15 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#EBD3A2]">
                    Rauhnacht-Begleitung
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C8A96E]/25 text-[#EBD3A2] text-xs font-bold whitespace-nowrap">
                    Einmalig 9,99&nbsp;€
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-stone-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C8A96E] shrink-0" />
                    12 ausführliche Kapitel für jede Rauhnacht
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C8A96E] shrink-0" />
                    Reines Streaming im Web-Player &amp; in der App
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C8A96E] shrink-0" />
                    Einmalkauf ohne Abo – dauerhaft in deiner Mediathek
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ─── TÄGLICHE BEGLEITUNG PER E-MAIL & KOSTENLOSES HÖRER-KONTO ─────── */}
        <div
          id="advents-erinnerung"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Left: Daily Reminder & Giveaway Registration */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C8B6F]/15 text-[#4A563E] text-xs font-bold uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" />
                Kostenfreie Advents-Begleitung
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Kein Türchen &amp; keine Verlosung verpassen
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Trage dich kostenfrei für unsere stille Advents-Begleitung ein. Wir
                erinnern dich an die Sonntags-Meditationen, die Impulse zur
                Wintersonnenwende und die 3 Rauhnacht-Hörbuch Gewinnspiele.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="mt-6 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Deine E-Mail-Adresse..."
                    required
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#5C6B50] hover:bg-[#4A563E] disabled:opacity-60 text-white font-bold text-sm transition-colors shrink-0 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Wird eingetragen...
                    </>
                  ) : (
                    <>
                      Kostenfrei eintragen
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {subscribeStatus && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 ${
                    subscribeStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{subscribeStatus.text}</span>
                </div>
              )}

              <p className="text-[11px] text-stone-500">
                100&nbsp;% kostenfrei • Kein Spam • Jederzeit mit 1 Klick abmeldbar.
              </p>
            </form>
          </div>

          {/* Right: 1-Click Free Listener Account */}
          <div className="lg:col-span-5 bg-[#EAEAE2] rounded-3xl border border-stone-300/80 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-stone-800 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5C6B50]" />
                Kostenloses Hörer-Konto (0&nbsp;€)
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Meditationen &amp; Selbsthypnosen direkt im Web-Player &amp; App hören
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Mit deinem kostenlosen Hörer-Konto kannst du unsere kostenfreien
                Atemübungen, Meditationen und Hörproben jederzeit im Web-Player oder in
                der App streamen.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-300/80 space-y-3">
              <p className="text-xs font-semibold text-stone-800">
                1-Klick-Registrierung: Über Google, Meta (Facebook) oder E-Mail –
                garantiert 0&nbsp;€ und kein Abo.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  to={user ? '/mediathek' : '/login'}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                >
                  {user ? 'Zur persönlichen Mediathek' : 'Kostenloses Hörer-Konto (0 €)'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/meditation"
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#5C6B50]" />
                  Zu den Meditationen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DETAIL-MODAL FÜR EIN GEÖFFNETES TÜRCHEN ─────────────────────── */}
      {activeDay && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-stone-950/75 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="advent-day-modal-title"
          onClick={handleCloseDay}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-[#F5F5F0] border border-stone-300 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header */}
            <div className="bg-gradient-to-br from-[#232B22] via-[#2F3A2B] to-[#1D241B] text-white p-6 sm:p-8 relative">
              <button
                type="button"
                onClick={handleCloseDay}
                aria-label="Türchen schließen"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-[#C8A96E] text-stone-950 text-xs font-bold uppercase tracking-wider">
                  Türchen {activeDay.day} • {activeDay.dateLabel}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 text-stone-100 text-xs font-semibold">
                  {activeDay.emoji} {activeDay.categoryLabel}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/25 text-stone-300 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activeDay.durationOrInfo}
                </span>
              </div>

              <h2
                id="advent-day-modal-title"
                className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug"
              >
                {activeDay.title}
              </h2>

              <p className="text-sm text-[#EBD3A2] mt-2 font-medium">
                {activeDay.coreImpulse}
              </p>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Deep Text */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Tagesimpuls &amp; Hintergrund
                </h3>
                <p className="text-sm sm:text-base text-stone-800 leading-relaxed">
                  {activeDay.deepText}
                </p>
              </div>

              {/* Practice / Exercise / Question Box */}
              <div className="rounded-2xl bg-white border border-stone-200/90 p-5 sm:p-6 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2 text-[#4A563E] text-xs font-bold uppercase tracking-wider">
                  <Heart className="w-4 h-4" />
                  {activeDay.practiceTitle}
                </div>
                <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-medium">
                  {activeDay.practiceOrQuestion}
                </p>
              </div>

              {/* Category-Specific Action Area */}
              {activeDay.category === 'gewinnspiel' && (
                <div className="rounded-2xl bg-gradient-to-br from-[#C8A96E]/25 via-[#C8A96E]/10 to-white border border-[#C8A96E]/50 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#6E531D] text-xs font-bold uppercase tracking-wider">
                    <Gift className="w-4 h-4" />
                    Direkt an der Rauhnacht-Hörbuch Verlosung teilnehmen
                  </div>

                  {raffleSuccess ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-700 mt-0.5" />
                      <span>{raffleSuccess}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleRaffleSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Deine persönliche Antwort / Dein Impuls zur heutigen Frage:
                        </label>
                        <textarea
                          rows={2}
                          value={raffleAnswer}
                          onChange={(e) => setRaffleAnswer(e.target.value)}
                          placeholder="Teile hier kurz deinen Gedanken..."
                          required
                          className="w-full p-3 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="email"
                          value={raffleEmail}
                          onChange={(e) => setRaffleEmail(e.target.value)}
                          placeholder="Deine E-Mail für die Gewinnbenachrichtigung..."
                          required
                          className="flex-1 px-3.5 py-3 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7C8B6F]"
                        />
                        <button
                          type="submit"
                          disabled={raffleSubmitting}
                          className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-colors shrink-0"
                        >
                          {raffleSubmitting ? 'Wird gesendet...' : '🎁 Jetzt im Lostopf sichern'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeDay.category === 'meditation' && (
                <div className="rounded-2xl bg-[#7C8B6F]/15 border border-[#7C8B6F]/35 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      Passende Audio-Begleitung im Web-Player &amp; App
                    </h4>
                    <p className="text-xs text-stone-700 mt-0.5">
                      Entdecke unsere geführten Meditationen und Selbsthypnosen zur tiefen
                      Entspannung.
                    </p>
                  </div>
                  <Link
                    to="/meditation"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5C6B50] hover:bg-[#4A563E] text-white text-xs font-bold transition-colors shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Zu den Meditationen
                  </Link>
                </div>
              )}

              {/* Footer Navigation inside Modal */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="button"
                  disabled={activeDay.day <= 1}
                  onClick={() => navigateDay('prev')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 disabled:opacity-40 border border-stone-200 text-xs font-bold text-stone-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Tag {activeDay.day - 1}
                </button>

                <span className="text-xs text-stone-500 font-medium">
                  Tag {activeDay.day} von 24
                </span>

                <button
                  type="button"
                  disabled={activeDay.day >= 24}
                  onClick={() => navigateDay('next')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 disabled:opacity-40 border border-stone-200 text-xs font-bold text-stone-700 transition-colors"
                >
                  Tag {activeDay.day + 1}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── POP-UP MODAL PREVIEW ─────────────────────────────────────────── */}
      <AdventskalenderPopupModal
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};

// ─── SUB-COMPONENT: DOOR CARD ───────────────────────────────────────────────
interface AdventDoorCardProps {
  item: AdventDay;
  isOpened: boolean;
  onOpen: () => void;
}

const AdventDoorCard: React.FC<AdventDoorCardProps> = ({ item, isOpened, onOpen }) => {
  const style = CATEGORY_STYLES[item.category];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative text-left rounded-3xl bg-white p-5 sm:p-6 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between overflow-hidden ${style.cardBorder}`}
    >
      {/* Top Gradient Accent */}
      <div
        className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${style.cardAccent} pointer-events-none`}
      />

      <div className="relative z-10">
        {/* Top Row: Day Number + Category Badge */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-serif font-bold shadow-sm ${style.iconBg}`}
            >
              <span className="text-base leading-none">{item.day}</span>
              <span className="text-[9px] uppercase tracking-wider opacity-90">Dez</span>
            </div>
            <div>
              <span className="text-xs font-bold text-stone-500 block">
                {item.dateLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border mt-0.5 ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
              >
                <span>{item.emoji}</span>
                <span>{item.categoryLabel}</span>
              </span>
            </div>
          </div>

          {isOpened && (
            <span
              title="Bereits geöffnet"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold"
            >
              <CheckCircle2 className="w-3 h-3 text-[#5C6B50]" />
              Offen
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 group-hover:text-[#4A563E] transition-colors mb-2 leading-snug">
          {item.title}
        </h3>

        {/* Core Impulse */}
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
          {item.coreImpulse}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-800">
        <span className="text-[11px] text-stone-500 font-medium">
          {item.durationOrInfo}
        </span>
        <span className="inline-flex items-center gap-1 text-[#4A563E] group-hover:translate-x-0.5 transition-transform">
          Türchen öffnen
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
};

// ─── SUB-COMPONENT: OVERVIEW TABLE (LIKE PDF) ───────────────────────────────
interface AdventOverviewTableProps {
  days: AdventDay[];
  onSelectDay: (day: AdventDay) => void;
}

const AdventOverviewTable: React.FC<AdventOverviewTableProps> = ({
  days,
  onSelectDay
}) => {
  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#5C6B50] text-white text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4 font-bold w-24">Tag</th>
              <th className="py-3.5 px-4 font-bold w-44">Kategorie</th>
              <th className="py-3.5 px-4 font-bold w-64">Titel des Türchens</th>
              <th className="py-3.5 px-4 font-bold">Inhalt &amp; Kernimpuls</th>
              <th className="py-3.5 px-4 font-bold w-28 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 text-sm">
            {days.map((item) => {
              const style = CATEGORY_STYLES[item.category];
              return (
                <tr
                  key={item.day}
                  onClick={() => onSelectDay(item)}
                  className={`cursor-pointer transition-colors ${
                    item.category === 'gewinnspiel'
                      ? 'bg-[#C8A96E]/10 hover:bg-[#C8A96E]/20'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                    {item.dateLabel}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.categoryLabel}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-stone-900">
                    {item.title}
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 text-xs sm:text-sm leading-relaxed">
                    {item.coreImpulse}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDay(item);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#5C6B50] text-stone-800 hover:text-white text-xs font-bold transition-colors"
                    >
                      Öffnen
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdventskalenderPage;

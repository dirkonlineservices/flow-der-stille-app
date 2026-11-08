import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Gift, Calendar, BookOpen, Heart,
  CheckCircle2, ArrowRight, Loader2, X, Lock, Unlock,
  Moon, Volume2, Clock, ChevronLeft, ChevronRight,
  Eye, ShieldCheck, ChevronDown, ChevronUp, Copy, Check,
  Share2, MessageCircle, Mail, HelpCircle
} from 'lucide-react';
import SEO from '../components/SEO';
import {
  ADVENT_DAYS,
  ADVENT_PILLARS,
  AdventCategory,
  AdventDay
} from '../data/adventskalender';
import { AdventskalenderPopupModal } from '../components/AdventskalenderPromo';
import { AdventEmailReminder } from '../components/AdventEmailReminder';
import { subscribeToNewsletter } from '../lib/newsletterService';
import { useAuth } from '../context/AuthContext';
import { checkUserIsAdmin, isKnownAdminEmail } from '../lib/adminSecurity';

/**
 * Zeit-Berechnung für den Adventskalender
 * Im Dezember (Monat 11, 0-basiert): Türchen <= aktuellem Tag sind offen.
 * Vor Dezember (Monat < 11): Alle Türchen noch zukünftig (Sperre greift für reguläre Nutzer).
 * Nach Dezember (Monat > 11 oder Folgejahr): Alle Türchen sind geöffnet.
 */
function isDayUnlockedByDate(dayNum: number): boolean {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dez
  const currentDay = now.getDate();

  if (currentMonth === 11) {
    return currentDay >= dayNum;
  }
  if (currentMonth > 11) {
    return true;
  }
  return false;
}

export const AdventskalenderPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Admin Status
  const [isAdminUser, setIsAdminUser] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('flow_admin_preview') === 'true') {
      return true;
    }
    return isKnownAdminEmail(user?.email);
  });
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);

  // Admin-Bypass für Zeittest (Damit Admins jedes Türchen schon vorab testen können)
  const [adminTimeBypass, setAdminTimeBypass] = useState<boolean>(true);

  // Aktives geöffnetes Türchen
  const [activeDay, setActiveDay] = useState<AdventDay | null>(null);

  // Zeit-Sperren-Hinweis (wenn zukünftiges Türchen angeklickt wird)
  const [lockedNoticeDay, setLockedNoticeDay] = useState<AdventDay | null>(null);

  // Pop-Up Vorschau State
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Bereits vom Nutzer geöffnete Türchen (LocalStorage)
  const [openedDays, setOpenedDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('fds_advent_opened_days_2026');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Besucher-Status speichern: Künftiges automatisches Aufpoppen des Advents-Pop-ups dauerhaft unterdrücken
  useEffect(() => {
    try {
      localStorage.setItem('hasVisitedAdventskalender', 'true');
      localStorage.setItem('fds_advent_visited', 'true');
    } catch {}
  }, []);

  // Gewinnspiel Formular im Modal
  const [raffleAnswer, setRaffleAnswer] = useState('');
  const [raffleEmail, setRaffleEmail] = useState(user?.email || '');
  const [raffleSubmitting, setRaffleSubmitting] = useState(false);
  const [raffleSuccess, setRaffleSuccess] = useState<string | null>(null);

  // FAQ Akkordeon State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Link kopiert State
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://flow-der-stille.de/adventskalender');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    let active = true;
    if (!user) {
      const localPreview =
        typeof window !== 'undefined' && localStorage.getItem('flow_admin_preview') === 'true';
      setIsAdminUser(localPreview);
      setCheckingAdmin(false);
      return;
    }
    if (isKnownAdminEmail(user.email)) {
      setIsAdminUser(true);
      setCheckingAdmin(false);
      return;
    }
    checkUserIsAdmin(user.id, user.email)
      .then((res) => {
        if (active) {
          setIsAdminUser(res);
          setCheckingAdmin(false);
        }
      })
      .catch(() => {
        if (active) setCheckingAdmin(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      setRaffleEmail((prev) => prev || user.email || '');
    }
  }, [user]);

  // URL Deep-Link (?tag=6 oder ?popup=1)
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    const popupParam = searchParams.get('popup');

    if (tagParam) {
      const dayNum = parseInt(tagParam, 10);
      const found = ADVENT_DAYS.find((d) => d.day === dayNum);
      if (found) {
        const canOpen = (isAdminUser && adminTimeBypass) || isDayUnlockedByDate(found.day);
        if (canOpen) {
          setActiveDay(found);
          markDayAsOpened(found.day);
        } else {
          setLockedNoticeDay(found);
        }
      }
    }
    if (popupParam === '1' || popupParam === 'true') {
      setIsPopupOpen(true);
    }
  }, [searchParams, isAdminUser, adminTimeBypass]);

  const markDayAsOpened = (dayNum: number) => {
    setOpenedDays((prev) => {
      if (prev.includes(dayNum)) return prev;
      const updated = [...prev, dayNum];
      try {
        localStorage.setItem('fds_advent_opened_days_2026', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDoorClick = (day: AdventDay) => {
    const isUnlocked = (isAdminUser && adminTimeBypass) || isDayUnlockedByDate(day.day);

    if (!isUnlocked) {
      setLockedNoticeDay(day);
      return;
    }

    setActiveDay(day);
    setLockedNoticeDay(null);
    setRaffleSuccess(null);
    setRaffleAnswer('');
    markDayAsOpened(day.day);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tag', String(day.day));
    setSearchParams(nextParams, { replace: true });
  };

  const handleCloseModal = () => {
    setActiveDay(null);
    setLockedNoticeDay(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('tag');
    setSearchParams(nextParams, { replace: true });
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
      setRaffleSuccess('Vielen Dank für deinen Impuls! Du nimmst an der Verlosung teil.');
    } finally {
      setRaffleSubmitting(false);
    }
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    if (!activeDay) return;
    const targetNum = direction === 'prev' ? activeDay.day - 1 : activeDay.day + 1;
    const found = ADVENT_DAYS.find((d) => d.day === targetNum);
    if (found) {
      handleDoorClick(found);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8 text-[#695C4D]">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-[#8A9A8A]" />
        <span>Prüfe Berechtigung...</span>
      </div>
    );
  }

  // Schutz vorab: Jetzt für alle User öffentlich scharf geschaltet!
  // Die zeitbasierte Sperre stellt sicher, dass sich Türchen erst am jeweiligen Tag öffnen.

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#3D3B35] pb-4 md:pb-6">
      <SEO
        title="Adventskalender der Stille | 24 Tage Innehalten | Flow der Stille"
        description="24 Tage Innehalten durch den Dezember. 100 % kostenfrei: 5 geführte Meditationen, 8× Altes Wissen zur Julzeit, 8× Achtsamkeit und 3× Rauhnacht-Hörbuch Verlosungen."
        canonical="https://flow-der-stille.de/adventskalender"
      />

      {/* Admin-Hinweis-Banner nur für Admins (mit Zeittest-Schalter) */}
      {isAdminUser && (
        <div className="bg-[#8A9A8A]/25 text-[#3D3B35] border-b border-[#8A9A8A]/40 px-4 py-2.5 text-xs font-semibold flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#344034]">🔒 ADMIN-TESTLEISTE:</span>
            <span className="font-normal text-[#514639]">
              Die Seite ist für alle User freigeschaltet (mit Tages-Sperre).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#4A563E]">
              {adminTimeBypass ? '🔓 Alle 24 Türchen freigeschaltet (Testmodus)' : '⏱️ Echte Zeit-Sperre aktiv'}
            </span>
            <button
              type="button"
              onClick={() => setAdminTimeBypass(!adminTimeBypass)}
              className="px-2.5 py-1 rounded-lg bg-[#8A9A8A] hover:bg-[#728372] text-white text-[11px] font-bold transition-colors cursor-pointer"
            >
              {adminTimeBypass ? 'Zeit-Sperre aktivieren' : 'Alle Türchen testen'}
            </button>
          </div>
        </div>
      )}

      {/* ─── HERO BEREICH: HELL & RUHIG IN SALBEIGRÜN / BEIGE ──────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#8A9A8A]/20 via-[#F5F5F0] to-[#F5F5F0] pt-12 pb-14 md:py-20 px-4 sm:px-6 border-b border-[#E3E1D9]">
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#8A9A8A]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-[24rem] h-[24rem] rounded-full bg-[#C8A96E]/15 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8A9A8A]/20 border border-[#8A9A8A]/40 text-[#4A563E] text-xs font-bold uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              Kostenfrei | Dein Geschenk im Advent
            </div>

            <button
              type="button"
              onClick={() => setIsPopupOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-[#E3E1D9] text-[#695C4D] text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#8A9A8A]" />
              Pop-Up-Vorschau öffnen
            </button>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#3D3B35] leading-tight tracking-tight max-w-4xl mx-auto">
            Adventskalender der Stille
            <span className="text-[#8A9A8A] italic font-normal block text-2xl sm:text-3xl lg:text-4xl mt-2">
              24 Tage Innehalten
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#695C4D] leading-relaxed max-w-2xl mx-auto">
            Ein stiller Begleiter durch den Dezember. Hinter jedem Türchen wartet ein achtsamer Impuls,
            eine wohltuende Meditation oder die Chance auf unser neues Rauhnacht-Hörbuch.
            Vollständig kostenfrei und in deinem eigenen Rhythmus.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#695C4D]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#8A9A8A]" />
              100&nbsp;% kostenfreie Advents-Impulse
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#8A9A8A]" />
              Täglich ein neuer Impuls zur Entschleunigung
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#8A9A8A]" />
              3× Rauhnacht-Hörbuch-Verlosung
            </span>
          </div>
        </div>
      </section>

      {/* ─── HAUPTBEREICH: 24-TÜRCHEN-RASTER (SALBEIGRÜN & WARMES BEIGE) ───── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4 sm:pb-6">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8A9A8A] block mb-1">
              24 Tage Innehalten
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D3B35]">
              Wähle dein heutiges Türchen
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#695C4D] bg-white px-4 py-2 rounded-2xl border border-[#E3E1D9] shadow-2xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8A9A8A]" />
              Geöffnet: <strong className="text-[#3D3B35]">{openedDays.length}</strong> / 24
            </span>
          </div>
        </div>

        {/* 24-TÜRCHEN-GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
          {ADVENT_DAYS.map((dayItem) => {
            const isUnlocked =
              (isAdminUser && adminTimeBypass) || isDayUnlockedByDate(dayItem.day);
            const isOpened = openedDays.includes(dayItem.day);
            const isSpecialRaffle = [6, 13, 21].includes(dayItem.day);

            return (
              <button
                key={dayItem.day}
                type="button"
                onClick={() => handleDoorClick(dayItem)}
                className={`group relative aspect-square rounded-3xl p-4 transition-all duration-300 flex flex-col items-center justify-between overflow-hidden shadow-xs hover:shadow-md cursor-pointer border ${
                  isOpened
                    ? 'bg-gradient-to-br from-[#EAEAE2] to-[#DFDFD5] border-[#8A9A8A]/50 text-[#3D3B35]'
                    : isUnlocked
                    ? 'bg-gradient-to-br from-[#8A9A8A] via-[#7B8B7B] to-[#6E7F6E] border-[#728372] text-white hover:-translate-y-1 hover:shadow-lg'
                    : 'bg-white border-[#E3E1D9] text-[#A89F91] hover:border-[#8A9A8A]/60'
                }`}
              >
                {/* Dezent goldener Schimmer für die 3 Verlosungstage */}
                {isSpecialRaffle && !isOpened && (
                  <div className="absolute inset-0 bg-[#C8A96E]/20 pointer-events-none" />
                )}

                {/* Obere Reihe: Status-Icon / Schloss */}
                <div className="w-full flex items-center justify-between text-[11px]">
                  <span
                    className={`font-sans font-medium ${
                      isUnlocked && !isOpened ? 'text-white/80' : 'text-[#695C4D]'
                    }`}
                  >
                    Dez
                  </span>

                  {isOpened ? (
                    <span
                      title="Bereits geöffnet"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4A563E]"
                    >
                      <CheckCircle2 size={13} className="text-[#8A9A8A]" />
                    </span>
                  ) : isUnlocked ? (
                    <span title="Bereit zum Öffnen" className="text-white/90">
                      <Unlock size={14} />
                    </span>
                  ) : (
                    <span title="Noch verschlossen" className="text-[#A89F91]">
                      <Lock size={13} />
                    </span>
                  )}
                </div>

                {/* Große zentrierte Türchen-Nummer (keine inhaltliche Vorschau!) */}
                <div className="my-auto flex flex-col items-center justify-center">
                  <span
                    className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight transition-transform duration-300 group-hover:scale-110 ${
                      isOpened
                        ? 'text-[#4A563E]'
                        : isUnlocked
                        ? 'text-white'
                        : 'text-[#8A9A8A]'
                    }`}
                  >
                    {dayItem.day}
                  </span>
                </div>

                {/* Untere Reihe: Neutrales Türchen-Label */}
                <div className="w-full text-center">
                  {isOpened ? (
                    <span className="text-[10px] font-semibold text-[#695C4D] truncate block">
                      {dayItem.emoji} Geöffnet
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-[10px] font-bold text-white tracking-wider uppercase opacity-95 group-hover:opacity-100 block">
                      Öffnen →
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#695C4D] block">
                      {dayItem.dateLabel}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── E-MAIL-ERINNERUNG FÜR TÄGLICHE BENACHRICHTIGUNGEN ─────────────── */}
        <div className="mt-8 sm:mt-10">
          <AdventEmailReminder />
        </div>

        {/* ─── DIE 4 SÄULEN (HINTERGRUND-ÜBERSICHT) ──────────────────────────── */}
        <div className="mt-8 sm:mt-10 bg-white rounded-2xl sm:rounded-3xl border border-[#E3E1D9] p-5 sm:p-6 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8A9A8A] block mb-1">
              Ganzheitliches Konzept
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D3B35]">
              Die 4 Säulen des Flow der Stille Adventskalenders
            </h3>
            <p className="text-xs sm:text-sm text-[#695C4D] mt-2 leading-relaxed">
              Jedes Türchen gehört zu einer unserer vier thematischen Säulen, die dich
              Schritt für Schritt durch den Winter begleiten:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADVENT_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="p-4 sm:p-5 rounded-2xl bg-[#F5F5F0] border border-[#E3E1D9] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{pillar.emoji}</span>
                    <span className="font-serif text-2xl font-bold text-[#8A9A8A]">
                      {pillar.count}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D3B35] mb-1">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-[#695C4D] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── BRÜCKE ZU DEN RAUHNÄCHTEN (AB 24./25. DEZEMBER) ──────────────── */}
        <div className="mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#8A9A8A]/25 via-[#F5F5F0] to-[#8A9A8A]/20 text-[#3D3B35] p-5 sm:p-6 md:p-8 border border-[#8A9A8A]/40 shadow-xs relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#8A9A8A]/20 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8A9A8A]/20 border border-[#8A9A8A]/40 text-[#4A563E] text-xs font-bold uppercase tracking-widest">
                <Moon className="w-3.5 h-3.5" />
                Die Fortsetzung ab 24. / 25. Dezember
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3D3B35] leading-tight">
                Yggdrasils Atem | 12 Rauhnächte auf der Schwelle
              </h3>

              <p className="text-sm sm:text-base text-[#695C4D] leading-relaxed max-w-2xl">
                Wenn am 24. Dezember das letzte Türchen öffnet, beginnen die{' '}
                <strong className="text-[#3D3B35]">
                  zwölf heiligen Nächte außerhalb der Zeit
                </strong>
                . Unser großes Begleit-Hörbuch führt dich Nacht für Nacht mit altem
                Wissen, Geschichten und geführten Innenreisen bis zum 6. Januar.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/hoerbuch/rauhnaechte"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#8A9A8A] hover:bg-[#728372] text-white font-bold text-sm transition-all shadow-md cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Rauhnacht-Hörbuch entdecken
                </Link>

                <Link
                  to="/ruhe-shop#product-fds_rauhnaechte"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-stone-50 border border-[#E3E1D9] text-[#3D3B35] font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                >
                  🔑 Express-Kauf im Ruhe-Shop (9,99&nbsp;€ • Kein Abo)
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl bg-white border border-[#E3E1D9] p-4 sm:p-5 space-y-2 text-xs text-[#695C4D] shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#3D3B35]">Rauhnacht-Begleitung</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#8A9A8A]/20 text-[#4A563E] font-bold">
                    Einmalig 9,99&nbsp;€
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8A9A8A] shrink-0" />
                  12 ausführliche Kapitel für jede Nacht
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8A9A8A] shrink-0" />
                  Reines Streaming im Web-Player und in der App
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8A9A8A] shrink-0" />
                  Einmalkauf ohne Abo | Dauerhaft aktiv
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── C. FAQ-AKKORDEON (HÄUFIGE FRAGEN) ─────────────────────────────── */}
        <div className="mt-8 sm:mt-10 bg-white rounded-2xl sm:rounded-3xl border border-[#E3E1D9] p-5 sm:p-7 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8A9A8A] block mb-1">
              Häufige Fragen
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D3B35]">
              Alles Wissenswerte zum Adventskalender
            </h3>
            <p className="text-xs sm:text-sm text-[#695C4D] mt-2 leading-relaxed">
              Hier findest du Antworten auf alle wichtigen Fragen rund um die 24 Tage Innehalten.
            </p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-[#E3E1D9]">
            {[
              {
                question: 'Wann öffnen sich die täglichen Türchen?',
                answer:
                  'Jedes Türchen öffnet sich automatisch um Mitternacht (00:00 Uhr) des jeweiligen Tages im Dezember. Vorab bleiben die Inhalte geschützt und verborgen, damit jeder Tag ein kleiner geschützter Moment der Überraschung für dich bleibt.'
              },
              {
                question: 'Ist der Adventskalender wirklich komplett kostenfrei?',
                answer:
                  'Ja, der gesamte Adventskalender ist zu 100 % kostenfrei. Es gibt kein verstecktes Abonnement und keine Kaufverpflichtung. Du kannst alle 24 Türchen, Meditationen und Übungen uneingeschränkt nutzen.'
              },
              {
                question: 'Kann ich bereits vergangene Türchen nachholen?',
                answer:
                  'Selbstverständlich. Einmal geöffnete Türchen bleiben für dich durchgehend bis zum 6. Januar erreichbar. Wenn du an einem Tag keine Zeit findest, kannst du den Impuls ganz in deinem eigenen Rhythmus nachholen.'
              },
              {
                question: 'Wie funktioniert die tägliche E-Mail-Erinnerung?',
                answer:
                  'Wenn du dich mit deiner E-Mail-Adresse für die tägliche Erinnerung anmeldest, schicken wir dir jeden Morgen im Advent eine kurze, ruhige Nachricht mit dem direkten Link zum neuen Türchen. Du kannst dich jederzeit mit einem einzigen Klick wieder abmelden.'
              },
              {
                question: 'Wie laufen die drei Hörbuch-Verlosungen ab?',
                answer:
                  'An drei besonderen Tagen (6. Dezember zum Nikolaus, 13. Dezember zum Luciafest und 21. Dezember zur Wintersonnenwende) verlosen wir Exemplare unseres neuen Hörbuchs „Yggdrasils Atem | 12 Rauhnächte auf der Schwelle“. Am 6. und 13. Dezember ist die Teilnahme ganztägig bis 23:59 Uhr möglich, die Auslosung erfolgt am Folgetag. Am 21. Dezember (Wintersonnenwende) endet die Teilnahme pünktlich um 18:00 Uhr, Auslosung und Freischaltung erfolgen direkt ab 18:00 Uhr. Gewinnerinnen und Gewinner erhalten eine automatische Benachrichtigung per E-Mail und das Hörbuch wird direkt in ihrem persönlichen Flow der Stille Bereich freigeschaltet.'
              }
            ].map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-4 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 font-medium text-sm sm:text-base text-[#3D3B35] hover:text-[#4A563E] transition-colors cursor-pointer py-1"
                  >
                    <span className="font-semibold">{faq.question}</span>
                    <span className="p-1 rounded-lg bg-[#F5F5F0] text-[#695C4D] shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-2.5 pr-6 text-xs sm:text-sm text-[#695C4D] leading-relaxed animate-fadeIn">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── D. TEILEN-FUNKTION (FREUDE TEILEN) ────────────────────────────── */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-br from-white via-[#F5F5F0] to-white rounded-2xl sm:rounded-3xl border border-[#E3E1D9] p-5 sm:p-7 text-center shadow-xs">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8A9A8A]/20 text-[#4A563E] text-xs font-bold uppercase tracking-widest">
              <Share2 className="w-3.5 h-3.5" />
              Freude teilen
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D3B35]">
              Schenke einem lieben Menschen eine kleine Auszeit
            </h3>

            <p className="text-xs sm:text-sm text-[#695C4D] leading-relaxed">
              Wenn dir die täglichen Impulse guttun, lade gerne Familie oder Freunde ein,
              gemeinsam mit dir durch den Dezember innezuhalten.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-[#E3E1D9] text-xs sm:text-sm font-semibold text-[#3D3B35] transition-colors cursor-pointer shadow-2xs"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-[#8A9A8A]" />
                    <span className="text-[#4A563E]">Link kopiert!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#8A9A8A]" />
                    <span>Link kopieren</span>
                  </>
                )}
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  'Einladung zu 24 Tagen Innehalten im Advent. Ein kostenfreier Begleiter mit ruhigen Impulsen, Meditationen und der Verlosung des Rauhnacht-Hörbuchs: https://flow-der-stille.de/adventskalender'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-xs sm:text-sm font-semibold text-[#1B6F3E] transition-colors cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                Per WhatsApp teilen
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent(
                  'Adventskalender der Stille | 24 Tage Innehalten'
                )}&body=${encodeURIComponent(
                  'Hallo,\n\nich habe diesen ruhigen Adventskalender von Flow der Stille entdeckt und dachte, er tut dir vielleicht auch gut.\n\nVom 1. bis zum 24. Dezember öffnet sich täglich ein kostenfreies Türchen mit sanften Impulsen, Meditationen und altem Wissen zur Winterzeit:\nhttps://flow-der-stille.de/adventskalender\n\nHerzliche Grüße'
                )}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-[#E3E1D9] text-xs sm:text-sm font-semibold text-[#3D3B35] transition-colors cursor-pointer shadow-2xs"
              >
                <Mail className="w-4 h-4 text-[#8A9A8A]" />
                Per E-Mail weiterleiten
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODAL 1: GEÖFFNETES TÜRCHEN (SALBEIGRÜNER HEADER) ─────────────── */}
      {activeDay && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-[#F5F5F0] border border-[#8A9A8A]/40 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header im warmen Salbeigrün */}
            <div className="bg-gradient-to-br from-[#8A9A8A] via-[#7B8B7B] to-[#6E7F6E] text-white p-6 sm:p-8 relative">
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Türchen schließen"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-white text-[#4A563E] text-xs font-bold uppercase tracking-wider shadow-2xs">
                  Türchen {activeDay.day} • {activeDay.dateLabel}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                  {activeDay.emoji} {activeDay.categoryLabel}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/20 text-white/90 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activeDay.durationOrInfo}
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
                {activeDay.title}
              </h2>

              <p className="text-sm text-stone-100 mt-2 font-medium">
                {activeDay.coreImpulse}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#3D3B35]">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#695C4D]">
                  Tagesimpuls und Hintergrund
                </h3>
                <p className="text-sm sm:text-base text-[#3D3B35] leading-relaxed">
                  {activeDay.deepText}
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-[#E3E1D9] p-5 sm:p-6 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-[#4A563E] text-xs font-bold uppercase tracking-wider">
                  <Heart className="w-4 h-4 text-[#8A9A8A]" />
                  {activeDay.practiceTitle}
                </div>
                <p className="text-sm sm:text-base text-[#3D3B35] leading-relaxed font-medium">
                  {activeDay.practiceOrQuestion}
                </p>
              </div>

              {/* Gewinnspiel-Interaktion & Fristen */}
              {activeDay.category === 'gewinnspiel' && (
                <div className="rounded-2xl bg-gradient-to-br from-[#C8A96E]/20 via-[#C8A96E]/10 to-white border border-[#C8A96E]/40 p-5 sm:p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-[#6E531D] text-xs font-bold uppercase tracking-wider">
                      <Gift className="w-4 h-4" />
                      Rauhnacht-Hörbuch Verlosung
                    </div>
                    <p className="text-xs text-[#8B6E32] font-semibold mt-1">
                      {activeDay.day === 21
                        ? 'Großes Sonnenwende-Finale: Teilnahme ganztägig bis 18:00 Uhr möglich. Auslosung und Gewinnausgabe erfolgen direkt ab 18:00 Uhr.'
                        : `Teilnahme ganztägig bis 23:59 Uhr möglich. Die Auslosung findet am ${activeDay.day === 6 ? '7. Dezember' : '14. Dezember'} statt.`}
                    </p>
                    <p className="text-[11px] text-[#695C4D] mt-1 leading-relaxed">
                      Gewinnerinnen und Gewinner erhalten eine automatische Benachrichtigung per E-Mail und das Hörbuch wird direkt in ihrem persönlichen Bereich freigeschaltet.
                    </p>
                  </div>

                  {raffleSuccess ? (
                    <div className="p-4 rounded-xl bg-white border border-[#8A9A8A] text-[#3D3B35] text-xs sm:text-sm font-medium flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-[#8A9A8A] mt-0.5" />
                      <span>{raffleSuccess}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleRaffleSubmit} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#3D3B35] mb-1">
                          Deine Antwort / Dein Impuls zur heutigen Frage:
                        </label>
                        <textarea
                          rows={2}
                          value={raffleAnswer}
                          onChange={(e) => setRaffleAnswer(e.target.value)}
                          placeholder="Teile hier kurz deinen Gedanken..."
                          required
                          className="w-full p-3 rounded-xl bg-white border border-[#E3E1D9] text-sm text-[#3D3B35] focus:outline-none focus:ring-2 focus:ring-[#8A9A8A]"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="email"
                          value={raffleEmail}
                          onChange={(e) => setRaffleEmail(e.target.value)}
                          placeholder="Deine E-Mail für die Gewinnbenachrichtigung..."
                          required
                          className="flex-1 px-3.5 py-3 rounded-xl bg-white border border-[#E3E1D9] text-sm text-[#3D3B35] focus:outline-none focus:ring-2 focus:ring-[#8A9A8A]"
                        />
                        <button
                          type="submit"
                          disabled={raffleSubmitting}
                          className="px-5 py-3 rounded-xl bg-[#8A9A8A] hover:bg-[#728372] text-white font-bold text-xs sm:text-sm transition-colors shrink-0 cursor-pointer shadow-xs"
                        >
                          {raffleSubmitting ? 'Wird gesendet...' : '🎁 Jetzt im Lostopf sichern'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Meditation Audio-CTA */}
              {activeDay.category === 'meditation' && (
                <div className="rounded-2xl bg-[#8A9A8A]/15 border border-[#8A9A8A]/35 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#3D3B35]">
                      Passende Audio-Begleitung im Web-Player und in der App
                    </h4>
                    <p className="text-xs text-[#695C4D] mt-0.5">
                      Entdecke unsere geführten Meditationen und Selbsthypnosen zur tiefen
                      Entspannung.
                    </p>
                  </div>
                  <Link
                    to="/meditation"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8A9A8A] hover:bg-[#728372] text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Zu den Meditationen
                  </Link>
                </div>
              )}

              {/* Modal Footer Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E3E1D9]">
                <button
                  type="button"
                  disabled={activeDay.day <= 1}
                  onClick={() => navigateDay('prev')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 disabled:opacity-40 border border-[#E3E1D9] text-xs font-bold text-[#695C4D] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Tag {activeDay.day - 1}
                </button>

                <span className="text-xs text-[#695C4D] font-medium">
                  Tag {activeDay.day} von 24
                </span>

                <button
                  type="button"
                  disabled={activeDay.day >= 24}
                  onClick={() => navigateDay('next')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 disabled:opacity-40 border border-[#E3E1D9] text-xs font-bold text-[#695C4D] transition-colors cursor-pointer"
                >
                  Tag {activeDay.day + 1}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: HINWEIS FÜR ZUKÜNFTIGE TÜRCHEN (ZEITGESPERRT) ────────── */}
      {lockedNoticeDay && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white border border-[#E3E1D9] p-6 sm:p-8 text-center shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#8A9A8A]/20 text-[#4A563E] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 text-[#8A9A8A]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A9A8A]">
                Noch etwas Geduld
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#3D3B35]">
                Türchen {lockedNoticeDay.day} ist noch verschlossen
              </h3>
            </div>

            <p className="text-sm text-[#695C4D] leading-relaxed">
              Dieses Türchen öffnet sich pünktlich am{' '}
              <strong className="text-[#3D3B35]">{lockedNoticeDay.dateLabel}</strong>. Nimm
              dir bis dahin gerne Zeit für die bereits geöffneten Impulse oder lass dich
              jeden Morgen kostenfrei per E-Mail erinnern.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-3 px-5 rounded-xl bg-[#8A9A8A] hover:bg-[#728372] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Verstanden und zurück zum Kalender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-Up Modal Vorschau */}
      <AdventskalenderPopupModal
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};

export default AdventskalenderPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, Sparkles, ShieldCheck, BookOpen, Headphones,
  Moon, Smartphone, ArrowRight, Lock, Heart, Play, Gift,
  CheckCircle2, HelpCircle, UserCheck, Mail, Send, RefreshCw, Key
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import QuickSocialUnlockBox from '../components/QuickSocialUnlockBox';

export default function PricingPackages() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'cards' | 'matrix'>('cards');
  
  // Magic Link Anfordern Formular
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setRecoveryLoading(true);
    setRecoveryError(null);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email: recoveryEmail.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/danke?magic=login`
        }
      });
      if (error) throw error;
      setRecoverySent(true);
    } catch (err: any) {
      setRecoveryError(err.message || 'Der Magic Link konnte nicht gesendet werden. Bitte prüfe deine E-Mail.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12 sm:space-y-16 animate-fade-in">
      <SEO
        title="Modelle & Einmalkauf – Flow der Stille | 100 % Transparent & Ohne Abo"
        description="Finde deinen Ruhe-Weg: Vom freien Gast-Zugang über das kostenlose Hörer-Konto mit 2 Gratis-Sessions bis zum fairen Einmalkauf mit privatem Magic Link ab 1,99 €. Kein Abo."
        canonicalUrl="https://flow-der-stille.de/pakete"
        keywords="Flow der Stille Preise, Meditation ohne Abo, Selbsthypnose Einmalkauf, Hörbuch Magic Link, Kostenlose Meditation Schlaf, Entspannung ohne Abo"
      />

      {/* 1. HERO HEADER: Plakativ & klar */}
      <section className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
          <Sparkles size={14} />
          <span>Faire Modelle • Garantiert ohne Abonnement</span>
        </div>

        <h1 className="font-serif font-bold text-3xl sm:text-5xl text-stone-900 dark:text-stone-100 leading-tight">
          Finde deinen Weg zur inneren Ruhe.
        </h1>

        <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
          Keine Abo-Fallen, keine automatischen Verlängerungen. Wähle einfach den Zugang, der heute zu dir passt: 
          Völlig frei ohne Anmeldung reinhören, mit dem kostenfreien Hörer-Konto zwei Voll-Sessions sichern oder Einzelwerke per Express-Gastkauf für immer freischalten.
        </p>

        {/* Tab Switcher */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <div className="bg-[var(--bg-alt)] p-1 rounded-2xl border border-[var(--border)] inline-flex">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-[var(--bg-card)] text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Die 3 Zugänge im Überblick
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-[var(--bg-card)] text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Detail-Tabelle
            </button>
          </div>
        </div>
      </section>

      {/* 2. PAKETE / CARDS ANSICHT */}
      {activeTab === 'cards' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* PAKET 1: FREIER GAST-ZUGANG */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-md flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap">
                  Freier Gast-Zugang
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-400 font-semibold whitespace-nowrap">Ohne Registrierung</span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100">
                  Direkt reinhören
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-1">
                  Einfach Kopfhörer aufsetzen und sofort Entspannung spüren – ohne jede Verpflichtung.
                </p>
              </div>

              <div className="py-2 border-y border-[var(--border)]">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight whitespace-nowrap">0 €</span>
                  <span className="text-xs text-stone-600 dark:text-stone-400 font-semibold whitespace-nowrap">dauerhaft kostenfrei</span>
                </div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 block mt-0.5 font-bold">
                  Keine E-Mail • Keine Zahlungsdaten
                </span>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900 dark:text-stone-100">Kapitel 1 beider Hörbücher:</strong> Über 28 Minuten gratis in voller Länge hören</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900 dark:text-stone-100">Geführte Atemübung &amp; PMR:</strong> Sofortige Beruhigung des Nervensystems (nach Haftungsausschluss)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900 dark:text-stone-100">100 % werbefrei</strong> im Web-Player</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X size={16} className="text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-stone-600 dark:text-stone-400">Kein geräteübergreifendes Merken des Hörfortschritts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X size={16} className="text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-stone-600 dark:text-stone-400">Volle Selbsthypnosen &amp; Meditationen nicht freigeschaltet</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-2">
              <Link
                to="/hoerbuecher"
                className="w-full py-3.5 px-4 rounded-2xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-stone-900 dark:text-stone-100 font-bold text-xs sm:text-sm border border-[var(--border)] transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Play size={15} className="fill-current text-emerald-700 dark:text-emerald-400" />
                <span>Jetzt gratis reinhören</span>
              </Link>
              <p className="text-xs text-center text-stone-600 dark:text-stone-400">
                Sofort abspielbar ohne Anmeldung.
              </p>
            </div>
          </div>

          {/* PAKET 2: KOSTENLOSES HÖRER-KONTO (0 €) -> MIT DEN 2 ECHTEN DATENBANK-PRODUKTEN */}
          <div className="bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-alt)]/60 rounded-3xl p-6 sm:p-8 border-2 border-emerald-600 dark:border-emerald-500 shadow-2xl flex flex-col justify-between space-y-6 relative transform lg:-translate-y-2">
            {/* Top Ribbon */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles size={12} />
              <span>Beliebteste Wahl • 100 % Kostenfrei</span>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap">
                  Hörer-Konto
                </span>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold whitespace-nowrap">1-Klick-Aktivierung</span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100">
                  Dein Ruhe-Bereich
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-1">
                  Mit 1 Klick registrieren und sofort 2 vollständige Sessions dauerhaft freischalten.
                </p>
              </div>

              <div className="py-2 border-y border-[var(--border)]">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight whitespace-nowrap">0 €</span>
                  <span className="text-xs text-stone-600 dark:text-stone-400 font-semibold whitespace-nowrap">dauerhaft kostenfrei</span>
                </div>
                <span className="text-xs text-emerald-800 dark:text-emerald-300 block mt-0.5 font-bold">
                  Garantiert kein Abo • Keine Zahlungsdaten
                </span>
              </div>

              {/* 2 Freigeschaltete Datenbank-Sessions */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2 text-xs">
                <span className="font-bold text-stone-900 dark:text-stone-100 block text-xs uppercase tracking-wider">
                  🎁 Gratis nach 1-Klick-Registrierung freigeschaltet:
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Moon size={14} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="text-stone-900 dark:text-stone-100 font-bold truncate">
                        Selbsthypnose: Tiefer Schlaf
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold shrink-0 whitespace-nowrap">12:54&nbsp;Min.</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Heart size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="text-stone-900 dark:text-stone-100 font-bold truncate">
                        Meditation: Herzöffnung
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold shrink-0 whitespace-nowrap">16:45&nbsp;Min.</span>
                  </div>
                </div>
              </div>

              {/* Feature List */}
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900 dark:text-stone-100">2 Voll-Sessions dauerhaft gratis:</strong> Schlaf-Selbsthypnose &amp; Herz-Meditation in voller Länge streamen (Wert: 3,98&nbsp;€)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900 dark:text-stone-100">Persönlicher Ruhebereich:</strong> Tägliche Impulse reflektieren, Streaks (Serie an Tagen) &amp; Reflexions-Historie speichern</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900 dark:text-stone-100">Interaktive Praxis:</strong> SOS-Atemübungen, interaktiver Atemraum, Morgen- &amp; Abend-Rituale sowie Ernährungstipps</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900 dark:text-stone-100">Geräteübergreifendes Streaming:</strong> Im Web-Player &amp; in der kostenlosen Android App nahtlos weiterhören</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900 dark:text-stone-100">1-Klick-Anmeldung:</strong> Über Google, Meta (Facebook) oder E-Mail – garantiert 0&nbsp;€ und kein Abo</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-2">
              {user ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-center text-xs font-bold flex items-center justify-center gap-2">
                  <UserCheck size={16} className="text-emerald-700 dark:text-emerald-400" />
                  <span>Du bist eingeloggt – deine 2 Gratis-Sessions stehen bereit!</span>
                </div>
              ) : (
                <Link
                  to="/registrieren"
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Sparkles size={16} />
                  <span>Mit 1 Klick kostenlos aktivieren</span>
                </Link>
              )}
              <p className="text-xs text-center text-stone-600 dark:text-stone-400">
                <span>Über Google, Meta (Facebook) oder E-Mail</span>
                <span className="block mt-0.5 whitespace-nowrap font-medium text-emerald-800 dark:text-emerald-300">
                  100&nbsp;% sicher &amp; abofrei
                </span>
              </p>
            </div>
          </div>

          {/* PAKET 3: EINMALKAUF MIT MAGIC LINK (HÖRBUCH, MEDITATION, SELBSTHYPNOSE) */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-md flex flex-col justify-between space-y-6 hover:border-amber-500/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full border border-stone-300 dark:border-stone-700 whitespace-nowrap">
                  Ruhe-Shop Einmalkauf
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-400 font-semibold whitespace-nowrap">Für immer dein • Kein Abo</span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100">
                  Einmalkauf mit Magic Link
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-1">
                  Volle Werke einzeln erwerben – als Gast oder mit Konto, ganz ohne Passwortzwang.
                </p>
              </div>

              <div className="py-2.5 border-y border-[var(--border)]">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-2xl sm:text-3xl xl:text-4xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight whitespace-nowrap">
                    1,99&nbsp;€&nbsp;–&nbsp;4,99&nbsp;€
                  </span>
                  <span className="text-xs text-stone-700 dark:text-stone-300 font-bold whitespace-nowrap">einmalig</span>
                </div>
                <span className="text-xs text-stone-900 dark:text-stone-100 block mt-1 font-bold">
                  Express-Gastkauf mit PayPal, Apple Pay &amp; Karte
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400 block mt-0.5 font-medium">
                  Keine Registrierung notwendig • Kein Passwort nötig • Nur zahlen &amp; sofort hören
                </span>
              </div>

              {/* 3 Plakative Kategorien ohne hässliche Zeilenumbrüche */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-1">
                  <div className="flex items-center justify-between gap-2 font-bold text-stone-900 dark:text-stone-100">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <BookOpen size={14} className="text-amber-700 dark:text-amber-300 shrink-0" />
                      <span className="truncate">Hörbücher</span>
                      <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">4,99&nbsp;€</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold shrink-0 whitespace-nowrap">58&nbsp;Min.</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    Ganze Geschichten über Wandel, Loslassen &amp; echtes Menschsein.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-1">
                  <div className="flex items-center justify-between gap-2 font-bold text-stone-900 dark:text-stone-100">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Moon size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="truncate">Gezielte Selbsthypnosen</span>
                      <span className="text-[11px] font-mono text-indigo-800 dark:text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">1,99&nbsp;€</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold shrink-0 whitespace-nowrap">15&nbsp;Min.</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    Gesunde Ernährung, Selbstbewusstsein, Fokus &amp; Konzentration.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-1">
                  <div className="flex items-center justify-between gap-2 font-bold text-stone-900 dark:text-stone-100">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Heart size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="truncate">Geführte Meditationen</span>
                      <span className="text-[11px] font-mono text-rose-800 dark:text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">1,99&nbsp;€</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold shrink-0 whitespace-nowrap">16–20&nbsp;Min.</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    Innere Ruhe &amp; Erdung, Inneres Kind, Herzkompass.
                  </p>
                </div>
              </div>

              {/* Feature List */}
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300 pt-1">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900 dark:text-stone-100">Privater Magic Link per E-Mail:</strong> Direkt nach Kauf auf jedem Gerät öffnen &amp; hören</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-900 dark:text-stone-100">Web- &amp; App-Streaming inklusive:</strong> Direkt im Web-Player oder in der kostenlosen Android App streamen</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-2">
              <Link
                to="/ruhe-shop"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Gift size={15} className="shrink-0" />
                  <span>Zum Ruhe-Shop &amp; Einmalkauf</span>
                </div>
                <span className="text-xs font-semibold text-emerald-100 whitespace-nowrap">
                  (ab 1,99&nbsp;€)
                </span>
              </Link>
              <p className="text-xs text-center text-stone-600 dark:text-stone-400">
                Einmal kaufen • Kein Abo • Jederzeit abspielbar
              </p>
            </div>
          </div>

        </section>
      )}

      {/* 3. DETAIL-VERGLEICHSTABELLE (MATRIX) */}
      {activeTab === 'matrix' && (
        <section className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-xl overflow-hidden animate-fade-in">
          <div className="p-6 sm:p-8 border-b border-[var(--border)] text-center space-y-2">
            <h2 className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100">
              Direkter Funktions-Vergleich
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              Übersicht aller Zugriffswege und Berechtigungen.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-alt)] text-stone-900 dark:text-stone-100">
                  <th className="p-4 sm:p-5 font-bold whitespace-nowrap">Kriterium</th>
                  <th className="p-4 sm:p-5 font-bold text-center w-1/4 whitespace-nowrap">Freier Gast-Zugang</th>
                  <th className="p-4 sm:p-5 font-bold text-center w-1/4 text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 whitespace-nowrap">
                    Hörer-Konto (0 €)
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-center w-1/4 whitespace-nowrap">Einmalkauf (ab 1,99 €)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-stone-700 dark:text-stone-300">
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">Kosten &amp; Gebühren</td>
                  <td className="p-4 sm:p-5 text-center font-bold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">0 € dauerhaft</td>
                  <td className="p-4 sm:p-5 text-center font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/5 whitespace-nowrap">0 € (Kein Abo)</td>
                  <td className="p-4 sm:p-5 text-center font-bold text-amber-800 dark:text-amber-300 whitespace-nowrap">Einmalig 1,99 € – 4,99 €</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 dark:text-stone-100">Kapitel 1 &amp; Schnupper-Übungen</td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-700 dark:text-emerald-400" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center bg-emerald-500/5"><Check className="inline text-emerald-700 dark:text-emerald-400" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-700 dark:text-emerald-400" size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 dark:text-stone-100">2 Freigeschaltete Voll-Sessions (Schlaf &amp; Herz)</td>
                  <td className="p-4 sm:p-5 text-center"><X className="inline text-rose-700 dark:text-rose-400" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center bg-emerald-500/5 font-bold text-emerald-800 dark:text-emerald-300"><Check className="inline text-emerald-700 dark:text-emerald-400" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center font-bold text-emerald-800 dark:text-emerald-300"><Check className="inline text-emerald-700 dark:text-emerald-400" size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 dark:text-stone-100">Hörfortschritt geräteübergreifend merken</td>
                  <td className="p-4 sm:p-5 text-center"><X className="inline text-rose-700 dark:text-rose-400" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center bg-emerald-500/5"><Check className="inline text-emerald-700 dark:text-emerald-400" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-700 dark:text-emerald-400" size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 dark:text-stone-100">Zugang per privatem Magic Link</td>
                  <td className="p-4 sm:p-5 text-center font-medium text-stone-600 dark:text-stone-400">Nicht nötig</td>
                  <td className="p-4 sm:p-5 text-center font-medium bg-emerald-500/5 text-stone-800 dark:text-stone-200">1-Klick Login</td>
                  <td className="p-4 sm:p-5 text-center font-bold text-amber-800 dark:text-amber-300"><Check className="inline text-emerald-700 dark:text-emerald-400" size={18} /> Per E-Mail nach Kauf</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-stone-900 dark:text-stone-100">Geräteübergreifendes Streaming (Web &amp; Android App)</td>
                  <td className="p-4 sm:p-5 text-center"><X className="inline text-rose-700 dark:text-rose-400" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center bg-emerald-500/5"><Check className="inline text-emerald-700 dark:text-emerald-400" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-700 dark:text-emerald-400" size={18} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4. MAGIC LINK FALLBACK & SICHERHEITS-BEREICH */}
      <section id="magic-link" className="bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-alt)] rounded-3xl p-6 sm:p-10 border border-[var(--border)] shadow-xl space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
            <Key size={24} />
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100">
            So funktioniert der private Magic Link
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            Wenn du ein Hörbuch oder eine Einzelsession per Gastkauf erwirbst, musst du dir kein Passwort ausdenken. 
            Direkt nach der Zahlung per PayPal oder Apple Pay erhältst du deinen privaten Link.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-1.5 text-center">
            <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold inline-flex items-center justify-center">1</span>
            <h4 className="font-bold text-stone-900 dark:text-stone-100">Sofort hören</h4>
            <p className="text-stone-600 dark:text-stone-400">Nach dem Bezahlen öffnet sich der Player direkt im Browser oder in der App.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-1.5 text-center">
            <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold inline-flex items-center justify-center">2</span>
            <h4 className="font-bold text-stone-900 dark:text-stone-100">Dauerhafter Link per Mail</h4>
            <p className="text-stone-600 dark:text-stone-400">Dein persönlicher Zugangslink liegt in deinem Postfach für jedes deiner Geräte.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-1.5 text-center">
            <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold inline-flex items-center justify-center">3</span>
            <h4 className="font-bold text-stone-900 dark:text-stone-100">Lokal gespeichert</h4>
            <p className="text-stone-600 dark:text-stone-400">Dein Browser merkt sich den Kauf sicher im internen Speicher.</p>
          </div>
        </div>

        {/* Fallback Box: Link erneut zusenden */}
        <div className="max-w-md mx-auto p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
            <Mail size={16} className="text-emerald-700 dark:text-emerald-400" />
            <span>Magic Link verlegt? Kein Problem:</span>
          </div>

          {recoverySent ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>Prüfe dein Postfach ({recoveryEmail}). Falls ein Kauf vorliegt, wurde dein Link erneut versendet!</span>
            </div>
          ) : (
            <form onSubmit={handleRequestMagicLink} className="space-y-2.5">
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="Deine Kauf-E-Mail eingeben..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-700"
              />
              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
              >
                {recoveryLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <Send size={14} />
                    <span>Zugangs-Link zusenden</span>
                  </>
                )}
              </button>
              {recoveryError && (
                <span className="text-xs text-rose-700 dark:text-rose-300 block">{recoveryError}</span>
              )}
            </form>
          )}
        </div>
      </section>

      {/* 5. 1-KLICK-REGISTRIERUNG FÜR GÄSTE */}
      {!user && (
        <section className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-10 border border-[var(--border)] shadow-xl text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100">
              Jetzt in 1 Klick dein kostenfreies Ruhe-Konto anlegen
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
              Schalte sofort die 2 Voll-Sessions für Schlaf und Herzöffnung frei und speichere deinen Hörfortschritt geräteübergreifend:
            </p>
          </div>

          <div className="max-w-md mx-auto text-left">
            <QuickSocialUnlockBox
              isFree={true}
              title="Kostenloses Hörer-Konto aktivieren"
              subtitle="Erstelle mit 1 Klick dein persönliches Profil über Google oder Facebook (keine Zahlungsdaten, kein Abo):"
              compact={false}
            />
          </div>
        </section>
      )}

      {/* 6. RECHTLICH ABGESICHERTE FAQ */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100">
            Häufige Fragen zu Preisen, Magic Links &amp; Rechtlichem
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Transparente Antworten für ein gutes, sicheres Gefühl.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Warum bietet Flow der Stille kein Monats-Abo an?',
              a: 'Abonnements erzeugen oft mentalen Druck („Ich bezahle jeden Monat, also muss ich die App nutzen“). Unser oberstes Ziel ist echte Entlastung deines Nervensystems. Deshalb sind die Grundlagen dauerhaft kostenfrei und Hörbücher bzw. Einzelsessions faire Einmalkäufe ohne Bindung.'
            },
            {
              q: 'Muss ich beim kostenfreien Hörer-Konto eine Kreditkarte angeben?',
              a: 'Nein, zu keinem Zeitpunkt. Das kostenlose Hörer-Konto dient nur dazu, deinen Hörfortschritt auf all deinen Geräten zu merken und dir die zwei vollwertigen Gratis-Sessions (Schlaf & Herzöffnung) bereitzustellen.'
            },
            {
              q: 'Was passiert mit meinem Kauf, wenn ich kein Kundenkonto habe?',
              a: 'Du erhältst sofort nach Kauf deinen persönlichen Magic Link per E-Mail und siehst ihn auf der Dankeseite. Zusätzlich speichert dein Browser auf dem aktuellen Gerät den Schlüssel, sodass du beim nächsten Besuch direkt weiterhören kannst.'
            },
            {
              q: 'Wie sieht die rechtliche Regelung zum dauerhaften Zugriff aus?',
              a: 'Gemäß unseren AGB (Ziffer 2.3) bedeutet ein Einmalkauf den Zugriff für die gesamte Betriebsdauer der Plattform. Sollte der Dienst wider Erwarten jemals aus wirtschaftlichen oder technischen Gründen eingestellt werden, informieren wir dich mindestens 30 Tage vorab und stellen nach Möglichkeit eine Download-Sicherung zur Verfügung.'
            },
            {
              q: 'Gilt der Haftungsausschluss auch für Meditation & Selbsthypnose?',
              a: 'Ja. Unsere Meditationen und Selbsthypnosen dienen der tiefen Entspannung und Achtsamkeit. Sie ersetzen keine ärztliche oder psychotherapeutische Behandlung und dürfen nicht beim Autofahren oder Bedienen von Maschinen gehört werden.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-xs space-y-1.5">
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <HelpCircle size={15} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>{item.q}</span>
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 pl-6 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. ABSCHLUSS-BANNER */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] text-center space-y-4 shadow-md">
        <Heart size={28} className="text-rose-600 dark:text-rose-400 mx-auto" />
        <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100">
          Von Herzen für deinen inneren Frieden
        </h3>
        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
          Jacqueline, Lisa und Dirk haben Flow der Stille geschaffen, um Menschen in anspruchsvollen Lebensphasen echten Halt zu geben – fair, nahbar und ehrlich.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/uebungen"
            className="px-5 py-2.5 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 hover:border-emerald-600 transition cursor-pointer"
          >
            Atemübungen &amp; PMR testen
          </Link>
          <Link
            to="/premium"
            className="px-5 py-2.5 rounded-full bg-emerald-700 text-white text-xs sm:text-sm font-bold hover:bg-emerald-800 transition shadow-xs cursor-pointer"
          >
            Ruhe-Shop öffnen
          </Link>
        </div>
      </section>

    </div>
  );
}

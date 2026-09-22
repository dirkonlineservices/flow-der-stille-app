import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, Sparkles, Clock, ShieldCheck, BookOpen, Headphones,
  Moon, Smartphone, ArrowRight, Lock, Unlock, Heart, Play, Gift,
  CheckCircle2, Volume2, HelpCircle, UserCheck, Flame
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import QuickSocialUnlockBox from '../components/QuickSocialUnlockBox';

export default function PricingPackages() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'cards' | 'matrix'>('cards');
  const [selectedTimerMinutes, setSelectedTimerMinutes] = useState<number>(30);
  const [timerDemoActive, setTimerDemoActive] = useState<boolean>(false);

  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12 sm:space-y-16 animate-fade-in">
      <SEO
        title="Pakete & Optionen – Flow der Stille | 100 % Transparent & Ohne Abo"
        description="Vergleiche unsere Angebote: Vom völlig unverbindlichen Gast-Modus über das kostenlose Hörer-Konto mit Einschlaf-Timer bis hin zum einmaligen Hörbuch-Erwerb für 4,99 €. Kein Abo."
        canonicalUrl="https://flow-der-stille.de/pakete"
        keywords="Flow der Stille Preise, Meditation ohne Abo, Hörbuch Einmalkauf, Kostenloses Hörer-Konto, Einschlaf-Timer Meditation, Gast-Kauf Hörbuch"
      />

      {/* 1. HERO HEADER */}
      <section className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider border border-[var(--accent)]/30">
          <Sparkles size={14} />
          <span>Faire Ruhe-Modelle • Garantiert ohne Abo</span>
        </div>

        <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[var(--text-main)] leading-tight">
          Finde deinen Weg zur inneren Ruhe.
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Keine versteckten Mitgliedschaften, keine Kündigungsfristen und keine Testphasen, die sich heimlich verlängern.
          Du entscheidest selbst, wie du starten möchtest: Unverbindlich reinhören, mit eigenem Hörer-Konto deinen Fortschritt sichern oder ein vollständiges Werk für immer besitzen.
        </p>

        {/* Tab Switcher */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <div className="bg-[var(--bg-alt)] p-1 rounded-2xl border border-[var(--border)] inline-flex">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Pakete im Überblick
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Detail-Vergleichstabelle
            </button>
          </div>
        </div>
      </section>

      {/* 2. PAKETE / CARDS ANSICHT */}
      {activeTab === 'cards' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* PAKET 1: SCHNUPPERER (GAST) */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-md flex flex-col justify-between space-y-6 hover:border-[var(--accent)]/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Gast-Modus
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">Ohne Registrierung</span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl text-[var(--text-main)]">
                  Schnupperer
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Ideal, um die Stimmen von Lisa und Jacqueline völlig unverbindlich kennenzulernen.
                </p>
              </div>

              <div className="py-2 border-y border-[var(--border)]">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-main)]">0 €</span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">dauerhaft gratis</span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
                  Keine Zahlungsdaten • Keine E-Mail nötig
                </span>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 text-xs text-[var(--text-muted)]">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Kapitel 1 beider Hörbücher</strong> in voller Länge anhören (über 28 Min. Gratis-Hörzeit)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Schnupper-Atemübungen & PMR</strong> direkt im Browser abspielen</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>100 % werbefrei</strong> und ohne störende Pop-ups</span>
                </li>
                <li className="flex items-start gap-2.5 opacity-60">
                  <X size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Kein Speichern des Hörfortschritts (startet bei Reload bei 00:00)</span>
                </li>
                <li className="flex items-start gap-2.5 opacity-60">
                  <X size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Kein Einschlaf-Timer (sanftes Ausblenden)</span>
                </li>
                <li className="flex items-start gap-2.5 opacity-60">
                  <X size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Keine App-Hintergrundwiedergabe bei gesperrtem Bildschirm</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-2">
              <Link
                to="/hoerbuecher"
                className="w-full py-3.5 px-4 rounded-2xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-main)] font-semibold text-xs sm:text-sm border border-[var(--border)] transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Play size={15} className="fill-current" />
                <span>Direkt als Gast reinhören</span>
              </Link>
              <p className="text-[10px] text-center text-[var(--text-muted)]">
                Kopfhörer aufsetzen und sofort entspannen.
              </p>
            </div>
          </div>

          {/* PAKET 2: RUHE-RAUM (KOSTENLOSES HÖRER-KONTO) -> DER HERO / HIGHLIGHT */}
          <div className="bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-alt)]/60 rounded-3xl p-6 sm:p-8 border-2 border-[var(--accent)] shadow-2xl flex flex-col justify-between space-y-6 relative transform lg:-translate-y-2">
            {/* Top Ribbon */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles size={12} />
              <span>Empfohlen • Dein Ruheraum</span>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[var(--accent)] bg-[var(--accent)]/15 px-3 py-1 rounded-full border border-[var(--accent)]/30">
                  Kostenloses Hörer-Konto
                </span>
                <span className="text-xs text-[var(--accent)] font-bold">1 Klick Aktivierung</span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
                  Persönlicher Ruhe-Raum
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Für alle, die regelmäßig Ruhe suchen, ihren Schlaf vertiefen und ihren Fortschritt bewahren wollen.
                </p>
              </div>

              <div className="py-2 border-y border-[var(--border)]">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-main)]">0 €</span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">dauerhaft kostenfrei</span>
                </div>
                <span className="text-[11px] text-[var(--accent)] block mt-0.5 font-semibold">
                  Garantiert kein Abonnement • Keine Zahlungsdaten
                </span>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 text-xs text-[var(--text-main)]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>Alles aus dem Gast-Modus</strong> plus alle Vorteile</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>Hörposition geräteübergreifend merken:</strong> Morgen sekundengenau da weiterhören, wo du eingeschlafen bist</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>Intelligenter Einschlaf-Timer:</strong> Sanftes Ausblenden des Tons nach 15, 30, 45 oder 60 Minuten</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>Exklusive Willkommens-Session:</strong> 25-Minuten Tiefenentspannung <em>„Reise in den inneren Frieden“</em> sofort freigeschaltet</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>Stille-Tagebuch & Stimmungs-Radar:</strong> Sanft beobachten, wie dein Stresslevel von Woche zu Woche sinkt</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span><strong>Android App mit Hintergrund-Audio:</strong> Musik und Sprache laufen weiter bei gesperrtem Bildschirm</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-2">
              {user ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-center text-xs font-semibold flex items-center justify-center gap-2">
                  <UserCheck size={16} className="text-emerald-600" />
                  <span>Du bist bereits mit deinem Ruhe-Konto eingeloggt!</span>
                </div>
              ) : (
                <Link
                  to="/registrieren"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Sparkles size={16} />
                  <span>Mit 1 Klick kostenlos aktivieren</span>
                </Link>
              )}
              <p className="text-[10px] text-center text-[var(--text-muted)]">
                Über Google oder E-Mail • 100 % werbe- und abofrei
              </p>
            </div>
          </div>

          {/* PAKET 3: HÖRBUCH-EDITIONEN (VOLLVERSION EINMALKAUF) */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-md flex flex-col justify-between space-y-6 hover:border-[var(--accent)]/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                  Einmalkauf • Für immer dein
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">Volles Werk</span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl text-[var(--text-main)]">
                  Hörbuch Vollversion
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Die vollständige Audioausgabe (z. B. <em>Der Tag, an dem der Schmetterling erwachte</em>).
                </p>
              </div>

              <div className="py-2 border-y border-[var(--border)]">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-main)]">4,99 €</span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">einmalig pro Werk</span>
                </div>
                <span className="text-[11px] text-amber-700 dark:text-amber-300 block mt-0.5 font-semibold">
                  Kein Abo • Express-Gastkauf mit PayPal möglich
                </span>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 text-xs text-[var(--text-muted)]">
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Alle 4 Kapitel & Einleitung</strong> in voller Länge (fast 60 Minuten reine Spielzeit)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Gast-Kauf ohne Passworterstellung:</strong> Express-Checkout via PayPal, Apple Pay oder Karte</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Privater Magic-Zugangslink per E-Mail:</strong> Nach Kauf sofort mit 1 Klick auf jedem Gerät abspielen</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Dauerhafter Offline-Download:</strong> Geschützt im internen App-Speicher für Reisen & Flugmodus</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Freies Kapitel-Springen & Timeline-Scrubbing</strong> nach dem ersten rechtlichen Hinweis</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>Lebenslanger Zugriff im Web & Android-App</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-2">
              <Link
                to="/hoerbuecher"
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Gift size={15} />
                <span>Hörbücher ansehen (4,99 €)</span>
              </Link>
              <p className="text-[10px] text-center text-[var(--text-muted)]">
                Einmal zahlen, für immer hören.
              </p>
            </div>
          </div>

        </section>
      )}

      {/* 3. DETAIL-VERGLEICHSTABELLE (MATRIX) */}
      {activeTab === 'matrix' && (
        <section className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] shadow-xl overflow-hidden animate-fade-in">
          <div className="p-6 sm:p-8 border-b border-[var(--border)] text-center space-y-2">
            <h2 className="font-serif font-bold text-2xl text-[var(--text-main)]">
              Detaillierte Funktions-Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Alle Features, Speicheroptionen und Zugriffswege im direkten Vergleich.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-alt)]/60 text-[var(--text-main)]">
                  <th className="p-4 sm:p-5 font-bold">Funktion / Vorteil</th>
                  <th className="p-4 sm:p-5 font-bold text-center w-1/4">Gast (Schnupperer)</th>
                  <th className="p-4 sm:p-5 font-bold text-center w-1/4 text-[var(--accent)] bg-[var(--accent)]/10">
                    Ruhe-Konto (0 €)
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-center w-1/4">Hörbuch (4,99 €)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text-muted)]">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-[var(--text-main)]">Preis & Laufzeit</td>
                  <td className="p-4 sm:p-5 text-center font-bold text-emerald-600">0 € dauerhaft</td>
                  <td className="p-4 sm:p-5 text-center font-bold text-[var(--accent)] bg-[var(--accent)]/5">0 € (Kein Abo!)</td>
                  <td className="p-4 sm:p-5 text-center font-bold text-amber-600">Einmalig 4,99 €</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-[var(--text-main)]">Kapitel 1 & Einleitung</td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-500" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center bg-[var(--accent)]/5"><Check className="inline text-[var(--accent)]" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-500" size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-[var(--text-main)]">Vollständiges Hörbuch (alle Kapitel)</td>
                  <td className="p-4 sm:p-5 text-center"><X className="inline text-rose-500" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center bg-[var(--accent)]/5"><X className="inline text-rose-500" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-500" size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-[var(--text-main)]">Registrierung erforderlich?</td>
                  <td className="p-4 sm:p-5 text-center font-medium">Nein, sofort hören</td>
                  <td className="p-4 sm:p-5 text-center font-medium bg-[var(--accent)]/5">1 Klick (Google / Mail)</td>
                  <td className="p-4 sm:p-5 text-center font-medium">Gastkauf möglich (Magic-Link)</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-[var(--text-main)]">Hörfortschritt merken</td>
                  <td className="p-4 sm:p-5 text-center"><X className="inline text-rose-500" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center bg-[var(--accent)]/5"><Check className="inline text-[var(--accent)]" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-500" size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-[var(--text-main)]">Einschlaf-Timer (Fade-Out)</td>
                  <td className="p-4 sm:p-5 text-center"><X className="inline text-rose-500" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center bg-[var(--accent)]/5"><Check className="inline text-[var(--accent)]" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-500" size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-[var(--text-main)]">Exklusive 25-Min. Tiefenreise</td>
                  <td className="p-4 sm:p-5 text-center"><X className="inline text-rose-500" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center bg-[var(--accent)]/5"><Check className="inline text-[var(--accent)]" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-500" size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-[var(--text-main)]">Offline-Download im App-Speicher</td>
                  <td className="p-4 sm:p-5 text-center"><X className="inline text-rose-500" size={18} /></td>
                  <td className="p-4 sm:p-5 text-center bg-[var(--accent)]/5 font-medium">Inklusive</td>
                  <td className="p-4 sm:p-5 text-center"><Check className="inline text-emerald-500" size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-[var(--text-main)]">Atemübungen & PMR</td>
                  <td className="p-4 sm:p-5 text-center">Basis-Übungen</td>
                  <td className="p-4 sm:p-5 text-center bg-[var(--accent)]/5">Voller Zugriff</td>
                  <td className="p-4 sm:p-5 text-center">Voller Zugriff</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4. INTERAKTIVER DEMO-BEREICH: Warum das kostenfreie Hörer-Konto begeistert */}
      <section className="bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-alt)] rounded-3xl p-6 sm:p-10 border border-[var(--border)] shadow-xl space-y-8">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center mx-auto mb-2">
            <Moon size={24} />
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
            Erlebe den Unterschied: Der intelligente Einschlaf-Timer
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Im kostenlosen Hörer-Konto musst du nicht auf die Uhr schauen. Wähle einfach deine Wunschzeit, schließe die Augen und die Stimme blendet sanft aus, sobald du eingeschlafen bist.
          </p>
        </div>

        {/* Timer Simulation Widget */}
        <div className="max-w-md mx-auto bg-[var(--bg-card)] p-5 sm:p-6 rounded-2xl border border-[var(--border)] shadow-md space-y-4 text-center">
          <span className="text-xs font-semibold text-[var(--text-muted)] block uppercase tracking-wider">
            Interaktiver Timer-Test:
          </span>

          <div className="flex items-center justify-center gap-2">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setSelectedTimerMinutes(mins);
                  setTimerDemoActive(false);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedTimerMinutes === mins
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'bg-[var(--bg-alt)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {mins} Min.
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-left">
              <Clock size={16} className="text-[var(--accent)]" />
              <div>
                <span className="font-bold text-[var(--text-main)] block">Sanftes Fade-Out</span>
                <span className="text-[11px] text-[var(--text-muted)]">Stoppt automatisch nach {selectedTimerMinutes} Min.</span>
              </div>
            </div>

            <button
              onClick={() => setTimerDemoActive(!timerDemoActive)}
              className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-semibold text-xs cursor-pointer active:scale-95 transition"
            >
              {timerDemoActive ? 'Aktiviert ✓' : 'Testen'}
            </button>
          </div>

          {timerDemoActive && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
              ✨ Perfekt! Genau so schützt der Ruhe-Timer deinen Akku und deinen gesunden Tiefschlaf.
            </p>
          )}
        </div>
      </section>

      {/* 5. 1-KLICK-REGISTRIERUNG DIREKT VOR ORT (FÜR GÄSTE) */}
      {!user && (
        <section className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-10 border border-[var(--border)] shadow-xl text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
              Jetzt in 1 Klick dein Ruhe-Konto anlegen
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Kein Passwort ausdenken. Einfach über Google oder Facebook bestätigen und sofort von allen Komfort-Funktionen profitieren:
            </p>
          </div>

          <div className="max-w-md mx-auto text-left">
            <QuickSocialUnlockBox
              isFree={true}
              title="Kostenloses Hörer-Konto aktivieren"
              subtitle="Erstelle mit 1 Klick dein persönliches Profil, um deinen Hörfortschritt zu speichern und den Einschlaf-Timer freizuschalten:"
              compact={false}
            />
          </div>
        </section>
      )}

      {/* 6. TRANSPARENZ FAQ */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
            Häufige Fragen zu unseren Angeboten
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Ehrliche Antworten für dein sicheres Gefühl.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Warum gibt es bei Flow der Stille kein monatliches Abonnement?',
              a: 'Abonnements erzeugen oft unterbewussten Druck („Ich muss die App nutzen, weil ich dafür bezahle“) oder geraten in Vergessenheit. Unser oberstes Ziel ist echte Entlastung deines Nervensystems. Deshalb bieten wir kostenlose Grundlagen dauerhaft ohne Abo an – und Hörbücher als fairen Einmalkauf.'
            },
            {
              q: 'Muss ich beim kostenlosen Hörer-Konto Zahlungsdaten eingeben?',
              a: 'Nein, niemals. Weder Kreditkarte noch PayPal oder IBAN sind erforderlich. Das Hörer-Konto dient ausschließlich dazu, deinen Hörfortschritt, deine Lieblingsübungen und deine Einstellungen zu sichern.'
            },
            {
              q: 'Wie funktioniert der Gast-Kauf bei den Hörbüchern (4,99 €)?',
              a: 'Du kannst das Hörbuch per Express-Checkout (PayPal, Apple Pay, Kreditkarte) kaufen, ohne ein Passwort zu erstellen. Sofort nach Zahlungseingang öffnet sich der Player und du erhältst per E-Mail deinen persönlichen Magic-Zugangslink, mit dem du das Hörbuch jederzeit wieder aufrufen kannst.'
            },
            {
              q: 'Kann ich später von einem Gast-Kauf in ein festes Konto wechseln?',
              a: 'Ja! Wenn du später ein Hörer-Konto mit derselben E-Mail-Adresse anlegst, werden alle deine gekauften Hörbücher automatisch in deiner persönlichen Bibliothek zusammengeführt.'
            },
            {
              q: 'Kann ich die Inhalte auch offline hören?',
              a: 'Ja. In unserer kostenlosen Android-App kannst du freigeschaltete Inhalte herunterladen und anschließend im Flugmodus oder bei schwachem Netz ohne Unterbrechung genießen.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-xs space-y-1.5">
              <h4 className="font-semibold text-xs sm:text-sm text-[var(--text-main)] flex items-center gap-2">
                <HelpCircle size={15} className="text-[var(--accent)] shrink-0" />
                <span>{item.q}</span>
              </h4>
              <p className="text-xs text-[var(--text-muted)] pl-6 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. ABSCHLUSS-BANNER */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] text-center space-y-4 shadow-md">
        <Heart size={28} className="text-[var(--accent)] mx-auto" />
        <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--text-main)]">
          Von Herzen für deinen inneren Frieden gemacht
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto">
          Wir glauben daran, dass innere Ruhe kein Luxusgut sein darf. Egal für welche Stufe du dich entscheidest: Nimm dir heute Zeit für deinen Atem.
        </p>
        <div className="pt-2">
          <Link
            to="/uebungen"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:underline"
          >
            <span>Jetzt erste Atemübung starten</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

    </div>
  );
}

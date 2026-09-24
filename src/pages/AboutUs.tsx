import React from 'react';
import { 
  Heart, Sparkles, ShieldCheck, Headphones, BookOpen, 
  ArrowLeft, ArrowRight, CheckCircle2, Lock, Users, ExternalLink 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

export default function AboutUs() {
  const navigate = useNavigate();

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "Über uns & unsere Vision – Flow der Stille",
    "description": "Lerne die Menschen hinter Flow der Stille kennen: Jacqueline (Texte), Lisa (Stimme) und Dirk (Technik & Klangwelten). Echte Entspannung ohne Abo-Zwang.",
    "url": "https://flow-der-stille.de/ueber-uns"
  };

  return (
    <>
      <SEO 
        title="Über uns & unsere Vision – Die Menschen hinter Flow der Stille"
        description="Wer steht hinter Flow der Stille? Lerne Jacqueline (Texte), Lisa (Stimme) und Dirk (Technik) kennen. Unsere Vision für ehrliche, heilsame Selbsthypnosen und Meditationen ohne Abo."
        schemaJson={aboutSchema}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-14 animate-fade-in text-stone-900 dark:text-stone-100">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 hover:text-[var(--text-main)] transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Zurück</span>
          </button>
          <div className="flex items-center gap-1.5">
            <Link to="/" className="hover:underline">Start</Link>
            <span>/</span>
            <span className="font-semibold text-[var(--text-main)]">Über uns</span>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Heart size={14} className="text-rose-600 dark:text-rose-400" />
            <span>Ein echtes Herzensprojekt</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-stone-900 dark:text-stone-100 leading-tight">
            Wer wir sind &amp; was wir bezwecken wollen
          </h1>

          <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
            Flow der Stille ist aus dem tiefen Wunsch entstanden, Menschen in fordernden Lebensphasen einen geschützten, ehrlichen Raum für innere Ruhe zu schenken – ganz ohne Abo-Druck, ohne Werbeunterbrechungen und mit höchstem Qualitätsanspruch.
          </p>
        </section>

        {/* DIE DREI ERSTELLER */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
              Das Team
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100">
              Drei Menschen, eine gemeinsame Mission
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
              Hinter Flow der Stille steht kein anonymer Großkonzern oder Algorithmus, sondern persönliche Hingabe und echte Fachkompetenz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Jacqueline */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-600/40 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center font-serif font-bold text-xl border border-amber-500/30">
                  J
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                    Jacqueline
                  </h3>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                    Texte, Skripte &amp; Konzeption
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  Jacqueline verfasst alle Texte, Selbsthypnosen, Meditationen und Hörbuchmanuskripte persönlich von Hand. Mit fundiertem Wissen über das vegetative Nervensystem und feinem Sprachgefühl wählt sie jedes Wort bewusst aus, um emotionale Schutzpanzer sanft zu lösen.
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border)] text-[11px] text-stone-600 dark:text-stone-400 italic">
                „Worte haben eine heilende Schwingung, wenn sie aus echter Empathie entstehen.“
              </div>
            </div>

            {/* 2. Lisa */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-600/40 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-800 dark:text-rose-300 flex items-center justify-center font-serif font-bold text-xl border border-rose-500/30">
                  L
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                    Lisa
                  </h3>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                    Die Stimme &amp; Stimmführung
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  Lisa erweckt Jacquelines Texte mit ihrer unverwechselbar warmen, beruhigenden Menschenstimme zum Leben. Ihre sanfte Intonation und bewusste Pausensetzung signalisieren deinem Nervensystem augenblicklich Sicherheit, Geborgenheit und Halt.
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border)] text-[11px] text-stone-600 dark:text-stone-400 italic">
                „Eine echte Stimme schenkt menschliche Wärme, die keine KI jemals ersetzen kann.“
              </div>
            </div>

            {/* 3. Dirk */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-600/40 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-800 dark:text-sky-300 flex items-center justify-center font-serif font-bold text-xl border border-sky-500/30">
                  D
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                    Dirk
                  </h3>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                    Technik, Klangwelten &amp; Plattform
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  Dirk kümmert sich um die technische Entwicklung der Web-Plattform und der Android App, die harmonische klangliche Untermalung sowie die barrierefreie Nutzung – damit du auch im Flugmodus und bei ausgeschaltetem Bildschirm ungestört zur Ruhe kommst.
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border)] text-[11px] text-stone-600 dark:text-stone-400 italic">
                „Technik sollte dem Menschen dienen, Hürden abbauen und Stille ermöglichen.“
              </div>
            </div>

          </div>
        </section>

        {/* UNSER ANLIEGEN & PHILOSOPHIE */}
        <section className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-alt)] border border-[var(--border)] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100">
              Was wir bezwecken wollen: Unsere 4 Grundsätze
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              Warum Flow der Stille bewusst anders funktioniert als herkömmliche Meditations-Apps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-xs sm:text-sm">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>1. Kein Abo-Zwang &amp; kein Druck</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Monatliche Abos erzeugen unterschwelligen Zwang („Ich bezahle, also muss ich die App nutzen“). Bei uns sind die Grundlagen dauerhaft 100 % kostenfrei. Erweiterte Werke kaufst du einmalig ab 1,99 € – sie gehören dir dauerhaft ohne Folgekosten.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>2. Reine Selbsthypnose &amp; Achtsamkeit</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Wir geben keine unlauteren Heilversprechen. Unsere geführten Selbsthypnosen und Meditationen dienen der gesunden Eigenanwendung zur seelischen Entlastung, Schlafverbesserung und Stärkung eigener Ressourcen.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>3. Höchste Text- &amp; Stimmqualität</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Keine Massen-Prompt-Generierungen und keine gefühllose Roboter-Sprachsynthese. Jedes Wort stammt von Jacqueline, jeder Ton von Lisa. Wir investieren Wochen in jedes einzelne Werk.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                <CheckCircle2 size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>4. 100 % werbefreier Ruheraum</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Niemals wirst du mitten aus einer tiefen Entspannung durch Werbeeinblendungen aufgeschreckt. Unsere Plattform schützt deine Ruhe bedingungslos.
              </p>
            </div>

          </div>
        </section>

        {/* SCHLUSS-AKTIONEN */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] text-center space-y-4 shadow-sm">
          <Sparkles size={24} className="text-emerald-700 dark:text-emerald-400 mx-auto" />
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100">
            Erlebe Flow der Stille selbst
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
            Höre jetzt kostenlos in unsere Klangproben hinein oder entdecke unsere handverlesenen Werke im Ruhe-Shop.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/klangproben"
              className="px-5 py-2.5 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 hover:border-emerald-600 transition cursor-pointer"
            >
              🎧 In Klangproben reinhören
            </Link>
            <Link
              to="/ruhe-shop"
              className="px-5 py-2.5 rounded-full bg-emerald-700 text-white text-xs sm:text-sm font-bold hover:bg-emerald-800 transition shadow-xs cursor-pointer"
            >
              Zum Ruhe-Shop (ab 1,99&nbsp;€)
            </Link>
            <Link
              to="/blog/selbsthypnose-wirkung-anwendung-qualitaetsanspruch"
              className="px-5 py-2.5 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 hover:border-emerald-600 transition cursor-pointer"
            >
              📖 Blogbeitrag zur Selbsthypnose lesen
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}

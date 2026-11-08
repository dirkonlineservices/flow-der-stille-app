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
    "name": "Über uns und unsere Vision | Flow der Stille",
    "description": "Lerne die Menschen hinter Flow der Stille kennen: Jacqueline (Texte), Lisa (Stimme) und Dirk (Technik und Klangwelten). Echte Entspannung ohne Abo-Zwang.",
    "url": "https://flow-der-stille.de/ueber-uns"
  };

  return (
    <>
      <SEO 
        title="Über uns und unsere Vision | Die Menschen hinter Flow der Stille"
        description="Wer steht hinter Flow der Stille? Lerne Jacqueline (Texte), Lisa (Stimme) und Dirk (Technik) kennen. Unsere Vision für ehrliche, heilsame Selbsthypnosen und Meditationen ohne Abo."
        schemaJson={aboutSchema}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-14 animate-fade-in text-stone-900">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-stone-600">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 hover:text-stone-900 transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Zurück</span>
          </button>
          <div className="flex items-center gap-1.5">
            <Link to="/" className="hover:underline">Start</Link>
            <span>/</span>
            <span className="font-semibold text-stone-900">Über uns</span>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Heart size={14} className="text-rose-600" />
            <span>Ein echtes Herzensprojekt</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-stone-950 leading-tight">
            Wer wir sind und was wir bezwecken wollen
          </h1>

          <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
            Flow der Stille ist aus dem tiefen Wunsch entstanden, Menschen in fordernden Lebensphasen einen geschützten, ehrlichen Raum für innere Ruhe zu schenken. Ganz ohne Abo-Druck, ohne Werbeunterbrechungen und mit hohem Qualitätsanspruch.
          </p>
        </section>

        {/* DIE DREI ERSTELLER */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block">
              Das Team
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950">
              Drei Menschen, eine gemeinsame Mission
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 max-w-xl mx-auto font-normal">
              Hinter Flow der Stille steht kein anonymer Großkonzern oder Algorithmus, sondern persönliche Hingabe und echte Fachkompetenz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Jacqueline */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-600/40 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-950 flex items-center justify-center font-serif font-bold text-xl border border-amber-300 shadow-xs">
                  J
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-950">
                    Jacqueline
                  </h3>
                  <span className="text-xs font-bold text-emerald-800 block mt-0.5">
                    Texte, Skripte und Konzeption
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                  Jacqueline verfasst alle Texte, Selbsthypnosen, Meditationen und Hörbuchmanuskripte persönlich von Hand. Mit fundiertem Wissen über das vegetative Nervensystem und feinem Sprachgefühl wählt sie jedes Wort bewusst aus, um emotionale Schutzpanzer sanft zu lösen.
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border)] text-[11px] text-stone-600 italic">
                „Worte haben eine heilende Schwingung, wenn sie aus echter Empathie entstehen.“
              </div>
            </div>

            {/* 2. Lisa */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-600/40 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-950 flex items-center justify-center font-serif font-bold text-xl border border-rose-300 shadow-xs">
                  L
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-950">
                    Lisa
                  </h3>
                  <span className="text-xs font-bold text-emerald-800 block mt-0.5">
                    Die Stimme und Stimmführung
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                  Lisa erweckt Jacquelines Texte mit ihrer unverwechselbar warmen, beruhigenden Menschenstimme zum Leben. Ihre sanfte Intonation und bewusste Pausensetzung signalisieren deinem Nervensystem augenblicklich Sicherheit, Geborgenheit und Halt.
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border)] text-[11px] text-stone-600 italic">
                „Eine echte Stimme schenkt menschliche Wärme, die keine KI jemals ersetzen kann.“
              </div>
            </div>

            {/* 3. Dirk */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-600/40 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-950 flex items-center justify-center font-serif font-bold text-xl border border-sky-300 shadow-xs">
                  D
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-stone-950">
                    Dirk
                  </h3>
                  <span className="text-xs font-bold text-emerald-800 block mt-0.5">
                    Technik, Klangwelten und Plattform
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                  Dirk kümmert sich um die technische Entwicklung der Web-Plattform und der Android App, die harmonische klangliche Untermalung sowie die barrierefreie Nutzung, damit du auch im Flugmodus und bei ausgeschaltetem Bildschirm ungestört zur Ruhe kommst.
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border)] text-[11px] text-stone-600 italic">
                „Technik sollte dem Menschen dienen, Hürden abbauen und Stille ermöglichen.“
              </div>
            </div>

          </div>
        </section>

        {/* UNSER ANLIEGEN UND PHILOSOPHIE */}
        <section className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-alt)] border border-[var(--border)] rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950">
              Was wir bezwecken wollen: Unsere 4 Grundsätze
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 font-normal">
              Warum Flow der Stille bewusst anders funktioniert als herkömmliche Meditations-Apps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-xs sm:text-sm">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-stone-950 text-sm">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>1. Kein Abo-Zwang und kein Druck</span>
              </div>
              <p className="text-stone-700 leading-relaxed font-normal">
                Monatliche Abos erzeugen unterschwelligen Zwang („Ich bezahle, also muss ich die App nutzen“). Bei uns sind die Grundlagen dauerhaft 100 % kostenfrei. Erweiterte Werke kaufst du einmalig ab 1,99&nbsp;€. Sie gehören dir dauerhaft ohne Folgekosten.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-stone-950 text-sm">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>2. Reine Selbsthypnose und Achtsamkeit</span>
              </div>
              <p className="text-stone-700 leading-relaxed font-normal">
                Wir geben keine unlauteren Heilversprechen. Unsere geführten Selbsthypnosen und Meditationen dienen der gesunden Eigenanwendung zur seelischen Entlastung, Schlafverbesserung und Stärkung eigener Ressourcen.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-stone-950 text-sm">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>3. Höchste Text- und Stimmqualität</span>
              </div>
              <p className="text-stone-700 leading-relaxed font-normal">
                Keine Massen-Prompt-Generierungen und keine gefühllose Roboter-Sprachsynthese. Jedes Wort stammt von Jacqueline, jeder Ton von Lisa. Wir investieren Wochen in jedes einzelne Werk.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-stone-950 text-sm">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>4. 100 % werbefreier Ruheraum</span>
              </div>
              <p className="text-stone-700 leading-relaxed font-normal">
                Niemals wirst du mitten aus einer tiefen Entspannung durch Werbeeinblendungen aufgeschreckt. Unsere Plattform schützt deine Ruhe bedingungslos.
              </p>
            </div>

          </div>
        </section>

        {/* SCHLUSS-AKTIONEN */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] text-center space-y-4 shadow-sm">
          <Sparkles size={24} className="text-emerald-700 mx-auto" />
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-950">
            Erlebe Flow der Stille selbst
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 max-w-lg mx-auto leading-relaxed font-normal">
            Höre jetzt kostenlos in unsere Klangproben hinein oder entdecke unsere handverlesenen Werke im Ruhe-Shop.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/hoerproben"
              className="px-5 py-2.5 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-xs sm:text-sm font-bold text-stone-950 hover:border-emerald-600 transition cursor-pointer"
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
              className="px-5 py-2.5 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-xs sm:text-sm font-bold text-emerald-900 hover:border-emerald-600 transition cursor-pointer"
            >
              📖 Blogbeitrag zur Selbsthypnose lesen
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}

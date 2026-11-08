import React from 'react';
import { 
  Users, Lock, Sparkles, CheckCircle2, ShieldCheck, Heart, 
  MessageCircle, ArrowLeft, ArrowRight, Share2, LogIn, ExternalLink 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const communitySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Geschützte Hörer-Community & Social Media | Flow der Stille",
    "description": "Die geschützte Community von Flow der Stille für registrierte Hörer. Folge uns auf Facebook und Instagram für tägliche Achtsamkeits-Impulse.",
    "url": "https://flow-der-stille.de/community"
  };

  return (
    <>
      <SEO 
        title="Geschützte Community & Social Media | Flow der Stille"
        description="Die geschützte Ruhe-Community für registrierte Hörerinnen und Hörer. Folge uns außerdem auf unserer offiziellen Facebook-Seite und auf Instagram."
        schemaJson={communitySchema}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in text-stone-900">
        
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
            <span className="font-semibold text-stone-900">Community</span>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Users size={14} className="text-emerald-700" />
            <span>{user ? 'Geschützter Ruheraum' : 'Exklusiv für registrierte User'}</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-950 leading-tight">
            {user ? 'Willkommen in deiner Ruhe-Community' : 'Die Flow der Stille Community'}
          </h1>

          <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
            {user 
              ? 'Ein sicherer Hafen für echten Austausch, gemeinsame Reflexion und gegenseitigen Halt. Schön, dass du Teil unserer Gemeinschaft bist.'
              : 'Ein geschützter Raum für achtsamen Austausch und gegenseitige Inspiration. Unsere Community ist bewusst nicht für die ganze Welt öffentlich, sondern exklusiv für registrierte Hörerinnen und Hörer reserviert.'
            }
          </p>
        </section>

        {/* CONDITION: NON-REGISTERED USER GATE */}
        {!user ? (
          <section className="bg-[var(--bg-card)] border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-950 flex items-center justify-center mx-auto border border-emerald-300">
              <Lock size={26} className="text-emerald-800" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="font-serif font-bold text-2xl text-stone-950">
                Community-Zugang nur für registrierte Hörer
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                Um einen vertrauensvollen, werbefreien und geschützten Raum für Achtsamkeit zu bewahren, öffnen wir unsere Community-Gruppen nur für angemeldete Mitglieder. Die Registrierung ist in wenigen Sekunden erledigt und dauerhaft vollkommen kostenfrei.
              </p>
            </div>

            {/* Vorteils-Punkte */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-1">
                <div className="font-bold text-stone-950 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                  <span>Geschützter Raum</span>
                </div>
                <p className="text-stone-600 font-normal">Kein Spam, keine Werbung und keine anonymen Trolle.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-1">
                <div className="font-bold text-stone-950 flex items-center gap-1.5">
                  <Heart size={14} className="text-rose-600 shrink-0" />
                  <span>2 Gratis-Sessions</span>
                </div>
                <p className="text-stone-600 font-normal">Sofort Schlaf-Selbsthypnose und Herz-Meditation freischalten.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] space-y-1">
                <div className="font-bold text-stone-950 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-800 shrink-0" />
                  <span>Dauerhaft 0 €</span>
                </div>
                <p className="text-stone-600 font-normal">Garantiert kein Abo und keine Zahlungsdaten erforderlich.</p>
              </div>
            </div>

            {/* 1-Klick Registrierungs-CTA */}
            <div className="pt-2 max-w-md mx-auto space-y-2.5">
              <Link
                to="/registrieren?redirectTo=/community"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Sparkles size={16} />
                <span>Mit 1 Klick kostenlos Hörer-Konto anlegen (0 €)</span>
              </Link>

              <p className="text-xs text-stone-600">
                Über Google, Meta (Facebook) oder E-Mail, garantiert 0&nbsp;€ und kein Abo
              </p>

              <div className="pt-2">
                <Link
                  to="/anmelden?redirectTo=/community"
                  className="text-xs font-semibold text-emerald-900 hover:underline inline-flex items-center gap-1"
                >
                  <LogIn size={13} />
                  <span>Bereits registriert? Hier mit deinem Konto einloggen →</span>
                </Link>
              </div>
            </div>
          </section>
        ) : (
          /* CONDITION: REGISTERED USER VIEW */
          <section className="space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-950 flex items-center justify-center shrink-0 border border-emerald-300">
                  <Users size={22} className="text-emerald-800" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-950">
                    Deine Community-Austauschkanäle
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 font-normal">
                    Wähle deinen bevorzugten Kanal, um dich mit anderen Hörerinnen und Hörern zu verbinden.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                {/* WhatsApp Kanal */}
                <div className="p-6 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <MessageCircle size={20} className="text-emerald-600 shrink-0" />
                      <h4 className="font-bold text-stone-950 text-base sm:text-lg">
                        WhatsApp: Tägliche Impulse und Achtsamkeit
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl font-normal">
                      Erhalte sanfte Morgen- und Abend-Gedanken, neue Klangproben und kurze Achtsamkeits-Erinnerungen direkt auf dein Smartphone.
                    </p>
                  </div>
                  <a
                    href="https://whatsapp.com/channel/0029VbDGNKFKmCPPBOppWs2M"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer active:scale-95 shrink-0"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp-Kanal abonnieren</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Community Werte */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 space-y-3">
              <h3 className="font-serif font-bold text-lg text-stone-950 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-700" />
                <span>Unsere Community-Leitlinien für einen achtsamen Raum</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-950">Respekt und Wertschätzung:</strong> Jeder Mensch bringt seine eigene Lebensgeschichte mit. Wir begegnen einander mit Wohlwollen und ohne Verurteilung.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-950">Werbefreier Ruheraum:</strong> Keine Produktwerbung, keine Affiliate-Links und kein Spam.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong className="text-stone-950">Vertraulichkeit:</strong> Persönliche Erfahrungen und Gedanken bleiben innerhalb des geschützten Raumes.</span>
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* ─── ÖFFENTLICHE SOCIAL-MEDIA KANÄLE: FACEBOOK & INSTAGRAM ─── */}
        <section className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-alt)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-pink-900 bg-pink-100 px-3 py-0.5 rounded-full border border-pink-300 inline-block">
                Öffentliche Kanäle
              </span>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-950">
                Folge uns auf Facebook und Instagram
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed font-normal">
                Auf unseren offiziellen Social-Media-Seiten teilen wir inspirierende Zitate, Neuigkeiten zu Hörbüchern und Selbsthypnosen sowie Einblicke in unsere Vision.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              {/* Facebook Seite */}
              <a
                href="https://www.facebook.com/flowderstille"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 text-xs sm:text-sm font-bold transition shadow-2xs hover:scale-105"
                title="Besuche unsere Facebook-Seite"
              >
                <FacebookIcon className="w-4 h-4 shrink-0" />
                <span>Facebook-Seite</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/flowderstille"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 hover:from-pink-500/20 hover:to-amber-500/20 text-pink-900 border border-pink-300 text-xs sm:text-sm font-bold transition shadow-2xs hover:scale-105"
                title="Folge unserem Instagram-Kanal"
              >
                <InstagramIcon className="w-4 h-4 text-pink-600 shrink-0" />
                <span>Instagram</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

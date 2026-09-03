import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Sparkles, Wind, ShieldCheck, CreditCard, ArrowLeft, BookOpen, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // 0. Über Flow der Stille & Unsere Motivation
  {
    category: "Über Flow der Stille",
    question: "Warum haben wir Flow der Stille ins Leben gerufen? (Unsere Vision)",
    answer: "Flow der Stille ist ein echtes Herzensprojekt von Jacqueline und Dirk Schmetzer, das im August 2026 ganz neu an den Start gegangen ist. Unsere Hauptmotivation war es, Menschen hochwertige und spürbar wirksame Übungen für innere Ruhe, Achtsamkeit und Vagusnerv-Entspannung zugänglich zu machen – ohne lästige Abo-Fallen, ohne störende Unterbrecherwerbung und für einen fairen, schmalen Geldbeutel. Bei uns kaufst du nur genau die Inhalte, die du wirklich haben möchtest, und behältst dauerhaften Zugriff darauf. 100 % werbefrei, ehrlich und mit viel Liebe zum Detail erschaffen."
  },
  {
    category: "Über Flow der Stille",
    question: "Welche Rolle spielt KI (Künstliche Intelligenz) bei Flow der Stille?",
    answer: "Transparenz und Ehrlichkeit liegen uns am Herzen: Sämtliche Texte, Meditationen, Selbsthypnosen und Übungen verfasst Jacqueline Schmetzer persönlich von Hand mit fundiertem Fachwissen. Unsere Premium-Meditationen und Hörbücher werden von Lisa Ragusa mit echter, warmer Menschenstimme eingesprochen. Moderne KI-Technologie nutzen wir transparent als Werkzeug für meditative Hintergrund-Klangwelten, Frequenzen sowie beruhigende visuelle Bildwelten & Designs. Dadurch sparen wir extrem teure Produktions- und Tonstudiokosten ein – und geben diesen Preisvorteil direkt an dich weiter: Du erhältst erstklassige, wirksame Entspannung ab 1,99 € einmalig statt teurer Monats-Abos."
  },
  {
    category: "Über Flow der Stille",
    question: "Warum Flow der Stille statt YouTube oder teurer Abo-Apps?",
    answer: "Flow der Stille vereint die Vorteile beider Welten, ohne deren Nachteile:\n\n1. 100 % Werbefrei: Auf YouTube wirst du mitten in der tiefsten Entspannung oft von lauter Werbung aufgeschreckt – es sei denn, du bezahlst ein teures YouTube-Premium-Abo. Bei uns gibt es niemals Werbung.\n2. Echter Flugmodus & gesunder Schlaf: Du kannst Schlafmeditationen bei komplett gesperrtem, dunklem Display und im Flugmodus anhören. Keine Funkstrahlung am Kopf, kein grelles Bildschirmlicht im Schlafzimmer und kein unbemerktes Weiterlaufen im Dauermodus die ganze Nacht über.\n3. Kein Abo-Zwang: Gängige Meditations-Apps verlangen oft 60–100 € pro Jahr im Dauer-Abo. Bei Flow der Stille kaufst du Inhalte einmalig ab 1,99 € und behältst sie dauerhaft – ohne Kündigungsfristen oder Kostenfallen.\n4. Persönliches Herzensprojekt: Hinter Flow der Stille stehen drei reale Menschen (Jacqueline, Lisa und Dirk), die du jederzeit direkt ansprechen kannst."
  },

  // 1. Achtsamkeit, Meditation, Selbsthypnose & Affirmationen
  {
    category: "Achtsamkeit, Meditation & Selbsthypnose",
    question: "Was ist der Unterschied zwischen Meditation, Selbsthypnose und Affirmationen?",
    answer: "Meditation übt das bewusste Beobachten des aktuellen Moments ohne Bewertung. Sie beruhigt Gedankenkreisen und bringt das Nervensystem in die Ruhe. Selbsthypnose nutzt eine tiefe körperliche Entspannung (Trance), um gezielt positive Impulse im Unterbewusstsein zu verankern. Affirmationen sind positiv formulierte Leitsätze (z. B. 'Ich bin in meiner Kraft'), die als Schlüsselkomponente der Selbsthypnose dienen, um alte Denkmuster durch aufbauende Überzeugungen zu ersetzen."
  },
  {
    category: "Achtsamkeit, Meditation & Selbsthypnose",
    question: "Wie hilft Atemarbeit bei der Aktivierung des Vagusnervs?",
    answer: "Der Vagusnerv ist die Hauptverbindung der Darm-Hirn-Achse und steuert den 'Entspannungsmodus' deines Körpers. Durch verlangsamte Ausatmung (wie bei der 4-7-8 Atemtechnik) signalisierst du deinem Gehirn augenblicklich Sicherheit. Der Herzschlag verlangsamt sich, Stresshormone wie Cortisol sinken, und dein Körper findet zurück in die innere Balance."
  },
  {
    category: "Achtsamkeit, Meditation & Selbsthypnose",
    question: "Wer konzipiert und verfasst die Inhalte bei Flow der Stille?",
    answer: "Sämtliche Meditationstexte, Selbsthypnose-Skripte, Hörbücher und Übungskonzepte sind 100 % Originalwerke von Jacqueline Schmetzer. Bei den Hauptprodukten wird die Sprecherstimme von einem Menschen eingesprochen. Die entspannenden Hintergrund-Klangwelten und Entspannungsmusiken wurden von Dirk Schmetzer mit KI-Unterstützung komponiert."
  },
  {
    category: "Achtsamkeit, Meditation & Selbsthypnose",
    question: "Kann ich persönliche Fragen zu Meditation, Selbsthypnose oder Affirmationen stellen?",
    answer: "Ja, sehr gerne! Wenn du inhaltliche Fragen zu den Themen Meditation, Selbsthypnose, Affirmationen oder den Übungen hast, gibt dir Jacqueline Schmetzer jederzeit sehr gerne Auskunft. Du kannst deine Fragen einfach über unser Kontaktformular an uns senden."
  },

  // 2. Plattform- & App-Nutzung
  {
    category: "Plattform- & App-Nutzung",
    question: "Wie nutze ich Flow der Stille auf dem Smartphone und im Browser?",
    answer: "Flow der Stille steht dir sowohl als eigenständige Android-App im Google Play Store als auch als moderne Web-App unter https://flow-der-stille.de zur Verfügung. Du kannst dich auf jedem Gerät mit deinem Account anmelden."
  },
  {
    category: "Plattform- & App-Nutzung",
    question: "Werden meine gekauften Produkte auf allen meinen Geräten freigeschaltet?",
    answer: "Ja. Sobald du ein Produkt oder eine Meditation erworben hast, wird der Inhalt dauerhaft mit deinem Kundenkonto verknüpft. Du kannst dich im Browser oder in der App einloggen und sofort auf deine Audios zugreifen."
  },
  {
    category: "Plattform- & App-Nutzung",
    question: "Gibt es kostenfreie Hörproben und Entspannungsübungen?",
    answer: "Ja! Wir bieten kostenfreie Hörproben, geführte Atemübungen (z. B. Vagusnerv-Atempausen) und Tages-Impulse an, damit du unverbindlich und kostenfrei in die Wirkung von Flow der Stille hineinhören kannst."
  },
  {
    category: "Plattform- & App-Nutzung",
    question: "Kann ich meine Meditationen und Hörbücher auch offline / im Flugmodus anhören?",
    answer: "Ja! Sobald du eine Meditation oder ein Audio startest, speichert unser Player die Datei im Hintergrund automatisch geschützt im App-internen Zwischenspeicher. Zudem kannst du bei deinen gekauften Produkten oder Hörproben auf 'Offline speichern' klicken, um Inhalte gezielt dauerhaft für den Flugmodus auf deinem Gerät bereitzustellen. Die Dateien liegen dabei sicher im geschützten internen App-Speicher, tauchen nicht in deiner öffentlichen Musikbibliothek auf und werden beim Deinstallieren der App automatisch entfernt."
  },

  // 3. Kauf, Abwicklung & Support
  {
    category: "Kauf & Abwicklung",
    question: "Wie funktioniert der Kauf über Google Play und PayPal?",
    answer: "In der Android-App erfolgen Käufe sicher und bequem über Google Play In-App-Käufe. Auf unserer Webseite kannst du deinen Kauf direkt über PayPal abwickeln. Nach erfolgreichem Abschluss schaltet sich dein Inhalt augenblicklich in deinem Account frei."
  },
  {
    category: "Kauf & Abwicklung",
    question: "Kann ich per PayPal bezahlen, auch wenn ich kein eigenes PayPal-Konto habe?",
    answer: "Ja, absolut! Du benötigst kein eigenes PayPal-Konto, um deinen gewünschten Inhalt bei Flow der Stille freizuschalten. Über das PayPal-Zahlungsfenster stehen dir verschiedene flexible Zahlungsmöglichkeiten zur Verfügung:\n\n1. Gastzahlung nutzen: Klicke im geöffneten PayPal-Fenster einfach auf 'Mit Kredit- oder Debitkarte zahlen' oder 'Als Gast bezahlen'.\n2. Kredit- oder Debitkarte: Du kannst jede gängige Karte (Visa, Mastercard, American Express) ohne Registrierung nutzen.\n3. Bankeinzug / IBAN (SEPA-Lastschrift): Du kannst deine normale Bankkarte (Girocard/Debitkarte) oder deine IBAN eingeben, um bequem per Lastschrift zu bezahlen.\n\nNach dem Bezahlvorgang schaltet sich dein gewünschtes Produkt sofort automatisch in deinem Kundenkonto frei."
  },
  {
    category: "Kauf & Abwicklung",
    question: "Welche Zahlungsarten stehen mir ohne PayPal-Registrierung zur Verfügung?",
    answer: "Ohne eigenes PayPal-Konto kannst du auf unserer Webseite über den PayPal-Gastzugang folgende Zahlungsarten wählen:\n• Kreditkarten & Debitkarten (Visa, Mastercard, AMEX)\n• SEPA-Lastschrift (Zahlung per Bankeinzug mit deiner IBAN oder Girocard)\n• Einmalige Gastzahlung ohne Kontoerstellung\n\nIn der Android-App kannst du sämtliche im Google Play Store hinterlegten Zahlungsarten (inkl. Google Pay, Mobilfunkrechnung, Play-Guthaben etc.) nutzen."
  },
  {
    category: "Kauf & Abwicklung",
    question: "Was passiert, wenn eine Zahlung abgebrochen wird?",
    answer: "Sollte eine Zahlung fehlschlagen oder abgebrochen werden, wird dein Konto selbstverständlich nicht belastet. Unsere Plattform zeigt dir unten rechts ein klares Benachrichtigungs-Popup an ('Kauf wurde nicht vollzogen'), damit du es bei Bedarf später erneut versuchen kannst."
  },
  {
    category: "Kauf & Abwicklung",
    question: "An wen kann ich mich bei Fragen oder Problemen wenden?",
    answer: "Bei technischen Fragen, Zahlungsangelegenheiten oder Support-Wünschen ist Dirk Schmetzer dein direkter Ansprechpartner. Du erreichst uns jederzeit über unser Kontaktformular oder per E-Mail."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('Alle');

  const categories = ['Alle', 'Über Flow der Stille', 'Achtsamkeit, Meditation & Selbsthypnose', 'Plattform- & App-Nutzung', 'Kauf & Abwicklung'];

  const filteredFAQs = activeCategory === 'Alle' 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Erstelle das offizielle Schema.org JSON-LD FAQPage Objekt für Google & KI-Suchmaschinen
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO 
        title="Häufige Fragen (FAQ) – Meditation, Selbsthypnose & Vagusnerv" 
        description="Antworten auf häufige Fragen zu Meditation, Selbsthypnose, Affirmationen, Vagusnerv-Aktivierung, App-Nutzung und Käufen bei Flow der Stille." 
        keywords="FAQ Flow der Stille, Häufige Fragen Meditation, Unterschied Meditation Selbsthypnose Affirmationen, Vagusnerv Aktivierung, Google Play Kauf, PayPal Kauf"
        schemaJson={faqSchema}
      />

      {/* Header */}
      <header className="text-center mb-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Zurück zur Startseite
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={26} />
        </div>
        <h1 className="text-3xl md:text-5xl font-serif text-[var(--color-accent-primary)] mb-3">
          Häufige Fragen (FAQ)
        </h1>
        <p className="text-[var(--color-text-muted)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Hier findest du Antworten zu Meditation, Selbsthypnose, Affirmationen, Vagusnerv-Entspannung sowie zur Nutzung der App und unserer Kaufabwicklung.
        </p>
      </header>

      {/* Kategorie-Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setOpenIndex(0);
            }}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                : 'bg-[var(--color-bg-card)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] hover:border-[var(--color-accent-primary)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Akkordeon Liste */}
      <div className="space-y-4">
        {filteredFAQs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-2xl overflow-hidden shadow-xs transition-all hover:border-[var(--color-accent-primary)]"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full p-5 md:p-6 text-left flex items-center justify-between gap-4 cursor-pointer group"
              >
                <span className="font-serif font-medium text-base md:text-lg text-[var(--color-text-main)] group-hover:text-[var(--color-accent-primary)] transition-colors">
                  {item.question}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[var(--color-bg-alt)] text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)] flex items-center justify-center shrink-0 transition-all">
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-5 md:px-6 pb-6 pt-1 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed border-t border-[var(--color-border-main)]/60">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Hilfe & Kontakt Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-bg-card)] border border-[var(--color-border-main)] text-center space-y-4 mt-12 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto">
          <MessageCircle size={20} />
        </div>
        <h3 className="text-xl font-serif text-[var(--color-text-main)] font-medium">
          Deine Frage war nicht dabei?
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] max-w-lg mx-auto leading-relaxed">
          Wir helfen dir jederzeit gerne weiter! Bei inhaltlichen Fragen zu Meditation, Selbsthypnose & Affirmationen gibt dir <strong>Jacqueline Schmetzer</strong> gerne Auskunft. Für technische Fragen, App-Nutzung & Kaufabwicklung steht dir <strong>Dirk Schmetzer</strong> zur Verfügung.
        </p>
        <div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold text-sm shadow-sm hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer"
          >
            <span>Kontakt aufnehmen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

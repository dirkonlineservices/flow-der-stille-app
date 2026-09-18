import React from 'react';
import { ArrowLeft, Zap, ShieldCheck, Download, Globe, CreditCard, Headphones, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Versand() {
  const shippingSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Versand & digitale Bereitstellung – Flow der Stille",
    "description": "Versandinformationen für digitale Produkte: 0,00 € Versandkosten und sofortige Bereitstellung nach Kauf.",
    "url": "https://flow-der-stille.de/versand",
    "mainEntity": {
      "@type": "DeliveryChargeSpecification",
      "price": "0.00",
      "priceCurrency": "EUR",
      "appliesToDeliveryMethod": "https://schema.org/DigitalDelivery",
      "eligibleRegion": {
        "@type": "DefinedRegion",
        "addressCountry": ["DE", "AT", "CH"]
      }
    }
  };

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto space-y-8 pb-12">
      <SEO 
        title="Versand & digitale Bereitstellung" 
        description="Informationen zu Versandkosten und Lieferung unserer digitalen Produkte: 0,00 € Versandkosten, sofortiger digitaler Zugriff."
        schemaJson={shippingSchema}
      />
      
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] mb-4 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={18} />
        <span>Zurück zur Startseite</span>
      </Link>

      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-[var(--color-accent-primary)] text-white">
            Informationen
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">Transparenz &amp; Sicherheit</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--color-accent-primary)] mb-3">
          Versand &amp; digitale Bereitstellung
        </h1>
        <p className="text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
          Hier erfährst du alles Wichtige über die Auslieferung, Bereitstellung und Nutzung unserer Hörbücher, geführten Meditationen und Selbsthypnosen.
        </p>
      </header>

      {/* 3 Kernpunkte auf einen Blick */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-main)] shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Zap size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-main)] text-base mb-1">Sofortiger Abruf</h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
              Direkt nach dem Kaufabschluss steht dir dein Audio in deinem Konto und Web-Player zur Verfügung.
            </p>
          </div>
        </div>

        <div className="p-5 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-main)] shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Globe size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-main)] text-base mb-1">0,00 € Versandkosten</h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
              Für alle digitalen Produkte fallen weltweit keinerlei Versandkosten oder Zusatzgebühren an.
            </p>
          </div>
        </div>

        <div className="p-5 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-main)] shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Download size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-main)] text-base mb-1">Offline nutzbar</h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
              Lade deine gekauften Audios herunter und höre sie jederzeit im Flugmodus ohne Internetverbindung.
            </p>
          </div>
        </div>
      </div>

      {/* Detaillierte Bestimmungen */}
      <div className="bg-[var(--color-bg-card)] p-6 sm:p-8 rounded-3xl shadow-sm border border-[var(--color-border-main)] space-y-6 text-[var(--color-text-muted)] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-serif text-[var(--color-text-main)] flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[var(--color-accent-primary)]" />
            1. Art der Produkte &amp; Lieferform
          </h2>
          <p>
            Bei allen Produkten auf <strong>Flow der Stille</strong> (Hörbücher, geführte Meditationen, mentale Selbsthypnosen, Atemübungen) handelt es sich um <strong>rein digitale Güter</strong> (Audio-Dateien und begleitende Materialien). Es erfolgt <strong>kein physischer Waren- oder Paketversand</strong> per Post oder Kurierdienst.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif text-[var(--color-text-main)] flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[var(--color-accent-primary)]" />
            2. Versandkosten &amp; Liefergebiet
          </h2>
          <p>
            Da die Bereitstellung ausschließlich elektronisch über das Internet erfolgt, fallen <strong>weltweit 0,00 € Versandkosten</strong> an. Unsere Plattform richtet sich primär an Kunden im deutschsprachigen Raum (Deutschland, Österreich, Schweiz), ist jedoch von überall mit Internetzugang nutzbar.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif text-[var(--color-text-main)] flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[var(--color-accent-primary)]" />
            3. Lieferzeiten &amp; Zugriffsbereitstellung
          </h2>
          <p>
            Die Bereitstellung erfolgt <strong>unmittelbar nach Eingang der Zahlung</strong> (in der Regel innerhalb von Sekunden). Nach erfolgreicher Transaktion wird das Audio-Produkt automatisch für dein registriertes Benutzerkonto freigeschaltet. Du kannst es sofort im integrierten Player anhören und bei Bedarf auf dein Endgerät für die Offline-Nutzung herunterladen.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif text-[var(--color-text-main)] flex items-center gap-2">
            <CreditCard size={18} className="text-[var(--color-accent-primary)]" />
            4. Akzeptierte Zahlungsarten
          </h2>
          <p>
            Um dir einen sicheren und unkomplizierten Einkauf zu ermöglichen, unterstützen wir gängige, SSL-verschlüsselte Bezahlmethoden:
          </p>
          <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
            <li><strong>PayPal</strong> (inkl. PayPal Guthaben, Lastschrift, Kreditkarte)</li>
            <li><strong>Kreditkarte / Debitkarte</strong> (Visa, Mastercard, American Express via PayPal Checkout)</li>
            <li><strong>Google Play In-App-Kauf</strong> (beim Kauf über die Android-App)</li>
            <li><strong>Kostenfreie Anwendungen:</strong> 0,00 € Sofort-Freischaltung ohne Bezahldaten</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-serif text-[var(--color-text-main)] flex items-center gap-2">
            <ShieldCheck size={18} className="text-[var(--color-accent-primary)]" />
            5. Widerrufs- &amp; Rückgaberecht bei digitalen Inhalten
          </h2>
          <p>
            Informationen zum Erlöschen des Widerrufsrechts bei Beginn der Ausführung digitaler Inhalte gemäß § 356 Abs. 5 BGB findest du in unserer{' '}
            <Link to="/rueckgaberichtlinie" className="text-[var(--color-accent-primary)] font-semibold hover:underline">
              Rückgaberichtlinie
            </Link>{' '}
            sowie in den{' '}
            <Link to="/agb" className="text-[var(--color-accent-primary)] font-semibold hover:underline">
              AGB
            </Link>.
          </p>
        </section>

        <section className="space-y-2 border-t border-[var(--color-border-main)] pt-4">
          <h2 className="text-lg font-serif text-[var(--color-text-main)] flex items-center gap-2">
            <Headphones size={18} className="text-[var(--color-accent-primary)]" />
            Fragen zu deiner Bestellung oder Bereitstellung?
          </h2>
          <p className="text-sm">
            Unser Kundenservice steht dir jederzeit zur Seite. Schreibe uns gerne über unser{' '}
            <Link to="/contact" className="text-[var(--color-accent-primary)] font-semibold hover:underline">
              Kontaktformular
            </Link>{' '}
            oder per E-Mail an{' '}
            <a href="mailto:kontakt@flow-der-stille.de" className="text-[var(--color-accent-primary)] font-semibold hover:underline">
              kontakt@flow-der-stille.de
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}

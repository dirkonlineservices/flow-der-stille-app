import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, ArrowLeft, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { openCookieConsentModal } from '../lib/tracking';

export default function Datenschutz() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <SEO title="Datenschutzerklärung" description="Datenschutzerklärung gemäß DSGVO für Flow der Stille." />
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-[var(--color-accent-primary)] hover:underline font-medium"
        >
          <ArrowLeft size={16} /> Zurück
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--color-bg-card)] p-8 md:p-10 rounded-3xl shadow-sm border border-[var(--color-border-main)]"
      >
        <header className="border-b border-[var(--color-border-main)] pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-[var(--color-accent-primary)] w-8 h-8" />
            <h1 className="text-3xl font-serif text-[var(--color-accent-primary)]">Datenschutzerklärung</h1>
          </div>
          <p className="text-[var(--color-text-muted-light)] text-xs">Stand: August 2026</p>
        </header>

        <div className="space-y-6 text-[var(--color-text-muted)] text-sm leading-relaxed">
          
          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">1. Verantwortlicher</h2>
            <p>
              Verantwortlich für die Datenverarbeitung im Sinne der DSGVO ist:<br />
              <strong>Dirk Schmetzer – Flow der Stille</strong><br />
              Riedgrasweg 30, 70599 Stuttgart<br />
              E-Mail: <a href="mailto:datenschutz@flow-der-stille.de" className="text-[var(--color-accent-primary)] hover:underline">datenschutz@flow-der-stille.de</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">2. Webhosting & Datenbank-Infrastruktur</h2>
            <h3 className="font-semibold text-[var(--color-text-main)]">Webhosting (Hostinger)</h3>
            <p>
              Unsere Webseite und Webanwendung werden bei der <strong>Hostinger International Ltd.</strong> (61 Lordou Vironos Street, 6023 Larnaca, Zypern) auf gesicherten Webservern innerhalb der Europäischen Union gehostet. Beim Aufruf unserer Webseite erfasst Hostinger automatisch sogenannte Server-Logfiles (z. B. anonymisierte IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, Dateiname, Browsertyp). Dies dient der sicheren, stabilen und performanten Bereitstellung unserer Webseite gemäß Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h3 className="font-semibold text-[var(--color-text-main)] mt-4">Datenbank & Automatisierte Prozesse (Supabase in der EU)</h3>
            <p>
              Für die Verwaltung von Registrierungen, Kundenkonten, Freischaltungen und Systemeinstellungen nutzen wir die Cloud-Datenbankinfrastruktur von <strong>Supabase Inc.</strong> auf Servern innerhalb der Europäischen Union (AWS-Rechenzentrum Frankfurt am Main, Deutschland).
            </p>
            <p className="mt-2">
              <strong>Kein externes CRM / CMS:</strong> Wir nutzen derzeit kein externes Kundenbeziehungs-Management-System (CRM) und kein Drittanbieter-Content-Management-System (CMS). Sämtliche Anwendungsdaten, Registrierungsbestätigungen und Kontoverwaltungen werden automatisiert direkt über unsere eigene Anwendungslogik und die gesicherte Supabase-Datenbank abgewickelt (Art. 6 Abs. 1 lit. b & f DSGVO). Die Datenübertragung erfolgt stets über gesicherte TLS-/SSL-Verschlüsselung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">3. Newsletter & Double-Opt-In</h2>
            <p>
              Wenn Sie sich für unseren Newsletter anmelden, verarbeiten wir Ihre E-Mail-Adresse ausschließlich zum Zweck des regelmäßigen E-Mail-Versands über empfohlene Entspannungsinhalte und Neuigkeiten. 
              Die Anmeldung erfolgt im rechtssicheren <strong>Double-Opt-In-Verfahren</strong>: Nach der Registrierung erhalten Sie eine E-Mail mit einem Bestätigungslink. Erst nach Anklicken dieses Links ist Ihre Anmeldung aktiv.
            </p>
            <p className="mt-2">
              Verwaltung & Speicherung: Ihre Einwilligung und E-Mail-Adresse werden direkt in unserer eigenen, EU-gehosteten Supabase-Datenbank verwaltet. Wir nutzen derzeit keine externen Drittanbieter-Newsletter-Marketingdienste. Sie können sich jederzeit über den Abmeldelink in jeder E-Mail oder per E-Mail an uns abmelden.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">4. Google-Dienste & Analysetools</h2>
            <p>
              Wir nutzen verschiedene Dienste der Google Ireland Limited („Google“), Gordon House, Barrow Street, Dublin 4, Irland:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong>Google Tag Manager (GTM):</strong> Technisches Hilfsmittel zur Einbindung und Steuerung von Analyse-Tags. Der Tag Manager selbst erstellt keine Nutzerprofile und speichert keine Cookies.</li>
              <li><strong>Google Analytics 4 (GA4) & Analytics for Firebase:</strong> Zur Analyse der Webseiten- und App-Nutzung. Die IP-Adresse wird von Google automatisch anonymisiert. Die App-Daten werden mit der Google Play Console verknüpft, um Akquisitions- und Leistungsdaten auszuwerten.</li>
              <li><strong>Google Search Console:</strong> Werkzeug zur Überwachung der Auffindbarkeit unserer Plattform in der Google-Suche (ohne Erfassung personenbezogener Nutzerdaten).</li>
              <li><strong>Firebase Crashlytics:</strong> Erfassung anonymer Absturzberichte zur Optimierung der App-Stabilität (Art. 6 Abs. 1 lit. f DSGVO).</li>
              <li><strong>Google Ads:</strong> Einsatz von Werbeanzeigen und Conversion-Tracking zur Reichweitenmessung unserer Marketingkampagnen.</li>
            </ul>

            <div className="mt-4 p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-main)]">
                <Cookie size={18} className="text-[var(--color-accent-primary)] shrink-0" />
                <span>Du möchtest deine Cookie-Einwilligung einsehen oder anpassen?</span>
              </div>
              <button
                type="button"
                onClick={() => openCookieConsentModal()}
                className="px-4 py-2 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover,#788878)] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
              >
                Cookie-Einstellungen anpassen
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">5. Social Media & Online-Werbung</h2>
            <p>
              Zur Präsentation unserer Inhalte und für Zielgruppenwerbung unterhalten wir Online-Präsenzen auf Social-Media-Plattformen (z. B. Meta [Facebook & Instagram], Pinterest, TikTok) und schalten dort Werbeanzeigen.
            </p>
            <p className="mt-2">
              Beim Besuch unserer Social-Media-Seiten oder beim Klick auf Werbeanzeigen verarbeiten die Betreiber dieser Netzwerke Daten der Nutzer für Marktforschungs- und Werbezwecke (z. B. zur Erstellung von Interessenprofilen). Die Auswertung von Werbekampagnen auf unserer Webseite erfolgt ausschließlich nach Ihrer freiwilligen Einwilligung über unser Cookie-Banner (Art. 6 Abs. 1 lit. a DSGVO).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">6. Ihre Rechte, Speicherdauer & Kontolöschung</h2>
            <p>
              Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer personenbezogenen Daten (Art. 15–21 DSGVO).
            </p>
            <p className="mt-2">
              <strong>Kontolöschung & Löschfristen:</strong> Sie können Ihr Benutzerkonto und alle damit verbundenen persönlichen Profil- und Nutzungsdaten jederzeit direkt in den Einstellungen der App oder durch eine Nachricht an uns löschen lassen. Nach Auslösung der Löschung werden Ihre persönlichen Nutzerdaten automatisiert unverzüglich, spätestens jedoch innerhalb von 30 Tagen, vollständig und unwiderruflich aus unseren aktiven Datenbanken (Supabase) gelöscht.
            </p>
            <p className="mt-2">
              <strong>Gesetzliche Aufbewahrungspflichten:</strong> Ausgenommen von der sofortigen Löschung sind ausschließlich diejenigen Daten, zu deren Aufbewahrung wir aufgrund gesetzlicher Vorgaben (z. B. nach Handels- oder Steuerrecht gemäß § 147 AO / § 257 HGB für Buchhaltungs- und Zahlungsbelege) verpflichtet sind. Diese Daten werden für jede sonstige Nutzung gesperrt, ausschließlich für die gesetzlich vorgeschriebene Dauer aufbewahrt und nach Ablauf der Aufbewahrungsfristen gelöscht.
            </p>
            <p className="mt-2">
              Für Anträge oder Fragen zur Datenlöschung wenden Sie sich bitte per E-Mail an: <a href="mailto:datenschutz@flow-der-stille.de" className="text-[var(--color-accent-primary)] hover:underline">datenschutz@flow-der-stille.de</a>.
            </p>
          </section>

          <section className="bg-stone-50 p-5 rounded-2xl border border-[var(--color-border-main)] flex items-start gap-3 mt-8">
            <Lock size={20} className="text-[var(--color-accent-primary)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[var(--color-text-main)] mb-1 text-xs uppercase tracking-wider">Verschlüsselte Datenübertragung</h3>
              <p className="text-[var(--color-text-muted)] text-xs">
                Diese Anwendung nutzt eine gesicherte SSL- bzw. TLS-Verschlüsselung, um die Sicherheit Ihrer Daten bei der Übertragung zu gewährleisten.
              </p>
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

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
          <p className="text-[var(--color-text-muted-light)] text-xs">Stand: Juni 2026</p>
        </header>

        <div className="space-y-6 text-[var(--color-text-muted)] text-sm leading-relaxed">
          
          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">1. Verantwortlicher</h2>
            <p>
              Verantwortlich für die Datenverarbeitung im Sinne der DSGVO ist:<br />
              <strong>Dirk Schmetzer</strong><br />
              Riedgrasweg 30, 70599 Stuttgart<br />
              E-Mail: <a href="mailto:datenschutz@flow-der-stille.de" className="text-[var(--color-accent-primary)] hover:underline">datenschutz@flow-der-stille.de</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">2. Datenschutz auf der Webseite</h2>
            <h3 className="font-semibold text-[var(--color-text-main)]">Google Tag Manager (GTM) & Analytics (GA4)</h3>
            <p>
              Wir setzen den Google Tag Manager ein, um Tags auf unserer Webseite zu verwalten. Der Tag Manager selbst speichert keine personenbezogenen Daten. Er dient lediglich als technisches Hilfsmittel zur Aussteuerung anderer Tools.
            </p>
            <p className="mt-2">
              Zur Analyse der Webseitennutzung setzen wir Google Analytics 4 (GA4) ein. Dies geschieht in einer datenschutzkonformen Konfiguration unter Verwendung der IP-Anonymisierung.
            </p>
            
            <h3 className="font-semibold text-[var(--color-text-main)] mt-4">Newsletter (Supabase)</h3>
            <p>
              Falls Sie sich für unseren Newsletter anmelden, speichern wir Ihre E-Mail-Adresse in unserer Datenbank beim Cloud-Dienstanbieter Supabase, welcher seine Dienste innerhalb der EU hostet. Die Anmeldung erfolgt über ein "Double Opt-In"-Verfahren, bei dem Sie die Newsletter-Anmeldung nach der Registrierung durch einen Klick auf einen Aktivierungslink bestätigen müssen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">3. Datenschutz in der mobilen App</h2>
            <h3 className="font-semibold text-[var(--color-text-main)]">Nutzer-Authentifizierung (Supabase)</h3>
            <p>
              Für die Anmeldung (Login/Registrierung) nutzen wir Supabase Auth. Ihre E-Mail-Adresse und Passwortdaten (gespeichert als kryptographischer Hash) werden sicher auf unseren Servern innerhalb der EU verarbeitet.
            </p>
            
            <h3 className="font-semibold text-[var(--color-text-main)] mt-4">Applikations-Stabilität & Firebase Crashlytics</h3>
            <p>
              Zur Verbesserung der App-Stabilität setzen wir Firebase Crashlytics ein. Hierbei werden anonymisierte Absturzdaten (Device-Daten, Stacktraces) erfasst, die uns helfen, technische Fehler zu beheben. Dies geschieht auf Basis unseres berechtigten Interesses gemäß Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h3 className="font-semibold text-[var(--color-text-main)] mt-4">Google Analytics for Firebase</h3>
            <p>
              Zur Analyse der App-Nutzung nutzen wir Google Analytics for Firebase. Diese Daten werden mit der Google Play Console verknüpft, um Akquisitionskennzahlen und Stabilitätsdaten gesammelt auszuwerten. Eine persönliche Identifizierung findet hierbei nicht statt.
            </p>

            <h3 className="font-semibold text-[var(--color-text-main)] mt-4">Kontolöschung</h3>
            <p>
              Sie haben das Recht auf jederzeitige, unwiderrufliche Löschung Ihres Benutzerkontos und der damit verbundenen persönlichen Daten direkt in den Einstellungen der App. Mit der Löschung werden auch Ihre gespeicherten Daten (z. B. Fortschritt, E-Mail-Adresse) zeitnah aus unserer Datenbank entfernt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">4. Ihre Rechte</h2>
            <p>
              Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer Daten. Bitte wenden Sie sich hierzu an die oben genannte Verantwortliche Stelle unter: <a href="mailto:datenschutz@flow-der-stille.de" className="text-[var(--color-accent-primary)] hover:underline">datenschutz@flow-der-stille.de</a>.
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

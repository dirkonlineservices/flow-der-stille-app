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
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">1. Allgemeine Hinweise</h2>
            <p>
              Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften der Europäischen Datenschutz-Grundverordnung (DSGVO) sowie dieser Datenschutzerklärung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">2. Verantwortliche Stelle</h2>
            <p>
              Verantwortlich für die Datenverarbeitung im Sinne der DSGVO für die Anwendung <strong>Flow der Stille</strong> ist:<br />
              <strong>DS Online Services</strong><br />
              Inhaber: <strong>Dirk Schmetzer</strong><br />
              Riedgrasweg 30, 70599 Stuttgart<br />
              E-Mail: <a href="mailto:info@flow-der-stille.de" className="text-[var(--color-accent-primary)] hover:underline">info@flow-der-stille.de</a><br />
              Telefon: 015906122744
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">3. Hosting & Infrastruktur</h2>
            <p>
              Unsere Website wird bei der Hostinger International Ltd. in einer Node.js-Umgebung gehostet. Beim Besuch unserer Webseite werden standardmäßig Server-Logfiles erhoben, die Ihre IP-Adresse, Datum und Zeit der Anfrage, übertragene Datenmengen und den Browser-Typ enthalten können. Dies dient der Gewährleistung der Systemsicherheit und Stabilität des Webangebots.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">4. Kontaktformular und Datenbank (Supabase)</h2>
            <p>
              Die Website enthält ein Kontaktformular. Wenn Sie unser Kontaktformular nutzen, werden Ihre Angaben verschlüsselt an unsere Datenbank beim Cloud-Dienstanbieter Supabase übertragen und dort zwecks Bearbeitung der Anfrage gespeichert.
            </p>
            <p className="mt-2 text-sm italic font-medium">
              Wichtiger Hinweis: Unser Supabase-Projekt läuft exklusiv innerhalb der EU in der Region Frankfurt (Deutschland). Die Speicherung Ihrer Daten erfolgt komplett innerhalb der EU; es findet kein Transfer in Drittländer statt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">5. Analyse-Tools & Tracking</h2>
            <p>
              Wir setzen folgende Google-Dienste ein, die <strong>nur</strong> nach Ihrer ausdrücklichen Einwilligung über unser Consent-Banner aktiviert werden:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Google Tag Manager:</strong> Wir verwenden den Tag Manager zur datenschutzkonformen Verwaltung und Einbindung von Skripten.</li>
              <li><strong>Google Analytics:</strong> Wir nutzen Google Analytics zur anonymisierten Analyse des Nutzerverhaltens. Die IP-Anonymisierung ist aktiv.</li>
              <li><strong>Google Search Console:</strong> Das Tool ist mit Google Analytics verknüpft, um Suchanfragen und den technischen Status unserer Website zu optimieren und Fehler zu beheben.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">6. Social Media & Teilen-Funktion</h2>
            <p>
              Unsere Website ermöglicht es Ihnen, Inhalte über Teilen-Buttons zu verbreiten. Die Einbindung dieser Buttons erfolgt datenschutzkonform durch statische HTML-Links (ähnlich dem Shariff-Prinzip). Das bedeutet, dass beim Laden unserer Webseite keinerlei Daten an die Betreiber der Social-Media-Plattformen (wie Instagram oder YouTube) übertragen werden. Eine Datenübermittlung findet erst statt, wenn Sie aktiv auf den jeweiligen Teilen-Button klicken.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">7. Ihre Rechte</h2>
            <p>
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten. Sie haben zudem ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Für diese Anliegen oder bei weiteren Fragen zum Thema Datenschutz wenden Sie sich bitte an die oben angegebene Verantwortliche Stelle. Zusätzlich steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
            </p>
            <p className="mt-2">
              Sie können jederzeit erteilte Einwilligungen (z.B. für Tracking oder Cookies) mit Wirkung für die Zukunft widerrufen.
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

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Datenschutz() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <SEO title="Datenschutzerklärung" description="Datenschutzerklärung gemäß DSGVO." />
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-[var(--color-accent-primary)] hover:underline font-medium"
        >
          <ArrowLeft size={16} /> Zurück zur App
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
              Verantwortlich für die Datenverarbeitung im Sinne der DSGVO ist:<br />
              <strong>DS Online Services</strong><br />
              <strong>Dirk Schmetzer</strong><br />
              Riedgrasweg 30, 70599 Stuttgart<br />
              E-Mail: info@flow-der-stille.de
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">3. Hosting</h2>
            <p>
              Unsere Website wird bei der Hostinger International Ltd. in einer Node.js-Umgebung gehostet. Beim Besuch unserer Webseite werden standardmäßig Server-Logfiles erhoben, die Ihre IP-Adresse, Datum und Zeit der Anfrage, übertragene Datenmengen und den Browser-Typ enthalten können. Dies dient der Gewährleistung der Systemsicherheit und Stabilität des Webangebots.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">4. Kontaktformular und Datenbank</h2>
            <p>
              Wenn Sie uns über unser Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Formular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage bei uns gespeichert. Diese Daten werden verschlüsselt an unsere Datenbank beim Cloud-Dienstanbieter Supabase übertragen und dort gespeichert.
            </p>
            <p className="mt-2 text-sm italic">
              Wichtiger Hinweis: Unser Supabase-Projekt läuft exklusiv innerhalb der EU in der Region Frankfurt (Deutschland). Es findet kein Transfer Ihrer Datenbank-Daten in Drittländer außerhalb der EU statt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">5. Analyse-Tools & Tracking</h2>
            <p>
              Wir setzen Google Tag Manager und Google Analytics ein. Diese Tools werden **nur** nach Ihrer ausdrücklichen Einwilligung über unser Consent-Banner aktiviert.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Google Analytics:</strong> Wir nutzen Google Analytics zur anonymisierten Analyse des Nutzerverhaltens. Die IP-Anonymisierung ist hierbei aktiv.</li>
              <li><strong>Google Search Console:</strong> Das Tool ist mit Google Analytics verknüpft, um Suchanfragen und den technischen Status unserer Website zu optimieren und Fehler zu beheben.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">6. Ihre Rechte</h2>
            <p>
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten. Sie haben zudem ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Für diese Anliegen oder bei weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an die oben angegebene Verantwortliche Stelle wenden. Zudem steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
            </p>
            <p className="mt-2">
              Sie können zudem eing erteilte Einwilligungen (z.B. für Tracking) jederzeit mit Wirkung für die Zukunft widerrufen.
            </p>
          </section>

          <section className="bg-stone-55 p-5 rounded-2xl border border-[var(--color-border-main)] flex items-start gap-3 mt-8">
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

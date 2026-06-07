import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Datenschutz() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <SEO title="Datenschutzerklärung" description="Unsere strengen Datenschutzrichtlinien." />
      <div className="mb-6">
        <Link 
          to="/register" 
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
          <p className="text-[var(--color-text-muted-light)] text-xs">Stand: Juni 2026 • Flow der Stille App</p>
        </header>

        <div className="space-y-6 text-[var(--color-text-muted)] text-sm leading-relaxed">
          
          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">1. Datenschutz auf einen Blick</h2>
            <p>
              Die Betreiber dieser Anwendung nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften (DSGVO) sowie dieser Datenschutzerklärung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">2. Datenerfassung in unserer App</h2>
            <p className="mb-2">
              Wenn Sie sich in unserer App anmelden oder registrieren, erheben wir folgende notwendige Daten, um Ihnen den Dienst bereitzustellen:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>Vorname und Nachname (zur persönlichen Ansprache auf der Startseite)</li>
              <li>E-Mail-Adresse (zur Identifizierung, Anmeldung und Zusendung des Newsletters)</li>
              <li>Passwort (Sicher und verschlüsselt in Supabase Auth gespeichert)</li>
            </ul>
            <p>
              Diese Daten werden ausschließlich auf sicheren, DSGVO-konformen Live-Servern von Supabase gespeichert und verarbeitet.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">3. Newsletter-Bestimmungen</h2>
            <p>
              Sofern Sie bei der Registrierung die optionale Einwilligung erteilt haben (Newsletter-Schaltfläche), verwenden wir Ihre E-Mail-Adresse, um Ihnen einmal im Monat Informationen rund um Stressabbau, Atemtechniken und Tipps zur gesundheitlichen Prävention zuzusenden. Sie können diese Einwilligung jederzeit mit Wirkung für die Zukunft über die App-Einstellungen widerrufen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-[var(--color-text-main)] mb-2">4. Ihre Rechte (Auskunft, Löschung, Export)</h2>
            <p>
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. In Ihren **Konto-Einstellungen** können Sie jederzeit einen vollständigen Export Ihrer Datensätze im maschinenlesbaren JSON-Format erzeugen oder Ihr Konto unwiderruflich löschen lassen.
            </p>
          </section>

          <section className="bg-stone-55 p-5 rounded-2xl border border-[var(--color-border-main)] flex items-start gap-3 mt-8">
            <Lock size={20} className="text-[var(--color-accent-primary)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[var(--color-text-main)] mb-1 text-xs uppercase tracking-wider">Verschlüsselte Datenübertragung</h3>
              <p className="text-[var(--color-text-muted)] text-xs">
                Diese Anwendung nutzt eine gesicherte SSL- bzw. TLS-Verschlüsselung. Dadurch sind Daten, die Sie an uns übermitteln (wie Login- und Profildaten), für Dritte nicht mitlesbar.
              </p>
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
}

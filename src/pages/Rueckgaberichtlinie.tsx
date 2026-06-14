import React from 'react';
import SEO from '../components/SEO';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Rueckgaberichtlinie() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <SEO title="Rückgaberichtlinie" description="Informationen zu unseren Rückgabebedingungen." />
      
      <Link to="/" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] mb-6 transition-colors">
        <ArrowLeft size={20} />
        <span>Zurück zur Startseite</span>
      </Link>

      <header>
        <h1 className="text-4xl font-serif text-[var(--color-accent-primary)] mb-4">Rückgaberichtlinie</h1>
      </header>

      <div className="bg-[var(--color-bg-card)] p-8 rounded-2xl shadow-sm border border-[var(--color-border-main)] space-y-6 text-[var(--color-text-muted)] leading-relaxed">
        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Kein Rückgaberecht bei digitalen Produkten</h2>
          <p>
            Für digitale Produkte, die über unsere Plattform angeboten werden, besteht grundsätzlich kein Widerrufs- oder Rückgaberecht.
          </p>
          <p className="mt-4">
            Sobald der Download oder der Zugriff auf das digitale Produkt beginnt, erlischt das Rückgaberecht, und der Kaufpreis wird fällig. Diese Regelung gilt, da digitale Produkte nach der Übermittlung an den Kunden nicht mehr "zurückgenommen" werden können.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Zahlungsbedingungen</h2>
          <p>
            Wir bieten sowohl kostenlose als auch kostenpflichtige Produkte an. Bei kostenlosen oder kostenfreien Produkten erfolgt die Bezahlung durch die Bereitstellung Ihrer Kundendaten. Kostenpflichtige Produkte werden über PayPal abgewickelt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Keine Erstattung</h2>
          <p>
            Da es sich um digitale Güter handelt, die unmittelbar bereitgestellt werden, ist eine Erstattung des Kaufpreises ausgeschlossen.
          </p>
        </section>
      </div>
    </div>
  );
}

import React from 'react';
import SEO from '../components/SEO';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Impressum() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <SEO title="Impressum" description="Rechtliche Informationen und Impressum." />
      
      <Link to="/" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] mb-6 transition-colors">
        <ArrowLeft size={20} />
        <span>Zurück zur Startseite</span>
      </Link>

      <header>
        <h1 className="text-4xl font-serif text-[var(--color-accent-primary)] mb-4">Impressum</h1>
        <p className="text-[var(--color-text-muted)]">Angaben gemäß § 5 TMG</p>
      </header>

      <div className="bg-[var(--color-bg-card)] p-8 rounded-2xl shadow-sm border border-[var(--color-border-main)] space-y-6">
        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Anbieter</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Flow der Stille<br />
            DS Online Services<br />
            Riedgrasweg 30<br />
            70599 Stuttgart<br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Kontakt</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Telefon: 015906122744<br />
            E-Mail: info@flow-der-stille.de
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Verantwortlich für den Inhalt</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Dirk Schmetzer
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Streitschlichtung</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            <a href="https://ec.europa.eu/consumers/odr" className="text-[var(--color-accent-primary)] hover:underline ml-1" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.<br />
            Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  );
}

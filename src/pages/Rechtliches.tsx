import React from 'react';
import SEO from '../components/SEO';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Rechtliches() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <SEO title="Rechtliches" description="Rechtliche Informationen, Haftungsausschluss und Transparenz." />
      
      <Link to="/" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] mb-6 transition-colors">
        <ArrowLeft size={20} />
        <span>Zurück zur Startseite</span>
      </Link>

      <header>
        <h1 className="text-4xl font-serif text-[var(--color-accent-primary)] mb-4">Rechtliches</h1>
      </header>

      <div className="bg-[var(--color-bg-card)] p-8 rounded-2xl shadow-sm border border-[var(--color-border-main)] space-y-8">
        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Haftungsausschluss</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
            Alle Nutzer nutzen diese Webseite und deren Inhalte auf eigenes Risiko. Wir übernehmen keine Haftung für gesundheitliche oder psychologische Folgen, die sich aus der Nutzung der bereitgestellten Inhalte ergeben könnten. Bei gesundheitlichen Bedenken konsultieren Sie bitte Ihren Arzt oder Therapeuten, nicht diese Webseite.
          </p>
        </section>

        <section id="ki-transparenz">
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Transparenzhinweis zur Nutzung von KI</h2>
          <div className="text-[var(--color-text-muted)] leading-relaxed text-sm space-y-4">
            <p>
              Im Sinne von Transparenz, Offenheit und den gesetzlichen Vorgaben weisen wir darauf hin, dass auf dieser Website in Teilen Systeme Künstlicher Intelligenz eingesetzt werden, um Inhalte zu erstellen, zu optimieren oder zu unterstützen. Dabei gilt folgende Aufteilung:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Bildmaterial & Grafiken:</strong> Ausgewählte visuelle Inhalte auf dieser Seite wurden unter Zuhilfenahme von KI-Assistenten generiert bzw. entworfen. Die finale Auswahl und Einbindung unterlag menschlicher Kontrolle.</li>
              <li><strong>Audio- & Musikdateien:</strong> Die bereitgestellten Audioinhalte basieren auf selbst verfassten Texten. Die technische Umsetzung (Stimmerzeugung, Arrangement) erfolgte teilweise unter Verwendung von KI-gestützten Tools (insb. Suno AI).</li>
              <li><strong>Quellcode & Webentwicklung:</strong> Das technische Grundgerüst wurde mittels KI-gestützter Entwicklungsumgebungen realisiert.</li>
            </ul>
            <p>
              Durch diese Kombination stellen wir sicher, dass alle Inhalte unseren Qualitätsansprüchen genügen, während die Verantwortung bei uns verbleibt.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Datenschutz & AGB</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
            Informationen zum Datenschutz finden Sie <Link to="/datenschutz" className="text-[var(--color-accent-primary)] hover:underline">hier</Link>.
            Unsere Allgemeinen Geschäftsbedingungen finden Sie <Link to="/agb" className="text-[var(--color-accent-primary)] hover:underline">hier</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Streitschlichtung</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            <a href="https://ec.europa.eu/consumers/odr" className="text-[var(--color-accent-primary)] hover:underline ml-1" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.<br />
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  );
}

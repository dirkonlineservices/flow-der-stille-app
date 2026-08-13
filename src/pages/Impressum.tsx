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
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Verantwortlich für Inhalt & Technik</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            Dirk Schmetzer (Betreiber der Plattform, Technik & Webseiteninhalte)
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Urheberrecht & Konzeption der Werke</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
            <strong>Jacqueline Schmetzer</strong><br />
            Autorin und Erstellerin aller auf dieser Plattform angebotenen Produkte (Selbsthypnosen, Meditationen, Audios und Hörbücher). Sämtliche Texte, Skripte und Konzeptionen dieser Werke sind urheberrechtlich geschützt und ihr geistiges Eigentum.
          </p>
        </section>
        
        <section id="ki-transparenz" className="p-5 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] space-y-3">
          <h2 className="text-xl font-serif text-[var(--color-text-main)] font-medium">Transparenzhinweis zu Inhalten & KI-Unterstützung (EU AI Act, Art. 50 KI-VO)</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
            Um vollständige Transparenz gemäß den Vorgaben des europäischen KI-Gesetzes (EU AI Act) zu gewährleisten, informieren wir ehrlich und detailliert über die Urheberschaft und den Einsatz digitaler Werkzeuge:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--color-text-muted)] text-sm leading-relaxed">
            <li>
              <strong>Texte, Skripte & Konzepte (100 % Mensch / Originalwerk):</strong> Sämtliche Meditationsskripte, Selbsthypnose-Texte, Hörbuch-Inhalte und Entspannungsübungen sind zu 100 % von <strong>Jacqueline Schmetzer</strong> selbst konzipiert, verfasst und urheberrechtlich geschützt.
            </li>
            <li>
              <strong>Sprecherstimme & Audio-Vertonung:</strong> Bei unseren Hauptprodukten (Meditationen, Selbsthypnosen, Hörbüchern) wird die Sprecherstimme von einem <strong>Menschen (Jacqueline Schmetzer)</strong> selbst eingesprochen. Einzelne kostenfreie Anwendungen (z. B. PMR) können digital generiert sein. Der exakte Audio-Hinweis ist transparent direkt beim jeweiligen Produkt aus unserer Datenbank angegeben.
            </li>
            <li>
              <strong>Hintergrundmusik & Klangwelten:</strong> Die entspannenden Hintergrund-Klangwelten und Musiktitel wurden von <strong>Dirk Schmetzer</strong> mittels KI-Unterstützung komponiert und produziert.
            </li>
            <li>
              <strong>Visuelles Cover-Design (✨ KI-Design):</strong> Die Produkt-Coverbilder und visuellen Grafiken wurden mit Unterstützung digitaler KI-Bildgeneratoren gestaltet.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-3">Streitschlichtung</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            <a href="https://ec.europa.eu/consumers/odr" className="text-[var(--color-accent-primary)] hover:underline ml-1" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.<br />
            Unsere E-Mail-Adresse findest du oben im Impressum. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  );
}

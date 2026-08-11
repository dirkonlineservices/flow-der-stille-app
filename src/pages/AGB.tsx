import React from 'react';
import SEO from '../components/SEO';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AGB() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <SEO title="Allgemeine Geschäftsbedingungen" description="Unsere Allgemeinen Geschäftsbedingungen." />
      
      <Link to="/" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] mb-6 transition-colors">
        <ArrowLeft size={20} />
        <span>Zurück zur Startseite</span>
      </Link>

      <header>
        <h1 className="text-4xl font-serif text-[var(--color-accent-primary)] mb-4">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Stand: August 2026</p>
      </header>

      <div className="bg-[var(--color-bg-card)] p-8 rounded-2xl shadow-sm border border-[var(--color-border-main)] space-y-6 text-[var(--color-text-muted)] leading-relaxed text-sm">
        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">1. Geltungsbereich und Anbieter</h2>
          <p>1.1. Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB“) gelten für alle Verträge, die ein Verbraucher (nachfolgend „Kunde“) mit der Firma Flow der Stille, Inhaber: Dirk Schmetzer (nachfolgend „Anbieter“), über die Webseite www.flow-der-stille.de sowie die dazugehörige mobile App (nachfolgend zusammenfassend „Plattform“) abschließt.</p>
          <p className="mt-2">1.2. Verbraucher im Sinne dieser AGB ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können (§ 13 BGB). Die Angebote des Anbieters richten sich ausschließlich an Endverbraucher.</p>
          <p className="mt-2">1.3. Abweichende, entgegenstehende oder ergänzende Bedingungen des Kunden werden nicht Vertragsbestandteil, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich und in Schriftform zu.</p>
          <p className="mt-2">1.4. Die vollständigen Anbieterkennzeichnungsdaten (Impressum) sind jederzeit auf der Webseite einsehbar.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">2. Vertragsgegenstand und Leistungsbeschreibung</h2>
          <p>2.1. Der Anbieter stellt über seine Plattform Angebote im Bereich der Entspannung, Achtsamkeit und des mentalen Trainings zum Thema „Innerer Frieden“ bereit. Der Leistungsgegenstand umfasst ausschließlich die Bereitstellung digitaler Inhalte (insb. geführte Meditationen, Selbsthypnosen und Audio-Anwendungen) zur Online-Nutzung per Streaming über die Webseite oder die mobile App. Ein Download der Audio-Dateien wird ausdrücklich nicht angeboten.</p>
          <p className="mt-2">2.2. Die genaue Leistungsbeschreibung, Verfügbarkeit und technischen Voraussetzungen der jeweiligen Produkte ergeben sich aus den individuellen Produktseiten auf der Plattform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">3. Vertragsschluss und Registrierung</h2>
          <p>3.1. Die Präsentation der Produkte auf der Plattform stellt kein rechtlich bindendes Angebot, sondern eine unverbindliche Aufforderung zur Abgabe einer Bestellung durch den Kunden dar.</p>
          <p className="mt-2">3.2. Der Kunde kann aus dem Sortiment des Anbieters Produkte auswählen und diese über den Kauf-Button auf der Plattform (Webseite oder App) bestellen. Durch das Anklicken des den Bestellvorgang abschließenden Buttons gibt der Kunde ein bindendes Angebot zum Kauf der entsprechenden digitalen Freischaltung ab.</p>
          <p className="mt-2">3.3. Der Vertrag kommt zustande, wenn der Anbieter das Angebot des Kunden durch die Freischaltung des digitalen Produkts zum Streaming auf der Webseite bzw. in der App oder durch eine ausdrückliche Bestätigungs-E-Mail annimmt.</p>
          <p className="mt-2">3.4. Für die Nutzung der App oder den Zugriff auf freigeschaltete Inhalte ist die Registrierung und die Erstellung eines Kundenkontos erforderlich.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">4. Preise und Zahlungsbedingungen</h2>
          <p>4.1. Die auf der Plattform angegebenen Preise sind Endpreise. Aufgrund der Anwendung der Kleinunternehmerregelung gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen und berechnet.</p>
          <p className="mt-2">4.2. Dem Kunden stehen die auf der Plattform jeweils angegebenen Zahlungsmethoden zur Verfügung (z. B. PayPal, Google Play In-App Kauf).</p>
          <p className="mt-2">4.3. Die Zahlung ist unmittelbar mit Vertragsschluss fällig. Die digitalen Inhalte werden erst nach erfolgreicher Autorisierung der Zahlung freigeschaltet.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">5. Bereitstellung digitaler Inhalte, Nutzungsrechte & Vervielfältigungsverbot</h2>
          <p>5.1. Digitale Inhalte (geführte Meditationen, Selbsthypnosen, Audio-Anwendungen) werden dem Kunden ausschließlich online über die Webseite oder innerhalb seines Kundenkontos in der App zur Nutzung per Streaming bereitgestellt. Es wird kein Download der Audio-Dateien zur lokalen Speicherung angeboten.</p>
          <p className="mt-2">5.2. <strong>Empfehlung erwünscht:</strong> Das Weiterempfehlen unserer Webseite (www.flow-der-stille.de) sowie unserer mobilen App an Freunde, Familie und Bekannte ist ausdrücklich erlaubt und sehr herzlich willkommen.</p>
          <p className="mt-2">5.3. <strong>Striktes Vervielfältigungs- und Weitergabeverbot:</strong> Sämtliche auf der Plattform bereitgestellten Inhalte (insbesondere Audio-Dateien, Texte, Skripte und Bilder) sind urheberrechtlich geschützt. Dem Kunden wird ein einfaches, nicht übertragbares Recht zur ausschließlich persönlichen, privaten Nutzung per Online-Streaming eingeräumt. Es ist dem Kunden ausdrücklich untersagt, die Audio-Dateien oder sonstigen Inhalte herunterzuladen, mitschneiden zu lassen, zu kopieren, zu vervielfältigen, an Dritte weiterzugeben, im Internet oder in sozialen Medien öffentlich zugänglich zu machen, zu vermieten, zu verändern oder gewerblich bzw. kommerziell weiterzuvertreiben.</p>
          <p className="mt-2">5.4. Zuwiderhandlungen gegen das Urheberrecht oder diese Nutzungsbestimmungen werden zivil- und strafrechtlich verfolgt.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">6. Wichtiger Gesundheitshinweis und Haftungsausschluss</h2>
          <p>6.1. Die vom Anbieter angebotenen Meditationen und Audio-Inhalte dienen ausschließlich der Persönlichkeitsentwicklung, Entspannung und der Förderung des inneren Friedens. Sie stellen keine therapeutische oder medizinische Behandlung dar und können eine solche nicht ersetzen.</p>
          <p className="mt-2">6.2. Der Kunde bestätigt mit der Nutzung der Leistungen, dass die Nutzung der Meditationen auf eigene Verantwortung und eigenes Risiko erfolgt. Die Anwendung von Entspannungsaudios während des Autofahrens oder beim Bedienen von Maschinen ist strikt untersagt.</p>
          <p className="mt-2">6.3. Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, die auf einer vorsätzlichen oder fahrlässigen Pflichtverletzung des Anbieters beruhen. Für sonstige Schäden haftet der Anbieter nur bei Vorsatz und grober Fahrlässigkeit.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">7. Gesetzliches Widerrufsrecht und vorzeitiges Erlöschen</h2>
          <p>7.1. Verbrauchern steht beim Abschluss von Fernabsatzverträgen grundsätzlich ein gesetzliches 14-tägiges Widerrufsrecht zu.</p>
          <p className="mt-2">7.2. Wichtiger Hinweis zum Erlöschen des Widerrufsrechts bei digitalen Inhalten: Das Widerrufsrecht erlischt bei Verträgen über die Lieferung von digitalen Inhalten (Streaming-Inhalte), sobald der Anbieter mit der Ausführung des Vertrags begonnen hat (z. B. durch Freischaltung des Zugriffs in der App oder auf der Webseite), nachdem der Kunde ausdrücklich zugestimmt hat, dass der Anbieter mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnt, und seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung sein Widerrufsrecht verliert.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">8. Schlussbestimmungen und Streitschlichtung</h2>
          <p>8.1. Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).</p>
          <p className="mt-2">8.2. Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die unter https://ec.europa.eu/consumers/odr zu finden ist. Der Anbieter ist weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          <p className="mt-2">8.3. Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.</p>
        </section>
      </div>
    </div>
  );
}

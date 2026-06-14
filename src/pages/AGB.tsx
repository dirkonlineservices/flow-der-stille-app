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
        <p className="text-sm text-[var(--color-text-muted)]">Stand: Juni 2026</p>
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
          <p>2.1. Der Anbieter stellt über seine Plattform Angebote im Bereich des mentalen Trainings und Coachings zum Thema „Innerer Frieden“ bereit. Der Leistungsgegenstand umfasst:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Die Bereitstellung und den Verkauf von digitalen Produkten (insb. geführte Meditationen und Audio-Dateien im MP3- oder WAV-Format) zum Download oder Streaming.</li>
            <li>Die Durchführung von Online-Coachings (z. B. über integrierte Video-Funktionen in der App/Webseite oder externe Videokonferenz-Tools).</li>
          </ul>
          <p className="mt-2">2.2. Die genaue Leistungsbeschreibung, Verfügbarkeit und technischen Voraussetzungen der jeweiligen Produkte und Coachings ergeben sich aus den individuellen Produktseiten auf der Plattform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">3. Vertragsschluss und Registrierung</h2>
          <p>3.1. Die Präsentation der Produkte und Dienstleistungen auf der Plattform stellt kein rechtlich bindendes Angebot, sondern eine unverbindliche Aufforderung zur Abgabe einer Bestellung durch den Kunden dar.</p>
          <p className="mt-2">3.2. Der Kunde kann aus dem Sortiment des Anbieters Produkte und Coachings auswählen und diese über den Button „In den Warenkorb“ oder direkt über einen Kauf-Button sammeln. Durch das Anklicken des den Bestellvorgang abschließenden Buttons (z. B. „Zahlungspflichtig bestellen“ oder „Jetzt kaufen“) gibt der Kunde ein bindendes Angebot zum Kauf der im Warenkorb befindlichen Waren oder Dienstleistungen ab.</p>
          <p className="mt-2">3.3. Der Vertrag kommt erst zustande, wenn der Anbieter das Angebot des Kunden durch die Bereitstellung des digitalen Produkts (Download-Link / Freischaltung in der App) oder durch eine ausdrückliche Bestätigungs-E-Mail annimmt.</p>
          <p className="mt-2">3.4. Für die Nutzung bestimmter Funktionen der App oder den Zugriff auf gekaufte Inhalte kann eine Registrierung und die Erstellung eines Kundenkontos erforderlich sein.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">4. Preise und Zahlungsbedingungen</h2>
          <p>4.1. Die auf der Plattform angegebenen Preise sind Endpreise. Aufgrund der Anwendung der Kleinunternehmerregelung gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen und berechnet.</p>
          <p className="mt-2">4.2. Dem Kunden stehen die auf der Plattform jeweils angegebenen Zahlungsmethoden zur Verfügung. Dies umfasst standardmäßig die Abwicklung über: PayPal, Stripe/Kreditkarte.</p>
          <p className="mt-2">4.3. Die Zahlung ist unmittelbar mit Vertragsschluss fällig. Digitale Produkte werden erst nach erfolgreicher Autorisierung der Zahlung freigeschaltet.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">5. Bereitstellung digitaler Inhalte und Nutzungsrechte</h2>
          <p>5.1. Digitale Produkte (MP3-, WAV-Dateien etc.) werden dem Kunden entweder durch Bereitstellung eines Download-Links per E-Mail oder durch direkte Freischaltung innerhalb seines Kundenkontos/der App zur Verfügung gestellt.</p>
          <p className="mt-2">5.2. Der Anbieter räumt dem Kunden an den erworbenen digitalen Inhalten ein einfaches, nicht übertragbares, zeitlich und örtlich unbeschränktes Recht ein, die bereitgestellten Inhalte ausschließlich für den persönlichen, privaten Gebrauch zu nutzen.</p>
          <p className="mt-2">5.3. Eine darüber hinausgehende Nutzung, insbesondere die Vervielfältigung, Verbreitung, öffentliche Zugänglichmachung (z.B. im Internet), Vermietung oder der Weiterverkauf der Audio-Dateien ist ausdrücklich untersagt, es sei denn, der Anbieter hat vorab eine schriftliche Einwilligung erteilt.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">6. Besondere Bedingungen für Online-Coachings</h2>
          <p>6.1. Die Buchung von Online-Coachings erfolgt für feste, vereinbarte Termine oder für einen definierten Zeitraum.</p>
          <p className="mt-2">6.2. Der Kunde ist selbst dafür verantwortlich, die technischen Voraussetzungen (stabile Internetverbindung, kompatibles Endgerät, funktionsfähige Kamera und Mikrofon) für die Teilnahme am Online-Coaching bereitzustellen. Ein technischer Ausfall aufseiten des Kunden entbindet diesen nicht von der Zahlungsverpflichtung.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">7. Wichtiger Gesundheitshinweis und Haftungsausschluss</h2>
          <p>7.1. Die vom Anbieter angebotenen Meditationen, Audio-Inhalte und Online-Coachings dienen ausschließlich der Persönlichkeitsentwicklung, Entspannung und der Förderung des inneren Friedens. Sie stellen keine medizinische, psychotherapeutische oder psychiatrische Behandlung oder Beratung dar und können eine solche nicht ersetzen.</p>
          <p className="mt-2">7.2. Voraussetzung für die Teilnahme und Nutzung: Der Kunde bestätigt mit dem Kauf bzw. der Inanspruchnahme der Leistungen, dass er körperlich und psychisch gesund ist und die Teilnahme an Coachings sowie die Nutzung von Meditationen auf eigene Verantwortung und eigenes Risiko erfolgen.</p>
          <p className="mt-2">7.3. Personen, die sich in psychotherapeutischer oder psychiatrischer Behandlung befinden oder unter schweren psychischen Erkrankungen leiden, sollten vor der Nutzung der Angebote Rücksprache mit ihrem behandelnden Arzt oder Therapeuten halten.</p>
          <p className="mt-2">7.4. Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, die auf einer vorsätzlichen oder fahrlässigen Pflichtverletzung des Anbieters oder seiner Erfüllungsgehilfen beruhen. Für sonstige Schäden haftet der Anbieter nur bei Vorsatz und grober Fahrlässigkeit. Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen ist die Haftung ausgeschlossen.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">8. Gesetzliches Widerrufsrecht und vorzeitiges Erlöschen</h2>
          <p>8.1. Verbrauchern steht beim Abschluss von Fernabsatzverträgen grundsätzlich ein gesetzliches 14-tägiges Widerrufsrecht zu.</p>
          <p className="mt-2">8.2. Wichtiger Hinweis zum Erlöschen des Widerrufsrechts bei digitalen Inhalten: Das Widerrufsrecht erlischt bei Verträgen über die Lieferung von digitalen Inhalten (z. B. MP3-/WAV-Downloads, Streaming-Inhalte), sobald der Anbieter mit der Ausführung des Vertrags begonnen hat (z. B. durch Bereitstellung des Download-Links oder Freischaltung in der App), nachdem der Kunde (1) ausdrücklich zugestimmt hat, dass der Anbieter mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnt, und (2) seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit Beginn der Ausführung des Vertrags sein Widerrufsrecht verliert.</p>
          <p className="mt-2">8.3. Die detaillierten Rückgaberichtlinien und die formelle Widerrufsbelehrung sind separat auf der Plattform (unter dem Impressum) zu finden.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-2">9. Schlussbestimmungen und Streitschlichtung</h2>
          <p>9.1. Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).</p>
          <p className="mt-2">9.2. Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die unter https://ec.europa.eu/consumers/odr zu finden ist. Der Anbieter ist weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          <p className="mt-2">9.3. Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.</p>
        </section>
      </div>
    </div>
  );
}

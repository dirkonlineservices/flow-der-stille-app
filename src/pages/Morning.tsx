import React from 'react';
import { motion } from 'motion/react';
import { Sun, Wind, Sparkles, Headphones, ArrowLeft, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Morning() {
  return (
    <div className="space-y-12">
      <SEO title="Morgenritual & Tagesstart" description="Aktiviere deinen Körper und dein Nervensystem sanft für einen klaren, fokussierten Tag." />
      <header className="mb-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Zurück zur Startseite
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-accent-primary)] mb-4 flex items-center gap-3">
          <Sun className="w-10 h-10 text-amber-500" />
          Dein Morgenritual für mehr Klarheit
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg max-w-2xl leading-relaxed">
          Aktiviere dein Nervensystem sanft und setze den Grundstein für einen gelassenen, produktiven Tag. Kurze Impulse für deinen Morgen.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MorningCard
          title="Sanfte Vagus-Aktivierung"
          desc="Starte nicht mit Hektik. Zwei Minuten bewusste Bauchatmung direkt nach dem Aufstehen signalisieren deinem Gehirn Sicherheit und innere Ruhe."
          icon={<Wind className="w-6 h-6 text-blue-400" />}
          linkTo="/exercises"
          linkText="Zur Atemübung"
          delay={0.1}
        />
        <MorningCard
          title="Tages-Intention setzen"
          desc="Nimm dir beim ersten Glas Wasser einen Moment Zeit: Welches Gefühl soll deinen heutigen Tag leiten? Setze deinen Fokus vor der ersten E-Mail."
          icon={<Sparkles className="w-6 h-6 text-amber-500" />}
          linkTo="/premium?filter=Selbsthypnose"
          linkText="Fokus-Audio anhören"
          delay={0.2}
        />
        <MorningCard
          title="Geführte Morgen-Meditation"
          desc="Erlebe 5 Minuten geführte Aufmerksamkeit, um Gedanken zu ordnen und mit positiver Energie in den Tag zu starten."
          icon={<Headphones className="w-6 h-6 text-emerald-500" />}
          linkTo="/premium?filter=Meditation"
          linkText="Morgen-Meditation starten"
          delay={0.3}
        />
      </div>

      <section className="bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] p-8 md:p-12 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sun size={150} />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl font-serif text-[var(--color-text-main)] mb-4">Drei Säulen für einen entspannten Tagesstart</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
            Wie wir die ersten 30 Minuten unseres Tages verbringen, bestimmt den Ton für das gesamte Nervensystem.
          </p>
          <ul className="space-y-4">
             <li className="flex items-start gap-3 text-[#4f5651]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] mt-2 shrink-0" />
                <span><strong>Licht & Rehydrierung:</strong> Trinke direkt nach dem Aufstehen ein großes Glas lauwarmes Wasser und schaue für 2 Minuten ins Tageslicht.</span>
             </li>
             <li className="flex items-start gap-3 text-[#4f5651]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] mt-2 shrink-0" />
                <span><strong>Digital Detox am Morgen:</strong> Vermeide Smartphones und Nachrichten in den ersten 15–30 Minuten, um kein Cortisol auszuschütten.</span>
             </li>
             <li className="flex items-start gap-3 text-[#4f5651]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] mt-2 shrink-0" />
                <span><strong>Atemimpuls:</strong> Starte mit 10 tiefen Atemzügen in den Bauchraum – tief durch die Nase ein, langsam durch den Mund aus.</span>
             </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function MorningCard({ title, desc, icon, delay, linkTo, linkText }: { title: string; desc: string; icon: React.ReactNode; delay: number; linkTo?: string; linkText?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[var(--color-bg-card)] p-6 rounded-3xl border border-[var(--color-border-main)] shadow-sm flex flex-col h-full hover:shadow-md transition-shadow"
    >
       <div className="w-12 h-12 bg-[var(--color-bg-alt)] rounded-xl flex items-center justify-center mb-5">
         {icon}
       </div>
       <h3 className="text-xl font-serif text-[var(--color-text-main)] mb-3">{title}</h3>
       <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6 flex-1">{desc}</p>
       
       {linkTo && (
         <Link to={linkTo} className="inline-flex items-center text-sm font-medium text-[var(--color-accent-primary)] hover:text-[var(--color-accent-hover)] transition-colors mt-auto">
           {linkText} →
         </Link>
       )}
    </motion.div>
  );
}

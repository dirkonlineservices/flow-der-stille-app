import React from 'react';
import { motion } from 'motion/react';
import { Moon, Flame, Wind, Headphones, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Evening() {
  return (
    <div className="space-y-12">
      <SEO title="Abendliche Entspannung" description="Bereite deinen Körper und Geist sanft auf einen erholsamen Schlaf vor. Abendroutine." />
      <header className="mb-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Zurück zur Startseite
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-accent-primary)] mb-4 flex items-center gap-3">
          <Moon className="w-10 h-10 text-indigo-400" />
          Abendliche Entspannung
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg max-w-2xl leading-relaxed">
          Bereite deinen Körper und Geist sanft auf einen erholsamen Schlaf vor. Hier findest du Impulse, um den Tag loszulassen und dich neu zu programmieren.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EveningCard
          title="Schaffe die richtige Atmosphäre"
          desc="Zünde eine Kerze an, dimm das Licht und schalte Bildschirme mindestens eine Stunde vor dem Schlafengehen aus. Das sanfte Licht signalisiert dem Gehirn, dass es Zeit für Ruhe ist."
          icon={<Flame className="w-6 h-6 text-amber-500" />}
          delay={0.1}
        />
        <EveningCard
          title="Tief durchatmen"
          desc="Nutze die Atemführung, um dein Nervensystem herunterzufahren. Die 4-7-8 Atemtechnik eignet sich besonders gut, um in den Schlaf zu gleiten."
          icon={<Wind className="w-6 h-6 text-blue-400" />}
          linkTo="/atemchat"
          linkText="Zur Atemübung"
          delay={0.2}
        />
        <EveningCard
          title="Meditation & Klänge"
          desc="Höre einer sanften Meditation oder beruhigenden Klängen zu, um Gedankenkreisen zu stoppen und den Geist auf Entspannung zu programmieren."
          icon={<Headphones className="w-6 h-6 text-purple-400" />}
          linkTo="/learn"
          linkText="Mehr erfahren"
          delay={0.3}
        />
      </div>

      <section className="bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] p-8 md:p-12 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Moon size={150} />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl font-serif text-[var(--color-text-main)] mb-4">Umprogrammierung für den Schlaf</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
            Unser Gehirn verarbeitet im Schlaf die Eindrücke des Tages. Wenn wir den Tag mit Stress und Sorgen beenden, nehmen wir diese in unsere Traumphasen mit. Ein bewusster "Reset" vor dem Einschlafen ist daher essenziell. 
          </p>
          <ul className="space-y-4">
             <li className="flex items-start gap-3 text-[#4f5651]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] mt-2 shrink-0" />
                <span><strong>Das Dankbarkeitstagebuch:</strong> Schreibe drei Dinge auf, für die du heute dankbar bist. Das lenkt den Fokus auf das Positive.</span>
             </li>
             <li className="flex items-start gap-3 text-[#4f5651]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] mt-2 shrink-0" />
                <span><strong>Gedanken aufschreiben:</strong> Wenn dein Kopf noch voller To-Dos ist, schreibe sie auf einen Zettel. Damit parkst du sie sicher für den nächsten Tag.</span>
             </li>
             <li className="flex items-start gap-3 text-[#4f5651]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] mt-2 shrink-0" />
                <span><strong> Progressive Muskelentspannung (PMR):</strong> Spanne beim Liegen im Bett nacheinander verschiedene Muskelgruppen kurz an und lass sie dann bewusst los.</span>
             </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function EveningCard({ title, desc, icon, delay, linkTo, linkText }: { title: string; desc: string; icon: React.ReactNode; delay: number; linkTo?: string; linkText?: string }) {
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
           {linkText}
         </Link>
       )}
    </motion.div>
  );
}

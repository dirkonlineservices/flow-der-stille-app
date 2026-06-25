import React from 'react';
import { motion } from 'motion/react';
import { Brain, Activity, Zap, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

export default function Learn() {
  const { t } = useLanguage();

  return (
    <div className="space-y-12 max-w-3xl">
      <SEO title="Leitfaden" description="Verstehen Sie das Nervensystem, Sympathikus und Parasympathikus." />
      <header>
        <h1 className="text-4xl font-serif text-[var(--color-accent-primary)] mb-4">{t('learn.title')}</h1>
        <p className="text-[var(--color-text-muted)] text-lg">
          {t('learn.subtitle')}
        </p>
      </header>

      <Section 
        title="Unser Nervensystem"
        subtitle="Wie alles zusammenhängt"
        icon={<Brain className="text-violet-500" />}
        content="Das Nervensystem steuert alle Funktionen unseres Körpers und reagiert empfindlich auf Stress und Entspannung. Der Sympathikus bereitet uns als 'Gaspedal' auf Aktivität vor (Kampf/Flucht), während der Parasympathikus als 'Bremse' für Ruhe und Regeneration sorgt. Ein gesundes Nervensystem kann flexibel zwischen diesen Zuständen wechseln. Unsere Übungen helfen dir dabei, diese Regulation bewusst zu stärken."
        color="bg-violet-50"
      />

      <Section 
        title={t('learn.sympathetic.title')}
        subtitle={t('learn.sympathetic.subtitle')}
        icon={<Zap className="text-amber-500" />}
        content={t('learn.sympathetic.content')}
        color="bg-amber-50"
      />

      <Section 
        title={t('learn.parasympathetic.title')}
        subtitle={t('learn.parasympathetic.subtitle')}
        icon={<Shield className="text-emerald-500" />}
        content={t('learn.parasympathetic.content')}
        color="bg-emerald-50"
      />

      <div className="bg-[var(--color-bg-card)] p-8 rounded-3xl shadow-sm border border-[var(--color-border-main)]">
        <h2 className="text-2xl font-serif text-[var(--color-accent-primary)] mb-6">{t('learn.switch.title')}</h2>
        <div className="space-y-6">
          <Tip 
            title={t('learn.tip.breathing.title')} 
            text={t('learn.tip.breathing.text')} 
          />
          <Tip 
            title={t('learn.tip.movement.title')} 
            text={t('learn.tip.movement.text')} 
          />
          <Tip 
            title={t('learn.tip.safety.title')} 
            text={t('learn.tip.safety.text')} 
          />
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, icon, content, color }: { title: string; subtitle: string; icon: React.ReactNode; content: string; color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex gap-6"
    >
      <div className={`p-4 rounded-2xl h-fit ${color}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 32 })}
      </div>
      <div>
        <h3 className="text-2xl font-serif text-[var(--color-text-main)] mb-1">{title}</h3>
        <p className="text-sm font-medium text-[var(--color-text-muted-light)] uppercase tracking-wider mb-3">{subtitle}</p>
        <p className="text-[var(--color-text-muted)] leading-relaxed">{content}</p>
      </div>
    </motion.div>
  );
}

function Tip({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] mt-2 shrink-0" />
      <div>
        <h4 className="font-medium text-[var(--color-text-main)] mb-1">{title}</h4>
        <p className="text-[var(--color-text-muted)] text-sm">{text}</p>
      </div>
    </div>
  );
}


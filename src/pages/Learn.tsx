import React from 'react';
import { motion } from 'motion/react';
import { Brain, Activity, Zap, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import NewsletterBanner from '../components/NewsletterBanner';

export default function Learn() {
  const { t } = useLanguage();

  return (
    <div className="space-y-10 w-full max-w-4xl lg:max-w-5xl mx-auto">
      <SEO title="Leitfaden – Nervensystem verstehen" description="Verstehe das Nervensystem, Sympathikus, Parasympathikus und den Vagusnerv." />
      <header className="text-center sm:text-left">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">Wissen &amp; Praxis</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-[var(--color-text-main)] mt-1 mb-3">{t('learn.title')}</h1>
        <p className="text-[var(--color-text-muted)] text-base sm:text-lg max-w-2xl leading-relaxed">
          {t('learn.subtitle')}
        </p>
      </header>

      <div className="space-y-6">
        <Section 
          title="Unser Nervensystem"
          subtitle="Wie alles zusammenhängt"
          icon={<Brain className="text-violet-600 dark:text-violet-400" />}
          content="Das Nervensystem steuert alle Funktionen unseres Körpers und reagiert empfindlich auf Stress und Entspannung. Der Sympathikus bereitet uns als 'Gaspedal' auf Aktivität vor (Kampf/Flucht), während der Parasympathikus als 'Bremse' für Ruhe und Regeneration sorgt. Ein gesundes Nervensystem kann flexibel zwischen diesen Zuständen wechseln. Unsere Übungen helfen dir dabei, diese Regulation bewusst zu stärken."
          color="bg-violet-500/15"
        />

        <Section 
          title={t('learn.sympathetic.title')}
          subtitle={t('learn.sympathetic.subtitle')}
          icon={<Zap className="text-amber-600 dark:text-amber-400" />}
          content={t('learn.sympathetic.content')}
          color="bg-amber-500/15"
        />

        <Section 
          title={t('learn.parasympathetic.title')}
          subtitle={t('learn.parasympathetic.subtitle')}
          icon={<Shield className="text-emerald-600 dark:text-emerald-400" />}
          content={t('learn.parasympathetic.content')}
          color="bg-emerald-500/15"
        />
      </div>

      <div className="bg-[var(--color-bg-card)] p-6 sm:p-8 rounded-3xl shadow-sm border border-[var(--color-border-main)]">
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--color-accent-primary)] mb-6">{t('learn.switch.title')}</h2>
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

      {/* FAQ Banner auf der Lernen-Seite */}
      <div className="bg-[var(--color-bg-card)] p-6 sm:p-8 rounded-3xl shadow-sm border border-[var(--color-border-main)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">Häufige Fragen</span>
          <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[var(--color-text-main)] mt-1 mb-2">Fragen zu Meditation, Selbsthypnose &amp; Vagusnerv?</h3>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
            Erfahre die genauen Unterschiede zwischen Meditation, Selbsthypnose und Affirmationen sowie Details zur Aktivierung deines Nervensystems.
          </p>
        </div>
        <Link
          to="/faq"
          className="px-6 py-3 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold text-sm hover:bg-[var(--color-accent-hover)] transition-all shrink-0 cursor-pointer shadow-sm"
        >
          Zum FAQ-Bereich →
        </Link>
      </div>

      <NewsletterBanner variant="in-content" />
    </div>
  );
}

function Section({ title, subtitle, icon, content, color }: { title: string; subtitle: string; icon: React.ReactNode; content: string; color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 sm:p-8 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl shadow-sm flex flex-col sm:flex-row items-start gap-5 sm:gap-6"
    >
      <div className={`p-4 rounded-2xl shrink-0 ${color}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 32 })}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--color-text-main)] mb-1.5">{title}</h3>
        <p className="text-xs sm:text-sm font-bold text-[var(--color-accent-primary)] uppercase tracking-wider mb-3">{subtitle}</p>
        <p className="text-[var(--color-text-muted)] text-sm sm:text-base leading-relaxed">{content}</p>
      </div>
    </motion.div>
  );
}

function Tip({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-primary)] mt-2 shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-base sm:text-lg text-[var(--color-text-main)] mb-1">{title}</h4>
        <p className="text-[var(--color-text-muted)] text-sm sm:text-base leading-relaxed">{text}</p>
      </div>
    </div>
  );
}


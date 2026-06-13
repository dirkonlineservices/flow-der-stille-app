import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Utensils, Coffee, Leaf, Droplets, Flame, Lock, Info, Calendar } from 'lucide-react';
import { allRecipes, weeklyTips } from '../data/recipes';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function Recipes() {
  const { user } = useAuth();
  
  // 1. Die vier Rezepte des Monats für alle auf der Startseite:
  const currentMonthIndex = new Date().getMonth(); 
  // Um immer 4 Rezepte rotierend zu erhalten:
  const monthlyRecipes = useMemo(() => {
    const startIdx = (currentMonthIndex * 4) % allRecipes.length;
    const endIdx = startIdx + 4;
    if (endIdx <= allRecipes.length) {
      return allRecipes.slice(startIdx, endIdx);
    } else {
      return [...allRecipes.slice(startIdx, allRecipes.length), ...allRecipes.slice(0, endIdx - allRecipes.length)];
    }
  }, [currentMonthIndex]);

  // 2. Weekly Tip for User (using task_progress to align with weekly challenge progress)
  const taskProgress = user?.task_progress || { current_task: 0, completions: {} };
  const currentTipIndex = Math.min(taskProgress.current_task, weeklyTips.length - 1);
  const currentTip = weeklyTips[currentTipIndex];

  const getIcon = (type: string) => {
    switch (type) {
      case 'Coffee': return <Coffee className="text-amber-500" />;
      case 'Leaf': return <Leaf className="text-emerald-500" />;
      case 'Utensils': return <Utensils className="text-blue-500" />;
      case 'Droplets': return <Droplets className="text-cyan-500" />;
      case 'Flame': return <Flame className="text-orange-500" />;
      default: return <Utensils className="text-[var(--color-text-muted)]" />;
    }
  };

  return (
    <div className="space-y-12">
      <SEO title="Ernährung" description="Ernährung und Balance für ein entspanntes Nervensystem." />
      <header className="mb-8">
        <h1 className="text-4xl font-serif text-[var(--color-accent-primary)] mb-4">Ernährung & Balance</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Die Gesundheit deines Darms und die Versorgung mit den richtigen Nährstoffen ist ein entscheidender Faktor 
          dafür, wie gestresst oder entspannt dein Nervensystem auf Reize von außen reagiert.
        </p>
      </header>

      {/* Wöchentlicher Impuls (Nur im eingeloggten Bereich) */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Calendar size={20} className="text-[var(--color-accent-primary)]" />
          <h2 className="text-2xl font-serif text-[var(--color-text-main)]">Wöchentlicher Ernährungsimpuls</h2>
        </div>
        
        {user ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-bg-alt)] p-6 md:p-8 rounded-3xl border border-[var(--color-border-main)] shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Leaf size={100} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent-primary)] text-white flex items-center justify-center shrink-0">
                <Info size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif text-[var(--color-text-main)] mb-2">{currentTip.title}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed max-w-3xl">
                  {currentTip.tip}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-[var(--color-bg-card)]/60 backdrop-blur-sm p-8 rounded-3xl border border-[var(--color-border-main)] text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-12 h-12 bg-[var(--color-bg-alt)] rounded-full flex items-center justify-center mb-4">
              <Lock size={20} className="text-[var(--color-accent-primary)]" />
            </div>
            <h3 className="text-[var(--color-text-main)] font-serif text-xl mb-3">Exklusiver Bereich</h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md mb-6 leading-relaxed">
              Melde dich kostenlos an, um deinen persönlichen wöchentlichen Ernährungsimpuls zu erhalten. Die anderen Funktionen kommen dann erst später.
            </p>
            <a href="/register" className="inline-flex items-center justify-center px-6 py-2.5 bg-[var(--color-accent-primary)] text-white text-sm font-medium rounded-full hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm">
              Kostenlos registrieren
            </a>
          </div>
        )}
      </section>

      {/* Monatliche Rezept-Picks */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-accent-primary)] bg-[var(--color-bg-alt)] px-3 py-1 rounded-full border border-[var(--color-border-main)]">
            Rotierend
          </div>
          <h2 className="text-2xl font-serif text-[var(--color-text-main)]">Empfehlungen des Monats</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {monthlyRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              category={recipe.category}
              ingredients={recipe.ingredients}
              description={recipe.desc}
              icon={getIcon(recipe.icon_type)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function RecipeCard({ id, title, category, ingredients, description, icon }: { id: string; title: string; category: string; ingredients: string[]; description: string; icon: React.ReactNode }) {
  return (
    <Link to={`/recipe/${id}`}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-[var(--color-bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--color-border-main)] h-full"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-[var(--color-bg-alt)] rounded-xl">
            {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
          </div>
          <span className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-widest">{category}</span>
        </div>
        <h3 className="text-xl font-serif text-[var(--color-text-main)] mb-2">{title}</h3>
        <p className="text-[var(--color-text-muted)] text-sm mb-4 leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing, i) => (
            <span key={i} className="text-[11px] px-2.5 py-1 bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] rounded-md text-[#4f5651]">
              {ing}
            </span>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
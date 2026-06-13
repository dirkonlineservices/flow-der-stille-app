import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Utensils, Coffee, Leaf, Droplets, Flame } from 'lucide-react';
import { allRecipes } from '../data/recipes';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const recipe = useMemo(() => allRecipes.find(r => r.id === id), [id]);

  if (!recipe) {
    return <div className="p-8">Rezept nicht gefunden.</div>;
  }

  const isLocked = recipe.premium && !user;

  const getIcon = (type: string) => {
    switch (type) {
      case 'Coffee': return <Coffee className="text-amber-500" size={32} />;
      case 'Leaf': return <Leaf className="text-emerald-500" size={32} />;
      case 'Utensils': return <Utensils className="text-blue-500" size={32} />;
      case 'Droplets': return <Droplets className="text-cyan-500" size={32} />;
      case 'Flame': return <Flame className="text-orange-500" size={32} />;
      default: return <Utensils className="text-[var(--color-text-muted)]" size={32} />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <SEO title={recipe.title} description={recipe.desc} />
      <Link to="/recipes" className="inline-flex items-center gap-2 text-sm text-[var(--color-accent-primary)] hover:underline mb-6 font-medium">
        <ArrowLeft size={16} /> Zurück zur Übersicht
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-bg-card)] p-8 md:p-10 rounded-3xl shadow-sm border border-[var(--color-border-main)]"
      >
        <div className="p-4 bg-[var(--color-bg-alt)] rounded-2xl w-fit mb-6">
          {getIcon(recipe.icon_type)}
        </div>
        
        <h1 className="text-3xl font-serif text-[var(--color-text-main)] mb-2">{recipe.title}</h1>
        <p className="text-[var(--color-text-muted)] mb-8 text-lg">{recipe.desc}</p>

        {isLocked ? (
          <div className="bg-[var(--color-bg-alt)] p-8 rounded-2xl border border-[var(--color-border-main)] flex flex-col items-center text-center">
            <Lock size={32} className="text-[var(--color-accent-primary)] mb-4" />
            <h3 className="font-semibold text-lg mb-2 text-[var(--color-text-main)]">Premium-Inhalt</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-sm">
              Dieses Rezept und viele weitere Ernährungstipps sind exklusiv für registrierte Mitglieder verfügbar.
            </p>
            <Link to="/register" className="px-8 py-3 bg-[var(--color-accent-primary)] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[var(--color-accent-hover)] transition-colors">
              Jetzt kostenlos registrieren
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h4 className="font-bold text-[var(--color-text-main)] uppercase tracking-wider text-xs mb-4">Zutaten</h4>
              <ul className="list-disc pl-5 space-y-2 text-[var(--color-text-muted)]">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
            {recipe.instructions && (
              <div>
                <h4 className="font-bold text-[var(--color-text-main)] uppercase tracking-wider text-xs mb-4">Zubereitung</h4>
                <ul className="list-decimal pl-5 space-y-2 text-[var(--color-text-muted)]">
                  {recipe.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

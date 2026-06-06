import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Utensils, Coffee, Leaf } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Recipe {
  id: number;
  translation_key_base: string;
  category_key: string;
  icon_type: string;
}

export default function Recipes() {
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recipes/current')
      .then(res => res.json())
      .then(data => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Coffee': return <Coffee className="text-amber-500" />;
      case 'Leaf': return <Leaf className="text-emerald-500" />;
      case 'Utensils': return <Utensils className="text-blue-500" />;
      default: return <Utensils className="text-stone-500" />;
    }
  };

  const getIngredients = (baseKey: string) => {
      // Helper to get ingredients based on key convention
      // This is a bit hacky but works for the prototype structure
      // Ideally API returns ingredient keys
      const keyMap: Record<string, string[]> = {
          'recipes.card.golden': ['ingredient.turmeric', 'ingredient.ginger', 'ingredient.pepper', 'ingredient.almondmilk', 'ingredient.honey'],
          'recipes.card.salad': ['ingredient.spinach', 'ingredient.pumpkinseeds', 'ingredient.avocado', 'ingredient.quinoa'],
          'recipes.card.omega': ['ingredient.salmon', 'ingredient.walnuts', 'ingredient.chiaseeds', 'ingredient.brownrice'],
          'recipes.card.tea': ['ingredient.chamomile', 'ingredient.lavender', 'ingredient.hotwater'],
          'recipes.card.smoothie': ['ingredient.smoothie.spinach', 'ingredient.smoothie.banana', 'ingredient.smoothie.avocado'],
          'recipes.card.soup': ['ingredient.soup.bones', 'ingredient.soup.carrots', 'ingredient.soup.celery'],
          'recipes.card.oats': ['ingredient.oats.oats', 'ingredient.oats.milk', 'ingredient.oats.berries'],
          'recipes.card.water': ['ingredient.water.lemon', 'ingredient.water.cucumber', 'ingredient.water.mint'],
      };
      return keyMap[baseKey] || [];
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Loading recipes...</div>;

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-serif text-[var(--color-accent-olive)] mb-4">{t('recipes.title')}</h1>
        <p className="text-stone-500">
          {t('recipes.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard 
            key={recipe.id}
            title={t(`${recipe.translation_key_base}.title`)}
            category={t(recipe.category_key)}
            ingredients={getIngredients(recipe.translation_key_base).map(k => t(k))}
            description={t(`${recipe.translation_key_base}.desc`)}
            icon={getIcon(recipe.icon_type)}
          />
        ))}
      </div>
    </div>
  );
}

function RecipeCard({ title, category, ingredients, description, icon }: { title: string; category: string; ingredients: string[]; description: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-stone-50 rounded-xl">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
        </div>
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">{category}</span>
      </div>
      <h3 className="text-xl font-serif text-stone-800 mb-2">{title}</h3>
      <p className="text-stone-500 text-sm mb-4">{description}</p>
      
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ing, i) => (
          <span key={i} className="text-xs px-2 py-1 bg-[var(--color-bg-warm)] rounded-md text-stone-600">
            {ing}
          </span>
        ))}
      </div>
    </motion.div>
  );
}


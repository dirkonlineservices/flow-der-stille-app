import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import { PRODUCTS } from '../data/store';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function Shop() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const purchasedProducts = user?.purchased_products || [];

  return (
    <div className="space-y-12 pb-12">
      <SEO title="Shop" description="Premium Meditationen und Kurse für dein Wohlbefinden." />
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-accent-primary)] mb-4 flex items-center gap-3">
          <ShoppingBag className="w-10 h-10 text-[var(--color-accent-primary)]" />
          Premium Shop
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg max-w-2xl leading-relaxed">
          Vertiefe deine Praxis mit unseren exklusiven Masterclasses und Premium-Meditationen. Dauerhafter Zugriff nach dem Kauf.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-serif text-[var(--color-text-main)] mb-6 flex items-center gap-2">
          <Star className="text-amber-400" /> Kurse & Masterclass
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.filter(p => p.category === 'course' || p.category === 'masterclass').map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isPurchased={purchasedProducts.includes(product.id)}
              onAddToCart={() => addToCart(product)} 
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-serif text-[var(--color-text-main)] mb-6 flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" /> Geführte Meditationen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.filter(p => p.category === 'meditation').map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isPurchased={purchasedProducts.includes(product.id)}
              onAddToCart={() => addToCart(product)} 
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, isPurchased, onAddToCart }: { product: any, isPurchased: boolean, onAddToCart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 rounded-3xl border ${isPurchased ? 'bg-[var(--color-bg-border)] border-[var(--color-border-main)]' : 'bg-[var(--color-bg-card)] border-[var(--color-border-main)] shadow-sm'} flex flex-col h-full hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-bg-alt)] px-3 py-1 rounded-full border border-[var(--color-border-main)]">
          {product.category === 'meditation' ? 'Meditation' : 'Premium Kurs'}
        </span>
        <span className="text-lg font-serif text-[var(--color-text-main)] font-semibold">{product.price}</span>
      </div>

      <h3 className="text-xl font-serif text-[var(--color-text-main)] mb-2">{product.title}</h3>
      <p className="text-[var(--color-text-muted-light)] text-xs mb-4">{product.duration}</p>
      <p className="text-[var(--color-text-muted)] text-sm mb-6 flex-1">{product.description}</p>
      
      {isPurchased ? (
         <button disabled className="w-full py-3 bg-[var(--color-bg-alt)] text-[var(--color-text-muted)] font-medium rounded-xl border border-[var(--color-border-main)] cursor-not-allowed">
           Bereits gekauft
         </button>
      ) : (
        <button 
          onClick={onAddToCart}
          className="w-full py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium rounded-xl transition-all shadow-sm active:scale-95"
        >
          In den Warenkorb
        </button>
      )}
    </motion.div>
  );
}

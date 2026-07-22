import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/store';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function Shop() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const purchasedProducts = user?.purchased_products || [];

  return (
    <div className="space-y-12 pb-12 bg-[#f5f5f0] min-h-screen">
      <SEO title="Shop" description="Premium Meditationen und Kurse für dein Wohlbefinden." />
      
      <header className="mb-12 pt-8">
        <h1 className="text-4xl md:text-5xl font-serif text-[#8A9A8A] mb-4 flex items-center gap-3">
          <ShoppingBag className="w-10 h-10 text-[#8A9A8A]" />
          Premium Shop
        </h1>
        <p className="text-[#695C4D] text-lg max-w-2xl leading-relaxed">
          Vertiefe deine Praxis mit unseren exklusiven Masterclasses und Premium Meditationen. Dauerhafter Zugriff nach dem Kauf.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-serif text-[#3D3B35] mb-6 flex items-center gap-2">
          <Star className="text-amber-400" /> Kurse & Masterclass
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.filter(p => p.category === 'course' || p.category === 'masterclass').map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              user={user}
              isPurchased={purchasedProducts.includes(product.id)}
              onAddToCart={() => addToCart(product)} 
              navigate={navigate}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-serif text-[#3D3B35] mb-6 flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" /> Geführte Meditationen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.filter(p => p.category === 'meditation').map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              user={user}
              isPurchased={purchasedProducts.includes(product.id)}
              onAddToCart={() => addToCart(product)} 
              navigate={navigate}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, user, isPurchased, onAddToCart, navigate }: { product: any, user: any, isPurchased: boolean, onAddToCart: () => void, navigate: any }) {
  
  const handleAddToCart = () => {
    try {
      if (typeof window !== 'undefined') {
        const dataLayer = (window as any).dataLayer || [];
        dataLayer.push({ 
          event: 'add_to_cart', 
          item_name: product.title, 
          value: product.price,
          category: product.category
        });
      }
      
      onAddToCart();
      navigate('/checkout');

    } catch (error) {
      console.error("Fehler im Warenkorb Ablauf:", error);
      navigate('/checkout');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 rounded-3xl border flex flex-col h-full transition-shadow ${
        isPurchased 
          ? 'bg-[#F7F6F2] border-[#E3E1D9]' 
          : 'bg-[#FFFFFF] border-[#E3E1D9] shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#695C4D] bg-[#f5f5f0] px-3 py-1 rounded-full border border-[#E3E1D9]">
          {product.category === 'meditation' ? 'Meditation' : 'Premium Kurs'}
        </span>
        <span className="text-lg font-serif text-[#3D3B35] font-semibold">{product.price}</span>
      </div>

      <h3 className="text-xl font-serif text-[#3D3B35] mb-2">{product.title}</h3>
      <p className="text-[#695C4D] text-xs mb-4 opacity-70">{product.duration}</p>
      <p className="text-[#695C4D] text-sm mb-6 flex-1">{product.description}</p>
      
      {!user ? (
        <Link 
          to="/login"
          style={{ backgroundColor: '#F7F6F2', color: '#3D3B35', borderColor: '#E3E1D9' }}
          className="w-full py-3 flex justify-center items-center text-sm font-medium rounded-xl border transition-colors"
        >
          Bitte einloggen oder registrieren
        </Link>
      ) : isPurchased ? (
         <button 
           type="button"
           disabled 
           style={{ backgroundColor: '#F7F6F2', color: '#695C4D', borderColor: '#E3E1D9', opacity: 0.7 }}
           className="w-full py-3 text-sm font-medium rounded-xl border cursor-not-allowed"
         >
           Bereits gekauft
         </button>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          style={{ backgroundColor: '#8A9A8A', color: '#FFFFFF', border: 'none' }}
          className="w-full py-3 text-sm font-medium rounded-xl shadow-sm active:scale-95"
        >
          Jetzt kaufen
        </button>
      )}
    </motion.div>
  );
}
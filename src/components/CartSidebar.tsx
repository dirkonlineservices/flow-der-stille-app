import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

export default function CartSidebar() {
  const { isCartOpen, setCartOpen, items, removeFromCart, totalPrice, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!user) return;
    if (items.length === 0) return;
    setIsCheckingOut(true);

    try {
      // Simulate real checkout
      const newProductIds = items.map(i => i.product.id);
      
      const currentPurchased = user.purchased_products || [];
      // Prevent duplicates
      const uniqueNew = newProductIds.filter(id => !currentPurchased.includes(id));
      
      if (uniqueNew.length > 0) {
        const updatedProducts = [...currentPurchased, ...uniqueNew];
        await supabase.auth.updateUser({
          data: {
            purchased_products: updatedProducts
          }
        });
        await refreshUser();
      }

      setSuccess(true);
      setTimeout(() => {
        clearCart();
        setCartOpen(false);
        setSuccess(false);
        setIsCheckingOut(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-[var(--color-bg-card)] shadow-2xl z-[101] border-l border-[var(--color-border-main)] flex flex-col"
          >
            <div className="p-6 border-b border-[var(--color-border-main)] flex items-center justify-between">
              <h2 className="text-xl font-serif flex items-center gap-2 text-[var(--color-text-main)]">
                <ShoppingBag size={20} /> Warenkorb
              </h2>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-[var(--color-bg-alt)] rounded-full transition-colors text-[var(--color-text-muted)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="text-2xl font-serif text-[var(--color-text-main)] mb-2">Vielen Dank!</h3>
                  <p className="text-[var(--color-text-muted)] text-sm">
                    Dein Kauf war erfolgreich. Die Inhalte stehen dir nun zur Verfügung.
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <ShoppingBag size={48} className="mb-4 text-[var(--color-text-muted)]" />
                  <p className="text-[var(--color-text-main)]">Dein Warenkorb ist leer.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 bg-[var(--color-bg-alt)] p-4 rounded-2xl border border-[var(--color-border-main)]">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-[var(--color-text-main)] truncate text-sm">{item.product.title}</h4>
                        <div className="text-xs text-[var(--color-text-muted-light)] mt-1">{item.product.price}</div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!success && items.length > 0 && (
              <div className="p-6 border-t border-[var(--color-border-main)] bg-[var(--color-bg-alt)]">
                <div className="flex items-center justify-between font-serif text-lg text-[var(--color-text-main)] mb-6">
                  <span>Gesamtsumme</span>
                  <span>{totalPrice.toFixed(2).replace('.', ',')} €</span>
                </div>
                {user ? (
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-4 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white rounded-full font-medium transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCheckingOut ? 'Wird verarbeitet...' : (
                      <>
                        <CreditCard size={18} /> Zahlung abschließen
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">Bitte melde dich an, um mit dem Kauf fortzufahren.</p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="w-full py-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-full text-sm font-medium transition-colors hover:bg-[var(--color-bg-border)]"
                    >
                      Zurück
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

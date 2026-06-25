import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';

export default function CartSidebar() {
  const { isCartOpen, setCartOpen, items, removeFromCart, totalPrice, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  const [billing, setBilling] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    zip: '',
    city: '',
    phone: ''
  });

  React.useEffect(() => {
    if (user && !billing.email) {
      setBilling(b => ({
        ...b,
        email: user.email || '',
        firstName: user.first_name || '',
        lastName: user.last_name || ''
      }));
    }
  }, [user]);

  const handleClose = () => {
    setCartOpen(false);
    setTimeout(() => setCheckoutStep('cart'), 300);
  };

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        const supabase = getSupabase();
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
        handleClose();
        setSuccess(false);
        setIsCheckingOut(false);
        setCheckoutStep('cart');
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-[var(--color-bg-card)] shadow-2xl z-[101] border-l border-[var(--color-border-main)] flex flex-col"
          >
            <div className="p-6 border-b border-[var(--color-border-main)] flex items-center justify-between shrink-0">
              <h2 className="text-xl font-serif flex items-center gap-2 text-[var(--color-text-main)]">
                <ShoppingBag size={20} /> Checkout
              </h2>
              <button 
                onClick={handleClose}
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
              ) : checkoutStep === 'cart' ? (
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
              ) : (
                <form id="checkoutForm" onSubmit={handleCheckout} className="space-y-4">
                  <h3 className="font-serif text-lg text-[var(--color-text-main)] mb-2">Rechnungsdetails</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Vorname *</label>
                      <input required type="text" value={billing.firstName} onChange={e => setBilling({...billing, firstName: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-alt)] rounded-lg text-sm border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Nachname *</label>
                      <input required type="text" value={billing.lastName} onChange={e => setBilling({...billing, lastName: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-alt)] rounded-lg text-sm border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">E-Mail-Adresse *</label>
                    <input required type="email" value={billing.email} onChange={e => setBilling({...billing, email: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-alt)] rounded-lg text-sm border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Straße & Hausnummer *</label>
                    <input required type="text" value={billing.address} onChange={e => setBilling({...billing, address: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-alt)] rounded-lg text-sm border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">PLZ *</label>
                      <input required type="text" value={billing.zip} onChange={e => setBilling({...billing, zip: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-alt)] rounded-lg text-sm border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Ort *</label>
                      <input required type="text" value={billing.city} onChange={e => setBilling({...billing, city: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-alt)] rounded-lg text-sm border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Telefonnummer *</label>
                    <input required type="tel" value={billing.phone} onChange={e => setBilling({...billing, phone: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg-alt)] rounded-lg text-sm border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none" />
                  </div>
                  
                  <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                     <p className="text-xs text-emerald-800 leading-relaxed">
                        Wir benötigen Ihre vollständigen Daten zur korrekten Rechnungserstellung und Bereitstellung der digitalen Inhalte gemäß gesetzlicher Vorgaben.
                     </p>
                  </div>
                </form>
              )}
            </div>

            {!success && items.length > 0 && (
              <div className="p-6 border-t border-[var(--color-border-main)] bg-[var(--color-bg-alt)] shrink-0">
                <div className="flex items-center justify-between font-serif text-lg text-[var(--color-text-main)] mb-6">
                  <span>Gesamtsumme</span>
                  <span>{totalPrice.toFixed(2).replace('.', ',')} €</span>
                </div>
                {user ? (
                  checkoutStep === 'cart' ? (
                    <button
                      onClick={() => setCheckoutStep('details')}
                      className="w-full py-4 bg-[var(--color-text-main)] hover:bg-black text-[var(--color-bg-main)] rounded-full font-medium transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                      Weiter zur Kasse
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCheckoutStep('cart')}
                        className="py-4 px-6 bg-[var(--color-bg-border)] hover:bg-stone-300 text-[var(--color-text-main)] rounded-full font-medium transition-all"
                      >
                        Zurück
                      </button>
                      <button
                        type="submit"
                        form="checkoutForm"
                        disabled={isCheckingOut}
                        className="flex-1 py-4 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white rounded-full font-medium transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isCheckingOut ? 'Wird verarbeitet...' : (
                          <>
                            <CreditCard size={18} /> Kaufen
                          </>
                        )}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">Bitte melde dich an, um mit dem Kauf fortzufahren.</p>
                    <button
                      onClick={handleClose}
                      className="w-full py-3 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] text-[var(--color-text-main)] rounded-full text-sm font-medium transition-colors hover:bg-[var(--color-bg-border)]"
                    >
                      Schließen
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

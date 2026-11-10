import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShoppingBag, X } from 'lucide-react';

interface NoAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  produktId?: string;
  titel?: string;
}

/**
 * Wird gezeigt, wenn der Audio-Worker mit 403 antwortet:
 * Der Nutzer ist eingeloggt, hat dieses Produkt aber noch nicht freigeschaltet.
 */
export default function NoAccessModal({ isOpen, onClose, produktId, titel }: NoAccessModalProps) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const target = produktId ? `/ruhe-shop#product-${produktId}` : '/ruhe-shop';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="no-access-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-600 hover:text-stone-950 transition-colors p-1 rounded-lg"
          aria-label="Schließen"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-full mb-5 mx-auto text-emerald-900 border border-emerald-100">
          <Lock size={26} />
        </div>

        <h3 id="no-access-title" className="text-xl font-bold text-center mb-2 font-serif text-stone-950">
          Noch nicht freigeschaltet
        </h3>

        <p className="text-sm text-stone-700 text-center mb-6 leading-relaxed">
          {titel ? <><strong className="text-stone-950">{titel}</strong> ist in deiner Mediathek noch nicht freigeschaltet. </> : 'Dieses Audio ist in deiner Mediathek noch nicht freigeschaltet. '}
          Wenn du magst, kannst du es im Ruhe-Shop einmalig und ohne Abo erwerben.
        </p>

        <button
          onClick={() => {
            onClose();
            navigate(target);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#344034] text-white font-semibold shadow-md hover:bg-[#2a342a] transition-all"
        >
          <ShoppingBag size={18} />
          <span>Zum Ruhe-Shop</span>
        </button>
      </div>
    </div>
  );
}

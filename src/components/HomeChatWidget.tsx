import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Lock, Star, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/store';

export default function HomeChatWidget({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hallo! Wie kann ich dir heute helfen?' }
  ]);
  const [input, setInput] = useState('');
  
  // Track daily usage
  const today = new Date().toISOString().split('T')[0];
  const usageKey = `chat_usage_${user?.id}_${today}`;
  const [dailyUsageCount, setDailyUsageCount] = useState(() => {
    const saved = localStorage.getItem(usageKey);
    return saved ? parseInt(saved, 10) : 0;
  });
  
  // Premium check
  const isPremium = user?.purchased_products?.includes('premium_chat') || false;
  
  // Limit to 3 user messages per day if not premium
  const reachedLimit = !isPremium && dailyUsageCount >= 3;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (reachedLimit) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    
    if (!isPremium) {
      const newCount = dailyUsageCount + 1;
      setDailyUsageCount(newCount);
      localStorage.setItem(usageKey, newCount.toString());
    }

    // Simulate standard response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ich verstehe. Bitte atme tief durch. (Dies ist eine simulierte Antwort).' }]);
    }, 1000);
  };

  const handleUpgrade = () => {
    const feature = PRODUCTS.find(p => p.id === 'premium_chat');
    if (feature) addToCart(feature);
  };

  if (!user) {
    return (
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-8 text-center shadow-sm relative overflow-hidden h-full flex flex-col justify-center">
        {onClose && <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-text-muted)]">×</button>}
        <MessageSquare className="w-12 h-12 text-[var(--color-text-muted-light)] mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-serif text-[var(--color-text-main)] mb-2">Empathische KI-Begleitung</h3>
        <p className="text-[var(--color-text-muted)] text-sm mb-6 max-w-sm mx-auto">
          Melde dich an, um mit unserer Empathischen KI-Begleitung zu sprechen.
        </p>
        <Lock className="w-8 h-8 text-[var(--color-text-muted-light)] absolute top-4 right-4 opacity-20" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="bg-[var(--color-bg-alt)] border-b border-[var(--color-border-main)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-[var(--color-accent-primary)]" />
          <h3 className="font-serif text-[var(--color-text-main)] text-lg">Empathische KI-Begleitung</h3>
        </div>
        <div className="flex items-center gap-2">
          {!isPremium && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)] bg-stone-200/50 px-2.5 py-1 rounded-full border border-stone-200">
              {Math.max(0, 3 - dailyUsageCount)} Freie Nachrichten heute
            </span>
          )}
          {onClose && <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">×</button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm break-words ${
              m.role === 'user' 
                ? 'bg-[var(--color-accent-primary)] text-white rounded-br-sm' 
                : 'bg-[var(--color-bg-alt)] text-[var(--color-text-main)] border border-[var(--color-border-main)] rounded-tl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {reachedLimit && (
          <div className="bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] rounded-2xl p-5 text-center mt-4">
            <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="font-serif text-[var(--color-text-main)] mb-1">Tägliches Limit erreicht</h4>
            <p className="text-[var(--color-text-muted)] text-xs mb-4">
              Um weiterhin unbegrenzt mit dem Assistenten zu chatten, wird die Premium-Funktion benötigt.
            </p>
            <button 
              onClick={handleUpgrade}
              className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white font-medium text-xs px-6 py-3 rounded-full transition-colors w-full flex items-center justify-center gap-2"
            >
              <Star size={14} /> Premium freischalten
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-[var(--color-bg-alt)] border-t border-[var(--color-border-main)]">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={reachedLimit || (!isPremium && dailyUsageCount >= 3)}
            placeholder={reachedLimit ? "Zuerst Premium freischalten..." : "Schreibe eine Nachricht..."}
            className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-[var(--color-accent-primary)] disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || reachedLimit}
            className="absolute right-2 top-1.5 p-2 bg-[var(--color-accent-primary)] text-white rounded-full hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabase';

const FREE_MESSAGE_LIMIT = 3;

export default function Chat() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Echte Zustände aus der Datenbank
  const [isPremium, setIsPremium] = useState(false); 
  const [messageCount, setMessageCount] = useState(0);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- NEU: Profil-Daten beim Start aus Supabase laden ---
  useEffect(() => {
    async function loadUserProfile() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium, message_count')
        .eq('id', user.id)
        .single();

      if (data) {
        setIsPremium(data.is_premium);
        setMessageCount(data.message_count);
      } else if (error) {
        console.error("Fehler beim Laden des Profils:", error);
      }
      setIsProfileLoaded(true);
    }

    loadUserProfile();
  }, [user]);
  // -------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    // --- NEU: Zähler sofort in der Datenbank hochsetzen ---
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    
    await supabase
      .from('profiles')
      .update({ message_count: newCount })
      .eq('id', user.id);
    // ------------------------------------------------------

    const userMsg = message;
    setMessage('');
    
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsg,
          history: history,
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned error status');
      }

      const data = await response.json();
      const reply = data.reply || 'Entschuldige, ich konnte keine Antwort verarbeiten.';

      setHistory(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err) {
      console.error("Agent Error:", err);
      setHistory(prev => [...prev, { 
        role: 'bot', 
        text: 'Entschuldige, ich brauche gerade einen kurzen Moment der Ruhe. Bitte versuche es gleich noch einmal.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-stone-500 mb-4">{t('challenge.login')}</p>
      </div>
    );
  }

  // Warten, bis die Profildaten da sind, um Flackern zu vermeiden
  if (!isProfileLoaded) {
    return <div className="flex justify-center items-center h-64">Lade...</div>;
  }

  const canSendMessage = isPremium || messageCount < FREE_MESSAGE_LIMIT;

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-serif text-[var(--color-accent-olive)] mb-2">{t('chat.title')}</h1>
        <p className="text-stone-500 text-sm">{t('chat.subtitle')}</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white rounded-3xl shadow-sm border border-stone-100">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-stone-300">
            <Bot size={48} className="mb-2 text-[var(--color-accent-olive)]" />
            <p>{t('chat.placeholder')}</p>
          </div>
        )}
        {history.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-stone-200' : 'bg-[var(--color-accent-olive)] text-white'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'bg-stone-100 text-stone-800' : 'bg-[var(--color-bg-warm)] text-stone-800 border border-stone-100'}`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-olive)] text-white flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-2xl bg-[var(--color-bg-warm)] border border-stone-250 flex items-center gap-1">
              <div className="w-2 h-2 bg-[var(--color-accent-olive)] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[var(--color-accent-olive)] rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-[var(--color-accent-olive)] rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs text-stone-400 px-2">
        <AlertCircle size={12} />
        <span>{t('chat.disclaimer')}</span>
      </div>

      {/* --- NEU: Conditional Rendering für Eingabefeld vs. Paywall --- */}
      {canSendMessage ? (
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('chat.placeholder')}
            className="w-full p-4 pr-12 bg-white rounded-2xl shadow-sm border border-stone-200 focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none"
          />
          <button 
            type="submit" 
            disabled={loading || !message.trim()}
            className="absolute right-2 top-2 p-2 bg-[var(--color-accent-olive)] text-white rounded-xl hover:bg-[var(--color-accent-olive-hover)] disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-bg-warm)] border border-stone-200 p-6 rounded-2xl text-center shadow-sm"
        >
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-accent-olive)]/10 text-[var(--color-accent-olive)] flex items-center justify-center">
              <Lock size={24} />
            </div>
          </div>
          <h3 className="text-lg font-serif text-[var(--color-accent-olive)] mb-2">
            Dein Freikontingent ist erreicht
          </h3>
          <p className="text-sm text-stone-600 mb-5">
            Um diesen und alle weiteren tiefgehenden Dialoge mit deinem persönlichen Begleiter fortzusetzen, schalte jetzt Premium frei.
          </p>
          <button className="w-full sm:w-auto px-6 py-3 bg-[var(--color-accent-olive)] text-white rounded-xl text-sm font-medium hover:bg-opacity-90 transition-all">
            Premium entdecken
          </button>
        </motion.div>
      )}
    </div>
  );
}

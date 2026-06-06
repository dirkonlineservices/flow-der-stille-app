import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, User, Bot, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Chat() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message;
    setMessage('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setHistory(prev => [...prev, { role: 'bot', text: data.reply || 'Error' }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'bot', text: 'Failed to send message.' }]);
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

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-serif text-[var(--color-accent-olive)] mb-2">{t('chat.title')}</h1>
        <p className="text-stone-500 text-sm">{t('chat.subtitle')}</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white rounded-3xl shadow-sm border border-stone-100">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-stone-300">
            <Bot size={48} className="mb-2" />
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
            <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-stone-100 text-stone-800' : 'bg-[var(--color-bg-warm)] text-stone-800 border border-stone-200'}`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-olive)] text-white flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3 rounded-2xl bg-[var(--color-bg-warm)] border border-stone-200 flex items-center gap-1">
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs text-stone-400 px-2">
        <AlertCircle size={12} />
        <span>{t('chat.disclaimer')}</span>
      </div>

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
    </div>
  );
}

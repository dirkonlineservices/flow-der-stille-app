import React, { useState } from 'react';
import { Send, User, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Contact() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [dsgvo, setDsgvo] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Kontaktanfragen können optional lokal oder per Supabase gespeichert werden.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 1. Das separate Event an den Tag Manager senden
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        'event': 'form_submit_flow_stille'
      });

      // 2. Den Nutzer auf die EIGENE Dankeseite weiterleiten
      navigate('/danke');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <SEO title="Kontakt" description="Schreibe uns eine Nachricht." />
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-serif text-[var(--color-accent-primary)] mb-2">Kontakt</h1>
        <p className="text-[var(--color-text-muted)]">Schreibe uns eine Nachricht. Wir melden uns bei dir.</p>
      </header>

      <div className="bg-[var(--color-bg-card)] p-8 rounded-3xl shadow-sm border border-[var(--color-border-main)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-2">
                  <User size={16} /> Voller Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Max Mustermann"
                  className="w-full p-4 bg-[var(--color-bg-alt)] rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-2">
                  <Mail size={16} /> E-Mail Adresse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@beispiel.de"
                  className="w-full p-4 bg-[var(--color-bg-alt)] rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 flex items-center gap-2">
                <MessageSquare size={16} /> Deine Nachricht
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Wie können wir dir helfen?"
                rows={5}
                className="w-full p-4 bg-[var(--color-bg-alt)] rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none transition-all resize-none"
                required
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-stone-300 text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                />
                <span className="text-sm text-[var(--color-text-muted)] leading-tight">
                  Ja, ich möchte mich für den Newsletter anmelden und regelmäßig Tipps rund um Achtsamkeit erhalten. (Freiwillig)
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dsgvo}
                  onChange={(e) => setDsgvo(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-stone-300 text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                  required
                />
                <span className="text-sm text-[var(--color-text-muted)] leading-tight">
                  Ich habe die <Link to="/datenschutz" className="text-[var(--color-accent-primary)] hover:underline">Datenschutzerklärung</Link> zur Kenntnis genommen. Ich stimme zu, dass meine Angaben und Daten zur Beantwortung meiner Anfrage elektronisch erhoben und gespeichert werden. *
                </span>
              </label>
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm text-center">Es gab ein Problem. Bitte versuche es noch einmal.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !dsgvo}
              className="w-full py-4 bg-[var(--color-accent-primary)] text-white rounded-2xl font-medium hover:bg-[var(--color-accent-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                'Wird gesendet...'
              ) : (
                <>
                  <Send size={18} /> Nachricht abschicken
                </>
              )}
            </button>
          </form>
      </div>
    </div>
  );
}

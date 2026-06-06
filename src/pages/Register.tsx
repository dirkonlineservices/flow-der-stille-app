import React, { useState } from 'react';
import { Send, User, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom'; // Wichtig für den Link zum Datenschutz

export default function Contact() {
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
      // 💡 Hier verknüpfen wir später die Supabase-Datenbank.
      // Die Werte für 'newsletter' (true/false) und 'dsgvo' (true) 
      // werden dann einfach mitgespeichert.
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setNewsletter(false);
      setDsgvo(false);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-serif text-[var(--color-accent-olive)] mb-2">Kontakt</h1>
        <p className="text-stone-500">Schreibe uns eine Nachricht. Wir melden uns bei dir.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="text-emerald-500 w-16 h-16 mb-4" />
            <h3 className="text-xl font-serif text-stone-800 mb-2">Nachricht gesendet!</h3>
            <p className="text-stone-500 mb-6">Vielen Dank für deine Nachricht. Wir melden uns in Kürze bei dir.</p>
            <button
              onClick={() => setStatus('idle')}
              className="px-6 py-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors"
            >
              Neue Nachricht schreiben
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2 flex items-center gap-2">
                  <User size={16} /> Voller Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Max Mustermann"
                  className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2 flex items-center gap-2">
                  <Mail size={16} /> E-Mail Adresse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@beispiel.de"
                  className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2 flex items-center gap-2">
                <MessageSquare size={16} /> Deine Nachricht
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Wie können wir dir helfen?"
                rows={5}
                className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none transition-all resize-none"
                required
              />
            </div>

            {/* NEU: Newsletter & DSGVO Checkboxen */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-stone-300 text-[var(--color-accent-olive)] focus:ring-[var(--color-accent-olive)]"
                />
                <span className="text-sm text-stone-600 leading-tight">
                  Ja, ich möchte mich für den Newsletter anmelden und regelmäßig Tipps rund um Achtsamkeit erhalten. (Freiwillig)
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dsgvo}
                  onChange={(e) => setDsgvo(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-stone-300 text-[var(--color-accent-olive)] focus:ring-[var(--color-accent-olive)]"
                  required
                />
                <span className="text-sm text-stone-600 leading-tight">
                  Ich habe die <Link to="/datenschutz" className="text-[var(--color-accent-olive)] hover:underline">Datenschutzerklärung</Link> zur Kenntnis genommen. Ich stimme zu, dass meine Angaben und Daten zur Beantwortung meiner Anfrage elektronisch erhoben und gespeichert werden. *
                </span>
              </label>
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm text-center">Es gab ein Problem. Bitte versuche es noch einmal.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-[var(--color-accent-olive)] text-white rounded-2xl font-medium hover:bg-[var(--color-accent-olive-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
        )}
      </div>
    </div>
  );
}
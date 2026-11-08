import React, { useState, useEffect } from 'react';
import {
  Mail, CheckCircle2, AlertCircle, Loader2, Bell, Sparkles, ShieldCheck
} from 'lucide-react';
import { subscribeToNewsletter } from '../lib/newsletterService';
import { useAuth } from '../context/AuthContext';

interface AdventEmailReminderProps {
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
}

export const AdventEmailReminder: React.FC<AdventEmailReminderProps> = ({
  variant = 'card',
  className = ''
}) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setStatus({
        type: 'error',
        message: 'Bitte gib eine gültige E-Mail-Adresse ein.'
      });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await subscribeToNewsletter({
        email: cleanEmail,
        userId: user?.id,
        source: 'adventskalender_daily_reminder_2026'
      });

      if (res.success) {
        setStatus({
          type: 'success',
          message:
            res.message ||
            'Fast geschafft! Bitte sieh kurz in dein Postfach – wir haben dir einen Bestätigungslink geschickt, damit du ab 1. Dezember jeden Morgen das neue Türchen pünktlich erhältst.'
        });
      } else {
        setStatus({
          type: 'error',
          message:
            res.message || 'Anmeldung konnte leider nicht abgeschlossen werden. Bitte versuche es erneut.'
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Verbindungsfehler beim Eintragen. Bitte prüfe deine Internetverbindung.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-3xl border border-[#7C8B6F]/30 bg-gradient-to-br from-[#232B22]/90 via-[#2F3A2B]/85 to-[#1D241B]/95 text-stone-100 p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Sanfter warmer Lichtschimmer */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C8A96E]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#7C8B6F]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C8A96E]/20 border border-[#C8A96E]/40 text-[#EBD3A2] text-xs font-bold uppercase tracking-widest">
          <Bell className="w-3.5 h-3.5" />
          <span>Tägliche Advents-Begleitung</span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
          Tägliche Erinnerung für das neue Türchen erhalten
        </h3>

        <p className="text-xs sm:text-sm md:text-base text-stone-200/90 leading-relaxed max-w-xl mx-auto">
          Lass dich jeden Morgen im Dezember mit einem achtsamen Impuls zur Entschleunigung
          wecken. Erfahre als Erste/r von den Sonntags-Meditationen und nimm an den drei
          Rauhnacht-Hörbuch Verlosungen teil.
        </p>

        {status?.type === 'success' ? (
          <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-100 text-sm leading-relaxed text-left flex items-start gap-3 mt-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white mb-1">Vielen Dank für dein Vertrauen!</div>
              <div>{status.message}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Deine E-Mail-Adresse..."
                  required
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#C8A96E] hover:bg-[#B89758] disabled:opacity-60 text-stone-950 font-bold text-sm transition-all shadow-md shrink-0 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Wird eingetragen...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Kostenfrei vormerken</span>
                  </>
                )}
              </button>
            </div>

            {status?.type === 'error' && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-400/40 text-red-200 text-xs flex items-center justify-center gap-2 max-w-xl mx-auto text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
                <span>{status.message}</span>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-stone-300">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96E]" />
                100 % werbefrei &amp; DSGVO-konform
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96E]" />
                Double-Opt-In Bestätigung
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96E]" />
                Jederzeit mit einem Klick abmeldbar
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdventEmailReminder;

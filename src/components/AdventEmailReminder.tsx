import React, { useState, useEffect } from 'react';
import {
  Mail, CheckCircle2, AlertCircle, Loader2, Bell, Sparkles, ShieldCheck
} from 'lucide-react';
import { subscribeToNewsletter } from '../lib/newsletterService';
import { useAuth } from '../context/AuthContext';

interface AdventEmailReminderProps {
  className?: string;
}

export const AdventEmailReminder: React.FC<AdventEmailReminderProps> = ({
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
      className={`rounded-3xl border border-[#7C8B6F]/40 bg-gradient-to-br from-[#8A9A8A]/20 via-[#F5F5F0] to-[#8A9A8A]/15 text-[#3D3B35] p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden ${className}`}
    >
      {/* Sanfter warmer Lichtschimmer im CI */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#8A9A8A]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#C8A96E]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A9A8A]/20 border border-[#8A9A8A]/40 text-[#4A563E] text-xs font-bold uppercase tracking-widest">
          <Bell className="w-3.5 h-3.5" />
          <span>Tägliche Advents-Begleitung</span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3D3B35] leading-tight">
          Tägliche Erinnerung für das neue Türchen erhalten
        </h3>

        <p className="text-xs sm:text-sm md:text-base text-[#695C4D] leading-relaxed max-w-xl mx-auto">
          Lass dich jeden Morgen im Dezember mit einem achtsamen Impuls zur Entschleunigung
          wecken. Erfahre als Erste/r von den Sonntags-Meditationen und nimm an den drei
          Rauhnacht-Hörbuch Verlosungen teil.
        </p>

        {status?.type === 'success' ? (
          <div className="p-5 rounded-2xl bg-white border border-[#8A9A8A] text-[#3D3B35] text-sm leading-relaxed text-left flex items-start gap-3 mt-6 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-[#8A9A8A] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#3D3B35] mb-1">Vielen Dank für dein Vertrauen!</div>
              <div className="text-[#695C4D]">{status.message}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-[#8A9A8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Deine E-Mail-Adresse..."
                  required
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-[#E3E1D9] text-sm text-[#3D3B35] placeholder:text-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#8A9A8A] focus:border-transparent transition-all shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#8A9A8A] hover:bg-[#728372] disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md shrink-0 cursor-pointer"
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
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center gap-2 max-w-xl mx-auto text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{status.message}</span>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-[#695C4D]">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8A9A8A]" />
                100 % werbefrei und DSGVO-konform
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8A9A8A]" />
                Double-Opt-In Bestätigung
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8A9A8A]" />
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

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Leaf, ArrowLeft, CheckCircle2, Headphones, Mail, Key, Sparkles, RefreshCw, Send, BookOpen } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { getSupabase } from '../lib/supabaseClient';

export default function Danke() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const productId = searchParams.get('product_id');
  const magicStatus = searchParams.get('magic');

  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    // DataLayer Push
    (window as any).dataLayer = (window as any).dataLayer || [];
    if (orderId) {
      (window as any).dataLayer.push({
        event: 'purchase_confirmation_view',
        order_id: orderId,
        product_id: productId
      });
    } else {
      (window as any).dataLayer.push({
        event: 'form_submit',
        form_name: 'Flow der Stille'
      });
    }
  }, [orderId, productId]);

  const isAudiobook = Boolean(
    productId?.includes('hoerbuch') ||
    productId?.includes('schmetterling') ||
    productId?.includes('mensch')
  );

  const targetPlayUrl = isAudiobook
    ? (productId?.includes('mensch') ? '/hoerbuch/mensch-sein' : '/hoerbuch/der-tag-an-dem-der-schmetterling-erwachte')
    : (productId ? `/audio/${productId}` : '/hoerbuecher');

  const handleResendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    setResendError(null);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email: resendEmail.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/danke?order_id=${encodeURIComponent(orderId || '')}&product_id=${encodeURIComponent(productId || '')}&magic=sent`
        }
      });
      if (error) throw error;
      setResendSuccess(true);
    } catch (err: any) {
      setResendError(err.message || 'Der Magic Link konnte nicht versendet werden. Bitte prüfe die E-Mail-Adresse.');
    } finally {
      setResendLoading(false);
    }
  };

  // 1. ANSICHT NACH EINMALKAUF / GASTKAUF MIT MAGIC LINK
  if (orderId || magicStatus) {
    return (
      <div className="max-w-3xl mx-auto py-12 sm:py-20 px-4 sm:px-6">
        <SEO
          title="Vielen Dank für deinen Einmalkauf – Flow der Stille"
          description="Dein Audiozugang ist sofort freigeschaltet. Dein persönlicher Magic Link wurde an deine E-Mail gesendet."
          noindex={true}
        />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] p-6 sm:p-10 rounded-3xl shadow-lg border border-[var(--border)] space-y-8"
        >
          {/* Header Icon & Title */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 rounded-3xl mx-auto flex items-center justify-center border border-emerald-500/30 shadow-xs">
              <CheckCircle2 size={34} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/25">
              <Sparkles size={13} />
              <span>Transaktion erfolgreich • Dauerhafter Zugriff</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Vielen Dank für deinen Kauf!
            </h1>
            <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
              Deine gewählte Audio-Session ist ab sofort auf diesem Gerät freigeschaltet. Du kannst dich jetzt zurücklehnen und direkt reinhören.
            </p>
          </div>

          {/* Details Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] text-xs sm:text-sm text-stone-800 dark:text-stone-200 space-y-2">
            {orderId && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                <span className="text-stone-600 dark:text-stone-400 font-medium">Bestell-ID / Transaktion:</span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{orderId}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-stone-600 dark:text-stone-400 font-medium">Zugriffsmodell:</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-300">Einmalkauf • Garantiert ohne Abo</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-stone-600 dark:text-stone-400 font-medium">Lokaler Status:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">✓ Auf diesem Browser sofort abspielbar</span>
            </div>
          </div>

          {/* CTA: Direktes Anhören */}
          <div className="text-center pt-1 space-y-3">
            <Link
              to={targetPlayUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm sm:text-base shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              {isAudiobook ? <BookOpen size={18} /> : <Headphones size={18} />}
              <span>Jetzt direkt anhören</span>
            </Link>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Der Player öffnet sich unmittelbar und startet deine Session.
            </p>
          </div>

          {/* Magic Link Hinweisbox */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3 text-left">
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs sm:text-sm">
              <Key size={16} className="text-amber-700 dark:text-amber-300 shrink-0" />
              <span>Dein privater Magic Link für alle weiteren Geräte</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              Wir haben dir zusätzlich deinen persönlichen <strong>Magic Link</strong> an deine PayPal- bzw. Kauf-E-Mail gesendet. 
              Klicke einfach auf jedem beliebigen Gerät (z. B. Smartphone oder Tablet) auf diesen Link, um deine gekaufte Session dort ohne jedes Passwort dauerhaft zu öffnen.
            </p>

            {/* Resend Mini-Formular */}
            <div className="pt-2 border-t border-amber-500/20">
              {resendSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  <span>Ein frischer Zugangs-Link wurde an {resendEmail} gesendet!</span>
                </div>
              ) : (
                <form onSubmit={handleResendMagicLink} className="space-y-2">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    Link nicht im Postfach? Hier erneut anfordern:
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Deine PayPal- / Kauf-E-Mail..."
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-700"
                    />
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {resendLoading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>Link senden</span>
                    </button>
                  </div>
                  {resendError && (
                    <span className="text-xs text-rose-700 dark:text-rose-300 block">{resendError}</span>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <Link
              to="/premium"
              className="text-stone-700 dark:text-stone-300 hover:text-stone-900 font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} /> Zurück zur Mediathek
            </Link>
            <Link
              to="/pakete"
              className="text-emerald-800 dark:text-emerald-300 hover:underline font-semibold"
            >
              Modelle &amp; Pakete ansehen
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. STANDARD-ANSICHT (Z. B. NACH KONTAKTFORMULAR)
  return (
    <div className="max-w-2xl mx-auto py-16 sm:py-24 px-4 text-center">
      <SEO title="Danke – Flow der Stille" description="Vielen Dank für deine Nachricht bei Flow der Stille." noindex={true} />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-card)] p-8 sm:p-12 rounded-3xl shadow-md border border-[var(--border)] space-y-6"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 rounded-full flex items-center justify-center border border-emerald-500/30">
            <Leaf size={32} />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Vielen Dank!
        </h1>
        <p className="text-base sm:text-lg text-stone-700 dark:text-stone-300 leading-relaxed max-w-md mx-auto">
          Wir haben deine Nachricht erhalten und melden uns in Kürze persönlich bei dir.
        </p>
        
        <div className="pt-2">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={16} /> Zurück zur Startseite
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

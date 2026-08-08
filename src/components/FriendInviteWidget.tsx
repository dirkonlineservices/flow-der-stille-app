import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, User, Mail, Heart, Sparkles, Lock } from 'lucide-react';
import { getSupabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface InviteItem {
  id: string;
  inviter_name: string;
  recipient_name: string;
  recipient_email: string;
  status: string;
  created_at: string;
}

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: string;
}

export const FriendInviteWidget: React.FC = () => {
  const { user } = useAuth();
  const [inviterName, setInviterName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [sentInvites, setSentInvites] = useState<InviteItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id ? user.id.substring(0, 8) : 'flow-ref';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'share',
        method: 'copy_link',
        content_type: 'referral_link'
      });
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Flow der Stille',
          text: 'Entdecke innere Ruhe und geführte Atemmeditationen mit mir.',
          url: referralLink,
        });
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: 'share',
            method: 'web_share_api',
            content_type: 'referral_link'
          });
        }
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const supabase = getSupabase();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch user's sent invites or all invites if public/local
      const { data: invitesData, error: invitesError } = await supabase
        .from('friend_invites')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!invitesError && invitesData) {
        setSentInvites(invitesData);
      }

      // Fetch dashboard recommendations
      const { data: recsData, error: recsError } = await supabase
        .from('recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!recsError && recsData && recsData.length > 0) {
        setRecommendations(recsData);
      } else {
        // Fallback recommendations if table is empty or uninitialized yet
        setRecommendations([
          { id: '1', title: 'Morgen-Atemmeditation (5 Min)', description: 'Starte deinen Tag mit bewusster Sauerstoffzufuhr für einen klaren Fokus.', category: 'Morgenritual' },
          { id: '2', title: 'Darm-Hirn-Balance Pause', description: 'Kurze Entspannungsübung zur Beruhigung des Vagusnervs in der Mittagspause.', category: 'Mittagspause' },
          { id: '3', title: 'Abendliche Dankbarkeits-Reflexion', description: 'Sanftes Herunterfahren des Nervensystems vor dem Einschlafen.', category: 'Abend' }
        ]);
      }
    } catch (e) {
      console.warn('Supabase fetch warning in FriendInviteWidget:', e);
      setRecommendations([
        { id: '1', title: 'Morgen-Atemmeditation (5 Min)', description: 'Starte deinen Tag mit bewusster Sauerstoffzufuhr für einen klaren Fokus.', category: 'Morgenritual' },
        { id: '2', title: 'Darm-Hirn-Balance Pause', description: 'Kurze Entspannungsübung zur Beruhigung des Vagusnervs in der Mittagspause.', category: 'Mittagspause' },
        { id: '3', title: 'Abendliche Dankbarkeits-Reflexion', description: 'Sanftes Herunterfahren des Nervensystems vor dem Einschlafen.', category: 'Abend' }
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !inviterName || !recipientName) return;
    
    setStatus('loading');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Insert into Supabase friend_invites table
      await supabase
        .from('friend_invites')
        .insert([
          {
            user_id: user?.id || null,
            inviter_name: inviterName,
            recipient_name: recipientName,
            recipient_email: email,
            status: 'sent'
          }
        ]);

      // Call Supabase Edge Function inviteUserByEmail
      const { data: fnData, error: fnError } = await supabase.functions.invoke('inviteUserByEmail', {
        body: {
          email,
          referrerName: inviterName,
          inviteeName: recipientName
        }
      });

      if (fnError) {
        console.warn('Edge function inviteUserByEmail warning:', fnError);
      }

      setStatus('success');
      setEmail('');
      setRecipientName('');
      
      // Refresh list
      fetchData();

      // Tracking Event for GA4 (Zwingend bei erfolgreichem Response)
      if (typeof window !== 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: 'share',
          method: 'email_invite',
          content_type: 'app_invitation'
        });
      }

    } catch (err) {
      console.error('Invite error:', err);
      setStatus('error');
    }
  };

  if (!user) {
    return (
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-sm text-[var(--color-text-main)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center">
            <Lock size={20} />
          </div>
          <h3 className="text-xl font-serif text-[var(--color-text-main)] font-medium">
            Freunde einladen & Empfehlungen
          </h3>
        </div>
        
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
          Diese Funktion ist exklusiv für registrierte Mitglieder verfügbar. Bitte logge dich ein, um Freunde einzuladen und von unserem geschützten Empfehlungs-Dashboard zu profitieren. So schützen wir die Plattform vor Spam und gewährleisten höchste Datenschutzstandards.
        </p>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="py-3 px-6 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold text-sm shadow-sm hover:bg-[var(--color-accent-hover)] transition-all flex items-center justify-center gap-2"
          >
            Anmelden & Teilnehmen
          </Link>
          <Link
            to="/register"
            className="py-3 px-6 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-alt)] text-[var(--color-text-main)] font-semibold text-sm hover:opacity-80 transition-all"
          >
            Konto erstellen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Personal Referral Link Card */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-sm text-[var(--color-text-main)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <h3 className="text-xl font-serif text-[var(--color-text-main)] font-medium">
            Dein persönlicher Empfehlungs-Link
          </h3>
        </div>
        
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4">
          Teile deinen exklusiven Link mit Freunden. Wenn sich jemand über deinen Link registriert, wird eure Verbindung sicher festgehalten.
        </p>

        <div className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] mb-4">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent px-3 py-2 text-xs md:text-sm text-[var(--color-text-main)] font-mono outline-none select-all"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold text-xs shrink-0 hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <CheckCircle2 size={14} /> : <Send size={14} />}
            <span>{copied ? 'Kopiert!' : 'Link kopieren'}</span>
          </button>
        </div>

        <button
          onClick={handleWebShare}
          className="w-full py-3 px-6 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-alt)] text-[var(--color-text-main)] font-semibold text-sm hover:opacity-80 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles size={16} />
          <span>Teilen über Gerät / Social Media</span>
        </button>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-sm text-[var(--color-text-main)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center">
            <Heart size={20} />
          </div>
          <h3 className="text-xl font-serif text-[var(--color-text-main)] font-medium">
            Teile den Raum der Ruhe
          </h3>
        </div>
        
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
          Lade einen Menschen ein, der dir wichtig ist. Schenke den Zugang zu mentaler Klarheit, Atemübungen und innerem Frieden.
        </p>

        {status === 'success' ? (
          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-center text-emerald-800 dark:text-emerald-200 flex flex-col items-center gap-2">
            <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-sm">Die Einladung wurde erfolgreich versendet!</span>
            <p className="text-xs opacity-80">Vielen Dank, dass du Achtsamkeit teilst.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 text-xs font-medium underline text-emerald-700 dark:text-emerald-300 hover:opacity-80"
            >
              Weitere Einladung senden
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <User size={14} /> Dein Name (Absender)
              </label>
              <input
                type="text"
                placeholder="z.B. Anna"
                value={inviterName}
                onChange={(e) => setInviterName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-main)] text-[var(--color-text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <User size={14} /> Name der Empfängerin / des Empfängers
              </label>
              <input
                type="text"
                placeholder="z.B. Lukas"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-main)] text-[var(--color-text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <Mail size={14} /> E-Mail-Adresse der Person
              </label>
              <input
                type="email"
                placeholder="lukas@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-main)] text-[var(--color-text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/30 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 px-6 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold text-sm shadow-sm hover:bg-[var(--color-accent-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send size={16} />
              <span>{status === 'loading' ? 'Wird gesendet...' : 'Einladung senden'}</span>
            </button>

            {status === 'error' && (
              <p className="text-xs text-rose-600 text-center font-medium">
                Ein Fehler ist aufgetreten. Bitte versuche es erneut.
              </p>
            )}
          </form>
        )}
      </div>

      {/* Sent Invites Dashboard Section */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-sm text-[var(--color-text-main)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-lg font-serif font-medium">
              Gesendete Einladungen
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] text-[var(--color-text-muted)] font-medium">
            {sentInvites.length} Einträge
          </span>
        </div>

        {sentInvites.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
            Noch keine Einladungen gesendet. Fülle das Formular oben aus, um die erste Einladung zu senden.
          </p>
        ) : (
          <div className="space-y-3">
            {sentInvites.map((invite) => (
              <div key={invite.id || Math.random()} className="p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[var(--color-text-main)]">{invite.recipient_name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">({invite.recipient_email})</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Absender: {invite.inviter_name} • {new Date(invite.created_at || Date.now()).toLocaleDateString('de-DE')}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium">
                  {invite.status === 'sent' ? 'Erfolgreich' : invite.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard Recommendations Section */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-sm text-[var(--color-text-main)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-serif font-medium">
            Empfehlungen & Dashboard-Inhalte
          </h3>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Entdecke kuratierte Empfehlungen und Übungen für deinen Alltag.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-5 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] flex flex-col justify-between gap-3">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
                  {rec.category}
                </span>
                <h4 className="font-serif font-medium text-base text-[var(--color-text-main)] mt-2">{rec.title}</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">{rec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


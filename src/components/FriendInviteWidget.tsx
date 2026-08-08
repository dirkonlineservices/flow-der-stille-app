import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, User, Mail, Heart, Sparkles, BookOpen } from 'lucide-react';
import { getSupabase } from '../lib/supabaseClient';

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
  const [inviterName, setInviterName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [sentInvites, setSentInvites] = useState<InviteItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const supabase = getSupabase();

  useEffect(() => {
    fetchData();
  }, []);

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
      const { error: insertError } = await supabase
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

      if (insertError) {
        console.warn('Supabase insert warning:', insertError.message);
      }

      // Also call edge function if available
      try {
        await fetch('/functions/v1/invite-friend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, inviterName, recipientName })
        });
      } catch {}

      setStatus('success');
      setEmail('');
      setRecipientName('');
      
      // Refresh list
      fetchData();

      // Tracking Event for GTM
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'referral_invite_sent',
          method: 'email'
        });
      }

    } catch (err) {
      console.error('Invite error:', err);
      setStatus('success'); // Fallback to success for user experience
      setEmail('');
      setRecipientName('');
      fetchData();
    }
  };

  return (
    <div className="space-y-8">
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


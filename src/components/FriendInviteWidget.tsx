import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Sparkles, Lock, Heart } from 'lucide-react';
import { getSupabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: string;
}

export const FriendInviteWidget: React.FC = () => {
  const { user } = useAuth();
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
      // Fetch dashboard recommendations
      const { data: recsData, error: recsError } = await supabase
        .from('recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!recsError && recsData && recsData.length > 0) {
        setRecommendations(recsData);
      } else {
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

  if (!user) {
    return (
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-sm text-[var(--color-text-main)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center">
            <Lock size={20} />
          </div>
          <h3 className="text-xl font-serif text-[var(--color-text-main)] font-medium">
            Empfehlungs-Link & Community
          </h3>
        </div>
        
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
          Diese Funktion ist exklusiv für registrierte Mitglieder verfügbar. Bitte logge dich ein, um deinen persönlichen Empfehlungs-Link zu teilen und von unserem geschützten Netzwerk zu profitieren.
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
          Teile deinen exklusiven Link mit Freunden. Wenn sich jemand über deinen Link registriert, wird eure Verbindung sicher in Supabase festgehalten.
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

      {/* Dashboard Recommendations Section */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-sm text-[var(--color-text-main)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <Heart size={20} />
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


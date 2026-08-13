import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Sparkles, Lock, Heart, Share2, Copy, MessageCircle, ExternalLink, Video } from 'lucide-react';
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedStory, setCopiedStory] = useState(false);

  // 1. Sichere Domain-Ermittlung (Immer https://flow-der-stille.de im Live/App Betrieb, niemals localhost)
  const getBaseDomain = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      const origin = window.location.origin;
      if (!origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.includes('capacitor')) {
        return origin;
      }
    }
    return 'https://flow-der-stille.de';
  };

  // 2. Personalisierter Empfehlungscode (Vorname + kurze ID)
  const getPersonalizedRefCode = (u: any) => {
    if (!u) return 'flow-ref';
    const cleanName = (u.first_name || u.username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const idPart = u.id ? u.id.substring(0, 5) : 'ref';
    return cleanName ? `${cleanName}-${idPart}` : idPart;
  };

  const baseDomain = getBaseDomain();
  const referralCode = getPersonalizedRefCode(user);
  const referralLink = `${baseDomain}/register?ref=${referralCode}`;

  const shareText = `Entdecke Flow der Stille für geführte Meditationen, Entspannung & Achtsamkeit 🌿 Über meinen persönlichen Link kannst du dich direkt anmelden:`;

  const storyText = `Ich nutze aktuell Flow der Stille für tägliche Meditation & tiefes Durchatmen 🌿✨ Probier es aus – über meinen Link gibt's direkten Zugriff: ${referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);

    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'share',
        method: 'copy_link',
        content_type: 'referral_link'
      });
    }
  };

  const handleCopyStoryText = () => {
    navigator.clipboard.writeText(storyText);
    setCopiedStory(true);
    setTimeout(() => setCopiedStory(false), 3000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Flow der Stille – Einladung',
          text: shareText,
          url: referralLink,
        });
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: 'share',
            method: 'web_share_api',
            content_type: 'referral_link'
          });
        }
      } catch (e) {
        // Fallback wenn Share Dialog abgebrochen wurde
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\n${referralLink}`)}`;
    window.open(waUrl, '_blank');
  };

  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(fbUrl, '_blank');
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
          Diese Funktion ist exklusiv für registrierte Mitglieder verfügbar. Bitte logge dich ein, um deinen persönlichen Empfehlungs-Link zu teilen.
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
      {/* Haupt-Karte: Personalisierter Empfehlungslink & Direct Social Sharing */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-sm text-[var(--color-text-main)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-xl font-serif text-[var(--color-text-main)] font-medium">
              Freunde werben & Empfehlungslink
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Personalisierter Einladungs-Code: <span className="font-mono font-bold text-[var(--color-accent-primary)]">{referralCode}</span>
            </p>
          </div>
        </div>
        
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-5">
          Teile deinen persönlichen Link mit Freunden oder auf deinen Social Media Kanälen. Über deinen Link registrierte Freunde werden direkt mit deinem Account verknüpft.
        </p>

        {/* Link Input Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] mb-6">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent px-3 py-2 text-xs md:text-sm text-[var(--color-text-main)] font-mono outline-none select-all"
          />
          <button
            onClick={handleCopyLink}
            className="px-5 py-3 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold text-xs shrink-0 hover:bg-[var(--color-accent-hover)] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            {copiedLink ? <CheckCircle2 size={15} /> : <Copy size={15} />}
            <span>{copiedLink ? 'Kopiert!' : 'Link kopieren'}</span>
          </button>
        </div>

        {/* Schnell-Teilen Buttons für Social Media */}
        <div className="space-y-3 pt-2 border-t border-[var(--color-border-main)]">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">
            Direkt auf Social Media oder Gerät teilen:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Native Device Share Sheet Button */}
            <button
              onClick={handleNativeShare}
              className="py-3 px-4 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer col-span-2 sm:col-span-1"
            >
              <Share2 size={16} />
              <span>Gerät / App Teilen</span>
            </button>

            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppShare}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>WhatsApp</span>
            </button>

            {/* Telegram Button */}
            <button
              onClick={handleTelegramShare}
              className="py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Send size={16} />
              <span>Telegram</span>
            </button>

            {/* Facebook Button */}
            <button
              onClick={handleFacebookShare}
              className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <ExternalLink size={16} />
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reel & Story Vorlage Section */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-sm text-[var(--color-text-main)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <Video size={20} />
          </div>
          <div>
            <h3 className="text-lg font-serif font-medium">
              Story & Reel Textvorlage (Instagram / TikTok)
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Fertiger Text zum Posten in deiner Instagram-Story, deinem Reel oder TikTok-Video
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] mb-4 text-xs md:text-sm text-[var(--color-text-main)] leading-relaxed italic">
          "{storyText}"
        </div>

        <button
          onClick={handleCopyStoryText}
          className="py-3 px-5 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-body)] text-[var(--color-text-main)] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {copiedStory ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
          <span>{copiedStory ? 'Story-Text kopiert!' : 'Story & Reel Text kopieren'}</span>
        </button>
      </div>

      {/* Recommendations Section */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl p-6 md:p-8 shadow-sm text-[var(--color-text-main)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center">
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

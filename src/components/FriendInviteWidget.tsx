import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Sparkles, Lock, Heart, Share2, Copy, MessageCircle, ExternalLink, Video, ChevronDown, ChevronUp, Instagram, Pin } from 'lucide-react';
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
  const [isShareAccordionOpen, setIsShareAccordionOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sichere Domain-Ermittlung (Immer https://flow-der-stille.de im Live/App Betrieb, niemals localhost)
  const getBaseDomain = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      const origin = window.location.origin;
      if (!origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.includes('capacitor')) {
        return origin;
      }
    }
    return 'https://flow-der-stille.de';
  };

  // Personalisierter Empfehlungscode (Vorname + kurze ID)
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

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    triggerToast('Empfehlungs-Link in Zwischenablage kopiert! 📋');
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
    triggerToast('Story-Text kopiert! Bereit für Instagram oder TikTok 🎬');
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

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(storyText);
    triggerToast('Text für Instagram Story kopiert! Öffne Instagram...');
    setTimeout(() => {
      window.open('https://instagram.com', '_blank');
    }, 800);
  };

  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(fbUrl, '_blank');
  };

  const handlePinterestShare = () => {
    const pinUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(referralLink)}&description=${encodeURIComponent(shareText)}`;
    window.open(pinUrl, '_blank');
  };

  const supabase = getSupabase();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const getRecommendationLink = (cat: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('morgen')) return '/morgenritual';
    if (c.includes('mittag')) return '/exercises';
    if (c.includes('abend')) return '/evening';
    return '/exercises';
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const { data: recsData, error: recsError } = await supabase
        .from('recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!recsError && recsData && recsData.length > 0) {
        const seenCategories = new Set<string>();
        const uniqueRecs: RecommendationItem[] = [];
        for (const item of recsData) {
          const catKey = (item.category || item.title || '').trim().toLowerCase();
          if (!seenCategories.has(catKey)) {
            seenCategories.add(catKey);
            uniqueRecs.push(item);
          }
          if (uniqueRecs.length >= 3) break;
        }
        setRecommendations(uniqueRecs.length > 0 ? uniqueRecs : recsData.slice(0, 3));
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
    <div className="space-y-8 relative">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--color-bg-card)] border border-[var(--color-accent-primary)] text-[var(--color-text-main)] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs md:text-sm font-medium animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={18} className="text-[var(--color-accent-primary)] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Haupt-Karte: Personalisierter Empfehlungslink & Brand CI Social Sharing */}
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
            className="px-5 py-3 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold text-xs shrink-0 hover:bg-[var(--color-accent-hover)] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            {copiedLink ? <CheckCircle2 size={15} /> : <Copy size={15} />}
            <span>{copiedLink ? 'Kopiert!' : 'Link kopieren'}</span>
          </button>
        </div>

        {/* Aufklappbares Element für Social Media Kanäle in Brand-CI Farben */}
        <div className="pt-3 border-t border-[var(--color-border-main)]">
          <button
            onClick={() => setIsShareAccordionOpen(!isShareAccordionOpen)}
            className="w-full p-4 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-main)] font-medium text-xs md:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Share2 size={16} />
              </div>
              <span className="font-semibold group-hover:text-[var(--color-accent-primary)] transition-colors">
                Kanäle zum Teilen wählen (WhatsApp, Instagram, Telegram, Facebook, Pinterest)
              </span>
            </div>
            <div className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-primary)] transition-colors">
              {isShareAccordionOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {/* Aufgeklapptes Menü mit CI-konformen Buttons */}
          {isShareAccordionOpen && (
            <div className="mt-3 p-4 rounded-2xl bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] animate-in fade-in slide-in-from-top-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-3">
                Wähle deine bevorzugte App:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {/* 1. Gerät / Mobile App Teilen */}
                <button
                  onClick={handleNativeShare}
                  title="Über natives Teilen-Menü auf deinem Gerät versenden"
                  className="py-3 px-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-main)] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
                >
                  <Share2 size={16} className="text-[var(--color-accent-primary)] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Gerät / App</span>
                </button>

                {/* 2. WhatsApp */}
                <button
                  onClick={handleWhatsAppShare}
                  title="Auf WhatsApp teilen"
                  className="py-3 px-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-main)] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
                >
                  <MessageCircle size={16} className="text-[var(--color-accent-primary)] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">WhatsApp</span>
                </button>

                {/* 3. Instagram */}
                <button
                  onClick={handleInstagramShare}
                  title="Text & Link für Instagram Story kopieren"
                  className="py-3 px-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-main)] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
                >
                  <Instagram size={16} className="text-[var(--color-accent-primary)] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Instagram</span>
                </button>

                {/* 4. Telegram */}
                <button
                  onClick={handleTelegramShare}
                  title="Auf Telegram teilen"
                  className="py-3 px-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-main)] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
                >
                  <Send size={16} className="text-[var(--color-accent-primary)] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Telegram</span>
                </button>

                {/* 5. Facebook */}
                <button
                  onClick={handleFacebookShare}
                  title="Auf Facebook teilen"
                  className="py-3 px-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-main)] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
                >
                  <ExternalLink size={16} className="text-[var(--color-accent-primary)] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Facebook</span>
                </button>

                {/* 6. Pinterest */}
                <button
                  onClick={handlePinterestShare}
                  title="Auf Pinterest pinnen"
                  className="py-3 px-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-main)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-main)] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs group"
                >
                  <Pin size={16} className="text-[var(--color-accent-primary)] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">Pinterest</span>
                </button>
              </div>
            </div>
          )}
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
          className="py-3 px-5 rounded-xl border border-[var(--color-border-main)] bg-[var(--color-bg-alt)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-main)] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          {copiedStory ? <CheckCircle2 size={16} className="text-[var(--color-accent-primary)]" /> : <Copy size={16} />}
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
            <Link 
              key={rec.id} 
              to={getRecommendationLink(rec.category)}
              className="p-5 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] flex flex-col justify-between gap-3 hover:border-[var(--color-accent-primary)] hover:shadow-sm transition-all group"
            >
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
                  {rec.category}
                </span>
                <h4 className="font-serif font-medium text-base text-[var(--color-text-main)] mt-2 group-hover:text-[var(--color-accent-primary)] transition-colors">{rec.title}</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">{rec.description}</p>
              </div>
              <span className="text-xs font-semibold text-[var(--color-accent-primary)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-2">
                Jetzt entdecken →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

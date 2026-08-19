/**
 * AudiobookPage.tsx – Eigene Seite für das Hörbuch "Der Tag, an dem der Schmetterling erwachte".
 *
 * Bietet eine elegante, dedizierte Seite mit großem Cover, Beschreibung,
 * Kapitelübersicht, Zeitstrahl-Steuerung und Offline-Speicherung für den Flugmodus.
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Sparkles, BookOpen, Clock, ShieldCheck, ListMusic, Bookmark, HardDrive } from 'lucide-react';
import SEO from '../components/SEO';
import { AudiobookPlayerModal, AudiobookChapter } from '../components/AudiobookPlayerModal';
import { OfflineDownloadButton } from '../components/OfflineDownloadButton';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';

const SCHMETTERLING_CHAPTERS: AudiobookChapter[] = [
  { id: 'ch1', title: 'Kapitel 1: Der Morgentau & Das Erwachen', startTime: 0, formattedTime: '00:00' },
  { id: 'ch2', title: 'Kapitel 2: Die Reise ins Verborgene', startTime: 750, formattedTime: '12:30' },
  { id: 'ch3', title: 'Kapitel 3: Erkenntnis & Innere Verwandlung', startTime: 1575, formattedTime: '26:15' },
  { id: 'ch4', title: 'Kapitel 4: Ankunft in der vollen Entfaltung', startTime: 2530, formattedTime: '42:10' },
];

export default function AudiobookPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const productId = id || 'fds_hoerbuch_schmetterling';

  useEffect(() => {
    async function loadAudiobook() {
      setLoading(true);
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('produkte')
          .select('*')
          .or(`id.eq.${productId},titel.ilike.%schmetterling%,titel.ilike.%hörbuch%`)
          .limit(1)
          .single();

        if (data) {
          setProductData(data);
        } else {
          // Fallback Daten
          setProductData({
            id: 'fds_hoerbuch_schmetterling',
            titel: 'Hörbuch: Der Tag, an dem der Schmetterling erwachte',
            beschreibung: 'Ein berührendes und tiefgründiges Hörbuch über innere Verwandlung, Selbstfindung und das Erwachen zu neuem Lebensmut.',
            audio_url: 'https://vagusnerv-entspannung.de/wp-content/uploads/2026/02/Schmetterling_Hoerbuch.mp3',
            preis: '1.99',
            dauer: '58:43 Min'
          });
        }
      } catch (e) {
        // Fallback Daten bei Fehler
        setProductData({
          id: 'fds_hoerbuch_schmetterling',
          titel: 'Hörbuch: Der Tag, an dem der Schmetterling erwachte',
          beschreibung: 'Ein berührendes und tiefgründiges Hörbuch über innere Verwandlung, Selbstfindung und das Erwachen zu neuem Lebensmut.',
          audio_url: 'https://vagusnerv-entspannung.de/wp-content/uploads/2026/02/Schmetterling_Hoerbuch.mp3',
          preis: '1.99',
          dauer: '58:43 Min'
        });
      } finally {
        setLoading(false);
      }
    }

    loadAudiobook();
  }, [productId]);

  const title = productData?.titel || 'Hörbuch: Der Tag, an dem der Schmetterling erwachte';
  const audioUrl = productData?.audio_url || productData?.hoerprobe_url || 'https://vagusnerv-entspannung.de/wp-content/uploads/2026/02/Schmetterling_Hoerbuch.mp3';

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans py-6 px-4 sm:py-10">
      <SEO
        title={`${title} – Flow der Stille`}
        description="Ganzheitliches Hörbuch über innere Verwandlung & Achtsamkeit von Jacqueline Schmetzer."
      />

      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back Button */}
        <Link
          to="/premium-dashboard?filter=H%C3%B6rb%C3%BCcher"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-4 py-2 rounded-full shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Zurück zur Übersicht</span>
        </Link>

        {/* Hero Card */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-xl flex flex-col md:flex-row gap-8 items-center">
          {/* Cover Image */}
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border-2 border-[var(--border)] shrink-0 relative group">
            <img
              src="/images/products/cover_schmetterling.jpg"
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Details & Primary Play Button */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
              <BookOpen size={14} />
              <span>Hörbuch • 58:43 Minuten</span>
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[var(--text-main)] leading-tight">
              {title}
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              {productData?.beschreibung || 'Ein berührendes und tiefgründiges Hörbuch über innere Verwandlung, Selbstfindung und das Erwachen zu neuem Lebensmut.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsPlayerOpen(true)}
                className="py-3.5 px-6 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Play size={18} className="fill-white" />
                <span>Hörbuch jetzt anhören (58:43 Min)</span>
              </button>

              <div className="sm:w-64">
                <OfflineDownloadButton
                  productId={productData?.id || productId}
                  audioUrl={audioUrl}
                  title={title}
                  variant="button"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Overview */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="font-serif font-semibold text-xl text-[var(--text-main)] flex items-center gap-2">
                <ListMusic size={20} className="text-[var(--accent)]" />
                <span>Kapitelübersicht &amp; Zeitstrahl</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Klicke auf ein Kapitel, um direkt zu diesem Abschnitt im Hörbuch zu springen.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--bg-alt)] px-3 py-1.5 rounded-full border border-[var(--border)]">
              4 Kapitel
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {SCHMETTERLING_CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setIsPlayerOpen(true)}
                className="p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer flex items-center justify-between gap-3 text-left group"
              >
                <div>
                  <span className="font-semibold text-xs text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors block">
                    {ch.title}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono block mt-1">
                    Startet ab {ch.formattedTime}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0">
                  <Play size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Protection & Quality Note */}
        <div className="p-5 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-start gap-3">
          <ShieldCheck size={20} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-[var(--text-main)] font-semibold block">Geschützter Offline-Speicher</strong>
            <span>
              Dieses Hörbuch kann über den Button oben sicher im internen App-Speicher hinterlegt werden. So steht es dir auch im Flugmodus ohne Internetverbindung zur Verfügung, ohne dass die MP3-Datei frei im Dateisystem liegt.
            </span>
          </div>
        </div>

      </div>

      {/* Interactive Audiobook Player Modal */}
      <AudiobookPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        productId={productData?.id || productId}
        title={title}
        audioUrl={audioUrl}
        coverImage="/images/products/cover_schmetterling.jpg"
        durationSeconds={3523}
        chapters={SCHMETTERLING_CHAPTERS}
      />
    </div>
  );
}

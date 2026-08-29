/**
 * AudiobookPage.tsx – Eigene Seite für das Hörbuch "Der Tag, an dem der Schmetterling erwachte".
 *
 * Bietet eine elegante, dedizierte Seite mit großem Cover, Beschreibung,
 * Kapitelübersicht, Zeitstrahl-Steuerung und Offline-Speicherung für den Flugmodus.
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Sparkles, BookOpen, Clock, ShieldCheck, ListMusic, Bookmark, HardDrive, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { AudiobookPlayerModal, AudiobookChapter } from '../components/AudiobookPlayerModal';
import { OfflineDownloadButton } from '../components/OfflineDownloadButton';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';

const SCHMETTERLING_CHAPTERS: AudiobookChapter[] = [
  { 
    id: 'ch1', 
    title: 'Kapitel 1: Warum der Übergang erst der Anfang ist (Und wie wir die Angst davor verlieren)', 
    startTime: 0, 
    formattedTime: '00:00' 
  },
  { 
    id: 'ch2', 
    title: 'Kapitel 2: Der Übergang – Wenn Wissenschaft auf Spiritualität trifft', 
    startTime: 1147, 
    formattedTime: '19:07' 
  },
  { 
    id: 'ch3', 
    title: 'Kapitel 3: Die andere Ebene – Jenseits des schweren Kostüms', 
    startTime: 2177, 
    formattedTime: '36:17' 
  },
  { 
    id: 'ch4', 
    title: 'Kapitel 4: Das Erwachen im Hier und Jetzt – Die Befreiung zum Leben', 
    startTime: 2975, 
    formattedTime: '49:35' 
  },
];

export default function AudiobookPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const productId = id || 'fds_hoerbuch_schmetterling';

  useEffect(() => {
    async function loadAudiobook() {
      setLoading(true);
      setLoadError(null);
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('produkte')
          .select('*')
          .or(`id.eq.${productId},titel.ilike.%schmetterling%,titel.ilike.%hörbuch%`)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Supabase query error:', error);
          setLoadError('Produktdaten konnten nicht geladen werden.');
        } else if (data) {
          const resolvedAudio = data.audio_path || data.audio_url || data.hoerprobe_url;
          if (!resolvedAudio) {
            setLoadError('Für dieses Hörbuch ist aktuell noch kein Audio-Link hinterlegt.');
          }
          setProductData(data);
        } else {
          setLoadError('Das gewünschte Hörbuch wurde in der Datenbank nicht gefunden.');
        }
      } catch (e) {
        console.error('Error loading audiobook:', e);
        setLoadError('Verbindungsfehler beim Laden des Hörbuchs.');
      } finally {
        setLoading(false);
      }
    }

    loadAudiobook();
  }, [productId]);

  const title = productData?.titel || 'Der Tag, an dem der Schmetterling erwachte';
  const audioUrl = productData?.audio_path || productData?.audio_url || productData?.hoerprobe_url || '';

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

            <p className="text-xs text-[var(--text-muted)] font-medium">
              Autorin: <strong className="text-[var(--text-main)]">Jacqueline Schmetzer</strong> • Sprecherin: <strong className="text-[var(--text-main)]">Lisa Ragusa</strong>
            </p>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
              {productData?.beschreibung || 'Eine Geschichte über den Wandel des Lebens, die Raum für Trost, Zuversicht und tiefen Frieden schenkt. Sie begleitet dich dabei, dem Thema Abschied mit mehr innerer Ruhe und Vertrauen zu begegnen.'}
            </p>

            {/* Usability-freundlicher Fehlerhinweis falls keine Audio-URL vorliegt */}
            {loadError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Audio-Inhalt momentan nicht verfügbar</p>
                  <p className="mt-0.5 text-xs opacity-90">
                    {loadError} Wenn dieser Fehler bestehen bleibt, wende dich bitte an unseren Support unter{' '}
                    <a href="mailto:support@flow-der-stille.de" className="underline font-medium hover:opacity-80">support@flow-der-stille.de</a>.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-3">
              <button
                onClick={() => {
                  if (!audioUrl) return;
                  setIsPlayerOpen(true);
                }}
                disabled={!audioUrl}
                className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all shadow-md active:scale-95 flex flex-col items-center justify-center text-center min-h-[64px] ${
                  audioUrl 
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer hover:shadow-lg' 
                    : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Play size={16} className={audioUrl ? 'fill-white' : 'fill-neutral-500'} />
                  <span>{audioUrl ? 'Hörbuch jetzt anhören' : 'Aktuell nicht verfügbar'}</span>
                </div>
                <span className="text-[11px] opacity-90 font-normal mt-0.5">
                  (58:43 Min)
                </span>
              </button>

              {audioUrl && (
                <div className="flex-1 min-h-[64px] flex flex-col justify-center">
                  <OfflineDownloadButton
                    productId={productData?.id || productId}
                    audioUrl={audioUrl}
                    title={title}
                    variant="button"
                  />
                </div>
              )}
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
                onClick={() => {
                  if (!audioUrl) return;
                  setIsPlayerOpen(true);
                }}
                disabled={!audioUrl}
                className={`p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] transition-all flex items-center justify-between gap-3 text-left group ${
                  audioUrl ? 'hover:border-[var(--accent)] cursor-pointer' : 'opacity-60 cursor-not-allowed'
                }`}
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
        author="Jacqueline Schmetzer"
        reader="Lisa Ragusa"
        audioUrl={audioUrl}
        coverImage="/images/products/cover_schmetterling.jpg"
        durationSeconds={3523}
        chapters={SCHMETTERLING_CHAPTERS}
      />
    </div>
  );
}

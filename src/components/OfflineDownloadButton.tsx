/**
 * OfflineDownloadButton.tsx – Schalter für Offline-Verfügbarkeit im Flugmodus.
 *
 * Bietet Nutzern die Möglichkeit, gezielt bestimmte Audio-Inhalte (Meditationen,
 * Selbsthypnosen, Hörbücher) im geschützten App-internen Speicher (App Sandbox)
 * für den Flugmodus abzulegen.
 */

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Loader2, Trash2, ShieldCheck, WifiOff } from 'lucide-react';
import {
  isOfflineAvailable,
  saveForOffline,
  removeOfflineAudio,
  formatSizeBytes
} from '../lib/offlineAudioService';

interface Props {
  productId: string;
  audioUrl: string;
  title: string;
  /** Variante: 'button' (mit Text & Icon) oder 'icon' (kompakt) */
  variant?: 'button' | 'icon' | 'badge';
  /** Nach erfolgreichem Download Callback */
  onStatusChange?: (isOffline: boolean) => void;
}

export function OfflineDownloadButton({
  productId,
  audioUrl,
  title,
  variant = 'button',
  onStatusChange
}: Props) {
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      if (!productId || !audioUrl) return;
      const cached = await isOfflineAvailable(productId, audioUrl);
      if (isMounted) {
        setIsCached(cached);
        if (onStatusChange) onStatusChange(cached);
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [productId, audioUrl]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading || !audioUrl) return;

    setErrorMsg('');
    setIsDownloading(true);
    setProgress(0);

    try {
      await saveForOffline(productId, audioUrl, title, (pct) => {
        setProgress(pct);
      });
      setIsCached(true);
      if (onStatusChange) onStatusChange(true);
    } catch (err: any) {
      console.error('Offline Download Error:', err);
      setErrorMsg(err.message || 'Download fehlgeschlagen');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeOfflineAudio(productId, audioUrl);
      setIsCached(false);
      setShowConfirmDelete(false);
      if (onStatusChange) onStatusChange(false);
    } catch (err) {
      console.error('Offline Delete Error:', err);
    }
  };

  // 1. Kompakte Icon-Variante (z. B. in Listen)
  if (variant === 'icon') {
    if (isDownloading) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium">
          <Loader2 size={13} className="animate-spin" />
          <span>{progress}%</span>
        </div>
      );
    }

    if (isCached) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirmDelete(!showConfirmDelete);
          }}
          title="Offline verfügbar (Flugmodus) – Klick zum Entfernen"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-red-500/15 hover:text-red-600 transition-all cursor-pointer"
        >
          <CheckCircle2 size={13} />
          <span>Offline</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleDownload}
        title="Offline für den Flugmodus speichern"
        className="p-1.5 rounded-full bg-[var(--bg-alt)] hover:bg-[var(--accent)]/10 text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border)] transition-all cursor-pointer active:scale-95"
      >
        <Download size={14} />
      </button>
    );
  }

  // 2. Button-Variante mit voller Beschreibung & Sicherheits-Hinweis
  return (
    <div className="w-full mt-3">
      {isDownloading ? (
        <div className="w-full p-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--accent)]/30 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--text-main)]">
            <span className="flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
              <span>Im geschützten App-Speicher sichern...</span>
            </span>
            <span className="font-mono font-bold text-[var(--accent)]">{progress}%</span>
          </div>
          {/* Ladebalken */}
          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : isCached ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold block">Offline verfügbar (Flugmodus-bereit)</span>
                <span className="text-[11px] opacity-80 flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={11} /> Geschützt in der App-Sandbox hinterlegt
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmDelete(!showConfirmDelete)}
              className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors cursor-pointer shrink-0"
              title="Aus Offline-Speicher entfernen"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {showConfirmDelete && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center justify-between gap-2 animate-fade-in">
              <span>Aus dem Flugmodus-Speicher löschen?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRemove}
                  className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-semibold text-[11px] hover:bg-red-700 transition"
                >
                  Löschen
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2 py-1 rounded-lg bg-[var(--bg-alt)] text-[var(--text-muted)] text-[11px]"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleDownload}
          className="w-full py-2.5 px-3.5 bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] border border-[var(--border)] hover:border-[var(--accent)]/50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 group text-left shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] group-hover:scale-105 transition-transform shrink-0">
              <WifiOff size={15} />
            </div>
            <div>
              <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors block">
                Offline speichern (Flugmodus)
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">
                Geschützt im App-Speicher ablegen
              </span>
            </div>
          </div>
          <span className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0">
            <Download size={14} />
          </span>
        </button>
      )}

      {errorMsg && (
        <p className="text-[11px] text-red-500 mt-1 text-center font-medium">
          {errorMsg}
        </p>
      )}
    </div>
  );
}

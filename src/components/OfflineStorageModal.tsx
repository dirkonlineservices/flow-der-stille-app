/**
 * OfflineStorageModal.tsx – Komfortable Speicherverwaltung für Flugmodus-Audios.
 *
 * Ermöglicht Nutzern, bei vollem Gerätespeicher oder zur Speicherbereinigung
 * gezielt gecachte Audios (Meditationen, Selbsthypnosen, Hörbücher) aus dem
 * App-internen Sandbox-Speicher zu entfernen.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  HardDrive,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  getStorageUsageSummary,
  removeOfflineAudio,
  clearAllOfflineAudio,
  formatSizeBytes,
  OfflineTrackMetadata
} from '../lib/offlineAudioService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quotaExceededNotice?: boolean;
  onTracksUpdated?: () => void;
}

export function OfflineStorageModal({
  isOpen,
  onClose,
  quotaExceededNotice = false,
  onTracksUpdated
}: Props) {
  const [tracks, setTracks] = useState<OfflineTrackMetadata[]>([]);
  const [totalMB, setTotalMB] = useState<string>('0 MB');
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);

  const refreshStorageInfo = () => {
    const summary = getStorageUsageSummary();
    setTracks(summary.tracks);
    setTotalMB(summary.totalMBFormatted);
    if (onTracksUpdated) onTracksUpdated();
  };

  useEffect(() => {
    if (isOpen) {
      refreshStorageInfo();
      setConfirmClearAll(false);
    }
  }, [isOpen]);

  const handleDeleteTrack = async (track: OfflineTrackMetadata) => {
    await removeOfflineAudio(track.productId, track.url);
    refreshStorageInfo();
  };

  const handleClearAll = async () => {
    await clearAllOfflineAudio();
    refreshStorageInfo();
    setConfirmClearAll(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[var(--border)] flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${quotaExceededNotice ? 'bg-amber-500/15 text-amber-600' : 'bg-[var(--accent)]/15 text-[var(--accent)]'} shrink-0`}>
                {quotaExceededNotice ? <AlertTriangle size={22} /> : <HardDrive size={22} />}
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg text-[var(--text-main)] leading-snug">
                  {quotaExceededNotice ? 'App-Speicher für Offline-Audios ist voll 💾' : 'App-Speicher für Flugmodus verwalten'}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Geschützter Sandbox-Speicher auf diesem Gerät
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-alt)] transition-colors cursor-pointer shrink-0"
              aria-label="Schließen"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Hinweis bei vollem Speicher */}
            {quotaExceededNotice && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">Speicherplatz aufgebraucht</strong>
                  <span>
                    Bitte entferne mindestens ein älteres Audio aus deiner Liste unten, um wieder Platz für das neue Flugmodus-Audio zu schaffen.
                  </span>
                </div>
              </div>
            )}

            {/* Übersicht Dateianzahl & Belegung */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] text-xs">
              <div className="flex items-center gap-2 text-[var(--text-main)]">
                <ShieldCheck size={16} className="text-[var(--accent)]" />
                <span className="font-medium">Belegter Sandbox-Speicher:</span>
              </div>
              <div className="font-semibold text-sm text-[var(--accent)] font-mono">
                {totalMB} <span className="text-xs font-normal text-[var(--text-muted)]">({tracks.length} Audios)</span>
              </div>
            </div>

            {/* Liste der gespeicherten Audios */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Gespeicherte Flugmodus-Audios
              </h4>

              {tracks.length === 0 ? (
                <div className="p-8 text-center bg-[var(--bg-alt)] rounded-2xl border border-dashed border-[var(--border)]">
                  <CheckCircle2 size={24} className="mx-auto text-[var(--accent)] mb-2 opacity-60" />
                  <p className="text-xs font-medium text-[var(--text-main)]">
                    Keine Audios im Offline-Speicher hinterlegt.
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    Du kannst Audios jederzeit über das Download-Symbol für den Flugmodus speichern.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {tracks.map((track) => (
                    <div
                      key={track.productId}
                      className="p-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-[var(--text-main)] block truncate">
                          {track.title}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] font-mono">
                          {formatSizeBytes(track.sizeBytes)} • {new Date(track.cachedAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteTrack(track)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                        title="Dieses Audio aus Offline-Speicher entfernen"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alle Löschen Bestätigung */}
            {tracks.length > 0 && (
              <div className="pt-2 border-t border-[var(--border)]">
                {confirmClearAll ? (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 text-xs">
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      Wirklich ALLE {tracks.length} Offline-Audios löschen?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClearAll}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition cursor-pointer"
                      >
                        Ja, alle löschen
                      </button>
                      <button
                        onClick={() => setConfirmClearAll(false)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-muted)] text-xs hover:text-[var(--text-main)] transition cursor-pointer"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClearAll(true)}
                    className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors flex items-center gap-1.5 cursor-pointer underline-offset-2 hover:underline"
                  >
                    <Trash2 size={13} />
                    <span>Alle gespeicherten Flugmodus-Audios entfernen</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[var(--border)] bg-[var(--bg-alt)]/50">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            >
              Fertig
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

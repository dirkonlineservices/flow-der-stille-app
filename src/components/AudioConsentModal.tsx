/**
 * AudioConsentModal.tsx
 *
 * Einmaliges Consent-Gate vor dem ersten Audio-Abspielen.
 * Öffnet sich nur wenn hasAcceptedAudioConsent() = false.
 * Nach Bestätigung: Audio-Callback direkt starten + Consent persistent speichern.
 *
 * Verwendung in HoerprobenPlayer / AudiobookPlayerModal:
 *
 *   import { useAudioConsentGate } from './AudioConsentModal';
 *
 *   const { gate, requestPlay } = useAudioConsentGate();
 *   // im JSX:  {gate}
 *   // statt audio.play():  requestPlay('sample', produkt.titel, () => audio.play())
 */

import React, { useState, useCallback } from 'react';
import { ShieldAlert, Play, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AudioCategory,
  hasAcceptedAudioConsent,
  confirmAudioConsent,
} from '../lib/consentManager';
import { useAuth } from '../context/AuthContext';

// ─── Hook ──────────────────────────────────────────────────────────────────────

interface GateState {
  open: boolean;
  category: AudioCategory;
  title: string;
  callback: (() => void) | null;
}

const INITIAL: GateState = { open: false, category: 'sample', title: '', callback: null };

/**
 * Hook der das Consent-Gate verwaltet.
 * Gibt { gate, requestPlay } zurück.
 *
 * - `gate`        – das Modal als JSX-Element (immer im Tree rendern)
 * - `requestPlay` – vor jedem Audio-Start statt direktem audio.play() aufrufen
 */
export function useAudioConsentGate() {
  const { user } = useAuth();
  const [state, setState] = useState<GateState>(INITIAL);

  const requestPlay = useCallback(
    (category: AudioCategory, title: string, playCallback: () => void) => {
      if (hasAcceptedAudioConsent()) {
        // Bereits bestätigt → direkt abspielen
        playCallback();
        return;
      }
      // Noch nicht bestätigt → Modal öffnen, Callback merken
      setState({ open: true, category, title, callback: playCallback });
    },
    []
  );

  const handleAccept = useCallback(() => {
    if (!state.callback) return;
    const cb = state.callback;
    const { category, title } = state;
    setState(INITIAL); // Modal sofort schließen

    // 1. Audio SOFORT synchron starten (User-Gesture bleibt im Browser aktiv!)
    try {
      cb();
    } catch (err) {
      console.error('Play callback failed:', err);
    }

    // 2. Consent asynchron und blockierungsfrei im Hintergrund speichern
    confirmAudioConsent(category, title, user?.id ?? null).catch((e) => {
      console.warn('Consent save error:', e);
    });
  }, [state, user]);

  const handleClose = useCallback(() => {
    setState(INITIAL);
  }, []);

  const gate = (
    <AudioConsentModal
      isOpen={state.open}
      category={state.category}
      contentTitle={state.title}
      onAccept={handleAccept}
      onClose={handleClose}
    />
  );

  return { gate, requestPlay };
}

// ─── Modale UI ─────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  category: AudioCategory;
  contentTitle: string;
  onAccept: () => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<AudioCategory, string> = {
  sample:    'Hörprobe',
  meditation: 'Meditation',
  hypnosis:  'Selbsthypnose',
  audiobook: 'Hörbuch',
};

function AudioConsentModal({ isOpen, category, contentTitle, onAccept, onClose }: ModalProps) {
  const [checked, setChecked] = useState(false);

  // Checkbox zurücksetzen wenn Modal neu öffnet
  React.useEffect(() => {
    if (isOpen) setChecked(false);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="consent-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            key="consent-card"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {/* Accent-Bar oben */}
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl" style={{ backgroundColor: 'var(--accent)' }} />

            {/* Schließen-Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-alt)] transition-colors z-10 cursor-pointer"
              aria-label="Schließen"
            >
              <X size={16} />
            </button>

            <div className="p-6 sm:p-8 pt-8">
              {/* Icon + Überschrift */}
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border)' }}
                >
                  <ShieldAlert className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
                    {CATEGORY_LABELS[category]} · Wichtiger Hinweis
                  </p>
                  <h2
                    className="text-xl sm:text-2xl font-bold leading-tight"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-main)' }}
                  >
                    Haftungsausschluss
                  </h2>
                  {contentTitle && (
                    <p className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>
                      „{contentTitle}"
                    </p>
                  )}
                </div>
              </div>

              {/* Text */}
              <div
                className="text-sm leading-relaxed space-y-3 mb-5 max-h-[38vh] overflow-y-auto pr-1"
                style={{ color: 'var(--text-muted)' }}
              >
                <p>
                  Die hier angebotenen Meditationen, Tiefenentspannungen und Selbsthypnosen dienen
                  ausschließlich der persönlichen Entspannung und Selbsterfahrung. Sie stellen
                  ausdrücklich <strong style={{ color: 'var(--text-main)' }}>keine therapeutischen oder fachlichen
                  Behandlungen</strong> dar und ersetzen keinen Arzt, Therapeuten oder Fachberater.
                </p>

                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border)' }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                    Voraussetzungen für die Nutzung:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    <li>Setzt körperliche und geistige Gesundheit voraus.</li>
                    <li>Nicht bei Epilepsie, schweren Herzerkrankungen, Psychosen oder unter bewusstseinsverändernden Mitteln anwenden.</li>
                    <li>Niemals während des Autofahrens oder bei Tätigkeiten mit Aufmerksamkeitspflicht anwenden.</li>
                    <li>Die Nutzung erfolgt vollständig auf eigene Verantwortung.</li>
                  </ul>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t mb-5" style={{ borderColor: 'var(--border)' }} />

              {/* Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group mb-5">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: checked ? 'var(--accent)' : 'var(--bg-alt)',
                      border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    <Check className="w-3.5 h-3.5 text-white" style={{ opacity: checked ? 1 : 0 }} />
                  </div>
                </div>
                <span className="text-xs sm:text-sm select-none leading-relaxed" style={{ color: 'var(--text-main)' }}>
                  Ich habe den Hinweis gelesen und stimme der Nutzung auf eigene Verantwortung zu.
                </span>
              </label>

              {/* CTA-Button */}
              <button
                onClick={onAccept}
                disabled={!checked}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                style={{
                  backgroundColor: checked ? 'var(--accent)' : 'var(--bg-alt)',
                  color:           checked ? '#fff'          : 'var(--text-muted)',
                  border:          checked ? 'none'          : '1px solid var(--border)',
                  opacity:         checked ? 1               : 0.6,
                  cursor:          checked ? 'pointer'       : 'not-allowed',
                }}
              >
                <Play size={16} fill="currentColor" stroke="none" />
                Verstanden &amp; Abspielen
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AudioConsentModal;

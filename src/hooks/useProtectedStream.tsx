/**
 * useProtectedStream – gemeinsame Abspiel-Logik für alle Player mit Vollversionen.
 *
 * - Offline gespeicherte Audios (App-Speicher) werden direkt lokal abgespielt, auch ohne Netz.
 * - Sonst holt er erst beim Klick auf Play einen Kurzzeit-Link vom Audio-Worker.
 * - Gratis-Produkte (preis = 0) laufen auch ohne Login, Bezahlprodukte brauchen Login und Kauf.
 * - Ist der Link nach einer langen Pause abgelaufen (Player-Fehler 410/403),
 *   wird ein neuer Link geholt und an der gemerkten Position weitergespielt.
 * - Zeigt Login-Dialog (nicht eingeloggt), Kauf-Dialog (403) oder einen Hinweis
 *   „Audio gerade nicht verfügbar“ (404/5xx).
 */

import React, { useCallback, useRef, useState } from 'react';
import AuthRequiredModal from '../components/AuthRequiredModal';
import NoAccessModal from '../components/NoAccessModal';
import {
  getAudioStreamUrl,
  LoginRequiredError,
  NoAccessError,
  STREAM_LINK_TTL_MS,
} from '../lib/audioStream';
import { getOfflineBlobUrl } from '../lib/offlineAudioService';

type StreamProdukt = { id: string; titel?: string; preis?: number | string | null } | null | undefined;

const isStreamSrc = (audio: HTMLAudioElement) =>
  !!audio.src && !audio.src.startsWith('blob:') && audio.src !== window.location.href;

function seekWhenReady(audio: HTMLAudioElement, position: number) {
  if (!(position > 0)) return;
  const apply = () => {
    try { audio.currentTime = position; } catch { /* ignorieren */ }
  };
  if (audio.readyState >= 1) apply();
  else audio.addEventListener('loadedmetadata', apply, { once: true });
}

export function useProtectedStream(produkt: StreamProdukt) {
  const linkFetchedAtRef = useRef(0);
  const recoveringRef = useRef(false);
  const lastPositionRef = useRef(0);
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showNoAccess, setShowNoAccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const flashError = useCallback((msg: string) => {
    setErrorMessage(msg);
    window.setTimeout(() => setErrorMessage(''), 5000);
  }, []);

  const handleFailure = useCallback((e: unknown) => {
    if (e instanceof LoginRequiredError) setShowAuth(true);
    else if (e instanceof NoAccessError) setShowNoAccess(true);
    else flashError('Audio gerade nicht verfügbar. Bitte versuche es in einem Moment erneut.');
  }, [flashError]);

  /** Holt einen frischen Link und setzt ihn als Quelle, Position bleibt erhalten. */
  const loadFreshLink = useCallback(async (audio: HTMLAudioElement, position: number) => {
    if (!produkt?.id) throw new NoAccessError();
    const url = await getAudioStreamUrl(produkt.id);
    audio.src = url;
    linkFetchedAtRef.current = Date.now();
    seekWhenReady(audio, position);
  }, [produkt]);

  /**
   * Startet bzw. setzt die Wiedergabe fort. Holt bei Bedarf einen neuen Link.
   * Gibt true zurück, wenn die Wiedergabe läuft.
   */
  const play = useCallback(async (audio: HTMLAudioElement | null, opts: { startAt?: number } = {}): Promise<boolean> => {
    if (!audio) return false;

    // Bereits lokal geladen (Offline-Speicher): einfach weiterspielen
    if (audio.src.startsWith('blob:')) {
      if (opts.startAt !== undefined) seekWhenReady(audio, opts.startAt);
      try { await audio.play(); return true; } catch { return false; }
    }

    const hasSrc = isStreamSrc(audio);

    // Erster Start: offline gespeicherte Datei bevorzugen
    if (!hasSrc && produkt?.id) {
      const blobUrl = await getOfflineBlobUrl(produkt.id);
      if (blobUrl) {
        audio.src = blobUrl;
        seekWhenReady(audio, opts.startAt ?? 0);
        try { await audio.play(); return true; } catch { return false; }
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        flashError('Keine Internetverbindung. Dieses Audio ist noch nicht offline gespeichert.');
        return false;
      }
    }

    const expired = Date.now() - linkFetchedAtRef.current > STREAM_LINK_TTL_MS;

    if (!hasSrc || expired) {
      const position = opts.startAt ?? (hasSrc ? audio.currentTime : 0);
      setIsFetchingLink(true);
      try {
        await loadFreshLink(audio, position);
      } catch (e) {
        handleFailure(e);
        return false;
      } finally {
        setIsFetchingLink(false);
      }
    } else if (opts.startAt !== undefined) {
      seekWhenReady(audio, opts.startAt);
    }

    try {
      await audio.play();
      return true;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        // Browser hat das Abspielen nach dem Laden blockiert: der nächste Tipp spielt sofort.
        flashError('Bitte tippe noch einmal auf Play.');
      }
      return false;
    }
  }, [produkt, loadFreshLink, handleFailure, flashError]);

  /** Positionen mitschreiben, damit nach einem Fehler korrekt fortgesetzt wird. */
  const onAudioTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    const t = e.currentTarget.currentTime;
    if (t > 0) lastPositionRef.current = t;
  }, []);

  /**
   * Fehler-Handler für das <audio>-Element: Link abgelaufen (z. B. nach langer Pause
   * oder Spulen) → neuen Link holen, Position wiederherstellen, weiterspielen.
   */
  const onAudioError = useCallback(async (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    if (!isStreamSrc(audio) || recoveringRef.current) return;
    recoveringRef.current = true;
    const position = audio.currentTime > 0 ? audio.currentTime : lastPositionRef.current;
    setIsFetchingLink(true);
    try {
      await loadFreshLink(audio, position);
      await audio.play().catch(() => { /* Nutzer kann erneut auf Play tippen */ });
    } catch (err) {
      handleFailure(err);
    } finally {
      setIsFetchingLink(false);
      // Schutz gegen Endlosschleifen bei dauerhaft fehlerhaften Dateien
      window.setTimeout(() => { recoveringRef.current = false; }, 10000);
    }
  }, [loadFreshLink, handleFailure]);

  const modals = (
    <>
      <AuthRequiredModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <NoAccessModal
        isOpen={showNoAccess}
        onClose={() => setShowNoAccess(false)}
        produktId={produkt?.id}
        titel={produkt?.titel}
      />
      {errorMessage && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] px-4 py-3 rounded-xl bg-white border border-amber-300 shadow-lg text-sm text-stone-900 text-center"
        >
          {errorMessage}
        </div>
      )}
    </>
  );

  return {
    play,
    onAudioError,
    onAudioTimeUpdate,
    isFetchingLink,
    requireLogin: () => setShowAuth(true),
    modals,
  };
}

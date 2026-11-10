import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async'; // NEU
import App from './index.tsx';
import './index.css';
import { logSupabaseEnvStatus } from './lib/verifySupabaseEnv';
import { initConsentState } from './lib/tracking';
import { purgeLegacyOfflineAudio } from './lib/offlineAudioService';

// Client-side environment verification for Supabase credentials & Google Consent Mode init
logSupabaseEnvStatus();
initConsentState();
// Früher offline gespeicherte Audiodateien entfernen (nur noch geschütztes Streaming)
purgeLegacyOfflineAudio();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider> {/* NEU: Hier wird das SEO-Fundament gespannt */}
      <App />
    </HelmetProvider>
  </StrictMode>,
);
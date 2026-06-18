import { useEffect, useState, useRef } from 'react';
import { getSupabase } from '../lib/supabaseClient';

export default function NewsletterConfirmation() {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const confirmNewsletter = async () => {
      // 1. Token aus URL holen
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        return;
      }

      // 2. Supabase Update
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('newsletter_leads')
        .update({ 
          status: 'confirmed', 
          confirm_token: null,
          confirmed_at: new Date().toISOString()
        }) // Token invalidieren für Sicherheit
        .eq('confirm_token', token)
        .select();

      if (error || !data || data.length === 0) {
        setStatus('error');
        return;
      }

      // 3. Tracking: Der wahre Conversion-Hit!
      setStatus('success');
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'newsletter_doi_success',
        });
      }
    };

    confirmNewsletter();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--color-bg-body)', color: 'var(--color-text-main)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'var(--color-bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--color-border-main)', textAlign: 'center', maxWidth: '400px' }}>
        
        {status === 'loading' && <h2 style={{ color: 'var(--color-text-main)' }}>Bestätigung wird geprüft...</h2>}
        
        {status === 'success' && (
          <>
            <h2 style={{ color: 'var(--color-accent-primary)', marginBottom: '16px' }}>Willkommen im Flow!</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Deine E-Mail-Adresse wurde erfolgreich bestätigt. Du erhältst ab sofort unsere Impulse.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Link ungültig</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Dieser Bestätigungslink ist leider abgelaufen oder ungültig. Bitte registriere dich erneut in der App.</p>
          </>
        )}
      </div>
    </div>
  );
}

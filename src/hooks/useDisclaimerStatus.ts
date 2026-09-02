import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useDisclaimerStatus() {
  const { user } = useAuth();
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    if (!user) {
      const localAccepted = localStorage.getItem('flow_disclaimer_accepted') === 'true';
      setHasAccepted(localAccepted);
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('disclaimer_accepted_at')
        .eq('id', user.id)
        .maybeSingle();

      if (data && data.disclaimer_accepted_at) {
        setHasAccepted(true);
        localStorage.setItem('flow_disclaimer_accepted', 'true');
      } else {
        const localAccepted = localStorage.getItem('flow_disclaimer_accepted') === 'true';
        setHasAccepted(localAccepted);
      }
    } catch (err) {
      const localAccepted = localStorage.getItem('flow_disclaimer_accepted') === 'true';
      setHasAccepted(localAccepted);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const acceptDisclaimer = async () => {
    const timestamp = new Date().toISOString();
    localStorage.setItem('flow_disclaimer_accepted', 'true');
    setHasAccepted(true);

    if (user) {
      try {
        const supabase = getSupabase();
        await supabase
          .from('profiles')
          .upsert({ id: user.id, disclaimer_accepted_at: timestamp }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Could not sync disclaimer timestamp to Supabase profiles:', e);
      }
    }

    // Aufgabe 3: Korrekter GA4 Event-Name + user_id
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'disclaimer_accepted',
        user_id: user?.id ?? null,
        timestamp
      });
    }
  };

  return {
    hasAccepted,
    loading,
    acceptDisclaimer,
    refreshDisclaimerStatus: checkStatus
  };
}

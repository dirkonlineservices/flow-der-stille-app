import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { syncConsentAfterLogin } from '../lib/consentManager';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

// Das Interface angepasst an Supabase (id ist jetzt ein string)
interface User {
  id: string; 
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_premium: boolean;
  newsletter_optin?: boolean;
  purchased_products?: string[];
  completed_tasks?: string[];
  task_progress?: {
    current_task: number;
    completions: Record<number, number>;
    week_started_at?: Record<number, string>;
  };
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>; 
  isAuthFlow: boolean;
  setAuthFlow: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const CACHED_USER_KEY = 'flow_cached_user';

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('flow_cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isAuthFlow, setAuthFlow] = useState<boolean>(false);
  // Merkt sich, ob die aktuelle Session ein Passwort-Reset-Link-Login ist.
  // In diesem Fall soll SIGNED_IN den Nutzer NICHT in die App einloggen –
  // er soll erst sein neues Passwort auf der ResetPassword-Seite setzen.
  const isPasswordRecovery = React.useRef(false);

  useEffect(() => {
    const supabase = getSupabase();

    // 1. Beim ersten Laden schauen, ob jemand eingeloggt ist.
    // ABER: Falls die URL ein Recovery-Redirect ist, NICHT automatisch einloggen.
    const isRecoveryUrl =
      typeof window !== 'undefined' && (
        window.location.hash.includes('type=recovery') ||
        window.location.search.includes('type=recovery') ||
        window.location.pathname.includes('reset-password')
      );

    if (!isRecoveryUrl) {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.warn('Session error:', error.message);
          if (
            error.message.includes('Refresh Token') ||
            error.message.includes('Invalid Refresh Token') ||
            error.message.includes('refresh_token_not_found')
          ) {
            localStorage.removeItem('flow-der-stille-auth');
            localStorage.removeItem('flow_cached_user');
            supabase.auth.signOut().catch(() => {});
            setUser(null);
          }
        } else if (session?.user) {
          mapAndSetUser(session.user);
        }
      }).catch(err => {
        console.warn('Get session exception (evtl. Offline / Flugmodus):', err);
        // Im Flugmodus Session NICHT löschen, cached user bleibt aktiv!
      });
    }

    // 2. Echtzeit-Wächter: Reagiert sofort auf Logins oder Logouts!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Recovery-Link wurde geklickt → Flag setzen, NICHT in die App einloggen.
        // Die ResetPassword-Seite übernimmt ab hier.
        isPasswordRecovery.current = true;
        return;
      }

      if (event === 'SIGNED_IN' && isPasswordRecovery.current) {
        // Nach einem Recovery-Link feuert Supabase intern auch SIGNED_IN.
        // Das ignorieren wir – der Nutzer hat sein Passwort noch nicht geändert.
        return;
      }

      // Ab hier: normaler Login-Flow
      isPasswordRecovery.current = false;

      if (event === 'TOKEN_REFRESHED' && session?.user) {
        mapAndSetUser(session.user);
      } else if (event === 'SIGNED_IN' && session?.user) {
        mapAndSetUser(session.user);
        // Gast-Consent mit echter user_id verknüpfen (fire-and-forget)
        syncConsentAfterLogin(session.user.id).catch(() => {});
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session?.user) {
        mapAndSetUser(session.user);
      } else if (!session) {
        setUser(null);
      }
    });

    // Wächter beim Verlassen aufräumen
    return () => subscription.unsubscribe();
  }, []);


  // Hilfsfunktion: Wandelt Supabase-Daten in unser App-Format um
  const mapAndSetUser = async (supabaseUser: any) => {
    const metadata = supabaseUser.user_metadata || {};
    let firstName = metadata.first_name || '';
    let lastName = metadata.last_name || '';

    // Falls first_name in user_metadata fehlt, versuche aus profiles-Tabelle zu laden
    if (!firstName) {
      try {
        const supabase = getSupabase();
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', supabaseUser.id)
          .maybeSingle();

        if (profile) {
          if (profile.first_name) firstName = profile.first_name;
          if (profile.last_name) lastName = profile.last_name;
        }
      } catch (e) {
        console.warn('Could not fetch profile names:', e);
      }
    }

    const mappedUser: User = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      first_name: firstName,
      last_name: lastName,
      // Nutze den Vornamen, falls vorhanden, sonst den Teil der E-Mail vor dem @
      username: firstName || supabaseUser.email?.split('@')[0] || 'Traveler',
      is_premium: !!metadata.is_premium, 
      newsletter_optin: !!metadata.newsletter_optin,
      purchased_products: metadata.purchased_products || [],
      completed_tasks: metadata.completed_tasks || [],
      task_progress: metadata.task_progress || { current_task: 0, completions: {} },
    };

    try {
      localStorage.setItem('flow_cached_user', JSON.stringify(mappedUser));
    } catch (e) {
      console.warn('Could not cache user locally:', e);
    }

    // Letzten Login / Aktivitäts-Zeitstempel & installierte App-Version in profiles festhalten
    if (supabaseUser.id) {
      (async () => {
        try {
          const supabase = getSupabase();
          const lastLoginTime = supabaseUser.last_sign_in_at || new Date().toISOString();

          // Ermittle exakte App-Version des Handys / Browsers
          let clientVersion = 'Web v5.2.1';
          try {
            if (Capacitor.isNativePlatform()) {
              const info = await CapApp.getInfo();
              clientVersion = `Android App v${info.version}`;
            } else {
              const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              clientVersion = isMobile ? 'Mobile Web v5.2.1' : 'Desktop Web v5.2.1';
            }
          } catch (e) {
            clientVersion = 'Web v5.2.1';
          }

          await supabase
            .from('profiles')
            .update({ 
              updated_at: lastLoginTime,
              premium_type: clientVersion
            })
            .eq('id', supabaseUser.id);
        } catch (e) {}
      })();
    }

    setUser(mappedUser);
  };

  const login = (userData: User) => {
    try {
      localStorage.setItem('flow_cached_user', JSON.stringify(userData));
    } catch (e) {}
    setUser(userData);
  };

  const refreshUser = async () => {
    const supabase = getSupabase();
    // Re-fetch the user from supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      mapAndSetUser(session.user);
    }
  };

  const logout = async () => {
    const supabase = getSupabase();
    try {
      localStorage.removeItem('flow_cached_user');
      localStorage.removeItem('flow-der-stille-auth');
    } catch (e) {}
    // Sicherer Logout über Supabase
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, refreshUser, isAuthFlow, setAuthFlow }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

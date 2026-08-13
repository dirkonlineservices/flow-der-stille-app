import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabase } from '../lib/supabaseClient'; 

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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthFlow, setAuthFlow] = useState<boolean>(false);

  useEffect(() => {
    const supabase = getSupabase();

    // 1. Beim ersten Laden schauen, ob jemand eingeloggt ist
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Session error:', error.message);
        if (
          error.message.includes('Refresh Token') ||
          error.message.includes('Invalid Refresh Token') ||
          error.message.includes('refresh_token_not_found')
        ) {
          // Nur den spezifischen auth-storage-key löschen (nicht alles)
          localStorage.removeItem('flow-der-stille-auth');
          supabase.auth.signOut().catch(() => {});
        }
      } else if (session?.user) {
        mapAndSetUser(session.user);
      }
    }).catch(err => {
      console.warn('Get session exception:', err);
      localStorage.removeItem('flow-der-stille-auth');
    });

    // 2. Echtzeit-Wächter: Reagiert sofort auf Logins oder Logouts!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Bei Password-Recovery-Flow: Session setzen aber nicht navigieren
        // (das übernimmt die ResetPassword-Seite)
        if (session?.user) {
          mapAndSetUser(session.user);
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token-Refresh: User-State aktualisieren
        mapAndSetUser(session.user);
      } else if (event === 'SIGNED_IN' && session?.user) {
        mapAndSetUser(session.user);
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
  const mapAndSetUser = (supabaseUser: any) => {
    const metadata = supabaseUser.user_metadata || {};
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email,
      first_name: metadata.first_name || '',
      last_name: metadata.last_name || '',
      // Nutze den Vornamen, falls vorhanden, sonst den Teil der E-Mail vor dem @
      username: metadata.first_name || supabaseUser.email?.split('@')[0] || 'Traveler',
      is_premium: !!metadata.is_premium, 
      newsletter_optin: !!metadata.newsletter_optin,
      purchased_products: metadata.purchased_products || [],
      completed_tasks: metadata.completed_tasks || [],
      task_progress: metadata.task_progress || { current_task: 0, completions: {} },
    });
  };

  const login = (userData: User) => {
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
    // Sicherer Logout über Supabase
    await supabase.auth.signOut();
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

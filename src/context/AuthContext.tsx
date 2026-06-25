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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    // 1. Beim ersten Laden schauen, ob jemand eingeloggt ist
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapAndSetUser(session.user);
      }
    });

    // 2. Echtzeit-Wächter: Reagiert sofort auf Logins oder Logouts!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapAndSetUser(session.user);
      } else {
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
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, refreshUser }}>
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

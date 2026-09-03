import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Shield, Lock, FileText, CheckCircle2, 
  AlertCircle, Sparkles, ShoppingBag, Eye, 
  Trash2, Download, LogOut, ArrowRight, Settings as SettingsIcon, Award, Sun, Moon, HardDrive, WifiOff,
  ShieldCheck, Gift, ChevronDown, ChevronUp, RefreshCw, BarChart3, Users
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { getSupabase } from '../lib/supabaseClient';
import { subscribeToNewsletter, unsubscribeFromNewsletter } from '../lib/newsletterService';
import SEO from '../components/SEO';
import { AuthLink } from '../components/CookieBanner';
import { PRODUCTS } from '../data/store';
import { getStorageUsageSummary } from '../lib/offlineAudioService';
import { OfflineStorageModal } from '../components/OfflineStorageModal';
import { FriendInviteWidget } from '../components/FriendInviteWidget';
import { GamificationRadar } from '../components/GamificationRadar';

export default function Settings() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Password Form States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Purchased products state
  const [purchases, setPurchases] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  // Offline audio storage state
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineStats, setOfflineStats] = useState({ totalMBFormatted: '0 MB', totalTracks: 0 });
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
  const [isAdminSectionOpen, setIsAdminSectionOpen] = useState(false);

  // Admin Live-Statistiken State
  const [adminStats, setAdminStats] = useState<{
    totalUsers: number;
    newUsers7Days: number;
    totalPurchases: number;
    totalReviews: number;
    averageRating: number;
  } | null>(null);
  const [loadingAdminStats, setLoadingAdminStats] = useState(false);

  const loadAdminStats = async () => {
    setLoadingAdminStats(true);
    try {
      const supabase = getSupabase();
      const [profilesRes, purchasesRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('created_at'),
        supabase.from('kaeufe').select('*', { count: 'exact', head: true }),
        supabase.from('produkt_bewertungen').select('sterne')
      ]);

      const allProfiles = profilesRes.data || [];
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const new7Days = allProfiles.filter(p => p.created_at && new Date(p.created_at).getTime() >= sevenDaysAgo).length;

      const reviews = reviewsRes.data || [];
      const avgRating = reviews.length > 0 
        ? Number((reviews.reduce((acc: number, r: any) => acc + (r.sterne || 0), 0) / reviews.length).toFixed(1))
        : 5.0;

      setAdminStats({
        totalUsers: allProfiles.length,
        newUsers7Days: new7Days,
        totalPurchases: purchasesRes.count || 0,
        totalReviews: reviews.length,
        averageRating: avgRating
      });
    } catch (e) {
      console.warn('Fehler beim Laden der Admin-Statistiken:', e);
    } finally {
      setLoadingAdminStats(false);
    }
  };

  const refreshOfflineStats = () => {
    const summary = getStorageUsageSummary();
    setOfflineStats({ totalMBFormatted: summary.totalMBFormatted, totalTracks: summary.totalTracks });
  };

  // Sync profile fields from user context once loaded
  useEffect(() => {
    refreshOfflineStats();
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setNewsletter(!!user.newsletter_optin);
      
      // Check admin role from public.profiles
      const supabase = getSupabase();
      supabase
        .from('profiles')
        .select('rolle')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.rolle?.toLowerCase() === 'admin') {
            setIsAdminUser(true);
            loadAdminStats();
          } else {
            setIsAdminUser(false);
          }
        });

      // Fetch purchases
      fetchPurchases();
    }
  }, [user]);

  const fetchPurchases = async () => {
    if (!user) return;
    const supabase = getSupabase();
    
    // Join with produkt table to get product info
    const { data: kaeufe, error } = await supabase
      .from('kaeufe')
      .select('*, produkt:produkt_id(*)')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Fehler beim Laden der Käufe:', error);
      return;
    }
    
    setPurchases(kaeufe || []);
    
    // Calculate total
    const total = (kaeufe || []).reduce((sum, k) => sum + (parseFloat(k.preis) || 0), 0);
    setTotalSpent(total);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // 1. Funktion: Newsletter nachträglich abonnieren (beim Klick auf Profil speichern)
  const handleNewsletterOptIn = async (userEmail: string) => {
    const confirmToken = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'doi_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    // A: Upsert in die Supabase Tabelle (falls der Nutzer noch gar nicht drin stand)
    const { error: dbError } = await getSupabase()
      .from('newsletter_leads')
      .upsert({ 
        email: userEmail, 
        status: 'pending_doi',
        confirm_token: confirmToken,
        source: 'account_settings',
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (dbError) {
      console.error("Fehler beim Datenbankupdate:", dbError.message);
      return;
    }

    // B: Edge Function für Resend Mail aufrufen
    const { error: edgeError } = await getSupabase().functions.invoke('send-double-opt-in-email', {
      body: { email: userEmail, confirm_token: confirmToken }
    });

    if (edgeError) {
      console.error("Fehler beim E-Mail Versand:", edgeError.message);
      return;
    }

    // C: Tracking für Looker Studio
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'newsletter_optin',
        lead_source: 'account_settings',
        lead_status: 'pending_doi'
      });
    }

    console.log("Bitte prüfe dein Postfach, um den Newsletter zu bestätigen.");
  };

  // 2. Funktion: Newsletter abbestellen (beim Klick auf den roten Button)
  const handleNewsletterOptOut = async (userEmail: string) => {
    const { error: unsubError } = await getSupabase()
      .from('newsletter_leads')
      .update({ 
        status: 'unsubscribed',
        updated_at: new Date().toISOString()
      })
      .eq('email', userEmail);

    if (unsubError) {
      console.error("Fehler beim Abmelden:", unsubError.message);
      setProfileError("Fehler beim Abmelden: " + unsubError.message);
      return;
    }

    // Feuere das DataLayer-Tracking für die Abmeldung:
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'newsletter_unsubscribe',
        lead_source: 'account_settings',
        lead_status: 'unsubscribed'
      });
    }

    setNewsletter(false);
    setProfileSuccess("Du wurdest erfolgreich vom Newsletter abgemeldet.");
    console.log("Du wurdest erfolgreich vom Newsletter abgemeldet.");
  };

  // Update profile handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    let profileData: any = {
      first_name: firstName,
      last_name: lastName,
      newsletter_optin: newsletter,
    };

    // Sync newsletter status if changed
    if (user.email) {
      if (newsletter && !user.newsletter_optin) {
        profileData.newsletter_optin_timestamp = new Date().toISOString();
        await handleNewsletterOptIn(user.email);
      } else if (!newsletter && user.newsletter_optin) {
        await handleNewsletterOptOut(user.email);
      }
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({
        data: profileData
      });

      if (error) {
        setProfileError(error.message);
      } else {
        // Synchronisierung in public.profiles – damit AuthContext beim nächsten
        // Login den aktuellen Namen aus der Profiles-Tabelle lesen kann
        // und das NamePromptModal nicht erneut erscheint.
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email || '',
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        setProfileSuccess('Dein Profil wurde erfolgreich aktualisiert!');
      }
    } catch (err) {
      setProfileError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Update password handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPasswordSuccess('');
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Die eingegebenen Passwörter stimmen nicht überein.');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setPasswordLoading(true);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess('Dein Passwort wurde erfolgreich geändert!');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError('Konnte Passwort nicht aktualisieren.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      newsletterOptin: user.newsletter_optin,
      purchasedProducts: user.purchased_products,
      exportedAt: new Date().toISOString(),
      source: 'Flow-der-Stille App Safe'
    };
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meines-datenblatt-${user.email}.json`;
    a.click();
  };

  const handleDeleteAccount = async () => {
     if (securityAnswer.toLowerCase() !== 'flow der stille') {
        alert('Die Antwort ist inkorrekt.');
        return;
     }

     setDeleteLoading(true);
     try {
        const supabase = getSupabase();
        // 1. Delete purchases from Supabase
        const { error: purchaseError } = await supabase
           .from('kaeufe')
           .delete()
           .eq('user_id', user!.id);
        
        if (purchaseError) {
           throw new Error('Fehler beim Löschen der Käufe.');
        }

        // 2. Call server API for local SQLite deletion
        const response = await fetch('/api/user/delete', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
           throw new Error('Fehler beim Löschen des lokalen Profils.');
        }

        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ event: 'account_deleted', user_id: user.id });

        // 3. Optional: Sign user out of Supabase
        await logout();
        navigate('/login');
     } catch (err: any) {
        alert(err.message || 'Netzwerkfehler beim Löschen des Accounts.');
     } finally {
        setDeleteLoading(false);
        setShowDeleteModal(false);
     }
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-8 px-4">
      
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[var(--color-border-main)]">
              <h3 className="text-xl font-serif text-red-700 mb-4">Account permanent löschen?</h3>
              <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                 Dies ist ein unwiderruflicher Vorgang. Alle deine Daten, Käufe und Fortschritte werden dauerhaft entfernt. Dies entspricht unseren DSGVO-Richtlinien zur Datenlöschung.
                 <br/><br/>
                 Bitte gib zur Bestätigung den Namen der App ein: <span className="font-bold">Flow der Stille</span>
              </p>
              
              <input
                 type="text"
                 value={securityAnswer}
                 onChange={(e) => setSecurityAnswer(e.target.value)}
                 className="w-full px-4 py-3 bg-[var(--color-bg-alt)] rounded-xl border border-[var(--color-border-main)] focus:ring-2 focus:ring-red-500 outline-none text-sm mb-6"
                 placeholder="Name eingeben..."
              />
              
              <div className="flex gap-3">
                 <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-sm transition-all"
                 >
                    Abbrechen
                 </button>
                 <button 
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm transition-all"
                 >
                    {deleteLoading ? 'Lösche...' : 'Jetzt löschen'}
                 </button>
              </div>
           </div>
        </div>
      )}
      
      <SEO title="Einstellungen" description="Verwalte deine persönlichen Angaben, ändere dein Passwort und betrachte deine Einkäufe." />
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="text-[var(--color-accent-primary)] w-8 h-8" />
          <h1 className="text-4xl font-serif text-[var(--color-accent-primary)]">Konto & App-Einstellungen</h1>
        </div>
        <p className="text-[var(--color-text-muted)] text-base max-w-2xl">
          Verwalte deine persönlichen Angaben, ändere dein Passwort, wirf einen Blick in deine erworbenen Kurse oder lade deine gespeicherten Daten herunter.
        </p>
      </header>

      {!user ? (
        <div className="bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] rounded-3xl p-8 text-center max-w-xl mx-auto">
          <User className="mx-auto w-12 h-12 text-[var(--color-text-muted-light)] mb-4" />
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-2">Du bist nicht eingeloggt</h2>
          <p className="text-[var(--color-text-muted)] text-sm mb-6 leading-relaxed">
            Um dein Profil anzupassen, deinen Vornamen zu pflegen, Passwörter zu konfigurieren oder Kurse freizuschalten, melde dich bitte an oder erstelle ein neues Konto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <AuthLink 
              to="/login" 
              className="px-6 py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl transition-all"
            >
              Einloggen
            </AuthLink>
            <AuthLink 
              to="/register" 
              className="px-6 py-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] text-[var(--color-text-main)] font-medium rounded-xl hover:bg-[var(--color-bg-alt)] transition-all"
            >
              Registrieren
            </AuthLink>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto space-y-8 transition-all duration-300">
          
          {/* 1. Quick Profile Overview & Dashboard Navigation Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[var(--color-bg-card)] border border-[var(--color-border-main)] shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-primary)] text-white flex items-center justify-center text-2xl font-serif font-bold shrink-0 shadow-xs">
                {(user.first_name || user.username || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--color-text-main)]">
                    Hallo, {user.first_name || user.username || 'Achtsamkeits-Freund'}!
                  </h2>
                  {isAdminUser && (
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                  <span className="text-[10px] bg-[var(--color-bg-border)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-full font-semibold uppercase">
                    Mitglied seit {new Date().getFullYear()}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <Link
                to="/dashboard"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition flex items-center justify-center gap-2"
              >
                <span>👉 Zum persönlichen Dashboard</span>
                <ArrowRight size={14} />
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-border)] text-[var(--color-text-main)] transition cursor-pointer border border-[var(--color-border-main)] shrink-0"
                title={theme === 'dark' ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
                aria-label="Design umschalten"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* 2. Admin-Bereich & Live-Statistiken (nur für Admins sichtbar, standardmäßig ZUGEKLAPPT zum Schutz personenbezogener Daten) */}
          {isAdminUser && (
            <section className="bg-emerald-50/80 dark:bg-emerald-950/30 rounded-3xl border border-emerald-300 dark:border-emerald-800/60 shadow-xs overflow-hidden transition-all duration-300">
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-serif font-bold text-emerald-950 dark:text-emerald-100">
                        Admin-Bereich &amp; Live-Statistiken
                      </h2>
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Admin
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                      {isAdminSectionOpen 
                        ? 'Live-Statistiken & Gamification-Radar geöffnet. Zum Schutz hier wieder zuklappen.' 
                        : 'Zum Schutz personenbezogener Daten standardmäßig eingeklappt.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <Link
                    to="/admin"
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Geschützte Admin-Zentrale mit PIN-Sperre & Nutzerverwaltung öffnen"
                  >
                    <span>Admin-Zentrale öffnen</span>
                    <ArrowRight size={14} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !isAdminSectionOpen;
                      setIsAdminSectionOpen(next);
                      if (next && !adminStats) loadAdminStats();
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    aria-expanded={isAdminSectionOpen}
                  >
                    <span>{isAdminSectionOpen ? 'Bereich zuklappen' : 'Statistiken aufklappen'}</span>
                    {isAdminSectionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Aufgeklappter Inhalt (Statistiken & Gamification-Radar) */}
              {isAdminSectionOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-5 animate-fade-in">
                  
                  {/* Statuszeile mit Aktualisieren-Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-emerald-900/80 dark:text-emerald-200/80 font-medium">
                      Echtzeit-Kennzahlen &amp; 52-Wochen Gamification Monitor
                    </span>
                    <button
                      onClick={loadAdminStats}
                      disabled={loadingAdminStats}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer"
                      title="Statistiken neu laden"
                    >
                      <RefreshCw size={13} className={loadingAdminStats ? 'animate-spin' : ''} />
                      <span>Aktualisieren</span>
                    </button>
                  </div>

                  {/* 4 Live-Statistik Kacheln */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                        👥 Nutzer gesamt
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 dark:text-white mt-1">
                        {adminStats?.totalUsers ?? '...'}
                      </div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                        +{adminStats?.newUsers7Days ?? 0} letzte 7 Tage
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                        💎 Käufe gesamt
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 dark:text-white mt-1">
                        {adminStats?.totalPurchases ?? '...'}
                      </div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                        Verifizierte Käufe
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                        ⭐ Bewertungen
                      </span>
                      <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 dark:text-white mt-1">
                        {adminStats?.totalReviews ?? 0}
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5 block font-semibold">
                        Ø {adminStats?.averageRating ?? '5.0'} Sterne
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                        🎁 Freischaltungen
                      </span>
                      <Link
                        to="/admin"
                        className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Zur Verwaltung →</span>
                      </Link>
                    </div>
                  </div>

                  {/* 52-Wochen Gamification Radar & Alarm-Monitor */}
                  <div className="pt-2">
                    <GamificationRadar />
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 3. Persönliche Daten & Passwort nebeneinander */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* 1. Profile information */}
            <section className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border-main)] p-6 md:p-8">
              <h2 className="text-2xl font-serif text-[var(--color-text-main)] mb-6 flex items-center gap-2">
                <User size={22} className="text-[var(--color-accent-primary)]" />
                Persönliche Daten und Profil
              </h2>

              {profileSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 text-sm border border-emerald-100">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                  <AlertCircle size={18} className="shrink-0 text-red-600" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Vorname</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Dein Vorname"
                      className="w-full px-4 py-3 bg-[var(--color-bg-alt)] rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none text-sm transition-all text-[var(--color-text-main)] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Nachname</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dein Nachname"
                      className="w-full px-4 py-3 bg-[var(--color-bg-alt)] rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none text-sm transition-all text-[var(--color-text-main)] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">E-Mail-Adresse (nicht änderbar)</label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-[var(--color-bg-border)] text-[var(--color-text-muted)] rounded-xl border-none outline-none text-sm cursor-not-allowed font-medium"
                  />
                  <p className="text-[var(--color-text-muted-light)] text-[11px] mt-1">E-Mail-Adressen sind fest mit deinem Flow der Stille-Konto verknüpft.</p>
                </div>

                {/* Newsletter Preference Section */}
                <div className="pt-4 border-t border-[var(--color-border-main)] mt-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-stone-300 text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)] shrink-0"
                    />
                    <div>
                      <span className="text-sm font-medium text-[var(--color-text-main)]">
                        Newsletter abonnieren
                      </span>
                      <p className="text-xs text-[var(--color-text-muted-light)] mt-1 italic">
                        Erhalte einmal im Monat wertvolle, kuratierte Ratschläge zum Thema Darm-Hirn-Achse.
                      </p>
                    </div>
                  </label>

                  {newsletter && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (user?.email) {
                          await handleNewsletterOptOut(user.email);
                          const supabase = getSupabase();
                          await supabase.auth.updateUser({ data: { newsletter_optin: false } });
                        }
                        setNewsletter(false);
                        setProfileSuccess('Du wurdest erfolgreich vom Newsletter abgemeldet.');
                      }}
                      className="mt-4 px-4 py-2 text-xs font-semibold bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors border border-red-200"
                    >
                      Newsletter jetzt abbestellen
                    </button>
                  )}
                </div>

                <div className="pt-4 text-right">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {profileLoading ? 'Aktualisiere...' : 'Profil speichern'}
                  </button>
                </div>
              </form>
            </section>

            {/* 2. Change password section */}
            <section className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border-main)] p-6 md:p-8">
              <h2 className="text-2xl font-serif text-[var(--color-text-main)] mb-6 flex items-center gap-2">
                <Lock size={22} className="text-[var(--color-accent-primary)]" />
                Passwort ändern
              </h2>

              {passwordSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 text-sm border border-emerald-100">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                  <AlertCircle size={18} className="shrink-0 text-red-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Neues Passwort</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-[var(--color-bg-alt)] rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none text-sm transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Bestätigen</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-[var(--color-bg-alt)] rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none text-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 text-right">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {passwordLoading ? 'Speichere...' : 'Sicher ändern'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* 4. Meine gemeisterten Aufgaben (Mein Achtsamkeits-Fortschritt) */}
          <section className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border-main)] p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-[var(--color-accent-primary)] w-6 h-6" />
                <h2 className="text-2xl font-serif text-[var(--color-text-main)]">Mein Achtsamkeits-Fortschritt</h2>
              </div>
              <p className="text-[var(--color-text-muted-light)] text-xs mb-6">
                Ein Journal deiner erfolgreich absolvierten täglichen Impulse und wöchentlichen Aufgaben, sicher verwahrt in deinem Profil.
              </p>

              {user.completed_tasks && user.completed_tasks.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {user.completed_tasks.map((key) => {
                    // Helper to translate task keys
                    let type = 'Impuls';
                    let title = key;
                    let desc = 'Erfolgreich abgeschlossen';
                    let isWeekly = key.startsWith('weekly_challenge_week_');

                    if (key.startsWith('exercise_')) {
                      type = 'Achtsamkeitsübung';
                      const parts = key.split('_');
                      const dateStr = parts[parts.length - 1];
                      const exerciseId = parts.slice(1, parts.length - 1).join('_');

                      if (exerciseId === 'pmr') title = 'Progressive Muskelentspannung';
                      else if (exerciseId === '478-breathing') title = '4-7-8 Atmungs-Session';
                      else if (exerciseId === 'box-breathing') title = 'Box-Atmungs-Session';
                      else if (exerciseId === 'neck-stretches') title = 'Sanfte Nackendehnungen';
                      else title = exerciseId;

                      let formattedDate = dateStr;
                      const dateParts = dateStr.split('-');
                      if (dateParts.length === 3) {
                        formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
                      }
                      desc = `Gemeistert am ${formattedDate}`;
                    } else if (isWeekly) {
                      // example format: weekly_challenge_week_1_V1_2026-06-07
                      const parts = key.split('_');
                      const weekNum = parts[3] || '?';
                      const versionPart = parts.length > 4 && parts[4].startsWith('V') ? parts[4].replace('V', '') : '1';
                      const dateStr = parts.length > 5 ? parts[parts.length - 1] : '';

                      type = 'Wochenaufgabe';
                      title = `Level ${weekNum}`;
                      
                      let formattedDate = dateStr;
                      if (formattedDate) {
                        const dateParts = formattedDate.split('-');
                        if (dateParts.length === 3) {
                          formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
                        }
                      }
                      
                      desc = formattedDate ? `Meilenstein #${versionPart} am ${formattedDate}` : 'Als gemeistert markiert';
                    } else if (key.includes('_202')) {
                      // daily_lemon_water_2026-06-06
                      type = 'Täglicher Impuls';
                      const parts = key.split('_');
                      const dateStr = parts[parts.length - 1];
                      const taskId = parts.slice(0, parts.length - 1).join('_');
                      
                      if (taskId === 'daily_lemon_water') title = 'Zitronenwasser am Morgen';
                      else if (taskId === 'daily_box_breathing') title = 'Fokussierte Box-Atmung';
                      else if (taskId === 'daily_no_screen_meal') title = 'Analoges Essen ohne Bildschirm';
                      else if (taskId === 'daily_neck_stretches') title = 'Lockernde Nackendehnungen';
                      else if (taskId === 'daily_evening_offline') title = 'Bildschirmfreie Abendruhe';
                      else if (taskId === 'daily_humming_vagus') title = 'Vagusnerv-Summen';
                      else if (taskId === 'daily_herbal_tea') title = 'Achtsame Kräuterteepause';
                      else if (taskId === 'daily_wisdom') title = 'Tägliche Weisheit reflektiert';
                      
                      let formattedDate = dateStr;
                      const dateParts = dateStr.split('-');
                      if (dateParts.length === 3) {
                        formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
                      }
                      desc = `Abgeschlossen am ${formattedDate}`;
                    }

                    return (
                      <div 
                        key={key} 
                        className="p-4 bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] rounded-2xl"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl shrink-0 ${isWeekly ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              <CheckCircle2 size={16} />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted-light)] block tracking-wider">{type}</span>
                              <h4 className="text-sm font-medium text-[var(--color-text-main)]">{title}</h4>
                            </div>
                          </div>
                          <span className="text-xs text-[var(--color-text-muted)] italic shrink-0 sm:text-right">{desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-[var(--color-bg-alt)] rounded-2xl border border-dashed border-[var(--color-border-main)]">
                  <Sparkles className="mx-auto text-stone-300 w-8 h-8 mb-2" />
                  <p className="text-[var(--color-text-muted)] text-sm">Noch keine Aufgaben abgeschlossen.</p>
                  <p className="text-[var(--color-text-muted-light)] text-xs mt-1">Absolviere deinen ersten Tagesimpuls oder deine Wochenaufgabe auf der Startseite!</p>
                </div>
              )}
            </section>

          {/* 5. Meine gekauften Produkte (Aufklappbar!) */}
          <section className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border-main)] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPurchasesOpen(!isPurchasesOpen)}
              className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-[var(--color-bg-alt)]/50 transition-colors cursor-pointer"
              aria-expanded={isPurchasesOpen}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center shrink-0">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-serif text-[var(--color-text-main)]">
                      Meine gekauften Produkte
                    </h2>
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs">
                      {purchases.length} {purchases.length === 1 ? 'Inhalt' : 'Inhalte'}
                    </span>
                  </div>
                  <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                    {isPurchasesOpen 
                      ? 'Klicke hier zum Zuklappen' 
                      : 'Klicke hier zum Aufklappen deiner freigeschalteten Kurse & Meditationen'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent-primary)] shrink-0 pl-3">
                <span className="hidden sm:inline">{isPurchasesOpen ? 'Zuklappen' : 'Aufklappen'}</span>
                {isPurchasesOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
              </div>
            </button>

            {isPurchasesOpen && (
              <div className="p-6 md:p-8 pt-2 border-t border-[var(--color-border-main)]/60 space-y-4 animate-fade-in">
                <p className="text-[var(--color-text-muted-light)] text-xs mb-2">
                  Deine verifizierten Angebote und freigeschalteten Kurse. Verwaltet über die Supabase-Datenbank zur lückenlosen Absicherung deiner Käufe.
                </p>

                {purchases.length > 0 ? (
                  <div className="space-y-3">
                    {purchases.map((kauf: any) => {
                      const course = kauf.produkt;
                      return (
                        <div 
                          key={kauf.id}
                          className="p-4 sm:p-5 rounded-2xl border transition-all bg-[var(--color-bg-alt)]/55 border-[var(--color-border-main)]"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-700 text-white shadow-2xs">
                                Aktiviert
                              </span>
                              <h3 className="text-base sm:text-lg font-serif text-[var(--color-text-main)] mt-1.5 font-bold">
                                {course?.titel || 'Unbekanntes Produkt'}
                              </h3>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-[var(--color-text-main)] block">{kauf.preis} €</span>
                              <span className="text-xs text-[var(--color-text-muted-light)] block">{new Date(kauf.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <p className="text-[var(--color-text-muted)] text-xs leading-relaxed mb-3">{course?.beschreibung}</p>

                          <div className="flex items-center justify-end pt-2 border-t border-[var(--color-border-main)]">
                            <Link 
                              to={`/premium-dashboard#product-${course?.id || kauf.produkt_id}`}
                              className="px-4 py-1.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                            >
                              <Eye size={13} />
                              <span>Zum Produkt / Anhören</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}

                    <div className="p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] font-semibold text-sm text-right">
                      Gesamtausgaben: <span className="text-[var(--color-accent-primary)]">{totalSpent.toFixed(2)} €</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[var(--color-text-muted)] text-center p-6 border border-dashed border-[var(--color-border-main)] rounded-2xl">
                    <p className="mb-2 text-sm">Noch keine Inhalte erworben.</p>
                    <Link
                      to="/premium-dashboard"
                      className="text-xs font-bold text-[var(--color-accent-primary)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>In der Mediathek stöbern →</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 6. Freunde werben Empfehlungslink (In voller Breite) */}
          <div>
            <FriendInviteWidget />
          </div>

          {/* 7. Speicher, Datenschutz & Abmelden (3 Spalten Footer) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Flugmodus & Offline-Speicher Card */}
            <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 border border-[var(--color-border-main)] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif text-[var(--color-text-main)] text-base font-semibold flex items-center gap-2">
                    <WifiOff size={18} className="text-[var(--color-accent-primary)]" />
                    <span>Flugmodus-Speicher</span>
                  </h4>
                  <span className="text-xs font-mono font-semibold text-[var(--color-accent-primary)] bg-[var(--color-bg-alt)] px-2.5 py-1 rounded-full border border-[var(--color-border-main)]">
                    {offlineStats.totalMBFormatted}
                  </span>
                </div>
                <p className="text-[var(--color-text-muted)] text-xs leading-relaxed mb-4">
                  Sicher im geschützten App-Speicher hinterlegt ({offlineStats.totalTracks} {offlineStats.totalTracks === 1 ? 'Audio' : 'Audios'}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOfflineModal(true)}
                className="w-full py-2.5 px-3 bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-border)] text-[var(--color-text-main)] text-xs font-semibold rounded-xl flex items-center justify-between transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <HardDrive size={14} className="text-[var(--color-accent-primary)]" />
                  <span>Speicher verwalten</span>
                </span>
                <span className="text-[11px] text-[var(--color-accent-primary)] font-bold">Öffnen →</span>
              </button>
            </div>

            {/* GDPR Box */}
            <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 border border-[var(--color-border-main)] shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-[var(--color-text-main)] text-base font-semibold mb-2 flex items-center gap-2">
                  <Shield size={18} className="text-[var(--color-accent-primary)]" />
                  <span>Datenschutz &amp; DSGVO</span>
                </h4>
                <p className="text-[var(--color-text-muted)] text-xs leading-relaxed mb-4">
                  Sämtliche Kommunikation und Datensätze sind nach DSGVO geschützt.
                </p>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="w-full py-2 px-3 bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-border)] text-[var(--color-text-main)] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download size={13} />
                  <span>Daten exportieren (JSON)</span>
                </button>
                <Link
                  to="/datenschutz"
                  className="w-full py-2 px-3 bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-border)] text-[var(--color-text-main)] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all block text-center"
                >
                  <FileText size={13} />
                  <span>Datenschutzerklärung</span>
                </Link>
              </div>
            </div>

            {/* Konto & Abmelden Card */}
            <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 border border-[var(--color-border-main)] shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-[var(--color-text-main)] text-base font-semibold mb-2 flex items-center gap-2">
                  <User size={18} className="text-[var(--color-accent-primary)]" />
                  <span>Sitzung &amp; Konto</span>
                </h4>
                <p className="text-[var(--color-text-muted)] text-xs leading-relaxed mb-4">
                  Beende deine aktuelle Sitzung oder verwalte deinen Kontostatus.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Abmelden (Logout)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    (window as any).dataLayer = (window as any).dataLayer || [];
                    (window as any).dataLayer.push({ event: 'account_deletion_intent', user_id: user.id });
                    setShowDeleteModal(true);
                  }}
                  className="w-full py-1 text-[var(--color-text-muted)] hover:text-red-600 text-[10px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 size={11} />
                  <span>Account löschen</span>
                </button>
              </div>
            </div>

          </div>

          {/* App Version Info Footer */}
          <div className="pt-2 text-center">
            <span className="text-[11px] font-mono text-[var(--color-text-muted)] opacity-70">
              Flow der Stille • Version v5.2.2
            </span>
          </div>

        </div>
      )}

      {/* Offline Storage Management Modal */}
      <OfflineStorageModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        onTracksUpdated={refreshOfflineStats}
      />
    </div>
  );
}

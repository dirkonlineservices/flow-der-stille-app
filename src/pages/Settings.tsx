import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Shield, Lock, FileText, CheckCircle2, 
  AlertCircle, Sparkles, ShoppingBag, Eye, 
  Trash2, Download, LogOut, ArrowRight, Settings as SettingsIcon, Award, Sun, Moon 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { getSupabase } from '../lib/supabaseClient';
import SEO from '../components/SEO';
import { PRODUCTS } from '../data/store';

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

  // Sync profile fields from user context once loaded
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setNewsletter(!!user.newsletter_optin);
      
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

  // Update profile handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          newsletter_optin: newsletter
        }
      });

      if (error) {
        setProfileError(error.message);
      } else {
        setProfileSuccess('Ihr Profil wurde erfolgreich aktualisiert!');
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
        setPasswordSuccess('Ihr Passwort wurde erfolgreich geändert!');
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
                 Dies ist ein unwiderruflicher Vorgang. Alle Ihre Daten, Käufe und Fortschritte werden dauerhaft entfernt. Dies entspricht unseren DSGVO-Richtlinien zur Datenlöschung.
                 <br/><br/>
                 Bitte geben Sie zur Bestätigung den Namen der App ein: <span className="font-bold">Flow der Stille</span>
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
      
      <SEO title="Einstellungen" description="Verwalten Sie Ihre persönlichen Angaben, ändern Sie Ihr Passwort und betrachten Sie Ihre Einkäufe." />
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="text-[var(--color-accent-primary)] w-8 h-8" />
          <h1 className="text-4xl font-serif text-[var(--color-accent-primary)]">Konto & App-Einstellungen</h1>
        </div>
        <p className="text-[var(--color-text-muted)] text-base max-w-2xl">
          Verwalten Sie Ihre persönlichen Angaben, ändern Sie Ihr Passwort, werfen Sie einen Blick in Ihre erworbenen Kurse oder laden Sie Ihre gespeicherten Daten herunter.
        </p>
      </header>

      {!user ? (
        <div className="bg-[var(--color-bg-alt)] border border-[var(--color-border-main)] rounded-3xl p-8 text-center max-w-xl mx-auto">
          <User className="mx-auto w-12 h-12 text-[var(--color-text-muted-light)] mb-4" />
          <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-2">Sie sind nicht eingeloggt</h2>
          <p className="text-[var(--color-text-muted)] text-sm mb-6 leading-relaxed">
            Um Ihr Profil anzupassen, Ihren Vornamen zu pflegen, Passwörter zu konfigurieren oder Kurse freizuschalten, melden Sie sich bitte an oder erstellen Sie ein neues Konto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/login" 
              className="px-6 py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl transition-all"
            >
              Einloggen
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border-main)] text-[var(--color-text-main)] font-medium rounded-xl hover:bg-[var(--color-bg-alt)] transition-all"
            >
              Registrieren
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main settings options */}
          <div className="lg:col-span-2 space-y-8">
            
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
                      placeholder="Ihr Vorname"
                      className="w-full px-4 py-3 bg-[var(--color-bg-alt)] rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-primary)] outline-none text-sm transition-all text-[var(--color-text-main)] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Nachname</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ihr Nachname"
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
                  <p className="text-[var(--color-text-muted-light)] text-[11px] mt-1">E-Mail-Adressen sind fest mit Ihrem Supabase-Konto verknüpft.</p>
                </div>

                {/* Newsletter Preference Section */}
                <div className="pt-4 border-t border-[var(--color-border-main)] mt-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-stone-300 text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                    />
                    <div>
                      <span className="text-sm font-medium text-[var(--color-text-main)] leading-tight block group-hover:text-stone-900 transition-colors">
                        Sicherstellung des monatlichen Newsletters
                      </span>
                      <span className="text-xs text-[var(--color-text-muted-light)] block mt-0.5 leading-relaxed">
                        Ich möchte weiterhin einmal im Monat wertvolle, kuratierte Ratschläge, wissenschaftliche Hintergründe der Darm-Hirn-Achse und Tipps zur Parasympathikus-Aktivierung per E-Mail erhalten. (Abbestellbar per Form-Opt-out).
                      </span>
                    </div>
                  </label>
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

            {/* 3. Meine gemeisterten Aufgaben */}
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

            {/* 4. My purchased products */}
            <section className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border-main)] p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="text-[var(--color-accent-primary)] w-6 h-6" />
                <h2 className="text-2xl font-serif text-[var(--color-text-main)]">Meine gekauften Produkte</h2>
              </div>
              <p className="text-[var(--color-text-muted-light)] text-xs mb-6">
                Ihre verifizierten Angebote und freigeschalteten Kurse. Verwaltet über die Supabase-Datenbank zur lückenlosen Absicherung Ihrer Käufe.
              </p>

              <div className="space-y-4">
                {purchases.length > 0 ? (
                  purchases.map((kauf: any) => {
                    const course = kauf.produkt;
                    return (
                      <div 
                        key={kauf.id}
                        className="p-5 rounded-2xl border transition-all bg-[var(--color-bg-alt)]/55 border-[var(--color-border-main)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Aktiviert & Freigeschaltet
                            </span>
                            <h3 className="text-lg font-serif text-[var(--color-text-main)] mt-1.5">{course?.titel || 'Unbekanntes Produkt'}</h3>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-[var(--color-text-main)] block">{kauf.preis} €</span>
                            <span className="text-xs text-[var(--color-text-muted-light)] block">{new Date(kauf.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-[var(--color-text-muted)] text-xs leading-relaxed mb-4">{course?.beschreibung}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-main)]">
                           <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
                             <CheckCircle2 size={14} /> Bereit zum Lernen
                           </span>
                           <button className="px-4 py-1.5 bg-[var(--color-bg-border)] hover:bg-stone-200 text-[var(--color-text-main)] text-xs font-semibold rounded-lg transition-all flex items-center gap-1">
                             <Eye size={12} /> Kurs öffnen
                           </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[var(--color-text-muted)] text-center p-6 border border-dashed border-[var(--color-border-main)] rounded-2xl">
                    <p className="mb-4">Noch keine Premium-Kurse erworben.</p>
                  </div>
                )}
                
                {purchases.length > 0 && (
                  <div className="p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border-main)] font-semibold text-sm text-right">
                    Gesamtausgaben: <span className="text-[var(--color-accent-primary)]">{totalSpent.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            </section>

            {/* 5. Danger Zone */}
            <section className="bg-red-50/50 rounded-3xl shadow-sm border border-red-100 p-6 md:p-8">
              <h2 className="text-2xl font-serif text-red-900 mb-6 flex items-center gap-2">
                <Trash2 size={22} className="text-red-600" />
                Gefahrenbereich: Account löschen
              </h2>
              <p className="text-red-800 text-sm mb-6 leading-relaxed">
                Wenn Sie Ihr Konto und alle damit verbundenen Daten unwiderruflich löschen möchten, klicken Sie bitte auf die Schaltfläche unten. Dieser Vorgang kann nicht rückgängig gemacht werden.
              </p>
              <button
                onClick={() => {
                  (window as any).dataLayer = (window as any).dataLayer || [];
                  (window as any).dataLayer.push({ event: 'account_deletion_intent', user_id: user.id });
                  setShowDeleteModal(true);
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm"
              >
                Konto permanent löschen
              </button>
            </section>

          </div>

          {/* Sidebar Area with session, GDPR, logout */}
          <div className="space-y-6">
            
             {/* Theme Toggle */}
            <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 border border-[var(--color-border-main)] shadow-sm">
                <button
                   onClick={toggleTheme}
                   className="w-full flex items-center justify-between p-4 bg-[var(--color-bg-alt)] rounded-xl hover:bg-[var(--color-bg-border)] transition-all"
                >
                   <span className="font-semibold text-sm">Design-Modus</span>
                   <div className="p-2 rounded-lg bg-[var(--color-bg-body)]">
                     {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                   </div>
                </button>
            </div>

            {/* Quick Profile Overview Badge */}
            <div className="bg-[var(--color-bg-body)] rounded-3xl p-6 border border-[var(--color-border-main)]/60 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--color-accent-primary)] text-white flex items-center justify-center text-3xl font-serif mx-auto mb-4 shadow-sm">
                {(user.first_name || user.username || 'T').charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-serif text-[var(--color-text-main)]">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
              </h3>
              <p className="text-xs text-[var(--color-text-muted-light)] mt-1">{user.email}</p>
              
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                <span className="px-2 py-0.5 bg-[var(--color-bg-border)] text-[var(--color-text-muted)] text-[10px] rounded-full uppercase font-semibold">
                  Mitglied seit {new Date().getFullYear()}
                </span>
                {user.newsletter_optin ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded-full uppercase font-semibold border border-emerald-100/50">
                    Newsletter Ja
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-[var(--color-bg-border)] text-[var(--color-text-muted-light)] text-[10px] rounded-full uppercase font-semibold">
                    Newsletter Nein
                  </span>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--color-border-main)]/60">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-[var(--color-bg-border)] hover:bg-stone-200 text-[var(--color-text-main)] font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  <span>Abmelden (Sitzung beenden)</span>
                </button>
              </div>
            </div>

            {/* GDPR Box */}
            <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 border border-[var(--color-border-main)] shadow-sm">
              <h4 className="font-serif text-[var(--color-text-main)] text-lg mb-2 flex items-center gap-1.5">
                <Shield size={16} className="text-[var(--color-accent-primary)]" />
                Datenschutz & DSGVO
              </h4>
              <p className="text-[var(--color-text-muted)] text-xs leading-relaxed mb-4">
                Sämtliche Kommunikation und Datensätze sind gänzlich nach Bestimmungen der Datenschutz-Grundverordnung abgesichert. Sie behalten die volle Kontrolle über Ihre Daten.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full py-2.5 px-3 bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-border)] text-[var(--color-text-main)] text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
                >
                  <Download size={14} />
                  <span>Daten herunterladen (JSON)</span>
                </button>

                <Link
                  to="/datenschutz"
                  className="w-full py-2.5 px-3 bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg-border)] text-[var(--color-text-main)] text-xs font-semibold rounded-xl flex items-center gap-2 transition-all block text-left"
                >
                  <FileText size={14} />
                  <span>Datenschutzerklärung einsehen</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

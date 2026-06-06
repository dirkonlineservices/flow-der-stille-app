import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Shield, Lock, FileText, CheckCircle2, 
  AlertCircle, Sparkles, ShoppingBag, Eye, 
  Trash2, Download, LogOut, ArrowRight, Settings as SettingsIcon, Award 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

// Define available products in the store
const ECOURSES = [
  {
    id: 'parasympathikus_kurs',
    title: 'Parasympathikus-Kompaktkurs',
    description: 'Aktivierung des Vagusnervs für sofortige innere Ruhe & Entspannung im Alltag.',
    price: '49,00 €',
    duration: '4 Wochen Kurs',
    accentColor: 'bg-emerald-50 text-emerald-800 border-emerald-100'
  },
  {
    id: 'darm_hirn_class',
    title: 'Darm-Hirn-Achse Masterclass',
    description: 'Ganzheitliche Wege & Ernährungstipps gegen stressbedingte Verdauungsbeschwerden.',
    price: '79,00 €',
    duration: '6 Module Video-Content',
    accentColor: 'bg-amber-50 text-amber-800 border-amber-100'
  },
  {
    id: 'atemschule_deep',
    title: 'Tiefenentspannung & Atemschule',
    description: 'Atemtechniken zur Steigerung der Herzratenvariabilität (HRV) und Stressresistenz.',
    price: '35,00 €',
    duration: '12 angeleitete Praxis-Sessions',
    accentColor: 'bg-sky-50 text-sky-800 border-sky-100'
  }
];

export default function Settings() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Product actions states
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  // Sync profile fields from user context once loaded
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setNewsletter(!!user.newsletter_optin);
    }
  }, [user]);

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
        // Refresh local user variables
        if (data?.user) {
          // Auto updated via auth state change listener in AuthContext!
        }
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

  // Buy or unlock product simulation
  const handleToggleProduct = async (productId: string) => {
    if (!user) return;
    setPurchaseLoading(productId);

    try {
      const currentPurchased = user.purchased_products || [];
      let nextPurchased = [...currentPurchased];

      if (currentPurchased.includes(productId)) {
        // Remove for toggle simulation
        nextPurchased = nextPurchased.filter(id => id !== productId);
      } else {
        // Add
        nextPurchased.push(productId);
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          purchased_products: nextPurchased
        }
      });

      if (error) {
        alert('Fehler beim Aktualisieren des Produktstatus: ' + error.message);
      } else {
        // Updated!
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPurchaseLoading(null);
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

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="text-[var(--color-accent-olive)] w-8 h-8" />
          <h1 className="text-4xl font-serif text-[var(--color-accent-olive)]">Konto & App-Einstellungen</h1>
        </div>
        <p className="text-stone-500 text-base max-w-2xl">
          Verwalten Sie Ihre persönlichen Angaben, ändern Sie Ihr Passwort, werfen Sie einen Blick in Ihre erworbenen Kurse oder laden Sie Ihre gespeicherten Daten herunter.
        </p>
      </header>

      {!user ? (
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center max-w-xl mx-auto">
          <User className="mx-auto w-12 h-12 text-stone-400 mb-4" />
          <h2 className="text-xl font-serif text-stone-800 mb-2">Sie sind nicht eingeloggt</h2>
          <p className="text-stone-500 text-sm mb-6 leading-relaxed">
            Um Ihr Profil anzupassen, Ihren Vornamen zu pflegen, Passwörter zu konfigurieren oder Kurse freizuschalten, melden Sie sich bitte an oder erstellen Sie ein neues Konto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/login" 
              className="px-6 py-2.5 bg-[var(--color-accent-olive)] hover:bg-[var(--color-accent-olive-hover)] text-white font-medium rounded-xl transition-all"
            >
              Einloggen
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-all"
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
            <section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 md:p-8">
              <h2 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-2">
                <User size={22} className="text-[var(--color-accent-olive)]" />
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
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Vorname</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ihr Vorname"
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none text-sm transition-all text-stone-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Nachname</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ihr Nachname"
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none text-sm transition-all text-stone-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">E-Mail-Adresse (nicht änderbar)</label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-stone-100 text-stone-500 rounded-xl border-none outline-none text-sm cursor-not-allowed font-medium"
                  />
                  <p className="text-stone-400 text-[11px] mt-1">E-Mail-Adressen sind fest mit Ihrem Supabase-Konto verknüpft.</p>
                </div>

                {/* Newsletter Preference Section */}
                <div className="pt-4 border-t border-stone-100 mt-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-stone-300 text-[var(--color-accent-olive)] focus:ring-[var(--color-accent-olive)]"
                    />
                    <div>
                      <span className="text-sm font-medium text-stone-700 leading-tight block group-hover:text-stone-900 transition-colors">
                        Sicherstellung des monatlichen Newsletters
                      </span>
                      <span className="text-xs text-stone-400 block mt-0.5 leading-relaxed">
                        Ich möchte weiterhin einmal im Monat wertvolle, kuratierte Ratschläge, wissenschaftliche Hintergründe der Darm-Hirn-Achse und Tipps zur Parasympathikus-Aktivierung per E-Mail erhalten. (Abbestellbar per Form-Opt-out).
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 text-right">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-3 bg-[var(--color-accent-olive)] hover:bg-[var(--color-accent-olive-hover)] text-white font-medium rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {profileLoading ? 'Aktualisiere...' : 'Profil speichern'}
                  </button>
                </div>
              </form>
            </section>

            {/* 2. Change password section */}
            <section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 md:p-8">
              <h2 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-2">
                <Lock size={22} className="text-[var(--color-accent-olive)]" />
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
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Neues Passwort</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none text-sm transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Bestätigen</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-accent-olive)] outline-none text-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 text-right">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-3 bg-[var(--color-accent-olive)] hover:bg-[var(--color-accent-olive-hover)] text-white font-medium rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {passwordLoading ? 'Speichere...' : 'Sicher ändern'}
                  </button>
                </div>
              </form>
            </section>

            {/* 3. My purchased products */}
            <section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="text-[var(--color-accent-olive)] w-6 h-6" />
                <h2 className="text-2xl font-serif text-stone-800">Meine gekauften Produkte</h2>
              </div>
              <p className="text-stone-400 text-xs mb-6">
                Ihre verifizierten Angebote und freigeschalteten Kurse. Verwaltet über die Supabase-Datenbank zur lückenlosen Absicherung Ihrer Käufe.
              </p>

              <div className="space-y-4">
                {ECOURSES.map(course => {
                  const isPurchased = (user.purchased_products || []).includes(course.id);
                  return (
                    <div 
                      key={course.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isPurchased 
                          ? 'bg-stone-50/55 border-stone-200' 
                          : 'bg-white border-stone-100 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <div>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            isPurchased ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {isPurchased ? 'Aktiviert & Freigeschaltet' : 'Noch nicht erworben'}
                          </span>
                          <h3 className="text-lg font-serif text-stone-800 mt-1.5">{course.title}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-stone-700 block">{course.duration}</span>
                          <span className="text-xs text-stone-400 block">{course.price}</span>
                        </div>
                      </div>

                      <p className="text-stone-500 text-xs leading-relaxed mb-4">{course.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        {isPurchased ? (
                          <>
                            <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
                              <CheckCircle2 size={14} /> Bereit zum Lernen
                            </span>
                            <button className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1">
                              <Eye size={12} /> Kurs öffnen
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-stone-400 text-xs">Exklusive Premium-Inhalte</span>
                            <button
                              onClick={() => handleToggleProduct(course.id)}
                              disabled={purchaseLoading !== null}
                              className="px-4 py-1.5 bg-[var(--color-accent-olive)] hover:bg-[var(--color-accent-olive-hover)] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1 active:scale-95"
                            >
                              Freischalten
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. Meine gemeisterten Aufgaben */}
            <section className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-[var(--color-accent-olive)] w-6 h-6" />
                <h2 className="text-2xl font-serif text-stone-800">Mein Achtsamkeits-Fortschritt</h2>
              </div>
              <p className="text-stone-400 text-xs mb-6">
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
                      const weekNum = key.replace('weekly_challenge_week_', '');
                      type = 'Wochenaufgabe';
                      title = `Woche ${weekNum}`;
                      desc = 'Als gemeistert markiert';
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
                        className="flex items-center justify-between p-4 bg-stone-50 border border-stone-100 rounded-2xl"
                      >
                        <div className="flex items-center justify-between gap-3 w-full">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl shrink-0 ${isWeekly ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              <CheckCircle2 size={16} />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">{type}</span>
                              <h4 className="text-sm font-medium text-stone-800">{title}</h4>
                            </div>
                          </div>
                          <span className="text-xs text-stone-500 italic shrink-0 text-right">{desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <Sparkles className="mx-auto text-stone-300 w-8 h-8 mb-2" />
                  <p className="text-stone-500 text-sm">Noch keine Aufgaben abgeschlossen.</p>
                  <p className="text-stone-400 text-xs mt-1">Absolviere deinen ersten Tagesimpuls oder deine Wochenaufgabe auf der Startseite!</p>
                </div>
              )}
            </section>

          </div>

          {/* Sidebar Area with session, GDPR, logout */}
          <div className="space-y-6">
            
            {/* Quick Profile Overview Badge */}
            <div className="bg-[var(--color-bg-warm)] rounded-3xl p-6 border border-stone-200/60 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--color-accent-olive)] text-white flex items-center justify-center text-3xl font-serif mx-auto mb-4 shadow-sm">
                {(user.first_name || user.username || 'T').charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-serif text-stone-800">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
              </h3>
              <p className="text-xs text-stone-400 mt-1">{user.email}</p>
              
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] rounded-full uppercase font-semibold">
                  Mitglied seit {new Date().getFullYear()}
                </span>
                {user.newsletter_optin ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded-full uppercase font-semibold border border-emerald-100/50">
                    Newsletter Ja
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-400 text-[10px] rounded-full uppercase font-semibold">
                    Newsletter Nein
                  </span>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-stone-200/60">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  <span>Abmelden (Sitzung beenden)</span>
                </button>
              </div>
            </div>

            {/* GDPR Box */}
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
              <h4 className="font-serif text-stone-800 text-lg mb-2 flex items-center gap-1.5">
                <Shield size={16} className="text-[var(--color-accent-olive)]" />
                Datenschutz & DSGVO
              </h4>
              <p className="text-stone-500 text-xs leading-relaxed mb-4">
                Sämtliche Kommunikation und Datensätze sind gänzlich nach Bestimmungen der Datenschutz-Grundverordnung abgesichert. Sie behalten die volle Kontrolle über Ihre Daten.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full py-2.5 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
                >
                  <Download size={14} />
                  <span>Daten herunterladen (JSON)</span>
                </button>

                <Link
                  to="/datenschutz"
                  className="w-full py-2.5 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all block text-left"
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

import React, { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, ShieldAlert, Search, Gift, CheckCircle2, 
  AlertCircle, Loader2, User, ArrowLeft, RefreshCw, Sparkles, X, Check,
  Users, TrendingUp, Calendar, Award, Clock, ArrowRight, UserCheck, Shield, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { AdminSecurityLock } from '../components/AdminSecurityLock';
import { isAdminSessionVerified, lockAdminSession } from '../lib/adminSecurity';

interface UserProfile {
  id: string;
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  rolle?: string | null;
  is_premium?: boolean | null;
  created_at?: string | null;
}

interface ProductItem {
  id: string;
  titel: string;
  kategorie?: string | null;
  preis?: number | string | null;
  is_active?: boolean;
}

interface UserPurchase {
  id?: string;
  produkt_id: string;
  created_at?: string;
  order_id?: string;
  preis?: number | string;
}

interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  newUsers7Days: number;
  newUsers30Days: number;
  premiumUsersCount: number;
  totalPurchasesCount: number;
  recentUsers: UserProfile[];
}

export default function AdminUnlock() {
  const { user } = useAuth();

  // Tab-Steuerung: 'stats' | 'unlock' | 'update'
  const [activeTab, setActiveTab] = useState<'stats' | 'unlock' | 'update'>('stats');

  // 1. Rollen- & Autorisierungsstatus
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [isSessionUnlocked, setIsSessionUnlocked] = useState(false);

  // 2. Statistiken
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    newUsersToday: 0,
    newUsers7Days: 0,
    newUsers30Days: 0,
    premiumUsersCount: 0,
    totalPurchasesCount: 0,
    recentUsers: []
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // 3. Produkte aus Supabase & Mehrfachauswahl
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // 4. Nutzersuche für Freischaltung
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Bereits vorhandene Käufe des ausgewählten Nutzers
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // 5. Aktions-Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Zuletzt freigeschaltete Aktionen (Session-Log)
  const [recentUnlocks, setRecentUnlocks] = useState<{
    userName: string;
    productTitle: string;
    timestamp: string;
  }[]>([]);

  // 6. App-Update Remote-Konfiguration
  const [remoteVersionCode, setRemoteVersionCode] = useState('98');
  const [remoteVersionName, setRemoteVersionName] = useState('5.2.0');
  const [updateTitleInput, setUpdateTitleInput] = useState('App-Aktualisierung verfügbar! 🚀');
  const [updateMessageInput, setUpdateMessageInput] = useState('Eine neue Version von Flow der Stille steht jetzt für dich im Google Play Store bereit.');
  const [savingAppConfig, setSavingAppConfig] = useState(false);
  const [appConfigSaved, setAppConfigSaved] = useState(false);

  // ============================================================================
  // 1. ZUGRIFFSSCHUTZ: Rollenprüfung ('rolle' = 'admin' in profiles)
  // ============================================================================
  useEffect(() => {
    checkAdminRole();
  }, [user]);

  async function checkAdminRole() {
    setAuthChecking(true);
    setIsAdmin(false);

    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || user?.id;

      if (!currentUserId) {
        setIsAdmin(false);
        setAuthChecking(false);
        return;
      }

      // Tabelle "profiles" nach der Spalte "rolle" abfragen
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('rolle')
        .eq('id', currentUserId)
        .maybeSingle();

      if (profileError) {
        console.error('Fehler bei der Rollenabfrage:', profileError);
        setIsAdmin(false);
      } else if (profileData && profileData.rolle?.toLowerCase() === 'admin') {
        setIsAdmin(true);
        setAdminRole(profileData.rolle);
        if (isAdminSessionVerified()) {
          setIsSessionUnlocked(true);
        }
        // Nach erfolgreicher Autorisierung Daten & Statistiken laden
        loadProductsAndConfig();
        loadAdminStats();
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Ausnahme bei der Rollenprüfung:', err);
      setIsAdmin(false);
    } finally {
      setAuthChecking(false);
    }
  }

  // ============================================================================
  // STATISTIKEN LADEN
  // ============================================================================
  async function loadAdminStats() {
    setLoadingStats(true);
    try {
      const supabase = getSupabase();
      
      // 1. Alle Profile abfragen (inkl. Registrierungsdatum & Rollen)
      const { data: allProfiles, error: profError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, full_name, rolle, is_premium, created_at')
        .order('created_at', { ascending: false });

      // 2. Käufe zählen
      const { count: purchasesCount } = await supabase
        .from('kaeufe')
        .select('*', { count: 'exact', head: true });

      if (!profError && allProfiles) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

        let todayCount = 0;
        let sevenDaysCount = 0;
        let thirtyDaysCount = 0;
        let premiumCount = 0;

        allProfiles.forEach(p => {
          if (p.is_premium) premiumCount++;
          if (p.created_at) {
            const createdTime = new Date(p.created_at).getTime();
            if (createdTime >= startOfToday) todayCount++;
            if (createdTime >= sevenDaysAgo) sevenDaysCount++;
            if (createdTime >= thirtyDaysAgo) thirtyDaysCount++;
          }
        });

        setStats({
          totalUsers: allProfiles.length,
          newUsersToday: todayCount,
          newUsers7Days: sevenDaysCount,
          newUsers30Days: thirtyDaysCount,
          premiumUsersCount: premiumCount,
          totalPurchasesCount: purchasesCount || 0,
          recentUsers: allProfiles.slice(0, 30) // Neueste 30 Registrierungen
        });
      }
    } catch (err) {
      console.error('Fehler beim Laden der Admin-Statistiken:', err);
    } finally {
      setLoadingStats(false);
    }
  }

  // ============================================================================
  // PRODUKTE & APP-CONFIG LADEN
  // ============================================================================
  async function loadProductsAndConfig() {
    setLoadingProducts(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('produkte')
        .select('*')
        .order('titel', { ascending: true });

      if (error) {
        console.error('Fehler beim Laden der Produkte:', error);
      } else if (data) {
        setProducts(data);
      }

      // App Config laden
      const { data: cfgData } = await supabase
        .from('app_config')
        .select('key, value')
        .in('key', ['latest_android_version_code', 'latest_android_version_name', 'update_title', 'update_message']);

      if (cfgData && cfgData.length > 0) {
        cfgData.forEach(item => {
          if (item.key === 'latest_android_version_code') setRemoteVersionCode(item.value);
          if (item.key === 'latest_android_version_name') setRemoteVersionName(item.value);
          if (item.key === 'update_title') setUpdateTitleInput(item.value);
          if (item.key === 'update_message') setUpdateMessageInput(item.value);
        });
      }
    } catch (err) {
      console.error('Exception beim Laden der Daten:', err);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleSaveAppConfig(e: React.FormEvent) {
    e.preventDefault();
    setSavingAppConfig(true);
    setAppConfigSaved(false);
    try {
      const supabase = getSupabase();
      const rows = [
        { key: 'latest_android_version_code', value: remoteVersionCode.trim(), updated_at: new Date().toISOString() },
        { key: 'latest_android_version_name', value: remoteVersionName.trim(), updated_at: new Date().toISOString() },
        { key: 'update_title', value: updateTitleInput.trim(), updated_at: new Date().toISOString() },
        { key: 'update_message', value: updateMessageInput.trim(), updated_at: new Date().toISOString() },
      ];

      const { error } = await supabase.from('app_config').upsert(rows, { onConflict: 'key' });
      if (error) {
        setErrorMessage(`Fehler beim Speichern der App-Konfiguration: ${error.message}`);
      } else {
        setAppConfigSaved(true);
        setTimeout(() => setAppConfigSaved(false), 4000);
      }
    } catch (err: any) {
      setErrorMessage(`Fehler: ${err?.message || 'Unbekannt'}`);
    } finally {
      setSavingAppConfig(false);
    }
  }

  // ============================================================================
  // NUTZERSUCHE IN 'profiles'
  // ============================================================================
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(trimmed);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function searchUsers(query: string) {
    if (!isAdmin) return;
    setIsSearching(true);
    setErrorMessage('');

    try {
      const supabase = getSupabase();
      const clean = query.trim();

      // Suche nach Email, Full Name, Vorname oder Nachname in 'profiles'
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, full_name, rolle, is_premium, created_at')
        .or(`email.ilike.%${clean}%,full_name.ilike.%${clean}%,first_name.ilike.%${clean}%,last_name.ilike.%${clean}%`)
        .limit(10);

      if (error) {
        console.error('Fehler bei der Nutzersuche:', error);
        setErrorMessage('Fehler bei der Nutzersuche in der Datenbank.');
      } else {
        setSearchResults(data || []);
      }
    } catch (err) {
      console.error('Exception bei Nutzersuche:', err);
    } finally {
      setIsSearching(false);
    }
  }

  // ============================================================================
  // NUTZER AUSWÄHLEN & SEINE BESTEHENDEN FREISCHALTUNGEN LADEN
  // ============================================================================
  async function handleSelectUser(selected: UserProfile) {
    setSelectedUser(selected);
    setSearchQuery('');
    setSearchResults([]);
    setErrorMessage('');
    setSuccessMessage('');
    loadPurchasesForUser(selected.id);
  }

  async function loadPurchasesForUser(userId: string) {
    setLoadingPurchases(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('kaeufe')
        .select('id, produkt_id, created_at, order_id, preis')
        .eq('user_id', userId);

      if (error) {
        console.error('Fehler beim Laden der Nutzerkäufe:', error);
      } else {
        setUserPurchases(data || []);
      }
    } catch (err) {
      console.error('Exception beim Laden der Käufe:', err);
    } finally {
      setLoadingPurchases(false);
    }
  }

  function handleResetSelection() {
    setSelectedUser(null);
    setUserPurchases([]);
    setSelectedProductIds([]);
    setSearchQuery('');
    setSearchResults([]);
  }

  // ============================================================================
  // MULTI-SELECT HILFSFUNKTIONEN FÜR PRODUKTE
  // ============================================================================
  function toggleProductSelection(prodId: string) {
    setSelectedProductIds(prev => 
      prev.includes(prodId) 
        ? prev.filter(id => id !== prodId) 
        : [...prev, prodId]
    );
  }

  // Wählt alle Produkte einer bestimmten Kategorie aus (die noch nicht freigeschaltet sind)
  function selectCategoryProducts(categoryKeyword: string) {
    const matching = products.filter(p => {
      const alreadyOwned = userPurchases.some(up => up.produkt_id === p.id);
      if (alreadyOwned) return false;
      const cat = (p.kategorie || '').toLowerCase();
      const tit = (p.titel || '').toLowerCase();
      return cat.includes(categoryKeyword.toLowerCase()) || tit.includes(categoryKeyword.toLowerCase());
    });

    const matchingIds = matching.map(p => p.id);
    setSelectedProductIds(prev => {
      const combined = new Set([...prev, ...matchingIds]);
      return Array.from(combined);
    });
  }

  // Alle noch nicht besessenen Produkte auswählen
  function selectAllUnownedProducts() {
    const unowned = products.filter(p => !userPurchases.some(up => up.produkt_id === p.id));
    setSelectedProductIds(unowned.map(p => p.id));
  }

  // Auswahl leeren
  function clearProductSelection() {
    setSelectedProductIds([]);
  }

  // ============================================================================
  // NUTZER-ROLLE ÄNDERN (Admin ernennen / Rechte entziehen)
  // ============================================================================
  async function handleToggleUserAdminRole(newRole: 'admin' | 'user') {
    if (!selectedUser) return;
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('profiles')
        .update({ rolle: newRole, updated_at: new Date().toISOString() })
        .eq('id', selectedUser.id);

      if (error) {
        setErrorMessage(`Fehler beim Aktualisieren der Rolle: ${error.message}`);
      } else {
        setSelectedUser({ ...selectedUser, rolle: newRole });
        loadAdminStats(); // Stats aktualisieren
        const nameDisp = selectedUser.full_name || selectedUser.email || selectedUser.id;
        if (newRole === 'admin') {
          setSuccessMessage(`👑 ${nameDisp} wurde erfolgreich zum Administrator ernannt!`);
        } else {
          setSuccessMessage(`ℹ️ Admin-Rechte für ${nameDisp} wurden entzogen.`);
        }
      }
    } catch (err: any) {
      setErrorMessage(`Fehler: ${err?.message || 'Unerwarteter Fehler'}`);
    }
  }

  // ============================================================================
  // 3. DATENBANKAKTION: MEHRFACH-FREISCHALTUNG
  // ============================================================================
  async function handleUnlockProducts(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || selectedProductIds.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const targetUser = selectedUser;
    const count = selectedProductIds.length;
    const userNameDisplay = targetUser.full_name || [targetUser.first_name, targetUser.last_name].filter(Boolean).join(' ') || targetUser.email || targetUser.id;

    try {
      const supabase = getSupabase();

      // Datensätze für alle ausgewählten Produkte vorbereiten
      const rows = selectedProductIds.map((prodId, idx) => ({
        user_id: targetUser.id,
        produkt_id: prodId,
        preis: 0.00,
        waehrung: 'EUR',
        order_id: `GESCHENK_${Date.now()}_${idx}_${targetUser.id.substring(0, 6)}`
      }));

      // In die Tabelle "kaeufe" schreiben
      const { error: insertError } = await supabase
        .from('kaeufe')
        .upsert(rows, { onConflict: 'user_id,produkt_id' });

      if (insertError) {
        console.error('Fehler beim Eintragen in kaeufe:', insertError);
        setErrorMessage(`Fehler beim Freischalten: ${insertError.message || 'Datenbankfehler'}`);
        setIsSubmitting(false);
        return;
      }

      // User-Profil auf is_premium = true setzen
      try {
        await supabase
          .from('profiles')
          .update({ is_premium: true, updated_at: new Date().toISOString() })
          .eq('id', targetUser.id);
      } catch (profErr) {
        console.warn('Hinweis: Profil is_premium Update übersprungen:', profErr);
      }

      // Titel für die Zusammenfassung
      const unlockedTitles = selectedProductIds.map(id => products.find(p => p.id === id)?.titel || id);

      // Erfolgsmeldung ausgeben
      setSuccessMessage(`✅ ${count} Produkt${count > 1 ? 'e' : ''} erfolgreich kostenfrei für ${userNameDisplay} freigeschaltet! (${unlockedTitles.join(', ')})`);

      // In Session-Historie aufnehmen
      unlockedTitles.forEach(title => {
        setRecentUnlocks(prev => [
          {
            userName: userNameDisplay,
            productTitle: title,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          },
          ...prev
        ]);
      });

      // Formular & Käufe aktualisieren
      loadPurchasesForUser(targetUser.id);
      loadAdminStats();
      setSelectedProductIds([]);

    } catch (err: any) {
      console.error('Exception beim Freischalten:', err);
      setErrorMessage(`Unerwarteter Fehler: ${err?.message || String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ============================================================================
  // RENDERING: LADE- & ZUGRIFFSPRÜFUNG
  // ============================================================================
  if (authChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <SEO title="Adminbereich wird geladen..." description="Berechtigungsprüfung" />
        <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
        <p className="text-sm text-[var(--text-muted)] font-medium">Berechtigung wird geprüft...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[var(--bg-card)] rounded-3xl border border-red-200 dark:border-red-900/40 text-center shadow-lg">
        <SEO title="Zugriff verweigert" description="Adminbereich geschützt" />
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[var(--text-main)] mb-2">Zugriff verweigert</h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
          Dieser Bereich ist ausschließlich für autorisierte Administratoren reserviert. In deinem Profil ist die Rolle <code className="bg-[var(--bg-alt)] px-1.5 py-0.5 rounded text-red-500 font-mono">admin</code> nicht hinterlegt.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white text-xs font-semibold rounded-2xl hover:bg-[var(--accent-hover)] transition-all shadow-md"
        >
          <ArrowLeft size={16} />
          <span>Zurück zur Startseite</span>
        </Link>
      </div>
    );
  }

  // 2. STUFE: BIOMETRIE- & 2-FAKTOR-SCHUTZ (Fingerprint / Face ID / PIN)
  if (!isSessionUnlocked) {
    return (
      <div className="py-8 px-4 font-sans min-h-[75vh] flex flex-col justify-center">
        <SEO title="Admin-Sicherheitsprüfung" description="Biometrie- & 2FA-Schutz für Admins" />
        <div className="max-w-md mx-auto mb-3 w-full text-left">
          <Link
            to="/premium-dashboard"
            className="p-2 bg-[var(--bg-card)] hover:bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span>Zurück zum Dashboard</span>
          </Link>
        </div>
        <AdminSecurityLock
          adminName={user?.first_name || user?.full_name || undefined}
          onUnlock={() => setIsSessionUnlocked(true)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-8 font-sans">
      <SEO title="Admin-Bereich – Statistiken & Freischaltungen" description="Internes Verwaltungszentrum für Flow der Stille" />

      {/* TOP BAR / NAVIGATION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/premium-dashboard"
            className="p-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
            title="Zurück zum Store / Dashboard"
          >
            <ArrowLeft size={16} />
            <span>Zurück zur App</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
            <ShieldCheck size={14} />
            <span>Autorisierter Admin ({adminRole || 'admin'})</span>
          </span>
          <button
            onClick={() => {
              loadAdminStats();
              loadProductsAndConfig();
            }}
            className="p-2 bg-[var(--bg-card)] hover:bg-[var(--bg-alt)] border border-[var(--border)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            title="Daten neu laden"
          >
            <RefreshCw size={14} className={loadingStats ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              lockAdminSession();
              setIsSessionUnlocked(false);
            }}
            className="p-2 bg-[var(--bg-card)] hover:bg-red-50 dark:hover:bg-red-950/40 border border-[var(--border)] hover:border-red-300 rounded-full text-[var(--text-muted)] hover:text-red-600 transition-colors cursor-pointer"
            title="Admin-Sitzung jetzt sperren"
          >
            <Lock size={14} />
          </button>
        </div>
      </div>

      {/* HEADER & TITEL */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-main)] font-semibold">
              Admin-Zentrale
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Statistiken, Nutzerverwaltung, kostenfreie Freischaltungen &amp; App-Release Steuerung.
            </p>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-alt)] rounded-2xl border border-[var(--border)] overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm border border-[var(--border)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Users size={16} />
          <span>Statistiken &amp; Nutzer ({stats.totalUsers})</span>
        </button>

        <button
          onClick={() => setActiveTab('unlock')}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'unlock'
              ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm border border-[var(--border)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Gift size={16} />
          <span>Produkte freischalten</span>
        </button>

        <button
          onClick={() => setActiveTab('update')}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'update'
              ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm border border-[var(--border)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <RefreshCw size={16} />
          <span>App-Update Steuerung</span>
        </button>
      </div>

      {/* FEHLER- & ERFOLGS-BANNER */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 rounded-2xl border border-red-200 dark:border-red-800/50 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-red-200/50 rounded-lg cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="p-1 hover:bg-emerald-200/50 rounded-lg cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: NUTZER & STATISTIKEN                                                */}
      {/* ========================================================================= */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* STATS METRIC CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Gesamt */}
            <div className="bg-[var(--bg-card)] p-5 rounded-3xl border border-[var(--border)] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Gesamt-Nutzer</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <Users size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
                {loadingStats ? <Loader2 size={24} className="animate-spin" /> : stats.totalUsers}
              </div>
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                Registrierte Konten in Supabase
              </span>
            </div>

            {/* Letzte 7 Tage */}
            <div className="bg-[var(--bg-card)] p-5 rounded-3xl border border-[var(--border)] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Letzte 7 Tage</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {loadingStats ? <Loader2 size={24} className="animate-spin" /> : `+${stats.newUsers7Days}`}
              </div>
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                Zuwachs in der letzten Woche
              </span>
            </div>

            {/* Heute neu */}
            <div className="bg-[var(--bg-card)] p-5 rounded-3xl border border-[var(--border)] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Heute neu</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <Calendar size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                {loadingStats ? <Loader2 size={24} className="animate-spin" /> : `+${stats.newUsersToday}`}
              </div>
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                Registrierungen heute
              </span>
            </div>

            {/* Premium & Käufe */}
            <div className="bg-[var(--bg-card)] p-5 rounded-3xl border border-[var(--border)] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Freigeschaltet</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Award size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                {loadingStats ? <Loader2 size={24} className="animate-spin" /> : stats.totalPurchasesCount}
              </div>
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                Käufe &amp; Geschenke in <code>kaeufe</code>
              </span>
            </div>
          </div>

          {/* NEUESTE REGISTRIERUNGEN TABELLE */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Clock size={20} className="text-[var(--accent)]" />
                  <span>Neueste Registrierungen</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Chronologische Übersicht der zuletzt erstellten Profile in der Supabase-Datenbank.
                </p>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-alt)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
                {stats.recentUsers.length} Einträge angezeigt
              </span>
            </div>

            {loadingStats ? (
              <div className="py-12 text-center text-[var(--text-muted)] text-xs flex flex-col items-center gap-3">
                <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                <span>Lade Nutzer-Profile...</span>
              </div>
            ) : stats.recentUsers.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-muted)] text-xs italic">
                Keine Profile in der Datenbank gefunden.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)] -mx-6 sm:-mx-8 px-6 sm:px-8">
                {stats.recentUsers.map((u) => {
                  const displayName = u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Ohne Name';
                  const formattedDate = u.created_at 
                    ? new Date(u.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '-';

                  return (
                    <div key={u.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[var(--bg-alt)]/40 transition-colors rounded-xl px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--text-muted)]">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-[var(--text-main)] flex items-center gap-2">
                            <span>{displayName}</span>
                            {u.rolle?.toLowerCase() === 'admin' && (
                              <span className="text-[9px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">Admin</span>
                            )}
                            {u.is_premium && (
                              <span className="text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">Premium</span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--text-muted)] font-mono">
                            {u.email || 'Keine E-Mail'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-[11px] text-[var(--text-muted)] font-mono">
                          {formattedDate}
                        </span>

                        <button
                          onClick={() => {
                            handleSelectUser(u);
                            setActiveTab('unlock');
                          }}
                          className="px-3 py-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          title="Für diesen Nutzer ein Produkt freischalten"
                        >
                          <Gift size={13} />
                          <span>Freischalten</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUKTE FREISCHALTEN & ROLLEN                                      */}
      {/* ========================================================================= */}
      {activeTab === 'unlock' && (
        <form onSubmit={handleUnlockProducts} className="space-y-6">
          {/* SCHRITT 1: NUTZER WÄHLEN */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                1. Nutzer auswählen (Tabelle: <code>profiles</code>)
              </label>
              {selectedUser && (
                <button
                  type="button"
                  onClick={handleResetSelection}
                  className="text-xs text-[var(--accent)] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X size={14} /> Nutzer ändern
                </button>
              )}
            </div>

            {!selectedUser ? (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nach E-Mail oder Name des Nutzers suchen..."
                    className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent)] animate-spin" size={18} />
                  )}
                </div>

                {/* Suchergebnisse Dropdown */}
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden divide-y divide-[var(--border)] max-h-60 overflow-y-auto">
                    {searchResults.map((u) => {
                      const displayName = u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Ohne Name';
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className="w-full p-3.5 text-left hover:bg-[var(--bg-alt)] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xs">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-xs sm:text-sm text-[var(--text-main)] flex items-center gap-2">
                                <span>{displayName}</span>
                                {u.rolle?.toLowerCase() === 'admin' && (
                                  <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full uppercase">Admin</span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--text-muted)] font-mono">
                                {u.email || 'Keine E-Mail'}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-[var(--text-muted)] shrink-0 font-mono bg-[var(--bg-alt)] px-2 py-1 rounded border border-[var(--border)]">
                            ID: {u.id.substring(0, 8)}...
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] mt-2 italic">
                    Kein registrierter Nutzer für „{searchQuery}“ in der profiles-Tabelle gefunden.
                  </p>
                )}
              </div>
            ) : (
              /* Ausgewählter Nutzer - Kärtchen */
              <div className="p-4 bg-[var(--bg-alt)] rounded-2xl border border-[var(--accent)]/30 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <User size={22} />
                    </div>
                    <div>
                      <div className="font-semibold text-base text-[var(--text-main)] flex items-center gap-2">
                        <span>{selectedUser.full_name || [selectedUser.first_name, selectedUser.last_name].filter(Boolean).join(' ') || 'Registrierter Nutzer'}</span>
                        {selectedUser.rolle?.toLowerCase() === 'admin' ? (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Admin</span>
                        ) : (
                          <span className="text-[10px] bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] font-medium px-2 py-0.5 rounded-full uppercase">Standard User</span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">
                        {selectedUser.email}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">
                        UUID: {selectedUser.id}
                      </div>
                    </div>
                  </div>

                  {/* Rolle verwalten Button */}
                  <div className="sm:text-right w-full sm:w-auto">
                    {selectedUser.rolle?.toLowerCase() === 'admin' ? (
                      <button
                        type="button"
                        onClick={() => handleToggleUserAdminRole('user')}
                        className="w-full sm:w-auto px-3.5 py-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 hover:bg-red-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        title="Admin-Rechte für diesen Nutzer entziehen"
                      >
                        <X size={14} />
                        <span>Admin-Rechte entziehen</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleUserAdminRole('admin')}
                        className="w-full sm:w-auto px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        title="Diesen Nutzer zum Administrator ernennen"
                      >
                        <ShieldCheck size={14} />
                        <span>👑 Zum Admin ernennen</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bereits freigeschaltete Produkte */}
                <div className="pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-xs text-[var(--text-muted)] font-medium block">
                    Bisherige Freischaltungen:
                  </span>
                  {loadingPurchases ? (
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" /> Lade Käufe...
                    </span>
                  ) : userPurchases.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      {userPurchases.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-1 rounded-full text-[var(--text-main)] font-mono"
                          title={`Bestellung: ${p.order_id || '-'}`}
                        >
                          ✓ {p.produkt_id}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] italic">Noch keine Produkte freigeschaltet</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SCHRITT 2: PRODUKTAUSWAHL (MEHRFACHAUSWAHL) */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  2. Produkte auswählen (Mehrfachauswahl)
                </label>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Klicke auf die Produkte oder nutze die Schnellauswahl-Buttons, um mehrere Inhalte auf einmal freizuschalten.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                  {selectedProductIds.length} ausgewählt
                </span>
                <button
                  type="button"
                  onClick={loadProductsAndConfig}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} className={loadingProducts ? 'animate-spin' : ''} /> Aktualisieren
                </button>
              </div>
            </div>

            {/* Schnellauswahl nach Kategorien */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-[var(--text-muted)] mr-1">
                Schnellauswahl:
              </span>
              <button
                type="button"
                onClick={() => selectCategoryProducts('meditation')}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] text-xs font-medium transition-colors cursor-pointer"
              >
                🧘 Alle Meditationen
              </button>
              <button
                type="button"
                onClick={() => selectCategoryProducts('selbsthypnose')}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] text-xs font-medium transition-colors cursor-pointer"
              >
                🧠 Alle Selbsthypnosen
              </button>
              <button
                type="button"
                onClick={() => selectCategoryProducts('hörbuch')}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-alt)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] text-xs font-medium transition-colors cursor-pointer"
              >
                📖 Hörbuch
              </button>
              <button
                type="button"
                onClick={selectAllUnownedProducts}
                className="px-3 py-1.5 rounded-xl bg-[var(--accent)]/10 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white border border-[var(--accent)]/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                ✨ Alle verfügbaren
              </button>
              {selectedProductIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearProductSelection}
                  className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800/40 text-xs font-medium transition-colors cursor-pointer ml-auto"
                >
                  ✕ Auswahl leeren
                </button>
              )}
            </div>

            {/* Produkt-Kacheln Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {products.map((p) => {
                const alreadyOwned = userPurchases.some(up => up.produkt_id === p.id);
                const isSelected = selectedProductIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!alreadyOwned) {
                        toggleProductSelection(p.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3 select-none ${
                      alreadyOwned
                        ? 'bg-[var(--bg-alt)]/40 border-[var(--border)] opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-sm cursor-pointer ring-1 ring-[var(--accent)]'
                        : 'bg-[var(--bg-alt)] border-[var(--border)] hover:border-[var(--accent)]/50 cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={alreadyOwned || isSelected}
                      disabled={alreadyOwned}
                      onChange={() => {}} // Klick wird vom Parent div behandelt
                      className="mt-1 w-4 h-4 rounded border-[var(--border)] accent-[var(--accent)] cursor-pointer shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-semibold text-xs sm:text-sm truncate ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>
                          {p.titel}
                        </h4>
                        <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                          {p.preis ? `${p.preis} €` : 'Kostenfrei'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        {p.kategorie && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] font-medium">
                            {p.kategorie}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                          ID: {p.id}
                        </span>
                      </div>

                      {alreadyOwned && (
                        <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Bereits freigeschaltet
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SCHRITT 3: AKTION / SPEICHERN */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                <div><strong>Datenbank-Ziel:</strong> Tabelle <code>public.kaeufe</code> (Batch-Insert)</div>
                <div>
                  <strong>Auswahl:</strong> {selectedProductIds.length} Produkt{selectedProductIds.length !== 1 ? 'e' : ''} für{' '}
                  <span className="font-semibold text-[var(--text-main)]">
                    {selectedUser ? (selectedUser.full_name || selectedUser.email || selectedUser.id.substring(0, 8)) : '(Kein Nutzer gewählt)'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedUser || selectedProductIds.length === 0 || isSubmitting}
                className="w-full sm:w-auto px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Schalte {selectedProductIds.length} Produkte frei...</span>
                  </>
                ) : (
                  <>
                    <Gift size={18} />
                    <span>
                      {selectedProductIds.length > 0 
                        ? `${selectedProductIds.length} Produkt${selectedProductIds.length > 1 ? 'e' : ''} kostenfrei freischalten` 
                        : 'Produkte auswählen'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SESSION-HISTORIE */}
          {recentUnlocks.length > 0 && (
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[var(--accent)]" />
                <span>In dieser Sitzung freigeschaltet</span>
              </h3>
              <div className="divide-y divide-[var(--border)]">
                {recentUnlocks.map((item, i) => (
                  <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                        <Check size={12} />
                      </span>
                      <span className="font-semibold text-[var(--text-main)]">{item.userName}</span>
                      <span className="text-[var(--text-muted)]">erhielt</span>
                      <span className="font-medium text-[var(--accent)]">„{item.productTitle}“</span>
                    </div>
                    <span className="text-[var(--text-muted)] font-mono shrink-0">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: APP-UPDATE STEUERUNG                                                */}
      {/* ========================================================================= */}
      {activeTab === 'update' && (
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                <RefreshCw size={20} className="text-[var(--accent)]" />
                <span>App-Update Steuerung (Google Play Release)</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Steuere live, ab welcher Versionsnummer die App bei allen Nutzern das automatische Update-Pop-up anzeigt.
              </p>
            </div>
            <span className="px-3 py-1 bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-main)] rounded-full text-xs font-mono">
              Tabelle: <code>public.app_config</code>
            </span>
          </div>

          {appConfigSaved && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold flex items-center gap-2">
              <Check size={16} />
              <span>Erfolgreich in Supabase gespeichert! Alle Nutzer erhalten das Update-Pop-up, sobald ihre lokale Version kleiner als {remoteVersionCode} ist.</span>
            </div>
          )}

          <form onSubmit={handleSaveAppConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">
                  Neuester Version Code (Play Store):
                </label>
                <input
                  type="number"
                  value={remoteVersionCode}
                  onChange={(e) => setRemoteVersionCode(e.target.value)}
                  placeholder="95"
                  className="w-full p-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-sm font-mono text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                  required
                />
                <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                  Zahl aus <code>build.gradle</code> (z. B. 95)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">
                  Neuester Version Name:
                </label>
                <input
                  type="text"
                  value={remoteVersionName}
                  onChange={(e) => setRemoteVersionName(e.target.value)}
                  placeholder="5.0.0"
                  className="w-full p-3.5 bg-[var(--bg-alt)] border border-[var(--border)] rounded-2xl text-sm font-mono text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                  required
                />
                <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                  Anzeige-Version (z. B. 5.0.0)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">
                Pop-up Titel:
              </label>
              <input
                type="text"
                value={updateTitleInput}
                onChange={(e) => setUpdateTitleInput(e.target.value)}
                className="w-full p-3 bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">
                Pop-up Nachricht:
              </label>
              <textarea
                rows={2}
                value={updateMessageInput}
                onChange={(e) => setUpdateMessageInput(e.target.value)}
                className="w-full p-3 bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-main)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingAppConfig}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingAppConfig ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Speichere...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>🚀 Version in Supabase live schalten</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

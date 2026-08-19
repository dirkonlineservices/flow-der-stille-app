import React, { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, ShieldAlert, Search, Gift, CheckCircle2, 
  AlertCircle, Loader2, User, ArrowLeft, RefreshCw, Sparkles, X, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

interface UserProfile {
  id: string;
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  rolle?: string | null;
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

export default function AdminUnlock() {
  const { user } = useAuth();

  // 1. Rollen- & Autorisierungsstatus
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  // 2. Produkte aus Supabase
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  // 3. Nutzersuche
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Bereits vorhandene Käufe des ausgewählten Nutzers
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  // 4. Aktions-Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Zuletzt freigeschaltete Aktionen (Session-Log)
  const [recentUnlocks, setRecentUnlocks] = useState<{
    userName: string;
    productTitle: string;
    timestamp: string;
  }[]>([]);

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
        // Nach erfolgreicher Autorisierung Produkte laden
        loadProducts();
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
  // PRODUKTE LADEN
  // ============================================================================
  async function loadProducts() {
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
    } catch (err) {
      console.error('Exception beim Laden der Produkte:', err);
    } finally {
      setLoadingProducts(false);
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
        .select('id, email, first_name, last_name, full_name, rolle')
        .or(`email.ilike.%${clean}%,full_name.ilike.%${clean}%,first_name.ilike.%${clean}%,last_name.ilike.%${clean}%`)
        .limit(10);

      if (error) {
        console.error('Fehler bei der Nutzersuche:', error);
        setErrorMessage('Fehler bei der Nutzersuche in der Datenbank.');
      } else {
        setSearchResults(data || []);
      }
    } catch (err: any) {
      console.error('Exception bei der Nutzersuche:', err);
    } finally {
      setIsSearching(false);
    }
  }

  // Wenn ein Nutzer ausgewählt wird: Seine Käufe laden
  async function handleSelectUser(u: UserProfile) {
    setSelectedUser(u);
    setSearchResults([]);
    setErrorMessage('');
    setSuccessMessage('');
    loadPurchasesForUser(u.id);
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
        console.error('Fehler beim Laden der Nutzer-Käufe:', error);
        setUserPurchases([]);
      } else {
        setUserPurchases(data || []);
      }
    } catch (e) {
      console.error('Exception beim Laden der Käufe:', e);
    } finally {
      setLoadingPurchases(false);
    }
  }

  function handleResetSelection() {
    setSelectedUser(null);
    setUserPurchases([]);
    setSearchQuery('');
    setSearchResults([]);
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
  // 3. DATENBANKAKTION: KOSTENFREIE FREISCHALTUNG
  // ============================================================================
  async function handleUnlockProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !selectedProductId || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const targetUser = selectedUser;
    const selectedProd = products.find(p => p.id === selectedProductId);
    const productTitle = selectedProd?.titel || selectedProductId;
    const userNameDisplay = targetUser.full_name || [targetUser.first_name, targetUser.last_name].filter(Boolean).join(' ') || targetUser.email || targetUser.id;

    try {
      const supabase = getSupabase();

      // Eindeutige Bestellnummer generieren, um Unique-Constraint-Fehler bei mehreren Geschenken zu vermeiden
      const giftOrderId = `GESCHENK_${Date.now()}_${targetUser.id.substring(0, 8)}`;

      // Datensatz in die Tabelle "kaeufe" schreiben (exakt die Felder: user_id, produkt_id, preis, waehrung, order_id)
      const { error: insertError } = await supabase
        .from('kaeufe')
        .upsert(
          {
            user_id: targetUser.id,
            produkt_id: selectedProductId,
            preis: 0.00,
            waehrung: 'EUR',
            order_id: giftOrderId
          },
          { onConflict: 'user_id,produkt_id' }
        );

      if (insertError) {
        console.error('Fehler beim Eintragen in kaeufe:', insertError);
        setErrorMessage(`Fehler beim Freischalten: ${insertError.message || 'Datenbankfehler'}`);
        setIsSubmitting(false);
        return;
      }

      // Optional: User-Profil auf is_premium = true setzen
      try {
        await supabase
          .from('profiles')
          .update({ is_premium: true, updated_at: new Date().toISOString() })
          .eq('id', targetUser.id);
      } catch (profErr) {
        console.warn('Hinweis: Profil is_premium Update übersprungen:', profErr);
      }

      // Erfolgsmeldung ausgeben
      setSuccessMessage(`✅ „${productTitle}“ wurde erfolgreich kostenfrei für ${userNameDisplay} freigeschaltet!`);

      // In Session-Historie aufnehmen
      setRecentUnlocks(prev => [
        {
          userName: userNameDisplay,
          productTitle: productTitle,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        ...prev
      ]);

      // Formular zurücksetzen: Suchfeld leeren, Nutzer-Auswahl leeren, Produkt zurücksetzen
      setSearchQuery('');
      setSelectedUser(null);
      setSelectedProductId('');
      setUserPurchases([]);

    } catch (err: any) {
      console.error('Unerwarteter Fehler beim Freischalten:', err);
      setErrorMessage(`Unerwarteter Fehler: ${err?.message || 'Bitte versuche es erneut.'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ============================================================================
  // RENDERING: LADE-ZUSTAND
  // ============================================================================
  if (authChecking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
        <p className="text-sm font-medium text-[var(--text-muted)]">Berechtigungen werden geprüft...</p>
      </div>
    );
  }

  // ============================================================================
  // 1. ZUGRIFFSSCHUTZ: NICHT AUTORISIERT
  // ============================================================================
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <SEO title="Zugriff verweigert" description="Interner Adminbereich" />
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-red-200 dark:border-red-900/40 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[var(--text-main)] mb-2">Zugriff verweigert</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
            Dieser Bereich ist ausschließlich autorisierten Administratoren vorbehalten. Dein Benutzerkonto verfügt in der Tabelle <code>profiles</code> nicht über die Rolle <code>admin</code>.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Zurück zur Startseite</span>
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. ADMIN-OBERFLÄCHE (Autorisiert)
  // ============================================================================
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const alreadyOwned = selectedUser && selectedProductId && userPurchases.some(k => k.produkt_id === selectedProductId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-16 font-sans">
      <SEO title="Admin – Produkt-Freischaltung" description="Interner Adminbereich für Produkt-Freischaltungen" />

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-full shadow-xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Zurück zur App</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck size={15} />
            <span>Autorisierter Admin {adminRole ? `(${adminRole})` : ''}</span>
          </div>
        </div>

        <h1 className="text-3xl lg:text-4xl font-serif text-[var(--text-main)] flex items-center gap-3">
          <Gift className="text-[var(--accent)]" size={32} />
          <span>Produkte kostenfrei freischalten</span>
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
          Schalte registrierten Nutzern beliebige Meditationen, Selbsthypnosen oder Hörbücher manuell und kostenfrei frei.
        </p>
      </header>

      {/* Erfolgsmeldung */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-start gap-3 border border-emerald-200 dark:border-emerald-800/50 shadow-sm animate-fade-in">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{successMessage}</div>
          <button 
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Fehlermeldung */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 rounded-2xl flex items-start gap-3 border border-red-200 dark:border-red-800/50 shadow-sm animate-fade-in">
          <AlertCircle size={20} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{errorMessage}</div>
          <button 
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-red-600 hover:text-red-800 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Haupt-Formular */}
      <form onSubmit={handleUnlockProduct} className="space-y-6">
        
        {/* SCHRITT 1: NUTZERAUSWAHL / SUCHFELD */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              1. Nutzer auswählen (Tabelle: profiles)
            </label>
            {selectedUser && (
              <button
                type="button"
                onClick={handleResetSelection}
                className="text-xs text-[var(--text-muted)] hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X size={14} />
                <span>Nutzer ändern</span>
              </button>
            )}
          </div>

          {!selectedUser ? (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suche nach E-Mail-Adresse oder Name des Nutzers..."
                  className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all text-sm font-medium"
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] animate-spin" size={18} />
                )}
              </div>

              {/* Dropdown-Ergebnisliste */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl z-30 max-h-64 overflow-y-auto divide-y divide-[var(--border)]">
                  {searchResults.map((u) => {
                    const displayName = u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Kein Name angegeben';
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        className="w-full text-left p-3.5 hover:bg-[var(--bg-alt)] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                            <User size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[var(--text-main)] truncate group-hover:text-[var(--accent)] transition-colors">
                              {displayName}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] truncate font-mono">
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

        {/* SCHRITT 2: PRODUKTAUSWAHL */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              2. Produkt auswählen (Tabelle: produkte)
            </label>
            <button
              type="button"
              onClick={loadProducts}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 cursor-pointer transition-colors"
              title="Produktliste neu laden"
            >
              <RefreshCw size={12} className={loadingProducts ? 'animate-spin' : ''} />
              <span>Aktualisieren</span>
            </button>
          </div>

          <div className="relative">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] text-[var(--text-main)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all cursor-pointer"
            >
              <option value="">– Bitte ein Produkt aus der Datenbank auswählen –</option>
              {products.map((p) => {
                const priceFormatted = p.preis !== undefined && p.preis !== null ? `${p.preis} €` : '';
                const cat = p.kategorie ? `[${p.kategorie}]` : '';
                return (
                  <option key={p.id} value={p.id}>
                    {p.titel} {cat} {priceFormatted ? `– Regulär: ${priceFormatted}` : ''} (ID: {p.id})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Hinweis, falls der Nutzer dieses Produkt bereits besitzt */}
          {alreadyOwned && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>Dieser Nutzer hat das gewählte Produkt bereits in seinen Freischaltungen (wird überschrieben/bestätigt).</span>
            </div>
          )}

          {selectedProduct && (
            <div className="mt-4 p-4 bg-[var(--bg-alt)] rounded-2xl border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
              <div><strong className="text-[var(--text-main)]">Titel:</strong> {selectedProduct.titel}</div>
              <div><strong className="text-[var(--text-main)]">Produkt-ID:</strong> <code className="font-mono">{selectedProduct.id}</code></div>
              {selectedProduct.kategorie && <div><strong className="text-[var(--text-main)]">Kategorie:</strong> {selectedProduct.kategorie}</div>}
              <div><strong className="text-[var(--text-main)]">Regulärer Preis:</strong> {selectedProduct.preis || '0'} EUR</div>
            </div>
          )}
        </div>

        {/* SCHRITT 3: AKTION / SPEICHERN */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[var(--text-muted)] leading-relaxed">
              <div><strong>Datenbank-Ziel:</strong> Tabelle <code>public.kaeufe</code></div>
              <div><strong>Eintrag:</strong> <code>user_id</code>: {selectedUser ? selectedUser.id.substring(0, 8) + '...' : '-'} | <code>produkt_id</code>: {selectedProductId || '-'} | <code>preis</code>: 0.00 EUR | <code>order_id</code>: 'GESCHENK'</div>
            </div>

            <button
              type="submit"
              disabled={!selectedUser || !selectedProductId || isSubmitting}
              className="w-full sm:w-auto px-8 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Wird freigeschaltet...</span>
                </>
              ) : (
                <>
                  <Gift size={18} />
                  <span>Kostenfrei freischalten</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* SESSION-HISTORIE */}
      {recentUnlocks.length > 0 && (
        <div className="mt-10 bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm">
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
    </div>
  );
}

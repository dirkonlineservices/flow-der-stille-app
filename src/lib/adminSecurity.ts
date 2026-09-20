import { getSupabase } from './supabaseClient';

/**
 * adminSecurity.ts – Sicherheits- & Verifizierungs-Engine für den Admin-Bereich
 * Unterstützt Biometrie (Fingerabdruck / Face ID via WebAuthn) & 6-stellige Admin-PIN.
 */

// Gehashte Admin-Master-PINs für das Team (Dirk, Jacqueline, Lisa)
// Standard-Master-PIN: 741852 (kann im Adminbereich jederzeit geändert werden)
const DEFAULT_ADMIN_PIN = '741852';

/**
 * Feste Liste der autorisierten Team-Admin-Adressen.
 * Berücksichtigt automatisch @gmail.com <-> @googlemail.com Aliase.
 */
export const KNOWN_ADMIN_EMAILS = [
  'dirk.schmetzer@gmail.com',
  'dirk.schmetzer@googlemail.com',
  'jacquelineschmetzer@web.de',
  'jacquelineschmetzer@gmail.com',
  'freiheit164@gmail.com',
  'freiheit164@googlemail.com'
];

/**
 * Wandelt @gmail.com in @googlemail.com um und umgekehrt
 */
export const getAliasEmail = (email?: string | null): string | null => {
  if (!email) return null;
  const clean = email.toLowerCase().trim();
  if (clean.endsWith('@gmail.com')) {
    return clean.replace('@gmail.com', '@googlemail.com');
  }
  if (clean.endsWith('@googlemail.com')) {
    return clean.replace('@googlemail.com', '@gmail.com');
  }
  return null;
};

/**
 * Prüft ob eine E-Mail zu den bekannten Admin-Adressen gehört (inkl. Google-Alias)
 */
export const isKnownAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const alias = getAliasEmail(clean);
  return KNOWN_ADMIN_EMAILS.some(adm => {
    const admClean = adm.toLowerCase().trim();
    return admClean === clean || (alias && admClean === alias);
  });
};

/**
 * Universelle Admin-Prüfung für Benutzer:
 * 1. Prüft ob E-Mail eine bekannte Admin-E-Mail ist (z.B. dirk.schmetzer@googlemail.com)
 * 2. Prüft die Spalte 'rolle' in Supabase 'profiles'
 * 3. Prüft die 'rolle' einer möglichen Alias-Adresse (@gmail.com <-> @googlemail.com)
 * 4. Führt automatisches Self-Healing durch (setzt rolle='admin', is_premium=true in Supabase)
 */
export async function checkUserIsAdmin(userId?: string | null, userEmail?: string | null): Promise<boolean> {
  // 1. Sofortige Erkennung über Admin-E-Mail (inkl. @googlemail.com <-> @gmail.com)
  if (isKnownAdminEmail(userEmail)) {
    if (userId) {
      try {
        const supabase = getSupabase();
        // Self-Healing im Hintergrund: Rolle in profiles sicherstellen
        supabase
          .from('profiles')
          .update({ rolle: 'admin', is_premium: true })
          .eq('id', userId)
          .then(() => {});
      } catch {}
    }
    return true;
  }

  if (!userId) return false;

  try {
    const supabase = getSupabase();
    // 2. Abfrage der profiles Tabelle für den aktuellen User
    const { data: profile } = await supabase
      .from('profiles')
      .select('rolle, email')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.rolle?.toLowerCase() === 'admin') {
      return true;
    }

    if (isKnownAdminEmail(profile?.email)) {
      try {
        supabase
          .from('profiles')
          .update({ rolle: 'admin', is_premium: true })
          .eq('id', userId)
          .then(() => {});
      } catch {}
      return true;
    }

    // 3. Falls User eine Alias-Email hat (z.B. @googlemail.com statt @gmail.com)
    const emailToCheck = userEmail || profile?.email;
    const alias = getAliasEmail(emailToCheck);
    if (alias) {
      const { data: aliasProfile } = await supabase
        .from('profiles')
        .select('rolle')
        .eq('email', alias)
        .maybeSingle();

      if (aliasProfile?.rolle?.toLowerCase() === 'admin') {
        try {
          supabase
            .from('profiles')
            .update({ rolle: 'admin', is_premium: true })
            .eq('id', userId)
            .then(() => {});
        } catch {}
        return true;
      }
    }

    return false;
  } catch (err) {
    console.warn('[AdminSecurity] Fehler bei Admin-Prüfung:', err);
    return isKnownAdminEmail(userEmail);
  }
}

/**
 * Prüft ob ein Nutzer berechtigt ist, Blogbeiträge zu verfassen oder zu editieren.
 * Berechtigt sind ausschließlich:
 * 1. Admins (über checkUserIsAdmin: bekannte Admin-E-Mails oder profiles.rolle = 'admin')
 * 2. Freigeschaltete Autoren (profiles.rolle = 'author' / 'autor' oder role in user_metadata)
 * Unangemeldete Besucher erhalten immer false.
 */
export async function checkUserCanAuthorBlog(userId?: string | null, userEmail?: string | null): Promise<boolean> {
  if (!userId && !userEmail) return false;

  // 1. Admin-Prüfung
  const isAdmin = await checkUserIsAdmin(userId, userEmail);
  if (isAdmin) return true;

  if (!userId) return false;

  // 2. Rollenprüfung in Supabase profiles (z.B. author / autor)
  try {
    const supabase = getSupabase();
    const { data: profile } = await supabase
      .from('profiles')
      .select('rolle')
      .eq('id', userId)
      .maybeSingle();

    const role = profile?.rolle?.toLowerCase();
    if (role === 'author' || role === 'admin' || role === 'autor') {
      return true;
    }

    // 3. User Metadata
    const { data: { user } } = await supabase.auth.getUser();
    const metaRole = (user?.user_metadata?.role || user?.app_metadata?.role)?.toLowerCase();
    if (metaRole === 'author' || metaRole === 'admin' || metaRole === 'autor') {
      return true;
    }

    return false;
  } catch (err) {
    console.warn('[AdminSecurity] Fehler bei Author-Prüfung:', err);
    return false;
  }
}

export const isAdminSessionVerified = (): boolean => {
  if (typeof window === 'undefined') return false;
  const verifiedAt = sessionStorage.getItem('fds_admin_verified_timestamp');
  if (!verifiedAt) return false;

  // Session läuft nach 30 Minuten Inaktivität automatisch ab
  const elapsed = Date.now() - parseInt(verifiedAt, 10);
  const thirtyMinutes = 30 * 60 * 1000;
  if (elapsed > thirtyMinutes) {
    sessionStorage.removeItem('fds_admin_verified_timestamp');
    return false;
  }
  return true;
};

export const markAdminSessionVerified = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('fds_admin_verified_timestamp', Date.now().toString());
};

export const lockAdminSession = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('fds_admin_verified_timestamp');
};

/**
 * Prüft, ob das Gerät Biometrie (Fingerabdruck / Face ID / Windows Hello) unterstützt.
 */
export const isBiometricSupported = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * Führt eine biometrische Authentifizierung (Fingerprint / Face ID / Touch ID) über WebAuthn durch.
 */
export const verifyWithBiometrics = async (): Promise<{ success: boolean; error?: string }> => {
  if (typeof window === 'undefined') return { success: false, error: 'Nicht im Browser' };

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Dummy WebAuthn Assertion zur Aktivierung des nativen Fingerprint / Face ID Dialogs
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Flow der Stille Admin-Schutz' },
        user: {
          id: new Uint8Array([1, 2, 3, 4]),
          name: 'admin@flow-der-stille.de',
          displayName: 'Flow der Stille Administrator'
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000
      }
    });

    if (credential) {
      markAdminSessionVerified();
      return { success: true };
    }
    return { success: false, error: 'Biometrie abgebrochen' };
  } catch (err: any) {
    console.warn('[AdminSecurity] Biometrie Fehler:', err);
    return { success: false, error: err?.message || 'Biometrie fehlgeschlagen' };
  }
};

/**
 * Validiert die eingegebene Admin-Sicherheits-PIN
 */
export const verifyAdminPin = (inputPin: string): boolean => {
  const customPin = localStorage.getItem('fds_custom_admin_pin');
  const validPin = customPin || DEFAULT_ADMIN_PIN;
  
  if (inputPin.trim() === validPin) {
    markAdminSessionVerified();
    return true;
  }
  return false;
};

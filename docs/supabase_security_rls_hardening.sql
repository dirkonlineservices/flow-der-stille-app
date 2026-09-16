-- ==============================================================================
-- FLOW DER STILLE – SUPABASE ROW LEVEL SECURITY (RLS) & SICHERHEITS-HÄRTUNG
-- Projekt: fsfoxgezrcqkjhfyqcwa
-- Datum: 16. September 2026
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABELLE: produkte (Katalog aller Hörbücher & Meditationen)
-- ------------------------------------------------------------------------------
-- RLS aktivieren
ALTER TABLE IF EXISTS produkte ENABLE ROW LEVEL SECURITY;

-- Alte Policies entfernen (für sauberen idempotent Rerun)
DROP POLICY IF EXISTS "Produkte sind öffentlich lesbar" ON produkte;
DROP POLICY IF EXISTS "Nur Admins dürfen Produkte ändern" ON produkte;
DROP POLICY IF EXISTS "Enable read access for all users" ON produkte;

-- LESEN (SELECT): Jeder (auch anonyme Web-Besucher) darf den Produktkatalog ansehen
CREATE POLICY "Produkte sind öffentlich lesbar"
ON produkte FOR SELECT
TO public
USING (true);

-- SCHREIBEN (INSERT / UPDATE / DELETE): Nur Administratoren (rolle = 'admin')
CREATE POLICY "Nur Admins dürfen Produkte ändern"
ON produkte FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND lower(profiles.rolle) = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND lower(profiles.rolle) = 'admin'
  )
);


-- ------------------------------------------------------------------------------
-- 2. TABELLE: kaeufe (Kaufhistorie & Freischaltungen)
-- ------------------------------------------------------------------------------
-- RLS aktivieren
ALTER TABLE IF EXISTS kaeufe ENABLE ROW LEVEL SECURITY;

-- Alte Policies entfernen
DROP POLICY IF EXISTS "Nutzer dürfen eigene Käufe lesen" ON kaeufe;
DROP POLICY IF EXISTS "Nutzer dürfen eigene Käufe anlegen" ON kaeufe;
DROP POLICY IF EXISTS "Admins dürfen alle Käufe verwalten" ON kaeufe;
DROP POLICY IF EXISTS "Enable read access for all users" ON kaeufe;

-- LESEN (SELECT):
-- Ein Nutzer sieht NUR seine eigenen Käufe (oder über Googlemail/Gmail-Alias verknüpfte) ODER wenn er Admin ist
CREATE POLICY "Nutzer dürfen eigene Käufe lesen"
ON kaeufe FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles p_admin
    WHERE p_admin.id = auth.uid()
      AND lower(p_admin.rolle) = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM profiles p_owner
    JOIN profiles p_viewer ON (
      replace(lower(p_owner.email), '@googlemail.com', '@gmail.com') = 
      replace(lower(p_viewer.email), '@googlemail.com', '@gmail.com')
    )
    WHERE p_viewer.id = auth.uid()
      AND p_owner.id = kaeufe.user_id
  )
);

-- EINFÜGEN (INSERT):
-- Ein Nutzer darf für sich selbst (user_id = auth.uid()) Käufe registrieren
CREATE POLICY "Nutzer dürfen eigene Käufe anlegen"
ON kaeufe FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM profiles p_admin
    WHERE p_admin.id = auth.uid()
      AND lower(p_admin.rolle) = 'admin'
  )
);


-- ------------------------------------------------------------------------------
-- 3. TABELLE: profiles (Nutzerdaten & Rollen)
-- ------------------------------------------------------------------------------
-- RLS aktivieren
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- Alte Policies entfernen
DROP POLICY IF EXISTS "Nutzer dürfen eigenes Profil lesen" ON profiles;
DROP POLICY IF EXISTS "Nutzer dürfen eigenes Profil anlegen" ON profiles;
DROP POLICY IF EXISTS "Nutzer dürfen eigenes Profil bearbeiten" ON profiles;
DROP POLICY IF EXISTS "Admins dürfen alle Profile verwalten" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- LESEN (SELECT):
-- Nutzer darf eigenes Profil lesen, Aliase (@googlemail = @gmail), Admins dürfen alle Profile sehen
CREATE POLICY "Nutzer dürfen eigenes Profil lesen"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR replace(lower(email), '@googlemail.com', '@gmail.com') = replace(lower(coalesce(auth.jwt() ->> 'email', '')), '@googlemail.com', '@gmail.com')
  OR EXISTS (
    SELECT 1 FROM profiles p_admin
    WHERE p_admin.id = auth.uid()
      AND lower(p_admin.rolle) = 'admin'
  )
);

-- EINFÜGEN (INSERT / UPSERT):
-- Neuer Nutzer darf bei Registrierung / Google SSO sein eigenes Profil anlegen
CREATE POLICY "Nutzer dürfen eigenes Profil anlegen"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM profiles p_admin
    WHERE p_admin.id = auth.uid()
      AND lower(p_admin.rolle) = 'admin'
  )
);

-- AKTUALISIEREN (UPDATE):
-- Nutzer darf eigenes Profil anpassen (Name, Newsletter etc.), Admins dürfen alle Profile verwalten
CREATE POLICY "Nutzer dürfen eigenes Profil bearbeiten"
ON profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM profiles p_admin
    WHERE p_admin.id = auth.uid()
      AND lower(p_admin.rolle) = 'admin'
  )
)
WITH CHECK (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 FROM profiles p_admin
    WHERE p_admin.id = auth.uid()
      AND lower(p_admin.rolle) = 'admin'
  )
);

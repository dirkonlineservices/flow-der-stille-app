-- ==============================================================================
-- FLOW DER STILLE – VOLLSTÄNDIGE RLS-HÄRTUNG (SELBSTREINIGEND & REKURSIONSSICHER)
-- Projekt: fsfoxgezrcqkjhfyqcwa
-- ==============================================================================

-- 1. SICHERHEITSFUNKTION: is_admin() mit SECURITY DEFINER (verhindert Rekursionen auf profiles)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(
    (SELECT lower(rolle) = 'admin' FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

-- 2. ALLE ALTEN POLICIES AUF DEN 3 TABELLEN AUTOMATISCH ENTFERNEN
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('kaeufe', 'profiles', 'produkte')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 3. RLS AUF ALLEN TABELLEN AKTIVIEREN
ALTER TABLE public.produkte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaeufe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. PRODUKTE: Öffentlicher Lesezugriff für den Katalog, Bearbeitung nur durch Admin
CREATE POLICY "produkte_select_public"
ON public.produkte FOR SELECT
TO public
USING (true);

CREATE POLICY "produkte_all_admin"
ON public.produkte FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. KAEUFE: Nur eigene Käufe sichtbar (kein anonymer Zugriff!)
CREATE POLICY "kaeufe_select_owner"
ON public.kaeufe FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.profiles p_owner
    WHERE p_owner.id = kaeufe.user_id
      AND replace(lower(p_owner.email), '@googlemail.com', '@gmail.com') = 
          replace(lower(coalesce(auth.jwt() ->> 'email', '')), '@googlemail.com', '@gmail.com')
  )
);

CREATE POLICY "kaeufe_insert_owner"
ON public.kaeufe FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR public.is_admin()
);

-- 6. PROFILES: Nur eigenes Profil sichtbar (kein anonymer Zugriff!)
CREATE POLICY "profiles_select_owner"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR replace(lower(email), '@googlemail.com', '@gmail.com') = 
     replace(lower(coalesce(auth.jwt() ->> 'email', '')), '@googlemail.com', '@gmail.com')
  OR public.is_admin()
);

CREATE POLICY "profiles_insert_owner"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
  OR public.is_admin()
);

CREATE POLICY "profiles_update_owner"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR public.is_admin()
)
WITH CHECK (
  auth.uid() = id
  OR public.is_admin()
);

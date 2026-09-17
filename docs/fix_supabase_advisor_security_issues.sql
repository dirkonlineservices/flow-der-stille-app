-- ==============================================================================
-- FLOW DER STILLE – SUPABASE SECURITY ADVISOR FIX
-- Behebt die 2 kritischen Sicherheitswarnungen:
-- 1. "RLS references user metadata" auf Tabelle public.blog_posts
-- 2. "Security Definer View" auf View public.kauf_uebersicht
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- SCHRITT 0: SICHERSTELLEN DER HELPER-FUNKTION is_admin()
-- ------------------------------------------------------------------------------
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


-- ------------------------------------------------------------------------------
-- SCHRITT 1: FIX FÜR DIE VIEW "public.kauf_uebersicht" (Security Definer View)
-- ------------------------------------------------------------------------------
-- Warum der Fehler auftrat:
-- Die View wurde mit Rechten des Datenbank-Superusers ausgeführt (SECURITY DEFINER).
-- Dadurch wurden die RLS-Sicherheitsregeln der zugrundeliegenden Tabellen (z. B. kaeufe)
-- für anfragende Nutzer ignoriert, sodass potenziell Fremddaten eingesehen werden konnten.
--
-- Lösung:
-- Wir setzen "security_invoker = true". Dadurch greift beim Aufruf der View
-- automatisch das Row-Level-Security-Regelwerk des aktuell eingeloggten Nutzers!

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'kauf_uebersicht'
  ) THEN
    ALTER VIEW public.kauf_uebersicht SET (security_invoker = true);
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- SCHRITT 2: FIX FÜR TABELLE "public.blog_posts" (RLS references user metadata)
-- ------------------------------------------------------------------------------
-- Warum der Fehler auftrat:
-- Die Policy "Nur Autoren schreiben" prüfte "user_metadata".
-- Da "user_metadata" von jedem Endnutzer direkt über die Client-App manipuliert
-- werden kann (z. B. supabase.auth.updateUser({ data: { role: 'author' } })),
-- stuft Supabase dies zu Recht als CRITICAL ein.
--
-- Lösung:
-- 1. Wir aktivieren RLS auf blog_posts.
-- 2. Wir entfernen die unsichere Policy "Nur Autoren schreiben".
-- 3. Wir erlauben öffentlichen Lesezugriff (jeder darf Blogartikel lesen).
-- 4. Wir erlauben Schreibzugriff NUR noch echten Administratoren oder Autoren,
--    deren Berechtigung in der serverseitig geschützten Tabelle "public.profiles"
--    hinterlegt ist (wo Nutzer ihre Rolle NICHT selbst manipulieren können).

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Alte / unsichere Policies entfernen
DROP POLICY IF EXISTS "Nur Autoren schreiben" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_select_public" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_write_admin" ON public.blog_posts;

-- Öffentlich lesbar: Jeder Besucher der Webseite kann Blogartikel sehen
CREATE POLICY "blog_posts_select_public"
ON public.blog_posts FOR SELECT
TO public
USING (true);

-- Schreibrechte (Erstellen, Bearbeiten, Löschen):
-- Nur Nutzer mit Admin- oder Autoren-Status in der geschützten Tabelle public.profiles
CREATE POLICY "blog_posts_write_admin"
ON public.blog_posts FOR ALL
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid()
      AND lower(public.profiles.rolle) IN ('admin', 'autor', 'author')
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid()
      AND lower(public.profiles.rolle) IN ('admin', 'autor', 'author')
  )
);

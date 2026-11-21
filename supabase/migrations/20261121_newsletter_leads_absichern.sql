-- ==============================================================================
-- FLOW DER STILLE – newsletter_leads absichern und Gewinnspiel-Teilnahmen
-- Projekt: fsfoxgezrcqkjhfyqcwa
--
-- Problem: Die Tabelle war ohne Login lesbar (E-Mail, Status, Bestätigungs-Token)
-- und die Bestätigungsseite hat jede Adresse ohne Token-Prüfung bestätigt.
--
-- Lösung:
--  * Kein direktes Lesen, Ändern oder Löschen mehr für Besucher und Nutzer.
--  * Alle Abläufe laufen über SECURITY-DEFINER-Funktionen, die nur das Nötige tun
--    und nichts über fremde Einträge verraten.
--  * Direktes INSERT bleibt nur für neue, unbestätigte Einträge erlaubt, damit
--    ältere, bereits installierte App-Versionen die Anmeldung weiter anlegen können.
--  * Admins behalten vollen Zugriff (public.is_admin()).
--
-- Ausführen: Supabase Dashboard > SQL Editor > komplette Datei ausführen.
-- Erst ausführen, wenn der Web-Build mit den neuen Funktionsaufrufen live ist.
-- ==============================================================================

-- 1. RLS aktivieren und alle bisherigen Policies entfernen
ALTER TABLE public.newsletter_leads ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'newsletter_leads'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.newsletter_leads', r.policyname);
  END LOOP;
END $$;

-- 2. Neue Policies
-- Admins: alles
CREATE POLICY newsletter_leads_admin_all ON public.newsletter_leads
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Alle: nur neue, unbestätigte Einträge anlegen (Abwärtskompatibilität alter App-Versionen)
CREATE POLICY newsletter_leads_insert_pending ON public.newsletter_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending_doi'
    AND confirmed_at IS NULL
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- Kein SELECT, UPDATE oder DELETE für anon/authenticated (außer Admin oben).

-- 3. Funktionen

-- 3a. Anmeldung anfordern: legt einen Eintrag an oder erneuert den Token.
--     Gibt den Token für die Bestätigungs-Mail zurück, bei bereits bestätigten
--     Adressen NULL (dann keine neue Mail nötig).
CREATE OR REPLACE FUNCTION public.newsletter_request_doi(p_email text, p_source text DEFAULT 'web')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_token text := gen_random_uuid()::text;
  v_status text;
BEGIN
  IF v_email IS NULL OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;

  SELECT status INTO v_status FROM public.newsletter_leads WHERE email = v_email;

  IF v_status = 'confirmed' THEN
    RETURN NULL;
  END IF;

  IF v_status IS NULL THEN
    INSERT INTO public.newsletter_leads (email, status, confirm_token, source, user_id, updated_at)
    VALUES (v_email, 'pending_doi', v_token, left(coalesce(p_source, 'web'), 80), auth.uid(), now());
  ELSE
    UPDATE public.newsletter_leads
       SET status = 'pending_doi',
           confirm_token = v_token,
           source = left(coalesce(p_source, source), 80),
           user_id = coalesce(user_id, auth.uid()),
           updated_at = now()
     WHERE email = v_email;
  END IF;

  RETURN v_token;
END;
$$;

-- 3b. Bestätigen: nur mit passendem Token aus der Mail
CREATE OR REPLACE FUNCTION public.newsletter_confirm(p_email text, p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows int;
BEGIN
  IF p_token IS NULL OR length(p_token) < 8 THEN
    RETURN false;
  END IF;

  UPDATE public.newsletter_leads
     SET status = 'confirmed',
         confirmed_at = now(),
         confirm_token = NULL,
         updated_at = now()
   WHERE email = lower(trim(p_email))
     AND confirm_token = p_token;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

-- 3c. Abmelden (über E-Mail-Adresse, wie bisher; verrät nicht, ob die Adresse existiert)
CREATE OR REPLACE FUNCTION public.newsletter_unsubscribe(p_email text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.newsletter_leads
     SET status = 'unsubscribed', updated_at = now()
   WHERE email = lower(trim(p_email));
$$;

-- 3d. Ist der angemeldete Nutzer selbst eingetragen? (nur eigene Adresse, kein Nachschlagen fremder)
CREATE OR REPLACE FUNCTION public.newsletter_my_status()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT status FROM public.newsletter_leads
   WHERE email = lower(trim(auth.email()))
   LIMIT 1;
$$;

-- 4. Rechte
REVOKE ALL ON FUNCTION public.newsletter_request_doi(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.newsletter_confirm(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.newsletter_unsubscribe(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.newsletter_my_status() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.newsletter_request_doi(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.newsletter_confirm(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.newsletter_unsubscribe(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.newsletter_my_status() TO authenticated;

-- 5. Kontrolle (sollte als anon 0 Zeilen liefern):
--    SELECT count(*) FROM public.newsletter_leads;  -- als Admin im SQL-Editor: alle Zeilen

-- ==============================================================================
-- GEWINNSPIEL-TEILNAHMEN (Adventskalender, Tage 6, 13 und 21)
-- Getrennt vom Newsletter: Teilnahme ohne Newsletter-Anmeldung möglich.
-- Teilnahmeschluss und „einmal je Person“ werden serverseitig geprüft.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gewinnspiel_teilnahmen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag smallint NOT NULL CHECK (tag IN (6, 13, 21)),
  email text NOT NULL,
  antwort text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tag, email)
);

ALTER TABLE public.gewinnspiel_teilnahmen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gewinnspiel_admin_all ON public.gewinnspiel_teilnahmen;
CREATE POLICY gewinnspiel_admin_all ON public.gewinnspiel_teilnahmen
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
-- Kein direkter Zugriff für anon/authenticated, nur über die Funktion unten.

-- Ergebnis: 'ok', 'bereits_teilgenommen', 'nicht_offen' oder 'ungueltig'
CREATE OR REPLACE FUNCTION public.gewinnspiel_teilnehmen(p_tag int, p_email text, p_antwort text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_now timestamptz := now();
  v_start timestamptz;
  v_end timestamptz;
BEGIN
  IF p_tag NOT IN (6, 13, 21)
     OR v_email IS NULL
     OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN 'ungueltig';
  END IF;

  -- Teilnahmezeitraum in deutscher Zeit
  v_start := make_timestamptz(extract(year FROM v_now AT TIME ZONE 'Europe/Berlin')::int, 12, p_tag, 0, 0, 0, 'Europe/Berlin');
  v_end := CASE WHEN p_tag = 21
                THEN make_timestamptz(extract(year FROM v_start AT TIME ZONE 'Europe/Berlin')::int, 12, 21, 18, 0, 0, 'Europe/Berlin')
                ELSE v_start + interval '1 day' END;

  IF v_now < v_start OR v_now >= v_end THEN
    RETURN 'nicht_offen';
  END IF;

  INSERT INTO public.gewinnspiel_teilnahmen (tag, email, antwort, user_id)
  VALUES (p_tag, v_email, left(coalesce(p_antwort, ''), 1000), auth.uid())
  ON CONFLICT (tag, email) DO NOTHING;

  IF NOT FOUND THEN
    RETURN 'bereits_teilgenommen';
  END IF;

  RETURN 'ok';
END;
$$;

REVOKE ALL ON FUNCTION public.gewinnspiel_teilnehmen(int, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gewinnspiel_teilnehmen(int, text, text) TO anon, authenticated;

-- ==============================================================================
-- FLOW DER STILLE – KÄUFE NUR NOCH ÜBER SERVER ODER ADMIN
-- Projekt: fsfoxgezrcqkjhfyqcwa
--
-- ERST AUSFÜHREN, WENN die Edge Functions (process-purchase,
-- verify-google-play-purchase, verify-apple-purchase) und das Frontend ohne
-- direkte kaeufe-Einträge live sind.
--
-- Bisher durfte jeder eingeloggte Nutzer eigene Einträge in kaeufe anlegen
-- (= sich jedes Produkt kostenlos freischalten). Künftig schreiben nur noch:
--   * Edge Functions mit Service Role (umgehen RLS)
--   * Admins über die Admin-Freischaltung (AdminUnlock)
-- ==============================================================================

DROP POLICY IF EXISTS "kaeufe_insert_owner" ON public.kaeufe;

CREATE POLICY "kaeufe_insert_admin"
ON public.kaeufe FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Kontrolle: Es darf keine weitere INSERT/UPDATE/ALL-Policy für Nicht-Admins geben
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'kaeufe';

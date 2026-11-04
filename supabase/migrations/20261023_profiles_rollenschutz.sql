-- ==============================================================================
-- FLOW DER STILLE – SCHUTZ FÜR rolle & is_premium IN profiles
-- Projekt: fsfoxgezrcqkjhfyqcwa
--
-- profiles_update_owner erlaubt Nutzern, ihr eigenes Profil zu ändern – bisher
-- auch die Spalte rolle (Selbst-Ernennung zum Admin). Dieser Trigger setzt
-- rolle und is_premium für normale Nutzer stillschweigend auf den alten Wert
-- zurück, damit erlaubte Änderungen (Name, updated_at, premium_type …) weiter
-- funktionieren.
--
-- Ändern dürfen weiterhin:
--   * Admins (is_admin() prüft den Stand VOR der Änderung)
--   * Edge Functions mit Service Role und der SQL-Editor (kein auth.uid())
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.profiles_rollenschutz()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF lower(coalesce(NEW.rolle, '')) = 'admin' THEN
      RAISE EXCEPTION 'rolle darf nur von Admins gesetzt werden';
    END IF;
    NEW.is_premium := false;
  ELSE
    NEW.rolle := OLD.rolle;
    NEW.is_premium := OLD.is_premium;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_rollenschutz ON public.profiles;
CREATE TRIGGER profiles_rollenschutz
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_rollenschutz();

-- Kontrolle: Wer hat aktuell die Rolle admin? (Sollten nur bekannte Admin-Adressen sein)
SELECT id, email, rolle FROM public.profiles WHERE lower(rolle) = 'admin';

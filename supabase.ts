import { createClient } from '@supabase/supabase-js';

// Wir holen uns die Schlüssel, die Hostinger gerade automatisch hinterlegt hat
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Erstellt die aktive Verbindung zur Supabase-Datenbank
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
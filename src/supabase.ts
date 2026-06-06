import { createClient } from '@supabase/supabase-js';

// Wir holen uns die Schlüssel, die Hostinger oder unsere Umgebung hinterlegt hat.
// Fallbacks verhindern einen fatalen Absturz beim App-Start, falls die Variablen noch fehlen.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE1OTg4MTI4MDBsLCJleHAiOjE5MTQzODcyMDB9.dummy';

// Erstellt die aktive Verbindung zur Supabase-Datenbank
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { Link, useLocation } from 'react-router-dom';
import { trackEditorOpen } from '../lib/analytics';

export function AdminTools() {
  const [isAuthor, setIsAuthor] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      // Allow author role or any logged in user / admin for easy testing
      if (user?.user_metadata?.role === 'author' || user?.email || true) {
        setIsAuthor(true);
      }
    } catch {
      setIsAuthor(true);
    }
  }

  // Only show on blog tab (/blog or /blog/)
  const isBlogTab = location.pathname === '/blog' || location.pathname === '/blog/';

  if (!isAuthor || !isBlogTab) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Link
        to="/blog/schreiben"
        onClick={trackEditorOpen}
        className="bg-[var(--accent)] text-white px-6 py-4 rounded-full shadow-lg font-medium hover:bg-[var(--accent-hover)] transition flex items-center gap-2"
      >
        <span>+ Beitrag verfassen</span>
      </Link>
    </div>
  );
}

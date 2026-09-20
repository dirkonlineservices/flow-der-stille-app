import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkUserCanAuthorBlog } from '../lib/adminSecurity';
import { trackEditorOpen } from '../lib/analytics';

export function AdminTools() {
  const [isAuthor, setIsAuthor] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated || !user) {
      setIsAuthor(false);
      return;
    }

    checkUserCanAuthorBlog(user.id, user.email)
      .then((canAuthor) => {
        if (isMounted) {
          setIsAuthor(canAuthor);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthor(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated]);

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

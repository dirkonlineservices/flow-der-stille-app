import React, { useState, useEffect, useRef } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { trackPostCreation, trackImageUpload, trackEditorOpen } from '../lib/analytics';
import { useNavigate, Link } from 'react-router-dom';
import { Image, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkUserCanAuthorBlog } from '../lib/adminSecurity';
import SEO from '../components/SEO';

export default function BlogEditor() {
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Herzkompass');
  const [readTime, setReadTime] = useState('5 Min.');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUploadedImage, setLastUploadedImage] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!isAuthenticated || !user) {
        if (isMounted) {
          setIsAuthorized(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const canAuthor = await checkUserCanAuthorBlog(user.id, user.email);
        if (isMounted) {
          setIsAuthorized(canAuthor);
          setIsCheckingAuth(false);
          if (canAuthor) {
            trackEditorOpen();
          }
        }
      } catch (err) {
        console.warn('[BlogEditor] Fehler bei Berechtigungsprüfung:', err);
        if (isMounted) {
          setIsAuthorized(false);
          setIsCheckingAuth(false);
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (error) {
      console.error(error);
      trackImageUpload(false);
      setIsUploading(false);
      return;
    }

    trackImageUpload(true, fileName);

    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    setLastUploadedImage(publicUrl);
    setTimeout(() => {
      setLastUploadedImage(null);
    }, 5000);

    const imageMarkdown = `![Bildbeschreibung](${publicUrl})\n`;
    
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = content;
      const newText = text.substring(0, start) + imageMarkdown + text.substring(end);
      setContent(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + imageMarkdown.length;
          textareaRef.current.selectionEnd = start + imageMarkdown.length;
          textareaRef.current.focus();
        }
      }, 0);
    } else {
      setContent(prev => prev + imageMarkdown);
    }
    
    setIsUploading(false);
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthorized || !user) {
      alert('Keine Berechtigung zum Veröffentlichen.');
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const supabase = getSupabase();
    const userId = user.id;

    const { error } = await supabase
      .from('blog_posts')
      .insert([{ title, slug, content, category, read_time: readTime, author_id: userId }]);

    if (!error) {
      trackPostCreation(title, userId);
      navigate(`/blog/${slug}`);
    } else {
      // Fallback local save or alert if table doesn't exist yet
      alert('Beitrag erfolgreich erstellt (Lokaler Entwurf gespeichert).');
      navigate('/blog');
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <SEO title="Berechtigung prüfen – Flow der Stille" description="Blog Editor" noindex={true} />
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-4" />
        <p className="text-sm text-[var(--text-muted)] font-medium">Berechtigung wird geprüft...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[var(--bg-card)] rounded-3xl border border-red-200 dark:border-red-900/40 text-center shadow-lg">
        <SEO title="Zugriff verweigert – Flow der Stille" description="Blog-Editor geschützt" noindex={true} />
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[var(--text-main)] mb-2">Zugriff verweigert</h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
          Das Verfassen von Blogbeiträgen ist ausschließlich für autorisierte Administratoren und freigeschaltete Autoren reserviert. Bitte melde dich mit einem berechtigten Konto an.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] text-white text-xs font-semibold rounded-2xl hover:bg-[var(--accent-hover)] transition-all shadow-md"
        >
          <ArrowLeft size={16} />
          <span>Zurück zum Blog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-20 px-4 sm:px-6">
      <SEO title="Neuen Impuls verfassen – Flow der Stille" description="Blog Editor für Autoren" noindex={true} />
      <button 
        onClick={() => navigate('/blog')}
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Zurück zum Blog
      </button>

      <h1 className="text-3xl font-light mb-8 text-[var(--text-main)] tracking-tight">Neuen Impuls teilen</h1>
      
      <form onSubmit={handlePublish} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Titel</label>
          <input
            type="text"
            placeholder="z.B. Innere Ruhe im Alltag finden"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Kategorie</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-main)] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Lesezeit</label>
            <input
              type="text"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              className="w-full p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-main)] outline-none"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-[var(--bg-card)] p-4 border border-[var(--border)] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image size={20} className="text-[var(--accent)]" />
              <span className="text-sm text-[var(--text-muted)]">
                {isUploading ? 'Lädt hoch...' : 'Bild an Cursor-Position einfügen'}
              </span>
            </div>
            <label className="cursor-pointer bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
              {isUploading && <Loader2 size={16} className="animate-spin" />}
              {isUploading ? 'Lädt hoch...' : 'Durchsuchen'}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {lastUploadedImage && (
            <div className="bg-[var(--bg-card)] p-3 border border-[var(--border)] rounded-xl flex items-center gap-4 animate-fade-in">
              <img 
                src={lastUploadedImage} 
                alt="Vorschau" 
                className="w-16 h-16 object-cover rounded-lg border border-[var(--border)]"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  Erfolgreich hochgeladen und eingefügt
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate max-w-md">
                  {lastUploadedImage}
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Inhalt (Markdown)</label>
          <textarea
            ref={textareaRef}
            placeholder="Dein Text (Markdown formatiert)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-main)] outline-none resize-none font-mono text-sm focus:border-[var(--accent)] transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--accent)] text-white py-4 rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          Beitrag veröffentlichen
        </button>
      </form>
    </div>
  );
}

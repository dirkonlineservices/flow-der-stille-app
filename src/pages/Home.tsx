import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wind, Sun, Moon, Coffee, CheckCircle, Circle, BookOpen, Utensils, Send, Smartphone, Headphones, MessageCircle, Share2, Eye, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import NewsletterBanner from '../components/NewsletterBanner';
import WeeklyChallenge from '../components/WeeklyChallenge';
import HomeChatWidget from '../components/HomeChatWidget';
import { FriendInviteWidget } from '../components/FriendInviteWidget';
import SEO from '../components/SEO';
import { AuthLink } from '../components/CookieBanner';
import { getSupabase } from '../lib/supabaseClient';
import { HoerprobenPlayer } from '../components/HoerprobenPlayer';
import { getOfflineHoerproben } from '../lib/offlineProductsService';
import { HomeAdminLanding } from '../components/HomeAdminLanding';

const dailyWisdoms = [
  { title: "Tägliche Weisheit", text: "\"Das Nervensystem kennt keinen Unterschied zwischen einem echten Tiger und einem Gedanken-Tiger. Behandle deine Gedanken mit Freundlichkeit.\"" },
  { title: "Tägliche Weisheit", text: "\"Achtsamkeit bedeutet nicht, dass wir unsere Gefühle unterdrücken. Es bedeutet, dass wir ihnen Raum geben, ohne uns von ihnen beherrschen zu lassen.\"" },
  { title: "Tägliche Weisheit", text: "\"In der Stille liegt eine sanfte Kraft. Nimm dir heute einen Moment, um ihr einfach nur zuzuhören.\"" },
  { title: "Tägliche Weisheit", text: "\"Jeder tiefe Atemzug ist ein kleiner Neuanfang. Du kannst jederzeit von vorne beginnen.\"" },
  { title: "Tägliche Weisheit", text: "\"Es gibt nichts zu tun, außer zu sein. Erlaube dir für einen Moment, einfach nur zu existieren.\"" },
  { title: "Tägliche Weisheit", text: "\"Stress ist oft der Versuch des Körpers, gegen die Realität anzukämpfen. Entspannung beginnt mit dem Akzeptieren des Jetzt.\"" },
  { title: "Tägliche Weisheit", text: "\"Dein Atem ist ein Anker im Hier und Jetzt. Wenn die Gedanken rasen, kehre sanft zu ihm zurück.\"" },
];

export function GooglePlayIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a1.45 1.45 0 01-.61-1.186V3a1.45 1.45 0 01.609-1.186z" fill="#4285F4"/>
      <path d="M17.062 8.73L13.792 12l3.27 3.27 3.659-2.091c.712-.407.712-1.951 0-2.358l-3.659-2.091z" fill="#FBBC04"/>
      <path d="M3.609 1.814l10.183 10.186L17.062 8.73 6.136 2.486c-.752-.43-1.748-.288-2.527.328z" fill="#EA4335"/>
      <path d="M3.609 22.186l2.527.328 10.926-6.244-3.27-3.27L3.609 22.186z" fill="#34A853"/>
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);
  const initialHoerproben = getOfflineHoerproben();
  const [hoerprobenCount, setHoerprobenCount] = useState(initialHoerproben.length);
  const [hoerprobenList, setHoerprobenList] = useState<any[]>(initialHoerproben);
  const isNativeApp = typeof window !== 'undefined' && Boolean((window as any).Capacitor?.isNativePlatform?.() || (window as any).CdvPurchase);

  // Hörproben aus Supabase laden (aktualisieren wenn online)
  useEffect(() => {
    Promise.race([
      getSupabase()
        .from('produkte')
        .select('*')
        .not('hoerprobe_url', 'is', null)
        .neq('hoerprobe_url', ''),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ])
      .then((res: any) => {
        const data = res?.data;
        if (data && data.length > 0) {
          setHoerprobenList(data);
          setHoerprobenCount(data.length);
        }
      })
      .catch(() => {
        // Im Offline-Modus bleiben initialHoerproben aktiv!
      });
  }, []);

  // Calculate daily wisdom index
  const dayOfYear = Math.floor((Date.now() - Number(new Date(new Date().getFullYear(), 0, 0))) / 86400000);
  const todaysWisdom = dailyWisdoms[dayOfYear % dailyWisdoms.length];

  const timeOfDay = new Date().getHours();
  let greetingKey = 'home.greeting.morning';
  if (timeOfDay >= 12 && timeOfDay < 18) greetingKey = 'home.greeting.afternoon';
  if (timeOfDay >= 18) greetingKey = 'home.greeting.evening';

  const getUserName = () => {
    if (!user) return 'Traveler';
    return user.first_name || user.username || 'Traveler';
  };

  // Date formatted key for daily wisdom: daily_wisdom_YYYY-MM-DD
  const dateStr = new Date().toISOString().split('T')[0];
  const completedKey = `daily_wisdom_${dateStr}`;

  // Check if user has already marked this wisdom as completed
  const isCompleted = localCompleted || !!user?.completed_tasks?.includes(completedKey);

  const handleCompleteWisdom = async () => {
    if (!user) {
      setLocalCompleted(true);
      return;
    }
    setLoading(true);

    try {
      const currentCompleted = user.completed_tasks || [];
      if (!currentCompleted.includes(completedKey)) {
        const nextCompleted = [...currentCompleted, completedKey];

        // Save progress securely to Supabase user_metadata
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.updateUser({
          data: {
            completed_tasks: nextCompleted
          }
        });

        if (!error && data?.user) {
          setLocalCompleted(true);
          // Sync AuthContext immediately
          login({
            ...user,
            completed_tasks: nextCompleted
          });
        } else if (error) {
          console.error('Error updating user metadata in database:', error.message);
        }
      }
    } catch (err) {
      console.error('Failed to save wisdom progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const scrollTarget = params.get('scroll') || window.location.hash.replace('#', '');
      if (scrollTarget) {
        const timer = setTimeout(() => {
          const el = document.getElementById(scrollTarget);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('flow_admin_preview') === 'true';
    }
    return false;
  });
  const [showAdminPreview, setShowAdminPreview] = useState(false);

  // Prüfen ob der Nutzer Admin-Rechte besitzt
  useEffect(() => {
    if (!user) {
      if (localStorage.getItem('flow_admin_preview') !== 'true') {
        setIsAdmin(false);
      }
      return;
    }
    const supabase = getSupabase();
    supabase
      .from('profiles')
      .select('rolle')
      .eq('id', user.id)
      .maybeSingle()
      .then(
        ({ data }) => {
          if (data?.rolle?.toLowerCase() === 'admin') {
            setIsAdmin(true);
          }
        },
        () => {}
      );
  }, [user]);

  // Startseite (Öffentliche Landing Page)
  return (
    <>
      <SEO 
        title="Meditation, Achtsamkeit & Vagusnerv-Entspannung – Flow der Stille" 
        description="Finde innere Ruhe bei Flow der Stille. Geführte Meditationen, Selbsthypnosen & Achtsamkeits-Übungen zur Stressreduktion und Vagusnerv-Aktivierung." 
        keywords="Meditation, Achtsamkeit, innere Ruhe, Vagusnerv, Stressreduktion, Selbsthypnose, Atempause, Darm-Hirn-Achse, Jacqueline Schmetzer, Flow der Stille"
      />

      {/* Schnell-Leiste für bereits eingeloggte Nutzer */}
      {user && (
        <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left max-w-4xl lg:max-w-5xl mx-auto">
          <div className="text-xs sm:text-sm text-[var(--text-muted)]">
            Eingeloggt als <strong className="text-[var(--text-main)]">{getUserName()}</strong>. Du betrachtest die öffentliche Startseite.
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>👉 Zu deinem persönlichen Dashboard</span>
          </Link>
        </div>
      )}

      <HomeAdminLanding 
        user={user}
        isAdmin={isAdmin}
        onTogglePreview={() => navigate('/dashboard')}
        todaysWisdom={todaysWisdom}
        isCompleted={isCompleted}
        handleCompleteWisdom={handleCompleteWisdom}
        loading={loading}
        hoerprobenList={hoerprobenList}
      />
    </>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import NotFound from './components/NotFound';
import Home from './pages/Home';

// 🚀 Code-Splitting mit React.lazy: Jede Seite wird erst geladen, wenn sie gebraucht wird!
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Exercises = lazy(() => import('./pages/Exercises'));
const ExerciseDetail = lazy(() => import('./pages/ExerciseDetail'));
const Recipes = lazy(() => import('./pages/Recipes'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'));
const Learn = lazy(() => import('./pages/Learn'));
const Evening = lazy(() => import('./pages/Evening'));
const Morning = lazy(() => import('./pages/Morning'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Settings = lazy(() => import('./pages/Settings'));
const AtemChat = lazy(() => import('./pages/atemchat'));
const AppDownload = lazy(() => import('./pages/AppDownload')); 
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AGB = lazy(() => import('./pages/AGB'));
const Rechtliches = lazy(() => import('./pages/Rechtliches'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
const NewsletterConfirmation = lazy(() => import('./pages/NewsletterConfirmation'));
const OnlineWiderruf = lazy(() => import('./pages/OnlineWiderruf'));
const Premium = lazy(() => import('./pages/Premium'));
const PremiumDashboard = lazy(() => import('./components/PremiumDashboard'));
const Contact = lazy(() => import('./pages/Contact'));                
const Datenschutz = lazy(() => import('./pages/Datenschutz'));
const DataDeletion = lazy(() => import('./pages/DataDeletion'));
const Impressum = lazy(() => import('./pages/Impressum'));
const Rueckgaberichtlinie = lazy(() => import('./pages/Rueckgaberichtlinie'));
const Versand = lazy(() => import('./pages/Versand'));
const Danke = lazy(() => import('./pages/Danke'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPostDetail = lazy(() => import('./pages/BlogPost'));
const BlogEditor = lazy(() => import('./pages/BlogEditor'));
const AdminUnlock = lazy(() => import('./pages/AdminUnlock'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const AudiobookPage = lazy(() => import('./pages/AudiobookPage'));
const AudiobooksHub = lazy(() => import('./pages/AudiobooksHub'));
const MeditationLanding = lazy(() => import('./pages/MeditationLanding'));
const HypnosisLanding = lazy(() => import('./pages/HypnosisLanding'));
const SoundSamplesLanding = lazy(() => import('./pages/SoundSamplesLanding'));
const AudioSessionPage = lazy(() => import('./pages/AudioSessionPage'));

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import CartSidebar from './components/CartSidebar';
import ScrollToTop from './components/ScrollToTop';
import { TransactionErrorOverlay } from './components/TransactionErrorOverlay';
import CookieBanner from './components/CookieBanner';
import DisclaimerModal from './components/DisclaimerModal';
import { BillingService } from './lib/billing';
import { ErrorBoundary } from './components/ErrorBoundary';

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)] animate-spin" />
        <span className="text-xs font-medium text-[var(--text-muted)] animate-pulse">Lade Ruhebereich...</span>
      </div>
    </div>
  );
}

function DisclaimerManager() {
  const location = useLocation();
  const publicRoutes = ['/datenschutz', '/impressum', '/agb', '/rechtliches'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  const [accepted, setAccepted] = React.useState(() => localStorage.getItem('flow_disclaimer_accepted') === 'true');

  if (isPublicRoute || accepted || BillingService.isNative()) {
    return null;
  }

  return <DisclaimerModal isOpen={!accepted} onAccepted={() => setAccepted(true)} />;
}

// NEU: Der "Türsteher" (Prüft, ob der Nutzer eingeloggt ist)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/anmelden" replace />;
  }
  return children;
};

// NEU: Zuweisung zur richtigen Chat-Komponente
const ChatRoute = () => {
  return <Navigate to="/atemchat" replace />;
};

function ReferralCapture() {
  const location = useLocation();
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      sessionStorage.setItem('referral_code', refCode);
    }
  }, [location]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <LanguageProvider>
            <BrowserRouter>
              <ScrollToTop />
              <ReferralCapture />
              <CartSidebar />
              <TransactionErrorOverlay />
              <CookieBanner />
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    {/* Standard Layout mit deutscher & englischer URL-Struktur */}
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="start" element={<Home />} />
                      
                      {/* Dashboard */}
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="mein-bereich" element={<Dashboard />} />

                      {/* Übungen (Deutsch primär, Englisch als Alias) */}
                      <Route path="uebungen" element={<Exercises />} />
                      <Route path="uebungen/:id" element={<ExerciseDetail />} />
                      <Route path="exercises" element={<Exercises />} />
                      <Route path="exercises/:id" element={<ExerciseDetail />} />
                      <Route path="atemuebungen" element={<Exercises />} />

                      {/* Rezepte */}
                      <Route path="rezepte" element={<Recipes />} />
                      <Route path="rezepte/:id" element={<RecipeDetail />} />
                      <Route path="recipes" element={<Recipes />} />
                      <Route path="recipe/:id" element={<RecipeDetail />} />

                      {/* Wissen / Lernen */}
                      <Route path="wissen" element={<Learn />} />
                      <Route path="learn" element={<Learn />} />

                      {/* Tagesrituale */}
                      <Route path="morgen" element={<Morning />} />
                      <Route path="morning" element={<Morning />} />
                      <Route path="morgenritual" element={<Morning />} />
                      <Route path="abend" element={<Evening />} />
                      <Route path="evening" element={<Evening />} />
                      <Route path="abendritual" element={<Evening />} />

                      {/* Einstellungen */}
                      <Route path="einstellungen" element={<Settings />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="profil" element={<Settings />} />

                      {/* Auth (Deutsch primär, Englisch als Alias) */}
                      <Route path="anmelden" element={<Login />} />
                      <Route path="login" element={<Login />} />
                      <Route path="einloggen" element={<Login />} />
                      <Route path="registrieren" element={<Register />} />
                      <Route path="register" element={<Register />} />
                      <Route path="passwort-vergessen" element={<ForgotPassword />} />
                      <Route path="forgot-password" element={<ForgotPassword />} />
                      <Route path="passwort-zuruecksetzen" element={<ResetPassword />} />
                      <Route path="reset-password" element={<ResetPassword />} />
                      <Route path="update-password" element={<UpdatePassword />} />

                      {/* FAQ & Fragen */}
                      <Route path="fragen" element={<FAQ />} />
                      <Route path="faq" element={<FAQ />} />
                      <Route path="haeufige-fragen" element={<FAQ />} />

                      {/* App & Download */}
                      <Route path="app" element={<AppDownload />} />
                      <Route path="android-app" element={<AppDownload />} />
                      <Route path="playstore" element={<AppDownload />} />

                      {/* Kontakt & Rechtliches */}
                      <Route path="kontakt" element={<Contact />} />
                      <Route path="contact" element={<Contact />} />
                      <Route path="datenschutz" element={<Datenschutz />} />
                      <Route path="konto-loeschen" element={<DataDeletion />} />
                      <Route path="impressum" element={<Impressum />} />
                      <Route path="agb" element={<AGB />} />
                      <Route path="rechtliches" element={<Rechtliches />} />
                      <Route path="rueckgaberichtlinie" element={<Rueckgaberichtlinie />} />
                      <Route path="versand" element={<Versand />} />
                      <Route path="lieferung" element={<Versand />} />
                      <Route path="versandinformationen" element={<Versand />} />
                      <Route path="online-widerruf" element={<OnlineWiderruf />} />
                      <Route path="widerruf" element={<OnlineWiderruf />} />
                      <Route path="danke" element={<Danke />} />

                      {/* Shop & Hörangebote */}
                      <Route path="premium" element={<Premium />} />
                      <Route path="shop" element={<Premium />} />
                      <Route path="premium-dashboard" element={<PremiumDashboard />} />
                      <Route path="hoerbuch" element={<AudiobookPage />} />
                      <Route path="hoerbuch/:id" element={<AudiobookPage />} />
                      <Route path="hoerbuecher" element={<AudiobooksHub />} />
                      <Route path="audiobooks" element={<AudiobooksHub />} />
                      <Route path="meditation" element={<MeditationLanding />} />
                      <Route path="meditationen" element={<MeditationLanding />} />
                      <Route path="gefuehrte-meditation" element={<MeditationLanding />} />
                      <Route path="selbsthypnose" element={<HypnosisLanding />} />
                      <Route path="hypnose" element={<HypnosisLanding />} />
                      <Route path="audio/:id" element={<AudioSessionPage />} />
                      <Route path="selbsthypnose/:id" element={<AudioSessionPage />} />
                      <Route path="meditation/:id" element={<AudioSessionPage />} />
                      <Route path="klangproben" element={<SoundSamplesLanding />} />
                      <Route path="hoerproben" element={<SoundSamplesLanding />} />

                      {/* Newsletter */}
                      <Route path="newsletter-confirmation" element={<NewsletterConfirmation />} />
                      <Route path="newsletter-bestaetigung" element={<NewsletterConfirmation />} />
                      <Route path="newsletter-bestaetigt" element={<NewsletterConfirmation />} />
                      <Route path="confirm-newsletter" element={<NewsletterConfirmation />} />

                      {/* Blog */}
                      <Route path="blog" element={<Blog />} />
                      <Route path="blog/neu" element={<BlogEditor />} />
                      <Route path="blog/new" element={<BlogEditor />} />
                      <Route path="blog/schreiben" element={<BlogEditor />} />
                      <Route path="blog/:slug" element={<BlogPostDetail />} />

                      {/* Admin */}
                      <Route path="admin" element={<AdminUnlock />} />
                      <Route path="admin/freischalten" element={<AdminUnlock />} />
                      <Route path="admin-freischalten" element={<AdminUnlock />} />

                      {/* Chat */}
                      <Route path="chat" element={<ChatRoute />} />
                    </Route>

                    {/* Spezielle Routen außerhalb des Layouts */}
                    <Route path="/atemchat" element={<AtemChat />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </LanguageProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import PremiumDashboard from './components/PremiumDashboard';
import NotFound from './components/NotFound';
import Home from './pages/Home';
import Exercises from './pages/Exercises';
import ExerciseDetail from './pages/ExerciseDetail';
import Recipes from './pages/Recipes';
import Learn from './pages/Learn';
import Evening from './pages/Evening';
import Morning from './pages/Morning';
import FAQ from './pages/FAQ';
import Settings from './pages/Settings';
import AtemChat from './pages/atemchat'; 

import Login from './pages/Login';
import Register from './pages/Register';
import AGB from './pages/AGB';
import Rechtliches from './pages/Rechtliches';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import NewsletterConfirmation from './pages/NewsletterConfirmation';
import OnlineWiderruf from './pages/OnlineWiderruf';
import Premium from './pages/Premium';
import Contact from './pages/Contact';                
import Datenschutz from './pages/Datenschutz';
import DataDeletion from './pages/DataDeletion';
import Impressum from './pages/Impressum';
import Rueckgaberichtlinie from './pages/Rueckgaberichtlinie';
import Danke from './pages/Danke';
import RecipeDetail from './pages/RecipeDetail';
import Blog from './pages/Blog';
import BlogPostDetail from './pages/BlogPost';
import BlogEditor from './pages/BlogEditor';
import AuthCallback from './pages/AuthCallback';
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
    // Nicht eingeloggt? Ab zum Login!
    return <Navigate to="/login" replace />;
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
              <Routes>
                                {/* Dein normales Haus mit dem Standard-Menü (Layout) */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="exercises" element={<Exercises />} />
                  <Route path="exercises/:id" element={<ExerciseDetail />} />
                  <Route path="recipes" element={<Recipes />} />
                  <Route path="learn" element={<Learn />} />
                  <Route path="evening" element={<Evening />} />
                  <Route path="morning" element={<Morning />} />
                  <Route path="morgenritual" element={<Morning />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="chat" element={<ChatRoute />} />
                  <Route path="login" element={<Login />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="update-password" element={<UpdatePassword />} />
                  <Route path="newsletter-confirmation" element={<NewsletterConfirmation />} />
                  <Route path="newsletter-bestaetigung" element={<NewsletterConfirmation />} />
                  <Route path="newsletter-bestaetigt" element={<NewsletterConfirmation />} />
                  <Route path="confirm-newsletter" element={<NewsletterConfirmation />} />
                  <Route path="online-widerruf" element={<OnlineWiderruf />} />
                  <Route path="register" element={<Register />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="haeufige-fragen" element={<FAQ />} />
                  <Route path="fragen" element={<FAQ />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="datenschutz" element={<Datenschutz />} />
                  <Route path="konto-loeschen" element={<DataDeletion />} />
                  <Route path="impressum" element={<Impressum />} />
                  <Route path="agb" element={<AGB />} />
                  <Route path="rechtliches" element={<Rechtliches />} />
                  <Route path="premium" element={<Premium />} />
                  <Route path="premium-dashboard" element={<PremiumDashboard />} />
                  <Route path="rueckgaberichtlinie" element={<Rueckgaberichtlinie />} />
                  <Route path="danke" element={<Danke />} />
                  <Route path="recipe/:id" element={<RecipeDetail />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/new" element={<BlogEditor />} />
                  <Route path="blog/schreiben" element={<BlogEditor />} />
                  <Route path="blog/:slug" element={<BlogPostDetail />} />
                </Route>

                {/* NEU: Dein vollflächiger Premium-Raum (Ohne Standard-Menü) */}
                <Route 
                  path="/atemchat" 
                  element={<AtemChat />} 
                />
                <Route 
                  path="/auth/callback" 
                  element={<AuthCallback />} 
                />

                <Route path="*" element={<NotFound />} />

              </Routes>
            </BrowserRouter>
          </LanguageProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

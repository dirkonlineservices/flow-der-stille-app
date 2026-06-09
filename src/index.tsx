/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Exercises from './pages/Exercises';
import ExerciseDetail from './pages/ExerciseDetail';
import Recipes from './pages/Recipes';
import Learn from './pages/Learn';
import Evening from './pages/Evening';
import Settings from './pages/Settings';
import AtemChat from './pages/atemchat'; 
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import Datenschutz from './pages/Datenschutz';
import Impressum from './pages/Impressum';
import Danke from './pages/Danke';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import CartSidebar from './components/CartSidebar';

// NEU: Der "Türsteher" (Prüft, ob der Nutzer eingeloggt ist)
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <LanguageProvider>
            <BrowserRouter>
              <CartSidebar />
              <Routes>
                
                {/* Dein normales Haus mit dem Standard-Menü (Layout) */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="exercises" element={<Exercises />} />
                  <Route path="exercises/:id" element={<ExerciseDetail />} />
                  <Route path="recipes" element={<Recipes />} />
                  <Route path="learn" element={<Learn />} />
                  <Route path="evening" element={<Evening />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="chat" element={<ChatRoute />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="datenschutz" element={<Datenschutz />} />
                  <Route path="impressum" element={<Impressum />} />
                  <Route path="danke" element={<Danke />} />
                </Route>

                {/* NEU: Dein vollflächiger Premium-Raum (Ohne Standard-Menü) */}
                <Route 
                  path="/atemchat" 
                  element={<AtemChat />} 
                />

              </Routes>
            </BrowserRouter>
          </LanguageProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

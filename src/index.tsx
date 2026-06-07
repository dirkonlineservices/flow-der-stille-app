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
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import AtemChat from './pages/atemchat'; // NEU: Dein neuer Raum importiert
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import Datenschutz from './pages/Datenschutz';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext'; // NEU: useAuth hinzugefügt

// NEU: Der "Türsteher" (Prüft, ob der Nutzer eingeloggt ist)
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) {
    // Nicht eingeloggt? Ab zum Login!
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            
            {/* Dein normales Haus mit dem Standard-Menü (Layout) */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="exercises" element={<Exercises />} />
              <Route path="exercises/:id" element={<ExerciseDetail />} />
              <Route path="recipes" element={<Recipes />} />
              <Route path="learn" element={<Learn />} />
              <Route path="settings" element={<Settings />} />
              <Route path="chat" element={<Chat />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="contact" element={<Contact />} />
              <Route path="datenschutz" element={<Datenschutz />} />
            </Route>

            {/* NEU: Dein geschützter, vollflächiger Premium-Raum (Ohne Standard-Menü) */}
            <Route 
              path="/atemchat" 
              element={
                <ProtectedRoute>
                  <AtemChat />
                </ProtectedRoute>
              } 
            />

          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
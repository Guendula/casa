import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';

// Components (to be created)
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import PropertyForm from './pages/PropertyForm';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';
import Favorites from './pages/Favorites';
import MyProperties from './pages/MyProperties';
import ErrorBoundary from './components/ErrorBoundary';
import HelpCenter from './pages/HelpCenter';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Security from './pages/Security';
import ReportAd from './pages/ReportAd';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Initial check and creation if needed
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'user',
            createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newUser);
        }

        // Listen for real-time updates to user profile (including role changes)
        unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUser(doc.data() as UserProfile);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        if (unsubscribeProfile) unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
          <Header user={user} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/imovel/:id" element={<PropertyDetails user={user} />} />
              <Route path="/publicar" element={<PropertyForm user={user} />} />
              <Route path="/editar/:id" element={<PropertyForm user={user} isEditing />} />
              <Route path="/perfil" element={<Profile user={user} />} />
              <Route path="/pesquisa" element={<SearchResults />} />
              <Route path="/favoritos" element={<Favorites user={user} />} />
              <Route path="/meus-imoveis" element={<MyProperties user={user} />} />
              <Route path="/ajuda" element={<HelpCenter />} />
              <Route path="/termos" element={<TermsOfService />} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/seguranca" element={<Security />} />
              <Route path="/denunciar" element={<ReportAd />} />
              <Route path="/admin" element={<AdminDashboard user={user} />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-center" richColors />
        </div>
      </ErrorBoundary>
    </Router>
  );
}

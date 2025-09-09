'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '../services/useAuth';
import '../styles/global.css';
import { Header, Footer } from '../components/composition';
import { AuthDialog, ContactDialog, EditProfileDialog } from '../components/dialogs';
import { updateUser } from '../services/firebase/db';

export function AppContent({ Component, pageProps }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { currentUser, saveUser, checkUser, loading, handleSaveLoginChange, logout } = useAuth();

  useEffect(() => {
    checkUser();
  }, []);

  if (loading) return <div></div>; // Prevents rendering until auth state is resolved

  const handleUpdate = ({ firstName, lastName, username }) => {
    const newUser = { ...currentUser, firstName, lastName, username };
    saveUser(newUser);
    updateUser(newUser);
  };

  return (
    <>
      <AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} handleSaveLoginChange={handleSaveLoginChange} setCurrentUser={saveUser} />
      <ContactDialog isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <EditProfileDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} currentUser={currentUser} resetCurrentUser={() => saveUser(null)} onUpdateProfile={handleUpdate} />

      <Header currentUser={currentUser} openAuth={() => setIsAuthOpen(true)} openEdit={() => setIsEditOpen(true)} signOut={logout} />

      <Component {...pageProps} />

      <Footer openContact={() => setIsContactOpen(true)} openEdit={() => setIsEditOpen(true)} logout={logout} />
    </>
  );
}
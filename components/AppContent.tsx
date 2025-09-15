'use client'

import { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../services/useAuth';
import { Header, Footer } from './composition';
import { AuthDialog, ContactDialog, EditProfileDialog } from './dialogs';
import { updateUser } from '../services/firebase/db';
import { User } from '../types';

interface AppContentProps {
  Component: React.ComponentType<any>;
  pageProps: any;
}

export function AppContent({ Component, pageProps }: AppContentProps) {
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  const { currentUser, saveUser, checkUser, loading, handleSaveLoginChange, logout } = useAuth();

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (loading) return <div />; // Prevent rendering until auth state is resolved

  const handleUpdate = (update: { firstName?: string; lastName?: string; username?: string }) => {
    if (!currentUser) return;
    const newUser: User = { ...currentUser, ...update };
    saveUser(newUser);
    updateUser({user:newUser});
  };

  return (
    <>
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        handleSaveLoginChange={handleSaveLoginChange}
        setCurrentUser={saveUser}
      />
      <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      {currentUser&&<EditProfileDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentUser={currentUser}
        resetCurrentUser={() => saveUser(null)}
        onUpdateProfile={handleUpdate}
      />}

      <Header
        currentUser={currentUser}
        openAuth={() => setIsAuthOpen(true)}
        openEdit={() => setIsEditOpen(true)}
        signOut={logout}
      />

      <Component {...pageProps} />

      <Footer
        openContact={() => setIsContactOpen(true)}
        openEdit={() => setIsEditOpen(true)}
        logout={logout}
      />
    </>
  );
}

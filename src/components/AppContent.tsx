'use client'

import { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../../services/useAuth';
import { Header, Footer } from './composition';
import { AuthDialog, EditProfileDialog } from './dialogs';
import { updateUser } from '../../services/firebase/db';
import { User } from '../../types';

interface AppContentProps {
  children: ReactNode;
}

export function AppContent({ children }: AppContentProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { currentUser, saveUser, checkUser, loading, handleSaveLoginChange, logout } = useAuth();

  useEffect(() => {
    checkUser();
  }, []);

  if (loading) return <div />; // Prevent rendering until auth state is resolved

  const handleUpdate = (update: { firstName?: string; lastName?: string; username?: string }) => {
    if (!currentUser) return;
    const newUser: User = { ...currentUser, ...update };
    saveUser(newUser);
    updateUser({ user: newUser });
  };

  return (
    <>
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        handleSaveLoginChange={handleSaveLoginChange}
        setCurrentUser={saveUser}
      />
      {currentUser && (
        <EditProfileDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          currentUser={currentUser}
          resetCurrentUser={() => saveUser(null)}
          onUpdateProfile={handleUpdate}
        />
      )}

      <Header
        currentUser={currentUser}
        openAuth={() => setIsAuthOpen(true)}
        openEdit={() => setIsEditOpen(true)}
        signOut={logout}
      />

      {children}

      <Footer
        openEdit={() => setIsEditOpen(true)}
        logout={logout}
      />
    </>
  );
}

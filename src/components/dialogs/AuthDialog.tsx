'use client';
import React, { useState } from "react";
import { LoginDialog } from ".";
import { onApiLogin } from '../../../services/firebase/auth';
import { User } from "../../../types";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  handleSaveLoginChange: (value: any) => void; // adjust type as needed
  setCurrentUser: (user: User) => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  handleSaveLoginChange,
  setCurrentUser,
}) => {
  const [error, setError] = useState<string>("");

  const closeDialog = () => {
    setError("");
    onClose();
  };

  // Handle API login
  const handleLoginApi = async ({ id, firstName, lastName }: {id:string, firstName:string, lastName:string}) => {
    onApiLogin({
      id,
      firstName,
      lastName,
      onSuccess: (user: User) => {
        setCurrentUser(user);
        closeDialog();
      },
      onError: () => {
        setError("Wrong username/email or password.");
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div>
      
        <LoginDialog
          onClose={closeDialog}
          handleSaveLoginChange={handleSaveLoginChange}
          onApiLogin={handleLoginApi}
          topError={error}
        />
      
    </div>
  );
};
